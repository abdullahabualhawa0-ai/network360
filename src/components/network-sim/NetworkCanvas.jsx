import { useRef, useState, useCallback } from "react";
import NetworkNode from "./NetworkNode";
import ConnectionLines from "./ConnectionLines";

export default function NetworkCanvas({
  nodes, connections, zoom, pan, setPan,
  addNode, moveNode, deleteNode, handleNodeClick, deleteConnection,
  connectMode, connectFrom, selectedNode, setSelectedNode
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

  const handleWheel = (e) => {
    e.preventDefault();
  };

  return (
    <div
      ref={canvasRef}
      className={`flex-1 relative overflow-hidden select-none ${
        dragOver ? "bg-primary/5" : "bg-white"
      } ${isPanning ? "cursor-grabbing" : connectMode ? "cursor-crosshair" : "cursor-default"}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={() => setDragOver(false)}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Grid */}
      <div
        className="canvas-bg absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(circle, #cbd5e1 1px, transparent 1px)
          `,
          backgroundSize: `${24 * zoom}px ${24 * zoom}px`,
          backgroundPosition: `${pan.x % (24 * zoom)}px ${pan.y % (24 * zoom)}px`,
        }}
      />

      {/* Drop hint */}
      {nodes.length === 0 && !dragOver && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="text-center opacity-30">
            <div className="text-5xl mb-3">🖧</div>
            <p className="text-slate-500 font-medium">اسحب الأجهزة من الشريط الجانبي</p>
            <p className="text-slate-400 text-sm mt-1">وأفلتها هنا لبدء بناء شبكتك</p>
          </div>
        </div>
      )}

      {dragOver && (
        <div className="absolute inset-0 border-2 border-dashed border-primary/40 rounded-none pointer-events-none flex items-center justify-center">
          <div className="bg-primary/10 px-4 py-2 rounded-xl">
            <p className="text-primary font-medium text-sm">أفلت الجهاز هنا</p>
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
        {/* SVG connections */}
        <svg className="absolute inset-0 pointer-events-none" style={{ overflow: "visible", width: "100%", height: "100%" }}>
          <ConnectionLines
            connections={connections}
            nodes={nodes}
            deleteConnection={deleteConnection}
            zoom={zoom}
          />
        </svg>

        {/* Nodes */}
        {nodes.map(node => (
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
          />
        ))}
      </div>

      {/* Connect mode indicator */}
      {connectMode && connectFrom && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs px-3 py-1.5 rounded-full shadow-lg pointer-events-none">
          ✓ تم اختيار الجهاز الأول — انقر على جهاز آخر للربط
        </div>
      )}
    </div>
  );
}