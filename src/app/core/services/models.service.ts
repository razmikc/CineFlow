import { Injectable, signal } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import { AiModel } from '../models/contract.model';
import { MOCK_AI_MODELS } from './mock-data';

@Injectable({ providedIn: 'root' })
export class ModelsService {
  private readonly _models = signal<AiModel[]>(structuredClone(MOCK_AI_MODELS));
  readonly models = this._models.asReadonly();

  list(): Observable<AiModel[]> {
    return of(this._models()).pipe(delay(120));
  }

  byCapability(capability: AiModel['capability']): AiModel[] {
    return this._models().filter((m) => m.capability === capability);
  }
}
