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
  ModelsService
} from "./chunk-UHEGWTC6.js";
import {
  DefaultValueAccessor,
  FormsModule,
  MaxValidator,
  MinValidator,
  NgControlStatus,
  NgModel,
  NgSelectOption,
  NumberValueAccessor,
  RangeValueAccessor,
  SelectControlValueAccessor,
  ɵNgSelectMultipleOption
} from "./chunk-T3VEDOVQ.js";
import "./chunk-5UP4TGNH.js";
import {
  ChangeDetectionStrategy,
  Component,
  DatePipe,
  DecimalPipe,
  Injectable,
  __spreadProps,
  __spreadValues,
  computed,
  effect,
  inject,
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
  ɵɵlistener,
  ɵɵnamespaceHTML,
  ɵɵnamespaceSVG,
  ɵɵnextContext,
  ɵɵpipe,
  ɵɵpipeBind2,
  ɵɵproperty,
  ɵɵpureFunction2,
  ɵɵreference,
  ɵɵrepeater,
  ɵɵrepeaterCreate,
  ɵɵrepeaterTrackByIdentity,
  ɵɵrepeaterTrackByIndex,
  ɵɵresetView,
  ɵɵrestoreView,
  ɵɵstyleProp,
  ɵɵtext,
  ɵɵtextInterpolate,
  ɵɵtextInterpolate1,
  ɵɵtextInterpolate2
} from "./chunk-YYMU35ZW.js";

// src/app/core/services/contract-export.service.ts
var ContractExportService = class _ContractExportService {
  toJson(contract) {
    return JSON.stringify(contract, null, 2);
  }
  toYaml(contract) {
    return this.stringify(contract, 0);
  }
  stringify(value, indent) {
    const pad = "  ".repeat(indent);
    if (value === null || value === void 0)
      return "null";
    if (Array.isArray(value)) {
      if (value.length === 0)
        return "[]";
      return value.map((item) => {
        if (this.isPrimitive(item)) {
          return `${pad}- ${this.formatPrimitive(item)}`;
        }
        const inner = this.stringify(item, indent + 1).replace(/^\s{2}/, "");
        return `${pad}- ${inner.trimStart()}`;
      }).join("\n");
    }
    if (typeof value === "object") {
      const entries = Object.entries(value);
      if (entries.length === 0)
        return "{}";
      return entries.map(([k, v]) => {
        if (this.isPrimitive(v)) {
          return `${pad}${k}: ${this.formatPrimitive(v)}`;
        }
        if (Array.isArray(v) && v.length === 0)
          return `${pad}${k}: []`;
        if (typeof v === "object" && v !== null && Object.keys(v).length === 0) {
          return `${pad}${k}: {}`;
        }
        return `${pad}${k}:
${this.stringify(v, indent + 1)}`;
      }).join("\n");
    }
    return this.formatPrimitive(value);
  }
  isPrimitive(v) {
    return v === null || ["string", "number", "boolean"].includes(typeof v);
  }
  formatPrimitive(v) {
    if (typeof v === "string") {
      if (v === "" || /[:#\-?{}\[\],&*!|>'"%@`]/.test(v) || /^\d/.test(v)) {
        return `"${v.replace(/"/g, '\\"')}"`;
      }
      return v;
    }
    if (v === null || v === void 0)
      return "null";
    return String(v);
  }
  static \u0275fac = function ContractExportService_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _ContractExportService)();
  };
  static \u0275prov = /* @__PURE__ */ \u0275\u0275defineInjectable({ token: _ContractExportService, factory: _ContractExportService.\u0275fac, providedIn: "root" });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(ContractExportService, [{
    type: Injectable,
    args: [{ providedIn: "root" }]
  }], null, null);
})();

