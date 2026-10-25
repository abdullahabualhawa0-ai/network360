import { useState, useRef, useEffect } from "react";
import { Bot, Send, X, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { base44 } from "@/api/base44Client";
import { t, useLang, getLang } from "@/lib/i18n";

export default function AIAssistant({ nodes, connections, onClose }) {
  useLang();
  const lang = getLang();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  const suggestions = [
    t("simAiSug1"),
    t("simAiSug2"),
    t("simAiSug3"),
    t("simAiSug4"),
  ];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const buildContext = () => {
    const topology = {
      devicesCount: nodes.length,
      linksCount: connections.length,
      devices: nodes.map((n) => ({
        type: n.type,
        label: n.label,
        ip: n.ip || "none",
        subnet: n.subnet || "none",
        gateway: n.gateway || "none",
      })),
      links: connections.map((c) => ({
        from: nodes.find((n) => n.id === c.from)?.label || c.from,
        to: nodes.find((n) => n.id === c.to)?.label || c.to,
        cable: c.cableType || "ethernet",
      })),
    };
    return JSON.stringify(topology, null, 2);
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userText = input.trim();
    setInput("");
    const newMsg = { role: "user", content: userText };
    const history = [...messages, newMsg];
    setMessages(history);
    setLoading(true);

    try {
      const prompt = `You are a friendly, expert computer network instructor teaching students in an interactive network simulation lab.
Current simulation topology state:
${buildContext()}

Language: ${lang === "en" ? "English" : lang === "he" ? "Hebrew" : "Arabic"} (reply in this language).
Keep your response concise, educational, encouraging, and clear. Help the student fix misconfigurations or understand routing/switching principles.

Student Question:
${userText}`;

      const res = await base44.integrations.Core.InvokeLLM({ prompt });
      const reply = typeof res === "string" ? res : res?.output || res?.result || t("simAiDefaultReply");
      setMessages([...history, { role: "assistant", content: reply }]);
    } catch {
      setMessages([...history, { role: "assistant", content: t("simAiErrorReply") }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      className="absolute bottom-4 right-4 w-80 z-50 rounded-[16px] overflow-hidden flex flex-col bg-card text-card-foreground border border-border shadow-card"
      style={{ height: "420px" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-[8px] flex items-center justify-center bg-primary text-primary-foreground">
            <Sparkles size={14} />
          </div>
          <div>
            <span className="font-bold text-xs text-foreground">{t("simAiTitle")}</span>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full animate-pulse bg-success" />
              <span className="text-[9px] text-success font-bold">{t("simAiOnline")}</span>
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground transition-colors p-1"
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
                  className="block w-full text-right text-xs px-3 py-2 rounded-[10px] bg-accent/60 text-foreground border border-border hover:bg-accent transition-colors"
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
              className={`max-w-[90%] rounded-[12px] px-3 py-2 text-xs leading-relaxed ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground font-medium"
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
            <div className="bg-muted border border-border rounded-[12px] px-3 py-2">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce"
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
      <div className="px-3 py-3 border-t border-border bg-card flex gap-2 flex-shrink-0">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder={t("simAiPlaceholder")}
          className="flex-1 bg-background border border-input rounded-[10px] px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          dir={lang === "en" ? "ltr" : "rtl"}
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          className="w-8 h-8 rounded-[8px] flex items-center justify-center transition-all bg-primary text-primary-foreground disabled:opacity-40 hover:bg-primary/90"
        >
          <Send size={13} />
        </button>
      </div>
    </motion.div>
  );
}