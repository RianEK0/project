using System.Security.Claims;
using FinTrackSystemApi.Data;
using FinTrackSystemApi.Models;

namespace FinTrackSystemApi.Services;

public class AuditService : IAuditService
{
    private readonly ApplicationDbContext _db;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public AuditService(ApplicationDbContext db, IHttpContextAccessor httpContextAccessor)
    {
        _db = db;
        _httpContextAccessor = httpContextAccessor;
    }

    public async Task WriteAsync(string action, string module, string description, string? username = null, string? role = null)
    {
        var user = _httpContextAccessor.HttpContext?.User;
        var currentUsername = username ?? user?.Identity?.Name ?? "system";
        var currentRole = role ?? user?.FindFirstValue(ClaimTypes.Role) ?? "System";

        _db.AuditLogs.Add(new AuditLog
        {
            User = currentUsername,
            Role = currentRole,
            Action = action,
            Module = module,
            Description = description,
            CreatedAt = DateTime.UtcNow
        });

        await _db.SaveChangesAsync();
    }
}
