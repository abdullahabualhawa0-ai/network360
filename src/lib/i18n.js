import { useEffect, useState } from "react";

/**
 * i18n.js — تعدد اللغات (العربية / الإنجليزية / العبرية)
 * - الترجمة للقوائم والعناوين الرئيسية في الواجهة
 * - اتجاه التخطيط RTL/LTR يُطبق على عنصر html
 * - التفضيل يُحفظ محلياً (app-language) ويُزامن من صفحة الإعدادات
 */
export const LANG_DIR = { ar: "rtl", en: "ltr", he: "rtl" };
const STORAGE_KEY = "app-language";

const T = {
  appName: { ar: "مبادئ الشبكات", en: "Networking Principles", he: "יסודות הרשתות" },
  appTagline: { ar: "منصة تعليمية تفاعلية", en: "Interactive learning platform", he: "פלטפורמת למידה אינטראקטיבית" },
  navHome: { ar: "الصفحة الرئيسية", en: "Home", he: "בית" },
  navSimulator: { ar: "محاكاة الشبكات", en: "Network Simulator", he: "סימולטור רשתות" },
  navDashboard: { ar: "لوحة التقدم", en: "Progress", he: "לוח התקדמות" },
  navScenarioLab: { ar: "مختبر السيناريوهات", en: "Scenario Lab", he: "מעבדת תרחישים" },
  navLabHistory: { ar: "سجل المحاولات", en: "Lab History", he: "היסטוריית מעבדה" },
  navExams: { ar: "الامتحانات", en: "Exams", he: "בחינות" },
  navSettings: { ar: "الإعدادات", en: "Settings", he: "הגדרות" },
  navSchools: { ar: "المدارس", en: "Schools", he: "בתי ספר" },
  navMyStudents: { ar: "طلاب مدرستي", en: "My Students", he: "התלמידים שלי" },
  navStudentReports: { ar: "تقارير الطلاب", en: "Student Reports", he: "דוחות תלמידים" },
  navExamManage: { ar: "إدارة الامتحانات", en: "Exam Management", he: "ניהול בחינות" },
  navExamResults: { ar: "نتائج الامتحانات", en: "Exam Results", he: "תוצאות בחינות" },
  courseContent: { ar: "محتوى الدورة", en: "Course Content", he: "תוכן הקורס" },
  contactButton: { ar: "تواصل معنا", en: "Contact Us", he: "צור קשר" },
  contactTitle: { ar: "تواصل معنا", en: "Contact Us", he: "צור קשר" },
  contactDesc: { ar: "شاركنا تعليقك أو ملاحظتك عن التطبيق — ستصل مباشرة إلى فريق الدعم", en: "Share your comment or feedback about the app — it goes straight to our team", he: "שתפו את הערתכם על האפליקציה — תגיע ישירות לצוות התמיכה" },
  contactPlaceholder: { ar: "اكتب تعليقك أو ملاحظتك هنا...", en: "Write your comment or feedback here...", he: "כתבו את ההערה שלכם כאן..." },
  contactSend: { ar: "إرسال", en: "Send", he: "שלח" },
  contactSending: { ar: "جاري الإرسال...", en: "Sending...", he: "שולח..." },
  contactSent: { ar: "تم إرسال ملاحظتك بنجاح — شكراً لك ✓", en: "Your feedback was sent — thank you ✓", he: "ההערה נשלחה — תודה ✓" },
  contactError: { ar: "تعذر الإرسال — حاول مجدداً لاحقاً", en: "Failed to send — try again later", he: "השליחה נכשלה — נסו שוב מאוחר יותר" },
  contactCancel: { ar: "إغلاق", en: "Close", he: "סגור" },
};

export function getLang() {
  try { return localStorage.getItem(STORAGE_KEY) || "ar"; } catch { return "ar"; }
}

export function setLang(lang) {
  try { localStorage.setItem(STORAGE_KEY, lang); } catch {}
  document.documentElement.dir = LANG_DIR[lang] || "rtl";
  document.documentElement.lang = lang;
  window.dispatchEvent(new Event("app-lang-change"));
}

export function t(key, lang = getLang()) {
  return T[key]?.[lang] || T[key]?.ar || key;
}

/** يعيد اللغة الحالية ويعيد رسم المكوّن عند تغييرها */
export function useLang() {
  const [lang, setLocal] = useState(getLang);
  useEffect(() => {
    const onChange = () => setLocal(getLang());
    window.addEventListener("app-lang-change", onChange);
    return () => window.removeEventListener("app-lang-change", onChange);
  }, []);
  return lang;
}

// تطبيق الاتجاه المحفوظ عند أول تحميل
try { document.documentElement.dir = LANG_DIR[getLang()] || "rtl"; } catch {}