import { useState, useEffect, useRef } from "react";
import { Volume2, Square, Play, Pause } from "lucide-react";

// Split mixed text into segments, each tagged with its language.
// Strategy: tokenize word-by-word, group consecutive same-language tokens.
function splitByLanguage(text) {
  // Tokenize into words and non-word separators
  const tokens = text.split(/(\s+)/);
  const segments = [];
  let current = null;

  for (const token of tokens) {
    if (!token) continue;
    const hasArabic = /[\u0600-\u06FF]/.test(token);
    const hasLatin = /[a-zA-Z0-9]/.test(token);
    
    // Pure whitespace/punctuation → keep with current segment
    if (!hasArabic && !hasLatin) {
      if (current) current.text += token;
      continue;
    }

    const lang = hasArabic ? "ar" : "en";

    if (current && current.lang === lang) {
      current.text += token;
    } else {
      if (current && current.text.trim()) segments.push(current);
      current = { text: token, lang };
    }
  }
  if (current && current.text.trim()) segments.push(current);
  return segments;
}

function getBestVoice(lang, voices) {
  if (lang === "ar") {
    return voices.find(v => v.lang.startsWith("ar")) || null;
  } else {
    return (
      voices.find(v => v.lang === "en-US" && v.name.toLowerCase().includes("google")) ||
      voices.find(v => v.lang.startsWith("en-US")) ||
      voices.find(v => v.lang.startsWith("en")) ||
      null
    );
  }
}

export default function TextToSpeech({ text, label = "قراءة النص" }) {
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);
  const [supported, setSupported] = useState(false);
  const stoppedRef = useRef(false);

  useEffect(() => {
    setSupported("speechSynthesis" in window);
    return () => { window.speechSynthesis?.cancel(); };
  }, []);

  useEffect(() => {
    window.speechSynthesis?.cancel();
    setSpeaking(false);
    setPaused(false);
  }, [text]);

  if (!supported) return null;

  const speakSegments = (segments, index, voices) => {
    if (stoppedRef.current || index >= segments.length) {
      setSpeaking(false);
      setPaused(false);
      return;
    }
    const seg = segments[index];
    const utter = new SpeechSynthesisUtterance(seg.text);
    utter.lang = seg.lang === "ar" ? "ar-SA" : "en-US";
    utter.rate = seg.lang === "ar" ? 0.9 : 1.0;
    const voice = getBestVoice(seg.lang, voices);
    if (voice) utter.voice = voice;
    utter.onend = () => speakSegments(segments, index + 1, voices);
    utter.onerror = () => { setSpeaking(false); setPaused(false); };
    window.speechSynthesis.speak(utter);
  };

  const handlePlay = () => {
    if (paused) {
      window.speechSynthesis.resume();
      setPaused(false);
      return;
    }
    window.speechSynthesis.cancel();
    stoppedRef.current = false;

    const clean = text.replace(/[#*`>~\[\]]/g, "").replace(/\n+/g, ". ");
    const segments = splitByLanguage(clean).filter(s => s.text.length > 1);

    const voices = window.speechSynthesis.getVoices();
    if (voices.length === 0) {
      // Wait for voices to load then speak
      window.speechSynthesis.onvoiceschanged = () => {
        const v = window.speechSynthesis.getVoices();
        setSpeaking(true);
        speakSegments(segments, 0, v);
      };
    } else {
      setSpeaking(true);
      speakSegments(segments, 0, voices);
    }
  };

  const handlePause = () => {
    window.speechSynthesis.pause();
    setPaused(true);
  };

  const handleStop = () => {
    stoppedRef.current = true;
    window.speechSynthesis.cancel();
    setSpeaking(false);
    setPaused(false);
  };

  return (
    <div className="flex items-center gap-2">
      {!speaking ? (
        <button
          onClick={handlePlay}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-l from-primary/10 to-secondary/10 border border-primary/20 text-primary hover:from-primary/20 hover:to-secondary/20 transition-all text-sm font-medium group"
        >
          <Volume2 size={15} className="group-hover:scale-110 transition-transform" />
          <span>{label}</span>
        </button>
      ) : (
        <div className="flex items-center gap-1.5 bg-primary/5 border border-primary/20 rounded-xl px-3 py-1.5">
          <div className="flex items-center gap-0.5 mr-1">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-1 bg-primary rounded-full animate-pulse"
                style={{ height: `${8 + i * 4}px`, animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
          <span className="text-xs text-primary font-medium">{paused ? "متوقف" : "يقرأ..."}</span>
          <button onClick={paused ? handlePlay : handlePause}
            className="p-1.5 rounded-lg hover:bg-primary/10 transition-colors text-primary">
            {paused ? <Play size={13} /> : <Pause size={13} />}
          </button>
          <button onClick={handleStop}
            className="p-1.5 rounded-lg hover:bg-red-50 transition-colors text-red-500">
            <Square size={13} />
          </button>
        </div>
      )}
    </div>
  );
}