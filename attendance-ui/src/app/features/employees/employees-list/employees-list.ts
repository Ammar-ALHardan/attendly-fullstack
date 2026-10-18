
import {
  Component,
  OnInit,
  inject,
  signal,
  computed
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { Employee } from '../../../core/models/employee.model';
import { EmployeeService } from '../../../core/services/employee.service';
import { AddEmployee } from '../add-employee/add-employee';

@Component({
  selector: 'app-employees-list',
  standalone: true,
  imports: [RouterLink, AddEmployee],
  templateUrl: './employees-list.html'
})
export class EmployeesList implements OnInit {
  private readonly employeeService = inject(EmployeeService);
  readonly showAddDialog = signal(false);
  readonly employees = signal<Employee[]>([]);
  readonly searchTerm = signal('');
  readonly loading = signal(false);
  readonly error = signal('');

  readonly filteredEmployees = computed(() => {
    const search = this.searchTerm().trim().toLowerCase();

    return this.employees().filter(employee =>
      employee.fullName.toLowerCase().includes(search) ||
      employee.employeeNumber.toLowerCase().includes(search) ||
      employee.department.toLowerCase().includes(search)
    );
  });

  readonly totalEmployees = computed(() =>
    this.employees().length
  );

  readonly activeEmployees = computed(() =>
    this.employees().filter(employee => employee.isActive).length
  );

  ngOnInit(): void {
    this.loadEmployees();
  }

  loadEmployees(): void {
    this.loading.set(true);
    this.error.set('');

    this.employeeService.getEmployees().subscribe({
      next: employees => {
        this.employees.set(employees);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load employees.');
        this.loading.set(false);
      }
    });
  }


  onEmployeeCreated(): void {
    this.showAddDialog.set(false);
    this.loadEmployees();
  }

  onSearch(value: string): void {
    this.searchTerm.set(value);
  }
}
