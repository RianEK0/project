using FinTrackSystemApi.Data;
using FinTrackSystemApi.Dtos;
using FinTrackSystemApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FinTrackSystemApi.Controllers;

[ApiController]
[Route("api/audit-logs")]
[Authorize(Roles = Roles.AuditUsers)]
public class AuditLogsController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public AuditLogsController(ApplicationDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<AuditLogResponse>>>> GetAuditLogs([FromQuery] string? search)
    {
        var query = _db.AuditLogs.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var keyword = search.Trim();
            query = query.Where(log =>
                log.User.Contains(keyword) ||
                log.Role.Contains(keyword) ||
                log.Action.Contains(keyword) ||
                log.Module.Contains(keyword) ||
                log.Description.Contains(keyword));
        }

        var logs = await query
            .OrderByDescending(log => log.CreatedAt)
            .Take(500)
            .ToListAsync();

        return Ok(ApiResponse<IReadOnlyList<AuditLogResponse>>.Ok(logs.Select(log => log.ToResponse()).ToList()));
    }
}
