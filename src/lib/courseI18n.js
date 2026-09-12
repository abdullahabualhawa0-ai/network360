/**
 * courseI18n.js — ترجمة عناوين وحدات ودروس المنهج (28 وحدة / 49 درساً)
 * العربية هي المصدر الأساسي، والإنجليزية/العبرية ترجمات ثابتة عالية الجودة.
 */
import { getLang } from "./i18n";

export const SECTION_TITLES = {
  "unit1-basics": { en: "Communication Networks Fundamentals", he: "יסודות רשתות תקשורת" },
  "unit2-ios": { en: "Device Operating System (Cisco IOS)", he: "מערכת הפעלה למכשירים (Cisco IOS)" },
  "unit3-protocols-models": { en: "Protocols & Standard Models", he: "פרוטוקולים ומודלים תקניים" },
  "unit4-physical": { en: "The Physical Layer", he: "השכבה הפיזית" },
  "unit5-numbering": { en: "Numbering Systems", he: "שיטות ספירה" },
  "unit6-data-link": { en: "Data Link Layer (Layer 2)", he: "שכבת קישור הנתונים (Layer 2)" },
  "unit7-ethernet-switching": { en: "Ethernet Switching", he: "מיתוג Ethernet" },
  "unit8-network-layer": { en: "Network Layer (Layer 3)", he: "שכבת הרשת (Layer 3)" },
  "unit9-arp": { en: "Address Resolution Protocol (ARP)", he: "פרוטוקול פענוח כתובות (ARP)" },
  "unit10-router-basic": { en: "Basic Router Configuration", he: "הגדרה בסיסית של נתב" },
  "unit11-ipv4": { en: "IPv4 Protocol & Network Addressing", he: "פרוטוקול IPv4 וכתובות רשת" },
  "unit12-icmp": { en: "Internet Control Message Protocol (ICMP)", he: "פרוטוקול הודעות בקרה (ICMP)" },
  "unit13-transport": { en: "Transport Layer (Layer 4) – TCP & UDP", he: "שכבת התעבורה (Layer 4) – TCP ו-UDP" },
  "unit14-application": { en: "Application Layer (Layer 7)", he: "שכבת היישומים (Layer 7)" },
  "unit15-advanced-initial": { en: "Advanced Initial Setup for Switch & Router", he: "הגדרות התחלתיות מתקדמות למתג ולנתב" },
  "unit16-switching-concepts": { en: "Switching Concepts & Techniques", he: "מושגים וטכניקות של מיתוג" },
  "unit17-vlan": { en: "Virtual LANs (VLAN)", he: "רשתות מקומיות וירטואליות (VLAN)" },
  "unit18-inter-vlan": { en: "Inter-VLAN Routing", he: "ניתוב בין VLAN (Inter-VLAN)" },
  "unit19-dhcp": { en: "Dynamic Host Configuration Protocol (DHCP)", he: "פרוטוקול הגדרה דינמית (DHCP)" },
  "unit20-switch-security": { en: "Switch Security & Protection", he: "אבטחת מתגים והגנה" },
  "unit21-wlan-intro": { en: "Intro to Wireless Networks (WLAN)", he: "מבוא לרשתות אלחוטיות (WLAN)" },
  "unit22-wlan-config": { en: "Wireless Network Setup & Configuration", he: "הקמה והגדרת רשתות אלחוטיות" },
  "unit23-routing-how": { en: "How Routing Works", he: "כיצד עובד הניתוב" },
  "unit24-static-routing": { en: "Static Routing & Default Route", he: "ניתוב סטטי ונתיב ברירת מחדל" },
  "unit25-ospf": { en: "Dynamic Routing with OSPFv2", he: "ניתוב דינמי עם OSPFv2" },
  "unit26-acl": { en: "Access Control Lists (ACL)", he: "רשימות בקרת גישה (ACL)" },
  "unit27-nat": { en: "Network Address Translation (NAT)", he: "תרגום כתובות רשת (NAT)" },
  iot: { en: "Internet of Things (IoT)", he: "האינטרנט של הדברים (IoT)" },
};

