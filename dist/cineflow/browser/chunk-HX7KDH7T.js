import {
  ProjectsService
} from "./chunk-JI6S375N.js";
import {
  RouterLink,
  RouterLinkActive,
  RouterOutlet
} from "./chunk-A2MSORV3.js";
import "./chunk-5UP4TGNH.js";
import {
  ChangeDetectionStrategy,
  Component,
  setClassMetadata,
  signal,
  ɵsetClassDebugInfo,
  ɵɵadvance,
  ɵɵattribute,
  ɵɵclassProp,
  ɵɵconditional,
  ɵɵconditionalCreate,
  ɵɵdefineComponent,
  ɵɵdirectiveInject,
  ɵɵelement,
  ɵɵelementEnd,
  ɵɵelementStart,
  ɵɵlistener,
  ɵɵnamespaceHTML,
  ɵɵnamespaceSVG,
  ɵɵnextContext,
  ɵɵproperty,
  ɵɵpureFunction1,
  ɵɵrepeater,
  ɵɵrepeaterCreate,
  ɵɵsanitizeHtml,
  ɵɵtext,
  ɵɵtextInterpolate
} from "./chunk-YYMU35ZW.js";

// src/app/shared/layout/shell.component.ts
var _c0 = (a0) => ({ exact: a0 });
var _forTrack0 = ($index, $item) => $item.title;
var _forTrack1 = ($index, $item) => $item.path;
function ShellComponent_Conditional_12_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 11)(1, "div", 35);
    \u0275\u0275text(2, "CineFlow");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "div", 36);
    \u0275\u0275text(4, "AI Video Orchestration");
    \u0275\u0275elementEnd()();
  }
}
function ShellComponent_For_15_Conditional_0_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 37);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const group_r1 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(group_r1.title);
  }
}
function ShellComponent_For_15_For_2_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 40);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const item_r2 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(item_r2.label);
  }
}
function ShellComponent_For_15_For_2_Conditional_3_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 41);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const item_r2 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(item_r2.badge);
  }
}
function ShellComponent_For_15_For_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "a", 38);
    \u0275\u0275element(1, "span", 39);
    \u0275\u0275conditionalCreate(2, ShellComponent_For_15_For_2_Conditional_2_Template, 2, 1, "span", 40);
    \u0275\u0275conditionalCreate(3, ShellComponent_For_15_For_2_Conditional_3_Template, 2, 1, "span", 41);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const item_r2 = ctx.$implicit;
    const ctx_r2 = \u0275\u0275nextContext(2);
    \u0275\u0275property("routerLink", item_r2.path)("routerLinkActiveOptions", \u0275\u0275pureFunction1(6, _c0, item_r2.path === "/dashboard"))("title", ctx_r2.collapsed() ? item_r2.label : null);
    \u0275\u0275advance();
    \u0275\u0275property("innerHTML", item_r2.icon, \u0275\u0275sanitizeHtml);
    \u0275\u0275advance();
    \u0275\u0275conditional(!ctx_r2.collapsed() ? 2 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(!ctx_r2.collapsed() && item_r2.badge ? 3 : -1);
  }
}
function ShellComponent_For_15_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275conditionalCreate(0, ShellComponent_For_15_Conditional_0_Template, 2, 1, "div", 37);
    \u0275\u0275repeaterCreate(1, ShellComponent_For_15_For_2_Template, 4, 8, "a", 38, _forTrack1);
  }
  if (rf & 2) {
    const group_r1 = ctx.$implicit;
    const ctx_r2 = \u0275\u0275nextContext();
    \u0275\u0275conditional(!ctx_r2.collapsed() ? 0 : -1);
    \u0275\u0275advance();
    \u0275\u0275repeater(group_r1.items);
  }
}
function ShellComponent_Conditional_20_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 17)(1, "div", 26);
    \u0275\u0275element(2, "div", 42);
    \u0275\u0275elementStart(3, "div")(4, "div", 43);
    \u0275\u0275text(5, "Credits");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(6, "div", 44);
    \u0275\u0275text(7, "2,450");
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(8, "div", 45);
    \u0275\u0275element(9, "div", 46);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(10, "button", 47);
    \u0275\u0275text(11, "Upgrade plan");
    \u0275\u0275elementEnd()();
  }
}
var ShellComponent = class _ShellComponent {
  projects;
  collapsed = signal(false, ...ngDevMode ? [{ debugName: "collapsed" }] : (
    /* istanbul ignore next */
    []
  ));
  navGroups = [
    {
      title: "Workspace",
      items: [
        { label: "Dashboard", path: "/dashboard", icon: this.icon("dashboard") },
        { label: "New project", path: "/projects/new", icon: this.icon("add") }
      ]
    },
    {
      title: "Library",
      items: [
        { label: "Asset library", path: "/assets", icon: this.icon("image") },
        { label: "AI models", path: "/models", icon: this.icon("chip"), badge: "13" },
        { label: "Jobs", path: "/jobs", icon: this.icon("jobs") }
      ]
    }
  ];
  constructor(projects) {
    this.projects = projects;
  }
  toggleCollapsed() {
    this.collapsed.update((v) => !v);
  }
  icon(kind) {
    const map = {
      dashboard: `<svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="2.5" y="2.5" width="6" height="8" rx="1.5"/><rect x="2.5" y="12" width="6" height="5.5" rx="1.5"/><rect x="11.5" y="2.5" width="6" height="5.5" rx="1.5"/><rect x="11.5" y="9.5" width="6" height="8" rx="1.5"/></svg>`,
      add: `<svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="10" cy="10" r="7.5"/><path d="M10 6.5v7M6.5 10h7" stroke-linecap="round"/></svg>`,
      image: `<svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="2.5" y="3" width="15" height="14" rx="2.5"/><circle cx="7.5" cy="8" r="1.5"/><path d="m3 14 4-4 4 4 3-3 3 3"/></svg>`,
      chip: `<svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="5" y="5" width="10" height="10" rx="1.5"/><path d="M8 5V3M12 5V3M8 17v-2M12 17v-2M5 8H3M5 12H3M17 8h-2M17 12h-2"/></svg>`,
      jobs: `<svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M3.5 6.5h13M3.5 10h13M3.5 13.5h8" stroke-linecap="round"/><circle cx="14.5" cy="13.5" r="2.5"/></svg>`
    };
    return map[kind] ?? "";
  }
  static \u0275fac = function ShellComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _ShellComponent)(\u0275\u0275directiveInject(ProjectsService));
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _ShellComponent, selectors: [["app-shell"]], decls: 43, vars: 6, consts: [[1, "shell"], [1, "sidebar"], [1, "brand"], [1, "logo"], ["viewBox", "0 0 32 32", "width", "22", "height", "22", "aria-hidden", "true"], ["id", "lg", "x1", "0", "y1", "0", "x2", "1", "y2", "1"], ["offset", "0%", "stop-color", "#8b5cf6"], ["offset", "50%", "stop-color", "#ec4899"], ["offset", "100%", "stop-color", "#22d3ee"], ["width", "32", "height", "32", "rx", "8", "fill", "url(#lg)"], ["d", "M11 10 L23 16 L11 22 Z", "fill", "white"], [1, "brand-text"], [1, "nav"], [1, "sidebar-footer"], [1, "iconbtn", "collapse-btn", 3, "click", "title"], ["viewBox", "0 0 20 20", "width", "14", "height", "14", "fill", "none", "stroke", "currentColor", "stroke-width", "2"], ["stroke-linecap", "round", "stroke-linejoin", "round"], [1, "usage", "card", "gradient"], [1, "main"], [1, "topbar"], [1, "search"], ["viewBox", "0 0 20 20", "width", "16", "height", "16", "fill", "none", "stroke", "currentColor", "stroke-width", "2"], ["cx", "9", "cy", "9", "r", "6.5"], ["d", "m14 14 4 4", "stroke-linecap", "round"], ["placeholder", "Search projects, scenes, assets, models\u2026"], [1, "kbd"], [1, "row"], ["title", "Notifications", 1, "iconbtn"], ["d", "M5 8a5 5 0 0 1 10 0v4l1.5 2.5h-13L5 12V8Z", "stroke-linejoin", "round"], ["d", "M8 16a2 2 0 0 0 4 0"], ["title", "Settings", 1, "iconbtn"], ["cx", "10", "cy", "10", "r", "2.5"], ["d", "M10 1.5v3M10 15.5v3M1.5 10h3M15.5 10h3M3.8 3.8l2.1 2.1M14.1 14.1l2.1 2.1M3.8 16.2l2.1-2.1M14.1 5.9l2.1-2.1", "stroke-linecap", "round"], ["title", "Razmik", 1, "avatar"], [1, "content"], [1, "brand-name"], [1, "brand-tag"], [1, "nav-group"], ["routerLinkActive", "active", 1, "nav-item", 3, "routerLink", "routerLinkActiveOptions", "title"], [1, "nav-icon", 3, "innerHTML"], [1, "nav-label"], [1, "nav-badge"], [1, "usage-pulse"], [1, "eyebrow"], [1, "usage-num"], [1, "usage-bar"], [1, "usage-fill", 2, "width", "62%"], [1, "btn", "primary", "sm", 2, "width", "100%", "margin-top", "0.6rem"]], template: function ShellComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275elementStart(0, "div", 0)(1, "aside", 1)(2, "div", 2)(3, "div", 3);
      \u0275\u0275namespaceSVG();
      \u0275\u0275elementStart(4, "svg", 4)(5, "defs")(6, "linearGradient", 5);
      \u0275\u0275element(7, "stop", 6)(8, "stop", 7)(9, "stop", 8);
      \u0275\u0275elementEnd()();
      \u0275\u0275element(10, "rect", 9)(11, "path", 10);
      \u0275\u0275elementEnd()();
      \u0275\u0275conditionalCreate(12, ShellComponent_Conditional_12_Template, 5, 0, "div", 11);
      \u0275\u0275elementEnd();
      \u0275\u0275namespaceHTML();
      \u0275\u0275elementStart(13, "nav", 12);
      \u0275\u0275repeaterCreate(14, ShellComponent_For_15_Template, 3, 1, null, null, _forTrack0);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(16, "div", 13)(17, "button", 14);
      \u0275\u0275listener("click", function ShellComponent_Template_button_click_17_listener() {
        return ctx.toggleCollapsed();
      });
      \u0275\u0275namespaceSVG();
      \u0275\u0275elementStart(18, "svg", 15);
      \u0275\u0275element(19, "path", 16);
      \u0275\u0275elementEnd()();
      \u0275\u0275conditionalCreate(20, ShellComponent_Conditional_20_Template, 12, 0, "div", 17);
      \u0275\u0275elementEnd()();
      \u0275\u0275namespaceHTML();
      \u0275\u0275elementStart(21, "div", 18)(22, "header", 19)(23, "div", 20);
      \u0275\u0275namespaceSVG();
      \u0275\u0275elementStart(24, "svg", 21);
      \u0275\u0275element(25, "circle", 22)(26, "path", 23);
      \u0275\u0275elementEnd();
      \u0275\u0275namespaceHTML();
      \u0275\u0275element(27, "input", 24);
      \u0275\u0275elementStart(28, "span", 25);
      \u0275\u0275text(29, "\u2318K");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(30, "div", 26)(31, "button", 27);
      \u0275\u0275namespaceSVG();
      \u0275\u0275elementStart(32, "svg", 21);
      \u0275\u0275element(33, "path", 28)(34, "path", 29);
      \u0275\u0275elementEnd()();
      \u0275\u0275namespaceHTML();
      \u0275\u0275elementStart(35, "button", 30);
      \u0275\u0275namespaceSVG();
      \u0275\u0275elementStart(36, "svg", 21);
      \u0275\u0275element(37, "circle", 31)(38, "path", 32);
      \u0275\u0275elementEnd()();
      \u0275\u0275namespaceHTML();
      \u0275\u0275elementStart(39, "div", 33);
      \u0275\u0275text(40, "RC");
      \u0275\u0275elementEnd()()();
      \u0275\u0275elementStart(41, "main", 34);
      \u0275\u0275element(42, "router-outlet");
      \u0275\u0275elementEnd()()();
    }
    if (rf & 2) {
      \u0275\u0275advance();
      \u0275\u0275classProp("collapsed", ctx.collapsed());
      \u0275\u0275advance(11);
      \u0275\u0275conditional(!ctx.collapsed() ? 12 : -1);
      \u0275\u0275advance(2);
      \u0275\u0275repeater(ctx.navGroups);
      \u0275\u0275advance(3);
      \u0275\u0275property("title", ctx.collapsed() ? "Expand" : "Collapse");
      \u0275\u0275advance(2);
      \u0275\u0275attribute("d", ctx.collapsed() ? "M7 5l5 5-5 5" : "M13 5l-5 5 5 5");
      \u0275\u0275advance();
      \u0275\u0275conditional(!ctx.collapsed() ? 20 : -1);
    }
  }, dependencies: [RouterLink, RouterLinkActive, RouterOutlet], styles: ['\n[_nghost-%COMP%] {\n  display: block;\n  height: 100vh;\n  overflow: hidden;\n}\n.shell[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: 250px 1fr;\n  height: 100vh;\n  transition: grid-template-columns 0.22s ease;\n}\n.shell[_ngcontent-%COMP%]:has(.sidebar.collapsed) {\n  grid-template-columns: 72px 1fr;\n}\n.sidebar[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  padding: 1.1rem 0.85rem 1rem;\n  background:\n    linear-gradient(\n      180deg,\n      rgba(10, 12, 31, 0.85) 0%,\n      rgba(5, 6, 19, 0.95) 100%);\n  border-right: 1px solid var(--border);\n  position: relative;\n  z-index: 4;\n  overflow: hidden;\n}\n.sidebar[_ngcontent-%COMP%]::before {\n  content: "";\n  position: absolute;\n  inset: -50% -50% auto auto;\n  width: 250px;\n  height: 250px;\n  background:\n    radial-gradient(\n      circle,\n      rgba(139, 92, 246, 0.18) 0%,\n      transparent 70%);\n  pointer-events: none;\n}\n.brand[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 0.6rem;\n  padding: 0.4rem 0.5rem 1rem;\n  border-bottom: 1px solid var(--border);\n  margin-bottom: 0.6rem;\n}\n.logo[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  width: 36px;\n  height: 36px;\n  border-radius: 10px;\n  flex-shrink: 0;\n  filter: drop-shadow(0 4px 14px rgba(139, 92, 246, 0.4));\n}\n.brand-text[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  line-height: 1.1;\n  min-width: 0;\n}\n.brand-name[_ngcontent-%COMP%] {\n  font-family: var(--font-display);\n  font-weight: 700;\n  font-size: 1.05rem;\n  letter-spacing: -0.01em;\n  background: var(--grad-primary);\n  -webkit-background-clip: text;\n  background-clip: text;\n  color: transparent;\n}\n.brand-tag[_ngcontent-%COMP%] {\n  font-size: 0.66rem;\n  text-transform: uppercase;\n  letter-spacing: 0.14em;\n  color: var(--text-3);\n  margin-top: 2px;\n}\n.nav[_ngcontent-%COMP%] {\n  flex: 1;\n  overflow-y: auto;\n  display: flex;\n  flex-direction: column;\n  padding: 0.4rem 0;\n  gap: 0.15rem;\n}\n.nav-group[_ngcontent-%COMP%] {\n  font-size: 0.66rem;\n  text-transform: uppercase;\n  letter-spacing: 0.16em;\n  color: var(--text-mute);\n  font-weight: 700;\n  margin: 1rem 0.7rem 0.4rem;\n}\n.nav-item[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 0.7rem;\n  padding: 0.55rem 0.7rem;\n  border-radius: 10px;\n  color: var(--text-2);\n  font-size: 0.88rem;\n  font-weight: 500;\n  transition: all 0.18s;\n  position: relative;\n  cursor: pointer;\n}\n.nav-item[_ngcontent-%COMP%]:hover {\n  background: rgba(139, 92, 246, 0.08);\n  color: var(--text-1);\n}\n.nav-item.active[_ngcontent-%COMP%] {\n  background:\n    linear-gradient(\n      135deg,\n      rgba(139, 92, 246, 0.18),\n      rgba(34, 211, 238, 0.1));\n  color: var(--text-1);\n}\n.nav-item.active[_ngcontent-%COMP%]::before {\n  content: "";\n  position: absolute;\n  left: -0.85rem;\n  top: 50%;\n  transform: translateY(-50%);\n  width: 3px;\n  height: 18px;\n  border-radius: 0 4px 4px 0;\n  background: var(--grad-primary);\n}\n.nav-icon[_ngcontent-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  flex-shrink: 0;\n}\n.nav-icon[_ngcontent-%COMP%]   svg[_ngcontent-%COMP%] {\n  color: currentColor;\n}\n.nav-label[_ngcontent-%COMP%] {\n  flex: 1;\n  min-width: 0;\n}\n.nav-badge[_ngcontent-%COMP%] {\n  font-size: 0.65rem;\n  font-weight: 700;\n  padding: 0.1rem 0.45rem;\n  border-radius: 999px;\n  background: rgba(139, 92, 246, 0.18);\n  color: var(--neon-violet);\n}\n.sidebar-footer[_ngcontent-%COMP%] {\n  margin-top: auto;\n  display: flex;\n  flex-direction: column;\n  gap: 0.7rem;\n  padding-top: 0.6rem;\n  border-top: 1px solid var(--border);\n}\n.collapse-btn[_ngcontent-%COMP%] {\n  align-self: flex-end;\n  margin-bottom: 0.2rem;\n}\n.usage[_ngcontent-%COMP%] {\n  padding: 0.85rem;\n}\n.usage-pulse[_ngcontent-%COMP%] {\n  width: 10px;\n  height: 10px;\n  border-radius: 50%;\n  background: var(--neon-green);\n  box-shadow: 0 0 10px var(--neon-green);\n}\n.usage-num[_ngcontent-%COMP%] {\n  font-family: var(--font-display);\n  font-size: 1.05rem;\n  font-weight: 700;\n}\n.usage-bar[_ngcontent-%COMP%] {\n  height: 5px;\n  background: rgba(255, 255, 255, 0.06);\n  border-radius: 99px;\n  margin-top: 0.6rem;\n  overflow: hidden;\n}\n.usage-fill[_ngcontent-%COMP%] {\n  height: 100%;\n  background: var(--grad-primary);\n  border-radius: 99px;\n}\n.main[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  min-width: 0;\n  min-height: 0;\n}\n.topbar[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 1rem;\n  padding: 0.85rem 1.5rem;\n  border-bottom: 1px solid var(--border);\n  background: rgba(5, 6, 19, 0.55);\n  backdrop-filter: blur(14px);\n  -webkit-backdrop-filter: blur(14px);\n  z-index: 3;\n}\n.search[_ngcontent-%COMP%] {\n  flex: 1;\n  display: flex;\n  align-items: center;\n  gap: 0.6rem;\n  background: rgba(255, 255, 255, 0.04);\n  border: 1px solid var(--border);\n  border-radius: 12px;\n  padding: 0.45rem 0.8rem;\n  max-width: 520px;\n  color: var(--text-3);\n}\n.search[_ngcontent-%COMP%]   input[_ngcontent-%COMP%] {\n  flex: 1;\n  border: none;\n  outline: none;\n  background: transparent;\n  color: var(--text-1);\n  padding: 0;\n  font-size: 0.88rem;\n}\n.search[_ngcontent-%COMP%]   input[_ngcontent-%COMP%]:focus {\n  box-shadow: none;\n}\n.kbd[_ngcontent-%COMP%] {\n  font-family: var(--font-mono);\n  font-size: 0.7rem;\n  padding: 0.18rem 0.4rem;\n  border-radius: 5px;\n  background: rgba(255, 255, 255, 0.06);\n  border: 1px solid var(--border);\n  color: var(--text-3);\n}\n.avatar[_ngcontent-%COMP%] {\n  width: 34px;\n  height: 34px;\n  border-radius: 50%;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  font-weight: 700;\n  font-size: 0.8rem;\n  background: var(--grad-primary);\n  color: white;\n  cursor: pointer;\n  -webkit-user-select: none;\n  user-select: none;\n}\n.content[_ngcontent-%COMP%] {\n  flex: 1;\n  overflow-y: auto;\n  padding: 1.7rem 2rem 2.5rem;\n  position: relative;\n}\n@media (max-width: 700px) {\n  .shell[_ngcontent-%COMP%] {\n    grid-template-columns: 72px 1fr;\n  }\n  .content[_ngcontent-%COMP%] {\n    padding: 1.2rem;\n  }\n  .search[_ngcontent-%COMP%] {\n    display: none;\n  }\n}\n/*# sourceMappingURL=shell.component.css.map */'], changeDetection: 0 });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(ShellComponent, [{
    type: Component,
    args: [{ selector: "app-shell", imports: [RouterLink, RouterLinkActive, RouterOutlet], changeDetection: ChangeDetectionStrategy.OnPush, template: `
    <div class="shell">
      <aside class="sidebar" [class.collapsed]="collapsed()">
        <div class="brand">
          <div class="logo">
            <svg viewBox="0 0 32 32" width="22" height="22" aria-hidden="true">
              <defs>
                <linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stop-color="#8b5cf6"/>
                  <stop offset="50%" stop-color="#ec4899"/>
                  <stop offset="100%" stop-color="#22d3ee"/>
                </linearGradient>
              </defs>
              <rect width="32" height="32" rx="8" fill="url(#lg)" />
              <path d="M11 10 L23 16 L11 22 Z" fill="white"/>
            </svg>
          </div>
          @if (!collapsed()) {
            <div class="brand-text">
              <div class="brand-name">CineFlow</div>
              <div class="brand-tag">AI Video Orchestration</div>
            </div>
          }
        </div>

        <nav class="nav">
          @for (group of navGroups; track group.title) {
            @if (!collapsed()) { <div class="nav-group">{{ group.title }}</div> }
            @for (item of group.items; track item.path) {
              <a
                class="nav-item"
                [routerLink]="item.path"
                routerLinkActive="active"
                [routerLinkActiveOptions]="{ exact: item.path === '/dashboard' }"
                [title]="collapsed() ? item.label : null"
              >
                <span class="nav-icon" [innerHTML]="item.icon"></span>
                @if (!collapsed()) { <span class="nav-label">{{ item.label }}</span> }
                @if (!collapsed() && item.badge) { <span class="nav-badge">{{ item.badge }}</span> }
              </a>
            }
          }
        </nav>

        <div class="sidebar-footer">
          <button class="iconbtn collapse-btn" (click)="toggleCollapsed()" [title]="collapsed() ? 'Expand' : 'Collapse'">
            <svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
              <path [attr.d]="collapsed() ? 'M7 5l5 5-5 5' : 'M13 5l-5 5 5 5'" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          @if (!collapsed()) {
            <div class="usage card gradient">
              <div class="row">
                <div class="usage-pulse"></div>
                <div>
                  <div class="eyebrow">Credits</div>
                  <div class="usage-num">2,450</div>
                </div>
              </div>
              <div class="usage-bar"><div class="usage-fill" style="width: 62%"></div></div>
              <button class="btn primary sm" style="width:100%; margin-top:0.6rem">Upgrade plan</button>
            </div>
          }
        </div>
      </aside>

      <div class="main">
        <header class="topbar">
          <div class="search">
            <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="9" cy="9" r="6.5"/>
              <path d="m14 14 4 4" stroke-linecap="round"/>
            </svg>
            <input placeholder="Search projects, scenes, assets, models\u2026"/>
            <span class="kbd">\u2318K</span>
          </div>
          <div class="row">
            <button class="iconbtn" title="Notifications">
              <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 8a5 5 0 0 1 10 0v4l1.5 2.5h-13L5 12V8Z" stroke-linejoin="round"/>
                <path d="M8 16a2 2 0 0 0 4 0"/>
              </svg>
            </button>
            <button class="iconbtn" title="Settings">
              <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="10" cy="10" r="2.5"/>
                <path d="M10 1.5v3M10 15.5v3M1.5 10h3M15.5 10h3M3.8 3.8l2.1 2.1M14.1 14.1l2.1 2.1M3.8 16.2l2.1-2.1M14.1 5.9l2.1-2.1" stroke-linecap="round"/>
              </svg>
            </button>
            <div class="avatar" title="Razmik">RC</div>
          </div>
        </header>

        <main class="content">
          <router-outlet />
        </main>
      </div>
    </div>
  `, styles: ['/* src/app/shared/layout/shell.component.scss */\n:host {\n  display: block;\n  height: 100vh;\n  overflow: hidden;\n}\n.shell {\n  display: grid;\n  grid-template-columns: 250px 1fr;\n  height: 100vh;\n  transition: grid-template-columns 0.22s ease;\n}\n.shell:has(.sidebar.collapsed) {\n  grid-template-columns: 72px 1fr;\n}\n.sidebar {\n  display: flex;\n  flex-direction: column;\n  padding: 1.1rem 0.85rem 1rem;\n  background:\n    linear-gradient(\n      180deg,\n      rgba(10, 12, 31, 0.85) 0%,\n      rgba(5, 6, 19, 0.95) 100%);\n  border-right: 1px solid var(--border);\n  position: relative;\n  z-index: 4;\n  overflow: hidden;\n}\n.sidebar::before {\n  content: "";\n  position: absolute;\n  inset: -50% -50% auto auto;\n  width: 250px;\n  height: 250px;\n  background:\n    radial-gradient(\n      circle,\n      rgba(139, 92, 246, 0.18) 0%,\n      transparent 70%);\n  pointer-events: none;\n}\n.brand {\n  display: flex;\n  align-items: center;\n  gap: 0.6rem;\n  padding: 0.4rem 0.5rem 1rem;\n  border-bottom: 1px solid var(--border);\n  margin-bottom: 0.6rem;\n}\n.logo {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  width: 36px;\n  height: 36px;\n  border-radius: 10px;\n  flex-shrink: 0;\n  filter: drop-shadow(0 4px 14px rgba(139, 92, 246, 0.4));\n}\n.brand-text {\n  display: flex;\n  flex-direction: column;\n  line-height: 1.1;\n  min-width: 0;\n}\n.brand-name {\n  font-family: var(--font-display);\n  font-weight: 700;\n  font-size: 1.05rem;\n  letter-spacing: -0.01em;\n  background: var(--grad-primary);\n  -webkit-background-clip: text;\n  background-clip: text;\n  color: transparent;\n}\n.brand-tag {\n  font-size: 0.66rem;\n  text-transform: uppercase;\n  letter-spacing: 0.14em;\n  color: var(--text-3);\n  margin-top: 2px;\n}\n.nav {\n  flex: 1;\n  overflow-y: auto;\n  display: flex;\n  flex-direction: column;\n  padding: 0.4rem 0;\n  gap: 0.15rem;\n}\n.nav-group {\n  font-size: 0.66rem;\n  text-transform: uppercase;\n  letter-spacing: 0.16em;\n  color: var(--text-mute);\n  font-weight: 700;\n  margin: 1rem 0.7rem 0.4rem;\n}\n.nav-item {\n  display: flex;\n  align-items: center;\n  gap: 0.7rem;\n  padding: 0.55rem 0.7rem;\n  border-radius: 10px;\n  color: var(--text-2);\n  font-size: 0.88rem;\n  font-weight: 500;\n  transition: all 0.18s;\n  position: relative;\n  cursor: pointer;\n}\n.nav-item:hover {\n  background: rgba(139, 92, 246, 0.08);\n  color: var(--text-1);\n}\n.nav-item.active {\n  background:\n    linear-gradient(\n      135deg,\n      rgba(139, 92, 246, 0.18),\n      rgba(34, 211, 238, 0.1));\n  color: var(--text-1);\n}\n.nav-item.active::before {\n  content: "";\n  position: absolute;\n  left: -0.85rem;\n  top: 50%;\n  transform: translateY(-50%);\n  width: 3px;\n  height: 18px;\n  border-radius: 0 4px 4px 0;\n  background: var(--grad-primary);\n}\n.nav-icon {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  flex-shrink: 0;\n}\n.nav-icon svg {\n  color: currentColor;\n}\n.nav-label {\n  flex: 1;\n  min-width: 0;\n}\n.nav-badge {\n  font-size: 0.65rem;\n  font-weight: 700;\n  padding: 0.1rem 0.45rem;\n  border-radius: 999px;\n  background: rgba(139, 92, 246, 0.18);\n  color: var(--neon-violet);\n}\n.sidebar-footer {\n  margin-top: auto;\n  display: flex;\n  flex-direction: column;\n  gap: 0.7rem;\n  padding-top: 0.6rem;\n  border-top: 1px solid var(--border);\n}\n.collapse-btn {\n  align-self: flex-end;\n  margin-bottom: 0.2rem;\n}\n.usage {\n  padding: 0.85rem;\n}\n.usage-pulse {\n  width: 10px;\n  height: 10px;\n  border-radius: 50%;\n  background: var(--neon-green);\n  box-shadow: 0 0 10px var(--neon-green);\n}\n.usage-num {\n  font-family: var(--font-display);\n  font-size: 1.05rem;\n  font-weight: 700;\n}\n.usage-bar {\n  height: 5px;\n  background: rgba(255, 255, 255, 0.06);\n  border-radius: 99px;\n  margin-top: 0.6rem;\n  overflow: hidden;\n}\n.usage-fill {\n  height: 100%;\n  background: var(--grad-primary);\n  border-radius: 99px;\n}\n.main {\n  display: flex;\n  flex-direction: column;\n  min-width: 0;\n  min-height: 0;\n}\n.topbar {\n  display: flex;\n  align-items: center;\n  gap: 1rem;\n  padding: 0.85rem 1.5rem;\n  border-bottom: 1px solid var(--border);\n  background: rgba(5, 6, 19, 0.55);\n  backdrop-filter: blur(14px);\n  -webkit-backdrop-filter: blur(14px);\n  z-index: 3;\n}\n.search {\n  flex: 1;\n  display: flex;\n  align-items: center;\n  gap: 0.6rem;\n  background: rgba(255, 255, 255, 0.04);\n  border: 1px solid var(--border);\n  border-radius: 12px;\n  padding: 0.45rem 0.8rem;\n  max-width: 520px;\n  color: var(--text-3);\n}\n.search input {\n  flex: 1;\n  border: none;\n  outline: none;\n  background: transparent;\n  color: var(--text-1);\n  padding: 0;\n  font-size: 0.88rem;\n}\n.search input:focus {\n  box-shadow: none;\n}\n.kbd {\n  font-family: var(--font-mono);\n  font-size: 0.7rem;\n  padding: 0.18rem 0.4rem;\n  border-radius: 5px;\n  background: rgba(255, 255, 255, 0.06);\n  border: 1px solid var(--border);\n  color: var(--text-3);\n}\n.avatar {\n  width: 34px;\n  height: 34px;\n  border-radius: 50%;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  font-weight: 700;\n  font-size: 0.8rem;\n  background: var(--grad-primary);\n  color: white;\n  cursor: pointer;\n  -webkit-user-select: none;\n  user-select: none;\n}\n.content {\n  flex: 1;\n  overflow-y: auto;\n  padding: 1.7rem 2rem 2.5rem;\n  position: relative;\n}\n@media (max-width: 700px) {\n  .shell {\n    grid-template-columns: 72px 1fr;\n  }\n  .content {\n    padding: 1.2rem;\n  }\n  .search {\n    display: none;\n  }\n}\n/*# sourceMappingURL=shell.component.css.map */\n'] }]
  }], () => [{ type: ProjectsService }], null);
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(ShellComponent, { className: "ShellComponent", filePath: "src/app/shared/layout/shell.component.ts", lineNumber: 117 });
})();
export {
  ShellComponent
};
//# sourceMappingURL=chunk-HX7KDH7T.js.map
