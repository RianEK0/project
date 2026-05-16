using FinTrackSystemApi.Models;

namespace FinTrackSystemApi.Services;

public interface IJwtTokenService
{
    (string Token, DateTime ExpiresAt) GenerateToken(AppUser user);
}
