namespace FinTrackSystemApi.Dtos;

public class CustomerCreateRequest
{
    public string? CustomerCode { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string AccountNumber { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string Status { get; set; } = "Active";
}

public class CustomerUpdateRequest
{
    public string CustomerCode { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string AccountNumber { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string Status { get; set; } = "Active";
}

public record CustomerResponse(
    Guid Id,
    string CustomerCode,
    string FullName,
    string AccountNumber,
    string Email,
    string PhoneNumber,
    string Address,
    string Status,
    DateTime CreatedAt);
