import { useRef, useState } from "react";
import { Trash2 } from "lucide-react";

const DEVICE_STYLES = {
  Router:      { glow: "#3B82F6", bg: "rgba(59,130,246,0.12)",  border: "rgba(59,130,246,0.6)"  },
  Switch:      { glow: "#10B981", bg: "rgba(16,185,129,0.12)",  border: "rgba(16,185,129,0.6)"  },
  PC:          { glow: "#6366F1", bg: "rgba(99,102,241,0.12)",  border: "rgba(99,102,241,0.6)"  },
  Server:      { glow: "#8B5CF6", bg: "rgba(139,92,246,0.12)",  border: "rgba(139,92,246,0.6)"  },
  Firewall:    { glow: "#EF4444", bg: "rgba(239,68,68,0.12)",   border: "rgba(239,68,68,0.6)"   },
  AccessPoint: { glow: "#F59E0B", bg: "rgba(245,158,11,0.12)",  border: "rgba(245,158,11,0.6)"  },
  Cloud:       { glow: "#0EA5E9", bg: "rgba(14,165,233,0.12)",  border: "rgba(14,165,233,0.6)"  },
  Laptop:      { glow: "#64748B", bg: "rgba(100,116,139,0.12)", border: "rgba(100,116,139,0.6)" },
};

