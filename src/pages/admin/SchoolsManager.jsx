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
import { planLabel, PLANS } from "@/lib/plans";
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
  const [form, setForm] = useState({ name: "", code: "", studentLimit: 50 });
  const [formError, setFormError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [view, setView] = useState("list"); // list | students | teachers
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [editing, setEditing] = useState({}); // { [id]: { code, limit } }

  const isSuperAdmin = user?.role === "admin";

  const load = async () => {
    const r = await base44.entities.School.list("-created_date", 100);
    setSchools(r || []);
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
    const dup = await base44.entities.School.filter({ code });
    if (dup && dup.length > 0) {
      setFormError(t("schoolsErrDupCode"));
      setBusy(false);
      return;
    }
    await base44.entities.School.create({
      name: form.name.trim(),
      code,
      admin_code: generateAdminCode(),
      is_active: true,
      created_by_id: user.id,
      subscription_plan: "school_50",
      student_limit: parseInt(form.studentLimit) || 50,
      current_student_count: 0,
      subscription_status: "active",
    });
    setForm({ name: "", code: "", studentLimit: 50 });
    setShowForm(false);
    setBusy(false);
    load();
  };

  const toggleActive = async (s) => {
    await base44.entities.School.update(s.id, { is_active: !s.is_active });
    load();
  };

  const saveCode = async (s) => {
    const newCode = (editing[s.id]?.code || "").trim();
    if (!newCode || newCode === s.code) { setEditing((p) => ({ ...p, [s.id]: undefined })); return; }
    const dup = await base44.entities.School.filter({ code: newCode });
    if (dup && dup.length > 0) { setFormError(t("schoolsErrDupCode")); return; }
    await base44.entities.School.update(s.id, { code: newCode });
    setEditing((p) => ({ ...p, [s.id]: undefined }));
    load();
  };

  const saveLimit = async (s) => {
    const newLimit = parseInt(editing[s.id]?.limit) || 0;
    if (newLimit === s.student_limit) { setEditing((p) => ({ ...p, [s.id]: undefined })); return; }
    await base44.entities.School.update(s.id, { student_limit: newLimit });
    setEditing((p) => ({ ...p, [s.id]: undefined }));
    load();
  };

  const saveStudentCode = async (s) => {
    const profile = personalCodes[s.id];
    if (!profile) { setEditing((p) => ({ ...p, [s.id]: undefined })); return; }
    const newCode = (editing[s.id]?.studentCode || "").trim();
    if (!newCode || newCode === profile.code) { setEditing((p) => ({ ...p, [s.id]: undefined })); return; }
    const dup = await base44.entities.StudentProfile.filter({ student_code: newCode });
    if (dup && dup.length > 0) { setFormError(t("schoolsErrDupCode")); return; }
    await base44.entities.StudentProfile.update(profile.profileId, { student_code: newCode });
    setEditing((p) => ({ ...p, [s.id]: undefined }));
    load();
  };

  const deleteSchool = async (s) => {
    if (!confirm(t("schoolsDeleteConfirm"))) return;
    await base44.entities.School.delete(s.id);
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
          <Link to="/" className="text-xs font-bold" style={{ color: "hsl(var(--primary))" }}>{t("backHome")}</Link>
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
            className="rounded-2xl p-4 mb-5 grid sm:grid-cols-4 gap-3 items-end bg-card"
            style={{ border: "1px solid rgba(6,182,212,0.3)" }}>
            <div>
              <label className="block text-[10px] font-bold text-muted-foreground mb-1">{t("schoolsNameLabel")}</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
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
              <div className="sm:col-span-4 text-[11px] font-bold px-3 py-2 rounded-xl"
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
                const isEditing = !!editing[s.id];
                const isPersonal = !!PLANS[s.subscription_plan]?.personal;
                const displayCode = isPersonal ? (personalCodes[s.id]?.code || "—") : s.code;
                const codeLabel = isPersonal ? t("studentCodeLabel") : t("schoolsCodeLabel");
                return (
                  <motion.div key={s.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    className="rounded-2xl p-4 bg-card" style={{ border: "1px solid hsl(var(--border))" }}>
                    {/* Row 1: Name + Status + Delete */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-black text-sm">{s.name}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                          style={s.is_active ?
                            { background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.35)", color: "#34d399" } :
                            { background: "rgba(148,163,184,0.1)", border: "1px solid rgba(148,163,184,0.3)", color: "#94a3b8" }}>
                          {s.is_active ? t("schoolsActive") : t("schoolsInactive")}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                          style={s.subscription_status === "active" ?
                            { background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.35)", color: "#34d399" } :
                            s.subscription_status === "expired" ?
                              { background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.35)", color: "#f87171" } :
                              { background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.35)", color: "#fbbf24" }}>
                          {s.subscription_status === "active" ? t("subsActive") : s.subscription_status === "expired" ? t("subsExpired") : t("subsPending")}
                        </span>
                      </div>
                      <button onClick={() => deleteSchool(s)}
                        className="p-1.5 rounded-xl flex-shrink-0"
                        style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }}
                        title={t("schoolsDeleteBtn")}>
                        <Trash2 size={13} />
                      </button>
                    </div>

                    {/* Row 2: Code + Admin Code + Student Limit (editable) */}
                    <div className="grid sm:grid-cols-3 gap-2 mb-3">
                      {/* School Code / Personal Code */}
                      <div className="rounded-xl p-2.5" style={{ background: "rgba(6,182,212,0.04)", border: "1px solid rgba(6,182,212,0.15)" }}>
                        <div className="text-[9px] font-bold text-muted-foreground mb-1">{codeLabel}</div>
                        {isEditing ? (
                          <input
                            value={isPersonal ? (editing[s.id]?.studentCode ?? displayCode) : (editing[s.id]?.code ?? s.code)}
                            onChange={(e) => setEditing((p) => ({ ...p, [s.id]: { ...(p[s.id] || {}), [isPersonal ? "studentCode" : "code"]: e.target.value } }))}
                            dir="ltr" autoFocus
                            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); isPersonal ? saveStudentCode(s) : saveCode(s); } }}
                            onBlur={() => isPersonal ? saveStudentCode(s) : saveCode(s)}
                            className="w-full text-xs font-mono bg-transparent focus:outline-none" />
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-mono font-bold" style={{ color: "#06b6d4" }} dir="ltr">{displayCode}</span>
                            <button onClick={() => setEditing((p) => ({ ...p, [s.id]: { ...(p[s.id] || {}), code: s.code, limit: s.student_limit, studentCode: personalCodes[s.id]?.code || "" } }))}
                              className="opacity-60 hover:opacity-100 transition-opacity" title={t("schoolsEditCodeHint")}>
                              <Pencil size={11} />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Admin Code */}
                      <div className="rounded-xl p-2.5" style={{ background: "rgba(139,92,246,0.04)", border: "1px solid rgba(139,92,246,0.15)" }}>
                        <div className="text-[9px] font-bold text-muted-foreground mb-1 flex items-center gap-1">
                          <ShieldCheck size={9} /> {t("schoolsAdminCodeLabel")}
                        </div>
                        <span className="text-xs font-mono font-bold" style={{ color: "#a78bfa" }} dir="ltr">{s.admin_code || "—"}</span>
                      </div>

                      {/* Student Limit */}
                      <div className="rounded-xl p-2.5" style={{ background: "rgba(47,102,144,0.04)", border: "1px solid rgba(47,102,144,0.15)" }}>
                        <div className="text-[9px] font-bold text-muted-foreground mb-1 flex items-center gap-1">
                          <Users size={9} /> {t("schoolsStudentLimitLabel")}
                        </div>
                        {isEditing ? (
                          <input type="number" min="0" value={editing[s.id]?.limit ?? s.student_limit}
                            onChange={(e) => setEditing((p) => ({ ...p, [s.id]: { ...(p[s.id] || {}), limit: e.target.value } }))}
                            dir="ltr" autoFocus
                            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); saveLimit(s); } }}
                            onBlur={() => saveLimit(s)}
                            className="w-full text-xs font-mono bg-transparent focus:outline-none" />
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-mono font-bold" style={{ color: "#2F6690" }}>
                              {s.current_student_count || 0} / {s.student_limit || "—"}
                            </span>
                            <button onClick={() => setEditing((p) => ({ ...p, [s.id]: { ...(p[s.id] || {}), code: s.code, limit: s.student_limit } }))}
                              className="opacity-50 hover:opacity-100" title={t("schoolsEditLimitHint")}>
                              <Pencil size={10} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Row 3: Plan + Date + Actions */}
                    <div className="flex items-center justify-between gap-2 flex-wrap pt-2" style={{ borderTop: "1px solid hsl(var(--border))" }}>
                      <div className="flex items-center gap-2 flex-wrap text-[10px]">
                        <span className="px-2 py-0.5 rounded-full font-bold"
                          style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.3)", color: "#a78bfa" }}>
                          {planLabel(s.subscription_plan)}
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
    </div>);
}

function FullSpinner() {
  return (
    <div className="py-24 flex justify-center">
      <Loader2 size={28} className="animate-spin" style={{ color: "hsl(var(--primary))" }} />
    </div>);
}

function generateAdminCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "ADM-";
  for (let i = 0; i < 5; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}