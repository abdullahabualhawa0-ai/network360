import { useState, useRef, useEffect } from "react";
import { Terminal, Copy, Lightbulb, RotateCcw } from "lucide-react";
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
      const match = Object.keys(commands).find(k => k.toLowerCase().startsWith(input.toLowerCase()));
      if (match) setInput(match);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="mt-10 mb-6 font-main">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[10px] bg-card border border-border flex items-center justify-center">
            <Terminal className="text-brand" size={18} />
          </div>
          <div>
            <h2 className="text-lg font-black text-foreground">محاكي سطر الأوامر</h2>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowHints(!showHints)}
            className="flex items-center gap-1.5 text-xs text-brand bg-accent border border-border px-3 py-1.5 rounded-[8px] transition-colors hover:bg-muted"
          >
            <Lightbulb size={13} />
            <span>{showHints ? "إخفاء" : "أوامر"}</span>
          </button>
          <button
            onClick={() => setHistory([])}
            className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted border border-border px-3 py-1.5 rounded-[8px] hover:bg-muted/80 transition-colors"
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
            <div className="bg-card border border-border rounded-[14px] p-4">
              <p className="text-xs font-bold text-brand mb-2 flex items-center gap-1">
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
                    className="text-xs font-mono bg-accent border border-border text-foreground px-2.5 py-1 rounded-[8px] hover:bg-muted transition-colors"
                    dir="ltr"
                  >
                    {cmd}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                💡 اضغط <kbd className="bg-muted text-foreground px-1 rounded">Tab</kbd> للإكمال التلقائي، 
                <kbd className="bg-muted text-foreground px-1 rounded mx-1">↑</kbd> لسجل الأوامر، 
                اكتب <kbd className="bg-muted text-foreground px-1 rounded">?</kbd> لعرض الأوامر
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Terminal Window */}
      <div
        className="bg-terminal text-terminal-foreground rounded-[16px] overflow-hidden border border-border"
        onClick={() => inputRef.current?.focus()}
      >
        {/* Title bar */}
        <div className="bg-terminal/90 px-4 py-2.5 flex items-center gap-2 border-b border-border">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-destructive" />
            <div className="w-3 h-3 rounded-full bg-warning" />
            <div className="w-3 h-3 rounded-full bg-success" />
          </div>
          <span className="text-terminal-foreground/60 text-xs font-mono mx-auto">{prompt.replace("#", "")} — Terminal</span>
        </div>

        {/* Output area */}
        <div className="p-4 min-h-48 max-h-80 overflow-y-auto font-mono text-sm bg-terminal text-terminal-foreground" dir="ltr" style={{ textAlign: 'left' }}>
          {/* Welcome message */}
          {history.length === 0 && (
            <div className="text-terminal-foreground/50 text-xs mb-3">
              {`Welcome to Cisco IOS Simulator\nType '?' or 'help' to see available commands\nPress Tab for autocomplete, ↑↓ for history\n`}
            </div>
          )}

          {/* Command history */}
          {history.map((item, index) => (
            <div key={index} className="mb-3">
              {/* Command line */}
              <div className="flex items-center gap-1 group">
                <span className="text-brand font-bold">{prompt}</span>
                <span className="text-terminal-foreground ml-1">{item.cmd}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); copyToClipboard(item.cmd); }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity ml-auto text-terminal-foreground/40 hover:text-terminal-foreground"
                >
                  <Copy size={11} />
                </button>
              </div>
              {/* Output */}
              <div className={`mt-1 whitespace-pre text-xs leading-relaxed ${
                item.output.type === "error" ? "text-destructive" 
                : item.output.type === "info" ? "text-warning"
                : "text-terminal-foreground/80"
              }`}>
                {item.output.text}
              </div>
            </div>
          ))}

          {/* Active input line */}
          <div className="flex items-center gap-1">
            <span className="text-brand font-bold flex-shrink-0">{prompt}</span>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="bg-transparent text-terminal-foreground outline-none flex-1 ml-1"
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