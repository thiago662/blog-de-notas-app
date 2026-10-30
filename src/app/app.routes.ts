import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./posts/post-list').then((m) => m.PostList) },
  { path: ':slug', loadComponent: () => import('./posts/post-page').then((m) => m.PostPage) },
  { path: '**', loadComponent: () => import('./not-found').then((m) => m.NotFound) },
];
