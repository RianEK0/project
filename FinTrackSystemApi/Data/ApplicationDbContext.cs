using FinTrackSystemApi.Models;
using Microsoft.EntityFrameworkCore;

namespace FinTrackSystemApi.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    public DbSet<AppUser> Users => Set<AppUser>();
    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<FinancialTransaction> Transactions => Set<FinancialTransaction>();
    public DbSet<Approval> Approvals => Set<Approval>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<AppUser>(entity =>
        {
            entity.HasIndex(user => user.Username).IsUnique();
            entity.Property(user => user.Username).HasMaxLength(60).IsRequired();
            entity.Property(user => user.FullName).HasMaxLength(120).IsRequired();
            entity.Property(user => user.PasswordHash).HasMaxLength(300).IsRequired();
            entity.Property(user => user.Role).HasMaxLength(60).IsRequired();
        });

        modelBuilder.Entity<Customer>(entity =>
        {
            entity.HasIndex(customer => customer.CustomerCode).IsUnique();
            entity.HasIndex(customer => customer.AccountNumber).IsUnique();
            entity.Property(customer => customer.CustomerCode).HasMaxLength(30).IsRequired();
            entity.Property(customer => customer.FullName).HasMaxLength(160).IsRequired();
            entity.Property(customer => customer.AccountNumber).HasMaxLength(40).IsRequired();
            entity.Property(customer => customer.Email).HasMaxLength(180).IsRequired();
            entity.Property(customer => customer.PhoneNumber).HasMaxLength(40).IsRequired();
            entity.Property(customer => customer.Address).HasMaxLength(500).IsRequired();
            entity.Property(customer => customer.Status).HasConversion<string>().HasMaxLength(20).IsRequired();
        });

        modelBuilder.Entity<FinancialTransaction>(entity =>
        {
            entity.ToTable("Transactions");
            entity.HasIndex(transaction => transaction.TransactionCode).IsUnique();
            entity.Property(transaction => transaction.TransactionCode).HasMaxLength(40).IsRequired();
            entity.Property(transaction => transaction.CustomerName).HasMaxLength(160).IsRequired();
            entity.Property(transaction => transaction.TransactionType).HasConversion<string>().HasMaxLength(30).IsRequired();
            entity.Property(transaction => transaction.Amount).HasColumnType("decimal(18,2)").IsRequired();
            entity.Property(transaction => transaction.Status).HasConversion<string>().HasMaxLength(30).IsRequired();
            entity.Property(transaction => transaction.Description).HasMaxLength(600).IsRequired();
            entity.Property(transaction => transaction.CreatedBy).HasMaxLength(80).IsRequired();
            entity.Property(transaction => transaction.ApprovedBy).HasMaxLength(80);

            entity
                .HasOne(transaction => transaction.Customer)
                .WithMany(customer => customer.Transactions)
                .HasForeignKey(transaction => transaction.CustomerId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Approval>(entity =>
        {
            entity.Property(approval => approval.Action).HasMaxLength(30).IsRequired();
            entity.Property(approval => approval.Note).HasMaxLength(600).IsRequired();
            entity.Property(approval => approval.ApprovedBy).HasMaxLength(80).IsRequired();

            entity
                .HasOne(approval => approval.Transaction)
                .WithMany(transaction => transaction.Approvals)
                .HasForeignKey(approval => approval.TransactionId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<AuditLog>(entity =>
        {
            entity.Property(log => log.User).HasMaxLength(80).IsRequired();
            entity.Property(log => log.Role).HasMaxLength(60).IsRequired();
            entity.Property(log => log.Action).HasMaxLength(120).IsRequired();
            entity.Property(log => log.Module).HasMaxLength(80).IsRequired();
            entity.Property(log => log.Description).HasMaxLength(800).IsRequired();
        });
    }
}
