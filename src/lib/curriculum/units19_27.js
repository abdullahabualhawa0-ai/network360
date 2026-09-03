/**
 * curriculum Part 3: Units 19-27 (DHCP → NAT)
 * المنهج الرسمي: "البنية التحتية وشبكات الاتصال" - تخصص المقاصة 70%
 */

export const UNITS_19_27 = [
  // ━━━━━━━━━━ الوحدة 19 ━━━━━━━━━━
  {
    id: "unit19-dhcp",
    unit: 19,
    title: "بروتوكول التهيئة الديناميكية (DHCP)",
    icon: "Server",
    color: "from-amber-500 to-amber-700",
    hours: { theory: 8, practical: 10, total: 18 },
    difficulty: "medium",
    topics: [
      {
        id: "dhcp-server",
        title: "إعداد خادم DHCP على الراوتر",
        unitNumber: 19,
        content: `## بروتوكول DHCP

### عملية DORA:
\`\`\`
Client ──Discover──▶ Server (Broadcast)
Client ◀──Offer──── Server (عرض IP)
Client ──Request──▶ Server (قبول)
Client ◀──Ack───── Server (تأكيد)
\`\`\`

### إعداد DHCP على الراوتر:
\`\`\`
R1(config)# ip dhcp excluded-address 192.168.1.1 192.168.1.10
R1(config)# ip dhcp pool OFFICE_POOL
R1(dhcp-config)# network 192.168.1.0 255.255.255.0
R1(dhcp-config)# default-router 192.168.1.1
R1(dhcp-config)# dns-server 8.8.8.8
R1(dhcp-config)# lease 7
\`\`\`

### التحقق:
\`\`\`
R1# show ip dhcp binding
R1# show ip dhcp pool
\`\`\`

### DHCP Relay:
\`\`\`
R1(config-if)# ip helper-address 10.0.0.2
\`\`\`
(يحوّل Broadcast إلى Unicast لخادم في شبكة أخرى)

### الراوتر كـ Client:
\`\`\`
R1(config-if)# ip address dhcp
\`\`\``
      }
    ]
  },
  // ━━━━━━━━━━ الوحدة 20 ━━━━━━━━━━
  {
    id: "unit20-switch-security",
    unit: 20,
    title: "إعدادات حماية وأمن المحولات",
    icon: "Shield",
    color: "from-red-600 to-red-800",
    hours: { theory: 12, practical: 8, total: 20 },
    difficulty: "medium",
    topics: [
      {
        id: "switch-security",
        title: "Port Security وحماية المنافذ",
        unitNumber: 20,
        content: `## أمن المحولات

### 1. تعطيل المنافذ غير المستخدمة:
\`\`\`
Switch(config)# interface range FastEthernet0/5-24
Switch(config-if-range)# shutdown
Switch(config-if-range)# switchport access vlan 999
\`\`\`

### 2. Port Security:
\`\`\`
Switch(config)# interface FastEthernet0/1
Switch(config-if)# switchport mode access
Switch(config-if)# switchport port-security
Switch(config-if)# switchport port-security maximum 1
Switch(config-if)# switchport port-security mac-address sticky
Switch(config-if)# switchport port-security violation shutdown
\`\`\`

### أوضاع الانتهاك:
| الوضع | الإجراء | تنبيه |
|-------|---------|-------|
| Shutdown | إغلاق المنفذ | نعم |
| Restrict | منع الحزم | نعم |
| Protect | منع الحزم | لا |

### التحقق:
\`\`\`
Switch# show port-security
Switch# show port-security interface FastEthernet0/1
\`\`\`

### إعادة تفعيل منفذ مغلق:
\`\`\`
Switch(config-if)# shutdown
Switch(config-if)# no shutdown
\`\`\`

### 3. الحماية من MAC Flooding:
هجوم يملأ جدول MAC → Port Security هو الحل.`
      }
    ]
  },
  // ━━━━━━━━━━ الوحدة 21 ━━━━━━━━━━
  {
    id: "unit21-wlan-intro",
    unit: 21,
    title: "مقدمة في الشبكات اللاسلكية (WLAN)",
    icon: "Radio",
    color: "from-cyan-500 to-cyan-700",
    hours: { theory: 7, practical: 10, total: 17 },
    difficulty: "medium",
    topics: [
      {
        id: "wireless-basics",
        title: "مفاهيم الشبكات اللاسلكية ومعاييرها",
        unitNumber: 21,
        content: `## الشبكات اللاسلكية

### الأنواع:
| النوع | النطاق | المثال |
|-------|--------|--------|
| WPAN | أمتار | Bluetooth |
| WLAN | عشرات الأمتار | Wi-Fi |
| WMAN | كم | WiMAX |
| WWAN | كم واسعة | 4G/5G |

### معايير IEEE 802.11:
| المعيار | التردد | السرعة | الاسم |
|---------|--------|--------|-------|
| 802.11n | 2.4/5 GHz | 600 Mbps | Wi-Fi 4 |
| 802.11ac | 5 GHz | 3.5 Gbps | Wi-Fi 5 |
| 802.11ax | 2.4/5/6 GHz | 9.6 Gbps | Wi-Fi 6 |

### المكونات:
- **AP:** نقطة وصول لاسلكية
- **Wireless Router:** راوتر + AP + Switch
- **WLC:** تحكم مركزي بعدة APs

### الأمن:
| البروتوكول | الحالة |
|-----------|--------|
| WEP | ❌ لا تستخدم |
| WPA2 | ✅ شائع |
| WPA3 | ✅ الأحدث |`
      }
    ]
  },
  // ━━━━━━━━━━ الوحدة 22 ━━━━━━━━━━
  {
    id: "unit22-wlan-config",
    unit: 22,
    title: "إعداد وتكوين الشبكات اللاسلكية",
    icon: "Radio",
    color: "from-sky-500 to-sky-700",
    hours: { theory: 6, practical: 10, total: 16 },
    difficulty: "medium",
    topics: [
      {
        id: "wireless-router-integration",
        title: "إعداد جهاز التوجيه اللاسلكي",
        unitNumber: 22,
        content: `## إعداد جهاز التوجيه اللاسلكي

### الدخول لواجهة الإدارة:
\`\`\`
المتصفح → 192.168.1.1 → admin / كلمة المرور
\`\`\`

### إعداد WLAN:
\`\`\`
SSID: MyOfficeWiFi
Security: WPA2-Personal
Password: StrongP@ss2024!
Channel: Auto (أو 1, 6, 11)
\`\`\`

### إعداد LAN وDHCP:
\`\`\`
LAN IP: 192.168.1.1
DHCP: 192.168.1.100 - 192.168.1.200
\`\`\`

### Port Forwarding:
\`\`\`
External Port 80 → 192.168.1.100:80 (TCP)
\`\`\`

### Mesh Networks:
نقاط وصول متصلة ببعضها لتوسيع التغطية تلقائياً.`
      }
    ]
  },
  // ━━━━━━━━━━ الوحدة 23 ━━━━━━━━━━
  {
    id: "unit23-routing-how",
    unit: 23,
    title: "آلية عمل التوجيه",
    icon: "Route",
    color: "from-green-500 to-green-700",
    hours: { theory: 15, practical: 8, total: 23 },
    difficulty: "hard",
    topics: [
      {
        id: "routing-table",
        title: "جدول التوجيه وآلية اتخاذ القرار",
        unitNumber: 23,
        content: `## آلية عمل التوجيه

### دور الراوتر:
1. استقبال الحزمة
2. قراءة IP الوجهة
3. البحث في جدول التوجيه
4. إعادة التغليف (تغيير MAC)
5. الإرسال عبر الواجهة

### قراءة جدول التوجيه:
\`\`\`
C  192.168.1.0/24 is directly connected, GigabitEthernet0/0
S  10.0.0.0/8 [1/0] via 192.168.1.2
O  172.16.0.0/16 [110/2] via 192.168.1.3
S* 0.0.0.0/0 [1/0] via 203.0.113.1
\`\`\`

### رموز المصادر:
| الرمز | المعنى |
|-------|--------|
| C | Connected |
| S | Static |
| O | OSPF |
| D | EIGRP |
| S* | Default |

### Administrative Distance:
| المصدر | AD |
|--------|-----|
| Connected | 0 |
| Static | 1 |
| OSPF | 110 |
| RIP | 120 |

الأقل = الأكثر ثقة.`
      }
    ]
  },
  // ━━━━━━━━━━ الوحدة 24 ━━━━━━━━━━
  {
    id: "unit24-static-routing",
    unit: 24,
    title: "التوجيه الثابت وتوجيه الملاذ الأخير",
    icon: "Route",
    color: "from-teal-600 to-teal-800",
    hours: { theory: 14, practical: 9, total: 23 },
    difficulty: "hard",
    topics: [
      {
        id: "static-routing",
        title: "إعداد التوجيه الثابت",
        unitNumber: 24,
        content: `## التوجيه الثابت (Static Routing)

### 1. مسار عادي:
\`\`\`
R1(config)# ip route 192.168.2.0 255.255.255.0 10.0.0.2
\`\`\`

### 2. مسار عبر منفذ:
\`\`\`
R1(config)# ip route 192.168.2.0 255.255.255.0 GigabitEthernet0/1
\`\`\`

### 3. Default Route:
\`\`\`
R1(config)# ip route 0.0.0.0 0.0.0.0 203.0.113.1
\`\`\`

### 4. Floating Static (احتياطي):
\`\`\`
R1(config)# ip route 0.0.0.0 0.0.0.0 203.0.113.2 200
\`\`\`
AD=200 → يُستخدم فقط عند فشل المسار الرئيسي

### التحقق:
\`\`\`
R1# show ip route static
R1# ping 192.168.2.10
\`\`\``
      }
    ]
  },
  // ━━━━━━━━━━ الوحدة 25 ━━━━━━━━━━
  {
    id: "unit25-ospf",
    unit: 25,
    title: "التوجيه الديناميكي باستخدام OSPFv2",
    icon: "Route",
    color: "from-green-600 to-green-800",
    hours: { theory: 14, practical: 17, total: 31 },
    difficulty: "hard",
    topics: [
      {
        id: "ospf",
        title: "مفهوم OSPF وإعداده",
        unitNumber: 25,
        content: `## بروتوكول OSPF

### خصائص OSPF:
- بروتوكول **Link-State**
- ينظم الشبكة في **Areas**
- خوارزمية **Dijkstra**
- AD = 110

### مفاهيم:
- **Router ID:** معرف فريد (أعلى Loopback IP)
- **Area 0 (Backbone):** المنطقة الرئيسية
- **DR/BDR:** رئيسي واحتياطي

### إعداد OSPFv2:
\`\`\`
R1(config)# router ospf 1
R1(config-router)# router-id 1.1.1.1
R1(config-router)# network 192.168.1.0 0.0.0.255 area 0
R1(config-router)# network 10.0.0.0 0.0.0.3 area 0
R1(config-router)# passive-interface GigabitEthernet0/0
\`\`\`

### Wildcard Mask (عكس القناع):
\`\`\`
255.255.255.0   →  0.0.0.255
255.255.255.252 →  0.0.0.3
\`\`\`

### التحقق:
\`\`\`
R1# show ip ospf neighbor
R1# show ip route ospf
\`\`\`

### حالات الجوار:
\`\`\`
Down → Init → 2-Way → ExStart → Exchange → Loading → Full
\`\`\``
      }
    ]
  },
  // ━━━━━━━━━━ الوحدة 26 ━━━━━━━━━━
  {
    id: "unit26-acl",
    unit: 26,
    title: "قوائم التحكم في الوصول - ACL",
    icon: "Shield",
    color: "from-red-500 to-red-700",
    hours: { theory: 15, practical: 20, total: 35 },
    difficulty: "hard",
    topics: [
      {
        id: "standard-acl-1",
        title: "قوائم ACL القياسية",
        unitNumber: 26,
        content: `## قوائم التحكم بالوصول (ACL)

### قاعدة أساسية:
"قائمة واحدة، لكل واجهة، لكل اتجاه، لكل بروتوكول"

### Implicit Deny All:
كل قائمة تنتهي ضمنياً بـ \`deny any\`.

## Standard ACL (1-99):
تُصفّي حسب **المصدر فقط** — تُوضع قرب **الوجهة**

\`\`\`
R1(config)# access-list 10 deny 192.168.10.0 0.0.0.255
R1(config)# access-list 10 permit any
R1(config)# interface GigabitEthernet0/1
R1(config-if)# ip access-group 10 out
\`\`\`

### Wildcard:
\`\`\`
host 192.168.1.1 = 192.168.1.1 0.0.0.0
any = 0.0.0.0 255.255.255.255
\`\`\`

### التحقق:
\`\`\`
R1# show access-lists
\`\`\``,
      },
      {
        id: "standard-acl-2",
        title: "قوائم ACL الممتدة",
        unitNumber: 26,
        content: `## Extended ACL (100-199)

تُصفّي حسب **المصدر + الوجهة + البروتوكول + المنفذ**
تُوضع قرب **المصدر**

### أمثلة:
\`\`\`
! منع HTTP من شبكة محددة
access-list 100 deny tcp 192.168.1.0 0.0.0.255 any eq 80

! السماح بـ SSH لخادم فقط
access-list 101 permit tcp any host 192.168.1.100 eq 22

! السماح بالباقي
access-list 100 permit ip any any
\`\`\`

### ACL مسماة:
\`\`\`
R1(config)# ip access-list extended PROTECT_SERVER
R1(config-ext-nacl)# permit tcp any host 192.168.1.100 eq 443
R1(config-ext-nacl)# deny ip any host 192.168.1.100
R1(config-ext-nacl)# permit ip any any
\`\`\`

### تأمين VTY:
\`\`\`
R1(config)# access-list 10 permit host 192.168.1.5
R1(config)# line vty 0 4
R1(config-line)# access-class 10 in
\`\`\`

### تعديل بـ Sequence Numbers:
\`\`\`
R1(config-std-nacl)# no 20          ← حذف السطر 20
R1(config-std-nacl)# 15 permit host 192.168.1.50  ← إدراج
\`\`\``
      }
    ]
  },
  // ━━━━━━━━━━ الوحدة 27 ━━━━━━━━━━
  {
    id: "unit27-nat",
    unit: 27,
    title: "تقنية ترجمة عناوين الشبكة (NAT)",
    icon: "Globe",
    color: "from-indigo-600 to-indigo-800",
    hours: { theory: 8, practical: 10, total: 18 },
    difficulty: "hard",
    topics: [
      {
        id: "nat",
        title: "Static NAT و Dynamic NAT",
        unitNumber: 27,
        content: `## تقنية NAT

### مصطلحات:
| المصطلح | المعنى |
|---------|--------|
| Inside Local | العنوان الداخلي (خاص) |
| Inside Global | العنوان كما يظهر خارجياً |

## 1. Static NAT (1:1):
\`\`\`
R1(config)# ip nat inside source static 192.168.1.10 203.0.113.10
R1(config-if)# ip nat inside
R1(config-if)# ip nat outside
\`\`\`

## 2. Dynamic NAT (Pool):
\`\`\`
R1(config)# ip nat pool POOL 203.0.113.1 203.0.113.10 netmask 255.255.255.240
R1(config)# access-list 1 permit 192.168.1.0 0.0.0.255
R1(config)# ip nat inside source list 1 pool POOL
\`\`\`

### التحقق:
\`\`\`
R1# show ip nat translations
R1# show ip nat statistics
\`\`\``,
      },
      {
        id: "pat",
        title: "إعداد PAT (NAT Overload)",
        unitNumber: 27,
        content: `## PAT - NAT Overload

### كيف يعمل؟
مئات الأجهزة تشارك عنواناً عاماً واحداً عبر أرقام المنافذ:
\`\`\`
192.168.1.10:1025 → 203.0.113.1:5001
192.168.1.11:1025 → 203.0.113.1:5002
\`\`\`

### الإعداد الكامل:
\`\`\`
! 1. الأجهزة المسموحة
R1(config)# access-list 1 permit 192.168.1.0 0.0.0.255

! 2. PAT عبر واجهة الخروج
R1(config)# ip nat inside source list 1 interface GigabitEthernet0/1 overload

! 3. تحديد الواجهات
R1(config)# interface GigabitEthernet0/0
R1(config-if)# ip nat inside
R1(config)# interface GigabitEthernet0/1
R1(config-if)# ip nat outside
\`\`\`

### المراقبة:
\`\`\`
R1# show ip nat translations
Pro Inside local      Inside global
tcp 192.168.1.10:1025 203.0.113.1:5001
\`\`\`

### الإيجابيات مقابل السلبيات:
| إيجابيات | سلبيات |
|-----------|--------|
| توفير العناوين | تأخير المعالجة |
| حماية الشبكة | كسر End-to-End |`
      }
    ]
  }
];