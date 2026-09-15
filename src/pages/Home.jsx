import courseData from "../lib/courseData";
import CategoryCard from "../components/CategoryCard";
import { motion } from "framer-motion";
import { BookOpen, GraduationCap, Layers, Network, Zap, ArrowLeft, MonitorPlay } from "lucide-react";
import { Link } from "react-router-dom";
import { t, useLang } from "@/lib/i18n";

export default function Home() {
  useLang();
  const totalTopics = courseData.reduce((sum, s) => sum + s.topics.length, 0);

  return (
    <div className="min-h-screen">
      {/* Hero — خلفية فاتحة هادئة بدون تدرجات قوية */}
      <div className="relative overflow-hidden" style={{ background: "#F7F9FC" }}>
        {/* شبكة خفيفة */}
        <div className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(rgba(47,102,144,0.05) 1px, transparent 1px),
              linear-gradient(90deg, rgba(47,102,144,0.05) 1px, transparent 1px)`,
          backgroundSize: "48px 48px"
        }} />

        {/* لمسات زخرفية هادئة */}
        <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full pointer-events-none" style={{ background: "rgba(58,134,168,0.06)" }} />
        <div className="absolute -bottom-24 -right-16 w-80 h-80 rounded-full pointer-events-none" style={{ background: "rgba(47,102,144,0.05)" }} />

        {/* نقاط شبكة عائمة خفيفة */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[
          { x: "10%", y: "22%", delay: 0 }, { x: "85%", y: "18%", delay: 0.5 },
          { x: "76%", y: "68%", delay: 1 }, { x: "18%", y: "74%", delay: 1.5 },
          { x: "50%", y: "12%", delay: 0.8 }, { x: "90%", y: "45%", delay: 0.3 }].
          map((dot, i) =>
          <motion.div key={i}
          style={{ position: "absolute", left: dot.x, top: dot.y }}
          animate={{ y: [0, -10, 0], opacity: [0.35, 0.65, 0.35] }}
          transition={{ duration: 4 + i * 0.5, repeat: Infinity, delay: dot.delay, ease: "easeInOut" }}>
              <div className="w-2 h-2 rounded-full" style={{ background: "rgba(58,134,168,0.5)" }} />
            </motion.div>
          )}
          <svg className="absolute inset-0 w-full h-full opacity-20">
            <line x1="10%" y1="22%" x2="50%" y2="12%" stroke="#2F6690" strokeWidth="1" />
            <line x1="50%" y1="12%" x2="85%" y2="18%" stroke="#2F6690" strokeWidth="1" />
            <line x1="85%" y1="18%" x2="90%" y2="45%" stroke="#2F6690" strokeWidth="1" />
            <line x1="90%" y1="45%" x2="76%" y2="68%" stroke="#3A86A8" strokeWidth="1" />
            <line x1="18%" y1="74%" x2="76%" y2="68%" stroke="#3A86A8" strokeWidth="1" />
            <line x1="10%" y1="22%" x2="18%" y2="74%" stroke="#173F5F" strokeWidth="1" />
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
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6"
              style={{ background: "rgba(47,102,144,0.08)", border: "1px solid rgba(47,102,144,0.2)", color: "#2F6690" }}>
              
              {t("homeHeroBadge")}
            </motion.div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-5 leading-tight" style={{ color: "#173F5F" }}>
              {t("homeHeroTitleA")}{" "}
              <span style={{ color: "#2F6690" }}>
                {t("homeHeroTitleB")}
              </span>
            </h1>
            <p className="text-base sm:text-lg max-w-2xl mx-auto leading-relaxed mb-6" style={{ color: "#1F2937" }}>
              {t("homeHeroDesc")}
            </p>
            <p className="text-xs mb-10" style={{ color: "rgba(31,41,55,0.55)" }} dir="rtl">
              عمل الطلاب: عبد الله أبو الهوى ، امير دراويش —
            </p>
          </motion.div>
        </div>
      </div>

      {/* بطاقة المحاكاة — بيضاء بحدود خفيفة */}
      <div className="max-w-5xl mx-auto px-6 pt-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}>
          
          <Link to="/network-simulator">
            <div className="rounded-2xl p-6 transition-all group cursor-pointer bg-white hover:shadow-lg"
              style={{ border: "1px solid #E2E8F0" }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "#173F5F" }}>
                    <MonitorPlay className="text-white" size={26} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-black text-lg" style={{ color: "#173F5F" }}>{t("simCTATitle")}</h3>
                    </div>
                    <p className="text-sm" style={{ color: "#1F2937" }}>{t("simCTADesc")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 group-hover:gap-3 transition-all" style={{ color: "#2F6690" }}>
                  <span className="text-sm font-medium hidden sm:block">{t("startNow")}</span>
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
          <div className="w-1 h-6 rounded-full" style={{ background: "#173F5F" }} />
          <h2 className="text-lg font-bold text-foreground">{t("courseTopicsTitle")}</h2>
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