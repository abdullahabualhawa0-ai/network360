import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { syncProgressToServer } from "@/lib/progressSync";
import quizData from "../lib/quizData";
import terminalData from "../lib/terminalData";
import TerminalSimulator from "../components/TerminalSimulator";
import QuizSection from "../components/QuizSection";
import TextToSpeech from "../components/TextToSpeech";
import ReadingGate from "../components/ReadingGate";
import courseData from "../lib/courseData";
import ReactMarkdown from "react-markdown";
import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { 
  Network, Globe, Shield, Server, Radio, Cpu, Route, Tag, FlaskConical, Zap, Clock
} from "lucide-react";
import { SCENARIOS, DIFF_LABEL_KEYS } from "../lib/scenarios";
import { scenarioTitle } from "@/lib/scenarioI18n";
import { t, useLang } from "@/lib/i18n";
import { sectionTitle, topicTitle } from "@/lib/courseI18n";
import useAiTranslation from "@/lib/useAiTranslation";

const iconMap = {
  Network, Globe, Shield, Server, Radio, Cpu, Route, Tag
};

// Track visited topics for dashboard
function markTopicVisited(topicId) {
  try {
    const data = JSON.parse(localStorage.getItem("topic-progress") || "{}");
    data[topicId] = { visited: true, visitedAt: new Date().toISOString() };
    localStorage.setItem("topic-progress", JSON.stringify(data));
  } catch {}
}

