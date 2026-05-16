namespace FinTrackSystemApi.Models;

public class FinancialTransaction
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string TransactionCode { get; set; } = string.Empty;
    public Guid CustomerId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public TransactionType TransactionType { get; set; }
    public decimal Amount { get; set; }
    public TransactionStatus Status { get; set; } = TransactionStatus.Pending;
    public DateTime TransactionDate { get; set; }
    public string Description { get; set; } = string.Empty;
    public string CreatedBy { get; set; } = string.Empty;
    public string? ApprovedBy { get; set; }
    public DateTime? ApprovedAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Customer? Customer { get; set; }
    public ICollection<Approval> Approvals { get; set; } = new List<Approval>();
}
