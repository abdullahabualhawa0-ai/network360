import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, Zap, Target, Clock, Star, CheckCircle2,
  AlertCircle, Play, RefreshCw, Bot, Trophy, BookOpen
} from "lucide-react";
import { base44 } from "@/api/base44Client";

const STORAGE_KEY = "scenario-progress";

const SCENARIOS = [
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
      const score = Math.min(
        100,
        switches.length * 20 + pcs.length * 15 + connections.length * 10
      );
      const passed = score >= 60;
      return {
        score,
        passed,
        feedback: passed
          ? "أحسنت! تم إعداد البنية الأساسية بنجاح."
          : "تحتاج إلى إضافة سويتش وربط الأجهزة بشكل صحيح.",
        details: [
          { label: "سويتش موجود", ok: switches.length > 0 },
          { label: "4 أجهزة PC أو أكثر", ok: pcs.length >= 4 },
          { label: "اتصالات كافية", ok: connections.length >= 4 },
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
      const serverConnected = servers.some((s) =>
        connections.some((c) => c.from === s.id || c.to === s.id)
      );
      const score = Math.min(
        100,
        servers.length * 30 + switches.length * 20 + (serverConnected ? 40 : 0)
      );
      const passed = score >= 70;
      return {
        score,
        passed,
        feedback: passed
          ? "ممتاز! السيرفر متصل ويمكنه توزيع الـ IPs."
          : "تأكد من وجود سيرفر متصل بالشبكة.",
        details: [
          { label: "سيرفر DHCP موجود", ok: servers.length > 0 },
          { label: "السيرفر متصل بالشبكة", ok: serverConnected },
          { label: "سويتش للتوزيع", ok: switches.length > 0 },
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
      const score = Math.min(
        100,
        routers.length * 25 + (routerConnected ? 40 : 0) + connections.length * 5
      );
      const passed = score >= 65;
      return {
        score,
        passed,
        feedback: passed
          ? "رائع! الراوترات مترابطة وجاهزة للتوجيه."
          : "تحتاج راوترين متصلين على الأقل.",
        details: [
          { label: "راوترين على الأقل", ok: routers.length >= 2 },
          { label: "الراوترات مترابطة", ok: routerConnected },
          { label: "شبكة كافية", ok: nodes.length >= 5 },
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
      const score = Math.min(
        100,
        firewalls.length * 40 + (fwConnected ? 50 : 0) + (nodes.length >= 4 ? 10 : 0)
      );
      const passed = score >= 70;
      return {
        score,
        passed,
        feedback: passed
          ? "عالي! الـ Firewall في موقعه الصحيح."
          : "ضع الـ Firewall بين شبكتين ووصّله بكليهما.",
        details: [
          { label: "Firewall موجود", ok: firewalls.length > 0 },
          { label: "Firewall متصل بشبكتين", ok: fwConnected },
          { label: "شبكة كاملة", ok: nodes.length >= 4 },
        ],
      };
    },
  },
];

function loadProgress() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

export default function ScenarioLab() {
  const [selected, setSelected] = useState(null);
  const [result, setResult] = useState(null);
  const [showHints, setShowHints] = useState(false);
  const [aiTip, setAiTip] = useState("");
  const [loadingTip, setLoadingTip] = useState(false);
  const [progress, setProgress] = useState(loadProgress);

  // Load current network from simulator
  const getSimNetwork = () => {
    try {
      const s = JSON.parse(localStorage.getItem("network-simulator-state") || "{}");
      return { nodes: s.nodes || [], connections: s.connections || [] };
    } catch {
      return { nodes: [], connections: [] };
    }
  };

  const evaluate = () => {
    if (!selected) return;
    const { nodes, connections } = getSimNetwork();
    const res = selected.eval(nodes, connections);
    setResult(res);
    if (res.passed) {
      const prog = { ...progress, [selected.id]: { score: res.score, completedAt: new Date().toISOString() } };
      setProgress(prog);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prog));
    }
  };

  const getAiTip = async () => {
    if (!selected) return;
    setLoadingTip(true);
    setAiTip("");
    try {
      const { nodes, connections } = getSimNetwork();
      const prompt = `أنا طالب أحاول إكمال سيناريو: "${selected.title}".
الأهداف: ${selected.objectives.join(", ")}
شبكتي الحالية: ${nodes.length} جهاز، ${connections.length} اتصال.
الأجهزة: ${nodes.map((n) => `${n.type}(${n.label})`).join(", ")}

أعطني تلميحاً واحداً مفيداً بدون إفساد الحل كاملاً. جملتين فقط بالعربية.`;
      const tip = await base44.integrations.Core.InvokeLLM({ prompt });
      setAiTip(tip);
    } catch {
      setAiTip("تعذر الاتصال بالمساعد. تحقق من الاتصال.");
    } finally {
      setLoadingTip(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: "#020617" }}>
      {/* Header */}
      <div
        className="relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #0d1117 0%, #1a0533 50%, #0d1117 100%)",
          borderBottom: "1px solid rgba(139,92,246,0.3)",
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(139,92,246,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(139,92,246,0.05) 1px,transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="relative max-w-6xl mx-auto px-6 py-10">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-2 mb-2" style={{ color: "rgba(139,92,246,0.7)" }}>
              <Link to="/" className="hover:text-purple-300 transition-colors text-sm">
                الرئيسية
              </Link>
              <ChevronLeft size={13} />
              <span className="text-purple-300 text-sm">Scenario Lab</span>
            </div>
            <h1
              className="text-3xl font-black mb-1"
              style={{
                background: "linear-gradient(135deg,#a78bfa,#06b6d4)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              🧪 مختبر السيناريوهات
            </h1>
            <p className="text-slate-400 text-sm">
              سيناريوهات عملية حقيقية — نفّذها على محاكي الشبكة واحصل على تقييم فوري
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {!selected ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
            {SCENARIOS.map((sc, i) => {
              const done = progress[sc.id];
              return (
                <motion.div
                  key={sc.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="rounded-2xl p-6 cursor-pointer transition-all hover:scale-[1.02] group"
                  style={{
                    background: "rgba(15,23,42,0.8)",
                    border: done
                      ? "1px solid rgba(34,197,94,0.4)"
                      : "1px solid rgba(139,92,246,0.2)",
                    backdropFilter: "blur(10px)",
                  }}
                  onClick={() => { setSelected(sc); setResult(null); setAiTip(""); setShowHints(false); }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-3xl">{sc.icon}</span>
                    <div className="flex items-center gap-2">
                      {done && (
                        <span className="text-[10px] bg-green-400/10 text-green-400 border border-green-400/30 px-2 py-0.5 rounded-full font-bold">
                          ✓ {done.score}%
                        </span>
                      )}
                      <span className={`text-[10px] border px-2 py-0.5 rounded-full font-bold ${sc.diffColor}`}>
                        {sc.difficulty}
                      </span>
                    </div>
                  </div>
                  <h3 className="font-black text-white mb-1">{sc.title}</h3>
                  <p className="text-slate-400 text-sm mb-4 leading-relaxed">{sc.desc}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock size={12} /> {sc.time}
                      </span>
                      <span className="flex items-center gap-1">
                        <Zap size={12} className="text-yellow-400" /> {sc.xp} XP
                      </span>
                    </div>
                    <button className="text-xs font-bold text-purple-400 group-hover:text-purple-300 transition-colors flex items-center gap-1">
                      <Play size={12} /> ابدأ
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="max-w-2xl mx-auto">
            <button
              onClick={() => { setSelected(null); setResult(null); }}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 text-sm"
            >
              <ChevronLeft size={16} /> العودة للسيناريوهات
            </button>

            <div
              className="rounded-2xl p-6 mb-4"
              style={{
                background: "rgba(15,23,42,0.9)",
                border: "1px solid rgba(139,92,246,0.3)",
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl">{selected.icon}</span>
                <div>
                  <h2 className="text-xl font-black text-white">{selected.title}</h2>
                  <span className={`text-[10px] border px-2 py-0.5 rounded-full font-bold ${selected.diffColor}`}>
                    {selected.difficulty} • {selected.time} • {selected.xp} XP
                  </span>
                </div>
              </div>
              <p className="text-slate-300 text-sm mb-5">{selected.desc}</p>

              {/* Objectives */}
              <div className="mb-4">
                <h3 className="text-xs font-bold text-cyan-400 mb-2 uppercase tracking-wider">الأهداف</h3>
                <ul className="space-y-2">
                  {selected.objectives.map((obj, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                      <span className="text-purple-400 mt-0.5 flex-shrink-0">◆</span>
                      {obj}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2 mt-4">
                <Link
                  to="/network-simulator"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all hover:scale-105"
                  style={{ background: "linear-gradient(135deg,#7c3aed,#06b6d4)" }}
                >
                  <Play size={14} /> افتح المحاكي
                </Link>
                <button
                  onClick={evaluate}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all hover:scale-105"
                  style={{ background: "linear-gradient(135deg,#059669,#10b981)" }}
                >
                  <Target size={14} /> تقييم الحل
                </button>
                <button
                  onClick={() => setShowHints(!showHints)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-amber-300 transition-all"
                  style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)" }}
                >
                  💡 تلميحات
                </button>
                <button
                  onClick={getAiTip}
                  disabled={loadingTip}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-purple-300 transition-all"
                  style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.3)" }}
                >
                  <Bot size={14} /> {loadingTip ? "جاري التفكير..." : "تلميح AI"}
                </button>
              </div>
            </div>

            {/* Hints */}
            <AnimatePresence>
              {showHints && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="rounded-2xl p-5 mb-4 overflow-hidden"
                  style={{ background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.3)" }}
                >
                  <h3 className="text-amber-400 font-bold text-sm mb-3">💡 تلميحات</h3>
                  <ul className="space-y-2">
                    {selected.hints.map((h, i) => (
                      <li key={i} className="text-amber-200 text-sm flex items-start gap-2">
                        <span className="text-amber-500 flex-shrink-0">•</span> {h}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>

            {/* AI Tip */}
            <AnimatePresence>
              {aiTip && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="rounded-2xl p-5 mb-4"
                  style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.3)" }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Bot size={14} className="text-purple-400" />
                    <h3 className="text-purple-400 font-bold text-sm">تلميح المساعد الذكي</h3>
                  </div>
                  <p className="text-slate-200 text-sm leading-relaxed">{aiTip}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Result */}
            <AnimatePresence>
              {result && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-2xl p-6"
                  style={{
                    background: result.passed
                      ? "rgba(34,197,94,0.08)"
                      : "rgba(239,68,68,0.08)",
                    border: `1px solid ${result.passed ? "rgba(34,197,94,0.4)" : "rgba(239,68,68,0.4)"}`,
                  }}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-black"
                      style={{
                        background: result.passed
                          ? "linear-gradient(135deg,#059669,#34d399)"
                          : "linear-gradient(135deg,#dc2626,#ef4444)",
                        color: "white",
                      }}
                    >
                      {result.score}%
                    </div>
                    <div>
                      <h3
                        className="text-lg font-black"
                        style={{ color: result.passed ? "#34d399" : "#f87171" }}
                      >
                        {result.passed ? "🎉 ممتاز! اجتزت السيناريو" : "❌ لم تجتز السيناريو"}
                      </h3>
                      <p className="text-slate-300 text-sm">{result.feedback}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {result.details.map((d, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        {d.ok ? (
                          <CheckCircle2 size={14} className="text-green-400 flex-shrink-0" />
                        ) : (
                          <AlertCircle size={14} className="text-red-400 flex-shrink-0" />
                        )}
                        <span style={{ color: d.ok ? "#86efac" : "#fca5a5" }}>{d.label}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}