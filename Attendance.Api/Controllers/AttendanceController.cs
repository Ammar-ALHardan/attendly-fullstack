
using Attendance.Api.Data;
using Attendance.Api.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Attendance.Api.Controllers;

public record AttendanceRequest(int EmployeeId);

[ApiController]
[Route("api/attendance")]
public class AttendanceController : ControllerBase
{
    private readonly AttendanceDbContext _context;

    public AttendanceController(AttendanceDbContext context)
    {
        _context = context;
    }

    private static DateOnly GetWorkDate(DateTimeOffset now)
    {
        var zone = TimeZoneInfo.FindSystemTimeZoneById(
            "Asia/Qatar");

        var localTime = TimeZoneInfo.ConvertTime(now, zone);

        return DateOnly.FromDateTime(localTime.DateTime);
    }

    [HttpGet("employee/{employeeId:int}")]
    public async Task<IActionResult> GetTimesheet(int employeeId)
    {
        var exists = await _context.Employees
            .AnyAsync(e => e.Id == employeeId);

        if (!exists)
            return NotFound("Employee not found.");

        var records = await _context.AttendanceRecords
            .AsNoTracking()
            .Where(a => a.EmployeeId == employeeId)
            .OrderByDescending(a => a.WorkDate)
            .Select(a => new
            {
                a.Id,
                a.EmployeeId,
                a.WorkDate,
                a.CheckIn,
                a.CheckOut
            })
            .ToListAsync();

        var result = records.Select(a => new
        {
            a.Id,
            a.EmployeeId,
            a.WorkDate,
            a.CheckIn,
            a.CheckOut,
            WorkingHours = a.CheckOut.HasValue
                ? Math.Round(
                    (a.CheckOut.Value - a.CheckIn).TotalHours,
                    2)
                : (double?)null
        });

        return Ok(result);
    }

    [HttpPost("check-in")]
    public async Task<IActionResult> CheckIn(
        AttendanceRequest request)
    {
        var employee = await _context.Employees
            .FirstOrDefaultAsync(e => e.Id == request.EmployeeId);

        if (employee == null)
            return NotFound("Employee not found.");

        if (!employee.IsActive)
            return BadRequest("Employee is inactive.");

        var now = DateTimeOffset.UtcNow;
        var today = GetWorkDate(now);

        var exists = await _context.AttendanceRecords
            .AnyAsync(a =>
                a.EmployeeId == request.EmployeeId &&
                a.WorkDate == today);

        if (exists)
            return Conflict("Already checked in today.");

        var record = new AttendanceRecord
        {
            EmployeeId = request.EmployeeId,
            WorkDate = today,
            CheckIn = now
        };

        _context.AttendanceRecords.Add(record);
        await _context.SaveChangesAsync();

        return Ok(new { record.Id, Message = "Checked in" });
    }

    [HttpPost("check-out")]
    public async Task<IActionResult> CheckOut(
        AttendanceRequest request)
    {
        var record = await _context.AttendanceRecords
            .Where(a =>
                a.EmployeeId == request.EmployeeId &&
                a.CheckOut == null)
            .OrderByDescending(a => a.CheckIn)
            .FirstOrDefaultAsync();

        if (record == null)
            return BadRequest("No open attendance record.");

        record.CheckOut = DateTimeOffset.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(new
        {
            record.Id,
            Message = "Checked out",
            WorkingHours = Math.Round(
                (record.CheckOut.Value - record.CheckIn)
                    .TotalHours, 2)
        });
    }
}
