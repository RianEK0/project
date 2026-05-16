namespace FinTrackSystemApi.Models;

public class Customer
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string CustomerCode { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string AccountNumber { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public CustomerStatus Status { get; set; } = CustomerStatus.Active;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<FinancialTransaction> Transactions { get; set; } = new List<FinancialTransaction>();
}
