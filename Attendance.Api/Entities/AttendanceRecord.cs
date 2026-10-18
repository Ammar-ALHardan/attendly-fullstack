
namespace Attendance.Api.Entities;

public class AttendanceRecord
{
    public int Id { get; set; }

    public int EmployeeId { get; set; }

    public Employee Employee { get; set; } = null!;

    public DateOnly WorkDate { get; set; }

    public DateTimeOffset CheckIn { get; set; }

    public DateTimeOffset? CheckOut { get; set; }
}
