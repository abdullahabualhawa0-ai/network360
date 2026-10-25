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

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="absolute top-4 right-4 z-50 w-64 overflow-hidden rounded-[16px] bg-card text-card-foreground border border-border shadow-card"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full animate-pulse bg-primary" />
          <span className="text-xs font-bold text-foreground">{t("simNodeConfig")}</span>
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-[6px] bg-accent border border-border text-brand">
            {node.type}
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground transition-colors p-1"
        >
          <X size={14} />
        </button>
      </div>

      {/* Form */}
      <div className="px-4 py-3 space-y-3">
        <div>
          <label className="block text-[10px] font-bold mb-1 text-muted-foreground">
            {t("simNodeName")}
          </label>
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="w-full bg-background border border-input rounded-[8px] px-3 py-1.5 text-xs text-foreground font-mono outline-none focus:ring-1 focus:ring-primary"
            placeholder="Router 1"
            dir="ltr"
          />
        </div>

        {showIp && (
          <>
            <div>
              <label className="block text-[10px] font-bold mb-1 text-muted-foreground">
                {t("simIpAddr")}
              </label>
              <input
                value={ip}
                onChange={(e) => setIp(e.target.value)}
                className="w-full bg-background border border-input rounded-[8px] px-3 py-1.5 text-xs text-foreground font-mono outline-none focus:ring-1 focus:ring-primary"
                placeholder="192.168.1.1"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold mb-1 text-muted-foreground">
                {t("simSubnetMask")}
              </label>
              <input
                value={subnet}
                onChange={(e) => setSubnet(e.target.value)}
                className="w-full bg-background border border-input rounded-[8px] px-3 py-1.5 text-xs text-foreground font-mono outline-none focus:ring-1 focus:ring-primary"
                placeholder="255.255.255.0"
                dir="ltr"
              />
            </div>
            {node.type !== "Router" && node.type !== "Firewall" && (
              <div>
                <label className="block text-[10px] font-bold mb-1 text-muted-foreground">
                  {t("simDefaultGateway")}
                </label>
                <input
                  value={gateway}
                  onChange={(e) => setGateway(e.target.value)}
                  className="w-full bg-background border border-input rounded-[8px] px-3 py-1.5 text-xs text-foreground font-mono outline-none focus:ring-1 focus:ring-primary"
                  placeholder="192.168.1.1"
                  dir="ltr"
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
          className="w-full flex items-center justify-center gap-2 text-xs font-bold py-2 rounded-[10px] transition-all bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Save size={13} />
          {t("simSaveConfig")}
        </button>
      </div>
    </motion.div>
  );
}