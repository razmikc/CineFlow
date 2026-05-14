import { Injectable } from '@angular/core';
import { Observable, delay, of } from 'rxjs';

export type EligibilityVerdict = 'allowed' | 'warning' | 'blocked';

export type EligibilityRuleId =
  | 'third_party_face'
  | 'multiple_faces'
  | 'nsfw'
  | 'minor_detected'
  | 'watermark'
  | 'copyright_logo'
  | 'low_quality'
  | 'public_figure';

export interface EligibilityRuleResult {
  id: EligibilityRuleId;
  label: string;
  passed: boolean;
  severity: 'pass' | 'warn' | 'fail';
  detail: string;
}

export interface EligibilityResult {
  verdict: EligibilityVerdict;
  score: number;
  summary: string;
  rules: EligibilityRuleResult[];
  checkedAt: string;
  fileName?: string;
}

interface RuleSeed {
  id: EligibilityRuleId;
  label: string;
  description: string;
  failHint: string;
  warnHint: string;
}

const RULES: RuleSeed[] = [
  {
    id: 'third_party_face',
    label: 'No third-party faces',
    description: 'Detects whether the image contains a recognisable person who is not the consenting subject.',
    failHint: 'A face was detected that does not match the consenting subject on file.',
    warnHint: 'A face was detected but match confidence is low — manual consent confirmation recommended.',
  },
  {
    id: 'multiple_faces',
    label: 'Single primary subject',
    description: 'Flags images with several faces — group photos require explicit per-person consent.',
    failHint: 'More than two distinct faces detected.',
    warnHint: 'Two faces detected — confirm both subjects have signed releases.',
  },
  {
    id: 'nsfw',
    label: 'Safe content',
    description: 'Screens for nudity, sexual content, graphic violence, gore.',
    failHint: 'Explicit content classifier triggered.',
    warnHint: 'Borderline content — please review before publishing.',
  },
  {
    id: 'minor_detected',
    label: 'No minors',
    description: 'Detects if a likely minor appears in the frame.',
    failHint: 'Subject appears to be under 18 — uploads of minors require guardian consent.',
    warnHint: 'Age estimate is ambiguous — verify subject is an adult.',
  },
  {
    id: 'watermark',
    label: 'No watermark',
    description: 'Looks for stock photo watermarks or visible signatures.',
    failHint: 'A stock-photo watermark was detected — likely licensed content.',
    warnHint: 'Possible faint watermark detected.',
  },
  {
    id: 'copyright_logo',
    label: 'No copyrighted logos',
    description: 'Detects prominent trademarked logos or branded merchandise.',
    failHint: 'A trademarked logo is prominent in the image.',
    warnHint: 'A small logo was detected in the frame.',
  },
  {
    id: 'low_quality',
    label: 'Acceptable quality',
    description: 'Rejects very small / blurry / corrupted uploads.',
    failHint: 'Image resolution or sharpness is below the upload threshold.',
    warnHint: 'Image quality is borderline — consider re-uploading a sharper version.',
  },
  {
    id: 'public_figure',
    label: 'Not a public figure',
    description: 'Flags likely matches against celebrity / politician databases.',
    failHint: 'Subject matched a public-figure database — likeness rights apply.',
    warnHint: 'Possible public-figure match — verify likeness clearance.',
  },
];

const FAIL_SUMMARY = 'Upload blocked. Resolve the failing checks below before continuing.';
const WARN_SUMMARY = 'Upload allowed with warnings. Please review the flagged items.';
const PASS_SUMMARY = 'Image passed all eligibility checks.';

@Injectable({ providedIn: 'root' })
export class ImageEligibilityService {
  check(input: { fileName?: string; uri?: string; seed?: string }): Observable<EligibilityResult> {
    return of(this.evaluate(input)).pipe(delay(700));
  }

  private evaluate(input: { fileName?: string; uri?: string; seed?: string }): EligibilityResult {
    const seed = this.hash(input.seed ?? input.fileName ?? input.uri ?? String(Math.random()));
    const name = (input.fileName ?? '').toLowerCase();

    const rules: EligibilityRuleResult[] = RULES.map((rule, idx) => {
      const dice = ((seed >> (idx * 3)) & 0xff) / 255;
      let severity: 'pass' | 'warn' | 'fail' = 'pass';

      if (this.matchKeyword(name, rule.id)) {
        severity = 'fail';
      } else if (dice > 0.93) {
        severity = 'fail';
      } else if (dice > 0.82) {
        severity = 'warn';
      }

      const detail =
        severity === 'fail'
          ? rule.failHint
          : severity === 'warn'
            ? rule.warnHint
            : rule.description;

      return {
        id: rule.id,
        label: rule.label,
        severity,
        passed: severity !== 'fail',
        detail,
      };
    });

    const fails = rules.filter((r) => r.severity === 'fail').length;
    const warns = rules.filter((r) => r.severity === 'warn').length;
    const verdict: EligibilityVerdict = fails > 0 ? 'blocked' : warns > 0 ? 'warning' : 'allowed';
    const score = Math.max(0, 100 - fails * 35 - warns * 12);
    const summary = verdict === 'blocked' ? FAIL_SUMMARY : verdict === 'warning' ? WARN_SUMMARY : PASS_SUMMARY;

    return {
      verdict,
      score,
      summary,
      rules,
      checkedAt: new Date().toISOString(),
      fileName: input.fileName,
    };
  }

  private matchKeyword(name: string, ruleId: EligibilityRuleId): boolean {
    if (!name) return false;
    const map: Record<EligibilityRuleId, string[]> = {
      third_party_face: ['stranger', 'random', 'unknown', 'crowd'],
      multiple_faces: ['group', 'team', 'crowd'],
      nsfw: ['nsfw', 'nude', 'adult'],
      minor_detected: ['child', 'kid', 'minor', 'baby'],
      watermark: ['shutterstock', 'getty', 'stock', 'watermark'],
      copyright_logo: ['logo', 'nike', 'disney', 'marvel'],
      low_quality: ['tiny', 'blurry', 'low-res'],
      public_figure: ['celebrity', 'president', 'star'],
    };
    return map[ruleId].some((kw) => name.includes(kw));
  }

  private hash(s: string): number {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = (h * 16777619) >>> 0;
    }
    return h;
  }
}
