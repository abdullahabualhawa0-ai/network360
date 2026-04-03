import { useParams, Link, useNavigate } from "react-router-dom";
import courseData from "../lib/courseData";
import ReactMarkdown from "react-markdown";
import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { 
  Network, Globe, Shield, Server, Radio, Cpu, Route, Tag
} from "lucide-react";

const iconMap = {
  Network, Globe, Shield, Server, Radio, Cpu, Route, Tag
};

export default function TopicPage() {
  const { sectionId, topicId } = useParams();
  const navigate = useNavigate();

  const section = courseData.find(s => s.id === sectionId);
  const topic = section?.topics.find(t => t.id === topicId);

  if (!section || !topic) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-bold text-foreground mb-2">الموضوع غير موجود</h2>
          <Link to="/" className="text-primary hover:underline text-sm">العودة للرئيسية</Link>
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
      <div className={`bg-gradient-to-bl ${section.color} relative overflow-hidden`}>
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative max-w-4xl mx-auto px-6 py-10 lg:py-14">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-white/70 text-sm mb-4">
              <Link to="/" className="hover:text-white transition-colors">الرئيسية</Link>
              <ChevronLeft size={14} />
              <span>{section.title}</span>
              <ChevronLeft size={14} />
              <span className="text-white">{topic.title}</span>
            </div>

            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Icon className="text-white" size={20} />
              </div>
              <span className="text-white/80 text-sm font-medium">{section.title}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">{topic.title}</h1>
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
            {topic.content}
          </ReactMarkdown>
        </motion.div>

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
                <div className="text-[10px] text-muted-foreground">السابق</div>
                <div className="text-sm font-medium text-foreground truncate">
                  {prevTopic ? prevTopic.title : prevSection.topics[prevSection.topics.length - 1].title}
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
                <div className="text-[10px] text-muted-foreground">التالي</div>
                <div className="text-sm font-medium text-foreground truncate">
                  {nextTopic ? nextTopic.title : nextSection.topics[0].title}
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