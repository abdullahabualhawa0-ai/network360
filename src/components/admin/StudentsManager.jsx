import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  Plus, Trash2, Check, X, Loader2, RefreshCw, UserPlus, KeyRound, Ban,
  FileSpreadsheet, AlertCircle,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { UNCLAIMED } from "@/lib/registrationUtils";
import { STUDENT_LIMIT_MSG } from "@/lib/plans";
import { t, useLang, useDir, getLang } from "@/lib/i18n";
import { useDialogs } from "@/components/DialogProvider";
import { studentsFromCsv } from "@/lib/csvStudents";

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

/**
 * إدارة طلاب مدرسة واحدة — إضافة طالب برمز، موافقة/رفض، تعطيل، حذف.
 * تُستخدم من قبل Super Admin (إدارة الطلاب داخل كل مدرسة) ومشرف المدرسة.
 */
export default function StudentsManager({ school, onBack }) {
  const { confirmDialog } = useDialogs();
  const { user } = useAuth();
  useLang();
  const direction = useDir();
  const [students, setStudents] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", code: "", email: "" });
  const [formError, setFormError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importMsg, setImportMsg] = useState(null);
  const fileRef = useRef(null);

  const load = () =>
    base44.entities.StudentProfile.filter({ school_id: school.id }, "-created_date", 200)
      .then((rows) => setStudents(rows || []));

  useEffect(() => { if (school?.id) load(); }, [school?.id]);

  const addStudent = async (e) => {
    e.preventDefault();
    const code = form.code.trim();
    if (!form.name.trim() || !code) { setFormError(t("smErrNameCode")); return; }
    const limit = school.student_limit || 0;
    if (limit > 0 && (students || []).length >= limit) {
      setFormError(STUDENT_LIMIT_MSG);
      return;
    }
    if ((students || []).some((s) => s.student_code === code)) {
      setFormError(t("smErrDupCode"));
      return;
    }
    setBusy(true);
    setFormError(null);
    try {
      const created = await base44.entities.StudentProfile.create({
        school_id: school.id,
        student_code: code,
        full_name: form.name.trim(),
        email: form.email.trim() || null,
        status: "approved",
        user_id: UNCLAIMED,
      });
      setStudents(prev => [...(prev || []), created]);
      base44.entities.School.update(school.id, { current_student_count: (students || []).length + 1 }).catch(() => {});
      setForm({ name: "", code: "", email: "" });
      setShowForm(false);
    } catch (err) {
      setFormError(err?.message || t("smErrCreate"));
    } finally {
      setBusy(false);
    }
  };

  const setStatus = async (s, status) => {
    const prev = students;
    const now = new Date().toISOString();
    setStudents(prev => (prev || []).map(st => st.id === s.id ? { ...st, status, approved_by: user.email, approved_at: now } : st));
    try {
      await base44.entities.StudentProfile.update(s.id, { status, approved_by: user.email, approved_at: now });
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
      const existing = await base44.entities.StudentProfile.filter({ school_id: school.id }, "-created_date", 10000);
      const existingCodes = new Set((existing || []).map((s) => s.student_code));
      const limit = school.student_limit || 0;
      const toCreate = [];
      for (const s of imported) {
        const code = String(s.student_code || "").trim();
        const name = String(s.full_name || "").trim();
        if (!code || !name) continue;
        if (existingCodes.has(code)) continue;
        if (limit > 0 && (existing || []).length + toCreate.length >= limit) break;
        existingCodes.add(code);
        toCreate.push({
          school_id: school.id,
          student_code: code,
          full_name: name,
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
      await base44.entities.StudentProfile.bulkCreate(toCreate);
      base44.entities.School.update(school.id, {
        current_student_count: (existing || []).length + toCreate.length,
      }).catch(() => {});
      setImportMsg({ type: "success", text: t("smImportSuccess", getLang()).replace("{count}", toCreate.length) });
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
      await base44.entities.StudentProfile.delete(s.id);
      base44.entities.StudentProfile.filter({ school_id: school.id }, "-created_date", 500)
        .then((rows) => base44.entities.School.update(school.id, { current_student_count: (rows || []).length }).catch(() => {}))
        .catch(() => {});
    } catch {
      setStudents(prev);
    }
  };

  if (!school) return <FullSpinnerLocal />;

  const claimed = (students || []).filter((s) => s.user_id && s.user_id !== UNCLAIMED);
  const pendingCount = claimed.filter((s) => s.status === "pending").length;

  return (
    <div dir={direction} className="font-main text-foreground">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap mb-5">
        <div className="flex items-center gap-3 min-w-0">
          {onBack && (
            <button
              onClick={onBack}
              className="px-3 py-1.5 rounded-[10px] text-xs font-bold border border-border text-brand hover:bg-accent"
            >
              {t("smBack")}
            </button>
          )}
          <div className="min-w-0">
            <h2 className="font-black text-base truncate">{t("smStudentsOf")} {school.name}</h2>
            <p className="text-[10px] text-muted-foreground">
              {students?.length || 0}{school.student_limit > 0 ? ` / ${school.student_limit}` : ""} {t("smStudentWord")} • {pendingCount} {t("smPendingApproval")} • {t("smSchoolCodeLabel")}: {school.code}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            className="p-2 rounded-[10px] border border-border text-brand hover:bg-accent"
          >
            <RefreshCw size={13} />
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-[10px] text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <UserPlus size={13} /> {t("smAddStudent")}
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            disabled={importing}
            className="flex items-center gap-1.5 px-4 py-2 rounded-[10px] text-xs font-bold border border-secondary text-secondary hover:bg-secondary/10 disabled:opacity-60"
          >
            {importing ? <Loader2 size={13} className="animate-spin" /> : <FileSpreadsheet size={13} />}
            {importing ? t("smImporting") : t("smImportExcel")}
          </button>
          <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" onChange={importExcel} className="hidden" />
        </div>
      </div>

      {importMsg && (
        <div className={`mb-4 flex items-center gap-2 px-4 py-3 rounded-[10px] text-xs font-bold border ${
          importMsg.type === "success"
            ? "bg-success/10 border-success/35 text-success"
            : "bg-destructive/10 border-destructive/35 text-destructive"
        }`}>
          {importMsg.type === "success" ? <Check size={13} /> : <AlertCircle size={13} />} {importMsg.text}
        </div>
      )}

      {/* Add form */}
      {showForm && (
        <motion.form
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={addStudent}
          className="rounded-[16px] p-4 mb-4 grid sm:grid-cols-4 gap-3 items-end bg-card border border-border"
        >
          <div>
            <label className="block text-[10px] font-bold text-muted-foreground mb-1">{t("smStudentName")}</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              dir={direction}
              className="w-full px-3 py-2 rounded-[10px] text-xs bg-background border border-input focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-muted-foreground mb-1">{t("smStudentCode")}</label>
            <input
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              placeholder="ST10025"
              dir="ltr"
              className="w-full px-3 py-2 rounded-[10px] text-xs font-mono bg-background border border-input focus:outline-none"
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
              disabled={busy}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-[10px] text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
            >
              {busy ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />} {t("smSave")}
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
            <div className="sm:col-span-4 text-[11px] font-bold px-3 py-2 rounded-[10px] bg-destructive/10 border border-destructive/30 text-destructive">
              {formError}
            </div>
          )}
        </motion.form>
      )}

      {/* List */}
      {students === null ? (
        <FullSpinnerLocal />
      ) : students.length === 0 ? (
        <div className="rounded-[16px] p-10 text-center bg-card border border-border">
          <KeyRound size={36} className="mx-auto mb-3 opacity-40 text-brand" />
          <p className="text-xs text-muted-foreground">{t("smEmpty")}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {students.map((s, i) => {
            const isClaimed = s.user_id && s.user_id !== UNCLAIMED;
            const stKey = STATUS_KEYS[s.status] || "smStatusPending";
            const st = STATUS_UI[s.status] || STATUS_UI.pending;
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
  );
}

function FullSpinnerLocal() {
  return (
    <div className="py-20 flex justify-center">
      <Loader2 size={26} className="animate-spin text-brand" />
    </div>
  );
}