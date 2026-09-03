/**
 * quizzesNew.js — اختبارات الوحدات الجديدة من المنهج الرسمي
 * تُدمج مع الاختبارات القديمة في quizData.js
 */

export const NEW_UNIT_QUIZZES = {
  "network-components": {
    title: "اختبار: مكونات الشبكة الأساسية",
    questions: [
      {
        question: "ما الفرق بين End Device و Intermediary Device؟",
        options: ["لا فرق", "End Device مصدر أو وجهة للبيانات، Intermediary ينقلها", "End Device أسرع", "Intermediary يعمل بلا كهرباء"],
        correct: 1,
        explanation: "أجهزة النهاية (PC, Printer) هي مصدر أو وجهة البيانات، أما الأجهزة الوسيطة (Router, Switch) فتنقل وتوجه البيانات."
      },
      {
        question: "ما الفرق بين شبكة LAN و WAN؟",
        options: ["LAN عالمية و WAN محلية", "LAN محلية بمبنى واحد و WAN تغطي مناطق جغرافية واسعة", "LAN لاسلكية فقط", "WAN أبطأ دائماً"],
        correct: 1,
        explanation: "LAN تغطي مساحة محدودة كمبنى أو مكتب، بينما WAN تربط شبكات LAN عبر مسافات جغرافية واسعة."
      },
      {
        question: "ما الفرق بين بنية Peer-to-Peer و Client-Server؟",
        options: ["لا فرق", "P2P الأجهزة تتصل مباشرة ببعضها، Client-Server عبر خادم مركزي", "Client-Server أرخص", "P2P تحتاج خادماً"],
        correct: 1,
        explanation: "في P2P كل جهاز يلعب دوري المرسل والمستقبل، أما Client-Server فيكون هناك خادم مركزي يقدم الخدمات."
      },
      {
        question: "ما وظيفة برنامج Cisco Packet Tracer؟",
        options: ["تصفح الإنترنت", "محاكاة الشبكات واختبارها قبل تنفيذها فعلياً", "إدارة الخوادم", "تشفير البيانات"],
        correct: 1,
        explanation: "Packet Tracer محاكي شبكات يتيح تصميم الشبكات واختبارها وتجربة الإعدادات بدون معدات حقيقية."
      },
      {
        question: "ما الفرق بين الطوبولوجيا الفيزيائية والمنطقية؟",
        options: ["لا فرق", "الفيزيائية ترتيب الكابلات والأجهزة فعلياً، المنطقية طريقة تدفق البيانات", "المنطقية أوضح دائماً", "الفيزيائية للشبكات الصغيرة فقط"],
        correct: 1,
        explanation: "الطوبولوجيا الفيزيائية تصف الترتيب المادي، بينما المنطقية تصف مسار البيانات الفعلي وقد تختلف عنها."
      }
    ]
  },
  "packet-tracer-intro": {
    title: "اختبار: برنامج Packet Tracer",
    questions: [
      {
        question: "ما الفرق بين Realtime Mode و Simulation Mode؟",
        options: ["لا فرق", "Realtime فوري كالواقع، Simulation يعرض الحزم خطوة بخطوة", "Simulation أسرع", "Realtime للمحاكاة فقط"],
        correct: 1,
        explanation: "Realtime يحاكي عمل الشبكة الفوري، أما Simulation فيُوقف الحزم ويعرض رحلتها طبقة بطبقة — مثالي للتعلم."
      },
      {
        question: "أي كابل يُستخدم لتوصيل PC بـ Switch مباشرة؟",
        options: ["Crossover", "Copper Straight-through", "Serial", "Fiber"],
        correct: 1,
        explanation: "كابل Straight-through يُستخدم لتوصيل الأجهزة الطرفية بالمحولات؛ Crossover كان يُستخدم بين جهازين متشابهين."
      },
      {
        question: "ما الهدف من Logical Workspace؟",
        options: ["عرض المبنى الفيزيائي", "تصميم الشبكة منطقياً بالرموز والخطوط", "تشغيل التطبيقات", "طباعة التصميم"],
        correct: 1,
        explanation: "Logical Workspace يعرض الشبكة كمخطط منطقي بالرموز، بينما Physical Workspace يعرضها في بيئة مبنية حقيقية."
      },
      {
        question: "ما الخطوة الأخيرة بعد توصيل جهازين في Packet Tracer؟",
        options: ["طباعة التصميم", "اختبار الاتصال بأمر ping", "حفظ الصورة", "إيقاف البرنامج"],
        correct: 1,
        explanation: "بعد التوصيل وإدخال عناوين IP، يتم اختبار الاتصال بين الجهازين باستخدام الأمر ping."
      }
    ]
  },
  "ios-access-modes": {
    title: "اختبار: أوضاع الوصول إلى IOS",
    questions: [
      {
        question: "ما هو الرمز الذي يسبق الأوامر في Privileged EXEC Mode؟",
        options: ["Router>", "Router#", "Router(config)#", "Router(config-if)#"],
        correct: 1,
        explanation: "علامة # تدل على وضع الامتياز (Privileged EXEC) حيث تتوفر أوامر الفحص والإدارة."
      },
      {
        question: "ما الأمر للانتقال من User EXEC إلى وضع الامتياز؟",
        options: ["config t", "enable", "exit", "login"],
        correct: 1,
        explanation: "الأمر enable ينقل من وضع المستخدم (>) إلى وضع الامتياز (#)."
      },
      {
        question: "في أي وضع يظهر السطر Router(config-if)#؟",
        options: ["الإعداد العام", "إعداد الواجهة", "إعداد الخطوط", "وضع المستخدم"],
        correct: 1,
        explanation: "config-if يعني أنك داخل وضع إعداد واجهة محددة بعد الأمر interface."
      },
      {
        question: "ما وظيفة علامة الاستفهام (?) في IOS؟",
        options: ["إلغاء الأمر", "عرض الأوامر المتاحة في الموضع الحالي", "الخروج", "حفظ الإعدادات"],
        correct: 1,
        explanation: "كتابة ? تعرض قائمة بكل الأوامر الممكنة في موضع المؤشر الحالي — أداة تعلم أساسية."
      },
      {
        question: "أي بروتوكول وصول عن بُعد يُشفر البيانات؟",
        options: ["Telnet", "SSH", "HTTP", "TFTP"],
        correct: 1,
        explanation: "SSH يُشفر جميع البيانات المتبادلة، بينما Telnet يُرسلها بنص واضح بما فيه كلمات المرور."
      }
    ]
  },
  "ios-initial-config": {
    title: "اختبار: الإعدادات الأولية",
    questions: [
      {
        question: "أين يُخزن startup-config؟",
        options: ["RAM", "NVRAM", "Flash", "ROM"],
        correct: 1,
        explanation: "startup-config يُخزن في NVRAM ويبقى بعد إعادة التشغيل، بينما running-config في RAM ويزول بانقطاع الطاقة."
      },
      {
        question: "ما الأمر لحفظ الإعدادات الحالية؟",
        options: ["save config", "copy running-config startup-config", "write memory only", "store config"],
        correct: 1,
        explanation: "copy running-config startup-config ينسخ الإعداد النشط من RAM إلى NVRAM ليُحفظ بعد إعادة التشغيل."
      },
      {
        question: "ما وظيفة الأمر service password-encryption؟",
        options: ["إنشاء كلمات مرور", "تشفير كلمات المرور الظاهرة بنص واضح", "حذف كلمات المرور", "توليد مفاتيح RSA"],
        correct: 1,
        explanation: "هذا الأمر يُشفر جميع كلمات المرور المخزنة بنص واضح في ملف الإعداد."
      },
      {
        question: "ما أمر إعطاء المحول عنوان IP للإدارة؟",
        options: ["ip address على المنفذ الفيزيائي", "interface vlan 1 ثم ip address", "ip management address", "switchport ip"],
        correct: 1,
        explanation: "المحول يُدار عبر SVI — ندخل interface vlan 1 ونُعين له عنوان IP مع ip default-gateway."
      },
      {
        question: "ما الأمر لعرض ملخص الواجهات وعناوينها؟",
        options: ["show interfaces all", "show ip interface brief", "display interfaces", "show ports"],
        correct: 1,
        explanation: "show ip interface brief يعرض جدولاً مختصراً بكل الواجهات وعناوينها وحالتها."
      }
    ]
  },
  "osi-tcpip-models": {
    title: "اختبار: نموذجا OSI و TCP/IP",
    questions: [
      {
        question: "كم عدد طبقات نموذج OSI؟",
        options: ["4", "5", "7", "9"],
        correct: 2,
        explanation: "OSI يتكون من 7 طبقات: Application, Presentation, Session, Transport, Network, Data Link, Physical."
      },
      {
        question: "ما وحدة البيانات (PDU) في طبقة Network؟",
        options: ["Frame", "Packet", "Segment", "Bits"],
        correct: 1,
        explanation: "الترتيب: Transport=Segment، Network=Packet، Data Link=Frame، Physical=Bits."
      },
      {
        question: "أي طبقة مسؤولة عن التوجيه (Routing)؟",
        options: ["Transport", "Network", "Session", "Physical"],
        correct: 1,
        explanation: "طبقة الشبكة (Network - Layer 3) مسؤولة عن التوجيه والعنونة المنطقية بعناوين IP."
      },
      {
        question: "طبقة Internet في نموذج TCP/IP تعادل أي طبقة في OSI؟",
        options: ["Transport", "Network", "Application", "Data Link"],
        correct: 1,
        explanation: "طبقة Internet في TCP/IP تعادل طبقة Network في OSI وتقوم بنفس وظيفة التوجيه عبر IP."
      },
      {
        question: "ماذا يحدث للرؤوس (Headers) عند استقبال البيانات؟",
        options: ["تُضاف طبقة بطبقة", "تُزال طبقة بطبقة (De-encapsulation)", "تبقى كما هي", "تُشفّر من جديد"],
        correct: 1,
        explanation: "عند الاستقبال تُزال رؤوس الطبقات تدريجياً من الأسفل للأعلى حتى تصل البيانات الصافية للتطبيق."
      }
    ]
  },
  "physical-media": {
    title: "اختبار: وسائط الطبقة الفيزيائية",
    questions: [
      {
        question: "ما أقصى مسافة لكابل UTP؟",
        options: ["10 أمتار", "100 متر", "2 كم", "100 كم"],
        correct: 1,
        explanation: "كابلات النحاس UTP تعمل لمسافة 100 متر كحد أقصى قبل ضعف الإشارة."
      },
      {
        question: "ما الفرق بين Single-mode و Multi-mode في الألياف؟",
        options: ["لا فرق", "Single-mode لمسافات طويلة جداً و Multi-mode لمسافات قصيرة", "Multi-mode أسرع", "Single-mode أرخص"],
        correct: 1,
        explanation: "Single-mode يستخدم نبضة ضوئية واحدة لمسافات تصل لكيلومترات، وMulti-mode عدة أنماط لمسافات أقصر."
      },
      {
        question: "ميزة Auto-MDIX في المحولات الحديثة؟",
        options: ["زيادة السرعة", "كشف نوع الكابل تلقائياً (Straight/Crossover)", "التشفير", "توفير الطاقة"],
        correct: 1,
        explanation: "Auto-MDIX تجعل المحول يكتشف نوع الكابل تلقائياً فلا حاجة للتمييز بين Straight-through و Crossover."
      },
      {
        question: "لماذا تُستخدم كابلات STP بدلاً من UTP في المصانع؟",
        options: ["أرخص", "محمية ضد التشويش الكهرومغناطيسي", "أطول", "أسهل في التركيب"],
        correct: 1,
        explanation: "STP تحتوي على طبقة درع معدنية تحمي من التشويش الكهرومغناطيسي الشائع في البيئات الصناعية."
      },
      {
        question: "ما الفرق بين Bandwidth و Throughput؟",
        options: ["نفس الشيء", "Bandwidth السعة النظرية و Throughput السرعة الفعلية", "Throughput نظري", "Bandwidth لاسلكي فقط"],
        correct: 1,
        explanation: "Bandwidth هي السعة النظرية للوصلة، أما Throughput فهي معدل النقل الفعلي بعد الحساب بالأعباء والفقد."
      }
    ]
  },
  "binary-system": {
    title: "اختبار: أنظمة العد والترقيم",
    questions: [
      {
        question: "ما قيمة 11000000 بالنظام العشري؟",
        options: ["128", "192", "224", "255"],
        correct: 1,
        explanation: "11000000 = 128 + 64 = 192. القيم المضاءة: البت الأول (128) والثاني (64)."
      },
      {
        question: "كم بت في الـ Octet الواحد؟",
        options: ["4", "8", "16", "32"],
        correct: 1,
        explanation: "الـ Octet هو 8 بتات، وعنوان IPv4 يتكون من 4 Octets أي 32 بت."
      },
      {
        question: "ما قيمة FF بالنظام العشري؟",
        options: ["15", "16", "255", "256"],
        correct: 2,
        explanation: "FF في السداسي عشري = 15×16 + 15 = 255، وهي قناع /32 وقيمة البث MAC."
      },
      {
        question: "لماذا يُستخدم النظام السداسي عشري في عناوين MAC؟",
        options: ["لجماله فقط", "لتمثيل 48 بت بشكل مختصر (12 خانة)", "لأنه أسرع", "لأن الشبكات لا تفهم الثنائي"],
        correct: 1,
        explanation: "كل خانة سداسية تمثل 4 بتات، فيُمثل عنوان MAC بـ 12 خانة بدلاً من 48 بت."
      },
      {
        question: "قيم البتات في Octet من اليسار هي:",
        options: ["1,2,4,8...", "128,64,32,16,8,4,2,1", "256,128,64...", "لا قيم ثابتة"],
        correct: 1,
        explanation: "قيم المواقع من اليسار لليمين: 128، 64، 32، 16، 8، 4، 2، 1 — أساس كل تحويل ثنائي."
      }
    ]
  },
  "data-link-functions": {
    title: "اختبار: طبقة ربط البيانات",
    questions: [
      {
        question: "ما معيار الشبكات المحلية السلكية الأكثر استخداماً؟",
        options: ["802.11", "802.3 (Ethernet)", "802.15", "802.1Q"],
        correct: 1,
        explanation: "IEEE 802.3 هو معيار Ethernet المستخدم في جميع الشبكات المحلية السلكية تقريباً."
      },
      {
        question: "ما الفرق بين Full-Duplex و Half-Duplex؟",
        options: ["لا فرق", "Full-Duplex إرسال واستقبال معاً، Half-Duplex أحدهما فقط", "Half-Duplex أسرع", "Full-Duplex للاسلكي فقط"],
        correct: 1,
        explanation: "Full-Duplex يسمح بالإرسال والاستقبال في نفس الوقت، وHalf-Duplex باتجاه واحد في كل مرة."
      },
      {
        question: "ما وظيفة حقل FCS في إطار Ethernet؟",
        options: ["عنوان الوجهة", "كشف أخطاء الإطار", "رقم VLAN", "نوع البروتوكول"],
        correct: 1,
        explanation: "FCS (Frame Check Sequence) يحتوي قيمة CRC لكشف أخطاء الإطار أثناء النقل."
      },
      {
        question: "ما طريقة التحكم بالوصول للشبكات اللاسلكية؟",
        options: ["CSMA/CD", "CSMA/CA", "Token Passing", "Polling"],
        correct: 1,
        explanation: "اللاسلكي يستخدم CSMA/CA (تجنب التصادم) لأن كشف التصادم غير ممكن عملياً في الأثير."
      }
    ]
  },
  "network-layer-functions": {
    title: "اختبار: طبقة الشبكة",
    questions: [
      {
        question: "ماذا يحدث لقيمة TTL عند مرور الحزمة بكل راوتر؟",
        options: ["تزيد 1", "تنقص 1", "لا تتغير", "تتضاعف"],
        correct: 1,
        explanation: "كل جهاز توجيه يُنقص TTL بمقدار 1، وعند الوصول لصفر تُسقط الحزمة ويُرسل ICMP Time Exceeded."
      },
      {
        question: "ماذا يفعل المضيف إذا كانت الوجهة في شبكة مختلفة؟",
        options: ["يُسقط الحزمة", "يُرسلها للـ Default Gateway", "يُبثها للجميع", "ينتظر DNS"],
        correct: 1,
        explanation: "إذا كانت الوجهة خارج شبكته، يُرسل الحزمة إلى البوابة الافتراضية (الراوتر) لتوجيهها."
      },
      {
        question: "أي بروتوكول يشير له حقل Protocol بقيمة 6؟",
        options: ["UDP", "TCP", "ICMP", "ARP"],
        correct: 1,
        explanation: "القيمة 6 تعني TCP، و17 تعني UDP، و1 تعني ICMP."
      },
      {
        question: "كم بت في عنوان IPv6؟",
        options: ["32", "64", "128", "256"],
        correct: 2,
        explanation: "IPv6 يستخدم 128 بت مقابل 32 بت في IPv4، مما يوفر فضاء عناوين شبه غير محدود."
      }
    ]
  },
  "arp-protocol": {
    title: "اختبار: بروتوكول ARP",
    questions: [
      {
        question: "ما وظيفة ARP؟",
        options: ["توزيع عناوين IP", "معرفة عنوان MAC من عنوان IP", "توجيه الحزم", "تشفير البيانات"],
        correct: 1,
        explanation: "ARP يحوّل عنوان IP معروف إلى عنوان MAC مجهول لإكمال تسليم الإطار في الشبكة المحلية."
      },
      {
        question: "كيف يُرسل ARP Request؟",
        options: ["Unicast", "Broadcast", "Multicast", "Anycast"],
        correct: 1,
        explanation: "ARP Request يُرسل بثاً شاملاً (Broadcast) لأن العميل لا يعرف من يملك العنوان المطلوب."
      },
      {
        question: "إلى من يُرسل PC الـ ARP Request إذا كانت الوجهة في شبكة أخرى؟",
        options: ["للوجهة مباشرة", "للـ Default Gateway", "للجميع على الإنترنت", "لا يُرسل شيئاً"],
        correct: 1,
        explanation: "يُرسل ARP للبوابة الافتراضية؛ الراوتر يرد بعنوان MAC واجهته ثم يوجه الحزمة للوجهة."
      },
      {
        question: "ما أمر عرض جدول ARP على Windows؟",
        options: ["arp -a", "show arp table", "display mac", "ip arp"],
        correct: 0,
        explanation: "arp -a تعرض جدول ARP المحلي. وعلى أجهزة Cisco: show arp."
      }
    ]
  },
  "router-basic-config": {
    title: "اختبار: الإعداد الأساسي للراوتر",
    questions: [
      {
        question: "ما الأمر لتهيئة واجهة بـ IP وتشغيلها؟",
        options: ["ip 192.168.1.1 / enable", "ip address 192.168.1.1 255.255.255.0 ثم no shutdown", "set ip interface", "ip interface enable"],
        correct: 1,
        explanation: "داخل الواجهة: ip address ثم no shutdown لتفعيلها — الواجهات تأتي معطلة (administratively down) افتراضياً."
      },
      {
        question: "لماذا نستخدم no shutdown على الواجهة؟",
        options: ["لإيقافها", "لتفعيلها", "لحفظها", "لحذفها"],
        correct: 1,
        explanation: "الواجهات في أجهزة Cisco معطلة إدارياً افتراضياً، وno shutdown يفعّلها."
      },
      {
        question: "ما أمر التحقق السريع من حالة جميع الواجهات؟",
        options: ["show interfaces detail", "show ip interface brief", "show config", "list interfaces"],
        correct: 1,
        explanation: "show ip interface brief يعرض جميع الواجهات مع عناوينها وحالتها في جدول واحد موجز."
      },
      {
        question: "ما وظيفة ip default-gateway على المحول؟",
        options: ["تفعيل VLANs", "تمكين الوصول الإداري للمحول من شبكة بعيدة", "توزيع عناوين", "إنشاء Trunk"],
        correct: 1,
        explanation: "المحول L2 لا يوجّه، لكنه يحتاج بوابة افتراضية ليُدار من شبكات أخرى عبر الراوتر."
      }
    ]
  },
  "ipv4-broadcast-types": {
    title: "اختبار: أنواع البث في IPv4",
    questions: [
      {
        question: "ما عنوان البث المحدود (Limited Broadcast)؟",
        options: ["192.168.1.255", "255.255.255.255", "127.0.0.1", "0.0.0.0"],
        correct: 1,
        explanation: "255.255.255.255 هو البث المحدود الذي لا تمرره الراوترات، ويستخدم في DHCP Discover مثلاً."
      },
      {
        question: "هل تمرر الراوترات رسائل Broadcast؟",
        options: ["نعم دائماً", "لا، الراوتر يحد من نطاق البث", "فقط OSPF", "فقط RIP"],
        correct: 1,
        explanation: "الراوتر يفصل نطاقات البث — رسالة البث تبقى داخل شبكتها المحلية."
      },
      {
        question: "ما نطاق عناوين Multicast؟",
        options: ["127.0.0.0/8", "169.254.0.0/16", "224.0.0.0 - 239.255.255.255", "240.0.0.0/4"],
        correct: 2,
        explanation: "الصنف D من 224 إلى 239 مخصص للـ Multicast مثل بروتوكولات التوجيه OSPF (224.0.0.5)."
      },
      {
        question: "ما معنى عنوان 192.168.1.255 في شبكة /24؟",
        options: ["أول جهاز", "عنوان الشبكة", "البث الموجه (Directed Broadcast)", "البوابة"],
        correct: 2,
        explanation: "آخر عنوان في الشبكة هو البث الموجه — يصل لجميع أجهزة تلك الشبكة المحددة."
      }
    ]
  },
  "icmp-ping-traceroute": {
    title: "اختبار: ICMP و Ping و Traceroute",
    questions: [
      {
        question: "ماذا تعني علامة ! في نتيجة ping؟",
        options: ["فشل الاستجابة", "نجح الاستلام", "وجهة غير موجودة", "انتهاء المهلة"],
        correct: 1,
        explanation: "علامة ! تعني استلام رد ناجح، والنقطة . تعني انتهاء المهلة، وU تعني غير قابل للوصول."
      },
      {
        question: "ما أول اختبار ping يجب تنفيذه لتشخيص الاتصال؟",
        options: ["ping 8.8.8.8", "ping 127.0.0.1", "ping www.google.com", "ping البوابة"],
        correct: 1,
        explanation: "ping 127.0.0.1 يختبر حزمة TCP/IP داخل الجهاز نفسه — إذا فشل فالمشكلة محلية."
      },
      {
        question: "كيف يعمل Traceroute؟",
        options: ["يرسل حزماً بـ TTL متزايد", "يسأل كل راوتر مباشرة", "يفحص الكابلات", "يستخدم DNS"],
        correct: 0,
        explanation: "يبدأ بـ TTL=1 فيرد الراوتر الأول، ثم TTL=2 فيرد الثاني... حتى تصل الحزمة للوجهة."
      },
      {
        question: "ما رسالة ICMP التي يرسلها الراوتر عند انتهاء TTL؟",
        options: ["Echo Reply", "Time Exceeded", "Destination Unreachable", "Redirect"],
        correct: 1,
        explanation: "ICMP Time Exceeded تعيد للمصدر معرفة أن الحزمة سقطت عندها لانتهاء عمرها."
      }
    ]
  },
  "tcp-udp": {
    title: "اختبار: TCP و UDP",
    questions: [
      {
        question: "ما بروتوكول يضمن وصول البيانات وترتيبها؟",
        options: ["UDP", "TCP", "ICMP", "ARP"],
        correct: 1,
        explanation: "TCP موجه بالاتصال ويضمن الوصول والترتيب وإعادة الإرسال عند الفقد."
      },
      {
        question: "ما خطوات Three-Way Handshake؟",
        options: ["ACK, SYN, FIN", "SYN, SYN-ACK, ACK", "OFFER, REQUEST, ACK", "DISCOVER, OFFER, REQUEST"],
        correct: 1,
        explanation: "SYN ثم SYN-ACK ثم ACK — بها يُنشأ اتصال TCP قبل تبادل أي بيانات."
      },
      {
        question: "أي خدمة تستخدم UDP؟",
        options: ["HTTP", "FTP", "DNS", "SSH"],
        correct: 2,
        explanation: "DNS يستخدم UDP للسرعة (استعلامات خفيفة)، وكذلك DHCP وTFTP والبث المباشر."
      },
      {
        question: "ما نطاق Well Known Ports؟",
        options: ["0-1023", "1024-49151", "49152-65535", "0-65535"],
        correct: 0,
        explanation: "0-1023 للبروتوكولات الرئيسية (HTTP 80, SSH 22)، و1024-49151 مسجلة، والباقي ديناميكية."
      }
    ]
  },
  "application-protocols": {
    title: "اختبار: بروتوكولات طبقة التطبيقات",
    questions: [
      {
        question: "ما منفذ HTTPS؟",
        options: ["80", "443", "8080", "22"],
        correct: 1,
        explanation: "HTTPS يعمل على المنفذ 443 مع تشفير TLS/SSL، بينما HTTP العادي على 80."
      },
      {
        question: "ما البروتوكول المستخدم لإرسال البريد؟",
        options: ["POP3", "SMTP", "IMAP", "DNS"],
        correct: 1,
        explanation: "SMTP (المنفذ 25) يُستخدم للإرسال، وPOP3 (110) وIMAP (143) للاستلام."
      },
      {
        question: "ما وظيفة DHCP على المنفذ 67/68؟",
        options: ["ترجمة الأسماء", "توزيع عناوين IP تلقائياً", "نقل الملفات", "إدارة الشبكة"],
        correct: 1,
        explanation: "DHCP يوزع عناوين IP والإعدادات تلقائياً عبر عملية DORA باستخدام UDP."
      },
      {
        question: "ما الفرق بين IMAP و POP3؟",
        options: ["لا فرق", "IMAP يُبقي البريد على الخادم، POP3 ينزله للجهاز", "POP3 أحدث", "IMAP أسرع"],
        correct: 1,
        explanation: "IMAP يزامن البريد مع الخادم (يبقى هناك)، وPOP3 ينزله ويحذفه عادة من الخادم."
      }
    ]
  },
  "advanced-switch-router": {
    title: "اختبار: الإعدادات المتقدمة",
    questions: [
      {
        question: "ما أول خطوة لتفعيل SSH على جهاز؟",
        options: ["إنشاء مستخدم", "تعريف hostname و ip domain-name لتوليد مفاتيح RSA", "فتح المنفذ 22", "تشغيل Telnet"],
        correct: 1,
        explanation: "توليد مفاتيح RSA يتطلب اسم جهاز واسم نطاق، ثم crypto key generate rsa."
      },
      {
        question: "ما وظيفة واجهة Loopback؟",
        options: ["ربط شبكات خارجية", "معرف دائم للجهاز لا يسقط أبداً (Router ID)", "توزيع عناوين", "مراقبة الحزم"],
        correct: 1,
        explanation: "Loopback واجهة منطقية دائمة Up تُستخدم كـ Router ID في OSPF وللإدارة عن بعد."
      },
      {
        question: "ما ترتيب إقلاع المحول الصحيح؟",
        options: ["IOS ← NVRAM ← Bootstrap", "Bootstrap ← IOS من Flash ← startup-config من NVRAM", "NVRAM ← Flash ← RAM", "لا يوجد ترتيب"],
        correct: 1,
        explanation: "Bootstrap من ROM أولاً، ثم تحميل IOS من Flash، ثم startup-config من NVRAM."
      },
      {
        question: "ماذا يحدث إذا لم يجد المحول startup-config عند الإقلاع؟",
        options: ["يتوقف", "يدخل Setup Mode للإعداد الحواري", "يحذف IOS", "يعيد التشغيل"],
        correct: 1,
        explanation: "بدون إعداد مخزن يدخل الجهاز وضع Setup الذي يطرح أسئلة لإعداد أولي."
      }
    ]
  },
  "switching-concepts": {
    title: "اختبار: مفاهيم التبديل",
    questions: [
      {
        question: "كم نطاق تصادم (Collision Domain) يوفر Hub بـ 8 منافذ؟",
        options: ["8", "1", "16", "0"],
        correct: 1,
        explanation: "Hub يضع جميع منافذه في نطاق تصادم واحد — سبب رئيسي لضعف أدائه."
      },
      {
        question: "كم نطاق بث (Broadcast Domain) لدى Switch بـ 24 منفذ؟",
        options: ["24", "12", "1", "0"],
        correct: 2,
        explanation: "المحول نطاق بث واحد شاملاً جميع منافذه؛ فقط الراوتر أو VLAN يفصل نطاقات البث."
      },
      {
        question: "ماذا يفعل المحول بعنوان MAC الوجهة غير الموجود في جدوله؟",
        options: ["يسقط الإطار", "يرسله لجميع المنافذ (Flooding)", "يرسله للراوتر فقط", "يخزنه"],
        correct: 1,
        explanation: "Flooding — يُرسل الإطار من جميع المنافذ عدا القادم منه حتى يتعلم العنوان."
      },
      {
        question: "أي جهاز يفصل نطاقات البث؟",
        options: ["Hub", "Switch", "Router", "Repeater"],
        correct: 2,
        explanation: "الراوتر (وأيضاً VLAN) يفصل نطاقات البث؛ الـ Hub والمحول لا يفعلان."
      }
    ]
  },
  "routing-table": {
    title: "اختبار: جدول التوجيه",
    questions: [
      {
        question: "ماذا يعني الرمز S* في جدول التوجيه؟",
        options: ["شبكة مباشرة", "مسار افتراضي (Default Route)", "مسار OSPF", "مسار تالف"],
        correct: 1,
        explanation: "S* هو المسار الافتراضي 0.0.0.0/0 الذي يُستخدم لأي وجهة غير موجودة في الجدول."
      },
      {
        question: "ما القيمة الإدارية (AD) للمسار المتصل مباشرة؟",
        options: ["0", "1", "90", "110"],
        correct: 0,
        explanation: "Connected = 0 (الأكثر ثقة)، Static = 1، EIGRP = 90، OSPF = 110، RIP = 120."
      },
      {
        question: "إذا وُجد مساران ل نفس الشبكة بـ AD 1 و AD 120، أيهما يُستخدم؟",
        options: ["AD 120", "AD 1", "كلاهما", "عشوائي"],
        correct: 1,
        explanation: "الراوتر يختار المسار ذا القيمة الإدارية الأقل — AD 1 (Static) هنا."
      },
      {
        question: "ماذا يفعل الراوتر إذا لم يجد أي مسار مطابق للوجهة؟",
        options: ["يُرسلها للجميع", "يسقطها ويرسل ICMP Destination Unreachable", "ينتظر", "يُعيد الإرسال"],
        correct: 1,
        explanation: "بلا مسار افتراضي، تُسقط الحزمة ويُرسل الراوتر رسالة ICMP Unreachable للمصدر."
      }
    ]
  }
};