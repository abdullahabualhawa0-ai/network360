/**
 * مؤشر تحميل موحّد (نفس شكل السبينر الحالي) — يتكيف مع الوضع الداكن.
 * fullScreen=true: يغطي الشاشة (للمسارات خارج الـ Layout).
 * fullScreen=false: يملأ منطقة المحتوى فقط (يبقى الهيدر والشريط السفلي ظاهرين).
 */
export default function PageLoader({ fullScreen = false }) {
  return (
    <div
      className={`flex items-center justify-center bg-background ${
        fullScreen ? "fixed inset-0" : "min-h-[60vh]"
      }`}
      role="status"
      aria-label="Loading"
    >
      <div className="w-8 h-8 rounded-full animate-spin border-[3px] border-secondary/20 border-t-primary" />
    </div>
  );
}
