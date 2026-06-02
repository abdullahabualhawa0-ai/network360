import { useRef, useState } from "react";
import NetworkNode from "./NetworkNode";
import ConnectionLines from "./ConnectionLines";
import PacketAnimation from "./PacketAnimation";

export default function NetworkCanvas({
  nodes, connections, zoom, pan, setPan,
  addNode, moveNode, moveNodeEnd, deleteNode, handleNodeClick, deleteConnection,
  connectMode, connectFrom, packetMode, packetFrom,
  selectedNode, setSelectedNode, activePackets = [],
  highlightNodeId, activeTool,
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

  const cursor = isPanning ? "grabbing"
    : (connectMode || packetMode) ? "crosshair"
    : activeTool === "delete" ? "not-allowed"
    : "default";

  return (
    <div
      ref={canvasRef}
      className="flex-1 w-full h-full relative overflow-hidden select-none"
      style={{
        cursor,
        background: dragOver ? "rgba(6,182,212,0.04)" : "#020617",
      }}
      onDrop={handleDrop}
      onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "copy"; setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Cyber grid */}
      <div className="canvas-bg absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(6,182,212,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(6,182,212,0.05) 1px, transparent 1px)
          `,
          backgroundSize: `${32 * zoom}px ${32 * zoom}px`,
          backgroundPosition: `${pan.x % (32 * zoom)}px ${pan.y % (32 * zoom)}px`,
        }}
      />
      {/* Dots at intersections */}
      <div className="canvas-bg absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(6,182,212,0.1) 1px, transparent 1px)`,
          backgroundSize: `${32 * zoom}px ${32 * zoom}px`,
          backgroundPosition: `${pan.x % (32 * zoom)}px ${pan.y % (32 * zoom)}px`,
        }}
      />

      {/* Empty state hint */}
      {nodes.length === 0 && !dragOver && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="text-center opacity-20">
            <div className="text-5xl mb-3">🖧</div>
            <p className="font-bold text-sm" style={{ color: "#06b6d4" }}>اسحب الأجهزة من الشريط الجانبي</p>
            <p className="text-xs mt-1" style={{ color: "rgba(6,182,212,0.6)" }}>وأفلتها هنا لبدء بناء شبكتك</p>
          </div>
        </div>
      )}

      {dragOver && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center"
          style={{ border: "2px dashed rgba(6,182,212,0.4)" }}>
          <div className="px-4 py-2 rounded-xl text-sm font-bold"
            style={{ background: "rgba(6,182,212,0.12)", border: "1px solid rgba(6,182,212,0.4)", color: "#06b6d4", backdropFilter: "blur(10px)" }}>
            أفلت الجهاز هنا
          </div>
        </div>
      )}

      {/* Transformed content */}
      <div style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: "0 0", position: "absolute", width: "100%", height: "100%" }}>
        <svg className="absolute inset-0" style={{ overflow: "visible", width: "100%", height: "100%", pointerEvents: "none" }}>
          <g style={{ pointerEvents: "all" }}>
            <ConnectionLines connections={connections} nodes={nodes} deleteConnection={deleteConnection} zoom={zoom} />
          </g>
          <PacketAnimation packets={activePackets} nodes={nodes} connections={connections} />
        </svg>

        {nodes.map((node) => (
          <NetworkNode
            key={node.id}
            node={node}
            selected={selectedNode === node.id}
            highlighted={highlightNodeId === node.id}
            connectMode={connectMode || packetMode}
            deleteMode={activeTool === "delete"}
            onClick={() => handleNodeClick(node.id)}
            onDelete={() => deleteNode(node.id)}
            onMove={moveNode}
            onMoveEnd={moveNodeEnd}
            zoom={zoom}
            hasActivePacket={activePackets.some((p) => p.fromId === node.id || p.toId === node.id)}
          />
        ))}
      </div>
    </div>
  );
}