
using Attendance.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace Attendance.Api.Data;

public class AttendanceDbContext : DbContext
{
    public AttendanceDbContext(
        DbContextOptions<AttendanceDbContext> options)
        : base(options)
    {
    }

    public DbSet<Employee> Employees => Set<Employee>();

    public DbSet<AttendanceRecord> AttendanceRecords
        => Set<AttendanceRecord>();

    protected override void OnModelCreating(
        ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Employee>(entity =>
        {
            entity.HasKey(e => e.Id);

            entity.Property(e => e.EmployeeNumber)
                .HasMaxLength(20)
                .IsRequired();

            entity.HasIndex(e => e.EmployeeNumber)
                .IsUnique();

            entity.Property(e => e.FullName)
                .HasMaxLength(150)
                .IsRequired();

            entity.Property(e => e.Department)
                .HasMaxLength(100)
                .IsRequired();
        });

        modelBuilder.Entity<AttendanceRecord>(entity =>
        {
            entity.HasKey(e => e.Id);

            entity.HasOne(e => e.Employee)
                .WithMany(e => e.AttendanceRecords)
                .HasForeignKey(e => e.EmployeeId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(e => new
            {
                e.EmployeeId,
                e.WorkDate
            }).IsUnique();
        });
    }
}