// src/app/features/wizard/wizard.component.ts
var _c0 = (a0, a1) => ["/projects", a0, "scenes", a1];
var _forTrack0 = ($index, $item) => $item.key;
var _forTrack1 = ($index, $item) => $item.id;
function WizardComponent_Conditional_0_For_27_Template(rf, ctx) {
  if (rf & 1) {
    const _r3 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "button", 28);
    \u0275\u0275listener("click", function WizardComponent_Conditional_0_For_27_Template_button_click_0_listener() {
      const s_r4 = \u0275\u0275restoreView(_r3).$implicit;
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.setStep(s_r4.key));
    });
    \u0275\u0275elementStart(1, "span", 29);
    \u0275\u0275text(2);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "div", 30)(4, "div", 31);
    \u0275\u0275text(5);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(6, "div", 32);
    \u0275\u0275text(7);
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    const s_r4 = ctx.$implicit;
    const \u0275$index_48_r5 = ctx.$index;
    const p_r6 = \u0275\u0275nextContext();
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275classProp("active", ctx_r1.active() === s_r4.key)("done", ctx_r1.completed(s_r4.key, p_r6));
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(ctx_r1.completed(s_r4.key, p_r6) ? "\u2713" : \u0275$index_48_r5 + 1);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(s_r4.label);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(s_r4.sub);
  }
}
function WizardComponent_Conditional_0_Case_29_For_6_Template(rf, ctx) {
  if (rf & 1) {
    const _r8 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "button", 48);
    \u0275\u0275listener("click", function WizardComponent_Conditional_0_Case_29_For_6_Template_button_click_0_listener() {
      const g_r9 = \u0275\u0275restoreView(_r8).$implicit;
      const ctx_r1 = \u0275\u0275nextContext(3);
      return \u0275\u0275resetView(ctx_r1.updateField("goal", g_r9.key));
    });
    \u0275\u0275elementStart(1, "div", 49);
    \u0275\u0275text(2);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "div", 50);
    \u0275\u0275text(4);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(5, "div", 51);
    \u0275\u0275text(6);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const g_r9 = ctx.$implicit;
    const p_r6 = \u0275\u0275nextContext(2);
    \u0275\u0275classProp("selected", p_r6.goal === g_r9.key);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(g_r9.emoji);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(g_r9.label);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(g_r9.sub);
  }
}
function WizardComponent_Conditional_0_Case_29_Template(rf, ctx) {
  if (rf & 1) {
    const _r7 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "h2");
    \u0275\u0275text(1, "Project goal");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(2, "p", 24);
    \u0275\u0275text(3, "Pick the kind of video you're orchestrating. This drives default models, pacing, and templates.");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "div", 33);
    \u0275\u0275repeaterCreate(5, WizardComponent_Conditional_0_Case_29_For_6_Template, 7, 5, "button", 34, _forTrack0);
    \u0275\u0275elementEnd();
    \u0275\u0275element(7, "div", 35);
    \u0275\u0275elementStart(8, "div", 36)(9, "div")(10, "label", 37);
    \u0275\u0275text(11, "Title");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(12, "input", 38);
    \u0275\u0275listener("ngModelChange", function WizardComponent_Conditional_0_Case_29_Template_input_ngModelChange_12_listener($event) {
      \u0275\u0275restoreView(_r7);
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.updateField("title", $event));
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(13, "div")(14, "label", 37);
    \u0275\u0275text(15, "Output language");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(16, "select", 39);
    \u0275\u0275listener("ngModelChange", function WizardComponent_Conditional_0_Case_29_Template_select_ngModelChange_16_listener($event) {
      \u0275\u0275restoreView(_r7);
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.updateOutput("language", $event));
    });
    \u0275\u0275elementStart(17, "option", 40);
    \u0275\u0275text(18, "English");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(19, "option", 41);
    \u0275\u0275text(20, "Armenian");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(21, "option", 42);
    \u0275\u0275text(22, "Spanish");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(23, "option", 43);
    \u0275\u0275text(24, "French");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(25, "option", 44);
    \u0275\u0275text(26, "German");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(27, "option", 45);
    \u0275\u0275text(28, "Japanese");
    \u0275\u0275elementEnd()()()();
    \u0275\u0275elementStart(29, "div", 46)(30, "label", 37);
    \u0275\u0275text(31, "Description");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(32, "textarea", 47);
    \u0275\u0275listener("ngModelChange", function WizardComponent_Conditional_0_Case_29_Template_textarea_ngModelChange_32_listener($event) {
      \u0275\u0275restoreView(_r7);
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.updateField("description", $event));
    });
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const p_r6 = \u0275\u0275nextContext();
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance(5);
    \u0275\u0275repeater(ctx_r1.goals);
    \u0275\u0275advance(7);
    \u0275\u0275property("ngModel", p_r6.title);
    \u0275\u0275advance(4);
    \u0275\u0275property("ngModel", p_r6.output.language);
    \u0275\u0275advance(16);
    \u0275\u0275property("ngModel", p_r6.description);
  }
}
function WizardComponent_Conditional_0_Case_30_For_61_Template(rf, ctx) {
  if (rf & 1) {
    const _r11 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "button", 74);
    \u0275\u0275listener("click", function WizardComponent_Conditional_0_Case_30_For_61_Template_button_click_0_listener() {
      const m_r12 = \u0275\u0275restoreView(_r11).$implicit;
      const ctx_r1 = \u0275\u0275nextContext(3);
      return \u0275\u0275resetView(ctx_r1.updateModel("script", m_r12.provider, m_r12.name));
    });
    \u0275\u0275elementStart(1, "div", 75)(2, "span", 76);
    \u0275\u0275text(3);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "span", 77);
    \u0275\u0275text(5);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(6, "div", 51);
    \u0275\u0275text(7);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const m_r12 = ctx.$implicit;
    const p_r6 = \u0275\u0275nextContext(2);
    \u0275\u0275classProp("selected", p_r6.models.script.model === m_r12.name);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(m_r12.name);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(m_r12.provider);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(m_r12.description);
  }
}
function WizardComponent_Conditional_0_Case_30_Template(rf, ctx) {
  if (rf & 1) {
    const _r10 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "h2");
    \u0275\u0275text(1, "Script & structure");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(2, "p", 24);
    \u0275\u0275text(3, "Decide the LLM, scene count, pacing, and tone. The system can generate a draft script you can edit.");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "div", 33)(5, "div")(6, "label", 37);
    \u0275\u0275text(7, "Aspect ratio");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(8, "select", 39);
    \u0275\u0275listener("ngModelChange", function WizardComponent_Conditional_0_Case_30_Template_select_ngModelChange_8_listener($event) {
      \u0275\u0275restoreView(_r10);
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.updateOutput("aspectRatio", $event));
    });
    \u0275\u0275elementStart(9, "option", 52);
    \u0275\u0275text(10, "16:9 \u2014 landscape");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(11, "option", 53);
    \u0275\u0275text(12, "9:16 \u2014 vertical");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(13, "option", 54);
    \u0275\u0275text(14, "1:1 \u2014 square");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(15, "option", 55);
    \u0275\u0275text(16, "4:5 \u2014 feed");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(17, "option", 56);
    \u0275\u0275text(18, "21:9 \u2014 cinematic");
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(19, "div")(20, "label", 37);
    \u0275\u0275text(21, "Resolution");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(22, "select", 39);
    \u0275\u0275listener("ngModelChange", function WizardComponent_Conditional_0_Case_30_Template_select_ngModelChange_22_listener($event) {
      \u0275\u0275restoreView(_r10);
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.updateOutput("resolution", $event));
    });
    \u0275\u0275elementStart(23, "option", 57);
    \u0275\u0275text(24, "720p");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(25, "option", 58);
    \u0275\u0275text(26, "1080p");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(27, "option", 59);
    \u0275\u0275text(28, "2K");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(29, "option", 60);
    \u0275\u0275text(30, "4K");
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(31, "div")(32, "label", 37);
    \u0275\u0275text(33, "FPS");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(34, "select", 39);
    \u0275\u0275listener("ngModelChange", function WizardComponent_Conditional_0_Case_30_Template_select_ngModelChange_34_listener($event) {
      \u0275\u0275restoreView(_r10);
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.updateOutput("fps", +$event));
    });
    \u0275\u0275elementStart(35, "option", 61);
    \u0275\u0275text(36, "24 fps \xB7 cinematic");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(37, "option", 61);
    \u0275\u0275text(38, "30 fps \xB7 standard");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(39, "option", 61);
    \u0275\u0275text(40, "60 fps \xB7 smooth");
    \u0275\u0275elementEnd()()()();
    \u0275\u0275elementStart(41, "div", 62)(42, "div")(43, "label", 37);
    \u0275\u0275text(44, "Target duration (seconds)");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(45, "input", 63);
    \u0275\u0275listener("ngModelChange", function WizardComponent_Conditional_0_Case_30_Template_input_ngModelChange_45_listener($event) {
      \u0275\u0275restoreView(_r10);
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.updateOutput("targetDurationSec", +$event));
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(46, "div")(47, "label", 37);
    \u0275\u0275text(48, "Approval policy");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(49, "select", 39);
    \u0275\u0275listener("ngModelChange", function WizardComponent_Conditional_0_Case_30_Template_select_ngModelChange_49_listener($event) {
      \u0275\u0275restoreView(_r10);
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.updateOrchestration("approvalPolicy", $event));
    });
    \u0275\u0275elementStart(50, "option", 64);
    \u0275\u0275text(51, "Approve each scene");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(52, "option", 65);
    \u0275\u0275text(53, "Approve at end");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(54, "option", 66);
    \u0275\u0275text(55, "Auto-approve");
    \u0275\u0275elementEnd()()()();
    \u0275\u0275elementStart(56, "div", 67)(57, "label", 37);
    \u0275\u0275text(58, "Choose script LLM");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(59, "div", 68);
    \u0275\u0275repeaterCreate(60, WizardComponent_Conditional_0_Case_30_For_61_Template, 8, 5, "button", 69, _forTrack1);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(62, "div", 67)(63, "label", 37);
    \u0275\u0275text(64, "Generated draft script");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(65, "button", 70);
    \u0275\u0275listener("click", function WizardComponent_Conditional_0_Case_30_Template_button_click_65_listener() {
      \u0275\u0275restoreView(_r10);
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.mockGenerateScript());
    });
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(66, "svg", 71);
    \u0275\u0275element(67, "path", 72);
    \u0275\u0275elementEnd();
    \u0275\u0275text(68);
    \u0275\u0275elementEnd();
    \u0275\u0275namespaceHTML();
    \u0275\u0275elementStart(69, "textarea", 73);
    \u0275\u0275listener("ngModelChange", function WizardComponent_Conditional_0_Case_30_Template_textarea_ngModelChange_69_listener($event) {
      \u0275\u0275restoreView(_r10);
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.draftScript.set($event));
    });
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const p_r6 = \u0275\u0275nextContext();
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance(8);
    \u0275\u0275property("ngModel", p_r6.output.aspectRatio);
    \u0275\u0275advance(14);
    \u0275\u0275property("ngModel", p_r6.output.resolution);
    \u0275\u0275advance(12);
    \u0275\u0275property("ngModel", p_r6.output.fps);
    \u0275\u0275advance();
    \u0275\u0275property("ngValue", 24);
    \u0275\u0275advance(2);
    \u0275\u0275property("ngValue", 30);
    \u0275\u0275advance(2);
    \u0275\u0275property("ngValue", 60);
    \u0275\u0275advance(6);
    \u0275\u0275property("ngModel", p_r6.output.targetDurationSec);
    \u0275\u0275advance(4);
    \u0275\u0275property("ngModel", p_r6.orchestration.approvalPolicy);
    \u0275\u0275advance(11);
    \u0275\u0275repeater(ctx_r1.scriptModels());
    \u0275\u0275advance(8);
    \u0275\u0275textInterpolate1(" Generate with ", p_r6.models.script.model, " ");
    \u0275\u0275advance();
    \u0275\u0275property("ngModel", ctx_r1.draftScript());
  }
}
function WizardComponent_Conditional_0_Case_31_For_11_Template(rf, ctx) {
  if (rf & 1) {
    const _r14 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "span", 82);
    \u0275\u0275text(1);
    \u0275\u0275elementStart(2, "button", 93);
    \u0275\u0275listener("click", function WizardComponent_Conditional_0_Case_31_For_11_Template_button_click_2_listener() {
      const m_r15 = \u0275\u0275restoreView(_r14).$implicit;
      const ctx_r1 = \u0275\u0275nextContext(3);
      return \u0275\u0275resetView(ctx_r1.removeMood(m_r15));
    });
    \u0275\u0275text(3, "\xD7");
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const m_r15 = ctx.$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1("", m_r15, " ");
  }
}
function WizardComponent_Conditional_0_Case_31_For_47_Template(rf, ctx) {
  if (rf & 1) {
    const _r17 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 90)(1, "input", 94);
    \u0275\u0275listener("ngModelChange", function WizardComponent_Conditional_0_Case_31_For_47_Template_input_ngModelChange_1_listener($event) {
      const $index_r18 = \u0275\u0275restoreView(_r17).$index;
      const ctx_r1 = \u0275\u0275nextContext(3);
      return \u0275\u0275resetView(ctx_r1.setPaletteColor($index_r18, $event));
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(2, "span", 95);
    \u0275\u0275text(3);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "button", 96);
    \u0275\u0275listener("click", function WizardComponent_Conditional_0_Case_31_For_47_Template_button_click_4_listener() {
      const $index_r18 = \u0275\u0275restoreView(_r17).$index;
      const ctx_r1 = \u0275\u0275nextContext(3);
      return \u0275\u0275resetView(ctx_r1.removePaletteColor($index_r18));
    });
    \u0275\u0275text(5, "\xD7");
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const c_r19 = ctx.$implicit;
    \u0275\u0275advance();
    \u0275\u0275property("ngModel", c_r19);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(c_r19);
  }
}
function WizardComponent_Conditional_0_Case_31_For_54_Template(rf, ctx) {
  if (rf & 1) {
    const _r20 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "span", 91);
    \u0275\u0275text(1);
    \u0275\u0275elementStart(2, "button", 93);
    \u0275\u0275listener("click", function WizardComponent_Conditional_0_Case_31_For_54_Template_button_click_2_listener() {
      const r_r21 = \u0275\u0275restoreView(_r20).$implicit;
      const ctx_r1 = \u0275\u0275nextContext(3);
      return \u0275\u0275resetView(ctx_r1.removeNegative(r_r21));
    });
    \u0275\u0275text(3, "\xD7");
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const r_r21 = ctx.$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1("", r_r21, " ");
  }
}
function WizardComponent_Conditional_0_Case_31_Template(rf, ctx) {
  if (rf & 1) {
    const _r13 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "h2");
    \u0275\u0275text(1, "Global style");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(2, "p", 24);
    \u0275\u0275text(3, "A consistent look + feel: realism, mood, palette, and forbidden elements applied across every scene.");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "label", 78);
    \u0275\u0275text(5, "Genre");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(6, "input", 79);
    \u0275\u0275listener("ngModelChange", function WizardComponent_Conditional_0_Case_31_Template_input_ngModelChange_6_listener($event) {
      \u0275\u0275restoreView(_r13);
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.updateCreative("genre", $event));
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(7, "label", 80);
    \u0275\u0275text(8, "Mood");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(9, "div", 81);
    \u0275\u0275repeaterCreate(10, WizardComponent_Conditional_0_Case_31_For_11_Template, 4, 1, "span", 82, \u0275\u0275repeaterTrackByIdentity);
    \u0275\u0275elementStart(12, "input", 83, 0);
    \u0275\u0275listener("keydown.enter", function WizardComponent_Conditional_0_Case_31_Template_input_keydown_enter_12_listener() {
      \u0275\u0275restoreView(_r13);
      const moodInput_r16 = \u0275\u0275reference(13);
      const ctx_r1 = \u0275\u0275nextContext(2);
      ctx_r1.addMood(moodInput_r16.value);
      return \u0275\u0275resetView(moodInput_r16.value = "");
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(14, "div", 84)(15, "div")(16, "label", 37);
    \u0275\u0275text(17, "Realism level");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(18, "input", 85);
    \u0275\u0275listener("ngModelChange", function WizardComponent_Conditional_0_Case_31_Template_input_ngModelChange_18_listener($event) {
      \u0275\u0275restoreView(_r13);
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.updateCreative("realismLevel", $event / 100));
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(19, "div", 86)(20, "span", 87);
    \u0275\u0275text(21, "Stylized");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(22, "span", 88);
    \u0275\u0275text(23);
    \u0275\u0275pipe(24, "number");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(25, "span", 87);
    \u0275\u0275text(26, "Photo-real");
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(27, "div")(28, "label", 37);
    \u0275\u0275text(29, "Title font");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(30, "select", 39);
    \u0275\u0275listener("ngModelChange", function WizardComponent_Conditional_0_Case_31_Template_select_ngModelChange_30_listener($event) {
      \u0275\u0275restoreView(_r13);
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.updateFonts("title", $event));
    });
    \u0275\u0275elementStart(31, "option");
    \u0275\u0275text(32, "Inter");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(33, "option");
    \u0275\u0275text(34, "Montserrat");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(35, "option");
    \u0275\u0275text(36, "Poppins");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(37, "option");
    \u0275\u0275text(38, "Orbitron");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(39, "option");
    \u0275\u0275text(40, "Space Grotesk");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(41, "option");
    \u0275\u0275text(42, "Playfair Display");
    \u0275\u0275elementEnd()()()();
    \u0275\u0275elementStart(43, "label", 78);
    \u0275\u0275text(44, "Color palette");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(45, "div", 89);
    \u0275\u0275repeaterCreate(46, WizardComponent_Conditional_0_Case_31_For_47_Template, 6, 2, "div", 90, \u0275\u0275repeaterTrackByIndex);
    \u0275\u0275elementStart(48, "button", 13);
    \u0275\u0275listener("click", function WizardComponent_Conditional_0_Case_31_Template_button_click_48_listener() {
      \u0275\u0275restoreView(_r13);
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.addPaletteColor());
    });
    \u0275\u0275text(49, "+ Add color");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(50, "label", 78);
    \u0275\u0275text(51, "Negative rules");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(52, "div", 81);
    \u0275\u0275repeaterCreate(53, WizardComponent_Conditional_0_Case_31_For_54_Template, 4, 1, "span", 91, \u0275\u0275repeaterTrackByIdentity);
    \u0275\u0275elementStart(55, "input", 92, 1);
    \u0275\u0275listener("keydown.enter", function WizardComponent_Conditional_0_Case_31_Template_input_keydown_enter_55_listener() {
      \u0275\u0275restoreView(_r13);
      const negInput_r22 = \u0275\u0275reference(56);
      const ctx_r1 = \u0275\u0275nextContext(2);
      ctx_r1.addNegative(negInput_r22.value);
      return \u0275\u0275resetView(negInput_r22.value = "");
    });
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const p_r6 = \u0275\u0275nextContext();
    \u0275\u0275advance(6);
    \u0275\u0275property("ngModel", p_r6.creativeDirection.genre);
    \u0275\u0275advance(4);
    \u0275\u0275repeater(p_r6.creativeDirection.mood);
    \u0275\u0275advance(8);
    \u0275\u0275property("ngModel", p_r6.creativeDirection.realismLevel * 100);
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate1("", \u0275\u0275pipeBind2(24, 4, p_r6.creativeDirection.realismLevel * 100, "1.0-0"), "%");
    \u0275\u0275advance(7);
    \u0275\u0275property("ngModel", p_r6.creativeDirection.fonts.title);
    \u0275\u0275advance(16);
    \u0275\u0275repeater(p_r6.creativeDirection.colorPalette);
    \u0275\u0275advance(7);
    \u0275\u0275repeater(p_r6.creativeDirection.negativeRules);
  }
}
function WizardComponent_Conditional_0_Case_32_For_6_Conditional_9_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 108);
    \u0275\u0275text(1, "\u{1F512} Locked");
    \u0275\u0275elementEnd();
  }
}
function WizardComponent_Conditional_0_Case_32_For_6_Template(rf, ctx) {
  if (rf & 1) {
    const _r24 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 98);
    \u0275\u0275element(1, "div", 102);
    \u0275\u0275elementStart(2, "div", 103)(3, "div", 104)(4, "div", 105)(5, "div", 106);
    \u0275\u0275text(6);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(7, "div", 107);
    \u0275\u0275text(8);
    \u0275\u0275elementEnd()();
    \u0275\u0275conditionalCreate(9, WizardComponent_Conditional_0_Case_32_For_6_Conditional_9_Template, 2, 0, "span", 108);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(10, "div", 109)(11, "span", 77);
    \u0275\u0275text(12);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(13, "span", 77);
    \u0275\u0275text(14);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(15, "div", 12)(16, "button", 110);
    \u0275\u0275text(17, "Edit");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(18, "button", 111);
    \u0275\u0275listener("click", function WizardComponent_Conditional_0_Case_32_For_6_Template_button_click_18_listener() {
      const c_r25 = \u0275\u0275restoreView(_r24).$implicit;
      const ctx_r1 = \u0275\u0275nextContext(3);
      return \u0275\u0275resetView(ctx_r1.removeCharacter(c_r25.id));
    });
    \u0275\u0275text(19, "Remove");
    \u0275\u0275elementEnd()()()();
  }
  if (rf & 2) {
    const c_r25 = ctx.$implicit;
    const ctx_r1 = \u0275\u0275nextContext(3);
    \u0275\u0275advance();
    \u0275\u0275styleProp("background-image", ctx_r1.thumbForChar(c_r25));
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate(c_r25.name);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(c_r25.description);
    \u0275\u0275advance();
    \u0275\u0275conditional(c_r25.continuityLock ? 9 : -1);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(c_r25.voice.provider);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(c_r25.voice.accent);
  }
}
function WizardComponent_Conditional_0_Case_32_Template(rf, ctx) {
  if (rf & 1) {
    const _r23 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "h2");
    \u0275\u0275text(1, "Characters & avatars");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(2, "p", 24);
    \u0275\u0275text(3, "Reusable characters with continuity locks. The system reuses these across all scenes.");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "div", 97);
    \u0275\u0275repeaterCreate(5, WizardComponent_Conditional_0_Case_32_For_6_Template, 20, 7, "div", 98, _forTrack1);
    \u0275\u0275elementStart(7, "button", 99);
    \u0275\u0275listener("click", function WizardComponent_Conditional_0_Case_32_Template_button_click_7_listener() {
      \u0275\u0275restoreView(_r23);
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.addCharacter());
    });
    \u0275\u0275elementStart(8, "div", 100);
    \u0275\u0275text(9, "+");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(10, "div", 101);
    \u0275\u0275text(11, "Add character");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(12, "div", 51);
    \u0275\u0275text(13, "Generate or upload reference");
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    const p_r6 = \u0275\u0275nextContext();
    \u0275\u0275advance(5);
    \u0275\u0275repeater(p_r6.characters);
  }
}
function WizardComponent_Conditional_0_Case_33_For_15_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 116)(1, "span", 117);
    \u0275\u0275text(2);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const a_r26 = ctx.$implicit;
    \u0275\u0275styleProp("background-image", "url(" + (a_r26.thumbnail || a_r26.uri) + ")");
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(a_r26.type);
  }
}
function WizardComponent_Conditional_0_Case_33_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "h2");
    \u0275\u0275text(1, "Assets");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(2, "p", 24);
    \u0275\u0275text(3, "Bring your own \u2014 or let AI generate. Each asset stores prompt, provider, and version.");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "div", 112)(5, "a", 113);
    \u0275\u0275text(6, "Open asset library");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(7, "button", 110);
    \u0275\u0275text(8, "Upload files");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(9, "button", 110);
    \u0275\u0275text(10, "Connect Google Drive");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(11, "button", 110);
    \u0275\u0275text(12, "Stock providers");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(13, "div", 114);
    \u0275\u0275repeaterCreate(14, WizardComponent_Conditional_0_Case_33_For_15_Template, 3, 3, "div", 115, _forTrack1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275advance(14);
    \u0275\u0275repeater(ctx_r1.assets.assets().slice(0, 12));
  }
}
function WizardComponent_Conditional_0_Case_34_For_10_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "a", 120)(1, "div", 122)(2, "span", 123);
    \u0275\u0275text(3);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(4, "div", 124)(5, "div", 125)(6, "strong");
    \u0275\u0275text(7);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(8, "span", 10);
    \u0275\u0275text(9);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(10, "div", 126);
    \u0275\u0275text(11);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(12, "div", 127)(13, "span", 77);
    \u0275\u0275text(14);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(15, "span", 77);
    \u0275\u0275text(16);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(17, "span", 77);
    \u0275\u0275text(18);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(19, "span", 82);
    \u0275\u0275text(20);
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(21, "div", 12)(22, "button", 128);
    \u0275\u0275text(23, "\u2192");
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    const s_r28 = ctx.$implicit;
    const p_r6 = \u0275\u0275nextContext(2);
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275property("routerLink", \u0275\u0275pureFunction2(13, _c0, p_r6.id, s_r28.id));
    \u0275\u0275advance();
    \u0275\u0275styleProp("background-image", s_r28.thumbnailUrl ? "url(" + s_r28.thumbnailUrl + ")" : "");
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(s_r28.index + 1);
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate(s_r28.title);
    \u0275\u0275advance();
    \u0275\u0275classMap(ctx_r1.sceneStatusTone(s_r28.review.status));
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(s_r28.review.status);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(s_r28.objective);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate1("", s_r28.durationSec, "s");
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(s_r28.camera.shotType);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1("", s_r28.objects.length, " objects");
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1("~", s_r28.costEstimate ?? 0, " credits");
  }
}
function WizardComponent_Conditional_0_Case_34_Conditional_11_Template(rf, ctx) {
  if (rf & 1) {
    const _r29 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 121)(1, "div", 129);
    \u0275\u0275text(2, "\u{1F3AC}");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "div", 130);
    \u0275\u0275text(4, "No scenes yet");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(5, "p", 126);
    \u0275\u0275text(6, "Generate from script or add manually.");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(7, "button", 118);
    \u0275\u0275listener("click", function WizardComponent_Conditional_0_Case_34_Conditional_11_Template_button_click_7_listener() {
      \u0275\u0275restoreView(_r29);
      const ctx_r1 = \u0275\u0275nextContext(3);
      return \u0275\u0275resetView(ctx_r1.addScene());
    });
    \u0275\u0275text(8, "+ Add first scene");
    \u0275\u0275elementEnd()();
  }
}
function WizardComponent_Conditional_0_Case_34_Template(rf, ctx) {
  if (rf & 1) {
    const _r27 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 75)(1, "div")(2, "h2");
    \u0275\u0275text(3, "Scenes");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "p", 24);
    \u0275\u0275text(5, "Plan and order your scenes. Each scene is a fully-typed block in the contract.");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(6, "button", 118);
    \u0275\u0275listener("click", function WizardComponent_Conditional_0_Case_34_Template_button_click_6_listener() {
      \u0275\u0275restoreView(_r27);
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.addScene());
    });
    \u0275\u0275text(7, "+ Add scene");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(8, "div", 119);
    \u0275\u0275repeaterCreate(9, WizardComponent_Conditional_0_Case_34_For_10_Template, 24, 16, "a", 120, _forTrack1);
    \u0275\u0275conditionalCreate(11, WizardComponent_Conditional_0_Case_34_Conditional_11_Template, 9, 0, "div", 121);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const p_r6 = \u0275\u0275nextContext();
    \u0275\u0275advance(9);
    \u0275\u0275repeater(p_r6.scenes);
    \u0275\u0275advance(2);
    \u0275\u0275conditional(p_r6.scenes.length === 0 ? 11 : -1);
  }
}
function WizardComponent_Conditional_0_Case_35_Template(rf, ctx) {
  if (rf & 1) {
    const _r30 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "h2");
    \u0275\u0275text(1, "Review contract");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(2, "p", 24);
    \u0275\u0275text(3, "Inspect, validate, and export your normalized contract. This file becomes the source of truth.");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "div", 131)(5, "button", 132);
    \u0275\u0275listener("click", function WizardComponent_Conditional_0_Case_35_Template_button_click_5_listener() {
      \u0275\u0275restoreView(_r30);
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.format.set("yaml"));
    });
    \u0275\u0275text(6, "YAML");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(7, "button", 132);
    \u0275\u0275listener("click", function WizardComponent_Conditional_0_Case_35_Template_button_click_7_listener() {
      \u0275\u0275restoreView(_r30);
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.format.set("json"));
    });
    \u0275\u0275text(8, "JSON");
    \u0275\u0275elementEnd();
    \u0275\u0275element(9, "div", 133);
    \u0275\u0275elementStart(10, "button", 132);
    \u0275\u0275listener("click", function WizardComponent_Conditional_0_Case_35_Template_button_click_10_listener() {
      \u0275\u0275restoreView(_r30);
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.copyContract());
    });
    \u0275\u0275text(11, "Copy");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(12, "button", 132);
    \u0275\u0275listener("click", function WizardComponent_Conditional_0_Case_35_Template_button_click_12_listener() {
      \u0275\u0275restoreView(_r30);
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.downloadContract());
    });
    \u0275\u0275text(13, "Download");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(14, "pre", 134);
    \u0275\u0275text(15);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(16, "div", 135)(17, "div", 136);
    \u0275\u0275element(18, "span", 137);
    \u0275\u0275text(19, " Title set");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(20, "div", 136);
    \u0275\u0275element(21, "span", 137);
    \u0275\u0275text(22, " Genre defined");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(23, "div", 136);
    \u0275\u0275element(24, "span", 137);
    \u0275\u0275text(25, " At least one character");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(26, "div", 136);
    \u0275\u0275element(27, "span", 137);
    \u0275\u0275text(28, " At least one scene");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(29, "div", 136);
    \u0275\u0275element(30, "span", 137);
    \u0275\u0275text(31, " 2+ palette colors");
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const p_r6 = \u0275\u0275nextContext();
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance(5);
    \u0275\u0275classProp("primary", ctx_r1.format() === "yaml");
    \u0275\u0275advance(2);
    \u0275\u0275classProp("primary", ctx_r1.format() === "json");
    \u0275\u0275advance(8);
    \u0275\u0275textInterpolate(ctx_r1.contractText());
    \u0275\u0275advance(2);
    \u0275\u0275classProp("ok", !!p_r6.title);
    \u0275\u0275advance(3);
    \u0275\u0275classProp("ok", !!p_r6.creativeDirection.genre);
    \u0275\u0275advance(3);
    \u0275\u0275classProp("ok", p_r6.characters.length > 0);
    \u0275\u0275advance(3);
    \u0275\u0275classProp("ok", p_r6.scenes.length > 0);
    \u0275\u0275advance(3);
    \u0275\u0275classProp("ok", p_r6.creativeDirection.colorPalette.length >= 2);
  }
}
function WizardComponent_Conditional_0_Conditional_41_Template(rf, ctx) {
  if (rf & 1) {
    const _r31 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "button", 138);
    \u0275\u0275listener("click", function WizardComponent_Conditional_0_Conditional_41_Template_button_click_0_listener() {
      \u0275\u0275restoreView(_r31);
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.next());
    });
    \u0275\u0275text(1, "Continue \u2192");
    \u0275\u0275elementEnd();
  }
}
function WizardComponent_Conditional_0_Conditional_42_Template(rf, ctx) {
  if (rf & 1) {
    const _r32 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "button", 16);
    \u0275\u0275listener("click", function WizardComponent_Conditional_0_Conditional_42_Template_button_click_0_listener() {
      \u0275\u0275restoreView(_r32);
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.generateContract());
    });
    \u0275\u0275text(1, "\u{1F680} Generate Scene 1");
    \u0275\u0275elementEnd();
  }
}
function WizardComponent_Conditional_0_Conditional_43_Template(rf, ctx) {
  if (rf & 1) {
    const _r33 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "aside", 27)(1, "div", 139)(2, "div", 125)(3, "span", 82);
    \u0275\u0275text(4, "live");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(5, "strong", 140);
    \u0275\u0275text(6, "Contract");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(7, "div", 141)(8, "button", 132);
    \u0275\u0275listener("click", function WizardComponent_Conditional_0_Conditional_43_Template_button_click_8_listener() {
      \u0275\u0275restoreView(_r33);
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.format.set("yaml"));
    });
    \u0275\u0275text(9, "YAML");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(10, "button", 132);
    \u0275\u0275listener("click", function WizardComponent_Conditional_0_Conditional_43_Template_button_click_10_listener() {
      \u0275\u0275restoreView(_r33);
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.format.set("json"));
    });
    \u0275\u0275text(11, "JSON");
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(12, "pre", 142);
    \u0275\u0275text(13);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275advance(8);
    \u0275\u0275classProp("primary", ctx_r1.format() === "yaml");
    \u0275\u0275advance(2);
    \u0275\u0275classProp("primary", ctx_r1.format() === "json");
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(ctx_r1.contractText());
  }
}
function WizardComponent_Conditional_0_Template(rf, ctx) {
  if (rf & 1) {
    const _r1 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 2)(1, "header", 4)(2, "div")(3, "a", 5);
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(4, "svg", 6);
    \u0275\u0275element(5, "path", 7);
    \u0275\u0275elementEnd();
    \u0275\u0275text(6, " Dashboard ");
    \u0275\u0275elementEnd();
    \u0275\u0275namespaceHTML();
    \u0275\u0275elementStart(7, "div", 8)(8, "input", 9);
    \u0275\u0275listener("ngModelChange", function WizardComponent_Conditional_0_Template_input_ngModelChange_8_listener($event) {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.updateField("title", $event));
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(9, "span", 10);
    \u0275\u0275text(10);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(11, "div", 11);
    \u0275\u0275text(12);
    \u0275\u0275pipe(13, "date");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(14, "div", 12)(15, "button", 13);
    \u0275\u0275listener("click", function WizardComponent_Conditional_0_Template_button_click_15_listener() {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.togglePreview());
    });
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(16, "svg", 6);
    \u0275\u0275element(17, "path", 14)(18, "circle", 15);
    \u0275\u0275elementEnd();
    \u0275\u0275text(19);
    \u0275\u0275elementEnd();
    \u0275\u0275namespaceHTML();
    \u0275\u0275elementStart(20, "button", 16);
    \u0275\u0275listener("click", function WizardComponent_Conditional_0_Template_button_click_20_listener() {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.generateContract());
    });
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(21, "svg", 6);
    \u0275\u0275element(22, "path", 17);
    \u0275\u0275elementEnd();
    \u0275\u0275text(23, " Generate contract ");
    \u0275\u0275elementEnd()()();
    \u0275\u0275namespaceHTML();
    \u0275\u0275elementStart(24, "div", 18)(25, "aside", 19);
    \u0275\u0275repeaterCreate(26, WizardComponent_Conditional_0_For_27_Template, 8, 7, "button", 20, _forTrack0);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(28, "section", 21);
    \u0275\u0275conditionalCreate(29, WizardComponent_Conditional_0_Case_29_Template, 33, 3)(30, WizardComponent_Conditional_0_Case_30_Template, 70, 10)(31, WizardComponent_Conditional_0_Case_31_Template, 57, 7)(32, WizardComponent_Conditional_0_Case_32_Template, 14, 0)(33, WizardComponent_Conditional_0_Case_33_Template, 16, 0)(34, WizardComponent_Conditional_0_Case_34_Template, 12, 1)(35, WizardComponent_Conditional_0_Case_35_Template, 32, 15);
    \u0275\u0275elementStart(36, "div", 22)(37, "button", 23);
    \u0275\u0275listener("click", function WizardComponent_Conditional_0_Template_button_click_37_listener() {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.prev());
    });
    \u0275\u0275text(38, "\u2190 Back");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(39, "span", 24);
    \u0275\u0275text(40);
    \u0275\u0275elementEnd();
    \u0275\u0275conditionalCreate(41, WizardComponent_Conditional_0_Conditional_41_Template, 2, 0, "button", 25)(42, WizardComponent_Conditional_0_Conditional_42_Template, 2, 0, "button", 26);
    \u0275\u0275elementEnd()();
    \u0275\u0275conditionalCreate(43, WizardComponent_Conditional_0_Conditional_43_Template, 14, 5, "aside", 27);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    let tmp_9_0;
    const p_r6 = ctx;
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance(8);
    \u0275\u0275property("ngModel", p_r6.title);
    \u0275\u0275advance();
    \u0275\u0275classMap(ctx_r1.statusTone(p_r6.status));
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(p_r6.status);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1(" Last edited ", \u0275\u0275pipeBind2(13, 14, p_r6.updatedAt, "medium"), " ");
    \u0275\u0275advance(7);
    \u0275\u0275textInterpolate1(" ", ctx_r1.previewOpen() ? "Hide" : "Show", " contract ");
    \u0275\u0275advance(5);
    \u0275\u0275classProp("with-preview", ctx_r1.previewOpen());
    \u0275\u0275advance(2);
    \u0275\u0275repeater(ctx_r1.steps);
    \u0275\u0275advance(3);
    \u0275\u0275conditional((tmp_9_0 = ctx_r1.active()) === "goal" ? 29 : tmp_9_0 === "script" ? 30 : tmp_9_0 === "style" ? 31 : tmp_9_0 === "characters" ? 32 : tmp_9_0 === "assets" ? 33 : tmp_9_0 === "scenes" ? 34 : tmp_9_0 === "review" ? 35 : -1);
    \u0275\u0275advance(8);
    \u0275\u0275property("disabled", !ctx_r1.hasPrev());
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate2("Step ", ctx_r1.stepIndex() + 1, " / ", ctx_r1.steps.length);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r1.active() !== "review" ? 41 : 42);
    \u0275\u0275advance(2);
    \u0275\u0275conditional(ctx_r1.previewOpen() ? 43 : -1);
  }
}
function WizardComponent_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 3);
    \u0275\u0275element(1, "span", 143);
    \u0275\u0275elementStart(2, "span", 144);
    \u0275\u0275text(3, "Loading project\u2026");
    \u0275\u0275elementEnd()();
  }
}
var WizardComponent = class _WizardComponent {
  route = inject(ActivatedRoute);
  router = inject(Router);
  projects = inject(ProjectsService);
  assets = inject(AssetsService);
  modelsService = inject(ModelsService);
  exportSvc = inject(ContractExportService);
  active = signal("goal", ...ngDevMode ? [{ debugName: "active" }] : (
    /* istanbul ignore next */
    []
  ));
  previewOpen = signal(true, ...ngDevMode ? [{ debugName: "previewOpen" }] : (
    /* istanbul ignore next */
    []
  ));
  format = signal("yaml", ...ngDevMode ? [{ debugName: "format" }] : (
    /* istanbul ignore next */
    []
  ));
  draftScript = signal("", ...ngDevMode ? [{ debugName: "draftScript" }] : (
    /* istanbul ignore next */
    []
  ));
  project = signal(void 0, ...ngDevMode ? [{ debugName: "project" }] : (
    /* istanbul ignore next */
    []
  ));
  steps = [
    { key: "goal", label: "Goal", sub: "Pick the kind of video" },
    { key: "script", label: "Script & structure", sub: "LLM, duration, pacing" },
    { key: "style", label: "Global style", sub: "Mood, palette, fonts" },
    { key: "characters", label: "Characters", sub: "Reusable avatars & voices" },
    { key: "assets", label: "Assets", sub: "Reference materials" },
    { key: "scenes", label: "Scenes", sub: "Plan & order" },
    { key: "review", label: "Review & generate", sub: "YAML / JSON" }
  ];
  goals = [
    { key: "cinematic_trailer", label: "Cinematic trailer", sub: "Hero piece with mood and motion", emoji: "\u{1F3AC}" },
    { key: "music_video", label: "Music video", sub: "Synced to a soundtrack", emoji: "\u{1F3B5}" },
    { key: "ad", label: "Advertisement", sub: "Hook \u2192 benefit \u2192 CTA", emoji: "\u{1F4E2}" },
    { key: "children_story", label: "Children's story", sub: "Bright, warm, narrated", emoji: "\u{1F9F8}" },
    { key: "explainer", label: "Explainer", sub: "Educate in 60\u2013120s", emoji: "\u{1F4A1}" },
    { key: "product_demo", label: "Product demo", sub: "Features in motion", emoji: "\u{1F6E0}\uFE0F" },
    { key: "youtube_short", label: "YouTube short", sub: "9:16 punchy clip", emoji: "\u{1F4F1}" },
    { key: "educational", label: "Educational", sub: "Lesson with visuals", emoji: "\u{1F393}" },
    { key: "documentary", label: "Documentary", sub: "Long-form storytelling", emoji: "\u{1F399}\uFE0F" }
  ];
  scriptModels = computed(() => this.modelsService.byCapability("script_generation"), ...ngDevMode ? [{ debugName: "scriptModels" }] : (
    /* istanbul ignore next */
    []
  ));
  contractText = computed(() => {
    const p = this.project();
    if (!p)
      return "";
    return this.format() === "yaml" ? this.exportSvc.toYaml(p) : this.exportSvc.toJson(p);
  }, ...ngDevMode ? [{ debugName: "contractText" }] : (
    /* istanbul ignore next */
    []
  ));
  constructor() {
    effect(() => {
      const id = this.route.snapshot.paramMap.get("id");
      if (id === null) {
        this.projects.create({ title: "Untitled video", goal: "cinematic_trailer", description: "" }).subscribe((p) => {
          this.project.set(p);
          this.router.navigate(["/projects", p.id], { replaceUrl: true });
        });
      } else {
        this.projects.get(id).subscribe((p) => this.project.set(p));
      }
    });
  }
  stepIndex() {
    return this.steps.findIndex((s) => s.key === this.active());
  }
  hasPrev() {
    return this.stepIndex() > 0;
  }
  setStep(s) {
    this.active.set(s);
  }
  next() {
    const i = this.stepIndex();
    if (i < this.steps.length - 1)
      this.active.set(this.steps[i + 1].key);
  }
  prev() {
    const i = this.stepIndex();
    if (i > 0)
      this.active.set(this.steps[i - 1].key);
  }
  togglePreview() {
    this.previewOpen.update((v) => !v);
  }
  completed(key, p) {
    switch (key) {
      case "goal":
        return !!p.title && !!p.goal;
      case "script":
        return !!p.description && p.output.targetDurationSec > 0;
      case "style":
        return !!p.creativeDirection.genre && p.creativeDirection.colorPalette.length >= 2;
      case "characters":
        return p.characters.length > 0;
      case "assets":
        return true;
      case "scenes":
        return p.scenes.length > 0;
      case "review":
        return p.scenes.length > 0;
    }
  }
  statusTone(s) {
    return { draft: "muted", in_progress: "cyan", review: "amber", completed: "green" }[s];
  }
  sceneStatusTone(s) {
    return { draft: "muted", prepared: "cyan", generating: "amber", completed: "green", approved: "green", failed: "rose", waiting_for_user: "amber" }[s] ?? "muted";
  }
  updateField(key, value) {
    const p = this.project();
    if (!p)
      return;
    const updated = __spreadProps(__spreadValues({}, p), { [key]: value });
    this.project.set(updated);
    this.projects.update(p.id, { [key]: value });
  }
  updateOutput(key, value) {
    const p = this.project();
    if (!p)
      return;
    const updated = __spreadProps(__spreadValues({}, p), { output: __spreadProps(__spreadValues({}, p.output), { [key]: value }) });
    this.project.set(updated);
    this.projects.update(p.id, { output: updated.output });
  }
  updateOrchestration(key, value) {
    const p = this.project();
    if (!p)
      return;
    const updated = __spreadProps(__spreadValues({}, p), { orchestration: __spreadProps(__spreadValues({}, p.orchestration), { [key]: value }) });
    this.project.set(updated);
    this.projects.update(p.id, { orchestration: updated.orchestration });
  }
  updateModel(slot, provider, model) {
    const p = this.project();
    if (!p)
      return;
    const updated = __spreadProps(__spreadValues({}, p), { models: __spreadProps(__spreadValues({}, p.models), { [slot]: { provider, model } }) });
    this.project.set(updated);
    this.projects.update(p.id, { models: updated.models });
  }
  updateCreative(key, value) {
    const p = this.project();
    if (!p)
      return;
    const updated = __spreadProps(__spreadValues({}, p), { creativeDirection: __spreadProps(__spreadValues({}, p.creativeDirection), { [key]: value }) });
    this.project.set(updated);
    this.projects.update(p.id, { creativeDirection: updated.creativeDirection });
  }
  updateFonts(slot, value) {
    const p = this.project();
    if (!p)
      return;
    const updated = __spreadProps(__spreadValues({}, p), {
      creativeDirection: __spreadProps(__spreadValues({}, p.creativeDirection), { fonts: __spreadProps(__spreadValues({}, p.creativeDirection.fonts), { [slot]: value }) })
    });
    this.project.set(updated);
    this.projects.update(p.id, { creativeDirection: updated.creativeDirection });
  }
  addMood(value) {
    if (!value.trim())
      return;
    const p = this.project();
    if (!p)
      return;
    if (p.creativeDirection.mood.includes(value))
      return;
    this.updateCreative("mood", [...p.creativeDirection.mood, value.trim()]);
  }
  removeMood(value) {
    const p = this.project();
    if (!p)
      return;
    this.updateCreative("mood", p.creativeDirection.mood.filter((m) => m !== value));
  }
  addNegative(value) {
    if (!value.trim())
      return;
    const p = this.project();
    if (!p)
      return;
    this.updateCreative("negativeRules", [...p.creativeDirection.negativeRules, value.trim()]);
  }
  removeNegative(value) {
    const p = this.project();
    if (!p)
      return;
    this.updateCreative("negativeRules", p.creativeDirection.negativeRules.filter((r) => r !== value));
  }
  setPaletteColor(i, value) {
    const p = this.project();
    if (!p)
      return;
    const palette = [...p.creativeDirection.colorPalette];
    palette[i] = value;
    this.updateCreative("colorPalette", palette);
  }
  addPaletteColor() {
    const p = this.project();
    if (!p)
      return;
    this.updateCreative("colorPalette", [...p.creativeDirection.colorPalette, "#7c3aed"]);
  }
  removePaletteColor(i) {
    const p = this.project();
    if (!p)
      return;
    const palette = [...p.creativeDirection.colorPalette];
    palette.splice(i, 1);
    this.updateCreative("colorPalette", palette);
  }
  addCharacter() {
    const p = this.project();
    if (!p)
      return;
    const newChar = {
      id: `char-${p.characters.length + 1}`,
      name: "New character",
      description: "",
      referenceImages: [],
      wardrobe: "",
      voice: { mode: "generate", provider: "elevenlabs", accent: "neutral" },
      emotionProfile: "",
      movementStyle: "",
      continuityLock: true
    };
    this.project.set(__spreadProps(__spreadValues({}, p), { characters: [...p.characters, newChar] }));
    this.projects.update(p.id, { characters: [...p.characters, newChar] });
  }
  removeCharacter(id) {
    const p = this.project();
    if (!p)
      return;
    const characters = p.characters.filter((c) => c.id !== id);
    this.project.set(__spreadProps(__spreadValues({}, p), { characters }));
    this.projects.update(p.id, { characters });
  }
  addScene() {
    const p = this.project();
    if (!p)
      return;
    const newScene = {
      id: `scene-${String(p.scenes.length + 1).padStart(3, "0")}`,
      index: p.scenes.length,
      title: `Scene ${p.scenes.length + 1}`,
      objective: "",
      durationSec: 6,
      generationMode: "prepare_then_generate",
      background: { mode: "generate", description: "" },
      camera: { shotType: "medium shot", movement: "static", lens: "35mm" },
      characters: [],
      objects: [],
      narration: { text: "", voiceRef: "" },
      audio: { backgroundMusic: { mode: "generate", genre: "", tempo: "medium" }, soundEffects: [] },
      subtitles: { enabled: true, style: "clean lower third" },
      transitionOut: { type: "fade", durationMs: 400 },
      continuity: { usePreviousFinalFrame: true, exportFinalFrameForNextScene: true },
      review: { status: "draft", lockedAssets: [] },
      costEstimate: 30
    };
    const scenes = [...p.scenes, newScene];
    this.project.set(__spreadProps(__spreadValues({}, p), { scenes }));
    this.projects.update(p.id, { scenes });
  }
  mockGenerateScript() {
    const p = this.project();
    if (!p)
      return;
    this.draftScript.set(`Cold open
A still city street at dusk. ${p.title || "Our hero"} steps into frame.

Beat 1: Atmosphere
${p.creativeDirection.mood.join(", ") || "mysterious, warm"} atmosphere builds. The wind shifts.

Beat 2: Inciting incident
A small object catches the hero's eye. They kneel and pick it up.

Beat 3: Turn
The world subtly shifts \u2014 light changes, music swells.

Beat 4: Resolution
${p.title || "A new question"} now lingers in the air.`);
  }
  thumbForChar(c) {
    const id = c.referenceImages[0];
    const a = id ? this.assets.get(id) : void 0;
    return a ? `url(${a.thumbnail || a.uri})` : "linear-gradient(135deg, rgba(139,92,246,.4), rgba(34,211,238,.3))";
  }
  copyContract() {
    navigator.clipboard?.writeText(this.contractText());
  }
  downloadContract() {
    const blob = new Blob([this.contractText()], { type: this.format() === "yaml" ? "text/yaml" : "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${this.project()?.id ?? "contract"}.${this.format()}`;
    a.click();
    URL.revokeObjectURL(url);
  }
  generateContract() {
    const p = this.project();
    if (!p || p.scenes.length === 0) {
      this.active.set("scenes");
      return;
    }
    this.router.navigate(["/projects", p.id, "scenes", p.scenes[0].id]);
  }
  static \u0275fac = function WizardComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _WizardComponent)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _WizardComponent, selectors: [["app-wizard"]], decls: 2, vars: 1, consts: [["moodInput", ""], ["negInput", ""], [1, "wizard"], [1, "loading"], [1, "wiz-header"], ["routerLink", "/dashboard", 1, "back"], ["viewBox", "0 0 20 20", "width", "14", "height", "14", "fill", "none", "stroke", "currentColor", "stroke-width", "2"], ["d", "m12 5-5 5 5 5", "stroke-linecap", "round", "stroke-linejoin", "round"], [1, "row", 2, "gap", "0.55rem", "margin-top", "6px"], [1, "title-input", 3, "ngModelChange", "ngModel"], [1, "chip"], [1, "muted", 2, "font-size", "0.78rem", "margin-top", "4px"], [1, "row"], [1, "btn", "ghost", "sm", 3, "click"], ["d", "M3 10s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5Z"], ["cx", "10", "cy", "10", "r", "2.2"], [1, "btn", "cool", 3, "click"], ["d", "M5 3v14M5 3l5 5-5 5M5 17l5-5-5-5", "stroke-linecap", "round", "stroke-linejoin", "round"], [1, "wiz-body"], [1, "steps"], [1, "step", 3, "active", "done"], [1, "step-content", "card"], [1, "step-footer"], [1, "btn", "ghost", 3, "click", "disabled"], [1, "muted"], [1, "btn", "primary"], [1, "btn", "cool"], [1, "contract-preview", "card"], [1, "step", 3, "click"], [1, "step-no"], [1, "step-text"], [1, "step-title"], [1, "step-sub"], [1, "grid-3", 2, "margin-top", "1rem"], [1, "goal-card", 3, "selected"], [1, "divider"], [1, "grid-2"], [1, "field"], ["placeholder", "Untitled video", 3, "ngModelChange", "ngModel"], [3, "ngModelChange", "ngModel"], ["value", "en"], ["value", "hy"], ["value", "es"], ["value", "fr"], ["value", "de"], ["value", "ja"], [2, "margin-top", "0.9rem"], ["rows", "3", "placeholder", "A one-line pitch \u2014 the LLM uses this when proposing a script.", 3, "ngModelChange", "ngModel"], [1, "goal-card", 3, "click"], [1, "goal-emoji"], [1, "goal-title"], [1, "muted", 2, "font-size", "0.78rem"], ["value", "16:9"], ["value", "9:16"], ["value", "1:1"], ["value", "4:5"], ["value", "21:9"], ["value", "720p"], ["value", "1080p"], ["value", "2k"], ["value", "4k"], [3, "ngValue"], [1, "grid-2", 2, "margin-top", "0.9rem"], ["type", "number", "min", "6", "max", "600", 3, "ngModelChange", "ngModel"], ["value", "approve_each_scene"], ["value", "approve_at_end"], ["value", "auto"], [2, "margin-top", "1rem"], [1, "provider-grid"], [1, "provider-card", 3, "selected"], [1, "btn", "primary", "sm", 2, "margin-bottom", "0.55rem", 3, "click"], ["viewBox", "0 0 20 20", "width", "12", "height", "12", "fill", "none", "stroke", "currentColor", "stroke-width", "2.4"], ["d", "M10 2v3m0 10v3M2 10h3m10 0h3M4.2 4.2l2.1 2.1m7.4 7.4 2.1 2.1M4.2 15.8l2.1-2.1m7.4-7.4 2.1-2.1", "stroke-linecap", "round"], ["rows", "8", "placeholder", "Your script appears here. Edit freely or regenerate with another LLM.", 3, "ngModelChange", "ngModel"], [1, "provider-card", 3, "click"], [1, "row", 2, "justify-content", "space-between"], [1, "provider-name"], [1, "chip", "muted"], [1, "field", 2, "margin-top", "1rem"], ["placeholder", "cinematic fantasy drama", 3, "ngModelChange", "ngModel"], [1, "field", 2, "margin-top", "0.85rem"], [1, "chip-input"], [1, "chip", "cyan"], ["placeholder", "add a mood + Enter", 3, "keydown.enter"], [1, "grid-2", 2, "margin-top", "1rem"], ["type", "range", "min", "0", "max", "100", 1, "slider", 3, "ngModelChange", "ngModel"], [1, "row", 2, "justify-content", "space-between", "margin-top", "4px"], [1, "muted", 2, "font-size", "0.74rem"], [1, "mono"], [1, "palette-edit"], [1, "palette-item"], [1, "chip", "rose"], ["placeholder", "e.g. no distorted hands + Enter", 3, "keydown.enter"], [1, "x", 3, "click"], ["type", "color", 3, "ngModelChange", "ngModel"], [1, "mono", 2, "font-size", "0.78rem"], ["title", "Remove", 1, "iconbtn", "sm", 3, "click"], [1, "characters-grid", 2, "margin-top", "1rem"], [1, "character-card"], [1, "character-card", "add", 3, "click"], [1, "add-icon-large"], [2, "font-family", "var(--font-display)", "font-weight", "600", "margin-top", "0.5rem"], [1, "char-thumb"], [2, "padding", "0.85rem", "display", "flex", "flex-direction", "column", "gap", "0.5rem", "min-width", "0"], [1, "row", 2, "justify-content", "space-between", "align-items", "flex-start"], [2, "min-width", "0"], [1, "char-name"], [1, "muted", 2, "font-size", "0.78rem", "margin-top", "2px"], [1, "chip", "green"], [1, "char-meta"], [1, "btn", "sm"], [1, "btn", "sm", "danger", 3, "click"], [1, "row", 2, "margin-top", "0.9rem"], ["routerLink", "/assets", 1, "btn", "primary", "sm"], [1, "asset-strip", 2, "margin-top", "1rem"], [1, "asset-mini", 3, "background-image"], [1, "asset-mini"], [1, "asset-mini-tag"], [1, "btn", "primary", "sm", 3, "click"], [1, "scenes-list"], [1, "scene-row", 3, "routerLink"], [1, "empty-state"], [1, "scene-thumb"], [1, "scene-num"], [2, "flex", "1", "min-width", "0"], [1, "row", 2, "gap", "0.4rem"], [1, "muted", 2, "font-size", "0.85rem"], [1, "row", 2, "gap", "0.4rem", "margin-top", "0.5rem", "flex-wrap", "wrap"], [1, "iconbtn"], [1, "empty-art"], [2, "font-family", "var(--font-display)", "font-weight", "600"], [1, "row", 2, "margin-top", "1rem", "gap", "0.5rem"], [1, "btn", "sm", 3, "click"], [1, "spacer"], [1, "contract-pre"], [1, "checklist"], [1, "check-item"], [1, "dot"], [1, "btn", "primary", 3, "click"], [1, "row", 2, "justify-content", "space-between", "margin-bottom", "0.5rem"], [2, "font-family", "var(--font-display)"], [1, "row", 2, "gap", "0.3rem"], [1, "contract-pre", "side"], [1, "loader"], [2, "margin-left", "0.6rem"]], template: function WizardComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275conditionalCreate(0, WizardComponent_Conditional_0_Template, 44, 17, "div", 2)(1, WizardComponent_Conditional_1_Template, 4, 0, "div", 3);
    }
    if (rf & 2) {
      let tmp_0_0;
      \u0275\u0275conditional((tmp_0_0 = ctx.project()) ? 0 : 1, tmp_0_0);
    }
  }, dependencies: [FormsModule, NgSelectOption, \u0275NgSelectMultipleOption, DefaultValueAccessor, NumberValueAccessor, RangeValueAccessor, SelectControlValueAccessor, NgControlStatus, MinValidator, MaxValidator, NgModel, RouterLink, DatePipe, DecimalPipe], styles: ["\n[_nghost-%COMP%] {\n  display: block;\n}\n.wizard[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 1.2rem;\n  height: 100%;\n}\n.wiz-header[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: flex-start;\n  justify-content: space-between;\n  gap: 1rem;\n  flex-wrap: wrap;\n}\n.back[_ngcontent-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  gap: 0.4rem;\n  color: var(--text-3);\n  font-size: 0.78rem;\n  text-decoration: none;\n}\n.back[_ngcontent-%COMP%]:hover {\n  color: var(--text-1);\n}\n.title-input[_ngcontent-%COMP%] {\n  font-family: var(--font-display);\n  font-size: 1.55rem;\n  font-weight: 600;\n  letter-spacing: -0.01em;\n  background: transparent;\n  border: 1px solid transparent;\n  padding: 0.2rem 0.5rem;\n  border-radius: 8px;\n  width: auto;\n  max-width: 480px;\n}\n.title-input[_ngcontent-%COMP%]:hover {\n  border-color: var(--border);\n}\n.title-input[_ngcontent-%COMP%]:focus {\n  border-color: var(--neon-violet);\n  background: rgba(10, 13, 35, 0.6);\n}\n.wiz-body[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: 230px 1fr;\n  gap: 1.2rem;\n  flex: 1;\n  min-height: 0;\n}\n.wiz-body.with-preview[_ngcontent-%COMP%] {\n  grid-template-columns: 220px 1fr 380px;\n}\n.steps[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 0.3rem;\n  position: sticky;\n  top: 0;\n  align-self: start;\n}\n.step[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 0.7rem;\n  padding: 0.65rem 0.75rem;\n  border-radius: 12px;\n  border: 1px solid transparent;\n  background: transparent;\n  text-align: left;\n  cursor: pointer;\n  color: var(--text-2);\n  transition: all 0.18s;\n}\n.step[_ngcontent-%COMP%]:hover {\n  background: rgba(255, 255, 255, 0.03);\n  color: var(--text-1);\n}\n.step.active[_ngcontent-%COMP%] {\n  background: var(--bg-glass);\n  border-color: var(--border);\n  color: var(--text-1);\n  box-shadow: 0 4px 18px rgba(139, 92, 246, 0.12);\n}\n.step-no[_ngcontent-%COMP%] {\n  width: 26px;\n  height: 26px;\n  border-radius: 50%;\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  font-size: 0.78rem;\n  font-weight: 700;\n  background: rgba(140, 160, 255, 0.1);\n  color: var(--text-2);\n  flex-shrink: 0;\n  font-family: var(--font-display);\n}\n.step.active[_ngcontent-%COMP%]   .step-no[_ngcontent-%COMP%] {\n  background: var(--grad-primary);\n  color: white;\n}\n.step.done[_ngcontent-%COMP%]   .step-no[_ngcontent-%COMP%] {\n  background: rgba(52, 211, 153, 0.2);\n  color: var(--neon-green);\n}\n.step-text[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  line-height: 1.2;\n  min-width: 0;\n}\n.step-title[_ngcontent-%COMP%] {\n  font-weight: 600;\n  font-size: 0.88rem;\n  font-family: var(--font-display);\n}\n.step-sub[_ngcontent-%COMP%] {\n  font-size: 0.74rem;\n  color: var(--text-3);\n  margin-top: 2px;\n}\n.step-content[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  padding: 1.6rem 1.8rem;\n  min-height: 100%;\n}\n.step-content[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%] {\n  font-size: 1.45rem;\n  margin-bottom: 0.4rem;\n}\n.step-footer[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 1rem;\n  margin-top: auto;\n  padding-top: 1.5rem;\n  border-top: 1px dashed var(--border);\n}\n.contract-preview[_ngcontent-%COMP%] {\n  position: sticky;\n  top: 0;\n  align-self: start;\n  height: calc(100vh - 140px);\n  display: flex;\n  flex-direction: column;\n  padding: 0.85rem 1rem;\n}\n.contract-pre[_ngcontent-%COMP%] {\n  flex: 1;\n  margin: 0;\n  padding: 0.85rem 1rem;\n  border-radius: 12px;\n  background: rgba(0, 0, 0, 0.35);\n  border: 1px solid var(--border);\n  font-family: var(--font-mono);\n  font-size: 0.74rem;\n  color: var(--text-2);\n  line-height: 1.5;\n  overflow: auto;\n  white-space: pre;\n  max-height: 500px;\n}\n.contract-pre.side[_ngcontent-%COMP%] {\n  max-height: none;\n}\n.goal-card[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  align-items: flex-start;\n  text-align: left;\n  padding: 1rem;\n  background: rgba(255, 255, 255, 0.03);\n  border: 1px solid var(--border);\n  border-radius: var(--r-md);\n  cursor: pointer;\n  transition: all 0.18s;\n  color: var(--text-1);\n}\n.goal-card[_ngcontent-%COMP%]:hover {\n  border-color: var(--border-strong);\n  background: rgba(255, 255, 255, 0.05);\n}\n.goal-card.selected[_ngcontent-%COMP%] {\n  border-color: var(--neon-violet);\n  background:\n    linear-gradient(\n      135deg,\n      rgba(139, 92, 246, 0.12),\n      rgba(34, 211, 238, 0.08));\n  box-shadow: 0 0 0 1px rgba(139, 92, 246, 0.25), 0 6px 20px rgba(139, 92, 246, 0.18);\n}\n.goal-emoji[_ngcontent-%COMP%] {\n  font-size: 1.7rem;\n  margin-bottom: 0.35rem;\n}\n.goal-title[_ngcontent-%COMP%] {\n  font-family: var(--font-display);\n  font-weight: 600;\n  font-size: 0.95rem;\n}\n.provider-grid[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));\n  gap: 0.5rem;\n}\n.provider-card[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  align-items: stretch;\n  padding: 0.7rem 0.85rem;\n  background: rgba(255, 255, 255, 0.03);\n  border: 1px solid var(--border);\n  border-radius: 10px;\n  cursor: pointer;\n  text-align: left;\n  color: var(--text-1);\n  transition: all 0.18s;\n  gap: 0.4rem;\n}\n.provider-card[_ngcontent-%COMP%]:hover {\n  border-color: var(--border-strong);\n}\n.provider-card.selected[_ngcontent-%COMP%] {\n  border-color: var(--neon-cyan);\n  background:\n    linear-gradient(\n      135deg,\n      rgba(34, 211, 238, 0.12),\n      rgba(139, 92, 246, 0.06));\n}\n.provider-name[_ngcontent-%COMP%] {\n  font-family: var(--font-display);\n  font-weight: 600;\n}\n.chip-input[_ngcontent-%COMP%] {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.4rem;\n  align-items: center;\n  padding: 0.5rem;\n  border: 1px solid var(--border);\n  border-radius: var(--r-md);\n  background: rgba(10, 13, 35, 0.6);\n}\n.chip-input[_ngcontent-%COMP%]   input[_ngcontent-%COMP%] {\n  flex: 1;\n  min-width: 140px;\n  border: none;\n  background: transparent;\n  padding: 0;\n  font-size: 0.85rem;\n}\n.chip-input[_ngcontent-%COMP%]   input[_ngcontent-%COMP%]:focus {\n  box-shadow: none;\n}\n.chip[_ngcontent-%COMP%]   .x[_ngcontent-%COMP%] {\n  background: transparent;\n  border: none;\n  color: inherit;\n  margin-left: 0.2rem;\n  cursor: pointer;\n  font-size: 0.95rem;\n  line-height: 1;\n}\n.palette-edit[_ngcontent-%COMP%] {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.5rem;\n  align-items: center;\n}\n.palette-item[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 0.4rem;\n  padding: 0.25rem 0.45rem 0.25rem 0.25rem;\n  border: 1px solid var(--border);\n  border-radius: 8px;\n  background: rgba(255, 255, 255, 0.03);\n}\n.palette-item[_ngcontent-%COMP%]   input[type=color][_ngcontent-%COMP%] {\n  width: 28px;\n  height: 28px;\n  border: none;\n  background: transparent;\n  border-radius: 6px;\n  padding: 0;\n  cursor: pointer;\n}\n.iconbtn.sm[_ngcontent-%COMP%] {\n  width: 22px;\n  height: 22px;\n  font-size: 0.85rem;\n}\n.slider[_ngcontent-%COMP%] {\n  -webkit-appearance: none;\n  appearance: none;\n  width: 100%;\n  height: 6px;\n  border-radius: 99px;\n  background:\n    linear-gradient(\n      to right,\n      rgba(140, 160, 255, 0.2),\n      var(--neon-violet));\n  outline: none;\n  cursor: pointer;\n  border: none;\n  padding: 0;\n}\n.slider[_ngcontent-%COMP%]::-webkit-slider-thumb {\n  -webkit-appearance: none;\n  width: 18px;\n  height: 18px;\n  border-radius: 50%;\n  background: white;\n  cursor: pointer;\n  border: 3px solid var(--neon-violet);\n}\n.characters-grid[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));\n  gap: 0.85rem;\n}\n.character-card[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  background: rgba(255, 255, 255, 0.03);\n  border: 1px solid var(--border);\n  border-radius: var(--r-md);\n  overflow: hidden;\n  text-align: left;\n  cursor: pointer;\n  color: inherit;\n}\n.character-card.add[_ngcontent-%COMP%] {\n  align-items: center;\n  justify-content: center;\n  padding: 1.5rem;\n  border-style: dashed;\n  background: rgba(139, 92, 246, 0.06);\n}\n.add-icon-large[_ngcontent-%COMP%] {\n  width: 44px;\n  height: 44px;\n  border-radius: 50%;\n  background: var(--grad-primary);\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  color: white;\n  font-size: 1.4rem;\n  font-weight: 700;\n  box-shadow: 0 0 24px rgba(139, 92, 246, 0.4);\n}\n.char-thumb[_ngcontent-%COMP%] {\n  height: 130px;\n  background-size: cover;\n  background-position: center;\n}\n.char-name[_ngcontent-%COMP%] {\n  font-family: var(--font-display);\n  font-weight: 600;\n  font-size: 1rem;\n}\n.char-meta[_ngcontent-%COMP%] {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.3rem;\n}\n.asset-strip[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));\n  gap: 0.5rem;\n}\n.asset-mini[_ngcontent-%COMP%] {\n  aspect-ratio: 4/3;\n  background-color: rgba(140, 160, 255, 0.05);\n  background-size: cover;\n  background-position: center;\n  border: 1px solid var(--border);\n  border-radius: 10px;\n  position: relative;\n  overflow: hidden;\n}\n.asset-mini-tag[_ngcontent-%COMP%] {\n  position: absolute;\n  top: 6px;\n  left: 6px;\n  padding: 0.15rem 0.45rem;\n  border-radius: 99px;\n  background: rgba(0, 0, 0, 0.55);\n  color: white;\n  font-size: 0.65rem;\n  text-transform: uppercase;\n  letter-spacing: 0.08em;\n}\n.scenes-list[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 0.55rem;\n  margin-top: 1rem;\n}\n.scene-row[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 0.85rem;\n  padding: 0.7rem 0.85rem;\n  border: 1px solid var(--border);\n  border-radius: var(--r-md);\n  background: rgba(255, 255, 255, 0.03);\n  text-decoration: none;\n  color: inherit;\n  transition: all 0.18s;\n}\n.scene-row[_ngcontent-%COMP%]:hover {\n  border-color: rgba(34, 211, 238, 0.4);\n  transform: translateX(2px);\n}\n.scene-thumb[_ngcontent-%COMP%] {\n  width: 80px;\n  height: 56px;\n  border-radius: 8px;\n  background-size: cover;\n  background-position: center;\n  background-color: rgba(139, 92, 246, 0.15);\n  position: relative;\n  flex-shrink: 0;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n}\n.scene-num[_ngcontent-%COMP%] {\n  font-family: var(--font-display);\n  font-size: 1.1rem;\n  font-weight: 700;\n  color: white;\n  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.5);\n}\n.empty-state[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  padding: 2.5rem;\n  border: 1px dashed var(--border);\n  border-radius: var(--r-lg);\n  text-align: center;\n  gap: 0.6rem;\n  background: rgba(255, 255, 255, 0.02);\n}\n.empty-art[_ngcontent-%COMP%] {\n  font-size: 2.2rem;\n}\n.checklist[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));\n  gap: 0.4rem;\n  margin-top: 1rem;\n}\n.check-item[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n  padding: 0.55rem 0.75rem;\n  border: 1px solid var(--border);\n  border-radius: 10px;\n  font-size: 0.85rem;\n  color: var(--text-3);\n}\n.check-item[_ngcontent-%COMP%]   .dot[_ngcontent-%COMP%] {\n  width: 8px;\n  height: 8px;\n  border-radius: 50%;\n  background: var(--text-mute);\n}\n.check-item.ok[_ngcontent-%COMP%] {\n  color: var(--neon-green);\n  border-color: rgba(52, 211, 153, 0.3);\n}\n.check-item.ok[_ngcontent-%COMP%]   .dot[_ngcontent-%COMP%] {\n  background: var(--neon-green);\n  box-shadow: 0 0 10px var(--neon-green);\n}\n.loading[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  height: 60vh;\n  color: var(--text-2);\n}\n@media (max-width: 1100px) {\n  .wiz-body[_ngcontent-%COMP%] {\n    grid-template-columns: 1fr;\n  }\n  .wiz-body.with-preview[_ngcontent-%COMP%] {\n    grid-template-columns: 1fr;\n  }\n  .contract-preview[_ngcontent-%COMP%] {\n    position: relative;\n    height: auto;\n  }\n  .steps[_ngcontent-%COMP%] {\n    flex-direction: row;\n    overflow-x: auto;\n    padding-bottom: 0.5rem;\n  }\n  .step[_ngcontent-%COMP%] {\n    flex-shrink: 0;\n    min-width: 200px;\n  }\n}\n/*# sourceMappingURL=wizard.component.css.map */"], changeDetection: 0 });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(WizardComponent, [{
    type: Component,
    args: [{ selector: "app-wizard", imports: [FormsModule, RouterLink, DatePipe, DecimalPipe], changeDetection: ChangeDetectionStrategy.OnPush, template: `
    @if (project(); as p) {
      <div class="wizard">
        <header class="wiz-header">
          <div>
            <a class="back" routerLink="/dashboard">
              <svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                <path d="m12 5-5 5 5 5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              Dashboard
            </a>
            <div class="row" style="gap: 0.55rem; margin-top: 6px">
              <input class="title-input" [ngModel]="p.title" (ngModelChange)="updateField('title', $event)" />
              <span class="chip" [class]="statusTone(p.status)">{{ p.status }}</span>
            </div>
            <div class="muted" style="font-size: 0.78rem; margin-top: 4px">
              Last edited {{ p.updatedAt | date: 'medium' }}
            </div>
          </div>
          <div class="row">
            <button class="btn ghost sm" (click)="togglePreview()">
              <svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 10s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5Z"/>
                <circle cx="10" cy="10" r="2.2"/>
              </svg>
              {{ previewOpen() ? 'Hide' : 'Show' }} contract
            </button>
            <button class="btn cool" (click)="generateContract()">
              <svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 3v14M5 3l5 5-5 5M5 17l5-5-5-5" stroke-linecap="round" stroke-linejoin="round"/></svg>
              Generate contract
            </button>
          </div>
        </header>

        <div class="wiz-body" [class.with-preview]="previewOpen()">
          <aside class="steps">
            @for (s of steps; track s.key; let i = $index) {
              <button
                class="step"
                [class.active]="active() === s.key"
                [class.done]="completed(s.key, p)"
                (click)="setStep(s.key)"
              >
                <span class="step-no">{{ completed(s.key, p) ? '\u2713' : i + 1 }}</span>
                <div class="step-text">
                  <div class="step-title">{{ s.label }}</div>
                  <div class="step-sub">{{ s.sub }}</div>
                </div>
              </button>
            }
          </aside>

          <section class="step-content card">
            @switch (active()) {
              @case ('goal') {
                <h2>Project goal</h2>
                <p class="muted">Pick the kind of video you're orchestrating. This drives default models, pacing, and templates.</p>
                <div class="grid-3" style="margin-top: 1rem">
                  @for (g of goals; track g.key) {
                    <button
                      class="goal-card"
                      [class.selected]="p.goal === g.key"
                      (click)="updateField('goal', g.key)"
                    >
                      <div class="goal-emoji">{{ g.emoji }}</div>
                      <div class="goal-title">{{ g.label }}</div>
                      <div class="muted" style="font-size: 0.78rem">{{ g.sub }}</div>
                    </button>
                  }
                </div>
                <div class="divider"></div>
                <div class="grid-2">
                  <div>
                    <label class="field">Title</label>
                    <input [ngModel]="p.title" (ngModelChange)="updateField('title', $event)" placeholder="Untitled video"/>
                  </div>
                  <div>
                    <label class="field">Output language</label>
                    <select [ngModel]="p.output.language" (ngModelChange)="updateOutput('language', $event)">
                      <option value="en">English</option>
                      <option value="hy">Armenian</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                      <option value="ja">Japanese</option>
                    </select>
                  </div>
                </div>
                <div style="margin-top: 0.9rem">
                  <label class="field">Description</label>
                  <textarea [ngModel]="p.description" (ngModelChange)="updateField('description', $event)" rows="3" placeholder="A one-line pitch \u2014 the LLM uses this when proposing a script."></textarea>
                </div>
              }

              @case ('script') {
                <h2>Script & structure</h2>
                <p class="muted">Decide the LLM, scene count, pacing, and tone. The system can generate a draft script you can edit.</p>
                <div class="grid-3" style="margin-top: 1rem">
                  <div>
                    <label class="field">Aspect ratio</label>
                    <select [ngModel]="p.output.aspectRatio" (ngModelChange)="updateOutput('aspectRatio', $event)">
                      <option value="16:9">16:9 \u2014 landscape</option>
                      <option value="9:16">9:16 \u2014 vertical</option>
                      <option value="1:1">1:1 \u2014 square</option>
                      <option value="4:5">4:5 \u2014 feed</option>
                      <option value="21:9">21:9 \u2014 cinematic</option>
                    </select>
                  </div>
                  <div>
                    <label class="field">Resolution</label>
                    <select [ngModel]="p.output.resolution" (ngModelChange)="updateOutput('resolution', $event)">
                      <option value="720p">720p</option>
                      <option value="1080p">1080p</option>
                      <option value="2k">2K</option>
                      <option value="4k">4K</option>
                    </select>
                  </div>
                  <div>
                    <label class="field">FPS</label>
                    <select [ngModel]="p.output.fps" (ngModelChange)="updateOutput('fps', +$event)">
                      <option [ngValue]="24">24 fps \xB7 cinematic</option>
                      <option [ngValue]="30">30 fps \xB7 standard</option>
                      <option [ngValue]="60">60 fps \xB7 smooth</option>
                    </select>
                  </div>
                </div>
                <div class="grid-2" style="margin-top: 0.9rem">
                  <div>
                    <label class="field">Target duration (seconds)</label>
                    <input type="number" [ngModel]="p.output.targetDurationSec" (ngModelChange)="updateOutput('targetDurationSec', +$event)" min="6" max="600"/>
                  </div>
                  <div>
                    <label class="field">Approval policy</label>
                    <select [ngModel]="p.orchestration.approvalPolicy" (ngModelChange)="updateOrchestration('approvalPolicy', $event)">
                      <option value="approve_each_scene">Approve each scene</option>
                      <option value="approve_at_end">Approve at end</option>
                      <option value="auto">Auto-approve</option>
                    </select>
                  </div>
                </div>
                <div style="margin-top: 1rem">
                  <label class="field">Choose script LLM</label>
                  <div class="provider-grid">
                    @for (m of scriptModels(); track m.id) {
                      <button class="provider-card"
                        [class.selected]="p.models.script.model === m.name"
                        (click)="updateModel('script', m.provider, m.name)">
                        <div class="row" style="justify-content: space-between">
                          <span class="provider-name">{{ m.name }}</span>
                          <span class="chip muted">{{ m.provider }}</span>
                        </div>
                        <div class="muted" style="font-size: 0.78rem">{{ m.description }}</div>
                      </button>
                    }
                  </div>
                </div>
                <div style="margin-top: 1rem">
                  <label class="field">Generated draft script</label>
                  <button class="btn primary sm" (click)="mockGenerateScript()" style="margin-bottom: 0.55rem">
                    <svg viewBox="0 0 20 20" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M10 2v3m0 10v3M2 10h3m10 0h3M4.2 4.2l2.1 2.1m7.4 7.4 2.1 2.1M4.2 15.8l2.1-2.1m7.4-7.4 2.1-2.1" stroke-linecap="round"/></svg>
                    Generate with {{ p.models.script.model }}
                  </button>
                  <textarea rows="8" [ngModel]="draftScript()" (ngModelChange)="draftScript.set($event)"
                    placeholder="Your script appears here. Edit freely or regenerate with another LLM."></textarea>
                </div>
              }

              @case ('style') {
                <h2>Global style</h2>
                <p class="muted">A consistent look + feel: realism, mood, palette, and forbidden elements applied across every scene.</p>

                <label class="field" style="margin-top: 1rem">Genre</label>
                <input [ngModel]="p.creativeDirection.genre" (ngModelChange)="updateCreative('genre', $event)" placeholder="cinematic fantasy drama"/>

                <label class="field" style="margin-top: 0.85rem">Mood</label>
                <div class="chip-input">
                  @for (m of p.creativeDirection.mood; track m) {
                    <span class="chip cyan">{{ m }} <button class="x" (click)="removeMood(m)">\xD7</button></span>
                  }
                  <input #moodInput placeholder="add a mood + Enter" (keydown.enter)="addMood(moodInput.value); moodInput.value = ''"/>
                </div>

                <div class="grid-2" style="margin-top: 1rem">
                  <div>
                    <label class="field">Realism level</label>
                    <input type="range" min="0" max="100" [ngModel]="p.creativeDirection.realismLevel * 100"
                      (ngModelChange)="updateCreative('realismLevel', $event / 100)" class="slider"/>
                    <div class="row" style="justify-content: space-between; margin-top: 4px">
                      <span class="muted" style="font-size: 0.74rem">Stylized</span>
                      <span class="mono">{{ (p.creativeDirection.realismLevel * 100) | number: '1.0-0' }}%</span>
                      <span class="muted" style="font-size: 0.74rem">Photo-real</span>
                    </div>
                  </div>
                  <div>
                    <label class="field">Title font</label>
                    <select [ngModel]="p.creativeDirection.fonts.title" (ngModelChange)="updateFonts('title', $event)">
                      <option>Inter</option>
                      <option>Montserrat</option>
                      <option>Poppins</option>
                      <option>Orbitron</option>
                      <option>Space Grotesk</option>
                      <option>Playfair Display</option>
                    </select>
                  </div>
                </div>

                <label class="field" style="margin-top: 1rem">Color palette</label>
                <div class="palette-edit">
                  @for (c of p.creativeDirection.colorPalette; track $index) {
                    <div class="palette-item">
                      <input type="color" [ngModel]="c" (ngModelChange)="setPaletteColor($index, $event)"/>
                      <span class="mono" style="font-size: 0.78rem">{{ c }}</span>
                      <button class="iconbtn sm" (click)="removePaletteColor($index)" title="Remove">\xD7</button>
                    </div>
                  }
                  <button class="btn ghost sm" (click)="addPaletteColor()">+ Add color</button>
                </div>

                <label class="field" style="margin-top: 1rem">Negative rules</label>
                <div class="chip-input">
                  @for (r of p.creativeDirection.negativeRules; track r) {
                    <span class="chip rose">{{ r }} <button class="x" (click)="removeNegative(r)">\xD7</button></span>
                  }
                  <input #negInput placeholder="e.g. no distorted hands + Enter" (keydown.enter)="addNegative(negInput.value); negInput.value = ''"/>
                </div>
              }

              @case ('characters') {
                <h2>Characters & avatars</h2>
                <p class="muted">Reusable characters with continuity locks. The system reuses these across all scenes.</p>

                <div class="characters-grid" style="margin-top: 1rem">
                  @for (c of p.characters; track c.id) {
                    <div class="character-card">
                      <div class="char-thumb" [style.background-image]="thumbForChar(c)"></div>
                      <div style="padding: 0.85rem; display: flex; flex-direction: column; gap: 0.5rem; min-width: 0">
                        <div class="row" style="justify-content: space-between; align-items: flex-start">
                          <div style="min-width: 0">
                            <div class="char-name">{{ c.name }}</div>
                            <div class="muted" style="font-size: 0.78rem; margin-top: 2px">{{ c.description }}</div>
                          </div>
                          @if (c.continuityLock) { <span class="chip green">\u{1F512} Locked</span> }
                        </div>
                        <div class="char-meta">
                          <span class="chip muted">{{ c.voice.provider }}</span>
                          <span class="chip muted">{{ c.voice.accent }}</span>
                        </div>
                        <div class="row">
                          <button class="btn sm">Edit</button>
                          <button class="btn sm danger" (click)="removeCharacter(c.id)">Remove</button>
                        </div>
                      </div>
                    </div>
                  }
                  <button class="character-card add" (click)="addCharacter()">
                    <div class="add-icon-large">+</div>
                    <div style="font-family: var(--font-display); font-weight: 600; margin-top: 0.5rem">Add character</div>
                    <div class="muted" style="font-size: 0.78rem">Generate or upload reference</div>
                  </button>
                </div>
              }

              @case ('assets') {
                <h2>Assets</h2>
                <p class="muted">Bring your own \u2014 or let AI generate. Each asset stores prompt, provider, and version.</p>
                <div class="row" style="margin-top: 0.9rem">
                  <a routerLink="/assets" class="btn primary sm">Open asset library</a>
                  <button class="btn sm">Upload files</button>
                  <button class="btn sm">Connect Google Drive</button>
                  <button class="btn sm">Stock providers</button>
                </div>
                <div class="asset-strip" style="margin-top: 1rem">
                  @for (a of assets.assets().slice(0, 12); track a.id) {
                    <div class="asset-mini" [style.background-image]="'url(' + (a.thumbnail || a.uri) + ')'">
                      <span class="asset-mini-tag">{{ a.type }}</span>
                    </div>
                  }
                </div>
              }

              @case ('scenes') {
                <div class="row" style="justify-content: space-between">
                  <div>
                    <h2>Scenes</h2>
                    <p class="muted">Plan and order your scenes. Each scene is a fully-typed block in the contract.</p>
                  </div>
                  <button class="btn primary sm" (click)="addScene()">+ Add scene</button>
                </div>
                <div class="scenes-list">
                  @for (s of p.scenes; track s.id) {
                    <a class="scene-row" [routerLink]="['/projects', p.id, 'scenes', s.id]">
                      <div class="scene-thumb" [style.background-image]="s.thumbnailUrl ? 'url(' + s.thumbnailUrl + ')' : ''">
                        <span class="scene-num">{{ s.index + 1 }}</span>
                      </div>
                      <div style="flex: 1; min-width: 0">
                        <div class="row" style="gap: 0.4rem">
                          <strong>{{ s.title }}</strong>
                          <span class="chip" [class]="sceneStatusTone(s.review.status)">{{ s.review.status }}</span>
                        </div>
                        <div class="muted" style="font-size: 0.85rem">{{ s.objective }}</div>
                        <div class="row" style="gap: 0.4rem; margin-top: 0.5rem; flex-wrap: wrap">
                          <span class="chip muted">{{ s.durationSec }}s</span>
                          <span class="chip muted">{{ s.camera.shotType }}</span>
                          <span class="chip muted">{{ s.objects.length }} objects</span>
                          <span class="chip cyan">~{{ s.costEstimate ?? 0 }} credits</span>
                        </div>
                      </div>
                      <div class="row">
                        <button class="iconbtn">\u2192</button>
                      </div>
                    </a>
                  }
                  @if (p.scenes.length === 0) {
                    <div class="empty-state">
                      <div class="empty-art">\u{1F3AC}</div>
                      <div style="font-family: var(--font-display); font-weight: 600">No scenes yet</div>
                      <p class="muted" style="font-size: 0.85rem">Generate from script or add manually.</p>
                      <button class="btn primary sm" (click)="addScene()">+ Add first scene</button>
                    </div>
                  }
                </div>
              }

              @case ('review') {
                <h2>Review contract</h2>
                <p class="muted">Inspect, validate, and export your normalized contract. This file becomes the source of truth.</p>
                <div class="row" style="margin-top: 1rem; gap: 0.5rem">
                  <button class="btn sm" [class.primary]="format() === 'yaml'" (click)="format.set('yaml')">YAML</button>
                  <button class="btn sm" [class.primary]="format() === 'json'" (click)="format.set('json')">JSON</button>
                  <div class="spacer"></div>
                  <button class="btn sm" (click)="copyContract()">Copy</button>
                  <button class="btn sm" (click)="downloadContract()">Download</button>
                </div>
                <pre class="contract-pre">{{ contractText() }}</pre>
                <div class="checklist">
                  <div class="check-item" [class.ok]="!!p.title"><span class="dot"></span> Title set</div>
                  <div class="check-item" [class.ok]="!!p.creativeDirection.genre"><span class="dot"></span> Genre defined</div>
                  <div class="check-item" [class.ok]="p.characters.length > 0"><span class="dot"></span> At least one character</div>
                  <div class="check-item" [class.ok]="p.scenes.length > 0"><span class="dot"></span> At least one scene</div>
                  <div class="check-item" [class.ok]="p.creativeDirection.colorPalette.length >= 2"><span class="dot"></span> 2+ palette colors</div>
                </div>
              }
            }

            <div class="step-footer">
              <button class="btn ghost" (click)="prev()" [disabled]="!hasPrev()">\u2190 Back</button>
              <span class="muted">Step {{ stepIndex() + 1 }} / {{ steps.length }}</span>
              @if (active() !== 'review') {
                <button class="btn primary" (click)="next()">Continue \u2192</button>
              } @else {
                <button class="btn cool" (click)="generateContract()">\u{1F680} Generate Scene 1</button>
              }
            </div>
          </section>

          @if (previewOpen()) {
            <aside class="contract-preview card">
              <div class="row" style="justify-content: space-between; margin-bottom: 0.5rem">
                <div class="row" style="gap: 0.4rem">
                  <span class="chip cyan">live</span>
                  <strong style="font-family: var(--font-display)">Contract</strong>
                </div>
                <div class="row" style="gap: 0.3rem">
                  <button class="btn sm" [class.primary]="format() === 'yaml'" (click)="format.set('yaml')">YAML</button>
                  <button class="btn sm" [class.primary]="format() === 'json'" (click)="format.set('json')">JSON</button>
                </div>
              </div>
              <pre class="contract-pre side">{{ contractText() }}</pre>
            </aside>
          }
        </div>
      </div>
    } @else {
      <div class="loading">
        <span class="loader"></span>
        <span style="margin-left: 0.6rem">Loading project\u2026</span>
      </div>
    }
  `, styles: ["/* src/app/features/wizard/wizard.component.scss */\n:host {\n  display: block;\n}\n.wizard {\n  display: flex;\n  flex-direction: column;\n  gap: 1.2rem;\n  height: 100%;\n}\n.wiz-header {\n  display: flex;\n  align-items: flex-start;\n  justify-content: space-between;\n  gap: 1rem;\n  flex-wrap: wrap;\n}\n.back {\n  display: inline-flex;\n  align-items: center;\n  gap: 0.4rem;\n  color: var(--text-3);\n  font-size: 0.78rem;\n  text-decoration: none;\n}\n.back:hover {\n  color: var(--text-1);\n}\n.title-input {\n  font-family: var(--font-display);\n  font-size: 1.55rem;\n  font-weight: 600;\n  letter-spacing: -0.01em;\n  background: transparent;\n  border: 1px solid transparent;\n  padding: 0.2rem 0.5rem;\n  border-radius: 8px;\n  width: auto;\n  max-width: 480px;\n}\n.title-input:hover {\n  border-color: var(--border);\n}\n.title-input:focus {\n  border-color: var(--neon-violet);\n  background: rgba(10, 13, 35, 0.6);\n}\n.wiz-body {\n  display: grid;\n  grid-template-columns: 230px 1fr;\n  gap: 1.2rem;\n  flex: 1;\n  min-height: 0;\n}\n.wiz-body.with-preview {\n  grid-template-columns: 220px 1fr 380px;\n}\n.steps {\n  display: flex;\n  flex-direction: column;\n  gap: 0.3rem;\n  position: sticky;\n  top: 0;\n  align-self: start;\n}\n.step {\n  display: flex;\n  align-items: center;\n  gap: 0.7rem;\n  padding: 0.65rem 0.75rem;\n  border-radius: 12px;\n  border: 1px solid transparent;\n  background: transparent;\n  text-align: left;\n  cursor: pointer;\n  color: var(--text-2);\n  transition: all 0.18s;\n}\n.step:hover {\n  background: rgba(255, 255, 255, 0.03);\n  color: var(--text-1);\n}\n.step.active {\n  background: var(--bg-glass);\n  border-color: var(--border);\n  color: var(--text-1);\n  box-shadow: 0 4px 18px rgba(139, 92, 246, 0.12);\n}\n.step-no {\n  width: 26px;\n  height: 26px;\n  border-radius: 50%;\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  font-size: 0.78rem;\n  font-weight: 700;\n  background: rgba(140, 160, 255, 0.1);\n  color: var(--text-2);\n  flex-shrink: 0;\n  font-family: var(--font-display);\n}\n.step.active .step-no {\n  background: var(--grad-primary);\n  color: white;\n}\n.step.done .step-no {\n  background: rgba(52, 211, 153, 0.2);\n  color: var(--neon-green);\n}\n.step-text {\n  display: flex;\n  flex-direction: column;\n  line-height: 1.2;\n  min-width: 0;\n}\n.step-title {\n  font-weight: 600;\n  font-size: 0.88rem;\n  font-family: var(--font-display);\n}\n.step-sub {\n  font-size: 0.74rem;\n  color: var(--text-3);\n  margin-top: 2px;\n}\n.step-content {\n  display: flex;\n  flex-direction: column;\n  padding: 1.6rem 1.8rem;\n  min-height: 100%;\n}\n.step-content h2 {\n  font-size: 1.45rem;\n  margin-bottom: 0.4rem;\n}\n.step-footer {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 1rem;\n  margin-top: auto;\n  padding-top: 1.5rem;\n  border-top: 1px dashed var(--border);\n}\n.contract-preview {\n  position: sticky;\n  top: 0;\n  align-self: start;\n  height: calc(100vh - 140px);\n  display: flex;\n  flex-direction: column;\n  padding: 0.85rem 1rem;\n}\n.contract-pre {\n  flex: 1;\n  margin: 0;\n  padding: 0.85rem 1rem;\n  border-radius: 12px;\n  background: rgba(0, 0, 0, 0.35);\n  border: 1px solid var(--border);\n  font-family: var(--font-mono);\n  font-size: 0.74rem;\n  color: var(--text-2);\n  line-height: 1.5;\n  overflow: auto;\n  white-space: pre;\n  max-height: 500px;\n}\n.contract-pre.side {\n  max-height: none;\n}\n.goal-card {\n  display: flex;\n  flex-direction: column;\n  align-items: flex-start;\n  text-align: left;\n  padding: 1rem;\n  background: rgba(255, 255, 255, 0.03);\n  border: 1px solid var(--border);\n  border-radius: var(--r-md);\n  cursor: pointer;\n  transition: all 0.18s;\n  color: var(--text-1);\n}\n.goal-card:hover {\n  border-color: var(--border-strong);\n  background: rgba(255, 255, 255, 0.05);\n}\n.goal-card.selected {\n  border-color: var(--neon-violet);\n  background:\n    linear-gradient(\n      135deg,\n      rgba(139, 92, 246, 0.12),\n      rgba(34, 211, 238, 0.08));\n  box-shadow: 0 0 0 1px rgba(139, 92, 246, 0.25), 0 6px 20px rgba(139, 92, 246, 0.18);\n}\n.goal-emoji {\n  font-size: 1.7rem;\n  margin-bottom: 0.35rem;\n}\n.goal-title {\n  font-family: var(--font-display);\n  font-weight: 600;\n  font-size: 0.95rem;\n}\n.provider-grid {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));\n  gap: 0.5rem;\n}\n.provider-card {\n  display: flex;\n  flex-direction: column;\n  align-items: stretch;\n  padding: 0.7rem 0.85rem;\n  background: rgba(255, 255, 255, 0.03);\n  border: 1px solid var(--border);\n  border-radius: 10px;\n  cursor: pointer;\n  text-align: left;\n  color: var(--text-1);\n  transition: all 0.18s;\n  gap: 0.4rem;\n}\n.provider-card:hover {\n  border-color: var(--border-strong);\n}\n.provider-card.selected {\n  border-color: var(--neon-cyan);\n  background:\n    linear-gradient(\n      135deg,\n      rgba(34, 211, 238, 0.12),\n      rgba(139, 92, 246, 0.06));\n}\n.provider-name {\n  font-family: var(--font-display);\n  font-weight: 600;\n}\n.chip-input {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.4rem;\n  align-items: center;\n  padding: 0.5rem;\n  border: 1px solid var(--border);\n  border-radius: var(--r-md);\n  background: rgba(10, 13, 35, 0.6);\n}\n.chip-input input {\n  flex: 1;\n  min-width: 140px;\n  border: none;\n  background: transparent;\n  padding: 0;\n  font-size: 0.85rem;\n}\n.chip-input input:focus {\n  box-shadow: none;\n}\n.chip .x {\n  background: transparent;\n  border: none;\n  color: inherit;\n  margin-left: 0.2rem;\n  cursor: pointer;\n  font-size: 0.95rem;\n  line-height: 1;\n}\n.palette-edit {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.5rem;\n  align-items: center;\n}\n.palette-item {\n  display: flex;\n  align-items: center;\n  gap: 0.4rem;\n  padding: 0.25rem 0.45rem 0.25rem 0.25rem;\n  border: 1px solid var(--border);\n  border-radius: 8px;\n  background: rgba(255, 255, 255, 0.03);\n}\n.palette-item input[type=color] {\n  width: 28px;\n  height: 28px;\n  border: none;\n  background: transparent;\n  border-radius: 6px;\n  padding: 0;\n  cursor: pointer;\n}\n.iconbtn.sm {\n  width: 22px;\n  height: 22px;\n  font-size: 0.85rem;\n}\n.slider {\n  -webkit-appearance: none;\n  appearance: none;\n  width: 100%;\n  height: 6px;\n  border-radius: 99px;\n  background:\n    linear-gradient(\n      to right,\n      rgba(140, 160, 255, 0.2),\n      var(--neon-violet));\n  outline: none;\n  cursor: pointer;\n  border: none;\n  padding: 0;\n}\n.slider::-webkit-slider-thumb {\n  -webkit-appearance: none;\n  width: 18px;\n  height: 18px;\n  border-radius: 50%;\n  background: white;\n  cursor: pointer;\n  border: 3px solid var(--neon-violet);\n}\n.characters-grid {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));\n  gap: 0.85rem;\n}\n.character-card {\n  display: flex;\n  flex-direction: column;\n  background: rgba(255, 255, 255, 0.03);\n  border: 1px solid var(--border);\n  border-radius: var(--r-md);\n  overflow: hidden;\n  text-align: left;\n  cursor: pointer;\n  color: inherit;\n}\n.character-card.add {\n  align-items: center;\n  justify-content: center;\n  padding: 1.5rem;\n  border-style: dashed;\n  background: rgba(139, 92, 246, 0.06);\n}\n.add-icon-large {\n  width: 44px;\n  height: 44px;\n  border-radius: 50%;\n  background: var(--grad-primary);\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  color: white;\n  font-size: 1.4rem;\n  font-weight: 700;\n  box-shadow: 0 0 24px rgba(139, 92, 246, 0.4);\n}\n.char-thumb {\n  height: 130px;\n  background-size: cover;\n  background-position: center;\n}\n.char-name {\n  font-family: var(--font-display);\n  font-weight: 600;\n  font-size: 1rem;\n}\n.char-meta {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.3rem;\n}\n.asset-strip {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));\n  gap: 0.5rem;\n}\n.asset-mini {\n  aspect-ratio: 4/3;\n  background-color: rgba(140, 160, 255, 0.05);\n  background-size: cover;\n  background-position: center;\n  border: 1px solid var(--border);\n  border-radius: 10px;\n  position: relative;\n  overflow: hidden;\n}\n.asset-mini-tag {\n  position: absolute;\n  top: 6px;\n  left: 6px;\n  padding: 0.15rem 0.45rem;\n  border-radius: 99px;\n  background: rgba(0, 0, 0, 0.55);\n  color: white;\n  font-size: 0.65rem;\n  text-transform: uppercase;\n  letter-spacing: 0.08em;\n}\n.scenes-list {\n  display: flex;\n  flex-direction: column;\n  gap: 0.55rem;\n  margin-top: 1rem;\n}\n.scene-row {\n  display: flex;\n  align-items: center;\n  gap: 0.85rem;\n  padding: 0.7rem 0.85rem;\n  border: 1px solid var(--border);\n  border-radius: var(--r-md);\n  background: rgba(255, 255, 255, 0.03);\n  text-decoration: none;\n  color: inherit;\n  transition: all 0.18s;\n}\n.scene-row:hover {\n  border-color: rgba(34, 211, 238, 0.4);\n  transform: translateX(2px);\n}\n.scene-thumb {\n  width: 80px;\n  height: 56px;\n  border-radius: 8px;\n  background-size: cover;\n  background-position: center;\n  background-color: rgba(139, 92, 246, 0.15);\n  position: relative;\n  flex-shrink: 0;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n}\n.scene-num {\n  font-family: var(--font-display);\n  font-size: 1.1rem;\n  font-weight: 700;\n  color: white;\n  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.5);\n}\n.empty-state {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  padding: 2.5rem;\n  border: 1px dashed var(--border);\n  border-radius: var(--r-lg);\n  text-align: center;\n  gap: 0.6rem;\n  background: rgba(255, 255, 255, 0.02);\n}\n.empty-art {\n  font-size: 2.2rem;\n}\n.checklist {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));\n  gap: 0.4rem;\n  margin-top: 1rem;\n}\n.check-item {\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n  padding: 0.55rem 0.75rem;\n  border: 1px solid var(--border);\n  border-radius: 10px;\n  font-size: 0.85rem;\n  color: var(--text-3);\n}\n.check-item .dot {\n  width: 8px;\n  height: 8px;\n  border-radius: 50%;\n  background: var(--text-mute);\n}\n.check-item.ok {\n  color: var(--neon-green);\n  border-color: rgba(52, 211, 153, 0.3);\n}\n.check-item.ok .dot {\n  background: var(--neon-green);\n  box-shadow: 0 0 10px var(--neon-green);\n}\n.loading {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  height: 60vh;\n  color: var(--text-2);\n}\n@media (max-width: 1100px) {\n  .wiz-body {\n    grid-template-columns: 1fr;\n  }\n  .wiz-body.with-preview {\n    grid-template-columns: 1fr;\n  }\n  .contract-preview {\n    position: relative;\n    height: auto;\n  }\n  .steps {\n    flex-direction: row;\n    overflow-x: auto;\n    padding-bottom: 0.5rem;\n  }\n  .step {\n    flex-shrink: 0;\n    min-width: 200px;\n  }\n}\n/*# sourceMappingURL=wizard.component.css.map */\n"] }]
  }], () => [], null);
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(WizardComponent, { className: "WizardComponent", filePath: "src/app/features/wizard/wizard.component.ts", lineNumber: 412 });
})();
export {
  WizardComponent
};
//# sourceMappingURL=chunk-4MLPUW56.js.map
