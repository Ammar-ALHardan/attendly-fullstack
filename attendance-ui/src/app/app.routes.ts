import { Routes } from '@angular/router';
import { MainLayout } from './layout/main-layout/main-layout';

export const routes: Routes = [
  {
    path: '',
    component: MainLayout,
    children: [
      {
        path: '',
        redirectTo: 'employees',
        pathMatch: 'full'
      },
      {
        path: 'employees',
        loadComponent: () =>
          import('./features/employees/employees-list/employees-list')
            .then(m => m.EmployeesList)
      },
      {
        path: 'timesheet',
        loadComponent: () =>
          import('./features/timesheet/employee-timesheet/employee-timesheet')
            .then(m => m.EmployeeTimesheet)
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'employees'
  }
];
