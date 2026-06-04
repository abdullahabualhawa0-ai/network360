/**
 * Connection type logic — determines the cable type between two network devices.
 * Returns { type, label, color, dash, reason }
 */

export const CONNECTION_STYLES = {
  ethernet:    { label: "Ethernet",        color: "#06b6d4", dash: "none",  description: "كابل إيثرنت (UTP/Cat5e)" },
  fiber:       { label: "Fiber Optic",     color: "#a78bfa", dash: "8 3",  description: "ألياف بصرية — سرعة عالية جداً" },
  serial:      { label: "Serial",          color: "#f59e0b", dash: "4 4",  description: "اتصال تسلسلي بين راوترات" },
  wifi:        { label: "Wi-Fi",           color: "#34d399", dash: "3 6",  description: "اتصال لاسلكي" },
  copper:      { label: "Copper Cable",    color: "#fb923c", dash: "none",  description: "نحاسي — شبكات قصيرة المدى" },
};

/** Choose the best connection type for two device types */
export function getConnectionType(typeA, typeB) {
  const pair = [typeA, typeB].sort().join("-");

  const rules = {
    "Laptop-Router":        "wifi",
    "AccessPoint-Laptop":   "wifi",
    "AccessPoint-PC":       "wifi",
    "AccessPoint-Router":   "ethernet",
    "AccessPoint-Switch":   "ethernet",
    "PC-Router":            "ethernet",
    "PC-Switch":            "ethernet",
    "Laptop-Switch":        "ethernet",
    "Router-Server":        "ethernet",
    "PC-Server":            "ethernet",
    "Laptop-Server":        "ethernet",
    "Router-Switch":        "ethernet",
    "Router-Router":        "fiber",
    "Cloud-Router":         "fiber",
    "Cloud-Firewall":       "fiber",
    "Firewall-Router":      "ethernet",
    "Firewall-Switch":      "ethernet",
    "Server-Switch":        "ethernet",
    "Server-Server":        "fiber",
  };

  return rules[pair] || "ethernet";
}