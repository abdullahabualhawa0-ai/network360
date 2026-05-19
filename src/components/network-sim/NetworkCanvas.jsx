import { useRef, useState } from "react";
import NetworkNode from "./NetworkNode";
import ConnectionLines from "./ConnectionLines";
import PacketAnimation from "./PacketAnimation";

export default function NetworkCanvas({
  nodes, connections, zoom, pan, setPan,
  addNode, moveNode, deleteNode, handleNodeClick, deleteConnection,
  connectMode, connectFrom, selectedNode, setSelectedNode,
  activePackets = [],
}) {
  const canvasRef = useRef(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const type = e.dataTransfer.getData("deviceType");
    if (!type) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - pan.x) / zoom;
    const y = (e.clientY - rect.top - pan.y) / zoom;
    addNode(type, x, y);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    setDragOver(true);
  };

  const handleMouseDown = (e) => {
    if (e.target === canvasRef.current || e.target.classList.contains("canvas-bg")) {
      setSelectedNode(null);
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e) => {
    if (!isPanning) return;
    setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
  };

  const handleMouseUp = () => setIsPanning(false);

  return (
    <div
      ref={canvasRef}
      className={`flex-1 relative overflow-hidden select-none ${
        isPanning ? "cursor-grabbing" : connectMode ? "cursor-crosshair" : "cursor-default"
      }`}
      style={{
        background: dragOver
          ? "rgba(6,182,212,0.05)"
          : "linear-gradient(135deg, #020617 0%, #0a0f1e 100%)",
      }}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={() => setDragOver(false)}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Cyber Grid */}
      <div
        className="canvas-bg absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(6,182,212,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(6,182,212,0.06) 1px, transparent 1px)
          `,
          backgroundSize: `${32 * zoom}px ${32 * zoom}px`,
          backgroundPosition: `${pan.x % (32 * zoom)}px ${pan.y % (32 * zoom)}px`,
        }}
      />
      {/* Secondary grid (dots at intersections) */}
      <div
        className="canvas-bg absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(6,182,212,0.12) 1px, transparent 1px)`,
          backgroundSize: `${32 * zoom}px ${32 * zoom}px`,
          backgroundPosition: `${pan.x % (32 * zoom)}px ${pan.y % (32 * zoom)}px`,
        }}
      />

      {/* Drop hint */}
      {nodes.length === 0 && !dragOver && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="text-center" style={{ opacity: 0.25 }}>
            <div className="text-6xl mb-4">🖧</div>
            <p
              className="font-bold text-base"
              style={{ color: "rgba(6,182,212,0.8)" }}
            >
              اسحب الأجهزة من الشريط الجانبي
            </p>
            <p className="text-sm mt-1" style={{ color: "rgba(6,182,212,0.5)" }}>
              وأفلتها هنا لبدء بناء شبكتك
            </p>
          </div>
        </div>
      )}

      {dragOver && (
        <div
          className="absolute inset-0 pointer-events-none flex items-center justify-center"
          style={{ border: "2px dashed rgba(6,182,212,0.5)" }}
        >
          <div
            className="px-5 py-2.5 rounded-xl font-bold text-sm"
            style={{
              background: "rgba(6,182,212,0.15)",
              border: "1px solid rgba(6,182,212,0.4)",
              color: "#06b6d4",
              backdropFilter: "blur(10px)",
            }}
          >
            أفلت الجهاز هنا
          </div>
        </div>
      )}

      {/* Content layer */}
      <div
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: "0 0",
          position: "absolute",
          width: "100%",
          height: "100%",
        }}
      >
        {/* SVG layer: connections + packets */}
        <svg
          className="absolute inset-0 pointer-events-none"
          style={{ overflow: "visible", width: "100%", height: "100%" }}
        >
          <ConnectionLines
            connections={connections}
            nodes={nodes}
            deleteConnection={deleteConnection}
            zoom={zoom}
          />
          <PacketAnimation packets={activePackets} nodes={nodes} />
        </svg>

        {/* Nodes */}
        {nodes.map((node) => (
          <NetworkNode
            key={node.id}
            node={node}
            selected={selectedNode === node.id}
            connectFrom={connectFrom}
            connectMode={connectMode}
            onMove={moveNode}
            onClick={() => handleNodeClick(node.id)}
            onDelete={() => deleteNode(node.id)}
            zoom={zoom}
            hasActivePacket={activePackets.some(
              (p) => p.fromId === node.id || p.toId === node.id
            )}
          />
        ))}
      </div>

      {/* Connect mode indicator */}
      {connectMode && connectFrom && (
        <div
          className="absolute top-4 left-1/2 -translate-x-1/2 font-bold text-xs px-4 py-2 rounded-full pointer-events-none"
          style={{
            background: "rgba(6,182,212,0.2)",
            border: "1px solid rgba(6,182,212,0.5)",
            color: "#06b6d4",
            backdropFilter: "blur(10px)",
            boxShadow: "0 0 20px rgba(6,182,212,0.3)",
          }}
        >
          ✓ تم اختيار الجهاز الأول — انقر على جهاز آخر للربط
        </div>
      )}
    </div>
  );
}