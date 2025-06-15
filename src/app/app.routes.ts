import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: '/application-table' },
  { path: 'welcome', loadChildren: () => import('./pages/welcome/welcome.routes').then(m => m.WELCOME_ROUTES) },
  { path: 'application-table', loadChildren: () => import('./pages/application-table/application-table.routes').then(m => m.APPLICATION_TABLE_ROUTES) }
];
