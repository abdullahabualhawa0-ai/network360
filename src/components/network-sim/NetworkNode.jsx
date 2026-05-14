import { useRef, useState } from "react";
import { Trash2 } from "lucide-react";

const DEVICE_COLORS = {
  Router: { bg: "#DBEAFE", border: "#3B82F6", text: "#1D4ED8" },
  Switch: { bg: "#D1FAE5", border: "#10B981", text: "#065F46" },
  PC: { bg: "#E0E7FF", border: "#6366F1", text: "#3730A3" },
  Server: { bg: "#EDE9FE", border: "#8B5CF6", text: "#5B21B6" },
  Firewall: { bg: "#FEE2E2", border: "#EF4444", text: "#991B1B" },
  AccessPoint: { bg: "#FEF3C7", border: "#F59E0B", text: "#92400E" },
  Cloud: { bg: "#E0F2FE", border: "#0EA5E9", text: "#0C4A6E" },
  Laptop: { bg: "#F1F5F9", border: "#64748B", text: "#1E293B" },
};

const DEVICE_ICONS = {
  Router: (
    <svg viewBox="0 0 40 40" fill="none" className="w-10 h-10">
      <rect x="4" y="14" width="32" height="12" rx="3" fill="#3B82F6" />
      <circle cx="12" cy="20" r="2.5" fill="white" />
      <circle cx="20" cy="20" r="2.5" fill="white" />
      <circle cx="28" cy="20" r="2.5" fill="white" />
      <rect x="10" y="8" width="3" height="6" rx="1" fill="#60A5FA" />
      <rect x="19" y="6" width="3" height="8" rx="1" fill="#93C5FD" />
      <rect x="28" y="9" width="3" height="5" rx="1" fill="#60A5FA" />
    </svg>
  ),
  Switch: (
    <svg viewBox="0 0 40 40" fill="none" className="w-10 h-10">
      <rect x="4" y="15" width="32" height="10" rx="2" fill="#10B981" />
      {[8,13,18,23,28].map(x => (
        <rect key={x} x={x} y="19" width="3" height="2" rx="0.5" fill="white" />
      ))}
      <path d="M8 15 L8 10 M15 15 L15 10 M22 15 L22 10 M29 15 L29 10" stroke="#34D399" strokeWidth="1.5" />
      <path d="M8 25 L8 30 M15 25 L15 30 M22 25 L22 30 M29 25 L29 30" stroke="#34D399" strokeWidth="1.5" />
    </svg>
  ),
  PC: (
    <svg viewBox="0 0 40 40" fill="none" className="w-10 h-10">
      <rect x="6" y="8" width="28" height="18" rx="2" fill="#6366F1" />
      <rect x="8" y="10" width="24" height="14" rx="1" fill="#A5B4FC" />
      <rect x="15" y="28" width="10" height="3" rx="1" fill="#818CF8" />
      <rect x="12" y="31" width="16" height="1.5" rx="0.75" fill="#6366F1" />
    </svg>
  ),
  Server: (
    <svg viewBox="0 0 40 40" fill="none" className="w-10 h-10">
      <rect x="8" y="7" width="24" height="8" rx="2" fill="#8B5CF6" />
      <rect x="8" y="17" width="24" height="8" rx="2" fill="#7C3AED" />
      <rect x="8" y="27" width="24" height="6" rx="2" fill="#6D28D9" />
      <circle cx="28" cy="11" r="1.5" fill="#C4B5FD" />
      <circle cx="28" cy="21" r="1.5" fill="#C4B5FD" />
    </svg>
  ),
  Firewall: (
    <svg viewBox="0 0 40 40" fill="none" className="w-10 h-10">
      <path d="M20 4 L34 10 L34 22 C34 30 20 36 20 36 C20 36 6 30 6 22 L6 10 Z" fill="#EF4444" />
      <path d="M20 10 L28 14 L28 22 C28 27 20 31 20 31 C20 31 12 27 12 22 L12 14 Z" fill="#FCA5A5" />
      <path d="M20 16 L24 18 L24 22 C24 24.5 20 26 20 26 C20 26 16 24.5 16 22 L16 18 Z" fill="#EF4444" />
    </svg>
  ),
  AccessPoint: (
    <svg viewBox="0 0 40 40" fill="none" className="w-10 h-10">
      <circle cx="20" cy="26" r="4" fill="#F59E0B" />
      <path d="M12 18 Q20 10 28 18" stroke="#FCD34D" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M8 13 Q20 3 32 13" stroke="#FDE68A" strokeWidth="2" strokeLinecap="round" fill="none" />
      <line x1="20" y1="26" x2="20" y2="34" stroke="#F59E0B" strokeWidth="2" />
      <rect x="14" y="33" width="12" height="2" rx="1" fill="#F59E0B" />
    </svg>
  ),
  Cloud: (
    <svg viewBox="0 0 40 40" fill="none" className="w-10 h-10">
      <path d="M10 28 C6 28 4 25 4 22 C4 19 6.5 17 9.5 17 C9.5 12 13 8 18 8 C22 8 25.5 10.5 26.5 14 C27 14 27.5 14 28 14 C32 14 36 17 36 22 C36 26 33 28 29 28 Z" fill="#0EA5E9" />
      <path d="M15 28 L15 34 M20 28 L20 36 M25 28 L25 34" stroke="#7DD3FC" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  Laptop: (
    <svg viewBox="0 0 40 40" fill="none" className="w-10 h-10">
      <rect x="7" y="9" width="26" height="18" rx="2" fill="#0F172A" />
      <rect x="9" y="11" width="22" height="14" rx="1" fill="#38BDF8" />
      <path d="M4 29 L36 29 L34 32 L6 32 Z" fill="#1E293B" />
      <rect x="16" y="29" width="8" height="1" rx="0.5" fill="#475569" />
    </svg>
  ),
};

export default function NetworkNode({ node, selected, connectMode, connectFrom, onMove, onClick, onDelete, zoom }) {
  const nodeRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  const colors = DEVICE_COLORS[node.type] || DEVICE_COLORS.PC;
  const isConnectSource = connectFrom === node.id;

  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    if (connectMode) {
      onClick();
      return;
    }
    setDragging(true);
    dragOffset.current = {
      x: e.clientX / zoom - node.x,
      y: e.clientY / zoom - node.y,
    };

    const onMove_ = (ev) => {
      onMove(node.id, ev.clientX / zoom - dragOffset.current.x, ev.clientY / zoom - dragOffset.current.y);
    };
    const onUp = () => {
      setDragging(false);
      window.removeEventListener("mousemove", onMove_);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove_);
    window.addEventListener("mouseup", onUp);
  };

  const handleClick = (e) => {
    e.stopPropagation();
    if (!dragging) onClick();
  };

  return (
    <div
      ref={nodeRef}
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
        className="flex flex-col items-center gap-1"
        style={{
          filter: dragging ? "drop-shadow(0 8px 16px rgba(0,0,0,0.2))" : "none",
          transform: dragging ? "scale(1.05)" : isConnectSource ? "scale(1.08)" : "scale(1)",
          transition: "transform 0.15s, filter 0.15s",
        }}
      >
        {/* Node box */}
        <div
          style={{
            background: colors.bg,
            border: `2px solid ${selected || isConnectSource ? colors.border : "#e2e8f0"}`,
            boxShadow: selected ? `0 0 0 3px ${colors.border}40` : isConnectSource ? `0 0 0 4px ${colors.border}60` : "none",
          }}
          className="w-16 h-16 rounded-2xl flex items-center justify-center transition-all relative"
        >
          {DEVICE_ICONS[node.type]}

          {/* Delete button */}
          {showDelete && !connectMode && (
            <button
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center shadow-md hover:bg-red-600 transition-colors z-10"
            >
              <Trash2 size={9} className="text-white" />
            </button>
          )}
        </div>

        {/* Label */}
        <span
          className="text-[10px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap"
          style={{ color: colors.text, background: colors.bg, border: `1px solid ${colors.border}40` }}
        >
          {node.label}
        </span>
      </div>
    </div>
  );
}