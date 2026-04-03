import { useState, useRef, useEffect } from "react";
import { Terminal, ChevronRight, RotateCcw, Copy, Lightbulb, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function TerminalSimulator({ terminalConfig }) {
  const [history, setHistory] = useState([]);
  const [input, setInput] = useState("");
  const [commandHistory, setCommandHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [showHints, setShowHints] = useState(false);
  const inputRef = useRef(null);
  const bottomRef = useRef(null);

  const { prompt, commands, description } = terminalConfig;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  const handleCommand = (cmd) => {
    const trimmed = cmd.trim().toLowerCase();
    if (!trimmed) return;

    // Find matching command (case-insensitive, partial match)
    const matchedKey = Object.keys(commands).find(
      k => k.toLowerCase() === trimmed
    );

    let output;
    if (matchedKey) {
      output = { type: "success", text: commands[matchedKey].output };
    } else if (trimmed === "?" || trimmed === "help") {
      output = {
        type: "info",
        text: "الأوامر المتاحة:\n" + Object.keys(commands).map(c => `  ${c}`).join("\n")
      };
    } else if (trimmed === "clear" || trimmed === "cls") {
      setHistory([]);
      setInput("");
      return;
    } else if (trimmed === "exit" || trimmed === "quit") {
      output = { type: "info", text: "Connection closed." };
    } else {
      // Partial match hint
      const partial = Object.keys(commands).filter(k => k.toLowerCase().startsWith(trimmed.split(" ")[0]));
      if (partial.length > 0) {
        output = {
          type: "error",
          text: `% Ambiguous command: "${trimmed}"\nأوامر مشابهة:\n${partial.map(c => `  ${c}`).join("\n")}`
        };
      } else {
        output = {
          type: "error",
          text: `% Unknown command or computer name, or unable to find computer address\n% الأمر "${trimmed}" غير معروف. اكتب ? أو help لعرض الأوامر المتاحة.`
        };
      }
    }

    setHistory(prev => [...prev, { cmd, output }]);
    setCommandHistory(prev => [cmd, ...prev.slice(0, 19)]);
    setHistoryIndex(-1);
    setInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleCommand(input);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const next = Math.min(historyIndex + 1, commandHistory.length - 1);
      setHistoryIndex(next);
      setInput(commandHistory[next] || "");
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = Math.max(historyIndex - 1, -1);
      setHistoryIndex(next);
      setInput(next === -1 ? "" : commandHistory[next]);
    } else if (e.key === "Tab") {
      e.preventDefault();
      // Autocomplete
      const match = Object.keys(commands).find(k => k.toLowerCase().startsWith(input.toLowerCase()));
      if (match) setInput(match);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="mt-10 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center shadow-lg">
            <Terminal className="text-green-400" size={18} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">محاكي سطر الأوامر</h2>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowHints(!showHints)}
            className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg hover:bg-amber-100 transition-colors"
          >
            <Lightbulb size={13} />
            <span>{showHints ? "إخفاء" : "أوامر"}</span>
          </button>
          <button
            onClick={() => setHistory([])}
            className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted border border-border px-3 py-1.5 rounded-lg hover:bg-muted/80 transition-colors"
          >
            <RotateCcw size={13} />
            <span>مسح</span>
          </button>
        </div>
      </div>

      {/* Hints panel */}
      <AnimatePresence>
        {showHints && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-3"
          >
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-xs font-semibold text-amber-800 mb-2 flex items-center gap-1">
                <Lightbulb size={12} />
                الأوامر المتاحة (انقر لتطبيق):
              </p>
              <div className="flex flex-wrap gap-2">
                {Object.keys(commands).map(cmd => (
                  <button
                    key={cmd}
                    onClick={() => {
                      setInput(cmd);
                      inputRef.current?.focus();
                    }}
                    className="text-xs font-mono bg-white border border-amber-300 text-amber-900 px-2.5 py-1 rounded-lg hover:bg-amber-100 transition-colors"
                    dir="ltr"
                  >
                    {cmd}
                  </button>
                ))}
              </div>
              <p className="text-xs text-amber-700 mt-2">
                💡 اضغط <kbd className="bg-amber-200 px-1 rounded">Tab</kbd> للإكمال التلقائي، 
                <kbd className="bg-amber-200 px-1 rounded mx-1">↑</kbd> لسجل الأوامر، 
                اكتب <kbd className="bg-amber-200 px-1 rounded">?</kbd> لعرض الأوامر
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Terminal Window */}
      <div
        className="bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-700"
        onClick={() => inputRef.current?.focus()}
      >
        {/* Title bar */}
        <div className="bg-slate-800 px-4 py-2.5 flex items-center gap-2 border-b border-slate-700">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <span className="text-slate-400 text-xs font-mono mx-auto">{prompt.replace("#", "")} — Terminal</span>
        </div>

        {/* Output area */}
        <div className="p-4 min-h-48 max-h-80 overflow-y-auto font-mono text-sm" dir="ltr" style={{ textAlign: 'left' }}>
          {/* Welcome message */}
          {history.length === 0 && (
            <div className="text-slate-500 text-xs mb-3">
              {`Welcome to Cisco IOS Simulator\nType '?' or 'help' to see available commands\nPress Tab for autocomplete, ↑↓ for history\n`}
            </div>
          )}

          {/* Command history */}
          {history.map((item, index) => (
            <div key={index} className="mb-3">
              {/* Command line */}
              <div className="flex items-center gap-1 group">
                <span className="text-green-400 font-bold">{prompt}</span>
                <span className="text-white ml-1">{item.cmd}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); copyToClipboard(item.cmd); }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity ml-auto text-slate-600 hover:text-slate-400"
                >
                  <Copy size={11} />
                </button>
              </div>
              {/* Output */}
              <div className={`mt-1 whitespace-pre text-xs leading-relaxed ${
                item.output.type === "error" ? "text-red-400" 
                : item.output.type === "info" ? "text-yellow-300"
                : "text-slate-300"
              }`}>
                {item.output.text}
              </div>
            </div>
          ))}

          {/* Active input line */}
          <div className="flex items-center gap-1">
            <span className="text-green-400 font-bold flex-shrink-0">{prompt}</span>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="bg-transparent text-white outline-none flex-1 ml-1 caret-green-400"
              placeholder=""
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
            />
          </div>
          <div ref={bottomRef} />
        </div>
      </div>

      <p className="text-xs text-muted-foreground mt-2 text-center">
        هذا محاكي تعليمي — لا تتطلب أوامره جهاز حقيقي
      </p>
    </div>
  );
}