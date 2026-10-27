import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  Plus, Trash2, Check, X, Loader2, RefreshCw, UserPlus, KeyRound, Ban,
  FileSpreadsheet, AlertCircle, GraduationCap, Edit2, ArrowRight, ArrowLeft,
} from "lucide-react";
import CreateClassModal from "./CreateClassModal";
import ClassesOverview from "./ClassesOverview";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { UNCLAIMED } from "@/lib/registrationUtils";
import { t, useLang, useDir, getLang } from "@/lib/i18n";
import { useDialogs } from "@/components/DialogProvider";
import { studentsFromCsv } from "@/lib/csvStudents";
import {
  adminFilter, adminCreate, adminUpdate, adminDelete, adminBulkCreate,
  isSchoolAdminSession,
} from "@/lib/adminData";

const STATUS_KEYS = {
  pending: "smStatusPending",
  approved: "smStatusApproved",
  rejected: "smStatusRejected",
  disabled: "smStatusDisabled",
};

const STATUS_UI = {
  pending: { cls: "bg-warning/10 text-warning border-warning/35" },
  approved: { cls: "bg-success/10 text-success border-success/35" },
  rejected: { cls: "bg-destructive/10 text-destructive border-destructive/35" },
  disabled: { cls: "bg-muted text-muted-foreground border-border" },
};

