const DEVICES = [
  {
    type: "Router", label: "راوتر",
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8">
        <rect x="4" y="14" width="32" height="12" rx="3" fill="#3B82F6" opacity="0.9" />
        <circle cx="12" cy="20" r="2.5" fill="#93C5FD" />
        <circle cx="20" cy="20" r="2.5" fill="#BFDBFE" />
        <circle cx="28" cy="20" r="2.5" fill="#93C5FD" />
        <rect x="10" y="8" width="3" height="6" rx="1" fill="#60A5FA" />
        <rect x="19" y="6" width="3" height="8" rx="1" fill="#93C5FD" />
        <rect x="28" y="9" width="3" height="5" rx="1" fill="#60A5FA" />
      </svg>
    ),
    glow: "#3B82F6",
  },
  {
    type: "Switch", label: "سويتش",
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8">
        <rect x="4" y="15" width="32" height="10" rx="2" fill="#10B981" opacity="0.9" />
        {[8,13,18,23,28].map(x => (
          <rect key={x} x={x} y="19" width="3" height="2" rx="0.5" fill="#A7F3D0" />
        ))}
        <path d="M8 15 L8 10 M15 15 L15 10 M22 15 L22 10 M29 15 L29 10" stroke="#34D399" strokeWidth="1.5" />
        <path d="M8 25 L8 30 M15 25 L15 30 M22 25 L22 30 M29 25 L29 30" stroke="#34D399" strokeWidth="1.5" />
      </svg>
    ),
    glow: "#10B981",
  },
  {
    type: "PC", label: "حاسوب",
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8">
        <rect x="6" y="8" width="28" height="18" rx="2" fill="#6366F1" opacity="0.9" />
        <rect x="8" y="10" width="24" height="14" rx="1" fill="#818CF8" opacity="0.7" />
        <rect x="15" y="28" width="10" height="3" rx="1" fill="#818CF8" />
        <rect x="12" y="31" width="16" height="1.5" rx="0.75" fill="#6366F1" />
      </svg>
    ),
    glow: "#6366F1",
  },
  {
    type: "Server", label: "سيرفر",
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8">
        <rect x="8" y="7" width="24" height="8" rx="2" fill="#8B5CF6" opacity="0.9" />
        <rect x="8" y="17" width="24" height="8" rx="2" fill="#7C3AED" opacity="0.9" />
        <rect x="8" y="27" width="24" height="6" rx="2" fill="#6D28D9" opacity="0.9" />
        <circle cx="28" cy="11" r="1.5" fill="#C4B5FD" />
        <circle cx="28" cy="21" r="1.5" fill="#C4B5FD" />
      </svg>
    ),
    glow: "#8B5CF6",
  },
  {
    type: "Firewall", label: "جدار ناري",
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8">
        <path d="M20 4 L34 10 L34 22 C34 30 20 36 20 36 C20 36 6 30 6 22 L6 10 Z" fill="#EF4444" opacity="0.9" />
        <path d="M20 10 L28 14 L28 22 C28 27 20 31 20 31 C20 31 12 27 12 22 L12 14 Z" fill="#FCA5A5" opacity="0.5" />
      </svg>
    ),
    glow: "#EF4444",
  },
  {
    type: "AccessPoint", label: "واي فاي",
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8">
        <circle cx="20" cy="26" r="4" fill="#F59E0B" opacity="0.9" />
        <path d="M12 18 Q20 10 28 18" stroke="#FCD34D" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <path d="M8 13 Q20 3 32 13" stroke="#FDE68A" strokeWidth="2" strokeLinecap="round" fill="none" />
        <line x1="20" y1="26" x2="20" y2="34" stroke="#F59E0B" strokeWidth="2" />
        <rect x="14" y="33" width="12" height="2" rx="1" fill="#F59E0B" />
      </svg>
    ),
    glow: "#F59E0B",
  },
  {
    type: "Cloud", label: "إنترنت",
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8">
        <path d="M10 28 C6 28 4 25 4 22 C4 19 6.5 17 9.5 17 C9.5 12 13 8 18 8 C22 8 25.5 10.5 26.5 14 C27 14 27.5 14 28 14 C32 14 36 17 36 22 C36 26 33 28 29 28 Z" fill="#0EA5E9" opacity="0.9" />
        <path d="M15 28 L15 34 M20 28 L20 36 M25 28 L25 34" stroke="#7DD3FC" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    glow: "#0EA5E9",
  },
  {
    type: "Laptop", label: "لابتوب",
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8">
        <rect x="7" y="9" width="26" height="18" rx="2" fill="#1E293B" />
        <rect x="9" y="11" width="22" height="14" rx="1" fill="#38BDF8" opacity="0.7" />
        <path d="M4 29 L36 29 L34 32 L6 32 Z" fill="#334155" />
        <rect x="16" y="29" width="8" height="1" rx="0.5" fill="#475569" />
      </svg>
    ),
    glow: "#64748B",
  },
];

