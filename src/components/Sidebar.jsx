import { Link, useLocation } from "react-router-dom";
import { 
  Network, Globe, Shield, Server, Radio, Cpu, Route, Tag,
  ChevronDown, BookOpen, Home, MonitorPlay, BarChart2, Bot
} from "lucide-react";
import courseData from "../lib/courseData";
import { useState } from "react";

const iconMap = {
  Network, Globe, Shield, Server, Radio, Cpu, Route, Tag
};

export default function Sidebar({ onClose }) {
  const location = useLocation();
  const [expandedSections, setExpandedSections] = useState({});

  const toggleSection = (id) => {
    setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="w-72 h-full bg-card border-l border-border flex flex-col overflow-hidden">
      {/* Logo */}
      <div className="p-5 border-b border-border">
        <Link to="/" onClick={onClose} className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
            <BookOpen className="text-white" size={20} />
          </div>
          <div>
            <h1 className="font-bold text-foreground text-base">مبادئ الشبكات</h1>
            <p className="text-[11px] text-muted-foreground">دليل تعلم الشبكات الشامل</p>
          </div>
        </Link>
      </div>

      {/* Home link */}
      <div className="px-3 pt-3">
        <Link
          to="/"
          onClick={onClose}
          className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all text-sm ${
            location.pathname === '/' 
              ? 'bg-primary text-primary-foreground shadow-md' 
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
        >
          <Home size={16} />
          <span className="font-medium">الصفحة الرئيسية</span>
        </Link>
      </div>

      {/* Network Simulator link */}
      <div className="px-3 pt-1">
        <Link
          to="/network-simulator"
          onClick={onClose}
          className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all text-sm ${
            location.pathname === '/network-simulator'
              ? 'bg-gradient-to-l from-emerald-500 to-teal-600 text-white shadow-md'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
        >
          <MonitorPlay size={16} />
          <span className="font-medium">محاكاة بناء شبكة</span>
          <span className="mr-auto text-[9px] font-bold bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full">جديد</span>
        </Link>
      </div>

      {/* Dashboard */}
      <div className="px-3 pt-1">
        <Link
          to="/dashboard"
          onClick={onClose}
          className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all text-sm ${
            location.pathname === '/dashboard'
              ? 'bg-gradient-to-l from-indigo-500 to-purple-600 text-white shadow-md'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
        >
          <BarChart2 size={16} />
          <span className="font-medium">لوحة التقدم</span>
        </Link>
      </div>

      {/* Agents */}
      <div className="px-3 pt-1">
        <Link
          to="/agents"
          onClick={onClose}
          className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all text-sm ${
            location.pathname === '/agents'
              ? 'bg-gradient-to-l from-purple-500 to-pink-600 text-white shadow-md'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
        >
          <Bot size={16} />
          <span className="font-medium">المساعدون الذكيون</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
        {courseData.map((section) => {
          const Icon = iconMap[section.icon] || Network;
          const isExpanded = expandedSections[section.id];
          const hasActiveTopic = section.topics.some(t => 
            location.pathname === `/topic/${section.id}/${t.id}`
          );

          return (
            <div key={section.id}>
              <button
                onClick={() => toggleSection(section.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all text-sm ${
                  hasActiveTopic 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <Icon size={16} />
                <span className="font-medium flex-1 text-right">{section.title}</span>
                <ChevronDown 
                  size={14} 
                  className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} 
                />
              </button>

              {isExpanded && (
                <div className="mr-6 mt-1 space-y-0.5 border-r-2 border-border pr-3">
                  {section.topics.map((topic) => {
                    const isActive = location.pathname === `/topic/${section.id}/${topic.id}`;
                    return (
                      <Link
                        key={topic.id}
                        to={`/topic/${section.id}/${topic.id}`}
                        onClick={onClose}
                        className={`block px-3 py-2 rounded-md text-xs transition-all ${
                          isActive
                            ? 'bg-primary text-primary-foreground font-medium shadow-sm'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`}
                      >
                        {topic.title}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
}