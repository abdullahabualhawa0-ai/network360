import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import NetworkCanvas from "../components/network-sim/NetworkCanvas";
import NetworkToolbar from "../components/network-sim/NetworkToolbar";
import NodeConfigPanel from "../components/network-sim/NodeConfigPanel";
import PacketSniffer from "../components/network-sim/PacketSniffer";
import AIAssistant from "../components/network-sim/AIAssistant";
import GamificationBar, { awardXP } from "../components/network-sim/GamificationBar";
import {
  ZoomIn, ZoomOut, RotateCcw, Link as LinkIcon, X,
  Wifi, Bot, Activity, Undo2, Redo2, Search,
  Play, Zap, FlaskConical, ChevronLeft
} from "lucide-react";

const STORAGE_KEY = "network-simulator-state";
const defaultState = { nodes: [], connections: [], nextId: 1 };

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : defaultState;
  } catch { return defaultState; }
}

// Protocols for packet simulation
const PROTOCOLS = ["ICMP", "TCP", "UDP", "ARP", "DNS", "HTTP"];

function generatePacket(fromNode, toNode, protocol) {
  return {
    id: `pkt-${Date.now()}-${Math.random()}`,
    fromId: fromNode.id,
    toId: toNode.id,
    srcIP: fromNode.ip || `192.168.1.${fromNode.id}`,
    dstIP: toNode.ip || `192.168.1.${toNode.id}`,
    protocol: protocol || PROTOCOLS[Math.floor(Math.random() * PROTOCOLS.length)],
    ttl: 64,
    size: Math.floor(Math.random() * 1400) + 64,
    progress: 0,
    status: "transit",
    startedAt: Date.now(),
  };
}

