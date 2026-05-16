namespace FinTrackSystemApi.Models;

public enum CustomerStatus
{
    Active,
    Inactive
}

public enum TransactionType
{
    Transfer,
    Deposit,
    Withdrawal,
    Payment,
    Refund
}

public enum TransactionStatus
{
    Pending,
    Success,
    Failed,
    Rejected
}
