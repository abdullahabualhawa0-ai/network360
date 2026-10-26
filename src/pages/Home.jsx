import courseData from "../lib/courseData";
import CategoryCard from "../components/CategoryCard";
import { motion } from "framer-motion";
import { ArrowLeft, MonitorPlay } from "lucide-react";
import { Link } from "react-router-dom";
import { t, useLang } from "@/lib/i18n";

export default function Home() {
  useLang();

  return (
    <div className="min-h-screen">
      {/* Hero — خلفية رملية مسطّحة بلا تدرجات */}
      <div className="relative overflow-hidden bg-background">
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
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6 bg-secondary/10 border border-secondary/25 text-secondary dark:text-primary">

              {t("homeHeroBadge")}
            </motion.div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-5 leading-tight text-primary">
              {t("homeHeroTitleA")}{" "}
              <span className="text-secondary dark:text-primary">
                {t("homeHeroTitleB")}
              </span>
            </h1>
            <p className="text-base sm:text-lg max-w-2xl mx-auto leading-relaxed mb-6 text-foreground">
              {t("homeHeroDesc")}
            </p>
            <p className="text-xs mb-10 text-muted-foreground text-center" dir="rtl">
              عمل الطلاب: عبد الله أبو الهوى ، امير دراويش
            </p>
               <p className="mb-10 text-xl text-muted-foreground" dir="rtl">
              EDUPRO+
            </p>
          </motion.div>
        </div>
      </div>

      {/* بطاقة المحاكاة — بطاقة مسطّحة بحدود */}
      <div className="max-w-5xl mx-auto px-6 pt-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}>

          <Link to="/network-simulator">
            <div className="rounded-2xl p-6 transition-all group cursor-pointer bg-card hover:bg-accent/40 border border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-primary">
                    <MonitorPlay className="text-primary-foreground" size={26} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-black text-lg text-primary">{t("simCTATitle")}</h3>
                    </div>
                    <p className="text-sm text-foreground">{t("simCTADesc")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 group-hover:gap-3 transition-all text-primary">
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
          <div className="w-1 h-6 rounded-full bg-primary" />
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