
import { Component, EventEmitter, Output, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { EmployeeService } from '../../../core/services/employee.service';

@Component({
  selector: 'app-add-employee',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './add-employee.html'
})
export class AddEmployee {
  private fb = inject(FormBuilder);
  private employeeService = inject(EmployeeService);

  @Output() close = new EventEmitter<void>();
  @Output() created = new EventEmitter<void>();

  saving = signal(false);
  error = signal('');

  form = this.fb.nonNullable.group({
    employeeNumber: ['', [Validators.required, Validators.maxLength(20)]],
    fullName: ['', [Validators.required, Validators.maxLength(150)]],
    department: ['', [Validators.required, Validators.maxLength(100)]]
  });

  save(): void {
    if (this.form.invalid || this.saving()) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.error.set('');

    this.employeeService.createEmployee(this.form.getRawValue())
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.created.emit();
        },
        error: err => {
          this.saving.set(false);
          this.error.set(
            err.status === 409
              ? 'Employee number already exists.'
              : 'Failed to create employee.'
          );
        }
      });
  }
}
