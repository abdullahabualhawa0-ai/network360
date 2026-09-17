import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ClipboardList, Loader2, RefreshCw, Mail, Phone, User, School as SchoolIcon,
  Check, X, AlertCircle, CheckCircle2, XCircle,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { t, useLang, useDir } from "@/lib/i18n";

const STATUS_UI = {
  new: { label: "reqStatusNew", color: "#2F6690", bg: "rgba(47,102,144,0.1)", border: "rgba(47,102,144,0.35)" },
  contacted: { label: "reqStatusContacted", color: "#D69E2E", bg: "rgba(214,158,46,0.1)", border: "rgba(214,158,46,0.35)" },
  in_progress: { label: "reqStatusInProgress", color: "#D69E2E", bg: "rgba(214,158,46,0.1)", border: "rgba(214,158,46,0.35)" },
  accepted: { label: "reqStatusAccepted", color: "#2E7D5B", bg: "rgba(46,125,91,0.1)", border: "rgba(46,125,91,0.35)" },
  rejected: { label: "reqStatusRejected", color: "#C94C4C", bg: "rgba(201,76,76,0.1)", border: "rgba(201,76,76,0.35)" },
};

const STATUSES = ["new", "contacted", "in_progress", "accepted", "rejected"];

/**
 * طلبات التسجيل — Owner (admin) فقط
 * عرض وإدارة طلبات التسجيل الفردية والمدرسية + تفعيل المدرسة.
 */
