import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ChevronLeft, ChevronRight, Monitor, Link as LinkIcon, Zap, Radio,
  Bot, Settings, RotateCcw, Undo2, Redo2, ZoomIn, ZoomOut,
  Activity, FlaskConical, Wifi, Play, Square, Trash2, Grid3x3
} from "lucide-react";

const DEVICES = [
  { type: "Router",      label: "راوتر",     glow: "#173F5F", icon: "🔀" },
  { type: "Switch",      label: "سويتش",    glow: "#2E7D5B", icon: "🔌" },
  { type: "PC",          label: "حاسوب",    glow: "#2F6690", icon: "🖥️" },
  { type: "Server",      label: "سيرفر",    glow: "#3A86A8", icon: "🗄️" },
  { type: "Firewall",    label: "جدار ناري", glow: "#C94C4C", icon: "🛡️" },
  { type: "AccessPoint", label: "Wi-Fi",    glow: "#D69E2E", icon: "📡" },
  { type: "Cloud",       label: "إنترنت",   glow: "#64748B", icon: "☁️" },
  { type: "Laptop",      label: "لابتوب",   glow: "#2F6690", icon: "💻" },
];

const PROTOCOLS = ["ICMP", "TCP", "UDP", "DNS", "HTTP", "ARP"];
const PROTOCOL_COLORS = {
  ICMP: "#D69E2E", TCP: "#2F6690", UDP: "#3A86A8",
  DNS: "#2E7D5B", HTTP: "#B45309", ARP: "#64748B",
};

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}

function Divider() {
  return <div className="mx-3 my-2" style={{ height: 1, background: "#E2E8F0" }} />;
}

function SectionLabel({ label, color = "#2F6690" }) {
  return (
    <div className="px-3 py-1 mb-0.5">
      <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: `${color}80` }}>
        {label}
      </span>
    </div>
  );
}

