import { useState, useRef, useEffect, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import NetworkCanvas from "../components/network-sim/NetworkCanvas";
import SimSidebar from "../components/network-sim/SimSidebar";
import NodeConfigPanel from "../components/network-sim/NodeConfigPanel";
import PacketSniffer from "../components/network-sim/PacketSniffer";
import AIAssistant from "../components/network-sim/AIAssistant";
import GamificationBar, { awardXP } from "../components/network-sim/GamificationBar";
import { Activity, ChevronLeft } from "lucide-react";

const STORAGE_KEY = "network-simulator-state";
const defaultState = { nodes: [], connections: [], nextId: 1 };

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : defaultState;
  } catch { return defaultState; }
}

function generatePacket(fromNode, toNode, protocol) {
  return {
    id: `pkt-${Date.now()}-${Math.random()}`,
    fromId: fromNode.id,
    toId: toNode.id,
    srcIP: fromNode.ip || `192.168.1.${fromNode.id}`,
    dstIP: toNode.ip || `192.168.1.${toNode.id}`,
    protocol: protocol || "ICMP",
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

  // Modes
  const [connectMode, setConnectMode] = useState(false);
  const [connectFrom, setConnectFrom] = useState(null);
  const [packetMode, setPacketMode] = useState(false);
  const [packetFrom, setPacketFrom] = useState(null);
  const [selectedProtocol, setSelectedProtocol] = useState("ICMP");
  const [selectedNode, setSelectedNode] = useState(null);

  // Packets + UI
  const [activePackets, setActivePackets] = useState([]);
  const [snifferLog, setSnifferLog] = useState([]);
  const [showSniffer, setShowSniffer] = useState(false);
  const [showAI, setShowAI] = useState(false);

  // Undo/Redo
  const historyRef = useRef([]);
  const historyIdxRef = useRef(-1);

  // Auto-save
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ nodes, connections, nextId }));
  }, [nodes, connections, nextId]);

  // Packet animation loop - optimized with requestAnimationFrame pattern
  useEffect(() => {
    if (activePackets.length === 0) return;
    const interval = setInterval(() => {
      setActivePackets((prev) => {
        if (prev.length === 0) return prev;
        const updated = [];
        for (const p of prev) {
          const newProgress = p.progress + 0.022;
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
    setNodes(snap.nodes); setConnections(snap.connections);
  };
  const redo = () => {
    if (historyIdxRef.current >= historyRef.current.length - 1) return;
    historyIdxRef.current++;
    const snap = historyRef.current[historyIdxRef.current];
    setNodes(snap.nodes); setConnections(snap.connections);
  };

  const addNode = useCallback((type, x, y) => {
    const newNode = { id: nextId, type, x, y, label: `${type} ${nextId}` };
    setNodes((prev) => {
      const updated = [...prev, newNode];
      pushHistory(updated, connections);
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
    // Packet mode: pick source then dest
    if (packetMode) {
      if (!packetFrom) {
        setPacketFrom(id);
      } else if (packetFrom !== id) {
        const fromNode = nodes.find((n) => n.id === packetFrom);
        const toNode = nodes.find((n) => n.id === id);
        if (fromNode && toNode) {
          // Check if path exists (direct or indirect connection)
          const pkt = generatePacket(fromNode, toNode, selectedProtocol);
          setActivePackets((prev) => [...prev, pkt]);
          awardXP(30, "first_ping");
        }
        setPacketFrom(null);
        setPacketMode(false);
      }
      return;
    }

    // Connect mode
    if (connectMode) {
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
      return;
    }

    setSelectedNode((prev) => (prev === id ? null : id));
  }, [packetMode, packetFrom, connectMode, connectFrom, connections, nodes, pushHistory, selectedProtocol]);

  const deleteConnection = useCallback((connId) => {
    setConnections((prev) => {
      const updated = prev.filter((c) => c.id !== connId);
      pushHistory(nodes, updated);
      return updated;
    });
  }, [nodes, pushHistory]);

  // Auto arrange nodes in a circle
  const autoArrange = useCallback(() => {
    if (nodes.length < 2) return;
    const cx = 500, cy = 350;
    const r = Math.min(250, 60 * nodes.length);
    setNodes((prev) =>
      prev.map((n, i) => ({
        ...n,
        x: cx + r * Math.cos((2 * Math.PI * i) / prev.length),
        y: cy + r * Math.sin((2 * Math.PI * i) / prev.length),
      }))
    );
  }, [nodes.length]);

  const reset = () => {
    setNodes([]); setConnections([]); setNextId(1);
    setSelectedNode(null); setConnectFrom(null); setConnectMode(false);
    setPacketFrom(null); setPacketMode(false);
    setZoom(1); setPan({ x: 0, y: 0 });
    setActivePackets([]); setSnifferLog([]);
    historyRef.current = []; historyIdxRef.current = -1;
  };

  const zoomIn = () => setZoom((z) => Math.min(z + 0.15, 3));
  const zoomOut = () => setZoom((z) => Math.max(z - 0.15, 0.2));
  const resetView = () => { setZoom(1); setPan({ x: 0, y: 0 }); };

  // Active node for highlight during packet/connect mode
  const highlightNodeId = packetMode ? packetFrom : connectMode ? connectFrom : null;

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: "#020617", color: "#e2e8f0" }}>
      {/* ── Slim Top Bar ── */}
      <div
        className="flex-shrink-0 flex items-center justify-between px-4 py-2"
        style={{
          background: "rgba(2,6,23,0.98)",
          borderBottom: "1px solid rgba(6,182,212,0.15)",
          height: 48,
        }}
      >
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-1 text-xs transition-colors" style={{ color: "rgba(148,163,184,0.6)" }}
            onMouseEnter={(e) => e.currentTarget.style.color = "#94a3b8"}
            onMouseLeave={(e) => e.currentTarget.style.color = "rgba(148,163,184,0.6)"}>
            <ChevronLeft size={12} /> الرئيسية
          </Link>
          <div className="w-px h-4" style={{ background: "rgba(6,182,212,0.2)" }} />
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#0891b2,#7c3aed)" }}>
              <Activity size={12} className="text-white" />
            </div>
            <span className="font-black text-sm" style={{
              background: "linear-gradient(90deg,#06b6d4,#a78bfa)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
            }}>
              Network Simulator
            </span>
          </div>
          {/* Mode indicator */}
          {(connectMode || packetMode) && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold animate-pulse"
              style={{
                background: connectMode ? "rgba(6,182,212,0.15)" : "rgba(167,139,250,0.15)",
                border: `1px solid ${connectMode ? "rgba(6,182,212,0.4)" : "rgba(167,139,250,0.4)"}`,
                color: connectMode ? "#06b6d4" : "#a78bfa",
              }}>
              <div className="w-1.5 h-1.5 rounded-full bg-current" />
              {connectMode
                ? (connectFrom ? "انقر الجهاز الثاني" : "انقر الجهاز الأول")
                : (packetFrom ? "انقر الوجهة" : "انقر المصدر")}
            </div>
          )}
        </div>
        <GamificationBar />
      </div>

      {/* ── Main: Sidebar + Canvas ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <SimSidebar
          connectMode={connectMode}
          setConnectMode={(v) => { setConnectMode(v); if (!v) setConnectFrom(null); }}
          connectFrom={connectFrom}
          showSniffer={showSniffer}
          setShowSniffer={setShowSniffer}
          showAI={showAI}
          setShowAI={setShowAI}
          zoom={zoom}
          zoomIn={zoomIn}
          zoomOut={zoomOut}
          resetView={resetView}
          undo={undo}
          redo={redo}
          reset={reset}
          snifferCount={snifferLog.length}
          packetMode={packetMode}
          setPacketMode={(v) => { setPacketMode(v); if (!v) setPacketFrom(null); }}
          selectedProtocol={selectedProtocol}
          setSelectedProtocol={setSelectedProtocol}
          autoArrange={autoArrange}
          nodes={nodes}
          connections={connections}
        />

        {/* Canvas area */}
        <div className="flex-1 relative overflow-hidden">
          <AnimatePresence>
            {selectedNode && !connectMode && !packetMode && (
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
            packetMode={packetMode}
            packetFrom={packetFrom}
            selectedNode={selectedNode}
            setSelectedNode={setSelectedNode}
            activePackets={activePackets}
            highlightNodeId={highlightNodeId}
          />

          <AnimatePresence>
            {showSniffer && (
              <PacketSniffer packets={snifferLog} onClose={() => setShowSniffer(false)} />
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showAI && (
              <AIAssistant nodes={nodes} connections={connections} onClose={() => setShowAI(false)} />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}