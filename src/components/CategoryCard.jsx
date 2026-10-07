import { Link } from "react-router-dom";
import { Network, Globe, Shield, Server, Radio, Cpu, Route, Tag, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { t, useLang } from "@/lib/i18n";
import { sectionTitle, topicTitle } from "@/lib/courseI18n";

const iconMap = { Network, Globe, Shield, Server, Radio, Cpu, Route, Tag };

export default function CategoryCard({ section, index }) {
  useLang();
  const Icon = iconMap[section.icon] || Network;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.4 }}
    >
      {/* الألوان عبر متغيرات الثيم (bg-card / border-border / accent) فتتكيف مع الوضع الداكن تلقائياً.
          تأثير الـ hover صار بـ CSS بدل onMouseEnter/Leave (أخف، ويعمل على اللمس أيضاً). */}
      <div
        className="group rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 cursor-default bg-card border border-border hover:border-accent hover:shadow-[0_6px_18px_rgba(23,63,95,0.08)] dark:hover:shadow-[0_6px_18px_rgba(0,0,0,0.45)]"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-secondary">
            <Icon className="text-secondary-foreground" size={20} />
          </div>
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-secondary/[0.08] text-secondary dark:text-primary border border-secondary/20">
            {section.topics.length} {t("lessonWord")}
          </span>
        </div>

        <h3 className="font-black text-base mb-3 text-primary">{sectionTitle(section)}</h3>

        <div className="space-y-0.5">
          {section.topics.map((topic) => (
            <Link
              key={topic.id}
              to={`/topic/${section.id}/${topic.id}`}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-all group/item text-foreground/65 hover:bg-secondary/[0.07] hover:text-primary"
            >
              <div className="w-1 h-1 rounded-full flex-shrink-0 bg-secondary/50 dark:bg-primary/50" />
              <span className="text-xs flex-1">{topicTitle(topic)}</span>
              <ArrowLeft size={11} className="opacity-0 group-hover/item:opacity-100 transition-opacity text-secondary dark:text-primary" />
            </Link>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
