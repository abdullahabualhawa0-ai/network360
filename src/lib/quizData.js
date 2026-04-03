const quizData = {
  "mac-addresses": {
    title: "اختبار: عناوين MAC",
    questions: [
      {
        question: "ما هو طول عنوان MAC؟",
        options: ["32 بت", "48 بت", "64 بت", "128 بت"],
        correct: 1,
        explanation: "عنوان MAC يتكون من 48 بت (6 بايت) ويُكتب بصيغة سداسية عشرية."
      },
      {
        question: "ما هو عنوان MAC للبث العام (Broadcast)؟",
        options: ["00:00:00:00:00:00", "FF:FF:FF:FF:FF:FF", "01:00:5E:00:00:01", "127:0:0:1"],
        correct: 1,
        explanation: "عنوان FF:FF:FF:FF:FF:FF هو عنوان البث العام الذي يُرسل لجميع الأجهزة في الشبكة المحلية."
      },
      {
        question: "ما هو بروتوكول ARP؟",
        options: ["لإرسال البريد الإلكتروني", "لمعرفة عنوان MAC من عنوان IP", "لتوزيع عناوين IP", "للتشفير"],
        correct: 1,
        explanation: "بروتوكول ARP (Address Resolution Protocol) يُستخدم للحصول على عنوان MAC عند معرفة عنوان IP فقط."
      },
      {
        question: "ما هو الجزء الأول من عنوان MAC (OUI)؟",
        options: ["رقم تسلسلي فريد", "معرف الشركة المصنعة", "رقم الشبكة", "معرف الجهاز"],
        correct: 1,
        explanation: "الـ OUI (Organizationally Unique Identifier) هو أول 3 بايت من عنوان MAC ويُحدد الشركة المصنعة."
      },
      {
        question: "أي جهاز يحتفظ بجدول عناوين MAC؟",
        options: ["جهاز التوجيه (Router)", "المحول (Switch)", "الموزع (Hub)", "الخادم (Server)"],
        correct: 1,
        explanation: "المحول (Switch) هو الذي يحتفظ بجدول MAC Address Table لتحديد على أي منفذ يوجد كل جهاز."
      }
    ]
  },
  "ipv4-addresses": {
    title: "اختبار: عناوين IPv4",
    questions: [
      {
        question: "ما هو طول عنوان IPv4؟",
        options: ["16 بت", "32 بت", "64 بت", "128 بت"],
        correct: 1,
        explanation: "عنوان IPv4 يتكون من 32 بت (4 بايت) ويُمثل بأربع مجموعات عشرية."
      },
      {
        question: "ما هو قناع الشبكة الافتراضي للشبكة من الصنف C؟",
        options: ["255.0.0.0", "255.255.0.0", "255.255.255.0", "255.255.255.255"],
        correct: 2,
        explanation: "الصنف C يستخدم قناع 255.255.255.0 أي /24، مما يسمح بـ 254 مضيف في الشبكة."
      },
      {
        question: "أي من العناوين التالية هو عنوان خاص (Private)؟",
        options: ["8.8.8.8", "172.16.0.1", "200.100.50.1", "203.0.113.1"],
        correct: 1,
        explanation: "172.16.0.1 ينتمي لنطاق العناوين الخاصة 172.16.0.0/12 التي لا تُستخدم على الإنترنت مباشرة."
      },
      {
        question: "كم عدد العناوين الإجمالية في IPv4؟",
        options: ["حوالي مليار", "حوالي 4.3 مليار", "حوالي 10 مليارات", "غير محدود"],
        correct: 1,
        explanation: "IPv4 يوفر 2^32 = حوالي 4.3 مليار عنوان، وهو ما أدى إلى نقص العناوين واعتماد IPv6."
      },
      {
        question: "ما هو استخدام الصنف D في IPv4؟",
        options: ["شبكات كبيرة", "شبكات صغيرة", "Multicast", "محجوز للتجارب"],
        correct: 2,
        explanation: "الصنف D (224.0.0.0 - 239.255.255.255) مخصص لبروتوكول Multicast لإرسال البيانات لمجموعة محددة."
      }
    ]
  },
  "dhcp": {
    title: "اختبار: بروتوكول DHCP",
    questions: [
      {
        question: "ما هي الخطوة الأولى في عملية DORA؟",
        options: ["Offer", "Discover", "Request", "Acknowledge"],
        correct: 1,
        explanation: "DORA تبدأ بـ Discover حيث يُرسل الجهاز رسالة بث للبحث عن خادم DHCP في الشبكة."
      },
      {
        question: "ما هي مدة الإيجار (Lease Time) في DHCP؟",
        options: ["المدة التي يظل فيها المستخدم متصلاً", "المدة التي يحتفظ فيها الجهاز بعنوان IP", "وقت استجابة الخادم", "مدة تخزين الجلسة"],
        correct: 1,
        explanation: "مدة الإيجار هي المدة الزمنية التي يُخصص فيها عنوان IP لجهاز معين قبل أن يحتاج لتجديده."
      },
      {
        question: "ماذا يُرسل خادم DHCP في خطوة Offer؟",
        options: ["طلب عنوان IP", "عرض عنوان IP متاح", "تأكيد التخصيص", "رسالة خطأ"],
        correct: 1,
        explanation: "في خطوة Offer، يعرض الخادم عنوان IP متاحاً مع معلومات الشبكة على الجهاز الطالب."
      },
      {
        question: "ما هي المعلومات التي يُوفرها DHCP للعميل؟",
        options: ["عنوان IP فقط", "عنوان IP وقناع الشبكة فقط", "عنوان IP وقناع الشبكة والبوابة وخادم DNS", "كلمة مرور الشبكة"],
        correct: 2,
        explanation: "DHCP يُوفر: عنوان IP، قناع الشبكة (Subnet Mask)، البوابة الافتراضية، وعنوان خادم DNS."
      },
      {
        question: "ما الفائدة الرئيسية من DHCP؟",
        options: ["تشفير البيانات", "التوزيع التلقائي للعناوين وتقليل الأخطاء", "زيادة سرعة الشبكة", "حماية الشبكة من الاختراق"],
        correct: 1,
        explanation: "DHCP يُوفر الوقت والجهد بتوزيع العناوين تلقائياً ويُقلل الأخطاء الناتجة عن الإدخال اليدوي."
      }
    ]
  },
  "nat": {
    title: "اختبار: بروتوكول NAT",
    questions: [
      {
        question: "ماذا تعني NAT؟",
        options: ["Network Access Technology", "Network Address Translation", "Network Application Transfer", "Node Access Table"],
        correct: 1,
        explanation: "NAT تعني Network Address Translation - ترجمة عناوين الشبكة من خاصة إلى عامة والعكس."
      },
      {
        question: "ما هو Inside Local في NAT؟",
        options: ["العنوان العام للجهاز الداخلي", "العنوان الخاص للجهاز داخل الشبكة", "عنوان الوجهة الخارجية", "عنوان جهاز التوجيه"],
        correct: 1,
        explanation: "Inside Local هو العنوان الخاص للجهاز كما يُعرَّف داخل الشبكة الداخلية."
      },
      {
        question: "ما هو الأمر لتعريف منفذ NAT الداخلي؟",
        options: ["ip nat outside", "ip nat inside", "ip nat enable", "nat inside enable"],
        correct: 1,
        explanation: "الأمر 'ip nat inside' يُطبق على الواجهة المتصلة بالشبكة الداخلية."
      },
      {
        question: "ما الفرق بين Static NAT وDynamic NAT؟",
        options: ["لا فرق بينهما", "Static يربط عنوان واحد بعنوان واحد، Dynamic يستخدم مجموعة عناوين", "Dynamic أكثر أماناً", "Static لا يعمل مع IPv4"],
        correct: 1,
        explanation: "Static NAT ربط ثابت 1:1، أما Dynamic NAT فيُخصص عنواناً من مجموعة (Pool) بشكل ديناميكي."
      },
      {
        question: "لماذا ظهرت الحاجة لـ NAT؟",
        options: ["لزيادة سرعة الشبكة", "لحل مشكلة نقص عناوين IPv4 العامة", "لتشفير البيانات", "لتحسين أداء التوجيه"],
        correct: 1,
        explanation: "النقص الكبير في عناوين IPv4 العامة دفع إلى استخدام NAT لمشاركة عنوان عام واحد بين أجهزة متعددة."
      }
    ]
  },
  "pat": {
    title: "اختبار: PAT/NAT Overload",
    questions: [
      {
        question: "ما الفرق الأساسي بين PAT و NAT؟",
        options: ["PAT أقدم من NAT", "PAT يستخدم أرقام المنافذ لتمييز الاتصالات", "NAT يدعم IPv6", "لا فرق بينهما"],
        correct: 1,
        explanation: "PAT يُضيف أرقام المنافذ (Port Numbers) للتمييز بين اتصالات متعددة تشارك عنوان IP واحداً."
      },
      {
        question: "ما الكلمة التي تُضاف في أمر PAT؟",
        options: ["static", "dynamic", "overload", "translate"],
        correct: 2,
        explanation: "كلمة 'overload' في نهاية أمر NAT هي ما يحول الأمر من NAT عادي إلى PAT."
      },
      {
        question: "كم جهازاً يمكن أن يتشارك عنوان IP واحد في PAT؟",
        options: ["255 جهاز فقط", "1024 جهاز", "آلاف الأجهزة", "جهازان فقط"],
        correct: 2,
        explanation: "PAT يدعم نظرياً حتى 65,535 اتصالاً متزامناً لأنه يستخدم نطاق أرقام المنافذ كاملاً."
      },
      {
        question: "في أي السيناريوهات يكون PAT الأنسب؟",
        options: ["تشغيل خادم ويب", "اتصال منزلي بالإنترنت", "ربط شبكتين خاصتين", "شبكة VPN"],
        correct: 1,
        explanation: "PAT مثالي للاتصالات المنزلية والشركات الصغيرة حيث يحتاج كثيرون لمشاركة عنوان IP عام واحد."
      },
      {
        question: "ماذا يحتفظ جهاز التوجيه في PAT؟",
        options: ["جدول عناوين MAC", "جدول ترجمة يربط العنوان الداخلي+المنفذ بالعنوان الخارجي+المنفذ", "قائمة كلمات المرور", "جدول التوجيه فقط"],
        correct: 1,
        explanation: "جهاز التوجيه يُنشئ جدول ترجمة (Translation Table) يربط كل جلسة داخلية بمنفذ خارجي فريد."
      }
    ]
  },
  "ipv6": {
    title: "اختبار: عناوين IPv6",
    questions: [
      {
        question: "ما هو طول عنوان IPv6؟",
        options: ["32 بت", "64 بت", "96 بت", "128 بت"],
        correct: 3,
        explanation: "عنوان IPv6 يتكون من 128 بت، مما يوفر عدداً هائلاً من العناوين يكفي المستقبل البعيد."
      },
      {
        question: "كيف يُكتب عنوان IPv6 المختصر 2001:0DB8:0000:0000:0000:0000:0000:0001 بشكل مختصر؟",
        options: ["2001:DB8::1", "2001:DB8:0::1", "2001::DB8::1", "2001:DB8:1"],
        correct: 0,
        explanation: "يمكن حذف الأصفار البادئة وتجميع المجموعات الصفرية المتتالية باستخدام :: مرة واحدة."
      },
      {
        question: "ما هو نوع عنوان FE80::1؟",
        options: ["Global Unicast", "Link-Local", "Multicast", "Loopback"],
        correct: 1,
        explanation: "العناوين التي تبدأ بـ FE80 هي Link-Local وتُستخدم للتواصل المحلي فقط ولا تُرسل عبر جهاز التوجيه."
      },
      {
        question: "كم مرة يمكن استخدام :: في عنوان IPv6 واحد؟",
        options: ["مرة واحدة فقط", "مرتان", "ثلاث مرات", "بدون حد"],
        correct: 0,
        explanation: "يمكن استخدام :: مرة واحدة فقط في العنوان لتجنب الالتباس في تفسير العنوان."
      },
      {
        question: "ما الذي يحل محل ARP في IPv6؟",
        options: ["DHCP", "NDP (Neighbor Discovery Protocol)", "OSPF", "NAT66"],
        correct: 1,
        explanation: "IPv6 يستخدم NDP بدلاً من ARP لاكتشاف الجيران والحصول على عناوين MAC."
      }
    ]
  },
  "ipv6-exercise": {
    title: "اختبار: تمارين عناوين IPv6",
    questions: [
      {
        question: "ما الشكل المختصر الصحيح لـ FF02:0000:0000:0000:0000:0000:0000:0001؟",
        options: ["FF02::01", "FF02::1", "FF02:0::1", "FF02:00::1"],
        correct: 1,
        explanation: "FF02::1 هو الشكل الصحيح، تُحذف الأصفار البادئة والمجموعات الصفرية باستخدام ::."
      },
      {
        question: "ما نوع العنوان ::1؟",
        options: ["Link-Local", "Global Unicast", "Loopback", "Multicast"],
        correct: 2,
        explanation: "العنوان ::1 هو عنوان Loopback في IPv6، يُعادل 127.0.0.1 في IPv4."
      },
      {
        question: "ما الصيغة الكاملة لعنوان FE80::1؟",
        options: ["FE80:0000:0000:0000:0000:0000:0000:0001", "FE80:1:0:0:0:0:0:0", "FE80:0001:0000:0000", "FE8000000001"],
        correct: 0,
        explanation: "FE80::1 يتوسع إلى FE80:0000:0000:0000:0000:0000:0000:0001 عند الكتابة الكاملة."
      },
      {
        question: "هل يحتاج IPv6 إلى NAT؟",
        options: ["نعم دائماً", "لا، لأن العناوين كافية", "أحياناً", "فقط في الشبكات الكبيرة"],
        correct: 1,
        explanation: "IPv6 يوفر عدداً كافياً من العناوين لكل جهاز على وجه الأرض، لذا لا حاجة لـ NAT."
      },
      {
        question: "ما نطاق عناوين Global Unicast في IPv6؟",
        options: ["FE80::/10", "FC00::/7", "2000::/3", "FF00::/8"],
        correct: 2,
        explanation: "عناوين Global Unicast تبدأ من النطاق 2000::/3 وهي العناوين العامة المستخدمة على الإنترنت."
      }
    ]
  },
  "vlan-gui": {
    title: "اختبار: VLAN (واجهة رسومية)",
    questions: [
      {
        question: "ما هو رقم VLAN الافتراضي في معظم المحولات؟",
        options: ["VLAN 0", "VLAN 1", "VLAN 10", "VLAN 100"],
        correct: 1,
        explanation: "VLAN 1 هو الـ VLAN الافتراضي الذي تنتمي إليه جميع المنافذ عند الإعداد الأولي."
      },
      {
        question: "ما الفائدة الرئيسية من VLANs؟",
        options: ["زيادة سرعة الشبكة", "تقليل البث وفصل حركة البيانات أمنياً", "توفير عناوين IP", "تشفير البيانات"],
        correct: 1,
        explanation: "VLANs تُقسم الشبكة منطقياً لتقليل حركة البث وتحسين الأمان بفصل أقسام الشبكة."
      },
      {
        question: "هل يمكن لجهازين في VLANs مختلفة التواصل مباشرة؟",
        options: ["نعم دائماً", "لا، يحتاجان لجهاز توجيه", "نعم إذا كانا في نفس المحول", "نعم إذا كانا في نفس الغرفة"],
        correct: 1,
        explanation: "للتواصل بين VLANs مختلفة يلزم جهاز توجيه أو Layer 3 Switch لتوجيه الحركة بينهما."
      },
      {
        question: "ما هو وضع المنفذ المناسب لتوصيل جهاز كمبيوتر؟",
        options: ["Trunk", "Access", "Dynamic", "Hybrid"],
        correct: 1,
        explanation: "وضع Access يُستخدم لتوصيل الأجهزة الطرفية (PC, Printer) وينقل حركة VLAN واحدة فقط."
      },
      {
        question: "ما وظيفة Trunk Port؟",
        options: ["توصيل كمبيوتر واحد فقط", "نقل حركة عدة VLANs بين المحولات", "زيادة سرعة المنفذ", "تشفير البيانات"],
        correct: 1,
        explanation: "منفذ Trunk يحمل حركة عدة VLANs في وقت واحد ويُستخدم لربط المحولات ببعضها أو بجهاز التوجيه."
      }
    ]
  },
  "vlan-cli": {
    title: "اختبار: VLAN (سطر الأوامر)",
    questions: [
      {
        question: "ما الأمر الصحيح لإنشاء VLAN 10 بالاسم Sales؟",
        options: ["vlan create 10 Sales", "vlan 10 / name Sales", "vlan 10 ثم name Sales", "add vlan 10 name Sales"],
        correct: 2,
        explanation: "ندخل أولاً 'vlan 10' ثم 'name Sales' داخل وضع تهيئة VLAN."
      },
      {
        question: "ما الأمر لتعيين منفذ لـ VLAN 10؟",
        options: ["switchport access vlan 10", "set port vlan 10", "vlan assign 10", "port vlan 10"],
        correct: 0,
        explanation: "الأمر 'switchport access vlan 10' يُطبق على المنفذ لتعيينه لـ VLAN 10."
      },
      {
        question: "ما الأمر لعرض ملخص VLANs؟",
        options: ["show vlan all", "display vlan", "show vlan brief", "list vlan"],
        correct: 2,
        explanation: "الأمر 'show vlan brief' يعرض ملخصاً لجميع VLANs والمنافذ المعينة لها."
      },
      {
        question: "ما الأمر لضبط منفذ كـ Trunk؟",
        options: ["switchport trunk enable", "switchport mode trunk", "set trunk on", "trunk port enable"],
        correct: 1,
        explanation: "الأمر 'switchport mode trunk' يُحول المنفذ إلى وضع Trunk."
      },
      {
        question: "أين يجب تطبيق أوامر تهيئة المنافذ؟",
        options: ["في وضع المستخدم (>)", "في وضع الامتياز (#)", "في وضع تهيئة الواجهة (config-if)", "في وضع VLAN"],
        correct: 2,
        explanation: "أوامر إعداد المنافذ تُطبق في وضع تهيئة الواجهة الذي يظهر كـ (config-if)."
      }
    ]
  },
  "router-on-stick": {
    title: "اختبار: Router on a Stick",
    questions: [
      {
        question: "ما هو مفهوم Router on a Stick؟",
        options: ["توجيه عبر عدة واجهات فيزيائية", "توجيه بين VLANs عبر واجهة فيزيائية واحدة", "توجيه لاسلكي", "توجيه IPv6 فقط"],
        correct: 1,
        explanation: "Router on a Stick يستخدم واجهة فيزيائية واحدة مقسمة إلى واجهات فرعية للتوجيه بين VLANs."
      },
      {
        question: "ما هو الأمر لإنشاء واجهة فرعية؟",
        options: ["interface sub 10", "interface Gi0/0.10", "create subinterface 10", "interface vlan 10"],
        correct: 1,
        explanation: "الواجهة الفرعية تُنشأ بإضافة نقطة ورقم بعد اسم الواجهة مثل GigabitEthernet0/0.10"
      },
      {
        question: "ما الأمر المطلوب على كل واجهة فرعية؟",
        options: ["ip nat inside", "encapsulation dot1Q [vlan-id]", "no shutdown", "ip helper-address"],
        correct: 1,
        explanation: "الأمر 'encapsulation dot1Q' يُخبر الواجهة الفرعية بـ VLAN ID الخاص بها."
      },
      {
        question: "ما وضع منفذ المحول المتصل بجهاز التوجيه؟",
        options: ["Access", "Trunk", "Dynamic", "Monitor"],
        correct: 1,
        explanation: "المنفذ يجب أن يكون Trunk لأنه ينقل حركة عدة VLANs إلى جهاز التوجيه."
      },
      {
        question: "ما عيب Router on a Stick؟",
        options: ["معقد جداً في الإعداد", "يشكل عنق زجاجة لأن كل حركة تمر عبر رابط واحد", "لا يدعم IPv4", "يحتاج لخادم DHCP خاص"],
        correct: 1,
        explanation: "الرابط الوحيد بين المحول وجهاز التوجيه يصبح نقطة اختناق عند ارتفاع حركة البيانات."
      }
    ]
  },
  "vtp": {
    title: "اختبار: بروتوكول VTP",
    questions: [
      {
        question: "ما وظيفة VTP؟",
        options: ["التوجيه بين VLANs", "إدارة VLANs مركزياً عبر عدة محولات", "تشفير حركة VLAN", "توزيع عناوين IP"],
        correct: 1,
        explanation: "VTP يُتيح إنشاء وتعديل وحذف VLANs من محول مركزي (Server) ونشرها تلقائياً."
      },
      {
        question: "أي وضع VTP لا يستطيع تعديل VLANs؟",
        options: ["Server", "Client", "Transparent", "Active"],
        correct: 1,
        explanation: "في وضع Client لا يمكن إنشاء أو تعديل VLANs، فقط استقبال وتطبيق التحديثات من الخادم."
      },
      {
        question: "ما خطر إضافة محول بـ Revision Number أعلى للشبكة؟",
        options: ["سيتوقف الشبكة", "قد يمسح جميع VLANs الموجودة", "ستزداد سرعة الشبكة", "لن يحدث شيء"],
        correct: 1,
        explanation: "محول بـ Revision Number أعلى سيُعلم بقية المحولات بإعداداته القديمة ويمسح VLANs الحالية."
      },
      {
        question: "ما أمر عرض حالة VTP؟",
        options: ["display vtp", "show vtp info", "show vtp status", "list vtp"],
        correct: 2,
        explanation: "الأمر 'show vtp status' يعرض وضع VTP والنطاق ورقم المراجعة والإصدار."
      },
      {
        question: "ما الوضع الذي يمرر رسائل VTP دون تطبيقها؟",
        options: ["Server", "Client", "Transparent", "Passive"],
        correct: 2,
        explanation: "في وضع Transparent المحول يمرر رسائل VTP لغيره لكنه يُنشئ ويدير VLANs بشكل مستقل."
      }
    ]
  },
  "static-routing": {
    title: "اختبار: التوجيه الثابت",
    questions: [
      {
        question: "ما هو التوجيه الثابت؟",
        options: ["توجيه يتعلم المسارات تلقائياً", "توجيه يُعين فيه مسارات الشبكة يدوياً", "توجيه للشبكات اللاسلكية فقط", "بروتوكول توجيه ديناميكي"],
        correct: 1,
        explanation: "التوجيه الثابت يعتمد على إدخال المسارات يدوياً من قِبل مدير الشبكة."
      },
      {
        question: "ما هو المسار الافتراضي (Default Route)؟",
        options: ["0.0.0.0 255.255.255.255", "0.0.0.0 0.0.0.0", "255.255.255.255 0.0.0.0", "192.168.0.0 0.0.0.0"],
        correct: 1,
        explanation: "المسار الافتراضي 0.0.0.0/0 يُستخدم لتوجيه أي حركة لا يوجد لها مسار محدد في جدول التوجيه."
      },
      {
        question: "ما ميزة التوجيه الثابت؟",
        options: ["يتكيف مع تغييرات الشبكة تلقائياً", "لا يستهلك موارد المعالج ويعمل بكفاءة", "يتعلم مسارات جديدة بدون تدخل", "مناسب للشبكات الكبيرة جداً"],
        correct: 1,
        explanation: "التوجيه الثابت لا يستلزم تبادل رسائل توجيه فلا يستهلك معالج جهاز التوجيه أو الحيز."
      },
      {
        question: "ما عيب التوجيه الثابت؟",
        options: ["معقد في الإعداد", "لا يتكيف تلقائياً مع تغييرات الشبكة", "يستهلك موارد كبيرة", "لا يدعم IPv4"],
        correct: 1,
        explanation: "التوجيه الثابت لا يتكيف مع الأعطال أو التغييرات، مما يجعله غير مناسب للشبكات الكبيرة."
      },
      {
        question: "ما الأمر لعرض جدول التوجيه؟",
        options: ["show routing table", "display ip route", "show ip route", "list routes"],
        correct: 2,
        explanation: "الأمر 'show ip route' يعرض جدول التوجيه بجميع مساراته (ثابتة وديناميكية وشبكات مباشرة)."
      }
    ]
  },
  "ospf": {
    title: "اختبار: بروتوكول OSPF",
    questions: [
      {
        question: "ما خوارزمية OSPF لحساب أقصر مسار؟",
        options: ["Bellman-Ford", "Dijkstra", "Floyd-Warshall", "A*"],
        correct: 1,
        explanation: "OSPF يستخدم خوارزمية Dijkstra (SPF - Shortest Path First) لحساب أقصر مسار لكل وجهة."
      },
      {
        question: "ما هي القيمة الإدارية لـ OSPF؟",
        options: ["90", "100", "110", "120"],
        correct: 2,
        explanation: "القيمة الإدارية لـ OSPF هي 110، وكلما كانت القيمة أقل كلما كان المصدر أكثر موثوقية."
      },
      {
        question: "ما وظيفة Area 0 في OSPF؟",
        options: ["تعريف العناوين الافتراضية", "هي المنطقة الرئيسية (Backbone) التي يجب أن تتصل بها جميع المناطق الأخرى", "منطقة للشبكات الخارجية", "منطقة احتياطية"],
        correct: 1,
        explanation: "Area 0 هي منطقة العمود الفقري (Backbone) ويجب أن تتصل بها جميع مناطق OSPF الأخرى."
      },
      {
        question: "ما آخر حالة في تكوين الجوار (Adjacency) في OSPF؟",
        options: ["2-Way", "Exchange", "Loading", "Full"],
        correct: 3,
        explanation: "حالة Full تعني اكتمال تبادل قواعد بيانات OSPF وأن الجهازين في جوار كامل."
      },
      {
        question: "ما أمر عرض الجيران في OSPF؟",
        options: ["show ospf neighbors", "show ip ospf neighbor", "display ospf peers", "list ospf adjacency"],
        correct: 1,
        explanation: "الأمر 'show ip ospf neighbor' يعرض قائمة الأجهزة المجاورة وحالة الجوار مع كل منها."
      }
    ]
  },
  "rip": {
    title: "اختبار: بروتوكول RIP",
    questions: [
      {
        question: "ما أقصى عدد قفزات يدعمه RIP؟",
        options: ["8", "10", "15", "255"],
        correct: 2,
        explanation: "RIP يدعم حتى 15 قفزة. عند وصول العدد إلى 16 يُعتبر الوجهة غير قابلة للوصول."
      },
      {
        question: "كل كم يُرسل RIP تحديثات التوجيه؟",
        options: ["10 ثوانٍ", "30 ثانية", "60 ثانية", "90 ثانية"],
        correct: 1,
        explanation: "RIP يُرسل جدول التوجيه الكامل كل 30 ثانية لجميع الجيران."
      },
      {
        question: "ما الفرق بين RIPv1 و RIPv2؟",
        options: ["RIPv2 أبطأ", "RIPv2 يدعم VLSM ويستخدم Multicast بدلاً من Broadcast", "RIPv1 أكثر أماناً", "لا فرق"],
        correct: 1,
        explanation: "RIPv2 يُضيف دعم VLSM والمصادقة ويستخدم 224.0.0.9 Multicast بدلاً من البث."
      },
      {
        question: "ما وظيفة الأمر 'no auto-summary'؟",
        options: ["إيقاف OSPF", "منع التلخيص التلقائي للعناوين لدعم VLSM الصحيح", "تعطيل التحديثات", "حذف جدول التوجيه"],
        correct: 1,
        explanation: "auto-summary يُلخص الشبكات تلقائياً على حدود الأصناف، وإيقافه يُتيح نشر عناوين VLSM بدقة."
      },
      {
        question: "ما القيمة الإدارية لـ RIP؟",
        options: ["90", "100", "110", "120"],
        correct: 3,
        explanation: "القيمة الإدارية لـ RIP هي 120، وهي أعلى من OSPF (110) مما يجعل OSPF مفضلاً عند توفر كلاهما."
      }
    ]
  },
  "tracert-rip": {
    title: "اختبار: TraceRT و RIP",
    questions: [
      {
        question: "ما وظيفة أمر Traceroute؟",
        options: ["اختبار سرعة الشبكة", "تتبع المسار الذي تسلكه الحزم من المصدر إلى الوجهة", "فحص ملفات الإعداد", "إرسال بريد إلكتروني"],
        correct: 1,
        explanation: "Traceroute يكشف كل جهاز توجيه يمر عبره الحزم في طريقها للوجهة."
      },
      {
        question: "ما الحقل المستخدم في Traceroute؟",
        options: ["Sequence Number", "TTL (Time to Live)", "Port Number", "MAC Address"],
        correct: 1,
        explanation: "Traceroute يُرسل حزماً بـ TTL متزايد (1, 2, 3...) وكل جهاز توجيه يُنقص TTL ويُرسل رسالة ICMP عند وصوله 0."
      },
      {
        question: "ما الرسالة التي يُرسلها جهاز التوجيه عند انتهاء TTL؟",
        options: ["ICMP Echo Reply", "ICMP Time Exceeded", "ICMP Destination Unreachable", "ICMP Redirect"],
        correct: 1,
        explanation: "عند وصول TTL إلى 0، يُرسل جهاز التوجيه رسالة ICMP Time Exceeded للمصدر."
      },
      {
        question: "ما أمر Traceroute على أجهزة Cisco؟",
        options: ["tracert", "traceroute", "trace", "path"],
        correct: 1,
        explanation: "على أجهزة Cisco وLinux يُستخدم 'traceroute'، بينما يُستخدم 'tracert' على Windows."
      },
      {
        question: "كيف يتكيف RIP عند انقطاع مسار؟",
        options: ["يتوقف فوراً", "ينتظر انتهاء مؤقت Invalid ثم يبحث عن مسار بديل", "يُرسل تنبيهاً للمدير", "لا يتكيف أبداً"],
        correct: 1,
        explanation: "RIP ينتظر 180 ثانية (Invalid Timer) قبل اعتبار المسار غير صالح والبحث عن بديل."
      }
    ]
  },
  "wireless-basics": {
    title: "اختبار: الشبكات اللاسلكية",
    questions: [
      {
        question: "ما الفرق بين Access Point وWireless Router؟",
        options: ["لا فرق بينهما", "Wireless Router يجمع توجيه + AP + محول، بينما AP يعمل كجسر فقط", "Access Point أسرع دائماً", "Wireless Router لاسلكي فقط"],
        correct: 1,
        explanation: "جهاز التوجيه اللاسلكي يدمج عدة وظائف (توجيه، DHCP، NAT، AP) بينما AP فقط يربط اللاسلكي بالسلكي."
      },
      {
        question: "ما معيار Wi-Fi الذي يدعم كلا التردين 2.4 GHz و 5 GHz؟",
        options: ["802.11a", "802.11b", "802.11g", "802.11n"],
        correct: 3,
        explanation: "802.11n (Wi-Fi 4) هو أول معيار يدعم التشغيل على كلا التردين 2.4 GHz و 5 GHz."
      },
      {
        question: "ما بروتوكول التشفير الأكثر أماناً من القائمة؟",
        options: ["WEP", "WPA", "WPA2", "Open (بدون تشفير)"],
        correct: 2,
        explanation: "WPA2 يستخدم معيار تشفير AES وهو أكثر أماناً من WEP وWPA القديمين."
      },
      {
        question: "ما هو SSID؟",
        options: ["بروتوكول أمان لاسلكي", "اسم الشبكة اللاسلكية التي تظهر للمستخدمين", "تردد الشبكة", "كلمة مرور الشبكة"],
        correct: 1,
        explanation: "SSID (Service Set Identifier) هو اسم الشبكة اللاسلكية الذي يظهر في قائمة الشبكات المتاحة."
      },
      {
        question: "لماذا يُفضل تردد 5 GHz على 2.4 GHz؟",
        options: ["مدى أبعد", "سرعة أعلى وتداخل أقل", "استهلاك طاقة أقل", "توافق مع أجهزة أقدم"],
        correct: 1,
        explanation: "5 GHz يوفر سرعات أعلى وتداخل أقل لأن معظم الأجهزة المنزلية تستخدم 2.4 GHz."
      }
    ]
  },
  "wireless-router-integration": {
    title: "اختبار: إضافة جهاز توجيه لاسلكي",
    questions: [
      {
        question: "أي منفذ يجب توصيله بالشبكة الموجودة؟",
        options: ["أحد منافذ LAN", "منفذ WAN/Internet", "المنفذ الأول فقط", "أي منفذ"],
        correct: 1,
        explanation: "منفذ WAN/Internet يجب توصيله بالشبكة الخارجية أو المزود، بينما منافذ LAN للأجهزة الداخلية."
      },
      {
        question: "ما الشرط عند إعداد شبكة LAN الداخلية؟",
        options: ["يجب أن تكون نفس شبكة WAN", "يجب أن تكون مختلفة عن شبكة WAN لتجنب التعارض", "يجب أن تبدأ بـ 10.x.x.x", "لا يهم"],
        correct: 1,
        explanation: "شبكة LAN الداخلية يجب أن تختلف عن WAN ليستطيع جهاز التوجيه التمييز بين الحركة الداخلية والخارجية."
      },
      {
        question: "أين يُفضل وضع جهاز التوجيه اللاسلكي؟",
        options: ["في الركن البعيد من المنزل", "في موقع مركزي بعيد عن العوائق المعدنية", "بجانب التلفاز", "أي مكان"],
        correct: 1,
        explanation: "الموقع المركزي يوزع الإشارة بالتساوي على جميع الأجهزة، والعوائق المعدنية تضعف الإشارة."
      },
      {
        question: "ما الخطوة التالية بعد التوصيل الفيزيائي؟",
        options: ["الاختبار مباشرة", "إعداد WAN ثم LAN ثم اللاسلكي", "تثبيت برامج خاصة", "الاتصال بالدعم الفني"],
        correct: 1,
        explanation: "الترتيب الصحيح: إعداد WAN أولاً، ثم LAN، ثم DHCP، ثم الشبكة اللاسلكية."
      },
      {
        question: "ما بروتوكول أمان يُنصح باستخدامه؟",
        options: ["WEP", "بدون كلمة مرور", "WPA2 أو WPA3", "MAC Filtering فقط"],
        correct: 2,
        explanation: "WPA2/WPA3 يوفران تشفيراً قوياً. WEP قديم وضعيف ولا يُنصح باستخدامه."
      }
    ]
  },
  "switch-security": {
    title: "اختبار: أمان المحول",
    questions: [
      {
        question: "ما وظيفة Port Security؟",
        options: ["تشفير البيانات", "تحديد عدد عناوين MAC المسموح بها على المنفذ", "زيادة سرعة المنفذ", "إدارة VLANs"],
        correct: 1,
        explanation: "Port Security يُقيد الوصول للمنفذ بناءً على عناوين MAC لمنع الأجهزة غير المصرح بها."
      },
      {
        question: "ما وضع انتهاك Port Security الذي يوقف المنفذ؟",
        options: ["Protect", "Restrict", "Shutdown", "Block"],
        correct: 2,
        explanation: "وضع Shutdown يُوقف المنفذ تلقائياً عند الكشف عن انتهاك ويتطلب إعادة تفعيل يدوية."
      },
      {
        question: "ما وظيفة الأمر 'mac-address sticky'؟",
        options: ["حذف عناوين MAC", "تعلم عناوين MAC تلقائياً وحفظها في الإعداد", "منع تعلم عناوين MAC جديدة", "زيادة عدد العناوين المسموحة"],
        correct: 1,
        explanation: "Sticky يجعل المحول يتعلم عنوان MAC المتصل تلقائياً ويحفظه كعنوان ثابت مسموح."
      },
      {
        question: "كيف تُعيد تفعيل منفذ في حالة err-disabled؟",
        options: ["إعادة تشغيل المحول", "shutdown ثم no shutdown على المنفذ", "فصل الكابل وتوصيله", "حذف VLAN"],
        correct: 1,
        explanation: "تنفيذ 'shutdown' ثم 'no shutdown' على المنفذ يُعيد تفعيله بعد معالجة سبب الإيقاف."
      },
      {
        question: "ما أفضل ممارسة لأمان المنافذ غير المستخدمة؟",
        options: ["تركها بدون إعداد", "تعطيلها وتعيينها لـ VLAN غير مستخدم", "تفعيل Port Security عليها", "تحويلها لـ Trunk"],
        correct: 1,
        explanation: "تعطيل المنافذ غير المستخدمة ونقلها لـ VLAN معزول يمنع الوصول غير المصرح به."
      }
    ]
  },
  "router-security": {
    title: "اختبار: أمان جهاز التوجيه",
    questions: [
      {
        question: "ما الفرق بين 'enable password' و 'enable secret'؟",
        options: ["لا فرق", "enable secret مشفر بـ MD5، enable password نص واضح", "enable password أقوى", "enable secret للمشرفين فقط"],
        correct: 1,
        explanation: "enable secret يُخزن كلمة المرور مشفرة بـ MD5 وهو أكثر أماناً من enable password الذي يخزنها بنص واضح."
      },
      {
        question: "ما وظيفة أمر 'service password-encryption'؟",
        options: ["تعطيل كلمات المرور", "تشفير جميع كلمات المرور في ملف الإعداد", "إنشاء كلمة مرور تلقائية", "مزامنة كلمات المرور"],
        correct: 1,
        explanation: "هذا الأمر يُشفر جميع كلمات المرور الظاهرة بنص واضح في ملف الإعداد."
      },
      {
        question: "ما بروتوكول الاتصال عن بُعد الأكثر أماناً؟",
        options: ["Telnet", "SSH", "HTTP", "FTP"],
        correct: 1,
        explanation: "SSH يُشفر جميع البيانات المتبادلة بخلاف Telnet الذي يُرسلها بنص واضح."
      },
      {
        question: "ما وظيفة Banner MOTD؟",
        options: ["اسم جهاز التوجيه", "عرض رسالة تحذيرية عند تسجيل الدخول", "إعداد كلمة المرور", "تهيئة الواجهة"],
        correct: 1,
        explanation: "Banner MOTD (Message of the Day) يعرض رسالة تحذيرية لأي شخص يحاول الوصول للجهاز."
      },
      {
        question: "ما المتطلبات اللازمة لتفعيل SSH؟",
        options: ["كلمة مرور فقط", "اسم مضيف + اسم نطاق + مفاتيح RSA + مستخدم محلي", "فقط تفعيل الخدمة", "بروتوكول SSL فقط"],
        correct: 1,
        explanation: "SSH يحتاج: hostname، ip domain-name، توليد مفاتيح RSA، ومستخدم محلي للمصادقة."
      }
    ]
  },
  "standard-acl-1": {
    title: "اختبار: قوائم التحكم بالوصول (1)",
    questions: [
      {
        question: "ما نطاق أرقام Standard ACL؟",
        options: ["1-99", "100-199", "200-299", "1-199"],
        correct: 0,
        explanation: "Standard ACL تستخدم أرقام 1-99 (وأيضاً 1300-1999 في الأرقام الموسعة)."
      },
      {
        question: "ما معيار التصفية في Standard ACL؟",
        options: ["عنوان الوجهة فقط", "عنوان المصدر فقط", "المصدر والوجهة والبروتوكول", "رقم المنفذ فقط"],
        correct: 1,
        explanation: "Standard ACL تُصفي حركة البيانات بناءً على عنوان IP المصدر فقط."
      },
      {
        question: "أين يُفضل تطبيق Standard ACL؟",
        options: ["أقرب ما يمكن من المصدر", "أقرب ما يمكن من الوجهة", "في منتصف الشبكة", "على جميع الواجهات"],
        correct: 1,
        explanation: "Standard ACL تُوضع قرب الوجهة لأنها لا تُميز الوجهة، وتطبيقها قرب المصدر قد يمنع حركة مشروعة."
      },
      {
        question: "ما هي قاعدة الـ 'deny all' الضمنية؟",
        options: ["قاعدة اختيارية", "قاعدة مخفية في نهاية كل ACL ترفض كل ما لم يُصرح به", "قاعدة تُطبق على Trunk فقط", "قاعدة لـ IPv6 فقط"],
        correct: 1,
        explanation: "كل ACL تنتهي بـ 'deny any' ضمني مخفي، لذا يجب إضافة 'permit any' صريح إذا أردت السماح بالباقي."
      },
      {
        question: "ما الـ Wildcard Mask المقابل لـ 255.255.255.0؟",
        options: ["255.255.255.255", "0.0.0.255", "0.255.255.0", "255.0.0.0"],
        correct: 1,
        explanation: "Wildcard Mask هو عكس قناع الشبكة. 255.255.255.0 معكوسها 0.0.0.255."
      }
    ]
  },
  "standard-acl-2": {
    title: "اختبار: قوائم التحكم بالوصول (2)",
    questions: [
      {
        question: "ما ميزة Named ACL على Numbered ACL؟",
        options: ["أسرع في المعالجة", "يمكن تعديل قواعد فردية دون حذف القائمة كاملة", "تدعم IPv6 فقط", "لا تحتاج تطبيق على واجهة"],
        correct: 1,
        explanation: "Named ACL يتيح إضافة وحذف وتعديل قواعد فردية، بينما Numbered ACL تُحذف بالكامل لإعادة كتابتها."
      },
      {
        question: "كيف تُطبق ACL على واجهة؟",
        options: ["access-group apply", "ip access-group [اسم/رقم] [in/out]", "apply access-list", "acl bind interface"],
        correct: 1,
        explanation: "الأمر 'ip access-group' يُطبق ACL على واجهة بتحديد الاتجاه in (داخل) أو out (خارج)."
      },
      {
        question: "ما الفرق بين 'in' و 'out' عند تطبيق ACL؟",
        options: ["لا فرق", "in: تُفلتر الحركة الداخلة للواجهة، out: تُفلتر الخارجة منها", "in للداخل الخارجي out للداخل الداخلي", "in للـ IPv4 out للـ IPv6"],
        correct: 1,
        explanation: "in تُطبق على الحزم الواصلة إلى الواجهة، وout تُطبق على الحزم الخارجة منها."
      },
      {
        question: "ما أمر عرض جميع ACLs؟",
        options: ["show acl all", "display access-list", "show access-lists", "list ip acl"],
        correct: 2,
        explanation: "الأمر 'show access-lists' يعرض جميع قوائم التحكم بالوصول المعرفة مع عداد مطابقة كل قاعدة."
      },
      {
        question: "ماذا يحدث إذا لم تتطابق أي قاعدة في ACL؟",
        options: ["يُسمح بالحزمة", "تُرفض الحزمة بسبب deny all الضمني", "تُرسل للمنفذ الافتراضي", "تُرسل للمدير"],
        correct: 1,
        explanation: "القاعدة الضمنية deny any في نهاية كل ACL تضمن رفض أي حركة لم تُطابق قاعدة صريحة."
      }
    ]
  },
  "dhcp-server": {
    title: "اختبار: خادم DHCP",
    questions: [
      {
        question: "ما الأمر لاستثناء عناوين من توزيع DHCP؟",
        options: ["ip dhcp exclude", "ip dhcp excluded-address", "no dhcp assign", "dhcp reserve"],
        correct: 1,
        explanation: "الأمر 'ip dhcp excluded-address' يُحدد العناوين التي لن يوزعها خادم DHCP (للخوادم والبوابات)."
      },
      {
        question: "ما المعلومات الضرورية في إعداد DHCP Pool؟",
        options: ["عنوان الشبكة فقط", "network + default-router على الأقل", "dns-server فقط", "lease time فقط"],
        correct: 1,
        explanation: "كحد أدنى يحتاج Pool إلى: عنوان الشبكة (network) والبوابة الافتراضية (default-router)."
      },
      {
        question: "ما أمر عرض تخصيصات DHCP الحالية؟",
        options: ["show dhcp leases", "show ip dhcp binding", "display dhcp clients", "list dhcp assignments"],
        correct: 1,
        explanation: "الأمر 'show ip dhcp binding' يعرض جميع عناوين IP المخصصة وعناوين MAC الجهازة المرتبطة بها."
      },
      {
        question: "ما لمسة الإعداد في Packet Tracer لـ DHCP؟",
        options: ["CLI → router dhcp", "Server → Services → DHCP", "Switch → DHCP tab", "PC → Network settings"],
        correct: 1,
        explanation: "في Packet Tracer، يُعد DHCP من خادم مخصص عبر تبويب Services → DHCP."
      },
      {
        question: "لماذا نستثني عناوين في DHCP؟",
        options: ["لتوفير عناوين IP", "لحجب عناوين الخوادم والأجهزة الثابتة من التوزيع التلقائي", "لزيادة أمان الشبكة", "لدعم IPv6"],
        correct: 1,
        explanation: "الخوادم وأجهزة التوجيه تحتاج عناوين IP ثابتة. استثناؤها يمنع DHCP من منحها لأجهزة أخرى."
      }
    ]
  },
  "dns-http": {
    title: "اختبار: DNS و HTTP",
    questions: [
      {
        question: "ما وظيفة DNS؟",
        options: ["تخزين الملفات", "ترجمة أسماء النطاقات إلى عناوين IP", "إرسال البريد الإلكتروني", "توزيع عناوين IP"],
        correct: 1,
        explanation: "DNS يعمل كـ'دليل هاتف' للإنترنت، يترجم www.example.com إلى عنوان IP مثل 192.168.1.10."
      },
      {
        question: "ما نوع سجل DNS الذي يربط اسم بعنوان IPv4؟",
        options: ["AAAA Record", "MX Record", "A Record", "CNAME Record"],
        correct: 2,
        explanation: "سجل A (Address) يربط اسم النطاق بعنوان IPv4. AAAA للـ IPv6، MX للبريد، CNAME للأسماء البديلة."
      },
      {
        question: "ما منفذ HTTP الافتراضي؟",
        options: ["21", "25", "80", "443"],
        correct: 2,
        explanation: "HTTP يعمل على المنفذ 80، بينما HTTPS (المشفر) يعمل على المنفذ 443."
      },
      {
        question: "ما ترتيب الخطوات عند فتح www.example.com؟",
        options: ["HTTP مباشرة ← DNS", "DNS أولاً لتحويل الاسم لـ IP ← ثم HTTP للوصول للخادم", "DHCP ← DNS ← HTTP", "التوجيه ← HTTP"],
        correct: 1,
        explanation: "الترتيب: DNS يُحول الاسم لـ IP، ثم يتصل المتصفح بخادم HTTP باستخدام هذا الـ IP."
      },
      {
        question: "ما سجل DNS المستخدم لخادم البريد؟",
        options: ["A Record", "CNAME Record", "MX Record", "NS Record"],
        correct: 2,
        explanation: "سجل MX (Mail Exchanger) يُحدد خادم البريد المسؤول عن استقبال الرسائل لنطاق معين."
      }
    ]
  },
  "email-server": {
    title: "اختبار: خادم البريد الإلكتروني",
    questions: [
      {
        question: "ما بروتوكول إرسال البريد الإلكتروني؟",
        options: ["POP3", "IMAP", "SMTP", "FTP"],
        correct: 2,
        explanation: "SMTP (Simple Mail Transfer Protocol) يُستخدم لإرسال البريد بين الخوادم وللإرسال من العميل."
      },
      {
        question: "على أي منفذ يعمل SMTP؟",
        options: ["25", "110", "143", "465"],
        correct: 0,
        explanation: "SMTP يعمل على المنفذ 25 للتواصل بين الخوادم. المنفذ 587 للإرسال المصادق."
      },
      {
        question: "ما بروتوكول استقبال البريد المستخدم في Packet Tracer؟",
        options: ["SMTP", "POP3", "IMAP", "HTTP"],
        correct: 1,
        explanation: "Packet Tracer يدعم POP3 لاسترجاع البريد. POP3 يعمل على المنفذ 110."
      },
      {
        question: "ما المعلومات اللازمة لإعداد عميل بريد؟",
        options: ["الاسم فقط", "عنوان البريد + كلمة المرور + عناوين خوادم الإرسال والاستقبال", "IP الخادم فقط", "اسم المستخدم فقط"],
        correct: 1,
        explanation: "إعداد العميل يحتاج: البريد الإلكتروني، كلمة المرور، خادم SMTP للإرسال، وخادم POP3/IMAP للاستقبال."
      },
      {
        question: "لماذا نحتاج DNS مع خادم البريد؟",
        options: ["لتشفير البريد", "لربط اسم النطاق (مثل sara@school.com) بعنوان IP الخادم", "لتوزيع عناوين IP", "لا نحتاجه"],
        correct: 1,
        explanation: "سجل MX في DNS يُحدد خادم البريد لكل نطاق، بدونه لن يعرف المرسل أين يرسل البريد."
      }
    ]
  },
  "ftp": {
    title: "اختبار: بروتوكول FTP",
    questions: [
      {
        question: "ما وظيفة بروتوكول FTP؟",
        options: ["إرسال البريد الإلكتروني", "نقل الملفات بين الأجهزة", "الوصول عن بُعد", "تصفح المواقع"],
        correct: 1,
        explanation: "FTP (File Transfer Protocol) يُستخدم لرفع وتحميل الملفات بين الخادم والعميل."
      },
      {
        question: "على أي منفذ يتلقى FTP أوامر التحكم؟",
        options: ["20", "21", "22", "23"],
        correct: 1,
        explanation: "المنفذ 21 لأوامر التحكم والتحقق من الهوية، والمنفذ 20 لنقل البيانات الفعلي."
      },
      {
        question: "ما أمر FTP لتحميل ملف من الخادم؟",
        options: ["put", "upload", "get", "download"],
        correct: 2,
        explanation: "الأمر 'get' يُحمّل ملفاً من الخادم إلى العميل، بينما 'put' يرفع ملفاً من العميل للخادم."
      },
      {
        question: "ما الفرق الرئيسي بين FTP و TFTP؟",
        options: ["FTP أسرع", "FTP يتطلب مصادقة بينما TFTP لا يتطلب", "TFTP أكثر أماناً", "TFTP يدعم ملفات أكبر"],
        correct: 1,
        explanation: "TFTP (Trivial FTP) بسيط وسريع لكنه بلا مصادقة. يُستخدم لنقل ملفات الإعداد على أجهزة الشبكة."
      },
      {
        question: "على أي منفذ يعمل TFTP؟",
        options: ["21", "22", "69", "80"],
        correct: 2,
        explanation: "TFTP يعمل على المنفذ 69 باستخدام UDP بدلاً من TCP مما يجعله أخف وأسرع."
      }
    ]
  },
  "servers-exercise": {
    title: "اختبار: تمرين الخوادم الشامل",
    questions: [
      {
        question: "ما الترتيب الصحيح لإعداد خدمات الشبكة؟",
        options: ["HTTP ← DNS ← DHCP", "DHCP ← DNS ← HTTP ← Email", "Email ← FTP ← DNS", "لا يهم الترتيب"],
        correct: 1,
        explanation: "يُفضل إعداد DHCP أولاً لتوزيع العناوين، ثم DNS للأسماء، ثم الخدمات التي تعتمد عليهما."
      },
      {
        question: "لماذا نحتاج DNS مع خادم HTTP؟",
        options: ["لتشفير المحتوى", "للوصول للموقع باسم بدلاً من عنوان IP", "لزيادة السرعة", "للتحقق من الهوية"],
        correct: 1,
        explanation: "DNS يسمح بالوصول للموقع بكتابة www.school.com بدلاً من عنوان IP مثل 192.168.1.100."
      },
      {
        question: "ما الخطوة الأولى في التحقق من عمل الشبكة؟",
        options: ["فتح موقع ويب", "اختبار ping بين الأجهزة", "إرسال بريد إلكتروني", "تسجيل الدخول لخادم FTP"],
        correct: 1,
        explanation: "ping يتحقق من الاتصال الأساسي بين الأجهزة قبل اختبار الخدمات المتقدمة."
      },
      {
        question: "ما الخادم الذي يحتاج إعداد سجل MX في DNS؟",
        options: ["HTTP Server", "FTP Server", "Email Server", "DHCP Server"],
        correct: 2,
        explanation: "خادم البريد يحتاج سجل MX في DNS لأن بروتوكول SMTP يبحث عن سجل MX لتوجيه البريد."
      },
      {
        question: "ما فائدة تمرين خادم DHCP في الشبكة؟",
        options: ["تشفير البيانات", "تجنب تعارض العناوين وتوزيعها تلقائياً على الأجهزة", "زيادة سرعة الشبكة", "إدارة VLANs"],
        correct: 1,
        explanation: "DHCP يُوزع عناوين IP تلقائياً ويمنع التعارض الناتج عن تعيين نفس العنوان لأجهزة متعددة."
      }
    ]
  },
  "telnet-router": {
    title: "اختبار: Telnet للموجه",
    questions: [
      {
        question: "ما وظيفة بروتوكول Telnet؟",
        options: ["نقل الملفات", "الاتصال عن بُعد وإدارة الأجهزة عبر سطر الأوامر", "إرسال البريد", "تصفح الإنترنت"],
        correct: 1,
        explanation: "Telnet يُتيح التحكم عن بُعد بأجهزة الشبكة كأنك جالس أمامها مباشرة."
      },
      {
        question: "ما المشكلة الأمنية الرئيسية في Telnet؟",
        options: ["بطيء جداً", "يُرسل جميع البيانات بنص واضح غير مشفر", "لا يدعم IPv6", "يحتاج موارد كثيرة"],
        correct: 1,
        explanation: "Telnet لا يُشفر البيانات، بما فيها كلمات المرور، مما يجعلها عرضة للاعتراض."
      },
      {
        question: "على أي خطوط يُعد Telnet في Cisco؟",
        options: ["Console lines", "VTY lines", "AUX lines", "Serial lines"],
        correct: 1,
        explanation: "خطوط VTY (Virtual Terminal) هي التي تُستخدم للاتصال عن بُعد عبر Telnet أو SSH."
      },
      {
        question: "ما البديل الآمن لـ Telnet؟",
        options: ["HTTP", "FTP", "SSH", "TFTP"],
        correct: 2,
        explanation: "SSH (Secure Shell) يُشفر جميع البيانات ويوفر مصادقة أقوى من Telnet."
      },
      {
        question: "ما سبب الحاجة لكلمة مرور Enable عند Telnet؟",
        options: ["لفتح الاتصال", "للانتقال من وضع المستخدم إلى وضع الامتياز", "لإنهاء الاتصال", "لتشفير البيانات"],
        correct: 1,
        explanation: "عند الاتصال بـ Telnet تبدأ في وضع المستخدم (>). للوصول لوضع الامتياز (#) تحتاج كلمة مرور Enable."
      }
    ]
  },
  "telnet-switch": {
    title: "اختبار: Telnet للمحول و SVI",
    questions: [
      {
        question: "ما هو SVI؟",
        options: ["بروتوكول توجيه", "واجهة افتراضية تمنح المحول عنوان IP للإدارة", "نوع من أنواع VLANs", "برتوكول أمان"],
        correct: 1,
        explanation: "SVI (Switch Virtual Interface) هو واجهة منطقية يُعطى لها عنوان IP لإدارة المحول عن بُعد."
      },
      {
        question: "ما الأمر لإنشاء SVI على VLAN 1؟",
        options: ["create svi vlan 1", "interface vlan 1", "svi vlan 1 enable", "add management vlan 1"],
        correct: 1,
        explanation: "الأمر 'interface vlan 1' يفتح واجهة SVI الخاصة بـ VLAN 1."
      },
      {
        question: "لماذا يحتاج المحول لـ ip default-gateway؟",
        options: ["لتفعيل VLANs", "للوصول للمحول من شبكة مختلفة", "لتفعيل SVI", "لإعداد Trunk"],
        correct: 1,
        explanation: "المحول يحتاج default-gateway للرد على الطلبات الإدارية القادمة من شبكة مختلفة عبر جهاز توجيه."
      },
      {
        question: "ما عدد خطوط VTY في المحولات عادةً؟",
        options: ["5 خطوط (0-4)", "16 خطاً (0-15)", "8 خطوط (0-7)", "32 خطاً"],
        correct: 1,
        explanation: "المحولات تدعم عادةً 16 خطاً من VTY (0-15) للسماح بـ 16 اتصالاً متزامناً."
      },
      {
        question: "ما الأمر للتحقق من عنوان IP على المحول؟",
        options: ["show ip address", "show interface brief", "show ip interface brief", "display ip"],
        correct: 2,
        explanation: "الأمر 'show ip interface brief' يعرض جميع الواجهات بما فيها SVI وعناوين IP المعيّنة."
      }
    ]
  },
  "iot-basics": {
    title: "اختبار: مبادئ IoT",
    questions: [
      {
        question: "ما تعريف إنترنت الأشياء (IoT)؟",
        options: ["شبكة كمبيوترات فقط", "شبكة أجهزة فيزيائية متصلة بالإنترنت تجمع وتشارك البيانات", "برنامج لإدارة الشبكات", "بروتوكول اتصال"],
        correct: 1,
        explanation: "IoT هو مفهوم ربط الأجهزة الفيزيائية بالإنترنت لجمع البيانات والتحكم بها عن بُعد."
      },
      {
        question: "ما وظيفة الحساس (Sensor) في IoT؟",
        options: ["تنفيذ إجراءات فيزيائية", "جمع البيانات من البيئة المحيطة", "توجيه البيانات", "تخزين البيانات"],
        correct: 1,
        explanation: "الحساسات تقيس المتغيرات البيئية كالحرارة والرطوبة والضوء وتحوّلها لبيانات رقمية."
      },
      {
        question: "ما الفرق بين Sensor و Actuator؟",
        options: ["لا فرق", "Sensor يجمع البيانات، Actuator ينفذ إجراءات فيزيائية", "Actuator أغلى دائماً", "Sensor لاسلكي فقط"],
        correct: 1,
        explanation: "Sensor يقرأ من البيئة (مدخل)، Actuator يؤثر في البيئة (مخرج) مثل تشغيل محرك أو ضوء."
      },
      {
        question: "ما وظيفة البوابة (Gateway) في IoT؟",
        options: ["تخزين البيانات", "ربط أجهزة IoT بالإنترنت والسحابة", "توليد الطاقة", "عرض البيانات"],
        correct: 1,
        explanation: "البوابة تعمل كوسيط يجمع بيانات أجهزة IoT وترسلها للسحابة أو تستقبل الأوامر منها."
      },
      {
        question: "أي من التطبيقات التالية مثال على IoT؟",
        options: ["برنامج معالج النصوص", "ترموستات ذكي يتحكم في التكييف عن بُعد", "خادم بريد إلكتروني", "برنامج تصميم"],
        correct: 1,
        explanation: "الترموستات الذكي جهاز فيزيائي متصل بالإنترنت يجمع بيانات الحرارة ويُتيح التحكم عن بُعد."
      }
    ]
  },
  "iot-terms": {
    title: "اختبار: مصطلحات IoT",
    questions: [
      {
        question: "ما معنى M2M؟",
        options: ["Mobile to Mobile", "Machine to Machine - تواصل مباشر بين الآلات", "Managed to Managed", "Multi to Multi"],
        correct: 1,
        explanation: "M2M (Machine to Machine) يشير لتواصل الأجهزة مع بعضها تلقائياً دون تدخل بشري."
      },
      {
        question: "ما بروتوكول IoT المناسب للأجهزة ذات الموارد المحدودة؟",
        options: ["HTTP", "FTP", "MQTT", "SMTP"],
        correct: 2,
        explanation: "MQTT بروتوكول خفيف الوزن مصمم خصيصاً للأجهزة ذات الموارد المحدودة وشبكات الحيز الضيق."
      },
      {
        question: "ما هو Edge Computing؟",
        options: ["معالجة البيانات في السحابة البعيدة", "معالجة البيانات قرب مصدرها لتقليل التأخير", "نوع من الحساسات", "بروتوكول اتصال"],
        correct: 1,
        explanation: "Edge Computing يُعالج البيانات قرب الجهاز المصدر بدلاً من إرسالها للسحابة، مما يُقلل التأخير."
      },
      {
        question: "ما أحد أكبر تحديات IoT؟",
        options: ["كثرة الأجهزة", "الأمان وحماية الأجهزة والبيانات من الاختراق", "ارتفاع الأسعار", "محدودية الاستخدامات"],
        correct: 1,
        explanation: "أمن IoT تحدٍّ كبير لأن ملايين الأجهزة المتصلة تُشكل أهدافاً للهجمات الإلكترونية."
      },
      {
        question: "ما البروتوكول المناسب للـ IoT في المدى الطويل؟",
        options: ["Bluetooth", "Wi-Fi", "LoRaWAN", "NFC"],
        correct: 2,
        explanation: "LoRaWAN مناسب للمسافات الطويلة (كيلومترات) بطاقة منخفضة جداً، مثالي للمدن الذكية والزراعة."
      }
    ]
  },
  "iot-wireless": {
    title: "اختبار: المكونات اللاسلكية في IoT",
    questions: [
      {
        question: "ما تقنية الاتصال الأنسب لجهاز استشعار بعيد في حقل زراعي؟",
        options: ["Bluetooth", "Wi-Fi", "NFC", "LoRa"],
        correct: 3,
        explanation: "LoRa يصل لمسافات تصل لـ 15 كم بطاقة منخفضة جداً، مثالي للتطبيقات الزراعية البعيدة."
      },
      {
        question: "ما تقنية NFC؟",
        options: ["اتصال بعيد المدى", "اتصال لاسلكي قصير جداً (حتى 10 سم)", "بروتوكول سحابي", "شبكة محلية"],
        correct: 1,
        explanation: "NFC (Near Field Communication) يعمل على مسافة لا تتجاوز 10 سم، مستخدم في الدفع الإلكتروني والبطاقات الذكية."
      },
      {
        question: "ما تقنية الاتصال الأنسب للساعة الذكية؟",
        options: ["LoRa", "Wi-Fi", "BLE (Bluetooth Low Energy)", "Zigbee"],
        correct: 2,
        explanation: "BLE مثالي للأجهزة القابلة للارتداء لاستهلاكه المنخفض جداً للطاقة مع مدى كافٍ."
      },
      {
        question: "ما ميزة Zigbee عن Wi-Fi؟",
        options: ["Zigbee أسرع", "Zigbee أكثر أماناً", "Zigbee يستهلك طاقة أقل بكثير", "Zigbee مدى أبعد"],
        correct: 2,
        explanation: "Zigbee مصمم للأجهزة ذات البطارية المحدودة، يستهلك طاقة أقل بكثير من Wi-Fi."
      },
      {
        question: "أي تقنية تستخدم في أتمتة المنزل مثل إضاءة Philips Hue؟",
        options: ["LoRa", "Zigbee", "NFC", "Bluetooth Classic"],
        correct: 1,
        explanation: "Zigbee شائع جداً في أتمتة المنازل وإضاءة الأجهزة الذكية لكفاءته في الطاقة وقدرته على شبكات Mesh."
      }
    ]
  }
};

export default quizData;