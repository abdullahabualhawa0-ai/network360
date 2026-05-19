import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ChevronLeft, ChevronRight, Monitor, Link as LinkIcon, Zap, Radio,
  Bot, Settings, RotateCcw, Undo2, Redo2, ZoomIn, ZoomOut,
  Activity, FlaskConical, Wifi, Play, Square, MousePointer,
  ArrowUpDown, Grid3x3
} from "lucide-react";

const DEVICES = [
  { type: "Router",      label: "راوتر",    glow: "#3B82F6", icon: "🔀" },
  { type: "Switch",      label: "سويتش",   glow: "#10B981", icon: "🔌" },
  { type: "PC",          label: "حاسوب",   glow: "#6366F1", icon: "🖥️" },
  { type: "Server",      label: "سيرفر",   glow: "#8B5CF6", icon: "🗄️" },
  { type: "Firewall",    label: "جدار ناري", glow: "#EF4444", icon: "🛡️" },
  { type: "AccessPoint", label: "Wi-Fi",   glow: "#F59E0B", icon: "📡" },
  { type: "Cloud",       label: "إنترنت",  glow: "#0EA5E9", icon: "☁️" },
  { type: "Laptop",      label: "لابتوب",  glow: "#64748B", icon: "💻" },
];

const PROTOCOLS = ["ICMP", "TCP", "UDP", "DNS", "HTTP", "ARP"];
const PROTOCOL_COLORS = {
  ICMP: "#F59E0B", TCP: "#06B6D4", UDP: "#A78BFA",
  DNS: "#34D399", HTTP: "#F97316", ARP: "#EC4899",
};

function SectionHeader({ icon: SectionIcon, label, color = "#06b6d4" }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 mb-1">
      <SectionIcon size={11} style={{ color }} />
      <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: `${color}88` }}>
        {label}
      </span>
    </div>
  );
}

function hexToRgbInner(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}

function Divider() {
  return <div className="mx-3 my-2" style={{ height: 1, background: "rgba(6,182,212,0.1)" }} />;
}

function ToolBtn({ icon: BtnIcon, label, active, onClick, color = "#06b6d4", disabled = false }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label}
      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all disabled:opacity-30"
      style={{
        background: active ? `rgba(${hexToRgb(color)},0.18)` : "transparent",
        border: active ? `1px solid rgba(${hexToRgb(color)},0.5)` : "1px solid transparent",
        color: active ? color : "rgba(148,163,184,0.7)",
        boxShadow: active ? `0 0 10px rgba(${hexToRgb(color)},0.2)` : "none",
      }}
      onMouseEnter={(e) => {
        if (!active && !disabled) {
          e.currentTarget.style.background = `rgba(${hexToRgb(color)},0.08)`;
          e.currentTarget.style.color = color;
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.color = "rgba(148,163,184,0.7)";
        }
      }}
    >
      <BtnIcon size={13} />
      <span>{label}</span>
    </button>
  );
}

