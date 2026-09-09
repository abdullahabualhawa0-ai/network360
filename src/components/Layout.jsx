import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import ContactUsButton from "./ContactUsButton";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { t, useLang } from "@/lib/i18n";

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  useLang();

  return (
    <div className="min-h-screen bg-background font-main">
      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 right-0 left-0 z-50 flex items-center justify-between px-4 py-3"
        style={{
          background: "rgba(2,6,23,0.95)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(6,182,212,0.15)",
        }}>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg transition-all"
          style={{ color: "#06b6d4", background: "rgba(6,182,212,0.08)", border: "1px solid rgba(6,182,212,0.2)" }}
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "linear-gradient(135deg,#0891b2,#7c3aed)" }}>
            <span className="text-white text-xs font-black">ش</span>
          </div>
          <span className="font-black text-white text-sm">{t("appName")}</span>
        </div>
        <div className="w-10" />
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed top-0 right-0 h-full z-40 transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"}`}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main content */}
      <div className="lg:mr-72 pt-16 lg:pt-0">
        <Outlet />
      </div>

      {/* حقوق النشر — السنة تتحدث تلقائياً */}
      <footer className="lg:mr-72 py-5 text-center text-[11px]" style={{ color: "rgba(148,163,184,0.55)" }}>
        © {new Date().getFullYear()} جميع حقوق النشر محفوظة
      </footer>

      {/* تواصل معنا — زر عائم في كل الصفحات */}
      <ContactUsButton />
    </div>
  );
}