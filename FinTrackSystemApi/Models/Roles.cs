namespace FinTrackSystemApi.Models;

public static class Roles
{
    public const string SuperAdmin = "Super Admin";
    public const string FinanceStaff = "Finance Staff";
    public const string Manager = "Manager";
    public const string Auditor = "Auditor";

    public const string AdminFinance = SuperAdmin + "," + FinanceStaff;
    public const string AdminManager = SuperAdmin + "," + Manager;
    public const string TransactionUsers = SuperAdmin + "," + FinanceStaff + "," + Manager;
    public const string ReportUsers = SuperAdmin + "," + FinanceStaff + "," + Manager + "," + Auditor;
    public const string AuditUsers = SuperAdmin + "," + Manager + "," + Auditor;

    public static readonly IReadOnlySet<string> All = new HashSet<string>
    {
        SuperAdmin,
        FinanceStaff,
        Manager,
        Auditor
    };
}
