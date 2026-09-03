/**
 * curriculum Part 1: Units 1-9 (أساسيات → ARP)
 * المنهج الرسمي: "البنية التحتية وشبكات الاتصال" - تخصص المقاصة 70%
 */

export const UNITS_1_9 = [
  // ━━━━━━━━━━ الوحدة 1 ━━━━━━━━━━
  {
    id: "unit1-basics",
    unit: 1,
    title: "أساسيات شبكات الاتصال",
    icon: "Network",
    color: "from-blue-500 to-blue-700",
    hours: { theory: 8, practical: 2, total: 10 },
    difficulty: "beginner",
    topics: [
      {
        id: "network-components",
        title: "مكونات الشبكة الأساسية",
        unitNumber: 1,
        content: `## مكونات الشبكة الأساسية

### ما هي الشبكة؟
شبكة الاتصال هي مجموعة من الأجهزة المترابطة التي تتشارك الموارد والبيانات.

### المكونات الرئيسية:

#### 1. المضيف (Host)
كل جهاز متصل بالشبكة: حاسوب، هاتف، طابعة، خادم.

#### 2. أنواع الشبكات من حيث البنية:
- **Peer-to-Peer (P2P):** الأجهزة تتصل مباشرة ببعضها دون خادم مركزي
- **Client-Server:** أجهزة عميل تطلب خدمات من خادم مركزي

#### 3. أنواع الأجهزة:
| النوع | الوظيفة | الأمثلة |
|-------|---------|---------|
| End Devices | مصدر أو وجهة البيانات | PC, Laptop, Phone |
| Intermediary Devices | تنقل وتوجه البيانات | Router, Switch, AP |
| Network Media | وسيط نقل البيانات | كابل، ألياف، لاسلكي |

### برنامج Cisco Packet Tracer:
- محاكاة بيئة شبكات حقيقية
- تمثيل الأجهزة بيانياً (Logical View)
- محاكاة البيئة الفيزيائية (Physical View)

### أنواع الشبكات:
| النوع | النطاق | الاستخدام |
|-------|--------|----------|
| **LAN** | مبنى واحد | المكاتب والمنازل |
| **WAN** | مناطق جغرافية واسعة | ربط المدن والدول |
| **Internet** | عالمي | شبكة الشبكات |

### الطوبولوجيا (Topology):
- **الفيزيائية:** الترتيب الفعلي للكابلات والأجهزة
- **المنطقية:** كيفية تدفق البيانات بين الأجهزة`
      },
      {
        id: "packet-tracer-intro",
        title: "مقدمة في برنامج Packet Tracer",
        unitNumber: 1,
        content: `## برنامج Cisco Packet Tracer

### واجهة البرنامج:
- **Menu Bar / Toolbar:** أوامر البرنامج
- **Workspace:** منطقة تصميم الشبكة
- **Device Box:** اختيار الأجهزة
- **Connections Box:** اختيار الكابلات

### البيئتان:
1. **Logical Workspace:** تصميم الشبكة منطقياً
2. **Physical Workspace:** محاكاة المبنى الفيزيائي

### خطوات إنشاء شبكة بسيطة:
1. اسحب جهازين PC إلى منطقة العمل
2. اختر كابل Copper Straight-through
3. وصّل FastEthernet0 في كل جهاز
4. أدخل عناوين IP لكل جهاز
5. اختبر الاتصال بأمر ping

### أوضاع المحاكاة:
- **Realtime Mode:** عمل فوري كالواقع
- **Simulation Mode:** خطوة بخطوة لمتابعة تدفق الحزم`
      }
    ]
  },
  // ━━━━━━━━━━ الوحدة 2 ━━━━━━━━━━
  {
    id: "unit2-ios",
    unit: 2,
    title: "نظام تشغيل الأجهزة (Cisco IOS)",
    icon: "Cpu",
    color: "from-violet-500 to-violet-700",
    hours: { theory: 8, practical: 12, total: 20 },
    difficulty: "beginner",
    topics: [
      {
        id: "ios-access-modes",
        title: "أوضاع الوصول إلى Cisco IOS",
        unitNumber: 2,
        content: `## نظام تشغيل Cisco IOS

### طرق الوصول للجهاز:
- **Console Port:** اتصال مادي مباشر للإعداد الأولي
- **Telnet:** بعيد عبر الشبكة (غير مشفر)
- **SSH:** بعيد عبر الشبكة (مشفر وآمن)

### أوضاع العمل (Modes):
\`\`\`
Router>            ← User EXEC Mode
Router#            ← Privileged EXEC Mode
Router(config)#    ← Global Configuration Mode
Router(config-if)# ← Interface Configuration Mode
\`\`\`

### أوامر التنقل:
\`\`\`
Router> enable
Router# configure terminal
Router(config)# interface g0/0
Router(config-if)# exit
Router(config)# end
\`\`\`

### اختصارات لوحة المفاتيح:
| الاختصار | الوظيفة |
|---------|---------|
| ? | عرض الأوامر المتاحة |
| Tab | إكمال الأمر |
| Ctrl+Z | العودة لوضع الامتياز |
| Ctrl+Shift+6 | إيقاف عملية جارية |`
      },
      {
        id: "ios-initial-config",
        title: "الإعدادات الأولية للجهاز",
        unitNumber: 2,
        content: `## الإعدادات الأولية لجهاز Cisco

\`\`\`
Router(config)# hostname R1
R1(config)# enable secret cisco123
R1(config)# service password-encryption
R1(config)# banner motd # Authorized Access Only #
\`\`\`

### تأمين Console:
\`\`\`
R1(config)# line console 0
R1(config-line)# password cisco
R1(config-line)# login
\`\`\`

### حفظ الإعدادات:
\`\`\`
R1# copy running-config startup-config
\`\`\`

### ملفات الإعداد:
- **running-config:** النشط (في RAM)
- **startup-config:** المخزن (في NVRAM)

### أوامر العرض:
\`\`\`
R1# show running-config
R1# show ip interface brief
\`\`\`

### إعداد SVI على المحول:
\`\`\`
Switch(config)# interface vlan 1
Switch(config-if)# ip address 192.168.1.2 255.255.255.0
Switch(config-if)# no shutdown
Switch(config)# ip default-gateway 192.168.1.1
\`\`\``
      }
    ]
  },
  // ━━━━━━━━━━ الوحدة 3 ━━━━━━━━━━
  {
    id: "unit3-protocols-models",
    unit: 3,
    title: "البروتوكولات والنماذج القياسية",
    icon: "Network",
    color: "from-sky-500 to-sky-700",
    hours: { theory: 10, practical: 4, total: 14 },
    difficulty: "beginner",
    topics: [
      {
        id: "osi-tcpip-models",
        title: "نموذجا OSI و TCP/IP",
        unitNumber: 3,
        content: `## النماذج القياسية للشبكات

### نموذج OSI (7 طبقات):
\`\`\`
7 - Application   (HTTP, DNS, SMTP)
6 - Presentation
5 - Session
4 - Transport     (TCP / UDP)
3 - Network       (IP, Routing)
2 - Data Link     (MAC, Ethernet)
1 - Physical      (كابلات، إشارات)
\`\`\`

### نموذج TCP/IP (4 طبقات):
\`\`\`
4 - Application
3 - Transport
2 - Internet
1 - Network Access
\`\`\`

### وحدات البيانات (PDU):
| الطبقة | وحدة البيانات |
|--------|--------------|
| Transport | Segment |
| Network | Packet |
| Data Link | Frame |
| Physical | Bits |

### التغليف (Encapsulation):
عند الإرسال تُضاف رؤوس في كل طبقة، وعند الاستقبال تُزال طبقة بطبقة.`
      }
    ]
  },
  // ━━━━━━━━━━ الوحدة 4 ━━━━━━━━━━
  {
    id: "unit4-physical",
    unit: 4,
    title: "الطبقة الفيزيائية",
    icon: "Server",
    color: "from-orange-500 to-orange-700",
    hours: { theory: 8, practical: 4, total: 12 },
    difficulty: "beginner",
    topics: [
      {
        id: "physical-media",
        title: "وسائط الطبقة الفيزيائية",
        unitNumber: 4,
        content: `## الطبقة الفيزيائية (Physical Layer)

### الوظيفة:
تحويل البتات إلى إشارات كهربائية أو ضوئية أو لاسلكية.

### مقاييس الأداء:
- **Bandwidth:** السعة النظرية
- **Throughput:** السرعة الفعلية
- **Latency:** زمن التأخير

## كابلات النحاس:
### UTP (Unshielded Twisted Pair):
- الأكثر شيوعاً في LAN
- **Straight-through:** PC→Switch
- **Crossover:** PC→PC, Switch→Switch
- **Auto-MDIX:** كشف تلقائي لنوع الكابل

### STP (Shielded):
محمي ضد التشويش الكهرومغناطيسي.

## الألياف الضوئية (Fiber):
- **Single-mode (SMF):** مسافات طويلة
- **Multi-mode (MMF):** مسافات قصيرة

### مقارنة الكابلات:
| النوع | المسافة | السرعة |
|-------|---------|--------|
| UTP Cat6 | 100م | 1 Gbps |
| Fiber SMF | 100 كم | 100 Gbps |
| Fiber MMF | 2 كم | 10 Gbps |

## الوسائط اللاسلكية:
Wi-Fi (802.11), Bluetooth, WiMAX`
      }
    ]
  },
  // ━━━━━━━━━━ الوحدة 5 ━━━━━━━━━━
  {
    id: "unit5-numbering",
    unit: 5,
    title: "أنظمة العد والترقيم",
    icon: "Cpu",
    color: "from-teal-500 to-teal-700",
    hours: { theory: 12, practical: 8, total: 20 },
    difficulty: "beginner",
    topics: [
      {
        id: "binary-system",
        title: "النظام الثنائي والتحويلات",
        unitNumber: 5,
        content: `## أنظمة العد في الشبكات

## النظام الثنائي (Binary):
- أرقامه: 0 و 1
- كل 8 بتات = **Octet**

### التحويل من ثنائي إلى عشري:
\`\`\`
11000000 = 128+64 = 192
10101000 = 128+32+8 = 168
\`\`\`

### قيم البتات:
\`\`\`
128  64  32  16  8  4  2  1
\`\`\`

## النظام السداسي العشري (Hex):
- أرقامه: 0-9 ثم A-F
- يُستخدم في عناوين MAC وIPv6

### جدول التحويل:
| ثنائي | عشري | سداسي |
|-------|------|-------|
| 1010 | 10 | A |
| 1111 | 15 | F |
| 11111111 | 255 | FF |`
      }
    ]
  },
  // ━━━━━━━━━━ الوحدة 6 ━━━━━━━━━━
  {
    id: "unit6-data-link",
    unit: 6,
    title: "طبقة ربط البيانات (Layer 2)",
    icon: "Network",
    color: "from-emerald-500 to-emerald-700",
    hours: { theory: 3, practical: 7, total: 10 },
    difficulty: "easy",
    topics: [
      {
        id: "data-link-functions",
        title: "وظائف طبقة ربط البيانات",
        unitNumber: 6,
        content: `## طبقة ربط البيانات (Data Link Layer)

### الوظائف:
1. التحكم في الوصول للوسيط (MAC)
2. بناء وتفكيك الإطارات (Frames)
3. كشف الأخطاء (Error Detection)

### بروتوكول Ethernet (IEEE 802.3):
المعيار الأكثر استخداماً في LAN.

### بنية إطار Ethernet:
\`\`\`
Preamble | Dest MAC | Src MAC | Data | FCS
 8B      | 6B       | 6B      | 46-1500B | 4B
\`\`\`

### طرق الإرسال:
- **Full-Duplex:** إرسال واستقبال معاً
- **Half-Duplex:** إرسال أو استقبال

### التحكم في الوصول:
- **CSMA/CD:** سلكي (كشف التصادم)
- **CSMA/CA:** لاسلكي (تجنب التصادم)`
      }
    ]
  },
  // ━━━━━━━━━━ الوحدة 7 ━━━━━━━━━━
  {
    id: "unit7-ethernet-switching",
    unit: 7,
    title: "تبديل شبكات الإيثرنت",
    icon: "Server",
    color: "from-blue-600 to-blue-800",
    hours: { theory: 6, practical: 8, total: 14 },
    difficulty: "easy",
    topics: [
      {
        id: "mac-addresses",
        title: "عناوين MAC وجدول المحول",
        unitNumber: 7,
        content: `## عناوين MAC وتبديل الإيثرنت

### خصائص MAC:
- **الطول:** 48 بت (6 بايت)
- **التمثيل:** \`AA:BB:CC:DD:EE:FF\`
- **النصف الأول (OUI):** الشركة المصنعة

### أنواع العناوين:
| النوع | المثال |
|-------|--------|
| Unicast | 00:1A:2B:3C:4D:5E |
| Broadcast | FF:FF:FF:FF:FF:FF |
| Multicast | 01:00:5E:xx:xx:xx |

## آلية عمل المحول:
1. **تعلّم:** يحفظ MAC المصدر مع المنفذ
2. **توجيه:** يُرسل للمنفذ الصحيح
3. **Flooding:** إذا لم يعرف الوجهة يُرسل للجميع

### أوامر:
\`\`\`
Switch# show mac address-table
Switch# clear mac address-table dynamic
\`\`\``
      }
    ]
  },
  // ━━━━━━━━━━ الوحدة 8 ━━━━━━━━━━
  {
    id: "unit8-network-layer",
    unit: 8,
    title: "طبقة الشبكة (Layer 3)",
    icon: "Globe",
    color: "from-cyan-500 to-cyan-700",
    hours: { theory: 3, practical: 8, total: 11 },
    difficulty: "easy",
    topics: [
      {
        id: "network-layer-functions",
        title: "وظائف طبقة الشبكة وIPv4/IPv6",
        unitNumber: 8,
        content: `## طبقة الشبكة (Network Layer)

### الوظائف:
1. **عنونة الأجهزة** - عنوان IP لكل جهاز
2. **التغليف** - رأس IP حول البيانات
3. **التوجيه** - اختيار أفضل مسار

### رأس حزمة IPv4:
- **TTL:** يُنقص عند كل راوتر
- **Protocol:** TCP=6, UDP=17, ICMP=1
- **Source/Destination IP**

### IPv6:
- طول العنوان: 128 بت
- رأس مبسّط، يدعم SLAAC

## آلية التوجيه عند المضيف:
1. الوجهة في نفس الشبكة → إرسال مباشر
2. الوجهة في شبكة مختلفة → Default Gateway
3. Loopback (127.x) → محلياً`
      }
    ]
  },
  // ━━━━━━━━━━ الوحدة 9 ━━━━━━━━━━
  {
    id: "unit9-arp",
    unit: 9,
    title: "بروتوكول حل العناوين (ARP)",
    icon: "Network",
    color: "from-pink-500 to-pink-700",
    hours: { theory: 5, practical: 7, total: 12 },
    difficulty: "easy",
    topics: [
      {
        id: "arp-protocol",
        title: "كيف يعمل بروتوكول ARP",
        unitNumber: 9,
        content: `## بروتوكول ARP (Address Resolution Protocol)

### الهدف:
تحويل عنوان IP معروف إلى عنوان MAC.

### سيناريو 1: نفس الشبكة:
\`\`\`
1. PC-A يبحث في جدول ARP
2. إذا لم يجد → ARP Request (Broadcast)
3. PC-B يرد بـ ARP Reply (Unicast)
4. PC-A يحفظ في جدول ARP
\`\`\`

### سيناريو 2: شبكة مختلفة:
- يُرسل ARP Request للـ Default Gateway
- الراوتر يرد بـ MAC واجهته

### أوامر:
\`\`\`
PC> arp -a
Router# show arp
Router# clear arp-cache
\`\`\``
      }
    ]
  }
];