/* eslint-disable */
// محاكاة بيئة المترسك قبل تحميل وحدات التطبيق — يُحذف بعد التشخيص
globalThis.window = globalThis.window || {};
window.localStorage = {
  store: {},
  getItem(k) { return this.store[k] ?? null; },
  setItem(k, v) { this.store[k] = String(v); },
  removeItem(k) { delete this.store[k]; },
};
window.location = { href: "http://localhost/", pathname: "/", search: "", hash: "" };
window.addEventListener = () => {};
window.removeEventListener = () => {};
window.dispatchEvent = () => {};
window.matchMedia = window.matchMedia || (() => ({ matches: false, addListener: () => {}, removeListener: () => {}, addEventListener: () => {}, removeEventListener: () => {} }));
window.performance = window.performance || { getEntriesByType: () => [] };
globalThis.document = globalThis.document || {
  documentElement: { dir: "rtl", lang: "ar" },
  getElementById: () => null,
};
globalThis.navigator = globalThis.navigator || { userAgent: "smoke" };