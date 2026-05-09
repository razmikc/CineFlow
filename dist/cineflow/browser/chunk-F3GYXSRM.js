import {
  ProjectsService
} from "./chunk-JI6S375N.js";
import {
  Router,
  RouterLink
} from "./chunk-A2MSORV3.js";
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
  ɵɵelement,
  ɵɵelementEnd,
  ɵɵelementStart,
  ɵɵnamespaceHTML,
  ɵɵnamespaceSVG,
  ɵɵnextContext,
  ɵɵpipe,
  ɵɵpipeBind2,
  ɵɵproperty,
  ɵɵpureFunction0,
  ɵɵpureFunction1,
  ɵɵrepeater,
  ɵɵrepeaterCreate,
  ɵɵrepeaterTrackByIdentity,
  ɵɵstyleProp,
  ɵɵtext,
  ɵɵtextInterpolate,
  ɵɵtextInterpolate1,
  ɵɵtextInterpolate2
} from "./chunk-YYMU35ZW.js";

// src/app/features/dashboard/dashboard.component.ts
var _c0 = () => [1, 2, 3];
var _c1 = (a0) => ["/projects", a0];
var _forTrack0 = ($index, $item) => $item.label;
var _forTrack1 = ($index, $item) => $item.id;
function DashboardComponent_For_20_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "div", 53);
  }
  if (rf & 2) {
    const orb_r1 = ctx.$implicit;
    \u0275\u0275classMap("orb-" + orb_r1);
  }
}
function DashboardComponent_For_24_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 14)(1, "div", 2);
    \u0275\u0275text(2);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "div", 54)(4, "div", 55);
    \u0275\u0275text(5);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(6, "span", 56);
    \u0275\u0275text(7);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(8, "div", 57);
    \u0275\u0275element(9, "div", 58);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const s_r2 = ctx.$implicit;
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(s_r2.label);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(s_r2.value);
    \u0275\u0275advance();
    \u0275\u0275classMap(s_r2.tone);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(s_r2.delta);
    \u0275\u0275advance(2);
    \u0275\u0275styleProp("width", s_r2.fill + "%");
  }
}
function DashboardComponent_For_44_For_23_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "span", 77);
  }
  if (rf & 2) {
    const c_r3 = ctx.$implicit;
    \u0275\u0275styleProp("background-color", c_r3);
  }
}
function DashboardComponent_For_44_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "a", 26)(1, "div", 59)(2, "div", 60)(3, "span", 56);
    \u0275\u0275text(4);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(5, "span", 61);
    \u0275\u0275text(6);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(7, "div", 62);
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(8, "svg", 63);
    \u0275\u0275element(9, "path", 64);
    \u0275\u0275elementEnd()()();
    \u0275\u0275namespaceHTML();
    \u0275\u0275elementStart(10, "div", 65)(11, "div", 66)(12, "div", 67)(13, "div", 68);
    \u0275\u0275text(14);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(15, "div", 69);
    \u0275\u0275text(16);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(17, "span", 31);
    \u0275\u0275text(18);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(19, "p", 70);
    \u0275\u0275text(20);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(21, "div", 71);
    \u0275\u0275repeaterCreate(22, DashboardComponent_For_44_For_23_Template, 1, 2, "span", 72, \u0275\u0275repeaterTrackByIdentity);
    \u0275\u0275element(24, "div", 73);
    \u0275\u0275elementStart(25, "span", 74);
    \u0275\u0275text(26);
    \u0275\u0275pipe(27, "date");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(28, "div", 75)(29, "span", 76);
    \u0275\u0275text(30);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(31, "span", 76);
    \u0275\u0275text(32);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(33, "span", 76);
    \u0275\u0275text(34);
    \u0275\u0275elementEnd()()()();
  }
  if (rf & 2) {
    const p_r4 = ctx.$implicit;
    const ctx_r4 = \u0275\u0275nextContext();
    \u0275\u0275property("routerLink", \u0275\u0275pureFunction1(18, _c1, p_r4.id));
    \u0275\u0275advance();
    \u0275\u0275styleProp("background-image", p_r4.thumbnailUrl ? "url(" + p_r4.thumbnailUrl + ")" : "");
    \u0275\u0275advance(2);
    \u0275\u0275classMap(ctx_r4.statusTone(p_r4.status));
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(ctx_r4.statusLabel(p_r4.status));
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(p_r4.output.aspectRatio);
    \u0275\u0275advance(8);
    \u0275\u0275textInterpolate(p_r4.title);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(ctx_r4.goalLabel(p_r4.goal));
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1("", p_r4.scenes.length, " scenes");
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(p_r4.description);
    \u0275\u0275advance(2);
    \u0275\u0275repeater(p_r4.creativeDirection.colorPalette);
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind2(27, 15, p_r4.updatedAt, "mediumDate"));
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate(p_r4.models.video.model);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(p_r4.models.image.model);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(p_r4.models.voice.provider);
  }
}
function DashboardComponent_For_54_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "span", 79);
  }
}
function DashboardComponent_For_54_Conditional_3_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(0, "svg", 80);
    \u0275\u0275element(1, "path", 91);
    \u0275\u0275elementEnd();
  }
}
function DashboardComponent_For_54_Conditional_4_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(0, "svg", 81);
    \u0275\u0275element(1, "circle", 92);
    \u0275\u0275elementEnd();
  }
}
function DashboardComponent_For_54_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 33)(1, "div", 78);
    \u0275\u0275conditionalCreate(2, DashboardComponent_For_54_Conditional_2_Template, 1, 0, "span", 79)(3, DashboardComponent_For_54_Conditional_3_Template, 2, 0, ":svg:svg", 80)(4, DashboardComponent_For_54_Conditional_4_Template, 2, 0, ":svg:svg", 81);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(5, "div", 82)(6, "div", 83)(7, "strong");
    \u0275\u0275text(8);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(9, "span", 84);
    \u0275\u0275text(10);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(11, "div", 85);
    \u0275\u0275text(12);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(13, "div", 86)(14, "div", 87);
    \u0275\u0275element(15, "div", 88);
    \u0275\u0275elementStart(16, "span", 89);
    \u0275\u0275text(17);
    \u0275\u0275pipe(18, "number");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(19, "div", 90);
    \u0275\u0275text(20);
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    const j_r6 = ctx.$implicit;
    \u0275\u0275advance();
    \u0275\u0275classMap(j_r6.status);
    \u0275\u0275advance();
    \u0275\u0275conditional(j_r6.status === "running" ? 2 : j_r6.status === "completed" ? 3 : 4);
    \u0275\u0275advance(6);
    \u0275\u0275textInterpolate(j_r6.model);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1("\xB7 ", j_r6.provider);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate2(" ", j_r6.sceneId, " \xB7 ", j_r6.objectId ?? "scene-level", " ");
    \u0275\u0275advance(3);
    \u0275\u0275classMap(j_r6.status);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1("", \u0275\u0275pipeBind2(18, 11, j_r6.progress, "1.0-0"), "%");
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate1("$", (j_r6.costActual ?? j_r6.costEstimate).toFixed(2));
  }
}
var DashboardComponent = class _DashboardComponent {
  projectsService = inject(ProjectsService);
  jobs = inject(JobsService);
  router = inject(Router);
  statCards = computed(() => {
    const s = this.projectsService.stats();
    return [
      { label: "Active projects", value: s.inProgress + s.review, delta: "+2 this week", tone: "green", fill: 78 },
      { label: "Total scenes", value: s.totalScenes, delta: "across all projects", tone: "cyan", fill: 64 },
      { label: "Drafts", value: s.drafts, delta: "awaiting setup", tone: "amber", fill: 42 },
      { label: "Completed", value: s.completed, delta: "shipped", tone: "muted", fill: 18 }
    ];
  }, ...ngDevMode ? [{ debugName: "statCards" }] : (
    /* istanbul ignore next */
    []
  ));
  statusTone(s) {
    return { draft: "muted", in_progress: "cyan", review: "amber", completed: "green" }[s];
  }
  statusLabel(s) {
    return { draft: "Draft", in_progress: "In progress", review: "In review", completed: "Completed" }[s];
  }
  goalLabel(g) {
    const map = {
      ad: "Advertisement",
      music_video: "Music video",
      children_story: "Children's story",
      cinematic_trailer: "Cinematic trailer",
      explainer: "Explainer",
      product_demo: "Product demo",
      youtube_short: "YouTube short",
      educational: "Educational",
      documentary: "Documentary"
    };
    return map[g] ?? g;
  }
  static \u0275fac = function DashboardComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _DashboardComponent)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _DashboardComponent, selectors: [["app-dashboard"]], decls: 89, vars: 2, consts: [[1, "hero"], [1, "hero-content"], [1, "eyebrow"], [1, "gradient-text"], [1, "hero-sub"], [1, "row", 2, "gap", "0.75rem", "margin-top", "1.4rem"], ["routerLink", "/projects/new", 1, "btn", "primary", "lg"], ["viewBox", "0 0 20 20", "width", "14", "height", "14", "fill", "none", "stroke", "currentColor", "stroke-width", "2.4"], ["d", "M10 4v12M4 10h12", "stroke-linecap", "round"], ["routerLink", "/assets", 1, "btn", "lg"], ["aria-hidden", "true", 1, "hero-art"], [1, "orb", 3, "class"], [1, "lattice"], [1, "stats"], [1, "card", "stat-card"], [1, "section-row"], [1, "section-title"], [1, "muted", 2, "font-size", "0.85rem"], ["routerLink", "/projects/new", 1, "btn", "ghost", "sm"], [1, "projects-grid"], ["routerLink", "/projects/new", 1, "card", "project-card", "add-card"], [1, "add-glow"], [1, "add-icon"], ["viewBox", "0 0 20 20", "width", "22", "height", "22", "fill", "none", "stroke", "currentColor", "stroke-width", "2"], [1, "add-title"], [1, "muted", 2, "font-size", "0.82rem"], [1, "card", "project-card", 3, "routerLink"], [1, "row", "activity-row"], [1, "card", "flex-col", 2, "flex", "2"], [1, "row", 2, "justify-content", "space-between", "margin-bottom", "0.5rem"], [1, "section-title", 2, "margin", "0"], [1, "chip", "cyan"], [1, "activity-list"], [1, "activity"], [1, "card", "flex-col", 2, "flex", "1"], [1, "section-title", 2, "margin", "0 0 0.5rem"], [1, "quick-actions"], ["routerLink", "/projects/new", 1, "quick-action"], [1, "qa-icon", 2, "background", "var(--grad-primary)"], ["viewBox", "0 0 20 20", "width", "16", "height", "16", "fill", "none", "stroke", "white", "stroke-width", "2.2"], ["d", "M3 10h14M10 3v14", "stroke-linecap", "round"], [1, "qa-title"], [1, "muted", 2, "font-size", "0.76rem"], ["routerLink", "/assets", 1, "quick-action"], [1, "qa-icon", 2, "background", "var(--grad-secondary)"], ["viewBox", "0 0 20 20", "width", "16", "height", "16", "fill", "none", "stroke", "white", "stroke-width", "2"], ["x", "2.5", "y", "3", "width", "15", "height", "14", "rx", "2.5"], ["cx", "7.5", "cy", "8", "r", "1.5"], ["d", "m3 14 4-4 4 4 3-3 3 3"], ["routerLink", "/models", 1, "quick-action"], [1, "qa-icon", 2, "background", "var(--grad-warm)"], ["x", "5", "y", "5", "width", "10", "height", "10", "rx", "1.5"], ["d", "M8 5V3M12 5V3M8 17v-2M12 17v-2M5 8H3M5 12H3M17 8h-2M17 12h-2"], [1, "orb"], [1, "row", 2, "margin-top", "0.55rem", "align-items", "flex-end", "gap", "0.6rem"], [1, "stat-num"], [1, "chip"], [1, "stat-bar"], [1, "stat-fill"], [1, "thumb"], [1, "thumb-overlay"], [1, "chip", "muted"], [1, "play"], ["viewBox", "0 0 24 24", "width", "20", "height", "20", "fill", "white"], ["d", "M8 5v14l11-7z"], [1, "project-body"], [1, "row", 2, "justify-content", "space-between", "align-items", "flex-start"], [2, "min-width", "0"], [1, "project-title"], [1, "muted", 2, "font-size", "0.78rem", "margin-top", "4px"], [1, "project-desc"], [1, "palette"], [1, "swatch", 3, "background-color"], [1, "spacer"], [1, "muted", 2, "font-size", "0.74rem"], [1, "provider-row"], [1, "provider-tag"], [1, "swatch"], [1, "job-icon"], [1, "loader"], ["viewBox", "0 0 20 20", "width", "14", "height", "14", "fill", "none", "stroke", "currentColor", "stroke-width", "2.5"], ["viewBox", "0 0 20 20", "width", "14", "height", "14", "fill", "none", "stroke", "currentColor", "stroke-width", "2"], [2, "flex", "1", "min-width", "0"], [1, "row", 2, "gap", "0.4rem"], [1, "muted", 2, "font-size", "0.78rem"], [1, "muted", 2, "font-size", "0.78rem", "margin-top", "2px"], [2, "text-align", "right"], [1, "row", 2, "gap", "0.3rem"], [1, "status-dot"], [1, "mono", 2, "font-size", "0.8rem"], [1, "muted", 2, "font-size", "0.74rem", "margin-top", "2px"], ["d", "m4 10 4 4 8-8", "stroke-linecap", "round", "stroke-linejoin", "round"], ["cx", "10", "cy", "10", "r", "6"]], template: function DashboardComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275elementStart(0, "section", 0)(1, "div", 1)(2, "div", 2);
      \u0275\u0275text(3, "CineFlow \xB7 v0.1 preview");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(4, "h1");
      \u0275\u0275text(5, "Direct your video like ");
      \u0275\u0275elementStart(6, "span", 3);
      \u0275\u0275text(7, "code");
      \u0275\u0275elementEnd();
      \u0275\u0275text(8, ".");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(9, "p", 4);
      \u0275\u0275text(10, " Versioned, editable creative contracts. Multi-model orchestration. Scene-by-scene approval. Generate professional AI video without losing creative control. ");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(11, "div", 5)(12, "a", 6);
      \u0275\u0275namespaceSVG();
      \u0275\u0275elementStart(13, "svg", 7);
      \u0275\u0275element(14, "path", 8);
      \u0275\u0275elementEnd();
      \u0275\u0275text(15, " New project ");
      \u0275\u0275elementEnd();
      \u0275\u0275namespaceHTML();
      \u0275\u0275elementStart(16, "a", 9);
      \u0275\u0275text(17, "Browse assets");
      \u0275\u0275elementEnd()()();
      \u0275\u0275elementStart(18, "div", 10);
      \u0275\u0275repeaterCreate(19, DashboardComponent_For_20_Template, 1, 2, "div", 11, \u0275\u0275repeaterTrackByIdentity);
      \u0275\u0275element(21, "div", 12);
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(22, "section", 13);
      \u0275\u0275repeaterCreate(23, DashboardComponent_For_24_Template, 10, 7, "div", 14, _forTrack0);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(25, "section", 15)(26, "div")(27, "div", 16);
      \u0275\u0275text(28, "Active projects");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(29, "p", 17);
      \u0275\u0275text(30, "Your in-progress creative contracts.");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(31, "a", 18);
      \u0275\u0275text(32, "+ New project");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(33, "section", 19)(34, "a", 20);
      \u0275\u0275element(35, "div", 21);
      \u0275\u0275elementStart(36, "div", 22);
      \u0275\u0275namespaceSVG();
      \u0275\u0275elementStart(37, "svg", 23);
      \u0275\u0275element(38, "path", 8);
      \u0275\u0275elementEnd()();
      \u0275\u0275namespaceHTML();
      \u0275\u0275elementStart(39, "div", 24);
      \u0275\u0275text(40, "Create new contract");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(41, "div", 25);
      \u0275\u0275text(42, "Start a fresh AI video orchestration");
      \u0275\u0275elementEnd()();
      \u0275\u0275repeaterCreate(43, DashboardComponent_For_44_Template, 35, 20, "a", 26, _forTrack1);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(45, "section", 27)(46, "div", 28)(47, "div", 29)(48, "div", 30);
      \u0275\u0275text(49, "Recent activity");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(50, "span", 31);
      \u0275\u0275text(51);
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(52, "div", 32);
      \u0275\u0275repeaterCreate(53, DashboardComponent_For_54_Template, 21, 14, "div", 33, _forTrack1);
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(55, "div", 34)(56, "div", 35);
      \u0275\u0275text(57, "Quick actions");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(58, "div", 36)(59, "a", 37)(60, "span", 38);
      \u0275\u0275namespaceSVG();
      \u0275\u0275elementStart(61, "svg", 39);
      \u0275\u0275element(62, "path", 40);
      \u0275\u0275elementEnd()();
      \u0275\u0275namespaceHTML();
      \u0275\u0275elementStart(63, "div")(64, "div", 41);
      \u0275\u0275text(65, "New project");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(66, "div", 42);
      \u0275\u0275text(67, "From contract or template");
      \u0275\u0275elementEnd()()();
      \u0275\u0275elementStart(68, "a", 43)(69, "span", 44);
      \u0275\u0275namespaceSVG();
      \u0275\u0275elementStart(70, "svg", 45);
      \u0275\u0275element(71, "rect", 46)(72, "circle", 47)(73, "path", 48);
      \u0275\u0275elementEnd()();
      \u0275\u0275namespaceHTML();
      \u0275\u0275elementStart(74, "div")(75, "div", 41);
      \u0275\u0275text(76, "Upload assets");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(77, "div", 42);
      \u0275\u0275text(78, "Reference images, voices, music");
      \u0275\u0275elementEnd()()();
      \u0275\u0275elementStart(79, "a", 49)(80, "span", 50);
      \u0275\u0275namespaceSVG();
      \u0275\u0275elementStart(81, "svg", 45);
      \u0275\u0275element(82, "rect", 51)(83, "path", 52);
      \u0275\u0275elementEnd()();
      \u0275\u0275namespaceHTML();
      \u0275\u0275elementStart(84, "div")(85, "div", 41);
      \u0275\u0275text(86, "Browse AI models");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(87, "div", 42);
      \u0275\u0275text(88, "Compare providers & costs");
      \u0275\u0275elementEnd()()()()()();
    }
    if (rf & 2) {
      \u0275\u0275advance(19);
      \u0275\u0275repeater(\u0275\u0275pureFunction0(1, _c0));
      \u0275\u0275advance(4);
      \u0275\u0275repeater(ctx.statCards());
      \u0275\u0275advance(20);
      \u0275\u0275repeater(ctx.projectsService.projects());
      \u0275\u0275advance(8);
      \u0275\u0275textInterpolate1("", ctx.jobs.jobs().length, " jobs");
      \u0275\u0275advance(2);
      \u0275\u0275repeater(ctx.jobs.jobs().slice(0, 5));
    }
  }, dependencies: [RouterLink, DatePipe, DecimalPipe], styles: ["\n[_nghost-%COMP%] {\n  display: block;\n}\n.hero[_ngcontent-%COMP%] {\n  position: relative;\n  border-radius: var(--r-2xl);\n  padding: 2rem 2.4rem;\n  background:\n    linear-gradient(\n      135deg,\n      rgba(15, 18, 48, 0.65) 0%,\n      rgba(20, 24, 60, 0.45) 100%);\n  border: 1px solid var(--border);\n  overflow: hidden;\n  display: grid;\n  grid-template-columns: 1.4fr 1fr;\n  gap: 2rem;\n  align-items: center;\n  margin-bottom: 1.5rem;\n  min-height: 240px;\n}\n.hero[_ngcontent-%COMP%]   h1[_ngcontent-%COMP%] {\n  font-size: clamp(1.7rem, 2.6vw, 2.6rem);\n  line-height: 1.1;\n  margin-top: 0.55rem;\n}\n.hero-sub[_ngcontent-%COMP%] {\n  margin-top: 0.9rem;\n  max-width: 540px;\n  font-size: 0.95rem;\n  color: var(--text-2);\n}\n.hero-content[_ngcontent-%COMP%] {\n  position: relative;\n  z-index: 2;\n}\n.hero-art[_ngcontent-%COMP%] {\n  position: relative;\n  height: 100%;\n  min-height: 220px;\n  pointer-events: none;\n}\n.orb[_ngcontent-%COMP%] {\n  position: absolute;\n  border-radius: 50%;\n  filter: blur(28px);\n  animation: _ngcontent-%COMP%_orb-float 12s ease-in-out infinite;\n}\n.orb-1[_ngcontent-%COMP%] {\n  width: 220px;\n  height: 220px;\n  background: var(--neon-violet);\n  top: -20px;\n  right: 80px;\n  opacity: 0.5;\n}\n.orb-2[_ngcontent-%COMP%] {\n  width: 180px;\n  height: 180px;\n  background: var(--neon-cyan);\n  bottom: 0;\n  right: 40px;\n  opacity: 0.45;\n  animation-delay: -3s;\n}\n.orb-3[_ngcontent-%COMP%] {\n  width: 120px;\n  height: 120px;\n  background: var(--neon-magenta);\n  top: 40px;\n  right: 0;\n  opacity: 0.5;\n  animation-delay: -6s;\n}\n.lattice[_ngcontent-%COMP%] {\n  position: absolute;\n  inset: 0;\n  background-image:\n    linear-gradient(rgba(140, 160, 255, 0.08) 1px, transparent 1px),\n    linear-gradient(\n      90deg,\n      rgba(140, 160, 255, 0.08) 1px,\n      transparent 1px);\n  background-size: 28px 28px;\n  -webkit-mask-image:\n    radial-gradient(\n      circle at 70% 50%,\n      black 0%,\n      transparent 70%);\n  mask-image:\n    radial-gradient(\n      circle at 70% 50%,\n      black 0%,\n      transparent 70%);\n}\n@keyframes _ngcontent-%COMP%_orb-float {\n  0%, 100% {\n    transform: translate3d(0, 0, 0) scale(1);\n  }\n  50% {\n    transform: translate3d(-6%, 6%, 0) scale(1.08);\n  }\n}\n.stats[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: repeat(4, 1fr);\n  gap: 0.9rem;\n  margin-bottom: 1.6rem;\n}\n@media (max-width: 1100px) {\n  .stats[_ngcontent-%COMP%] {\n    grid-template-columns: repeat(2, 1fr);\n  }\n}\n.stat-card[_ngcontent-%COMP%] {\n  padding: 1.05rem 1.1rem 1.1rem;\n}\n.stat-num[_ngcontent-%COMP%] {\n  font-family: var(--font-display);\n  font-size: 1.9rem;\n  font-weight: 700;\n  letter-spacing: -0.02em;\n}\n.stat-bar[_ngcontent-%COMP%] {\n  height: 4px;\n  background: rgba(255, 255, 255, 0.05);\n  border-radius: 99px;\n  margin-top: 0.85rem;\n  overflow: hidden;\n}\n.stat-fill[_ngcontent-%COMP%] {\n  height: 100%;\n  background: var(--grad-primary);\n  border-radius: 99px;\n}\n.section-row[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: flex-end;\n  justify-content: space-between;\n  gap: 1rem;\n  margin: 1.6rem 0 0.85rem;\n}\n.projects-grid[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));\n  gap: 1rem;\n  margin-bottom: 1.8rem;\n}\n.project-card[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  padding: 0;\n  text-decoration: none;\n  color: inherit;\n  cursor: pointer;\n  transition:\n    transform 0.2s,\n    border-color 0.2s,\n    box-shadow 0.2s;\n  overflow: hidden;\n}\n.project-card[_ngcontent-%COMP%]:hover {\n  transform: translateY(-3px);\n  border-color: rgba(139, 92, 246, 0.42);\n  box-shadow: 0 12px 36px rgba(139, 92, 246, 0.16);\n}\n.thumb[_ngcontent-%COMP%] {\n  height: 150px;\n  background-color: rgba(139, 92, 246, 0.1);\n  background-size: cover;\n  background-position: center;\n  border-bottom: 1px solid var(--border);\n  position: relative;\n  display: flex;\n  align-items: flex-end;\n  justify-content: space-between;\n  padding: 0.7rem;\n}\n.thumb-overlay[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 0.4rem;\n  flex-wrap: wrap;\n}\n.play[_ngcontent-%COMP%] {\n  position: absolute;\n  top: 50%;\n  left: 50%;\n  transform: translate(-50%, -50%);\n  width: 48px;\n  height: 48px;\n  border-radius: 50%;\n  background: rgba(10, 10, 30, 0.65);\n  -webkit-backdrop-filter: blur(8px);\n  backdrop-filter: blur(8px);\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  opacity: 0;\n  transition: opacity 0.2s;\n  border: 1px solid rgba(255, 255, 255, 0.12);\n}\n.project-card[_ngcontent-%COMP%]:hover   .play[_ngcontent-%COMP%] {\n  opacity: 1;\n}\n.project-body[_ngcontent-%COMP%] {\n  padding: 1rem 1.1rem 1.1rem;\n  display: flex;\n  flex-direction: column;\n  gap: 0.6rem;\n}\n.project-title[_ngcontent-%COMP%] {\n  font-family: var(--font-display);\n  font-weight: 600;\n  font-size: 1.02rem;\n}\n.project-desc[_ngcontent-%COMP%] {\n  font-size: 0.85rem;\n  color: var(--text-2);\n  margin: 0;\n  display: -webkit-box;\n  -webkit-line-clamp: 2;\n  -webkit-box-orient: vertical;\n  overflow: hidden;\n  line-height: 1.45;\n}\n.palette[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 0.3rem;\n}\n.swatch[_ngcontent-%COMP%] {\n  width: 14px;\n  height: 14px;\n  border-radius: 4px;\n  border: 1px solid rgba(255, 255, 255, 0.1);\n}\n.provider-row[_ngcontent-%COMP%] {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.3rem;\n  padding-top: 0.6rem;\n  border-top: 1px dashed var(--border);\n}\n.provider-tag[_ngcontent-%COMP%] {\n  font-size: 0.7rem;\n  font-family: var(--font-mono);\n  padding: 0.18rem 0.5rem;\n  border-radius: 5px;\n  background: rgba(34, 211, 238, 0.08);\n  color: var(--neon-cyan);\n  border: 1px solid rgba(34, 211, 238, 0.18);\n}\n.add-card[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  flex-direction: column;\n  text-align: center;\n  border-style: dashed;\n  border-color: rgba(139, 92, 246, 0.3);\n  background: rgba(139, 92, 246, 0.05);\n  padding: 1.6rem;\n  min-height: 280px;\n  position: relative;\n  overflow: hidden;\n}\n.add-card[_ngcontent-%COMP%]:hover {\n  border-style: solid;\n}\n.add-glow[_ngcontent-%COMP%] {\n  position: absolute;\n  inset: 0;\n  background:\n    radial-gradient(\n      circle at center,\n      rgba(139, 92, 246, 0.18),\n      transparent 60%);\n}\n.add-icon[_ngcontent-%COMP%] {\n  width: 56px;\n  height: 56px;\n  border-radius: 50%;\n  background: var(--grad-primary);\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  color: white;\n  margin-bottom: 0.85rem;\n  box-shadow: 0 0 30px rgba(139, 92, 246, 0.5);\n  position: relative;\n}\n.add-title[_ngcontent-%COMP%] {\n  font-family: var(--font-display);\n  font-weight: 600;\n  font-size: 1.05rem;\n  position: relative;\n}\n.activity-row[_ngcontent-%COMP%] {\n  gap: 1rem;\n  align-items: stretch;\n  flex-wrap: wrap;\n  margin-top: 0.5rem;\n}\n.flex-col[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n}\n.activity-list[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n}\n.activity[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 0.85rem;\n  padding: 0.75rem 0.4rem;\n  border-bottom: 1px solid var(--border);\n}\n.activity[_ngcontent-%COMP%]:last-child {\n  border-bottom: none;\n}\n.job-icon[_ngcontent-%COMP%] {\n  width: 28px;\n  height: 28px;\n  border-radius: 50%;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  flex-shrink: 0;\n}\n.job-icon.completed[_ngcontent-%COMP%] {\n  background: rgba(52, 211, 153, 0.15);\n  color: var(--neon-green);\n}\n.job-icon.running[_ngcontent-%COMP%] {\n  background: rgba(139, 92, 246, 0.15);\n  color: var(--neon-violet);\n}\n.job-icon.queued[_ngcontent-%COMP%] {\n  background: rgba(140, 160, 255, 0.1);\n  color: var(--text-3);\n}\n.job-icon.failed[_ngcontent-%COMP%] {\n  background: rgba(251, 113, 133, 0.15);\n  color: var(--neon-rose);\n}\n.status-dot[_ngcontent-%COMP%] {\n  width: 7px;\n  height: 7px;\n  border-radius: 50%;\n}\n.status-dot.completed[_ngcontent-%COMP%] {\n  background: var(--neon-green);\n  box-shadow: 0 0 10px var(--neon-green);\n}\n.status-dot.running[_ngcontent-%COMP%] {\n  background: var(--neon-violet);\n  box-shadow: 0 0 10px var(--neon-violet);\n}\n.status-dot.queued[_ngcontent-%COMP%] {\n  background: var(--text-3);\n}\n.status-dot.failed[_ngcontent-%COMP%] {\n  background: var(--neon-rose);\n}\n.quick-actions[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 0.55rem;\n}\n.quick-action[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 0.85rem;\n  padding: 0.75rem 0.85rem;\n  border-radius: 12px;\n  border: 1px solid var(--border);\n  background: rgba(255, 255, 255, 0.03);\n  text-decoration: none;\n  color: inherit;\n  transition: all 0.18s;\n}\n.quick-action[_ngcontent-%COMP%]:hover {\n  border-color: var(--border-strong);\n  background: rgba(255, 255, 255, 0.06);\n  transform: translateX(2px);\n}\n.qa-icon[_ngcontent-%COMP%] {\n  width: 36px;\n  height: 36px;\n  border-radius: 10px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  flex-shrink: 0;\n}\n.qa-title[_ngcontent-%COMP%] {\n  font-family: var(--font-display);\n  font-weight: 600;\n  font-size: 0.92rem;\n}\n@media (max-width: 900px) {\n  .hero[_ngcontent-%COMP%] {\n    grid-template-columns: 1fr;\n    padding: 1.4rem;\n  }\n  .hero-art[_ngcontent-%COMP%] {\n    display: none;\n  }\n  .activity-row[_ngcontent-%COMP%]    > .card[_ngcontent-%COMP%] {\n    flex: 1 1 100%;\n  }\n}\n/*# sourceMappingURL=dashboard.component.css.map */"], changeDetection: 0 });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(DashboardComponent, [{
    type: Component,
    args: [{ selector: "app-dashboard", imports: [RouterLink, DatePipe, DecimalPipe], changeDetection: ChangeDetectionStrategy.OnPush, template: `
    <section class="hero">
      <div class="hero-content">
        <div class="eyebrow">CineFlow \xB7 v0.1 preview</div>
        <h1>Direct your video like <span class="gradient-text">code</span>.</h1>
        <p class="hero-sub">
          Versioned, editable creative contracts. Multi-model orchestration. Scene-by-scene approval.
          Generate professional AI video without losing creative control.
        </p>
        <div class="row" style="gap: 0.75rem; margin-top: 1.4rem">
          <a class="btn primary lg" routerLink="/projects/new">
            <svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.4">
              <path d="M10 4v12M4 10h12" stroke-linecap="round"/>
            </svg>
            New project
          </a>
          <a class="btn lg" routerLink="/assets">Browse assets</a>
        </div>
      </div>
      <div class="hero-art" aria-hidden="true">
        @for (orb of [1,2,3]; track orb) {
          <div class="orb" [class]="'orb-' + orb"></div>
        }
        <div class="lattice"></div>
      </div>
    </section>

    <section class="stats">
      @for (s of statCards(); track s.label) {
        <div class="card stat-card">
          <div class="eyebrow">{{ s.label }}</div>
          <div class="row" style="margin-top: 0.55rem; align-items: flex-end; gap: 0.6rem">
            <div class="stat-num">{{ s.value }}</div>
            <span class="chip" [class]="s.tone">{{ s.delta }}</span>
          </div>
          <div class="stat-bar"><div class="stat-fill" [style.width]="s.fill + '%'"></div></div>
        </div>
      }
    </section>

    <section class="section-row">
      <div>
        <div class="section-title">Active projects</div>
        <p class="muted" style="font-size: 0.85rem">Your in-progress creative contracts.</p>
      </div>
      <a class="btn ghost sm" routerLink="/projects/new">+ New project</a>
    </section>

    <section class="projects-grid">
      <a class="card project-card add-card" routerLink="/projects/new">
        <div class="add-glow"></div>
        <div class="add-icon">
          <svg viewBox="0 0 20 20" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M10 4v12M4 10h12" stroke-linecap="round"/>
          </svg>
        </div>
        <div class="add-title">Create new contract</div>
        <div class="muted" style="font-size: 0.82rem">Start a fresh AI video orchestration</div>
      </a>

      @for (p of projectsService.projects(); track p.id) {
        <a class="card project-card" [routerLink]="['/projects', p.id]">
          <div class="thumb" [style.background-image]="p.thumbnailUrl ? 'url(' + p.thumbnailUrl + ')' : ''">
            <div class="thumb-overlay">
              <span class="chip" [class]="statusTone(p.status)">{{ statusLabel(p.status) }}</span>
              <span class="chip muted">{{ p.output.aspectRatio }}</span>
            </div>
            <div class="play">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="white"><path d="M8 5v14l11-7z"/></svg>
            </div>
          </div>
          <div class="project-body">
            <div class="row" style="justify-content: space-between; align-items: flex-start">
              <div style="min-width: 0">
                <div class="project-title">{{ p.title }}</div>
                <div class="muted" style="font-size: 0.78rem; margin-top: 4px">{{ goalLabel(p.goal) }}</div>
              </div>
              <span class="chip cyan">{{ p.scenes.length }} scenes</span>
            </div>
            <p class="project-desc">{{ p.description }}</p>
            <div class="palette">
              @for (c of p.creativeDirection.colorPalette; track c) {
                <span class="swatch" [style.background-color]="c"></span>
              }
              <div class="spacer"></div>
              <span class="muted" style="font-size: 0.74rem">{{ p.updatedAt | date: 'mediumDate' }}</span>
            </div>
            <div class="provider-row">
              <span class="provider-tag">{{ p.models.video.model }}</span>
              <span class="provider-tag">{{ p.models.image.model }}</span>
              <span class="provider-tag">{{ p.models.voice.provider }}</span>
            </div>
          </div>
        </a>
      }
    </section>

    <section class="row activity-row">
      <div class="card flex-col" style="flex: 2">
        <div class="row" style="justify-content: space-between; margin-bottom: 0.5rem">
          <div class="section-title" style="margin: 0">Recent activity</div>
          <span class="chip cyan">{{ jobs.jobs().length }} jobs</span>
        </div>
        <div class="activity-list">
          @for (j of jobs.jobs().slice(0, 5); track j.id) {
            <div class="activity">
              <div class="job-icon" [class]="j.status">
                @if (j.status === 'running') {
                  <span class="loader"></span>
                } @else if (j.status === 'completed') {
                  <svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5">
                    <path d="m4 10 4 4 8-8" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                } @else {
                  <svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><circle cx="10" cy="10" r="6"/></svg>
                }
              </div>
              <div style="flex: 1; min-width: 0">
                <div class="row" style="gap: 0.4rem">
                  <strong>{{ j.model }}</strong>
                  <span class="muted" style="font-size: 0.78rem">\xB7 {{ j.provider }}</span>
                </div>
                <div class="muted" style="font-size: 0.78rem; margin-top: 2px">
                  {{ j.sceneId }} \xB7 {{ j.objectId ?? 'scene-level' }}
                </div>
              </div>
              <div style="text-align: right">
                <div class="row" style="gap: 0.3rem">
                  <div class="status-dot" [class]="j.status"></div>
                  <span class="mono" style="font-size: 0.8rem">{{ j.progress | number: '1.0-0' }}%</span>
                </div>
                <div class="muted" style="font-size: 0.74rem; margin-top: 2px">\${{ (j.costActual ?? j.costEstimate).toFixed(2) }}</div>
              </div>
            </div>
          }
        </div>
      </div>

      <div class="card flex-col" style="flex: 1">
        <div class="section-title" style="margin: 0 0 0.5rem">Quick actions</div>
        <div class="quick-actions">
          <a class="quick-action" routerLink="/projects/new">
            <span class="qa-icon" style="background: var(--grad-primary)">
              <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="white" stroke-width="2.2"><path d="M3 10h14M10 3v14" stroke-linecap="round"/></svg>
            </span>
            <div>
              <div class="qa-title">New project</div>
              <div class="muted" style="font-size: 0.76rem">From contract or template</div>
            </div>
          </a>
          <a class="quick-action" routerLink="/assets">
            <span class="qa-icon" style="background: var(--grad-secondary)">
              <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="white" stroke-width="2"><rect x="2.5" y="3" width="15" height="14" rx="2.5"/><circle cx="7.5" cy="8" r="1.5"/><path d="m3 14 4-4 4 4 3-3 3 3"/></svg>
            </span>
            <div>
              <div class="qa-title">Upload assets</div>
              <div class="muted" style="font-size: 0.76rem">Reference images, voices, music</div>
            </div>
          </a>
          <a class="quick-action" routerLink="/models">
            <span class="qa-icon" style="background: var(--grad-warm)">
              <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="white" stroke-width="2"><rect x="5" y="5" width="10" height="10" rx="1.5"/><path d="M8 5V3M12 5V3M8 17v-2M12 17v-2M5 8H3M5 12H3M17 8h-2M17 12h-2"/></svg>
            </span>
            <div>
              <div class="qa-title">Browse AI models</div>
              <div class="muted" style="font-size: 0.76rem">Compare providers & costs</div>
            </div>
          </a>
        </div>
      </div>
    </section>
  `, styles: ["/* src/app/features/dashboard/dashboard.component.scss */\n:host {\n  display: block;\n}\n.hero {\n  position: relative;\n  border-radius: var(--r-2xl);\n  padding: 2rem 2.4rem;\n  background:\n    linear-gradient(\n      135deg,\n      rgba(15, 18, 48, 0.65) 0%,\n      rgba(20, 24, 60, 0.45) 100%);\n  border: 1px solid var(--border);\n  overflow: hidden;\n  display: grid;\n  grid-template-columns: 1.4fr 1fr;\n  gap: 2rem;\n  align-items: center;\n  margin-bottom: 1.5rem;\n  min-height: 240px;\n}\n.hero h1 {\n  font-size: clamp(1.7rem, 2.6vw, 2.6rem);\n  line-height: 1.1;\n  margin-top: 0.55rem;\n}\n.hero-sub {\n  margin-top: 0.9rem;\n  max-width: 540px;\n  font-size: 0.95rem;\n  color: var(--text-2);\n}\n.hero-content {\n  position: relative;\n  z-index: 2;\n}\n.hero-art {\n  position: relative;\n  height: 100%;\n  min-height: 220px;\n  pointer-events: none;\n}\n.orb {\n  position: absolute;\n  border-radius: 50%;\n  filter: blur(28px);\n  animation: orb-float 12s ease-in-out infinite;\n}\n.orb-1 {\n  width: 220px;\n  height: 220px;\n  background: var(--neon-violet);\n  top: -20px;\n  right: 80px;\n  opacity: 0.5;\n}\n.orb-2 {\n  width: 180px;\n  height: 180px;\n  background: var(--neon-cyan);\n  bottom: 0;\n  right: 40px;\n  opacity: 0.45;\n  animation-delay: -3s;\n}\n.orb-3 {\n  width: 120px;\n  height: 120px;\n  background: var(--neon-magenta);\n  top: 40px;\n  right: 0;\n  opacity: 0.5;\n  animation-delay: -6s;\n}\n.lattice {\n  position: absolute;\n  inset: 0;\n  background-image:\n    linear-gradient(rgba(140, 160, 255, 0.08) 1px, transparent 1px),\n    linear-gradient(\n      90deg,\n      rgba(140, 160, 255, 0.08) 1px,\n      transparent 1px);\n  background-size: 28px 28px;\n  -webkit-mask-image:\n    radial-gradient(\n      circle at 70% 50%,\n      black 0%,\n      transparent 70%);\n  mask-image:\n    radial-gradient(\n      circle at 70% 50%,\n      black 0%,\n      transparent 70%);\n}\n@keyframes orb-float {\n  0%, 100% {\n    transform: translate3d(0, 0, 0) scale(1);\n  }\n  50% {\n    transform: translate3d(-6%, 6%, 0) scale(1.08);\n  }\n}\n.stats {\n  display: grid;\n  grid-template-columns: repeat(4, 1fr);\n  gap: 0.9rem;\n  margin-bottom: 1.6rem;\n}\n@media (max-width: 1100px) {\n  .stats {\n    grid-template-columns: repeat(2, 1fr);\n  }\n}\n.stat-card {\n  padding: 1.05rem 1.1rem 1.1rem;\n}\n.stat-num {\n  font-family: var(--font-display);\n  font-size: 1.9rem;\n  font-weight: 700;\n  letter-spacing: -0.02em;\n}\n.stat-bar {\n  height: 4px;\n  background: rgba(255, 255, 255, 0.05);\n  border-radius: 99px;\n  margin-top: 0.85rem;\n  overflow: hidden;\n}\n.stat-fill {\n  height: 100%;\n  background: var(--grad-primary);\n  border-radius: 99px;\n}\n.section-row {\n  display: flex;\n  align-items: flex-end;\n  justify-content: space-between;\n  gap: 1rem;\n  margin: 1.6rem 0 0.85rem;\n}\n.projects-grid {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));\n  gap: 1rem;\n  margin-bottom: 1.8rem;\n}\n.project-card {\n  display: flex;\n  flex-direction: column;\n  padding: 0;\n  text-decoration: none;\n  color: inherit;\n  cursor: pointer;\n  transition:\n    transform 0.2s,\n    border-color 0.2s,\n    box-shadow 0.2s;\n  overflow: hidden;\n}\n.project-card:hover {\n  transform: translateY(-3px);\n  border-color: rgba(139, 92, 246, 0.42);\n  box-shadow: 0 12px 36px rgba(139, 92, 246, 0.16);\n}\n.thumb {\n  height: 150px;\n  background-color: rgba(139, 92, 246, 0.1);\n  background-size: cover;\n  background-position: center;\n  border-bottom: 1px solid var(--border);\n  position: relative;\n  display: flex;\n  align-items: flex-end;\n  justify-content: space-between;\n  padding: 0.7rem;\n}\n.thumb-overlay {\n  display: flex;\n  gap: 0.4rem;\n  flex-wrap: wrap;\n}\n.play {\n  position: absolute;\n  top: 50%;\n  left: 50%;\n  transform: translate(-50%, -50%);\n  width: 48px;\n  height: 48px;\n  border-radius: 50%;\n  background: rgba(10, 10, 30, 0.65);\n  -webkit-backdrop-filter: blur(8px);\n  backdrop-filter: blur(8px);\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  opacity: 0;\n  transition: opacity 0.2s;\n  border: 1px solid rgba(255, 255, 255, 0.12);\n}\n.project-card:hover .play {\n  opacity: 1;\n}\n.project-body {\n  padding: 1rem 1.1rem 1.1rem;\n  display: flex;\n  flex-direction: column;\n  gap: 0.6rem;\n}\n.project-title {\n  font-family: var(--font-display);\n  font-weight: 600;\n  font-size: 1.02rem;\n}\n.project-desc {\n  font-size: 0.85rem;\n  color: var(--text-2);\n  margin: 0;\n  display: -webkit-box;\n  -webkit-line-clamp: 2;\n  -webkit-box-orient: vertical;\n  overflow: hidden;\n  line-height: 1.45;\n}\n.palette {\n  display: flex;\n  align-items: center;\n  gap: 0.3rem;\n}\n.swatch {\n  width: 14px;\n  height: 14px;\n  border-radius: 4px;\n  border: 1px solid rgba(255, 255, 255, 0.1);\n}\n.provider-row {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.3rem;\n  padding-top: 0.6rem;\n  border-top: 1px dashed var(--border);\n}\n.provider-tag {\n  font-size: 0.7rem;\n  font-family: var(--font-mono);\n  padding: 0.18rem 0.5rem;\n  border-radius: 5px;\n  background: rgba(34, 211, 238, 0.08);\n  color: var(--neon-cyan);\n  border: 1px solid rgba(34, 211, 238, 0.18);\n}\n.add-card {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  flex-direction: column;\n  text-align: center;\n  border-style: dashed;\n  border-color: rgba(139, 92, 246, 0.3);\n  background: rgba(139, 92, 246, 0.05);\n  padding: 1.6rem;\n  min-height: 280px;\n  position: relative;\n  overflow: hidden;\n}\n.add-card:hover {\n  border-style: solid;\n}\n.add-glow {\n  position: absolute;\n  inset: 0;\n  background:\n    radial-gradient(\n      circle at center,\n      rgba(139, 92, 246, 0.18),\n      transparent 60%);\n}\n.add-icon {\n  width: 56px;\n  height: 56px;\n  border-radius: 50%;\n  background: var(--grad-primary);\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  color: white;\n  margin-bottom: 0.85rem;\n  box-shadow: 0 0 30px rgba(139, 92, 246, 0.5);\n  position: relative;\n}\n.add-title {\n  font-family: var(--font-display);\n  font-weight: 600;\n  font-size: 1.05rem;\n  position: relative;\n}\n.activity-row {\n  gap: 1rem;\n  align-items: stretch;\n  flex-wrap: wrap;\n  margin-top: 0.5rem;\n}\n.flex-col {\n  display: flex;\n  flex-direction: column;\n}\n.activity-list {\n  display: flex;\n  flex-direction: column;\n}\n.activity {\n  display: flex;\n  align-items: center;\n  gap: 0.85rem;\n  padding: 0.75rem 0.4rem;\n  border-bottom: 1px solid var(--border);\n}\n.activity:last-child {\n  border-bottom: none;\n}\n.job-icon {\n  width: 28px;\n  height: 28px;\n  border-radius: 50%;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  flex-shrink: 0;\n}\n.job-icon.completed {\n  background: rgba(52, 211, 153, 0.15);\n  color: var(--neon-green);\n}\n.job-icon.running {\n  background: rgba(139, 92, 246, 0.15);\n  color: var(--neon-violet);\n}\n.job-icon.queued {\n  background: rgba(140, 160, 255, 0.1);\n  color: var(--text-3);\n}\n.job-icon.failed {\n  background: rgba(251, 113, 133, 0.15);\n  color: var(--neon-rose);\n}\n.status-dot {\n  width: 7px;\n  height: 7px;\n  border-radius: 50%;\n}\n.status-dot.completed {\n  background: var(--neon-green);\n  box-shadow: 0 0 10px var(--neon-green);\n}\n.status-dot.running {\n  background: var(--neon-violet);\n  box-shadow: 0 0 10px var(--neon-violet);\n}\n.status-dot.queued {\n  background: var(--text-3);\n}\n.status-dot.failed {\n  background: var(--neon-rose);\n}\n.quick-actions {\n  display: flex;\n  flex-direction: column;\n  gap: 0.55rem;\n}\n.quick-action {\n  display: flex;\n  align-items: center;\n  gap: 0.85rem;\n  padding: 0.75rem 0.85rem;\n  border-radius: 12px;\n  border: 1px solid var(--border);\n  background: rgba(255, 255, 255, 0.03);\n  text-decoration: none;\n  color: inherit;\n  transition: all 0.18s;\n}\n.quick-action:hover {\n  border-color: var(--border-strong);\n  background: rgba(255, 255, 255, 0.06);\n  transform: translateX(2px);\n}\n.qa-icon {\n  width: 36px;\n  height: 36px;\n  border-radius: 10px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  flex-shrink: 0;\n}\n.qa-title {\n  font-family: var(--font-display);\n  font-weight: 600;\n  font-size: 0.92rem;\n}\n@media (max-width: 900px) {\n  .hero {\n    grid-template-columns: 1fr;\n    padding: 1.4rem;\n  }\n  .hero-art {\n    display: none;\n  }\n  .activity-row > .card {\n    flex: 1 1 100%;\n  }\n}\n/*# sourceMappingURL=dashboard.component.css.map */\n"] }]
  }], null, null);
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(DashboardComponent, { className: "DashboardComponent", filePath: "src/app/features/dashboard/dashboard.component.ts", lineNumber: 186 });
})();
export {
  DashboardComponent
};
//# sourceMappingURL=chunk-F3GYXSRM.js.map
