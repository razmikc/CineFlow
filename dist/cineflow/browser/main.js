import {
  RouterOutlet,
  bootstrapApplication,
  provideRouter,
  withComponentInputBinding,
  withInMemoryScrolling
} from "./chunk-A2MSORV3.js";
import {
  ChangeDetectionStrategy,
  Component,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
  setClassMetadata,
  ɵsetClassDebugInfo,
  ɵɵdefineComponent,
  ɵɵelement
} from "./chunk-YYMU35ZW.js";

// src/app/app.routes.ts
var routes = [
  {
    path: "",
    loadComponent: () => import("./chunk-HX7KDH7T.js").then((m) => m.ShellComponent),
    children: [
      { path: "", pathMatch: "full", redirectTo: "dashboard" },
      {
        path: "dashboard",
        loadComponent: () => import("./chunk-F3GYXSRM.js").then((m) => m.DashboardComponent)
      },
      {
        path: "projects/new",
        loadComponent: () => import("./chunk-4MLPUW56.js").then((m) => m.WizardComponent)
      },
      {
        path: "projects/:id",
        loadComponent: () => import("./chunk-4MLPUW56.js").then((m) => m.WizardComponent)
      },
      {
        path: "projects/:id/scenes/:sceneId",
        loadComponent: () => import("./chunk-MGKI6C5Z.js").then((m) => m.SceneWorkspaceComponent)
      },
      {
        path: "assets",
        loadComponent: () => import("./chunk-J5OIVVC7.js").then((m) => m.AssetLibraryComponent)
      },
      {
        path: "models",
        loadComponent: () => import("./chunk-3IILTIKB.js").then((m) => m.ModelsComponent)
      },
      {
        path: "jobs",
        loadComponent: () => import("./chunk-X7EFXFHS.js").then((m) => m.JobsComponent)
      }
    ]
  },
  { path: "**", redirectTo: "" }
];

// src/app/app.config.ts
var appConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes, withComponentInputBinding(), withInMemoryScrolling({ scrollPositionRestoration: "enabled", anchorScrolling: "enabled" }))
  ]
};

// src/app/app.ts
var App = class _App {
  static \u0275fac = function App_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _App)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _App, selectors: [["app-root"]], decls: 1, vars: 0, template: function App_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275element(0, "router-outlet");
    }
  }, dependencies: [RouterOutlet], styles: ["\n[_nghost-%COMP%] {\n  display: block;\n  height: 100vh;\n  overflow: hidden;\n}\n/*# sourceMappingURL=app.css.map */"], changeDetection: 0 });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(App, [{
    type: Component,
    args: [{ selector: "app-root", imports: [RouterOutlet], template: `<router-outlet />`, changeDetection: ChangeDetectionStrategy.OnPush, styles: ["/* angular:styles/component:scss;dd559a34138bbea4d3e279a7dfc90ffa953257dd693dd00951c924bb9e426f7f;C:/Users/razmikc/IdeaProjects/CineFlow/src/app/app.ts */\n:host {\n  display: block;\n  height: 100vh;\n  overflow: hidden;\n}\n/*# sourceMappingURL=app.css.map */\n"] }]
  }], null, null);
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(App, { className: "App", filePath: "src/app/app.ts", lineNumber: 11 });
})();

// src/main.ts
bootstrapApplication(App, appConfig).catch((err) => console.error(err));
//# sourceMappingURL=main.js.map