export const TOPIC_TITLES = {
  "network-components": { en: "Basic Network Components", he: "רכיבי רשת בסיסיים" },
  "packet-tracer-intro": { en: "Introduction to Packet Tracer", he: "מבוא ל-Packet Tracer" },
  "ios-access-modes": { en: "Cisco IOS Access Modes", he: "מצבי גישה ל-Cisco IOS" },
  "ios-initial-config": { en: "Initial Device Configuration", he: "הגדרות ראשוניות למכשיר" },
  "osi-tcpip-models": { en: "OSI and TCP/IP Models", he: "מודלי OSI ו-TCP/IP" },
  "physical-media": { en: "Physical Layer Media", he: "אמצעי שידור של השכבה הפיזית" },
  "binary-system": { en: "Binary System & Conversions", he: "השיטה הבינארית והמרות" },
  "data-link-functions": { en: "Data Link Layer Functions", he: "פונקציות שכבת קישור הנתונים" },
  "mac-addresses": { en: "MAC Addresses & ARP Table", he: "כתובות MAC וטבלת ARP" },
  "network-layer-functions": { en: "Network Layer Functions & IPv4/IPv6", he: "פונקציות שכבת הרשת ו-IPv4/IPv6" },
  "arp-protocol": { en: "How ARP Works", he: "כיצד ARP פועל" },
  "router-basic-config": { en: "Router Configuration Step by Step", he: "הגדרת נתב שלב אחר שלב" },
  "ipv4-addresses": { en: "IPv4 Address Structure & Subnetting", he: "מבנה כתובות IPv4 וחלוקה לתתי-רשתות" },
  "ipv4-broadcast-types": { en: "Broadcast Types in IPv4", he: "סוגי שידור ב-IPv4" },
  ipv6: { en: "IPv6 Addresses", he: "כתובות IPv6" },
  "ipv6-exercise": { en: "Exercise – IPv6 Address Definitions", he: "תרגול – הגדרות כתובות IPv6" },
  "icmp-ping-traceroute": { en: "Ping and Traceroute Commands", he: "פקודות Ping ו-Traceroute" },
  "tcp-udp": { en: "TCP vs UDP & Port Numbers", he: "TCP מול UDP ומספרי יציאות" },
  "application-protocols": { en: "Application Layer Protocols", he: "פרוטוקולי שכבת היישומים" },
  "dns-http": { en: "DNS and HTTP Servers", he: "שרתי DNS ו-HTTP" },
  "email-server": { en: "Email Server", he: "שרת דואר אלקטרוני" },
  ftp: { en: "FTP Server", he: "שרת FTP" },
  "servers-exercise": { en: "Final Exercise on Servers", he: "תרגול מסכם על שרתים" },
  "telnet-router": { en: "Telnet – Remote Access to a Router", he: "Telnet – גישה מרחוק לנתב" },
  "telnet-switch": { en: "Telnet – Remote Access to a Switch + SVI", he: "Telnet – גישה מרחוק למתג + SVI" },
  "advanced-switch-router": { en: "SSH Setup & Advanced Interfaces", he: "הגדרת SSH וממשקים מתקדמים" },
  "switching-concepts": { en: "Collision & Broadcast Domains", he: "תחומי התנגשות ותחומי שידור" },
  "vlan-gui": { en: "VLAN Concept & Configuration", he: "מושג ה-VLAN והגדרתו" },
  vtp: { en: "VTP Protocol for VLAN Management", he: "פרוטוקול VTP לניהול VLAN" },
  "vlan-cli": { en: "Basic VLAN Setup – CLI", he: "הגדרות VLAN בסיסיות – CLI" },
  "router-on-stick": { en: "Router-on-a-Stick & Inter-VLAN Routing", he: "Router-on-a-Stick וניתוב Inter-VLAN" },
  "dhcp-server": { en: "DHCP Server Setup on a Router", he: "הקמת שרת DHCP על נתב" },
  dhcp: { en: "Distributing IP Addresses with DHCP", he: "חלוקת כתובות IP באמצעות DHCP" },
  "switch-security": { en: "Port Security", he: "אבטחת יציאות (Port Security)" },
  "router-security": { en: "Router Security Settings", he: "הגדרות אבטחה לנתב" },
  "wireless-basics": { en: "Wireless Concepts & Standards", he: "מושגי רשתות אלחוטיות ותקנים" },
  "wireless-router-integration": { en: "Wireless Router Setup", he: "הקמת נתב אלחוטי" },
  "routing-table": { en: "Routing Table & Decision Making", he: "טבלת ניתוב וקבלת החלטות" },
  "static-routing": { en: "Static Routing Configuration", he: "הגדרת ניתוב סטטי" },
  rip: { en: "RIP Routing Protocol", he: "פרוטוקול ניתוב RIP" },
  "tracert-rip": { en: "TraceRT + RIP Routing", he: "TraceRT + ניתוב RIP" },
  ospf: { en: "OSPF Concept & Configuration", he: "מושג ה-OSPF והגדרתו" },
  "standard-acl-1": { en: "Standard ACL Lists", he: "רשימות ACL סטנדרטיות" },
  "standard-acl-2": { en: "Extended ACL Lists", he: "רשימות ACL מורחבות" },
  nat: { en: "Static NAT and Dynamic NAT", he: "NAT סטטי ו-NAT דינמי" },
  pat: { en: "PAT Configuration (NAT Overload)", he: "הגדרת PAT (NAT Overload)" },
  "iot-basics": { en: "IoT – Basic Definitions", he: "IoT – הגדרות בסיסיות" },
  "iot-terms": { en: "IoT – Terminology", he: "IoT – מונחים" },
  "iot-wireless": { en: "IoT – Wireless Components", he: "IoT – רכיבים אלחוטיים" },
};

/** عنوان الوحدة باللغة الحالية (مع الاحتفاظ بالعربية كمصدر) */
export function sectionTitle(section) {
  const lang = getLang();
  return SECTION_TITLES[section?.id]?.[lang] || section?.title || "";
}

/** عنوان الدرس باللغة الحالية */
export function topicTitle(topic) {
  const lang = getLang();
  return TOPIC_TITLES[topic?.id]?.[lang] || topic?.title || "";
}

/** عنوان درس بمعرّفه — مع قيمة احتياطية إن لم يوجد */
export function topicTitleById(topicId, fallback = "") {
  const lang = getLang();
  return TOPIC_TITLES[topicId]?.[lang] || fallback;
}