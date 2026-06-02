import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ChevronLeft, ChevronRight, Monitor, Link as LinkIcon, Zap, Radio,
  Bot, Settings, RotateCcw, Undo2, Redo2, ZoomIn, ZoomOut,
  Activity, FlaskConical, Wifi, Play, Square, Trash2, Grid3x3
} from "lucide-react";

const DEVICES = [
  { type: "Router",      label: "راوتر",     glow: "#3B82F6", icon: "🔀" },
  { type: "Switch",      label: "سويتش",    glow: "#10B981", icon: "🔌" },
  { type: "PC",          label: "حاسوب",    glow: "#6366F1", icon: "🖥️" },
  { type: "Server",      label: "سيرفر",    glow: "#8B5CF6", icon: "🗄️" },
  { type: "Firewall",    label: "جدار ناري", glow: "#EF4444", icon: "🛡️" },
  { type: "AccessPoint", label: "Wi-Fi",    glow: "#F59E0B", icon: "📡" },
  { type: "Cloud",       label: "إنترنت",   glow: "#0EA5E9", icon: "☁️" },
  { type: "Laptop",      label: "لابتوب",   glow: "#64748B", icon: "💻" },
];

const PROTOCOLS = ["ICMP", "TCP", "UDP", "DNS", "HTTP", "ARP"];
const PROTOCOL_COLORS = {
  ICMP: "#F59E0B", TCP: "#06B6D4", UDP: "#A78BFA",
  DNS: "#34D399", HTTP: "#F97316", ARP: "#EC4899",
};

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}

function Divider() {
  return <div className="mx-3 my-2" style={{ height: 1, background: "rgba(6,182,212,0.1)" }} />;
}

function SectionLabel({ label, color = "#06b6d4" }) {
  return (
    <div className="px-3 py-1 mb-0.5">
      <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: `${color}80` }}>
        {label}
      </span>
    </div>
  );
}

function ToolBtn({ icon: BtnIcon, label, active, onClick, color = "#06b6d4", disabled = false }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label}
      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all disabled:opacity-30 disabled:cursor-not-allowed"
      style={{
        background: active ? `rgba(${hexToRgb(color)},0.16)` : "rgba(255,255,255,0.02)",
        border: active ? `1px solid rgba(${hexToRgb(color)},0.45)` : "1px solid rgba(255,255,255,0.05)",
        color: active ? color : "rgba(148,163,184,0.65)",
        boxShadow: active ? `0 0 12px rgba(${hexToRgb(color)},0.18)` : "none",
      }}
      onMouseEnter={(e) => {
        if (!active && !disabled) {
          e.currentTarget.style.background = `rgba(${hexToRgb(color)},0.07)`;
          e.currentTarget.style.borderColor = `rgba(${hexToRgb(color)},0.25)`;
          e.currentTarget.style.color = color;
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.background = "rgba(255,255,255,0.02)";
          e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)";
          e.currentTarget.style.color = "rgba(148,163,184,0.65)";
        }
      }}
    >
      <BtnIcon size={13} />
      <span>{label}</span>
    </button>
  );
}

