using FinTrackSystemApi.Data;
using FinTrackSystemApi.Dtos;
using FinTrackSystemApi.Models;
using FinTrackSystemApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FinTrackSystemApi.Controllers;

[ApiController]
[Route("api/transactions")]
[Authorize(Roles = Roles.TransactionUsers)]
public class TransactionsController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    private readonly IAuditService _auditService;

    public TransactionsController(ApplicationDbContext db, IAuditService auditService)
    {
        _db = db;
        _auditService = auditService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<TransactionResponse>>>> GetTransactions(
        [FromQuery] string? search,
        [FromQuery] string? status,
        [FromQuery] string? type)
    {
        var query = _db.Transactions.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var keyword = search.Trim();
            query = query.Where(transaction =>
                transaction.TransactionCode.Contains(keyword) ||
                transaction.CustomerName.Contains(keyword) ||
                transaction.Description.Contains(keyword) ||
                transaction.CreatedBy.Contains(keyword));
        }

        if (!string.IsNullOrWhiteSpace(status))
        {
            if (!TryParseTransactionStatus(status, out var parsedStatus))
            {
                return BadRequest(ApiResponse<IReadOnlyList<TransactionResponse>>.Fail("Transaction status is not valid."));
            }

            query = query.Where(transaction => transaction.Status == parsedStatus);
        }

        if (!string.IsNullOrWhiteSpace(type))
        {
            if (!TryParseTransactionType(type, out var parsedType))
            {
                return BadRequest(ApiResponse<IReadOnlyList<TransactionResponse>>.Fail("Transaction type is not valid."));
            }

            query = query.Where(transaction => transaction.TransactionType == parsedType);
        }

        var transactions = await query
            .OrderByDescending(transaction => transaction.CreatedAt)
            .ToListAsync();

        return Ok(ApiResponse<IReadOnlyList<TransactionResponse>>.Ok(transactions.Select(transaction => transaction.ToResponse()).ToList()));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ApiResponse<TransactionResponse>>> GetTransaction(Guid id)
    {
        var transaction = await _db.Transactions.AsNoTracking().FirstOrDefaultAsync(item => item.Id == id);
        if (transaction is null)
        {
            return NotFound(ApiResponse<TransactionResponse>.Fail("Transaction not found."));
        }

        return Ok(ApiResponse<TransactionResponse>.Ok(transaction.ToResponse()));
    }

    [HttpGet("{id:guid}/approvals")]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<ApprovalResponse>>>> GetApprovalHistory(Guid id)
    {
        var exists = await _db.Transactions.AnyAsync(transaction => transaction.Id == id);
        if (!exists)
        {
            return NotFound(ApiResponse<IReadOnlyList<ApprovalResponse>>.Fail("Transaction not found."));
        }

        var approvals = await _db.Approvals
            .AsNoTracking()
            .Where(approval => approval.TransactionId == id)
            .OrderByDescending(approval => approval.CreatedAt)
            .ToListAsync();

        return Ok(ApiResponse<IReadOnlyList<ApprovalResponse>>.Ok(approvals.Select(approval => approval.ToResponse()).ToList()));
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<TransactionResponse>>> CreateTransaction(TransactionCreateRequest request)
    {
        if (!TryParseTransactionType(request.TransactionType, out var type))
        {
            return BadRequest(ApiResponse<TransactionResponse>.Fail("Transaction type is not valid."));
        }

        if (!TryParseTransactionStatus(request.Status, out var status))
        {
            return BadRequest(ApiResponse<TransactionResponse>.Fail("Transaction status is not valid."));
        }

        if (request.Amount <= 0)
        {
            return BadRequest(ApiResponse<TransactionResponse>.Fail("Amount must be greater than 0."));
        }

        var customer = await _db.Customers.FirstOrDefaultAsync(item => item.Id == request.CustomerId);
        if (customer is null)
        {
            return BadRequest(ApiResponse<TransactionResponse>.Fail("Customer not found."));
        }

        var transactionCode = string.IsNullOrWhiteSpace(request.TransactionCode)
            ? await GenerateTransactionCodeAsync()
            : request.TransactionCode.Trim();

        var duplicate = await _db.Transactions.AnyAsync(transaction => transaction.TransactionCode == transactionCode);
        if (duplicate)
        {
            return Conflict(ApiResponse<TransactionResponse>.Fail("Transaction code already exists."));
        }

        var approved = status is TransactionStatus.Success or TransactionStatus.Rejected;
        var transaction = new FinancialTransaction
        {
            TransactionCode = transactionCode,
            CustomerId = customer.Id,
            CustomerName = customer.FullName,
            TransactionType = type,
            Amount = request.Amount,
            Status = status,
            TransactionDate = request.TransactionDate.Date,
            Description = request.Description.Trim(),
            CreatedBy = CurrentUsername(),
            ApprovedBy = approved ? CurrentUsername() : null,
            ApprovedAt = approved ? DateTime.UtcNow : null,
            CreatedAt = DateTime.UtcNow
        };

        _db.Transactions.Add(transaction);
        await _db.SaveChangesAsync();
        await _auditService.WriteAsync("Tambah transaksi", "Transaction", $"Created transaction {transaction.TransactionCode}.");

        return CreatedAtAction(nameof(GetTransaction), new { id = transaction.Id }, ApiResponse<TransactionResponse>.Ok(transaction.ToResponse(), "Transaction created successfully."));
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ApiResponse<TransactionResponse>>> UpdateTransaction(Guid id, TransactionUpdateRequest request)
    {
        if (!TryParseTransactionType(request.TransactionType, out var type))
        {
            return BadRequest(ApiResponse<TransactionResponse>.Fail("Transaction type is not valid."));
        }

        if (!TryParseTransactionStatus(request.Status, out var status))
        {
            return BadRequest(ApiResponse<TransactionResponse>.Fail("Transaction status is not valid."));
        }

        if (request.Amount <= 0)
        {
            return BadRequest(ApiResponse<TransactionResponse>.Fail("Amount must be greater than 0."));
        }

        var transaction = await _db.Transactions.FirstOrDefaultAsync(item => item.Id == id);
        if (transaction is null)
        {
            return NotFound(ApiResponse<TransactionResponse>.Fail("Transaction not found."));
        }

        var customer = await _db.Customers.FirstOrDefaultAsync(item => item.Id == request.CustomerId);
        if (customer is null)
        {
            return BadRequest(ApiResponse<TransactionResponse>.Fail("Customer not found."));
        }

        var transactionCode = request.TransactionCode.Trim();
        var duplicate = await _db.Transactions.AnyAsync(item => item.Id != id && item.TransactionCode == transactionCode);
        if (duplicate)
        {
            return Conflict(ApiResponse<TransactionResponse>.Fail("Transaction code already exists."));
        }

        var previousStatus = transaction.Status;
        transaction.TransactionCode = transactionCode;
        transaction.CustomerId = customer.Id;
        transaction.CustomerName = customer.FullName;
        transaction.TransactionType = type;
        transaction.Amount = request.Amount;
        transaction.Status = status;
        transaction.TransactionDate = request.TransactionDate.Date;
        transaction.Description = request.Description.Trim();

        if (previousStatus != status && status is TransactionStatus.Success or TransactionStatus.Rejected)
        {
            transaction.ApprovedBy = CurrentUsername();
            transaction.ApprovedAt = DateTime.UtcNow;
        }

        if (status is TransactionStatus.Pending or TransactionStatus.Failed)
        {
            transaction.ApprovedBy = null;
            transaction.ApprovedAt = null;
        }

        await _db.SaveChangesAsync();
        await _auditService.WriteAsync("Edit transaksi", "Transaction", $"Updated transaction {transaction.TransactionCode}.");

        return Ok(ApiResponse<TransactionResponse>.Ok(transaction.ToResponse(), "Transaction updated successfully."));
    }

    [HttpDelete("{id:guid}")]
    public async Task<ActionResult<ApiResponse<object>>> DeleteTransaction(Guid id)
    {
        var transaction = await _db.Transactions.FirstOrDefaultAsync(item => item.Id == id);
        if (transaction is null)
        {
            return NotFound(ApiResponse<object>.Fail("Transaction not found."));
        }

        _db.Transactions.Remove(transaction);
        await _db.SaveChangesAsync();
        await _auditService.WriteAsync("Hapus transaksi", "Transaction", $"Deleted transaction {transaction.TransactionCode}.");

        return Ok(ApiResponse<object>.Ok(new { transaction.Id }, "Transaction deleted successfully."));
    }

    [Authorize(Roles = Roles.AdminManager)]
    [HttpPut("{id:guid}/approve")]
    public async Task<ActionResult<ApiResponse<TransactionResponse>>> ApproveTransaction(Guid id, ApprovalRequest request)
    {
        return await ProcessApproval(id, "Approve", TransactionStatus.Success, request.Note);
    }

    [Authorize(Roles = Roles.AdminManager)]
    [HttpPut("{id:guid}/reject")]
    public async Task<ActionResult<ApiResponse<TransactionResponse>>> RejectTransaction(Guid id, ApprovalRequest request)
    {
        return await ProcessApproval(id, "Reject", TransactionStatus.Rejected, request.Note);
    }

    private async Task<ActionResult<ApiResponse<TransactionResponse>>> ProcessApproval(Guid id, string action, TransactionStatus nextStatus, string note)
    {
        var transaction = await _db.Transactions.FirstOrDefaultAsync(item => item.Id == id);
        if (transaction is null)
        {
            return NotFound(ApiResponse<TransactionResponse>.Fail("Transaction not found."));
        }

        if (transaction.Status != TransactionStatus.Pending)
        {
            return BadRequest(ApiResponse<TransactionResponse>.Fail("Only pending transactions can be approved or rejected."));
        }

        transaction.Status = nextStatus;
        transaction.ApprovedBy = CurrentUsername();
        transaction.ApprovedAt = DateTime.UtcNow;

        _db.Approvals.Add(new Approval
        {
            TransactionId = transaction.Id,
            Action = action,
            Note = string.IsNullOrWhiteSpace(note) ? $"{action} by {CurrentUsername()}." : note.Trim(),
            ApprovedBy = CurrentUsername(),
            CreatedAt = DateTime.UtcNow
        });

        await _db.SaveChangesAsync();
        await _auditService.WriteAsync(
            action == "Approve" ? "Approve transaksi" : "Reject transaksi",
            "Approval",
            $"{action} transaction {transaction.TransactionCode}.");

        var message = action == "Approve"
            ? "Transaction approved successfully."
            : "Transaction rejected successfully.";

        return Ok(ApiResponse<TransactionResponse>.Ok(transaction.ToResponse(), message));
    }

    private async Task<string> GenerateTransactionCodeAsync()
    {
        var prefix = $"TRX-{DateTime.UtcNow:yyyy}-";
        var codes = await _db.Transactions
            .AsNoTracking()
            .Where(transaction => transaction.TransactionCode.StartsWith(prefix))
            .Select(transaction => transaction.TransactionCode)
            .ToListAsync();

        var max = codes
            .Select(code => int.TryParse(code.Replace(prefix, string.Empty), out var number) ? number : 0)
            .DefaultIfEmpty(0)
            .Max();

        return $"{prefix}{max + 1:0000}";
    }

    private string CurrentUsername()
    {
        return User.Identity?.Name ?? "system";
    }

    private static bool TryParseTransactionType(string value, out TransactionType type)
    {
        return Enum.TryParse(value, true, out type);
    }

    private static bool TryParseTransactionStatus(string value, out TransactionStatus status)
    {
        return Enum.TryParse(value, true, out status);
    }
}
