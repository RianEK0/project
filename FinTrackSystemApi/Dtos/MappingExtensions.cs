using FinTrackSystemApi.Models;

namespace FinTrackSystemApi.Dtos;

public static class MappingExtensions
{
    public static UserResponse ToResponse(this AppUser user)
    {
        return new UserResponse(user.Id, user.Username, user.FullName, user.Role, user.CreatedAt);
    }

    public static CustomerResponse ToResponse(this Customer customer)
    {
        return new CustomerResponse(
            customer.Id,
            customer.CustomerCode,
            customer.FullName,
            customer.AccountNumber,
            customer.Email,
            customer.PhoneNumber,
            customer.Address,
            customer.Status.ToString(),
            customer.CreatedAt);
    }

    public static TransactionResponse ToResponse(this FinancialTransaction transaction)
    {
        return new TransactionResponse(
            transaction.Id,
            transaction.TransactionCode,
            transaction.CustomerId,
            transaction.CustomerName,
            transaction.TransactionType.ToString(),
            transaction.Amount,
            transaction.Status.ToString(),
            transaction.TransactionDate,
            transaction.Description,
            transaction.CreatedBy,
            transaction.ApprovedBy,
            transaction.ApprovedAt,
            transaction.CreatedAt);
    }

    public static ApprovalResponse ToResponse(this Approval approval)
    {
        return new ApprovalResponse(
            approval.Id,
            approval.TransactionId,
            approval.Action,
            approval.Note,
            approval.ApprovedBy,
            approval.CreatedAt);
    }

    public static AuditLogResponse ToResponse(this AuditLog log)
    {
        return new AuditLogResponse(
            log.Id,
            log.User,
            log.Role,
            log.Action,
            log.Module,
            log.Description,
            log.CreatedAt);
    }
}
