namespace FinTrackSystemApi.Dtos;

public record AuditLogResponse(
    Guid Id,
    string User,
    string Role,
    string Action,
    string Module,
    string Description,
    DateTime CreatedAt);
