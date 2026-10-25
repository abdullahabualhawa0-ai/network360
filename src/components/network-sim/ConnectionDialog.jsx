import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { X, AlertTriangle } from "lucide-react";
import {
  CABLE_TYPES, isCableCompatible, getPortsForDevice,
  getUsedPorts, getPortStatus, PORT_STATUS_LABELS,
} from "../../lib/ports";
import { t, useLang } from "@/lib/i18n";

function PortList({ node, connections, selected, onSelect }) {
  useLang();
  const ports = useMemo(() => (node ? getPortsForDevice(node.type) : []), [node]);
  const used = useMemo(() => (node ? getUsedPorts(connections, node.id) : new Set()), [connections, node]);

  return (
    <div className="rounded-[12px] p-3 bg-muted border border-border">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-foreground">
          {node?.label}
        </span>
        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-accent border border-border text-brand font-bold">
          {node?.type}
        </span>
      </div>
      <div className="max-h-44 overflow-y-auto space-y-1" style={{ scrollbarWidth: "thin" }}>
        {ports.map((port) => {
          const status = getPortStatus(port, used);
          const st = PORT_STATUS_LABELS[status];
          const stLabel = t(st.labelKey);
          const noteText = port.noteKey ? t(port.noteKey) : (port.note || "");
          const selectable = status === "available";
          const isSel = selected === port.name;
          return (
            <button
              key={port.name}
              disabled={!selectable}
              onClick={() => onSelect(port.name)}
              title={noteText || stLabel}
              className={`w-full flex items-center justify-between px-2 py-1.5 rounded-[8px] text-[10px] font-mono transition-all border disabled:cursor-not-allowed ${
                isSel
                  ? "bg-primary text-primary-foreground font-bold border-primary"
                  : selectable
                  ? "bg-card border-border text-foreground hover:bg-accent"
                  : "bg-muted/40 border-border/50 text-muted-foreground opacity-50"
              }`}
            >
              <span>{port.name}</span>
              <span className="flex items-center gap-1 font-sans">
                <span className={`w-1.5 h-1.5 rounded-full ${selectable ? "bg-success" : "bg-destructive"}`} />
                <span className={selectable ? "text-success font-bold" : "text-muted-foreground"}>{stLabel}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function ConnectionDialog({ fromNode, toNode, connections, onConfirm, onCancel }) {
  useLang();
  const [cableId, setCableId] = useState(null);
  const [fromPort, setFromPort] = useState(null);
  const [toPort, setToPort] = useState(null);

  const isWireless = cableId === "wifi";
  const incompatible = cableId && (!isCableCompatible(cableId, fromNode?.type, toNode?.type));
  const canConfirm = cableId && !incompatible && (isWireless || (fromPort && toPort));

  const selectedCable = CABLE_TYPES.find((c) => c.id === cableId);
  const cableLabel = selectedCable ? t(selectedCable.labelKey) : "";
  const cableDesc = selectedCable ? t(selectedCable.descKey) : "";

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-terminal/70 backdrop-blur-none"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-2xl rounded-[16px] p-5 max-h-[90%] overflow-y-auto bg-card text-card-foreground border border-border shadow-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-black text-foreground">
              🔗 {t("simConnDialogTitle")} {fromNode?.label} → {toNode?.label}
            </h3>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {t("simConnDialogDesc")}
            </p>
          </div>
          <button onClick={onCancel}
            className="p-1.5 rounded-[8px] transition-colors text-muted-foreground hover:text-foreground hover:bg-muted">
            <X size={16} />
          </button>
        </div>

        {/* Cable types */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
          {CABLE_TYPES.map((cable) => {
            const ok = isCableCompatible(cable.id, fromNode?.type, toNode?.type);
            const active = cableId === cable.id;
            const label = t(cable.labelKey);
            return (
              <button
                key={cable.id}
                onClick={() => { setCableId(cable.id); setFromPort(null); setToPort(null); }}
                disabled={!ok}
                className={`flex flex-col items-center gap-1 p-2.5 rounded-[10px] transition-all border disabled:opacity-30 disabled:cursor-not-allowed ${
                  active
                    ? "bg-accent border-primary text-brand font-bold"
                    : "bg-muted border-border text-foreground hover:bg-accent/70"
                }`}
              >
                <span className="text-lg leading-none">{cable.icon}</span>
                <span className="text-[10px] font-bold">
                  {label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Incompatible warning */}
        {incompatible && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-[10px] mb-3 text-[11px] font-bold bg-destructive/10 border border-destructive/30 text-destructive">
            <AlertTriangle size={13} />
            {t("simConnIncompatible")} {fromNode?.type} {t("simConnAnd")} {toNode?.type}
          </div>
        )}

        {/* Cable description */}
        {cableId && !incompatible && (
          <p className="text-[10px] mb-3 px-1 text-brand font-bold">
            {selectedCable?.icon} {cableDesc}
          </p>
        )}

        {/* Ports */}
        {cableId && !incompatible && !isWireless && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
            <PortList node={fromNode} connections={connections}
              selected={fromPort} onSelect={setFromPort} />
            <PortList node={toNode} connections={connections}
              selected={toPort} onSelect={setToPort} />
          </div>
        )}

        {/* Wireless note */}
        {isWireless && (
          <div className="px-3 py-2.5 rounded-[10px] mb-4 text-[11px] font-bold bg-success/10 border border-success/30 text-success">
            {t("simConnWirelessNote")}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <button onClick={onCancel}
            className="flex-1 py-2.5 rounded-[10px] text-xs font-bold transition-all border border-border text-muted-foreground hover:text-foreground hover:bg-muted">
            {t("simConnCancel")}
          </button>
          <button
            disabled={!canConfirm}
            onClick={() => onConfirm({ cableType: cableId, fromPort: isWireless ? null : fromPort, toPort: isWireless ? null : toPort })}
            className="flex-1 py-2.5 rounded-[10px] text-xs font-black transition-all bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {canConfirm ? t("simConnConfirm") : t("simConnSelectPrompt")}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}