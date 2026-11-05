/**
 * codeSequence.js — توليد رموز متسلسلة للطلاب والأساتذة.
 * يعيد البادئة + الرقم التالي بعد أكبر رقم موجود بنفس البادئة (STU001, STU002, TCH001 …).
 */
export function nextSequentialCode(existingCodes, prefix, pad = 3) {
  const re = new RegExp(`^${prefix}(\\d+)$`, "i");
  let max = 0;
  for (const raw of existingCodes || []) {
    const m = String(raw ?? "").trim().match(re);
    if (!m) continue;
    const n = parseInt(m[1], 10);
    if (Number.isFinite(n) && n > max) max = n;
  }
  return `${prefix}${String(max + 1).padStart(pad, "0")}`;
}

export const STUDENT_PREFIX = "STU";
export const TEACHER_PREFIX = "TCH";