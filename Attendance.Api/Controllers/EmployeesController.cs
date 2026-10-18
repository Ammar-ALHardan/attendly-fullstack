
using Attendance.Api.Data;
using Attendance.Api.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Attendance.Api.Controllers;

public record CreateEmployeeRequest(
    string EmployeeNumber,
    string FullName,
    string Department
);

[ApiController]
[Route("api/employees")]
public class EmployeesController : ControllerBase
{
    private readonly AttendanceDbContext _context;

    public EmployeesController(AttendanceDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var employees = await _context.Employees
            .AsNoTracking()
            .OrderBy(e => e.FullName)
            .Select(e => new
            {
                e.Id,
                e.EmployeeNumber,
                e.FullName,
                e.Department,
                e.IsActive
            })
            .ToListAsync();

        return Ok(employees);
    }

    [HttpPost]
    public async Task<IActionResult> Create(
        CreateEmployeeRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.EmployeeNumber) ||
            string.IsNullOrWhiteSpace(request.FullName) ||
            string.IsNullOrWhiteSpace(request.Department))
        {
            return BadRequest("All fields are required.");
        }

        if (request.EmployeeNumber.Length > 20 ||
            request.FullName.Length > 150 ||
            request.Department.Length > 100)
        {
            return BadRequest("One or more fields are too long.");
        }

        var exists = await _context.Employees
            .AnyAsync(e =>
                e.EmployeeNumber == request.EmployeeNumber);

        if (exists)
            return Conflict("Employee number already exists.");

        var employee = new Employee
        {
            EmployeeNumber = request.EmployeeNumber,
            FullName = request.FullName,
            Department = request.Department
        };

        _context.Employees.Add(employee);

        await _context.SaveChangesAsync();

        return Created($"/api/employees/{employee.Id}",
            new
            {
                employee.Id,
                employee.EmployeeNumber,
                employee.FullName,
                employee.Department,
                employee.IsActive
            });
    }
}