export default function RegistrationRequests() {
  const { user, isLoadingAuth } = useAuth();
  useLang();
  const direction = useDir();
  const [requests, setRequests] = useState(null);
  const [activating, setActivating] = useState(null);
  const [activateMsg, setActivateMsg] = useState(null);

  const isOwner = user?.role === "admin";

  const load = () =>
    base44.entities.RegistrationRequest.list("-created_date", 200).then((r) => setRequests(r || []));

  useEffect(() => {
    if (!isLoadingAuth && isOwner) load();
  }, [isLoadingAuth, isOwner]);

  const notifyUser = async (req, accepted, schoolCode) => {
    const isSchool = req.request_type === "school";
    const subject = accepted
      ? (isSchool ? "✅ تم قبول طلب تسجيل مدرستك" : "✅ تم قبول طلب تسجيلك")
      : (isSchool ? "❌ تم رفض طلب تسجيل مدرستك" : "❌ تم رفض طلب تسجيلك");
    const html = accepted
      ? `<div dir="rtl" style="font-family: Tajawal, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; background: #F7F9FC; border-radius: 16px;">
          <div style="background: #2E7D5B; color: #fff; padding: 16px 20px; border-radius: 12px; margin-bottom: 20px;">
            <h2 style="margin: 0; font-size: 18px;">تم قبول طلبك ✓</h2>
          </div>
          <div style="background: #fff; padding: 20px; border-radius: 12px; border: 1px solid #E2E8F0;">
            <p style="margin: 0 0 12px; font-size: 14px;">مرحباً ${req.full_name || ""}،</p>
            <p style="margin: 0 0 12px; font-size: 14px;">تم قبول طلب تسجيلك${isSchool ? ` للمدرسة «${req.school_name || ""}»` : ""}.</p>
            ${isSchool && schoolCode ? `<p style="margin: 0 0 12px; font-size: 14px;">رمز المدرسة: <b dir="ltr">${schoolCode}</b></p>` : ""}
            <p style="margin: 0; font-size: 12px; color: #64748B;">سيتم التواصل معك قريباً بالخطوات التالية.</p>
          </div>
        </div>`
      : `<div dir="rtl" style="font-family: Tajawal, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; background: #F7F9FC; border-radius: 16px;">
          <div style="background: #C94C4C; color: #fff; padding: 16px 20px; border-radius: 12px; margin-bottom: 20px;">
            <h2 style="margin: 0; font-size: 18px;">تم رفض طلبك</h2>
          </div>
          <div style="background: #fff; padding: 20px; border-radius: 12px; border: 1px solid #E2E8F0;">
            <p style="margin: 0 0 12px; font-size: 14px;">مرحباً ${req.full_name || ""}،</p>
            <p style="margin: 0 0 12px; font-size: 14px;">نأسف لإبلاغك بأنه تم رفض طلب تسجيلك${isSchool ? ` للمدرسة «${req.school_name || ""}»` : ""}.</p>
            <p style="margin: 0; font-size: 12px; color: #64748B;">لأي استفسار يمكنك التواصل معنا.</p>
          </div>
        </div>`;
    try {
      await base44.integrations.Core.SendEmail({ to: req.email, subject, html });
      return true;
    } catch (e) {
      console.log("SendEmail failed:", e?.message);
      return false;
    }
  };

  const changeStatus = async (req, status) => {
    await base44.entities.RegistrationRequest.update(req.id, { status });
    load();
  };

  const activateSchool = async (req) => {
    setActivating(req.id);
    setActivateMsg(null);
    try {
      // توليد رمز مدرسة فريد
      const code = `SCH-${Date.now().toString().slice(-6)}`;
      const dup = await base44.entities.School.filter({ code });
      if (dup && dup.length > 0) throw new Error("Code collision");
      const school = await base44.entities.School.create({
        name: req.school_name,
        code,
        is_active: true,
        created_by_id: user.id,
        subscription_plan: "school_50",
        student_limit: req.expected_students || 50,
        teacher_limit: req.expected_teachers || 0,
        current_student_count: 0,
        subscription_status: "active",
        admin_name: req.full_name,
        admin_email: req.email,
        contact_phone: req.phone,
        country: req.country,
        expected_students: req.expected_students,
      });
      await base44.entities.RegistrationRequest.update(req.id, { status: "accepted", notes: `School activated: ${school.code}` });
      await notifyUser(req, true, school.code);
      setActivateMsg({ id: req.id, ok: true, text: `${t("reqActivated")} (${school.code})` });
      load();
    } catch (err) {
      setActivateMsg({ id: req.id, ok: false, text: err?.message || "Error" });
    } finally {
      setActivating(null);
    }
  };

  const acceptRequest = async (req) => {
    setActivating(req.id);
    setActivateMsg(null);
    try {
      let schoolCode = null;
      if (req.request_type === "school" && req.status !== "accepted") {
        schoolCode = `SCH-${Date.now().toString().slice(-6)}`;
        const dup = await base44.entities.School.filter({ code: schoolCode });
        if (dup && dup.length > 0) throw new Error("Code collision");
        await base44.entities.School.create({
          name: req.school_name, code: schoolCode, is_active: true, created_by_id: user.id,
          subscription_plan: "school_50", student_limit: req.expected_students || 50,
          teacher_limit: req.expected_teachers || 0, current_student_count: 0,
          subscription_status: "active", admin_name: req.full_name, admin_email: req.email,
          contact_phone: req.phone, country: req.country, expected_students: req.expected_students,
        });
      }
      await base44.entities.RegistrationRequest.update(req.id, {
        status: "accepted",
        notes: schoolCode ? `School activated: ${schoolCode}` : "Accepted",
      });
      const emailed = await notifyUser(req, true, schoolCode);
      // حذف الطلب نهائياً بعد القبول — المدرسة أصبحت في صفحة المدارس
      await base44.entities.RegistrationRequest.delete(req.id);
      setActivateMsg({ id: req.id, ok: true, text: emailed ? t("reqAcceptedMsg") : t("reqNotifyErr") });
      load();
    } catch (err) {
      setActivateMsg({ id: req.id, ok: false, text: err?.message || "Error" });
    } finally {
      setActivating(null);
    }
  };

  const rejectRequest = async (req) => {
    setActivating(req.id);
    setActivateMsg(null);
    try {
      const emailed = await notifyUser(req, false);
      // حذف الطلب نهائياً بعد الرفض
      await base44.entities.RegistrationRequest.delete(req.id);
      setActivateMsg({ id: req.id, ok: emailed, text: emailed ? t("reqRejectedMsg") : t("reqNotifyErr") });
      load();
    } catch (err) {
      setActivateMsg({ id: req.id, ok: false, text: err?.message || "Error" });
    } finally {
      setActivating(null);
    }
  };

  if (isLoadingAuth) {
    return (
      <div className="py-24 flex justify-center">
        <Loader2 size={28} className="animate-spin" style={{ color: "hsl(var(--primary))" }} />
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="py-20 text-center">
        <AlertCircle size={36} className="mx-auto mb-3" style={{ color: "#C94C4C" }} />
        <p className="text-xs text-muted-foreground">Owner only</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground" dir={direction}>
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 flex-wrap mb-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "#173F5F" }}>
              <ClipboardList className="text-white" size={20} />
            </div>
            <div>
              <h1 className="font-black text-xl">{t("regRequestsTitle")}</h1>
              <p className="text-xs text-muted-foreground">{t("regRequestsDesc")}</p>
            </div>
          </div>
          <button onClick={load} className="p-2 rounded-xl" style={{ border: "1px solid hsl(var(--border))", color: "hsl(var(--primary))" }}>
            <RefreshCw size={14} />
          </button>
        </div>

        {/* List */}
        {requests === null ? (
          <div className="py-20 flex justify-center">
            <Loader2 size={26} className="animate-spin" style={{ color: "hsl(var(--primary))" }} />
          </div>
        ) : requests.length === 0 ? (
          <div className="rounded-2xl p-10 text-center bg-card" style={{ border: "1px solid hsl(var(--border))" }}>
            <ClipboardList size={36} className="mx-auto mb-3 opacity-40" style={{ color: "hsl(var(--primary))" }} />
            <p className="text-xs font-bold mb-1">{t("reqNoRequests")}</p>
            <p className="text-[11px] text-muted-foreground">{t("reqNoRequestsDesc")}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((req, i) => {
              const st = STATUS_UI[req.status] || STATUS_UI.new;
              const isSchool = req.request_type === "school";
              return (
                <motion.div key={req.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                  className="rounded-2xl p-4 bg-card" style={{ border: "1px solid hsl(var(--border))" }}>
                  <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                    <div className="flex-1 min-w-0">
                      {/* Type + name */}
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                          style={{ background: isSchool ? "rgba(47,102,144,0.1)" : "rgba(46,125,91,0.1)", border: `1px solid ${isSchool ? "rgba(47,102,144,0.35)" : "rgba(46,125,91,0.35)"}`, color: isSchool ? "#2F6690" : "#2E7D5B" }}>
                          {isSchool ? t("reqTypeSchool") : t("reqTypeIndividual")}
                        </span>
                        <span className="font-black text-sm">{req.full_name}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ background: st.bg, border: `1px solid ${st.border}`, color: st.color }}>
                          {t(st.label)}
                        </span>
                      </div>
                      {/* School name */}
                      {isSchool && req.school_name && (
                        <div className="flex items-center gap-1.5 text-[11px] mb-1" style={{ color: "#2F6690" }}>
                          <SchoolIcon size={11} /> {req.school_name}
                        </div>
                      )}
                      {/* Contact */}
                      <div className="flex items-center gap-3 flex-wrap text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-1"><Mail size={10} /> {req.email}</span>
                        <span className="flex items-center gap-1"><Phone size={10} /> {req.phone}</span>
                        {req.country && <span>{req.country}</span>}
                      </div>
                      {/* Numbers */}
                      <div className="flex items-center gap-2 flex-wrap mt-1.5 text-[10px]">
                        {isSchool ? (
                          <>
                            {req.expected_students > 0 && (
                              <span className="px-2 py-0.5 rounded-full font-bold" style={{ background: "rgba(47,102,144,0.08)", border: "1px solid rgba(47,102,144,0.25)", color: "#2F6690" }}>
                                {req.expected_students} {t("regExpectedStudents")}
                              </span>
                            )}
                            {req.expected_teachers > 0 && (
                              <span className="px-2 py-0.5 rounded-full font-bold" style={{ background: "rgba(46,125,91,0.08)", border: "1px solid rgba(46,125,91,0.25)", color: "#2E7D5B" }}>
                                {req.expected_teachers} {t("regExpectedTeachers")}
                              </span>
                            )}
                          </>
                        ) : (
                          req.expected_users > 0 && (
                            <span className="px-2 py-0.5 rounded-full font-bold" style={{ background: "rgba(47,102,144,0.08)", border: "1px solid rgba(47,102,144,0.25)", color: "#2F6690" }}>
                              {req.expected_users} {t("regExpectedUsers")}
                            </span>
                          )
                        )}
                        <span className="text-muted-foreground">{new Date(req.created_date).toLocaleDateString("ar")}</span>
                      </div>
                    </div>

                    {/* Actions — قبول / رفض فقط */}
                    <div className="flex gap-1.5 flex-shrink-0">
                      <button onClick={() => acceptRequest(req)} disabled={activating === req.id || req.status === "accepted"}
                        className="flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl text-[10px] font-bold text-white disabled:opacity-50"
                        style={{ background: req.status === "accepted" ? "#2E7D5B" : "#173F5F" }}>
                        {activating === req.id ? <Loader2 size={10} className="animate-spin" /> : <CheckCircle2 size={11} />}
                        {t("reqAccept")}
                      </button>
                      <button onClick={() => rejectRequest(req)} disabled={activating === req.id || req.status === "rejected"}
                        className="flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl text-[10px] font-bold text-white disabled:opacity-50"
                        style={{ background: req.status === "rejected" ? "#C94C4C" : "#C94C4C" }}>
                        {activating === req.id ? <Loader2 size={10} className="animate-spin" /> : <XCircle size={11} />}
                        {t("reqReject")}
                      </button>
                    </div>
                  </div>
                  {activateMsg?.id === req.id && (
                    <div className="mt-2 text-[10px] font-bold" style={{ color: activateMsg.ok ? "#2E7D5B" : "#C94C4C" }}>
                      {activateMsg.text}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}