export default function TopicPage() {
  const { sectionId, topicId } = useParams();
  const navigate = useNavigate();
  useLang();

  const section = courseData.find(s => s.id === sectionId);
  const topic = section?.topics.find(tp => tp.id === topicId);

  // ترجمة محتوى الدرس آلياً عند اختيار لغة غير العربية (تُخزَّن مرة واحدة لكل درس)
  const { content: displayContent, translating } = useAiTranslation(topicId, topic?.content || "");

  // Mark as visited + Event Tracking + sync
  useEffect(() => {
    markTopicVisited(topicId);
    base44.analytics.track({
      eventName: "topic_visited",
      properties: {
        topic_id: topicId,
        topic_title: topic?.title || "",
        section_id: sectionId,
        section_title: section?.title || "",
      }
    });
    syncProgressToServer();
  }, [topicId]);

  if (!section || !topic) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-bold text-foreground mb-2">{t("topicNotFound")}</h2>
          <Link to="/" className="text-primary hover:underline text-sm">{t("backHome")}</Link>
        </div>
      </div>
    );
  }

  const Icon = iconMap[section.icon] || Network;
  const currentIndex = section.topics.findIndex(t => t.id === topicId);
  const prevTopic = currentIndex > 0 ? section.topics[currentIndex - 1] : null;
  const nextTopic = currentIndex < section.topics.length - 1 ? section.topics[currentIndex + 1] : null;

  // Find next section for cross-section navigation
  const sectionIndex = courseData.findIndex(s => s.id === sectionId);
  const nextSection = !nextTopic && sectionIndex < courseData.length - 1 
    ? courseData[sectionIndex + 1] : null;
  const prevSection = !prevTopic && sectionIndex > 0 
    ? courseData[sectionIndex - 1] : null;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="relative overflow-hidden border-b border-border" style={{ background: "#F7F9FC" }}>
        <div className="relative max-w-4xl mx-auto px-6 py-10 lg:py-14">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm mb-4" style={{ color: "rgba(47,102,144,0.75)" }}>
              <Link to="/" className="transition-colors hover:text-primary">{t("backHome")}</Link>
              <ChevronLeft size={14} />
              <span>{sectionTitle(section)}</span>
              <ChevronLeft size={14} />
              <span style={{ color: "#173F5F" }}>{topicTitle(topic)}</span>
            </div>

            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#2F6690" }}>
                <Icon className="text-white" size={20} />
              </div>
              <span className="text-sm font-medium" style={{ color: "#2F6690" }}>{sectionTitle(section)}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black" style={{ color: "#173F5F" }}>{topicTitle(topic)}</h1>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-card rounded-2xl border border-border p-6 sm:p-8 shadow-sm"
        >
          {/* TTS button */}
          <div className="flex justify-end mb-4">
            <TextToSpeech text={displayContent} label={t("ttsReadLabel")} />
          </div>

          {/* شريط الترجمة الآلية أثناء تجهيز النص */}
          {translating && (
            <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-xl text-[11px] font-bold"
              style={{ background: "rgba(47,102,144,0.07)", border: "1px solid rgba(47,102,144,0.25)", color: "#2F6690" }}>
              <Loader2 size={12} className="animate-spin" /> {t("translatingLesson")}
            </div>
          )}

          <ReactMarkdown
            className="prose prose-sm sm:prose-base prose-slate max-w-none
              prose-headings:font-bold prose-headings:text-foreground
              prose-h2:text-xl prose-h2:mt-0 prose-h2:mb-4
              prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-3
              prose-h4:text-base prose-h4:mt-4
              prose-p:text-muted-foreground prose-p:leading-relaxed
              prose-strong:text-foreground
              prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono prose-code:text-primary
              prose-pre:bg-slate-900 prose-pre:text-slate-100 prose-pre:rounded-xl prose-pre:p-4 prose-pre:text-sm prose-pre:overflow-x-auto prose-pre:direction-ltr prose-pre:text-left
              prose-table:text-sm
              prose-th:bg-muted prose-th:px-3 prose-th:py-2 prose-th:font-semibold
              prose-td:px-3 prose-td:py-2 prose-td:border-b prose-td:border-border
              prose-li:text-muted-foreground
              prose-blockquote:border-primary prose-blockquote:bg-primary/5 prose-blockquote:rounded-lg prose-blockquote:py-1 prose-blockquote:px-4
              prose-a:text-primary prose-a:no-underline hover:prose-a:underline"
            components={{
              code: ({ inline, className, children, ...props }) => {
                if (!inline && className) {
                  return (
                    <pre className="bg-slate-900 text-slate-100 rounded-xl p-4 overflow-x-auto text-sm" dir="ltr" style={{ textAlign: 'left' }}>
                      <code className={className} {...props}>{children}</code>
                    </pre>
                  );
                }
                if (!inline) {
                  return (
                    <pre className="bg-slate-900 text-slate-100 rounded-xl p-4 overflow-x-auto text-sm" dir="ltr" style={{ textAlign: 'left' }}>
                      <code {...props}>{children}</code>
                    </pre>
                  );
                }
                return <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-primary" {...props}>{children}</code>;
              }
            }}
          >
            {displayContent}
          </ReactMarkdown>
        </motion.div>

        {/* Terminal Simulator */}
        {terminalData[topicId] && (
          <div className="bg-card rounded-2xl border border-border p-6 sm:p-8 shadow-sm mt-6">
            <TerminalSimulator terminalConfig={terminalData[topicId]} />
          </div>
        )}

        {/* Quiz — gated by reading time */}
        {quizData[topicId] && (
          <div className="mt-6">
            <ReadingGate content={displayContent}>
              <div className="bg-card rounded-2xl border border-border p-6 sm:p-8 shadow-sm">
                <div className="flex justify-end mb-2">
                  <TextToSpeech
                    text={quizData[topicId].questions.map((q, i) => `${t("lessonLabel")} ${i+1}: ${q.question}`).join(". ")}
                    label={t("ttsReadQuestions")}
                  />
                </div>
                <QuizSection quiz={{ ...quizData[topicId], id: topicId }} />
              </div>
            </ReadingGate>
          </div>
        )}

        {/* سيناريوهات هذا الدرس — العملية على المحاكي */}
        {(() => {
          const lessonScenarios = SCENARIOS.filter((s) => s.lessonId === topicId);
          if (!lessonScenarios.length) return null;
          return (
            <div className="mt-6 bg-card rounded-2xl border border-border p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <FlaskConical size={17} className="text-primary" />
                <h2 className="font-black text-base">{t("lessonScenariosTitle")}</h2>
              </div>
              <p className="text-[11px] text-muted-foreground mb-4">{t("lessonScenariosDesc")}</p>
              <div className="grid sm:grid-cols-2 gap-3">
                {lessonScenarios.map((sc) => (
                  <Link key={sc.id} to={`/scenario-lab?lesson=${topicId}&open=${sc.id}`}
                    className="rounded-xl p-4 transition-all hover:shadow-md"
                    style={{ background: "rgba(47,102,144,0.04)", border: "1px solid rgba(47,102,144,0.22)" }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xl">{sc.icon}</span>
                      <span className={`text-[10px] border px-2 py-0.5 rounded-full font-bold ${sc.diffColor}`}>
                        {t(DIFF_LABEL_KEYS[sc.difficulty] || "diffMedium")}
                      </span>
                    </div>
                    <div className="text-sm font-bold mb-1.5">{scenarioTitle(sc)}</div>
                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock size={11} /> {sc.time}</span>
                      <span className="flex items-center gap-1"><Zap size={11} className="text-warning" /> {sc.xp} XP</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          );
        })()}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 gap-4">
          {(prevTopic || prevSection) ? (
            <Link
              to={prevTopic 
                ? `/topic/${sectionId}/${prevTopic.id}` 
                : `/topic/${prevSection.id}/${prevSection.topics[prevSection.topics.length - 1].id}`
              }
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-card border border-border hover:shadow-md transition-all group flex-1 max-w-xs"
            >
              <ArrowRight size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
              <div className="text-right">
                <div className="text-[10px] text-muted-foreground">{t("navPrev")}</div>
                <div className="text-sm font-medium text-foreground truncate">
                  {prevTopic ? topicTitle(prevTopic) : topicTitle(prevSection.topics[prevSection.topics.length - 1])}
                </div>
              </div>
            </Link>
          ) : <div />}

          {(nextTopic || nextSection) ? (
            <Link
              to={nextTopic 
                ? `/topic/${sectionId}/${nextTopic.id}` 
                : `/topic/${nextSection.id}/${nextSection.topics[0].id}`
              }
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-card border border-border hover:shadow-md transition-all group flex-1 max-w-xs justify-end"
            >
              <div className="text-left">
                <div className="text-[10px] text-muted-foreground">{t("navNext")}</div>
                <div className="text-sm font-medium text-foreground truncate">
                  {nextTopic ? topicTitle(nextTopic) : topicTitle(nextSection.topics[0])}
                </div>
              </div>
              <ArrowLeft size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
            </Link>
          ) : <div />}
        </div>
      </div>
    </div>
  );
}