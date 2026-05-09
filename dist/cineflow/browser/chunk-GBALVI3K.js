import {
  MOCK_JOBS
} from "./chunk-5UP4TGNH.js";
import {
  Injectable,
  __spreadProps,
  __spreadValues,
  delay,
  of,
  setClassMetadata,
  signal,
  ɵɵdefineInjectable
} from "./chunk-YYMU35ZW.js";

// src/app/core/services/jobs.service.ts
var JobsService = class _JobsService {
  _jobs = signal(structuredClone(MOCK_JOBS), ...ngDevMode ? [{ debugName: "_jobs" }] : (
    /* istanbul ignore next */
    []
  ));
  jobs = this._jobs.asReadonly();
  list(projectId) {
    const list = projectId ? this._jobs().filter((j) => j.projectId === projectId) : this._jobs();
    return of(list).pipe(delay(120));
  }
  enqueue(input) {
    const newJob = __spreadProps(__spreadValues({}, input), {
      id: `job-${String(this._jobs().length + 1).padStart(3, "0")}`,
      status: "queued",
      progress: 0
    });
    this._jobs.update((list) => [newJob, ...list]);
    let progress = 0;
    const tick = setInterval(() => {
      progress = Math.min(100, progress + Math.random() * 18);
      this._jobs.update((list) => list.map((j) => j.id === newJob.id ? __spreadProps(__spreadValues({}, j), {
        progress,
        status: progress >= 100 ? "completed" : "running",
        completedAt: progress >= 100 ? (/* @__PURE__ */ new Date()).toISOString() : j.completedAt
      }) : j));
      if (progress >= 100)
        clearInterval(tick);
    }, 800);
    return of(newJob).pipe(delay(160));
  }
  static \u0275fac = function JobsService_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _JobsService)();
  };
  static \u0275prov = /* @__PURE__ */ \u0275\u0275defineInjectable({ token: _JobsService, factory: _JobsService.\u0275fac, providedIn: "root" });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(JobsService, [{
    type: Injectable,
    args: [{ providedIn: "root" }]
  }], null, null);
})();

export {
  JobsService
};
//# sourceMappingURL=chunk-GBALVI3K.js.map
