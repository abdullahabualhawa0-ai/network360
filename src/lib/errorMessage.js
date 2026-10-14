import { t } from "@/lib/i18n";

/**
 * friendlyError — رسالة خطأ مفهومة للمستخدم بدل "Request failed with status code 402".
 *
 *  • رسائل دوالنا (الدخول وغيرها) تأتي عربية جاهزة في data.error فنعرضها كما هي.
 *  • 402 يأتي من منصة Base44 نفسها (حد الاستخدام/الخطة) وليس من كود التطبيق.
 *  • نُلحق رمز الحالة بين قوسين ليسهل على الدعم تشخيص المشكلة من لقطة شاشة.
 */
export function friendlyError(err) {
  const status = err?.status ?? err?.response?.status;
  const serverMsg = err?.data?.error || err?.response?.data?.error;

  if (status === 402) return `${t("errServiceLimit")} (402)`;
  if (serverMsg) return serverMsg;
  if (status === 429) return `${t("errTooMany")} (429)`;
  if (status >= 500) return `${t("errServer")} (${status})`;
  if (!status && (err?.code === "ERR_NETWORK" || /network|failed to fetch|timeout/i.test(err?.message || ""))) {
    return t("errNetwork");
  }
  return status ? `${t("errUnexpected")} (${status})` : t("errUnexpected");
}
