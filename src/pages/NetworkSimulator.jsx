import { useState, useRef, useEffect, useCallback } from "react";
import NetworkCanvas from "../components/network-sim/NetworkCanvas";
import NetworkToolbar from "../components/network-sim/NetworkToolbar";
import NetworkControls from "../components/network-sim/NetworkControls";
import { motion } from "framer-motion";
import { Network } from "lucide-react";

const STORAGE_KEY = "network-simulator-state";

const defaultState = { nodes: [], connections: [], nextId: 1 };

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : defaultState;
  } catch {
    return defaultState;
  }
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

  // Auto-save
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ nodes, connections, nextId }));
  }, [nodes, connections, nextId]);

  const addNode = useCallback((type, x, y) => {
    const newNode = { id: nextId, type, x, y, label: `${type} ${nextId}` };
    setNodes(prev => [...prev, newNode]);
    setNextId(prev => prev + 1);
  }, [nextId]);

  const moveNode = useCallback((id, x, y) => {
    setNodes(prev => prev.map(n => n.id === id ? { ...n, x, y } : n));
  }, []);

  const deleteNode = useCallback((id) => {
    setNodes(prev => prev.filter(n => n.id !== id));
    setConnections(prev => prev.filter(c => c.from !== id && c.to !== id));
    setSelectedNode(null);
  }, []);

  const handleNodeClick = useCallback((id) => {
    if (!connectMode) {
      setSelectedNode(prev => prev === id ? null : id);
      return;
    }
    if (!connectFrom) {
      setConnectFrom(id);
    } else if (connectFrom !== id) {
      const exists = connections.some(
        c => (c.from === connectFrom && c.to === id) || (c.from === id && c.to === connectFrom)
      );
      if (!exists) {
        setConnections(prev => [...prev, { id: `${connectFrom}-${id}`, from: connectFrom, to: id }]);
      }
      setConnectFrom(null);
      setConnectMode(false);
    }
  }, [connectMode, connectFrom, connections]);

  const deleteConnection = useCallback((connId) => {
    setConnections(prev => prev.filter(c => c.id !== connId));
  }, []);

  const reset = () => {
    setNodes([]);
    setConnections([]);
    setNextId(1);
    setSelectedNode(null);
    setConnectFrom(null);
    setConnectMode(false);
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-bl from-slate-700 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative max-w-7xl mx-auto px-6 py-8">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Network className="text-white" size={20} />
              </div>
              <span className="text-white/80 text-sm font-medium">أدوات تفاعلية</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">محاكاة بناء شبكة</h1>
            <p className="text-white/60 text-sm mt-1">اسحب الأجهزة وأفلتها في مساحة العمل وابنِ شبكتك</p>
          </motion.div>
        </div>
      </div>

      {/* Main area */}
      <div className="flex flex-1 overflow-hidden" style={{ height: "calc(100vh - 160px)" }}>
        {/* Toolbar */}
        <NetworkToolbar
          connectMode={connectMode}
          setConnectMode={setConnectMode}
          connectFrom={connectFrom}
          setConnectFrom={setConnectFrom}
        />

        {/* Canvas + Controls */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <NetworkControls
            zoom={zoom}
            setZoom={setZoom}
            setPan={setPan}
            reset={reset}
            connectMode={connectMode}
            setConnectMode={setConnectMode}
            connectFrom={connectFrom}
          />
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
          />
        </div>
      </div>
    </div>
  );
}