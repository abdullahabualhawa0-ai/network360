import { Link, useLocation } from "react-router-dom";
import {
  Network, Globe, Shield, Server, Radio, Cpu, Route, Tag,
  ChevronDown, BookOpen, Home, MonitorPlay, BarChart2, Users, FlaskConical, FileText, History, ClipboardList, FileCheck, Settings, School, GraduationCap } from
"lucide-react";
import courseData from "../lib/courseData";
import { useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { t, useLang } from "@/lib/i18n";
import { sectionTitle, topicTitle } from "@/lib/courseI18n";

const iconMap = { Network, Globe, Shield, Server, Radio, Cpu, Route, Tag };

export default function Sidebar({ onClose }) {
  const location = useLocation();
  const [expandedSections, setExpandedSections] = useState({});
  const { user } = useAuth();
  useLang();
  const isSuperAdmin = user?.role === "admin";
  const isSchoolAdmin = user?.role === "school_admin";
  const isAdmin = isSuperAdmin || isSchoolAdmin;

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
          isActive ? "font-bold text-primary" : "text-muted-foreground hover:text-foreground"}`
          }
          style={isActive ? {
            background: "rgba(47,102,144,0.1)"
          } : {}}>
          
          {!isActive &&
          <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background: "rgba(47,102,144,0.06)" }} />
          }
          {icon}
          <span>{label}</span>
          {badge &&
          <span className="mr-auto text-[9px] font-black px-1.5 py-0.5 rounded-full hidden"
          style={{ background: "rgba(47,102,144,0.12)", color: "#2F6690", border: "1px solid rgba(47,102,144,0.25)" }}>
              {badge}
            </span>
          }
        </Link>
      </div>);

  };

  return (
    <div className="w-80 h-full flex flex-col overflow-hidden"
    style={{ background: "hsl(var(--sidebar-background))", borderLeft: "1px solid hsl(var(--sidebar-border))" }}>
      {/* Logo */}
      <div className="p-5" style={{ borderBottom: "1px solid hsl(var(--sidebar-border))" }}>
        <Link to="/" onClick={onClose} className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-105"
          style={{ background: "#173F5F" }}>
            <BookOpen className="text-white" size={20} />
          </div>
          <div>
            <h1 className="font-black text-foreground text-base">{t("appName")}</h1>
            <p className="text-[11px] text-muted-foreground">{t("appTagline")}</p>
          </div>
        </Link>
      </div>

      {/* Nav links */}
      <div className="pt-2">
        {navItem("/", <Home size={16} />, t("navHome"), "linear-gradient(135deg,#0891b2,#0e7490)")}
        {navItem("/network-simulator", <MonitorPlay size={16} />, t("navSimulator"), "linear-gradient(135deg,#059669,#0891b2)")}
        {navItem("/dashboard", <BarChart2 size={16} />, t("navDashboard"), "linear-gradient(135deg,#4f46e5,#7c3aed)")}
        {navItem("/scenario-lab", <FlaskConical size={16} />, t("navScenarioLab"), "linear-gradient(135deg,#7c3aed,#0891b2)", "جديد")}
        {navItem("/lab-history", <History size={16} />, t("navLabHistory"), "linear-gradient(135deg,#0e7490,#4f46e5)")}
        {navItem("/exams", <ClipboardList size={16} />, t("navExams"), "linear-gradient(135deg,#be123c,#0891b2)")}
        {navItem("/settings", <Settings size={16} />, t("navSettings"), "linear-gradient(135deg,#475569,#334155)")}
        {isSuperAdmin && navItem("/admin/schools", <School size={16} />, t("navSchools"), "linear-gradient(135deg,#0891b2,#7c3aed)")}
        {isSchoolAdmin && navItem("/admin/school-students", <GraduationCap size={16} />, t("navMyStudents"), "linear-gradient(135deg,#be123c,#9f1239)")}
        {isSuperAdmin && navItem("/admin/students", <Users size={16} />, t("navStudentReports"), "linear-gradient(135deg,#be123c,#9f1239)")}
        {isAdmin && navItem("/admin/exams", <FileText size={16} />, t("navExamManage"), "linear-gradient(135deg,#0891b2,#059669)")}
        {isAdmin && navItem("/admin/exam-results", <FileCheck size={16} />, t("navExamResults"), "linear-gradient(135deg,#059669,#4f46e5)")}
      </div>

      {/* Divider */}
      <div className="mx-4 my-3" style={{ height: 1, background: "#E2E8F0" }} />
      <div className="px-4 mb-2">
        <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: "rgba(47,102,144,0.55)" }}>
          {t("courseContent")}
        </span>
      </div>

      {/* Course nav — واجهة أوسع وأوضح للقراءة والتنقل */}
      <nav className="flex-1 overflow-y-auto px-3 pb-4 space-y-1">
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
                className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all text-sm group"
                style={{
                  color: hasActiveTopic ? "#173F5F" : "rgba(31,41,55,0.65)",
                  background: hasActiveTopic ? "rgba(47,102,144,0.08)" : "transparent",
                  border: hasActiveTopic ? "1px solid rgba(47,102,144,0.22)" : "1px solid transparent"
                }}
                onMouseEnter={(e) => {if (!hasActiveTopic) {e.currentTarget.style.background = "rgba(47,102,144,0.05)";e.currentTarget.style.color = "#173F5F";}}}
                onMouseLeave={(e) => {if (!hasActiveTopic) {e.currentTarget.style.background = "transparent";e.currentTarget.style.color = "rgba(31,41,55,0.65)";}}}>
                
                <Icon size={16} />
                <span className="font-bold flex-1 text-right">{sectionTitle(section)}</span>
                <ChevronDown size={14} className={`transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} style={{ color: "rgba(47,102,144,0.45)" }} />
              </button>

              {isExpanded &&
              <div className="mr-7 mt-1 mb-1.5 space-y-1" style={{ borderRight: "2px solid rgba(47,102,144,0.2)", paddingRight: 12 }}>
                  {section.topics.map((topic) => {
                  const isActive = location.pathname === `/topic/${section.id}/${topic.id}`;
                  return (
                    <Link
                      key={topic.id}
                      to={`/topic/${section.id}/${topic.id}`}
                      onClick={onClose}
                      className="block px-3.5 py-2 rounded-lg text-[13px] transition-all"
                      style={{
                        background: isActive ? "rgba(47,102,144,0.12)" : "transparent",
                        color: isActive ? "#173F5F" : "rgba(31,41,55,0.6)",
                        fontWeight: isActive ? 700 : 400,
                        border: isActive ? "1px solid rgba(47,102,144,0.25)" : "1px solid transparent"
                      }}
                      onMouseEnter={(e) => {if (!isActive) {e.currentTarget.style.background = "rgba(47,102,144,0.05)";e.currentTarget.style.color = "#173F5F";}}}
                      onMouseLeave={(e) => {if (!isActive) {e.currentTarget.style.background = "transparent";e.currentTarget.style.color = "rgba(31,41,55,0.6)";}}}>
                      
                        {topicTitle(topic)}
                      </Link>);

                })}
                </div>
              }
            </div>);

        })}
      </nav>
    </div>);

}