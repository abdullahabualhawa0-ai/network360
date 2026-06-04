// Enhanced packet animation — shows hop-by-hop movement with Arabic status labels

const PROTOCOL_COLORS = {
  ICMP: "#F59E0B",
  TCP:  "#06B6D4",
  UDP:  "#A78BFA",
  DNS:  "#34D399",
  HTTP: "#F97316",
  ARP:  "#EC4899",
  default: "#94A3B8",
};

// Status label shown near the packet
function getStatusLabel(packet) {
  if (packet.progress < 0.15) return "جاري الإرسال...";
  if (packet.progress < 0.5)  return "في الطريق";
  if (packet.progress < 0.85) return "إعادة توجيه";
  return "جاري الاستلام";
}

export default function PacketAnimation({ packets, nodes }) {
  const getNode = (id) => nodes.find((n) => n.id === id);

  return (
    <>
      {packets.map((packet) => {
        const from = getNode(packet.fromId);
        const to   = getNode(packet.toId);
        if (!from || !to) return null;

        const px = from.x + (to.x - from.x) * packet.progress;
        const py = from.y + (to.y - from.y) * packet.progress;
        const color = PROTOCOL_COLORS[packet.protocol] || PROTOCOL_COLORS.default;
        const statusLabel = getStatusLabel(packet);

        // Direction arrow — angle along the path
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);

        return (
          <g key={packet.id}>
            {/* Trail glow */}
            <circle cx={px} cy={py} r={18} fill={color} opacity={0.06} />
            <circle cx={px} cy={py} r={11} fill={color} opacity={0.13} />

            {/* Packet body */}
            <circle cx={px} cy={py} r={6} fill={color} opacity={0.95}>
              <animate attributeName="r" values="5;7;5" dur="0.45s" repeatCount="indefinite" />
            </circle>

            {/* Direction arrow */}
            <g transform={`translate(${px},${py}) rotate(${angle})`}>
              <polygon
                points="12,0 6,-4 6,4"
                fill={color}
                opacity={0.8}
              />
            </g>

            {/* Protocol tag */}
            <text
              x={px} y={py - 18}
              textAnchor="middle"
              fill={color}
              fontSize="8"
              fontWeight="bold"
              fontFamily="monospace"
              opacity={0.9}
            >
              {packet.protocol}
            </text>

            {/* Arabic status label */}
            <text
              x={px} y={py + 22}
              textAnchor="middle"
              fill="rgba(226,232,240,0.75)"
              fontSize="8"
              fontFamily="Tajawal, sans-serif"
            >
              {statusLabel}
            </text>

            {/* Hop indicator */}
            {packet.totalHops > 1 && (
              <text
                x={px} y={py + 32}
                textAnchor="middle"
                fill="rgba(148,163,184,0.5)"
                fontSize="7"
                fontFamily="monospace"
              >
                hop {(packet.hopIndex || 0) + 1}/{packet.totalHops}
              </text>
            )}
          </g>
        );
      })}
    </>
  );
}