
import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  signal,
  computed
} from '@angular/core';

import { DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

import { EmployeeService } from '../../../core/services/employee.service';
import { AttendanceService } from '../../../core/services/attendance.service';

import { Employee } from '../../../core/models/employee.model';
import { AttendanceRecord } from '../../../core/models/attendance.model';

@Component({
  selector: 'app-employee-timesheet',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './employee-timesheet.html'
})
export class EmployeeTimesheet implements OnInit, OnDestroy {
  private readonly employeeService = inject(EmployeeService);
  private readonly attendanceService = inject(AttendanceService);
  private readonly route = inject(ActivatedRoute);

  private employeesRequest?: Subscription;
  private timesheetRequest?: Subscription;
  private actionRequest?: Subscription;

  readonly employees = signal<Employee[]>([]);
  readonly records = signal<AttendanceRecord[]>([]);

  readonly selectedEmployeeId = signal<number | null>(null);

  readonly loadingEmployees = signal(false);
  readonly loadingTimesheet = signal(false);
  readonly saving = signal(false);

  readonly error = signal('');
  readonly message = signal('');

  readonly completedDays = computed(() =>
    this.records().filter(r => r.checkOut !== null).length
  );

  readonly totalMinutes = computed(() =>
    this.records().reduce((total, record) => {
      if (record.workingHours === null) return total;
      return total + Math.round(record.workingHours * 60);
    }, 0)
  );

  readonly totalWorkingDays = computed(() => this.records().length);

  ngOnInit(): void {
    this.loadEmployees();
  }

  loadEmployees(): void {
    this.loadingEmployees.set(true);

    this.employeesRequest = this.employeeService
      .getEmployees()
      .subscribe({
        next: employees => {
          this.employees.set(employees);
          this.loadingEmployees.set(false);

          const employeeId = Number(
            this.route.snapshot.queryParamMap.get('employeeId')
          );

          if (employeeId > 0 &&
              employees.some(e => e.id === employeeId)) {
            this.selectEmployee(String(employeeId));
          }
        },
        error: () => {
          this.loadingEmployees.set(false);
          this.error.set('Failed to load employees.');
        }
      });
  }

  selectEmployee(value: string): void {
    this.timesheetRequest?.unsubscribe();

    const id = Number(value);

    this.selectedEmployeeId.set(id > 0 ? id : null);
    this.records.set([]);
    this.error.set('');
    this.message.set('');

    if (id > 0) {
      this.loadTimesheet(id);
    }
  }

  loadTimesheet(employeeId: number): void {
    this.loadingTimesheet.set(true);

    this.timesheetRequest = this.attendanceService
      .getTimesheet(employeeId)
      .subscribe({
        next: records => {
          this.records.set(records);
          this.loadingTimesheet.set(false);
        },
        error: () => {
          this.loadingTimesheet.set(false);
          this.error.set('Failed to load attendance records.');
        }
      });
  }

  submitAttendance(action: 'in' | 'out'): void {
    const employeeId = this.selectedEmployeeId();

    if (!employeeId || this.saving()) return;

    this.saving.set(true);
    this.error.set('');
    this.message.set('');

    const request$ = action === 'in'
      ? this.attendanceService.checkIn(employeeId)
      : this.attendanceService.checkOut(employeeId);

    this.actionRequest = request$.subscribe({
      next: () => {
        this.saving.set(false);

        this.message.set(
          action === 'in'
            ? 'Check-in completed successfully.'
            : 'Check-out completed successfully.'
        );

        this.loadTimesheet(employeeId);
      },
      error: err => {
        this.saving.set(false);

        this.error.set(
          typeof err.error === 'string'
            ? err.error
            : 'Attendance operation failed.'
        );
      }
    });
  }

  formatHours(totalMinutes: number): string {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return `${hours}h ${minutes}m`;
  }

  toMinutes(hours: number | null): number {
    return hours === null ? 0 : Math.round(hours * 60);
  }

  ngOnDestroy(): void {
    this.employeesRequest?.unsubscribe();
    this.timesheetRequest?.unsubscribe();
    this.actionRequest?.unsubscribe();
  }
}
