import { useState, useCallback, useEffect, useRef } from "react";
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
import { getConnectionType } from "../lib/connectionTypes";
import { CABLE_TYPES } from "../lib/ports";
import ConnectionDialog from "../components/network-sim/ConnectionDialog";
import { Activity, ChevronLeft, AlertTriangle, CheckCircle2 } from "lucide-react";
import { AnimatePresence as AP, motion } from "framer-motion";
import { t, useLang } from "@/lib/i18n";

const STORAGE_KEY = "network-simulator-state";

/**
 * جلسة محاكاة مستقلة لكل سيناريو (Simulation Session):
 * - سيناريو جديد → جلسة جديدة نظيفة (يُزال كل ما أضافه الطالب في سيناريو سابق)
 * - إعادة فتح نفس السيناريو → استكمال من الحالة المحفوظة
 * - Template السيناريو (الأجهزة المطلوبة أصلاً) يُحمّل عند أول فتح للجلسة
 */
function activeScenarioId() {
  try { return localStorage.getItem("active-scenario-id"); } catch { return null; }
}

function loadState() {
  const sid = activeScenarioId();
  const key = sid ? `network-simulator-state-s${sid}` : STORAGE_KEY;
  const empty = { nodes: [], connections: [], nextId: 1 };
  try {
    const saved = localStorage.getItem(key);
    if (saved) return { key, state: JSON.parse(saved) };
    // جلسة جديدة — حمّل قالب السيناريو إن وجد
    if (sid) {
      const sc = getScenarioById(sid);
      if (sc?.template?.nodes?.length) {
        return {
          key,
          state: {
            nodes: sc.template.nodes.map((n) => ({ ...n })),
            connections: (sc.template.connections || []).map((c) => ({ ...c })),
            nextId: sc.template.nodes.length + 1,
          },
        };
      }
    }
    return { key, state: empty };
  } catch {
    return { key, state: empty };
  }
}

function generatePacketSegments(path, connections, nodes, protocol) {
  const segments = [];
  for (let i = 0; i < path.nodePath.length - 1; i++) {
    const fromNode = nodes.find((n) => n.id === path.nodePath[i]);
    const toNode = nodes.find((n) => n.id === path.nodePath[i + 1]);
    const connId = path.connPath[i];
    if (!fromNode || !toNode) continue;
    segments.push({
      fromId: fromNode.id,
      toId: toNode.id,
      connId,
      srcIP: fromNode.ip || `192.168.1.${fromNode.id}`,
      dstIP: toNode.ip || `192.168.1.${toNode.id}`,
      protocol: protocol || "ICMP",
      ttl: 64 - i,
      size: Math.floor(Math.random() * 1400) + 64,
      hopIndex: i,
      totalHops: path.nodePath.length - 1,
    });
  }
  return segments;
}

