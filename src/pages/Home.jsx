import courseData from "../lib/courseData";
import CategoryCard from "../components/CategoryCard";
import { motion } from "framer-motion";
import { BookOpen, GraduationCap, Layers, Network, Zap, ArrowLeft, MonitorPlay } from "lucide-react";
import { Link } from "react-router-dom";

export default function Home() {
  const totalTopics = courseData.reduce((sum, s) => sum + s.topics.length, 0);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-bl from-slate-900 via-blue-950 to-slate-900">
        {/* Animated grid background */}
        <div className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(rgba(59,130,246,0.07) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59,130,246,0.07) 1px, transparent 1px)`,
          backgroundSize: "48px 48px"
        }} />
        
        {/* Glow orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Floating network nodes */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[
          { x: "10%", y: "20%", delay: 0 }, { x: "85%", y: "15%", delay: 0.5 },
          { x: "75%", y: "70%", delay: 1 }, { x: "20%", y: "75%", delay: 1.5 },
          { x: "50%", y: "10%", delay: 0.8 }, { x: "90%", y: "45%", delay: 0.3 }].
          map((dot, i) =>
          <motion.div key={i}
          style={{ position: "absolute", left: dot.x, top: dot.y }}
          animate={{ y: [0, -12, 0], opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 4 + i * 0.5, repeat: Infinity, delay: dot.delay, ease: "easeInOut" }}>
            
              <div className="w-2 h-2 rounded-full bg-cyan-400/60" />
            </motion.div>
          )}
          {/* Connecting lines (SVG) */}
          <svg className="absolute inset-0 w-full h-full opacity-10">
            <line x1="10%" y1="20%" x2="50%" y2="10%" stroke="#22d3ee" strokeWidth="1" />
            <line x1="50%" y1="10%" x2="85%" y2="15%" stroke="#22d3ee" strokeWidth="1" />
            <line x1="85%" y1="15%" x2="90%" y2="45%" stroke="#3b82f6" strokeWidth="1" />
            <line x1="90%" y1="45%" x2="75%" y2="70%" stroke="#3b82f6" strokeWidth="1" />
            <line x1="20%" y1="75%" x2="75%" y2="70%" stroke="#22d3ee" strokeWidth="1" />
            <line x1="10%" y1="20%" x2="20%" y2="75%" stroke="#6366f1" strokeWidth="1" />
          </svg>
        </div>

        <div className="relative max-w-5xl mx-auto px-6 py-16 lg:py-24">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center">
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 bg-cyan-400/10 border border-cyan-400/20 text-cyan-300 px-4 py-2 rounded-full text-sm font-medium mb-6 backdrop-blur-sm">
              
              <Zap size={14} className="text-cyan-400" />
              منصة تعليمية تفاعلية متكاملة
            </motion.div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-5 leading-tight">
              تعلّم مبادئ{" "}
              <span className="bg-gradient-to-l from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                الشبكات
              </span>
            </h1>
            <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed mb-10">دليلك الشامل لفهم أساسيات الشبكات من العناوين والتوجيه إلى الأمان وإنترنت الأشياء   عب 

            </p>

            {/* Stats */}
            <div className="flex items-center justify-center gap-6 sm:gap-10">
              {[
              { icon: Layers, val: courseData.length, label: "قسم", color: "text-cyan-400", bg: "bg-cyan-400/10 border-cyan-400/20" },
              { icon: BookOpen, val: totalTopics, label: "درس", color: "text-blue-400", bg: "bg-blue-400/10 border-blue-400/20" },
              { icon: GraduationCap, val: "100%", label: "مجاني", color: "text-purple-400", bg: "bg-purple-400/10 border-purple-400/20" }].
              map(({ icon: Icon, val, label, color, bg }, i) =>
              <motion.div key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl border backdrop-blur-sm ${bg}`}>
                
                  <div className={`w-9 h-9 rounded-xl ${bg} border flex items-center justify-center`}>
                    <Icon size={16} className={color} />
                  </div>
                  <div className="text-right">
                    <div className={`text-xl font-black ${color}`}>{val}</div>
                    <div className="text-slate-400 text-xs">{label}</div>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Network Simulator CTA */}
      <div className="max-w-5xl mx-auto px-6 pt-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}>
          
          <Link to="/network-simulator">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-l from-emerald-600 via-teal-600 to-cyan-600 p-6 hover:shadow-2xl hover:shadow-emerald-500/20 transition-all group cursor-pointer">
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
              <div className="absolute -left-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-xl" />
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <MonitorPlay className="text-white" size={26} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-white font-black text-lg">محاكاة بناء شبكة</h3>
                      <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">جديد</span>
                    </div>
                    <p className="text-white/75 text-sm">اسحب الأجهزة وابنِ شبكتك بصرياً — Drag & Drop تفاعلي</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-white/80 group-hover:text-white group-hover:gap-3 transition-all">
                  <span className="text-sm font-medium hidden sm:block">ابدأ الآن</span>
                  <ArrowLeft size={20} />
                </div>
              </div>
            </div>
          </Link>
        </motion.div>
      </div>

      {/* Section title */}
      <div className="max-w-5xl mx-auto px-6 pt-10 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 bg-gradient-to-b from-primary to-secondary rounded-full" />
          <h2 className="text-lg font-bold text-foreground">مواضيع الدورة</h2>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="max-w-5xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {courseData.map((section, index) =>
          <CategoryCard key={section.id} section={section} index={index} />
          )}
        </div>
      </div>
    </div>);

}