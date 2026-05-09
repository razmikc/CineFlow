import {
  AssetsService
} from "./chunk-QBFXNP4Z.js";
import {
  DefaultValueAccessor,
  FormsModule,
  NgControlStatus,
  NgModel
} from "./chunk-T3VEDOVQ.js";
import "./chunk-5UP4TGNH.js";
import {
  ChangeDetectionStrategy,
  Component,
  DatePipe,
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
  ɵɵrepeater,
  ɵɵrepeaterCreate,
  ɵɵrepeaterTrackByIdentity,
  ɵɵresetView,
  ɵɵrestoreView,
  ɵɵstyleProp,
  ɵɵtext,
  ɵɵtextInterpolate,
  ɵɵtextInterpolate1,
  ɵɵtextInterpolate2
} from "./chunk-YYMU35ZW.js";

// src/app/features/asset-library/asset-library.component.ts
var _forTrack0 = ($index, $item) => $item.id;
function AssetLibraryComponent_For_23_Template(rf, ctx) {
  if (rf & 1) {
    const _r1 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "button", 13);
    \u0275\u0275listener("click", function AssetLibraryComponent_For_23_Template_button_click_0_listener() {
      const t_r2 = \u0275\u0275restoreView(_r1).$implicit;
      const ctx_r2 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r2.filter.set(t_r2));
    });
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const t_r2 = ctx.$implicit;
    const ctx_r2 = \u0275\u0275nextContext();
    \u0275\u0275classProp("active", ctx_r2.filter() === t_r2);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate2("", t_r2, " (", ctx_r2.countByType(t_r2), ")");
  }
}
function AssetLibraryComponent_For_26_Conditional_18_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 27);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const a_r4 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1("", a_r4.durationSec, "s");
  }
}
function AssetLibraryComponent_For_26_Conditional_19_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 28);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const a_r4 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(a_r4.prompt);
  }
}
function AssetLibraryComponent_For_26_For_22_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 30);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const t_r5 = ctx.$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(t_r5);
  }
}
function AssetLibraryComponent_For_26_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 16)(1, "div", 18)(2, "div", 19)(3, "span", 20);
    \u0275\u0275text(4);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(5, "span", 21);
    \u0275\u0275text(6);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(7, "div", 22)(8, "button", 23);
    \u0275\u0275text(9, "\u21BB");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(10, "button", 23);
    \u0275\u0275text(11, "\u{1F50D}");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(12, "button", 23);
    \u0275\u0275text(13, "\u2913");
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(14, "div", 24)(15, "div", 25)(16, "strong", 26);
    \u0275\u0275text(17);
    \u0275\u0275elementEnd();
    \u0275\u0275conditionalCreate(18, AssetLibraryComponent_For_26_Conditional_18_Template, 2, 1, "span", 27);
    \u0275\u0275elementEnd();
    \u0275\u0275conditionalCreate(19, AssetLibraryComponent_For_26_Conditional_19_Template, 2, 1, "div", 28);
    \u0275\u0275elementStart(20, "div", 29);
    \u0275\u0275repeaterCreate(21, AssetLibraryComponent_For_26_For_22_Template, 2, 1, "span", 30, \u0275\u0275repeaterTrackByIdentity);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(23, "div", 31)(24, "span", 32);
    \u0275\u0275text(25);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(26, "span", 32);
    \u0275\u0275text(27);
    \u0275\u0275pipe(28, "date");
    \u0275\u0275elementEnd()()()();
  }
  if (rf & 2) {
    const a_r4 = ctx.$implicit;
    const ctx_r2 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275styleProp("background-image", "url(" + (a_r4.thumbnail || a_r4.uri) + ")");
    \u0275\u0275advance(2);
    \u0275\u0275classMap(ctx_r2.sourceTone(a_r4.source));
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(a_r4.source);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(a_r4.type);
    \u0275\u0275advance(11);
    \u0275\u0275textInterpolate(a_r4.name);
    \u0275\u0275advance();
    \u0275\u0275conditional(a_r4.durationSec ? 18 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(a_r4.prompt ? 19 : -1);
    \u0275\u0275advance(2);
    \u0275\u0275repeater(a_r4.tags);
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate1(" ", a_r4.provider ? a_r4.provider + " \xB7 " + a_r4.model : "manual", " ");
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind2(28, 11, a_r4.createdAt, "shortDate"));
  }
}
function AssetLibraryComponent_Conditional_27_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 17)(1, "div", 33);
    \u0275\u0275text(2, "\u{1F4E6}");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "div", 34);
    \u0275\u0275text(4, "No matching assets");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(5, "p", 35);
    \u0275\u0275text(6, "Try a different filter or generate a new one.");
    \u0275\u0275elementEnd()();
  }
}
var AssetLibraryComponent = class _AssetLibraryComponent {
  assetsSrv = inject(AssetsService);
  search = signal("", ...ngDevMode ? [{ debugName: "search" }] : (
    /* istanbul ignore next */
    []
  ));
  filter = signal("all", ...ngDevMode ? [{ debugName: "filter" }] : (
    /* istanbul ignore next */
    []
  ));
  types = ["image", "video", "audio", "voice", "music", "font", "logo"];
  filtered = computed(() => {
    const term = this.search().toLowerCase();
    const type = this.filter();
    return this.assetsSrv.assets().filter((a) => {
      const okType = type === "all" || a.type === type;
      const okTerm = !term || `${a.name} ${a.tags.join(" ")} ${a.prompt ?? ""}`.toLowerCase().includes(term);
      return okType && okTerm;
    });
  }, ...ngDevMode ? [{ debugName: "filtered" }] : (
    /* istanbul ignore next */
    []
  ));
  countByType(t) {
    return this.assetsSrv.assets().filter((a) => a.type === t).length;
  }
  sourceTone(s) {
    return { generated: "cyan", uploaded: "green", library: "amber", ai_pending: "muted" }[s];
  }
  generate() {
    this.assetsSrv.generate({
      type: "image",
      name: `generated-${Date.now()}.png`,
      prompt: "Cinematic still, soft warm light, atmospheric, 35mm",
      provider: "midjourney",
      model: "Midjourney v7"
    }).subscribe();
  }
  upload() {
    const samples = [
      "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800",
      "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800",
      "https://images.unsplash.com/photo-1493804714600-6edb1cd93080?w=800"
    ];
    this.assetsSrv.upload({
      type: "image",
      name: `upload-${Date.now()}.jpg`,
      uri: samples[Math.floor(Math.random() * samples.length)]
    }).subscribe();
  }
  static \u0275fac = function AssetLibraryComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _AssetLibraryComponent)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _AssetLibraryComponent, selectors: [["app-asset-library"]], decls: 28, vars: 5, consts: [[1, "row", 2, "justify-content", "space-between", "align-items", "flex-start", "flex-wrap", "wrap", "gap", "1rem"], [1, "muted", 2, "margin-top", "0.4rem"], [1, "row", 2, "gap", "0.5rem"], [1, "btn", "cool", 3, "click"], ["viewBox", "0 0 20 20", "width", "14", "height", "14", "fill", "none", "stroke", "currentColor", "stroke-width", "2"], ["d", "M10 2v3m0 10v3M2 10h3m10 0h3M4.2 4.2l2.1 2.1m7.4 7.4 2.1 2.1", "stroke-linecap", "round"], [1, "btn", "primary", 3, "click"], [1, "row", "filters"], [1, "search-box"], ["cx", "9", "cy", "9", "r", "6.5"], ["d", "m14 14 4 4", "stroke-linecap", "round"], ["placeholder", "Search by name, prompt, or tag", 3, "ngModelChange", "ngModel"], [1, "row", "tabs"], [1, "tab", 3, "click"], [1, "tab", 3, "active"], [1, "grid"], [1, "asset", "card"], [1, "empty"], [1, "thumb"], [1, "thumb-overlay"], [1, "chip"], [1, "chip", "muted"], [1, "thumb-actions"], [1, "iconbtn"], [1, "body"], [1, "row", 2, "justify-content", "space-between"], [2, "font-size", "0.9rem"], [1, "mono", 2, "font-size", "0.75rem"], [1, "muted", "prompt-line"], [1, "row", 2, "gap", "0.3rem", "flex-wrap", "wrap"], [1, "tag"], [1, "row", 2, "justify-content", "space-between", "padding-top", "0.5rem", "border-top", "1px dashed var(--border)", "margin-top", "0.4rem"], [1, "muted", 2, "font-size", "0.74rem"], [2, "font-size", "1.6rem"], [2, "font-family", "var(--font-display)", "font-weight", "600"], [1, "muted"]], template: function AssetLibraryComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275elementStart(0, "header", 0)(1, "div")(2, "h1");
      \u0275\u0275text(3, "Asset library");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(4, "p", 1);
      \u0275\u0275text(5, "Reusable images, videos, voices, music and fonts. Generate, upload, or pull from stock.");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(6, "div", 2)(7, "button", 3);
      \u0275\u0275listener("click", function AssetLibraryComponent_Template_button_click_7_listener() {
        return ctx.generate();
      });
      \u0275\u0275namespaceSVG();
      \u0275\u0275elementStart(8, "svg", 4);
      \u0275\u0275element(9, "path", 5);
      \u0275\u0275elementEnd();
      \u0275\u0275text(10, " Generate asset ");
      \u0275\u0275elementEnd();
      \u0275\u0275namespaceHTML();
      \u0275\u0275elementStart(11, "button", 6);
      \u0275\u0275listener("click", function AssetLibraryComponent_Template_button_click_11_listener() {
        return ctx.upload();
      });
      \u0275\u0275text(12, "+ Upload");
      \u0275\u0275elementEnd()()();
      \u0275\u0275elementStart(13, "div", 7)(14, "div", 8);
      \u0275\u0275namespaceSVG();
      \u0275\u0275elementStart(15, "svg", 4);
      \u0275\u0275element(16, "circle", 9)(17, "path", 10);
      \u0275\u0275elementEnd();
      \u0275\u0275namespaceHTML();
      \u0275\u0275elementStart(18, "input", 11);
      \u0275\u0275listener("ngModelChange", function AssetLibraryComponent_Template_input_ngModelChange_18_listener($event) {
        return ctx.search.set($event);
      });
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(19, "div", 12)(20, "button", 13);
      \u0275\u0275listener("click", function AssetLibraryComponent_Template_button_click_20_listener() {
        return ctx.filter.set("all");
      });
      \u0275\u0275text(21);
      \u0275\u0275elementEnd();
      \u0275\u0275repeaterCreate(22, AssetLibraryComponent_For_23_Template, 2, 4, "button", 14, \u0275\u0275repeaterTrackByIdentity);
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(24, "section", 15);
      \u0275\u0275repeaterCreate(25, AssetLibraryComponent_For_26_Template, 29, 14, "div", 16, _forTrack0);
      \u0275\u0275conditionalCreate(27, AssetLibraryComponent_Conditional_27_Template, 7, 0, "div", 17);
      \u0275\u0275elementEnd();
    }
    if (rf & 2) {
      \u0275\u0275advance(18);
      \u0275\u0275property("ngModel", ctx.search());
      \u0275\u0275advance(2);
      \u0275\u0275classProp("active", ctx.filter() === "all");
      \u0275\u0275advance();
      \u0275\u0275textInterpolate1("All (", ctx.assetsSrv.assets().length, ")");
      \u0275\u0275advance();
      \u0275\u0275repeater(ctx.types);
      \u0275\u0275advance(3);
      \u0275\u0275repeater(ctx.filtered());
      \u0275\u0275advance(2);
      \u0275\u0275conditional(ctx.filtered().length === 0 ? 27 : -1);
    }
  }, dependencies: [FormsModule, DefaultValueAccessor, NgControlStatus, NgModel, DatePipe], styles: ["\n[_nghost-%COMP%] {\n  display: block;\n}\nh1[_ngcontent-%COMP%] {\n  font-size: 1.75rem;\n}\n.filters[_ngcontent-%COMP%] {\n  margin: 1.2rem 0 1rem;\n  gap: 0.85rem;\n  flex-wrap: wrap;\n}\n.search-box[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n  padding: 0.55rem 0.85rem;\n  border: 1px solid var(--border);\n  border-radius: 12px;\n  background: rgba(10, 13, 35, 0.6);\n  flex: 1;\n  max-width: 400px;\n  color: var(--text-3);\n}\n.search-box[_ngcontent-%COMP%]   input[_ngcontent-%COMP%] {\n  flex: 1;\n  border: none;\n  background: transparent;\n  padding: 0;\n  color: var(--text-1);\n  font-size: 0.88rem;\n}\n.search-box[_ngcontent-%COMP%]   input[_ngcontent-%COMP%]:focus {\n  box-shadow: none;\n}\n.tabs[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 0.3rem;\n  flex-wrap: wrap;\n}\n.tab[_ngcontent-%COMP%] {\n  padding: 0.45rem 0.85rem;\n  border-radius: 999px;\n  border: 1px solid var(--border);\n  background: rgba(255, 255, 255, 0.03);\n  color: var(--text-2);\n  cursor: pointer;\n  font-size: 0.82rem;\n  text-transform: capitalize;\n  transition: all 0.15s;\n}\n.tab[_ngcontent-%COMP%]:hover {\n  color: var(--text-1);\n}\n.tab.active[_ngcontent-%COMP%] {\n  background: var(--grad-primary);\n  color: white;\n  border: none;\n  box-shadow: 0 4px 18px rgba(139, 92, 246, 0.35);\n}\n.grid[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));\n  gap: 0.85rem;\n}\n.asset[_ngcontent-%COMP%] {\n  padding: 0;\n  overflow: hidden;\n  display: flex;\n  flex-direction: column;\n  transition: all 0.18s;\n}\n.asset[_ngcontent-%COMP%]:hover {\n  border-color: rgba(139, 92, 246, 0.42);\n  transform: translateY(-2px);\n}\n.thumb[_ngcontent-%COMP%] {\n  height: 150px;\n  background-color: rgba(140, 160, 255, 0.08);\n  background-size: cover;\n  background-position: center;\n  position: relative;\n  display: flex;\n  align-items: flex-start;\n  justify-content: space-between;\n  padding: 0.55rem;\n}\n.thumb-overlay[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 0.3rem;\n  flex-wrap: wrap;\n}\n.thumb-actions[_ngcontent-%COMP%] {\n  position: absolute;\n  bottom: 8px;\n  right: 8px;\n  display: flex;\n  gap: 0.3rem;\n  opacity: 0;\n  transition: opacity 0.18s;\n}\n.asset[_ngcontent-%COMP%]:hover   .thumb-actions[_ngcontent-%COMP%] {\n  opacity: 1;\n}\n.body[_ngcontent-%COMP%] {\n  padding: 0.85rem 1rem 1rem;\n  display: flex;\n  flex-direction: column;\n  gap: 0.45rem;\n}\n.prompt-line[_ngcontent-%COMP%] {\n  font-size: 0.78rem;\n  color: var(--text-3);\n  display: -webkit-box;\n  -webkit-line-clamp: 2;\n  -webkit-box-orient: vertical;\n  overflow: hidden;\n  line-height: 1.4;\n}\n.tag[_ngcontent-%COMP%] {\n  font-family: var(--font-mono);\n  font-size: 0.7rem;\n  padding: 0.1rem 0.4rem;\n  border-radius: 4px;\n  background: rgba(34, 211, 238, 0.08);\n  color: var(--neon-cyan);\n  border: 1px solid rgba(34, 211, 238, 0.18);\n}\n.empty[_ngcontent-%COMP%] {\n  grid-column: 1/-1;\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  padding: 3rem;\n  border: 1px dashed var(--border);\n  border-radius: var(--r-lg);\n  text-align: center;\n  gap: 0.4rem;\n}\n/*# sourceMappingURL=asset-library.component.css.map */"], changeDetection: 0 });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(AssetLibraryComponent, [{
    type: Component,
    args: [{ selector: "app-asset-library", imports: [FormsModule, DatePipe], changeDetection: ChangeDetectionStrategy.OnPush, template: `
    <header class="row" style="justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem">
      <div>
        <h1>Asset library</h1>
        <p class="muted" style="margin-top: 0.4rem">Reusable images, videos, voices, music and fonts. Generate, upload, or pull from stock.</p>
      </div>
      <div class="row" style="gap: 0.5rem">
        <button class="btn cool" (click)="generate()">
          <svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 2v3m0 10v3M2 10h3m10 0h3M4.2 4.2l2.1 2.1m7.4 7.4 2.1 2.1" stroke-linecap="round"/></svg>
          Generate asset
        </button>
        <button class="btn primary" (click)="upload()">+ Upload</button>
      </div>
    </header>

    <div class="row filters">
      <div class="search-box">
        <svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="9" cy="9" r="6.5"/><path d="m14 14 4 4" stroke-linecap="round"/>
        </svg>
        <input placeholder="Search by name, prompt, or tag" [ngModel]="search()" (ngModelChange)="search.set($event)"/>
      </div>
      <div class="row tabs">
        <button class="tab" [class.active]="filter() === 'all'" (click)="filter.set('all')">All ({{ assetsSrv.assets().length }})</button>
        @for (t of types; track t) {
          <button class="tab" [class.active]="filter() === t" (click)="filter.set(t)">{{ t }} ({{ countByType(t) }})</button>
        }
      </div>
    </div>

    <section class="grid">
      @for (a of filtered(); track a.id) {
        <div class="asset card">
          <div class="thumb" [style.background-image]="'url(' + (a.thumbnail || a.uri) + ')'">
            <div class="thumb-overlay">
              <span class="chip" [class]="sourceTone(a.source)">{{ a.source }}</span>
              <span class="chip muted">{{ a.type }}</span>
            </div>
            <div class="thumb-actions">
              <button class="iconbtn">\u21BB</button>
              <button class="iconbtn">\u{1F50D}</button>
              <button class="iconbtn">\u2913</button>
            </div>
          </div>
          <div class="body">
            <div class="row" style="justify-content: space-between">
              <strong style="font-size: 0.9rem">{{ a.name }}</strong>
              @if (a.durationSec) { <span class="mono" style="font-size: 0.75rem">{{ a.durationSec }}s</span> }
            </div>
            @if (a.prompt) {
              <div class="muted prompt-line">{{ a.prompt }}</div>
            }
            <div class="row" style="gap: 0.3rem; flex-wrap: wrap">
              @for (t of a.tags; track t) {
                <span class="tag">{{ t }}</span>
              }
            </div>
            <div class="row" style="justify-content: space-between; padding-top: 0.5rem; border-top: 1px dashed var(--border); margin-top: 0.4rem">
              <span class="muted" style="font-size: 0.74rem">
                {{ a.provider ? a.provider + ' \xB7 ' + a.model : 'manual' }}
              </span>
              <span class="muted" style="font-size: 0.74rem">{{ a.createdAt | date: 'shortDate' }}</span>
            </div>
          </div>
        </div>
      }
      @if (filtered().length === 0) {
        <div class="empty">
          <div style="font-size: 1.6rem">\u{1F4E6}</div>
          <div style="font-family: var(--font-display); font-weight: 600">No matching assets</div>
          <p class="muted">Try a different filter or generate a new one.</p>
        </div>
      }
    </section>
  `, styles: ["/* src/app/features/asset-library/asset-library.component.scss */\n:host {\n  display: block;\n}\nh1 {\n  font-size: 1.75rem;\n}\n.filters {\n  margin: 1.2rem 0 1rem;\n  gap: 0.85rem;\n  flex-wrap: wrap;\n}\n.search-box {\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n  padding: 0.55rem 0.85rem;\n  border: 1px solid var(--border);\n  border-radius: 12px;\n  background: rgba(10, 13, 35, 0.6);\n  flex: 1;\n  max-width: 400px;\n  color: var(--text-3);\n}\n.search-box input {\n  flex: 1;\n  border: none;\n  background: transparent;\n  padding: 0;\n  color: var(--text-1);\n  font-size: 0.88rem;\n}\n.search-box input:focus {\n  box-shadow: none;\n}\n.tabs {\n  display: flex;\n  gap: 0.3rem;\n  flex-wrap: wrap;\n}\n.tab {\n  padding: 0.45rem 0.85rem;\n  border-radius: 999px;\n  border: 1px solid var(--border);\n  background: rgba(255, 255, 255, 0.03);\n  color: var(--text-2);\n  cursor: pointer;\n  font-size: 0.82rem;\n  text-transform: capitalize;\n  transition: all 0.15s;\n}\n.tab:hover {\n  color: var(--text-1);\n}\n.tab.active {\n  background: var(--grad-primary);\n  color: white;\n  border: none;\n  box-shadow: 0 4px 18px rgba(139, 92, 246, 0.35);\n}\n.grid {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));\n  gap: 0.85rem;\n}\n.asset {\n  padding: 0;\n  overflow: hidden;\n  display: flex;\n  flex-direction: column;\n  transition: all 0.18s;\n}\n.asset:hover {\n  border-color: rgba(139, 92, 246, 0.42);\n  transform: translateY(-2px);\n}\n.thumb {\n  height: 150px;\n  background-color: rgba(140, 160, 255, 0.08);\n  background-size: cover;\n  background-position: center;\n  position: relative;\n  display: flex;\n  align-items: flex-start;\n  justify-content: space-between;\n  padding: 0.55rem;\n}\n.thumb-overlay {\n  display: flex;\n  gap: 0.3rem;\n  flex-wrap: wrap;\n}\n.thumb-actions {\n  position: absolute;\n  bottom: 8px;\n  right: 8px;\n  display: flex;\n  gap: 0.3rem;\n  opacity: 0;\n  transition: opacity 0.18s;\n}\n.asset:hover .thumb-actions {\n  opacity: 1;\n}\n.body {\n  padding: 0.85rem 1rem 1rem;\n  display: flex;\n  flex-direction: column;\n  gap: 0.45rem;\n}\n.prompt-line {\n  font-size: 0.78rem;\n  color: var(--text-3);\n  display: -webkit-box;\n  -webkit-line-clamp: 2;\n  -webkit-box-orient: vertical;\n  overflow: hidden;\n  line-height: 1.4;\n}\n.tag {\n  font-family: var(--font-mono);\n  font-size: 0.7rem;\n  padding: 0.1rem 0.4rem;\n  border-radius: 4px;\n  background: rgba(34, 211, 238, 0.08);\n  color: var(--neon-cyan);\n  border: 1px solid rgba(34, 211, 238, 0.18);\n}\n.empty {\n  grid-column: 1/-1;\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  padding: 3rem;\n  border: 1px dashed var(--border);\n  border-radius: var(--r-lg);\n  text-align: center;\n  gap: 0.4rem;\n}\n/*# sourceMappingURL=asset-library.component.css.map */\n"] }]
  }], null, null);
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(AssetLibraryComponent, { className: "AssetLibraryComponent", filePath: "src/app/features/asset-library/asset-library.component.ts", lineNumber: 88 });
})();
export {
  AssetLibraryComponent
};
//# sourceMappingURL=chunk-J5OIVVC7.js.map
