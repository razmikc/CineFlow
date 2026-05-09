import { Injectable } from '@angular/core';
import { CreativeContract } from '../models/contract.model';

@Injectable({ providedIn: 'root' })
export class ContractExportService {
  toJson(contract: CreativeContract): string {
    return JSON.stringify(contract, null, 2);
  }

  toYaml(contract: CreativeContract): string {
    return this.stringify(contract, 0);
  }

  private stringify(value: unknown, indent: number): string {
    const pad = '  '.repeat(indent);
    if (value === null || value === undefined) return 'null';
    if (Array.isArray(value)) {
      if (value.length === 0) return '[]';
      return value
        .map((item) => {
          if (this.isPrimitive(item)) {
            return `${pad}- ${this.formatPrimitive(item)}`;
          }
          const inner = this.stringify(item, indent + 1).replace(/^\s{2}/, '');
          return `${pad}- ${inner.trimStart()}`;
        })
        .join('\n');
    }
    if (typeof value === 'object') {
      const entries = Object.entries(value as Record<string, unknown>);
      if (entries.length === 0) return '{}';
      return entries
        .map(([k, v]) => {
          if (this.isPrimitive(v)) {
            return `${pad}${k}: ${this.formatPrimitive(v)}`;
          }
          if (Array.isArray(v) && v.length === 0) return `${pad}${k}: []`;
          if (typeof v === 'object' && v !== null && Object.keys(v).length === 0) {
            return `${pad}${k}: {}`;
          }
          return `${pad}${k}:\n${this.stringify(v, indent + 1)}`;
        })
        .join('\n');
    }
    return this.formatPrimitive(value);
  }

  private isPrimitive(v: unknown): boolean {
    return v === null || ['string', 'number', 'boolean'].includes(typeof v);
  }

  private formatPrimitive(v: unknown): string {
    if (typeof v === 'string') {
      if (v === '' || /[:#\-?{}\[\],&*!|>'"%@`]/.test(v) || /^\d/.test(v)) {
        return `"${v.replace(/"/g, '\\"')}"`;
      }
      return v;
    }
    if (v === null || v === undefined) return 'null';
    return String(v);
  }
}
