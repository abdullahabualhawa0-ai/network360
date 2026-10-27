import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, Plus, Trash2, Sparkles, Save, Loader2,
  ChevronDown, Clock, Check, BookOpen, FileText, GraduationCap,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import courseData from "../../lib/courseData";
import { sectionTitle as sectionTitleTr, topicTitle as topicTitleTr } from "@/lib/courseI18n";
import { t, useLang, useDir, getLang } from "@/lib/i18n";
import { useDialogs } from "@/components/DialogProvider";

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

export default function ExamEditor({ exam, onSave, onCancel, availableClasses = [] }) {
  const { alertDialog } = useDialogs();
  useLang();
  const direction = useDir();
  const [title, setTitle] = useState(exam?.title || "");
  const [topicId, setTopicId] = useState(exam?.topic_id || "");
  const [topicTitle, setTopicTitle] = useState(exam?.topic_title || "");
  const [sectionTitle, setSectionTitle] = useState(exam?.section_title || "");
  const [questions, setQuestions] = useState(exam?.questions || [emptyQuestion()]);
  const [duration, setDuration] = useState(exam?.duration_minutes || 30);
  const [status] = useState(exam?.status || "draft");
  const [targetClasses, setTargetClasses] = useState(() => {
    if (Array.isArray(exam?.target_classes) && exam.target_classes.length > 0) {
      return exam.target_classes;
    }
    if (Array.isArray(availableClasses) && availableClasses.length > 0) {
      return availableClasses;
    }
    return [];
  });
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [openQ, setOpenQ] = useState(0);

  const toggleClass = (clsName) => {
    setTargetClasses((prev) =>
      prev.includes(clsName) ? prev.filter((c) => c !== clsName) : [...prev, clsName]
    );
  };
  const selectAllClasses = () => setTargetClasses([...availableClasses]);
  const clearAllClasses = () => setTargetClasses([]);

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
      await alertDialog(t("examEditorSelectAtLeastOne"));
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
    } catch {
      await alertDialog(t("examEditorGenError"));
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
    if (!title.trim()) { await alertDialog(t("examEditorErrTitle")); return; }
    if (questions.length === 0) { await alertDialog(t("examEditorErrQuestions")); return; }
    setSaving(true);
    try {
      await onSave({
        title: title.trim(),
        topic_id: topicId,
        topic_title: topicTitle,
        section_title: sectionTitle,
        questions,
        duration_minutes: duration,
        target_classes: targetClasses,
        status: newStatus,
      });
    } finally {
      setSaving(false);
    }
  };

  const labelCls = "block text-[11px] font-bold text-muted-foreground mb-1.5";

  return (
    <div className="min-h-screen bg-background font-main text-foreground" dir={direction}>
      {/* Header */}
      <div className="sticky top-0 z-20 flex items-center justify-between px-4 sm:px-6 py-3 bg-card border-b border-border">
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="flex items-center gap-1.5 text-sm transition-colors text-brand hover:underline"
          >
            <ChevronLeft size={16} /> {t("examEditorBack")}
          </button>
          <span className="text-border">|</span>
          <span className="font-black text-sm text-foreground">
            {exam ? t("examEditorEdit") : t("examEditorCreate")}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSave("draft")}
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2 rounded-[10px] text-xs font-bold transition-all disabled:opacity-60 bg-warning/10 border border-warning/35 text-warning hover:bg-warning/20"
          >
            {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
            {t("examEditorSaveDraft")}
          </button>
          <button
            onClick={() => handleSave("published")}
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2 rounded-[10px] text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-all disabled:opacity-60"
          >
            {saving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
            {t("examEditorPublish")}
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Basic info */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[16px] p-5 sm:p-6 bg-card border border-border"
        >
          <div className="flex items-center gap-2 mb-4 text-brand">
            <FileText size={15} />
            <h2 className="text-sm font-black text-foreground">{t("examEditorInfo")}</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className={labelCls}>{t("examEditorTitle")}</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t("examEditorTitlePh")}
                className="w-full px-4 py-2.5 rounded-[10px] text-sm text-foreground focus:outline-none bg-background border border-input"
              />
            </div>
            <div>
              <label className={labelCls}>
                <Clock size={11} className="inline ml-1" />{t("examEditorDuration")}
              </label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                min={5}
                max={180}
                className="w-full px-4 py-2.5 rounded-[10px] text-sm text-foreground focus:outline-none bg-background border border-input"
              />
            </div>
          </div>
        </motion.div>

        {/* Lesson selection */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[16px] p-5 sm:p-6 bg-card border border-border"
        >
          <div className="flex items-center gap-2 mb-1 text-brand">
            <BookOpen size={15} />
            <h2 className="text-sm font-black text-foreground">{t("examEditorSelectLesson")}</h2>
          </div>
          <p className="text-[11px] text-muted-foreground mb-4">{t("examEditorSelectLessonDesc")}</p>

          {selectedTopic && (
            <div className="mb-4 rounded-[10px] p-3 flex items-center gap-2 bg-accent border border-border">
              <Check size={14} className="text-brand" />
              <div>
                <span className="text-[10px] text-muted-foreground">{t("examEditorLessonSelected")}: </span>
                <span className="text-xs font-bold text-foreground">
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
                  <button
                    key={topic.id}
                    onClick={() => handleTopicChange(topic.id)}
                    className={`text-start rounded-[10px] p-3 transition-all flex items-start gap-2.5 border ${
                      active ? "bg-accent border-primary" : "bg-background border-border hover:bg-muted"
                    }`}
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      {active ? (
                        <div className="w-5 h-5 rounded-full flex items-center justify-center bg-primary text-primary-foreground">
                          <Check size={11} />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full border border-border" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] text-muted-foreground truncate">{sectionTitleTr(section)}</div>
                      <div className={`text-xs font-bold truncate ${active ? "text-brand" : "text-foreground"}`}>
                        {topicTitleTr(topic)}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </motion.div>

        {/* AI Generation */}
        {topicId && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[16px] p-5 sm:p-6 bg-card border border-border"
          >
            <div className="flex items-center gap-2 mb-1 text-brand">
              <Sparkles size={15} />
              <h2 className="text-sm font-black text-foreground">{t("examEditorAiGen")}</h2>
            </div>
            <p className="text-[11px] text-muted-foreground mb-4">{t("examEditorAiDesc")}</p>

            {/* عدد الأسئلة */}
            <div className="mb-4">
              <label className={labelCls}>{t("examEditorQuestionCount")}</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuestionCount(Math.max(1, questionCount - 1))}
                  className="w-9 h-9 rounded-[10px] flex items-center justify-center text-sm font-black bg-background border border-border text-foreground hover:bg-accent"
                >
                  −
                </button>
                <input
                  type="number"
                  value={questionCount}
                  min={1}
                  max={50}
                  onChange={(e) => setQuestionCount(Math.max(1, Math.min(50, Number(e.target.value) || 1)))}
                  className="w-20 px-3 py-2 rounded-[10px] text-sm font-bold text-center text-foreground focus:outline-none bg-background border border-input"
                />
                <button
                  onClick={() => setQuestionCount(Math.min(50, questionCount + 1))}
                  className="w-9 h-9 rounded-[10px] flex items-center justify-center text-sm font-black bg-background border border-border text-foreground hover:bg-accent"
                >
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
                    <button
                      key={qt.value}
                      onClick={() => toggleType(qt.value)}
                      className={`px-3 py-1.5 rounded-[10px] text-[11px] font-bold transition-all flex items-center gap-1.5 border ${
                        active
                          ? "bg-accent border-primary text-brand"
                          : "bg-background border-border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {active && <Check size={11} className="text-brand" />}
                      {t(qt.labelKey)}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={generateQuestions}
              disabled={generating || selectedTypes.length === 0}
              className="flex items-center gap-2 px-5 py-2.5 rounded-[10px] text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-all disabled:opacity-60"
            >
              {generating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
              {generating ? t("examEditorGenerating") : t("examEditorGenerate")}
            </button>
          </motion.div>
        )}

        {/* Questions */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-black text-foreground">
              {t("examEditorQuestions")} ({questions.length})
            </h2>
            <button
              onClick={addQuestion}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-xs font-bold border border-border text-brand hover:bg-accent"
            >
              <Plus size={12} /> {t("examEditorAddQuestion")}
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
  const labelCls = "block text-[11px] font-bold text-muted-foreground mb-1.5";

  return (
    <div className="rounded-[16px] overflow-hidden bg-card border border-border">
      {/* Header */}
      <div
        className={`flex items-center justify-between px-4 py-3 cursor-pointer select-none ${
          isOpen ? "border-b border-border" : ""
        }`}
        onClick={onToggle}
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="w-6 h-6 rounded-[6px] flex items-center justify-center text-xs font-black flex-shrink-0 bg-accent text-brand">
            {index + 1}
          </span>
          <span className="text-sm truncate text-foreground">
            {question.text || t("examEditorNewQuestion")}
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold flex-shrink-0 bg-muted border border-border text-muted-foreground">
            {QUESTION_TYPES.find((qt) => qt.value === question.type) ? t(QUESTION_TYPES.find((qt) => qt.value === question.type).labelKey) : question.type}
          </span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            className="p-1 rounded-[6px] text-destructive hover:bg-destructive/10"
          >
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
                <textarea
                  value={question.text}
                  onChange={(e) => onChange("text", e.target.value)}
                  placeholder={t("examEditorQuestionTextPh")}
                  rows={2}
                  className="w-full px-3 py-2 rounded-[10px] text-sm text-foreground placeholder:text-muted-foreground focus:outline-none resize-none bg-background border border-input"
                />
              </div>

              {/* Type */}
              <div className="flex gap-2 flex-wrap">
                {QUESTION_TYPES.map((qt) => (
                  <button
                    key={qt.value}
                    onClick={() => onChange("type", qt.value)}
                    className={`px-3 py-1 rounded-[8px] text-[11px] font-bold transition-all border ${
                      question.type === qt.value
                        ? "bg-accent border-primary text-brand"
                        : "bg-background border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
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
                        <span className="w-5 h-5 rounded-[6px] flex items-center justify-center text-[10px] font-black flex-shrink-0 bg-accent text-brand">
                          {String.fromCharCode(0x0623 + oi)}
                        </span>
                        <input
                          value={opt}
                          onChange={(e) => onOptionChange(oi, e.target.value)}
                          placeholder={`${t("examEditorOptionN")} ${oi + 1}`}
                          className="flex-1 px-3 py-1.5 rounded-[8px] text-xs text-foreground placeholder:text-muted-foreground focus:outline-none bg-background border border-input"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {question.type === "truefalse" && (
                <div className="flex gap-3">
                  {[t("examEditorTrue"), t("examEditorFalse")].map((opt) => {
                    const isSelected = question.answer === opt;
                    const isTrue = opt === t("examEditorTrue");
                    return (
                      <button
                        key={opt}
                        onClick={() => onChange("answer", opt)}
                        className={`flex-1 py-2 rounded-[10px] text-sm font-bold transition-all border ${
                          isSelected
                            ? isTrue
                              ? "bg-success/15 border-success text-success"
                              : "bg-destructive/15 border-destructive text-destructive"
                            : "bg-background border-border text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Answer */}
              {question.type !== "truefalse" && (
                <div>
                  <label className={labelCls}>
                    {question.type === "mcq" ? t("examEditorCorrectAnswer") : t("examEditorModelAnswer")}
                  </label>
                  <input
                    value={question.answer}
                    onChange={(e) => onChange("answer", e.target.value)}
                    placeholder={question.type === "mcq" ? t("examEditorCopyAnswerPh") : t("examEditorModelAnswerPh")}
                    className="w-full px-3 py-2 rounded-[10px] text-xs text-foreground placeholder:text-muted-foreground focus:outline-none bg-background border border-input"
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