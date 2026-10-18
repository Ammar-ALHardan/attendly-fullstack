import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Employee } from '../models/employee.model';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = '/api/employees';

  getEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>(this.apiUrl);
  }

  createEmployee(data: {
    employeeNumber: string;
    fullName: string;
    department: string;
  }): Observable<Employee> {
    return this.http.post<Employee>(this.apiUrl, data);
  }
}
