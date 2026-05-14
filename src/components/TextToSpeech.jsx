import { useState, useEffect, useRef } from "react";
import { Volume2, VolumeX, Square, Play, Pause } from "lucide-react";

export default function TextToSpeech({ text, label = "قراءة النص" }) {
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);
  const [supported, setSupported] = useState(false);
  const utteranceRef = useRef(null);

  useEffect(() => {
    setSupported("speechSynthesis" in window);
    return () => {
      window.speechSynthesis?.cancel();
    };
  }, []);

  useEffect(() => {
    // Cancel if text changes
    window.speechSynthesis?.cancel();
    setSpeaking(false);
    setPaused(false);
  }, [text]);

  if (!supported) return null;

  const getVoice = () => {
    const voices = window.speechSynthesis.getVoices();
    // Prefer Arabic voice, fallback to any
    return voices.find(v => v.lang.startsWith("ar")) || voices[0] || null;
  };

  const handlePlay = () => {
    if (paused) {
      window.speechSynthesis.resume();
      setPaused(false);
      return;
    }
    window.speechSynthesis.cancel();
    const clean = text.replace(/[#*`>~\[\]]/g, "").replace(/\n+/g, ". ");
    const utter = new SpeechSynthesisUtterance(clean);
    utter.lang = "ar-SA";
    utter.rate = 0.9;
    utter.pitch = 1;
    const voice = getVoice();
    if (voice) utter.voice = voice;
    utter.onstart = () => setSpeaking(true);
    utter.onend = () => { setSpeaking(false); setPaused(false); };
    utter.onerror = () => { setSpeaking(false); setPaused(false); };
    utteranceRef.current = utter;
    window.speechSynthesis.speak(utter);
    setSpeaking(true);
  };

  const handlePause = () => {
    window.speechSynthesis.pause();
    setPaused(true);
  };

  const handleStop = () => {
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
            {[1,2,3].map(i => (
              <div key={i} className="w-1 bg-primary rounded-full animate-pulse"
                style={{ height: `${8 + i * 4}px`, animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
          <span className="text-xs text-primary font-medium">{paused ? "متوقف" : "يقرأ..."}</span>
          <button
            onClick={paused ? handlePlay : handlePause}
            className="p-1.5 rounded-lg hover:bg-primary/10 transition-colors text-primary"
          >
            {paused ? <Play size={13} /> : <Pause size={13} />}
          </button>
          <button
            onClick={handleStop}
            className="p-1.5 rounded-lg hover:bg-red-50 transition-colors text-red-500"
          >
            <Square size={13} />
          </button>
        </div>
      )}
    </div>
  );
}