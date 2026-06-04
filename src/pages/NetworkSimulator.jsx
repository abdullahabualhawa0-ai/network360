import { useState, useCallback, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import NetworkCanvas from "../components/network-sim/NetworkCanvas";
import SimSidebar from "../components/network-sim/SimSidebar";
import NodeConfigPanel from "../components/network-sim/NodeConfigPanel";
import PacketSniffer from "../components/network-sim/PacketSniffer";
import AIAssistant from "../components/network-sim/AIAssistant";
import GamificationBar, { awardXP } from "../components/network-sim/GamificationBar";
import ScenarioPanel from "../components/network-sim/ScenarioPanel";
import { findPath } from "../lib/networkUtils";
import { useHistory } from "../lib/useHistory";
import { getScenarioById } from "../lib/scenarios";
import { Activity, ChevronLeft, AlertTriangle } from "lucide-react";
import { AnimatePresence as AP, motion } from "framer-motion";

const STORAGE_KEY = "network-simulator-state";

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : { nodes: [], connections: [], nextId: 1 };
  } catch {
    return { nodes: [], connections: [], nextId: 1 };
  }
}

function generatePacketSegments(path, connections, nodes, protocol) {
  // Generate one packet per segment (hop)
  const packets = [];
  for (let i = 0; i < path.nodePath.length - 1; i++) {
    const fromNode = nodes.find((n) => n.id === path.nodePath[i]);
    const toNode = nodes.find((n) => n.id === path.nodePath[i + 1]);
    const connId = path.connPath[i];
    if (!fromNode || !toNode) continue;
    packets.push({
      id: `pkt-${Date.now()}-${i}-${Math.random()}`,
      fromId: fromNode.id,
      toId: toNode.id,
      connId,
      srcIP: fromNode.ip || `192.168.1.${fromNode.id}`,
      dstIP: toNode.ip || `192.168.1.${toNode.id}`,
      protocol: protocol || "ICMP",
      ttl: 64,
      size: Math.floor(Math.random() * 1400) + 64,
      progress: 0,
      status: "transit",
      startedAt: Date.now(),
      hopIndex: i,
      totalHops: path.nodePath.length - 1,
    });
  }
  return packets;
}

