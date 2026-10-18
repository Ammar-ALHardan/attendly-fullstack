
namespace Attendance.Api.Entities;

public class Employee
{
    public int Id { get; set; }

    public string EmployeeNumber { get; set; } = string.Empty;

    public string FullName { get; set; } = string.Empty;

    public string Department { get; set; } = string.Empty;

    public bool IsActive { get; set; } = true;

    public ICollection<AttendanceRecord> AttendanceRecords
        { get; set; } = new List<AttendanceRecord>();
}
