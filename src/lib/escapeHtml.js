/**
 * escapeHtml.js — تهريب النصوص القادمة من المستخدم قبل بنائها داخل HTML.
 * يُستخدم في الواجهة عند تكوين قوالب بريد HTML حتى لا تُحقن وسوم/روابط ضارة.
 */
export function escapeHtml(value) {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}