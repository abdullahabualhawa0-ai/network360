import { base44 } from "@/api/base44Client";

/** الدخول بالرموز يعتمد حصراً على التحقق في الخادم، دون إعادة محاولة أخطاء الخطة. */
export async function invokeCodeLogin(name, payload, subjectField) {
  const { data } = await base44.functions.invoke(name, payload);
  const expiresAt = Date.parse(data?.expires_at);
  if (
    typeof data?.token !== "string" || !data.token ||
    !data[subjectField] || !data.school_id ||
    !Number.isFinite(expiresAt) || expiresAt <= Date.now()
  ) {
    const error = new Error("Invalid login response");
    error.code = "INVALID_LOGIN_RESPONSE";
    throw error;
  }
  return data;
}