import { useRef, useState } from "react";
import { Trash2 } from "lucide-react";
import DeviceIcon from "./DeviceIcons";

const DEVICE_STYLES = {
  Router:      { glow: "#0EA5E9", bg: "rgba(14,165,233,0.08)",  border: "rgba(14,165,233,0.4)"   },
  Switch:      { glow: "#10B981", bg: "rgba(16,185,129,0.08)",  border: "rgba(16,185,129,0.4)"  },
  PC:          { glow: "#6366F1", bg: "rgba(99,102,241,0.08)",  border: "rgba(99,102,241,0.4)" },
  Server:      { glow: "#8B5CF6", bg: "rgba(139,92,246,0.08)",  border: "rgba(139,92,246,0.4)" },
  Firewall:    { glow: "#EF4444", bg: "rgba(239,68,68,0.08)",   border: "rgba(239,68,68,0.4)"  },
  AccessPoint: { glow: "#F59E0B", bg: "rgba(245,158,11,0.08)",  border: "rgba(245,158,11,0.4)" },
  Cloud:       { glow: "#0284C7", bg: "rgba(2,132,199,0.08)",   border: "rgba(2,132,199,0.4)" },
  Laptop:      { glow: "#38BDF8", bg: "rgba(56,189,248,0.08)",  border: "rgba(56,189,248,0.4)" },
};

export default function NetworkNode({
  node, selected, highlighted, connectMode, deleteMode, onClick, onDelete, onMove, onMoveEnd, zoom, hasActivePacket
}) {
  const [dragging, setDragging] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const hasDragged = useRef(false);

  const style = DEVICE_STYLES[node.type] || DEVICE_STYLES.PC;
  const isConnectSource = highlighted;
  const isActive = hasActivePacket;

  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    if (connectMode || deleteMode) { return; }
    hasDragged.current = false;
    setDragging(true);
    dragOffset.current = {
      x: e.clientX / zoom - node.x,
      y: e.clientY / zoom - node.y,
    };
    const onMoveHandler = (ev) => {
      hasDragged.current = true;
      onMove(node.id, ev.clientX / zoom - dragOffset.current.x, ev.clientY / zoom - dragOffset.current.y);
    };
    const onUp = (ev) => {
      setDragging(false);
      window.removeEventListener("mousemove", onMoveHandler);
      window.removeEventListener("mouseup", onUp);
      if (hasDragged.current && onMoveEnd) {
        onMoveEnd(node.id, ev.clientX / zoom - dragOffset.current.x, ev.clientY / zoom - dragOffset.current.y);
      }
    };
    window.addEventListener("mousemove", onMoveHandler);
    window.addEventListener("mouseup", onUp);
  };

  const handleClick = (e) => {
    e.stopPropagation();
    onClick();
  };

  // ظل هادئ بدلاً من التوهج — أداة تعليمية احترافية
  const boxShadow = selected || isConnectSource
    ? `0 4px 16px rgba(${hexToRgb(style.glow)},0.25)`
    : `0 2px 8px rgba(23,63,95,0.1)`;

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
        cursor: deleteMode ? "not-allowed" : connectMode ? "crosshair" : dragging ? "grabbing" : "grab",
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
            background: "#FFFFFF",
            border: `1.5px solid ${selected || isConnectSource ? style.glow : style.border}`,
            boxShadow,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            transition: "box-shadow 0.2s, border-color 0.2s",
          }}
        >
          <DeviceIcon type={node.type} size={38} />

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

          {/* Delete button (only when no tool active) */}
          {showDelete && !connectMode && !deleteMode && (
            <button
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center shadow-lg z-10 transition-all hover:scale-110"
              style={{
                background: "#C94C4C",
                border: "1px solid rgba(201,76,76,0.5)",
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
            background: `rgba(${hexToRgb(style.glow)},0.08)`,
            border: `1px solid rgba(${hexToRgb(style.glow)},0.25)`,
          }}
        >
          {node.label}
        </span>

        {/* IP */}
        {node.ip && (
          <span
            className="text-[9px] font-mono whitespace-nowrap"
            style={{
              color: "#2F6690",
              background: "rgba(47,102,144,0.06)",
              border: "1px solid rgba(47,102,144,0.2)",
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