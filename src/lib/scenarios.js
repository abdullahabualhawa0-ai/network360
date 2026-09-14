/**
 * scenarios.js — مستودع السيناريوهات (Repository)
 * 40 سيناريو جاهز مسبقاً — لا يُنشأ سيناريو عشوائياً، ولا نسخة لكل طالب.
 * كل سيناريو مرتبط بدرس (Lesson ID) ووحدة (Unit ID) من المنهج الحالي.
 * ما يتغير لكل طالب هو سجله (LabHistory / ScenarioTaskStatus) وليس السيناريو نفسه.
 *
 * مستويات الصعوبة (مرتبة): مبتدئ → سهل → متوسط → صعب → متقدم
 */

import courseData from "./courseData";

/* ─────────── أدوات التقييم ─────────── */

const ctxOf = (nodes, connections) => {
  const of = (t) => nodes.filter((n) => n.type === t);
  const count = (t) => of(t).length;
  const deg = (id) => connections.filter((c) => c.from === id || c.to === id).length;
  const connected = (id) => deg(id) > 0;
  const anyConn = (t) => of(t).some((n) => connected(n.id));
  const allConn = (t) => of(t).length > 0 && of(t).every((n) => connected(n.id));
  const linked = (a, b) =>
    connections.some((c) => (c.from === a.id && c.to === b.id) || (c.from === b.id && c.to === a.id));
  const anyLink = (t1, t2) => of(t1).some((a) => of(t2).some((b) => linked(a, b)));
  return { nodes, connections, of, count, deg, connected, anyConn, allConn, linked, anyLink };
};

/* عناصر القالب (Template) — الأجهزة التي يبدأ منها السيناريو */
const N = (id, type, label, x, y) => ({ id, type, label, x, y });
const L = (from, to) => ({ id: `${from}__${to}`, from, to });

/** مصنع السيناريو — يبني دالة التقييم من قائمة مهام قابلة للفحص */
function lab(s) {
  const { checks, passScore = 80, passMsg, failMsg, ...rest } = s;
  return {
    status: "published",
    ...rest,
    tasks: checks.map((c) => c.label),
    eval: (nodes, connections) => {
      const c = ctxOf(nodes, connections);
      const details = checks.map((ch) => ({ label: ch.label, ok: !!ch.test(c) }));
      const okCount = details.filter((d) => d.ok).length;
      const score = details.length ? Math.round((okCount / details.length) * 100) : 0;
      const passed = score >= passScore;
      return {
        score,
        passed,
        feedback: passed
          ? passMsg || "أحسنت! أنجزت مهام السيناريو بنجاح."
          : failMsg || "لم تكتمل جميع المهام بعد — راجع الأهداف غير المنجزة وحاول مجدداً.",
        details,
      };
    },
  };
}

/* ─────────── مستويات الصعوبة ─────────── */

export const DIFF_ORDER = { "مبتدئ": 0, "سهل": 1, "متوسط": 2, "صعب": 3, "متقدم": 4 };

export const DIFF_LABEL_KEYS = {
  "مبتدئ": "diffBeginner",
  "سهل": "diffEasy",
  "متوسط": "diffMedium",
  "صعب": "diffHard",
  "متقدم": "diffAdvanced",
};

const DIFF_STYLE = {
  "مبتدئ": "text-secondary bg-secondary/10 border-secondary/30",
  "سهل": "text-accent bg-accent/10 border-accent/30",
  "متوسط": "text-warning bg-warning/10 border-warning/30",
  "صعب": "text-destructive bg-destructive/10 border-destructive/30",
  "متقدم": "text-primary bg-primary/10 border-primary/30",
};

const withStyle = (arr) =>
  arr.map((s) => ({ ...s, diffColor: DIFF_STYLE[s.difficulty] || DIFF_STYLE["متوسط"] }));

/* ─────────── المستودع: 40 سيناريو ─────────── */

