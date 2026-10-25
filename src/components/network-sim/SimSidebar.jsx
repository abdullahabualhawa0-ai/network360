import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ChevronLeft, ChevronRight, Monitor, Link as LinkIcon, Zap, Radio,
  Bot, Settings, RotateCcw, Undo2, Redo2, ZoomIn, ZoomOut,
  Activity, FlaskConical, Wifi, Play, Square, Trash2, Grid3x3
} from "lucide-react";
import { t, useLang } from "@/lib/i18n";

const DEVICE_TYPES = [
  { type: "Router",      labelKey: "simDevRouter",    icon: "🔀" },
  { type: "Switch",      labelKey: "simDevSwitch",    icon: "🔌" },
  { type: "PC",          labelKey: "simDevPC",        icon: "🖥️" },
  { type: "Server",      labelKey: "simDevServer",    icon: "🗄️" },
  { type: "Firewall",    labelKey: "simDevFirewall",  icon: "🛡️" },
  { type: "AccessPoint", labelKey: "simDevWifi",      icon: "📡" },
  { type: "Cloud",       labelKey: "simDevInternet",  icon: "☁️" },
  { type: "Laptop",      labelKey: "simDevLaptop",    icon: "💻" },
];

const PROTOCOLS = ["ICMP", "TCP", "UDP", "DNS", "HTTP", "ARP"];

function Divider() {
  return <div className="mx-3 my-2 h-px bg-border" />;
}

function SectionLabel({ label }) {
  return (
    <div className="px-3 py-1 mb-0.5">
      <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
    </div>
  );
}