export { DEVICES };

export default function NetworkToolbar({ connectMode, setConnectMode, connectFrom, setConnectFrom, selectedDeviceType, onSelectDevice }) {
  return (
    <div
      className="w-[72px] flex flex-col items-center py-4 gap-1 overflow-y-auto flex-shrink-0"
      style={{
        background: "rgba(2,6,23,0.95)",
        borderRight: "1px solid rgba(6,182,212,0.15)",
      }}
    >
      <div
        className="text-[8px] font-bold mb-2 tracking-widest uppercase"
        style={{ color: "rgba(6,182,212,0.4)" }}
      >
        Devices
      </div>
      {DEVICES.map((device) => (
        <DraggableDevice
          key={device.type}
          device={device}
          isSelected={selectedDeviceType === device.type}
          onSelect={() => onSelectDevice?.(device.type)}
        />
      ))}
    </div>
  );
}

function DraggableDevice({ device, isSelected, onSelect }) {
  const handleDragStart = (e) => {
    e.dataTransfer.setData("deviceType", device.type);
    e.dataTransfer.effectAllowed = "copy";
  };

  // Tap-to-select — لللمس على الموبايل (drag لا يعمل على اللمس)
  const handleClick = (e) => {
    e.stopPropagation();
    onSelect?.();
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onClick={handleClick}
      title={device.label}
      className="flex flex-col items-center gap-1 p-1.5 rounded-xl cursor-grab active:cursor-grabbing transition-all group w-[60px]"
      style={{
        userSelect: "none",
        background: isSelected ? `rgba(${hexToRgb(device.glow)},0.2)` : "transparent",
        border: isSelected ? `1px solid rgba(${hexToRgb(device.glow)},0.6)` : "1px solid transparent",
        borderRadius: 12,
      }}
    >
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center transition-all group-hover:scale-110"
        style={{
          background: `rgba(${hexToRgb(device.glow)},0.1)`,
          border: `1px solid rgba(${hexToRgb(device.glow)},0.25)`,
          boxShadow: `0 0 0 rgba(${hexToRgb(device.glow)},0)`,
          transition: "all 0.2s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = `0 0 12px rgba(${hexToRgb(device.glow)},0.4)`;
          e.currentTarget.style.borderColor = `rgba(${hexToRgb(device.glow)},0.7)`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = `0 0 0 rgba(${hexToRgb(device.glow)},0)`;
          e.currentTarget.style.borderColor = `rgba(${hexToRgb(device.glow)},0.25)`;
        }}
      >
        {device.icon}
      </div>
      <span
        className="text-[8px] font-medium text-center leading-tight transition-colors"
        style={{ color: isSelected ? `rgba(${hexToRgb(device.glow)},0.9)` : "rgba(148,163,184,0.6)" }}
      >
        {device.label}
      </span>
    </div>
  );
}

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}