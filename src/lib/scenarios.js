/**
 * Shared scenario definitions.
 * Keeping eval functions here prevents the JSON serialization bug
 * (functions cannot be stored in localStorage via JSON.stringify/parse).
 */

export const SCENARIOS = [
  {
    id: "vlan_setup",
    title: "إعداد VLAN أساسي",
    desc: "قم بإنشاء شبكتين VLAN منفصلتين وتأكد من عزلهما.",
    difficulty: "سهل",
    diffColor: "text-green-400 bg-green-400/10 border-green-400/30",
    time: "15 دقيقة",
    xp: 100,
    icon: "🔀",
    objectives: [
      "أضف سويتش رئيسي",
      "أضف 4 أجهزة PC (2 لكل VLAN)",
      "ربط الأجهزة بالسويتش",
      "قسّم الأجهزة: PC1 وPC2 في VLAN10، PC3 وPC4 في VLAN20",
      "تأكد من أن VLAN10 وVLAN20 معزولان",
    ],
    hints: [
      "تأكد من تعريف VLAN على السويتش",
      "استخدم Access Mode للمنافذ",
      "لا يمكن للأجهزة في VLANs مختلفة التواصل بدون Router",
    ],
    eval: (nodes, connections) => {
      const switches = nodes.filter((n) => n.type === "Switch");
      const pcs = nodes.filter((n) => n.type === "PC");
      const score = Math.min(100, switches.length * 20 + pcs.length * 15 + connections.length * 10);
      const passed = score >= 60;
      return {
        score, passed,
        feedback: passed ? "أحسنت! تم إعداد البنية الأساسية بنجاح." : "تحتاج إلى إضافة سويتش وربط الأجهزة بشكل صحيح.",
        details: [
          { label: "سويتش موجود", ok: switches.length > 0 },
          { label: "4 أجهزة PC أو أكثر", ok: pcs.length >= 4 },
          { label: "اتصالات كافية (4+)", ok: connections.length >= 4 },
          { label: "جميع الأجهزة مربوطة", ok: pcs.length >= 4 && connections.length >= pcs.length },
        ],
      };
    },
  },
  {
    id: "dhcp_fix",
    title: "إصلاح مشكلة DHCP",
    desc: "الشبكة لا تُوزّع عناوين IP تلقائياً. اكتشف المشكلة وأصلحها.",
    difficulty: "متوسط",
    diffColor: "text-amber-400 bg-amber-400/10 border-amber-400/30",
    time: "25 دقيقة",
    xp: 200,
    icon: "⚡",
    objectives: [
      "أضف سيرفر DHCP",
      "تحقق من الاتصال بين السيرفر والسويتش",
      "تأكد من تعريف Pool صحيح",
      "اختبر توزيع الـ IP على الأجهزة",
    ],
    hints: [
      "DHCP Server يحتاج IP ثابت",
      "تأكد من وجود Default Gateway",
      "الـ Scope يجب أن يطابق نطاق الشبكة",
    ],
    eval: (nodes, connections) => {
      const servers = nodes.filter((n) => n.type === "Server");
      const switches = nodes.filter((n) => n.type === "Switch");
      const pcs = nodes.filter((n) => n.type === "PC");
      const serverConnected = servers.some((s) => connections.some((c) => c.from === s.id || c.to === s.id));
      const score = Math.min(100, servers.length * 30 + switches.length * 20 + (serverConnected ? 30 : 0) + (pcs.length >= 2 ? 20 : 0));
      const passed = score >= 70;
      return {
        score, passed,
        feedback: passed ? "ممتاز! السيرفر متصل ويمكنه توزيع الـ IPs." : "تأكد من وجود سيرفر متصل بالشبكة.",
        details: [
          { label: "سيرفر DHCP موجود", ok: servers.length > 0 },
          { label: "السيرفر متصل بالشبكة", ok: serverConnected },
          { label: "سويتش للتوزيع", ok: switches.length > 0 },
          { label: "أجهزة عملاء (2+)", ok: pcs.length >= 2 },
        ],
      };
    },
  },
  {
    id: "routing_config",
    title: "إعداد Static Routing",
    desc: "اربط شبكتين مختلفتين عبر راوتر وتأكد من التوجيه الصحيح.",
    difficulty: "متوسط",
    diffColor: "text-amber-400 bg-amber-400/10 border-amber-400/30",
    time: "30 دقيقة",
    xp: 250,
    icon: "🔀",
    objectives: [
      "أضف راوترين على الأقل",
      "أضف شبكتين منفصلتين من الأجهزة",
      "ربط الراوترات معاً",
      "إعداد Static Routes",
    ],
    hints: [
      "كل راوتر يحتاج IP على كل Interface",
      "Static Route: ip route [destination] [mask] [next-hop]",
      "تحقق من الاتصال بـ ping بعد الإعداد",
    ],
    eval: (nodes, connections) => {
      const routers = nodes.filter((n) => n.type === "Router");
      const routerConnected = routers.length >= 2 && connections.some(
        (c) => routers.some((r) => r.id === c.from) && routers.some((r) => r.id === c.to)
      );
      const pcs = nodes.filter((n) => n.type === "PC" || n.type === "Laptop");
      const score = Math.min(100, routers.length * 25 + (routerConnected ? 40 : 0) + (pcs.length >= 4 ? 20 : pcs.length * 5) + (nodes.length >= 6 ? 10 : 0));
      const passed = score >= 65;
      return {
        score, passed,
        feedback: passed ? "رائع! الراوترات مترابطة وجاهزة للتوجيه." : "تحتاج راوترين متصلين على الأقل.",
        details: [
          { label: "راوترين على الأقل", ok: routers.length >= 2 },
          { label: "الراوترات مترابطة", ok: routerConnected },
          { label: "أجهزة في كل شبكة (4+)", ok: pcs.length >= 4 },
          { label: "شبكة متكاملة (6+ أجهزة)", ok: nodes.length >= 6 },
        ],
      };
    },
  },
  {
    id: "firewall_acl",
    title: "إعداد Firewall وACL",
    desc: "احمِ الشبكة الداخلية من الوصول الخارجي غير المصرح.",
    difficulty: "صعب",
    diffColor: "text-red-400 bg-red-400/10 border-red-400/30",
    time: "40 دقيقة",
    xp: 350,
    icon: "🛡️",
    objectives: [
      "أضف Firewall بين الشبكة الداخلية والخارجية",
      "إعداد قواعد ACL لمنع الوصول غير المصرح",
      "السماح فقط للبروتوكولات المحددة",
      "اختبر القواعد",
    ],
    hints: [
      "Firewall يضع بين الشبكتين",
      "ACL: permit/deny بناءً على IP أو Protocol",
      "لا تنسَ قاعدة deny all في النهاية",
    ],
    eval: (nodes, connections) => {
      const firewalls = nodes.filter((n) => n.type === "Firewall");
      const fwConnected = firewalls.some((f) =>
        connections.filter((c) => c.from === f.id || c.to === f.id).length >= 2
      );
      const hasCloud = nodes.some((n) => n.type === "Cloud");
      const score = Math.min(100, firewalls.length * 35 + (fwConnected ? 45 : 0) + (nodes.length >= 4 ? 10 : 0) + (hasCloud ? 10 : 0));
      const passed = score >= 70;
      return {
        score, passed,
        feedback: passed ? "عالي! الـ Firewall في موقعه الصحيح." : "ضع الـ Firewall بين شبكتين ووصّله بكليهما.",
        details: [
          { label: "Firewall موجود", ok: firewalls.length > 0 },
          { label: "Firewall متصل بشبكتين", ok: fwConnected },
          { label: "شبكة خارجية (Cloud)", ok: hasCloud },
          { label: "شبكة كاملة (4+ أجهزة)", ok: nodes.length >= 4 },
        ],
      };
    },
  },
  {
    id: "wifi_network",
    title: "شبكة Wi-Fi للمكتب",
    desc: "أنشئ شبكة لاسلكية للمكتب مع تغطية كاملة وأمان.",
    difficulty: "سهل",
    diffColor: "text-green-400 bg-green-400/10 border-green-400/30",
    time: "20 دقيقة",
    xp: 150,
    icon: "📡",
    objectives: [
      "أضف Router متصل بالإنترنت (Cloud)",
      "أضف Access Point واحد أو أكثر",
      "ربط الـ Router بالـ Access Points",
      "أضف 3 أجهزة لابتوب للمستخدمين",
      "تأكد من الاتصال الكامل",
    ],
    hints: [
      "Access Point يتوسط بين الراوتر والأجهزة اللاسلكية",
      "ضع الـ Access Point في مركز الشبكة",
      "تأكد من ربط الراوتر بالـ Cloud للإنترنت",
    ],
    eval: (nodes, connections) => {
      const aps = nodes.filter((n) => n.type === "AccessPoint");
      const routers = nodes.filter((n) => n.type === "Router");
      const laptops = nodes.filter((n) => n.type === "Laptop");
      const hasCloud = nodes.some((n) => n.type === "Cloud");
      const apConnected = aps.some((a) => connections.some((c) => c.from === a.id || c.to === a.id));
      const score = Math.min(100,
        routers.length * 20 + aps.length * 25 + laptops.length * 10 +
        (hasCloud ? 15 : 0) + (apConnected ? 10 : 0)
      );
      const passed = score >= 60;
      return {
        score, passed,
        feedback: passed ? "ممتاز! شبكة Wi-Fi جاهزة للاستخدام." : "أضف Access Point وراوتر وأجهزة لابتوب.",
        details: [
          { label: "Router موجود", ok: routers.length > 0 },
          { label: "Access Point موجود", ok: aps.length > 0 },
          { label: "متصل بالإنترنت (Cloud)", ok: hasCloud },
          { label: "3 أجهزة لابتوب أو أكثر", ok: laptops.length >= 3 },
          { label: "Access Point متصل", ok: apConnected },
        ],
      };
    },
  },
  {
    id: "dmz_setup",
    title: "إعداد DMZ للسيرفرات",
    desc: "أنشئ منطقة DMZ آمنة للسيرفرات العامة مع حماية الشبكة الداخلية.",
    difficulty: "صعب",
    diffColor: "text-red-400 bg-red-400/10 border-red-400/30",
    time: "45 دقيقة",
    xp: 400,
    icon: "🔒",
    objectives: [
      "أضف Firewall مركزي",
      "أضف سيرفرين في منطقة DMZ",
      "أضف شبكة داخلية (PC + Switch)",
      "اربط الـ Firewall بالإنترنت (Cloud)",
      "عزل DMZ عن الشبكة الداخلية",
    ],
    hints: [
      "DMZ تكون بين الـ Firewall والإنترنت",
      "السيرفرات في DMZ يمكن الوصول إليها من الإنترنت",
      "الشبكة الداخلية لا تُكشف للإنترنت مباشرة",
    ],
    eval: (nodes, connections) => {
      const firewalls = nodes.filter((n) => n.type === "Firewall");
      const servers = nodes.filter((n) => n.type === "Server");
      const pcs = nodes.filter((n) => n.type === "PC");
      const hasCloud = nodes.some((n) => n.type === "Cloud");
      const fwConnections = firewalls.flatMap((f) => connections.filter((c) => c.from === f.id || c.to === f.id));
      const fwFullyConnected = fwConnections.length >= 3;
      const score = Math.min(100,
        firewalls.length * 25 + servers.length * 15 + pcs.length * 10 +
        (hasCloud ? 15 : 0) + (fwFullyConnected ? 25 : 0)
      );
      const passed = score >= 70;
      return {
        score, passed,
        feedback: passed ? "احترافي! DMZ مُعدّة بشكل صحيح." : "تأكد من وجود Firewall مع 3 نقاط اتصال على الأقل.",
        details: [
          { label: "Firewall مركزي", ok: firewalls.length > 0 },
          { label: "Firewall متصل بـ 3 شبكات", ok: fwFullyConnected },
          { label: "سيرفران في DMZ", ok: servers.length >= 2 },
          { label: "شبكة داخلية (PC)", ok: pcs.length >= 1 },
          { label: "اتصال بالإنترنت", ok: hasCloud },
        ],
      };
    },
  },
  {
    id: "backbone_network",
    title: "شبكة Backbone للمؤسسة",
    desc: "أنشئ بنية تحتية لشبكة مؤسسية كبيرة متعددة الطوابق.",
    difficulty: "صعب",
    diffColor: "text-red-400 bg-red-400/10 border-red-400/30",
    time: "50 دقيقة",
    xp: 450,
    icon: "🏢",
    objectives: [
      "أضف Core Router (راوتر مركزي)",
      "أضف 3 Distribution Switches",
      "أضف 6 أجهزة PC موزعة على السويتشات",
      "أضف سيرفر مركزي",
      "تأكد من الاتصال الكامل والهرمي",
    ],
    hints: [
      "البنية الهرمية: Core → Distribution → Access",
      "كل سويتش توزيع يخدم مجموعة أجهزة",
      "الراوتر المركزي يربط كل شيء",
    ],
    eval: (nodes, connections) => {
      const routers = nodes.filter((n) => n.type === "Router");
      const switches = nodes.filter((n) => n.type === "Switch");
      const pcs = nodes.filter((n) => n.type === "PC");
      const servers = nodes.filter((n) => n.type === "Server");
      const routerToSwitch = routers.some((r) =>
        switches.some((s) => connections.some((c) =>
          (c.from === r.id && c.to === s.id) || (c.from === s.id && c.to === r.id)
        ))
      );
      const score = Math.min(100,
        routers.length * 15 + switches.length * 15 + pcs.length * 8 +
        servers.length * 10 + (routerToSwitch ? 20 : 0)
      );
      const passed = score >= 70;
      return {
        score, passed,
        feedback: passed ? "مبدع! شبكة مؤسسية متكاملة." : "تحتاج راوتر وعدة سويتشات وأجهزة موزعة.",
        details: [
          { label: "Core Router موجود", ok: routers.length >= 1 },
          { label: "3 سويتشات أو أكثر", ok: switches.length >= 3 },
          { label: "6 أجهزة PC أو أكثر", ok: pcs.length >= 6 },
          { label: "سيرفر مركزي", ok: servers.length >= 1 },
          { label: "الراوتر متصل بالسويتشات", ok: routerToSwitch },
        ],
      };
    },
  },
  {
    id: "redundant_network",
    title: "شبكة Redundant عالية الإتاحة",
    desc: "صمّم شبكة بمسارات احتياطية لضمان عدم انقطاع الخدمة.",
    difficulty: "متوسط",
    diffColor: "text-amber-400 bg-amber-400/10 border-amber-400/30",
    time: "35 دقيقة",
    xp: 300,
    icon: "♻️",
    objectives: [
      "أضف راوترين على الأقل",
      "اربط الراوترات ببعضها (مسار احتياطي)",
      "أضف سويتشين أو أكثر",
      "تأكد من وجود أكثر من مسار بين الأجهزة",
    ],
    hints: [
      "Redundancy تعني وجود مسارين لنفس الوجهة",
      "STP يمنع الـ Loops في الـ Switches",
      "في الراوترات يمكن استخدام OSPF للتعافي التلقائي",
    ],
    eval: (nodes, connections) => {
      const routers = nodes.filter((n) => n.type === "Router");
      const switches = nodes.filter((n) => n.type === "Switch");
      const routersInterconnected = routers.length >= 2 && connections.some(
        (c) => routers.some((r) => r.id === c.from) && routers.some((r) => r.id === c.to)
      );
      const hasRedundancy = connections.length > nodes.length;
      const score = Math.min(100,
        routers.length * 20 + switches.length * 15 +
        (routersInterconnected ? 30 : 0) + (hasRedundancy ? 20 : 0)
      );
      const passed = score >= 65;
      return {
        score, passed,
        feedback: passed ? "ممتاز! الشبكة لديها مسارات احتياطية." : "أضف راوترين متصلين وعدة مسارات.",
        details: [
          { label: "راوترين أو أكثر", ok: routers.length >= 2 },
          { label: "الراوترات مترابطة", ok: routersInterconnected },
          { label: "سويتشان أو أكثر", ok: switches.length >= 2 },
          { label: "مسارات متعددة (Redundancy)", ok: hasRedundancy },
        ],
      };
    },
  },
];

export function getScenarioById(id) {
  return SCENARIOS.find((s) => s.id === id) || null;
}