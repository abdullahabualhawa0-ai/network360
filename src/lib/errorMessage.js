import { t } from "@/lib/i18n";

/** رسائل مترجمة، دون استبدال خطأ الخدمة بخطأ في بيانات الدخول. */
export function friendlyError(err) {
  const status = Number(err?.status ?? err?.response?.status ?? err?.statusCode) || undefined;
  const details = err?.data ?? err?.response?.data;
  const message = [details?.error, details?.message, details?.detail, err?.message]
    .find((value) => typeof value === "string")?.trim() || "";

  if (status === 402) return t("errServiceLimit");
  if (err?.code === "INVALID_LOGIN_RESPONSE") return t("errInvalidLoginResponse");
  if (status === 429) return t("errTooMany");
  if (/backend\s*functions?.*(?:plan|upgrade|not enabled|not available|disabled)|(?:plan|upgrade).*backend\s*functions?|function.*(?:not found|not deployed)/i.test(message)) return t("errServiceLimit");
  if (status >= 500) return t("errServer");
  if (!status && (err?.code === "ERR_NETWORK" || /network|failed to fetch|timeout/i.test(message))) return t("errNetwork");

  const keys = ["errSchoolCode", "errStudentCode", "errTeacherCode", "errAdminCode", "errInvalidCode", "errMismatch", "errDisabled", "errNotApproved", "errTaken"];
  for (const key of keys) {
    if (["ar", "en", "he"].some((lang) => t(key, lang) === message)) return t(key);
  }
  const loginMessages = {
    "رمز المدرسة أو رمز الطالب غير صحيح.": "errMismatch",
    "رمز المدرسة أو رمز الأستاذ غير صحيح.": "errTeacherCode",
    "رمز المشرف غير صحيح.": "errAdminCode",
    "أدخل رمز الطالب": "errStudentCode",
    "أدخل رمز المدرسة ورمز الأستاذ": "errTeacherCode",
    "أدخل رمز المشرف": "errAdminCode",
    "حسابك بانتظار موافقة الإدارة. حاول لاحقاً.": "pendingTitle",
    "تم رفض حسابك من الإدارة.": "rejectedTitle",
    "حسابك معطّل. تواصل مع إدارة المدرسة.": "errDisabled",
    "انتهى اشتراكك — تواصل مع إدارة المنصة.": "errSubscriptionExpired",
    "اشتراك المدرسة منتهي — تواصل مع إدارة المدرسة.": "errSubscriptionExpired",
    "اشتراك المدرسة منتهي — تواصل مع مالك المنصة.": "errSubscriptionExpired",
  };
  if (loginMessages[message]) return t(loginMessages[message]);
  if (status === 401) return t("errSessionExpired");
  if (status === 403) return t("errAccessDenied");
  return t("errUnexpected");
}