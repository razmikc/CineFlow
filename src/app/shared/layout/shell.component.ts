import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ProjectsService } from '../../core/services/projects.service';

interface NavItem {
  label: string;
  path: string;
  icon: string;
  badge?: string;
}

@Component({
  selector: 'app-shell',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="shell">
      <aside class="sidebar" [class.collapsed]="collapsed()">
        <div class="brand">
          <div class="logo">
            <svg viewBox="0 0 32 32" width="22" height="22" aria-hidden="true">
              <defs>
                <linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stop-color="#8b5cf6"/>
                  <stop offset="50%" stop-color="#ec4899"/>
                  <stop offset="100%" stop-color="#22d3ee"/>
                </linearGradient>
              </defs>
              <rect width="32" height="32" rx="8" fill="url(#lg)" />
              <path d="M11 10 L23 16 L11 22 Z" fill="white"/>
            </svg>
          </div>
          @if (!collapsed()) {
            <div class="brand-text">
              <div class="brand-name">CineFlow</div>
              <div class="brand-tag">AI video orchestra</div>
            </div>
          }
        </div>

        <nav class="nav">
          @for (group of navGroups; track group.title) {
            @if (!collapsed()) { <div class="nav-group">{{ group.title }}</div> }
            @for (item of group.items; track item.path) {
              <a
                class="nav-item"
                [routerLink]="item.path"
                routerLinkActive="active"
                [routerLinkActiveOptions]="{ exact: item.path === '/dashboard' }"
                [title]="collapsed() ? item.label : null"
              >
                <span class="nav-icon" [innerHTML]="item.icon"></span>
                @if (!collapsed()) { <span class="nav-label">{{ item.label }}</span> }
                @if (!collapsed() && item.badge) { <span class="nav-badge">{{ item.badge }}</span> }
              </a>
            }
          }
        </nav>

        <div class="sidebar-footer">
          <button class="iconbtn collapse-btn" (click)="toggleCollapsed()" [title]="collapsed() ? 'Expand' : 'Collapse'">
            <svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
              <path [attr.d]="collapsed() ? 'M7 5l5 5-5 5' : 'M13 5l-5 5 5 5'" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          @if (!collapsed()) {
            <div class="usage card gradient">
              <div class="row">
                <div class="usage-pulse"></div>
                <div>
                  <div class="eyebrow">Credits</div>
                  <div class="usage-num">2,450</div>
                </div>
              </div>
              <div class="usage-bar"><div class="usage-fill" style="width: 62%"></div></div>
              <button class="btn primary sm" style="width:100%; margin-top:0.6rem">Upgrade plan</button>
            </div>
          }
        </div>
      </aside>

      <div class="main">
        <header class="topbar">
          <div class="search">
            <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="9" cy="9" r="6.5"/>
              <path d="m14 14 4 4" stroke-linecap="round"/>
            </svg>
            <input placeholder="Search projects, scenes, assets, models…"/>
            <span class="kbd">⌘K</span>
          </div>
          <div class="row section-row">
            @for (s of sectionShortcuts; track s.path) {
              <a
                class="iconbtn section-shortcut"
                [routerLink]="s.path"
                routerLinkActive="active"
                [title]="s.label"
              >
                <span class="nav-icon" [innerHTML]="s.icon"></span>
                <span class="section-label">{{ s.label }}</span>
              </a>
            }
          </div>
          <div class="row system-row">
            <button class="iconbtn" title="Notifications">
              <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 8a5 5 0 0 1 10 0v4l1.5 2.5h-13L5 12V8Z" stroke-linejoin="round"/>
                <path d="M8 16a2 2 0 0 0 4 0"/>
              </svg>
            </button>
            <button class="iconbtn" title="Settings">
              <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="10" cy="10" r="2.5"/>
                <path d="M10 1.5v3M10 15.5v3M1.5 10h3M15.5 10h3M3.8 3.8l2.1 2.1M14.1 14.1l2.1 2.1M3.8 16.2l2.1-2.1M14.1 5.9l2.1-2.1" stroke-linecap="round"/>
              </svg>
            </button>
            <div class="avatar" title="Razmik">RC</div>
          </div>
        </header>

        <main class="content">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
  styleUrl: './shell.component.scss',
})
export class ShellComponent {
  protected readonly collapsed = signal(false);

  protected readonly navGroups: { title: string; items: NavItem[] }[] = [
    {
      title: 'Workspace',
      items: [
        { label: 'Dashboard', path: '/dashboard', icon: this.icon('dashboard') },
        { label: 'New project', path: '/projects/new', icon: this.icon('add') },
        { label: 'Draft projects', path: '/drafts', icon: this.icon('draft') },
        { label: 'Complete projects', path: '/videos', icon: this.icon('video') },
      ],
    },
    {
      title: 'My library',
      items: [
        { label: 'Characters', path: '/characters', icon: this.icon('user') },
        { label: 'Assets', path: '/assets', icon: this.icon('image') },
        { label: 'AI models', path: '/models', icon: this.icon('chip'), badge: '13' },
      ],
    },
    {
      title: 'One shot',
      items: [
        { label: 'Image', path: '/one-shot/image', icon: this.icon('imagegen') },
        { label: 'Video', path: '/one-shot/video', icon: this.icon('video') },
        { label: 'Audio', path: '/one-shot/audio', icon: this.icon('audio') },
      ],
    },
    {
      title: 'Tools',
      items: [
        { label: 'Camera angles', path: '/tools/camera-angles', icon: this.icon('camera') },
        { label: 'Skin enhancer', path: '/tools/skin-enhancer', icon: this.icon('sparkle') },
        { label: 'Image editor', path: '/tools/image-editor', icon: this.icon('editor') },
        { label: 'Audio editor', path: '/tools/audio-editor', icon: this.icon('audio') },
        { label: 'Video editor', path: '/tools/video-editor', icon: this.icon('video') },
        { label: 'Video clone', path: '/tools/video-clone', icon: this.icon('clone') },
        { label: 'Eligibility check', path: '/tools/eligibility', icon: this.icon('shield') },
      ],
    },
  ];

