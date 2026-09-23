import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Sparkles } from "lucide-react";
import { base44 } from "@/api/base44Client";
import ReactMarkdown from "react-markdown";
import { t, useLang, getLang } from "@/lib/i18n";

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
  useLang();
  const lang = getLang();
  const [messages, setMessages] = useState(() => loadMemory());
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const networkContext = `${t("simAiContextDevices")} ${nodes.length} ${t("simAiContextDevice")}:
${nodes.map((n) => `- ${n.type} "${n.label}" IP: ${n.ip || t("simAiContextUnset")}`).join("\n")}
${t("simAiContextConnections")}: ${connections.length}`;

  const suggestions = [
    t("simAiSuggestion1"),
    t("simAiSuggestion2"),
    t("simAiSuggestion3"),
    t("simAiSuggestion4"),
  ];

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: "user", content: input.trim() };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput("");
    setLoading(true);

    const historyText = messages
      .slice(-6)
      .map((m) => `${m.role === "user" ? t("simAiRoleUser") : t("simAiRoleAssistant")}: ${m.content}`)
      .join("\n");

    const prompt = `${t("simAiPromptRole")}

${t("simAiPromptContext")}:
${networkContext}

${t("simAiPromptHistory")}:
${historyText}

${t("simAiPromptQuestion")}: ${userMsg.content}

${t("simAiPromptInstruction")}`;

    try {
      const response = await base44.integrations.Core.InvokeLLM({ prompt });
      const assistantMsg = { role: "assistant", content: response };
      const updated = [...history, assistantMsg];
      setMessages(updated);
      saveMemory(updated);
    } catch {
      const errMsg = {
        role: "assistant",
        content: t("simAiError"),
      };
      setMessages([...history, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      className="absolute bottom-4 right-4 w-80 z-50 rounded-2xl overflow-hidden flex flex-col"
      style={{
        background: "#FFFFFF",
        border: "1px solid #E2E8F0",
        boxShadow: "0 12px 32px rgba(23,63,95,0.18)",
        height: "420px",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b flex-shrink-0"
        style={{ borderColor: "#E2E8F0" }}
      >
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "#173F5F" }}>
            <Sparkles size={13} className="text-white" />
          </div>
          <div>
            <span className="font-bold text-xs" style={{ color: "#173F5F" }}>{t("simAiTitle")}</span>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#2E7D5B" }} />
              <span className="text-[9px] text-success">{t("simAiOnline")}</span>
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-destructive transition-colors"
        >
          <X size={14} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
        {messages.length === 0 && (
          <div className="text-center py-4">
            <div className="text-muted-foreground text-xs mb-3">{t("simAiEmpty")}</div>
            <div className="space-y-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => setInput(s)}
                  className="block w-full text-right text-xs px-3 py-2 rounded-lg bg-secondary/10 text-secondary border border-secondary/20 hover:bg-secondary/20 transition-colors"
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
                  ? "bg-secondary/15 text-foreground border border-secondary/30"
                  : "bg-muted text-foreground border border-border"
              }`}
            >
              {msg.role === "assistant" ? (
                <ReactMarkdown className="prose prose-xs max-w-none [&>*]:text-xs [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
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
            <div className="bg-muted border border-border rounded-xl px-3 py-2">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-secondary animate-bounce"
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
        style={{ borderColor: "#E2E8F0" }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder={t("simAiPlaceholder")}
          className="flex-1 bg-muted border border-border rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-secondary"
          dir={lang === "en" ? "ltr" : "rtl"}
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-all disabled:opacity-40 hover:scale-105"
          style={{ background: "#173F5F" }}
        >
          <Send size={13} className="text-white" />
        </button>
      </div>
    </motion.div>
  );
}