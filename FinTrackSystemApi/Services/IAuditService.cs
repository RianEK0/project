namespace FinTrackSystemApi.Services;

public interface IAuditService
{
    Task WriteAsync(string action, string module, string description, string? username = null, string? role = null);
}