export default function StudentsManager({ school, onBack }) {
  const { confirmDialog } = useDialogs();
  const { user } = useAuth();
  useLang();
  const direction = useDir();
  const BackArrow = direction === "rtl" ? ArrowRight : ArrowLeft;

  const [students, setStudents] = useState(null);
  const [schoolClasses, setSchoolClasses] = useState(school?.classes || []);
  const [activeClass, setActiveClass] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showCreateClassModal, setShowCreateClassModal] = useState(false);
  const [classNotice, setClassNotice] = useState(null);
  const [form, setForm] = useState({ name: "", code: "", email: "", class_name: "" });
  const [formError, setFormError] = useState(null);
  const [editingStudentId, setEditingStudentId] = useState(null);
  const [editingClassValue, setEditingClassValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importMsg, setImportMsg] = useState(null);
  const fileRef = useRef(null);

  const load = () => {
    adminFilter("StudentProfile", { school_id: school.id }, "-created_date", 500)
      .then((rows) => setStudents(rows || []))
      .catch(() => setStudents([]));
    if (school?.id) {
      adminFilter("School", { id: school.id }, "-created_date", 1)
        .then((rows) => {
          if (rows?.[0]?.classes && Array.isArray(rows[0].classes)) {
            setSchoolClasses(rows[0].classes);
          }
        })
        .catch(() => {});
    }
  };

  useEffect(() => {
    if (school?.id) load();
    if (school?.classes && Array.isArray(school.classes)) {
      setSchoolClasses(school.classes);
    }
  }, [school?.id, school?.classes]);

  const limit = Number(school.student_limit) || 0;
  const currentCount = (students || []).length;
  const isLimitReached = limit > 0 && currentCount >= limit;

  const availableClasses = Array.from(
    new Set([
      ...(schoolClasses || []),
      ...(students || []).map((s) => s.class_name?.trim()).filter(Boolean),
    ])
  ).sort();

  const handleCreateClass = async (newClassName, andAddStudent = false) => {
    const trimmed = String(newClassName || "").trim();
    if (!trimmed) return;
    const updated = Array.from(new Set([...(schoolClasses || []), trimmed])).sort();
    setSchoolClasses(updated);
    try {
      await adminUpdate("School", school.id, { classes: updated });
    } catch {}
    setActiveClass(trimmed);
    if (andAddStudent) {
      setFormError(null);
      setClassNotice(t("smClassCreatedBanner").replace("{class}", trimmed));
      setForm({ name: "", code: "", email: "", class_name: trimmed });
      setShowForm(true);
    }
  };

  const handleDeleteClass = async (clsToDelete) => {
    const countInClass = (students || []).filter((s) => s.class_name?.trim() === clsToDelete).length;
    const msg = `${t("smDeleteClassConfirm")} (${clsToDelete})` + (countInClass > 0 ? `\n• يحتوي على ${countInClass} طالب` : "");
    if (!(await confirmDialog(msg))) return;
    const updated = (schoolClasses || []).filter((c) => c !== clsToDelete);
    setSchoolClasses(updated);
    try {
      await adminUpdate("School", school.id, { classes: updated });
    } catch {}
    if (activeClass === clsToDelete) {
      setActiveClass(null);
    }
  };

  const openAddStudentForClass = (clsName) => {
    if (isLimitReached) {
      setFormError(t("smLimitReachedWarning").replace("{limit}", limit));
    } else {
      setFormError(null);
    }
    setClassNotice(null);
    setForm({ name: "", code: "", email: "", class_name: clsName === "__none__" ? "" : (clsName || "") });
    setShowForm(true);
  };

  const addStudent = async (e) => {
    e.preventDefault();
    const code = form.code.trim();
    if (!form.name.trim() || !code) { setFormError(t("smErrNameCode")); return; }
    if (isLimitReached) {
      setFormError(t("smLimitReachedWarning").replace("{limit}", limit));
      return;
    }
    if ((students || []).some((s) => String(s.student_code || "").trim().toLowerCase() === code.toLowerCase())) {
      setFormError(t("smErrDupCode"));
      return;
    }
    setBusy(true);
    setFormError(null);
    try {
      const targetClass = form.class_name.trim() || (activeClass && activeClass !== "__none__" ? activeClass : null);
      const created = await adminCreate("StudentProfile", {
        school_id: school.id,
        student_code: code,
        full_name: form.name.trim(),
        class_name: targetClass,
        email: form.email.trim() || null,
        status: "approved",
        user_id: UNCLAIMED,
      });
      setStudents(prev => [...(prev || []), created]);
      if (!isSchoolAdminSession()) {
        base44.entities.School.update(school.id, { current_student_count: (students || []).length + 1 }).catch(() => {});
      }
      setForm({ name: "", code: "", email: "", class_name: activeClass && activeClass !== "__none__" ? activeClass : "" });
      setClassNotice(null);
      setShowForm(false);
    } catch (err) {
      const errCode = err?.data?.error || err?.response?.data?.error;
      if (errCode === "STUDENT_LIMIT_REACHED") {
        setFormError(t("smLimitReachedWarning").replace("{limit}", limit));
      } else if (errCode === "DUPLICATE_CODE") {
        setFormError(t("smErrDupCode"));
      } else {
        setFormError(err?.message || errCode || t("smErrCreate"));
      }
    } finally {
      setBusy(false);
    }
  };

  const updateStudentClass = async (studentId, newClass) => {
    const trimmed = String(newClass || "").trim() || null;
    const prev = students;
    setStudents(prev => (prev || []).map(st => st.id === studentId ? { ...st, class_name: trimmed } : st));
    setEditingStudentId(null);
    try {
      await adminUpdate("StudentProfile", studentId, { class_name: trimmed });
    } catch {
      setStudents(prev);
    }
  };

  const setStatus = async (s, status) => {
    const prev = students;
    const now = new Date().toISOString();
    const approver = user?.email || school?.admin_name || school?.name || "School Admin";
    setStudents(prev => (prev || []).map(st => st.id === s.id ? { ...st, status, approved_by: approver, approved_at: now } : st));
    try {
      await adminUpdate("StudentProfile", s.id, { status, approved_by: approver, approved_at: now });
    } catch {
      setStudents(prev);
    }
  };

  const importExcel = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setImporting(true);
    setImportMsg(null);
    try {
      let imported;
      const isTextFile = /\.(csv|txt|tsv)$/i.test(file.name || "") || /^text\//.test(file.type || "");
      if (isTextFile) {
        imported = studentsFromCsv(await file.text());
      } else {
        const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
        const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({ file_uri, expires_in: 300 });
        const result = await base44.integrations.Core.ExtractDataFromUploadedFile({
          file_url: signed_url,
          json_schema: {
            type: "object",
            properties: {
              students: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    full_name: { type: "string" },
                    student_code: { type: "string" },
                    email: { type: "string" },
                    class_name: { type: "string" },
                  },
                  required: ["full_name", "student_code"],
                },
              },
            },
            required: ["students"],
          },
        });
        imported = result?.output?.students || [];
      }
      if (!imported.length) {
        setImportMsg({ type: "error", text: t("smImportNoData") });
        setImporting(false);
        return;
      }

      // إضافة أي صفوف جديدة موجودة في الملف لقائمة صفوف المدرسة تلقائياً
      const newClassesFound = [];
      for (const s of imported) {
        const cName = String(s.class_name || "").trim();
        if (cName && !schoolClasses.includes(cName) && !newClassesFound.includes(cName)) {
          newClassesFound.push(cName);
        }
      }
      if (newClassesFound.length > 0) {
        const mergedClasses = Array.from(new Set([...(schoolClasses || []), ...newClassesFound])).sort();
        setSchoolClasses(mergedClasses);
        try {
          await adminUpdate("School", school.id, { classes: mergedClasses });
        } catch {}
      }

      const existing = await adminFilter("StudentProfile", { school_id: school.id }, "-created_date", 10000);
      const existingCodes = new Set((existing || []).map((s) => String(s.student_code || "").trim().toLowerCase()));
      const limitN = school.student_limit || 0;
      const toCreate = [];
      for (const s of imported) {
        const code = String(s.student_code || "").trim();
        const name = String(s.full_name || "").trim();
        if (!code || !name) continue;
        if (existingCodes.has(code.toLowerCase())) continue;
        if (limitN > 0 && (existing || []).length + toCreate.length >= limitN) break;
        existingCodes.add(code.toLowerCase());
        const rowClass = String(s.class_name || "").trim() || (activeClass && activeClass !== "__none__" ? activeClass : null);
        toCreate.push({
          school_id: school.id,
          student_code: code,
          full_name: name,
          class_name: rowClass,
          email: String(s.email || "").trim() || null,
          status: "approved",
          user_id: UNCLAIMED,
        });
      }
      if (!toCreate.length) {
        setImportMsg({ type: "error", text: t("smImportAllDup") });
        setImporting(false);
        return;
      }
      await adminBulkCreate("StudentProfile", toCreate);
      if (!isSchoolAdminSession()) {
        base44.entities.School.update(school.id, {
          current_student_count: (existing || []).length + toCreate.length,
        }).catch(() => {});
      }
      const successText = `${t("smImportSuccess", getLang()).replace("{count}", toCreate.length)}${
        newClassesFound.length > 0 ? ` (تمت إضافة ${newClassesFound.length} صفوف جديدة تلقائياً)` : ""
      }`;
      setImportMsg({ type: "success", text: successText });
      load();
    } catch {
      setImportMsg({ type: "error", text: `${t("smImportError")} ${t("smImportTryCsv")}` });
    } finally {
      setImporting(false);
    }
  };

  const deleteStudent = async (s) => {
    if (!(await confirmDialog(`${t("smDeleteConfirm")}: "${s.full_name}" (${s.student_code})?`))) return;
    const prev = students;
    setStudents(prev => (prev || []).filter(st => st.id !== s.id));
    try {
      await adminDelete("StudentProfile", s.id);
      if (!isSchoolAdminSession()) {
        adminFilter("StudentProfile", { school_id: school.id }, "-created_date", 500)
          .then((rows) => base44.entities.School.update(school.id, { current_student_count: (rows || []).length }).catch(() => {}))
          .catch(() => {});
      }
    } catch {
      setStudents(prev);
    }
  };

  if (!school) return <FullSpinnerLocal />;

  const claimed = (students || []).filter((s) => s.user_id && s.user_id !== UNCLAIMED);
  const pendingCount = claimed.filter((s) => s.status === "pending").length;

  const classStudents = activeClass === null ? [] : (students || []).filter((s) => {
    if (activeClass === "__none__") return !s.class_name?.trim();
    return s.class_name?.trim() === activeClass;
  });

  return (
    <div dir={direction} className="font-main text-foreground">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap mb-5">
        <div className="flex items-center gap-3 min-w-0">
          {activeClass ? (
            <button
              onClick={() => {
                setActiveClass(null);
                setShowForm(false);
                setClassNotice(null);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-xs font-bold bg-accent border border-border text-brand hover:bg-muted"
            >
              <BackArrow size={14} />
              <span>{t("backToClasses")}</span>
            </button>
          ) : onBack ? (
            <button
              onClick={onBack}
              className="px-3 py-1.5 rounded-[10px] text-xs font-bold border border-border text-brand hover:bg-accent"
            >
              {t("smBack")}
            </button>
          ) : null}

          <div className="min-w-0">
            <h2 className="font-black text-base truncate">
              {activeClass
                ? `${t("smClassLabel")}: ${activeClass === "__none__" ? t("smNoClass") : activeClass}`
                : `${t("classesTitle")} — ${school.name}`}
            </h2>
            <div className="flex items-center gap-2 flex-wrap text-[11px] text-muted-foreground mt-0.5">
              <span className={`px-2 py-0.5 rounded-[6px] font-bold border ${isLimitReached ? "bg-destructive/10 text-destructive border-destructive/35" : "bg-accent text-brand border-border"}`}>
                {currentCount}{limit > 0 ? ` / ${limit}` : ""} {t("smStudentWord")}
              </span>
              <span>• {availableClasses.length} {t("smClassesCount")}</span>
              <span>• {t("smSchoolCodeLabel")}: <strong className="font-mono text-foreground">{school.code}</strong></span>
              {pendingCount > 0 && <span>• {pendingCount} {t("smPendingApproval")}</span>}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={load}
            className="p-2 rounded-[10px] border border-border text-brand hover:bg-accent"
            title={t("refresh")}
          >
            <RefreshCw size={13} />
          </button>
          <button
            onClick={() => setShowCreateClassModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-[10px] text-xs font-bold bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-all shadow-sm"
          >
            <GraduationCap size={14} /> {t("smCreateClass")}
          </button>
          {activeClass && (
            <button
              onClick={() => {
                setClassNotice(null);
                if (isLimitReached) {
                  setFormError(t("smLimitReachedWarning").replace("{limit}", limit));
                  setShowForm(true);
                } else {
                  openAddStudentForClass(activeClass);
                }
              }}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-[10px] text-xs font-bold ${
                isLimitReached
                  ? "bg-muted text-muted-foreground border border-border hover:bg-accent"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
              }`}
            >
              <UserPlus size={13} /> {t("smAddStudent")}
            </button>
          )}
          <button
            onClick={() => fileRef.current?.click()}
            disabled={importing || isLimitReached}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-[10px] text-xs font-bold border border-secondary text-secondary hover:bg-secondary/10 disabled:opacity-60"
          >
            {importing ? <Loader2 size={13} className="animate-spin" /> : <FileSpreadsheet size={13} />}
            {importing ? t("smImporting") : t("smImportExcel")}
          </button>
          <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" onChange={importExcel} className="hidden" />
        </div>
      </div>

      {/* تنبيه بلوغ حد الخطة */}
      {isLimitReached && (
        <div className="mb-4 flex items-center gap-2.5 px-4 py-3 rounded-[12px] text-xs font-bold bg-destructive/10 border border-destructive/35 text-destructive">
          <AlertCircle size={16} className="flex-shrink-0" />
          <span>{t("smLimitReachedWarning").replace("{limit}", limit)}</span>
        </div>
      )}

      {importMsg && (
        <div className={`mb-4 flex items-center gap-2 px-4 py-3 rounded-[10px] text-xs font-bold border ${
          importMsg.type === "success"
            ? "bg-success/10 border-success/35 text-success"
            : "bg-destructive/10 border-destructive/35 text-destructive"
        }`}>
          {importMsg.type === "success" ? <Check size={13} /> : <AlertCircle size={13} />} {importMsg.text}
        </div>
      )}

      {/* المشهد الأول: عرض الصفوف — الطلاب غير مرئيين إلا بعد النقر على صف */}
      {students === null ? (
        <FullSpinnerLocal />
      ) : activeClass === null ? (
        <ClassesOverview
          schoolClasses={availableClasses}
          students={students}
          onSelectClass={(cls) => {
            setActiveClass(cls);
            setShowForm(false);
          }}
          onCreateClassClick={() => setShowCreateClassModal(true)}
          onAddStudentToClass={(cls) => {
            setActiveClass(cls);
            openAddStudentForClass(cls);
          }}
          onDeleteClass={handleDeleteClass}
        />
      ) : (
        /* المشهد الثاني: داخل الصف المحدد — هنا فقط يظهر الطلاب */
        <div className="space-y-4">
          <div className="p-3.5 rounded-[14px] bg-secondary/10 border border-secondary/25 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[10px] flex items-center justify-center bg-secondary/20 text-secondary flex-shrink-0">
                <GraduationCap size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-foreground">
                    {activeClass === "__none__" ? t("smNoClass") : activeClass}
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-secondary/20 text-secondary">
                    {classStudents.length} {t("smStudentWord")}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  قائمة الطلاب المسجلين في هذا الصف حصراً.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => openAddStudentForClass(activeClass)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
              >
                <UserPlus size={12} /> {t("smAddStudentToThisClass")}
              </button>
              {activeClass !== "__none__" && (
                <button
                  onClick={() => handleDeleteClass(activeClass)}
                  className="p-1.5 rounded-[8px] border border-border text-muted-foreground hover:text-destructive hover:border-destructive/35 hover:bg-destructive/10 transition-colors"
                  title={t("smDeleteClass")}
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          </div>

          {/* نموذج إضافة طالب لهذا الصف */}
          {showForm && (
            <motion.form
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={addStudent}
              className="rounded-[16px] p-4 grid sm:grid-cols-4 gap-3 items-end bg-card border border-border"
            >
              {classNotice && (
                <div className="sm:col-span-4 flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-[10px] bg-secondary/15 border border-secondary/35 text-secondary text-xs font-bold">
                  <div className="flex items-center gap-2 min-w-0">
                    <GraduationCap size={16} className="flex-shrink-0" />
                    <span className="truncate">{classNotice}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setClassNotice(null)}
                    className="p-1 text-muted-foreground hover:text-foreground flex-shrink-0"
                  >
                    <X size={13} />
                  </button>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-muted-foreground mb-1">{t("smStudentName")} *</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  dir={direction}
                  className="w-full px-3 py-2 rounded-[10px] text-xs bg-background border border-input focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-muted-foreground mb-1">{t("smStudentCode")} *</label>
                <input
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  placeholder="ST10025"
                  dir="ltr"
                  className="w-full px-3 py-2 rounded-[10px] text-xs font-mono bg-background border border-input focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-muted-foreground mb-1">{t("smEmailOptional")}</label>
                <input
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  dir="ltr"
                  className="w-full px-3 py-2 rounded-[10px] text-xs bg-background border border-input focus:outline-none"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={busy || isLimitReached}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-[10px] text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
                >
                  {busy ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />} {t("smSave")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setClassNotice(null);
                  }}
                  className="px-3 py-2 rounded-[10px] text-xs border border-border text-muted-foreground hover:text-foreground"
                >
                  <X size={12} />
                </button>
              </div>
              {formError && (
                <div className="sm:col-span-4 text-[11px] font-bold px-3 py-2 rounded-[10px] bg-destructive/10 border border-destructive/30 text-destructive">
                  {formError}
                </div>
              )}
            </motion.form>
          )}

          {/* قائمة طلاب هذا الصف فقط */}
          {classStudents.length === 0 ? (
            <div className="rounded-[16px] p-10 text-center bg-card border border-border">
              <GraduationCap size={36} className="mx-auto mb-2 opacity-40 text-secondary" />
              <h3 className="text-sm font-bold text-foreground mb-1">
                {t("smEmptyClassPrompt").replace("{class}", activeClass === "__none__" ? t("smNoClass") : activeClass)}
              </h3>
              <p className="text-xs text-muted-foreground mb-4 max-w-sm mx-auto">
                يمكنك إضافة الطلاب لهذا الصف مباشرة أو استيراد ملف Excel لتعبئة الصف تلقائياً.
              </p>
              <button
                onClick={() => openAddStudentForClass(activeClass)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[10px] text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-sm"
              >
                <UserPlus size={13} /> {t("smAddFirstStudent")}
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {classStudents.map((s, i) => {
                const isClaimed = s.user_id && s.user_id !== UNCLAIMED;
                const stKey = STATUS_KEYS[s.status] || "smStatusPending";
                const st = STATUS_UI[s.status] || STATUS_UI.pending;
                const isEditingThisClass = editingStudentId === s.id;

                return (
                  <motion.div
                    key={s.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className="rounded-[12px] p-3.5 bg-card border border-border flex flex-col sm:flex-row sm:items-center gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold truncate">{s.full_name || t("smNoName")}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-[6px] bg-accent border border-border text-brand">
                          {s.student_code}
                        </span>

                        {/* تعديل الصف للسطر */}
                        {isEditingThisClass ? (
                          <div className="inline-flex items-center gap-1">
                            <input
                              list="classes-datalist"
                              value={editingClassValue}
                              onChange={(e) => setEditingClassValue(e.target.value)}
                              placeholder={t("smStudentClassPh")}
                              className="px-2 py-0.5 rounded-[6px] text-xs bg-background border border-input focus:outline-none w-32"
                              autoFocus
                            />
                            <datalist id="classes-datalist">
                              {availableClasses.map((c) => (
                                <option key={c} value={c} />
                              ))}
                            </datalist>
                            <button
                              onClick={() => updateStudentClass(s.id, editingClassValue)}
                              className="p-1 rounded-[5px] bg-success text-success-foreground hover:bg-success/90"
                              title={t("save")}
                            >
                              <Check size={11} />
                            </button>
                            <button
                              onClick={() => setEditingStudentId(null)}
                              className="p-1 rounded-[5px] bg-muted text-muted-foreground hover:text-foreground"
                              title={t("cancelBtn")}
                            >
                              <X size={11} />
                            </button>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1">
                            {s.class_name ? (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-[6px] bg-secondary/15 text-secondary border border-secondary/30 flex items-center gap-1">
                                <GraduationCap size={11} />
                                {s.class_name}
                              </span>
                            ) : (
                              <span className="text-[10px] text-muted-foreground/60 italic px-1.5 py-0.5">
                                {t("smNoClass")}
                              </span>
                            )}
                            <button
                              onClick={() => {
                                setEditingStudentId(s.id);
                                setEditingClassValue(s.class_name || "");
                              }}
                              className="p-1 rounded-[5px] text-muted-foreground hover:text-brand hover:bg-accent transition-colors"
                              title={t("smStudentClass")}
                            >
                              <Edit2 size={11} />
                            </button>
                          </div>
                        )}

                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${st.cls}`}>
                          {s.status === "approved" ? t("smStatusApproved") : isClaimed ? t(stKey) : t("smCodeNotActivated")}
                        </span>
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-0.5 truncate">
                        {s.email || t("smNoEmail")} {isClaimed ? `• ${t("smAccountLinked")}` : `• ${t("smAwaitingActivation")}`}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {isClaimed && s.status === "pending" && (
                        <button
                          onClick={() => setStatus(s, "approved")}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-[8px] text-[11px] font-bold bg-success text-success-foreground"
                        >
                          <Check size={11} /> {t("smApprove")}
                        </button>
                      )}
                      {isClaimed && s.status === "approved" && (
                        <button
                          onClick={() => setStatus(s, "disabled")}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-[8px] text-[11px] font-bold border border-border text-muted-foreground hover:text-foreground"
                        >
                          <Ban size={11} /> {t("smDisable")}
                        </button>
                      )}
                      {isClaimed && (s.status === "rejected" || s.status === "disabled") && (
                        <button
                          onClick={() => setStatus(s, "approved")}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-[8px] text-[11px] font-bold border border-success/35 text-success hover:bg-success/10"
                        >
                          <Check size={11} /> {t("smReactivate")}
                        </button>
                      )}
                      {isClaimed && s.status === "pending" && (
                        <button
                          onClick={() => setStatus(s, "rejected")}
                          className="px-3 py-1.5 rounded-[8px] text-[11px] font-bold bg-destructive/10 border border-destructive/30 text-destructive hover:bg-destructive/20"
                        >
                          {t("smReject")}
                        </button>
                      )}
                      <button
                        onClick={() => deleteStudent(s)}
                        className="p-1.5 rounded-[8px] bg-destructive/10 border border-destructive/20 text-destructive hover:bg-destructive/20"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Create Class Modal */}
      <CreateClassModal
        isOpen={showCreateClassModal}
        onClose={() => setShowCreateClassModal(false)}
        existingClasses={availableClasses}
        onSubmit={handleCreateClass}
      />
    </div>
  );
}

function FullSpinnerLocal() {
  return (
    <div className="py-20 flex justify-center">
      <Loader2 size={26} className="animate-spin text-brand" />
    </div>
  );
}