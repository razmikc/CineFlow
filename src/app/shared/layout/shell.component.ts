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
              <div class="brand-tag">AI Video Orchestration</div>
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
          <div class="row">
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
      ],
    },
    {
      title: 'Library',
      items: [
        { label: 'Characters', path: '/characters', icon: this.icon('user') },
        { label: 'Asset library', path: '/assets', icon: this.icon('image') },
        { label: 'AI models', path: '/models', icon: this.icon('chip'), badge: '13' },
        { label: 'Jobs', path: '/jobs', icon: this.icon('jobs') },
      ],
    },
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
    };
    return map[kind] ?? '';
  }
}
