
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AttendanceRecord } from '../models/attendance.model';

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/attendance';

  getTimesheet(employeeId: number): Observable<AttendanceRecord[]> {
    return this.http.get<AttendanceRecord[]>(
      `${this.apiUrl}/employee/${employeeId}`
    );
  }

  checkIn(employeeId: number): Observable<unknown> {
    return this.http.post(
      `${this.apiUrl}/check-in`,
      { employeeId }
    );
  }

  checkOut(employeeId: number): Observable<unknown> {
    return this.http.post(
      `${this.apiUrl}/check-out`,
      { employeeId }
    );
  }
}
