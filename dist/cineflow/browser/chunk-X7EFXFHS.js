import {
  JobsService
} from "./chunk-GBALVI3K.js";
import "./chunk-5UP4TGNH.js";
import {
  ChangeDetectionStrategy,
  Component,
  DatePipe,
  DecimalPipe,
  computed,
  inject,
  setClassMetadata,
  ɵsetClassDebugInfo,
  ɵɵadvance,
  ɵɵclassMap,
  ɵɵconditional,
  ɵɵconditionalCreate,
  ɵɵdefineComponent,
  ɵɵdomElement,
  ɵɵdomElementEnd,
  ɵɵdomElementStart,
  ɵɵpipe,
  ɵɵpipeBind2,
  ɵɵrepeater,
  ɵɵrepeaterCreate,
  ɵɵstyleProp,
  ɵɵtext,
  ɵɵtextInterpolate,
  ɵɵtextInterpolate1,
  ɵɵtextInterpolate2
} from "./chunk-YYMU35ZW.js";

// src/app/features/jobs/jobs.component.ts
var _forTrack0 = ($index, $item) => $item.id;
function JobsComponent_For_35_Conditional_27_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275domElementStart(0, "div", 23);
    \u0275\u0275text(1, "est");
    \u0275\u0275domElementEnd();
  }
}
function JobsComponent_For_35_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275domElementStart(0, "div", 11)(1, "div", 12)(2, "div", 13)(3, "span", 14);
    \u0275\u0275text(4, "\u25CF");
    \u0275\u0275domElementEnd();
    \u0275\u0275domElementStart(5, "strong", 15);
    \u0275\u0275text(6);
    \u0275\u0275domElementEnd()();
    \u0275\u0275domElementStart(7, "div", 16);
    \u0275\u0275text(8);
    \u0275\u0275domElementEnd()();
    \u0275\u0275domElementStart(9, "div", 8)(10, "div", 17);
    \u0275\u0275text(11);
    \u0275\u0275domElementEnd();
    \u0275\u0275domElementStart(12, "div", 18);
    \u0275\u0275text(13);
    \u0275\u0275domElementEnd()();
    \u0275\u0275domElementStart(14, "div", 7)(15, "div", 19);
    \u0275\u0275domElement(16, "div", 20);
    \u0275\u0275domElementEnd();
    \u0275\u0275domElementStart(17, "div", 21)(18, "span", 22);
    \u0275\u0275text(19);
    \u0275\u0275pipe(20, "number");
    \u0275\u0275domElementEnd();
    \u0275\u0275domElementStart(21, "span", 23);
    \u0275\u0275text(22);
    \u0275\u0275domElementEnd()()();
    \u0275\u0275domElementStart(23, "div", 9)(24, "div", 24);
    \u0275\u0275text(25);
    \u0275\u0275pipe(26, "number");
    \u0275\u0275domElementEnd();
    \u0275\u0275conditionalCreate(27, JobsComponent_For_35_Conditional_27_Template, 2, 0, "div", 23);
    \u0275\u0275domElementEnd();
    \u0275\u0275domElementStart(28, "div", 10)(29, "div", 25);
    \u0275\u0275text(30);
    \u0275\u0275pipe(31, "date");
    \u0275\u0275domElementEnd()()();
  }
  if (rf & 2) {
    const j_r1 = ctx.$implicit;
    \u0275\u0275advance(3);
    \u0275\u0275classMap(j_r1.status);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(j_r1.id);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate2(" ", j_r1.sceneId, " \xB7 ", j_r1.objectId ?? "scene-level", " ");
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(j_r1.model);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(j_r1.provider);
    \u0275\u0275advance(3);
    \u0275\u0275classMap(j_r1.status);
    \u0275\u0275styleProp("width", j_r1.progress, "%");
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate1("", \u0275\u0275pipeBind2(20, 16, j_r1.progress, "1.0-0"), "%");
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(j_r1.status);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate1("$", \u0275\u0275pipeBind2(26, 19, j_r1.costActual ?? j_r1.costEstimate, "1.2-2"));
    \u0275\u0275advance(2);
    \u0275\u0275conditional(j_r1.costActual === void 0 ? 27 : -1);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind2(31, 22, j_r1.startedAt ?? j_r1.completedAt, "short"));
  }
}
var JobsComponent = class _JobsComponent {
  jobs = inject(JobsService);
  runningCount = computed(() => this.jobs.jobs().filter((j) => j.status === "running" || j.status === "queued").length, ...ngDevMode ? [{ debugName: "runningCount" }] : (
    /* istanbul ignore next */
    []
  ));
  completedCount = computed(() => this.jobs.jobs().filter((j) => j.status === "completed").length, ...ngDevMode ? [{ debugName: "completedCount" }] : (
    /* istanbul ignore next */
    []
  ));
  totalSpend = computed(() => this.jobs.jobs().reduce((s, j) => s + (j.costActual ?? j.costEstimate), 0), ...ngDevMode ? [{ debugName: "totalSpend" }] : (
    /* istanbul ignore next */
    []
  ));
  static \u0275fac = function JobsComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _JobsComponent)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _JobsComponent, selectors: [["app-jobs"]], decls: 36, vars: 6, consts: [[1, "muted", 2, "margin-top", "0.4rem"], [1, "stats"], [1, "card", "stat"], [1, "eyebrow"], [1, "stat-num"], [1, "card", "jobs-table"], [1, "row", "table-head"], [2, "flex", "2"], [2, "flex", "1.5"], [2, "flex", "0.8", "text-align", "right"], [2, "flex", "1.3"], [1, "row", "job-row"], [2, "flex", "2", "min-width", "0"], [1, "row", 2, "gap", "0.4rem"], [1, "status-pill"], [2, "font-size", "0.86rem"], [1, "muted", 2, "font-size", "0.76rem", "margin-top", "2px"], [2, "font-size", "0.86rem", "font-weight", "600"], [1, "muted", 2, "font-size", "0.76rem"], [1, "progress-bar"], [1, "progress-fill"], [1, "row", 2, "justify-content", "space-between", "margin-top", "4px"], [1, "mono", 2, "font-size", "0.72rem"], [1, "muted", 2, "font-size", "0.72rem"], [1, "mono", 2, "font-weight", "600"], [2, "font-size", "0.78rem"]], template: function JobsComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275domElementStart(0, "header")(1, "h1");
      \u0275\u0275text(2, "Generation jobs");
      \u0275\u0275domElementEnd();
      \u0275\u0275domElementStart(3, "p", 0);
      \u0275\u0275text(4, "Asynchronous tasks across providers. Live progress, costs, and outputs.");
      \u0275\u0275domElementEnd()();
      \u0275\u0275domElementStart(5, "section", 1)(6, "div", 2)(7, "div", 3);
      \u0275\u0275text(8, "Running");
      \u0275\u0275domElementEnd();
      \u0275\u0275domElementStart(9, "div", 4);
      \u0275\u0275text(10);
      \u0275\u0275domElementEnd()();
      \u0275\u0275domElementStart(11, "div", 2)(12, "div", 3);
      \u0275\u0275text(13, "Completed");
      \u0275\u0275domElementEnd();
      \u0275\u0275domElementStart(14, "div", 4);
      \u0275\u0275text(15);
      \u0275\u0275domElementEnd()();
      \u0275\u0275domElementStart(16, "div", 2)(17, "div", 3);
      \u0275\u0275text(18, "Total spend");
      \u0275\u0275domElementEnd();
      \u0275\u0275domElementStart(19, "div", 4);
      \u0275\u0275text(20);
      \u0275\u0275pipe(21, "number");
      \u0275\u0275domElementEnd()()();
      \u0275\u0275domElementStart(22, "section", 5)(23, "div", 6)(24, "div", 7);
      \u0275\u0275text(25, "Job");
      \u0275\u0275domElementEnd();
      \u0275\u0275domElementStart(26, "div", 8);
      \u0275\u0275text(27, "Provider");
      \u0275\u0275domElementEnd();
      \u0275\u0275domElementStart(28, "div", 7);
      \u0275\u0275text(29, "Progress");
      \u0275\u0275domElementEnd();
      \u0275\u0275domElementStart(30, "div", 9);
      \u0275\u0275text(31, "Cost");
      \u0275\u0275domElementEnd();
      \u0275\u0275domElementStart(32, "div", 10);
      \u0275\u0275text(33, "Created");
      \u0275\u0275domElementEnd()();
      \u0275\u0275repeaterCreate(34, JobsComponent_For_35_Template, 32, 25, "div", 11, _forTrack0);
      \u0275\u0275domElementEnd();
    }
    if (rf & 2) {
      \u0275\u0275advance(10);
      \u0275\u0275textInterpolate(ctx.runningCount());
      \u0275\u0275advance(5);
      \u0275\u0275textInterpolate(ctx.completedCount());
      \u0275\u0275advance(5);
      \u0275\u0275textInterpolate1("$", \u0275\u0275pipeBind2(21, 3, ctx.totalSpend(), "1.2-2"));
      \u0275\u0275advance(14);
      \u0275\u0275repeater(ctx.jobs.jobs());
    }
  }, dependencies: [DatePipe, DecimalPipe], styles: ["\n[_nghost-%COMP%] {\n  display: block;\n}\nh1[_ngcontent-%COMP%] {\n  font-size: 1.75rem;\n}\n.stats[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  gap: 0.85rem;\n  margin: 1.2rem 0 1rem;\n}\n@media (max-width: 700px) {\n  .stats[_ngcontent-%COMP%] {\n    grid-template-columns: 1fr;\n  }\n}\n.stat[_ngcontent-%COMP%] {\n  padding: 1.05rem;\n}\n.stat-num[_ngcontent-%COMP%] {\n  font-family: var(--font-display);\n  font-size: 2rem;\n  font-weight: 700;\n  letter-spacing: -0.02em;\n  margin-top: 0.3rem;\n}\n.jobs-table[_ngcontent-%COMP%] {\n  padding: 0.5rem 0.85rem;\n}\n.table-head[_ngcontent-%COMP%] {\n  padding: 0.65rem 0.5rem;\n  border-bottom: 1px solid var(--border);\n  font-size: 0.7rem;\n  text-transform: uppercase;\n  letter-spacing: 0.1em;\n  color: var(--text-3);\n  font-weight: 700;\n  gap: 0.85rem;\n}\n.job-row[_ngcontent-%COMP%] {\n  padding: 0.85rem 0.5rem;\n  border-bottom: 1px solid var(--border);\n  gap: 0.85rem;\n  align-items: center;\n}\n.job-row[_ngcontent-%COMP%]:last-child {\n  border-bottom: none;\n}\n.status-pill[_ngcontent-%COMP%] {\n  font-size: 0.85rem;\n}\n.status-pill.completed[_ngcontent-%COMP%] {\n  color: var(--neon-green);\n}\n.status-pill.running[_ngcontent-%COMP%] {\n  color: var(--neon-violet);\n  animation: _ngcontent-%COMP%_pulse 1.5s ease-in-out infinite;\n}\n.status-pill.queued[_ngcontent-%COMP%] {\n  color: var(--text-mute);\n}\n.status-pill.failed[_ngcontent-%COMP%] {\n  color: var(--neon-rose);\n}\n@keyframes _ngcontent-%COMP%_pulse {\n  0%, 100% {\n    opacity: 1;\n  }\n  50% {\n    opacity: 0.4;\n  }\n}\n.progress-bar[_ngcontent-%COMP%] {\n  height: 5px;\n  border-radius: 99px;\n  background: rgba(140, 160, 255, 0.1);\n  overflow: hidden;\n}\n.progress-fill[_ngcontent-%COMP%] {\n  height: 100%;\n  background: var(--grad-primary);\n  transition: width 0.4s ease;\n}\n.progress-fill.completed[_ngcontent-%COMP%] {\n  background: var(--neon-green);\n}\n.progress-fill.failed[_ngcontent-%COMP%] {\n  background: var(--neon-rose);\n}\n/*# sourceMappingURL=jobs.component.css.map */"], changeDetection: 0 });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(JobsComponent, [{
    type: Component,
    args: [{ selector: "app-jobs", imports: [DatePipe, DecimalPipe], changeDetection: ChangeDetectionStrategy.OnPush, template: `
    <header>
      <h1>Generation jobs</h1>
      <p class="muted" style="margin-top: 0.4rem">Asynchronous tasks across providers. Live progress, costs, and outputs.</p>
    </header>

    <section class="stats">
      <div class="card stat">
        <div class="eyebrow">Running</div>
        <div class="stat-num">{{ runningCount() }}</div>
      </div>
      <div class="card stat">
        <div class="eyebrow">Completed</div>
        <div class="stat-num">{{ completedCount() }}</div>
      </div>
      <div class="card stat">
        <div class="eyebrow">Total spend</div>
        <div class="stat-num">\${{ totalSpend() | number: '1.2-2' }}</div>
      </div>
    </section>

    <section class="card jobs-table">
      <div class="row table-head">
        <div style="flex: 2">Job</div>
        <div style="flex: 1.5">Provider</div>
        <div style="flex: 2">Progress</div>
        <div style="flex: 0.8; text-align: right">Cost</div>
        <div style="flex: 1.3">Created</div>
      </div>
      @for (j of jobs.jobs(); track j.id) {
        <div class="row job-row">
          <div style="flex: 2; min-width: 0">
            <div class="row" style="gap: 0.4rem">
              <span class="status-pill" [class]="j.status">\u25CF</span>
              <strong style="font-size: 0.86rem">{{ j.id }}</strong>
            </div>
            <div class="muted" style="font-size: 0.76rem; margin-top: 2px">
              {{ j.sceneId }} \xB7 {{ j.objectId ?? 'scene-level' }}
            </div>
          </div>
          <div style="flex: 1.5">
            <div style="font-size: 0.86rem; font-weight: 600">{{ j.model }}</div>
            <div class="muted" style="font-size: 0.76rem">{{ j.provider }}</div>
          </div>
          <div style="flex: 2">
            <div class="progress-bar"><div class="progress-fill" [class]="j.status" [style.width.%]="j.progress"></div></div>
            <div class="row" style="justify-content: space-between; margin-top: 4px">
              <span class="mono" style="font-size: 0.72rem">{{ j.progress | number: '1.0-0' }}%</span>
              <span class="muted" style="font-size: 0.72rem">{{ j.status }}</span>
            </div>
          </div>
          <div style="flex: 0.8; text-align: right">
            <div class="mono" style="font-weight: 600">\${{ (j.costActual ?? j.costEstimate) | number: '1.2-2' }}</div>
            @if (j.costActual === undefined) { <div class="muted" style="font-size: 0.72rem">est</div> }
          </div>
          <div style="flex: 1.3">
            <div style="font-size: 0.78rem">{{ (j.startedAt ?? j.completedAt) | date: 'short' }}</div>
          </div>
        </div>
      }
    </section>
  `, styles: ["/* src/app/features/jobs/jobs.component.scss */\n:host {\n  display: block;\n}\nh1 {\n  font-size: 1.75rem;\n}\n.stats {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  gap: 0.85rem;\n  margin: 1.2rem 0 1rem;\n}\n@media (max-width: 700px) {\n  .stats {\n    grid-template-columns: 1fr;\n  }\n}\n.stat {\n  padding: 1.05rem;\n}\n.stat-num {\n  font-family: var(--font-display);\n  font-size: 2rem;\n  font-weight: 700;\n  letter-spacing: -0.02em;\n  margin-top: 0.3rem;\n}\n.jobs-table {\n  padding: 0.5rem 0.85rem;\n}\n.table-head {\n  padding: 0.65rem 0.5rem;\n  border-bottom: 1px solid var(--border);\n  font-size: 0.7rem;\n  text-transform: uppercase;\n  letter-spacing: 0.1em;\n  color: var(--text-3);\n  font-weight: 700;\n  gap: 0.85rem;\n}\n.job-row {\n  padding: 0.85rem 0.5rem;\n  border-bottom: 1px solid var(--border);\n  gap: 0.85rem;\n  align-items: center;\n}\n.job-row:last-child {\n  border-bottom: none;\n}\n.status-pill {\n  font-size: 0.85rem;\n}\n.status-pill.completed {\n  color: var(--neon-green);\n}\n.status-pill.running {\n  color: var(--neon-violet);\n  animation: pulse 1.5s ease-in-out infinite;\n}\n.status-pill.queued {\n  color: var(--text-mute);\n}\n.status-pill.failed {\n  color: var(--neon-rose);\n}\n@keyframes pulse {\n  0%, 100% {\n    opacity: 1;\n  }\n  50% {\n    opacity: 0.4;\n  }\n}\n.progress-bar {\n  height: 5px;\n  border-radius: 99px;\n  background: rgba(140, 160, 255, 0.1);\n  overflow: hidden;\n}\n.progress-fill {\n  height: 100%;\n  background: var(--grad-primary);\n  transition: width 0.4s ease;\n}\n.progress-fill.completed {\n  background: var(--neon-green);\n}\n.progress-fill.failed {\n  background: var(--neon-rose);\n}\n/*# sourceMappingURL=jobs.component.css.map */\n"] }]
  }], null, null);
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(JobsComponent, { className: "JobsComponent", filePath: "src/app/features/jobs/jobs.component.ts", lineNumber: 73 });
})();
export {
  JobsComponent
};
//# sourceMappingURL=chunk-X7EFXFHS.js.map
