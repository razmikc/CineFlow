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
        path: 'projects/:id/moodboard',
        loadComponent: () =>
          import('./features/moodboard/moodboard.component').then(
            (m) => m.MoodboardPageComponent,
          ),
      },
      {
        path: 'projects/:id/scenes/:sceneId',
        loadComponent: () =>
          import('./features/scene-workspace/scene-workspace.component').then(
            (m) => m.SceneWorkspaceComponent,
          ),
      },
      {
        path: 'projects/:id/final',
        loadComponent: () =>
          import('./features/final-video/final-video.component').then(
            (m) => m.FinalVideoComponent,
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
        path: 'characters',
        loadComponent: () =>
          import('./features/characters/characters.component').then(
            (m) => m.CharactersComponent,
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
      {
        path: 'videos',
        loadComponent: () =>
          import('./features/videos/videos.component').then((m) => m.VideosComponent),
      },
      {
        path: 'drafts',
        loadComponent: () =>
          import('./features/drafts/drafts.component').then((m) => m.DraftsComponent),
      },
      {
        path: 'tools',
        loadComponent: () =>
          import('./features/tools/tools.component').then((m) => m.ToolsComponent),
      },
      {
        path: 'one-shot',
        loadComponent: () =>
          import('./features/one-shot/one-shot.component').then((m) => m.OneShotComponent),
      },
      {
        path: 'one-shot/image',
        loadComponent: () =>
          import('./features/tools/image-generation/image-generation.component').then(
            (m) => m.ImageGenerationToolComponent,
          ),
      },
      {
        path: 'one-shot/video',
        loadComponent: () =>
          import('./features/one-shot/video-generation.component').then(
            (m) => m.OneShotVideoComponent,
          ),
      },
      // Legacy alias — old image-gen path now lives under One shot.
      { path: 'tools/image-generation', redirectTo: 'one-shot/image', pathMatch: 'full' },
      {
        path: 'tools/camera-angles',
        loadComponent: () =>
          import('./features/tools/camera-angles/camera-angles.component').then(
            (m) => m.CameraAnglesToolComponent,
          ),
      },
      {
        path: 'tools/skin-enhancer',
        loadComponent: () =>
          import('./features/tools/skin-enhancer/skin-enhancer.component').then(
            (m) => m.SkinEnhancerToolComponent,
          ),
      },
      {
        path: 'tools/image-editor',
        loadComponent: () =>
          import('./features/tools/image-editor/image-editor.component').then(
            (m) => m.ImageEditorToolComponent,
          ),
      },
      {
        path: 'tools/audio-editor',
        loadComponent: () =>
          import('./features/tools/audio-editor/audio-editor.component').then(
            (m) => m.AudioEditorToolComponent,
          ),
      },
      {
        path: 'tools/video-editor',
        loadComponent: () =>
          import('./features/tools/video-editor/video-editor.component').then(
            (m) => m.VideoEditorComponent,
          ),
      },
      // Legacy paths — redirect to the unified editor
      { path: 'tools/object-removal', redirectTo: 'tools/image-editor', pathMatch: 'full' },
      { path: 'tools/image-expand', redirectTo: 'tools/image-editor', pathMatch: 'full' },
      {
        path: 'tools/eligibility',
        loadComponent: () =>
          import('./features/tools/eligibility-checker/eligibility-checker.component').then(
            (m) => m.EligibilityCheckerComponent,
          ),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