export default function NetworkSimulator() {
  const [nodes, setNodes] = useState(() => loadState().nodes);
  const [connections, setConnections] = useState(() => loadState().connections);
  const [nextId, setNextId] = useState(() => loadState().nextId);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [connectMode, setConnectMode] = useState(false);
  const [connectFrom, setConnectFrom] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);

  // Packets
  const [activePackets, setActivePackets] = useState([]);
  const [snifferLog, setSnifferLog] = useState([]);
  const [showSniffer, setShowSniffer] = useState(false);
  const [showAI, setShowAI] = useState(false);

  // Undo/Redo
  const historyRef = useRef([]);
  const historyIdxRef = useRef(-1);

  // Auto-save + history
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ nodes, connections, nextId }));
  }, [nodes, connections, nextId]);

  // Packet animation loop
  useEffect(() => {
    if (activePackets.length === 0) return;
    const interval = setInterval(() => {
      setActivePackets((prev) => {
        const updated = [];
        for (const p of prev) {
          const speed = 0.025;
          const newProgress = p.progress + speed;
          if (newProgress >= 1) {
            const finalPkt = { ...p, progress: 1, status: "delivered" };
            setSnifferLog((log) => [...log.slice(-99), finalPkt]);
          } else {
            updated.push({ ...p, progress: newProgress });
          }
        }
        return updated;
      });
    }, 40);
    return () => clearInterval(interval);
  }, [activePackets.length]);

  const pushHistory = useCallback((ns, cs) => {
    const snapshot = { nodes: JSON.parse(JSON.stringify(ns)), connections: JSON.parse(JSON.stringify(cs)) };
    historyRef.current = historyRef.current.slice(0, historyIdxRef.current + 1);
    historyRef.current.push(snapshot);
    historyIdxRef.current = historyRef.current.length - 1;
  }, []);

  const undo = () => {
    if (historyIdxRef.current <= 0) return;
    historyIdxRef.current--;
    const snap = historyRef.current[historyIdxRef.current];
    setNodes(snap.nodes);
    setConnections(snap.connections);
  };
  const redo = () => {
    if (historyIdxRef.current >= historyRef.current.length - 1) return;
    historyIdxRef.current++;
    const snap = historyRef.current[historyIdxRef.current];
    setNodes(snap.nodes);
    setConnections(snap.connections);
  };

  const addNode = useCallback((type, x, y) => {
    const newNode = { id: nextId, type, x, y, label: `${type} ${nextId}` };
    setNodes((prev) => {
      const updated = [...prev, newNode];
      pushHistory(updated, connections);
      // Gamification
      if (updated.length === 1) awardXP(10, "first_node");
      if (updated.length === 5) awardXP(50, "five_nodes");
      return updated;
    });
    setNextId((prev) => prev + 1);
  }, [nextId, connections, pushHistory]);

  const moveNode = useCallback((id, x, y) => {
    setNodes((prev) => prev.map((n) => (n.id === id ? { ...n, x, y } : n)));
  }, []);

  const deleteNode = useCallback((id) => {
    setNodes((prev) => {
      const updated = prev.filter((n) => n.id !== id);
      setConnections((cs) => {
        const updatedCs = cs.filter((c) => c.from !== id && c.to !== id);
        pushHistory(updated, updatedCs);
        return updatedCs;
      });
      return updated;
    });
    setSelectedNode(null);
  }, [pushHistory]);

  const updateNode = useCallback((id, data) => {
    setNodes((prev) => prev.map((n) => (n.id === id ? { ...n, ...data } : n)));
  }, []);

  const handleNodeClick = useCallback((id) => {
    if (!connectMode) {
      setSelectedNode((prev) => (prev === id ? null : id));
      return;
    }
    if (!connectFrom) {
      setConnectFrom(id);
    } else if (connectFrom !== id) {
      const exists = connections.some(
        (c) => (c.from === connectFrom && c.to === id) || (c.from === id && c.to === connectFrom)
      );
      if (!exists) {
        setConnections((prev) => {
          const updated = [...prev, { id: `${connectFrom}-${id}`, from: connectFrom, to: id }];
          pushHistory(nodes, updated);
          awardXP(20, "first_connection");
          return updated;
        });
      }
      setConnectFrom(null);
      setConnectMode(false);
    }
  }, [connectMode, connectFrom, connections, nodes, pushHistory]);

  const deleteConnection = useCallback((connId) => {
    setConnections((prev) => {
      const updated = prev.filter((c) => c.id !== connId);
      pushHistory(nodes, updated);
      return updated;
    });
  }, [nodes, pushHistory]);

  // Send packet between two random connected nodes
  const sendRandomPacket = () => {
    if (connections.length === 0) return;
    const conn = connections[Math.floor(Math.random() * connections.length)];
    const fromNode = nodes.find((n) => n.id === conn.from);
    const toNode = nodes.find((n) => n.id === conn.to);
    if (!fromNode || !toNode) return;
    const pkt = generatePacket(fromNode, toNode);
    setActivePackets((prev) => [...prev, pkt]);
    awardXP(30, "first_ping");
  };

  const reset = () => {
    setNodes([]);
    setConnections([]);
    setNextId(1);
    setSelectedNode(null);
    setConnectFrom(null);
    setConnectMode(false);
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setActivePackets([]);
    setSnifferLog([]);
    historyRef.current = [];
    historyIdxRef.current = -1;
  };

  const zoomIn = () => setZoom((z) => Math.min(z + 0.15, 3));
  const zoomOut = () => setZoom((z) => Math.max(z - 0.15, 0.2));
  const resetView = () => { setZoom(1); setPan({ x: 0, y: 0 }); };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#020617", color: "#e2e8f0" }}
    >
      {/* ── Cyber Header ── */}
      <div
        className="relative overflow-hidden flex-shrink-0"
        style={{
          background: "linear-gradient(135deg, #0d1117 0%, #0a1628 50%, #0d1117 100%)",
          borderBottom: "1px solid rgba(6,182,212,0.2)",
        }}
      >
        {/* Animated grid lines */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(6,182,212,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(6,182,212,0.04) 1px,transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="relative px-4 py-3 flex items-center justify-between">
          {/* Left: breadcrumb + title */}
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="flex items-center gap-1 text-slate-500 hover:text-slate-300 transition-colors text-xs"
            >
              <ChevronLeft size={13} /> الرئيسية
            </Link>
            <div
              className="w-px h-4"
              style={{ background: "rgba(6,182,212,0.3)" }}
            />
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: "linear-gradient(135deg,#0891b2,#7c3aed)" }}
              >
                <Activity size={14} className="text-white" />
              </div>
              <div>
                <span
                  className="font-black text-sm"
                  style={{
                    background: "linear-gradient(90deg,#06b6d4,#a78bfa)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Network Simulator
                </span>
                <div className="flex items-center gap-2 text-[9px] font-mono">
                  <span style={{ color: "rgba(6,182,212,0.6)" }}>
                    {nodes.length} devices
                  </span>
                  <span style={{ color: "rgba(6,182,212,0.3)" }}>|</span>
                  <span style={{ color: "rgba(6,182,212,0.6)" }}>
                    {connections.length} links
                  </span>
                  <span style={{ color: "rgba(6,182,212,0.3)" }}>|</span>
                  <span style={{ color: "#22c55e" }}>● LIVE</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: tools */}
          <div className="flex items-center gap-2">
            <GamificationBar />

            {/* Zoom */}
            <div
              className="flex items-center rounded-lg overflow-hidden"
              style={{ background: "rgba(15,23,42,0.8)", border: "1px solid rgba(6,182,212,0.2)" }}
            >
              <button onClick={zoomOut} className="px-2 py-1.5 hover:bg-cyan-500/10 transition-colors text-slate-400 hover:text-cyan-400">
                <ZoomOut size={13} />
              </button>
              <span className="text-[10px] font-mono px-2 text-cyan-400 min-w-[3rem] text-center">
                {Math.round(zoom * 100)}%
              </span>
              <button onClick={zoomIn} className="px-2 py-1.5 hover:bg-cyan-500/10 transition-colors text-slate-400 hover:text-cyan-400">
                <ZoomIn size={13} />
              </button>
            </div>

            {/* Undo/Redo */}
            <button onClick={undo} title="Undo"
              className="p-1.5 rounded-lg text-slate-500 hover:text-white transition-colors hover:bg-white/5"
              style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
              <Undo2 size={13} />
            </button>
            <button onClick={redo} title="Redo"
              className="p-1.5 rounded-lg text-slate-500 hover:text-white transition-colors hover:bg-white/5"
              style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
              <Redo2 size={13} />
            </button>

            {/* Connect Mode */}
            <button
              onClick={() => setConnectMode(!connectMode)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
              style={{
                background: connectMode
                  ? "linear-gradient(135deg,#0891b2,#06b6d4)"
                  : "rgba(15,23,42,0.8)",
                border: connectMode
                  ? "1px solid rgba(6,182,212,0.6)"
                  : "1px solid rgba(6,182,212,0.2)",
                color: connectMode ? "white" : "rgba(6,182,212,0.7)",
                boxShadow: connectMode ? "0 0 15px rgba(6,182,212,0.3)" : "none",
              }}
            >
              <LinkIcon size={13} />
              {connectMode
                ? connectFrom
                  ? "اختر الجهاز الثاني..."
                  : "اختر الجهاز الأول..."
                : "ربط أجهزة"}
              {connectMode && <X size={11} className="opacity-70" />}
            </button>

            {/* Send Packet */}
            <button
              onClick={sendRandomPacket}
              disabled={connections.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-30"
              style={{
                background: "rgba(167,139,250,0.15)",
                border: "1px solid rgba(167,139,250,0.4)",
                color: "#a78bfa",
              }}
            >
              <Zap size={13} /> إرسال Packet
            </button>

            {/* Sniffer toggle */}
            <button
              onClick={() => setShowSniffer(!showSniffer)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
              style={{
                background: showSniffer ? "rgba(6,182,212,0.15)" : "rgba(15,23,42,0.8)",
                border: `1px solid ${showSniffer ? "rgba(6,182,212,0.5)" : "rgba(6,182,212,0.2)"}`,
                color: "#06b6d4",
              }}
            >
              <Wifi size={13} /> Sniffer
              {snifferLog.length > 0 && (
                <span
                  className="text-[9px] font-mono px-1.5 py-0.5 rounded-full"
                  style={{ background: "rgba(6,182,212,0.2)", color: "#06b6d4" }}
                >
                  {snifferLog.length}
                </span>
              )}
            </button>

            {/* AI */}
            <button
              onClick={() => setShowAI(!showAI)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
              style={{
                background: showAI
                  ? "linear-gradient(135deg,rgba(139,92,246,0.3),rgba(6,182,212,0.3))"
                  : "rgba(15,23,42,0.8)",
                border: `1px solid ${showAI ? "rgba(139,92,246,0.5)" : "rgba(139,92,246,0.2)"}`,
                color: "#a78bfa",
                boxShadow: showAI ? "0 0 15px rgba(139,92,246,0.2)" : "none",
              }}
            >
              <Bot size={13} /> AI
            </button>

            {/* Scenario Lab */}
            <Link
              to="/scenario-lab"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:scale-105"
              style={{
                background: "linear-gradient(135deg,rgba(124,58,237,0.3),rgba(6,182,212,0.3))",
                border: "1px solid rgba(139,92,246,0.4)",
                color: "#c4b5fd",
              }}
            >
              <FlaskConical size={13} /> Scenario Lab
            </Link>

            {/* Reset */}
            <button
              onClick={reset}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
              style={{
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.3)",
                color: "#f87171",
              }}
            >
              <RotateCcw size={13} /> مسح
            </button>

            <button
              onClick={resetView}
              className="text-[10px] px-2 py-1.5 rounded-lg transition-colors text-slate-500 hover:text-slate-300"
              style={{ border: "1px solid rgba(255,255,255,0.08)" }}
            >
              ضبط العرض
            </button>
          </div>
        </div>
      </div>

      {/* ── Main Area ── */}
      <div className="flex flex-1 overflow-hidden relative" style={{ height: "calc(100vh - 72px)" }}>
        {/* Toolbar */}
        <NetworkToolbar
          connectMode={connectMode}
          setConnectMode={setConnectMode}
          connectFrom={connectFrom}
          setConnectFrom={setConnectFrom}
        />

        {/* Canvas Area */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          <AnimatePresence>
            {selectedNode && !connectMode && (
              <NodeConfigPanel
                node={nodes.find((n) => n.id === selectedNode)}
                onUpdate={updateNode}
                onClose={() => setSelectedNode(null)}
              />
            )}
          </AnimatePresence>

          <NetworkCanvas
            nodes={nodes}
            connections={connections}
            zoom={zoom}
            pan={pan}
            setPan={setPan}
            addNode={addNode}
            moveNode={moveNode}
            deleteNode={deleteNode}
            handleNodeClick={handleNodeClick}
            deleteConnection={deleteConnection}
            connectMode={connectMode}
            connectFrom={connectFrom}
            selectedNode={selectedNode}
            setSelectedNode={setSelectedNode}
            activePackets={activePackets}
          />

          {/* Packet Sniffer */}
          <AnimatePresence>
            {showSniffer && (
              <PacketSniffer packets={snifferLog} onClose={() => setShowSniffer(false)} />
            )}
          </AnimatePresence>

          {/* AI Assistant */}
          <AnimatePresence>
            {showAI && (
              <AIAssistant
                nodes={nodes}
                connections={connections}
                onClose={() => setShowAI(false)}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}