function ToolBtn({ icon: BtnIcon, label, active, onClick, disabled = false, variant = "default" }) {
  let activeCls = "bg-primary text-primary-foreground font-bold border-primary";
  let inactiveCls = "bg-muted/50 border-border text-foreground hover:bg-accent hover:text-foreground";
  
  if (variant === "destructive") {
    activeCls = "bg-destructive text-destructive-foreground font-bold border-destructive";
    inactiveCls = "bg-destructive/10 border-destructive/25 text-destructive hover:bg-destructive/20";
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label}
      className={`w-full flex items-center gap-2 px-3 py-2 rounded-[10px] text-xs font-semibold transition-all border disabled:opacity-30 disabled:cursor-not-allowed ${
        active ? activeCls : inactiveCls
      }`}
    >
      <BtnIcon size={13} />
      <span className="truncate">{label}</span>
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
  useLang();
  const DEVICES = DEVICE_TYPES.map((d) => ({ ...d, label: t(d.labelKey) }));

  const connectMode = activeTool === "connect";
  const packetMode = activeTool === "packet";
  const deleteMode = activeTool === "delete";

  return (
    <motion.div
      animate={{ width: collapsed ? 52 : 210 }}
      transition={{ duration: 0.22, ease: "easeInOut" }}
      className="h-full flex-shrink-0 flex flex-col overflow-hidden relative bg-card border-l border-border text-foreground"
    >
      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full flex items-center justify-center transition-all bg-accent border border-border text-brand hover:scale-110"
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
              className={`w-9 h-9 rounded-[10px] flex items-center justify-center cursor-grab text-base transition-all border ${
                selectedDeviceType === d.type
                  ? "bg-accent border-primary"
                  : "bg-muted border-border hover:bg-accent"
              }`}
              title={d.label}
            >
              {d.icon}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col h-full overflow-y-auto" style={{ scrollbarWidth: "none" }}>
          {/* Header */}
          <div className="px-3 py-3 flex-shrink-0 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full animate-pulse bg-success" />
              <span className="text-[11px] font-black tracking-wide text-foreground">
                {t("simTools")}
              </span>
            </div>
            <div className="flex gap-2 mt-1.5 text-[9px] font-mono text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full inline-block bg-primary" />
                {nodes?.length || 0} {t("simDevicesCount")}
              </span>
              <span>|</span>
              <span>{connections?.length || 0} {t("simLinksCount")}</span>
            </div>
          </div>

          <div className="flex-1 py-2 space-y-0.5 px-1">
            {/* DEVICES */}
            <SectionLabel label={t("simDevicesSection")} />
            <div className="grid grid-cols-2 gap-1 px-1 pb-2">
              {DEVICES.map((device) => (
                <div
                  key={device.type}
                  draggable
                  onDragStart={(e) => { e.dataTransfer.setData("deviceType", device.type); e.dataTransfer.effectAllowed = "copy"; }}
                  onClick={(e) => { e.stopPropagation(); onSelectDevice?.(device.type); }}
                  className={`flex flex-col items-center gap-1 p-2 rounded-[10px] cursor-grab active:cursor-grabbing transition-all border ${
                    selectedDeviceType === device.type
                      ? "bg-accent border-primary"
                      : "bg-muted/50 border-border hover:bg-accent/70"
                  }`}
                  title={`${t("simTapToSelect")} ${device.label}`}
                >
                  <span className="text-base leading-none">{device.icon}</span>
                  <span className="text-[9px] font-bold text-center leading-tight truncate w-full text-foreground">
                    {device.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Tap-to-place indicator — يظهر عند اختيار جهاز */}
            {selectedDeviceType && (
              <div className="flex items-center justify-between gap-2 px-2 py-1.5 mb-1 rounded-[8px] bg-accent border border-primary">
                <span className="text-[9px] font-bold text-brand truncate">
                  👆 {DEVICES.find(d => d.type === selectedDeviceType)?.label} — {t("simTapCanvas")}
                </span>
                <button
                  onClick={(e) => { e.stopPropagation(); onCancelPlacement?.(); }}
                  className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-destructive/15 text-destructive"
                >
                  ✕
                </button>
              </div>
            )}

            <Divider />

            {/* TOOLS */}
            <SectionLabel label={t("simToolsSection")} />
            <div className="space-y-1 px-1">
              <ToolBtn
                icon={LinkIcon}
                label={connectMode ? (connectFrom ? t("simConnectSecond") : t("simConnectFirst")) : t("simConnect")}
                active={connectMode}
                onClick={() => setTool("connect")}
              />
              <ToolBtn
                icon={packetMode ? Square : Play}
                label={packetMode ? (packetFrom ? t("simSelectDest") : t("simSelectSource")) : t("simSendPacket")}
                active={packetMode}
                onClick={() => setTool("packet")}
                disabled={connections.length === 0}
              />
              <ToolBtn
                icon={Trash2}
                label={t("simDeleteDevice")}
                active={deleteMode}
                onClick={() => setTool("delete")}
                variant="destructive"
              />
            </div>

            {/* Speed control */}
            <div className="px-1 pt-1 pb-1">
              <div className="text-[8px] font-bold px-2 mb-1.5 text-muted-foreground">{t("simSendSpeed")}</div>
              <div className="grid grid-cols-4 gap-1 px-1">
                {[{ v: 0.5, l: "0.5x" }, { v: 1, l: "1x" }, { v: 2, l: "2x" }, { v: 3, l: "3x" }].map(({ v, l }) => (
                  <button
                    key={v}
                    onClick={() => setPacketSpeed(v)}
                    className={`py-1 rounded-[6px] text-[8px] font-black transition-all border ${
                      packetSpeed === v
                        ? "bg-secondary text-secondary-foreground border-secondary"
                        : "bg-muted border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {/* Protocol selector */}
            <div className="px-1 pt-1 pb-1">
              <div className="text-[8px] font-bold px-2 mb-1.5 text-muted-foreground">PROTOCOL</div>
              <div className="grid grid-cols-3 gap-1 px-1">
                {PROTOCOLS.map((p) => (
                  <button
                    key={p}
                    onClick={() => setSelectedProtocol(p)}
                    className={`py-1 rounded-[6px] text-[8px] font-black transition-all border ${
                      selectedProtocol === p
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <Divider />

            {/* SIMULATION */}
            <SectionLabel label={t("simSimulationSection")} />
            <div className="space-y-1 px-1">
              <ToolBtn
                icon={Wifi}
                label={`${t("simPacketSniffer")}${snifferCount > 0 ? ` (${snifferCount})` : ""}`}
                active={showSniffer}
                onClick={() => setShowSniffer(!showSniffer)}
              />
              <ToolBtn
                icon={Grid3x3}
                label={t("simAutoArrange")}
                active={false}
                onClick={autoArrange}
                disabled={nodes.length < 2}
              />
            </div>

            <Divider />

            {/* AI & LAB */}
            <SectionLabel label={t("simAiLabSection")} />
            <div className="space-y-1 px-1">
              <ToolBtn
                icon={Bot}
                label={t("simAiAssistant")}
                active={showAI}
                onClick={() => setShowAI(!showAI)}
              />
              <Link to="/scenario-lab" className="block">
                <ToolBtn
                  icon={FlaskConical}
                  label={t("simScenarioLabLink")}
                  active={false}
                  onClick={() => {}}
                />
              </Link>
            </div>

            <Divider />

            {/* VIEW & HISTORY */}
            <SectionLabel label={t("simViewHistorySection")} />
            <div className="space-y-1.5 px-1 pb-2">
              {/* Zoom */}
              <div className="flex items-center justify-between px-2 py-1.5 rounded-[10px] bg-muted border border-border">
                <button onClick={zoomOut} className="p-1 rounded-[6px] hover:bg-accent transition-colors text-muted-foreground hover:text-foreground">
                  <ZoomOut size={12} />
                </button>
                <span className="text-[10px] font-mono text-brand font-bold">{Math.round(zoom * 100)}%</span>
                <button onClick={zoomIn} className="p-1 rounded-[6px] hover:bg-accent transition-colors text-muted-foreground hover:text-foreground">
                  <ZoomIn size={12} />
                </button>
              </div>
              {/* Undo / Redo */}
              <div className="flex gap-1">
                <button
                  onClick={undo}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-[10px] text-[10px] font-medium transition-all bg-muted border border-border text-muted-foreground hover:text-foreground hover:bg-accent"
                >
                  <Undo2 size={11} /> {t("simUndo")}
                </button>
                <button
                  onClick={redo}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-[10px] text-[10px] font-medium transition-all bg-muted border border-border text-muted-foreground hover:text-foreground hover:bg-accent"
                >
                  <Redo2 size={11} /> {t("simRedo")}
                </button>
              </div>
              <button
                onClick={resetView}
                className="w-full py-1.5 rounded-[10px] text-[10px] font-medium transition-all bg-muted border border-border text-muted-foreground hover:text-foreground hover:bg-accent"
              >
                {t("simResetView")}
              </button>
              <button
                onClick={reset}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-[10px] text-[10px] font-bold transition-all bg-destructive/10 border border-destructive/25 text-destructive hover:bg-destructive/20"
              >
                <RotateCcw size={11} /> {t("simClearAll")}
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}