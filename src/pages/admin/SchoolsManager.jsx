import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  School as SchoolIcon, Plus, Trash2, Check, X, Loader2,
  RefreshCw, AlertTriangle, Users, Pencil,
  ShieldCheck, GraduationCap, Ban,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import StudentsManager from "../../components/admin/StudentsManager";
import TeachersList from "../../components/admin/TeachersList";
import { PLANS } from "@/lib/plans";
import { t, useLang, useDir } from "@/lib/i18n";
import { randomCode } from "@/lib/plans";

/**
 * لوحة تحكم مالك المنصة (Super Admin) — إدارة المدارس والاشتراكات.
 */
export default function SchoolsManager() {
  const { user, isLoadingAuth } = useAuth();
  useLang();
  const direction = useDir();
  const [schools, setSchools] = useState(null);
  const [counts, setCounts] = useState({});
  const [personalCodes, setPersonalCodes] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", code: "", adminName: "", studentLimit: "50" });
  const [formError, setFormError] = useState(null);
  const [rowError, setRowError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [view, setView] = useState("list");
  const [edit, setEdit] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteText, setDeleteText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const isSuperAdmin = user?.role === "admin";

  const load = () => {
    base44.entities.School.list("-created_date", 200).then(async (rows) => {
      setSchools(rows || []);
      const schoolIds = (rows || []).map((s) => s.id);
      const [allStudents, allTeachers] = await Promise.all([
        base44.entities.StudentProfile.list("-created_date", 10000).catch(() => []),
        base44.entities.Teacher.list("-created_date", 10000).catch(() => []),
      ]);
      const newCounts = {};
      const newPersonalCodes = {};
      for (const id of schoolIds) {
        newCounts[id] = {
          students: (allStudents || []).filter((st) => st.school_id === id).length,
          teachers: (allTeachers || []).filter((tc) => tc.school_id === id).length,
        };
      }
      for (const s of (rows || [])) {
        if (PLANS[s.subscription_plan]?.personal) {
          const student = (allStudents || []).find((st) => st.school_id === s.id);
          if (student) {
            newPersonalCodes[s.id] = { studentId: student.id, code: student.student_code };
          }
        }
      }
      setCounts(newCounts);
      setPersonalCodes(newPersonalCodes);
    });
  };

  useEffect(() => {
    if (!isLoadingAuth && isSuperAdmin) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoadingAuth, isSuperAdmin]);

  const addSchool = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.code.trim()) { setFormError(t("schoolsErrNameCode")); return; }
    const code = form.code.trim();
    if ((schools || []).some((s) => s.code.toLowerCase() === code.toLowerCase())) {
      setFormError(t("schoolsErrDupCode"));
      return;
    }
    setBusy(true);
    setFormError(null);
    try {
      const adminCode = generateAdminCode();
      const studentLimit = Math.max(1, parseInt(form.studentLimit, 10) || 50);
      const created = await base44.entities.School.create({
        name: form.name.trim(),
        code,
        admin_code: adminCode,
        admin_name: form.adminName.trim() || form.name.trim(),
        is_active: true,
        created_by_id: user.id,
        subscription_plan: "school_50",
        student_limit: studentLimit,
        current_student_count: 0,
        subscription_status: "active",
      });
      setSchools((prev) => [created, ...(prev || [])]);
      setForm({ name: "", code: "", adminName: "", studentLimit: "50" });
      setShowForm(false);
    } catch (err) {
      setFormError(err?.message || "Error");
    } finally {
      setBusy(false);
    }
  };

  const toggleActive = async (s) => {
    const next = !s.is_active;
    const prev = schools;
    setSchools((prev || []).map((x) => (x.id === s.id ? { ...x, is_active: next } : x)));
    try {
      await base44.entities.School.update(s.id, { is_active: next });
    } catch {
      setSchools(prev);
    }
  };

  const startEdit = (s, field) => {
    setRowError(null);
    if (field === "studentCode") {
      setEdit({ id: s.id, field, value: personalCodes[s.id]?.code || "" });
    } else if (field === "code") {
      setEdit({ id: s.id, field, value: s.code || "" });
    } else if (field === "adminCode") {
      setEdit({ id: s.id, field, value: s.admin_code || "" });
    } else if (field === "limit") {
      setEdit({ id: s.id, field, value: String(s.student_limit ?? 50) });
    }
  };

  const cancelEdit = () => { setEdit(null); setRowError(null); };

  const commitEdit = async (s) => {
    if (!edit) return;
    const val = String(edit.value || "").trim();
    if (edit.field === "studentCode") {
      const studentInfo = personalCodes[s.id];
      if (!val || !studentInfo?.studentId) { cancelEdit(); return; }
      if (val === studentInfo.code) { cancelEdit(); return; }
      const allStudents = await base44.entities.StudentProfile.list("-created_date", 10000).catch(() => []);
      const dup = (allStudents || []).some(
        (st) => st.id !== studentInfo.studentId && String(st.student_code || "").toLowerCase() === val.toLowerCase()
      );
      if (dup) {
        setRowError({ id: s.id, msg: t("smErrDupCode") });
        return;
      }
      try {
        await base44.entities.StudentProfile.update(studentInfo.studentId, { student_code: val });
        setPersonalCodes((prev) => ({ ...prev, [s.id]: { ...studentInfo, code: val } }));
        cancelEdit();
      } catch (err) {
        setRowError({ id: s.id, msg: err?.message || t("errUnexpected") });
      }
      return;
    }

    if (edit.field === "code") {
      if (!val) { cancelEdit(); return; }
      if (val === s.code) { cancelEdit(); return; }
      const dup = (schools || []).some((x) => x.id !== s.id && x.code.toLowerCase() === val.toLowerCase());
      if (dup) { setRowError({ id: s.id, msg: t("schoolsErrDupCode") }); return; }
      const prev = schools;
      setSchools((prev || []).map((x) => (x.id === s.id ? { ...x, code: val } : x)));
      cancelEdit();
      try {
        await base44.entities.School.update(s.id, { code: val });
      } catch (err) {
        setSchools(prev);
        setRowError({ id: s.id, msg: err?.message || "Error" });
      }
      return;
    }

    if (edit.field === "adminCode") {
      if (!val) { cancelEdit(); return; }
      if (val === s.admin_code) { cancelEdit(); return; }
      const dup = (schools || []).some((x) => x.id !== s.id && String(x.admin_code || "").toLowerCase() === val.toLowerCase());
      if (dup) { setRowError({ id: s.id, msg: t("schoolsErrAdminDup") }); return; }
      const prev = schools;
      setSchools((prev || []).map((x) => (x.id === s.id ? { ...x, admin_code: val } : x)));
      cancelEdit();
      try {
        await base44.entities.School.update(s.id, { admin_code: val });
      } catch (err) {
        setSchools(prev);
        setRowError({ id: s.id, msg: err?.message || "Error" });
      }
      return;
    }

    if (edit.field === "limit") {
      const parsed = parseInt(val, 10);
      if (Number.isNaN(parsed) || parsed < 0) {
        setRowError({ id: s.id, msg: t("schoolsErrLimitInvalid") });
        return;
      }
      const actualStudents = counts[s.id]?.students ?? s.current_student_count ?? 0;
      if (parsed > 0 && parsed < actualStudents) {
        setRowError({ id: s.id, msg: t("schoolsErrLimitBelowCount").replace("{count}", actualStudents) });
        return;
      }
      const prev = schools;
      setSchools((prev || []).map((x) => (x.id === s.id ? { ...x, student_limit: parsed } : x)));
      cancelEdit();
      try {
        await base44.entities.School.update(s.id, { student_limit: parsed });
      } catch (err) {
        setSchools(prev);
        setRowError({ id: s.id, msg: err?.message || "Error" });
      }
    }
  };

  const planLabel = (p) => PLANS[p]?.label || p || "school_50";

  const deleteSchool = (s) => {
    setDeleteError(null);
    setDeleteText("");
    setDeleteTarget(s);
  };

  const confirmDeleteSchool = async () => {
    if (!deleteTarget) return;
    if (deleteText.trim() !== deleteTarget.name) {
      setDeleteError(t("schoolsDeleteTypeName"));
      return;
    }
    setDeleting(true);
    setDeleteError(null);
    try {
      const res = await base44.functions.invoke("deleteSchool", { school_id: deleteTarget.id });
      if (res?.data?.deleted !== true) {
        throw new Error(res?.data?.error || t("schoolsDeleteFailed"));
      }
    } catch {
      try {
        const sid = deleteTarget.id;
        const [students, teachers, exams, results, reqs, histories] = await Promise.all([
          base44.entities.StudentProfile.filter({ school_id: sid }, "-created_date", 10000).catch(() => []),
          base44.entities.Teacher.filter({ school_id: sid }, "-created_date", 10000).catch(() => []),
          base44.entities.Exam.filter({ school_id: sid }, "-created_date", 10000).catch(() => []),
          base44.entities.ExamResult.filter({ school_id: sid }, "-created_date", 10000).catch(() => []),
          base44.entities.ExamAccessRequest.filter({ school_id: sid }, "-created_date", 10000).catch(() => []),
          base44.entities.LabHistory.filter({ school_id: sid }, "-created_date", 10000).catch(() => []),
        ]);
        const delAll = async (entity, items) => {
          for (const item of items) {
            await base44.entities[entity].delete(item.id).catch(() => {});
          }
        };
        await Promise.all([
          delAll("StudentProfile", students),
          delAll("Teacher", teachers),
          delAll("Exam", exams),
          delAll("ExamResult", results),
          delAll("ExamAccessRequest", reqs),
          delAll("LabHistory", histories),
        ]);
        await base44.entities.School.delete(sid);
      } catch (fallbackErr) {
        setDeleteError(fallbackErr?.message || t("schoolsDeleteFailed"));
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
      <div className="min-h-screen flex items-center justify-center bg-background font-main" dir={direction}>
        <div className="text-center">
          <AlertTriangle size={36} className="text-destructive mx-auto mb-3" />
          <h2 className="font-black text-lg mb-2 text-foreground">{t("restrictedAccess")}</h2>
          <p className="text-xs text-muted-foreground mb-5">{t("restrictedOwnerOnly")}</p>
          <Link to="/" className="text-xs font-bold text-brand hover:underline">{t("backToHome")}</Link>
        </div>
      </div>
    );
  }

  // إدارة طلاب مدرسة محددة
  if (view === "students" && selectedSchool) {
    return (
      <div className="min-h-screen bg-background text-foreground font-main" dir={direction}>
        <div className="max-w-5xl mx-auto px-4 py-8">
          <StudentsManager school={selectedSchool} onBack={() => { setView("list"); setSelectedSchool(null); }} />
        </div>
      </div>
    );
  }

  // إدارة أساتذة مدرسة محددة
  if (view === "teachers" && selectedSchool) {
    return (
      <div className="min-h-screen bg-background text-foreground font-main" dir={direction}>
        <div className="max-w-5xl mx-auto px-4 py-8">
          <TeachersList school={selectedSchool} onBack={() => { setView("list"); setSelectedSchool(null); }} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-main" dir={direction}>
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 flex-wrap mb-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-[10px] flex items-center justify-center bg-primary text-primary-foreground">
              <SchoolIcon size={20} />
            </div>
            <div>
              <h1 className="font-black text-xl text-foreground">{t("schoolsTitle")}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={load}
              className="p-2 rounded-[10px] border border-border text-brand hover:bg-accent"
            >
              <RefreshCw size={14} />
            </button>
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-[10px] text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Plus size={14} /> {t("schoolsAddBtn")}
            </button>
          </div>
        </div>

        {/* Add School form */}
        {showForm && (
          <motion.form
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={addSchool}
            className="rounded-[16px] p-4 mb-5 grid sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end bg-card border border-border"
          >
            <div>
              <label className="block text-[10px] font-bold text-muted-foreground mb-1">{t("schoolsNameLabel")}</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                dir={direction}
                className="w-full px-3 py-2 rounded-[10px] text-xs bg-background border border-input focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-muted-foreground mb-1">{t("regAdminName")}</label>
              <input
                value={form.adminName}
                onChange={(e) => setForm({ ...form, adminName: e.target.value })}
                dir={direction}
                className="w-full px-3 py-2 rounded-[10px] text-xs bg-background border border-input focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-muted-foreground mb-1">{t("schoolsCodeLabel")}</label>
              <input
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                placeholder="SCH2026A"
                dir="ltr"
                className="w-full px-3 py-2 rounded-[10px] text-xs font-mono bg-background border border-input focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-muted-foreground mb-1">{t("schoolsStudentLimitLabel")}</label>
              <input
                type="number"
                min="1"
                value={form.studentLimit}
                onChange={(e) => setForm({ ...form, studentLimit: e.target.value })}
                dir="ltr"
                className="w-full px-3 py-2 rounded-[10px] text-xs font-mono bg-background border border-input focus:outline-none"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={busy}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-[10px] text-xs font-bold bg-success text-success-foreground hover:bg-success/90 disabled:opacity-60"
              >
                {busy ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />} {t("schoolsSaveBtn")}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-3 py-2 rounded-[10px] text-xs border border-border text-muted-foreground hover:text-foreground"
              >
                <X size={12} />
              </button>
            </div>
            {formError && (
              <div className="sm:col-span-5 text-[11px] font-bold px-3 py-2 rounded-[10px] bg-destructive/10 border border-destructive/35 text-destructive">
                {formError}
              </div>
            )}
          </motion.form>
        )}

        {/* Schools list */}
        {schools === null ? (
          <FullSpinner />
        ) : schools.length === 0 ? (
          <div className="rounded-[16px] p-10 text-center bg-card border border-border">
            <SchoolIcon size={40} className="mx-auto mb-3 opacity-40 text-brand" />
            <p className="text-xs text-muted-foreground">{t("schoolsEmpty")}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {schools.map((s, i) => {
              const isPersonal = !!PLANS[s.subscription_plan]?.personal;
              const displayCode = isPersonal ? (personalCodes[s.id]?.code || "—") : s.code;
              const codeLabel = isPersonal ? t("studentCodeLabel") : t("schoolsCodeLabel");
              const codeField = isPersonal ? "studentCode" : "code";
              return (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="rounded-[16px] p-4 bg-card border border-border"
                >
                  {/* Row 1: Name + Status + Delete */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-black text-sm text-foreground">{s.name}</span>
                      {/* حالة الحساب */}
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                        s.is_active
                          ? "bg-success/10 border-success/35 text-success"
                          : "bg-muted border-border text-muted-foreground"
                      }`}>
                        {t("schoolsAccountLabel")}: {s.is_active ? t("schoolsActive") : t("schoolsInactive")}
                      </span>
                      {/* حالة الاشتراك */}
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                        s.subscription_status === "active"
                          ? "bg-success/10 border-success/35 text-success"
                          : s.subscription_status === "expired"
                            ? "bg-destructive/10 border-destructive/35 text-destructive"
                            : "bg-warning/10 border-warning/35 text-warning"
                      }`}>
                        {t("schoolsSubscriptionLabel")}: {s.subscription_status === "active" ? t("subsActive") : s.subscription_status === "expired" ? t("subsExpired") : t("subsPending")}
                      </span>
                    </div>
                    <button
                      onClick={() => deleteSchool(s)}
                      className="p-1.5 rounded-[10px] flex-shrink-0 bg-destructive/10 border border-destructive/20 text-destructive hover:bg-destructive/20"
                      title={t("schoolsDeleteBtn")}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  {/* Row 2: الرمز + رمز المشرف + عدد الطلاب */}
                  <div className={`grid gap-2 mb-3 ${isPersonal ? "sm:grid-cols-2" : "sm:grid-cols-3"}`}>
                    {/* رمز المدرسة / رمز الطالب */}
                    <div className="rounded-[10px] p-2.5 bg-accent border border-border">
                      <div className="text-[9px] font-bold text-muted-foreground mb-1">{codeLabel}</div>
                      {edit?.id === s.id && edit.field === codeField ? (
                        <InlineEdit
                          value={edit.value}
                          dir="ltr"
                          mono
                          onChange={(v) => setEdit({ ...edit, value: v })}
                          onSave={() => commitEdit(s)}
                          onCancel={cancelEdit}
                        />
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-mono font-bold text-brand" dir="ltr">{displayCode}</span>
                          <button
                            onClick={() => startEdit(s, codeField)}
                            className="min-w-[32px] min-h-[32px] flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity"
                            title={t("schoolsEditCodeHint")}
                          >
                            <Pencil size={12} />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* رمز المشرف — للمدارس فقط */}
                    {!isPersonal && (
                      <div className="rounded-[10px] p-2.5 bg-accent border border-border">
                        <div className="text-[9px] font-bold text-muted-foreground mb-1 flex items-center gap-1">
                          <ShieldCheck size={9} /> {t("schoolsAdminCodeLabel")}
                        </div>
                        {edit?.id === s.id && edit.field === "adminCode" ? (
                          <InlineEdit
                            value={edit.value}
                            dir="ltr"
                            mono
                            onChange={(v) => setEdit({ ...edit, value: v })}
                            onSave={() => commitEdit(s)}
                            onCancel={cancelEdit}
                          />
                        ) : (
                          <>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-mono font-bold text-brand" dir="ltr">{s.admin_code || "—"}</span>
                              <button
                                onClick={() => startEdit(s, "adminCode")}
                                className="min-w-[32px] min-h-[32px] flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity"
                                title={t("schoolsEditAdminCodeHint")}
                              >
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

                    {/* عدد الطلاب */}
                    <div className="rounded-[10px] p-2.5 bg-accent border border-border">
                      <div className="text-[9px] font-bold text-muted-foreground mb-1 flex items-center gap-1">
                        <Users size={9} /> {t("schoolsStudentLimitLabel")}
                      </div>
                      {edit?.id === s.id && edit.field === "limit" ? (
                        <InlineEdit
                          value={edit.value}
                          dir="ltr"
                          mono
                          type="number"
                          onChange={(v) => setEdit({ ...edit, value: v })}
                          onSave={() => commitEdit(s)}
                          onCancel={cancelEdit}
                        />
                      ) : (
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-mono font-bold text-brand">
                            {counts[s.id]?.students ?? s.current_student_count ?? 0} / {s.student_limit || "∞"}
                          </span>
                          {!isPersonal && (
                            <button
                              onClick={() => startEdit(s, "limit")}
                              className="min-w-[32px] min-h-[32px] flex items-center justify-center opacity-70 hover:opacity-100"
                              title={t("schoolsEditLimitHint")}
                            >
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
                    <div className="mb-3 text-[11px] font-bold px-3 py-2 rounded-[10px] bg-destructive/10 border border-destructive/35 text-destructive">
                      {rowError.msg}
                    </div>
                  )}

                  {/* Row 3: Plan + Date + Actions */}
                  <div className="flex items-center justify-between gap-2 flex-wrap pt-2 border-t border-border">
                    <div className="flex items-center gap-2 flex-wrap text-[10px]">
                      <span className="px-2 py-0.5 rounded-full font-bold bg-accent border border-border text-brand">
                        {isPersonal ? planLabel(s.subscription_plan) : (s.student_limit > 0 ? t("schoolsUpToStudents").replace("{n}", s.student_limit) : t("schoolsUnlimited"))}
                      </span>
                      <span className="text-muted-foreground">{t("schoolsRegDate")}: {new Date(s.created_date).toLocaleDateString(direction === "rtl" ? "ar" : "en")}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => { setSelectedSchool(s); setView("students"); }}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-[10px] text-xs font-bold bg-accent border border-border text-brand hover:bg-muted"
                      >
                        <GraduationCap size={13} /> {t("schoolsStudentsBtn")}
                      </button>
                      <button
                        onClick={() => { setSelectedSchool(s); setView("teachers"); }}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-[10px] text-xs font-bold bg-accent border border-border text-brand hover:bg-muted"
                      >
                        <ShieldCheck size={13} /> {t("schoolsTeachersBtn")}
                      </button>
                      <button
                        onClick={() => toggleActive(s)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-[10px] text-xs font-bold border border-border text-muted-foreground hover:text-foreground"
                      >
                        {s.is_active ? <><Ban size={11} /> {t("schoolsDisable")}</> : <><Check size={11} /> {t("schoolsEnable")}</>}
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* نافذة تأكيد حذف مدرسة (تتطلب كتابة اسمها) */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-terminal/70" dir={direction}>
          <div className="w-full max-w-md rounded-[16px] p-5 bg-card text-card-foreground border border-border shadow-card">
            <div className="flex items-center gap-2 mb-3 text-destructive">
              <AlertTriangle size={18} />
              <h3 className="text-sm font-black">{t("schoolsDeleteTitle")}</h3>
            </div>
            <p className="text-xs leading-relaxed mb-3 text-foreground">
              <b>{deleteTarget.name}</b>
              <br />
              {t("schoolsDeleteWarn")
                .replace("{students}", counts[deleteTarget.id]?.students ?? 0)
                .replace("{teachers}", counts[deleteTarget.id]?.teachers ?? 0)}
            </p>
            <label className="block text-[11px] font-bold text-muted-foreground mb-1">{t("schoolsDeleteTypeName")}</label>
            <input
              value={deleteText}
              onChange={(e) => setDeleteText(e.target.value)}
              autoFocus
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              className="w-full px-3 py-2.5 rounded-[10px] text-sm bg-background border border-input focus:outline-none mb-3"
            />
            {deleteError && (
              <div className="mb-3 text-[11px] font-bold px-3 py-2 rounded-[10px] bg-destructive/10 border border-destructive/35 text-destructive">
                {deleteError}
              </div>
            )}
            <div className="flex gap-2">
              <button
                onClick={confirmDeleteSchool}
                disabled={deleting || deleteText.trim() !== deleteTarget.name}
                className="flex-1 min-h-[44px] flex items-center justify-center gap-2 rounded-[10px] text-xs font-black bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-40"
              >
                {deleting ? <><Loader2 size={13} className="animate-spin" /> {t("schoolsDeleting")}</> : <><Trash2 size={13} /> {t("schoolsDeleteAction")}</>}
              </button>
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="min-h-[44px] px-4 rounded-[10px] text-xs font-bold border border-border text-muted-foreground hover:text-foreground disabled:opacity-40"
              >
                {t("dialogCancel")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FullSpinner() {
  return (
    <div className="py-24 flex justify-center bg-background">
      <Loader2 size={28} className="animate-spin text-brand" />
    </div>
  );
}

function generateAdminCode() {
  return randomCode("ADM-", 6);
}

/** حقل تعديل سطري */
function InlineEdit({ value, onChange, onSave, onCancel, dir, mono, type = "text" }) {
  const [saving, setSaving] = useState(false);
  const save = async () => { setSaving(true); try { await onSave(); } finally { setSaving(false); } };
  return (
    <div className="flex items-center gap-1">
      <input
        type={type}
        min={type === "number" ? "0" : undefined}
        value={value}
        dir={dir}
        autoFocus
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") { e.preventDefault(); save(); }
          if (e.key === "Escape") { e.preventDefault(); onCancel(); }
        }}
        className={`min-w-0 flex-1 text-xs px-2 py-1.5 rounded-[6px] bg-background border border-input focus:outline-none ${mono ? "font-mono" : ""}`}
      />
      <button
        type="button"
        onClick={save}
        disabled={saving}
        className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-[6px] bg-success text-success-foreground hover:bg-success/90 disabled:opacity-60"
        aria-label="Save"
      >
        {saving ? <Loader2 size={12} className="animate-spin" /> : <Check size={14} />}
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-[6px] border border-border text-muted-foreground hover:text-foreground"
        aria-label="Cancel"
      >
        <X size={14} />
      </button>
    </div>
  );
}