import { Link } from "react-router-dom";
import { 
  Network, Globe, Shield, Server, Radio, Cpu, Route, Tag,
  ArrowLeft
} from "lucide-react";
import { motion } from "framer-motion";

const iconMap = {
  Network, Globe, Shield, Server, Radio, Cpu, Route, Tag
};

export default function CategoryCard({ section, index }) {
  const Icon = iconMap[section.icon] || Network;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
    >
      <div className="group bg-card rounded-2xl border border-border p-5 hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/30 transition-all duration-300 hover:-translate-y-1.5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${section.color} flex items-center justify-center shadow-lg`}>
            <Icon className="text-white" size={22} />
          </div>
          <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
            {section.topics.length} دروس
          </span>
        </div>

        <h3 className="font-bold text-foreground text-base mb-3">{section.title}</h3>

        {/* Topics */}
        <div className="space-y-1.5">
          {section.topics.map((topic) => (
            <Link
              key={topic.id}
              to={`/topic/${section.id}/${topic.id}`}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors group/item"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-primary/40 group-hover/item:bg-primary transition-colors" />
              <span className="text-xs text-muted-foreground group-hover/item:text-foreground transition-colors flex-1">
                {topic.title}
              </span>
              <ArrowLeft size={12} className="text-muted-foreground/0 group-hover/item:text-primary transition-all opacity-0 group-hover/item:opacity-100" />
            </Link>
          ))}
        </div>
      </div>
    </motion.div>
  );
}