import { useEffect, useState } from "react";

/**
 * i18n.js — نظام الترجمة المركزي (Global i18n)
 * العربية (افتراضية) / English / עברית
 * - اتجاه التخطيط RTL/LTR يُطبق على عنصر html
 * - التفضيل يُحفظ محلياً (app-language) ويُزامن مع حساب المستخدم عند الاختيار فقط
 * - لا يُغيَّر التفضيل تلقائياً عند فتح أي صفحة (إصلاح مشكلة الإعدادات)
 */
export const LANG_DIR = { ar: "rtl", en: "ltr", he: "rtl" };
const STORAGE_KEY = "app-language";

const T = {
  /* ─── التطبيق والهيكل ─── */
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
  footerRights: { ar: "جميع حقوق النشر محفوظة", en: "All rights reserved", he: "כל הזכויות שמורות" },

  /* ─── عام ─── */
  back: { ar: "رجوع", en: "Back", he: "חזור" },
  save: { ar: "حفظ", en: "Save", he: "שמור" },
  refresh: { ar: "تحديث", en: "Refresh", he: "רענן" },
  close: { ar: "إغلاق", en: "Close", he: "סגור" },
  loading: { ar: "جاري التحميل...", en: "Loading...", he: "טוען..." },
  copy: { ar: "نسخ", en: "Copy", he: "העתק" },
  copiedMsg: { ar: "تم نسخ البريد الإلكتروني بنجاح.", en: "Email copied successfully.", he: "האימייל הועתק בהצלחה." },

  /* ─── تسجيل الدخول (بالرموز فقط) ─── */
  loginTitle: { ar: "تسجيل الدخول", en: "Login", he: "התחברות" },
  loginSubtitle: {
    ar: "أدخل رمز المدرسة ورمز الطالب للدخول إلى حسابك — لا يُقبل الدخول إلا برموز صحيحة ومتطابقة",
    en: "Enter your School Code and Student Code — login is accepted only with valid, matching codes",
    he: "הזינו את קוד בית הספר וקוד התלמיד — הכניסה מתקבלת רק עם קודים תקינים ותואמים",
  },
  schoolCode: { ar: "رمز المدرسة", en: "School Code", he: "קוד בית הספר" },
  studentCode: { ar: "رمز الطالب", en: "Student Code", he: "קוד תלמיד" },
  loginBtn: { ar: "تسجيل الدخول", en: "Login", he: "התחברות" },
  loginPendingNote: { ar: "بعد الدخول ينتظر حسابك موافقة مشرف مدرستك قبل استخدام التطبيق", en: "After login, your account awaits your school admin's approval", he: "לאחר הכניסה החשבון ממתין לאישור מנהל בית הספר" },
  createAccount: { ar: "إنشاء حساب جديد", en: "Create New Account", he: "יצירת חשבון חדש" },
  createAccountNote: { ar: "اختر خطة الاشتراك أولاً — شخصية أو مدرسية", en: "Choose a subscription plan first — personal or school", he: "בחרו תחילה תוכנית מנוי — אישית או בית ספרית" },
  personalOption: { ar: "التسجيل بشكل مستقل بدون مدرسة", en: "Register independently without a school", he: "הרשמה עצמאית ללא בית ספר" },
  personalOptionDesc: { ar: "أريد استخدام المنصة بشكل شخصي — بدون رمز مدرسة", en: "I want to use the platform personally — no school code needed", he: "אני רוצה להשתמש בפלטפורמה באופן אישי — ללא קוד בית ספר" },
  goPersonalPlans: { ar: "الخطط الشخصية", en: "Personal Plans", he: "תוכניות אישיות" },

  /* ─── رسائل التحقق (تسجيل الدخول) ─── */
  errSchoolCode: { ar: "رمز المدرسة غير صحيح.", en: "Invalid school code.", he: "קוד בית הספר שגוי." },
  errStudentCode: { ar: "رمز الطالب غير صحيح.", en: "Invalid student code.", he: "קוד התלמיד שגוי." },
  errMismatch: { ar: "بيانات تسجيل الدخول غير متطابقة.", en: "Login details do not match.", he: "פרטי ההתחברות אינם תואמים." },
  errDisabled: { ar: "هذا الحساب معطل. يرجى التواصل مع إدارة المدرسة.", en: "This account is disabled. Please contact the school administration.", he: "החשבון מושבת. פנו להנהלת בית הספר." },
  errNotApproved: { ar: "الحساب غير معتمد. يرجى التواصل مع إدارة المدرسة.", en: "Account not approved. Please contact the school administration.", he: "החשבון לא מאושר. פנו להנהלת בית הספר." },
  errTaken: { ar: "هذا الرمز مستخدم ومسجل مسبقاً — تواصل مع إدارة مدرستك", en: "This code is already registered — contact your school administration", he: "הקוד כבר רשום — פנו להנהלת בית הספר" },
  errUnexpected: { ar: "حدث خطأ غير متوقع — تأكد من الاتصال وحاول مجدداً", en: "Unexpected error — check your connection and try again", he: "שגיאה לא צפויה — בדקו את החיבור ונסו שוב" },

  /* ─── شاشات حالة الحساب ─── */
  pendingTitle: { ar: "الحساب بانتظار موافقة إدارة المدرسة.", en: "Account awaiting school administration approval.", he: "החשבון ממתין לאישור הנהלת בית הספר." },
  rejectedTitle: { ar: "تم رفض حسابك", en: "Your account was rejected", he: "החשבון שלכם נדחה" },
  pendingDesc: { ar: "تم تسجيلك في مدرستك بنجاح. لن تستطيع استخدام التطبيق حتى يوافق مشرف المدرسة على حسابك.", en: "You registered successfully. You can use the app once the school admin approves your account.", he: "נרשמתם בהצלחה. תוכלו להשתמש באפליקציה לאחר אישור מנהל בית הספר." },
  statusDesc: { ar: "راجع إدارة مدرستك بخصوص حالة حسابك.", en: "Please contact your school administration about your account status.", he: "פנו להנהלת בית הספר לגבי מצב החשבון." },
  logout: { ar: "تسجيل الخروج", en: "Logout", he: "התנתקות" },
  studentCodeLabel: { ar: "رمز الطالب", en: "Student Code", he: "קוד תלמיד" },

  /* ─── الإعدادات ─── */
  settingsTitle: { ar: "الإعدادات", en: "Settings", he: "הגדרות" },
  settingsSubtitle: { ar: "حسابك، لغة الواجهة، ومعلومات مدرستك", en: "Your account, interface language, and school information", he: "החשבון, שפת הממשק ומידע על בית הספר" },
  accountSection: { ar: "الحساب", en: "Account", he: "חשבון" },
  nameLabel: { ar: "الاسم", en: "Name", he: "שם" },
  emailLabel: { ar: "البريد الإلكتروني", en: "Email", he: "אימייל" },
  roleLabel: { ar: "الدور", en: "Role", he: "תפקיד" },
  roleAdmin: { ar: "معلم / مدير", en: "Teacher / Admin", he: "מורה / מנהל" },
  roleStudent: { ar: "طالب", en: "Student", he: "תלמיד" },
  statusLabel: { ar: "حالة الحساب", en: "Account Status", he: "מצב החשבון" },
  languageSection: { ar: "لغة الواجهة", en: "Interface Language", he: "שפת הממשק" },
  langNote: { ar: "يتم حفظ تفضيلك تلقائياً وتحديث اتجاه الواجهة", en: "Your preference is saved automatically and the layout direction updates", he: "ההעדפה נשמרת אוטומטית וכיוון הממשק מתעדכן" },
  saving: { ar: "جاري الحفظ...", en: "Saving...", he: "שומר..." },
  saved: { ar: "تم الحفظ", en: "Saved", he: "נשמר" },
  schoolSection: { ar: "المدرسة", en: "School", he: "בית הספר" },
  schoolGeneral: { ar: "عام", en: "General", he: "כללי" },
  schoolLinked: { ar: "بياناتك (التقدم، النتائج، السيناريوهات) مرتبطة بهذه المدرسة فقط", en: "Your data (progress, results, scenarios) is linked to this school only", he: "הנתונים שלכם מקושרים לבית הספר הזה בלבד" },
  schoolUnlinked: { ar: "لم يتم إلحاقك بمدرسة بعد — بياناتك على النطاق العام", en: "You are not linked to a school yet — your data is on the general scope", he: "טרם שויכתם לבית ספר — הנתונים בטווח הכללי" },
  contactSection: { ar: "معلومات التواصل", en: "Contact Information", he: "פרטי קשר" },
  contactSectionDesc: { ar: "البريد الذي تصل إليه ملاحظات المستخدمين عبر زر «تواصل معنا»", en: "The email that receives user feedback via the Contact Us button", he: "האימייל שמקבל את הערות המשתמשים דרך כפתור יצירת קשר" },
  saveEmail: { ar: "حفظ البريد", en: "Save Email", he: "שמור אימייל" },
  adminOnlyNote: { ar: "تعديل البريد متاح لمالك المنصة فقط", en: "Editing the email is available to the platform owner only", he: "עריכת האימייל זמינה לבעל הפלטפורמה בלבד" },

  /* ─── الخطط ─── */
  plansTitle: { ar: "إنشاء حساب جديد — اختيار الخطة", en: "Create New Account — Choose a Plan", he: "יצירת חשבון חדש — בחירת תוכנית" },
  plansSubtitle: { ar: "لا يُنشأ الحساب قبل اختيار الخطة المناسبة", en: "The account is not created before choosing a plan", he: "החשבון לא נוצר לפני בחירת תוכנית" },
  personalPlanSection: { ar: "الخطة الشخصية", en: "Personal Plan", he: "תוכנית אישית" },
  personalPlanDesc: { ar: "لمتعلم واحد — حساب طالب كامل بدون مدرسة", en: "For one learner — a full student account without a school", he: "ללומד אחד — חשבון תלמיד מלא ללא בית ספר" },
  monthly: { ar: "شهريًا", en: "Monthly", he: "חודשי" },
  annually: { ar: "سنويًا", en: "Annually", he: "שנתי" },
  pay8months: { ar: "ادفع 8 أشهر وباقي السنة مجانًا", en: "Pay for 8 months, get the rest of the year free", he: "שלמו על 8 חודשים וקבלו את שאר השנה בחינם" },
  choosePlan: { ar: "اختيار هذه الخطة", en: "Choose this plan", he: "בחירת תוכנית זו" },
  schoolPlanSection: { ar: "الخطة المدرسية", en: "School Plan", he: "תוכנית בית ספרית" },
  schoolPlanDesc: { ar: "تعتمد على عدد الطلاب — اختر الخطة المناسبة لمدرستك", en: "Based on the number of students — choose the right plan for your school", he: "תלויה במספר התלמידים — בחרו את התוכנית המתאימה" },
  studentLimitLabel: { ar: "الحد الأقصى", en: "Maximum", he: "מקסימום" },

  /* ─── مختبر السيناريوهات ─── */
  scenarioLabTitle: { ar: "مختبر السيناريوهات", en: "Scenario Lab", he: "מעבדת תרחישים" },
  scenarioLabSubtitle: { ar: "سيناريوهات عملية مرتبطة بدروسك — نفّذها على محاكي الشبكة واحصل على تقييم فوري", en: "Practical scenarios linked to your lessons — run them on the simulator and get instant evaluation", he: "תרחישים מעשיים הקשורים לשיעורים — הריצו בסימולטור וקבלו הערכה מיידית" },
  syncedNote: { ar: "تقدمك متزامن مع حسابك", en: "Your progress is synced to your account", he: "ההתקדמות מסונכרנת לחשבון שלכם" },
  syncingNote: { ar: "جاري مزامنة تقدمك مع حسابك...", en: "Syncing your progress...", he: "מסנכרן את ההתקדמות..." },
  diffSortedNote: { ar: "السيناريوهات مرتبة حسب الصعوبة — من الأسهل إلى الأصعب", en: "Scenarios are sorted by difficulty — easiest first", he: "התרחישים מסודרים לפי קושי — מהקל לקשה" },
  completedProgress: { ar: "أكملت", en: "Completed", he: "הושלמו" },
  ofScenarios: { ar: "سيناريو", en: "scenarios", he: "תרחישים" },
  newLabel: { ar: "جديد", en: "New", he: "חדש" },
  continueLabel: { ar: "متابعة", en: "Continue", he: "המשך" },
  startLabel: { ar: "ابدأ", en: "Start", he: "התחל" },
  allCompletedMsg: { ar: "لقد أكملت جميع السيناريوهات المتاحة لك.", en: "You have completed all scenarios available to you.", he: "השלמתם את כל התרחישים הזמינים לכם." },
  viewHistory: { ar: "عرض السجل", en: "View History", he: "צפייה בהיסטוריה" },
  backToAllScenarios: { ar: "كل السيناريوهات", en: "All scenarios", he: "כל התרחישים" },
  lessonScenariosTitle: { ar: "سيناريوهات هذا الدرس", en: "Scenarios for this lesson", he: "תרחישים לשיעור זה" },
  lessonScenariosDesc: { ar: "نفّذ ما تعلمته في المحاكي — سيناريوهات مرتبطة بهذا الدرس فقط", en: "Apply what you learned in the simulator — scenarios linked to this lesson only", he: "יישמו את מה שלמדתם בסימולטור — תרחישים הקשורים לשיעור זה בלבד" },
  relatedLesson: { ar: "الدرس المرتبط", en: "Related lesson", he: "שיעור קשור" },
  objectivesTitle: { ar: "الأهداف", en: "Objectives", he: "מטרות" },
  completedCount: { ar: "مكتمل", en: "completed", he: "הושלם" },
  openInSimulator: { ar: "افتح في المحاكي", en: "Open in Simulator", he: "פתח בסימולטור" },
  evaluate: { ar: "تقييم الحل", en: "Evaluate Solution", he: "הערכת הפתרון" },
  hints: { ar: "تلميحات", en: "Hints", he: "רמזים" },
  aiHintBtn: { ar: "تلميح AI", en: "AI Hint", he: "רמז AI" },
  aiThinking: { ar: "جاري التفكير...", en: "Thinking...", he: "חושב..." },
  passedMsg: { ar: "ممتاز! اجتزت السيناريو", en: "Excellent! Scenario passed", he: "מעולה! התרחיש עבר" },
  failedMsg: { ar: "لم تجتز السيناريو بعد", en: "Scenario not passed yet", he: "התרחיש טרם עבר" },
  backToScenarios: { ar: "العودة للسيناريوهات", en: "Back to scenarios", he: "חזרה לתרחישים" },
  backHome: { ar: "الرئيسية", en: "Home", he: "בית" },

  /* ─── مستويات الصعوبة ─── */
  diffBeginner: { ar: "مبتدئ", en: "Beginner", he: "מתחיל" },
  diffEasy: { ar: "سهل", en: "Easy", he: "קל" },
  diffMedium: { ar: "متوسط", en: "Medium", he: "בינוני" },
  diffHard: { ar: "صعب", en: "Hard", he: "קשה" },
  diffAdvanced: { ar: "متقدم", en: "Advanced", he: "מתקדם" },

  /* ─── سجل المحاولات ─── */
  historyTitle: { ar: "سجل محاولات السيناريوهات", en: "Scenario Lab History", he: "היסטוריית מעבדת התרחישים" },
  historySubtitle: { ar: "تقدمك في كل سيناريو — محفوظ تلقائياً مهما غادرت الصفحة", en: "Your progress per scenario — saved automatically", he: "ההתקדמות בכל תרחיש — נשמרת אוטומטית" },
  totalAttempts: { ar: "إجمالي المحاولات", en: "Total Attempts", he: "סך הניסיונות" },
  completedScenarios: { ar: "سيناريوهات مكتملة", en: "Completed Scenarios", he: "תרחישים שהושלמו" },
  totalXp: { ar: "إجمالي XP", en: "Total XP", he: "סך XP" },
  avgScore: { ar: "متوسط النتيجة", en: "Average Score", he: "ציון ממוצע" },
  noAttempts: { ar: "لا توجد محاولات بعد", en: "No attempts yet", he: "אין ניסיונות עדיין" },
  noAttemptsDesc: { ar: "ابدأ بأول سيناريو وسيظهر تقدمك هنا تلقائياً", en: "Start your first scenario — your progress will appear here", he: "התחילו תרחיש ראשון וההתקדמות תופיע כאן" },
  startNow: { ar: "ابدأ الآن", en: "Start now", he: "התחילו עכשיו" },
  loadingHistory: { ar: "جاري تحميل سجلك...", en: "Loading your history...", he: "טוען את ההיסטוריה..." },
  lessonLabel: { ar: "الدرس", en: "Lesson", he: "שיעור" },
  startedAtLabel: { ar: "تاريخ البدء", en: "Started", he: "התחיל" },
  completedAtLabel: { ar: "تاريخ الإكمال", en: "Completed", he: "הושלם" },
  lastActivityLabel: { ar: "آخر نشاط", en: "Last activity", he: "פעילות אחרונת" },
  scoreLabel: { ar: "النتيجة", en: "Score", he: "ציון" },
  tasksLabel: { ar: "مهمة", en: "tasks", he: "משימות" },
  stCompleted: { ar: "مكتمل", en: "Completed", he: "הושלם" },
  stPartial: { ar: "منجز جزئياً", en: "Partially completed", he: "הושלם חלקית" },
  stInProgress: { ar: "جارية", en: "In progress", he: "בתהליך" },
  stNotStarted: { ar: "لم تبدأ", en: "Not started", he: "לא התחיל" },

  /* ─── تواصل معنا ─── */
  contactButton: { ar: "تواصل معنا", en: "Contact Us", he: "צור קשר" },
  contactTitle: { ar: "تواصل معنا", en: "Contact Us", he: "צור קשר" },
  contactDesc: { ar: "شاركنا تعليقك أو ملاحظتك عن التطبيق — ستصل مباشرة إلى فريق الدعم", en: "Share your comment or feedback about the app — it goes straight to our team", he: "שתפו את הערתכם על האפליקציה — תגיע ישירות לצוות התמיכה" },
  contactPlaceholder: { ar: "اكتب تعليقك أو ملاحظتك هنا...", en: "Write your comment or feedback here...", he: "כתבו את ההערה שלכם כאן..." },
  contactSend: { ar: "إرسال", en: "Send", he: "שלח" },
  contactSending: { ar: "جاري الإرسال...", en: "Sending...", he: "שולח..." },
  contactSent: { ar: "تم إرسال ملاحظتك بنجاح — شكراً لك", en: "Your feedback was sent — thank you", he: "ההערה נשלחה — תודה" },
  contactError: { ar: "تعذر الإرسال المباشر — أرسل ملاحظتك عبر بريدك الإلكتروني", en: "Direct sending failed — send your feedback via your email", he: "השליחה הישירה נכשלה — שלחו את ההערה מהמייל שלכם" },
  contactOpenMail: { ar: "إرسال عبر بريدي", en: "Send via my email", he: "שלח מהמייל שלי" },
  contactCancel: { ar: "إغلاق", en: "Close", he: "סגור" },

  /* ─── الصفحة الرئيسية ─── */
  homeHeroBadge: { ar: "منصة تعليمية تفاعلية متكاملة", en: "A complete interactive learning platform", he: "פלטפורמת למידה אינטראקטיבית מלאה" },
  homeHeroTitleA: { ar: "تعلّم مبادئ", en: "Learn the Principles of", he: "למדו את יסודות" },
  homeHeroTitleB: { ar: "الشبكات", en: "Networking", he: "הרשתות" },
  homeHeroDesc: { ar: "دليلك الشامل لفهم أساسيات الشبكات من العناوين والتوجيه إلى الأمان وإنترنت الأشياء", en: "Your complete guide to networking fundamentals — from addressing and routing to security and the Internet of Things", he: "המדריך המלא שלכם ליסודות הרשתות — מכתובוּת וניתוב ועד אבטחה והאינטרנט של הדברים" },
  simCTATitle: { ar: "محاكاة بناء شبكة", en: "Network Building Simulator", he: "סימולטור בניית רשת" },
  simCTADesc: { ar: "اسحب الأجهزة وابنِ شبكتك بصرياً — تفاعلي", en: "Drag devices and build your network visually — fully interactive", he: "גררו מכשירים ובנו את הרשת שלכם בצורה חזותית — אינטראקטיבי" },
  courseTopicsTitle: { ar: "مواضيع الدورة", en: "Course Topics", he: "נושאי הקורס" },
  lessonWord: { ar: "درس", en: "lessons", he: "שיעורים" },

  /* ─── لوحة التقدم ─── */
  dashTitle: { ar: "لوحة تقدمك", en: "Your Progress Dashboard", he: "לוח ההתקדמות שלכם" },
  dashSubtitle: { ar: "تابع تقدمك في دروس الشبكات ونتائج الاختبارات", en: "Track your progress through networking lessons and quiz results", he: "עקבו אחר ההתקדמות בשיעורי הרשתות ובתוצאות הבחינות" },
  dashLessonsDone: { ar: "الدروس المكتملة", en: "Lessons Visited", he: "שיעורים שנצפו" },
  dashQuizzesDone: { ar: "الاختبارات المكتملة", en: "Quizzes Completed", he: "בחינות שהושלמו" },
  dashAvgScore: { ar: "متوسط الدرجات", en: "Average Score", he: "ציון ממוצע" },
  dashProgressPct: { ar: "نسبة التقدم", en: "Progress", he: "אחוז התקדמות" },
  dashOverall: { ar: "التقدم الإجمالي في الدورة", en: "Overall Course Progress", he: "ההתקדמות הכוללת בקורס" },
  dashBySection: { ar: "التقدم حسب القسم", en: "Progress by Section", he: "התקדמות לפי מקטע" },
  dashTakeQuiz: { ar: "اختبر", en: "Take quiz", he: "הבחן" },
  dashLessonsDoneShort: { ar: "درس مكتمل", en: "lessons done", he: "שיעורים שהושלמו" },
  dashQuizResults: { ar: "نتائج الاختبارات", en: "Quiz Results", he: "תוצאות בחינות" },
  dashEmptyMsg: { ar: "ابدأ الدراسة لترى تقدمك هنا!", en: "Start learning to see your progress here!", he: "התחילו ללמוד כדי לראות כאן את ההתקדמות שלכם!" },
  dashGoLessons: { ar: "اذهب إلى الدروس", en: "Go to lessons", he: "מעבר לשיעורים" },

  /* ─── صفحة الدرس ─── */
  topicNotFound: { ar: "الموضوع غير موجود", en: "Topic not found", he: "הנושא לא נמצא" },
  ttsReadLabel: { ar: "قراءة الشرح", en: "Read aloud", he: "קריאה בקול" },
  ttsReadQuestions: { ar: "قراءة الأسئلة", en: "Read questions", he: "קריאת השאלות" },
  navPrev: { ar: "السابق", en: "Previous", he: "הקודם" },
  navNext: { ar: "التالي", en: "Next", he: "הבא" },
  translatingLesson: { ar: "جارٍ ترجمة الدرس آلياً — للحظات فقط...", en: "Translating this lesson automatically — just a moment...", he: "מתרגם את השיעור אוטומטית — רק רגע..." },
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