using FinTrackSystemApi.Models;
using FinTrackSystemApi.Services;
using Microsoft.EntityFrameworkCore;

namespace FinTrackSystemApi.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var passwordHasher = scope.ServiceProvider.GetRequiredService<IPasswordHasher>();

        await db.Database.EnsureCreatedAsync();

        if (!await db.Users.AnyAsync())
        {
            db.Users.AddRange(
                User("admin", "Nadia Putri", "Super Admin", passwordHasher),
                User("finance", "Rizky Finance", "Finance Staff", passwordHasher),
                User("manager", "Dimas Manager", "Manager", passwordHasher),
                User("auditor", "Sari Auditor", "Auditor", passwordHasher)
            );
        }

        if (!await db.Customers.AnyAsync())
        {
            db.Customers.AddRange(SeedCustomers());
        }

        await db.SaveChangesAsync();

        if (!await db.Transactions.AnyAsync())
        {
            var customers = await db.Customers.OrderBy(customer => customer.CustomerCode).ToListAsync();
            db.Transactions.AddRange(SeedTransactions(customers));
            await db.SaveChangesAsync();
        }

        if (!await db.Approvals.AnyAsync())
        {
            var transactions = await db.Transactions.ToDictionaryAsync(transaction => transaction.TransactionCode);
            db.Approvals.AddRange(
                Approval(transactions["TRX-2026-0001"].Id, "Approve", "Dokumen transaksi lengkap.", "manager", new DateTime(2026, 5, 1, 14, 25, 0, DateTimeKind.Utc)),
                Approval(transactions["TRX-2026-0002"].Id, "Approve", "Nominal sesuai instruksi treasury.", "manager", new DateTime(2026, 5, 1, 15, 10, 0, DateTimeKind.Utc)),
                Approval(transactions["TRX-2026-0005"].Id, "Reject", "Data refund belum sesuai bukti pendukung.", "manager", new DateTime(2026, 5, 3, 16, 2, 0, DateTimeKind.Utc)),
                Approval(transactions["TRX-2026-0006"].Id, "Approve", "Disetujui oleh admin untuk kebutuhan prioritas.", "admin", new DateTime(2026, 5, 4, 12, 24, 0, DateTimeKind.Utc)),
                Approval(transactions["TRX-2026-0011"].Id, "Reject", "Invoice terdeteksi duplikat.", "manager", new DateTime(2026, 5, 7, 11, 58, 0, DateTimeKind.Utc))
            );
        }

        if (!await db.AuditLogs.AnyAsync())
        {
            db.AuditLogs.Add(new AuditLog
            {
                User = "system",
                Role = "System",
                Action = "Seed database",
                Module = "Database",
                Description = "Initial demo data created.",
                CreatedAt = DateTime.UtcNow
            });
        }

        await db.SaveChangesAsync();
    }

    private static AppUser User(string username, string fullName, string role, IPasswordHasher passwordHasher)
    {
        return new AppUser
        {
            Username = username,
            FullName = fullName,
            Role = role,
            PasswordHash = passwordHasher.Hash("password"),
            CreatedAt = DateTime.UtcNow
        };
    }

    private static List<Customer> SeedCustomers()
    {
        return new List<Customer>
        {
            Customer("CUS-1001", "Andi Wijaya", "100110012001", "andi.wijaya@example.com", "081234567801", "Jl. Sudirman No. 21, Jakarta", CustomerStatus.Active, new DateTime(2026, 4, 18, 9, 15, 0, DateTimeKind.Utc)),
            Customer("CUS-1002", "Siti Rahma", "100110012002", "siti.rahma@example.com", "081234567802", "Jl. Asia Afrika No. 12, Bandung", CustomerStatus.Active, new DateTime(2026, 4, 18, 10, 20, 0, DateTimeKind.Utc)),
            Customer("CUS-1003", "Budi Santoso", "100110012003", "budi.santoso@example.com", "081234567803", "Jl. Pemuda No. 44, Surabaya", CustomerStatus.Active, new DateTime(2026, 4, 19, 8, 40, 0, DateTimeKind.Utc)),
            Customer("CUS-1004", "Maya Lestari", "100110012004", "maya.lestari@example.com", "081234567804", "Jl. Diponegoro No. 8, Semarang", CustomerStatus.Active, new DateTime(2026, 4, 20, 13, 30, 0, DateTimeKind.Utc)),
            Customer("CUS-1005", "Raka Prasetyo", "100110012005", "raka.prasetyo@example.com", "081234567805", "Jl. Malioboro No. 17, Yogyakarta", CustomerStatus.Inactive, new DateTime(2026, 4, 21, 11, 5, 0, DateTimeKind.Utc)),
            Customer("CUS-1006", "Dewi Kartika", "100110012006", "dewi.kartika@example.com", "081234567806", "Jl. Gatot Subroto No. 30, Medan", CustomerStatus.Active, new DateTime(2026, 4, 22, 15, 10, 0, DateTimeKind.Utc)),
            Customer("CUS-1007", "Fajar Nugroho", "100110012007", "fajar.nugroho@example.com", "081234567807", "Jl. Pahlawan No. 51, Makassar", CustomerStatus.Active, new DateTime(2026, 4, 23, 9, 50, 0, DateTimeKind.Utc)),
            Customer("CUS-1008", "Lina Permata", "100110012008", "lina.permata@example.com", "081234567808", "Jl. Ahmad Yani No. 6, Denpasar", CustomerStatus.Active, new DateTime(2026, 4, 24, 14, 22, 0, DateTimeKind.Utc)),
            Customer("CUS-1009", "Hendra Saputra", "100110012009", "hendra.saputra@example.com", "081234567809", "Jl. Imam Bonjol No. 93, Palembang", CustomerStatus.Inactive, new DateTime(2026, 4, 25, 16, 12, 0, DateTimeKind.Utc)),
            Customer("CUS-1010", "Nina Oktaviani", "100110012010", "nina.oktaviani@example.com", "081234567810", "Jl. Veteran No. 27, Balikpapan", CustomerStatus.Active, new DateTime(2026, 4, 26, 10, 35, 0, DateTimeKind.Utc))
        };
    }

    private static List<FinancialTransaction> SeedTransactions(IReadOnlyList<Customer> customers)
    {
        var byCode = customers.ToDictionary(customer => customer.CustomerCode);

        return new List<FinancialTransaction>
        {
            Transaction("TRX-2026-0001", byCode["CUS-1001"], TransactionType.Transfer, 2500000, TransactionStatus.Success, "2026-05-01", "Transfer vendor bulanan", "finance", "manager", "2026-05-01T14:25:00Z", "2026-05-01T09:02:00Z"),
            Transaction("TRX-2026-0002", byCode["CUS-1002"], TransactionType.Deposit, 5000000, TransactionStatus.Success, "2026-05-01", "Setoran dana operasional", "finance", "manager", "2026-05-01T15:10:00Z", "2026-05-01T10:12:00Z"),
            Transaction("TRX-2026-0003", byCode["CUS-1003"], TransactionType.Payment, 750000, TransactionStatus.Pending, "2026-05-02", "Pembayaran invoice layanan", "finance", null, null, "2026-05-02T09:44:00Z"),
            Transaction("TRX-2026-0004", byCode["CUS-1004"], TransactionType.Withdrawal, 1500000, TransactionStatus.Failed, "2026-05-02", "Penarikan tunai cabang", "finance", null, null, "2026-05-02T13:11:00Z"),
            Transaction("TRX-2026-0005", byCode["CUS-1005"], TransactionType.Refund, 320000, TransactionStatus.Rejected, "2026-05-03", "Refund biaya layanan", "finance", "manager", "2026-05-03T16:02:00Z", "2026-05-03T11:18:00Z"),
            Transaction("TRX-2026-0006", byCode["CUS-1006"], TransactionType.Transfer, 8800000, TransactionStatus.Success, "2026-05-04", "Transfer antar rekening perusahaan", "admin", "admin", "2026-05-04T12:24:00Z", "2026-05-04T08:20:00Z"),
            Transaction("TRX-2026-0007", byCode["CUS-1007"], TransactionType.Payment, 2100000, TransactionStatus.Pending, "2026-05-05", "Pembayaran subscription tahunan", "finance", null, null, "2026-05-05T09:40:00Z"),
            Transaction("TRX-2026-0008", byCode["CUS-1008"], TransactionType.Deposit, 12500000, TransactionStatus.Success, "2026-05-05", "Top up akun prioritas", "finance", "manager", "2026-05-05T13:04:00Z", "2026-05-05T10:50:00Z"),
            Transaction("TRX-2026-0009", byCode["CUS-1009"], TransactionType.Withdrawal, 670000, TransactionStatus.Failed, "2026-05-06", "Penarikan melebihi limit", "finance", null, null, "2026-05-06T15:12:00Z"),
            Transaction("TRX-2026-0010", byCode["CUS-1010"], TransactionType.Transfer, 4500000, TransactionStatus.Success, "2026-05-06", "Transfer pembelian aset", "finance", "manager", "2026-05-06T16:33:00Z", "2026-05-06T12:03:00Z"),
            Transaction("TRX-2026-0011", byCode["CUS-1001"], TransactionType.Payment, 930000, TransactionStatus.Rejected, "2026-05-07", "Pembayaran invoice duplikat", "finance", "manager", "2026-05-07T11:58:00Z", "2026-05-07T09:26:00Z"),
            Transaction("TRX-2026-0012", byCode["CUS-1002"], TransactionType.Refund, 480000, TransactionStatus.Pending, "2026-05-08", "Refund transaksi marketplace", "finance", null, null, "2026-05-08T08:37:00Z"),
            Transaction("TRX-2026-0013", byCode["CUS-1003"], TransactionType.Deposit, 7300000, TransactionStatus.Success, "2026-05-08", "Deposit payroll klien", "admin", "admin", "2026-05-08T12:46:00Z", "2026-05-08T10:01:00Z"),
            Transaction("TRX-2026-0014", byCode["CUS-1004"], TransactionType.Transfer, 1840000, TransactionStatus.Pending, "2026-05-09", "Transfer pemasok regional", "finance", null, null, "2026-05-09T09:20:00Z"),
            Transaction("TRX-2026-0015", byCode["CUS-1005"], TransactionType.Payment, 640000, TransactionStatus.Success, "2026-05-09", "Pembayaran tagihan bulanan", "finance", "manager", "2026-05-09T15:02:00Z", "2026-05-09T11:46:00Z"),
            Transaction("TRX-2026-0016", byCode["CUS-1006"], TransactionType.Withdrawal, 990000, TransactionStatus.Pending, "2026-05-10", "Penarikan kas operasional", "finance", null, null, "2026-05-10T08:56:00Z"),
            Transaction("TRX-2026-0017", byCode["CUS-1007"], TransactionType.Transfer, 3100000, TransactionStatus.Failed, "2026-05-10", "Transfer gagal validasi bank tujuan", "finance", null, null, "2026-05-10T13:29:00Z"),
            Transaction("TRX-2026-0018", byCode["CUS-1008"], TransactionType.Refund, 540000, TransactionStatus.Success, "2026-05-11", "Refund klaim transaksi", "admin", "manager", "2026-05-11T12:17:00Z", "2026-05-11T09:32:00Z"),
            Transaction("TRX-2026-0019", byCode["CUS-1009"], TransactionType.Deposit, 4100000, TransactionStatus.Pending, "2026-05-12", "Deposit pembukaan kembali akun", "finance", null, null, "2026-05-12T10:16:00Z"),
            Transaction("TRX-2026-0020", byCode["CUS-1010"], TransactionType.Payment, 1750000, TransactionStatus.Success, "2026-05-13", "Pembayaran settlement merchant", "finance", "manager", "2026-05-13T14:02:00Z", "2026-05-13T09:14:00Z")
        };
    }

    private static Customer Customer(string code, string fullName, string accountNumber, string email, string phone, string address, CustomerStatus status, DateTime createdAt)
    {
        return new Customer
        {
            CustomerCode = code,
            FullName = fullName,
            AccountNumber = accountNumber,
            Email = email,
            PhoneNumber = phone,
            Address = address,
            Status = status,
            CreatedAt = createdAt
        };
    }

    private static FinancialTransaction Transaction(
        string code,
        Customer customer,
        TransactionType type,
        decimal amount,
        TransactionStatus status,
        string transactionDate,
        string description,
        string createdBy,
        string? approvedBy,
        string? approvedAt,
        string createdAt)
    {
        return new FinancialTransaction
        {
            TransactionCode = code,
            CustomerId = customer.Id,
            CustomerName = customer.FullName,
            TransactionType = type,
            Amount = amount,
            Status = status,
            TransactionDate = DateTime.Parse(transactionDate),
            Description = description,
            CreatedBy = createdBy,
            ApprovedBy = approvedBy,
            ApprovedAt = approvedAt is null ? null : DateTime.Parse(approvedAt),
            CreatedAt = DateTime.Parse(createdAt)
        };
    }

    private static Approval Approval(Guid transactionId, string action, string note, string approvedBy, DateTime createdAt)
    {
        return new Approval
        {
            TransactionId = transactionId,
            Action = action,
            Note = note,
            ApprovedBy = approvedBy,
            CreatedAt = createdAt
        };
    }
}
