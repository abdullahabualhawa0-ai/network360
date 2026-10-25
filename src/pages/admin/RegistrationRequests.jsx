import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ClipboardList, Loader2, RefreshCw, Mail, Phone, School as SchoolIcon,
  AlertCircle, CheckCircle2, XCircle,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import BackButton from "@/components/BackButton";
import { t, useLang, useDir, getLang, LANG_DIR } from "@/lib/i18n";
import { randomCode } from "@/lib/plans";
import { escapeHtml } from "@/lib/escapeHtml";

const STATUS_UI = {
  new: { label: "reqStatusNew", cls: "bg-accent border-border text-brand" },
  contacted: { label: "reqStatusContacted", cls: "bg-warning/10 border-warning/35 text-warning" },
  in_progress: { label: "reqStatusInProgress", cls: "bg-warning/10 border-warning/35 text-warning" },
  accepted: { label: "reqStatusAccepted", cls: "bg-success/10 border-success/35 text-success" },
  rejected: { label: "reqStatusRejected", cls: "bg-destructive/10 border-destructive/35 text-destructive" },
};

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

  const notifyUser = async (req, accepted, schoolCode, adminCode, individualCode) => {
    const isSchool = req.request_type === "school";
    const lang = getLang();
    const dirAttr = LANG_DIR[lang] || "rtl";
    const subject = accepted
      ? t(isSchool ? "mailAcceptedSubjectSchool" : "mailAcceptedSubjectIndividual", lang)
      : t(isSchool ? "mailRejectedSubjectSchool" : "mailRejectedSubjectIndividual", lang);
    const title = accepted ? t("mailAcceptedTitle", lang) : t("mailRejectedTitle", lang);
    const greeting = t("mailAcceptedGreeting", lang);
    const headerColor = accepted ? "#2E7D5B" : "#C94C4C";
    const bodyLine = accepted
      ? (isSchool
        ? `${t("mailAcceptedBodySchool", lang)} «${escapeHtml(req.school_name)}».`
        : t("mailAcceptedBodyIndividual", lang))
      : (isSchool
        ? `${t("mailRejectedBodySchool", lang)} «${escapeHtml(req.school_name)}».`
        : t("mailRejectedBodyIndividual", lang));
    const footer = accepted ? t("mailAcceptedFooter", lang) : t("mailRejectedFooter", lang);
    let codeLines = "";
    if (accepted && isSchool && schoolCode) {
      codeLines = `<p style="margin:0 0 8px;font-size:14px;">${t("mailSchoolCodeLabel", lang)}: <b dir="ltr">${escapeHtml(schoolCode)}</b></p>`
        + (req.admin_name ? `<p style="margin:0 0 8px;font-size:14px;">${t("mailAdminNameLabel", lang)}: <b>${escapeHtml(req.admin_name)}</b></p>` : "")
        + (adminCode ? `<p style="margin:0 0 8px;font-size:14px;">${t("mailAdminCodeLabel", lang)}: <b dir="ltr">${escapeHtml(adminCode)}</b></p>` : "")
        + (adminCode ? `<p style="margin:0 0 12px;font-size:13px;color:#ffb805;">${t("mailAdminAssignedNote", lang)}</p>` : "");
    } else if (accepted && !isSchool && individualCode) {
      codeLines = `<p style="margin:0 0 8px;font-size:14px;">${t("mailIndividualCodeLabel", lang)}: <b dir="ltr">${escapeHtml(individualCode)}</b></p>`
        + `<p style="margin:0 0 12px;font-size:13px;color:#2E7D5B;">${t("mailIndividualLoginNote", lang)}</p>`;
    }
    const html = `<div dir="${dirAttr}" style="font-family: Tajawal, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; background: #17191c; border-radius: 16px; color: #f4eee2;">
        <div style="background: ${headerColor}; color: #fff; padding: 16px 20px; border-radius: 12px; margin-bottom: 20px;">
          <h2 style="margin: 0; font-size: 18px;">${title}</h2>
        </div>
        <div style="background: #1c2024; padding: 20px; border-radius: 12px; border: 1px solid #2b3137;">
          <p style="margin: 0 0 12px; font-size: 14px;">${greeting} ${escapeHtml(req.full_name)}،</p>
          <p style="margin: 0 0 12px; font-size: 14px;">${bodyLine}</p>
          ${codeLines}
          <p style="margin: 0; font-size: 12px; color: #a2a8b0;">${footer}</p>
        </div>
      </div>`;
    try {
      await base44.integrations.Core.SendEmail({ to: req.email, subject, html });
      return true;
    } catch (e) {
      return false;
    }
  };

  const acceptRequest = async (req) => {
    setActivating(req.id);
    setActivateMsg(null);
    try {
      let schoolCode = null;
      let adminCode = null;
      let individualCode = null;
      if (req.request_type === "school" && req.status !== "accepted") {
        schoolCode = randomCode("SCH-", 6);
        const dup = await base44.entities.School.filter({ code: schoolCode });
        if (dup && dup.length > 0) throw new Error("Code collision");
        adminCode = generateAdminCode();
        await base44.entities.School.create({
          name: req.school_name, code: schoolCode, admin_code: adminCode, is_active: true, created_by_id: user.id,
          subscription_plan: "school_50", student_limit: req.expected_students || 50,
          teacher_limit: req.expected_teachers || 0, current_student_count: 0,
          subscription_status: "active", admin_name: req.admin_name || req.full_name, admin_email: req.email,
          contact_phone: req.phone, country: req.country, expected_students: req.expected_students,
        });
      } else if (req.request_type === "individual" && req.status !== "accepted") {
        schoolCode = randomCode("SCH-", 6);
        const dup = await base44.entities.School.filter({ code: schoolCode });
        if (dup && dup.length > 0) throw new Error("Code collision");
        individualCode = generateIndividualCode();
        const school = await base44.entities.School.create({
          name: req.full_name || "Individual", code: schoolCode, is_active: true, created_by_id: user.id,
          subscription_plan: "personal_monthly", student_limit: 1, teacher_limit: 0,
          current_student_count: 1, subscription_status: "active",
          admin_name: req.full_name, admin_email: req.email, contact_phone: req.phone, country: req.country,
        });
        await base44.entities.StudentProfile.create({
          school_id: school.id,
          student_code: individualCode,
          full_name: req.full_name || "",
          email: req.email || "",
          status: "approved",
          preferred_language: "ar",
          phone: req.phone || "",
          country: req.country || "",
        });
      }
      await base44.entities.RegistrationRequest.update(req.id, {
        status: "accepted",
        notes: schoolCode ? `Activated: ${schoolCode}` : "Accepted",
      });
      const emailed = await notifyUser(req, true, schoolCode, adminCode, individualCode);
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
      <div className="py-24 flex justify-center bg-background">
        <Loader2 size={28} className="animate-spin text-brand" />
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="py-20 text-center font-main" dir={direction}>
        <AlertCircle size={36} className="mx-auto mb-3 text-destructive" />
        <p className="text-xs text-muted-foreground">Owner only</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-main" dir={direction}>
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Back */}
        <div className="mb-4">
          <BackButton fallback="/admin/schools" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between gap-3 flex-wrap mb-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-[10px] flex items-center justify-center bg-primary text-primary-foreground">
              <ClipboardList size={20} />
            </div>
            <div>
              <h1 className="font-black text-xl text-foreground">{t("regRequestsTitle")}</h1>
              <p className="text-xs text-muted-foreground">{t("regRequestsDesc")}</p>
            </div>
          </div>
          <button
            onClick={load}
            className="p-2 rounded-[10px] border border-border text-brand hover:bg-accent"
          >
            <RefreshCw size={14} />
          </button>
        </div>

        {/* List */}
        {requests === null ? (
          <div className="py-20 flex justify-center">
            <Loader2 size={26} className="animate-spin text-brand" />
          </div>
        ) : requests.length === 0 ? (
          <div className="rounded-[16px] p-10 text-center bg-card border border-border">
            <ClipboardList size={36} className="mx-auto mb-3 opacity-40 text-brand" />
            <p className="text-xs font-bold mb-1 text-foreground">{t("reqNoRequests")}</p>
            <p className="text-[11px] text-muted-foreground">{t("reqNoRequestsDesc")}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((req, i) => {
              const st = STATUS_UI[req.status] || STATUS_UI.new;
              const isSchool = req.request_type === "school";
              return (
                <motion.div
                  key={req.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="rounded-[16px] p-4 bg-card border border-border"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                    <div className="flex-1 min-w-0">
                      {/* Type + name */}
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                          isSchool ? "bg-accent border-border text-brand" : "bg-success/10 border-success/35 text-success"
                        }`}>
                          {isSchool ? t("reqTypeSchool") : t("reqTypeIndividual")}
                        </span>
                        <span className="font-black text-sm text-foreground">{req.full_name}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${st.cls}`}>
                          {t(st.label)}
                        </span>
                      </div>
                      {/* School name */}
                      {isSchool && req.school_name && (
                        <div className="flex items-center gap-1.5 text-[11px] mb-1 text-brand">
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
                              <span className="px-2 py-0.5 rounded-full font-bold bg-accent border border-border text-brand">
                                {req.expected_students} {t("regExpectedStudents")}
                              </span>
                            )}
                            {req.expected_teachers > 0 && (
                              <span className="px-2 py-0.5 rounded-full font-bold bg-success/10 border border-success/35 text-success">
                                {req.expected_teachers} {t("regExpectedTeachers")}
                              </span>
                            )}
                          </>
                        ) : (
                          req.expected_users > 0 && (
                            <span className="px-2 py-0.5 rounded-full font-bold bg-accent border border-border text-brand">
                              {req.expected_users} {t("regExpectedUsers")}
                            </span>
                          )
                        )}
                        <span className="text-muted-foreground">{new Date(req.created_date).toLocaleDateString("ar")}</span>
                      </div>
                    </div>

                    {/* Actions — قبول / رفض فقط */}
                    <div className="flex gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => acceptRequest(req)}
                        disabled={activating === req.id || req.status === "accepted"}
                        className="flex items-center justify-center gap-1 px-3 py-1.5 rounded-[10px] text-[10px] font-bold bg-success text-success-foreground hover:bg-success/90 disabled:opacity-50"
                      >
                        {activating === req.id ? <Loader2 size={10} className="animate-spin" /> : <CheckCircle2 size={11} />}
                        {t("reqAccept")}
                      </button>
                      <button
                        onClick={() => rejectRequest(req)}
                        disabled={activating === req.id || req.status === "rejected"}
                        className="flex items-center justify-center gap-1 px-3 py-1.5 rounded-[10px] text-[10px] font-bold bg-destructive/10 border border-destructive/35 text-destructive hover:bg-destructive/20 disabled:opacity-50"
                      >
                        {activating === req.id ? <Loader2 size={10} className="animate-spin" /> : <XCircle size={11} />}
                        {t("reqReject")}
                      </button>
                    </div>
                  </div>
                  {activateMsg?.id === req.id && (
                    <div className={`mt-2 text-[10px] font-bold ${activateMsg.ok ? "text-success" : "text-destructive"}`}>
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

function generateAdminCode() {
  return randomCode("ADM-", 6);
}

function generateIndividualCode() {
  return randomCode("IND-", 6);
}