export default function SimSidebar({
  activeTool, setTool,
  connectFrom, packetFrom,
  showSniffer, setShowSniffer,
  showAI, setShowAI,
  zoom, zoomIn, zoomOut, resetView,
  undo, redo,
  reset,
  snifferCount,
  selectedProtocol, setSelectedProtocol,
  autoArrange,
  nodes, connections,
  activeScenario, setActiveScenario,
}) {
  const [collapsed, setCollapsed] = useState(false);

  const connectMode = activeTool === "connect";
  const packetMode = activeTool === "packet";
  const deleteMode = activeTool === "delete";

  return (
    <motion.div
      animate={{ width: collapsed ? 52 : 210 }}
      transition={{ duration: 0.22, ease: "easeInOut" }}
      className="h-full flex-shrink-0 flex flex-col overflow-hidden relative"
      style={{
        background: "rgba(4,9,25,0.98)",
        borderLeft: "1px solid rgba(6,182,212,0.1)",
      }}
    >
      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full flex items-center justify-center transition-all hover:scale-110"
        style={{ background: "rgba(6,182,212,0.18)", border: "1px solid rgba(6,182,212,0.35)", color: "#06b6d4" }}
      >
        {collapsed ? <ChevronLeft size={12} /> : <ChevronRight size={12} />}
      </button>

      {/* Collapsed: icon strip */}
      {collapsed ? (
        <div className="flex flex-col items-center gap-2 pt-4 px-2 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
          {DEVICES.map((d) => (
            <div
              key={d.type}
              draggable
              onDragStart={(e) => e.dataTransfer.setData("deviceType", d.type)}
              className="w-9 h-9 rounded-xl flex items-center justify-center cursor-grab text-base transition-all hover:scale-110"
              style={{ background: `rgba(${hexToRgb(d.glow)},0.1)`, border: `1px solid rgba(${hexToRgb(d.glow)},0.2)` }}
              title={d.label}
            >
              {d.icon}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col h-full overflow-y-auto" style={{ scrollbarWidth: "none" }}>
          {/* Header */}
          <div className="px-3 py-3 flex-shrink-0" style={{ borderBottom: "1px solid rgba(6,182,212,0.08)" }}>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-black tracking-wide" style={{
                background: "linear-gradient(90deg,#06b6d4,#a78bfa)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
              }}>
                SIM TOOLS
              </span>
            </div>
            <div className="flex gap-2 mt-1.5 text-[9px] font-mono" style={{ color: "rgba(6,182,212,0.45)" }}>
              <span className="flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-cyan-500/50 inline-block" />
                {nodes?.length || 0} أجهزة
              </span>
              <span style={{ color: "rgba(6,182,212,0.25)" }}>|</span>
              <span>{connections?.length || 0} روابط</span>
            </div>
          </div>

          <div className="flex-1 py-2 space-y-0.5 px-1">

            {/* DEVICES */}
            <SectionLabel label="الأجهزة" />
            <div className="grid grid-cols-2 gap-1 px-1 pb-2">
              {DEVICES.map((device) => (
                <div
                  key={device.type}
                  draggable
                  onDragStart={(e) => { e.dataTransfer.setData("deviceType", device.type); e.dataTransfer.effectAllowed = "copy"; }}
                  className="flex flex-col items-center gap-1 p-2 rounded-xl cursor-grab active:cursor-grabbing transition-all"
                  style={{ background: `rgba(${hexToRgb(device.glow)},0.05)`, border: `1px solid rgba(${hexToRgb(device.glow)},0.12)` }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = `rgba(${hexToRgb(device.glow)},0.13)`; e.currentTarget.style.borderColor = `rgba(${hexToRgb(device.glow)},0.35)`; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = `rgba(${hexToRgb(device.glow)},0.05)`; e.currentTarget.style.borderColor = `rgba(${hexToRgb(device.glow)},0.12)`; }}
                  title={`اسحب ${device.label} للكانفاس`}
                >
                  <span className="text-base leading-none">{device.icon}</span>
                  <span className="text-[9px] font-medium text-center leading-tight" style={{ color: "rgba(148,163,184,0.75)" }}>{device.label}</span>
                </div>
              ))}
            </div>

            <Divider />

            {/* TOOLS */}
            <SectionLabel label="الأدوات" color="#06b6d4" />
            <div className="space-y-1 px-1">
              <ToolBtn
                icon={LinkIcon}
                label={connectMode ? (connectFrom ? "الجهاز الثاني..." : "الجهاز الأول...") : "ربط أجهزة"}
                active={connectMode}
                onClick={() => setTool("connect")}
                color="#06b6d4"
              />
              <ToolBtn
                icon={packetMode ? Square : Play}
                label={packetMode ? (packetFrom ? "اختر الوجهة..." : "اختر المصدر...") : "إرسال Packet"}
                active={packetMode}
                onClick={() => setTool("packet")}
                color="#a78bfa"
                disabled={connections.length === 0}
              />
              <ToolBtn
                icon={Trash2}
                label="حذف جهاز"
                active={deleteMode}
                onClick={() => setTool("delete")}
                color="#f87171"
              />
            </div>

            {/* Protocol selector */}
            <div className="px-1 pt-1 pb-1">
              <div className="text-[8px] font-bold px-2 mb-1.5" style={{ color: "rgba(167,139,250,0.55)" }}>PROTOCOL</div>
              <div className="grid grid-cols-3 gap-1 px-1">
                {PROTOCOLS.map((p) => (
                  <button
                    key={p}
                    onClick={() => setSelectedProtocol(p)}
                    className="py-1 rounded-lg text-[8px] font-black transition-all"
                    style={{
                      background: selectedProtocol === p ? `rgba(${hexToRgb(PROTOCOL_COLORS[p])},0.22)` : "rgba(255,255,255,0.03)",
                      border: `1px solid ${selectedProtocol === p ? PROTOCOL_COLORS[p] : "rgba(255,255,255,0.06)"}`,
                      color: selectedProtocol === p ? PROTOCOL_COLORS[p] : "rgba(148,163,184,0.5)",
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <Divider />

            {/* SIMULATION */}
            <SectionLabel label="المحاكاة" color="#34d399" />
            <div className="space-y-1 px-1">
              <ToolBtn
                icon={Wifi}
                label={`مراقب الحزم${snifferCount > 0 ? ` (${snifferCount})` : ""}`}
                active={showSniffer}
                onClick={() => setShowSniffer(!showSniffer)}
                color="#06b6d4"
              />
              <ToolBtn
                icon={Grid3x3}
                label="ترتيب تلقائي"
                active={false}
                onClick={autoArrange}
                color="#34d399"
                disabled={nodes.length < 2}
              />
            </div>

            <Divider />

            {/* AI & LAB */}
            <SectionLabel label="الذكاء والمختبر" color="#a78bfa" />
            <div className="space-y-1 px-1">
              <ToolBtn
                icon={Bot}
                label="مساعد ذكي"
                active={showAI}
                onClick={() => setShowAI(!showAI)}
                color="#a78bfa"
              />
              <Link to="/scenario-lab" className="block">
                <ToolBtn
                  icon={FlaskConical}
                  label="مختبر السيناريوهات"
                  active={false}
                  onClick={() => {}}
                  color="#c4b5fd"
                />
              </Link>
            </div>

            <Divider />

            {/* VIEW & HISTORY */}
            <SectionLabel label="العرض والسجل" />
            <div className="space-y-1.5 px-1 pb-2">
              {/* Zoom */}
              <div className="flex items-center justify-between px-2 py-1.5 rounded-xl"
                style={{ background: "rgba(6,182,212,0.04)", border: "1px solid rgba(6,182,212,0.1)" }}>
                <button onClick={zoomOut} className="p-1 rounded-lg hover:bg-cyan-500/10 transition-colors text-slate-400 hover:text-cyan-400">
                  <ZoomOut size={12} />
                </button>
                <span className="text-[10px] font-mono text-cyan-400">{Math.round(zoom * 100)}%</span>
                <button onClick={zoomIn} className="p-1 rounded-lg hover:bg-cyan-500/10 transition-colors text-slate-400 hover:text-cyan-400">
                  <ZoomIn size={12} />
                </button>
              </div>
              {/* Undo / Redo */}
              <div className="flex gap-1">
                <button onClick={undo}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-xl text-[10px] font-medium transition-all text-slate-500 hover:text-slate-200 hover:bg-white/5"
                  style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
                  <Undo2 size={11} /> تراجع
                </button>
                <button onClick={redo}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-xl text-[10px] font-medium transition-all text-slate-500 hover:text-slate-200 hover:bg-white/5"
                  style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
                  <Redo2 size={11} /> إعادة
                </button>
              </div>
              <button onClick={resetView}
                className="w-full py-1.5 rounded-xl text-[10px] font-medium transition-all text-slate-500 hover:text-slate-300 hover:bg-white/5"
                style={{ border: "1px solid rgba(255,255,255,0.05)" }}>
                إعادة ضبط العرض
              </button>
              <button onClick={reset}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-[10px] font-bold transition-all hover:bg-red-500/12"
                style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }}>
                <RotateCcw size={11} /> مسح الكل
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}