const DEVICE_ICONS = {
  Router: (
    <svg viewBox="0 0 40 40" fill="none" className="w-9 h-9">
      <rect x="4" y="14" width="32" height="12" rx="3" fill="#3B82F6" opacity="0.9" />
      <circle cx="12" cy="20" r="2.5" fill="#93C5FD" />
      <circle cx="20" cy="20" r="2.5" fill="#BFDBFE" />
      <circle cx="28" cy="20" r="2.5" fill="#93C5FD" />
      <rect x="10" y="8" width="3" height="6" rx="1" fill="#60A5FA" />
      <rect x="19" y="6" width="3" height="8" rx="1" fill="#93C5FD" />
      <rect x="28" y="9" width="3" height="5" rx="1" fill="#60A5FA" />
    </svg>
  ),
  Switch: (
    <svg viewBox="0 0 40 40" fill="none" className="w-9 h-9">
      <rect x="4" y="15" width="32" height="10" rx="2" fill="#10B981" opacity="0.9" />
      {[8,13,18,23,28].map(x => (
        <rect key={x} x={x} y="19" width="3" height="2" rx="0.5" fill="#A7F3D0" />
      ))}
      <path d="M8 15 L8 10 M15 15 L15 10 M22 15 L22 10 M29 15 L29 10" stroke="#34D399" strokeWidth="1.5" />
      <path d="M8 25 L8 30 M15 25 L15 30 M22 25 L22 30 M29 25 L29 30" stroke="#34D399" strokeWidth="1.5" />
    </svg>
  ),
  PC: (
    <svg viewBox="0 0 40 40" fill="none" className="w-9 h-9">
      <rect x="6" y="8" width="28" height="18" rx="2" fill="#6366F1" opacity="0.9" />
      <rect x="8" y="10" width="24" height="14" rx="1" fill="#818CF8" opacity="0.7" />
      <rect x="15" y="28" width="10" height="3" rx="1" fill="#818CF8" />
      <rect x="12" y="31" width="16" height="1.5" rx="0.75" fill="#6366F1" />
    </svg>
  ),
  Server: (
    <svg viewBox="0 0 40 40" fill="none" className="w-9 h-9">
      <rect x="8" y="7" width="24" height="8" rx="2" fill="#8B5CF6" opacity="0.9" />
      <rect x="8" y="17" width="24" height="8" rx="2" fill="#7C3AED" opacity="0.9" />
      <rect x="8" y="27" width="24" height="6" rx="2" fill="#6D28D9" opacity="0.9" />
      <circle cx="28" cy="11" r="1.5" fill="#C4B5FD" />
      <circle cx="28" cy="21" r="1.5" fill="#C4B5FD" />
    </svg>
  ),
  Firewall: (
    <svg viewBox="0 0 40 40" fill="none" className="w-9 h-9">
      <path d="M20 4 L34 10 L34 22 C34 30 20 36 20 36 C20 36 6 30 6 22 L6 10 Z" fill="#EF4444" opacity="0.9" />
      <path d="M20 10 L28 14 L28 22 C28 27 20 31 20 31 C20 31 12 27 12 22 L12 14 Z" fill="#FCA5A5" opacity="0.7" />
      <path d="M20 16 L24 18 L24 22 C24 24.5 20 26 20 26 C20 26 16 24.5 16 22 L16 18 Z" fill="#EF4444" />
    </svg>
  ),
  AccessPoint: (
    <svg viewBox="0 0 40 40" fill="none" className="w-9 h-9">
      <circle cx="20" cy="26" r="4" fill="#F59E0B" opacity="0.9" />
      <path d="M12 18 Q20 10 28 18" stroke="#FCD34D" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M8 13 Q20 3 32 13" stroke="#FDE68A" strokeWidth="2" strokeLinecap="round" fill="none" />
      <line x1="20" y1="26" x2="20" y2="34" stroke="#F59E0B" strokeWidth="2" />
      <rect x="14" y="33" width="12" height="2" rx="1" fill="#F59E0B" />
    </svg>
  ),
  Cloud: (
    <svg viewBox="0 0 40 40" fill="none" className="w-9 h-9">
      <path d="M10 28 C6 28 4 25 4 22 C4 19 6.5 17 9.5 17 C9.5 12 13 8 18 8 C22 8 25.5 10.5 26.5 14 C27 14 27.5 14 28 14 C32 14 36 17 36 22 C36 26 33 28 29 28 Z" fill="#0EA5E9" opacity="0.9" />
      <path d="M15 28 L15 34 M20 28 L20 36 M25 28 L25 34" stroke="#7DD3FC" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  Laptop: (
    <svg viewBox="0 0 40 40" fill="none" className="w-9 h-9">
      <rect x="7" y="9" width="26" height="18" rx="2" fill="#1E293B" />
      <rect x="9" y="11" width="22" height="14" rx="1" fill="#38BDF8" opacity="0.7" />
      <path d="M4 29 L36 29 L34 32 L6 32 Z" fill="#334155" />
      <rect x="16" y="29" width="8" height="1" rx="0.5" fill="#475569" />
    </svg>
  ),
};

export default function NetworkNode({
  node, selected, highlighted, connectMode, onClick, onDelete, onMove, zoom, hasActivePacket
}) {
  const [dragging, setDragging] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  const style = DEVICE_STYLES[node.type] || DEVICE_STYLES.PC;
  const isConnectSource = highlighted;
  const isActive = hasActivePacket;

  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    if (connectMode) { onClick(); return; }
    setDragging(true);
    dragOffset.current = {
      x: e.clientX / zoom - node.x,
      y: e.clientY / zoom - node.y,
    };
    const onMoveHandler = (ev) => {
      onMove(node.id, ev.clientX / zoom - dragOffset.current.x, ev.clientY / zoom - dragOffset.current.y);
    };
    const onUp = () => {
      setDragging(false);
      window.removeEventListener("mousemove", onMoveHandler);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMoveHandler);
    window.addEventListener("mouseup", onUp);
  };

  const handleClick = (e) => {
    e.stopPropagation();
    if (!dragging) onClick();
  };

  const glowIntensity = selected || isConnectSource ? "0.9" : isActive ? "0.6" : "0.3";
  const glowSize = selected ? "20px" : isActive ? "16px" : "8px";

  return (
    <div
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      onMouseEnter={() => setShowDelete(true)}
      onMouseLeave={() => setShowDelete(false)}
      style={{
        position: "absolute",
        left: node.x,
        top: node.y,
        transform: "translate(-50%, -50%)",
        cursor: connectMode ? "crosshair" : dragging ? "grabbing" : "grab",
        zIndex: dragging ? 1000 : selected ? 100 : 1,
        userSelect: "none",
      }}
    >
      <div
        className="flex flex-col items-center gap-1.5"
        style={{
          transform: dragging
            ? "scale(1.08)"
            : isConnectSource
            ? "scale(1.1)"
            : "scale(1)",
          transition: "transform 0.15s",
        }}
      >
        {/* Node box */}
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 16,
            background: style.bg,
            border: `1.5px solid ${selected || isConnectSource ? style.glow : style.border}`,
            boxShadow: `0 0 ${glowSize} rgba(${hexToRgb(style.glow)},${glowIntensity})${
              isActive ? `, 0 0 30px rgba(${hexToRgb(style.glow)},0.4)` : ""
            }`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            backdropFilter: "blur(4px)",
            transition: "box-shadow 0.2s, border-color 0.2s",
          }}
        >
          {DEVICE_ICONS[node.type]}

          {/* Active pulse ring */}
          {isActive && (
            <div
              className="absolute inset-0 rounded-2xl animate-ping"
              style={{
                border: `1px solid ${style.glow}`,
                opacity: 0.4,
                animationDuration: "1.5s",
              }}
            />
          )}

          {/* Delete button */}
          {showDelete && !connectMode && (
            <button
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center shadow-lg z-10 transition-all hover:scale-110"
              style={{
                background: "linear-gradient(135deg,#ef4444,#dc2626)",
                border: "1px solid rgba(239,68,68,0.5)",
              }}
            >
              <Trash2 size={9} className="text-white" />
            </button>
          )}
        </div>

        {/* Label */}
        <span
          className="text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap"
          style={{
            color: style.glow,
            background: `rgba(${hexToRgb(style.glow)},0.1)`,
            border: `1px solid rgba(${hexToRgb(style.glow)},0.25)`,
            backdropFilter: "blur(4px)",
          }}
        >
          {node.label}
        </span>

        {/* IP */}
        {node.ip && (
          <span
            className="text-[9px] font-mono whitespace-nowrap"
            style={{
              color: "rgba(6,182,212,0.8)",
              background: "rgba(6,182,212,0.08)",
              border: "1px solid rgba(6,182,212,0.2)",
              padding: "1px 6px",
              borderRadius: 6,
            }}
          >
            {node.ip}
          </span>
        )}
      </div>
    </div>
  );
}

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}