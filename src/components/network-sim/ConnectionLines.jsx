import { useState } from "react";
import { getConnectionType, CONNECTION_STYLES } from "../../lib/connectionTypes";

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

        // Auto-detect connection type
        const connTypeKey = conn.connectionType || getConnectionType(from.type, to.type);
        const connStyle = CONNECTION_STYLES[connTypeKey] || CONNECTION_STYLES.ethernet;
        const lineColor = isHovered ? "#EF4444" : connStyle.color;
        const dashArray = isHovered ? "8 4" : (connStyle.dash === "none" ? undefined : connStyle.dash);

        return (
          <g key={conn.id}>
            {/* Outer glow */}
            <line
              x1={from.x} y1={from.y} x2={to.x} y2={to.y}
              stroke={`${connStyle.color}30`}
              strokeWidth={isHovered ? 12 : 8}
              style={{ pointerEvents: "none", transition: "stroke-width 0.2s" }}
            />
            {/* Click area */}
            <line
              x1={from.x} y1={from.y} x2={to.x} y2={to.y}
              stroke="transparent"
              strokeWidth={16}
              style={{ cursor: "pointer", pointerEvents: "stroke" }}
              onMouseEnter={() => setHoveredConn(conn.id)}
              onMouseLeave={() => setHoveredConn(null)}
            />
            {/* Visible line */}
            <line
              x1={from.x} y1={from.y} x2={to.x} y2={to.y}
              stroke={lineColor}
              strokeWidth={isHovered ? 2.5 : 2}
              strokeDasharray={dashArray}
              style={{ pointerEvents: "none", transition: "stroke 0.2s" }}
            />

            {/* Animated flow dot when not hovered */}
            {!isHovered && (
              <circle r="3" fill={connStyle.color} opacity="0.75">
                <animateMotion
                  dur={`${2 + (conn.id.length % 3)}s`}
                  repeatCount="indefinite"
                  path={`M${from.x},${from.y} L${to.x},${to.y}`}
                />
              </circle>
            )}

            {/* Connection type label (shows on hover) */}
            {isHovered && !deleteConnection && (
              <text
                x={mx} y={my - 14}
                textAnchor="middle"
                fill={connStyle.color}
                fontSize="9"
                fontFamily="monospace"
                fontWeight="bold"
                style={{ pointerEvents: "none" }}
              >
                {connStyle.label}
              </text>
            )}

            {/* Always-visible tiny label */}
            {!isHovered && (
              <text
                x={mx} y={my - 10}
                textAnchor="middle"
                fill={connStyle.color}
                fontSize="8"
                fontFamily="monospace"
                opacity="0.65"
                style={{ pointerEvents: "none" }}
              >
                {connStyle.label}
              </text>
            )}

            {/* Delete button on hover */}
            {isHovered && (
              <g
                transform={`translate(${mx}, ${my})`}
                style={{ cursor: "pointer", pointerEvents: "all" }}
                onMouseEnter={() => setHoveredConn(conn.id)}
                onMouseLeave={() => setHoveredConn(null)}
                onClick={() => deleteConnection(conn.id)}
              >
                <circle r="11" fill="rgba(239,68,68,0.95)" />
                <circle r="11" fill="none" stroke="rgba(239,68,68,0.5)" strokeWidth="2" />
                <text x="0" y="4.5" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">×</text>
              </g>
            )}
          </g>
        );
      })}
    </>
  );
}