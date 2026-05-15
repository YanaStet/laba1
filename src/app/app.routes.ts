import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./app').then((m) => m.App),
  },
  {
    path: 'courses-http',
    loadComponent: () =>
      import('./pages/courses-http.page').then((m) => m.CoursesHttpPage),
  },
];
