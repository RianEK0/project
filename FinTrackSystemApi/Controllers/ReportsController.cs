using FinTrackSystemApi.Data;
using FinTrackSystemApi.Dtos;
using FinTrackSystemApi.Models;
using FinTrackSystemApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FinTrackSystemApi.Controllers;

[ApiController]
[Route("api/reports")]
[Authorize(Roles = Roles.ReportUsers)]
public class ReportsController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    private readonly IAuditService _auditService;

    public ReportsController(ApplicationDbContext db, IAuditService auditService)
    {
        _db = db;
        _auditService = auditService;
    }

    [HttpGet("transactions")]
    public async Task<ActionResult<ApiResponse<TransactionReportResponse>>> GetTransactionReport(
        [FromQuery] DateTime? dateFrom,
        [FromQuery] DateTime? dateTo,
        [FromQuery] string? status,
        [FromQuery] string? type,
        [FromQuery] bool auditExport = false)
    {
        var query = _db.Transactions.AsNoTracking();

        if (dateFrom.HasValue)
        {
            query = query.Where(transaction => transaction.TransactionDate >= dateFrom.Value.Date);
        }

        if (dateTo.HasValue)
        {
            query = query.Where(transaction => transaction.TransactionDate <= dateTo.Value.Date);
        }

        if (!string.IsNullOrWhiteSpace(status))
        {
            if (!Enum.TryParse<TransactionStatus>(status, true, out var parsedStatus))
            {
                return BadRequest(ApiResponse<TransactionReportResponse>.Fail("Transaction status is not valid."));
            }

            query = query.Where(transaction => transaction.Status == parsedStatus);
        }

        if (!string.IsNullOrWhiteSpace(type))
        {
            if (!Enum.TryParse<TransactionType>(type, true, out var parsedType))
            {
                return BadRequest(ApiResponse<TransactionReportResponse>.Fail("Transaction type is not valid."));
            }

            query = query.Where(transaction => transaction.TransactionType == parsedType);
        }

        var transactions = await query
            .OrderByDescending(transaction => transaction.TransactionDate)
            .ThenByDescending(transaction => transaction.CreatedAt)
            .ToListAsync();

        if (auditExport)
        {
            await _auditService.WriteAsync("Export laporan", "Reports", $"Exported transaction report with {transactions.Count} records.");
        }

        var response = new TransactionReportResponse(
            transactions.Count,
            transactions.Sum(transaction => transaction.Amount),
            transactions.Select(transaction => transaction.ToResponse()).ToList());

        return Ok(ApiResponse<TransactionReportResponse>.Ok(response));
    }
}
