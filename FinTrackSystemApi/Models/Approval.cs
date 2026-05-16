namespace FinTrackSystemApi.Models;

public class Approval
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid TransactionId { get; set; }
    public string Action { get; set; } = string.Empty;
    public string Note { get; set; } = string.Empty;
    public string ApprovedBy { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public FinancialTransaction? Transaction { get; set; }
}
