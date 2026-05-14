import { useState } from "react";

export default function ConnectionLines({ connections, nodes, deleteConnection, zoom }) {
  const [hoveredConn, setHoveredConn] = useState(null);

  const getNode = (id) => nodes.find(n => n.id === id);

  return (
    <>
      {connections.map(conn => {
        const from = getNode(conn.from);
        const to = getNode(conn.to);
        if (!from || !to) return null;

        const isHovered = hoveredConn === conn.id;
        const mx = (from.x + to.x) / 2;
        const my = (from.y + to.y) / 2;

        return (
          <g key={conn.id}>
            {/* Invisible wider click area */}
            <line
              x1={from.x} y1={from.y}
              x2={to.x} y2={to.y}
              stroke="transparent"
              strokeWidth={12}
              style={{ cursor: "pointer", pointerEvents: "stroke" }}
              onMouseEnter={() => setHoveredConn(conn.id)}
              onMouseLeave={() => setHoveredConn(null)}
            />
            {/* Visible line */}
            <line
              x1={from.x} y1={from.y}
              x2={to.x} y2={to.y}
              stroke={isHovered ? "#EF4444" : "#94A3B8"}
              strokeWidth={isHovered ? 2.5 : 1.5}
              strokeDasharray={isHovered ? "6 3" : "none"}
              style={{ pointerEvents: "none", transition: "stroke 0.2s" }}
            />
            {/* Delete button at midpoint */}
            {isHovered && (
              <g
                transform={`translate(${mx}, ${my})`}
                style={{ cursor: "pointer", pointerEvents: "all" }}
                onMouseEnter={() => setHoveredConn(conn.id)}
                onMouseLeave={() => setHoveredConn(null)}
                onClick={() => deleteConnection(conn.id)}
              >
                <circle r="9" fill="#EF4444" />
                <text x="0" y="4.5" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">×</text>
              </g>
            )}
          </g>
        );
      })}
    </>
  );
}