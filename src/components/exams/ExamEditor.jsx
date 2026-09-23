import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, Plus, Trash2, Sparkles, Save, Loader2,
  ChevronDown, Clock, Check, BookOpen, FileText,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import courseData from "../../lib/courseData";
import { sectionTitle as sectionTitleTr, topicTitle as topicTitleTr } from "@/lib/courseI18n";
import { t, useLang, useDir, getLang } from "@/lib/i18n";

const BRAND = {
  primary: "#173F5F",
  secondary: "#2F6690",
  accent: "#3A86A8",
  bg: "#F7F9FC",
  card: "#FFFFFF",
  border: "#E2E8F0",
  text: "#1F2937",
  success: "#2E7D5B",
  warning: "#D69E2E",
  error: "#C94C4C",
};

const QUESTION_TYPES = [
  { value: "mcq", labelKey: "examEditorTypeMcq" },
  { value: "truefalse", labelKey: "examEditorTypeTrueFalse" },
  { value: "short", labelKey: "examEditorTypeShort" },
  { value: "practical", labelKey: "examEditorTypePractical" },
  { value: "mixed", labelKey: "examEditorTypeMixed" },
];

function emptyQuestion() {
  return { text: "", type: "mcq", options: ["", "", "", ""], answer: "" };
}

export default function ExamEditor({ exam, onSave, onCancel }) {
  useLang();
  const direction = useDir();
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

  // إعدادات توليد الأسئلة
  const [questionCount, setQuestionCount] = useState(10);
  const [selectedTypes, setSelectedTypes] = useState(["mcq", "truefalse", "short"]);

  const allTopics = courseData.flatMap((section) =>
    section.topics.map((topic) => ({
      id: topic.id,
      title: topicTitleTr(topic),
      sectionTitle: sectionTitleTr(section),
      content: topic.content,
    }))
  );

  const selectedTopic = allTopics.find((tp) => tp.id === topicId);

  const handleTopicChange = (id) => {
    const tp = allTopics.find((x) => x.id === id);
    setTopicId(id);
    setTopicTitle(tp?.title || "");
    setSectionTitle(tp?.sectionTitle || "");
  };

  const toggleType = (val) => {
    setSelectedTypes((prev) =>
      prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]
    );
  };

  const generateQuestions = async () => {
    if (!selectedTopic) return;
    if (selectedTypes.length === 0) {
      alert(t("examEditorSelectAtLeastOne"));
      return;
    }
    setGenerating(true);
    try {
      const lang = getLang();
      const typesDesc = selectedTypes.map((v) => QUESTION_TYPES.find((qt) => qt.value === v)?.labelKey).map((k) => t(k)).join(lang === "ar" ? "، " : ", ");
      const prompt = `${t("aiGenPromptRole", lang).replace("{count}", questionCount)}

${t("aiGenPromptTopic", lang)}: ${selectedTopic.title}
${t("aiGenPromptContent", lang)}: ${selectedTopic.content.slice(0, 1500)}

${t("aiGenPromptReq", lang)}: ${questionCount} → ${typesDesc}.
${t("aiGenPromptDistribute", lang)}
- ${t("aiGenPromptMcqNote", lang)}
- ${t("aiGenPromptTFNote", lang)}
- ${t("aiGenPromptShortNote", lang)}

${t("aiGenPromptJsonFormat", lang)}
[
  {"text": "...", "type": "mcq", "options": ["...", "...", "...", "..."], "answer": "..."},
  {"text": "...", "type": "truefalse", "options": ["...", "..."], "answer": "..."},
  {"text": "...", "type": "short", "options": [], "answer": "..."}
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
      alert(t("examEditorGenError"));
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
    if (!title.trim()) { alert(t("examEditorErrTitle")); return; }
    if (questions.length === 0) { alert(t("examEditorErrQuestions")); return; }
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

  const inputStyle = { background: BRAND.bg, border: `1px solid ${BRAND.border}` };
  const labelCls = "block text-[11px] font-bold text-muted-foreground mb-1.5";

  return (
    <div className="min-h-screen" dir={direction} style={{ background: BRAND.bg }}>
      {/* Header */}
      <div className="sticky top-0 z-20 flex items-center justify-between px-4 sm:px-6 py-3"
        style={{ background: BRAND.card, borderBottom: `1px solid ${BRAND.border}` }}>
        <div className="flex items-center gap-3">
          <button onClick={onCancel}
            className="flex items-center gap-1.5 text-sm transition-colors"
            style={{ color: BRAND.secondary }}>
            <ChevronLeft size={16} /> {t("examEditorBack")}
          </button>
          <span style={{ color: BRAND.border }}>|</span>
          <span className="font-black text-sm" style={{ color: BRAND.primary }}>
            {exam ? t("examEditorEdit") : t("examEditorCreate")}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => handleSave("draft")} disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-60"
            style={{ background: "rgba(214,158,46,0.08)", border: "1px solid rgba(214,158,46,0.35)", color: BRAND.warning }}>
            {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
            {t("examEditorSaveDraft")}
          </button>
          <button onClick={() => handleSave("published")} disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all disabled:opacity-60"
            style={{ background: BRAND.success }}>
            {saving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
            {t("examEditorPublish")}
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Basic info */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-5 sm:p-6" style={{ background: BRAND.card, border: `1px solid ${BRAND.border}` }}>
          <div className="flex items-center gap-2 mb-4" style={{ color: BRAND.secondary }}>
            <FileText size={15} />
            <h2 className="text-sm font-black">{t("examEditorInfo")}</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className={labelCls}>{t("examEditorTitle")}</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)}
                placeholder={t("examEditorTitlePh")}
                className="w-full px-4 py-2.5 rounded-xl text-sm text-foreground focus:outline-none"
                style={inputStyle} />
            </div>
            <div>
              <label className={labelCls}>
                <Clock size={11} className="inline ml-1" />{t("examEditorDuration")}
              </label>
              <input type="number" value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                min={5} max={180}
                className="w-full px-4 py-2.5 rounded-xl text-sm text-foreground focus:outline-none"
                style={inputStyle} />
            </div>
          </div>
        </motion.div>

        {/* Lesson selection — بطاقات واضحة */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-5 sm:p-6" style={{ background: BRAND.card, border: `1px solid ${BRAND.border}` }}>
          <div className="flex items-center gap-2 mb-1" style={{ color: BRAND.secondary }}>
            <BookOpen size={15} />
            <h2 className="text-sm font-black">{t("examEditorSelectLesson")}</h2>
          </div>
          <p className="text-[11px] text-muted-foreground mb-4">{t("examEditorSelectLessonDesc")}</p>

          {selectedTopic && (
            <div className="mb-4 rounded-xl p-3 flex items-center gap-2"
              style={{ background: "rgba(58,134,168,0.08)", border: "1px solid rgba(58,134,168,0.35)" }}>
              <Check size={14} style={{ color: BRAND.accent }} />
              <div>
                <span className="text-[10px] text-muted-foreground">{t("examEditorLessonSelected")}: </span>
                <span className="text-xs font-bold" style={{ color: BRAND.primary }}>
                  {selectedTopic.sectionTitle} › {selectedTopic.title}
                </span>
              </div>
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-2.5 max-h-72 overflow-y-auto pr-1">
            {courseData.map((section) =>
              section.topics.map((topic) => {
                const active = topicId === topic.id;
                return (
                  <button key={topic.id} onClick={() => handleTopicChange(topic.id)}
                    className="text-start rounded-xl p-3 transition-all flex items-start gap-2.5"
                    style={{
                      background: active ? "rgba(58,134,168,0.06)" : BRAND.bg,
                      border: `1px solid ${active ? BRAND.accent : BRAND.border}`,
                    }}>
                    <div className="flex-shrink-0 mt-0.5">
                      {active ? (
                        <div className="w-5 h-5 rounded-full flex items-center justify-center"
                          style={{ background: BRAND.accent }}>
                          <Check size={11} className="text-white" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full" style={{ border: `1.5px solid ${BRAND.border}` }} />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] text-muted-foreground truncate">{sectionTitleTr(section)}</div>
                      <div className="text-xs font-bold truncate"
                        style={{ color: active ? BRAND.primary : BRAND.text }}>
                        {topicTitleTr(topic)}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </motion.div>

        {/* AI Generation — عدد ونوع الأسئلة قبل التوليد */}
        {topicId && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-5 sm:p-6" style={{ background: BRAND.card, border: `1px solid ${BRAND.border}` }}>
          <div className="flex items-center gap-2 mb-1" style={{ color: BRAND.secondary }}>
            <Sparkles size={15} />
            <h2 className="text-sm font-black">{t("examEditorAiGen")}</h2>
          </div>
          <p className="text-[11px] text-muted-foreground mb-4">{t("examEditorAiDesc")}</p>

          {/* عدد الأسئلة */}
          <div className="mb-4">
            <label className={labelCls}>{t("examEditorQuestionCount")}</label>
            <div className="flex items-center gap-3">
              <button onClick={() => setQuestionCount(Math.max(1, questionCount - 1))}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black"
                style={{ background: BRAND.bg, border: `1px solid ${BRAND.border}`, color: BRAND.primary }}>
                −
              </button>
              <input type="number" value={questionCount} min={1} max={50}
                onChange={(e) => setQuestionCount(Math.max(1, Math.min(50, Number(e.target.value) || 1)))}
                className="w-20 px-3 py-2 rounded-xl text-sm font-bold text-center text-foreground focus:outline-none"
                style={inputStyle} />
              <button onClick={() => setQuestionCount(Math.min(50, questionCount + 1))}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black"
                style={{ background: BRAND.bg, border: `1px solid ${BRAND.border}`, color: BRAND.primary }}>
                +
              </button>
            </div>
          </div>

          {/* نوع الأسئلة */}
          <div className="mb-4">
            <label className={labelCls}>{t("examEditorQuestionTypes")}</label>
            <div className="flex flex-wrap gap-2">
              {QUESTION_TYPES.map((qt) => {
                const active = selectedTypes.includes(qt.value);
                return (
                  <button key={qt.value} onClick={() => toggleType(qt.value)}
                    className="px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1.5"
                    style={{
                      background: active ? "rgba(58,134,168,0.1)" : BRAND.bg,
                      border: `1px solid ${active ? BRAND.accent : BRAND.border}`,
                      color: active ? BRAND.primary : "hsl(var(--muted-foreground))",
                    }}>
                    {active && <Check size={11} style={{ color: BRAND.accent }} />}
                    {t(qt.labelKey)}
                  </button>
                );
              })}
            </div>
          </div>

          <button onClick={generateQuestions} disabled={generating || selectedTypes.length === 0}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-60"
            style={{ background: BRAND.primary }}>
            {generating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            {generating ? t("examEditorGenerating") : t("examEditorGenerate")}
          </button>
          </motion.div>
        )}

        {/* Questions */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-black" style={{ color: BRAND.primary }}>
              {t("examEditorQuestions")} ({questions.length})
            </h2>
            <button onClick={addQuestion}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
              style={{ background: "rgba(47,102,144,0.08)", border: "1px solid rgba(47,102,144,0.25)", color: BRAND.secondary }}>
              <Plus size={12} /> {t("examEditorAddQuestion")}
            </button>
          </div>

          <div className="space-y-3">
            {questions.map((q, qi) => (
              <QuestionCard key={qi} index={qi} question={q}
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
  const labelCls = "block text-[11px] font-bold text-muted-foreground mb-1.5";
  const inputStyle = { background: BRAND.bg, border: `1px solid ${BRAND.border}` };

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: BRAND.card, border: `1px solid ${BRAND.border}` }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 cursor-pointer select-none"
        onClick={onToggle}
        style={{ borderBottom: isOpen ? `1px solid ${BRAND.border}` : "none" }}>
        <div className="flex items-center gap-3 min-w-0">
          <span className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0"
            style={{ background: "rgba(47,102,144,0.1)", color: BRAND.secondary }}>
            {index + 1}
          </span>
          <span className="text-sm truncate" style={{ color: BRAND.text }}>
            {question.text || t("examEditorNewQuestion")}
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold flex-shrink-0"
            style={{ background: "rgba(47,102,144,0.06)", border: `1px solid ${BRAND.border}`, color: BRAND.secondary }}>
            {QUESTION_TYPES.find((qt) => qt.value === question.type) ? t(QUESTION_TYPES.find((qt) => qt.value === question.type).labelKey) : question.type}
          </span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button onClick={(e) => { e.stopPropagation(); onRemove(); }}
            className="p-1 rounded-lg transition-colors" style={{ color: BRAND.error }}>
            <Trash2 size={12} />
          </button>
          {isOpen ? <ChevronDown size={14} className="text-muted-foreground" /> : <ChevronLeft size={14} className="text-muted-foreground -rotate-90" />}
        </div>
      </div>

      {/* Body */}
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden">
            <div className="px-4 py-4 space-y-4">
              {/* Question text */}
              <div>
                <label className={labelCls}>{t("examEditorQuestionText")}</label>
                <textarea value={question.text} onChange={(e) => onChange("text", e.target.value)}
                  placeholder={t("examEditorQuestionTextPh")} rows={2}
                  className="w-full px-3 py-2 rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none resize-none"
                  style={inputStyle} />
              </div>

              {/* Type */}
              <div className="flex gap-2 flex-wrap">
                {QUESTION_TYPES.map((qt) => (
                  <button key={qt.value} onClick={() => onChange("type", qt.value)}
                    className="px-3 py-1 rounded-lg text-[11px] font-bold transition-all"
                    style={{
                      background: question.type === qt.value ? "rgba(58,134,168,0.12)" : BRAND.bg,
                      border: `1px solid ${question.type === qt.value ? BRAND.accent : BRAND.border}`,
                      color: question.type === qt.value ? BRAND.primary : "hsl(var(--muted-foreground))",
                    }}>
                    {t(qt.labelKey)}
                  </button>
                ))}
              </div>

              {/* Options */}
              {question.type === "mcq" && (
                <div>
                  <label className={labelCls}>{t("examEditorOptions")}</label>
                  <div className="space-y-2">
                    {(question.options.length >= 4 ? question.options : [...question.options, ...Array(4 - question.options.length).fill("")]).slice(0, 4).map((opt, oi) => (
                      <div key={oi} className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-black flex-shrink-0"
                          style={{ background: "rgba(47,102,144,0.08)", color: BRAND.secondary }}>
                          {String.fromCharCode(0x0623 + oi)}
                        </span>
                        <input value={opt} onChange={(e) => onOptionChange(oi, e.target.value)}
                          placeholder={`${t("examEditorOptionN")} ${oi + 1}`}
                          className="flex-1 px-3 py-1.5 rounded-lg text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
                          style={inputStyle} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {question.type === "truefalse" && (
                <div className="flex gap-3">
                  {[t("examEditorTrue"), t("examEditorFalse")].map((opt) => (
                    <button key={opt} onClick={() => onChange("answer", opt)}
                      className="flex-1 py-2 rounded-xl text-sm font-bold transition-all"
                      style={{
                        background: question.answer === opt
                          ? (opt === t("examEditorTrue") ? "rgba(46,125,91,0.1)" : "rgba(201,76,76,0.1)")
                          : BRAND.bg,
                        border: `1px solid ${question.answer === opt
                          ? (opt === t("examEditorTrue") ? "rgba(46,125,91,0.4)" : "rgba(201,76,76,0.4)")
                          : BRAND.border}`,
                        color: question.answer === opt
                          ? (opt === t("examEditorTrue") ? BRAND.success : BRAND.error)
                          : "hsl(var(--muted-foreground))",
                      }}>
                      {opt}
                    </button>
                  ))}
                </div>
              )}

              {/* Answer */}
              {question.type !== "truefalse" && (
                <div>
                  <label className={labelCls}>
                    {question.type === "mcq" ? t("examEditorCorrectAnswer") : t("examEditorModelAnswer")}
                  </label>
                  <input value={question.answer} onChange={(e) => onChange("answer", e.target.value)}
                    placeholder={question.type === "mcq" ? t("examEditorCopyAnswerPh") : t("examEditorModelAnswerPh")}
                    className="w-full px-3 py-2 rounded-xl text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
                    style={{ background: "rgba(46,125,91,0.04)", border: "1px solid rgba(46,125,91,0.2)" }} />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}