import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  School as SchoolIcon, Plus, Loader2, AlertTriangle, RefreshCw,
  GraduationCap, ShieldCheck, Check, X, Ban, Trash2, Pencil, Users,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import StudentsManager from "../../components/admin/StudentsManager";
import TeachersList from "../../components/admin/TeachersList";
import { planLabel, planForLimit, PLANS, randomCode } from "@/lib/plans";
import { t, useLang, useDir } from "@/lib/i18n";

/**
 * شاشة المدارس — Super Admin فقط (role = admin)
 * إضافة مدرسة برمز فريد + عدد طلاب، تعديل الرمز والحد، حذف، تفعيل/تعطيل، إدارة طلاب.
 */
export default function SchoolsManager() {
  const { user, isLoadingAuth } = useAuth();
  useLang();
  const direction = useDir();
  const [schools, setSchools] = useState(null);
  const [personalCodes, setPersonalCodes] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", code: "", adminName: "", studentLimit: 50 });
  const [formError, setFormError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [view, setView] = useState("list"); // list | students | teachers
  const [selectedSchool, setSelectedSchool] = useState(null);
  // تعديل سطري: حقل واحد فقط في كل مرة { id, field: "code" | "studentCode" | "limit", value }
  // (سابقاً كان القلم يفتح حقلين معاً بتركيز تلقائي، فيفقد الأول التركيز ويُغلق فوراً قبل أن تكتب)
  const [edit, setEdit] = useState(null);
  const [rowError, setRowError] = useState(null); // { id, msg }
  const [deleteTarget, setDeleteTarget] = useState(null); // المدرسة المراد حذفها (نافذة التأكيد)
  const [deleteText, setDeleteText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [counts, setCounts] = useState({});       // { [schoolId]: { students, teachers } } — أعداد حقيقية

  const isSuperAdmin = user?.role === "admin";

  const load = async () => {
    const r = await base44.entities.School.list("-created_date", 100);
    setSchools(r || []);

    // أعداد حقيقية للطلاب والأساتذة (الحقل المخزَّن current_student_count قد يكون قديماً)
    try {
      const [allStudents, allTeachers] = await Promise.all([
        base44.entities.StudentProfile.list("-created_date", 10000),
        base44.entities.Teacher.list("-created_date", 10000),
      ]);
      const c = {};
      for (const sc of r || []) c[sc.id] = { students: 0, teachers: 0 };
      for (const st of allStudents || []) if (c[st.school_id]) c[st.school_id].students++;
      for (const th of allTeachers || []) if (c[th.school_id]) c[th.school_id].teachers++;
      setCounts(c);
      // مزامنة الحقل المخزَّن إن اختلف (لتتفق باقي الشاشات)
      for (const sc of r || []) {
        if (c[sc.id] && (sc.current_student_count || 0) !== c[sc.id].students) {
          base44.entities.School.update(sc.id, { current_student_count: c[sc.id].students }).catch(() => {});
        }
      }
    } catch { /* نُبقي الأعداد المخزَّنة */ }
    // جلب رموز الطلاب الفردية للخطط الشخصية
    const personal = (r || []).filter((s) => PLANS[s.subscription_plan]?.personal);
    if (personal.length) {
      const codes = {};
      await Promise.all(personal.map(async (s) => {
        const students = await base44.entities.StudentProfile.filter({ school_id: s.id }, "-created_date", 1);
        if (students?.length) codes[s.id] = { code: students[0].student_code, profileId: students[0].id };
      }));
      setPersonalCodes(codes);
    }
  };

  useEffect(() => {
    if (!isLoadingAuth && isSuperAdmin) load();
  }, [isLoadingAuth, isSuperAdmin]);

  const addSchool = async (e) => {
    e.preventDefault();
    const code = form.code.trim();
    if (!form.name.trim() || !code) { setFormError(t("schoolsErrNameCode")); return; }
    setBusy(true);
    setFormError(null);
    if (await codeTaken(code)) {
      setFormError(t("schoolsErrDupCode"));
      setBusy(false);
      return;
    }
    const limitN = parseInt(form.studentLimit) || 50;
    await base44.entities.School.create({
      name: form.name.trim(),
      code,
      admin_code: generateAdminCode(),
      admin_name: form.adminName.trim() || null,
      is_active: true,
      created_by_id: user.id,
      subscription_plan: planForLimit(limitN), // الاسم متسق مع الحد
      student_limit: limitN,
      current_student_count: 0,
      subscription_status: "active",
    });
    setForm({ name: "", code: "", adminName: "", studentLimit: 50 });
    setShowForm(false);
    setBusy(false);
    load();
  };

  const toggleActive = async (s) => {
    await base44.entities.School.update(s.id, { is_active: !s.is_active });
    load();
  };

  // هل الرمز مستخدم؟ (بدون حساسية لحالة الأحرف، لأن الدخول لا يفرّق بينها)
  const codeTaken = async (code, exceptId = null) => {
    if ((schools || []).some((x) => x.id !== exceptId && String(x.code || "").toLowerCase() === code.toLowerCase())) return true;
    for (const v of Array.from(new Set([code, code.toUpperCase(), code.toLowerCase()]))) {
      const dup = await base44.entities.School.filter({ code: v });
      if ((dup || []).some((x) => x.id !== exceptId)) return true;
    }
    return false;
  };
  // هل رمز المشرف مستخدم؟ (بدون حساسية لحالة الأحرف)
  const adminCodeTaken = async (code, exceptId = null) => {
    if ((schools || []).some((x) => x.id !== exceptId && String(x.admin_code || "").toLowerCase() === code.toLowerCase())) return true;
    for (const v of Array.from(new Set([code, code.toUpperCase(), code.toLowerCase()]))) {
      const dup = await base44.entities.School.filter({ admin_code: v });
      if ((dup || []).some((x) => x.id !== exceptId)) return true;
    }
    return false;
  };
  const studentCodeTaken = async (code, exceptProfileId) => {
    for (const v of Array.from(new Set([code, code.toUpperCase(), code.toLowerCase()]))) {
      const dup = await base44.entities.StudentProfile.filter({ student_code: v });
      if ((dup || []).some((x) => x.id !== exceptProfileId)) return true;
    }
    return false;
  };

  const startEdit = (s, field) => {
    setRowError(null);
    const value = field === "limit" ? String(s.student_limit ?? "")
      : field === "studentCode" ? (personalCodes[s.id]?.code || "")
      : field === "adminCode" ? (s.admin_code || "")
      : (s.code || "");
    setEdit({ id: s.id, field, value });
  };
  const cancelEdit = () => { setEdit(null); setRowError(null); };

  const commitEdit = async (s) => {
    if (!edit || edit.id !== s.id) return;
    const value = String(edit.value ?? "").trim();
    setRowError(null);

    if (edit.field === "code") {
      if (!value) return setRowError({ id: s.id, msg: t("schoolsErrNameCode") });
      if (value === s.code) return setEdit(null);
      if (await codeTaken(value, s.id)) return setRowError({ id: s.id, msg: t("schoolsErrDupCode") });
      await base44.entities.School.update(s.id, { code: value });
    } else if (edit.field === "studentCode") {
      const profile = personalCodes[s.id];
      if (!profile) return setEdit(null);
      if (!value) return setRowError({ id: s.id, msg: t("schoolsErrNameCode") });
      if (value === profile.code) return setEdit(null);
      if (await studentCodeTaken(value, profile.profileId)) return setRowError({ id: s.id, msg: t("schoolsErrDupCode") });
      await base44.entities.StudentProfile.update(profile.profileId, { student_code: value });
    } else if (edit.field === "adminCode") {
      // تعديل رمز المشرف — للاونرز فقط (هذه الشاشة للمالك حصراً)
      if (!value) return setRowError({ id: s.id, msg: t("schoolsErrNameCode") });
      if (value === s.admin_code) return setEdit(null);
      if (await adminCodeTaken(value, s.id)) return setRowError({ id: s.id, msg: t("schoolsErrAdminDup") });
      await base44.entities.School.update(s.id, { admin_code: value });
    } else if (edit.field === "limit") {
      const n = Number(value);
      if (!Number.isInteger(n) || n < 0) return setRowError({ id: s.id, msg: t("schoolsErrLimitInvalid") });
      const current = counts[s.id]?.students ?? 0;
      if (n > 0 && n < current) {
        return setRowError({ id: s.id, msg: t("schoolsErrLimitBelowCount").replace("{count}", current) });
      }
      if (n === s.student_limit) return setEdit(null);
      // اسم الخطة يتبع الحد كي لا تظهر معلومات متضاربة (مثلاً "حتى 50" والحد 100)
      const patch = { student_limit: n };
      if (!PLANS[s.subscription_plan]?.personal) patch.subscription_plan = planForLimit(n);
      await base44.entities.School.update(s.id, patch);
    }
    setEdit(null);
    load();
  };

  // حذف مدرسة = حذف كل شيء يخصها (طلاب، أساتذة، امتحانات، نتائج، تقدّم، جلسات) — نهائي
  const deleteSchool = (s) => {
    setDeleteText(""); setDeleteError(null); setDeleteTarget(s);
  };

  // احتياط: إن لم تكن دالة deleteSchool منشورة بعد، نحذف من المتصفح (المالك لديه صلاحية الحذف)
  const cascadeDeleteClient = async (sc) => {
    const students = (await base44.entities.StudentProfile.filter({ school_id: sc.id }, "-created_date", 10000)) || [];
    for (const st of students) {
      const prog = (await base44.entities.StudentProgress.filter({ student_id: st.id }, undefined, 100)) || [];
      for (const p of prog) await base44.entities.StudentProgress.delete(p.id);
    }
    for (const entity of ["LabHistory", "ScenarioTaskStatus", "ExamResult", "ExamAccessRequest", "Exam", "AuthSession", "StudentProfile", "Teacher"]) {
      try {
        const rows = (await base44.entities[entity].filter({ school_id: sc.id }, undefined, 10000)) || [];
        for (const r of rows) await base44.entities[entity].delete(r.id);
      } catch { /* كيان غير متاح للمالك — نكمل */ }
    }
    await base44.entities.School.delete(sc.id);
  };

  const confirmDeleteSchool = async () => {
    const sc = deleteTarget;
    if (!sc || deleteText.trim() !== sc.name) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      let res = await base44.functions.invoke("deleteSchool", { school_id: sc.id, confirm: true });
      // مدرسة ضخمة: الدالة تحذف على دفعات وتطلب إعادة الاستدعاء
      for (let i = 0; i < 6 && res?.data?.partial; i++) {
        res = await base44.functions.invoke("deleteSchool", { school_id: sc.id, confirm: true });
      }
      if (!res?.data?.ok) throw new Error("incomplete");
    } catch (err) {
      const status = err?.status || err?.response?.status;
      const msg = err?.data?.error || err?.response?.data?.error;
      if (msg === "School not found") {
        /* محذوفة أصلاً */
      } else if (status === 404) {
        try { await cascadeDeleteClient(sc); }
        catch { setDeleteError(t("schoolsDeleteFailed")); setDeleting(false); return; }
      } else {
        setDeleteError(t("schoolsDeleteFailed"));
        setDeleting(false);
        return;
      }
    }
    setDeleting(false);
    setDeleteTarget(null);
    load();
  };

  if (isLoadingAuth) return <FullSpinner />;

  if (!isSuperAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background" dir={direction}>
        <div className="text-center">
          <AlertTriangle size={36} className="text-red-400 mx-auto mb-3" />
          <h2 className="font-black text-lg mb-2">{t("restrictedAccess")}</h2>
          <p className="text-xs text-muted-foreground mb-5">{t("restrictedOwnerOnly")}</p>
          <Link to="/" className="text-xs font-bold" style={{ color: "hsl(var(--primary))" }}>{t("backToHome")}</Link>
        </div>
      </div>);
  }

  // إدارة طلاب مدرسة محددة
  if (view === "students" && selectedSchool) {
    return (
      <div className="min-h-screen bg-background text-foreground" dir={direction}>
        <div className="max-w-5xl mx-auto px-4 py-8">
          <StudentsManager school={selectedSchool} onBack={() => { setView("list"); setSelectedSchool(null); }} />
        </div>
      </div>);
  }

  // إدارة أساتذة مدرسة محددة
  if (view === "teachers" && selectedSchool) {
    return (
      <div className="min-h-screen bg-background text-foreground" dir={direction}>
        <div className="max-w-5xl mx-auto px-4 py-8">
          <TeachersList school={selectedSchool} onBack={() => { setView("list"); setSelectedSchool(null); }} />
        </div>
      </div>);
  }

  return (
    <div className="min-h-screen bg-background text-foreground" dir={direction}>
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 flex-wrap mb-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#0891b2,#7c3aed)" }}>
              <SchoolIcon className="text-white" size={20} />
            </div>
            <div>
              <h1 className="font-black text-xl">{t("schoolsTitle")}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={load} className="p-2 rounded-xl hover:bg-white/5"
              style={{ border: "1px solid hsl(var(--border))", color: "hsl(var(--primary))" }}>
              <RefreshCw size={14} />
            </button>
            <button onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white"
              style={{ background: "linear-gradient(90deg,#0891b2,#7c3aed)" }}>
              <Plus size={14} /> {t("schoolsAddBtn")}
            </button>
          </div>
        </div>

        {/* Add School form */}
        {showForm &&
          <motion.form initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} onSubmit={addSchool}
            className="rounded-2xl p-4 mb-5 grid sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end bg-card"
            style={{ border: "1px solid rgba(6,182,212,0.3)" }}>
            <div>
              <label className="block text-[10px] font-bold text-muted-foreground mb-1">{t("schoolsNameLabel")}</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                dir={direction} className="w-full px-3 py-2 rounded-xl text-xs bg-transparent focus:outline-none"
                style={{ border: "1px solid hsl(var(--border))" }} />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-muted-foreground mb-1">{t("regAdminName")}</label>
              <input value={form.adminName} onChange={(e) => setForm({ ...form, adminName: e.target.value })}
                dir={direction} className="w-full px-3 py-2 rounded-xl text-xs bg-transparent focus:outline-none"
                style={{ border: "1px solid hsl(var(--border))" }} />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-muted-foreground mb-1">{t("schoolsCodeLabel")}</label>
              <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })}
                placeholder="SCH2026A" dir="ltr"
                className="w-full px-3 py-2 rounded-xl text-xs font-mono bg-transparent focus:outline-none"
                style={{ border: "1px solid hsl(var(--border))" }} />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-muted-foreground mb-1">{t("schoolsStudentLimitLabel")}</label>
              <input type="number" min="1" value={form.studentLimit}
                onChange={(e) => setForm({ ...form, studentLimit: e.target.value })}
                dir="ltr"
                className="w-full px-3 py-2 rounded-xl text-xs font-mono bg-transparent focus:outline-none"
                style={{ border: "1px solid hsl(var(--border))" }} />
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={busy}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold text-white disabled:opacity-60"
                style={{ background: "linear-gradient(90deg,#059669,#10b981)" }}>
                {busy ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />} {t("schoolsSaveBtn")}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="px-3 py-2 rounded-xl text-xs" style={{ border: "1px solid hsl(var(--border))", color: "hsl(var(--muted-foreground))" }}>
                <X size={12} />
              </button>
            </div>
            {formError &&
              <div className="sm:col-span-5 text-[11px] font-bold px-3 py-2 rounded-xl"
                style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5" }}>
                {formError}
              </div>
            }
          </motion.form>
        }

        {/* Schools list */}
        {schools === null ?
          <FullSpinner /> :
          schools.length === 0 ?
            <div className="rounded-2xl p-10 text-center bg-card" style={{ border: "1px solid hsl(var(--border))" }}>
              <SchoolIcon size={40} className="mx-auto mb-3 opacity-40" style={{ color: "hsl(var(--primary))" }} />
              <p className="text-xs text-muted-foreground">{t("schoolsEmpty")}</p>
            </div> :
            <div className="space-y-3">
              {schools.map((s, i) => {
                const isPersonal = !!PLANS[s.subscription_plan]?.personal;
                const displayCode = isPersonal ? (personalCodes[s.id]?.code || "—") : s.code;
                const codeLabel = isPersonal ? t("studentCodeLabel") : t("schoolsCodeLabel");
                const codeField = isPersonal ? "studentCode" : "code";
                return (
                  <motion.div key={s.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    className="rounded-2xl p-4 bg-card" style={{ border: "1px solid hsl(var(--border))" }}>
                    {/* Row 1: Name + Status + Delete */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-black text-sm">{s.name}</span>
                        {/* حالة الحساب (يمكن للمالك تعطيله) */}
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                          style={s.is_active ?
                            { background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.35)", color: "#34d399" } :
                            { background: "rgba(148,163,184,0.1)", border: "1px solid rgba(148,163,184,0.3)", color: "#94a3b8" }}>
                          {t("schoolsAccountLabel")}: {s.is_active ? t("schoolsActive") : t("schoolsInactive")}
                        </span>
                        {/* حالة الاشتراك */}
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                          style={s.subscription_status === "active" ?
                            { background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.35)", color: "#34d399" } :
                            s.subscription_status === "expired" ?
                              { background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.35)", color: "#f87171" } :
                              { background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.35)", color: "#fbbf24" }}>
                          {t("schoolsSubscriptionLabel")}: {s.subscription_status === "active" ? t("subsActive") : s.subscription_status === "expired" ? t("subsExpired") : t("subsPending")}
                        </span>
                      </div>
                      <button onClick={() => deleteSchool(s)}
                        className="p-1.5 rounded-xl flex-shrink-0"
                        style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }}
                        title={t("schoolsDeleteBtn")}>
                        <Trash2 size={13} />
                      </button>
                    </div>

                    {/* Row 2: الرمز + رمز المشرف + عدد الطلاب (قابلة للتعديل) */}
                    <div className={`grid gap-2 mb-3 ${isPersonal ? "sm:grid-cols-2" : "sm:grid-cols-3"}`}>
                      {/* رمز المدرسة / رمز الطالب (للخطة الشخصية) */}
                      <div className="rounded-xl p-2.5" style={{ background: "rgba(6,182,212,0.04)", border: "1px solid rgba(6,182,212,0.15)" }}>
                        <div className="text-[9px] font-bold text-muted-foreground mb-1">{codeLabel}</div>
                        {edit?.id === s.id && edit.field === codeField ? (
                          <InlineEdit value={edit.value} dir="ltr" mono
                            onChange={(v) => setEdit({ ...edit, value: v })}
                            onSave={() => commitEdit(s)} onCancel={cancelEdit} />
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-mono font-bold" style={{ color: "#06b6d4" }} dir="ltr">{displayCode}</span>
                            <button onClick={() => startEdit(s, codeField)}
                              className="min-w-[32px] min-h-[32px] flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity" title={t("schoolsEditCodeHint")}>
                              <Pencil size={12} />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* رمز المشرف — للمدارس فقط (لا معنى له للخطة الشخصية) */}
                      {!isPersonal && (
                        <div className="rounded-xl p-2.5" style={{ background: "rgba(139,92,246,0.04)", border: "1px solid rgba(139,92,246,0.15)" }}>
                          <div className="text-[9px] font-bold text-muted-foreground mb-1 flex items-center gap-1">
                            <ShieldCheck size={9} /> {t("schoolsAdminCodeLabel")}
                          </div>
                          {edit?.id === s.id && edit.field === "adminCode" ? (
                            <InlineEdit value={edit.value} dir="ltr" mono
                              onChange={(v) => setEdit({ ...edit, value: v })}
                              onSave={() => commitEdit(s)} onCancel={cancelEdit} />
                          ) : (
                            <>
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-mono font-bold" style={{ color: "#a78bfa" }} dir="ltr">{s.admin_code || "—"}</span>
                                <button onClick={() => startEdit(s, "adminCode")}
                                  className="min-w-[32px] min-h-[32px] flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity" title={t("schoolsEditAdminCodeHint")}>
                                  <Pencil size={12} />
                                </button>
                              </div>
                              <div className="text-[10px] text-muted-foreground mt-0.5 truncate">
                                {t("regAdminName")}: {s.admin_name || "—"}
                              </div>
                            </>
                          )}
                        </div>
                      )}

                      {/* عدد الطلاب: الفعلي / الحد، والأساتذة */}
                      <div className="rounded-xl p-2.5" style={{ background: "rgba(47,102,144,0.04)", border: "1px solid rgba(47,102,144,0.15)" }}>
                        <div className="text-[9px] font-bold text-muted-foreground mb-1 flex items-center gap-1">
                          <Users size={9} /> {t("schoolsStudentLimitLabel")}
                        </div>
                        {edit?.id === s.id && edit.field === "limit" ? (
                          <InlineEdit value={edit.value} dir="ltr" mono type="number"
                            onChange={(v) => setEdit({ ...edit, value: v })}
                            onSave={() => commitEdit(s)} onCancel={cancelEdit} />
                        ) : (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-mono font-bold" style={{ color: "#2F6690" }}>
                              {counts[s.id]?.students ?? s.current_student_count ?? 0} / {s.student_limit || "∞"}
                            </span>
                            {!isPersonal && (
                              <button onClick={() => startEdit(s, "limit")}
                                className="min-w-[32px] min-h-[32px] flex items-center justify-center opacity-70 hover:opacity-100" title={t("schoolsEditLimitHint")}>
                                <Pencil size={12} />
                              </button>
                            )}
                            {!isPersonal && counts[s.id] && (
                              <span className="text-[10px] text-muted-foreground">· {t("schoolsTeachersCount")}: {counts[s.id].teachers}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {rowError?.id === s.id && (
                      <div className="mb-3 text-[11px] font-bold px-3 py-2 rounded-xl"
                        style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171" }}>
                        {rowError.msg}
                      </div>
                    )}

                    {/* Row 3: Plan + Date + Actions */}
                    <div className="flex items-center justify-between gap-2 flex-wrap pt-2" style={{ borderTop: "1px solid hsl(var(--border))" }}>
                      <div className="flex items-center gap-2 flex-wrap text-[10px]">
                        <span className="px-2 py-0.5 rounded-full font-bold"
                          style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.3)", color: "#a78bfa" }}>
                          {isPersonal ? planLabel(s.subscription_plan) : (s.student_limit > 0 ? t("schoolsUpToStudents").replace("{n}", s.student_limit) : t("schoolsUnlimited"))}
                        </span>
                        <span className="text-muted-foreground">{t("schoolsRegDate")}: {new Date(s.created_date).toLocaleDateString(direction === "rtl" ? "ar" : "en")}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button onClick={() => { setSelectedSchool(s); setView("students"); }}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold"
                          style={{ background: "rgba(6,182,212,0.08)", border: "1px solid rgba(6,182,212,0.3)", color: "#06b6d4" }}>
                          <GraduationCap size={13} /> {t("schoolsStudentsBtn")}
                        </button>
                        <button onClick={() => { setSelectedSchool(s); setView("teachers"); }}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold"
                          style={{ background: "rgba(47,102,144,0.08)", border: "1px solid rgba(47,102,144,0.3)", color: "#2F6690" }}>
                          <ShieldCheck size={13} /> {t("schoolsTeachersBtn")}
                        </button>
                        <button onClick={() => toggleActive(s)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
                          style={{ border: "1px solid hsl(var(--border))", color: "hsl(var(--muted-foreground))" }}>
                          {s.is_active ? <><Ban size={11} /> {t("schoolsDisable")}</> : <><Check size={11} /> {t("schoolsEnable")}</>}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
        }
      </div>

      {/* نافذة تأكيد حذف مدرسة (تتطلب كتابة اسمها) */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-[4px]" dir={direction}>
          <div className="w-full max-w-md rounded-2xl p-5 bg-card text-card-foreground border border-border shadow-2xl">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={18} style={{ color: "#f87171" }} />
              <h3 className="text-sm font-black" style={{ color: "#f87171" }}>{t("schoolsDeleteTitle")}</h3>
            </div>
            <p className="text-xs leading-relaxed mb-3">
              <b>{deleteTarget.name}</b>
              <br />
              {t("schoolsDeleteWarn")
                .replace("{students}", counts[deleteTarget.id]?.students ?? 0)
                .replace("{teachers}", counts[deleteTarget.id]?.teachers ?? 0)}
            </p>
            <label className="block text-[11px] font-bold text-muted-foreground mb-1">{t("schoolsDeleteTypeName")}</label>
            <input value={deleteText} onChange={(e) => setDeleteText(e.target.value)} autoFocus
              autoCapitalize="none" autoCorrect="off" spellCheck={false}
              className="w-full px-3 py-2.5 rounded-xl text-sm bg-background border border-border focus:border-primary focus:outline-none mb-3" />
            {deleteError && (
              <div className="mb-3 text-[11px] font-bold px-3 py-2 rounded-xl"
                style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171" }}>
                {deleteError}
              </div>
            )}
            <div className="flex gap-2">
              <button onClick={confirmDeleteSchool}
                disabled={deleting || deleteText.trim() !== deleteTarget.name}
                className="flex-1 min-h-[44px] flex items-center justify-center gap-2 rounded-xl text-xs font-black text-white disabled:opacity-40"
                style={{ background: "#dc2626" }}>
                {deleting ? <><Loader2 size={13} className="animate-spin" /> {t("schoolsDeleting")}</> : <><Trash2 size={13} /> {t("schoolsDeleteAction")}</>}
              </button>
              <button onClick={() => setDeleteTarget(null)} disabled={deleting}
                className="min-h-[44px] px-4 rounded-xl text-xs font-bold border border-border text-muted-foreground disabled:opacity-40">
                {t("dialogCancel")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>);
}

function FullSpinner() {
  return (
    <div className="py-24 flex justify-center">
      <Loader2 size={28} className="animate-spin" style={{ color: "hsl(var(--primary))" }} />
    </div>);
}

function generateAdminCode() {
  // توليد آمن (CSPRNG) بدلاً من Math.random
  return randomCode("ADM-", 6);
}

/** حقل تعديل سطري: حفظ بـ Enter أو زر ✓، وإلغاء بـ Esc أو زر ✗ (لا حفظ تلقائي عند فقدان التركيز) */
function InlineEdit({ value, onChange, onSave, onCancel, dir, mono, type = "text" }) {
  const [saving, setSaving] = useState(false);
  const save = async () => { setSaving(true); try { await onSave(); } finally { setSaving(false); } };
  return (
    <div className="flex items-center gap-1">
      <input type={type} min={type === "number" ? "0" : undefined} value={value} dir={dir} autoFocus
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") { e.preventDefault(); save(); }
          if (e.key === "Escape") { e.preventDefault(); onCancel(); }
        }}
        className={`min-w-0 flex-1 text-xs px-2 py-1.5 rounded-lg bg-background border border-border focus:border-primary focus:outline-none ${mono ? "font-mono" : ""}`} />
      <button type="button" onClick={save} disabled={saving}
        className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg text-white disabled:opacity-60"
        style={{ background: "#059669" }} aria-label="Save">
        {saving ? <Loader2 size={12} className="animate-spin" /> : <Check size={14} />}
      </button>
      <button type="button" onClick={onCancel}
        className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg border border-border text-muted-foreground" aria-label="Cancel">
        <X size={14} />
      </button>
    </div>
  );
}