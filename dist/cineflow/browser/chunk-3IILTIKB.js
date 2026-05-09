import {
  ModelsService
} from "./chunk-UHEGWTC6.js";
import {
  FormsModule
} from "./chunk-T3VEDOVQ.js";
import "./chunk-5UP4TGNH.js";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
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
  ɵɵdomElement,
  ɵɵdomElementEnd,
  ɵɵdomElementStart,
  ɵɵdomListener,
  ɵɵgetCurrentView,
  ɵɵnextContext,
  ɵɵrepeater,
  ɵɵrepeaterCreate,
  ɵɵrepeaterTrackByIdentity,
  ɵɵresetView,
  ɵɵrestoreView,
  ɵɵtext,
  ɵɵtextInterpolate,
  ɵɵtextInterpolate1
} from "./chunk-YYMU35ZW.js";

// src/app/features/models/models.component.ts
var _forTrack0 = ($index, $item) => $item.id;
function ModelsComponent_For_8_Template(rf, ctx) {
  if (rf & 1) {
    const _r1 = \u0275\u0275getCurrentView();
    \u0275\u0275domElementStart(0, "button", 6);
    \u0275\u0275domListener("click", function ModelsComponent_For_8_Template_button_click_0_listener() {
      const cap_r2 = \u0275\u0275restoreView(_r1).$implicit;
      const ctx_r2 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r2.capability.set(cap_r2));
    });
    \u0275\u0275text(1);
    \u0275\u0275domElementEnd();
  }
  if (rf & 2) {
    const cap_r2 = ctx.$implicit;
    const ctx_r2 = \u0275\u0275nextContext();
    \u0275\u0275classProp("active", ctx_r2.capability() === cap_r2);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(ctx_r2.niceCap(cap_r2));
  }
}
function ModelsComponent_For_11_Conditional_38_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275domElementStart(0, "span", 22);
    \u0275\u0275text(1, "start/end frame");
    \u0275\u0275domElementEnd();
  }
}
function ModelsComponent_For_11_Conditional_39_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275domElementStart(0, "span", 22);
    \u0275\u0275text(1, "character ref");
    \u0275\u0275domElementEnd();
  }
}
function ModelsComponent_For_11_Conditional_40_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275domElementStart(0, "span", 22);
    \u0275\u0275text(1);
    \u0275\u0275domElementEnd();
  }
  if (rf & 2) {
    const m_r4 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1("max ", m_r4.maxDuration, "s");
  }
}
function ModelsComponent_For_11_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275domElementStart(0, "div", 5)(1, "div", 7)(2, "div")(3, "div", 8)(4, "strong", 9);
    \u0275\u0275text(5);
    \u0275\u0275domElementEnd();
    \u0275\u0275domElementStart(6, "span", 10);
    \u0275\u0275text(7);
    \u0275\u0275domElementEnd()();
    \u0275\u0275domElementStart(8, "div", 11);
    \u0275\u0275text(9);
    \u0275\u0275domElementEnd()();
    \u0275\u0275domElement(10, "div", 12);
    \u0275\u0275domElementEnd();
    \u0275\u0275domElementStart(11, "p", 13);
    \u0275\u0275text(12);
    \u0275\u0275domElementEnd();
    \u0275\u0275domElementStart(13, "div", 14)(14, "div", 15)(15, "div", 16);
    \u0275\u0275text(16, "Capability");
    \u0275\u0275domElementEnd();
    \u0275\u0275domElementStart(17, "div", 17)(18, "span", 18);
    \u0275\u0275text(19);
    \u0275\u0275domElementEnd()()();
    \u0275\u0275domElementStart(20, "div", 15)(21, "div", 16);
    \u0275\u0275text(22, "Speed");
    \u0275\u0275domElementEnd();
    \u0275\u0275domElementStart(23, "div", 17)(24, "span", 19);
    \u0275\u0275text(25);
    \u0275\u0275domElementEnd()()();
    \u0275\u0275domElementStart(26, "div", 15)(27, "div", 16);
    \u0275\u0275text(28, "Cost");
    \u0275\u0275domElementEnd();
    \u0275\u0275domElementStart(29, "div", 20)(30, "strong");
    \u0275\u0275text(31);
    \u0275\u0275domElementEnd();
    \u0275\u0275text(32);
    \u0275\u0275domElementEnd()();
    \u0275\u0275domElementStart(33, "div", 15)(34, "div", 16);
    \u0275\u0275text(35, "Capabilities");
    \u0275\u0275domElementEnd();
    \u0275\u0275domElementStart(36, "div", 17)(37, "div", 21);
    \u0275\u0275conditionalCreate(38, ModelsComponent_For_11_Conditional_38_Template, 2, 0, "span", 22);
    \u0275\u0275conditionalCreate(39, ModelsComponent_For_11_Conditional_39_Template, 2, 0, "span", 22);
    \u0275\u0275conditionalCreate(40, ModelsComponent_For_11_Conditional_40_Template, 2, 1, "span", 22);
    \u0275\u0275domElementEnd()()()();
    \u0275\u0275domElementStart(41, "button", 23);
    \u0275\u0275text(42, "Set as default");
    \u0275\u0275domElementEnd()();
  }
  if (rf & 2) {
    const m_r4 = ctx.$implicit;
    const ctx_r2 = \u0275\u0275nextContext();
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate(m_r4.name);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1("v", m_r4.version);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(m_r4.provider);
    \u0275\u0275advance();
    \u0275\u0275classMap("p-" + m_r4.provider);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(m_r4.description);
    \u0275\u0275advance(7);
    \u0275\u0275textInterpolate(ctx_r2.niceCap(m_r4.capability));
    \u0275\u0275advance(5);
    \u0275\u0275classMap(ctx_r2.speedTone(m_r4.speed));
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(m_r4.speed);
    \u0275\u0275advance(6);
    \u0275\u0275textInterpolate(m_r4.costPerUnit);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" / ", m_r4.unit);
    \u0275\u0275advance(6);
    \u0275\u0275conditional(m_r4.supportsStartEndFrame ? 38 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(m_r4.supportsCharacterReference ? 39 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(m_r4.maxDuration ? 40 : -1);
  }
}
var ModelsComponent = class _ModelsComponent {
  modelsSrv = inject(ModelsService);
  capabilities = [
    "all",
    "text_to_video",
    "image_to_video",
    "text_to_image",
    "voice_clone",
    "music_generation",
    "script_generation",
    "upscale"
  ];
  capability = signal("all", ...ngDevMode ? [{ debugName: "capability" }] : (
    /* istanbul ignore next */
    []
  ));
  filtered = computed(() => {
    const cap = this.capability();
    return cap === "all" ? this.modelsSrv.models() : this.modelsSrv.models().filter((m) => m.capability === cap);
  }, ...ngDevMode ? [{ debugName: "filtered" }] : (
    /* istanbul ignore next */
    []
  ));
  niceCap(c) {
    return c.replace(/_/g, " ");
  }
  speedTone(s) {
    return { fast: "green", balanced: "cyan", high_quality: "amber" }[s];
  }
  static \u0275fac = function ModelsComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _ModelsComponent)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _ModelsComponent, selectors: [["app-models"]], decls: 12, vars: 0, consts: [[1, "row", 2, "justify-content", "space-between", "align-items", "flex-start", "flex-wrap", "wrap", "gap", "1rem"], [1, "muted", 2, "margin-top", "0.4rem"], [1, "row", 2, "gap", "0.4rem", "flex-wrap", "wrap"], [1, "tab", 3, "active"], [1, "grid"], [1, "card", "model"], [1, "tab", 3, "click"], [1, "row", 2, "justify-content", "space-between", "align-items", "flex-start"], [1, "row", 2, "gap", "0.4rem"], [1, "model-name"], [1, "chip", "muted"], [1, "muted", 2, "margin-top", "4px"], [1, "logo-tile"], [2, "font-size", "0.85rem", "color", "var(--text-2)", "margin-top", "0.6rem"], [1, "grid-2", 2, "margin-top", "0.85rem", "gap", "0.5rem"], [1, "kv"], [1, "k"], [1, "v"], [1, "chip", "cyan"], [1, "chip"], [1, "v", "mono"], [1, "row", 2, "gap", "0.25rem", "flex-wrap", "wrap"], [1, "cap-tag"], [1, "btn", "primary", "sm", 2, "margin-top", "0.85rem", "width", "100%"]], template: function ModelsComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275domElementStart(0, "header", 0)(1, "div")(2, "h1");
      \u0275\u0275text(3, "AI models");
      \u0275\u0275domElementEnd();
      \u0275\u0275domElementStart(4, "p", 1);
      \u0275\u0275text(5, "Compare providers across capability, speed, and cost. The orchestrator picks the right one per task.");
      \u0275\u0275domElementEnd()();
      \u0275\u0275domElementStart(6, "div", 2);
      \u0275\u0275repeaterCreate(7, ModelsComponent_For_8_Template, 2, 3, "button", 3, \u0275\u0275repeaterTrackByIdentity);
      \u0275\u0275domElementEnd()();
      \u0275\u0275domElementStart(9, "section", 4);
      \u0275\u0275repeaterCreate(10, ModelsComponent_For_11_Template, 43, 15, "div", 5, _forTrack0);
      \u0275\u0275domElementEnd();
    }
    if (rf & 2) {
      \u0275\u0275advance(7);
      \u0275\u0275repeater(ctx.capabilities);
      \u0275\u0275advance(3);
      \u0275\u0275repeater(ctx.filtered());
    }
  }, dependencies: [FormsModule], styles: ["\n[_nghost-%COMP%] {\n  display: block;\n}\nh1[_ngcontent-%COMP%] {\n  font-size: 1.75rem;\n}\n.tab[_ngcontent-%COMP%] {\n  padding: 0.45rem 0.85rem;\n  border-radius: 999px;\n  border: 1px solid var(--border);\n  background: rgba(255, 255, 255, 0.03);\n  color: var(--text-2);\n  cursor: pointer;\n  font-size: 0.82rem;\n  text-transform: capitalize;\n  transition: all 0.15s;\n}\n.tab[_ngcontent-%COMP%]:hover {\n  color: var(--text-1);\n}\n.tab.active[_ngcontent-%COMP%] {\n  background: var(--grad-primary);\n  color: white;\n  border: none;\n  box-shadow: 0 4px 18px rgba(139, 92, 246, 0.35);\n}\n.grid[_ngcontent-%COMP%] {\n  margin-top: 1.5rem;\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));\n  gap: 0.85rem;\n}\n.model[_ngcontent-%COMP%] {\n  padding: 1.1rem;\n  transition: all 0.18s;\n}\n.model[_ngcontent-%COMP%]:hover {\n  border-color: rgba(139, 92, 246, 0.42);\n  transform: translateY(-2px);\n}\n.model-name[_ngcontent-%COMP%] {\n  font-family: var(--font-display);\n  font-size: 1.1rem;\n  font-weight: 600;\n}\n.logo-tile[_ngcontent-%COMP%] {\n  width: 38px;\n  height: 38px;\n  border-radius: 10px;\n  background:\n    linear-gradient(\n      135deg,\n      rgba(139, 92, 246, 0.4),\n      rgba(34, 211, 238, 0.3));\n  border: 1px solid var(--border);\n}\n.kv[_ngcontent-%COMP%]   .k[_ngcontent-%COMP%] {\n  font-size: 0.68rem;\n  text-transform: uppercase;\n  letter-spacing: 0.1em;\n  color: var(--text-3);\n  margin-bottom: 4px;\n}\n.kv[_ngcontent-%COMP%]   .v[_ngcontent-%COMP%] {\n  font-size: 0.86rem;\n}\n.cap-tag[_ngcontent-%COMP%] {\n  font-family: var(--font-mono);\n  font-size: 0.7rem;\n  padding: 0.12rem 0.4rem;\n  border-radius: 5px;\n  background: rgba(140, 160, 255, 0.08);\n  border: 1px solid var(--border);\n  color: var(--text-2);\n}\n/*# sourceMappingURL=models.component.css.map */"], changeDetection: 0 });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(ModelsComponent, [{
    type: Component,
    args: [{ selector: "app-models", imports: [FormsModule], changeDetection: ChangeDetectionStrategy.OnPush, template: `
    <header class="row" style="justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem">
      <div>
        <h1>AI models</h1>
        <p class="muted" style="margin-top: 0.4rem">Compare providers across capability, speed, and cost. The orchestrator picks the right one per task.</p>
      </div>
      <div class="row" style="gap: 0.4rem; flex-wrap: wrap">
        @for (cap of capabilities; track cap) {
          <button class="tab" [class.active]="capability() === cap" (click)="capability.set(cap)">{{ niceCap(cap) }}</button>
        }
      </div>
    </header>

    <section class="grid">
      @for (m of filtered(); track m.id) {
        <div class="card model">
          <div class="row" style="justify-content: space-between; align-items: flex-start">
            <div>
              <div class="row" style="gap: 0.4rem">
                <strong class="model-name">{{ m.name }}</strong>
                <span class="chip muted">v{{ m.version }}</span>
              </div>
              <div class="muted" style="margin-top: 4px">{{ m.provider }}</div>
            </div>
            <div class="logo-tile" [class]="'p-' + m.provider"></div>
          </div>
          <p style="font-size: 0.85rem; color: var(--text-2); margin-top: 0.6rem">{{ m.description }}</p>
          <div class="grid-2" style="margin-top: 0.85rem; gap: 0.5rem">
            <div class="kv">
              <div class="k">Capability</div>
              <div class="v"><span class="chip cyan">{{ niceCap(m.capability) }}</span></div>
            </div>
            <div class="kv">
              <div class="k">Speed</div>
              <div class="v"><span class="chip" [class]="speedTone(m.speed)">{{ m.speed }}</span></div>
            </div>
            <div class="kv">
              <div class="k">Cost</div>
              <div class="v mono"><strong>{{ m.costPerUnit }}</strong> / {{ m.unit }}</div>
            </div>
            <div class="kv">
              <div class="k">Capabilities</div>
              <div class="v">
                <div class="row" style="gap: 0.25rem; flex-wrap: wrap">
                  @if (m.supportsStartEndFrame) { <span class="cap-tag">start/end frame</span> }
                  @if (m.supportsCharacterReference) { <span class="cap-tag">character ref</span> }
                  @if (m.maxDuration) { <span class="cap-tag">max {{ m.maxDuration }}s</span> }
                </div>
              </div>
            </div>
          </div>
          <button class="btn primary sm" style="margin-top: 0.85rem; width: 100%">Set as default</button>
        </div>
      }
    </section>
  `, styles: ["/* src/app/features/models/models.component.scss */\n:host {\n  display: block;\n}\nh1 {\n  font-size: 1.75rem;\n}\n.tab {\n  padding: 0.45rem 0.85rem;\n  border-radius: 999px;\n  border: 1px solid var(--border);\n  background: rgba(255, 255, 255, 0.03);\n  color: var(--text-2);\n  cursor: pointer;\n  font-size: 0.82rem;\n  text-transform: capitalize;\n  transition: all 0.15s;\n}\n.tab:hover {\n  color: var(--text-1);\n}\n.tab.active {\n  background: var(--grad-primary);\n  color: white;\n  border: none;\n  box-shadow: 0 4px 18px rgba(139, 92, 246, 0.35);\n}\n.grid {\n  margin-top: 1.5rem;\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));\n  gap: 0.85rem;\n}\n.model {\n  padding: 1.1rem;\n  transition: all 0.18s;\n}\n.model:hover {\n  border-color: rgba(139, 92, 246, 0.42);\n  transform: translateY(-2px);\n}\n.model-name {\n  font-family: var(--font-display);\n  font-size: 1.1rem;\n  font-weight: 600;\n}\n.logo-tile {\n  width: 38px;\n  height: 38px;\n  border-radius: 10px;\n  background:\n    linear-gradient(\n      135deg,\n      rgba(139, 92, 246, 0.4),\n      rgba(34, 211, 238, 0.3));\n  border: 1px solid var(--border);\n}\n.kv .k {\n  font-size: 0.68rem;\n  text-transform: uppercase;\n  letter-spacing: 0.1em;\n  color: var(--text-3);\n  margin-bottom: 4px;\n}\n.kv .v {\n  font-size: 0.86rem;\n}\n.cap-tag {\n  font-family: var(--font-mono);\n  font-size: 0.7rem;\n  padding: 0.12rem 0.4rem;\n  border-radius: 5px;\n  background: rgba(140, 160, 255, 0.08);\n  border: 1px solid var(--border);\n  color: var(--text-2);\n}\n/*# sourceMappingURL=models.component.css.map */\n"] }]
  }], null, null);
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(ModelsComponent, { className: "ModelsComponent", filePath: "src/app/features/models/models.component.ts", lineNumber: 68 });
})();
export {
  ModelsComponent
};
//# sourceMappingURL=chunk-3IILTIKB.js.map
