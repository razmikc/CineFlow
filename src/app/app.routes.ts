import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./shared/layout/shell.component').then((m) => m.ShellComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'projects/new',
        loadComponent: () =>
          import('./features/wizard/wizard.component').then((m) => m.WizardComponent),
      },
      {
        path: 'projects/:id',
        loadComponent: () =>
          import('./features/wizard/wizard.component').then((m) => m.WizardComponent),
      },
      {
        path: 'projects/:id/scenes/:sceneId',
        loadComponent: () =>
          import('./features/scene-workspace/scene-workspace.component').then(
            (m) => m.SceneWorkspaceComponent,
          ),
      },
      {
        path: 'assets',
        loadComponent: () =>
          import('./features/asset-library/asset-library.component').then(
            (m) => m.AssetLibraryComponent,
          ),
      },
      {
        path: 'models',
        loadComponent: () =>
          import('./features/models/models.component').then((m) => m.ModelsComponent),
      },
      {
        path: 'jobs',
        loadComponent: () =>
          import('./features/jobs/jobs.component').then((m) => m.JobsComponent),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
