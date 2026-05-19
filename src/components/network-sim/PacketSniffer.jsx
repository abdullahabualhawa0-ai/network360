import { useState } from "react";
import { X, Wifi, Filter, Trash2, Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const PROTOCOL_COLORS = {
  ICMP: "text-amber-400 bg-amber-400/10",
  TCP: "text-cyan-400 bg-cyan-400/10",
  UDP: "text-purple-400 bg-purple-400/10",
  ARP: "text-green-400 bg-green-400/10",
  DNS: "text-pink-400 bg-pink-400/10",
  HTTP: "text-blue-400 bg-blue-400/10",
};

export default function PacketSniffer({ packets, onClose }) {
  const [filter, setFilter] = useState("ALL");

  const protocols = ["ALL", "ICMP", "TCP", "UDP", "ARP", "DNS", "HTTP"];
  const filtered =
    filter === "ALL" ? packets : packets.filter((p) => p.protocol === filter);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="absolute bottom-4 left-4 right-4 z-50 rounded-2xl overflow-hidden"
      style={{
        background: "rgba(2, 6, 23, 0.95)",
        border: "1px solid rgba(6, 182, 212, 0.3)",
        backdropFilter: "blur(20px)",
        boxShadow: "0 0 40px rgba(6,182,212,0.1)",
        maxHeight: "260px",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-2 border-b"
        style={{ borderColor: "rgba(6,182,212,0.2)" }}
      >
        <div className="flex items-center gap-2">
          <Wifi size={14} className="text-cyan-400" />
          <span className="text-cyan-400 font-mono text-xs font-bold">
            PACKET SNIFFER
          </span>
          <span className="text-slate-500 text-xs font-mono">
            [{filtered.length} packets]
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {protocols.map((p) => (
              <button
                key={p}
                onClick={() => setFilter(p)}
                className={`text-[9px] font-mono px-2 py-0.5 rounded transition-all ${
                  filter === p
                    ? "bg-cyan-400/20 text-cyan-400 border border-cyan-400/50"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-red-400 transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Table header */}
      <div
        className="grid text-[9px] font-mono font-bold text-slate-500 px-4 py-1 border-b"
        style={{
          gridTemplateColumns: "60px 1fr 1fr 60px 50px 60px 80px",
          borderColor: "rgba(6,182,212,0.1)",
        }}
      >
        <span>#</span>
        <span>SRC IP</span>
        <span>DST IP</span>
        <span>PROTO</span>
        <span>TTL</span>
        <span>SIZE</span>
        <span>STATUS</span>
      </div>

      {/* Rows */}
      <div className="overflow-y-auto" style={{ maxHeight: "160px" }}>
        <AnimatePresence>
          {filtered.length === 0 ? (
            <div className="text-center py-6 text-slate-600 font-mono text-xs">
              لا توجد packets بعد...
            </div>
          ) : (
            [...filtered].reverse().map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="grid items-center px-4 py-1 hover:bg-white/5 transition-colors"
                style={{
                  gridTemplateColumns: "60px 1fr 1fr 60px 50px 60px 80px",
                  borderBottom: "1px solid rgba(255,255,255,0.03)",
                }}
              >
                <span className="text-slate-600 font-mono text-[9px]">
                  {String(filtered.length - i).padStart(4, "0")}
                </span>
                <span className="text-green-400 font-mono text-[9px]">
                  {p.srcIP}
                </span>
                <span className="text-blue-400 font-mono text-[9px]">
                  {p.dstIP}
                </span>
                <span
                  className={`font-mono text-[9px] font-bold px-1 rounded ${
                    PROTOCOL_COLORS[p.protocol] || "text-slate-400"
                  }`}
                >
                  {p.protocol}
                </span>
                <span className="text-slate-400 font-mono text-[9px]">
                  {p.ttl}
                </span>
                <span className="text-slate-400 font-mono text-[9px]">
                  {p.size}B
                </span>
                <span
                  className={`font-mono text-[9px] font-bold ${
                    p.status === "delivered"
                      ? "text-green-400"
                      : p.status === "failed"
                      ? "text-red-400"
                      : "text-amber-400"
                  }`}
                >
                  {p.status === "delivered"
                    ? "✓ DELIVERED"
                    : p.status === "failed"
                    ? "✗ FAILED"
                    : "⏳ TRANSIT"}
                </span>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}