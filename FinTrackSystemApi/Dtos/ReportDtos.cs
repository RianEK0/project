namespace FinTrackSystemApi.Dtos;

public record TransactionReportResponse(int TotalData, decimal TotalAmount, IReadOnlyList<TransactionResponse> Items);
