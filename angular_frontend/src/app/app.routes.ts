import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: 'login', loadComponent: () => Promise.resolve(LoginComponent) },
  { path: 'register', loadComponent: () => Promise.resolve(RegisterComponent) },
  { path: 'dashboard', canActivate: [authGuard], loadComponent: () => Promise.resolve(DashboardComponent) },
  { path: '**', redirectTo: 'dashboard' }
];