export default function SimSidebar({
  connectMode, setConnectMode, connectFrom,
  showSniffer, setShowSniffer,
  showAI, setShowAI,
  zoom, zoomIn, zoomOut, resetView,
  undo, redo,
  reset,
  snifferCount,
  packetMode, setPacketMode,
  selectedProtocol, setSelectedProtocol,
  autoArrange,
  nodes, connections,
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.div
      animate={{ width: collapsed ? 48 : 200 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="h-full flex-shrink-0 flex flex-col overflow-hidden relative"
      style={{
        background: "rgba(2,6,23,0.97)",
        borderLeft: "1px solid rgba(6,182,212,0.12)",
      }}
    >
      {/* Toggle button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full flex items-center justify-center transition-all hover:scale-110"
        style={{
          background: "rgba(6,182,212,0.2)",
          border: "1px solid rgba(6,182,212,0.4)",
          color: "#06b6d4",
        }}
      >
        {collapsed ? <ChevronLeft size={12} /> : <ChevronRight size={12} />}
      </button>

      {/* Collapsed state: just icons */}
      {collapsed ? (
        <div className="flex flex-col items-center gap-2 pt-4 px-2">
          {DEVICES.map((d) => (
            <div
              key={d.type}
              draggable
              onDragStart={(e) => e.dataTransfer.setData("deviceType", d.type)}
              className="w-8 h-8 rounded-lg flex items-center justify-center cursor-grab text-base"
              style={{ background: `rgba(${hexToRgb(d.glow)},0.12)`, border: `1px solid rgba(${hexToRgb(d.glow)},0.25)` }}
              title={d.label}
            >
              {d.icon}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col h-full overflow-y-auto" style={{ scrollbarWidth: "none" }}>
          {/* Header */}
          <div className="px-3 py-3 flex-shrink-0" style={{ borderBottom: "1px solid rgba(6,182,212,0.1)" }}>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-[10px] font-black" style={{
                background: "linear-gradient(90deg,#06b6d4,#a78bfa)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
              }}>
                SIM TOOLS
              </span>
            </div>
            <div className="flex gap-2 mt-1 text-[9px] font-mono" style={{ color: "rgba(6,182,212,0.5)" }}>
              <span>{nodes?.length || 0} dev</span>
              <span>•</span>
              <span>{connections?.length || 0} links</span>
            </div>
          </div>

          <div className="flex-1 py-2 space-y-0.5">
            {/* ── DEVICES ── */}
            <SectionHeader icon={Monitor} label="Devices" />
            <div className="grid grid-cols-2 gap-1 px-2 pb-1">
              {DEVICES.map((device) => (
                <div
                  key={device.type}
                  draggable
                  onDragStart={(e) => { e.dataTransfer.setData("deviceType", device.type); e.dataTransfer.effectAllowed = "copy"; }}
                  className="flex flex-col items-center gap-1 p-1.5 rounded-lg cursor-grab active:cursor-grabbing transition-all group"
                  style={{ background: `rgba(${hexToRgb(device.glow)},0.06)`, border: `1px solid rgba(${hexToRgb(device.glow)},0.15)` }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = `rgba(${hexToRgb(device.glow)},0.15)`; e.currentTarget.style.borderColor = `rgba(${hexToRgb(device.glow)},0.4)`; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = `rgba(${hexToRgb(device.glow)},0.06)`; e.currentTarget.style.borderColor = `rgba(${hexToRgb(device.glow)},0.15)`; }}
                  title={`اسحب ${device.label} للكانفاس`}
                >
                  <span className="text-base leading-none">{device.icon}</span>
                  <span className="text-[9px] font-medium" style={{ color: `rgba(148,163,184,0.8)` }}>{device.label}</span>
                </div>
              ))}
            </div>

            <Divider />

            {/* ── CONNECTIONS ── */}
            <SectionHeader icon={LinkIcon} label="Connections" />
            <div className="px-2 space-y-0.5">
              <ToolBtn
                icon={LinkIcon}
                label={connectMode ? (connectFrom ? "انقر جهاز 2..." : "انقر جهاز 1...") : "ربط أجهزة"}
                active={connectMode}
                onClick={() => { setConnectMode(!connectMode); }}
                color="#06b6d4"
              />
            </div>

            <Divider />

            {/* ── PACKETS ── */}
            <SectionHeader icon={Zap} label="Packets" color="#a78bfa" />
            <div className="px-2 space-y-0.5">
              <ToolBtn
                icon={packetMode ? Square : Play}
                label={packetMode ? (connectFrom ? "انقر وجهة..." : "انقر مصدر...") : "إرسال Packet"}
                active={packetMode}
                onClick={() => setPacketMode(!packetMode)}
                color="#a78bfa"
                disabled={connections.length === 0}
              />
              {/* Protocol selector */}
              <div className="pt-1 pb-0.5">
                <div className="text-[8px] font-bold px-1 mb-1" style={{ color: "rgba(167,139,250,0.6)" }}>PROTOCOL</div>
                <div className="grid grid-cols-3 gap-1">
                  {PROTOCOLS.map((p) => (
                    <button
                      key={p}
                      onClick={() => setSelectedProtocol(p)}
                      className="py-0.5 rounded text-[8px] font-black transition-all"
                      style={{
                        background: selectedProtocol === p ? `rgba(${hexToRgb(PROTOCOL_COLORS[p])},0.25)` : "rgba(255,255,255,0.04)",
                        border: `1px solid ${selectedProtocol === p ? PROTOCOL_COLORS[p] : "rgba(255,255,255,0.08)"}`,
                        color: selectedProtocol === p ? PROTOCOL_COLORS[p] : "rgba(148,163,184,0.6)",
                      }}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <Divider />

            {/* ── SIM TOOLS ── */}
            <SectionHeader icon={Activity} label="Simulation" color="#34d399" />
            <div className="px-2 space-y-0.5">
              <ToolBtn
                icon={Wifi}
                label={`Sniffer${snifferCount > 0 ? ` (${snifferCount})` : ""}`}
                active={showSniffer}
                onClick={() => setShowSniffer(!showSniffer)}
                color="#06b6d4"
              />
              <ToolBtn
                icon={Grid3x3}
                label="Auto Arrange"
                active={false}
                onClick={autoArrange}
                color="#34d399"
                disabled={nodes.length < 2}
              />
            </div>

            <Divider />

            {/* ── AI TOOLS ── */}
            <SectionHeader icon={Bot} label="AI Tools" color="#a78bfa" />
            <div className="px-2 space-y-0.5">
              <ToolBtn
                icon={Bot}
                label="AI Assistant"
                active={showAI}
                onClick={() => setShowAI(!showAI)}
                color="#a78bfa"
              />
              <Link to="/scenario-lab" className="block">
                <ToolBtn
                  icon={FlaskConical}
                  label="Scenario Lab"
                  active={false}
                  onClick={() => {}}
                  color="#c4b5fd"
                />
              </Link>
            </div>

            <Divider />

            {/* ── SETTINGS ── */}
            <SectionHeader icon={Settings} label="View & History" />
            <div className="px-2 space-y-0.5">
              {/* Zoom row */}
              <div
                className="flex items-center justify-between px-2 py-1.5 rounded-lg"
                style={{ background: "rgba(6,182,212,0.05)", border: "1px solid rgba(6,182,212,0.1)" }}
              >
                <button onClick={zoomOut} className="text-slate-400 hover:text-cyan-400 transition-colors p-0.5">
                  <ZoomOut size={12} />
                </button>
                <span className="text-[10px] font-mono text-cyan-400">{Math.round(zoom * 100)}%</span>
                <button onClick={zoomIn} className="text-slate-400 hover:text-cyan-400 transition-colors p-0.5">
                  <ZoomIn size={12} />
                </button>
              </div>
              {/* Undo/Redo row */}
              <div className="flex gap-1">
                <button onClick={undo}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] transition-all text-slate-500 hover:text-white"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <Undo2 size={11} /> Undo
                </button>
                <button onClick={redo}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] transition-all text-slate-500 hover:text-white"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <Redo2 size={11} /> Redo
                </button>
              </div>
              <button onClick={resetView}
                className="w-full py-1.5 rounded-lg text-[10px] font-medium transition-all text-slate-500 hover:text-slate-300"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                ضبط العرض
              </button>
              <button onClick={reset}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[10px] font-bold transition-all"
                style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", color: "#f87171" }}>
                <RotateCcw size={11} /> مسح الكل
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}