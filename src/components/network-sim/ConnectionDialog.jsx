import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { X, AlertTriangle } from "lucide-react";
import {
  CABLE_TYPES, isCableCompatible, getPortsForDevice,
  getUsedPorts, getPortStatus, PORT_STATUS_LABELS,
} from "../../lib/ports";

function PortList({ node, connections, selected, onSelect }) {
  const ports = useMemo(() => (node ? getPortsForDevice(node.type) : []), [node]);
  const used = useMemo(() => (node ? getUsedPorts(connections, node.id) : new Set()), [connections, node]);

  return (
    <div className="rounded-xl p-3"
      style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold" style={{ color: "#e2e8f0" }}>
          {node?.label}
        </span>
        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded"
          style={{ background: "rgba(6,182,212,0.12)", color: "#06b6d4" }}>
          {node?.type}
        </span>
      </div>
      <div className="max-h-44 overflow-y-auto space-y-1" style={{ scrollbarWidth: "thin" }}>
        {ports.map((port) => {
          const status = getPortStatus(port, used);
          const st = PORT_STATUS_LABELS[status];
          const selectable = status === "available";
          const isSel = selected === port.name;
          return (
            <button
              key={port.name}
              disabled={!selectable}
              onClick={() => onSelect(port.name)}
              title={port.note || st.label}
              className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-[10px] font-mono transition-all disabled:cursor-not-allowed"
              style={{
                background: isSel ? "rgba(6,182,212,0.2)" : "rgba(255,255,255,0.03)",
                border: `1px solid ${isSel ? "#06b6d4" : "rgba(255,255,255,0.05)"}`,
                opacity: selectable ? 1 : 0.55,
              }}
            >
              <span style={{ color: isSel ? "#06b6d4" : "#cbd5e1" }}>{port.name}</span>
              <span className="flex items-center gap-1 font-sans">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: st.color }} />
                <span style={{ color: st.color }}>{st.label}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function ConnectionDialog({ fromNode, toNode, connections, onConfirm, onCancel }) {
  const [cableId, setCableId] = useState(null);
  const [fromPort, setFromPort] = useState(null);
  const [toPort, setToPort] = useState(null);

  const isWireless = cableId === "wifi";
  const incompatible = cableId && (!isCableCompatible(cableId, fromNode?.type, toNode?.type));
  const canConfirm = cableId && !incompatible && (isWireless || (fromPort && toPort));

  const selectedCable = CABLE_TYPES.find((c) => c.id === cableId);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="absolute inset-0 z-40 flex items-center justify-center p-4"
      style={{ background: "rgba(2,6,23,0.75)", backdropFilter: "blur(4px)" }}
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.92, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, opacity: 0 }}
        transition={{ type: "spring", duration: 0.3 }}
        className="w-full max-w-2xl rounded-2xl p-5 max-h-[90%] overflow-y-auto"
        style={{
          background: "rgba(6,12,30,0.98)",
          border: "1px solid rgba(6,182,212,0.25)",
          boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-black" style={{ color: "#06b6d4" }}>
              🔗 توصيل {fromNode?.label} → {toNode?.label}
            </h3>
            <p className="text-[10px] mt-0.5" style={{ color: "rgba(148,163,184,0.7)" }}>
              اختر نوع الكابل ثم المنفذ في كل جهاز
            </p>
          </div>
          <button onClick={onCancel}
            className="p-1.5 rounded-lg transition-colors text-slate-400 hover:text-white hover:bg-white/10">
            <X size={16} />
          </button>
        </div>

        {/* Cable types */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
          {CABLE_TYPES.map((cable) => {
            const ok = isCableCompatible(cable.id, fromNode?.type, toNode?.type);
            const active = cableId === cable.id;
            return (
              <button
                key={cable.id}
                onClick={() => { setCableId(cable.id); setFromPort(null); setToPort(null); }}
                disabled={!ok}
                className="flex flex-col items-center gap-1 p-2.5 rounded-xl transition-all disabled:opacity-25 disabled:cursor-not-allowed"
                style={{
                  background: active ? `linear-gradient(135deg, ${cable.color}22, ${cable.color}11)` : "rgba(255,255,255,0.03)",
                  border: `1px solid ${active ? cable.color : "rgba(255,255,255,0.06)"}`,
                  boxShadow: active ? `0 0 12px ${cable.color}33` : "none",
                }}
              >
                <span className="text-lg leading-none">{cable.icon}</span>
                <span className="text-[10px] font-bold" style={{ color: active ? cable.color : "#cbd5e1" }}>
                  {cable.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Incompatible warning */}
        {incompatible && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl mb-3 text-[11px] font-bold"
            style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.35)", color: "#fca5a5" }}>
            <AlertTriangle size={13} />
            نوع الكابل «{selectedCable?.label}» غير متوافق مع {fromNode?.type} و {toNode?.type}
          </div>
        )}

        {/* Cable description */}
        {cableId && !incompatible && (
          <p className="text-[10px] mb-3 px-1" style={{ color: `${selectedCable?.color}` }}>
            {selectedCable?.icon} {selectedCable?.desc}
          </p>
        )}

        {/* Ports */}
        {cableId && !incompatible && !isWireless && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
            <PortList title="من" node={fromNode} connections={connections}
              selected={fromPort} onSelect={setFromPort} />
            <PortList title="إلى" node={toNode} connections={connections}
              selected={toPort} onSelect={setToPort} />
          </div>
        )}

        {/* Wireless note */}
        {isWireless && (
          <div className="px-3 py-2.5 rounded-xl mb-4 text-[11px]"
            style={{ background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.3)", color: "#6ee7b7" }}>
            📶 اتصال لاسلكي — لا يحتاج اختيار منفذ فيزيائي
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <button onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all hover:bg-white/10"
            style={{ border: "1px solid rgba(255,255,255,0.1)", color: "#94a3b8" }}>
            إلغاء
          </button>
          <button
            disabled={!canConfirm}
            onClick={() => onConfirm({ cableType: cableId, fromPort: isWireless ? null : fromPort, toPort: isWireless ? null : toPort })}
            className="flex-1 py-2.5 rounded-xl text-xs font-black transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            style={{
              background: canConfirm ? "linear-gradient(90deg,#06b6d4,#7c3aed)" : "rgba(255,255,255,0.05)",
              border: "1px solid rgba(6,182,212,0.4)",
              color: "#fff",
            }}
          >
            {canConfirm ? "إنشاء الاتصال" : "اختر الكابل والمنافذ"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}