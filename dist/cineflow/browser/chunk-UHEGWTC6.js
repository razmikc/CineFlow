import {
  MOCK_AI_MODELS
} from "./chunk-5UP4TGNH.js";
import {
  Injectable,
  delay,
  of,
  setClassMetadata,
  signal,
  ɵɵdefineInjectable
} from "./chunk-YYMU35ZW.js";

// src/app/core/services/models.service.ts
var ModelsService = class _ModelsService {
  _models = signal(structuredClone(MOCK_AI_MODELS), ...ngDevMode ? [{ debugName: "_models" }] : (
    /* istanbul ignore next */
    []
  ));
  models = this._models.asReadonly();
  list() {
    return of(this._models()).pipe(delay(120));
  }
  byCapability(capability) {
    return this._models().filter((m) => m.capability === capability);
  }
  static \u0275fac = function ModelsService_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _ModelsService)();
  };
  static \u0275prov = /* @__PURE__ */ \u0275\u0275defineInjectable({ token: _ModelsService, factory: _ModelsService.\u0275fac, providedIn: "root" });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(ModelsService, [{
    type: Injectable,
    args: [{ providedIn: "root" }]
  }], null, null);
})();

export {
  ModelsService
};
//# sourceMappingURL=chunk-UHEGWTC6.js.map
