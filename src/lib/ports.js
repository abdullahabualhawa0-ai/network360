/**
 * ports.js — تعريفات منافذ الأجهزة وأنواع الكابلات وقواعد التوافق
 * نظام اختيار المنفذ عند توصيل الأجهزة (Phase 2)
 */

// ── منافذ الأجهزة ────────────────────────────────
const fastEthernetPorts = (count) =>
  Array.from({ length: count }, (_, i) => ({ name: `FastEthernet0/${i + 1}` }));

export const PORT_TEMPLATES = {
  Switch: [
    ...fastEthernetPorts(24),
    { name: "GigabitEthernet0/1" },
    { name: "GigabitEthernet0/2" },
  ],
  Router: [
    { name: "GigabitEthernet0/0" },
    { name: "GigabitEthernet0/1" },
    { name: "Serial0/0/0", disabled: true, noteKey: "simSerialNote" },
    { name: "Serial0/0/1", disabled: true, noteKey: "simSerialNote" },
  ],
  PC: [{ name: "FastEthernet0/1" }],
  Laptop: [{ name: "FastEthernet0/1" }, { name: "Wlan0" }],
  Server: [{ name: "FastEthernet0/1" }, { name: "GigabitEthernet0/1" }],
  Firewall: [
    { name: "GigabitEthernet0/0" },
    { name: "GigabitEthernet0/1" },
    { name: "GigabitEthernet0/2" },
  ],
  AccessPoint: [{ name: "GigabitEthernet0/1" }, { name: "GigabitEthernet0/2" }],
  Cloud: [{ name: "GigabitEthernet0/0" }],
};

export function getPortsForDevice(type) {
  return PORT_TEMPLATES[type] || [{ name: "Port0" }];
}

// ── أنواع الكابلات ────────────────────────────────
export const CABLE_TYPES = [
  { id: "utp",  labelKey: "simCableUtp",  icon: "🔌", color: "#D69E2E", descKey: "simCableUtpDesc" },
  { id: "stp",  labelKey: "simCableStp",  icon: "🛡️", color: "#173F5F", descKey: "simCableStpDesc" },
  { id: "fiber", labelKey: "simCableFiber", icon: "💠", color: "#3A86A8", descKey: "simCableFiberDesc" },
  { id: "wifi", labelKey: "simCableWifi", icon: "📶", color: "#2E7D5B", descKey: "simCableWifiDesc" },
];

// ── قواعد التوافق ────────────────────────────────
const COPPER_DEVICES = new Set(["PC", "Server", "Switch", "Router", "Firewall", "AccessPoint", "Laptop"]);
const FIBER_DEVICES = new Set(["Router", "Switch", "Server", "Cloud", "Firewall"]);
const WIRELESS_DEVICES = new Set(["Laptop", "AccessPoint"]);

export function isCableCompatible(cableId, typeA, typeB) {
  if (cableId === "utp" || cableId === "stp") {
    return COPPER_DEVICES.has(typeA) && COPPER_DEVICES.has(typeB);
  }
  if (cableId === "fiber") {
    return FIBER_DEVICES.has(typeA) && FIBER_DEVICES.has(typeB);
  }
  if (cableId === "wifi") {
    // أحد الطرفين على الأقل لاسلكي، والآخر جهاز شبكة عادي (ليس Cloud)
    return COPPER_DEVICES.has(typeA) && COPPER_DEVICES.has(typeB) &&
      (WIRELESS_DEVICES.has(typeA) || WIRELESS_DEVICES.has(typeB));
  }
  return false;
}

// ── حالة المنافذ ────────────────────────────────
export function getUsedPorts(connections, nodeId) {
  const used = new Set();
  for (const c of connections || []) {
    if (c.from === nodeId && c.fromPort) used.add(c.fromPort);
    if (c.to === nodeId && c.toPort) used.add(c.toPort);
  }
  return used;
}

export function getPortStatus(port, usedPorts) {
  if (usedPorts.has(port.name)) return "connected";
  if (port.disabled) return "disabled";
  return "available";
}

export const PORT_STATUS_LABELS = {
  available: { labelKey: "simPortAvailable", color: "#2E7D5B" },
  connected: { labelKey: "simPortConnected", color: "#D69E2E" },
  disabled: { labelKey: "simPortDisabled", color: "#C94C4C" },
};