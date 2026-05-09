import {
  MOCK_PROJECTS
} from "./chunk-5UP4TGNH.js";
import {
  Injectable,
  __spreadProps,
  __spreadValues,
  computed,
  delay,
  of,
  setClassMetadata,
  signal,
  ɵɵdefineInjectable
} from "./chunk-YYMU35ZW.js";

// src/app/core/services/projects.service.ts
var ProjectsService = class _ProjectsService {
  _projects = signal(structuredClone(MOCK_PROJECTS), ...ngDevMode ? [{ debugName: "_projects" }] : (
    /* istanbul ignore next */
    []
  ));
  projects = this._projects.asReadonly();
  stats = computed(() => {
    const list = this._projects();
    return {
      total: list.length,
      inProgress: list.filter((p) => p.status === "in_progress").length,
      drafts: list.filter((p) => p.status === "draft").length,
      review: list.filter((p) => p.status === "review").length,
      completed: list.filter((p) => p.status === "completed").length,
      totalScenes: list.reduce((sum, p) => sum + p.scenes.length, 0)
    };
  }, ...ngDevMode ? [{ debugName: "stats" }] : (
    /* istanbul ignore next */
    []
  ));
  list() {
    return of(this._projects()).pipe(delay(180));
  }
  get(id) {
    return of(this._projects().find((p) => p.id === id)).pipe(delay(120));
  }
  create(input) {
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const newProject = {
      id: `video-${String(this._projects().length + 1).padStart(3, "0")}`,
      title: input.title,
      goal: input.goal,
      description: input.description,
      output: { aspectRatio: "16:9", resolution: "1080p", fps: 24, targetDurationSec: 60, language: "en" },
      orchestration: {
        mode: "scene_by_scene",
        approvalPolicy: "approve_each_scene",
        costPolicy: { estimateBeforeGenerate: true, maxCreditsPerScene: 100 },
        versioning: { keepSceneVersions: true, keepPromptVersions: true }
      },
      models: {
        script: { provider: "anthropic", model: "Claude Opus 4.7" },
        image: { provider: "midjourney", model: "Midjourney v7" },
        video: { provider: "google", model: "Veo 3" },
        voice: { provider: "elevenlabs", model: "Eleven Multilingual v3" },
        music: { provider: "suno", model: "Suno v5" }
      },
      creativeDirection: {
        genre: "",
        mood: [],
        styleReference: { source: "preset", value: "" },
        colorPalette: ["#0A3055", "#0097F6"],
        fonts: { title: "Inter", subtitle: "Inter" },
        negativeRules: [],
        realismLevel: 0.7
      },
      characters: [],
      scenes: [],
      status: "draft",
      createdAt: now,
      updatedAt: now
    };
    this._projects.update((list) => [newProject, ...list]);
    return of(newProject).pipe(delay(220));
  }
  update(id, patch) {
    let updated;
    this._projects.update((list) => list.map((p) => {
      if (p.id !== id)
        return p;
      updated = __spreadProps(__spreadValues(__spreadValues({}, p), patch), { updatedAt: (/* @__PURE__ */ new Date()).toISOString() });
      return updated;
    }));
    return of(updated).pipe(delay(120));
  }
  remove(id) {
    this._projects.update((list) => list.filter((p) => p.id !== id));
    return of(void 0).pipe(delay(120));
  }
  static \u0275fac = function ProjectsService_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _ProjectsService)();
  };
  static \u0275prov = /* @__PURE__ */ \u0275\u0275defineInjectable({ token: _ProjectsService, factory: _ProjectsService.\u0275fac, providedIn: "root" });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(ProjectsService, [{
    type: Injectable,
    args: [{ providedIn: "root" }]
  }], null, null);
})();

export {
  ProjectsService
};
//# sourceMappingURL=chunk-JI6S375N.js.map
