import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Plus, Trash2, Check, X, Loader2, RefreshCw, KeyRound, Ban, Pencil,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { t, useLang, useDir } from "@/lib/i18n";
import { useDialogs } from "@/components/DialogProvider";
import { randomCode } from "@/lib/plans";

/**
 * قائمة أساتذة مدرسة — يُستخدم من قبل المالك (Owner) من SchoolsManager.
 * عمليات مباشرة على كيان Teacher بدون دوال خلفية — لا أخطاء 402.
 * حد الأساتذة (teacher_limit) وتفرّد الرمز يُفحصان قبل الإنشاء.
 */
export default function TeachersList({ school, onBack }) {
  const { confirmDialog, alertDialog } = useDialogs();
  useLang();
  const direction = useDir();
  const [teachers, setTeachers] = useState(null);
  const [teacherLimit, setTeacherLimit] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ full_name: "", teacher_code: "" });
  const [formError, setFormError] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try {
      const rows = await base44.entities.Teacher.filter({ school_id: school.id }, "-created_date", 200);
      setTeachers(rows || []);
      setTeacherLimit(school.teacher_limit || 0);
    } catch {
      setTeachers([]);
    }
  };

  useEffect(() => {
    if (school?.id) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [school?.id]);

  const codeTaken = (code) =>
    (teachers || []).some((tc) => String(tc.teacher_code || "").toLowerCase() === code.toLowerCase());

  const uniqueTeacherCode = async () => {
    for (let i = 0; i < 10; i++) {
      const c = randomCode("TCH-", 6);
      if (codeTaken(c)) continue;
      const dup = await base44.entities.Teacher.filter({ school_id: school.id, teacher_code: c });
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
      if (editId) {
        const updatedData = { full_name: form.full_name.trim() };
        const prev = teachers;
        setTeachers((prev) => (prev || []).map((tc) => (tc.id === editId ? { ...tc, ...updatedData } : tc)));
        setForm({ full_name: "", teacher_code: "" });
        setEditId(null);
        setShowForm(false);
        try {
          await base44.entities.Teacher.update(editId, updatedData);
        } catch (err) {
          setTeachers(prev);
          setFormError(t("errUnexpected"));
        }
      } else {
        const limit = school.teacher_limit || 0;
        if (limit > 0 && (teachers || []).length >= limit) {
          setFormError(t("teacherLimitReached"));
          return;
        }
        const code = form.teacher_code.trim() || (await uniqueTeacherCode());
        if (codeTaken(code)) { setFormError(t("teacherCodeTaken")); return; }
        const created = await base44.entities.Teacher.create({
          school_id: school.id,
          school_code: school.code,
          full_name: form.full_name.trim(),
          teacher_code: code,
          status: "active",
          preferred_language: "ar",
        });
        setTeachers((prev) => [...(prev || []), created]);
        setForm({ full_name: "", teacher_code: "" });
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
    setTeachers((p) => (p || []).map((x) => (x.id === tc.id ? { ...x, status: next } : x)));
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
    setTeachers((p) => (p || []).filter((item) => item.id !== tc.id));
    try {
      await base44.entities.Teacher.delete(tc.id);
    } catch (err) {
      setTeachers(prev);
      await alertDialog(t("errUnexpected"));
    }
  };

  const startEdit = (tc) => {
    setEditId(tc.id);
    setForm({ full_name: tc.full_name || "", teacher_code: tc.teacher_code || "" });
    setShowForm(true);
  };

  if (!school) {
    return (
      <div className="py-20 flex justify-center">
        <Loader2 size={26} className="animate-spin" style={{ color: "hsl(var(--primary))" }} />
      </div>
    );
  }

  const inputStyle = { background: "#F7F9FC", border: "1px solid hsl(var(--border))" };
  const labelCls = "block text-[10px] font-bold text-muted-foreground mb-1";
  const inputCls = "w-full px-3 py-2 rounded-xl text-xs bg-transparent focus:outline-none";

  return (
    <div dir={direction}>
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap mb-5">
        <div className="flex items-center gap-3 min-w-0">
          {onBack && (
            <button onClick={onBack}
              className="px-3 py-1.5 rounded-xl text-xs font-bold"
              style={{ border: "1px solid hsl(var(--border))", color: "hsl(var(--primary))" }}>
              {t("smBack")}
            </button>
          )}
          <div className="min-w-0">
            <h2 className="font-black text-base truncate">{t("teachersTitle")} — {school.name}</h2>
            <p className="text-[10px] text-muted-foreground">
              {teachers?.length || 0}{teacherLimit > 0 ? ` / ${teacherLimit}` : ""} {t("teacherLimitCount")} • {t("smSchoolCodeLabel")}: {school.code}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="p-2 rounded-xl hover:bg-white/5"
            style={{ border: "1px solid hsl(var(--border))", color: "hsl(var(--primary))" }}>
            <RefreshCw size={13} />
          </button>
          <button onClick={() => { setEditId(null); setForm({ full_name: "", teacher_code: "" }); setShowForm(!showForm); }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white"
            style={{ background: "#173F5F" }}>
            <Plus size={13} /> {t("addTeacher")}
          </button>
        </div>
      </div>

      {/* Add/Edit form */}
      {showForm && (
        <motion.form initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} onSubmit={submit}
          className="rounded-2xl p-4 mb-4 grid sm:grid-cols-3 gap-3 items-end bg-card"
          style={{ border: "1px solid hsl(var(--border))" }}>
          <div>
            <label className={labelCls}>{t("teacherName")} *</label>
            <input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              dir={direction} className={inputCls} style={inputStyle} required />
          </div>
          <div>
            <label className={labelCls}>{t("teacherCode")}</label>
            <input value={form.teacher_code} onChange={(e) => setForm({ ...form, teacher_code: e.target.value })} dir="ltr"
              disabled={!!editId} placeholder="TCH-00125"
              className={`${inputCls} font-mono disabled:opacity-50`} style={inputStyle} />
            {!editId && <p className="text-[9px] text-muted-foreground mt-0.5">{t("teacherCodeAuto")}</p>}
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={busy}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold text-white disabled:opacity-60"
              style={{ background: "#2E7D5B" }}>
              {busy ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />} {t("teacherSave")}
            </button>
            <button type="button" onClick={() => { setShowForm(false); setEditId(null); }}
              className="px-3 py-2 rounded-xl text-xs" style={{ border: "1px solid hsl(var(--border))", color: "hsl(var(--muted-foreground))" }}>
              <X size={12} />
            </button>
          </div>
          {formError && (
            <div className="sm:col-span-3 text-[11px] font-bold px-3 py-2 rounded-xl"
              style={{ background: "rgba(201,76,76,0.08)", border: "1px solid rgba(201,76,76,0.35)", color: "#C94C4C" }}>
              {formError}
            </div>
          )}
        </motion.form>
      )}

      {/* List */}
      {teachers === null ? (
        <div className="py-20 flex justify-center">
          <Loader2 size={26} className="animate-spin" style={{ color: "hsl(var(--primary))" }} />
        </div>
      ) : teachers.length === 0 ? (
        <div className="rounded-2xl p-10 text-center bg-card" style={{ border: "1px solid hsl(var(--border))" }}>
          <KeyRound size={36} className="mx-auto mb-3 opacity-40" style={{ color: "hsl(var(--primary))" }} />
          <p className="text-xs font-bold mb-1">{t("teacherNoTeachers")}</p>
          <p className="text-[11px] text-muted-foreground">{t("teacherNoTeachersDesc")}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {teachers.map((tc, i) => (
            <motion.div key={tc.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}
              className="rounded-xl p-3.5 bg-card flex flex-col sm:flex-row sm:items-center gap-3"
              style={{ border: "1px solid hsl(var(--border))" }}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold truncate">{tc.full_name}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-lg"
                    style={{ background: "rgba(47,102,144,0.08)", border: "1px solid rgba(47,102,144,0.25)", color: "#2F6690" }}>
                    {tc.teacher_code}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                    style={tc.status === "active"
                      ? { background: "rgba(46,125,91,0.1)", border: "1px solid rgba(46,125,91,0.35)", color: "#2E7D5B" }
                      : { background: "rgba(148,163,184,0.1)", border: "1px solid rgba(148,163,184,0.3)", color: "#94a3b8" }}>
                    {tc.status === "active" ? t("teacherActive") : t("teacherDisabled")}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button onClick={() => startEdit(tc)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-bold"
                  style={{ border: "1px solid hsl(var(--border))", color: "hsl(var(--primary))" }}>
                  <Pencil size={11} /> {t("examMgmtEdit")}
                </button>
                <button onClick={() => toggleStatus(tc)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-bold"
                  style={tc.status === "active"
                    ? { border: "1px solid hsl(var(--border))", color: "hsl(var(--muted-foreground))" }
                    : { border: "1px solid rgba(46,125,91,0.35)", color: "#2E7D5B" }}>
                  {tc.status === "active" ? <><Ban size={11} /> {t("teacherDisable")}</> : <><Check size={11} /> {t("teacherEnable")}</>}
                </button>
                <button onClick={() => deleteTeacher(tc)}
                  className="p-1.5 rounded-xl"
                  style={{ background: "rgba(201,76,76,0.06)", border: "1px solid rgba(201,76,76,0.2)", color: "#C94C4C" }}>
                  <Trash2 size={11} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}