export const SCENARIOS = withStyle([
  /* ══════════ مبتدئ (Beginner) ══════════ */
  lab({
    id: "first_lan",
    title: "أول شبكة محلية",
    desc: "ابنِ أول شبكة لك: سويتش يربط جهازي PC ويتواصلان عبره.",
    objective: "فهم مكونات الشبكة الأساسية وطوبولوجيا النجمة (Star).",
    unitId: "unit1-basics",
    lessonId: "network-components",
    difficulty: "مبتدئ",
    time: "10 دقائق",
    xp: 80,
    icon: "🌐",
    objectives: ["أضف سويتشاً رئيسياً", "أضف جهازي PC", "اربط الجهازين بالسويتش", "أرسل حزمة ping بينهما"],
    hints: ["السويتش يربط الأجهزة في شبكة النجمة", "كل جهاز يحتاج كابلاً يصله بالسويتش"],
    expected: "شبكة نجمة صغيرة: سويتش + جهازا PC متصلان به.",
    checks: [
      { label: "سويتش موجود", test: (c) => c.count("Switch") >= 1 },
      { label: "جهازا PC موجودان", test: (c) => c.count("PC") >= 2 },
      { label: "السويتش متصل بشبكة", test: (c) => c.anyConn("Switch") },
      { label: "الأجهزة متصلة (اتصالان+)", test: (c) => c.connections.length >= 2 && c.anyLink("PC", "Switch") },
    ],
  }),
  lab({
    id: "client_server",
    title: "نموذج العميل والخادم",
    desc: "أنشئ شبكة Client-Server: خادم مركزي يخدم أجهزة عملاء.",
    objective: "التمييز بين نموذج P2P ونموذج Client-Server عملياً.",
    unitId: "unit1-basics",
    lessonId: "network-components",
    difficulty: "مبتدئ",
    time: "12 دقيقة",
    xp: 90,
    icon: "🖥️",
    objectives: ["أضف Server", "أضف سويتشاً", "أضف جهازي PC كعملاء", "اربط الجميع بالسويتش"],
    hints: ["الخادم يقدم الخدمة والعميل يطلبها", "كل الأجهزة تتصل عبر السويتش"],
    expected: "خادم + سويتش + عميلان متصلون عبر السويتش.",
    checks: [
      { label: "Server موجود", test: (c) => c.count("Server") >= 1 },
      { label: "سويتش موجود", test: (c) => c.count("Switch") >= 1 },
      { label: "عميلان (PC)", test: (c) => c.count("PC") >= 2 },
      { label: "الخادم متصل بالشبكة", test: (c) => c.anyConn("Server") },
      { label: "العملاء متصلون بالسويتش", test: (c) => c.anyLink("PC", "Switch") },
    ],
  }),
  lab({
    id: "two_pc_direct",
    title: "ربط جهازين مباشرة",
    desc: "كما في Packet Tracer: جهازا PC يتصلان مباشرة بكابل Crossover ثم ping.",
    objective: "إتقان الخطوات الأولى: سحب الأجهزة، اختيار الكابل، ربط المنافذ، الاختبار.",
    unitId: "unit1-basics",
    lessonId: "packet-tracer-intro",
    difficulty: "مبتدئ",
    time: "8 دقائق",
    xp: 70,
    icon: "🔌",
    objectives: ["أضف جهازي PC", "اربطهما بكابل مباشر", "أرسل ping من أحدهما للآخر"],
    hints: ["ربط PC بـ PC يتم بكابل Crossover", "لا يلزم أي جهاز وسيط بين جهازين فقط"],
    expected: "جهازا PC متصلان مباشرة ببعضهما.",
    checks: [
      { label: "جهازا PC موجودان", test: (c) => c.count("PC") >= 2 },
      { label: "اتصال مباشر بينهما", test: (c) => c.anyLink("PC", "PC") },
    ],
  }),
  lab({
    id: "console_access",
    title: "الوصول لجهاز عبر Console",
    desc: "جهّز جهاز توجيه وحاسب إدارة متصل به عبر منفذ الإدارة.",
    objective: "فهم طرق الوصول لجهاز الشبكة (Console / Telnet / SSH).",
    unitId: "unit2-ios",
    lessonId: "ios-access-modes",
    difficulty: "مبتدئ",
    time: "10 دقائق",
    xp: 90,
    icon: "⌨️",
    objectives: ["أضف Router", "أضف PC إدارة", "اربط الـ PC بالراوتر (كابل إدارة)"],
    hints: ["Console هو الاتصال المادي المباشر للإعداد الأولي", "اربط PC بالـ Router مباشرة"],
    expected: "راوتر متصل بحاسب إدارة لمهمة الإعداد.",
    checks: [
      { label: "Router موجود", test: (c) => c.count("Router") >= 1 },
      { label: "حاسب إدارة (PC)", test: (c) => c.count("PC") >= 1 },
      { label: "الـ PC متصل بالراوتر", test: (c) => c.anyLink("PC", "Router") },
    ],
  }),
  lab({
    id: "initial_device_config",
    title: "الإعدادات الأولية للجهاز",
    desc: "جهّز شبكة إدارة: راوتر + سويتش + حاسب إدارة جميعها متصلة.",
    objective: "تطبيق تسلسل الإعداد الأولي وحفظ الإعدادات.",
    unitId: "unit2-ios",
    lessonId: "ios-initial-config",
    difficulty: "مبتدئ",
    time: "15 دقيقة",
    xp: 100,
    icon: "⚙️",
    objectives: ["أضف Router وSwitch وPC", "اربط الـ PC بالسويتش", "اربط السويتش بالراوتر"],
    hints: ["السويتش يوزع الاتصال للأجهزة", "الراوتر يربط الشبكة بالعالم الخارجي"],
    expected: "سلسلة متصلة: PC → Switch → Router.",
    checks: [
      { label: "Router + Switch + PC", test: (c) => c.count("Router") >= 1 && c.count("Switch") >= 1 && c.count("PC") >= 1 },
      { label: "PC متصل بالسويتش", test: (c) => c.anyLink("PC", "Switch") },
      { label: "السويتش متصل بالراوتر", test: (c) => c.anyLink("Switch", "Router") },
    ],
  }),
  lab({
    id: "layer_stack",
    title: "مسار التغليف عبر الطبقات",
    desc: "ابنِ مساراً كاملاً من جهاز مستخدم إلى الإنترنت يمر بالطبقات كلها.",
    objective: "ترسيخ نموذج OSI عملياً: طبقة فيزيائية → ربط → شبكة → تطبيق.",
    unitId: "unit3-protocols-models",
    lessonId: "osi-tcpip-models",
    difficulty: "مبتدئ",
    time: "15 دقيقة",
    xp: 110,
    icon: "🧱",
    objectives: ["أضف PC (طبقة التطبيق)", "أضف Switch (طبقة ربط البيانات)", "أضف Router (طبقة الشبكة)", "أضف Cloud (الإنترنت)", "اربط السلسلة كاملة"],
    hints: ["البيانات تُغلّف رأساً عند كل طبقة", "المسار: PC → Switch → Router → Cloud"],
    expected: "سلسلة متصلة كاملة PC → Switch → Router → Cloud.",
    checks: [
      { label: "PC + Switch + Router + Cloud", test: (c) => ["PC", "Switch", "Router", "Cloud"].every((t) => c.count(t) >= 1) },
      { label: "PC متصل بالسويتش", test: (c) => c.anyLink("PC", "Switch") },
      { label: "السويتش متصل بالراوتر", test: (c) => c.anyLink("Switch", "Router") },
      { label: "الراوتر متصل بالإنترنت (Cloud)", test: (c) => c.anyLink("Router", "Cloud") },
    ],
  }),

  /* ══════════ سهل (Easy) ══════════ */
  lab({
    id: "cable_lab",
    title: "مختبر الكابلات والمنافذ",
    desc: "اربط 3 أجهزة PC بسويتش بكابلات Straight-Through مناسبة.",
    objective: "اختيار الكابل الصحيح بين الأجهزة وفهم Auto-MDIX.",
    unitId: "unit4-physical",
    lessonId: "physical-media",
    difficulty: "سهل",
    time: "12 دقيقة",
    xp: 120,
    icon: "🧵",
    objectives: ["أضف سويتشاً", "أضف 3 أجهزة PC", "اربط كل جهاز بالسويتش بكابل مناسب"],
    hints: ["PC إلى Switch = Straight-Through", "راجع توافق المنافذ قبل التأكيد"],
    expected: "سويتش تتوفر عليه 3 منافذ مشغولة بأجهزة PC.",
    checks: [
      { label: "سويتش موجود", test: (c) => c.count("Switch") >= 1 },
      { label: "3 أجهزة PC", test: (c) => c.count("PC") >= 3 },
      { label: "جميع الأجهزة متصلة", test: (c) => c.allConn("PC") },
      { label: "الاتصال عبر السويتش", test: (c) => c.anyLink("PC", "Switch") },
    ],
  }),
  lab({
    id: "subnet_basics",
    title: "عنونة IP الأساسية",
    desc: "جهّز شبكة عنونة صحيحة: جهازان في شبكة واحدة يمران عبر راوتر البوابة.",
    objective: "فهم جزء الشبكة وجزء المضيف في عنوان IPv4 والبوابة الافتراضية.",
    unitId: "unit5-numbering",
    lessonId: "binary-system",
    difficulty: "سهل",
    time: "15 دقيقة",
    xp: 130,
    icon: "🔢",
    objectives: ["أضف سويتشاً وجهازي PC", "أضف راوتراً كبوابة", "اربط الشبكة بالبوابة"],
    hints: ["الأجهزة في نفس الشبكة تستخدم نفس القناع", "البوابة الافتراضية على الراوتر"],
    expected: "شبكة محلية مع بوابة راوتر جاهزة.",
    checks: [
      { label: "سويتش + جهازا PC", test: (c) => c.count("Switch") >= 1 && c.count("PC") >= 2 },
      { label: "راوتر البوابة موجود", test: (c) => c.count("Router") >= 1 },
      { label: "الأجهزة متصلة بالسويتش", test: (c) => c.anyLink("PC", "Switch") },
      { label: "السويتش متصل بالراوتر", test: (c) => c.anyLink("Switch", "Router") },
    ],
  }),
  lab({
    id: "frame_flow",
    title: "تدفق الإطارات بين المحولات",
    desc: "محولان يربط كل منهما أجهزته — واربط المحولين بناقل مشترك.",
    objective: "فهم بناء الإطارات وانتقالها بين المحولات (Frames).",
    unitId: "unit6-data-link",
    lessonId: "data-link-functions",
    difficulty: "سهل",
    time: "12 دقيقة",
    xp: 130,
    icon: "🧬",
    objectives: ["أضف سويتشين", "اربط PC بكل سويتش", "اربط السويتشين معاً"],
    hints: ["كل إطار يحمل MAC مصدر وMAC وجهة", "الربط بين المحولين يوسع نطاق البث"],
    expected: "محولان متصلان، وعلى كل منهما جهاز PC.",
    checks: [
      { label: "سويتشان", test: (c) => c.count("Switch") >= 2 },
      { label: "جهازا PC", test: (c) => c.count("PC") >= 2 },
      { label: "السويتشان مترابطان", test: (c) => c.anyLink("Switch", "Switch") },
      { label: "كل سويتش متصل بجهاز", test: (c) => c.anyLink("PC", "Switch") },
    ],
  }),
  lab({
    id: "mac_learning",
    title: "تعلّم عناوين MAC",
    desc: "اربط 3 أجهزة بسويتش واحد وشاهد كيف يتعلّم جدول MAC.",
    objective: "فهم آلية تعلّم المحول وتوجيهه للإطارات.",
    unitId: "unit7-ethernet-switching",
    lessonId: "mac-addresses",
    difficulty: "سهل",
    time: "10 دقائق",
    xp: 120,
    icon: "📇",
    objectives: ["أضف سويتشاً", "أضف 3 أجهزة PC", "اربط جميع الأجهزة", "أرسل حزم بين الأجهزة"],
    hints: ["المحول يحفظ MAC المصدر مع منفذه", "إرسال حزمة يجبر المحول على التعلّم"],
    expected: "سويتش عليه 3 أجهزة متصلة وجدول MAC يتعلمها.",
    checks: [
      { label: "سويتش موجود", test: (c) => c.count("Switch") >= 1 },
      { label: "3 أجهزة PC", test: (c) => c.count("PC") >= 3 },
      { label: "جميع الأجهزة متصلة بالسويتش", test: (c) => c.allConn("PC") && c.anyLink("PC", "Switch") },
    ],
  }),
  lab({
    id: "gateway_setup",
    title: "إعداد البوابة الافتراضية",
    desc: "شبكتان منفصلتان بمحولين، يربطهما راوتر كبوابة بينهما.",
    objective: "فهم متى يُرسل المضيف الحزمة إلى البوابة الافتراضية.",
    unitId: "unit8-network-layer",
    lessonId: "network-layer-functions",
    difficulty: "سهل",
    time: "15 دقيقة",
    xp: 140,
    icon: "🚪",
    objectives: ["أضف محولين", "اربط جهازي PC (واحد لكل محول)", "أضف راوتراً واربطه بالمحولين"],
    hints: ["الوجهة في شبكة مختلفة → أرسل للبوابة", "الراوتر يملك واجهة في كل شبكة"],
    expected: "شبكتان متصلتان عبر راوتر مشترك.",
    checks: [
      { label: "محولان", test: (c) => c.count("Switch") >= 2 },
      { label: "جهازا PC", test: (c) => c.count("PC") >= 2 },
      { label: "الراوتر متصل بالمحولين", test: (c) => c.count("Router") >= 1 && c.anyLink("Router", "Switch") },
      { label: "أجهزة متصلة بالمحولات", test: (c) => c.anyLink("PC", "Switch") },
    ],
  }),
  lab({
    id: "arp_same_net",
    title: "حل العناوين في نفس الشبكة",
    desc: "جهازان في نفس الشبكة: اربطهما وشاهد طلب ARP بالبث.",
    objective: "فهم تسلسل ARP: Broadcast للطلب وUnicast للرد.",
    unitId: "unit9-arp",
    lessonId: "arp-protocol",
    difficulty: "سهل",
    time: "10 دقيقة",
    xp: 120,
    icon: "📡",
    objectives: ["أضف سويتشاً وجهازي PC", "اربط الجهازين بالسويتش", "أرسل ping وشاهد ARP"],
    hints: ["ARP Request يُرسل بالبث للجميع", "الرد يُرسل Unicast للسائل فقط"],
    expected: "جهازان متصلان عبر سويتش في نفس الشبكة.",
    checks: [
      { label: "سويتش + جهازا PC", test: (c) => c.count("Switch") >= 1 && c.count("PC") >= 2 },
      { label: "الجهازان متصلان بالسويتش", test: (c) => c.allConn("PC") && c.anyLink("PC", "Switch") },
    ],
  }),
  lab({
    id: "ping_path",
    title: "مسار Ping إلى الإنترنت",
    desc: "ابنِ مسار اختبار متسلسل: PC → Switch → Router → Cloud كما في اختبارات Ping.",
    objective: "إتقان اختبارات الاتصال المتسلسلة (Local → Gateway → Internet).",
    unitId: "unit12-icmp",
    lessonId: "icmp-ping-traceroute",
    difficulty: "سهل",
    time: "15 دقيقة",
    xp: 140,
    icon: "🛰️",
    objectives: ["أضف PC وسويتشاً وراوتراً وCloud", "اربط السلسلة من الـ PC حتى الإنترنت", "أرسل ICMP على المسار"],
    hints: ["اختبر أولاً loopback ثم البوابة ثم الإنترنت", "Traceroute يستخدم TTL متزايداً"],
    expected: "مسار ICMP كامل من الجهاز حتى الإنترنت.",
    checks: [
      { label: "السلسلة كاملة (PC+Switch+Router+Cloud)", test: (c) => ["PC", "Switch", "Router", "Cloud"].every((t) => c.count(t) >= 1) },
      { label: "PC متصل بالسويتش", test: (c) => c.anyLink("PC", "Switch") },
      { label: "السويتش متصل بالراوتر", test: (c) => c.anyLink("Switch", "Router") },
      { label: "الراوتر متصل بالإنترنت", test: (c) => c.anyLink("Router", "Cloud") },
    ],
  }),
  lab({
    id: "router_first_config",
    title: "أول إعداد لجهاز التوجيه",
    desc: "جهّز راوتراً يخدم شبكتين: محولان متصلان به وأجهزة في كل منهما.",
    objective: "تطبيق إعداد الواجهات (no shutdown) وربط شبكتين براوتر واحد.",
    unitId: "unit10-router-basic",
    lessonId: "router-basic-config",
    difficulty: "سهل",
    time: "20 دقيقة",
    xp: 150,
    icon: "🧭",
    objectives: ["أضف Router", "أضف محولين واربط كل محول براوتر", "أضف PC في كل شبكة", "تحقق من الواجهات"],
    hints: ["كل واجهة راوتر تخدم شبكة مختلفة", "no shutdown أساسية لتفعيل الواجهة"],
    expected: "راوتر يربط شبكتين محليتين عبر واجهتين فعالتين.",
    checks: [
      { label: "Router موجود", test: (c) => c.count("Router") >= 1 },
      { label: "محولان", test: (c) => c.count("Switch") >= 2 },
      { label: "الراوتر متصل بالمحولين", test: (c) => c.anyLink("Router", "Switch") },
      { label: "جهاز في كل شبكة", test: (c) => c.count("PC") >= 2 && c.anyLink("PC", "Switch") },
    ],
  }),

  /* ══════════ متوسط (Medium) ══════════ */
  lab({
    id: "vlan_setup",
    title: "إعداد VLAN أساسي",
    desc: "أنشئ شبكتين VLAN معزولتين على نفس المحول وتحقق من العزل.",
    objective: "تقسيم المحول منطقياً إلى VLANs مع منافذ Access.",
    unitId: "unit17-vlan",
    lessonId: "vlan-gui",
    difficulty: "متوسط",
    time: "15 دقيقة",
    xp: 200,
    icon: "🔀",
    template: {
      nodes: [N("vlan_setup-pc1", "PC", "PC1", 380, 200), N("vlan_setup-pc2", "PC", "PC2", 380, 320), N("vlan_setup-pc3", "PC", "PC3", 620, 200), N("vlan_setup-pc4", "PC", "PC4", 620, 320)],
      connections: [],
    },
    objectives: ["أضف سويتشاً رئيسياً", "اربط 4 أجهزة PC (اثنان لكل VLAN)", "وزّع المنافذ على VLAN10 وVLAN20", "تأكد من عزل المجموعتين"],
    hints: ["عرّف VLAN على المحول أولاً", "استخدم Access Mode لمنافذ الأجهزة", "لا اتصال بين VLANs بدون راوتر"],
    expected: "محول عليه VLAN10 وVLAN20 معزولان تماماً.",
    checks: [
      { label: "سويتش موجود", test: (c) => c.count("Switch") >= 1 },
      { label: "4 أجهزة PC", test: (c) => c.count("PC") >= 4 },
      { label: "اتصالات كافية (4+)", test: (c) => c.connections.length >= 4 },
      { label: "جميع الأجهزة مربوطة", test: (c) => c.allConn("PC") },
    ],
  }),
  lab({
    id: "vtp_trunk",
    title: "ربط Trunk بين المحولات",
    desc: "محولان يتبادلان VLANs عبر منفذ Trunk واحد بينهما.",
    objective: "فهم منفذ Trunk وتمرير عدة VLANs على رابط واحد.",
    unitId: "unit17-vlan",
    lessonId: "vtp",
    difficulty: "متوسط",
    time: "20 دقيقة",
    xp: 210,
    icon: "🛤️",
    objectives: ["أضف محولين", "اربط بينهما برابط Trunk", "أضف جهازاً على كل محول", "تحقق من مرور VLANs عبر الرابط"],
    hints: ["Trunk يمرر كل VLANs المسموح بها", "المنفذ الآخر للاتصال بين المحولين يكون Access"],
    expected: "رابط Trunk يربط محولين مع أجهزة على كل منهما.",
    checks: [
      { label: "محولان", test: (c) => c.count("Switch") >= 2 },
      { label: "رابط بين المحولين", test: (c) => c.anyLink("Switch", "Switch") },
      { label: "جهاز على كل محول", test: (c) => c.count("PC") >= 2 && c.anyLink("PC", "Switch") },
    ],
  }),
  lab({
    id: "inter_vlan_roas",
    title: "التوجيه بين VLANs (Router-on-a-Stick)",
    desc: "اربط راوتراً واحداً بمحول Trunk لتوجيه حركة VLANs المتعددة.",
    objective: "تنفيذ Inter-VLAN Routing بواجهات فرعية (Sub-interfaces).",
    unitId: "unit18-inter-vlan",
    lessonId: "router-on-stick",
    difficulty: "متوسط",
    time: "25 دقيقة",
    xp: 240,
    icon: "🧩",
    objectives: ["أضف Router وSwitch", "اربط الراوتر بالمحول برابط Trunk", "أضف 4 أجهزة (2 لكل VLAN)", "اختبر الوصول بين المجموعتين"],
    hints: ["الواجهة الفرعية لكل VLAN مع dot1Q", "no shutdown على الواجهة الرئيسية", "المحول يضبط منفذه Trunk نحو الراوتر"],
    expected: "راوتر يوجه بين VLAN10 وVLAN20 عبر رابط واحد.",
    checks: [
      { label: "Router + Switch", test: (c) => c.count("Router") >= 1 && c.count("Switch") >= 1 },
      { label: "الراوتر متصل بالمحول", test: (c) => c.anyLink("Router", "Switch") },
      { label: "4 أجهزة PC", test: (c) => c.count("PC") >= 4 },
      { label: "الأجهزة متصلة بالمحول", test: (c) => c.anyLink("PC", "Switch") },
    ],
  }),
  lab({
    id: "dhcp_fix",
    title: "إصلاح مشكلة DHCP",
    desc: "الشبكة لا تُوزّع عناوين IP تلقائياً — اكتشف الخلل وأصلحه.",
    objective: "تشخيص وعلاج خدمة DHCP: الخادم، النطاق، البوابة.",
    unitId: "unit19-dhcp",
    lessonId: "dhcp-server",
    difficulty: "متوسط",
    time: "25 دقيقة",
    xp: 220,
    icon: "⚡",
    template: {
      nodes: [N("dhcp_fix-pc1", "PC", "PC1", 380, 220), N("dhcp_fix-pc2", "PC", "PC2", 380, 340), N("dhcp_fix-sw", "Switch", "SW1", 520, 280)],
      connections: [],
    },
    objectives: ["أضف خادم DHCP (Server)", "اربط الخادم بالسويتش", "تحقق من نطاق التوزيع (Pool)", "اختبر استلام الأجهزة لعناوينها"],
    hints: ["خادم DHCP يحتاج IP ثابتاً", "تأكد من Default Gateway في الـ Pool", "النطاق يجب أن يطابق الشبكة"],
    expected: "خادم متصل يوزع عناوين IP تلقائياً على العملاء.",
    checks: [
      { label: "خادم DHCP (Server)", test: (c) => c.count("Server") >= 1 },
      { label: "الخادم متصل بالشبكة", test: (c) => c.anyConn("Server") },
      { label: "سويتش للتوزيع", test: (c) => c.count("Switch") >= 1 },
      { label: "عميلان فأكثر", test: (c) => c.count("PC") >= 2 },
    ],
  }),
  lab({
    id: "dhcp_relay",
    title: "DHCP عبر شبكات (Relay)",
    desc: "خادم DHCP في شبكة بعيدة — اربطه بالعملاء عبر راوتر وhelper-address.",
    objective: "فهم DHCP Relay وتحويل البث إلى Unicast عبر الراوتر.",
    unitId: "unit19-dhcp",
    lessonId: "dhcp-server",
    difficulty: "متوسط",
    time: "25 دقيقة",
    xp: 230,
    icon: "🔁",
    objectives: ["أضف Server في شبكة الخوادم", "أضف راوتراً يربط الشبكتين", "أضف سويتشاً وعملاء", "فعّل ip helper-address نحو الخادم"],
    hints: ["البث لا يعبر الراوتر — هنا يأتي دور الـ Relay", "helper-address يوجه طلبات DHCP للخادم"],
    expected: "خادم DHCP يخدم عملاء في شبكة أخرى عبر راوتر.",
    checks: [
      { label: "خادم موجود", test: (c) => c.count("Server") >= 1 },
      { label: "راوتر يربط الشبكتين", test: (c) => c.count("Router") >= 1 && c.anyConn("Router") },
      { label: "الخادم متصل بالراوتر", test: (c) => c.anyLink("Server", "Router") },
      { label: "عملاء متصلون (PC)", test: (c) => c.count("PC") >= 2 && c.anyLink("PC", "Switch") },
    ],
  }),
  lab({
    id: "port_security",
    title: "تأمين منافذ المحول",
    desc: "أغلق المنافذ غير المستخدمة وفعّل Port Security على منافذ الأجهزة.",
    objective: "تطبيق Port Security: حدود MAC ووضع الانتهاك.",
    unitId: "unit20-switch-security",
    lessonId: "switch-security",
    difficulty: "متوسط",
    time: "20 دقيقة",
    xp: 220,
    icon: "🔐",
    objectives: ["أضف سويتشاً و3 أجهزة PC", "اربط الأجهزة بالمنافذ المؤمّنة", "فعّل Sticky MAC", "أعد تفعيل منفذ مغلق"],
    hints: ["maximum 1 لكل منفذ أجهزة", "وضع Shutdown يغلق المنفذ عند الانتهاك", "no shutdown يعيد المنفذ للعمل"],
    expected: "محول مؤمّن المنافذ بجهاز واحد مسموح لكل منفذ.",
    checks: [
      { label: "سويتش موجود", test: (c) => c.count("Switch") >= 1 },
      { label: "3 أجهزة PC", test: (c) => c.count("PC") >= 3 },
      { label: "جميع الأجهزة متصلة", test: (c) => c.allConn("PC") },
      { label: "اتصالات كافية (3+)", test: (c) => c.connections.length >= 3 },
    ],
  }),
  lab({
    id: "wifi_network",
    title: "شبكة Wi-Fi للمكتب",
    desc: "أنشئ شبكة لاسلكية بتغطية كاملة وأمان WPA2.",
    objective: "فهم مكونات WLAN: نقطة الوصول، الراوتر، معايير 802.11.",
    unitId: "unit21-wlan-intro",
    lessonId: "wireless-basics",
    difficulty: "متوسط",
    time: "20 دقيقة",
    xp: 200,
    icon: "📶",
    objectives: ["أضف Router متصلاً بالإنترنت (Cloud)", "أضف Access Point", "اربط الـ AP بالراوتر", "أضف 3 أجهزة لابتوب", "تحقق من التغطية الكاملة"],
    hints: ["نقطة الوصول وسيط بين الراوتر والأجهزة اللاسلكية", "ضع الـ AP في مركز التغطية", "WEP مهجور — استخدم WPA2 أو أحدث"],
    expected: "شبكة لاسلكية كاملة: راوتر + AP + لابتوبات متصلة بالإنترنت.",
    checks: [
      { label: "Router موجود", test: (c) => c.count("Router") >= 1 },
      { label: "Access Point موجود", test: (c) => c.count("AccessPoint") >= 1 },
      { label: "متصل بالإنترنت (Cloud)", test: (c) => c.count("Cloud") >= 1 },
      { label: "3 أجهزة لابتوب", test: (c) => c.count("Laptop") >= 3 },
      { label: "AP متصل بالشبكة", test: (c) => c.anyConn("AccessPoint") },
    ],
  }),
  lab({
    id: "wireless_office",
    title: "إعداد جهاز التوجيه اللاسلكي",
    desc: "مكتب بشبكتين لاسلكيتين: راوتر مركزي تتبعه نقطتا وصول.",
    objective: "إدارة الشبكات اللاسلكية: SSID وقنوات وربط Mesh.",
    unitId: "unit22-wlan-config",
    lessonId: "wireless-router-integration",
    difficulty: "متوسط",
    time: "25 دقيقة",
    xp: 230,
    icon: "🏨",
    objectives: ["أضف Router واربطه بالإنترنت (Cloud)", "أضف نقطتي وصول (AP)", "اربط APs بالراوتر", "أضف لابتوبين للمستخدمين", "اضبط قنوات غير متداخلة (1/6/11)"],
    hints: ["القنوات 1 و6 و11 غير متداخلة في 2.4GHz", "Mesh يوسع التغطية تلقائياً"],
    expected: "شبكة مكتب لاسلكية مزدوجة AP بتغطية موسعة.",
    checks: [
      { label: "Router + Cloud", test: (c) => c.count("Router") >= 1 && c.count("Cloud") >= 1 },
      { label: "نقطتا وصول", test: (c) => c.count("AccessPoint") >= 2 },
      { label: "الراوتر متصل بالإنترنت", test: (c) => c.anyLink("Router", "Cloud") },
      { label: "APs متصلة بالراوتر", test: (c) => c.anyLink("AccessPoint", "Router") },
      { label: "لابتوب للمستخدمين", test: (c) => c.count("Laptop") >= 2 },
    ],
  }),
  lab({
    id: "subnet_plan",
    title: "خطة تقسيم شبكات",
    desc: "قسّم 192.168.1.0/24 إلى شبكتين /26 واربطهما براوترين.",
    objective: "تطبيق Subnetting وتوزيع النطاقات على شبكتين فعليتين.",
    unitId: "unit11-ipv4",
    lessonId: "ipv4-addresses",
    difficulty: "متوسط",
    time: "30 دقيقة",
    xp: 250,
    icon: "✂️",
    objectives: ["أضف راوترين واربطهما معاً", "أضف سويتشاً لكل راوتر", "أضف جهازين في كل شبكة", "وزّع النطاقات /26 بشكل صحيح"],
    hints: ["/26 = قناع 255.255.255.192 و62 جهازاً", "الشبكة الأولى 192.168.1.0 والثانية 192.168.1.64"],
    expected: "شبكتان مقسمتان /26 متصلتان عبر راوترين.",
    checks: [
      { label: "راوتران مترابطان", test: (c) => c.count("Router") >= 2 && c.anyLink("Router", "Router") },
      { label: "سويتش لكل شبكة", test: (c) => c.count("Switch") >= 2 },
      { label: "4 أجهزة (2 لكل شبكة)", test: (c) => c.count("PC") >= 4 },
      { label: "الشبكة مكتملة (6+ عناصر)", test: (c) => c.nodes.length >= 6 },
    ],
  }),
  lab({
    id: "broadcast_boundaries",
    title: "حدود نطاق البث",
    desc: "أظهر كيف يقسم الراوتر نطاق البث: شبكتان ببث منفصل.",
    objective: "التمييز بين نطاق البث ونطاق التصادم عبر أجهزة حقيقية.",
    unitId: "unit11-ipv4",
    lessonId: "ipv4-broadcast-types",
    difficulty: "متوسط",
    time: "20 دقيقة",
    xp: 220,
    icon: "📢",
    objectives: ["أضف راوتراً", "أضف محولين (واحد لكل واجهة)", "أضف جهازين لكل محول", "اختبر البث داخل كل شبكة"],
    hints: ["المحول الواحد نطاق بث واحد", "الراوتر لا يمرر البث بين واجهاته"],
    expected: "راوتر يفصل نطاقي بث مستقلين.",
    checks: [
      { label: "راوتر + محولان", test: (c) => c.count("Router") >= 1 && c.count("Switch") >= 2 },
      { label: "4 أجهزة PC", test: (c) => c.count("PC") >= 4 },
      { label: "الراوتر متصل بالمحولين", test: (c) => c.anyLink("Router", "Switch") },
      { label: "أجهزة متصلة بالمحولات", test: (c) => c.anyLink("PC", "Switch") },
    ],
  }),
  lab({
    id: "tcp_services",
    title: "خدمات TCP للمنشأة",
    desc: "خادم يقدم خدمات موجهة بالاتصال (HTTP/SSH) لثلاثة عملاء.",
    objective: "فهم TCP والاتصال الموجه (Three-Way Handshake) عبر خدمات فعلية.",
    unitId: "unit13-transport",
    lessonId: "tcp-udp",
    difficulty: "متوسط",
    time: "15 دقيقة",
    xp: 210,
    icon: "🤝",
    objectives: ["أضف Server", "أضف سويتشاً و3 أجهزة PC", "اربط الجميع", "افتح جلسة HTTP من عميل للخادم"],
    hints: ["HTTP على المنفذ 80 وSSH على 22 — كلاهما TCP", "الاتصال يبدأ بـ SYN وينتهي بـ ACK"],
    expected: "خادم خدمات متصل بثلاثة عملاء عبر سويتش.",
    checks: [
      { label: "Server موجود", test: (c) => c.count("Server") >= 1 },
      { label: "3 عملاء", test: (c) => c.count("PC") >= 3 },
      { label: "الخادم متصل", test: (c) => c.anyConn("Server") },
      { label: "العملاء متصلون", test: (c) => c.anyLink("PC", "Switch") },
    ],
  }),
  lab({
    id: "app_protocols",
    title: "مزرعة خوادم الخدمات",
    desc: "ثلاثة خوادم (ويب، DHCP/DNS، بريد) يخدمون العملاء عبر سويتش واحد.",
    objective: "تشغيل بروتوكولات طبقة التطبيقات: HTTP وDNS وDHCP وSMTP.",
    unitId: "unit14-application",
    lessonId: "application-protocols",
    difficulty: "متوسط",
    time: "25 دقيقة",
    xp: 240,
    icon: "🏛️",
    objectives: ["أضف 3 خوادم", "أضف سويتشاً وعميلين", "اربط جميع الخوادم", "اختبر DNS وHTTP من عميل"],
    hints: ["DNS يحول الاسم إلى IP قبل HTTP", "DHCP يعمل بـ UDP 67/68", "SMTP لإرسال البريد على 25"],
    expected: "ثلاثة خوادم خدمات متصلة بعملاء عبر سويتش مركزي.",
    checks: [
      { label: "3 خوادم", test: (c) => c.count("Server") >= 3 },
      { label: "سويتش مركزي", test: (c) => c.count("Switch") >= 1 },
      { label: "جميع الخوادم متصلة", test: (c) => c.allConn("Server") },
      { label: "عميلان+", test: (c) => c.count("PC") >= 2 },
    ],
  }),
  lab({
    id: "ssh_hardening",
    title: "تأمين الوصول بـ SSH",
    desc: "جهّز جهاز إدارة يصل للشبكة عبر SSH فقط — بلا Telnet.",
    objective: "تطبيق SSH: مفاتيح RSA ومستخدم محلي وtransport input ssh.",
    unitId: "unit15-advanced-initial",
    lessonId: "advanced-switch-router",
    difficulty: "متوسط",
    time: "20 دقيقة",
    xp: 230,
    icon: "🗝️",
    objectives: ["أضف Router وSwitch وPC إدارة", "اربط الجميع", "فعّل SSH على الراوتر", "اختبر الوصول من الـ PC"],
    hints: ["SSH يحتاج hostname وdomain-name ومفاتيح RSA", "transport input ssh يمنع Telnet", "SSH مشفر على المنفذ 22"],
    expected: "شبكة إدارة يصلها حاسب الإدارة عبر SSH فقط.",
    checks: [
      { label: "Router + Switch + PC", test: (c) => c.count("Router") >= 1 && c.count("Switch") >= 1 && c.count("PC") >= 1 },
      { label: "PC متصل بالسويتش", test: (c) => c.anyLink("PC", "Switch") },
      { label: "السويتش متصل بالراوتر", test: (c) => c.anyLink("Switch", "Router") },
      { label: "الشبكة مكتملة (4+)", test: (c) => c.nodes.length >= 4 },
    ],
  }),
  lab({
    id: "collision_domains",
    title: "نطاقات التصادم والبث",
    desc: "ابنِ شبكة تُظهر: كل منفذ محول نطاق تصادم، وكل واجهة راوتر نطاق بث.",
    objective: "تطبيق الفروق بين تأثير Hub/Switch/Router على النطاقات.",
    unitId: "unit16-switching-concepts",
    lessonId: "switching-concepts",
    difficulty: "متوسط",
    time: "20 دقيقة",
    xp: 220,
    icon: "🚧",
    objectives: ["أضف محولين، جهازين على كل محول", "أضف راوتراً يربط المحولين", "حدد نطاقات التصادم", "اختبر البث في كل قسم"],
    hints: ["كل منفذ سويتش نطاق تصادم مستقل", "الراوتر وحده يقسم نطاق البث", "VLAN تقسيم منطقي لنطاق البث"],
    expected: "شبكة من قسمين بنطاقي بث منفصلين و4 نطاقات تصادم.",
    checks: [
      { label: "محولان", test: (c) => c.count("Switch") >= 2 },
      { label: "4 أجهزة PC", test: (c) => c.count("PC") >= 4 },
      { label: "راوتر يربط القسمين", test: (c) => c.count("Router") >= 1 && c.anyLink("Router", "Switch") },
      { label: "أجهزة متصلة", test: (c) => c.anyLink("PC", "Switch") },
    ],
  }),

  /* ══════════ صعب (Hard) ══════════ */
  lab({
    id: "static_routing",
    title: "إعداد Static Routing",
    desc: "اربط شبكتين مختلفتين عبر راوترين ومسارات ثابتة.",
    objective: "تنفيذ ip route يدوياً بين شبكتين والتحقق بالـ ping.",
    unitId: "unit24-static-routing",
    lessonId: "static-routing",
    difficulty: "صعب",
    time: "30 دقيقة",
    xp: 300,
    icon: "🗺️",
    objectives: ["أضف راوترين واربطهما معاً", "أضف شبكة أجهزة لكل راوتر", "أضف Static Routes بينهما", "اختبر الاتصال بين الشبكتين"],
    hints: ["كل راوتر يحتاج مساراً نحو شبكة الآخر", "ip route [dest] [mask] [next-hop]", "تحقق بـ ping بعد الإعداد"],
    expected: "شبكتان تتواصلان عبر مسارات ثابتة صحيحة.",
    checks: [
      { label: "راوتران مترابطان", test: (c) => c.count("Router") >= 2 && c.anyLink("Router", "Router") },
      { label: "4 أجهزة في الشبكتين", test: (c) => c.count("PC") >= 4 },
      { label: "شبكة متكاملة (6+)", test: (c) => c.nodes.length >= 6 },
      { label: "اتصالات كافية (6+)", test: (c) => c.connections.length >= 6 },
    ],
  }),
  lab({
    id: "routing_chain",
    title: "سلسلة توجيه من ثلاثة راوترات",
    desc: "ثلاثة راوترات على التوالي — حزمة تعبر ثلاث قفزات (Hops).",
    objective: "قراءة جدول التوجيه وتتبع مسار حزمة عبر عدة راوترات.",
    unitId: "unit23-routing-how",
    lessonId: "routing-table",
    difficulty: "صعب",
    time: "35 دقيقة",
    xp: 320,
    icon: "⛓️",
    objectives: ["أضف 3 راوترات على التوالي واربطها", "أضف شبكة أجهزة في طرفي السلسلة", "اضبط مسارات السلسلة", "تتبع الحزمة Traceroute"],
    hints: ["كل قفزة تعني تغيير MAC مع بقاء IP", "AD للمسار الثابت = 1", "ping من الطرف للطرف هو الاختبار النهائي"],
    expected: "سلسلة ثلاثية القفزات توصل شبكتي الطرفين.",
    checks: [
      { label: "3 راوترات", test: (c) => c.count("Router") >= 3 },
      { label: "الراوترات مترابطة تسلسلياً", test: (c) => c.anyLink("Router", "Router") },
      { label: "أجهزة في طرفي السلسلة", test: (c) => c.count("PC") >= 2 },
      { label: "الشبكة مكتملة (6+)", test: (c) => c.nodes.length >= 6 },
    ],
  }),
  lab({
    id: "floating_backup",
    title: "مسار احتياطي Floating Static",
    desc: "مسار أساسي ومسار احتياطي بـ AD أعلى بين راوترين.",
    objective: "فهم تفضيل المسارات عبر Administrative Distance والتعافي عند الفشل.",
    unitId: "unit24-static-routing",
    lessonId: "static-routing",
    difficulty: "صعب",
    time: "30 دقيقة",
    xp: 330,
    icon: "🪜",
    objectives: ["أضف راوترين", "اربط بينهما برابطين (أساسي + احتياطي)", "أضف أجهزة لكل راوتر", "اضبط المسار الاحتياطي بـ AD 200"],
    hints: ["المسار ذو AD الأقل يفوز", "AD 200 يُستخدم فقط عند فشل الأساسي", "ارابطان فيزيائيان بين الراوترين"],
    expected: "راوتران برابطين: أساسي نشط واحتياطي صامت.",
    checks: [
      { label: "راوتران", test: (c) => c.count("Router") >= 2 },
      { label: "رابطان بينهما", test: (c) => {
          const rs = c.of("Router");
          return rs.length >= 2 && c.connections.filter((conn) =>
            rs.some((r) => r.id === conn.from) && rs.some((r) => r.id === conn.to)
          ).length >= 2;
        } },
      { label: "أجهزة على الجانبين", test: (c) => c.count("PC") >= 2 },
    ],
  }),
  lab({
    id: "ospf_area",
    title: "منطقة OSPF واحدة",
    desc: "ثلاثة راوترات في Area 0 بجيران Full وRouter-IDs ثابتة.",
    objective: "إعداد OSPFv2: network بـ wildcard وpassive-interface وجيران Full.",
    unitId: "unit25-ospf",
    lessonId: "ospf",
    difficulty: "صعب",
    time: "40 دقيقة",
    xp: 350,
    icon: "🕸️",
    objectives: ["أضف 3 راوترات", "اربطها بشكل كامل (Full Mesh)", "فعّل OSPF على الواجهات", "تحقق من الجيران Full"],
    hints: ["Router-ID يفضل أعلى Loopback", "Wildcard عكس القناع: /24 → 0.0.0.255", "show ip ospf neighbor للتحقق"],
    expected: "جيران OSPF بحالة Full بين ثلاثة راوترات.",
    checks: [
      { label: "3 راوترات", test: (c) => c.count("Router") >= 3 },
      { label: "روابط كافية (3+)", test: (c) => {
          const rs = c.of("Router");
          return c.connections.filter((conn) =>
            rs.some((r) => r.id === conn.from) && rs.some((r) => r.id === conn.to)
          ).length >= 3;
        } },
      { label: "أجهزة نهائية متصلة", test: (c) => c.count("PC") >= 2 && c.anyLink("PC", "Switch") },
      { label: "سويتشات للتوزيع", test: (c) => c.count("Switch") >= 1 },
    ],
  }),
  lab({
    id: "redundant_network",
    title: "شبكة Redundant عالية الإتاحة",
    desc: "صمّم شبكة بمسارات احتياطية تضمن عدم انقطاع الخدمة.",
    objective: "تطبيق التكرار: مسارات متعددة مع STP وOSPF للتعافي التلقائي.",
    unitId: "unit25-ospf",
    lessonId: "ospf",
    difficulty: "صعب",
    time: "35 دقيقة",
    xp: 340,
    icon: "♻️",
    objectives: ["أضف راوترين واربطهما (مسار احتياطي)", "أضف محولين+", "وفر أكثر من مسار بين الأجهزة", "تحقق من التعافي التلقائي"],
    hints: ["التكرار = مساران لنفس الوجهة", "STP يمنع الحلقات في المحولات", "OSPF يعيد التوجيه تلقائياً عند الفشل"],
    expected: "شبكة بمسارات متعددة تتعدى عدد العقد.",
    checks: [
      { label: "راوتران مترابطان", test: (c) => c.count("Router") >= 2 && c.anyLink("Router", "Router") },
      { label: "محولان+", test: (c) => c.count("Switch") >= 2 },
      { label: "مسارات متعددة", test: (c) => c.connections.length > c.nodes.length },
      { label: "أجهزة متصلة", test: (c) => c.count("PC") >= 2 },
    ],
  }),
  lab({
    id: "acl_standard",
    title: "قائمة ACL قياسية",
    desc: "امنع شبكة من الوصول لأخرى مع السماح للباقي — قرب الوجهة.",
    objective: "تطبيق Standard ACL بالـ wildcard وترتيب القواعد وimplicit deny.",
    unitId: "unit26-acl",
    lessonId: "standard-acl-1",
    difficulty: "صعب",
    time: "30 دقيقة",
    xp: 320,
    icon: "🚫",
    objectives: ["أضف راوتراً بين شبكتين", "محول وPC لكل شبكة", "طبّق قائمة ترشح حسب المصدر", "تحقق من المنع والسماح"],
    hints: ["Standard ACL ترشح المصدر فقط", "توضع قرب الوجهة", "كل قائمة تنتهي ضمنياً بـ deny any"],
    expected: "شبكة مصدر ممنوعة من شبكة الوجهة والباقي مسموح.",
    checks: [
      { label: "راوتر بين الشبكتين", test: (c) => c.count("Router") >= 1 },
      { label: "محولان", test: (c) => c.count("Switch") >= 2 },
      { label: "أجهزة في الشبكتين", test: (c) => c.count("PC") >= 2 },
      { label: "الراوتر متصل بالمحولين", test: (c) => c.anyLink("Router", "Switch") },
    ],
  }),
  lab({
    id: "firewall_acl",
    title: "إعداد Firewall وACL",
    desc: "احمِ الشبكة الداخلية من الوصول الخارجي غير المصرح به.",
    objective: "تطبيق Extended ACL: مصدر + وجهة + بروتوكول ومنفذ.",
    unitId: "unit26-acl",
    lessonId: "standard-acl-2",
    difficulty: "صعب",
    time: "40 دقيقة",
    xp: 350,
    icon: "🛡️",
    template: {
      nodes: [N("firewall_acl-cloud", "Cloud", "Internet", 640, 280), N("firewall_acl-sw", "Switch", "SW1", 380, 280)],
      connections: [],
    },
    objectives: ["أضف Firewall بين الداخل والخارج", "وصّله بالشبكتين", "اضبط قواعد المنع والسماح", "اختبر القواعد"],
    hints: ["الـ Firewall يوضع بين الشبكتين", "Extended ACL قرب المصدر", "لا تنسَ قاعدة permit للسماح المتبقي"],
    expected: "جدار ناري بين شبكتين بقواعد ترشيح فعالة.",
    checks: [
      { label: "Firewall موجود", test: (c) => c.count("Firewall") >= 1 },
      { label: "Firewall متصل بشبكتين", test: (c) => {
          const fws = c.of("Firewall");
          return fws.length > 0 && fws.every((f) => c.deg(f.id) >= 2 || fws.some((f2) => c.deg(f2.id) >= 2));
        } },
      { label: "شبكة داخلية (Switch)", test: (c) => c.count("Switch") >= 1 },
      { label: "شبكة كاملة (4+)", test: (c) => c.nodes.length >= 4 },
    ],
  }),
  lab({
    id: "nat_static",
    title: "NAT ثابت للخادم العام",
    desc: "خادم داخلي يحتاج عنواناً عاماً ثابتاً 1:1 عبر الراوتر.",
    objective: "تنفيذ Static NAT: inside/outside وتحويل عنوان واحد ثابت.",
    unitId: "unit27-nat",
    lessonId: "nat",
    difficulty: "صعب",
    time: "30 دقيقة",
    xp: 330,
    icon: "🔄",
    objectives: ["أضف خادماً داخلياً وسويتشاً", "أضف راوتر NAT بين الداخل والخارج", "اربط الخارج بـ Cloud", "اضبط inside/outside"],
    hints: ["ip nat inside على واجهة الشبكة الداخلية", "outside على واجهة الإنترنت", "show ip nat translations للتحقق"],
    expected: "خادم داخلي يظهر للعالم بعنوان عام ثابت.",
    checks: [
      { label: "راوتر NAT", test: (c) => c.count("Router") >= 1 },
      { label: "خادم داخلي متصل", test: (c) => c.count("Server") >= 1 && c.anyConn("Server") },
      { label: "خارج (Cloud) متصل بالراوتر", test: (c) => c.anyLink("Router", "Cloud") },
      { label: "شبكة داخلية (Switch)", test: (c) => c.count("Switch") >= 1 },
    ],
  }),

  /* ══════════ متقدم (Advanced) ══════════ */
  lab({
    id: "pat_overload",
    title: "PAT — NAT Overload",
    desc: "مئات الأجهزة تشارك عنواناً عاماً واحداً عبر أرقام المنافذ.",
    objective: "تنفيذ PAT الكامل: قائمة وصول وpool عبر واجهة الخروج overload.",
    unitId: "unit27-nat",
    lessonId: "pat",
    difficulty: "متقدم",
    time: "40 دقيقة",
    xp: 420,
    icon: "🧵",
    objectives: ["أضف سويتشاً و3 أجهزة داخلية", "أضف راوتر PAT", "اربط الراوتر بالإنترنت (Cloud)", "فعّل overload على واجهة الخروج"],
    hints: ["عنوان واحد يكفي كل الشبكة عبر المنافذ", "access-list تحدد الأجهزة المسموحة", "interface overload بدل الـ pool"],
    expected: "شبكة كاملة تخرج للإنترنت بعنوان عام واحد.",
    checks: [
      { label: "راوتر PAT متصل بالإنترنت", test: (c) => c.count("Router") >= 1 && c.anyLink("Router", "Cloud") },
      { label: "3 أجهزة داخلية", test: (c) => c.count("PC") >= 3 },
      { label: "الشبكة الداخلية متصلة", test: (c) => c.anyLink("PC", "Switch") },
      { label: "الشبكة مكتملة (6+)", test: (c) => c.nodes.length >= 6 },
    ],
  }),
  lab({
    id: "dmz_setup",
    title: "إعداد DMZ للسيرفرات",
    desc: "منطقة DMZ آمنة للخوادم العامة مع عزل الشبكة الداخلية.",
    objective: "تصميم ثلاثي المناطق: إنترنت وDMZ وداخل — عبر جدار ناري.",
    unitId: "unit26-acl",
    lessonId: "standard-acl-2",
    difficulty: "متقدم",
    time: "45 دقيقة",
    xp: 430,
    icon: "🔒",
    objectives: ["أضف Firewall مركزياً", "أضف خادمين في DMZ", "أضف شبكة داخلية (Switch + PC)", "اربط الـ Firewall بالإنترنت", "اعزل الداخل عن الخارج"],
    hints: ["DMZ بين الـ Firewall والإنترنت", "خوادم DMZ يصلها الإنترنت ولا تصل الشبكة الداخلية", "3 نقاط اتصال على الأقل للجدار"],
    expected: "جدار ناري ثلاثي المناطق مع خادمي DMZ وشبكة داخلية معزولة.",
    checks: [
      { label: "Firewall مركزي", test: (c) => c.count("Firewall") >= 1 },
      { label: "Firewall متصل بـ3 شبكات", test: (c) => {
          const fws = c.of("Firewall");
          return fws.length > 0 && fws.some((f) => c.deg(f.id) >= 3);
        } },
      { label: "خادمان في DMZ", test: (c) => c.count("Server") >= 2 },
      { label: "شبكة داخلية (PC)", test: (c) => c.count("PC") >= 1 },
      { label: "اتصال بالإنترنت (Cloud)", test: (c) => c.count("Cloud") >= 1 },
    ],
  }),
  lab({
    id: "backbone_network",
    title: "شبكة Backbone للمؤسسة",
    desc: "بنية هرمية كاملة: Core → Distribution → Access لشركة متعددة الأدوار.",
    objective: "تصميم البنية الهرمية الثلاثية الطبقات لمؤسسة كبيرة.",
    unitId: "unit23-routing-how",
    lessonId: "routing-table",
    difficulty: "متقدم",
    time: "50 دقيقة",
    xp: 460,
    icon: "🏢",
    objectives: ["أضف Core Router", "أضف 3 محولات توزيع", "وزّع 6 أجهزة عليها", "أضف خادماً مركزياً", "اربط الهيكل كاملاً"],
    hints: ["Core → Distribution → Access هرمياً", "كل محول توزيع يخدم مجموعة أجهزة", "الراوتر المركزي يربط كل شيء"],
    expected: "هيكل مؤسسي هرمي متصل بالكامل مع خادم مركزي.",
    checks: [
      { label: "Core Router", test: (c) => c.count("Router") >= 1 },
      { label: "3 محولات توزيع", test: (c) => c.count("Switch") >= 3 },
      { label: "6 أجهزة+", test: (c) => c.count("PC") >= 6 },
      { label: "خادم مركزي", test: (c) => c.count("Server") >= 1 },
      { label: "الراوتر متصل بالمحولات", test: (c) => c.anyLink("Router", "Switch") },
    ],
  }),
  lab({
    id: "enterprise_fortress",
    title: "قلعة المؤسسة الشاملة",
    desc: "دمج كل ما تعلمته: NAT + DMZ + ACL + هيكل هرمي بشبكة واحدة محصّنة.",
    objective: "التصميم الأمني الشامل: جدار، مناطق، ترجمة عناوين وتوزيع هرمي.",
    unitId: "unit27-nat",
    lessonId: "pat",
    difficulty: "متقدم",
    time: "60 دقيقة",
    xp: 500,
    icon: "🏰",
    objectives: ["أضف Firewall وراوتر NAT", "خوادم في DMZ", "شبكة داخلية هرمية (سويتشان+4 أجهزة)", "اربط الجميع بالإنترنت (Cloud)", "طبّق قواعد ACL على الحدود"],
    hints: ["ابدأ من الخارج: Cloud → Firewall → داخل", "DMZ للخدمات العامة فقط", "كل منطقة نطاق عناوين مستقل"],
    expected: "شبكة مؤسسية محصّنة كاملة المناطق والقواعد.",
    checks: [
      { label: "Firewall + Router معاً", test: (c) => c.count("Firewall") >= 1 && c.count("Router") >= 1 },
      { label: "خوادم DMZ", test: (c) => c.count("Server") >= 2 },
      { label: "شبكة داخلية (سويتشان)", test: (c) => c.count("Switch") >= 2 },
      { label: "4 أجهزة+", test: (c) => c.count("PC") >= 4 },
      { label: "اتصال بالإنترنت (Cloud)", test: (c) => c.anyLink("Router", "Cloud") || c.anyLink("Firewall", "Cloud") },
    ],
  }),
]);

/* ─────────── ترتيب ومراجع ─────────── */

export const SORTED_SCENARIOS = [...SCENARIOS].sort(
  (a, b) => (DIFF_ORDER[a.difficulty] ?? 9) - (DIFF_ORDER[b.difficulty] ?? 9)
);

export const TOTAL_SCENARIOS = SCENARIOS.length;

export function getScenarioById(id) {
  return SCENARIOS.find((s) => s.id === id) || null;
}

/** معلومات الدرس والوحدة المرتبطين بسيناريو */
export function getLessonInfo(lessonId) {
  for (const unit of courseData) {
    const topic = unit.topics?.find((t) => t.id === lessonId);
    if (topic) {
      return { lessonId, lessonTitle: topic.title, unitId: unit.id, unitTitle: unit.title };
    }
  }
  return null;
}