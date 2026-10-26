import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  GraduationCap, Plus, Loader2, RefreshCw, Ban, Check, Trash2,
  Pencil, X, AlertCircle, KeyRound,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAdminAuth } from "@/lib/useAdminAuth";
import {
  adminFilter, adminCreate, adminUpdate, adminDelete, adminGet,
} from "@/lib/adminData";
import { t, useLang, useDir } from "@/lib/i18n";
import { useDialogs } from "@/components/DialogProvider";
import { randomCode } from "@/lib/plans";

/**
 * إدارة الأساتذة — School Admin
 * إضافة/تعديل/تعطيل/تفعيل/حذف الأساتذة تحت مدرسته.
 */
export default function TeachersManager() {
  const { confirmDialog, alertDialog } = useDialogs();
  const { isLoading, role, school_id } = useAdminAuth();
  useLang();
  const direction = useDir();
  const [teachers, setTeachers] = useState(null);
  const [teacherLimit, setTeacherLimit] = useState(0);
  const [schoolCode, setSchoolCode] = useState("");
  const [schoolClasses, setSchoolClasses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ full_name: "", teacher_code: "", assigned_classes: [] });
  const [formError, setFormError] = useState(null);
  const [busy, setBusy] = useState(false);

  const isSchoolAdmin = role === "school_admin" || role === "admin";

  const load = async () => {
    if (!isSchoolAdmin || !school_id) return;
    try {
      const rows = await adminFilter("Teacher", { school_id }, "-created_date", 200);
      setTeachers(rows || []);
      const sc = await adminGet("School", school_id).catch(() => null);
      setTeacherLimit(sc?.teacher_limit || 0);
      setSchoolCode(sc?.code || "");
      setSchoolClasses(Array.isArray(sc?.classes) ? sc.classes : []);
    } catch {
      setTeachers([]);
    }
  };

  useEffect(() => {
    if (!isLoading && isSchoolAdmin) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, isSchoolAdmin, school_id]);

  const codeTaken = (code) =>
    (teachers || []).some((tc) => String(tc.teacher_code || "").toLowerCase() === code.toLowerCase());

  const uniqueTeacherCode = async () => {
    for (let i = 0; i < 10; i++) {
      const c = randomCode("TCH-", 6);
      if (codeTaken(c)) continue;
      const dup = await adminFilter("Teacher", { school_id, teacher_code: c });
      if (!dup?.length) return c;
    }
    return `${randomCode("TCH-", 6)}${Date.now().toString(36).slice(-2).toUpperCase()}`;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.full_name.trim()) { setFormError(t("regErrRequired")); return; }
    setBusy(true);
    setFormError(null);
    try {
      const assigned = Array.isArray(form.assigned_classes) ? form.assigned_classes : [];
      if (editId) {
        const updatedData = {
          full_name: form.full_name.trim(),
          assigned_classes: assigned,
        };
        const prev = teachers;
        setTeachers((prev) => (prev || []).map((tc) => (tc.id === editId ? { ...tc, ...updatedData } : tc)));
        setForm({ full_name: "", teacher_code: "", assigned_classes: [] });
        setEditId(null);
        setShowForm(false);
        try {
          await adminUpdate("Teacher", editId, updatedData);
        } catch (err) {
          setTeachers(prev);
          setFormError(t("errUnexpected"));
        }
      } else {
        const limit = teacherLimit || 0;
        if (limit > 0 && (teachers || []).length >= limit) {
          setFormError(t("teacherLimitReached"));
          return;
        }
        const code = form.teacher_code.trim() || (await uniqueTeacherCode());
        if (codeTaken(code)) { setFormError(t("teacherCodeTaken")); return; }
        const created = await adminCreate("Teacher", {
          school_id,
          school_code: schoolCode,
          full_name: form.full_name.trim(),
          teacher_code: code,
          assigned_classes: assigned,
          status: "active",
          preferred_language: "ar",
        });
        setTeachers((prev) => [...(prev || []), created]);
        setForm({ full_name: "", teacher_code: "", assigned_classes: [] });
        setShowForm(false);
      }
    } catch (err) {
      setFormError(t("errUnexpected"));
    } finally {
      setBusy(false);
    }
  };

  const toggleStatus = async (tc) => {
    const next = tc.status === "active" ? "disabled" : "active";
    const prev = teachers;
    setTeachers((prev) => (prev || []).map((x) => (x.id === tc.id ? { ...x, status: next } : x)));
    try {
      await base44.entities.Teacher.update(tc.id, { status: next });
    } catch (err) {
      setTeachers(prev);
      await alertDialog(t("errUnexpected"));
    }
  };

  const deleteTeacher = async (tc) => {
    if (!(await confirmDialog(t("teacherConfirmDelete")))) return;
    const prev = teachers;
    setTeachers((prev) => (prev || []).filter((item) => item.id !== tc.id));
    try {
      await base44.entities.Teacher.delete(tc.id);
    } catch (err) {
      setTeachers(prev);
      await alertDialog(t("errUnexpected"));
    }
  };

  const startEdit = (tc) => {
    setEditId(tc.id);
    setForm({
      full_name: tc.full_name || "",
      teacher_code: tc.teacher_code || "",
      assigned_classes: Array.isArray(tc.assigned_classes) ? tc.assigned_classes : [],
    });
    setShowForm(true);
  };

  if (isLoading) {
    return (
      <div className="py-24 flex justify-center bg-background">
        <Loader2 size={28} className="animate-spin text-brand" />
      </div>
    );
  }

  if (!isSchoolAdmin) {
    return (
      <div className="py-20 text-center font-main" dir={direction}>
        <AlertCircle size={36} className="mx-auto mb-3 text-destructive" />
        <p className="text-xs text-muted-foreground">{t("examMgmtRestrictedDesc")}</p>
      </div>
    );
  }

  const labelCls = "block text-[10px] font-bold text-muted-foreground mb-1";
  const inputCls = "w-full px-3 py-2 rounded-[10px] text-xs bg-background border border-input focus:outline-none";

  return (
    <div className="min-h-screen bg-background text-foreground font-main" dir={direction}>
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 flex-wrap mb-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-[10px] flex items-center justify-center bg-primary text-primary-foreground">
              <GraduationCap size={20} />
            </div>
            <div>
              <h1 className="font-black text-xl text-foreground">{t("teachersTitle")}</h1>
              <p className="text-xs text-muted-foreground">
                {teachers?.length || 0}{teacherLimit > 0 ? ` / ${teacherLimit}` : ""} {t("teacherLimitCount")} • {t("teachersDesc")}
              </p>
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
              onClick={() => { setEditId(null); setForm({ full_name: "", teacher_code: "", assigned_classes: [] }); setShowForm(!showForm); }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-[10px] text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Plus size={14} /> {t("addTeacher")}
            </button>
          </div>
        </div>

        {/* Add/Edit form */}
        {showForm && (
          <motion.form
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={submit}
            className="rounded-[16px] p-4 mb-5 bg-card border border-border space-y-3"
          >
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>{t("teacherName")} *</label>
                <input
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  dir={direction}
                  className={inputCls}
                  required
                />
              </div>
              <div>
                <label className={labelCls}>{t("teacherCode")}</label>
                <input
                  value={form.teacher_code}
                  onChange={(e) => setForm({ ...form, teacher_code: e.target.value })}
                  dir="ltr"
                  disabled={!!editId}
                  placeholder="TCH-00125"
                  className={`${inputCls} font-mono disabled:opacity-50`}
                />
                {!editId && <p className="text-[9px] text-muted-foreground mt-0.5">{t("teacherCodeAuto")}</p>}
              </div>
            </div>

            {/* صفوف الأستاذ المخصصة */}
            <div className="p-3 rounded-[12px] bg-accent/40 border border-border">
              <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
                <label className="text-[11px] font-bold text-foreground flex items-center gap-1.5">
                  <GraduationCap size={14} className="text-secondary" />
                  {t("teacherAssignedClasses")}
                </label>
                <span className="text-[10px] text-muted-foreground">
                  {t("teacherAssignedClassesDesc")}
                </span>
              </div>

              {schoolClasses.length === 0 ? (
                <div className="text-[11px] text-muted-foreground py-1 italic">
                  لم يتم تعريف صفوف بعد في المدرسة. أضف الصفوف أولاً من قسم «الصفوف».
                </div>
              ) : (
                <div className="flex items-center gap-2 flex-wrap pt-1">
                  {schoolClasses.map((cls) => {
                    const isSelected = form.assigned_classes?.includes(cls);
                    return (
                      <button
                        key={cls}
                        type="button"
                        onClick={() => {
                          const cur = form.assigned_classes || [];
                          const updated = isSelected ? cur.filter((c) => c !== cls) : [...cur, cls];
                          setForm({ ...form, assigned_classes: updated });
                        }}
                        className={`text-xs px-2.5 py-1 rounded-[8px] border transition-colors flex items-center gap-1.5 font-bold ${
                          isSelected
                            ? "bg-secondary text-secondary-foreground border-secondary shadow-sm"
                            : "bg-card text-muted-foreground border-border hover:text-foreground hover:bg-accent"
                        }`}
                      >
                        {isSelected ? <Check size={12} /> : null}
                        <span>{cls}</span>
                      </button>
                    );
                  })}
                  {form.assigned_classes?.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, assigned_classes: [] })}
                      className="text-[10px] text-muted-foreground hover:text-destructive underline px-1"
                    >
                      إلغاء التحديد (الكل)
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => { setShowForm(false); setEditId(null); }}
                className="px-4 py-2 rounded-[10px] text-xs font-bold border border-border text-muted-foreground hover:text-foreground"
              >
                {t("cancelBtn")}
              </button>
              <button
                type="submit"
                disabled={busy}
                className="flex items-center gap-1.5 px-5 py-2 rounded-[10px] text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
              >
                {busy ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />} {t("teacherSave")}
              </button>
            </div>

            {formError && (
              <div className="text-[11px] font-bold px-3 py-2 rounded-[10px] bg-destructive/10 border border-destructive/35 text-destructive">
                {formError}
              </div>
            )}
          </motion.form>
        )}

        {/* List */}
        {teachers === null ? (
          <div className="py-20 flex justify-center">
            <Loader2 size={26} className="animate-spin text-brand" />
          </div>
        ) : teachers.length === 0 ? (
          <div className="rounded-[16px] p-10 text-center bg-card border border-border">
            <KeyRound size={36} className="mx-auto mb-3 opacity-40 text-brand" />
            <p className="text-xs font-bold mb-1 text-foreground">{t("teacherNoTeachers")}</p>
            <p className="text-[11px] text-muted-foreground">{t("teacherNoTeachersDesc")}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {teachers.map((tc, i) => (
              <motion.div
                key={tc.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
                className="rounded-[12px] p-3.5 bg-card border border-border flex flex-col sm:flex-row sm:items-center gap-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold truncate text-foreground">{tc.full_name}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-[6px] bg-accent border border-border text-brand">
                      {tc.teacher_code}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                      tc.status === "active"
                        ? "bg-success/10 border-success/35 text-success"
                        : "bg-muted border-border text-muted-foreground"
                    }`}>
                      {tc.status === "active" ? t("teacherActive") : t("teacherDisabled")}
                    </span>
                  </div>

                  {/* الصفوف المخصصة للأستاذ */}
                  <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
                    <span className="text-[10px] font-bold text-muted-foreground flex items-center gap-1">
                      <GraduationCap size={11} className="text-secondary" />
                      {t("teacherAssignedBadge")}:
                    </span>
                    {Array.isArray(tc.assigned_classes) && tc.assigned_classes.length > 0 ? (
                      tc.assigned_classes.map((cls) => (
                        <span
                          key={cls}
                          className="text-[10px] font-bold px-2 py-0.5 rounded-[6px] bg-secondary/15 text-secondary border border-secondary/30"
                        >
                          {cls}
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] text-muted-foreground/80 italic">
                        {t("teacherNoAssignedClasses")}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => startEdit(tc)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-[10px] text-[11px] font-bold border border-border text-brand hover:bg-accent"
                  >
                    <Pencil size={11} /> {t("examMgmtEdit")}
                  </button>
                  <button
                    onClick={() => toggleStatus(tc)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-[10px] text-[11px] font-bold border ${
                      tc.status === "active"
                        ? "border-border text-muted-foreground hover:text-foreground"
                        : "border-success/35 text-success hover:bg-success/10"
                    }`}
                  >
                    {tc.status === "active" ? <><Ban size={11} /> {t("teacherDisable")}</> : <><Check size={11} /> {t("teacherEnable")}</>}
                  </button>
                  <button
                    onClick={() => deleteTeacher(tc)}
                    className="p-1.5 rounded-[10px] bg-destructive/10 border border-destructive/20 text-destructive hover:bg-destructive/20"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}