export default function NetworkSimulator() {
  const [nodes, setNodes] = useState(() => loadState().nodes);
  const [connections, setConnections] = useState(() => loadState().connections);
  const [nextId, setNextId] = useState(() => loadState().nextId);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  // Tool modes — only one active at a time
  const [activeTool, setActiveTool] = useState(null); // null | "connect" | "packet" | "delete"
  const [connectFrom, setConnectFrom] = useState(null);
  const [packetFrom, setPacketFrom] = useState(null);
  const [selectedProtocol, setSelectedProtocol] = useState("ICMP");

  // Selected node (only shown when no tool active)
  const [selectedNode, setSelectedNode] = useState(null);

  // Packets + Sniffer
  const [activePackets, setActivePackets] = useState([]);
  const [snifferLog, setSnifferLog] = useState([]);
  const [showSniffer, setShowSniffer] = useState(false);
  const [showAI, setShowAI] = useState(false);

  // Error/toast
  const [errorMsg, setErrorMsg] = useState(null);

  // Scenario — load by ID from the module (never from JSON to preserve eval functions)
  // Also clean up any old "active-scenario" key left from previous version
  const [activeScenario, setActiveScenario] = useState(() => {
    try {
      localStorage.removeItem("active-scenario"); // clean legacy key
      const id = localStorage.getItem("active-scenario-id");
      return id ? getScenarioById(id) : null;
    } catch { return null; }
  });

  // History
  const { pushHistory, undo: undoHistory, redo: redoHistory, reset: resetHistory } = useHistory(setNodes, setConnections);

  // Auto-save
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ nodes, connections, nextId }));
  }, [nodes, connections, nextId]);

  // Packet animation loop — only for packets in transit
  useEffect(() => {
    if (activePackets.length === 0) return;
    const interval = setInterval(() => {
      setActivePackets((prev) => {
        const stillMoving = [];
        for (const p of prev) {
          const newProgress = p.progress + 0.025;
          if (newProgress >= 1) {
            const final = { ...p, progress: 1, status: "delivered" };
            setSnifferLog((log) => [...log.slice(-99), final]);
          } else {
            stillMoving.push({ ...p, progress: newProgress });
          }
        }
        return stillMoving;
      });
    }, 40);
    return () => clearInterval(interval);
  }, [activePackets.length]);

  const showError = (msg) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(null), 3000);
  };

  // Switch active tool (deactivates other tools)
  const setTool = useCallback((tool) => {
    setActiveTool((prev) => prev === tool ? null : tool);
    setConnectFrom(null);
    setPacketFrom(null);
    setSelectedNode(null);
  }, []);

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

  const moveNodeEnd = useCallback((id, x, y) => {
    setNodes((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, x, y } : n));
      pushHistory(updated, connections);
      return updated;
    });
  }, [connections, pushHistory]);

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
    setNodes((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, ...data } : n));
      pushHistory(updated, connections);
      return updated;
    });
  }, [connections, pushHistory]);

  const deleteConnection = useCallback((connId) => {
    setConnections((prev) => {
      const updated = prev.filter((c) => c.id !== connId);
      pushHistory(nodes, updated);
      return updated;
    });
  }, [nodes, pushHistory]);

  const handleNodeClick = useCallback((id) => {
    // Delete tool
    if (activeTool === "delete") {
      deleteNode(id);
      return;
    }

    // Packet mode
    if (activeTool === "packet") {
      if (!packetFrom) {
        setPacketFrom(id);
      } else if (packetFrom !== id) {
        const fromNode = nodes.find((n) => n.id === packetFrom);
        const toNode = nodes.find((n) => n.id === id);
        if (fromNode && toNode) {
          const path = findPath(packetFrom, id, connections);
          if (!path) {
            showError(`❌ لا يوجد مسار بين "${fromNode.label}" و"${toNode.label}" — تحقق من الاتصالات`);
          } else {
            const packets = generatePacketSegments(path, connections, nodes, selectedProtocol);
            setActivePackets((prev) => [...prev, ...packets]);
            setSnifferLog((log) => [...log.slice(-99), {
              id: `log-${Date.now()}`,
              fromId: packetFrom, toId: id,
              srcIP: fromNode.ip || `192.168.1.${fromNode.id}`,
              dstIP: toNode.ip || `192.168.1.${toNode.id}`,
              protocol: selectedProtocol,
              hops: path.nodePath.length - 1,
              status: "sending",
              startedAt: Date.now(),
            }]);
            awardXP(30, "first_ping");
          }
        }
        setPacketFrom(null);
        setActiveTool(null);
      }
      return;
    }

    // Connect mode
    if (activeTool === "connect") {
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
        setActiveTool(null);
      }
      return;
    }

    // No tool — select/deselect node to show info
    setSelectedNode((prev) => (prev === id ? null : id));
  }, [activeTool, packetFrom, connectFrom, connections, nodes, pushHistory, selectedProtocol, deleteNode]);

  const undo = useCallback(() => undoHistory(), [undoHistory]);
  const redo = useCallback(() => redoHistory(), [redoHistory]);

  const autoArrange = useCallback(() => {
    if (nodes.length < 2) return;
    const cx = 500, cy = 350;
    const r = Math.min(280, 70 * nodes.length);
    setNodes((prev) => {
      const updated = prev.map((n, i) => ({
        ...n,
        x: cx + r * Math.cos((2 * Math.PI * i) / prev.length),
        y: cy + r * Math.sin((2 * Math.PI * i) / prev.length),
      }));
      pushHistory(updated, connections);
      return updated;
    });
  }, [nodes.length, connections, pushHistory]);

  const reset = useCallback(() => {
    setNodes([]); setConnections([]); setNextId(1);
    setSelectedNode(null); setConnectFrom(null); setActiveTool(null);
    setPacketFrom(null);
    setZoom(1); setPan({ x: 0, y: 0 });
    setActivePackets([]); setSnifferLog([]);
    resetHistory();
  }, [resetHistory]);

  const zoomIn = () => setZoom((z) => Math.min(z + 0.15, 3));
  const zoomOut = () => setZoom((z) => Math.max(z - 0.15, 0.2));
  const resetView = () => { setZoom(1); setPan({ x: 0, y: 0 }); };

  // Derived mode flags for child components
  const connectMode = activeTool === "connect";
  const packetMode = activeTool === "packet";

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: "#020617", color: "#e2e8f0" }}>
      {/* Slim Top Bar */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-2"
        style={{ background: "rgba(2,6,23,0.98)", borderBottom: "1px solid rgba(6,182,212,0.15)", height: 48 }}>
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-1 text-xs transition-colors"
            style={{ color: "rgba(148,163,184,0.6)" }}
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
          {/* Active tool indicator */}
          {activeTool && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold animate-pulse"
              style={{
                background: connectMode ? "rgba(6,182,212,0.15)" : packetMode ? "rgba(167,139,250,0.15)" : "rgba(239,68,68,0.15)",
                border: `1px solid ${connectMode ? "rgba(6,182,212,0.4)" : packetMode ? "rgba(167,139,250,0.4)" : "rgba(239,68,68,0.4)"}`,
                color: connectMode ? "#06b6d4" : packetMode ? "#a78bfa" : "#f87171",
              }}>
              <div className="w-1.5 h-1.5 rounded-full bg-current" />
              {connectMode
                ? (connectFrom ? "انقر الجهاز الثاني" : "انقر الجهاز الأول")
                : packetMode
                  ? (packetFrom ? "انقر الوجهة" : "انقر المصدر")
                  : "وضع الحذف — انقر جهازاً"}
            </div>
          )}
        </div>
        <GamificationBar />
      </div>

      {/* Error Toast */}
      <AP>
        {errorMsg && (
          <motion.div
            key="err"
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="absolute top-14 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-bold shadow-2xl"
            style={{ background: "rgba(20,8,8,0.95)", border: "1px solid rgba(239,68,68,0.5)", color: "#fca5a5" }}
          >
            <AlertTriangle size={15} className="text-red-400" />
            {errorMsg}
          </motion.div>
        )}
      </AP>

      {/* Main: Sidebar + Canvas */}
      <div className="flex flex-1 overflow-hidden">
        <SimSidebar
          activeTool={activeTool}
          setTool={setTool}
          connectFrom={connectFrom}
          packetFrom={packetFrom}
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
          selectedProtocol={selectedProtocol}
          setSelectedProtocol={setSelectedProtocol}
          autoArrange={autoArrange}
          nodes={nodes}
          connections={connections}
          activeScenario={activeScenario}
          setActiveScenario={setActiveScenario}
        />

        {/* Canvas area */}
        <div className="flex-1 relative overflow-hidden">
          {/* Scenario Panel — overlaid on canvas */}
          <AnimatePresence>
            {activeScenario && (
              <ScenarioPanel
                scenario={activeScenario}
                nodes={nodes}
                connections={connections}
                onClose={() => {
                  setActiveScenario(null);
                  localStorage.removeItem("active-scenario-id");
                }}
              />
            )}
          </AnimatePresence>

          {/* Node config — only shown when no tool active */}
          <AnimatePresence>
            {selectedNode && !activeTool && (
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
            moveNodeEnd={moveNodeEnd}
            deleteNode={deleteNode}
            handleNodeClick={handleNodeClick}
            deleteConnection={deleteConnection}
            connectMode={connectMode}
            connectFrom={connectFrom}
            packetMode={packetMode}
            packetFrom={packetFrom}
            selectedNode={activeTool ? null : selectedNode}
            setSelectedNode={activeTool ? () => {} : setSelectedNode}
            activePackets={activePackets}
            highlightNodeId={packetMode ? packetFrom : connectMode ? connectFrom : null}
            activeTool={activeTool}
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