import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'device/:id',
    loadComponent: () => import('./device-details/device-details.page').then(m => m.DeviceDetailsPage),
  },
  {
    path: '',
    loadChildren: () => import('./tabs/tabs.routes').then((m) => m.routes),
  },
];
