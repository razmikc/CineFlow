import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface ToolCard {
  path: string;
  title: string;
  tagline: string;
  description: string;
  accent: 'violet' | 'cyan' | 'amber';
  emoji: string;
}

@Component({
  selector: 'app-tools',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header style="margin-bottom: 1.4rem">
      <div class="eyebrow">Workshop</div>
      <h1 style="margin-top: 0.3rem">Tools</h1>
      <p class="muted" style="margin-top: 0.4rem; max-width: 56ch">
        Standalone utilities that improve any image you bring into CineFlow — from
        multi-angle reference shots to face refinement and consent-aware upload checks.
      </p>
    </header>

    <section class="tools-grid">
      @for (t of tools; track t.path) {
        <a class="tool-card card" [routerLink]="t.path" [attr.data-accent]="t.accent">
          <div class="tool-icon">{{ t.emoji }}</div>
          <div class="tool-body">
            <div class="eyebrow">{{ t.tagline }}</div>
            <h2 class="tool-title">{{ t.title }}</h2>
            <p class="tool-desc">{{ t.description }}</p>
          </div>
          <div class="tool-cta">
            Open
            <svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M7 5l5 5-5 5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </a>
      }
    </section>
  `,
  styles: [
    `
      :host { display: block; }
      .tools-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 1rem;
      }
      .tool-card {
        position: relative;
        display: flex;
        flex-direction: column;
        gap: 0.9rem;
        padding: 1.2rem;
        text-decoration: none;
        color: var(--text-1);
        overflow: hidden;
        cursor: pointer;
        transition: transform 0.18s, box-shadow 0.18s, border-color 0.18s;
        border: 1px solid var(--border);
      }
      .tool-card:hover {
        transform: translateY(-2px);
        border-color: var(--border-strong);
        box-shadow: var(--shadow-soft);
      }
      .tool-card::before {
        content: '';
        position: absolute;
        inset: -50% -30% auto auto;
        width: 220px;
        height: 220px;
        border-radius: 50%;
        pointer-events: none;
        opacity: 0.5;
        filter: blur(40px);
      }
      .tool-card[data-accent='violet']::before { background: rgba(139, 92, 246, 0.35); }
      .tool-card[data-accent='cyan']::before   { background: rgba(34, 211, 238, 0.28); }
      .tool-card[data-accent='amber']::before  { background: rgba(251, 191, 36, 0.28); }
      .tool-icon {
        font-size: 1.8rem;
        width: 44px;
        height: 44px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid var(--border);
      }
      .tool-title {
        font-size: 1.15rem;
        margin-top: 0.25rem;
      }
      .tool-desc {
        font-size: 0.86rem;
        color: var(--text-2);
        margin-top: 0.45rem;
        line-height: 1.45;
      }
      .tool-cta {
        display: inline-flex;
        align-items: center;
        gap: 0.3rem;
        font-size: 0.85rem;
        font-weight: 600;
        color: var(--neon-cyan);
        margin-top: auto;
      }
      .eyebrow {
        font-size: 0.66rem;
        text-transform: uppercase;
        letter-spacing: 0.16em;
        color: var(--text-mute);
        font-weight: 700;
      }
    `,
  ],
})
export class ToolsComponent {
  protected readonly tools: ToolCard[] = [
    {
      path: 'image-generation',
      title: 'Image generation',
      tagline: 'Text + reference → image',
      description:
        'Generate stills from a text prompt, reference images, or both. Pick the model, add references from your asset library or computer, render up to 4 variations.',
      accent: 'violet',
      emoji: '🖼️',
    },
    {
      path: 'camera-angles',
      title: 'Camera angle generator',
      tagline: 'Multi-view shots',
      description:
        'Upload one image and produce variations from up to 9 camera angles — front, 3/4, profiles, low/high, dutch — in a single batch.',
      accent: 'violet',
      emoji: '🎥',
    },
    {
      path: 'skin-enhancer',
      title: 'Skin & face enhancer',
      tagline: 'Face refinement',
      description:
        'Generate three refined face variants of any portrait. Side-by-side compare and pick the look you want to keep.',
      accent: 'cyan',
      emoji: '✨',
    },
    {
      path: 'image-editor',
      title: 'Image editor',
      tagline: 'Expand · Erase · Replace',
      description:
        'One canvas, three modes. Resize the frame and let AI fill it, erase an object cleanly, or replace it with a prompt or reference image — chain edits without re-uploading.',
      accent: 'cyan',
      emoji: '🛠️',
    },
    {
      path: 'audio-editor',
      title: 'Audio editor',
      tagline: 'Trim · Stretch · Loop',
      description:
        'Listen, trim, stretch or loop any audio file. Set fade in/out, normalize loudness, change speed — apply edits straight back into a scene layer or save to library.',
      accent: 'amber',
      emoji: '🎚',
    },
    {
      path: 'video-editor',
      title: 'Video editor',
      tagline: 'Multi-track · AI-aware',
      description:
        'CapCut-style timeline with video, audio, and SFX tracks. Drag, resize and snap clips — resizing past the source asks the AI to extend or shorten the video. Remove or replace objects with a prompt.',
      accent: 'violet',
      emoji: '🎞',
    },
    {
      path: 'eligibility',
      title: 'Image eligibility checker',
      tagline: 'Consent & rights',
      description:
        'Verify an image against third-party face, NSFW, watermark, and minor-detection checks before it enters your library.',
      accent: 'amber',
      emoji: '🛡️',
    },
  ];
}
