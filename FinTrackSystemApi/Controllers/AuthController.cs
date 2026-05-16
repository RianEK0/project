using FinTrackSystemApi.Data;
using FinTrackSystemApi.Dtos;
using FinTrackSystemApi.Models;
using FinTrackSystemApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FinTrackSystemApi.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtTokenService _jwtTokenService;
    private readonly IAuditService _auditService;

    public AuthController(
        ApplicationDbContext db,
        IPasswordHasher passwordHasher,
        IJwtTokenService jwtTokenService,
        IAuditService auditService)
    {
        _db = db;
        _passwordHasher = passwordHasher;
        _jwtTokenService = jwtTokenService;
        _auditService = auditService;
    }

    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<ActionResult<ApiResponse<AuthResponse>>> Login(LoginRequest request)
    {
        var username = request.Username.Trim();
        var user = await _db.Users.FirstOrDefaultAsync(item => item.Username == username);

        if (user is null || !_passwordHasher.Verify(request.Password, user.PasswordHash))
        {
            return Unauthorized(ApiResponse<AuthResponse>.Fail("Username or password is invalid."));
        }

        var token = _jwtTokenService.GenerateToken(user);
        await _auditService.WriteAsync("Login", "Authentication", $"{user.FullName} logged in as {user.Role}.", user.Username, user.Role);

        return Ok(ApiResponse<AuthResponse>.Ok(
            new AuthResponse(token.Token, token.ExpiresAt, user.ToResponse()),
            "Login successful."));
    }

    [Authorize(Roles = Roles.SuperAdmin)]
    [HttpPost("register")]
    public async Task<ActionResult<ApiResponse<UserResponse>>> Register(RegisterRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password) || string.IsNullOrWhiteSpace(request.FullName))
        {
            return BadRequest(ApiResponse<UserResponse>.Fail("Username, full name, and password are required."));
        }

        if (!Roles.All.Contains(request.Role))
        {
            return BadRequest(ApiResponse<UserResponse>.Fail("Role is not valid."));
        }

        var username = request.Username.Trim();
        var exists = await _db.Users.AnyAsync(user => user.Username == username);
        if (exists)
        {
            return Conflict(ApiResponse<UserResponse>.Fail("Username already exists."));
        }

        var newUser = new AppUser
        {
            Username = username,
            FullName = request.FullName.Trim(),
            Role = request.Role,
            PasswordHash = _passwordHasher.Hash(request.Password),
            CreatedAt = DateTime.UtcNow
        };

        _db.Users.Add(newUser);
        await _db.SaveChangesAsync();
        await _auditService.WriteAsync("Register user", "Authentication", $"Registered user {newUser.Username} as {newUser.Role}.");

        return StatusCode(StatusCodes.Status201Created, ApiResponse<UserResponse>.Ok(newUser.ToResponse(), "User registered successfully."));
    }
}
