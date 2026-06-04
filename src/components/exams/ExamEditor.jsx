import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, Plus, Trash2, Sparkles, Save, Loader2,
  ChevronDown, BookOpen, Clock, CheckSquare
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import courseData from "../../lib/courseData";



function emptyQuestion() {
  return { text: "", type: "mcq", options: ["", "", "", ""], answer: "" };
}

export default function ExamEditor({ exam, onSave, onCancel }) {
  const [title, setTitle] = useState(exam?.title || "");
  const [topicId, setTopicId] = useState(exam?.topic_id || "");
  const [topicTitle, setTopicTitle] = useState(exam?.topic_title || "");
  const [sectionTitle, setSectionTitle] = useState(exam?.section_title || "");
  const [questions, setQuestions] = useState(exam?.questions || [emptyQuestion()]);
  const [duration, setDuration] = useState(exam?.duration_minutes || 30);
  const [status, setStatus] = useState(exam?.status || "draft");
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [openQ, setOpenQ] = useState(0);

  // Flatten all topics for topic selector
  const allTopics = courseData.flatMap((section) =>
    section.topics.map((topic) => ({
      id: topic.id,
      title: topic.title,
      sectionTitle: section.title,
      content: topic.content,
    }))
  );

  const selectedTopic = allTopics.find((t) => t.id === topicId);

  const handleTopicChange = (id) => {
    const t = allTopics.find((x) => x.id === id);
    setTopicId(id);
    setTopicTitle(t?.title || "");
    setSectionTitle(t?.sectionTitle || "");
    if (!title && t) setTitle(`امتحان: ${t.title}`);
  };

  const generateQuestions = async () => {
    if (!selectedTopic) return;
    setGenerating(true);
    try {
      const prompt = `أنت أستاذ شبكات حاسوب متخصص. أنشئ 5 أسئلة امتحان متنوعة باللغة العربية حول الموضوع التالي:

الموضوع: ${selectedTopic.title}
المحتوى: ${selectedTopic.content.slice(0, 1500)}

المطلوب: 3 أسئلة اختيار من متعدد (4 خيارات لكل سؤال) + سؤال صح/خطأ + سؤال إجابة قصيرة.

أجب بـ JSON فقط بهذا الشكل:
[
  {"text": "نص السؤال", "type": "mcq", "options": ["أ", "ب", "ج", "د"], "answer": "الإجابة الصحيحة"},
  {"text": "نص السؤال", "type": "truefalse", "options": ["صح", "خطأ"], "answer": "صح"},
  {"text": "نص السؤال", "type": "short", "options": [], "answer": "الإجابة النموذجية"}
]`;

      const raw = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            questions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  text: { type: "string" },
                  type: { type: "string" },
                  options: { type: "array", items: { type: "string" } },
                  answer: { type: "string" },
                },
                required: ["text", "type", "options", "answer"],
              },
            },
          },
          required: ["questions"],
        },
      });

      const generated = Array.isArray(raw) ? raw : (raw?.questions || JSON.parse(raw));
      setQuestions(generated.map((q) => ({
        text: q.text || "",
        type: q.type || "mcq",
        options: q.options || [],
        answer: q.answer || "",
      })));
      setOpenQ(0);
    } catch (e) {
      alert("حدث خطأ أثناء توليد الأسئلة. حاول مرة أخرى.");
    } finally {
      setGenerating(false);
    }
  };

  const updateQuestion = (i, field, value) => {
    setQuestions((prev) => prev.map((q, idx) => idx === i ? { ...q, [field]: value } : q));
  };

  const updateOption = (qi, oi, value) => {
    setQuestions((prev) => prev.map((q, idx) => {
      if (idx !== qi) return q;
      const options = [...q.options];
      options[oi] = value;
      return { ...q, options };
    }));
  };

  const addQuestion = () => {
    setQuestions((prev) => [...prev, emptyQuestion()]);
    setOpenQ(questions.length);
  };

  const removeQuestion = (i) => {
    setQuestions((prev) => prev.filter((_, idx) => idx !== i));
    if (openQ >= i) setOpenQ(Math.max(0, openQ - 1));
  };

  const handleSave = async (newStatus = status) => {
    if (!title.trim()) { alert("أدخل عنوان الامتحان"); return; }
    if (questions.length === 0) { alert("أضف سؤالاً واحداً على الأقل"); return; }
    setSaving(true);
    try {
      await onSave({
        title: title.trim(),
        topic_id: topicId,
        topic_title: topicTitle,
        section_title: sectionTitle,
        questions,
        duration_minutes: duration,
        status: newStatus,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: "#020617" }}>
      {/* Header */}
      <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-3"
        style={{ background: "rgba(2,6,23,0.98)", borderBottom: "1px solid rgba(6,182,212,0.15)" }}>
        <div className="flex items-center gap-3">
          <button onClick={onCancel} className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors text-sm">
            <ChevronLeft size={16} /> رجوع
          </button>
          <span className="text-slate-600">|</span>
          <span className="font-black text-sm" style={{
            background: "linear-gradient(90deg,#06b6d4,#a78bfa)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
          }}>
            {exam ? "تعديل الامتحان" : "إنشاء امتحان جديد"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSave("draft")}
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", color: "#94a3b8" }}
          >
            {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
            حفظ مسودة
          </button>
          <button
            onClick={() => handleSave("published")}
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all hover:brightness-110"
            style={{ background: "linear-gradient(135deg,#059669,#10b981)" }}
          >
            {saving ? <Loader2 size={12} className="animate-spin" /> : <CheckSquare size={12} />}
            نشر الامتحان
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        {/* Basic info */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-6"
          style={{ background: "rgba(12,20,40,0.95)", border: "1px solid rgba(6,182,212,0.15)" }}
        >
          <h2 className="text-sm font-black text-cyan-400 uppercase tracking-wider mb-4">معلومات الامتحان</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1.5">عنوان الامتحان *</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="مثال: امتحان الفصل الثاني - عناوين IP"
                className="w-full px-4 py-2.5 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(6,182,212,0.2)", direction: "rtl" }}
                dir="rtl"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5">الدرس / الموضوع</label>
                <select
                  value={topicId}
                  onChange={(e) => handleTopicChange(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl text-sm text-white focus:outline-none"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(6,182,212,0.2)", direction: "rtl" }}
                  dir="rtl"
                >
                  <option value="">— اختر درساً —</option>
                  {courseData.map((section) => (
                    <optgroup key={section.id} label={section.title}>
                      {section.topics.map((topic) => (
                        <option key={topic.id} value={topic.id}>{topic.title}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5">
                  <Clock size={11} className="inline ml-1" />مدة الامتحان (دقيقة)
                </label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  min={5} max={180}
                  className="w-full px-4 py-2.5 rounded-xl text-sm text-white focus:outline-none"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(6,182,212,0.2)" }}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* AI Generation */}
        {topicId && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-5 flex items-center justify-between gap-4"
            style={{ background: "rgba(139,92,246,0.07)", border: "1px solid rgba(139,92,246,0.25)" }}
          >
            <div>
              <div className="text-sm font-black text-purple-300 flex items-center gap-2">
                <Sparkles size={14} /> توليد أسئلة بالذكاء الاصطناعي
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                سيتم توليد 5 أسئلة تلقائية من محتوى درس "{topicTitle}"
              </div>
            </div>
            <button
              onClick={generateQuestions}
              disabled={generating}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 disabled:opacity-60 flex-shrink-0"
              style={{ background: "linear-gradient(135deg,#7c3aed,#06b6d4)" }}
            >
              {generating ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
              {generating ? "جاري التوليد..." : "توليد الأسئلة"}
            </button>
          </motion.div>
        )}

        {/* Questions */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-black text-cyan-400 uppercase tracking-wider">
              الأسئلة ({questions.length})
            </h2>
            <button
              onClick={addQuestion}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all hover:scale-105"
              style={{ background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.3)", color: "#06b6d4" }}
            >
              <Plus size={12} /> سؤال جديد
            </button>
          </div>

          <div className="space-y-3">
            {questions.map((q, qi) => (
              <QuestionCard
                key={qi}
                index={qi}
                question={q}
                isOpen={openQ === qi}
                onToggle={() => setOpenQ(openQ === qi ? -1 : qi)}
                onChange={(field, value) => updateQuestion(qi, field, value)}
                onOptionChange={(oi, value) => updateOption(qi, oi, value)}
                onRemove={() => removeQuestion(qi)}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function QuestionCard({ index, question, isOpen, onToggle, onChange, onOptionChange, onRemove }) {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(12,20,40,0.95)", border: "1px solid rgba(6,182,212,0.12)" }}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer select-none"
        onClick={onToggle}
        style={{ borderBottom: isOpen ? "1px solid rgba(6,182,212,0.1)" : "none" }}
      >
        <div className="flex items-center gap-3">
          <span className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0"
            style={{ background: "rgba(6,182,212,0.15)", color: "#06b6d4" }}>
            {index + 1}
          </span>
          <span className="text-sm text-slate-300 truncate max-w-xs">
            {question.text || "سؤال جديد..."}
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full border text-slate-500 border-slate-700 flex-shrink-0">
            {QUESTION_TYPES.find(t => t.value === question.type)?.label}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            className="p-1 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-400/10 transition-colors"
          >
            <Trash2 size={12} />
          </button>
          {isOpen ? <ChevronDown size={14} className="text-slate-500" /> : <ChevronLeft size={14} className="text-slate-500 -rotate-90" />}
        </div>
      </div>

      {/* Body */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 py-4 space-y-4">
              {/* Question text */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1.5">نص السؤال</label>
                <textarea
                  value={question.text}
                  onChange={(e) => onChange("text", e.target.value)}
                  placeholder="اكتب السؤال هنا..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none resize-none"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(6,182,212,0.15)", direction: "rtl" }}
                  dir="rtl"
                />
              </div>

              {/* Type */}
              <div className="flex gap-2 flex-wrap">
                {QUESTION_TYPES.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => onChange("type", t.value)}
                    className="px-3 py-1 rounded-lg text-[11px] font-bold transition-all"
                    style={{
                      background: question.type === t.value ? "rgba(6,182,212,0.18)" : "rgba(255,255,255,0.03)",
                      border: `1px solid ${question.type === t.value ? "rgba(6,182,212,0.45)" : "rgba(255,255,255,0.07)"}`,
                      color: question.type === t.value ? "#06b6d4" : "#64748b",
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Options */}
              {question.type === "mcq" && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1.5">الخيارات</label>
                  <div className="space-y-2">
                    {(question.options.length >= 4 ? question.options : [...question.options, ...Array(4 - question.options.length).fill("")]).slice(0, 4).map((opt, oi) => (
                      <div key={oi} className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-black flex-shrink-0"
                          style={{ background: "rgba(6,182,212,0.1)", color: "#06b6d4" }}>
                          {String.fromCharCode(0x0623 + oi)}
                        </span>
                        <input
                          value={opt}
                          onChange={(e) => onOptionChange(oi, e.target.value)}
                          placeholder={`الخيار ${oi + 1}`}
                          className="flex-1 px-3 py-1.5 rounded-lg text-xs text-white placeholder:text-slate-600 focus:outline-none"
                          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(6,182,212,0.12)", direction: "rtl" }}
                          dir="rtl"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {question.type === "truefalse" && (
                <div className="flex gap-3">
                  {["صح", "خطأ"].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => onChange("answer", opt)}
                      className="flex-1 py-2 rounded-xl text-sm font-bold transition-all"
                      style={{
                        background: question.answer === opt ? (opt === "صح" ? "rgba(52,211,153,0.15)" : "rgba(239,68,68,0.15)") : "rgba(255,255,255,0.03)",
                        border: `1px solid ${question.answer === opt ? (opt === "صح" ? "rgba(52,211,153,0.4)" : "rgba(239,68,68,0.4)") : "rgba(255,255,255,0.07)"}`,
                        color: question.answer === opt ? (opt === "صح" ? "#34d399" : "#f87171") : "#64748b",
                      }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}

              {/* Answer */}
              {question.type !== "truefalse" && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1.5">
                    {question.type === "mcq" ? "الإجابة الصحيحة (اكتب نص الخيار)" : "الإجابة النموذجية"}
                  </label>
                  <input
                    value={question.answer}
                    onChange={(e) => onChange("answer", e.target.value)}
                    placeholder={question.type === "mcq" ? "انسخ نص الإجابة الصحيحة" : "الإجابة المثالية..."}
                    className="w-full px-3 py-2 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none"
                    style={{ background: "rgba(52,211,153,0.04)", border: "1px solid rgba(52,211,153,0.2)", direction: "rtl" }}
                    dir="rtl"
                  />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const QUESTION_TYPES = [
  { value: "mcq", label: "اختيار من متعدد" },
  { value: "truefalse", label: "صح / خطأ" },
  { value: "short", label: "إجابة قصيرة" },
];