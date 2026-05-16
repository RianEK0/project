namespace FinTrackSystemApi.Dtos;

public class TransactionCreateRequest
{
    public string? TransactionCode { get; set; }
    public Guid CustomerId { get; set; }
    public string TransactionType { get; set; } = "Transfer";
    public decimal Amount { get; set; }
    public string Status { get; set; } = "Pending";
    public DateTime TransactionDate { get; set; } = DateTime.UtcNow.Date;
    public string Description { get; set; } = string.Empty;
}

public class TransactionUpdateRequest
{
    public string TransactionCode { get; set; } = string.Empty;
    public Guid CustomerId { get; set; }
    public string TransactionType { get; set; } = "Transfer";
    public decimal Amount { get; set; }
    public string Status { get; set; } = "Pending";
    public DateTime TransactionDate { get; set; } = DateTime.UtcNow.Date;
    public string Description { get; set; } = string.Empty;
}

public class ApprovalRequest
{
    public string Note { get; set; } = string.Empty;
}

public record TransactionResponse(
    Guid Id,
    string TransactionCode,
    Guid CustomerId,
    string CustomerName,
    string TransactionType,
    decimal Amount,
    string Status,
    DateTime TransactionDate,
    string Description,
    string CreatedBy,
    string? ApprovedBy,
    DateTime? ApprovedAt,
    DateTime CreatedAt);

public record ApprovalResponse(
    Guid Id,
    Guid TransactionId,
    string Action,
    string Note,
    string ApprovedBy,
    DateTime CreatedAt);