  /** Section landing pages surfaced in the topbar as icon buttons. */
  protected readonly sectionShortcuts: NavItem[] = [
    { label: 'One shot', path: '/one-shot', icon: this.icon('oneshot') },
    { label: 'All tools', path: '/tools', icon: this.icon('tools') },
  ];

  constructor(public readonly projects: ProjectsService) {}

  toggleCollapsed() { this.collapsed.update((v) => !v); }

  private icon(kind: string): string {
    const map: Record<string, string> = {
      dashboard: `<svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="2.5" y="2.5" width="6" height="8" rx="1.5"/><rect x="2.5" y="12" width="6" height="5.5" rx="1.5"/><rect x="11.5" y="2.5" width="6" height="5.5" rx="1.5"/><rect x="11.5" y="9.5" width="6" height="8" rx="1.5"/></svg>`,
      add: `<svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="10" cy="10" r="7.5"/><path d="M10 6.5v7M6.5 10h7" stroke-linecap="round"/></svg>`,
      image: `<svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="2.5" y="3" width="15" height="14" rx="2.5"/><circle cx="7.5" cy="8" r="1.5"/><path d="m3 14 4-4 4 4 3-3 3 3"/></svg>`,
      chip: `<svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="5" y="5" width="10" height="10" rx="1.5"/><path d="M8 5V3M12 5V3M8 17v-2M12 17v-2M5 8H3M5 12H3M17 8h-2M17 12h-2"/></svg>`,
      jobs: `<svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M3.5 6.5h13M3.5 10h13M3.5 13.5h8" stroke-linecap="round"/><circle cx="14.5" cy="13.5" r="2.5"/></svg>`,
      user: `<svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="10" cy="7" r="3.2"/><path d="M3.5 17c.8-3.4 3.5-5 6.5-5s5.7 1.6 6.5 5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
      tools: `<svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M13.2 3.5a3.2 3.2 0 0 0-4.4 4.4l-5.1 5.1a1.5 1.5 0 0 0 2.1 2.1l5.1-5.1a3.2 3.2 0 0 0 4.4-4.4l-1.9 1.9-1.7-.4-.4-1.7 1.9-1.9Z" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
      camera: `<svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="2.5" y="6" width="15" height="10" rx="2"/><path d="M7 6V4.5h6V6" stroke-linecap="round"/><circle cx="10" cy="11" r="2.8"/></svg>`,
      sparkle: `<svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M10 3v3M10 14v3M3 10h3M14 10h3M5 5l2 2M13 13l2 2M5 15l2-2M13 7l2-2" stroke-linecap="round"/></svg>`,
      shield: `<svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M10 2.5 3.5 4.8v5.4c0 4 3 6.4 6.5 7.3 3.5-.9 6.5-3.3 6.5-7.3V4.8L10 2.5Z" stroke-linejoin="round"/><path d="m7.5 10 1.8 1.8L13 8" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
      imagegen: `<svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="2.5" y="3" width="15" height="14" rx="2.5"/><circle cx="7" cy="8" r="1.6"/><path d="m3 14 4-4 4 4 3-3 3 3"/><path d="M14.5 4.5v2M13.5 5.5h2" stroke-linecap="round"/></svg>`,
      eraser: `<svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7"><path d="m4 13 6-6 5 5-6 6H6l-2-2v-3z" stroke-linejoin="round"/><path d="M9 8l5 5" stroke-linecap="round"/></svg>`,
      expand: `<svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="6" y="6" width="8" height="8" rx="1"/><path d="M3 7V3h4M13 3h4v4M17 13v4h-4M7 17H3v-4" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
      editor: `<svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="2.5" y="3" width="15" height="14" rx="2.5"/><path d="M7 7l3 3-3 3M11 13h3" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
      audio: `<svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M3 8v4M7 5v10M11 7v6M15 4v12M19 9v2" stroke-linecap="round"/></svg>`,
      video: `<svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="2.5" y="5" width="11" height="10" rx="1.5"/><path d="M13.5 9l4-2v6l-4-2z" stroke-linejoin="round"/></svg>`,
      draft: `<svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M5 3h7l4 4v10a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" stroke-linejoin="round"/><path d="M12 3v4h4M8 12l2 2 3-4" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
      oneshot: `<svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M3 8 L10 2 L17 8 L17 17 L3 17 Z" stroke-linejoin="round"/><circle cx="10" cy="12" r="3"/><path d="M10 12 L13 9" stroke-linecap="round"/></svg>`,
      clone: `<svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="2.5" y="5" width="9" height="9" rx="1.5"/><rect x="8.5" y="6.5" width="9" height="9" rx="1.5"/></svg>`,
    };
    return map[kind] ?? '';
  }
}
