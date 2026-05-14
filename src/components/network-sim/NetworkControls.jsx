import { ZoomIn, ZoomOut, RotateCcw, Link, X } from "lucide-react";

export default function NetworkControls({ zoom, setZoom, setPan, reset, connectMode, setConnectMode, connectFrom }) {
  const zoomIn = () => setZoom(z => Math.min(z + 0.1, 2.5));
  const zoomOut = () => setZoom(z => Math.max(z - 0.1, 0.3));
  const resetView = () => { setZoom(1); setPan({ x: 0, y: 0 }); };

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border-b border-border">
      <div className="flex items-center gap-2">
        {/* Zoom controls */}
        <div className="flex items-center gap-1 bg-white border border-border rounded-lg overflow-hidden shadow-sm">
          <button onClick={zoomOut} className="p-1.5 hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
            <ZoomOut size={15} />
          </button>
          <span className="text-xs font-mono px-2 text-foreground min-w-[3rem] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button onClick={zoomIn} className="p-1.5 hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
            <ZoomIn size={15} />
          </button>
        </div>
        <button
          onClick={resetView}
          className="text-xs px-3 py-1.5 bg-white border border-border rounded-lg hover:bg-muted transition-colors text-muted-foreground"
        >
          إعادة ضبط العرض
        </button>
      </div>

      <div className="flex items-center gap-2">
        {/* Connect mode */}
        <button
          onClick={() => { setConnectMode(!connectMode); }}
          className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all ${
            connectMode
              ? "bg-primary text-white border-primary shadow-md"
              : "bg-white border-border text-muted-foreground hover:bg-muted"
          }`}
        >
          <Link size={13} />
          <span>{connectMode ? (connectFrom ? "اختر الجهاز الثاني..." : "اختر الجهاز الأول...") : "ربط أجهزة"}</span>
          {connectMode && <X size={12} className="opacity-70" />}
        </button>

        {/* Reset */}
        <button
          onClick={reset}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
        >
          <RotateCcw size={13} />
          <span>مسح الكل</span>
        </button>
      </div>
    </div>
  );
}