export default function NetworkSimulator() {
  useLang();
  const [session] = useState(loadState);
  const [nodes, setNodes] = useState(session.state.nodes);
  const [connections, setConnections] = useState(session.state.connections);
  const [nextId, setNextId] = useState(session.state.nextId || (session.state.nodes.length + 1));
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  // Tool modes — only one active at a time
  const [activeTool, setActiveTool] = useState(null); // null | "connect" | "packet" | "delete"
  const [connectFrom, setConnectFrom] = useState(null);
  const [packetFrom, setPacketFrom] = useState(null);
  const [selectedProtocol, setSelectedProtocol] = useState("ICMP");

  // Selected node (only shown when no tool active)
  const [selectedNode, setSelectedNode] = useState(null);

  // Tap-to-place — الجهاز المحدد للوضع باللمس (موبايل)
  const [selectedDeviceType, setSelectedDeviceType] = useState(null);

  // Packets + Sniffer
  const [activePackets, setActivePackets] = useState([]);
  const [snifferLog, setSnifferLog] = useState([]);
  const [showSniffer, setShowSniffer] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [packetSpeed, setPacketSpeed] = useState(1);
  const pendingChains = useRef([]);

  // Error/toast
  const [errorMsg, setErrorMsg] = useState(null);
  const [statusMsg, setStatusMsg] = useState(null);
  const [connInfo, setConnInfo] = useState(null);
  const [pendingConnection, setPendingConnection] = useState(null);

  // Scenario
  const [activeScenario, setActiveScenario] = useState(() => {
    try {
      localStorage.removeItem("active-scenario");
      const id = localStorage.getItem("active-scenario-id");
      return id ? getScenarioById(id) : null;
    } catch { return null; }
  });

  // History
  const { pushHistory, undo: undoHistory, redo: redoHistory, reset: resetHistory } = useHistory(setNodes, setConnections);

  // Auto-save
  useEffect(() => {
    localStorage.setItem(session.key, JSON.stringify({ nodes, connections, nextId }));
  }, [nodes, connections, nextId]);

  // Packet animation loop — hop-by-hop chaining
  useEffect(() => {
    const step = 0.022 * packetSpeed;
    const interval = setInterval(() => {
      setActivePackets((prev) => {
        if (prev.length === 0) return prev;
        const stillMoving = [];
        const completedPacketIds = [];

        for (const p of prev) {
          const newProgress = p.progress + step;
          if (newProgress >= 1) {
            completedPacketIds.push(p.id);
            const final = { ...p, progress: 1, status: "delivered" };
            setSnifferLog((log) => [...log.slice(-99), final]);
          } else {
            stillMoving.push({ ...p, progress: newProgress });
          }
        }

        if (completedPacketIds.length > 0) {
          const nextHops = [];
          for (const pid of completedPacketIds) {
            const chainIdx = pendingChains.current.findIndex((c) => c.currentPacketId === pid);
            if (chainIdx !== -1) {
              const chain = pendingChains.current[chainIdx];
              const nextHopIdx = chain.currentHop + 1;
              if (nextHopIdx < chain.segments.length) {
                const seg = chain.segments[nextHopIdx];
                const nextId = `pkt-${Date.now()}-${nextHopIdx}-${Math.random()}`;
                pendingChains.current[chainIdx] = { ...chain, currentHop: nextHopIdx, currentPacketId: nextId };
                nextHops.push({ id: nextId, ...seg, progress: 0, status: "transit", startedAt: Date.now() });
              } else {
                if (chain.segments.length > 0) {
                  const lastSeg = chain.segments[chain.segments.length - 1];
                  setStatusMsg({ text: `✅ ${t("simPacketReceived")} — ${lastSeg.protocol}`, type: "success" });
                  setTimeout(() => setStatusMsg(null), 2000);
                }
                pendingChains.current.splice(chainIdx, 1);
              }
            }
          }
          return [...stillMoving, ...nextHops];
        }

        return stillMoving;
      });
    }, 40);
    return () => clearInterval(interval);
  }, [packetSpeed]);

  const showError = (msg) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(null), 3000);
  };

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

  const confirmConnection = useCallback(({ cableType, fromPort, toPort }) => {
    const pc = pendingConnection;
    if (!pc) return;
    const fromNode = nodes.find((n) => n.id === pc.fromId);
    const toNode = nodes.find((n) => n.id === pc.toId);
    if (!fromNode || !toNode) { setPendingConnection(null); return; }
    const connType = getConnectionType(fromNode.type, toNode.type);
    setConnections((prev) => {
      const updated = [...prev, {
        id: `${pc.fromId}-${pc.toId}`, from: pc.fromId, to: pc.toId,
        connectionType: connType, cableType, fromPort, toPort,
      }];
      pushHistory(nodes, updated);
      return updated;
    });
    awardXP(20, "first_connection");
    const cable = CABLE_TYPES.find((c) => c.id === cableType);
    if (cable) {
      setConnInfo({ label: `🔗 ${cable.label}`, desc: cable.desc });
      setTimeout(() => setConnInfo(null), 3000);
    }
    setPendingConnection(null);
  }, [pendingConnection, nodes, pushHistory]);

  const deleteConnection = useCallback((connId) => {
    setConnections((prev) => {
      const updated = prev.filter((c) => c.id !== connId);
      pushHistory(nodes, updated);
      return updated;
    });
  }, [nodes, pushHistory]);

  const handleNodeClick = useCallback((id) => {
    if (activeTool === "delete") {
      deleteNode(id);
      return;
    }

    if (activeTool === "packet") {
      if (!packetFrom) {
        setPacketFrom(id);
      } else if (packetFrom !== id) {
        const fromNode = nodes.find((n) => n.id === packetFrom);
        const toNode = nodes.find((n) => n.id === id);
        if (fromNode && toNode) {
          const path = findPath(packetFrom, id, connections);
          if (!path) {
            showError(`❌ ${t("simErrNoPath")} "${fromNode.label}" → "${toNode.label}"`);
          } else {
            const segments = generatePacketSegments(path, connections, nodes, selectedProtocol);
            if (segments.length === 0) { showError(t("simErrNoSegments")); return; }

            const lostIdx = Math.random() < 0.1 ? Math.floor(Math.random() * segments.length) : -1;
            if (lostIdx !== -1) {
              showError(`⚠️ ${t("simErrPacketLost")} ${lostIdx + 1}! ${t("simErrRetransmit")}`);
              segments.splice(lostIdx);
              if (segments.length === 0) return;
            }

            const firstSeg = segments[0];
            const firstId = `pkt-${Date.now()}-0-${Math.random()}`;
            pendingChains.current.push({ segments, currentHop: 0, currentPacketId: firstId });
            setActivePackets((prev) => [...prev, { id: firstId, ...firstSeg, progress: 0, status: "transit", startedAt: Date.now() }]);

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

    if (activeTool === "connect") {
      if (!connectFrom) {
        setConnectFrom(id);
      } else if (connectFrom !== id) {
        const exists = connections.some(
          (c) => (c.from === connectFrom && c.to === id) || (c.from === id && c.to === connectFrom)
        );
        if (!exists) {
          setPendingConnection({ fromId: connectFrom, toId: id });
        } else {
          showError(t("simErrConnExists"));
        }
        setConnectFrom(null);
        setActiveTool(null);
      }
      return;
    }

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
    pendingChains.current = [];
    setPendingConnection(null);
    resetHistory();
  }, [resetHistory]);

  const zoomIn = () => setZoom((z) => Math.min(z + 0.15, 3));
  const zoomOut = () => setZoom((z) => Math.max(z - 0.15, 0.2));
  const resetView = () => { setZoom(1); setPan({ x: 0, y: 0 }); };

  const connectMode = activeTool === "connect";
  const packetMode = activeTool === "packet";

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background text-foreground font-main">
      {/* Slim Top Bar */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-2 bg-card border-b border-border h-12">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors font-bold">
            <ChevronLeft size={14} /> {t("simBackHome")}
          </Link>
          <div className="w-px h-4 bg-border" />
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-[6px] flex items-center justify-center bg-primary text-primary-foreground">
              <Activity size={14} />
            </div>
            <span className="font-black text-sm text-foreground">
               {t("simTitle")}
             </span>
          </div>
          {/* Active tool indicator */}
          {activeTool && (
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold animate-pulse border ${
              connectMode
                ? "bg-accent border-primary text-brand"
                : packetMode
                ? "bg-secondary/10 border-secondary text-secondary dark:text-primary"
                : "bg-destructive/10 border-destructive text-destructive"
            }`}>
              <div className="w-1.5 h-1.5 rounded-full bg-current" />
              {connectMode
                 ? (connectFrom ? t("simClickSecond") : t("simClickFirst"))
                 : packetMode
                   ? (packetFrom ? t("simClickDest") : t("simClickSource"))
                   : t("simDeleteMode")}
            </div>
          )}
        </div>
        <GamificationBar />
      </div>

      {/* Toast messages */}
      <AP>
        {errorMsg && (
          <motion.div key="err" initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
            className="absolute top-14 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-[12px] text-xs font-bold bg-card border border-destructive/50 text-destructive shadow-card">
            <AlertTriangle size={15} />
            {errorMsg}
          </motion.div>
        )}
        {statusMsg && (
          <motion.div key="status" initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
            className="absolute top-14 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-[12px] text-xs font-bold bg-card border border-success/50 text-success shadow-card">
            <CheckCircle2 size={15} />
            {statusMsg.text}
          </motion.div>
        )}
        {connInfo && (
          <motion.div key="conn" initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
            className="absolute top-14 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-[12px] bg-card border border-border text-foreground shadow-card">
            <span className="font-black text-xs text-brand">🔗 {connInfo.label}</span>
            <span className="text-[11px] text-muted-foreground">{connInfo.desc}</span>
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
          packetSpeed={packetSpeed}
          setPacketSpeed={setPacketSpeed}
          autoArrange={autoArrange}
          nodes={nodes}
          connections={connections}
          activeScenario={activeScenario}
          setActiveScenario={setActiveScenario}
          selectedDeviceType={selectedDeviceType}
          onSelectDevice={(type) => setSelectedDeviceType(prev => prev === type ? null : type)}
          onCancelPlacement={() => setSelectedDeviceType(null)}
        />

        {/* Canvas area */}
        <div className="flex-1 relative overflow-hidden">
          {/* Scenario Panel */}
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

          {/* Connection dialog */}
          <AnimatePresence>
            {pendingConnection && (
              <ConnectionDialog
                fromNode={nodes.find((n) => n.id === pendingConnection.fromId)}
                toNode={nodes.find((n) => n.id === pendingConnection.toId)}
                connections={connections}
                onConfirm={confirmConnection}
                onCancel={() => setPendingConnection(null)}
              />
            )}
          </AnimatePresence>

          {/* Node config */}
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
            selectedDeviceType={selectedDeviceType}
            clearSelectedDevice={() => setSelectedDeviceType(null)}
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