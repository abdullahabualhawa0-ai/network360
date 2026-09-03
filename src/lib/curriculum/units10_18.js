/**
 * curriculum Part 2: Units 10-18 (إعداد الراوتر → Inter-VLAN)
 * المنهج الرسمي: "البنية التحتية وشبكات الاتصال" - تخصص المقاصة 70%
 */

export const UNITS_10_18 = [
  // ━━━━━━━━━━ الوحدة 10 ━━━━━━━━━━
  {
    id: "unit10-router-basic",
    unit: 10,
    title: "الإعداد الأساسي لجهاز التوجيه",
    icon: "Route",
    color: "from-blue-500 to-blue-700",
    hours: { theory: 8, practical: 8, total: 16 },
    difficulty: "easy",
    topics: [
      {
        id: "router-basic-config",
        title: "إعداد جهاز التوجيه خطوة بخطوة",
        unitNumber: 10,
        content: `## الإعداد الأساسي للراوتر

### 1. الإعدادات الأولية:
\`\`\`
Router> enable
Router# configure terminal
Router(config)# hostname R1
R1(config)# enable secret cisco123
\`\`\`

### 2. تأمين VTY:
\`\`\`
R1(config)# line vty 0 4
R1(config-line)# password cisco
R1(config-line)# login
\`\`\`

### 3. إعداد الواجهات:
\`\`\`
R1(config)# interface GigabitEthernet0/0
R1(config-if)# ip address 192.168.1.1 255.255.255.0
R1(config-if)# no shutdown

R1(config)# interface GigabitEthernet0/1
R1(config-if)# ip address 10.0.0.1 255.255.255.252
R1(config-if)# no shutdown
\`\`\`

### 4. الحفظ:
\`\`\`
R1# copy running-config startup-config
\`\`\`

### أوامر التحقق:
\`\`\`
R1# show ip interface brief
R1# show ip route
\`\`\``
      }
    ]
  },
  // ━━━━━━━━━━ الوحدة 11 ━━━━━━━━━━
  {
    id: "unit11-ipv4",
    unit: 11,
    title: "بروتوكول IPv4 وعناوين الشبكة",
    icon: "Globe",
    color: "from-indigo-500 to-indigo-700",
    hours: { theory: 12, practical: 8, total: 20 },
    difficulty: "medium",
    topics: [
      {
        id: "ipv4-addresses",
        title: "بنية عناوين IPv4 والتقسيم الشبكي",
        unitNumber: 11,
        content: `## عناوين IPv4

### البنية:
- **الطول:** 32 بت
- **التمثيل:** \`192.168.1.1\`
- جزء الشبكة + جزء المضيف

### قناع الشبكة (Subnet Mask):
\`\`\`
255.255.255.0  =  /24  →  254 جهاز قابل للاستخدام
255.255.0.0    =  /16
255.0.0.0      =  /8
\`\`\`

### عملية AND:
\`\`\`
IP:      192.168.1.10
Mask:    255.255.255.0
Network: 192.168.1.0
\`\`\`

### حسابات /24:
\`\`\`
Network:   192.168.1.0
Broadcast: 192.168.1.255
Hosts:     192.168.1.1 - 192.168.1.254
\`\`\`

### أنواع العناوين:
| النوع | النطاق |
|-------|--------|
| Private A | 10.0.0.0/8 |
| Private B | 172.16.0.0/12 |
| Private C | 192.168.0.0/16 |
| Loopback | 127.0.0.1 |
| APIPA | 169.254.x.x |

## Subnetting - تقسيم 192.168.1.0/24 إلى 4 شبكات:
\`\`\`
Subnet 1: 192.168.1.0/26    (Hosts: 1-62)
Subnet 2: 192.168.1.64/26   (Hosts: 65-126)
Subnet 3: 192.168.1.128/26  (Hosts: 129-190)
Subnet 4: 192.168.1.192/26  (Hosts: 193-254)
\`\`\``
      },
      {
        id: "ipv4-broadcast-types",
        title: "أنواع البث في IPv4",
        unitNumber: 11,
        content: `## أنواع الإرسال في IPv4

### Unicast:
جهاز واحد → جهاز واحد

### Broadcast:
- **Directed:** آخر عنوان في الشبكة (192.168.1.255)
- **Limited:** 255.255.255.255
- الراوترات لا تمرره

### Multicast:
- النطاق: 224.0.0.0 - 239.255.255.255
- إرسال لمجموعة محددة

## منظمات توزيع العناوين:
- **IANA:** التخصيص العالمي
- **RIPE NCC:** أوروبا والشرق الأوسط`
      }
    ]
  },
  // ━━━━━━━━━━ الوحدة 12 ━━━━━━━━━━
  {
    id: "unit12-icmp",
    unit: 12,
    title: "بروتوكول رسائل التحكم (ICMP)",
    icon: "Network",
    color: "from-red-500 to-red-700",
    hours: { theory: 2, practical: 2, total: 4 },
    difficulty: "easy",
    topics: [
      {
        id: "icmp-ping-traceroute",
        title: "أوامر Ping و Traceroute",
        unitNumber: 12,
        content: `## بروتوكول ICMP

### أمر PING:
\`\`\`
PC> ping 192.168.1.1
! = نجح    . = Timeout    U = Unreachable
\`\`\`

### اختبارات متسلسلة:
\`\`\`
1. ping 127.0.0.1        ← اختبار محلي
2. ping 192.168.1.1      ← البوابة
3. ping 8.8.8.8          ← الإنترنت
4. ping www.google.com   ← DNS
\`\`\`

### أمر TRACEROUTE:
\`\`\`
PC> tracert 8.8.8.8
1  1ms   192.168.1.1
2  10ms  10.0.0.1
3  25ms  8.8.8.8
\`\`\`

### كيف يعمل؟
يُرسل حزم بـ TTL متزايد، كل راوتر يرد بـ ICMP Time Exceeded.`
      }
    ]
  },
  // ━━━━━━━━━━ الوحدة 13 ━━━━━━━━━━
  {
    id: "unit13-transport",
    unit: 13,
    title: "طبقة النقل (Layer 4) - TCP و UDP",
    icon: "Network",
    color: "from-yellow-500 to-yellow-700",
    hours: { theory: 4, practical: 6, total: 10 },
    difficulty: "medium",
    topics: [
      {
        id: "tcp-udp",
        title: "TCP مقابل UDP وأرقام المنافذ",
        unitNumber: 13,
        content: `## طبقة النقل (Transport Layer)

## TCP:
- موجه بالاتصال، يضمن الوصول والترتيب

### Three-Way Handshake:
\`\`\`
Client ──SYN──▶ Server
Client ◀─SYN-ACK─ Server
Client ──ACK──▶ Server
\`\`\`

### تطبيقات TCP:
HTTP(80), HTTPS(443), FTP(21), SSH(22), SMTP(25)

## UDP:
- غير موجه بالاتصال، أسرع
### تطبيقات UDP:
DNS(53), DHCP(67/68), TFTP(69), VoIP

## أرقام المنافذ:
| الفئة | النطاق |
|-------|--------|
| Well Known | 0 - 1023 |
| Registered | 1024 - 49151 |
| Dynamic | 49152 - 65535 |`
      }
    ]
  },
  // ━━━━━━━━━━ الوحدة 14 ━━━━━━━━━━
  {
    id: "unit14-application",
    unit: 14,
    title: "طبقة التطبيقات (Layer 7)",
    icon: "Globe",
    color: "from-purple-500 to-purple-700",
    hours: { theory: 6, practical: 8, total: 14 },
    difficulty: "medium",
    topics: [
      {
        id: "application-protocols",
        title: "بروتوكولات طبقة التطبيقات",
        unitNumber: 14,
        content: `## بروتوكولات طبقة التطبيقات

| البروتوكول | المنفذ | TCP/UDP | الوظيفة |
|-----------|--------|---------|---------|
| DNS | 53 | TCP/UDP | تحويل الأسماء |
| DHCP | 67/68 | UDP | توزيع IP |
| HTTP | 80 | TCP | ويب |
| HTTPS | 443 | TCP | ويب مشفر |
| FTP | 20/21 | TCP | نقل ملفات |
| SMTP | 25 | TCP | إرسال بريد |
| POP3 | 110 | TCP | استلام بريد |
| SSH | 22 | TCP | وصول آمن |

## DNS - البنية الهرمية:
\`\`\`
. (Root) → .com → google.com → www
\`\`\`

### اختبار:
\`\`\`
PC> nslookup www.google.com
\`\`\`

## DHCP - عملية DORA:
\`\`\`
Discover → Offer → Request → Acknowledge
\`\`\``
      }
    ]
  },
  // ━━━━━━━━━━ الوحدة 15 ━━━━━━━━━━
  {
    id: "unit15-advanced-initial",
    unit: 15,
    title: "الإعدادات الأولية المتقدمة للسويتش والراوتر",
    icon: "Server",
    color: "from-slate-500 to-slate-700",
    hours: { theory: 10, practical: 10, total: 20 },
    difficulty: "medium",
    topics: [
      {
        id: "advanced-switch-router",
        title: "إعداد SSH والواجهات المتقدمة",
        unitNumber: 15,
        content: `## الإعدادات المتقدمة

### تسلسل إقلاع المحول:
1. Bootstrap من ROM
2. IOS من Flash
3. Startup-Config من NVRAM

## إعداد SSH الآمن:
\`\`\`
R1(config)# hostname R1
R1(config)# ip domain-name company.local
R1(config)# crypto key generate rsa modulus 2048
R1(config)# username admin privilege 15 secret Admin@2024
R1(config)# line vty 0 4
R1(config-line)# transport input ssh
R1(config-line)# login local
R1(config)# ip ssh version 2
\`\`\`

### الاتصال:
\`\`\`
PC> ssh -l admin 192.168.1.1
\`\`\`

## Loopback Interface:
\`\`\`
R1(config)# interface loopback 0
R1(config-if)# ip address 1.1.1.1 255.255.255.255
\`\`\`
- دائماً Up، تُستخدم كـ Router ID في OSPF`
      }
    ]
  },
  // ━━━━━━━━━━ الوحدة 16 ━━━━━━━━━━
  {
    id: "unit16-switching-concepts",
    unit: 16,
    title: "مفاهيم وتقنيات التبديل",
    icon: "Server",
    color: "from-green-600 to-green-800",
    hours: { theory: 8, practical: 6, total: 14 },
    difficulty: "medium",
    topics: [
      {
        id: "switching-concepts",
        title: "نطاقات التصادم والبث الشامل",
        unitNumber: 16,
        content: `## مفاهيم التبديل

### آلية قرار المحول:
1. تعلّم MAC المصدر
2. تصفية وتوجيه الإطارات
3. Flooding عند عدم معرفة الوجهة

## نطاق التصادم (Collision Domain):
- **Hub:** جميع المنافذ نطاق واحد
- **Switch:** كل منفذ نطاق مستقل

## نطاق البث (Broadcast Domain):
- **Switch:** جميع المنافذ نطاق واحد
- **Router:** كل واجهة نطاق مستقل
- **VLAN:** تقسيم منطقي للنطاقات

### مقارنة:
| الجهاز | Collision Domain | Broadcast Domain |
|--------|-----------------|-----------------|
| Hub | معاً | معاً |
| Switch | لكل منفذ | معاً |
| Router | لكل منفذ | لكل منفذ |`
      }
    ]
  },
  // ━━━━━━━━━━ الوحدة 17 ━━━━━━━━━━
  {
    id: "unit17-vlan",
    unit: 17,
    title: "الشبكات المحلية الافتراضية (VLAN)",
    icon: "Tag",
    color: "from-purple-500 to-purple-700",
    hours: { theory: 10, practical: 12, total: 22 },
    difficulty: "medium",
    topics: [
      {
        id: "vlan-gui",
        title: "مفهوم VLAN وإعداده",
        unitNumber: 17,
        content: `## الشبكات المحلية الافتراضية (VLAN)

### الفوائد:
- **الأمان:** عزل الأقسام
- **الأداء:** تقليل البث
- **المرونة:** تجميع منطقي

### إعداد VLAN:
\`\`\`
Switch(config)# vlan 10
Switch(config-vlan)# name Sales
Switch(config-vlan)# exit
Switch(config)# vlan 20
Switch(config-vlan)# name IT
\`\`\`

### منفذ Access:
\`\`\`
Switch(config)# interface FastEthernet0/1
Switch(config-if)# switchport mode access
Switch(config-if)# switchport access vlan 10
\`\`\`

### منفذ Trunk:
\`\`\`
Switch(config)# interface GigabitEthernet0/1
Switch(config-if)# switchport mode trunk
Switch(config-if)# switchport trunk allowed vlan 10,20
\`\`\`

### التحقق:
\`\`\`
Switch# show vlan brief
Switch# show interfaces trunk
\`\`\``,
      },
      {
        id: "vtp",
        title: "بروتوكول VTP لإدارة VLAN",
        unitNumber: 17,
        content: `## VTP (VLAN Trunking Protocol)

### مزامنة إعدادات VLAN بين المحولات تلقائياً.

### أوضاع VTP:
| الوضع | إنشاء VLAN | تمرير الرسائل |
|-------|-----------|--------------|
| Server | ✅ | ✅ |
| Client | ❌ | ✅ |
| Transparent | محلياً فقط | ✅ |

### الإعداد:
\`\`\`
Switch(config)# vtp mode server
Switch(config)# vtp domain MySchool
Switch(config)# vtp password VTP@2024
\`\`\`

### ⚠️ تحذير:
إضافة محول بـ Revision Number أعلى يمسح جميع VLANs — صفّر العداد قبل أي إضافة.`
      }
    ]
  },
  // ━━━━━━━━━━ الوحدة 18 ━━━━━━━━━━
  {
    id: "unit18-inter-vlan",
    unit: 18,
    title: "التوجيه بين الشبكات الافتراضية (Inter-VLAN)",
    icon: "Route",
    color: "from-violet-600 to-violet-800",
    hours: { theory: 10, practical: 14, total: 24 },
    difficulty: "medium",
    topics: [
      {
        id: "router-on-stick",
        title: "Router-on-a-Stick وInter-VLAN Routing",
        unitNumber: 18,
        content: `## التوجيه بين الشبكات الافتراضية

### Router-on-a-Stick:
واجهة فيزيائية واحدة → واجهات فرعية لكل VLAN

### إعداد الراوتر:
\`\`\`
R1(config)# interface GigabitEthernet0/0
R1(config-if)# no shutdown

R1(config)# interface GigabitEthernet0/0.10
R1(config-subif)# encapsulation dot1Q 10
R1(config-subif)# ip address 192.168.10.1 255.255.255.0

R1(config)# interface GigabitEthernet0/0.20
R1(config-subif)# encapsulation dot1Q 20
R1(config-subif)# ip address 192.168.20.1 255.255.255.0
\`\`\`

### إعداد المحول:
\`\`\`
Switch(config)# interface GigabitEthernet0/1
Switch(config-if)# switchport mode trunk
\`\`\`

### الطريقة 2: Layer 3 Switch (SVI):
\`\`\`
Switch(config)# ip routing
Switch(config)# interface vlan 10
Switch(config-if)# ip address 192.168.10.1 255.255.255.0
\`\`\`

### مشكلات شائعة:
| المشكلة | الحل |
|---------|------|
| لا اتصال | تحقق من Trunk |
| الواجهة الفرعية لا تعمل | no shutdown على الرئيسية |
| Encapsulation خطأ | تأكد من رقم VLAN |`
      }
    ]
  }
];