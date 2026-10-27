import DeviceIcon from "./DeviceIcons";

const DEVICES = [
  { type: "Router", label: "راوتر", glow: "#0EA5E9" },
  { type: "Switch", label: "سويتش", glow: "#10B981" },
  { type: "PC", label: "حاسوب", glow: "#6366F1" },
  { type: "Server", label: "سيرفر", glow: "#8B5CF6" },
  { type: "Firewall", label: "جدار ناري", glow: "#EF4444" },
  { type: "AccessPoint", label: "واي فاي", glow: "#F59E0B" },
  { type: "Cloud", label: "إنترنت", glow: "#0284C7" },
  { type: "Laptop", label: "لابتوب", glow: "#38BDF8" },
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
        <DeviceIcon type={device.type} size={26} />
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