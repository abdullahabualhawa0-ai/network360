import { useState } from "react";

export default function ConnectionLines({ connections, nodes, deleteConnection, zoom }) {
  const [hoveredConn, setHoveredConn] = useState(null);
  const getNode = (id) => nodes.find((n) => n.id === id);

  return (
    <>
      {connections.map((conn) => {
        const from = getNode(conn.from);
        const to = getNode(conn.to);
        if (!from || !to) return null;

        const isHovered = hoveredConn === conn.id;
        const mx = (from.x + to.x) / 2;
        const my = (from.y + to.y) / 2;

        // Compute line length for dash animation
        const len = Math.sqrt((to.x - from.x) ** 2 + (to.y - from.y) ** 2);

        return (
          <g key={conn.id}>
            {/* Glow layer */}
            <line
              x1={from.x} y1={from.y} x2={to.x} y2={to.y}
              stroke="rgba(6,182,212,0.15)"
              strokeWidth={isHovered ? 10 : 6}
              style={{ pointerEvents: "none", transition: "stroke-width 0.2s" }}
            />
            {/* Click area */}
            <line
              x1={from.x} y1={from.y} x2={to.x} y2={to.y}
              stroke="transparent"
              strokeWidth={14}
              style={{ cursor: "pointer", pointerEvents: "stroke" }}
              onMouseEnter={() => setHoveredConn(conn.id)}
              onMouseLeave={() => setHoveredConn(null)}
            />
            {/* Visible line */}
            <line
              x1={from.x} y1={from.y} x2={to.x} y2={to.y}
              stroke={isHovered ? "#EF4444" : "rgba(6,182,212,0.6)"}
              strokeWidth={isHovered ? 2 : 1.5}
              strokeDasharray={isHovered ? "8 4" : "none"}
              style={{ pointerEvents: "none", transition: "stroke 0.2s" }}
            />
            {/* Data flow animation dots (when not hovered) */}
            {!isHovered && (
              <circle r="3" fill="rgba(6,182,212,0.7)">
                <animateMotion
                  dur={`${1.5 + Math.random() * 2}s`}
                  repeatCount="indefinite"
                  path={`M${from.x},${from.y} L${to.x},${to.y}`}
                />
              </circle>
            )}

            {/* Delete button */}
            {isHovered && (
              <g
                transform={`translate(${mx}, ${my})`}
                style={{ cursor: "pointer", pointerEvents: "all" }}
                onMouseEnter={() => setHoveredConn(conn.id)}
                onMouseLeave={() => setHoveredConn(null)}
                onClick={() => deleteConnection(conn.id)}
              >
                <circle r="10" fill="rgba(239,68,68,0.9)" />
                <circle r="10" fill="none" stroke="rgba(239,68,68,0.5)" strokeWidth="2" />
                <text x="0" y="4.5" textAnchor="middle" fill="white" fontSize="13" fontWeight="bold">×</text>
              </g>
            )}
          </g>
        );
      })}
    </>
  );
}