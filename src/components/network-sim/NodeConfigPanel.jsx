import { useState, useEffect } from "react";
import { X, Settings, Save } from "lucide-react";
import { motion } from "framer-motion";

const DEVICE_DEFAULTS = {
  Router:      { ip: "192.168.1.1",   subnet: "255.255.255.0", gateway: "" },
  Switch:      { ip: "192.168.1.2",   subnet: "255.255.255.0", gateway: "192.168.1.1" },
  PC:          { ip: "192.168.1.10",  subnet: "255.255.255.0", gateway: "192.168.1.1" },
  Server:      { ip: "192.168.1.100", subnet: "255.255.255.0", gateway: "192.168.1.1" },
  Firewall:    { ip: "10.0.0.1",      subnet: "255.255.255.0", gateway: "" },
  AccessPoint: { ip: "192.168.1.5",   subnet: "255.255.255.0", gateway: "192.168.1.1" },
  Cloud:       { ip: "",              subnet: "",              gateway: "" },
  Laptop:      { ip: "192.168.1.11",  subnet: "255.255.255.0", gateway: "192.168.1.1" },
};

const DEVICE_GLOW = {
  Router: "#3B82F6", Switch: "#10B981", PC: "#6366F1", Server: "#8B5CF6",
  Firewall: "#EF4444", AccessPoint: "#F59E0B", Cloud: "#0EA5E9", Laptop: "#64748B",
};

export default function NodeConfigPanel({ node, onUpdate, onClose }) {
  const defaults = DEVICE_DEFAULTS[node.type] || {};
  const [label, setLabel] = useState(node.label || "");
  const [ip, setIp] = useState(node.ip || defaults.ip || "");
  const [subnet, setSubnet] = useState(node.subnet || defaults.subnet || "");
  const [gateway, setGateway] = useState(node.gateway || defaults.gateway || "");

  useEffect(() => {
    setLabel(node.label || "");
    setIp(node.ip || DEVICE_DEFAULTS[node.type]?.ip || "");
    setSubnet(node.subnet || DEVICE_DEFAULTS[node.type]?.subnet || "");
    setGateway(node.gateway || DEVICE_DEFAULTS[node.type]?.gateway || "");
  }, [node.id]);

  const handleSave = () => {
    onUpdate(node.id, { label, ip, subnet, gateway });
    onClose();
  };

  const showIp = node.type !== "Cloud";
  const glow = DEVICE_GLOW[node.type] || "#06b6d4";

  const inputStyle = {
    background: "rgba(15,23,42,0.8)",
    border: "1px solid rgba(6,182,212,0.2)",
    color: "#e2e8f0",
    borderRadius: 8,
    padding: "6px 10px",
    fontSize: 12,
    fontFamily: "monospace",
    width: "100%",
    outline: "none",
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="absolute top-4 right-4 z-50 w-64 overflow-hidden"
      style={{
        background: "rgba(2,6,23,0.97)",
        border: `1px solid rgba(${hexToRgb(glow)},0.4)`,
        borderRadius: 16,
        backdropFilter: "blur(20px)",
        boxShadow: `0 0 30px rgba(${hexToRgb(glow)},0.15)`,
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: "1px solid rgba(6,182,212,0.1)" }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ background: glow }}
          />
          <span className="text-white text-xs font-bold">إعدادات الجهاز</span>
          <span
            className="text-[9px] font-bold px-1.5 py-0.5 rounded-md"
            style={{
              background: `rgba(${hexToRgb(glow)},0.15)`,
              color: glow,
              border: `1px solid rgba(${hexToRgb(glow)},0.3)`,
            }}
          >
            {node.type}
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-slate-500 hover:text-red-400 transition-colors"
        >
          <X size={14} />
        </button>
      </div>

      {/* Form */}
      <div className="px-4 py-3 space-y-3">
        <div>
          <label className="block text-[10px] font-bold mb-1" style={{ color: "rgba(6,182,212,0.7)" }}>
            اسم الجهاز
          </label>
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            style={inputStyle}
            placeholder="Router 1"
            dir="ltr"
            onFocus={(e) => e.target.style.borderColor = "rgba(6,182,212,0.6)"}
            onBlur={(e) => e.target.style.borderColor = "rgba(6,182,212,0.2)"}
          />
        </div>

        {showIp && (
          <>
            <div>
              <label className="block text-[10px] font-bold mb-1" style={{ color: "rgba(6,182,212,0.7)" }}>
                عنوان IP
              </label>
              <input
                value={ip}
                onChange={(e) => setIp(e.target.value)}
                style={inputStyle}
                placeholder="192.168.1.1"
                dir="ltr"
                onFocus={(e) => e.target.style.borderColor = "rgba(6,182,212,0.6)"}
                onBlur={(e) => e.target.style.borderColor = "rgba(6,182,212,0.2)"}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold mb-1" style={{ color: "rgba(6,182,212,0.7)" }}>
                Subnet Mask
              </label>
              <input
                value={subnet}
                onChange={(e) => setSubnet(e.target.value)}
                style={inputStyle}
                placeholder="255.255.255.0"
                dir="ltr"
                onFocus={(e) => e.target.style.borderColor = "rgba(6,182,212,0.6)"}
                onBlur={(e) => e.target.style.borderColor = "rgba(6,182,212,0.2)"}
              />
            </div>
            {node.type !== "Router" && node.type !== "Firewall" && (
              <div>
                <label className="block text-[10px] font-bold mb-1" style={{ color: "rgba(6,182,212,0.7)" }}>
                  Default Gateway
                </label>
                <input
                  value={gateway}
                  onChange={(e) => setGateway(e.target.value)}
                  style={inputStyle}
                  placeholder="192.168.1.1"
                  dir="ltr"
                  onFocus={(e) => e.target.style.borderColor = "rgba(6,182,212,0.6)"}
                  onBlur={(e) => e.target.style.borderColor = "rgba(6,182,212,0.2)"}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Save */}
      <div className="px-4 pb-4">
        <button
          onClick={handleSave}
          className="w-full flex items-center justify-center gap-2 text-xs font-bold py-2 rounded-xl transition-all hover:scale-105"
          style={{
            background: `linear-gradient(135deg, rgba(${hexToRgb(glow)},0.3), rgba(6,182,212,0.3))`,
            border: `1px solid rgba(${hexToRgb(glow)},0.5)`,
            color: "white",
            boxShadow: `0 0 15px rgba(${hexToRgb(glow)},0.2)`,
          }}
        >
          <Save size={13} />
          حفظ الإعدادات
        </button>
      </div>
    </motion.div>
  );
}

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}