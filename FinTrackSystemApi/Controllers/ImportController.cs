using FinTrackSystemApi.Data;
using FinTrackSystemApi.Dtos;
using FinTrackSystemApi.Models;
using FinTrackSystemApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FinTrackSystemApi.Controllers;

[ApiController]
[Route("api/import")]
[Authorize(Roles = Roles.AdminFinance)]
public class ImportController : ControllerBase
{
    private static readonly string[] ExpectedHeaders =
    {
        "CustomerName",
        "AccountNumber",
        "TransactionType",
        "Amount",
        "TransactionDate",
        "Description"
    };

    private readonly ApplicationDbContext _db;
    private readonly IAuditService _auditService;

    public ImportController(ApplicationDbContext db, IAuditService auditService)
    {
        _db = db;
        _auditService = auditService;
    }

    [HttpPost("transactions")]
    [RequestSizeLimit(5_000_000)]
    public async Task<ActionResult<ApiResponse<ImportTransactionResult>>> ImportTransactions([FromForm] IFormFile? file)
    {
        if (file is null || file.Length == 0)
        {
            await _auditService.WriteAsync("Import CSV", "ETL", "Import CSV failed because file was empty.");
            return BadRequest(ApiResponse<ImportTransactionResult>.Fail("CSV file is required."));
        }

        await using var stream = file.OpenReadStream();
        using var reader = new StreamReader(stream);
        var content = await reader.ReadToEndAsync();
        var rows = ParseCsv(content);

        if (rows.Count < 2)
        {
            await _auditService.WriteAsync("Import CSV", "ETL", "Import CSV failed because data rows were empty.");
            return BadRequest(ApiResponse<ImportTransactionResult>.Fail("CSV file does not contain transaction rows."));
        }

        var headers = rows[0].Select(header => header.Trim().TrimStart('\uFEFF')).ToArray();
        if (!ExpectedHeaders.SequenceEqual(headers))
        {
            await _auditService.WriteAsync("Import CSV", "ETL", "Import CSV failed because header format was invalid.");
            return BadRequest(ApiResponse<ImportTransactionResult>.Fail("CSV header does not match the template."));
        }

        var customers = await _db.Customers.AsNoTracking().ToListAsync();
        var customerByAccount = customers.ToDictionary(customer => customer.AccountNumber, customer => customer);
        var existingCodes = await _db.Transactions.AsNoTracking().Select(transaction => transaction.TransactionCode).ToListAsync();
        var imported = new List<FinancialTransaction>();
        var errors = new List<ImportError>();

        foreach (var item in rows.Skip(1).Select((row, index) => new { Row = row, RowNumber = index + 2 }))
        {
            if (item.Row.Count < ExpectedHeaders.Length)
            {
                errors.Add(new ImportError(item.RowNumber, "Column count is invalid."));
                continue;
            }

            var customerName = item.Row[0].Trim();
            var accountNumber = item.Row[1].Trim();
            var transactionTypeValue = item.Row[2].Trim();
            var amountValue = item.Row[3].Trim();
            var transactionDateValue = item.Row[4].Trim();
            var description = item.Row[5].Trim();

            if (string.IsNullOrWhiteSpace(customerName) ||
                string.IsNullOrWhiteSpace(accountNumber) ||
                string.IsNullOrWhiteSpace(transactionTypeValue) ||
                string.IsNullOrWhiteSpace(amountValue) ||
                string.IsNullOrWhiteSpace(transactionDateValue) ||
                string.IsNullOrWhiteSpace(description))
            {
                errors.Add(new ImportError(item.RowNumber, "All columns are required."));
                continue;
            }

            if (!customerByAccount.TryGetValue(accountNumber, out var customer))
            {
                errors.Add(new ImportError(item.RowNumber, $"Customer account {accountNumber} was not found."));
                continue;
            }

            if (!string.Equals(customer.FullName, customerName, StringComparison.OrdinalIgnoreCase))
            {
                errors.Add(new ImportError(item.RowNumber, "Customer name does not match account number."));
                continue;
            }

            if (!Enum.TryParse<TransactionType>(transactionTypeValue, true, out var transactionType))
            {
                errors.Add(new ImportError(item.RowNumber, "Transaction type is not valid."));
                continue;
            }

            if (!decimal.TryParse(amountValue, out var amount) || amount <= 0)
            {
                errors.Add(new ImportError(item.RowNumber, "Amount must be greater than 0."));
                continue;
            }

            if (!DateTime.TryParse(transactionDateValue, out var transactionDate))
            {
                errors.Add(new ImportError(item.RowNumber, "Transaction date is not valid."));
                continue;
            }

            var transactionCode = GenerateTransactionCode(existingCodes.Concat(imported.Select(transaction => transaction.TransactionCode)));
            imported.Add(new FinancialTransaction
            {
                TransactionCode = transactionCode,
                CustomerId = customer.Id,
                CustomerName = customer.FullName,
                TransactionType = transactionType,
                Amount = amount,
                Status = TransactionStatus.Pending,
                TransactionDate = transactionDate.Date,
                Description = description,
                CreatedBy = User.Identity?.Name ?? "system",
                CreatedAt = DateTime.UtcNow
            });
        }

        if (imported.Count > 0)
        {
            _db.Transactions.AddRange(imported);
            await _db.SaveChangesAsync();
        }

        var result = new ImportTransactionResult(rows.Count - 1, imported.Count, errors.Count, errors);
        await _auditService.WriteAsync("Import CSV", "ETL", $"Imported CSV transactions: {imported.Count} success, {errors.Count} failed.");

        return Ok(ApiResponse<ImportTransactionResult>.Ok(result, "CSV import processed."));
    }

    private static string GenerateTransactionCode(IEnumerable<string> existingCodes)
    {
        var prefix = $"TRX-{DateTime.UtcNow:yyyy}-";
        var max = existingCodes
            .Where(code => code.StartsWith(prefix))
            .Select(code => int.TryParse(code.Replace(prefix, string.Empty), out var number) ? number : 0)
            .DefaultIfEmpty(0)
            .Max();

        return $"{prefix}{max + 1:0000}";
    }

    private static List<List<string>> ParseCsv(string text)
    {
        var rows = new List<List<string>>();
        var row = new List<string>();
        var cell = string.Empty;
        var inQuotes = false;

        for (var index = 0; index < text.Length; index++)
        {
            var current = text[index];
            var next = index + 1 < text.Length ? text[index + 1] : '\0';

            if (current == '"' && inQuotes && next == '"')
            {
                cell += '"';
                index++;
                continue;
            }

            if (current == '"')
            {
                inQuotes = !inQuotes;
                continue;
            }

            if (current == ',' && !inQuotes)
            {
                row.Add(cell);
                cell = string.Empty;
                continue;
            }

            if ((current == '\n' || current == '\r') && !inQuotes)
            {
                if (current == '\r' && next == '\n')
                {
                    index++;
                }

                row.Add(cell);
                if (row.Any(value => !string.IsNullOrWhiteSpace(value)))
                {
                    rows.Add(row);
                }

                row = new List<string>();
                cell = string.Empty;
                continue;
            }

            cell += current;
        }

        row.Add(cell);
        if (row.Any(value => !string.IsNullOrWhiteSpace(value)))
        {
            rows.Add(row);
        }

        return rows;
    }
}
