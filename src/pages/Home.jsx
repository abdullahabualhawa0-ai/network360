import courseData from "../lib/courseData";
import CategoryCard from "../components/CategoryCard";
import { motion } from "framer-motion";
import { BookOpen, GraduationCap, Layers } from "lucide-react";

export default function Home() {
  const totalTopics = courseData.reduce((sum, s) => sum + s.topics.length, 0);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-bl from-primary/5 via-background to-secondary/5">
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
          backgroundSize: '32px 32px'
        }} />
        
        <div className="relative max-w-5xl mx-auto px-6 py-16 lg:py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <GraduationCap size={16} />
              <span>منصة تعليمية متكاملة</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground mb-4 leading-tight">
              تعلّم مبادئ <span className="text-primary">الشبكات</span>
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
              دليلك الشامل لفهم أساسيات الشبكات من العناوين والتوجيه إلى الأمان وإنترنت الأشياء
            </p>

            {/* Stats */}
            <div className="flex items-center justify-center gap-8 mt-10">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Layers size={16} className="text-primary" />
                </div>
                <div className="text-right">
                  <div className="font-bold text-foreground">{courseData.length}</div>
                  <div className="text-xs text-muted-foreground">أقسام</div>
                </div>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="flex items-center gap-2 text-sm">
                <div className="w-9 h-9 rounded-lg bg-secondary/10 flex items-center justify-center">
                  <BookOpen size={16} className="text-secondary" />
                </div>
                <div className="text-right">
                  <div className="font-bold text-foreground">{totalTopics}</div>
                  <div className="text-xs text-muted-foreground">درس</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="max-w-5xl mx-auto px-6 py-10 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {courseData.map((section, index) => (
            <CategoryCard key={section.id} section={section} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
}