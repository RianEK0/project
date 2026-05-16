namespace FinTrackSystemApi.Services;

public class JwtSettings
{
    public string Issuer { get; set; } = "FinTrackSystemApi";
    public string Audience { get; set; } = "FinTrackSystemClient";
    public string Key { get; set; } = "FinTrack-System-Demo-Secret-Key-Change-This-In-Production-2026";
    public int ExpiryMinutes { get; set; } = 120;
}
