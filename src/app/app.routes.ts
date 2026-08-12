import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'products/all' },
  {
    path: 'products/:category',
    loadComponent: () => import('./store/store.component').then(m => m.StoreComponent)
  },
  { path: '**', redirectTo: 'products/all' }
];
