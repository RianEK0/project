using FinTrackSystemApi.Data;
using FinTrackSystemApi.Dtos;
using FinTrackSystemApi.Models;
using FinTrackSystemApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FinTrackSystemApi.Controllers;

[ApiController]
[Route("api/customers")]
[Authorize(Roles = Roles.AdminFinance)]
public class CustomersController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    private readonly IAuditService _auditService;

    public CustomersController(ApplicationDbContext db, IAuditService auditService)
    {
        _db = db;
        _auditService = auditService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<CustomerResponse>>>> GetCustomers([FromQuery] string? search)
    {
        var query = _db.Customers.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var keyword = search.Trim();
            query = query.Where(customer =>
                customer.CustomerCode.Contains(keyword) ||
                customer.FullName.Contains(keyword) ||
                customer.AccountNumber.Contains(keyword) ||
                customer.Email.Contains(keyword) ||
                customer.PhoneNumber.Contains(keyword));
        }

        var customers = await query
            .OrderBy(customer => customer.FullName)
            .ToListAsync();

        return Ok(ApiResponse<IReadOnlyList<CustomerResponse>>.Ok(customers.Select(customer => customer.ToResponse()).ToList()));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ApiResponse<CustomerResponse>>> GetCustomer(Guid id)
    {
        var customer = await _db.Customers.AsNoTracking().FirstOrDefaultAsync(item => item.Id == id);
        if (customer is null)
        {
            return NotFound(ApiResponse<CustomerResponse>.Fail("Customer not found."));
        }

        return Ok(ApiResponse<CustomerResponse>.Ok(customer.ToResponse()));
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<CustomerResponse>>> CreateCustomer(CustomerCreateRequest request)
    {
        if (!TryParseCustomerStatus(request.Status, out var status))
        {
            return BadRequest(ApiResponse<CustomerResponse>.Fail("Customer status is not valid."));
        }

        var customerCode = string.IsNullOrWhiteSpace(request.CustomerCode)
            ? await GenerateCustomerCodeAsync()
            : request.CustomerCode.Trim();

        var duplicate = await _db.Customers.AnyAsync(customer =>
            customer.CustomerCode == customerCode || customer.AccountNumber == request.AccountNumber.Trim());

        if (duplicate)
        {
            return Conflict(ApiResponse<CustomerResponse>.Fail("Customer code or account number already exists."));
        }

        var customer = new Customer
        {
            CustomerCode = customerCode,
            FullName = request.FullName.Trim(),
            AccountNumber = request.AccountNumber.Trim(),
            Email = request.Email.Trim(),
            PhoneNumber = request.PhoneNumber.Trim(),
            Address = request.Address.Trim(),
            Status = status,
            CreatedAt = DateTime.UtcNow
        };

        _db.Customers.Add(customer);
        await _db.SaveChangesAsync();
        await _auditService.WriteAsync("Tambah customer", "Customer", $"Created customer {customer.FullName}.");

        return CreatedAtAction(nameof(GetCustomer), new { id = customer.Id }, ApiResponse<CustomerResponse>.Ok(customer.ToResponse(), "Customer created successfully."));
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ApiResponse<CustomerResponse>>> UpdateCustomer(Guid id, CustomerUpdateRequest request)
    {
        if (!TryParseCustomerStatus(request.Status, out var status))
        {
            return BadRequest(ApiResponse<CustomerResponse>.Fail("Customer status is not valid."));
        }

        var customer = await _db.Customers.FirstOrDefaultAsync(item => item.Id == id);
        if (customer is null)
        {
            return NotFound(ApiResponse<CustomerResponse>.Fail("Customer not found."));
        }

        var customerCode = request.CustomerCode.Trim();
        var accountNumber = request.AccountNumber.Trim();
        var duplicate = await _db.Customers.AnyAsync(item =>
            item.Id != id && (item.CustomerCode == customerCode || item.AccountNumber == accountNumber));

        if (duplicate)
        {
            return Conflict(ApiResponse<CustomerResponse>.Fail("Customer code or account number already exists."));
        }

        customer.CustomerCode = customerCode;
        customer.FullName = request.FullName.Trim();
        customer.AccountNumber = accountNumber;
        customer.Email = request.Email.Trim();
        customer.PhoneNumber = request.PhoneNumber.Trim();
        customer.Address = request.Address.Trim();
        customer.Status = status;

        var relatedTransactions = await _db.Transactions.Where(transaction => transaction.CustomerId == id).ToListAsync();
        foreach (var transaction in relatedTransactions)
        {
            transaction.CustomerName = customer.FullName;
        }

        await _db.SaveChangesAsync();
        await _auditService.WriteAsync("Edit customer", "Customer", $"Updated customer {customer.FullName}.");

        return Ok(ApiResponse<CustomerResponse>.Ok(customer.ToResponse(), "Customer updated successfully."));
    }

    [HttpDelete("{id:guid}")]
    public async Task<ActionResult<ApiResponse<object>>> DeleteCustomer(Guid id)
    {
        var customer = await _db.Customers.FirstOrDefaultAsync(item => item.Id == id);
        if (customer is null)
        {
            return NotFound(ApiResponse<object>.Fail("Customer not found."));
        }

        var hasTransactions = await _db.Transactions.AnyAsync(transaction => transaction.CustomerId == id);
        if (hasTransactions)
        {
            return BadRequest(ApiResponse<object>.Fail("Customer has transactions and cannot be deleted. Set status to Inactive instead."));
        }

        _db.Customers.Remove(customer);
        await _db.SaveChangesAsync();
        await _auditService.WriteAsync("Hapus customer", "Customer", $"Deleted customer {customer.FullName}.");

        return Ok(ApiResponse<object>.Ok(new { customer.Id }, "Customer deleted successfully."));
    }

    private async Task<string> GenerateCustomerCodeAsync()
    {
        var count = await _db.Customers.CountAsync();
        return $"CUS-{1001 + count}";
    }

    private static bool TryParseCustomerStatus(string value, out CustomerStatus status)
    {
        return Enum.TryParse(value, true, out status);
    }
}
