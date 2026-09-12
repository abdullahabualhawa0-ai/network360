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
      <div
        className="group rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 cursor-default"
        style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(6,182,212,0.1)",
          backdropFilter: "blur(10px)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.border = "1px solid rgba(6,182,212,0.3)";
          e.currentTarget.style.background = "rgba(6,182,212,0.04)";
          e.currentTarget.style.boxShadow = "0 8px 32px rgba(6,182,212,0.1)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.border = "1px solid rgba(6,182,212,0.1)";
          e.currentTarget.style.background = "rgba(255,255,255,0.02)";
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${section.color} flex items-center justify-center shadow-lg`}>
            <Icon className="text-white" size={20} />
          </div>
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full"
            style={{ background: "rgba(6,182,212,0.1)", color: "rgba(6,182,212,0.7)", border: "1px solid rgba(6,182,212,0.2)" }}>
            {section.topics.length} {t("lessonWord")}
          </span>
        </div>

        <h3 className="font-black text-base mb-3" style={{ color: "rgba(226,232,240,0.9)" }}>{sectionTitle(section)}</h3>

        <div className="space-y-0.5">
          {section.topics.map((topic) => (
            <Link
              key={topic.id}
              to={`/topic/${section.id}/${topic.id}`}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-all group/item"
              style={{ color: "rgba(148,163,184,0.7)" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(6,182,212,0.08)";
                e.currentTarget.style.color = "#06b6d4";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "rgba(148,163,184,0.7)";
              }}
            >
              <div className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: "rgba(6,182,212,0.5)" }} />
              <span className="text-xs flex-1">{topicTitle(topic)}</span>
              <ArrowLeft size={11} className="opacity-0 group-hover/item:opacity-100 transition-opacity" style={{ color: "#06b6d4" }} />
            </Link>
          ))}
        </div>
      </div>
    </motion.div>
  );
}