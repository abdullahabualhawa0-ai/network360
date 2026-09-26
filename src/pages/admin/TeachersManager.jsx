import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  GraduationCap, Plus, Loader2, RefreshCw, Ban, Check, Trash2,
  Pencil, X, AlertCircle, KeyRound,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAdminAuth } from "@/lib/useAdminAuth";
import { getSchoolAdminSession } from "@/lib/schoolAdminSession";
import { t, useLang, useDir } from "@/lib/i18n";

/**
 * إدارة الأساتذة — School Admin
 * إضافة/تعديل/تعطيل/تفعيل/حذف الأساتذة تحت مدرسته.
 * الحد الأقصى (teacher_limit) يُفرض من الـBackend عبر manageTeachers.
 */
export default function TeachersManager() {
  const { isLoading, role } = useAdminAuth();
  useLang();
  const direction = useDir();
  const [teachers, setTeachers] = useState(null);
  const [teacherLimit, setTeacherLimit] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ full_name: "", teacher_code: "" });
  const [formError, setFormError] = useState(null);
  const [busy, setBusy] = useState(false);

  const isSchoolAdmin = role === "school_admin" || role === "admin";

  const session = getSchoolAdminSession();

  const load = async () => {
    if (!isSchoolAdmin) return;
    try {
      const res = await base44.functions.invoke("manageTeachers", { action: "list", session });
      setTeachers(res.data?.teachers || []);
      setTeacherLimit(res.data?.teacher_limit || 0);
    } catch {
      setTeachers([]);
    }
  };

  useEffect(() => {
    if (!isLoading && isSchoolAdmin) load();
  }, [isLoading, isSchoolAdmin]);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.full_name.trim()) { setFormError(t("regErrRequired")); return; }
    setBusy(true);
    setFormError(null);
    try {
      if (editId) {
        const updatedData = {
          full_name: form.full_name.trim(),
        };
        const prev = teachers;
        setTeachers(prev => (prev || []).map(tc => tc.id === editId ? { ...tc, ...updatedData } : tc));
        setForm({ full_name: "", teacher_code: "" });
        setEditId(null);
        setShowForm(false);
        try {
          await base44.functions.invoke("manageTeachers", { action: "update", id: editId, session, data: updatedData });
        } catch (err) {
          setTeachers(prev);
          setFormError(err?.data?.error || err?.message || t("regErrSubmit"));
        }
      } else {
        const res = await base44.functions.invoke("manageTeachers", {
          action: "create",
          session,
          data: {
            full_name: form.full_name.trim(),
            teacher_code: form.teacher_code.trim() || undefined,
          },
        });
        const newTeacher = res?.data?.teacher || (res?.data?.id ? res.data : null);
        if (newTeacher?.id) {
          setTeachers(prev => [...(prev || []), newTeacher]);
        } else {
          load();
        }
        setForm({ full_name: "", teacher_code: "" });
        setShowForm(false);
      }
    } catch (err) {
      setFormError(err?.data?.error || err?.message || t("regErrSubmit"));
    } finally {
      setBusy(false);
    }
  };

  const toggleStatus = async (id) => {
    const prev = teachers;
    setTeachers(prev => (prev || []).map(tc => tc.id === id ? { ...tc, status: tc.status === "active" ? "disabled" : "active" } : tc));
    try {
      await base44.functions.invoke("manageTeachers", { action: "toggleStatus", id, session });
    } catch (err) {
      setTeachers(prev);
      alert(err?.data?.error || err?.message);
    }
  };

  const deleteTeacher = async (tc) => {
    if (!confirm(t("teacherConfirmDelete"))) return;
    const prev = teachers;
    setTeachers(prev => (prev || []).filter(item => item.id !== tc.id));
    try {
      await base44.functions.invoke("manageTeachers", { action: "delete", id: tc.id, session });
    } catch (err) {
      setTeachers(prev);
      alert(err?.data?.error || err?.message);
    }
  };

  const startEdit = (t) => {
    setEditId(t.id);
    setForm({
      full_name: t.full_name || "",
      teacher_code: t.teacher_code || "",
    });
    setShowForm(true);
  };

  if (isLoading) {
    return (
      <div className="py-24 flex justify-center">
        <Loader2 size={28} className="animate-spin" style={{ color: "hsl(var(--primary))" }} />
      </div>
    );
  }

  if (!isSchoolAdmin) {
    return (
      <div className="py-20 text-center">
        <AlertCircle size={36} className="mx-auto mb-3" style={{ color: "#C94C4C" }} />
        <p className="text-xs text-muted-foreground">{t("examMgmtRestrictedDesc")}</p>
      </div>
    );
  }

  const inputStyle = { background: "#F7F9FC", border: "1px solid hsl(var(--border))" };
  const labelCls = "block text-[10px] font-bold text-muted-foreground mb-1";
  const inputCls = "w-full px-3 py-2 rounded-xl text-xs bg-transparent focus:outline-none";

  return (
    <div className="min-h-screen bg-background text-foreground" dir={direction}>
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 flex-wrap mb-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "#173F5F" }}>
              <GraduationCap className="text-white" size={20} />
            </div>
            <div>
              <h1 className="font-black text-xl">{t("teachersTitle")}</h1>
              <p className="text-xs text-muted-foreground">
                {teachers?.length || 0}{teacherLimit > 0 ? ` / ${teacherLimit}` : ""} {t("teacherLimitCount")} • {t("teachersDesc")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={load} className="p-2 rounded-xl" style={{ border: "1px solid hsl(var(--border))", color: "hsl(var(--primary))" }}>
              <RefreshCw size={14} />
            </button>
            <button onClick={() => { setEditId(null); setForm({ full_name: "", teacher_code: "" }); setShowForm(!showForm); }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white"
              style={{ background: "#173F5F" }}>
              <Plus size={14} /> {t("addTeacher")}
            </button>
          </div>
        </div>

        {/* Add/Edit form */}
        {showForm && (
          <motion.form initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} onSubmit={submit}
            className="rounded-2xl p-4 mb-5 grid sm:grid-cols-3 gap-3 items-end bg-card"
            style={{ border: "1px solid hsl(var(--border))" }}>
            <div>
              <label className={labelCls}>{t("teacherName")} *</label>
              <input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                className={inputCls} style={inputStyle} required />
            </div>
            <div>
              <label className={labelCls}>{t("teacherCode")}</label>
              <input value={form.teacher_code} onChange={(e) => setForm({ ...form, teacher_code: e.target.value })} dir="ltr"
                disabled={!!editId}
                placeholder="TCH-00125"
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
                  <button onClick={() => toggleStatus(tc.id)}
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
    </div>
  );
}