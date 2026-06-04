import { Link, useLocation } from "react-router-dom";
import {
  Network, Globe, Shield, Server, Radio, Cpu, Route, Tag,
  ChevronDown, BookOpen, Home, MonitorPlay, BarChart2, Users, FlaskConical, FileText } from
"lucide-react";
import courseData from "../lib/courseData";
import { useState } from "react";
import { useAuth } from "@/lib/AuthContext";

const iconMap = { Network, Globe, Shield, Server, Radio, Cpu, Route, Tag };

export default function Sidebar({ onClose }) {
  const location = useLocation();
  const [expandedSections, setExpandedSections] = useState({});
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const toggleSection = (id) => {
    setExpandedSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const navItem = (to, icon, label, gradient, badge) => {
    const isActive = location.pathname === to;
    return (
      <div className="px-3 pt-1">
        <Link
          to={to}
          onClick={onClose}
          className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all text-sm font-medium group relative overflow-hidden ${
          isActive ? "text-white shadow-lg" : "text-muted-foreground hover:text-foreground"}`
          }
          style={isActive ? {
            background: gradient,
            boxShadow: "0 4px 15px rgba(6,182,212,0.2)"
          } : {}}>
          
          {!isActive &&
          <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background: "rgba(6,182,212,0.06)" }} />
          }
          {icon}
          <span>{label}</span>
          {badge &&
          <span className="mr-auto text-[9px] font-black px-1.5 py-0.5 rounded-full hidden"
          style={{ background: "rgba(139,92,246,0.2)", color: "#a78bfa", border: "1px solid rgba(139,92,246,0.3)" }}>
              {badge}
            </span>
          }
        </Link>
      </div>);

  };

  return (
    <div className="w-72 h-full flex flex-col overflow-hidden"
    style={{ background: "hsl(var(--sidebar-background))", borderLeft: "1px solid hsl(var(--sidebar-border))" }}>
      {/* Logo */}
      <div className="p-5" style={{ borderBottom: "1px solid hsl(var(--sidebar-border))" }}>
        <Link to="/" onClick={onClose} className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-105"
          style={{ background: "linear-gradient(135deg, #0891b2, #7c3aed)" }}>
            <BookOpen className="text-white" size={20} />
          </div>
          <div>
            <h1 className="font-black text-foreground text-base">مبادئ الشبكات</h1>
            <p className="text-[11px] text-muted-foreground">منصة تعليمية تفاعلية</p>
          </div>
        </Link>
      </div>

      {/* Nav links */}
      <div className="pt-2">
        {navItem("/", <Home size={16} />, "الصفحة الرئيسية", "linear-gradient(135deg,#0891b2,#0e7490)")}
        {navItem("/network-simulator", <MonitorPlay size={16} />, "محاكاة الشبكات", "linear-gradient(135deg,#059669,#0891b2)")}
        {navItem("/dashboard", <BarChart2 size={16} />, "لوحة التقدم", "linear-gradient(135deg,#4f46e5,#7c3aed)")}
        {navItem("/scenario-lab", <FlaskConical size={16} />, "Scenario Lab", "linear-gradient(135deg,#7c3aed,#0891b2)", "جديد")}
        {isAdmin && navItem("/admin/students", <Users size={16} />, "تقارير الطلاب", "linear-gradient(135deg,#be123c,#9f1239)")}
        {isAdmin && navItem("/admin/exams", <FileText size={16} />, "إدارة الامتحانات", "linear-gradient(135deg,#0891b2,#059669)")}
      </div>

      {/* Divider */}
      <div className="mx-4 my-3" style={{ height: 1, background: "rgba(6,182,212,0.1)" }} />
      <div className="px-4 mb-2">
        <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: "rgba(6,182,212,0.4)" }}>
          محتوى الدورة
        </span>
      </div>

      {/* Course nav */}
      <nav className="flex-1 overflow-y-auto px-3 pb-4 space-y-0.5">
        {courseData.map((section) => {
          const Icon = iconMap[section.icon] || Network;
          const isExpanded = expandedSections[section.id];
          const hasActiveTopic = section.topics.some(
            (t) => location.pathname === `/topic/${section.id}/${t.id}`
          );

          return (
            <div key={section.id}>
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all text-sm group"
                style={{
                  color: hasActiveTopic ? "#06b6d4" : "rgba(148,163,184,0.7)",
                  background: hasActiveTopic ? "rgba(6,182,212,0.08)" : "transparent",
                  border: hasActiveTopic ? "1px solid rgba(6,182,212,0.2)" : "1px solid transparent"
                }}
                onMouseEnter={(e) => {if (!hasActiveTopic) {e.currentTarget.style.background = "rgba(6,182,212,0.04)";e.currentTarget.style.color = "rgba(226,232,240,0.9)";}}}
                onMouseLeave={(e) => {if (!hasActiveTopic) {e.currentTarget.style.background = "transparent";e.currentTarget.style.color = "rgba(148,163,184,0.7)";}}}>
                
                <Icon size={15} />
                <span className="font-medium flex-1 text-right">{section.title}</span>
                <ChevronDown size={13} className={`transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} style={{ color: "rgba(6,182,212,0.4)" }} />
              </button>

              {isExpanded &&
              <div className="mr-6 mt-0.5 mb-1 space-y-0.5" style={{ borderRight: "2px solid rgba(6,182,212,0.15)", paddingRight: 10 }}>
                  {section.topics.map((topic) => {
                  const isActive = location.pathname === `/topic/${section.id}/${topic.id}`;
                  return (
                    <Link
                      key={topic.id}
                      to={`/topic/${section.id}/${topic.id}`}
                      onClick={onClose}
                      className="block px-3 py-1.5 rounded-lg text-xs transition-all"
                      style={{
                        background: isActive ? "rgba(6,182,212,0.15)" : "transparent",
                        color: isActive ? "#06b6d4" : "rgba(148,163,184,0.65)",
                        fontWeight: isActive ? 700 : 400,
                        border: isActive ? "1px solid rgba(6,182,212,0.3)" : "1px solid transparent"
                      }}
                      onMouseEnter={(e) => {if (!isActive) {e.currentTarget.style.background = "rgba(6,182,212,0.05)";e.currentTarget.style.color = "rgba(226,232,240,0.8)";}}}
                      onMouseLeave={(e) => {if (!isActive) {e.currentTarget.style.background = "transparent";e.currentTarget.style.color = "rgba(148,163,184,0.65)";}}}>
                      
                        {topic.title}
                      </Link>);

                })}
                </div>
              }
            </div>);

        })}
      </nav>
    </div>);

}