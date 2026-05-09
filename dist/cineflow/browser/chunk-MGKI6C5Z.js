import {
  ProjectsService
} from "./chunk-JI6S375N.js";
import {
  ActivatedRoute,
  Router,
  RouterLink
} from "./chunk-A2MSORV3.js";
import {
  AssetsService
} from "./chunk-QBFXNP4Z.js";
import {
  CheckboxControlValueAccessor,
  DefaultValueAccessor,
  FormsModule,
  NgControlStatus,
  NgModel
} from "./chunk-T3VEDOVQ.js";
import {
  JobsService
} from "./chunk-GBALVI3K.js";
import {
  MOCK_VERSIONS
} from "./chunk-5UP4TGNH.js";
import {
  ChangeDetectionStrategy,
  Component,
  DatePipe,
  DecimalPipe,
  Injectable,
  __spreadProps,
  __spreadValues,
  computed,
  delay,
  effect,
  inject,
  of,
  setClassMetadata,
  signal,
  ɵsetClassDebugInfo,
  ɵɵadvance,
  ɵɵclassMap,
  ɵɵclassProp,
  ɵɵconditional,
  ɵɵconditionalCreate,
  ɵɵdefineComponent,
  ɵɵdefineInjectable,
  ɵɵelement,
  ɵɵelementEnd,
  ɵɵelementStart,
  ɵɵgetCurrentView,
  ɵɵinject,
  ɵɵlistener,
  ɵɵnextContext,
  ɵɵpipe,
  ɵɵpipeBind2,
  ɵɵproperty,
  ɵɵpureFunction1,
  ɵɵpureFunction2,
  ɵɵrepeater,
  ɵɵrepeaterCreate,
  ɵɵresetView,
  ɵɵrestoreView,
  ɵɵsanitizeHtml,
  ɵɵstyleProp,
  ɵɵtext,
  ɵɵtextInterpolate,
  ɵɵtextInterpolate1,
  ɵɵtextInterpolate2
} from "./chunk-YYMU35ZW.js";

// src/app/core/services/scenes.service.ts
var ScenesService = class _ScenesService {
  projects;
  constructor(projects) {
    this.projects = projects;
  }
  list(projectId) {
    const project = this.projects.projects().find((p) => p.id === projectId);
    return of(project?.scenes ?? []).pipe(delay(120));
  }
  get(projectId, sceneId) {
    const project = this.projects.projects().find((p) => p.id === projectId);
    return of(project?.scenes.find((s) => s.id === sceneId)).pipe(delay(120));
  }
  versions(sceneId) {
    return of(MOCK_VERSIONS.filter((v) => v.sceneId === sceneId)).pipe(delay(120));
  }
  updateScene(projectId, scene) {
    const project = this.projects.projects().find((p) => p.id === projectId);
    if (project) {
      const updatedScenes = project.scenes.map((s) => s.id === scene.id ? scene : s);
      this.projects.update(projectId, { scenes: updatedScenes });
    }
    return of(scene).pipe(delay(80));
  }
  updateObject(projectId, sceneId, object) {
    const project = this.projects.projects().find((p) => p.id === projectId);
    if (!project)
      return of(void 0);
    const scenes = project.scenes.map((s) => {
      if (s.id !== sceneId)
        return s;
      return __spreadProps(__spreadValues({}, s), {
        objects: s.objects.map((o) => o.id === object.id ? object : o)
      });
    });
    this.projects.update(projectId, { scenes });
    return of(scenes.find((s) => s.id === sceneId)).pipe(delay(80));
  }
  removeObject(projectId, sceneId, objectId) {
    const project = this.projects.projects().find((p) => p.id === projectId);
    if (!project)
      return of(void 0);
    const scenes = project.scenes.map((s) => s.id === sceneId ? __spreadProps(__spreadValues({}, s), { objects: s.objects.filter((o) => o.id !== objectId) }) : s);
    this.projects.update(projectId, { scenes });
    return of(void 0).pipe(delay(60));
  }
  approve(projectId, sceneId) {
    const project = this.projects.projects().find((p) => p.id === projectId);
    if (!project)
      return of(void 0);
    const scenes = project.scenes.map((s) => s.id === sceneId ? __spreadProps(__spreadValues({}, s), { review: __spreadProps(__spreadValues({}, s.review), { status: "approved" }) }) : s);
    this.projects.update(projectId, { scenes });
    return of(scenes.find((s) => s.id === sceneId)).pipe(delay(120));
  }
  static \u0275fac = function ScenesService_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _ScenesService)(\u0275\u0275inject(ProjectsService));
  };
  static \u0275prov = /* @__PURE__ */ \u0275\u0275defineInjectable({ token: _ScenesService, factory: _ScenesService.\u0275fac, providedIn: "root" });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(ScenesService, [{
    type: Injectable,
    args: [{ providedIn: "root" }]
  }], () => [{ type: ProjectsService }], null);
})();

