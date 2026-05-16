namespace FinTrackSystemApi.Dtos;

public record ImportError(int RowNumber, string Message);

public record ImportTransactionResult(int TotalData, int Success, int Failed, IReadOnlyList<ImportError> Errors);
