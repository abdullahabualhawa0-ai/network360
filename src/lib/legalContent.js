/**
 * legalContent.js — نصوص الصفحات القانونية (سياسة الخصوصية، شروط الاستخدام، حذف الحساب)
 * بالعربية والإنجليزية والعبرية.
 *
 * ⚠️ هذه نصوص جاهزة مبنيّة على ما يفعله التطبيق فعلاً (البيانات المجمّعة، المعالجة، الحذف)،
 *    لكنها ليست استشارة قانونية. يجب مراجعتها مع مختص قبل النشر، وتعديل أي التزام زمني
 *    (مثل مدة تنفيذ طلب الحذف) بما تستطيع المنصة الالتزام به فعلاً.
 *
 * البريد الذي يظهر في أسفل كل صفحة يُقرأ من إعداد النظام contact_email (SystemSetting).
 */
export const LEGAL_UPDATED = "2026-10-12";

export const LEGAL = {
  /* ───────────────────────────── سياسة الخصوصية ───────────────────────────── */
  privacy: {
    ar: {
      title: "سياسة الخصوصية",
      intro: "تشرح هذه السياسة أي بيانات يجمعها تطبيق «مبادئ الشبكات» (NETWORK360) ولماذا، وكيف نحميها، وكيف تتحكم بها.",
      sections: [
        { h: "1. من نحن ونطاق التطبيق", p: ["«مبادئ الشبكات» منصة تعليمية لتعلّم أساسيات شبكات الحاسوب (دروس، محاكي شبكات، مهام عملية، اختبارات وامتحانات). تُستخدم عادةً داخل المدارس، وتتوفر أيضاً بخطة فردية."] },
        { h: "2. البيانات التي نجمعها", list: [
          "الطلاب: الاسم، رمز الطالب، رمز المدرسة، اللغة المفضلة، وبريد إلكتروني اختياري إن أدخلته المدرسة.",
          "نشاطك التعليمي: التقدّم في الدروس، نتائج الاختبارات، سجل المهام العملية والنقاط، وطلبات دخول الامتحانات وإجاباتك ونتائجك.",
          "الأساتذة ومشرفو المدارس: الاسم، الرمز، المادة، والبريد/الهاتف إن أُدخلا.",
          "طلبات التسجيل: الاسم، البريد الإلكتروني، الهاتف، الدولة، واسم المدرسة وأعداد المستخدمين المتوقعة.",
          "حسابات الإدارة (المالك/المشرف بالبريد): البريد الإلكتروني وبيانات الدخول التي تديرها منصة Base44.",
          "بيانات تقنية على جهازك: رمز جلسة الدخول واللغة المفضلة وذاكرة مؤقتة لترجمات المحتوى، تُحفظ في تخزين المتصفح/التطبيق المحلي."
        ] },
        { h: "3. كيف نستخدم البيانات", list: [
          "تشغيل حسابك وتسجيل دخولك وعرض تقدّمك.",
          "تمكين الأستاذ ومشرف المدرسة من متابعة طلابهم ونتائج الامتحانات.",
          "الموافقة على الحسابات وإدارة الاشتراكات وطلبات التسجيل والدعم الفني.",
          "تحسين استقرار التطبيق وأمانه (مثل الحد من محاولات تخمين الرموز)."
        ] },
        { h: "4. ميزات الذكاء الاصطناعي", p: ["عند استخدام الترجمة التلقائية لمحتوى الدروس والامتحانات أو المساعد الذكي، قد يُرسل النص المعروض أو ما تكتبه إلى مزوّد خدمة ذكاء اصطناعي لمعالجته وإرجاع النتيجة. لا تكتب معلومات شخصية حساسة في هذه الميزات."] },
        { h: "5. المشاركة مع أطراف أخرى", p: ["لا نبيع بياناتك ولا نعرض إعلانات ولا نستخدم أدوات تتبّع إعلاني. تُستضاف البيانات وتُعالَج عبر منصة Base44 بصفتها مزوّد استضافة. تُشارَك بيانات الطالب مع مدرسته (الأستاذ ومشرف المدرسة) لأغراض التعليم والتقييم، وقد نكشف بيانات إذا اشترط القانون ذلك."] },
        { h: "6. الأطفال والقاصرون", p: ["التطبيق مخصّص للطلاب وقد يكون بعضهم دون 18 عاماً. تُنشأ حسابات المدارس بمعرفة المدرسة ومسؤوليتها، وعليها الحصول على أي موافقة من أولياء الأمور تشترطها القوانين المحلية. نجمع الحد الأدنى من البيانات اللازمة، ولا نطلب موقعاً جغرافياً ولا جهات اتصال ولا صوراً."] },
        { h: "7. الأمان", p: ["نستخدم اتصالاً مشفّراً، وجلسات دخول مؤقتة تُخزَّن بصيغة مُجزّأة (Hash) في الخادم، وعزلاً بين بيانات المدارس، وحدّاً لمحاولات تسجيل الدخول. لا يوجد نظام آمن بالكامل، ونعمل على تحسين الحماية باستمرار."] },
        { h: "8. مدة الاحتفاظ والحذف", p: ["نحتفظ بالبيانات ما دام حسابك فعّالاً. عند حذف الحساب تُحذف بياناتك الشخصية وتقدّمك ونتائجك وطلباتك وجلساتك من النظام. قد تبقى نسخ احتياطية محدودة لدى المنصة وتُزال وفق دورتها المعتادة. راجع صفحة «حذف الحساب» لمعرفة الخطوات."] },
        { h: "9. حقوقك", p: ["يمكنك طلب الاطلاع على بياناتك أو تصحيحها أو حذفها، عبر مدرستك أو بالتواصل معنا. إن كان حسابك تابعاً لمدرسة فقد تحتاج المدرسة للمشاركة في الطلب."] },
        { h: "10. التغييرات والتواصل", p: ["قد نحدّث هذه السياسة، وسنغيّر تاريخ «آخر تحديث» أعلاه. للأسئلة تواصل معنا عبر البريد الظاهر أسفل الصفحة."] }
      ]
    },
    en: {
      title: "Privacy Policy",
      intro: "This policy explains what data the “Networking Principles” (NETWORK360) app collects and why, how we protect it, and how you can control it.",
      sections: [
        { h: "1. Who we are and what the app does", p: ["“Networking Principles” is an educational platform for learning computer-networking fundamentals (lessons, a network simulator, hands-on tasks, quizzes and exams). It is normally used inside schools and is also available as an individual plan."] },
        { h: "2. Data we collect", list: [
          "Students: name, student code, school code, preferred language, and an optional email if the school provides one.",
          "Learning activity: lesson progress, quiz results, hands-on task history and points, exam access requests, your exam answers and results.",
          "Teachers and school admins: name, code, subject, and email/phone if entered.",
          "Registration requests: name, email, phone, country, school name and expected user counts.",
          "Admin accounts (owner / email-registered school admins): email and sign-in data managed by the Base44 platform.",
          "Technical data on your device: a sign-in session token, language preference and a local cache of translated content, stored in the app/browser local storage."
        ] },
        { h: "3. How we use data", list: [
          "To run your account, sign you in and show your progress.",
          "To let teachers and school admins follow their students and exam results.",
          "To approve accounts, manage subscriptions, handle registration requests and support.",
          "To keep the app stable and secure (for example limiting code-guessing attempts)."
        ] },
        { h: "4. AI features", p: ["When you use automatic translation of lessons/exams or the AI assistant, the displayed text or what you type may be sent to an AI service provider to process and return a result. Do not enter sensitive personal information in these features."] },
        { h: "5. Sharing", p: ["We do not sell your data, show ads, or use advertising trackers. Data is hosted and processed on the Base44 platform as our hosting provider. A student's data is shared with their school (teachers and school admins) for teaching and assessment. We may disclose data where required by law."] },
        { h: "6. Children and minors", p: ["The app is intended for students, some of whom may be under 18. School accounts are created by and are the responsibility of the school, which must obtain any parental consent required by local law. We collect the minimum data needed and do not request location, contacts or photos."] },
        { h: "7. Security", p: ["We use encrypted connections, short-lived sign-in sessions stored in hashed form on the server, isolation between schools' data, and limits on sign-in attempts. No system is perfectly secure and we keep improving protection."] },
        { h: "8. Retention and deletion", p: ["We keep data while your account is active. When you delete your account, your personal data, progress, results, requests and sessions are removed from the system. Limited backup copies held by the platform may remain until its normal cycle removes them. See the “Account deletion” page for the steps."] },
        { h: "9. Your rights", p: ["You may ask to access, correct or delete your data through your school or by contacting us. If your account belongs to a school, the school may need to take part in the request."] },
        { h: "10. Changes and contact", p: ["We may update this policy and will change the “Last updated” date above. For questions, contact us at the email shown at the bottom of this page."] }
      ]
    },
    he: {
      title: "מדיניות פרטיות",
      intro: "מדיניות זו מסבירה אילו נתונים אפליקציית «יסודות הרשתות» (NETWORK360) אוספת ולמה, כיצד אנו מגנים עליהם וכיצד ניתן לשלוט בהם.",
      sections: [
        { h: "1. מי אנחנו ומה האפליקציה עושה", p: ["«יסודות הרשתות» היא פלטפורמה לימודית ללימוד יסודות רשתות מחשבים (שיעורים, סימולטור רשתות, משימות מעשיות, חידונים ובחינות). היא משמשת בדרך כלל בבתי ספר וזמינה גם במסלול אישי."] },
        { h: "2. הנתונים שאנו אוספים", list: [
          "תלמידים: שם, קוד תלמיד, קוד בית ספר, שפה מועדפת, ודוא\"ל אופציונלי אם בית הספר מזין אותו.",
          "פעילות לימודית: התקדמות בשיעורים, תוצאות חידונים, היסטוריית משימות ונקודות, בקשות גישה לבחינות, תשובותיכם ותוצאותיכם.",
          "מורים ומנהלי בתי ספר: שם, קוד, מקצוע, ודוא\"ל/טלפון אם הוזנו.",
          "בקשות הרשמה: שם, דוא\"ל, טלפון, מדינה, שם בית ספר ומספר משתמשים צפוי.",
          "חשבונות ניהול (בעלים / מנהלים הרשומים בדוא\"ל): דוא\"ל ונתוני התחברות המנוהלים על ידי פלטפורמת Base44.",
          "נתונים טכניים במכשיר: אסימון התחברות, שפה מועדפת ומטמון מקומי של תרגומים — נשמרים באחסון המקומי של האפליקציה/הדפדפן."
        ] },
        { h: "3. כיצד אנו משתמשים בנתונים", list: [
          "להפעלת החשבון, התחברות והצגת ההתקדמות.",
          "לאפשר למורים ולמנהלי בית הספר לעקוב אחר תלמידיהם ותוצאות הבחינות.",
          "לאישור חשבונות, ניהול מנויים, טיפול בבקשות הרשמה ותמיכה.",
          "לשמירה על יציבות ואבטחה (למשל הגבלת ניסיונות ניחוש קודים)."
        ] },
        { h: "4. יכולות בינה מלאכותית", p: ["בעת שימוש בתרגום אוטומטי של שיעורים/בחינות או בעוזר החכם, הטקסט המוצג או מה שתכתבו עשוי להישלח לספק שירות בינה מלאכותית לעיבוד. אל תזינו מידע אישי רגיש ביכולות אלו."] },
        { h: "5. שיתוף", p: ["איננו מוכרים את הנתונים, אינם מציגים פרסומות ואינם משתמשים במעקבי פרסום. הנתונים מאוחסנים ומעובדים בפלטפורמת Base44 כספק אירוח. נתוני תלמיד משותפים עם בית הספר שלו (מורים ומנהלים) לצורכי הוראה והערכה. ייתכן שנחשוף נתונים אם החוק מחייב זאת."] },
        { h: "6. ילדים וקטינים", p: ["האפליקציה מיועדת לתלמידים, שחלקם מתחת לגיל 18. חשבונות בית ספר נוצרים באחריות בית הספר, שעליו להשיג כל הסכמת הורים הנדרשת בחוק המקומי. אנו אוספים את המינימום הנדרש ואיננו מבקשים מיקום, אנשי קשר או תמונות."] },
        { h: "7. אבטחה", p: ["אנו משתמשים בחיבור מוצפן, בהתחברויות זמניות השמורות בשרת בצורה מגובבת (Hash), בבידוד בין נתוני בתי ספר ובהגבלת ניסיונות התחברות. אין מערכת מאובטחת לחלוטין, ואנו ממשיכים לשפר את ההגנה."] },
        { h: "8. שמירה ומחיקה", p: ["הנתונים נשמרים כל עוד החשבון פעיל. עם מחיקת חשבון נמחקים הנתונים האישיים, ההתקדמות, התוצאות, הבקשות וההתחברויות מהמערכת. עותקי גיבוי מוגבלים בפלטפורמה עשויים להישאר עד שמחזור הגיבוי הרגיל יסיר אותם. ראו את הדף «מחיקת חשבון» לשלבים."] },
        { h: "9. הזכויות שלכם", p: ["ניתן לבקש גישה לנתונים, תיקונם או מחיקתם דרך בית הספר או בפנייה אלינו. אם החשבון שייך לבית ספר, ייתכן שבית הספר יצטרך להשתתף בבקשה."] },
        { h: "10. שינויים ויצירת קשר", p: ["ייתכן שנעדכן מדיניות זו ונשנה את תאריך «עודכן לאחרונה». לשאלות פנו אלינו בדוא\"ל המופיע בתחתית הדף."] }
      ]
    }
  },

  /* ───────────────────────────── شروط الاستخدام ───────────────────────────── */
  terms: {
    ar: {
      title: "شروط الاستخدام",
      intro: "باستخدامك تطبيق «مبادئ الشبكات» فإنك توافق على هذه الشروط.",
      sections: [
        { h: "1. الحساب", p: ["تُنشأ حسابات الطلاب والأساتذة ومشرفي المدارس عبر مدرستك أو المنصة. حافظ على رموز الدخول سرية ولا تشاركها، وأنت مسؤول عن النشاط الذي يتم بها. أبلغ عن أي استخدام غير مصرّح به."] },
        { h: "2. الاستخدام المقبول", list: ["استخدم التطبيق لأغراض التعلّم فقط.", "لا تحاول الدخول إلى حسابات أو بيانات غيرك، ولا تخمّن رموز الدخول، ولا تتحايل على الامتحانات أو الحدود الزمنية.", "لا تحاول تعطيل الخدمة أو اختراقها أو إساءة استخدام ميزات الذكاء الاصطناعي.", "لا تنشر محتوى مسيئاً أو غير قانوني."] },
        { h: "3. الامتحانات", p: ["تُصحَّح الامتحانات وتُحسب مدتها في الخادم. التسليم بعد انتهاء الوقت المسموح قد لا تُحتسب إجاباته. تحتفظ المدرسة بحق إعادة السماح بالامتحان أو إلغاء النتائج."] },
        { h: "4. المحتوى التعليمي والملكية", p: ["محتوى الدروس والمحاكي والواجهة محمي بحقوق الملكية الفكرية للمنصة أو أصحابه. يُسمح لك باستخدامه شخصياً لأغراض التعلّم دون نسخه أو إعادة نشره تجارياً."] },
        { h: "5. الاشتراكات للمدارس والأفراد", p: ["قد يتطلب الاستخدام اشتراكاً تتفق عليه المنصة مع المدرسة أو الفرد. قد يُعلَّق الوصول عند انتهاء الاشتراك أو تعطيل الحساب."] },
        { h: "6. إخلاء المسؤولية", p: ["نقدّم المحتوى لأغراض تعليمية «كما هو» دون ضمان خلوّه من الأخطاء أو توفره دون انقطاع. لا نتحمّل مسؤولية الخسائر غير المباشرة الناتجة عن استخدام التطبيق، بالقدر الذي يسمح به القانون."] },
        { h: "7. إنهاء الحساب", p: ["يمكنك حذف حسابك في أي وقت (راجع «حذف الحساب»). يجوز لنا أو للمدرسة تعليق الحساب أو إنهاؤه عند مخالفة هذه الشروط."] },
        { h: "8. تعديل الشروط والتواصل", p: ["قد نعدّل هذه الشروط، واستمرارك في الاستخدام يعني قبول التعديلات. للتواصل استخدم البريد الظاهر أسفل الصفحة."] }
      ]
    },
    en: {
      title: "Terms of Use",
      intro: "By using the “Networking Principles” app you agree to these terms.",
      sections: [
        { h: "1. Accounts", p: ["Student, teacher and school-admin accounts are created through your school or the platform. Keep your sign-in codes secret and do not share them; you are responsible for activity done with them. Report any unauthorised use."] },
        { h: "2. Acceptable use", list: ["Use the app for learning purposes only.", "Do not access other people's accounts or data, guess sign-in codes, or bypass exams or time limits.", "Do not disrupt or attack the service or abuse the AI features.", "Do not post abusive or unlawful content."] },
        { h: "3. Exams", p: ["Exams are graded and timed on the server. Answers submitted after the allowed time may not be counted. Your school may re-allow an exam or cancel results."] },
        { h: "4. Content and ownership", p: ["Lessons, the simulator and the interface are protected by the intellectual-property rights of the platform or its owners. You may use them personally for learning but not copy or republish them commercially."] },
        { h: "5. Subscriptions", p: ["Use may require a subscription agreed between the platform and the school or individual. Access may be suspended when a subscription ends or an account is disabled."] },
        { h: "6. Disclaimer", p: ["Content is provided for educational purposes “as is”, without a guarantee that it is error-free or always available. To the extent permitted by law we are not liable for indirect losses arising from use of the app."] },
        { h: "7. Ending your account", p: ["You can delete your account at any time (see “Account deletion”). We or your school may suspend or end an account that breaks these terms."] },
        { h: "8. Changes and contact", p: ["We may amend these terms; continued use means you accept the changes. Contact us at the email shown at the bottom of this page."] }
      ]
    },
    he: {
      title: "תנאי שימוש",
      intro: "השימוש באפליקציית «יסודות הרשתות» מהווה הסכמה לתנאים אלה.",
      sections: [
        { h: "1. חשבון", p: ["חשבונות תלמידים, מורים ומנהלי בתי ספר נוצרים דרך בית הספר או הפלטפורמה. שמרו על סודיות קודי הכניסה ואל תשתפו אותם; אתם אחראים לפעילות שנעשית בהם. דווחו על שימוש לא מורשה."] },
        { h: "2. שימוש מותר", list: ["השתמשו באפליקציה למטרות לימוד בלבד.", "אין לגשת לחשבונות או נתונים של אחרים, לנחש קודי כניסה או לעקוף בחינות ומגבלות זמן.", "אין לשבש או לתקוף את השירות או לנצל לרעה את יכולות הבינה המלאכותית.", "אין לפרסם תוכן פוגעני או בלתי חוקי."] },
        { h: "3. בחינות", p: ["בחינות נבדקות ומתוזמנות בשרת. תשובות שהוגשו לאחר הזמן המותר עשויות שלא להיספר. בית הספר רשאי לאפשר בחינה מחדש או לבטל תוצאות."] },
        { h: "4. תוכן וקניין", p: ["השיעורים, הסימולטור והממשק מוגנים בזכויות הקניין הרוחני של הפלטפורמה או בעליהם. מותר להשתמש בהם אישית ללימוד, ללא העתקה או פרסום מחדש מסחרי."] },
        { h: "5. מנויים", p: ["השימוש עשוי לדרוש מנוי שמוסכם בין הפלטפורמה לבית הספר או לאדם. הגישה עשויה להיחסם עם סיום המנוי או השבתת חשבון."] },
        { h: "6. הצהרת אי-אחריות", p: ["התוכן מסופק למטרות לימוד «כפי שהוא», ללא הבטחה לחוסר שגיאות או לזמינות רציפה. ככל שהחוק מתיר, איננו אחראים לנזקים עקיפים משימוש באפליקציה."] },
        { h: "7. סיום חשבון", p: ["ניתן למחוק את החשבון בכל עת (ראו «מחיקת חשבון»). אנו או בית הספר רשאים להשעות או לסיים חשבון שמפר תנאים אלה."] },
        { h: "8. שינויים ויצירת קשר", p: ["ייתכן שנתקן תנאים אלה; המשך השימוש משמעו הסכמה לשינויים. ליצירת קשר השתמשו בדוא\"ל המופיע בתחתית הדף."] }
      ]
    }
  },

  /* ───────────────────────────── حذف الحساب ───────────────────────────── */
  deletion: {
    ar: {
      title: "حذف الحساب",
      intro: "يمكنك حذف حسابك وبياناتك. الخطوات حسب نوع الحساب:",
      sections: [
        { h: "الطالب (مدرسة أو فردي)", list: ["سجّل الدخول ← الإعدادات ← «حذف الحساب».", "اكتب كلمة التأكيد ثم أكّد. يُحذف الحساب فوراً."] },
        { h: "الأستاذ", list: ["سجّل الدخول ← الإعدادات ← «حذف الحساب» ثم أكّد."] },
        { h: "المالك ومشرف المدرسة المسجّل بالبريد", list: ["سجّل الدخول ← الإعدادات ← «حذف الحساب» ثم أكّد."] },
        { h: "مشرف المدرسة بالرمز", p: ["حسابك مرتبط بمدرستك. لطلب حذفه أو إعادة تعيين رمز المشرف، راسلنا بالبريد الظاهر أسفل الصفحة مع ذكر اسم المدرسة ورمزها."] },
        { h: "ماذا يُحذف؟", list: ["ملفك الشخصي (الاسم والرمز والبريد واللغة).", "تقدّمك في الدروس ونتائج الاختبارات وسجل المهام العملية.", "طلبات دخول الامتحانات ونتائج امتحاناتك.", "جلسات الدخول على كل الأجهزة."], p: ["قد تبقى نسخ احتياطية محدودة لدى المنصة وتُزال وفق دورتها المعتادة. بعد الحذف لا يمكن استرجاع الحساب."] },
        { h: "لا أستطيع الدخول", p: ["إذا لم تعد قادراً على تسجيل الدخول، راسلنا بالبريد أدناه من بريد مرتبط بحسابك (أو عبر مدرستك) وسننفّذ طلب الحذف خلال 30 يوماً."] }
      ]
    },
    en: {
      title: "Account deletion",
      intro: "You can delete your account and data. The steps depend on your account type:",
      sections: [
        { h: "Student (school or individual)", list: ["Sign in → Settings → “Delete account”.", "Type the confirmation word and confirm. The account is deleted immediately."] },
        { h: "Teacher", list: ["Sign in → Settings → “Delete account” and confirm."] },
        { h: "Owner and email-registered school admin", list: ["Sign in → Settings → “Delete account” and confirm."] },
        { h: "School admin (code sign-in)", p: ["Your account belongs to your school. To request deletion or a reset of the admin code, email us at the address shown below, with your school name and code."] },
        { h: "What is deleted?", list: ["Your profile (name, code, email, language).", "Your lesson progress, quiz results and hands-on task history.", "Your exam access requests and exam results.", "Sign-in sessions on all devices."], p: ["Limited backup copies held by the platform may remain until its normal cycle removes them. Deletion cannot be undone."] },
        { h: "I can't sign in", p: ["If you can no longer sign in, email us from an address linked to your account (or through your school) and we will complete the deletion request within 30 days."] }
      ]
    },
    he: {
      title: "מחיקת חשבון",
      intro: "ניתן למחוק את החשבון והנתונים. השלבים תלויים בסוג החשבון:",
      sections: [
        { h: "תלמיד (בית ספר או אישי)", list: ["התחברו ← הגדרות ← «מחיקת חשבון».", "הקלידו את מילת האישור ואשרו. החשבון נמחק מיד."] },
        { h: "מורה", list: ["התחברו ← הגדרות ← «מחיקת חשבון» ואשרו."] },
        { h: "בעלים ומנהל בית ספר הרשום בדוא\"ל", list: ["התחברו ← הגדרות ← «מחיקת חשבון» ואשרו."] },
        { h: "מנהל בית ספר (כניסה בקוד)", p: ["החשבון קשור לבית הספר. לבקשת מחיקה או איפוס קוד מנהל, שלחו לנו דוא\"ל לכתובת שבתחתית הדף עם שם בית הספר והקוד."] },
        { h: "מה נמחק?", list: ["הפרופיל שלכם (שם, קוד, דוא\"ל, שפה).", "ההתקדמות בשיעורים, תוצאות החידונים והיסטוריית המשימות.", "בקשות הגישה לבחינות ותוצאות הבחינות.", "התחברויות בכל המכשירים."], p: ["עותקי גיבוי מוגבלים בפלטפורמה עשויים להישאר עד שמחזור הגיבוי הרגיל יסיר אותם. לא ניתן לשחזר חשבון לאחר מחיקה."] },
        { h: "איני מצליח להתחבר", p: ["אם אינכם יכולים להתחבר, שלחו לנו דוא\"ל מכתובת הקשורה לחשבון (או דרך בית הספר) ונשלים את בקשת המחיקה תוך 30 יום."] }
      ]
    }
  }
};
