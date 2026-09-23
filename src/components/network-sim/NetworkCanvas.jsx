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
  selectedDeviceType, clearSelectedDevice,
}) {
  const canvasRef = useRef(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [dragOver, setDragOver] = useState(false);
  const touchMoved = useRef(false);

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

  // Tap-to-place — يضع الجهاز المحدد عند النقر على اللوحة (للموبايل)
  const handleCanvasClick = (e) => {
    if (!selectedDeviceType) return;
    if (e.target !== canvasRef.current && !e.target.classList.contains("canvas-bg")) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - pan.x) / zoom;
    const y = (e.clientY - rect.top - pan.y) / zoom;
    addNode(selectedDeviceType, x, y);
    clearSelectedDevice();
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

  // Touch handlers — للتحريك باللمس على الموبايل
  const handleTouchStart = (e) => {
    if (e.target === canvasRef.current || e.target.classList.contains("canvas-bg")) {
      touchMoved.current = false;
      setSelectedNode(null);
      setIsPanning(true);
      const touch = e.touches[0];
      setPanStart({ x: touch.clientX - pan.x, y: touch.clientY - pan.y });
    }
  };

  const handleTouchMove = (e) => {
    if (!isPanning) return;
    touchMoved.current = true;
    const touch = e.touches[0];
    setPan({ x: touch.clientX - panStart.x, y: touch.clientY - panStart.y });
  };

  const handleTouchEnd = (e) => {
    setIsPanning(false);
    // Tap-to-place عند اللمس بدون تحريك
    if (!touchMoved.current && selectedDeviceType && e.changedTouches.length > 0) {
      const touch = e.changedTouches[0];
      const rect = canvasRef.current.getBoundingClientRect();
      const x = (touch.clientX - rect.left - pan.x) / zoom;
      const y = (touch.clientY - rect.top - pan.y) / zoom;
      addNode(selectedDeviceType, x, y);
      clearSelectedDevice();
    }
  };

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
        background: dragOver ? "rgba(47,102,144,0.05)" : "#F7F9FC",
      }}
      onDrop={handleDrop}
      onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "copy"; setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onClick={handleCanvasClick}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Cyber grid */}
      <div className="canvas-bg absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(47,102,144,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(47,102,144,0.06) 1px, transparent 1px)
          `,
          backgroundSize: `${32 * zoom}px ${32 * zoom}px`,
          backgroundPosition: `${pan.x % (32 * zoom)}px ${pan.y % (32 * zoom)}px`,
        }}
      />
      {/* Dots at intersections */}
      <div className="canvas-bg absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(47,102,144,0.12) 1px, transparent 1px)`,
          backgroundSize: `${32 * zoom}px ${32 * zoom}px`,
          backgroundPosition: `${pan.x % (32 * zoom)}px ${pan.y % (32 * zoom)}px`,
        }}
      />

      {/* Empty state hint */}
      {nodes.length === 0 && !dragOver && !selectedDeviceType && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="text-center opacity-20">
            <div className="text-5xl mb-3">🖧</div>
            <p className="font-bold text-sm" style={{ color: "#2F6690" }}>اسحب الأجهزة من الشريط الجانبي</p>
            <p className="text-xs mt-1" style={{ color: "rgba(47,102,144,0.6)" }}>وأفلتها هنا لبدء بناء شبكتك</p>
          </div>
        </div>
      )}

      {/* Tap-to-place indicator — يظهر عند اختيار جهاز على الموبايل */}
      {selectedDeviceType && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center"
          style={{ border: "2px dashed rgba(47,102,144,0.5)", background: "rgba(47,102,144,0.03)" }}>
          <div className="px-4 py-2 rounded-xl text-sm font-bold animate-pulse"
            style={{ background: "#FFFFFF", border: "1px solid rgba(47,102,144,0.4)", color: "#2F6690" }}>
            👆 اضغط هنا لوضع الجهاز
          </div>
        </div>
      )}

      {dragOver && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center"
          style={{ border: "2px dashed rgba(47,102,144,0.5)" }}>
          <div className="px-4 py-2 rounded-xl text-sm font-bold"
            style={{ background: "#FFFFFF", border: "1px solid rgba(47,102,144,0.4)", color: "#2F6690" }}>
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