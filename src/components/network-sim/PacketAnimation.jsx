// Renders animated packets moving strictly along connection lines

const PROTOCOL_COLORS = {
  ICMP: "#F59E0B",
  TCP: "#06B6D4",
  UDP: "#A78BFA",
  DNS: "#34D399",
  HTTP: "#F97316",
  ARP: "#EC4899",
  default: "#94A3B8",
};

export default function PacketAnimation({ packets, nodes, connections }) {
  const getNode = (id) => nodes.find((n) => n.id === id);

  return (
    <>
      {packets.map((packet) => {
        const from = getNode(packet.fromId);
        const to = getNode(packet.toId);
        if (!from || !to) return null;

        // Move strictly along the connection line between these two nodes
        const px = from.x + (to.x - from.x) * packet.progress;
        const py = from.y + (to.y - from.y) * packet.progress;

        const color = PROTOCOL_COLORS[packet.protocol] || PROTOCOL_COLORS.default;

        return (
          <g key={packet.id}>
            {/* Outer glow */}
            <circle cx={px} cy={py} r={14} fill={color} opacity={0.1} />
            {/* Mid glow */}
            <circle cx={px} cy={py} r={8} fill={color} opacity={0.2} />
            {/* Packet dot */}
            <circle cx={px} cy={py} r={5} fill={color} opacity={0.95}>
              <animate attributeName="r" values="4;6;4" dur="0.5s" repeatCount="indefinite" />
            </circle>
            {/* Hop label */}
            {packet.totalHops > 1 && (
              <text x={px} y={py - 12} textAnchor="middle"
                fill="rgba(148,163,184,0.6)" fontSize="7" fontFamily="monospace">
                hop {(packet.hopIndex || 0) + 1}/{packet.totalHops}
              </text>
            )}
            {/* Protocol label */}
            <text x={px} y={py + 18} textAnchor="middle"
              fill={color} fontSize="8" fontWeight="bold" fontFamily="monospace" opacity={0.9}>
              {packet.protocol}
            </text>
          </g>
        );
      })}
    </>
  );
}