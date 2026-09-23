import { useState, useEffect } from "react";
import { X, Settings, Save } from "lucide-react";
import { motion } from "framer-motion";
import { t, useLang } from "@/lib/i18n";

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
  Router: "#173F5F", Switch: "#2E7D5B", PC: "#2F6690", Server: "#3A86A8",
  Firewall: "#C94C4C", AccessPoint: "#D69E2E", Cloud: "#64748B", Laptop: "#2F6690",
};

export default function NodeConfigPanel({ node, onUpdate, onClose }) {
  useLang();
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
  const glow = DEVICE_GLOW[node.type] || "#2F6690";

  const inputStyle = {
    background: "#F7F9FC",
    border: "1px solid #E2E8F0",
    color: "#1F2937",
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
        background: "#FFFFFF",
        border: `1px solid rgba(${hexToRgb(glow)},0.4)`,
        borderRadius: 16,
        boxShadow: "0 12px 32px rgba(23,63,95,0.15)",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: "1px solid #E2E8F0" }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ background: glow }}
          />
          <span className="text-xs font-bold" style={{ color: "#173F5F" }}>{t("simNodeConfig")}</span>
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
          className="text-muted-foreground hover:text-destructive transition-colors"
        >
          <X size={14} />
        </button>
      </div>

      {/* Form */}
      <div className="px-4 py-3 space-y-3">
        <div>
          <label className="block text-[10px] font-bold mb-1" style={{ color: "rgba(6,182,212,0.7)" }}>
            {t("simNodeName")}
          </label>
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            style={inputStyle}
            placeholder="Router 1"
            dir="ltr"
            onFocus={(e) => e.target.style.borderColor = "rgba(47,102,144,0.6)"}
            onBlur={(e) => e.target.style.borderColor = "#E2E8F0"}
          />
        </div>

        {showIp && (
          <>
            <div>
              <label className="block text-[10px] font-bold mb-1" style={{ color: "#2F6690" }}>
                {t("simIpAddr")}
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
              <label className="block text-[10px] font-bold mb-1" style={{ color: "#2F6690" }}>
                {t("simSubnetMask")}
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
                <label className="block text-[10px] font-bold mb-1" style={{ color: "#2F6690" }}>
                  {t("simDefaultGateway")}
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
            background: "#173F5F",
            border: "1px solid #173F5F",
            color: "white",
          }}
        >
          <Save size={13} />
          {t("simSaveConfig")}
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