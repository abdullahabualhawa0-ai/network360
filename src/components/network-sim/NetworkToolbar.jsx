import { useDrag } from "./useDrag";

const DEVICES = [
  {
    type: "Router",
    label: "راوتر",
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8">
        <rect x="4" y="14" width="32" height="12" rx="3" fill="#3B82F6" />
        <circle cx="12" cy="20" r="2.5" fill="white" />
        <circle cx="20" cy="20" r="2.5" fill="white" />
        <circle cx="28" cy="20" r="2.5" fill="white" />
        <rect x="10" y="8" width="3" height="6" rx="1" fill="#60A5FA" />
        <rect x="19" y="6" width="3" height="8" rx="1" fill="#93C5FD" />
        <rect x="28" y="9" width="3" height="5" rx="1" fill="#60A5FA" />
      </svg>
    ),
    color: "from-blue-500 to-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-200",
  },
  {
    type: "Switch",
    label: "سويتش",
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8">
        <rect x="4" y="15" width="32" height="10" rx="2" fill="#10B981" />
        {[8,13,18,23,28].map(x => (
          <rect key={x} x={x} y="19" width="3" height="2" rx="0.5" fill="white" />
        ))}
        <path d="M8 15 L8 10 M15 15 L15 10 M22 15 L22 10 M29 15 L29 10" stroke="#34D399" strokeWidth="1.5" />
        <path d="M8 25 L8 30 M15 25 L15 30 M22 25 L22 30 M29 25 L29 30" stroke="#34D399" strokeWidth="1.5" />
      </svg>
    ),
    color: "from-emerald-500 to-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
  },
  {
    type: "PC",
    label: "حاسوب",
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8">
        <rect x="6" y="8" width="28" height="18" rx="2" fill="#6366F1" />
        <rect x="8" y="10" width="24" height="14" rx="1" fill="#A5B4FC" />
        <rect x="15" y="28" width="10" height="3" rx="1" fill="#818CF8" />
        <rect x="12" y="31" width="16" height="1.5" rx="0.75" fill="#6366F1" />
      </svg>
    ),
    color: "from-indigo-500 to-indigo-700",
    bg: "bg-indigo-50",
    border: "border-indigo-200",
  },
  {
    type: "Server",
    label: "سيرفر",
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8">
        <rect x="8" y="7" width="24" height="8" rx="2" fill="#8B5CF6" />
        <rect x="8" y="17" width="24" height="8" rx="2" fill="#7C3AED" />
        <rect x="8" y="27" width="24" height="6" rx="2" fill="#6D28D9" />
        <circle cx="28" cy="11" r="1.5" fill="#C4B5FD" />
        <circle cx="28" cy="21" r="1.5" fill="#C4B5FD" />
        <rect x="11" y="9.5" width="10" height="3" rx="0.5" fill="#C4B5FD" opacity="0.5" />
      </svg>
    ),
    color: "from-violet-500 to-violet-700",
    bg: "bg-violet-50",
    border: "border-violet-200",
  },
  {
    type: "Firewall",
    label: "جدار ناري",
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8">
        <path d="M20 4 L34 10 L34 22 C34 30 20 36 20 36 C20 36 6 30 6 22 L6 10 Z" fill="#EF4444" />
        <path d="M20 10 L28 14 L28 22 C28 27 20 31 20 31 C20 31 12 27 12 22 L12 14 Z" fill="#FCA5A5" />
        <path d="M20 16 L24 18 L24 22 C24 24.5 20 26 20 26 C20 26 16 24.5 16 22 L16 18 Z" fill="#EF4444" />
      </svg>
    ),
    color: "from-red-500 to-red-700",
    bg: "bg-red-50",
    border: "border-red-200",
  },
  {
    type: "AccessPoint",
    label: "نقطة وصول",
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8">
        <circle cx="20" cy="26" r="4" fill="#F59E0B" />
        <path d="M12 18 Q20 10 28 18" stroke="#FCD34D" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <path d="M8 13 Q20 3 32 13" stroke="#FDE68A" strokeWidth="2" strokeLinecap="round" fill="none" />
        <line x1="20" y1="26" x2="20" y2="34" stroke="#F59E0B" strokeWidth="2" />
        <rect x="14" y="33" width="12" height="2" rx="1" fill="#F59E0B" />
      </svg>
    ),
    color: "from-amber-500 to-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
  },
  {
    type: "Cloud",
    label: "إنترنت",
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8">
        <path d="M10 28 C6 28 4 25 4 22 C4 19 6.5 17 9.5 17 C9.5 12 13 8 18 8 C22 8 25.5 10.5 26.5 14 C27 14 27.5 14 28 14 C32 14 36 17 36 22 C36 26 33 28 29 28 Z" fill="#0EA5E9" />
        <path d="M10 28 C6 28 4 25 4 22 C4 19 6.5 17 9.5 17 C9.5 12 13 8 18 8 C22 8 25.5 10.5 26.5 14" stroke="#38BDF8" strokeWidth="1" fill="none" />
        <path d="M15 28 L15 34 M20 28 L20 36 M25 28 L25 34" stroke="#7DD3FC" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    color: "from-sky-500 to-sky-700",
    bg: "bg-sky-50",
    border: "border-sky-200",
  },
  {
    type: "Laptop",
    label: "لابتوب",
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8">
        <rect x="7" y="9" width="26" height="18" rx="2" fill="#0F172A" />
        <rect x="9" y="11" width="22" height="14" rx="1" fill="#38BDF8" />
        <path d="M4 29 L36 29 L34 32 L6 32 Z" fill="#1E293B" />
        <rect x="16" y="29" width="8" height="1" rx="0.5" fill="#475569" />
      </svg>
    ),
    color: "from-slate-600 to-slate-800",
    bg: "bg-slate-50",
    border: "border-slate-200",
  },
];

export { DEVICES };

export default function NetworkToolbar({ connectMode, setConnectMode, connectFrom, setConnectFrom }) {
  return (
    <div className="w-20 bg-slate-900 border-l border-slate-700 flex flex-col items-center py-4 gap-1 overflow-y-auto">
      <div className="text-slate-500 text-[9px] font-semibold mb-2 tracking-wider">أجهزة</div>
      {DEVICES.map((device) => (
        <DraggableDevice key={device.type} device={device} />
      ))}
    </div>
  );
}

function DraggableDevice({ device }) {
  const handleDragStart = (e) => {
    e.dataTransfer.setData("deviceType", device.type);
    e.dataTransfer.effectAllowed = "copy";
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      title={device.label}
      className="flex flex-col items-center gap-1 p-2 rounded-xl cursor-grab active:cursor-grabbing hover:bg-slate-800 transition-colors group w-16"
    >
      <div className="w-12 h-12 rounded-xl bg-slate-800 group-hover:bg-slate-700 flex items-center justify-center transition-colors border border-slate-700 group-hover:border-slate-500">
        {device.icon}
      </div>
      <span className="text-slate-400 text-[9px] group-hover:text-slate-200 transition-colors text-center leading-tight">
        {device.label}
      </span>
    </div>
  );
}