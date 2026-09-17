import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  Plus, Trash2, Check, X, Loader2, RefreshCw, UserPlus, KeyRound, Ban,
  FileSpreadsheet, AlertCircle,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { UNCLAIMED } from "@/lib/registrationUtils";
import { STUDENT_LIMIT_MSG } from "@/lib/plans";

const STATUS_UI = {
  pending: { label: "بانتظار الموافقة", color: "#fbbf24", bg: "rgba(251,191,36,0.1)", border: "rgba(251,191,36,0.35)" },
  approved: { label: "فعّال ✓", color: "#34d399", bg: "rgba(52,211,153,0.1)", border: "rgba(52,211,153,0.35)" },
  rejected: { label: "مرفوض", color: "#f87171", bg: "rgba(248,113,113,0.1)", border: "rgba(248,113,113,0.35)" },
  disabled: { label: "معطّل", color: "#94a3b8", bg: "rgba(148,163,184,0.1)", border: "rgba(148,163,184,0.3)" },
};

/**
 * إدارة طلاب مدرسة واحدة — إضافة طالب برمز، موافقة/رفض، تعطيل، حذف.
 * تُستخدم من قبل Super Admin (إدارة الطلاب داخل كل مدرسة) ومشرف المدرسة.
 */
export default function StudentsManager({ school, onBack }) {
  const { user } = useAuth();
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
    if (!form.name.trim() || !code) { setFormError("أدخل اسم الطالب ورمزه"); return; }
    setBusy(true);
    setFormError(null);
    // عدد الطلاب الحالي — فحص مباشر من قاعدة البيانات
    const all = await base44.entities.StudentProfile.filter({ school_id: school.id }, "-created_date", 500);
    // 1) حد عدد الطلاب في خطة الاشتراك
    const limit = school.student_limit || 0;
    if (limit > 0 && (all || []).length >= limit) {
      setFormError(STUDENT_LIMIT_MSG);
      setBusy(false);
      return;
    }
    // 2) فرادة رمز الطالب داخل المدرسة
    if ((all || []).some((s) => s.student_code === code)) {
      setFormError("رمز الطالب مستخدم مسبقاً داخل هذه المدرسة");
      setBusy(false);
      return;
    }
    await base44.entities.StudentProfile.create({
      school_id: school.id,
      student_code: code,
      full_name: form.name.trim(),
      email: form.email.trim() || null,
      status: "approved",
      user_id: UNCLAIMED,
    });
    // مزامنة عداد الطلاب على سجل المدرسة (تنجح للمالك، وتُتجاهل بهدوء لغيره)
    base44.entities.School.update(school.id, { current_student_count: (all || []).length + 1 }).catch(() => {});
    setForm({ name: "", code: "", email: "" });
    setShowForm(false);
    setBusy(false);
    load();
  };

  const setStatus = async (s, status) => {
    await base44.entities.StudentProfile.update(s.id, {
      status,
      approved_by: user.email,
      approved_at: new Date().toISOString(),
    });
    load();
  };

  const importExcel = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setImporting(true);
    setImportMsg(null);
    try {
      const { file_url } = await base44.integrations.Core.UploadPublicFile({ file });
      const result = await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url,
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
      const students = result?.output?.students || [];
      if (!students.length) {
        setImportMsg({ type: "error", text: "لم يتم العثور على بيانات طلاب في الملف" });
        setImporting(false);
        return;
      }
      // فحص الحد والفرادة قبل الإنشاء
      const existing = await base44.entities.StudentProfile.filter({ school_id: school.id }, "-created_date", 500);
      const existingCodes = new Set((existing || []).map((s) => s.student_code));
      const limit = school.student_limit || 0;
      const toCreate = [];
      for (const s of students) {
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
        setImportMsg({ type: "error", text: "كل الأكواد موجودة مسبقاً أو بلغت الحد الأقصى" });
        setImporting(false);
        return;
      }
      await base44.entities.StudentProfile.bulkCreate(toCreate);
      base44.entities.School.update(school.id, {
        current_student_count: (existing || []).length + toCreate.length,
      }).catch(() => {});
      setImportMsg({ type: "success", text: `تم استيراد ${toCreate.length} طالب بنجاح` });
      load();
    } catch (err) {
      setImportMsg({ type: "error", text: "تعذر استيراد الملف — تأكد من صيغة Excel (أعمدة: الاسم، الرمز، البريد)" });
    } finally {
      setImporting(false);
    }
  };

  const deleteStudent = async (s) => {
    if (!confirm(`حذف الطالب "${s.full_name}" (${s.student_code})؟`)) return;
    await base44.entities.StudentProfile.delete(s.id);
    // مزامنة عداد الطلاب بعد الحذف
    base44.entities.StudentProfile.filter({ school_id: school.id }, "-created_date", 500)
      .then((rows) => base44.entities.School.update(school.id, { current_student_count: (rows || []).length }).catch(() => {}))
      .catch(() => {});
    load();
  };

  if (!school) return <FullSpinnerLocal />;

  const claimed = (students || []).filter((s) => s.user_id && s.user_id !== UNCLAIMED);
  const pendingCount = claimed.filter((s) => s.status === "pending").length;

  return (
    <div dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap mb-5">
        <div className="flex items-center gap-3 min-w-0">
          {onBack && (
            <button onClick={onBack}
              className="px-3 py-1.5 rounded-xl text-xs font-bold"
              style={{ border: "1px solid hsl(var(--border))", color: "hsl(var(--primary))" }}>
              رجوع
            </button>
          )}
          <div className="min-w-0">
            <h2 className="font-black text-base truncate">طلاب مدرسة {school.name}</h2>
            <p className="text-[10px] text-muted-foreground">
              {students?.length || 0}{school.student_limit > 0 ? ` / ${school.student_limit}` : ""} طالب • {pendingCount} بانتظار الموافقة • رمز المدرسة: {school.code}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="p-2 rounded-xl hover:bg-white/5"
            style={{ border: "1px solid hsl(var(--border))", color: "hsl(var(--primary))" }}>
            <RefreshCw size={13} />
          </button>
          <button onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white"
            style={{ background: "linear-gradient(90deg,#0891b2,#7c3aed)" }}>
            <UserPlus size={13} /> إضافة طالب
          </button>
          <button onClick={() => fileRef.current?.click()} disabled={importing}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold disabled:opacity-60"
            style={{ border: "1px solid rgba(46,125,91,0.4)", color: "#2E7D5B", background: "rgba(46,125,91,0.06)" }}>
            {importing ? <Loader2 size={13} className="animate-spin" /> : <FileSpreadsheet size={13} />}
            {importing ? "جاري الاستيراد..." : "استيراد من Excel"}
          </button>
          <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" onChange={importExcel} className="hidden" />
        </div>
      </div>

      {importMsg && (
        <div className="mb-4 flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-bold"
          style={importMsg.type === "success"
            ? { background: "rgba(46,125,91,0.08)", border: "1px solid rgba(46,125,91,0.35)", color: "#2E7D5B" }
            : { background: "rgba(201,76,76,0.08)", border: "1px solid rgba(201,76,76,0.35)", color: "#C94C4C" }}>
          {importMsg.type === "success" ? <Check size={13} /> : <AlertCircle size={13} />} {importMsg.text}
        </div>
      )}

      {/* Add form */}
      {showForm && (
        <motion.form initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} onSubmit={addStudent}
          className="rounded-2xl p-4 mb-4 grid sm:grid-cols-4 gap-3 items-end bg-card"
          style={{ border: "1px solid rgba(6,182,212,0.3)" }}>
          <div>
            <label className="block text-[10px] font-bold text-muted-foreground mb-1">اسم الطالب *</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              dir="rtl" className="w-full px-3 py-2 rounded-xl text-xs bg-transparent focus:outline-none"
              style={{ border: "1px solid hsl(var(--border))" }} />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-muted-foreground mb-1">رمز الطالب *</label>
            <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })}
              placeholder="ST10025" dir="ltr"
              className="w-full px-3 py-2 rounded-xl text-xs font-mono bg-transparent focus:outline-none"
              style={{ border: "1px solid hsl(var(--border))" }} />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-muted-foreground mb-1">Email (اختياري)</label>
            <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              dir="ltr" className="w-full px-3 py-2 rounded-xl text-xs bg-transparent focus:outline-none"
              style={{ border: "1px solid hsl(var(--border))" }} />
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={busy}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold text-white disabled:opacity-60"
              style={{ background: "linear-gradient(90deg,#059669,#10b981)" }}>
              {busy ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />} حفظ
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="px-3 py-2 rounded-xl text-xs" style={{ border: "1px solid hsl(var(--border))", color: "hsl(var(--muted-foreground))" }}>
              <X size={12} />
            </button>
          </div>
          {formError && (
            <div className="sm:col-span-4 text-[11px] font-bold px-3 py-2 rounded-xl"
              style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5" }}>
              {formError}
            </div>
          )}
        </motion.form>
      )}

      {/* List */}
      {students === null ? (
        <FullSpinnerLocal />
      ) : students.length === 0 ? (
        <div className="rounded-2xl p-10 text-center bg-card" style={{ border: "1px solid hsl(var(--border))" }}>
          <KeyRound size={36} className="mx-auto mb-3 opacity-40" style={{ color: "hsl(var(--primary))" }} />
          <p className="text-xs text-muted-foreground">لا يوجد طلاب — أضف أول طالب برمزه الخاص</p>
        </div>
      ) : (
        <div className="space-y-2">
          {students.map((s, i) => {
            const isClaimed = s.user_id && s.user_id !== UNCLAIMED;
            const st = STATUS_UI[s.status] || STATUS_UI.pending;
            return (
              <motion.div key={s.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}
                className="rounded-xl p-3.5 bg-card flex flex-col sm:flex-row sm:items-center gap-3"
                style={{ border: "1px solid hsl(var(--border))" }}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold truncate">{s.full_name || "بدون اسم"}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-lg"
                      style={{ background: "rgba(6,182,212,0.08)", border: "1px solid rgba(6,182,212,0.25)", color: "#06b6d4" }}>
                      {s.student_code}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                      style={{ background: st.bg, border: `1px solid ${st.border}`, color: st.color }}>
                      {isClaimed ? st.label : "رمز غير مُفعّل بعد"}
                    </span>
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5 truncate">
                    {s.email || "بدون بريد"} {isClaimed ? "• حساب مرتبط" : "• بانتظار تفعيل الطالب لرمزه"}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {isClaimed && s.status === "pending" && (
                    <button onClick={() => setStatus(s, "approved")}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-bold text-white"
                      style={{ background: "linear-gradient(90deg,#059669,#10b981)" }}>
                      <Check size={11} /> موافقة
                    </button>
                  )}
                  {isClaimed && s.status === "approved" && (
                    <button onClick={() => setStatus(s, "disabled")}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-bold"
                      style={{ border: "1px solid hsl(var(--border))", color: "hsl(var(--muted-foreground))" }}>
                      <Ban size={11} /> تعطيل
                    </button>
                  )}
                  {isClaimed && (s.status === "rejected" || s.status === "disabled") && (
                    <button onClick={() => setStatus(s, "approved")}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-bold"
                      style={{ border: "1px solid rgba(52,211,153,0.35)", color: "#34d399" }}>
                      <Check size={11} /> إعادة تفعيل
                    </button>
                  )}
                  {isClaimed && s.status === "pending" && (
                    <button onClick={() => setStatus(s, "rejected")}
                      className="px-3 py-1.5 rounded-xl text-[11px] font-bold"
                      style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.3)", color: "#f87171" }}>
                      رفض
                    </button>
                  )}
                  <button onClick={() => deleteStudent(s)}
                    className="p-1.5 rounded-xl"
                    style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }}>
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
      <Loader2 size={26} className="animate-spin" style={{ color: "hsl(var(--primary))" }} />
    </div>
  );
}