import { useState, useEffect } from "react";
import { X, Settings, Save } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const DEVICE_DEFAULTS = {
  Router: { ip: "192.168.1.1", subnet: "255.255.255.0", gateway: "" },
  Switch: { ip: "192.168.1.2", subnet: "255.255.255.0", gateway: "192.168.1.1" },
  PC: { ip: "192.168.1.10", subnet: "255.255.255.0", gateway: "192.168.1.1" },
  Server: { ip: "192.168.1.100", subnet: "255.255.255.0", gateway: "192.168.1.1" },
  Firewall: { ip: "10.0.0.1", subnet: "255.255.255.0", gateway: "" },
  AccessPoint: { ip: "192.168.1.5", subnet: "255.255.255.0", gateway: "192.168.1.1" },
  Cloud: { ip: "", subnet: "", gateway: "" },
  Laptop: { ip: "192.168.1.11", subnet: "255.255.255.0", gateway: "192.168.1.1" },
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

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="absolute top-4 right-4 z-50 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings size={15} className="text-slate-300" />
          <span className="text-white text-sm font-bold">إعدادات الجهاز</span>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      {/* Device type badge */}
      <div className="px-4 pt-3 pb-1">
        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
          {node.type}
        </span>
      </div>

      {/* Form */}
      <div className="px-4 py-3 space-y-3">
        {/* Label */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">اسم الجهاز</label>
          <input
            value={label}
            onChange={e => setLabel(e.target.value)}
            className="w-full text-sm px-3 py-1.5 rounded-lg border border-slate-200 focus:border-blue-400 focus:ring-1 focus:ring-blue-100 outline-none font-mono"
            placeholder="Router 1"
            dir="ltr"
          />
        </div>

        {showIp && (
          <>
            {/* IP */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                عنوان IP
              </label>
              <input
                value={ip}
                onChange={e => setIp(e.target.value)}
                className="w-full text-sm px-3 py-1.5 rounded-lg border border-slate-200 focus:border-blue-400 focus:ring-1 focus:ring-blue-100 outline-none font-mono"
                placeholder="192.168.1.1"
                dir="ltr"
              />
            </div>

            {/* Subnet */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                قناع الشبكة (Subnet Mask)
              </label>
              <input
                value={subnet}
                onChange={e => setSubnet(e.target.value)}
                className="w-full text-sm px-3 py-1.5 rounded-lg border border-slate-200 focus:border-blue-400 focus:ring-1 focus:ring-blue-100 outline-none font-mono"
                placeholder="255.255.255.0"
                dir="ltr"
              />
            </div>

            {/* Gateway — not for Router/Firewall */}
            {node.type !== "Router" && node.type !== "Firewall" && (
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  البوابة الافتراضية (Default Gateway)
                </label>
                <input
                  value={gateway}
                  onChange={e => setGateway(e.target.value)}
                  className="w-full text-sm px-3 py-1.5 rounded-lg border border-slate-200 focus:border-blue-400 focus:ring-1 focus:ring-blue-100 outline-none font-mono"
                  placeholder="192.168.1.1"
                  dir="ltr"
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Save button */}
      <div className="px-4 pb-4">
        <button
          onClick={handleSave}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2 rounded-xl transition-colors"
        >
          <Save size={14} />
          حفظ الإعدادات
        </button>
      </div>
    </motion.div>
  );
}