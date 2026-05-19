import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, X, Send, Sparkles, ChevronDown } from "lucide-react";
import { base44 } from "@/api/base44Client";
import ReactMarkdown from "react-markdown";

const MEMORY_KEY = "net-ai-memory";

function loadMemory() {
  try {
    return JSON.parse(localStorage.getItem(MEMORY_KEY) || "[]");
  } catch {
    return [];
  }
}
function saveMemory(msgs) {
  try {
    localStorage.setItem(MEMORY_KEY, JSON.stringify(msgs.slice(-30)));
  } catch {}
}

export default function AIAssistant({ nodes, connections, onClose }) {
  const [messages, setMessages] = useState(() => loadMemory());
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const networkContext = `
الشبكة الحالية تحتوي على ${nodes.length} جهاز:
${nodes.map((n) => `- ${n.type} "${n.label}" IP: ${n.ip || "غير محدد"}`).join("\n")}
عدد الاتصالات: ${connections.length}
  `.trim();

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: "user", content: input.trim() };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput("");
    setLoading(true);

    const historyText = messages
      .slice(-6)
      .map((m) => `${m.role === "user" ? "المستخدم" : "المساعد"}: ${m.content}`)
      .join("\n");

    const prompt = `أنت مساعد ذكي متخصص في شبكات الحاسوب (CCNA level).
تساعد الطلاب بشرح المفاهيم، تشخيص الأخطاء، واقتراح الحلول.
أجب باللغة العربية دائماً بشكل واضح ومختصر.

سياق الشبكة الحالية:
${networkContext}

سجل المحادثة:
${historyText}

سؤال الطالب: ${userMsg.content}

أجب بشكل تعليمي، استخدم أمثلة عملية عند الحاجة.`;

    try {
      const response = await base44.integrations.Core.InvokeLLM({ prompt });
      const assistantMsg = { role: "assistant", content: response };
      const updated = [...history, assistantMsg];
      setMessages(updated);
      saveMemory(updated);
    } catch {
      const errMsg = {
        role: "assistant",
        content: "عذراً، حدث خطأ. حاول مرة أخرى.",
      };
      setMessages([...history, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  const suggestions = [
    "ما الفرق بين Router و Switch؟",
    "كيف أعرّف VLAN؟",
    "ما هو DHCP؟",
    "لماذا فشل الـ Ping؟",
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      className="absolute bottom-4 right-4 w-80 z-50 rounded-2xl overflow-hidden flex flex-col"
      style={{
        background: "rgba(2,6,23,0.97)",
        border: "1px solid rgba(139,92,246,0.4)",
        backdropFilter: "blur(20px)",
        boxShadow: "0 0 40px rgba(139,92,246,0.15)",
        height: "420px",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b flex-shrink-0"
        style={{ borderColor: "rgba(139,92,246,0.2)" }}
      >
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
            <Sparkles size={13} className="text-white" />
          </div>
          <div>
            <span className="text-white font-bold text-xs">مساعد الشبكات</span>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-green-400 text-[9px]">متصل</span>
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-slate-500 hover:text-red-400 transition-colors"
        >
          <X size={14} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
        {messages.length === 0 && (
          <div className="text-center py-4">
            <div className="text-slate-500 text-xs mb-3">اسألني عن شبكتك أو أي مفهوم</div>
            <div className="space-y-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => setInput(s)}
                  className="block w-full text-right text-xs px-3 py-2 rounded-lg bg-purple-500/10 text-purple-300 border border-purple-500/20 hover:bg-purple-500/20 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[90%] rounded-xl px-3 py-2 text-xs ${
                msg.role === "user"
                  ? "bg-purple-500/20 text-purple-100 border border-purple-500/30"
                  : "bg-slate-800/80 text-slate-200 border border-slate-700/50"
              }`}
            >
              {msg.role === "assistant" ? (
                <ReactMarkdown className="prose prose-xs prose-invert max-w-none [&>*]:text-xs [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                  {msg.content}
                </ReactMarkdown>
              ) : (
                msg.content
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-800/80 border border-slate-700/50 rounded-xl px-3 py-2">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div
        className="px-3 py-3 border-t flex gap-2 flex-shrink-0"
        style={{ borderColor: "rgba(139,92,246,0.2)" }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="اسأل عن الشبكات..."
          className="flex-1 bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500/50"
          dir="rtl"
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center transition-all disabled:opacity-40 hover:scale-105"
        >
          <Send size={13} className="text-white" />
        </button>
      </div>
    </motion.div>
  );
}