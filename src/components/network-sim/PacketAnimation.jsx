import { useEffect, useRef } from "react";

// Renders animated packets moving along connections
export default function PacketAnimation({ packets, nodes }) {
  const getNode = (id) => nodes.find((n) => n.id === id);

  return (
    <>
      {packets.map((packet) => {
        const from = getNode(packet.fromId);
        const to = getNode(packet.toId);
        if (!from || !to) return null;

        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const px = from.x + dx * packet.progress;
        const py = from.y + dy * packet.progress;

        const color =
          packet.status === "failed"
            ? "#EF4444"
            : packet.protocol === "ICMP"
            ? "#F59E0B"
            : packet.protocol === "TCP"
            ? "#06B6D4"
            : "#A78BFA";

        return (
          <g key={packet.id}>
            {/* Glow */}
            <circle cx={px} cy={py} r={10} fill={color} opacity={0.15} />
            {/* Packet dot */}
            <circle cx={px} cy={py} r={5} fill={color} opacity={0.95}>
              <animate attributeName="r" values="4;6;4" dur="0.6s" repeatCount="indefinite" />
            </circle>
            {/* Protocol label */}
            <text
              x={px}
              y={py - 10}
              textAnchor="middle"
              fill={color}
              fontSize="8"
              fontWeight="bold"
              fontFamily="monospace"
              opacity={0.9}
            >
              {packet.protocol}
            </text>
          </g>
        );
      })}
    </>
  );
}