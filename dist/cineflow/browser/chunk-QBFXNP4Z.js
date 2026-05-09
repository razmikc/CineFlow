import {
  MOCK_ASSETS
} from "./chunk-5UP4TGNH.js";
import {
  Injectable,
  delay,
  of,
  setClassMetadata,
  signal,
  ɵɵdefineInjectable
} from "./chunk-YYMU35ZW.js";

// src/app/core/services/assets.service.ts
var AssetsService = class _AssetsService {
  _assets = signal(structuredClone(MOCK_ASSETS), ...ngDevMode ? [{ debugName: "_assets" }] : (
    /* istanbul ignore next */
    []
  ));
  assets = this._assets.asReadonly();
  list() {
    return of(this._assets()).pipe(delay(160));
  }
  filter(type, term) {
    const filtered = this._assets().filter((a) => {
      const okType = type ? a.type === type : true;
      const okTerm = term ? `${a.name} ${a.tags.join(" ")} ${a.prompt ?? ""}`.toLowerCase().includes(term.toLowerCase()) : true;
      return okType && okTerm;
    });
    return of(filtered).pipe(delay(140));
  }
  get(id) {
    return this._assets().find((a) => a.id === id);
  }
  generate(input) {
    const fallbackImages = [
      "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800",
      "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800",
      "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800"
    ];
    const newAsset = {
      id: `asset-${this._assets().length + 1}`,
      type: input.type,
      name: input.name,
      source: "generated",
      uri: fallbackImages[Math.floor(Math.random() * fallbackImages.length)],
      thumbnail: fallbackImages[Math.floor(Math.random() * fallbackImages.length)],
      provider: input.provider,
      model: input.model,
      prompt: input.prompt,
      tags: ["generated"],
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this._assets.update((list) => [newAsset, ...list]);
    return of(newAsset).pipe(delay(900));
  }
  upload(input) {
    const newAsset = {
      id: `asset-${this._assets().length + 1}`,
      type: input.type,
      name: input.name,
      source: "uploaded",
      uri: input.uri,
      thumbnail: input.uri,
      tags: ["uploaded"],
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this._assets.update((list) => [newAsset, ...list]);
    return of(newAsset).pipe(delay(220));
  }
  remove(id) {
    this._assets.update((list) => list.filter((a) => a.id !== id));
    return of(void 0).pipe(delay(120));
  }
  static \u0275fac = function AssetsService_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _AssetsService)();
  };
  static \u0275prov = /* @__PURE__ */ \u0275\u0275defineInjectable({ token: _AssetsService, factory: _AssetsService.\u0275fac, providedIn: "root" });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(AssetsService, [{
    type: Injectable,
    args: [{ providedIn: "root" }]
  }], null, null);
})();

export {
  AssetsService
};
//# sourceMappingURL=chunk-QBFXNP4Z.js.map