// src/app/features/scene-workspace/scene-workspace.component.ts
var _c0 = (a0) => ["/projects", a0];
var _c1 = (a0, a1) => ["/projects", a0, "scenes", a1];
var _forTrack0 = ($index, $item) => $item.id;
var _forTrack1 = ($index, $item) => $item.label;
function SceneWorkspaceComponent_Conditional_0_Conditional_0_For_24_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "a", 67)(1, "span", 68);
    \u0275\u0275text(2);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "span", 69);
    \u0275\u0275text(4);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const sc_r3 = ctx.$implicit;
    const p_r4 = \u0275\u0275nextContext();
    const s_r5 = \u0275\u0275nextContext();
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275classMap("tone-" + ctx_r1.sceneStatusTone(sc_r3.review.status));
    \u0275\u0275classProp("active", sc_r3.id === s_r5.id);
    \u0275\u0275property("routerLink", \u0275\u0275pureFunction2(7, _c1, p_r4.id, sc_r3.id));
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(sc_r3.index + 1);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(sc_r3.title);
  }
}
function SceneWorkspaceComponent_Conditional_0_Conditional_0_For_30_Template(rf, ctx) {
  if (rf & 1) {
    const _r6 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "button", 70);
    \u0275\u0275listener("click", function SceneWorkspaceComponent_Conditional_0_Conditional_0_For_30_Template_button_click_0_listener() {
      const o_r7 = \u0275\u0275restoreView(_r6).$implicit;
      const ctx_r1 = \u0275\u0275nextContext(3);
      return \u0275\u0275resetView(ctx_r1.selectObject(o_r7.id));
    });
    \u0275\u0275element(1, "span", 71);
    \u0275\u0275elementStart(2, "span", 72);
    \u0275\u0275text(3);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const o_r7 = ctx.$implicit;
    const ctx_r1 = \u0275\u0275nextContext(3);
    \u0275\u0275styleProp("left", o_r7.x, "%")("top", o_r7.y, "%");
    \u0275\u0275classProp("selected", ctx_r1.selectedObjectId() === o_r7.id);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(o_r7.name);
  }
}
function SceneWorkspaceComponent_Conditional_0_Conditional_0_For_72_Conditional_6_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 78);
    \u0275\u0275text(1, "\u{1F512}");
    \u0275\u0275elementEnd();
  }
}
function SceneWorkspaceComponent_Conditional_0_Conditional_0_For_72_Template(rf, ctx) {
  if (rf & 1) {
    const _r8 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "button", 73);
    \u0275\u0275listener("click", function SceneWorkspaceComponent_Conditional_0_Conditional_0_For_72_Template_button_click_0_listener() {
      const o_r9 = \u0275\u0275restoreView(_r8).$implicit;
      const ctx_r1 = \u0275\u0275nextContext(3);
      return \u0275\u0275resetView(ctx_r1.selectObject(o_r9.id));
    });
    \u0275\u0275element(1, "span", 74);
    \u0275\u0275elementStart(2, "div", 75)(3, "div", 76)(4, "strong", 77);
    \u0275\u0275text(5);
    \u0275\u0275elementEnd();
    \u0275\u0275conditionalCreate(6, SceneWorkspaceComponent_Conditional_0_Conditional_0_For_72_Conditional_6_Template, 2, 0, "span", 78);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(7, "div", 79);
    \u0275\u0275text(8);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(9, "span", 80);
    \u0275\u0275text(10, "\u25CF");
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const o_r9 = ctx.$implicit;
    const ctx_r1 = \u0275\u0275nextContext(3);
    \u0275\u0275classProp("selected", ctx_r1.selectedObjectId() === o_r9.id);
    \u0275\u0275advance();
    \u0275\u0275property("innerHTML", ctx_r1.iconFor(o_r9.type), \u0275\u0275sanitizeHtml);
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate(o_r9.name);
    \u0275\u0275advance();
    \u0275\u0275conditional(o_r9.locked ? 6 : -1);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(o_r9.type);
    \u0275\u0275advance();
    \u0275\u0275classMap(o_r9.status);
  }
}
function SceneWorkspaceComponent_Conditional_0_Conditional_0_Conditional_74_Conditional_14_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 86);
    \u0275\u0275element(1, "div", 92);
    \u0275\u0275elementStart(2, "div", 93)(3, "div", 94);
    \u0275\u0275text(4);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(5, "div", 56);
    \u0275\u0275text(6);
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    const a_r12 = ctx;
    \u0275\u0275advance();
    \u0275\u0275styleProp("background-image", "url(" + (a_r12.thumbnail || a_r12.uri) + ")");
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(a_r12.name);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate2("", a_r12.provider, " \xB7 ", a_r12.model);
  }
}
function SceneWorkspaceComponent_Conditional_0_Conditional_0_Conditional_74_Template(rf, ctx) {
  if (rf & 1) {
    const _r10 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 31)(1, "div", 32);
    \u0275\u0275text(2, "Inspector");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "span", 22);
    \u0275\u0275text(4);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(5, "label", 81);
    \u0275\u0275text(6, "Name");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(7, "input", 82);
    \u0275\u0275listener("ngModelChange", function SceneWorkspaceComponent_Conditional_0_Conditional_0_Conditional_74_Template_input_ngModelChange_7_listener($event) {
      const obj_r11 = \u0275\u0275restoreView(_r10);
      const ctx_r1 = \u0275\u0275nextContext(3);
      return \u0275\u0275resetView(ctx_r1.updateObject(obj_r11.id, { name: $event }));
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(8, "label", 83);
    \u0275\u0275text(9, "Description");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(10, "textarea", 84);
    \u0275\u0275listener("ngModelChange", function SceneWorkspaceComponent_Conditional_0_Conditional_0_Conditional_74_Template_textarea_ngModelChange_10_listener($event) {
      const obj_r11 = \u0275\u0275restoreView(_r10);
      const ctx_r1 = \u0275\u0275nextContext(3);
      return \u0275\u0275resetView(ctx_r1.updateObject(obj_r11.id, { description: $event }));
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(11, "label", 83);
    \u0275\u0275text(12, "Prompt");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(13, "textarea", 85);
    \u0275\u0275listener("ngModelChange", function SceneWorkspaceComponent_Conditional_0_Conditional_0_Conditional_74_Template_textarea_ngModelChange_13_listener($event) {
      const obj_r11 = \u0275\u0275restoreView(_r10);
      const ctx_r1 = \u0275\u0275nextContext(3);
      return \u0275\u0275resetView(ctx_r1.updateObject(obj_r11.id, { prompt: $event }));
    });
    \u0275\u0275elementEnd();
    \u0275\u0275conditionalCreate(14, SceneWorkspaceComponent_Conditional_0_Conditional_0_Conditional_74_Conditional_14_Template, 7, 5, "div", 86);
    \u0275\u0275elementStart(15, "div", 87)(16, "button", 88);
    \u0275\u0275listener("click", function SceneWorkspaceComponent_Conditional_0_Conditional_0_Conditional_74_Template_button_click_16_listener() {
      const obj_r11 = \u0275\u0275restoreView(_r10);
      const ctx_r1 = \u0275\u0275nextContext(3);
      return \u0275\u0275resetView(ctx_r1.regenerate(obj_r11));
    });
    \u0275\u0275elementStart(17, "span", 89);
    \u0275\u0275text(18, "\u21BB");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(19, "span");
    \u0275\u0275text(20, "Regenerate");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(21, "button", 90)(22, "span", 89);
    \u0275\u0275text(23, "\u{1FA84}");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(24, "span");
    \u0275\u0275text(25, "Ask AI to improve");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(26, "button", 90)(27, "span", 89);
    \u0275\u0275text(28, "\u{1F4C1}");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(29, "span");
    \u0275\u0275text(30, "Replace from assets");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(31, "button", 88);
    \u0275\u0275listener("click", function SceneWorkspaceComponent_Conditional_0_Conditional_0_Conditional_74_Template_button_click_31_listener() {
      const obj_r11 = \u0275\u0275restoreView(_r10);
      const ctx_r1 = \u0275\u0275nextContext(3);
      return \u0275\u0275resetView(ctx_r1.toggleLock(obj_r11));
    });
    \u0275\u0275elementStart(32, "span", 89);
    \u0275\u0275text(33);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(34, "span");
    \u0275\u0275text(35);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(36, "button", 90)(37, "span", 89);
    \u0275\u0275text(38, "\u{1F4CB}");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(39, "span");
    \u0275\u0275text(40, "Duplicate");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(41, "button", 91);
    \u0275\u0275listener("click", function SceneWorkspaceComponent_Conditional_0_Conditional_0_Conditional_74_Template_button_click_41_listener() {
      const obj_r11 = \u0275\u0275restoreView(_r10);
      const ctx_r1 = \u0275\u0275nextContext(3);
      return \u0275\u0275resetView(ctx_r1.removeObject(obj_r11.id));
    });
    \u0275\u0275elementStart(42, "span", 89);
    \u0275\u0275text(43, "\u{1F5D1}");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(44, "span");
    \u0275\u0275text(45, "Remove");
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    let tmp_10_0;
    const obj_r11 = ctx;
    const ctx_r1 = \u0275\u0275nextContext(3);
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate(obj_r11.type);
    \u0275\u0275advance(3);
    \u0275\u0275property("ngModel", obj_r11.name);
    \u0275\u0275advance(3);
    \u0275\u0275property("ngModel", obj_r11.description);
    \u0275\u0275advance(3);
    \u0275\u0275property("ngModel", obj_r11.prompt);
    \u0275\u0275advance();
    \u0275\u0275conditional((tmp_10_0 = ctx_r1.assetForObject(obj_r11)) ? 14 : -1, tmp_10_0);
    \u0275\u0275advance(19);
    \u0275\u0275textInterpolate(obj_r11.locked ? "\u{1F513}" : "\u{1F512}");
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(obj_r11.locked ? "Unlock" : "Lock");
  }
}
function SceneWorkspaceComponent_Conditional_0_Conditional_0_Conditional_75_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 42)(1, "div", 95);
    \u0275\u0275text(2, "\u{1F3AF}");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "div", 96);
    \u0275\u0275text(4, "Select an object");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(5, "p", 97);
    \u0275\u0275text(6, "Click any object on the preview or in the list to edit it.");
    \u0275\u0275elementEnd()();
  }
}
function SceneWorkspaceComponent_Conditional_0_Conditional_0_For_116_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 59);
    \u0275\u0275element(1, "div", 98);
    \u0275\u0275elementStart(2, "div", 99)(3, "div", 100)(4, "strong", 101);
    \u0275\u0275text(5);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(6, "span", 7);
    \u0275\u0275text(7);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(8, "div", 102);
    \u0275\u0275text(9);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(10, "div", 103)(11, "span", 104);
    \u0275\u0275text(12);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(13, "span", 105);
    \u0275\u0275text(14);
    \u0275\u0275pipe(15, "date");
    \u0275\u0275elementEnd()()()();
  }
  if (rf & 2) {
    const v_r13 = ctx.$implicit;
    const ctx_r1 = \u0275\u0275nextContext(3);
    \u0275\u0275advance();
    \u0275\u0275styleProp("background-image", "url(" + v_r13.thumbnailUri + ")");
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate1("v", v_r13.versionNumber);
    \u0275\u0275advance();
    \u0275\u0275classMap(ctx_r1.versionTone(v_r13.approvalStatus));
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(v_r13.approvalStatus);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(v_r13.userComment);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate1("", v_r13.cost, " cr");
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind2(15, 9, v_r13.createdAt, "short"));
  }
}
function SceneWorkspaceComponent_Conditional_0_Conditional_0_Conditional_117_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 60);
    \u0275\u0275text(1, "No versions yet \u2014 generate the scene to start a history.");
    \u0275\u0275elementEnd();
  }
}
function SceneWorkspaceComponent_Conditional_0_Conditional_0_For_123_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 63)(1, "div", 76)(2, "strong", 101);
    \u0275\u0275text(3);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "span", 106);
    \u0275\u0275text(5);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(6, "div", 107);
    \u0275\u0275element(7, "div", 108);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(8, "span", 29);
    \u0275\u0275text(9);
    \u0275\u0275pipe(10, "number");
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const j_r14 = ctx.$implicit;
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(j_r14.model);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(j_r14.objectId);
    \u0275\u0275advance(2);
    \u0275\u0275styleProp("width", j_r14.progress, "%");
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1("", \u0275\u0275pipeBind2(10, 5, j_r14.progress, "1.0-0"), "%");
  }
}
function SceneWorkspaceComponent_Conditional_0_Conditional_0_Conditional_124_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "p", 64);
    \u0275\u0275text(1, "No jobs running.");
    \u0275\u0275elementEnd();
  }
}
function SceneWorkspaceComponent_Conditional_0_Conditional_0_For_130_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 109);
    \u0275\u0275element(1, "span", 110);
    \u0275\u0275elementStart(2, "span");
    \u0275\u0275text(3);
    \u0275\u0275elementEnd();
    \u0275\u0275element(4, "span", 111);
    \u0275\u0275elementStart(5, "span", 29);
    \u0275\u0275text(6);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const q_r15 = ctx.$implicit;
    \u0275\u0275classMap(q_r15.tone);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(q_r15.label);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(q_r15.value);
  }
}
function SceneWorkspaceComponent_Conditional_0_Conditional_0_Template(rf, ctx) {
  if (rf & 1) {
    const _r1 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 1)(1, "header", 2)(2, "div")(3, "a", 3);
    \u0275\u0275text(4);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(5, "div", 4)(6, "span", 5);
    \u0275\u0275text(7);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(8, "input", 6);
    \u0275\u0275listener("ngModelChange", function SceneWorkspaceComponent_Conditional_0_Conditional_0_Template_input_ngModelChange_8_listener($event) {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.updateSceneField("title", $event));
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(9, "span", 7);
    \u0275\u0275text(10);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(11, "p", 8);
    \u0275\u0275text(12);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(13, "div", 9)(14, "button", 10);
    \u0275\u0275text(15, "\u26A1 Prepare scene");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(16, "button", 11);
    \u0275\u0275listener("click", function SceneWorkspaceComponent_Conditional_0_Conditional_0_Template_button_click_16_listener() {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.generateScene());
    });
    \u0275\u0275text(17, "\u25B6 Generate scene");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(18, "button", 12);
    \u0275\u0275listener("click", function SceneWorkspaceComponent_Conditional_0_Conditional_0_Template_button_click_18_listener() {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.approveScene());
    });
    \u0275\u0275text(19, "\u2713 Approve");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(20, "button", 13);
    \u0275\u0275listener("click", function SceneWorkspaceComponent_Conditional_0_Conditional_0_Template_button_click_20_listener() {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.goNext());
    });
    \u0275\u0275text(21, "Next scene \u2192");
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(22, "nav", 14);
    \u0275\u0275repeaterCreate(23, SceneWorkspaceComponent_Conditional_0_Conditional_0_For_24_Template, 5, 10, "a", 15, _forTrack0);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(25, "div", 16)(26, "section", 17)(27, "div", 18)(28, "div", 19);
    \u0275\u0275repeaterCreate(29, SceneWorkspaceComponent_Conditional_0_Conditional_0_For_30_Template, 4, 7, "button", 20, _forTrack0);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(31, "div", 21)(32, "span", 22);
    \u0275\u0275text(33);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(34, "span", 22);
    \u0275\u0275text(35);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(36, "span", 22);
    \u0275\u0275text(37);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(38, "span", 23);
    \u0275\u0275text(39);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(40, "span", 23);
    \u0275\u0275text(41);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(42, "div", 24)(43, "button", 25);
    \u0275\u0275text(44, "\u23EE");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(45, "button", 26);
    \u0275\u0275text(46, "\u25B6");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(47, "button", 25);
    \u0275\u0275text(48, "\u23ED");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(49, "div", 27);
    \u0275\u0275element(50, "div", 28);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(51, "span", 29);
    \u0275\u0275text(52);
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(53, "div", 30)(54, "div", 31)(55, "div", 32);
    \u0275\u0275text(56, "Compiled scene prompt");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(57, "div", 33)(58, "button", 34);
    \u0275\u0275text(59, "Edit raw");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(60, "button", 35);
    \u0275\u0275text(61, "\u21BB Regenerate prompt");
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(62, "div", 36);
    \u0275\u0275text(63);
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(64, "aside", 37)(65, "div", 31)(66, "div", 32);
    \u0275\u0275text(67);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(68, "button", 38);
    \u0275\u0275listener("click", function SceneWorkspaceComponent_Conditional_0_Conditional_0_Template_button_click_68_listener() {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.addObject());
    });
    \u0275\u0275text(69, "+ Add");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(70, "div", 39);
    \u0275\u0275repeaterCreate(71, SceneWorkspaceComponent_Conditional_0_Conditional_0_For_72_Template, 11, 8, "button", 40, _forTrack0);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(73, "aside", 41);
    \u0275\u0275conditionalCreate(74, SceneWorkspaceComponent_Conditional_0_Conditional_0_Conditional_74_Template, 46, 7)(75, SceneWorkspaceComponent_Conditional_0_Conditional_0_Conditional_75_Template, 7, 0, "div", 42);
    \u0275\u0275element(76, "div", 43);
    \u0275\u0275elementStart(77, "div", 44);
    \u0275\u0275text(78, "Cost estimate");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(79, "div", 45)(80, "div", 46);
    \u0275\u0275element(81, "div", 47)(82, "div", 48)(83, "div", 49);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(84, "div", 50)(85, "span", 51);
    \u0275\u0275text(86, "Estimated");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(87, "span", 52)(88, "strong");
    \u0275\u0275text(89);
    \u0275\u0275elementEnd();
    \u0275\u0275text(90, " credits");
    \u0275\u0275elementEnd()()();
    \u0275\u0275element(91, "div", 43);
    \u0275\u0275elementStart(92, "div", 44);
    \u0275\u0275text(93, "Continuity");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(94, "div", 53)(95, "input", 54);
    \u0275\u0275listener("ngModelChange", function SceneWorkspaceComponent_Conditional_0_Conditional_0_Template_input_ngModelChange_95_listener($event) {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.updateContinuity("usePreviousFinalFrame", $event));
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(96, "div")(97, "div", 55);
    \u0275\u0275text(98, "Use previous final frame");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(99, "div", 56);
    \u0275\u0275text(100, "Enforces visual continuity");
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(101, "div", 53)(102, "input", 54);
    \u0275\u0275listener("ngModelChange", function SceneWorkspaceComponent_Conditional_0_Conditional_0_Template_input_ngModelChange_102_listener($event) {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.updateContinuity("exportFinalFrameForNextScene", $event));
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(103, "div")(104, "div", 55);
    \u0275\u0275text(105, "Export final frame");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(106, "div", 56);
    \u0275\u0275text(107, "For next scene's input");
    \u0275\u0275elementEnd()()()()();
    \u0275\u0275elementStart(108, "section", 57)(109, "div", 31)(110, "div", 32);
    \u0275\u0275text(111, "Version history");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(112, "button", 10);
    \u0275\u0275text(113, "Compare");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(114, "div", 58);
    \u0275\u0275repeaterCreate(115, SceneWorkspaceComponent_Conditional_0_Conditional_0_For_116_Template, 16, 12, "div", 59, _forTrack0);
    \u0275\u0275conditionalCreate(117, SceneWorkspaceComponent_Conditional_0_Conditional_0_Conditional_117_Template, 2, 0, "div", 60);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(118, "section", 61)(119, "div", 62)(120, "div", 44);
    \u0275\u0275text(121, "Active jobs");
    \u0275\u0275elementEnd();
    \u0275\u0275repeaterCreate(122, SceneWorkspaceComponent_Conditional_0_Conditional_0_For_123_Template, 11, 8, "div", 63, _forTrack0);
    \u0275\u0275conditionalCreate(124, SceneWorkspaceComponent_Conditional_0_Conditional_0_Conditional_124_Template, 2, 0, "p", 64);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(125, "div", 62)(126, "div", 44);
    \u0275\u0275text(127, "Quality checks");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(128, "div", 65);
    \u0275\u0275repeaterCreate(129, SceneWorkspaceComponent_Conditional_0_Conditional_0_For_130_Template, 7, 4, "div", 66, _forTrack1);
    \u0275\u0275elementEnd()()()();
  }
  if (rf & 2) {
    let tmp_23_0;
    const p_r4 = ctx;
    const s_r5 = \u0275\u0275nextContext();
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance(3);
    \u0275\u0275property("routerLink", \u0275\u0275pureFunction1(24, _c0, p_r4.id));
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1("\u2190 Back to ", p_r4.title);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate1("Scene ", s_r5.index + 1);
    \u0275\u0275advance();
    \u0275\u0275property("ngModel", s_r5.title);
    \u0275\u0275advance();
    \u0275\u0275classMap(ctx_r1.statusTone(s_r5.review.status));
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(s_r5.review.status);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(s_r5.objective);
    \u0275\u0275advance(11);
    \u0275\u0275repeater(p_r4.scenes);
    \u0275\u0275advance(4);
    \u0275\u0275styleProp("background-image", "url(" + ctx_r1.previewImage() + ")");
    \u0275\u0275advance(2);
    \u0275\u0275repeater(ctx_r1.overlayObjects());
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate(p_r4.output.aspectRatio);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(p_r4.output.resolution);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1("", s_r5.durationSec, "s");
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(s_r5.camera.shotType);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(s_r5.camera.movement);
    \u0275\u0275advance(11);
    \u0275\u0275textInterpolate1("0:02 / 0:0", s_r5.durationSec);
    \u0275\u0275advance(11);
    \u0275\u0275textInterpolate(ctx_r1.compiledPrompt());
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate1("Objects (", s_r5.objects.length, ")");
    \u0275\u0275advance(4);
    \u0275\u0275repeater(s_r5.objects);
    \u0275\u0275advance(3);
    \u0275\u0275conditional((tmp_23_0 = ctx_r1.selectedObject()) ? 74 : 75, tmp_23_0);
    \u0275\u0275advance(15);
    \u0275\u0275textInterpolate(s_r5.costEstimate ?? 0);
    \u0275\u0275advance(6);
    \u0275\u0275property("ngModel", s_r5.continuity.usePreviousFinalFrame);
    \u0275\u0275advance(7);
    \u0275\u0275property("ngModel", s_r5.continuity.exportFinalFrameForNextScene);
    \u0275\u0275advance(13);
    \u0275\u0275repeater(ctx_r1.versions());
    \u0275\u0275advance(2);
    \u0275\u0275conditional(ctx_r1.versions().length === 0 ? 117 : -1);
    \u0275\u0275advance(5);
    \u0275\u0275repeater(ctx_r1.activeJobs());
    \u0275\u0275advance(2);
    \u0275\u0275conditional(ctx_r1.activeJobs().length === 0 ? 124 : -1);
    \u0275\u0275advance(5);
    \u0275\u0275repeater(ctx_r1.qualityChecks(s_r5));
  }
}
function SceneWorkspaceComponent_Conditional_0_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275conditionalCreate(0, SceneWorkspaceComponent_Conditional_0_Conditional_0_Template, 131, 26, "div", 1);
  }
  if (rf & 2) {
    let tmp_2_0;
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275conditional((tmp_2_0 = ctx_r1.project()) ? 0 : -1, tmp_2_0);
  }
}
function SceneWorkspaceComponent_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 0);
    \u0275\u0275element(1, "span", 112);
    \u0275\u0275elementStart(2, "span", 113);
    \u0275\u0275text(3, "Loading scene\u2026");
    \u0275\u0275elementEnd()();
  }
}
var SceneWorkspaceComponent = class _SceneWorkspaceComponent {
  route = inject(ActivatedRoute);
  router = inject(Router);
  scenesService = inject(ScenesService);
  projectsService = inject(ProjectsService);
  assets = inject(AssetsService);
  jobs = inject(JobsService);
  project = signal(void 0, ...ngDevMode ? [{ debugName: "project" }] : (
    /* istanbul ignore next */
    []
  ));
  scene = signal(void 0, ...ngDevMode ? [{ debugName: "scene" }] : (
    /* istanbul ignore next */
    []
  ));
  versions = signal([], ...ngDevMode ? [{ debugName: "versions" }] : (
    /* istanbul ignore next */
    []
  ));
  selectedObjectId = signal(null, ...ngDevMode ? [{ debugName: "selectedObjectId" }] : (
    /* istanbul ignore next */
    []
  ));
  selectedObject = computed(() => {
    const id = this.selectedObjectId();
    return this.scene()?.objects.find((o) => o.id === id);
  }, ...ngDevMode ? [{ debugName: "selectedObject" }] : (
    /* istanbul ignore next */
    []
  ));
  previewImage = computed(() => {
    const s = this.scene();
    if (!s)
      return "";
    if (s.thumbnailUrl)
      return s.thumbnailUrl;
    if (s.background.assetId) {
      const a = this.assets.get(s.background.assetId);
      if (a)
        return a.thumbnail || a.uri;
    }
    return "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200";
  }, ...ngDevMode ? [{ debugName: "previewImage" }] : (
    /* istanbul ignore next */
    []
  ));
  overlayObjects = computed(() => {
    const s = this.scene();
    if (!s)
      return [];
    return s.objects.map((o, i) => __spreadProps(__spreadValues({}, o), {
      x: 18 + i * 14 % 70,
      y: 28 + i * 18 % 50
    }));
  }, ...ngDevMode ? [{ debugName: "overlayObjects" }] : (
    /* istanbul ignore next */
    []
  ));
  compiledPrompt = computed(() => {
    const p = this.project();
    const s = this.scene();
    if (!p || !s)
      return "";
    return [
      `# Scene ${s.index + 1}: ${s.title}`,
      `Objective: ${s.objective}`,
      `Genre: ${p.creativeDirection.genre}; Mood: ${p.creativeDirection.mood.join(", ")}`,
      `Camera: ${s.camera.shotType}, ${s.camera.movement}, ${s.camera.lens}`,
      `Background: ${s.background.description}`,
      ...s.characters.map((c) => `Character ${c.ref}: ${c.emotion} \u2014 ${c.action}`),
      ...s.objects.filter((o) => o.prompt).map((o) => `${o.type}/${o.name}: ${o.prompt}`),
      `Audio: ${s.audio.backgroundMusic.genre}, tempo ${s.audio.backgroundMusic.tempo}; SFX: ${s.audio.soundEffects.join(", ")}`,
      `Subtitles: ${s.subtitles.enabled ? s.subtitles.style : "off"}`,
      `Negative: ${p.creativeDirection.negativeRules.join("; ")}`,
      `Duration: ${s.durationSec}s @ ${p.output.fps}fps, ${p.output.aspectRatio}`
    ].join("\n");
  }, ...ngDevMode ? [{ debugName: "compiledPrompt" }] : (
    /* istanbul ignore next */
    []
  ));
  activeJobs = computed(() => {
    const s = this.scene();
    if (!s)
      return [];
    return this.jobs.jobs().filter((j) => j.sceneId === s.id);
  }, ...ngDevMode ? [{ debugName: "activeJobs" }] : (
    /* istanbul ignore next */
    []
  ));
  constructor() {
    effect(() => {
      const projectId = this.route.snapshot.paramMap.get("id");
      const sceneId = this.route.snapshot.paramMap.get("sceneId");
      if (!projectId || !sceneId)
        return;
      this.projectsService.get(projectId).subscribe((p) => this.project.set(p));
      this.scenesService.get(projectId, sceneId).subscribe((s) => {
        this.scene.set(s);
        if (s && s.objects.length > 0)
          this.selectedObjectId.set(s.objects[0].id);
      });
      this.scenesService.versions(sceneId).subscribe((v) => this.versions.set(v));
    });
  }
  statusTone(s) {
    return { draft: "muted", prepared: "cyan", generating: "amber", completed: "green", approved: "green", failed: "rose", waiting_for_user: "amber" }[s] ?? "muted";
  }
  sceneStatusTone = this.statusTone;
  versionTone(s) {
    return { approved: "green", rejected: "rose", pending: "amber" }[s] ?? "muted";
  }
  iconFor(type) {
    const map = {
      character: "\u{1F464}",
      prop: "\u{1F4E6}",
      background: "\u{1F5BC}",
      effect: "\u2728",
      subtitle: "\u{1F170}",
      music: "\u{1F3B5}",
      sfx: "\u{1F50A}",
      voice: "\u{1F399}"
    };
    return `<span style="font-size: 1.05rem">${map[type] ?? "\u25C7"}</span>`;
  }
  qualityChecks(s) {
    return [
      { label: "Prompt completeness", value: s.objective ? "Pass" : "Missing objective", tone: s.objective ? "green" : "amber" },
      { label: "Character drift risk", value: s.characters.length === 0 ? "No chars" : "Locked", tone: "green" },
      { label: "Audio sync", value: s.audio.backgroundMusic.genre ? "Ready" : "Skipped", tone: "green" },
      { label: "Safety / IP", value: "No flags", tone: "green" },
      { label: "Duration", value: `${s.durationSec}s`, tone: "green" }
    ];
  }
  selectObject(id) {
    this.selectedObjectId.set(id);
  }
  toggleLock(o) {
    this.updateObject(o.id, { locked: !o.locked });
  }
  updateObject(id, patch) {
    const p = this.project();
    const s = this.scene();
    if (!p || !s)
      return;
    const updatedObj = __spreadValues(__spreadValues({}, s.objects.find((x) => x.id === id)), patch);
    const updatedScene = __spreadProps(__spreadValues({}, s), { objects: s.objects.map((o) => o.id === id ? updatedObj : o) });
    this.scene.set(updatedScene);
    this.scenesService.updateObject(p.id, s.id, updatedObj).subscribe();
  }
  removeObject(id) {
    const p = this.project();
    const s = this.scene();
    if (!p || !s)
      return;
    const updatedScene = __spreadProps(__spreadValues({}, s), { objects: s.objects.filter((o) => o.id !== id) });
    this.scene.set(updatedScene);
    this.scenesService.removeObject(p.id, s.id, id).subscribe();
    this.selectedObjectId.set(updatedScene.objects[0]?.id ?? null);
  }
  addObject() {
    const p = this.project();
    const s = this.scene();
    if (!p || !s)
      return;
    const newObj = {
      id: `obj-${Date.now()}`,
      type: "prop",
      name: "New object",
      prompt: "",
      status: "pending",
      locked: false
    };
    const updatedScene = __spreadProps(__spreadValues({}, s), { objects: [...s.objects, newObj] });
    this.scene.set(updatedScene);
    this.scenesService.updateScene(p.id, updatedScene).subscribe();
    this.selectedObjectId.set(newObj.id);
  }
  regenerate(o) {
    const p = this.project();
    const s = this.scene();
    if (!p || !s)
      return;
    this.updateObject(o.id, { status: "generating" });
    this.jobs.enqueue({
      projectId: p.id,
      sceneId: s.id,
      objectId: o.id,
      provider: p.models.image.provider,
      model: p.models.image.model,
      costEstimate: 0.4,
      outputAssetIds: []
    }).subscribe();
    setTimeout(() => this.updateObject(o.id, { status: "ready" }), 5e3);
  }
  updateSceneField(key, value) {
    const p = this.project();
    const s = this.scene();
    if (!p || !s)
      return;
    const updated = __spreadProps(__spreadValues({}, s), { [key]: value });
    this.scene.set(updated);
    this.scenesService.updateScene(p.id, updated).subscribe();
  }
  updateContinuity(key, value) {
    const s = this.scene();
    if (!s)
      return;
    this.updateSceneField("continuity", __spreadProps(__spreadValues({}, s.continuity), { [key]: value }));
  }
  generateScene() {
    const p = this.project();
    const s = this.scene();
    if (!p || !s)
      return;
    this.jobs.enqueue({
      projectId: p.id,
      sceneId: s.id,
      provider: p.models.video.provider,
      model: p.models.video.model,
      costEstimate: s.costEstimate ?? 30,
      outputAssetIds: []
    }).subscribe();
    this.updateSceneField("review", __spreadProps(__spreadValues({}, s.review), { status: "generating" }));
    setTimeout(() => {
      const cur = this.scene();
      if (cur)
        this.updateSceneField("review", __spreadProps(__spreadValues({}, cur.review), { status: "completed" }));
    }, 8e3);
  }
  approveScene() {
    const p = this.project();
    const s = this.scene();
    if (!p || !s)
      return;
    this.scenesService.approve(p.id, s.id).subscribe((approved) => {
      if (approved)
        this.scene.set(approved);
    });
  }
  goNext() {
    const p = this.project();
    const s = this.scene();
    if (!p || !s)
      return;
    const next = p.scenes.find((x) => x.index === s.index + 1);
    if (next)
      this.router.navigate(["/projects", p.id, "scenes", next.id]);
  }
  assetForObject(o) {
    return o.assetId ? this.assets.get(o.assetId) : void 0;
  }
  static \u0275fac = function SceneWorkspaceComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _SceneWorkspaceComponent)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _SceneWorkspaceComponent, selectors: [["app-scene-workspace"]], decls: 2, vars: 1, consts: [[1, "loading"], [1, "workspace"], [1, "ws-header"], [1, "back", 3, "routerLink"], [1, "row", 2, "gap", "0.55rem", "margin-top", "8px"], [1, "scene-num"], [1, "title-input", 3, "ngModelChange", "ngModel"], [1, "chip"], [1, "muted", 2, "margin-top", "6px", "font-size", "0.85rem"], [1, "row", 2, "flex-wrap", "wrap", "gap", "0.4rem"], [1, "btn", "ghost", "sm"], [1, "btn", "primary", "sm", 3, "click"], [1, "btn", "cool", "sm", 3, "click"], [1, "btn", "sm", 3, "click"], [1, "scene-pills"], [1, "pill", 3, "routerLink", "active", "class"], [1, "ws-grid"], [1, "preview", "card"], [1, "preview-stage"], [1, "overlay-grid"], [1, "overlay-pin", 3, "selected", "left", "top"], [1, "preview-meta"], [1, "chip", "muted"], [1, "chip", "cyan"], [1, "preview-controls"], [1, "iconbtn"], [1, "iconbtn", "play-btn"], [1, "timeline"], [1, "timeline-fill", 2, "width", "35%"], [1, "mono", 2, "font-size", "0.78rem"], [1, "prompt-panel"], [1, "row", 2, "justify-content", "space-between", "margin-bottom", "0.5rem"], [1, "section-title", 2, "margin", "0"], [1, "row", 2, "gap", "0.3rem"], [1, "btn", "sm"], [1, "btn", "primary", "sm"], [1, "prompt-text", "mono"], [1, "objects-panel", "card"], [1, "btn", "ghost", "sm", 3, "click"], [1, "objects-list"], [1, "object-row", 3, "selected"], [1, "inspector", "card"], [1, "empty-inspector"], [1, "divider"], [1, "section-title"], [1, "cost-bar"], [1, "cost-segments"], ["title", "Video", 1, "cost-seg", 2, "background", "var(--neon-violet)", "flex", "3"], ["title", "Image", 1, "cost-seg", 2, "background", "var(--neon-cyan)", "flex", "1"], ["title", "Audio", 1, "cost-seg", 2, "background", "var(--neon-green)", "flex", "1.2"], [1, "row", 2, "justify-content", "space-between", "margin-top", "0.4rem", "font-size", "0.76rem"], [1, "muted"], [1, "mono"], [1, "check-row"], ["type", "checkbox", 3, "ngModelChange", "ngModel"], [2, "font-weight", "600", "font-size", "0.86rem"], [1, "muted", 2, "font-size", "0.74rem"], [1, "versions", "card"], [1, "versions-grid"], [1, "version"], [1, "empty-version"], [1, "row", "jobs-row"], [1, "card", "flex-col", 2, "flex", "1"], [1, "job-row"], [1, "muted", 2, "font-size", "0.85rem"], [1, "quality-list"], [1, "quality", 3, "class"], [1, "pill", 3, "routerLink"], [1, "pill-num"], [1, "pill-text"], [1, "overlay-pin", 3, "click"], [1, "pin-dot"], [1, "pin-label"], [1, "object-row", 3, "click"], [1, "object-icon", 3, "innerHTML"], [2, "flex", "1", "min-width", "0", "text-align", "left"], [1, "row", 2, "gap", "0.4rem"], [2, "font-size", "0.86rem"], [1, "chip", "green", "sm-chip"], [1, "muted", 2, "font-size", "0.74rem", "margin-top", "2px"], [1, "status-chip"], [1, "field"], [3, "ngModelChange", "ngModel"], [1, "field", 2, "margin-top", "0.7rem"], ["rows", "2", 3, "ngModelChange", "ngModel"], ["rows", "3", 3, "ngModelChange", "ngModel"], [1, "row", 2, "margin-top", "0.7rem", "gap", "0.5rem"], [1, "action-grid"], [1, "action", 3, "click"], [1, "action-icon"], [1, "action"], [1, "action", "danger", 3, "click"], [1, "asset-thumb"], [2, "flex", "1", "min-width", "0"], [2, "font-size", "0.85rem", "font-weight", "600"], [2, "font-size", "1.6rem"], [2, "font-family", "var(--font-display)", "font-weight", "600"], [1, "muted", 2, "font-size", "0.82rem"], [1, "version-thumb"], [2, "padding", "0.55rem 0.7rem"], [1, "row", 2, "justify-content", "space-between"], [2, "font-size", "0.85rem"], [1, "muted", 2, "font-size", "0.76rem", "margin-top", "4px"], [1, "row", 2, "justify-content", "space-between", "margin-top", "6px"], [1, "mono", 2, "font-size", "0.7rem"], [1, "muted", 2, "font-size", "0.7rem"], [1, "muted", 2, "font-size", "0.78rem"], [1, "job-progress"], [1, "job-fill"], [1, "quality"], [1, "dot"], [1, "spacer"], [1, "loader"], [2, "margin-left", "0.6rem"]], template: function SceneWorkspaceComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275conditionalCreate(0, SceneWorkspaceComponent_Conditional_0_Template, 1, 1)(1, SceneWorkspaceComponent_Conditional_1_Template, 4, 0, "div", 0);
    }
    if (rf & 2) {
      let tmp_0_0;
      \u0275\u0275conditional((tmp_0_0 = ctx.scene()) ? 0 : 1, tmp_0_0);
    }
  }, dependencies: [FormsModule, DefaultValueAccessor, CheckboxControlValueAccessor, NgControlStatus, NgModel, RouterLink, DatePipe, DecimalPipe], styles: ['\n[_nghost-%COMP%] {\n  display: block;\n}\n.workspace[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 1.1rem;\n}\n.ws-header[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: flex-start;\n  justify-content: space-between;\n  gap: 1rem;\n  flex-wrap: wrap;\n}\n.back[_ngcontent-%COMP%] {\n  display: inline-flex;\n  font-size: 0.78rem;\n  color: var(--text-3);\n  text-decoration: none;\n}\n.back[_ngcontent-%COMP%]:hover {\n  color: var(--text-1);\n}\n.scene-num[_ngcontent-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  padding: 0.25rem 0.65rem;\n  border-radius: 999px;\n  background: var(--grad-primary);\n  color: white;\n  font-size: 0.72rem;\n  font-weight: 700;\n  letter-spacing: 0.04em;\n}\n.title-input[_ngcontent-%COMP%] {\n  font-family: var(--font-display);\n  font-size: 1.45rem;\n  font-weight: 600;\n  background: transparent;\n  border: 1px solid transparent;\n  padding: 0.2rem 0.5rem;\n  border-radius: 8px;\n  width: auto;\n  max-width: 500px;\n}\n.title-input[_ngcontent-%COMP%]:hover {\n  border-color: var(--border);\n}\n.title-input[_ngcontent-%COMP%]:focus {\n  border-color: var(--neon-violet);\n  background: rgba(10, 13, 35, 0.6);\n}\n.scene-pills[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 0.4rem;\n  overflow-x: auto;\n  padding: 0.4rem 0;\n}\n.pill[_ngcontent-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  gap: 0.45rem;\n  padding: 0.45rem 0.7rem;\n  border-radius: 999px;\n  background: rgba(255, 255, 255, 0.03);\n  border: 1px solid var(--border);\n  color: var(--text-2);\n  font-size: 0.82rem;\n  text-decoration: none;\n  flex-shrink: 0;\n}\n.pill[_ngcontent-%COMP%]:hover {\n  color: var(--text-1);\n}\n.pill.active[_ngcontent-%COMP%] {\n  background:\n    linear-gradient(\n      135deg,\n      rgba(139, 92, 246, 0.18),\n      rgba(34, 211, 238, 0.1));\n  border-color: rgba(139, 92, 246, 0.4);\n  color: var(--text-1);\n}\n.pill-num[_ngcontent-%COMP%] {\n  width: 18px;\n  height: 18px;\n  border-radius: 50%;\n  background: rgba(140, 160, 255, 0.15);\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  font-size: 0.7rem;\n  font-weight: 700;\n  font-family: var(--font-display);\n}\n.pill.active[_ngcontent-%COMP%]   .pill-num[_ngcontent-%COMP%] {\n  background: var(--grad-primary);\n  color: white;\n}\n.ws-grid[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: 1fr 280px 320px;\n  gap: 1rem;\n}\n@media (max-width: 1300px) {\n  .ws-grid[_ngcontent-%COMP%] {\n    grid-template-columns: 1fr 280px;\n  }\n  .inspector[_ngcontent-%COMP%] {\n    grid-column: 1/-1;\n  }\n}\n@media (max-width: 900px) {\n  .ws-grid[_ngcontent-%COMP%] {\n    grid-template-columns: 1fr;\n  }\n}\n.preview[_ngcontent-%COMP%] {\n  padding: 1rem;\n}\n.preview-stage[_ngcontent-%COMP%] {\n  position: relative;\n  aspect-ratio: 16/9;\n  border-radius: var(--r-md);\n  background-color: rgba(0, 0, 0, 0.5);\n  background-size: cover;\n  background-position: center;\n  overflow: hidden;\n  border: 1px solid var(--border);\n}\n.preview-stage[_ngcontent-%COMP%]::after {\n  content: "";\n  position: absolute;\n  inset: 0;\n  background:\n    linear-gradient(\n      180deg,\n      transparent 60%,\n      rgba(0, 0, 0, 0.65));\n  pointer-events: none;\n}\n.overlay-grid[_ngcontent-%COMP%] {\n  position: absolute;\n  inset: 0;\n}\n.overlay-pin[_ngcontent-%COMP%] {\n  position: absolute;\n  display: inline-flex;\n  align-items: center;\n  gap: 0.35rem;\n  padding: 0.3rem 0.55rem;\n  background: rgba(10, 12, 31, 0.7);\n  border: 1px solid rgba(255, 255, 255, 0.12);\n  border-radius: 999px;\n  color: white;\n  font-size: 0.72rem;\n  cursor: pointer;\n  -webkit-backdrop-filter: blur(8px);\n  backdrop-filter: blur(8px);\n  transition: all 0.18s;\n  transform: translate(-50%, -50%);\n}\n.overlay-pin[_ngcontent-%COMP%]:hover {\n  background: rgba(139, 92, 246, 0.35);\n  border-color: var(--neon-violet);\n}\n.overlay-pin.selected[_ngcontent-%COMP%] {\n  border-color: var(--neon-magenta);\n  box-shadow: 0 0 12px var(--neon-magenta);\n  background:\n    linear-gradient(\n      135deg,\n      rgba(139, 92, 246, 0.55),\n      rgba(236, 72, 153, 0.35));\n}\n.pin-dot[_ngcontent-%COMP%] {\n  width: 7px;\n  height: 7px;\n  border-radius: 50%;\n  background: var(--neon-cyan);\n  box-shadow: 0 0 8px var(--neon-cyan);\n}\n.preview-meta[_ngcontent-%COMP%] {\n  position: absolute;\n  top: 12px;\n  left: 12px;\n  display: flex;\n  gap: 0.3rem;\n  flex-wrap: wrap;\n  z-index: 2;\n}\n.preview-controls[_ngcontent-%COMP%] {\n  position: absolute;\n  bottom: 12px;\n  left: 12px;\n  right: 12px;\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n  z-index: 2;\n}\n.timeline[_ngcontent-%COMP%] {\n  flex: 1;\n  height: 4px;\n  border-radius: 99px;\n  background: rgba(255, 255, 255, 0.15);\n  overflow: hidden;\n}\n.timeline-fill[_ngcontent-%COMP%] {\n  height: 100%;\n  background: var(--grad-primary);\n}\n.play-btn[_ngcontent-%COMP%] {\n  background: var(--grad-primary);\n  color: white;\n  border: none;\n  width: 38px;\n  height: 38px;\n  font-size: 1rem;\n}\n.prompt-panel[_ngcontent-%COMP%] {\n  margin-top: 1rem;\n  padding: 0.85rem;\n  border: 1px solid var(--border);\n  border-radius: var(--r-md);\n  background: rgba(0, 0, 0, 0.3);\n}\n.prompt-text[_ngcontent-%COMP%] {\n  white-space: pre-wrap;\n  color: var(--text-2);\n  font-size: 0.78rem;\n  line-height: 1.55;\n  max-height: 220px;\n  overflow: auto;\n}\n.objects-panel[_ngcontent-%COMP%] {\n  padding: 0.95rem;\n  max-height: 560px;\n  overflow-y: auto;\n}\n.objects-list[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 0.3rem;\n}\n.object-row[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 0.55rem;\n  padding: 0.55rem 0.65rem;\n  border: 1px solid transparent;\n  border-radius: 10px;\n  background: rgba(255, 255, 255, 0.02);\n  cursor: pointer;\n  color: inherit;\n  transition: all 0.15s;\n  text-align: left;\n  width: 100%;\n}\n.object-row[_ngcontent-%COMP%]:hover {\n  background: rgba(139, 92, 246, 0.06);\n}\n.object-row.selected[_ngcontent-%COMP%] {\n  border-color: var(--neon-magenta);\n  background:\n    linear-gradient(\n      135deg,\n      rgba(236, 72, 153, 0.08),\n      rgba(139, 92, 246, 0.06));\n}\n.object-icon[_ngcontent-%COMP%] {\n  width: 30px;\n  height: 30px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  background: rgba(139, 92, 246, 0.12);\n  border-radius: 8px;\n  font-size: 0.95rem;\n  flex-shrink: 0;\n}\n.status-chip[_ngcontent-%COMP%] {\n  font-size: 0.85rem;\n  padding: 0;\n}\n.status-chip.ready[_ngcontent-%COMP%] {\n  color: var(--neon-green);\n}\n.status-chip.pending[_ngcontent-%COMP%] {\n  color: var(--text-mute);\n}\n.status-chip.generating[_ngcontent-%COMP%] {\n  color: var(--neon-amber);\n  animation: _ngcontent-%COMP%_pulse 1.4s ease-in-out infinite;\n}\n.status-chip.failed[_ngcontent-%COMP%] {\n  color: var(--neon-rose);\n}\n.status-chip.locked[_ngcontent-%COMP%] {\n  color: var(--neon-cyan);\n}\n@keyframes _ngcontent-%COMP%_pulse {\n  0%, 100% {\n    opacity: 1;\n  }\n  50% {\n    opacity: 0.4;\n  }\n}\n.sm-chip[_ngcontent-%COMP%] {\n  font-size: 0.62rem;\n  padding: 0.06rem 0.36rem;\n}\n.inspector[_ngcontent-%COMP%] {\n  padding: 0.95rem;\n}\n.field[_ngcontent-%COMP%] {\n  margin-top: 0;\n}\n.asset-thumb[_ngcontent-%COMP%] {\n  width: 56px;\n  height: 40px;\n  border-radius: 6px;\n  background-size: cover;\n  background-position: center;\n  background-color: rgba(140, 160, 255, 0.12);\n  flex-shrink: 0;\n}\n.action-grid[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: 1fr 1fr;\n  gap: 0.4rem;\n  margin-top: 0.85rem;\n}\n.action[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  gap: 0.25rem;\n  padding: 0.55rem 0.4rem;\n  border-radius: 10px;\n  border: 1px solid var(--border);\n  background: rgba(255, 255, 255, 0.02);\n  cursor: pointer;\n  font-size: 0.74rem;\n  color: var(--text-2);\n  transition: all 0.15s;\n}\n.action[_ngcontent-%COMP%]:hover {\n  color: var(--text-1);\n  background: rgba(139, 92, 246, 0.08);\n  border-color: var(--border-strong);\n}\n.action.danger[_ngcontent-%COMP%]:hover {\n  color: var(--neon-rose);\n  border-color: rgba(251, 113, 133, 0.4);\n  background: rgba(251, 113, 133, 0.06);\n}\n.action-icon[_ngcontent-%COMP%] {\n  font-size: 1.1rem;\n}\n.empty-inspector[_ngcontent-%COMP%] {\n  text-align: center;\n  padding: 1.4rem 0.6rem;\n  border: 1px dashed var(--border);\n  border-radius: 10px;\n  display: flex;\n  flex-direction: column;\n  gap: 0.4rem;\n  align-items: center;\n}\n.cost-bar[_ngcontent-%COMP%] {\n  padding: 0;\n}\n.cost-segments[_ngcontent-%COMP%] {\n  display: flex;\n  width: 100%;\n  height: 8px;\n  border-radius: 99px;\n  overflow: hidden;\n  gap: 2px;\n}\n.cost-seg[_ngcontent-%COMP%] {\n  height: 100%;\n}\n.check-row[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 0.5rem;\n  padding: 0.45rem 0;\n  align-items: flex-start;\n}\n.check-row[_ngcontent-%COMP%]   input[type=checkbox][_ngcontent-%COMP%] {\n  width: auto;\n  margin-top: 3px;\n}\n.versions[_ngcontent-%COMP%] {\n  padding: 1rem;\n}\n.versions-grid[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));\n  gap: 0.6rem;\n}\n.version[_ngcontent-%COMP%] {\n  border: 1px solid var(--border);\n  border-radius: 10px;\n  background: rgba(255, 255, 255, 0.02);\n  overflow: hidden;\n  transition: all 0.18s;\n}\n.version[_ngcontent-%COMP%]:hover {\n  border-color: var(--border-strong);\n  transform: translateY(-2px);\n}\n.version-thumb[_ngcontent-%COMP%] {\n  height: 86px;\n  background-size: cover;\n  background-position: center;\n  background-color: rgba(140, 160, 255, 0.1);\n}\n.empty-version[_ngcontent-%COMP%] {\n  padding: 1rem;\n  border: 1px dashed var(--border);\n  border-radius: 10px;\n  color: var(--text-3);\n  font-size: 0.85rem;\n  grid-column: 1/-1;\n}\n.jobs-row[_ngcontent-%COMP%] {\n  gap: 1rem;\n  align-items: stretch;\n  flex-wrap: wrap;\n}\n.flex-col[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 0.5rem;\n  padding: 1rem;\n}\n.job-row[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n  padding: 0.45rem 0;\n}\n.job-progress[_ngcontent-%COMP%] {\n  flex: 1;\n  height: 4px;\n  border-radius: 99px;\n  background: rgba(140, 160, 255, 0.1);\n  overflow: hidden;\n}\n.job-fill[_ngcontent-%COMP%] {\n  height: 100%;\n  background: var(--grad-primary);\n  transition: width 0.4s;\n}\n.quality-list[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 0.3rem;\n}\n.quality[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 0.5rem;\n  align-items: center;\n  padding: 0.5rem 0.65rem;\n  border-radius: 10px;\n  border: 1px solid var(--border);\n  font-size: 0.85rem;\n  color: var(--text-2);\n}\n.quality[_ngcontent-%COMP%]   .dot[_ngcontent-%COMP%] {\n  width: 7px;\n  height: 7px;\n  border-radius: 50%;\n  background: var(--text-mute);\n}\n.quality.green[_ngcontent-%COMP%] {\n  color: var(--neon-green);\n  border-color: rgba(52, 211, 153, 0.25);\n}\n.quality.green[_ngcontent-%COMP%]   .dot[_ngcontent-%COMP%] {\n  background: var(--neon-green);\n}\n.quality.amber[_ngcontent-%COMP%] {\n  color: var(--neon-amber);\n  border-color: rgba(251, 191, 36, 0.25);\n}\n.quality.amber[_ngcontent-%COMP%]   .dot[_ngcontent-%COMP%] {\n  background: var(--neon-amber);\n}\n.loading[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  height: 60vh;\n  color: var(--text-2);\n}\n/*# sourceMappingURL=scene-workspace.component.css.map */'], changeDetection: 0 });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(SceneWorkspaceComponent, [{
    type: Component,
    args: [{ selector: "app-scene-workspace", imports: [FormsModule, RouterLink, DatePipe, DecimalPipe], changeDetection: ChangeDetectionStrategy.OnPush, template: `
    @if (scene(); as s) {
      @if (project(); as p) {
        <div class="workspace">
          <header class="ws-header">
            <div>
              <a class="back" [routerLink]="['/projects', p.id]">\u2190 Back to {{ p.title }}</a>
              <div class="row" style="gap: 0.55rem; margin-top: 8px">
                <span class="scene-num">Scene {{ s.index + 1 }}</span>
                <input class="title-input" [ngModel]="s.title" (ngModelChange)="updateSceneField('title', $event)"/>
                <span class="chip" [class]="statusTone(s.review.status)">{{ s.review.status }}</span>
              </div>
              <p class="muted" style="margin-top: 6px; font-size: 0.85rem">{{ s.objective }}</p>
            </div>
            <div class="row" style="flex-wrap: wrap; gap: 0.4rem">
              <button class="btn ghost sm">\u26A1 Prepare scene</button>
              <button class="btn primary sm" (click)="generateScene()">\u25B6 Generate scene</button>
              <button class="btn cool sm" (click)="approveScene()">\u2713 Approve</button>
              <button class="btn sm" (click)="goNext()">Next scene \u2192</button>
            </div>
          </header>

          <nav class="scene-pills">
            @for (sc of p.scenes; track sc.id) {
              <a class="pill" [routerLink]="['/projects', p.id, 'scenes', sc.id]"
                [class.active]="sc.id === s.id" [class]="'tone-' + sceneStatusTone(sc.review.status)">
                <span class="pill-num">{{ sc.index + 1 }}</span>
                <span class="pill-text">{{ sc.title }}</span>
              </a>
            }
          </nav>

          <div class="ws-grid">
            <section class="preview card">
              <div class="preview-stage" [style.background-image]="'url(' + previewImage() + ')'">
                <div class="overlay-grid">
                  @for (o of overlayObjects(); track o.id) {
                    <button class="overlay-pin" [class.selected]="selectedObjectId() === o.id"
                      [style.left.%]="o.x" [style.top.%]="o.y"
                      (click)="selectObject(o.id)">
                      <span class="pin-dot"></span>
                      <span class="pin-label">{{ o.name }}</span>
                    </button>
                  }
                </div>
                <div class="preview-meta">
                  <span class="chip muted">{{ p.output.aspectRatio }}</span>
                  <span class="chip muted">{{ p.output.resolution }}</span>
                  <span class="chip muted">{{ s.durationSec }}s</span>
                  <span class="chip cyan">{{ s.camera.shotType }}</span>
                  <span class="chip cyan">{{ s.camera.movement }}</span>
                </div>
                <div class="preview-controls">
                  <button class="iconbtn">\u23EE</button>
                  <button class="iconbtn play-btn">\u25B6</button>
                  <button class="iconbtn">\u23ED</button>
                  <div class="timeline">
                    <div class="timeline-fill" style="width: 35%"></div>
                  </div>
                  <span class="mono" style="font-size: 0.78rem">0:02 / 0:0{{ s.durationSec }}</span>
                </div>
              </div>

              <div class="prompt-panel">
                <div class="row" style="justify-content: space-between; margin-bottom: 0.5rem">
                  <div class="section-title" style="margin: 0">Compiled scene prompt</div>
                  <div class="row" style="gap: 0.3rem">
                    <button class="btn sm">Edit raw</button>
                    <button class="btn primary sm">\u21BB Regenerate prompt</button>
                  </div>
                </div>
                <div class="prompt-text mono">{{ compiledPrompt() }}</div>
              </div>
            </section>

            <aside class="objects-panel card">
              <div class="row" style="justify-content: space-between; margin-bottom: 0.5rem">
                <div class="section-title" style="margin: 0">Objects ({{ s.objects.length }})</div>
                <button class="btn ghost sm" (click)="addObject()">+ Add</button>
              </div>
              <div class="objects-list">
                @for (o of s.objects; track o.id) {
                  <button class="object-row" [class.selected]="selectedObjectId() === o.id"
                    (click)="selectObject(o.id)">
                    <span class="object-icon" [innerHTML]="iconFor(o.type)"></span>
                    <div style="flex: 1; min-width: 0; text-align: left">
                      <div class="row" style="gap: 0.4rem">
                        <strong style="font-size: 0.86rem">{{ o.name }}</strong>
                        @if (o.locked) { <span class="chip green sm-chip">\u{1F512}</span> }
                      </div>
                      <div class="muted" style="font-size: 0.74rem; margin-top: 2px">{{ o.type }}</div>
                    </div>
                    <span class="status-chip" [class]="o.status">\u25CF</span>
                  </button>
                }
              </div>
            </aside>

            <aside class="inspector card">
              @if (selectedObject(); as obj) {
                <div class="row" style="justify-content: space-between; margin-bottom: 0.5rem">
                  <div class="section-title" style="margin: 0">Inspector</div>
                  <span class="chip muted">{{ obj.type }}</span>
                </div>
                <label class="field">Name</label>
                <input [ngModel]="obj.name" (ngModelChange)="updateObject(obj.id, { name: $event })"/>

                <label class="field" style="margin-top: 0.7rem">Description</label>
                <textarea rows="2" [ngModel]="obj.description" (ngModelChange)="updateObject(obj.id, { description: $event })"></textarea>

                <label class="field" style="margin-top: 0.7rem">Prompt</label>
                <textarea rows="3" [ngModel]="obj.prompt" (ngModelChange)="updateObject(obj.id, { prompt: $event })"></textarea>

                @if (assetForObject(obj); as a) {
                  <div class="row" style="margin-top: 0.7rem; gap: 0.5rem">
                    <div class="asset-thumb" [style.background-image]="'url(' + (a.thumbnail || a.uri) + ')'"></div>
                    <div style="flex: 1; min-width: 0">
                      <div style="font-size: 0.85rem; font-weight: 600">{{ a.name }}</div>
                      <div class="muted" style="font-size: 0.74rem">{{ a.provider }} \xB7 {{ a.model }}</div>
                    </div>
                  </div>
                }

                <div class="action-grid">
                  <button class="action" (click)="regenerate(obj)">
                    <span class="action-icon">\u21BB</span><span>Regenerate</span>
                  </button>
                  <button class="action">
                    <span class="action-icon">\u{1FA84}</span><span>Ask AI to improve</span>
                  </button>
                  <button class="action">
                    <span class="action-icon">\u{1F4C1}</span><span>Replace from assets</span>
                  </button>
                  <button class="action" (click)="toggleLock(obj)">
                    <span class="action-icon">{{ obj.locked ? '\u{1F513}' : '\u{1F512}' }}</span>
                    <span>{{ obj.locked ? 'Unlock' : 'Lock' }}</span>
                  </button>
                  <button class="action">
                    <span class="action-icon">\u{1F4CB}</span><span>Duplicate</span>
                  </button>
                  <button class="action danger" (click)="removeObject(obj.id)">
                    <span class="action-icon">\u{1F5D1}</span><span>Remove</span>
                  </button>
                </div>
              } @else {
                <div class="empty-inspector">
                  <div style="font-size: 1.6rem">\u{1F3AF}</div>
                  <div style="font-family: var(--font-display); font-weight: 600">Select an object</div>
                  <p class="muted" style="font-size: 0.82rem">Click any object on the preview or in the list to edit it.</p>
                </div>
              }

              <div class="divider"></div>

              <div class="section-title">Cost estimate</div>
              <div class="cost-bar">
                <div class="cost-segments">
                  <div class="cost-seg" style="background: var(--neon-violet); flex: 3" title="Video"></div>
                  <div class="cost-seg" style="background: var(--neon-cyan); flex: 1" title="Image"></div>
                  <div class="cost-seg" style="background: var(--neon-green); flex: 1.2" title="Audio"></div>
                </div>
                <div class="row" style="justify-content: space-between; margin-top: 0.4rem; font-size: 0.76rem">
                  <span class="muted">Estimated</span>
                  <span class="mono"><strong>{{ s.costEstimate ?? 0 }}</strong> credits</span>
                </div>
              </div>

              <div class="divider"></div>
              <div class="section-title">Continuity</div>
              <div class="check-row">
                <input type="checkbox" [ngModel]="s.continuity.usePreviousFinalFrame" (ngModelChange)="updateContinuity('usePreviousFinalFrame', $event)"/>
                <div>
                  <div style="font-weight: 600; font-size: 0.86rem">Use previous final frame</div>
                  <div class="muted" style="font-size: 0.74rem">Enforces visual continuity</div>
                </div>
              </div>
              <div class="check-row">
                <input type="checkbox" [ngModel]="s.continuity.exportFinalFrameForNextScene" (ngModelChange)="updateContinuity('exportFinalFrameForNextScene', $event)"/>
                <div>
                  <div style="font-weight: 600; font-size: 0.86rem">Export final frame</div>
                  <div class="muted" style="font-size: 0.74rem">For next scene's input</div>
                </div>
              </div>
            </aside>
          </div>

          <section class="versions card">
            <div class="row" style="justify-content: space-between; margin-bottom: 0.5rem">
              <div class="section-title" style="margin: 0">Version history</div>
              <button class="btn ghost sm">Compare</button>
            </div>
            <div class="versions-grid">
              @for (v of versions(); track v.id) {
                <div class="version">
                  <div class="version-thumb" [style.background-image]="'url(' + v.thumbnailUri + ')'"></div>
                  <div style="padding: 0.55rem 0.7rem">
                    <div class="row" style="justify-content: space-between">
                      <strong style="font-size: 0.85rem">v{{ v.versionNumber }}</strong>
                      <span class="chip" [class]="versionTone(v.approvalStatus)">{{ v.approvalStatus }}</span>
                    </div>
                    <div class="muted" style="font-size: 0.76rem; margin-top: 4px">{{ v.userComment }}</div>
                    <div class="row" style="justify-content: space-between; margin-top: 6px">
                      <span class="mono" style="font-size: 0.7rem">{{ v.cost }} cr</span>
                      <span class="muted" style="font-size: 0.7rem">{{ v.createdAt | date: 'short' }}</span>
                    </div>
                  </div>
                </div>
              }
              @if (versions().length === 0) {
                <div class="empty-version">No versions yet \u2014 generate the scene to start a history.</div>
              }
            </div>
          </section>

          <section class="row jobs-row">
            <div class="card flex-col" style="flex: 1">
              <div class="section-title">Active jobs</div>
              @for (j of activeJobs(); track j.id) {
                <div class="job-row">
                  <div class="row" style="gap: 0.4rem">
                    <strong style="font-size: 0.85rem">{{ j.model }}</strong>
                    <span class="muted" style="font-size: 0.78rem">{{ j.objectId }}</span>
                  </div>
                  <div class="job-progress"><div class="job-fill" [style.width.%]="j.progress"></div></div>
                  <span class="mono" style="font-size: 0.78rem">{{ j.progress | number: '1.0-0' }}%</span>
                </div>
              }
              @if (activeJobs().length === 0) {
                <p class="muted" style="font-size: 0.85rem">No jobs running.</p>
              }
            </div>
            <div class="card flex-col" style="flex: 1">
              <div class="section-title">Quality checks</div>
              <div class="quality-list">
                @for (q of qualityChecks(s); track q.label) {
                  <div class="quality" [class]="q.tone">
                    <span class="dot"></span>
                    <span>{{ q.label }}</span>
                    <span class="spacer"></span>
                    <span class="mono" style="font-size: 0.78rem">{{ q.value }}</span>
                  </div>
                }
              </div>
            </div>
          </section>
        </div>
      }
    } @else {
      <div class="loading">
        <span class="loader"></span>
        <span style="margin-left: 0.6rem">Loading scene\u2026</span>
      </div>
    }
  `, styles: ['/* src/app/features/scene-workspace/scene-workspace.component.scss */\n:host {\n  display: block;\n}\n.workspace {\n  display: flex;\n  flex-direction: column;\n  gap: 1.1rem;\n}\n.ws-header {\n  display: flex;\n  align-items: flex-start;\n  justify-content: space-between;\n  gap: 1rem;\n  flex-wrap: wrap;\n}\n.back {\n  display: inline-flex;\n  font-size: 0.78rem;\n  color: var(--text-3);\n  text-decoration: none;\n}\n.back:hover {\n  color: var(--text-1);\n}\n.scene-num {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  padding: 0.25rem 0.65rem;\n  border-radius: 999px;\n  background: var(--grad-primary);\n  color: white;\n  font-size: 0.72rem;\n  font-weight: 700;\n  letter-spacing: 0.04em;\n}\n.title-input {\n  font-family: var(--font-display);\n  font-size: 1.45rem;\n  font-weight: 600;\n  background: transparent;\n  border: 1px solid transparent;\n  padding: 0.2rem 0.5rem;\n  border-radius: 8px;\n  width: auto;\n  max-width: 500px;\n}\n.title-input:hover {\n  border-color: var(--border);\n}\n.title-input:focus {\n  border-color: var(--neon-violet);\n  background: rgba(10, 13, 35, 0.6);\n}\n.scene-pills {\n  display: flex;\n  gap: 0.4rem;\n  overflow-x: auto;\n  padding: 0.4rem 0;\n}\n.pill {\n  display: inline-flex;\n  align-items: center;\n  gap: 0.45rem;\n  padding: 0.45rem 0.7rem;\n  border-radius: 999px;\n  background: rgba(255, 255, 255, 0.03);\n  border: 1px solid var(--border);\n  color: var(--text-2);\n  font-size: 0.82rem;\n  text-decoration: none;\n  flex-shrink: 0;\n}\n.pill:hover {\n  color: var(--text-1);\n}\n.pill.active {\n  background:\n    linear-gradient(\n      135deg,\n      rgba(139, 92, 246, 0.18),\n      rgba(34, 211, 238, 0.1));\n  border-color: rgba(139, 92, 246, 0.4);\n  color: var(--text-1);\n}\n.pill-num {\n  width: 18px;\n  height: 18px;\n  border-radius: 50%;\n  background: rgba(140, 160, 255, 0.15);\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  font-size: 0.7rem;\n  font-weight: 700;\n  font-family: var(--font-display);\n}\n.pill.active .pill-num {\n  background: var(--grad-primary);\n  color: white;\n}\n.ws-grid {\n  display: grid;\n  grid-template-columns: 1fr 280px 320px;\n  gap: 1rem;\n}\n@media (max-width: 1300px) {\n  .ws-grid {\n    grid-template-columns: 1fr 280px;\n  }\n  .inspector {\n    grid-column: 1/-1;\n  }\n}\n@media (max-width: 900px) {\n  .ws-grid {\n    grid-template-columns: 1fr;\n  }\n}\n.preview {\n  padding: 1rem;\n}\n.preview-stage {\n  position: relative;\n  aspect-ratio: 16/9;\n  border-radius: var(--r-md);\n  background-color: rgba(0, 0, 0, 0.5);\n  background-size: cover;\n  background-position: center;\n  overflow: hidden;\n  border: 1px solid var(--border);\n}\n.preview-stage::after {\n  content: "";\n  position: absolute;\n  inset: 0;\n  background:\n    linear-gradient(\n      180deg,\n      transparent 60%,\n      rgba(0, 0, 0, 0.65));\n  pointer-events: none;\n}\n.overlay-grid {\n  position: absolute;\n  inset: 0;\n}\n.overlay-pin {\n  position: absolute;\n  display: inline-flex;\n  align-items: center;\n  gap: 0.35rem;\n  padding: 0.3rem 0.55rem;\n  background: rgba(10, 12, 31, 0.7);\n  border: 1px solid rgba(255, 255, 255, 0.12);\n  border-radius: 999px;\n  color: white;\n  font-size: 0.72rem;\n  cursor: pointer;\n  -webkit-backdrop-filter: blur(8px);\n  backdrop-filter: blur(8px);\n  transition: all 0.18s;\n  transform: translate(-50%, -50%);\n}\n.overlay-pin:hover {\n  background: rgba(139, 92, 246, 0.35);\n  border-color: var(--neon-violet);\n}\n.overlay-pin.selected {\n  border-color: var(--neon-magenta);\n  box-shadow: 0 0 12px var(--neon-magenta);\n  background:\n    linear-gradient(\n      135deg,\n      rgba(139, 92, 246, 0.55),\n      rgba(236, 72, 153, 0.35));\n}\n.pin-dot {\n  width: 7px;\n  height: 7px;\n  border-radius: 50%;\n  background: var(--neon-cyan);\n  box-shadow: 0 0 8px var(--neon-cyan);\n}\n.preview-meta {\n  position: absolute;\n  top: 12px;\n  left: 12px;\n  display: flex;\n  gap: 0.3rem;\n  flex-wrap: wrap;\n  z-index: 2;\n}\n.preview-controls {\n  position: absolute;\n  bottom: 12px;\n  left: 12px;\n  right: 12px;\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n  z-index: 2;\n}\n.timeline {\n  flex: 1;\n  height: 4px;\n  border-radius: 99px;\n  background: rgba(255, 255, 255, 0.15);\n  overflow: hidden;\n}\n.timeline-fill {\n  height: 100%;\n  background: var(--grad-primary);\n}\n.play-btn {\n  background: var(--grad-primary);\n  color: white;\n  border: none;\n  width: 38px;\n  height: 38px;\n  font-size: 1rem;\n}\n.prompt-panel {\n  margin-top: 1rem;\n  padding: 0.85rem;\n  border: 1px solid var(--border);\n  border-radius: var(--r-md);\n  background: rgba(0, 0, 0, 0.3);\n}\n.prompt-text {\n  white-space: pre-wrap;\n  color: var(--text-2);\n  font-size: 0.78rem;\n  line-height: 1.55;\n  max-height: 220px;\n  overflow: auto;\n}\n.objects-panel {\n  padding: 0.95rem;\n  max-height: 560px;\n  overflow-y: auto;\n}\n.objects-list {\n  display: flex;\n  flex-direction: column;\n  gap: 0.3rem;\n}\n.object-row {\n  display: flex;\n  align-items: center;\n  gap: 0.55rem;\n  padding: 0.55rem 0.65rem;\n  border: 1px solid transparent;\n  border-radius: 10px;\n  background: rgba(255, 255, 255, 0.02);\n  cursor: pointer;\n  color: inherit;\n  transition: all 0.15s;\n  text-align: left;\n  width: 100%;\n}\n.object-row:hover {\n  background: rgba(139, 92, 246, 0.06);\n}\n.object-row.selected {\n  border-color: var(--neon-magenta);\n  background:\n    linear-gradient(\n      135deg,\n      rgba(236, 72, 153, 0.08),\n      rgba(139, 92, 246, 0.06));\n}\n.object-icon {\n  width: 30px;\n  height: 30px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  background: rgba(139, 92, 246, 0.12);\n  border-radius: 8px;\n  font-size: 0.95rem;\n  flex-shrink: 0;\n}\n.status-chip {\n  font-size: 0.85rem;\n  padding: 0;\n}\n.status-chip.ready {\n  color: var(--neon-green);\n}\n.status-chip.pending {\n  color: var(--text-mute);\n}\n.status-chip.generating {\n  color: var(--neon-amber);\n  animation: pulse 1.4s ease-in-out infinite;\n}\n.status-chip.failed {\n  color: var(--neon-rose);\n}\n.status-chip.locked {\n  color: var(--neon-cyan);\n}\n@keyframes pulse {\n  0%, 100% {\n    opacity: 1;\n  }\n  50% {\n    opacity: 0.4;\n  }\n}\n.sm-chip {\n  font-size: 0.62rem;\n  padding: 0.06rem 0.36rem;\n}\n.inspector {\n  padding: 0.95rem;\n}\n.field {\n  margin-top: 0;\n}\n.asset-thumb {\n  width: 56px;\n  height: 40px;\n  border-radius: 6px;\n  background-size: cover;\n  background-position: center;\n  background-color: rgba(140, 160, 255, 0.12);\n  flex-shrink: 0;\n}\n.action-grid {\n  display: grid;\n  grid-template-columns: 1fr 1fr;\n  gap: 0.4rem;\n  margin-top: 0.85rem;\n}\n.action {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  gap: 0.25rem;\n  padding: 0.55rem 0.4rem;\n  border-radius: 10px;\n  border: 1px solid var(--border);\n  background: rgba(255, 255, 255, 0.02);\n  cursor: pointer;\n  font-size: 0.74rem;\n  color: var(--text-2);\n  transition: all 0.15s;\n}\n.action:hover {\n  color: var(--text-1);\n  background: rgba(139, 92, 246, 0.08);\n  border-color: var(--border-strong);\n}\n.action.danger:hover {\n  color: var(--neon-rose);\n  border-color: rgba(251, 113, 133, 0.4);\n  background: rgba(251, 113, 133, 0.06);\n}\n.action-icon {\n  font-size: 1.1rem;\n}\n.empty-inspector {\n  text-align: center;\n  padding: 1.4rem 0.6rem;\n  border: 1px dashed var(--border);\n  border-radius: 10px;\n  display: flex;\n  flex-direction: column;\n  gap: 0.4rem;\n  align-items: center;\n}\n.cost-bar {\n  padding: 0;\n}\n.cost-segments {\n  display: flex;\n  width: 100%;\n  height: 8px;\n  border-radius: 99px;\n  overflow: hidden;\n  gap: 2px;\n}\n.cost-seg {\n  height: 100%;\n}\n.check-row {\n  display: flex;\n  gap: 0.5rem;\n  padding: 0.45rem 0;\n  align-items: flex-start;\n}\n.check-row input[type=checkbox] {\n  width: auto;\n  margin-top: 3px;\n}\n.versions {\n  padding: 1rem;\n}\n.versions-grid {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));\n  gap: 0.6rem;\n}\n.version {\n  border: 1px solid var(--border);\n  border-radius: 10px;\n  background: rgba(255, 255, 255, 0.02);\n  overflow: hidden;\n  transition: all 0.18s;\n}\n.version:hover {\n  border-color: var(--border-strong);\n  transform: translateY(-2px);\n}\n.version-thumb {\n  height: 86px;\n  background-size: cover;\n  background-position: center;\n  background-color: rgba(140, 160, 255, 0.1);\n}\n.empty-version {\n  padding: 1rem;\n  border: 1px dashed var(--border);\n  border-radius: 10px;\n  color: var(--text-3);\n  font-size: 0.85rem;\n  grid-column: 1/-1;\n}\n.jobs-row {\n  gap: 1rem;\n  align-items: stretch;\n  flex-wrap: wrap;\n}\n.flex-col {\n  display: flex;\n  flex-direction: column;\n  gap: 0.5rem;\n  padding: 1rem;\n}\n.job-row {\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n  padding: 0.45rem 0;\n}\n.job-progress {\n  flex: 1;\n  height: 4px;\n  border-radius: 99px;\n  background: rgba(140, 160, 255, 0.1);\n  overflow: hidden;\n}\n.job-fill {\n  height: 100%;\n  background: var(--grad-primary);\n  transition: width 0.4s;\n}\n.quality-list {\n  display: flex;\n  flex-direction: column;\n  gap: 0.3rem;\n}\n.quality {\n  display: flex;\n  gap: 0.5rem;\n  align-items: center;\n  padding: 0.5rem 0.65rem;\n  border-radius: 10px;\n  border: 1px solid var(--border);\n  font-size: 0.85rem;\n  color: var(--text-2);\n}\n.quality .dot {\n  width: 7px;\n  height: 7px;\n  border-radius: 50%;\n  background: var(--text-mute);\n}\n.quality.green {\n  color: var(--neon-green);\n  border-color: rgba(52, 211, 153, 0.25);\n}\n.quality.green .dot {\n  background: var(--neon-green);\n}\n.quality.amber {\n  color: var(--neon-amber);\n  border-color: rgba(251, 191, 36, 0.25);\n}\n.quality.amber .dot {\n  background: var(--neon-amber);\n}\n.loading {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  height: 60vh;\n  color: var(--text-2);\n}\n/*# sourceMappingURL=scene-workspace.component.css.map */\n'] }]
  }], () => [], null);
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(SceneWorkspaceComponent, { className: "SceneWorkspaceComponent", filePath: "src/app/features/scene-workspace/scene-workspace.component.ts", lineNumber: 271 });
})();
export {
  SceneWorkspaceComponent
};
//# sourceMappingURL=chunk-MGKI6C5Z.js.map
