import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Bot, Send, Plus, ChevronLeft, Loader2, BookOpen, Wrench, Trash2 } from "lucide-react";
import ReactMarkdown from "react-markdown";

const AGENTS = [
  {
    id: "learning_path_advisor",
    name: "مستشار المسار التعليمي",
    description: "يبني لك خطة دراسية مخصصة بناءً على مستواك وأهدافك",
    icon: BookOpen,
    color: "from-indigo-500 to-purple-600",
    bg: "bg-indigo-50 border-indigo-100",
    iconColor: "text-indigo-600",
    greeting: "مرحباً! أنا مستشار المسار التعليمي. سأساعدك في بناء خطة دراسية مخصصة. ما مستواك الحالي في الشبكات؟ (مبتدئ / متوسط / متقدم)"
  },
  {
    id: "technical_guide",
    name: "المرشد التقني",
    description: "يرشدك فورياً أثناء التمارين العملية ويحل مشاكل الشبكات",
    icon: Wrench,
    color: "from-emerald-500 to-teal-600",
    bg: "bg-emerald-50 border-emerald-100",
    iconColor: "text-emerald-600",
    greeting: "أهلاً! أنا المرشد التقني. اسألني عن أي أمر Cisco، مشكلة في الشبكة، أو شرح تقني وسأساعدك فوراً."
  }
];

function ChatInterface({ agent, onBack }) {
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const bottomRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const conv = await base44.agents.createConversation({ agent_name: agent.id });
        setConversation(conv);
        setMessages([{ role: "assistant", content: agent.greeting }]);
      } catch {
        setMessages([{ role: "assistant", content: agent.greeting }]);
      } finally {
        setInitializing(false);
      }
    })();
  }, [agent.id]);

  useEffect(() => {
    if (!conversation) return;
    const unsub = base44.agents.subscribeToConversation(conversation.id, (data) => {
      if (data.messages?.length > 0) {
        setMessages(data.messages);
        setLoading(false);
      }
    });
    return unsub;
  }, [conversation?.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const text = input.trim();
    setInput("");
    setLoading(true);
    setMessages(prev => [...prev, { role: "user", content: text }]);

    if (conversation) {
      await base44.agents.addMessage(conversation, { role: "user", content: text });
    } else {
      // Fallback without conversation
      setMessages(prev => [...prev, { role: "assistant", content: "عذراً، لا يمكن الاتصال بالوكيل الآن." }]);
      setLoading(false);
    }
  };

  const Icon = agent.icon;

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] max-h-[700px]">
      {/* Chat header */}
      <div className={`bg-gradient-to-r ${agent.color} p-4 flex items-center gap-3`}>
        <button onClick={onBack} className="text-white/70 hover:text-white transition-colors">
          <ChevronLeft size={20} />
        </button>
        <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
          <Icon size={18} className="text-white" />
        </div>
        <div>
          <div className="text-white font-bold text-sm">{agent.name}</div>
          <div className="text-white/60 text-xs">متصل</div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
        {initializing ? (
          <div className="flex justify-center pt-8">
            <Loader2 size={24} className="animate-spin text-muted-foreground" />
          </div>
        ) : (
          messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                msg.role === "user"
                  ? "bg-slate-800 text-white"
                  : "bg-white border border-slate-200 text-foreground"
              }`}>
                {msg.role === "user" ? (
                  <p>{msg.content}</p>
                ) : (
                  <ReactMarkdown className="prose prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                    {msg.content}
                  </ReactMarkdown>
                )}
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3 flex items-center gap-2">
              {[0, 1, 2].map(i => (
                <div key={i} className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-slate-200 p-3 flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
          placeholder="اكتب سؤالك..."
          className="flex-1 text-sm px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim() || loading}
          className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 flex items-center justify-center transition-colors"
        >
          <Send size={16} className="text-white" />
        </button>
      </div>
    </div>
  );
}

export default function AgentsPage() {
  const [activeAgent, setActiveAgent] = useState(null);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-bl from-slate-900 via-purple-950 to-slate-900">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(rgba(139,92,246,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.07) 1px, transparent 1px)`,
          backgroundSize: "40px 40px"
        }} />
        <div className="relative max-w-4xl mx-auto px-6 py-10">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-2 text-purple-300/70 text-sm mb-2">
              <Link to="/" className="hover:text-purple-200 transition-colors">الرئيسية</Link>
              <ChevronLeft size={13} />
              <span className="text-purple-200">المساعدون الذكيون</span>
            </div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <Bot className="text-purple-300" size={22} />
              </div>
              <h1 className="text-3xl font-black text-white">المساعدون الذكيون</h1>
            </div>
            <p className="text-slate-400 text-sm">مساعدان AI متخصصان لمساعدتك في التعلم والتمارين العملية</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {activeAgent ? (
            <motion.div
              key="chat"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className="bg-card border border-border rounded-2xl overflow-hidden shadow-xl"
            >
              <ChatInterface
                agent={AGENTS.find(a => a.id === activeAgent)}
                onBack={() => setActiveAgent(null)}
              />
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-6"
            >
              {AGENTS.map((agent, i) => {
                const Icon = agent.icon;
                return (
                  <motion.div
                    key={agent.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-card border border-border rounded-2xl p-6 hover:shadow-xl hover:border-primary/30 transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
                    onClick={() => setActiveAgent(agent.id)}
                  >
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${agent.color} flex items-center justify-center mb-4 shadow-lg`}>
                      <Icon size={26} className="text-white" />
                    </div>
                    <h3 className="text-lg font-black text-foreground mb-2">{agent.name}</h3>
                    <p className="text-muted-foreground text-sm mb-5">{agent.description}</p>
                    <button className={`flex items-center gap-2 text-sm font-semibold bg-gradient-to-r ${agent.color} text-white px-4 py-2 rounded-xl hover:opacity-90 transition-opacity`}>
                      <Plus size={14} />
                      ابدأ محادثة
                    </button>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}