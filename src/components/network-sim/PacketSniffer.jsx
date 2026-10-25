import { useState } from "react";
import { X, Wifi } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { t, useLang } from "@/lib/i18n";

const PROTOCOL_COLORS = {
  ICMP: "text-warning bg-warning/10",
  TCP: "text-secondary bg-secondary/10",
  UDP: "text-brand bg-accent",
  ARP: "text-success bg-success/10",
  DNS: "text-muted-foreground bg-muted",
  HTTP: "text-primary bg-primary/10",
};

export default function PacketSniffer({ packets, onClose }) {
  useLang();
  const [filter, setFilter] = useState("ALL");

  const protocols = ["ALL", "ICMP", "TCP", "UDP", "ARP", "DNS", "HTTP"];
  const filtered =
    filter === "ALL" ? packets : packets.filter((p) => p.protocol === filter);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="absolute bottom-4 left-4 right-4 z-50 rounded-[16px] overflow-hidden bg-card text-card-foreground border border-border shadow-card"
      style={{ maxHeight: "260px" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-muted">
        <div className="flex items-center gap-2">
          <Wifi size={14} className="text-brand" />
          <span className="text-foreground font-mono text-xs font-bold">
            {t("simSnifferTitle")}
          </span>
          <span className="text-muted-foreground text-xs font-mono">
            [{filtered.length} {t("simSnifferPackets")}]
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {protocols.map((p) => (
              <button
                key={p}
                onClick={() => setFilter(p)}
                className={`text-[9px] font-mono px-2 py-0.5 rounded-[6px] transition-all ${
                  filter === p
                    ? "bg-primary text-primary-foreground font-bold"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-destructive transition-colors p-1"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Table header */}
      <div
        className="grid text-[9px] font-mono font-bold text-muted-foreground px-4 py-1.5 border-b border-border bg-card"
        style={{
          gridTemplateColumns: "60px 1fr 1fr 60px 50px 60px 80px",
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
            <div className="text-center py-6 text-muted-foreground font-mono text-xs">
              {t("simSnifferEmpty")}
            </div>
          ) : (
            [...filtered].reverse().map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="grid items-center px-4 py-1.5 hover:bg-muted/50 transition-colors border-b border-border text-foreground"
                style={{
                  gridTemplateColumns: "60px 1fr 1fr 60px 50px 60px 80px",
                }}
              >
                <span className="text-muted-foreground font-mono text-[9px]">
                  {String(filtered.length - i).padStart(4, "0")}
                </span>
                <span className="text-success font-mono text-[9px]">
                  {p.srcIP}
                </span>
                <span className="text-brand font-mono text-[9px]">
                  {p.dstIP}
                </span>
                <span
                  className={`font-mono text-[9px] font-bold px-1 rounded ${
                    PROTOCOL_COLORS[p.protocol] || "text-muted-foreground"
                  }`}
                >
                  {p.protocol}
                </span>
                <span className="text-muted-foreground font-mono text-[9px]">
                  {p.ttl}
                </span>
                <span className="text-muted-foreground font-mono text-[9px]">
                  {p.size}B
                </span>
                <span
                  className={`font-mono text-[9px] font-bold ${
                    p.status === "delivered"
                      ? "text-success"
                      : p.status === "failed"
                      ? "text-destructive"
                      : "text-warning"
                  }`}
                >
                  {p.status === "delivered"
                    ? t("simSnifferDelivered")
                    : p.status === "failed"
                    ? t("simSnifferFailed")
                    : t("simSnifferTransit")}
                </span>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}