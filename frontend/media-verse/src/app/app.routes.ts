import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () =>
      import('./pages/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'discover',
    loadComponent: () =>
      import('./pages/discover/discover.component').then(
        (m) => m.DiscoverComponent
      ),
  },
  {
    path: 'library',
    loadComponent: () =>
      import('./pages/library/library.component').then(
        (m) => m.LibraryComponent
      ),
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./pages/profile/profile.component').then(
        (m) => m.ProfileComponent
      ),
  },
  {
    path: 'quests',
    loadComponent: () =>
      import('./pages/quests/quests.component').then((m) => m.QuestsComponent),
  },
  {
    path: 'about',
    loadComponent: () =>
      import('./pages/about/about.component').then((m) => m.AboutComponent),
  },
  {
    path: 'page-not-found',
    loadComponent: () =>
      import('./pages/page-not-found/page-not-found.component').then(
        (m) => m.PageNotFoundComponent
      ),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: '**',
    loadComponent: () =>
      import('./pages/page-not-found/page-not-found.component').then(
        (m) => m.PageNotFoundComponent
      ),
  },
];