function ToolBtn({ icon: BtnIcon, label, active, onClick, color = "#2F6690", disabled = false }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label}
      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all disabled:opacity-30 disabled:cursor-not-allowed"
      style={{
        background: active ? `rgba(${hexToRgb(color)},0.12)` : "rgba(23,63,95,0.03)",
        border: active ? `1px solid rgba(${hexToRgb(color)},0.45)` : "1px solid #E2E8F0",
        color: active ? color : "rgba(31,41,55,0.65)",
      }}
      onMouseEnter={(e) => {
        if (!active && !disabled) {
          e.currentTarget.style.background = `rgba(${hexToRgb(color)},0.07)`;
          e.currentTarget.style.borderColor = `rgba(${hexToRgb(color)},0.3)`;
          e.currentTarget.style.color = color;
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.background = "rgba(23,63,95,0.03)";
          e.currentTarget.style.borderColor = "#E2E8F0";
          e.currentTarget.style.color = "rgba(31,41,55,0.65)";
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
  packetSpeed, setPacketSpeed,
  autoArrange,
  nodes, connections,
  activeScenario, setActiveScenario,
  selectedDeviceType, onSelectDevice, onCancelPlacement,
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
        background: "#FFFFFF",
        borderLeft: "1px solid #E2E8F0",
      }}
    >
      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full flex items-center justify-center transition-all hover:scale-110"
        style={{ background: "rgba(47,102,144,0.12)", border: "1px solid rgba(47,102,144,0.35)", color: "#2F6690" }}
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
              onClick={(e) => { e.stopPropagation(); onSelectDevice?.(d.type); }}
              className="w-9 h-9 rounded-xl flex items-center justify-center cursor-grab text-base transition-all hover:scale-110"
              style={{
                background: selectedDeviceType === d.type ? `rgba(${hexToRgb(d.glow)},0.3)` : `rgba(${hexToRgb(d.glow)},0.1)`,
                border: selectedDeviceType === d.type ? `1px solid ${d.glow}` : `1px solid rgba(${hexToRgb(d.glow)},0.2)`,
              }}
              title={d.label}
            >
              {d.icon}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col h-full overflow-y-auto" style={{ scrollbarWidth: "none" }}>
          {/* Header */}
          <div className="px-3 py-3 flex-shrink-0" style={{ borderBottom: "1px solid #E2E8F0" }}>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#2E7D5B" }} />
              <span className="text-[11px] font-black tracking-wide" style={{ color: "#173F5F" }}>
                SIM TOOLS
              </span>
            </div>
            <div className="flex gap-2 mt-1.5 text-[9px] font-mono" style={{ color: "rgba(47,102,144,0.6)" }}>
              <span className="flex items-center gap-1">
                <span className="w-1 h-1 rounded-full inline-block" style={{ background: "#3A86A8" }} />
                {nodes?.length || 0} أجهزة
              </span>
              <span style={{ color: "#E2E8F0" }}>|</span>
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
                  onClick={(e) => { e.stopPropagation(); onSelectDevice?.(device.type); }}
                  className="flex flex-col items-center gap-1 p-2 rounded-xl cursor-grab active:cursor-grabbing transition-all"
                  style={{
                    background: selectedDeviceType === device.type ? `rgba(${hexToRgb(device.glow)},0.2)` : `rgba(${hexToRgb(device.glow)},0.05)`,
                    border: selectedDeviceType === device.type ? `1px solid ${device.glow}` : `1px solid rgba(${hexToRgb(device.glow)},0.12)`,
                  }}
                  onMouseEnter={(e) => { if (selectedDeviceType !== device.type) { e.currentTarget.style.background = `rgba(${hexToRgb(device.glow)},0.13)`; e.currentTarget.style.borderColor = `rgba(${hexToRgb(device.glow)},0.35)`; } }}
                  onMouseLeave={(e) => { if (selectedDeviceType !== device.type) { e.currentTarget.style.background = `rgba(${hexToRgb(device.glow)},0.05)`; e.currentTarget.style.borderColor = `rgba(${hexToRgb(device.glow)},0.12)`; } }}
                  title={`اسحب أو اضغط ${device.label}`}
                >
                  <span className="text-base leading-none">{device.icon}</span>
                  <span className="text-[9px] font-medium text-center leading-tight" style={{ color: selectedDeviceType === device.type ? device.glow : "rgba(31,41,55,0.65)" }}>{device.label}</span>
                </div>
              ))}
            </div>

            {/* Tap-to-place indicator — يظهر عند اختيار جهاز */}
            {selectedDeviceType && (
              <div className="flex items-center justify-between gap-2 px-2 py-1.5 mb-1 rounded-lg"
                style={{ background: "rgba(47,102,144,0.08)", border: "1px solid rgba(47,102,144,0.3)" }}>
                <span className="text-[9px] font-bold" style={{ color: "#2F6690" }}>
                  👆 {DEVICES.find(d => d.type === selectedDeviceType)?.label} — اضغط اللوحة
                </span>
                <button onClick={(e) => { e.stopPropagation(); onCancelPlacement?.(); }}
                  className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                  style={{ background: "rgba(201,76,76,0.1)", color: "#C94C4C" }}>
                  ✕
                </button>
              </div>
            )}

            <Divider />

            {/* TOOLS */}
            <SectionLabel label="الأدوات" color="#2F6690" />
            <div className="space-y-1 px-1">
              <ToolBtn
                icon={LinkIcon}
                label={connectMode ? (connectFrom ? "الجهاز الثاني..." : "الجهاز الأول...") : "ربط أجهزة"}
                active={connectMode}
                onClick={() => setTool("connect")}
                color="#2F6690"
              />
              <ToolBtn
                icon={packetMode ? Square : Play}
                label={packetMode ? (packetFrom ? "اختر الوجهة..." : "اختر المصدر...") : "إرسال Packet"}
                active={packetMode}
                onClick={() => setTool("packet")}
                color="#3A86A8"
                disabled={connections.length === 0}
              />
              <ToolBtn
                icon={Trash2}
                label="حذف جهاز"
                active={deleteMode}
                onClick={() => setTool("delete")}
                color="#C94C4C"
              />
            </div>

            {/* Speed control */}
            <div className="px-1 pt-1 pb-1">
              <div className="text-[8px] font-bold px-2 mb-1.5" style={{ color: "rgba(46,125,91,0.65)" }}>سرعة الإرسال</div>
              <div className="grid grid-cols-4 gap-1 px-1">
                {[{ v: 0.5, l: "0.5x" }, { v: 1, l: "1x" }, { v: 2, l: "2x" }, { v: 3, l: "3x" }].map(({ v, l }) => (
                  <button
                    key={v}
                    onClick={() => setPacketSpeed(v)}
                    className="py-1 rounded-lg text-[8px] font-black transition-all"
                    style={{
                      background: packetSpeed === v ? "rgba(46,125,91,0.14)" : "rgba(23,63,95,0.03)",
                      border: `1px solid ${packetSpeed === v ? "#2E7D5B" : "#E2E8F0"}`,
                      color: packetSpeed === v ? "#2E7D5B" : "rgba(31,41,55,0.5)",
                    }}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {/* Protocol selector */}
            <div className="px-1 pt-1 pb-1">
              <div className="text-[8px] font-bold px-2 mb-1.5" style={{ color: "rgba(47,102,144,0.6)" }}>PROTOCOL</div>
              <div className="grid grid-cols-3 gap-1 px-1">
                {PROTOCOLS.map((p) => (
                  <button
                    key={p}
                    onClick={() => setSelectedProtocol(p)}
                    className="py-1 rounded-lg text-[8px] font-black transition-all"
                    style={{
                      background: selectedProtocol === p ? `rgba(${hexToRgb(PROTOCOL_COLORS[p])},0.14)` : "rgba(23,63,95,0.03)",
                      border: `1px solid ${selectedProtocol === p ? PROTOCOL_COLORS[p] : "#E2E8F0"}`,
                      color: selectedProtocol === p ? PROTOCOL_COLORS[p] : "rgba(31,41,55,0.5)",
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <Divider />

            {/* SIMULATION */}
            <SectionLabel label="المحاكاة" color="#2E7D5B" />
            <div className="space-y-1 px-1">
              <ToolBtn
                icon={Wifi}
                label={`مراقب الحزم${snifferCount > 0 ? ` (${snifferCount})` : ""}`}
                active={showSniffer}
                onClick={() => setShowSniffer(!showSniffer)}
                color="#2F6690"
              />
              <ToolBtn
                icon={Grid3x3}
                label="ترتيب تلقائي"
                active={false}
                onClick={autoArrange}
                color="#2E7D5B"
                disabled={nodes.length < 2}
              />
            </div>

            <Divider />

            {/* AI & LAB */}
            <SectionLabel label="الذكاء والمختبر" color="#3A86A8" />
            <div className="space-y-1 px-1">
              <ToolBtn
                icon={Bot}
                label="مساعد ذكي"
                active={showAI}
                onClick={() => setShowAI(!showAI)}
                color="#3A86A8"
              />
              <Link to="/scenario-lab" className="block">
                <ToolBtn
                  icon={FlaskConical}
                  label="مختبر السيناريوهات"
                  active={false}
                  onClick={() => {}}
                  color="#2F6690"
                />
              </Link>
            </div>

            <Divider />

            {/* VIEW & HISTORY */}
            <SectionLabel label="العرض والسجل" />
            <div className="space-y-1.5 px-1 pb-2">
              {/* Zoom */}
              <div className="flex items-center justify-between px-2 py-1.5 rounded-xl"
                style={{ background: "rgba(47,102,144,0.05)", border: "1px solid #E2E8F0" }}>
                <button onClick={zoomOut} className="p-1 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-primary">
                  <ZoomOut size={12} />
                </button>
                <span className="text-[10px] font-mono" style={{ color: "#2F6690" }}>{Math.round(zoom * 100)}%</span>
                <button onClick={zoomIn} className="p-1 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-primary">
                  <ZoomIn size={12} />
                </button>
              </div>
              {/* Undo / Redo */}
              <div className="flex gap-1">
                <button onClick={undo}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-xl text-[10px] font-medium transition-all text-muted-foreground hover:text-foreground hover:bg-muted"
                  style={{ border: "1px solid #E2E8F0" }}>
                  <Undo2 size={11} /> تراجع
                </button>
                <button onClick={redo}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-xl text-[10px] font-medium transition-all text-muted-foreground hover:text-foreground hover:bg-muted"
                  style={{ border: "1px solid #E2E8F0" }}>
                  <Redo2 size={11} /> إعادة
                </button>
              </div>
              <button onClick={resetView}
                className="w-full py-1.5 rounded-xl text-[10px] font-medium transition-all text-muted-foreground hover:text-foreground hover:bg-muted"
                style={{ border: "1px solid #E2E8F0" }}>
                إعادة ضبط العرض
              </button>
              <button onClick={reset}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-[10px] font-bold transition-all"
                style={{ background: "rgba(201,76,76,0.06)", border: "1px solid rgba(201,76,76,0.25)", color: "#C94C4C" }}>
                <RotateCcw size={11} /> مسح الكل
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}