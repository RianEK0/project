namespace FinTrackSystemApi.Dtos;

public class LoginRequest
{
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class RegisterRequest
{
    public string Username { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string Role { get; set; } = "Finance Staff";
}

public record UserResponse(Guid Id, string Username, string FullName, string Role, DateTime CreatedAt);

public record AuthResponse(string Token, DateTime ExpiresAt, UserResponse User);
