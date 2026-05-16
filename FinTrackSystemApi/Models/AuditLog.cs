namespace FinTrackSystemApi.Models;

public class AuditLog
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string User { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty;
    public string Module { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
