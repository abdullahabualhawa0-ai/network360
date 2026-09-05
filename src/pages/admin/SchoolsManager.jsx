import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  School as SchoolIcon, Plus, Loader2, AlertTriangle, RefreshCw,
  GraduationCap, ShieldCheck, Check, X, Ban,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import StudentsManager from "../../components/admin/StudentsManager";

/**
 * شاشة المدارس — Super Admin فقط (role = admin)
 * إضافة مدرسة برمز فريد، تفعيل/تعطيل، تعيين مشرف، وإدارة طلاب كل مدرسة.
 */
export default function SchoolsManager() {
  const { user, isLoadingAuth } = useAuth();
  const [schools, setSchools] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", code: "" });
  const [formError, setFormError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [view, setView] = useState("list"); // list | students
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [assignEmail, setAssignEmail] = useState({});
  const [assignMsg, setAssignMsg] = useState({});

  const isSuperAdmin = user?.role === "admin";

  const load = () => base44.entities.School.list("-created_date", 100).then((r) => setSchools(r || []));

  useEffect(() => {
    if (!isLoadingAuth && isSuperAdmin) load();
  }, [isLoadingAuth, isSuperAdmin]);

  const addSchool = async (e) => {
    e.preventDefault();
    const code = form.code.trim();
    if (!form.name.trim() || !code) { setFormError("أدخل اسم المدرسة ورمزها"); return; }
    setBusy(true);
    setFormError(null);
    // فرادة رمز المدرسة
    const dup = await base44.entities.School.filter({ code });
    if (dup && dup.length > 0) {
      setFormError(`رمز المدرسة "${code}" مستخدم مسبقاً — لا يمكن تكراره`);
      setBusy(false);
      return;
    }
    await base44.entities.School.create({
      name: form.name.trim(),
      code,
      is_active: true,
      created_by_id: user.id,
    });
    setForm({ name: "", code: "" });
    setShowForm(false);
    setBusy(false);
    load();
  };

  const toggleActive = async (s) => {
    await base44.entities.School.update(s.id, { is_active: !s.is_active });
    load();
  };

  const assignAdmin = async (school) => {
    const email = (assignEmail[school.id] || "").trim();
    if (!email) return;
    setAssignMsg((m) => ({ ...m, [school.id]: null }));
    const users = await base44.entities.User.filter({ email });
    if (!users || users.length === 0) {
      setAssignMsg((m) => ({ ...m, [school.id]: { ok: false, text: "لا يوجد مستخدم بهذا البريد — يجب أن يسجل دخوله للتطبيق أولاً" } }));
      return;
    }
    await base44.entities.User.update(users[0].id, { role: "school_admin", school_id: school.id });
    setAssignEmail((m) => ({ ...m, [school.id]: "" }));
    setAssignMsg((m) => ({ ...m, [school.id]: { ok: true, text: "تم تعيينه مشرفاً لهذه المدرسة ✓" } }));
  };

  if (isLoadingAuth) return <FullSpinner />;

  if (!isSuperAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background" dir="rtl">
        <div className="text-center">
          <AlertTriangle size={36} className="text-red-400 mx-auto mb-3" />
          <h2 className="font-black text-lg mb-2">وصول مقيّد</h2>
          <p className="text-xs text-muted-foreground mb-5">هذه الشاشة للمدير العام (Super Admin) فقط.</p>
          <Link to="/" className="text-xs font-bold" style={{ color: "hsl(var(--primary))" }}>العودة للرئيسية</Link>
        </div>
      </div>
    );
  }

  // إدارة طلاب مدرسة محددة
  if (view === "students" && selectedSchool) {
    return (
      <div className="min-h-screen bg-background text-foreground" dir="rtl">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <StudentsManager school={selectedSchool} onBack={() => { setView("list"); setSelectedSchool(null); }} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground" dir="rtl">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 flex-wrap mb-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#0891b2,#7c3aed)" }}>
              <SchoolIcon className="text-white" size={20} />
            </div>
            <div>
              <h1 className="font-black text-xl">المدارس</h1>
              <p className="text-xs text-muted-foreground">
                إضافة مدارس برموز فريدة، تعيين المشرفين، وإدارة طلاب كل مدرسة
              </p>
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
              <Plus size={14} /> Add School
            </button>
          </div>
        </div>

        {/* Add School form */}
        {showForm && (
          <motion.form initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} onSubmit={addSchool}
            className="rounded-2xl p-4 mb-5 grid sm:grid-cols-3 gap-3 items-end bg-card"
            style={{ border: "1px solid rgba(6,182,212,0.3)" }}>
            <div>
              <label className="block text-[10px] font-bold text-muted-foreground mb-1">School Name *</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                dir="rtl" className="w-full px-3 py-2 rounded-xl text-xs bg-transparent focus:outline-none"
                style={{ border: "1px solid hsl(var(--border))" }} />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-muted-foreground mb-1">School Code *</label>
              <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })}
                placeholder="SCH2026A" dir="ltr"
                className="w-full px-3 py-2 rounded-xl text-xs font-mono bg-transparent focus:outline-none"
                style={{ border: "1px solid hsl(var(--border))" }} />
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={busy}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold text-white disabled:opacity-60"
                style={{ background: "linear-gradient(90deg,#059669,#10b981)" }}>
                {busy ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />} حفظ المدرسة
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="px-3 py-2 rounded-xl text-xs" style={{ border: "1px solid hsl(var(--border))", color: "hsl(var(--muted-foreground))" }}>
                <X size={12} />
              </button>
            </div>
            {formError && (
              <div className="sm:col-span-3 text-[11px] font-bold px-3 py-2 rounded-xl"
                style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5" }}>
                {formError}
              </div>
            )}
          </motion.form>
        )}

        {/* Schools list */}
        {schools === null ? (
          <FullSpinner />
        ) : schools.length === 0 ? (
          <div className="rounded-2xl p-10 text-center bg-card" style={{ border: "1px solid hsl(var(--border))" }}>
            <SchoolIcon size={40} className="mx-auto mb-3 opacity-40" style={{ color: "hsl(var(--primary))" }} />
            <p className="text-xs text-muted-foreground">لا توجد مدارس — أضف أول مدرسة</p>
          </div>
        ) : (
          <div className="space-y-3">
            {schools.map((s, i) => (
              <motion.div key={s.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className="rounded-2xl p-4 bg-card" style={{ border: "1px solid hsl(var(--border))" }}>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-black text-sm">{s.name}</span>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded-lg"
                        style={{ background: "rgba(6,182,212,0.08)", border: "1px solid rgba(6,182,212,0.25)", color: "#06b6d4" }}>
                        {s.code}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                        style={s.is_active
                          ? { background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.35)", color: "#34d399" }
                          : { background: "rgba(148,163,184,0.1)", border: "1px solid rgba(148,163,184,0.3)", color: "#94a3b8" }}>
                        {s.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <div className="text-[10px] text-muted-foreground font-mono" dir="ltr">school_id: {s.id}</div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => { setSelectedSchool(s); setView("students"); }}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold"
                      style={{ background: "rgba(6,182,212,0.08)", border: "1px solid rgba(6,182,212,0.3)", color: "#06b6d4" }}>
                      <GraduationCap size={13} /> Students
                    </button>
                    <button onClick={() => toggleActive(s)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
                      style={{ border: "1px solid hsl(var(--border))", color: "hsl(var(--muted-foreground))" }}>
                      {s.is_active ? <><Ban size={11} /> تعطيل</> : <><Check size={11} /> تفعيل</>}
                    </button>
                  </div>
                </div>

                {/* تعيين مشرف المدرسة */}
                <div className="mt-3 pt-3 flex flex-col sm:flex-row sm:items-center gap-2"
                  style={{ borderTop: "1px solid hsl(var(--border))" }}>
                  <div className="flex items-center gap-1.5 text-[11px] font-bold flex-shrink-0" style={{ color: "#a78bfa" }}>
                    <ShieldCheck size={12} /> تعيين مشرف المدرسة:
                  </div>
                  <div className="flex flex-1 gap-2">
                    <input value={assignEmail[s.id] || ""} onChange={(e) => setAssignEmail((m) => ({ ...m, [s.id]: e.target.value }))}
                      placeholder="بريد المستخدم (سجل دخوله أولاً)" dir="ltr"
                      className="flex-1 px-3 py-1.5 rounded-xl text-[11px] bg-transparent focus:outline-none"
                      style={{ border: "1px solid hsl(var(--border))" }} />
                    <button onClick={() => assignAdmin(s)}
                      className="px-3 py-1.5 rounded-xl text-[11px] font-bold text-white"
                      style={{ background: "linear-gradient(90deg,#7c3aed,#0891b2)" }}>
                      تعيين
                    </button>
                  </div>
                  {assignMsg[s.id] && (
                    <span className="text-[10px] font-bold" style={{ color: assignMsg[s.id].ok ? "#34d399" : "#fca5a5" }}>
                      {assignMsg[s.id].text}
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function FullSpinner() {
  return (
    <div className="py-24 flex justify-center">
      <Loader2 size={28} className="animate-spin" style={{ color: "hsl(var(--primary))" }} />
    </div>
  );
}