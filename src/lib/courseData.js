import { 
  Network, Globe, Shield, Server, Radio, Cpu, Route, Tag
} from "lucide-react";

const courseData = [
  {
    id: "network-addresses",
    title: "عناوين الشبكة",
    icon: "Network",
    color: "from-blue-500 to-blue-700",
    topics: [
      {
        id: "mac-addresses",
        title: "عناوين MAC",
        content: `## عناوين MAC (Media Access Control)

عنوان MAC هو عنوان فريد يُعطى لكل جهاز شبكة (بطاقة الشبكة NIC) عند تصنيعه.

### الخصائص الرئيسية:
- **الطول:** 48 بت (6 بايت)
- **التمثيل:** يُكتب بصيغة سداسية عشرية مثل: \`AA:BB:CC:DD:EE:FF\`
- **النصف الأول (OUI):** يُحدد الشركة المصنعة
- **النصف الثاني:** رقم تسلسلي فريد من الشركة المصنعة

### أنواع عناوين MAC:
1. **Unicast** - عنوان فردي لجهاز واحد
2. **Broadcast** - \`FF:FF:FF:FF:FF:FF\` يُرسل لجميع الأجهزة
3. **Multicast** - يُرسل لمجموعة محددة من الأجهزة

### كيف يعمل؟
عندما يُريد جهاز إرسال بيانات في الشبكة المحلية (LAN):
1. يضع عنوان MAC المصدر (الخاص به) في الإطار
2. يضع عنوان MAC الوجهة في الإطار
3. إذا لم يعرف عنوان MAC الوجهة، يستخدم بروتوكول ARP لمعرفته

### جدول عناوين MAC في المحول (Switch):
المحول يحتفظ بجدول يربط بين عناوين MAC ومنافذ المحول. يتعلم المحول العناوين تلقائياً عند استقبال إطارات البيانات.`
      },
      {
        id: "ipv4-addresses",
        title: "عناوين IPv4",
        content: `## عناوين IPv4

عنوان IPv4 هو عنوان منطقي يتكون من 32 بت، يُستخدم لتعريف الأجهزة على الشبكة.

### البنية:
- **الطول:** 32 بت (4 بايت)
- **التمثيل:** أربع مجموعات عشرية مفصولة بنقاط مثل: \`192.168.1.1\`
- **النطاق:** من \`0.0.0.0\` إلى \`255.255.255.255\`

### الأصناف (Classes):

| الصنف | النطاق | قناع الشبكة الافتراضي | الاستخدام |
|-------|--------|---------------------|----------|
| A | 1.0.0.0 - 126.255.255.255 | 255.0.0.0 | شبكات كبيرة |
| B | 128.0.0.0 - 191.255.255.255 | 255.255.0.0 | شبكات متوسطة |
| C | 192.0.0.0 - 223.255.255.255 | 255.255.255.0 | شبكات صغيرة |
| D | 224.0.0.0 - 239.255.255.255 | - | Multicast |
| E | 240.0.0.0 - 255.255.255.255 | - | محجوز |

### قناع الشبكة الفرعية (Subnet Mask):
يُحدد أي جزء من العنوان يمثل الشبكة وأي جزء يمثل المضيف.
مثال: \`255.255.255.0\` = \`/24\`

---

## العناوين الخاصة (Private Addresses)

هي عناوين IP مخصصة للاستخدام **داخل الشبكات المحلية فقط**، ولا يمكن توجيهها مباشرة على الإنترنت العام.

### نطاقات العناوين الخاصة:

| الصنف | النطاق الخاص | CIDR | عدد العناوين |
|-------|------------|------|-------------|
| A | 10.0.0.0 – 10.255.255.255 | /8 | 16,777,216 |
| B | 172.16.0.0 – 172.31.255.255 | /12 | 1,048,576 |
| C | 192.168.0.0 – 192.168.255.255 | /16 | 65,536 |

### خصائص العناوين الخاصة:
- **لا تُوجَّه على الإنترنت:** أجهزة التوجيه في الإنترنت تتجاهل هذه العناوين
- **قابلة لإعادة الاستخدام:** يمكن لأي شبكة خاصة استخدامها
- **تحتاج NAT:** للوصول للإنترنت يجب ترجمتها لعناوين عامة عبر NAT
- **مجانية:** لا حاجة لشراء أو تسجيل هذه العناوين

### عناوين خاصة أخرى:
| العنوان | الوظيفة |
|---------|--------|
| \`127.0.0.0/8\` | Loopback (اختبار المضيف نفسه) |
| \`169.254.0.0/16\` | APIPA (يُعطى تلقائياً عند فشل DHCP) |
| \`0.0.0.0\` | عنوان غير محدد (Unspecified) |
| \`255.255.255.255\` | البث المحدود (Limited Broadcast) |

---

## العناوين العامة (Public Addresses)

هي عناوين IP مُعيَّنة من قِبل هيئة IANA وتُوجَّه على الإنترنت العام.

### خصائص العناوين العامة:
- **فريدة عالمياً:** لا يوجد جهازان في الإنترنت بنفس العنوان العام
- **مُسجَّلة:** تُخصص من هيئات الإنترنت الإقليمية (RIPE, ARIN, APNIC)
- **قابلة للتوجيه:** تصل إليها الحزم من أي مكان في العالم
- **محدودة:** نقصها أدى لظهور IPv6 وتقنية NAT

### مقارنة شاملة:

| الميزة | عنوان خاص | عنوان عام |
|--------|-----------|----------|
| التوجيه على الإنترنت | ❌ لا | ✅ نعم |
| الفريدية | محلياً فقط | عالمياً |
| التكلفة | مجانية | مدفوعة/مُخصصة |
| الاستخدام | شبكات داخلية | الإنترنت |
| الأمان | أكثر أماناً | يحتاج جدار حماية |

### مثال عملي:
\`\`\`
شبكة منزلية:
┌─────────────────────────────────────┐
│  PC1: 192.168.1.10  (خاص)          │
│  PC2: 192.168.1.11  (خاص)          │  ──NAT──▶  203.0.113.5 (عام)
│  Router: 192.168.1.1 (خاص - LAN)   │
└─────────────────────────────────────┘
\`\`\`
`
      },
      {
        id: "dhcp",

        title: "توزيع عناوين IP بواسطة DHCP",
        content: `## بروتوكول DHCP

DHCP (Dynamic Host Configuration Protocol) هو بروتوكول يقوم بتوزيع عناوين IP تلقائياً على الأجهزة في الشبكة.

### عملية الحصول على عنوان IP (DORA):

1. **Discover** - الجهاز يُرسل رسالة بث للبحث عن خادم DHCP
2. **Offer** - الخادم يعرض عنوان IP متاح
3. **Request** - الجهاز يطلب العنوان المعروض
4. **Acknowledge** - الخادم يؤكد التخصيص

### المعلومات التي يوفرها DHCP:
- عنوان IP
- قناع الشبكة الفرعية (Subnet Mask)
- البوابة الافتراضية (Default Gateway)
- خادم DNS
- مدة الإيجار (Lease Time)

### مزايا DHCP:
- توفير الوقت والجهد في الإدارة
- تقليل الأخطاء في التكوين اليدوي
- إدارة مركزية للعناوين
- إعادة استخدام العناوين غير المستخدمة`
      },
      {
        id: "nat",
        title: "بروتوكول NAT - ترجمة عناوين الشبكة",
        content: `## NAT (Network Address Translation)

NAT هو تقنية تُستخدم لترجمة عناوين IP الخاصة إلى عناوين IP عامة والعكس.

### لماذا نحتاج NAT؟
- نقص عناوين IPv4 العامة
- حماية الشبكة الداخلية
- مرونة في إدارة الشبكة

### أنواع NAT:

#### 1. Static NAT (ترجمة ثابتة)
- ربط عنوان خاص واحد بعنوان عام واحد
- مناسب للخوادم التي تحتاج عنوان عام ثابت

#### 2. Dynamic NAT (ترجمة ديناميكية)
- ربط عنوان خاص بعنوان عام من مجموعة (Pool)
- العناوين العامة تُوزع تلقائياً

### المصطلحات:
- **Inside Local** - العنوان الخاص داخل الشبكة
- **Inside Global** - العنوان العام الذي يمثل الجهاز الداخلي
- **Outside Local** - عنوان الوجهة كما يراه الجهاز الداخلي
- **Outside Global** - العنوان الفعلي للوجهة

### إعداد NAT على جهاز التوجيه:
\`\`\`
Router(config)# ip nat inside source static 192.168.1.10 203.0.113.10
Router(config)# interface GigabitEthernet0/0
Router(config-if)# ip nat inside
Router(config)# interface GigabitEthernet0/1
Router(config-if)# ip nat outside
\`\`\``
      },
      {
        id: "pat",
        title: "بروتوكول PAT/NAT Overload",
        content: `## PAT (Port Address Translation)

PAT، المعروف أيضاً بـ NAT Overload، يسمح لعدة أجهزة داخلية بمشاركة عنوان IP عام واحد.

### كيف يعمل PAT؟
- يستخدم أرقام المنافذ (Port Numbers) لتمييز الاتصالات
- كل اتصال يحصل على رقم منفذ فريد
- جهاز التوجيه يحتفظ بجدول ترجمة يربط بين العنوان الخاص+المنفذ والعنوان العام+المنفذ

### مثال:
| العنوان الداخلي | العنوان الخارجي |
|----------------|----------------|
| 192.168.1.10:1025 | 203.0.113.1:2001 |
| 192.168.1.11:1026 | 203.0.113.1:2002 |
| 192.168.1.12:1025 | 203.0.113.1:2003 |

### إعداد PAT:
\`\`\`
Router(config)# access-list 1 permit 192.168.1.0 0.0.0.255
Router(config)# ip nat inside source list 1 interface GigabitEthernet0/1 overload
Router(config)# interface GigabitEthernet0/0
Router(config-if)# ip nat inside
Router(config)# interface GigabitEthernet0/1
Router(config-if)# ip nat outside
\`\`\`

### مميزات PAT:
- توفير كبير في عناوين IP العامة
- يسمح لآلاف الأجهزة بمشاركة عنوان واحد
- الأكثر استخداماً في الشبكات المنزلية والشركات`
      },
      {
        id: "ipv6",
        title: "عناوين IPv6",
        content: `## عناوين IPv6

IPv6 هو الجيل التالي من بروتوكول الإنترنت، صُمم لحل مشكلة نقص عناوين IPv4.

### الخصائص:
- **الطول:** 128 بت (16 بايت)
- **التمثيل:** 8 مجموعات سداسية عشرية مفصولة بنقطتين
- **مثال:** \`2001:0DB8:0000:0000:0000:0000:0000:0001\`

### قواعد الاختصار:
1. **حذف الأصفار البادئة:** \`0DB8\` → \`DB8\`
2. **استخدام :::** لحذف مجموعات متتالية من الأصفار (مرة واحدة فقط)
   - \`2001:DB8::1\`

### أنواع العناوين:
1. **Unicast** - عنوان فردي
   - Global Unicast (\`2000::/3\`) - عنوان عام
   - Link-Local (\`FE80::/10\`) - عنوان محلي
   - Loopback (\`::1\`)
2. **Multicast** (\`FF00::/8\`) - مجموعة
3. **Anycast** - أقرب جهاز في المجموعة

### مقارنة مع IPv4:
| الميزة | IPv4 | IPv6 |
|--------|------|------|
| طول العنوان | 32 بت | 128 بت |
| عدد العناوين | ~4.3 مليار | ~340 أونديكيليون |
| التمثيل | عشري | سداسي عشري |
| DHCP | مطلوب | SLAAC + DHCPv6 |`
      },
      {
        id: "ipv6-exercise",
        title: "تمرين - تعريفات عناوين IPv6",
        content: `## تمرين: تعريفات عناوين IPv6

### التمرين 1: اختصر العناوين التالية
1. \`2001:0DB8:0000:0000:0000:0000:0000:0001\`
2. \`FE80:0000:0000:0000:0210:A4FF:FE01:0001\`
3. \`FF02:0000:0000:0000:0000:0000:0000:0001\`

**الإجابات:**
1. \`2001:DB8::1\`
2. \`FE80::210:A4FF:FE01:1\`
3. \`FF02::1\`

### التمرين 2: حدد نوع كل عنوان
1. \`2001:DB8:ACAD:1::1\` → **Global Unicast**
2. \`FE80::1\` → **Link-Local**
3. \`FF02::1\` → **Multicast (All Nodes)**
4. \`::1\` → **Loopback**

### التمرين 3: أوسّع العناوين المختصرة
1. \`2001:DB8::1\` → \`2001:0DB8:0000:0000:0000:0000:0000:0001\`
2. \`FE80::1\` → \`FE80:0000:0000:0000:0000:0000:0000:0001\`

### التمرين 4: صحيح أم خطأ
1. يمكن استخدام :: أكثر من مرة في عنوان واحد ← **خطأ**
2. عنوان Link-Local يبدأ بـ FE80 ← **صحيح**
3. IPv6 يحتاج إلى NAT ← **خطأ** (يوجد عناوين كافية)
4. طول عنوان IPv6 هو 64 بت ← **خطأ** (128 بت)`
      }
    ]
  },
  {
    id: "vlan",
    title: "شبكات VLAN",
    icon: "Tag",
    color: "from-purple-500 to-purple-700",
    topics: [
      {
        id: "vlan-gui",
        title: "إعدادات VLAN الأساسية - واجهة رسومية",
        content: `## إعدادات VLAN الأساسية (واجهة رسومية)

VLAN (Virtual Local Area Network) تسمح بتقسيم شبكة فيزيائية واحدة إلى عدة شبكات منطقية.

### لماذا نستخدم VLAN؟
- **الأمان:** فصل حركة البيانات بين الأقسام
- **الأداء:** تقليل حركة البث (Broadcast)
- **المرونة:** تجميع الأجهزة منطقياً بغض النظر عن موقعها الفيزيائي

### خطوات الإعداد في واجهة Packet Tracer الرسومية:

#### 1. إنشاء VLAN:
- افتح إعدادات المحول (Switch)
- اذهب إلى تبويب Config
- اختر VLAN Database
- أضف VLAN جديد مع رقم واسم

#### 2. تعيين المنافذ:
- اختر المنفذ المطلوب
- حدد وضع المنفذ (Access)
- اختر VLAN المناسب

### مثال عملي:
- **VLAN 10** - قسم المبيعات (Sales)
- **VLAN 20** - قسم المحاسبة (Accounting)
- **VLAN 30** - قسم تقنية المعلومات (IT)

### ملاحظات مهمة:
- VLAN 1 هو الـ VLAN الافتراضي
- الأجهزة في نفس VLAN يمكنها التواصل مباشرة
- للتواصل بين VLANs مختلفة، نحتاج جهاز توجيه`
      },
      {
        id: "vlan-cli",
        title: "إعدادات VLAN الأساسية - سطر الأوامر CLI",
        content: `## إعدادات VLAN (سطر الأوامر CLI)

### إنشاء VLAN:
\`\`\`
Switch# configure terminal
Switch(config)# vlan 10
Switch(config-vlan)# name Sales
Switch(config-vlan)# exit
Switch(config)# vlan 20
Switch(config-vlan)# name Accounting
Switch(config-vlan)# exit
\`\`\`

### تعيين منفذ لـ VLAN (Access Port):
\`\`\`
Switch(config)# interface FastEthernet0/1
Switch(config-if)# switchport mode access
Switch(config-if)# switchport access vlan 10
Switch(config-if)# exit
\`\`\`

### تعيين منفذ Trunk:
\`\`\`
Switch(config)# interface GigabitEthernet0/1
Switch(config-if)# switchport mode trunk
Switch(config-if)# switchport trunk allowed vlan 10,20,30
Switch(config-if)# exit
\`\`\`

### أوامر العرض:
\`\`\`
Switch# show vlan brief
Switch# show interfaces trunk
Switch# show interfaces FastEthernet0/1 switchport
\`\`\`

### الفرق بين Access و Trunk:
| الميزة | Access | Trunk |
|--------|--------|-------|
| عدد VLANs | واحد فقط | عدة VLANs |
| الاستخدام | توصيل أجهزة طرفية | ربط المحولات |
| التعليم (Tagging) | لا | نعم (802.1Q) |`
      },
      {
        id: "router-on-stick",
        title: "جهاز توجيه على عصا (Router on a Stick)",
        content: `## Router on a Stick

تقنية تسمح بالتوجيه بين VLANs باستخدام واجهة فيزيائية واحدة على جهاز التوجيه.

### كيف يعمل؟
- واجهة واحدة على جهاز التوجيه تُقسم إلى واجهات فرعية (Sub-interfaces)
- كل واجهة فرعية تُعين لـ VLAN محدد
- المنفذ على المحول يُعد كـ Trunk

### الإعداد على جهاز التوجيه:
\`\`\`
Router(config)# interface GigabitEthernet0/0.10
Router(config-subif)# encapsulation dot1Q 10
Router(config-subif)# ip address 192.168.10.1 255.255.255.0
Router(config-subif)# exit

Router(config)# interface GigabitEthernet0/0.20
Router(config-subif)# encapsulation dot1Q 20
Router(config-subif)# ip address 192.168.20.1 255.255.255.0
Router(config-subif)# exit

Router(config)# interface GigabitEthernet0/0
Router(config-if)# no shutdown
\`\`\`

### الإعداد على المحول:
\`\`\`
Switch(config)# interface GigabitEthernet0/1
Switch(config-if)# switchport mode trunk
\`\`\`

### المزايا:
- توفير في التكلفة (واجهة واحدة فقط)
- سهولة الإعداد

### العيوب:
- عنق زجاجة محتمل (Bottleneck)
- جميع حركة البيانات تمر عبر رابط واحد`
      },
      {
        id: "vtp",
        title: "VTP - بروتوكول إدارة VLAN",
        content: `## VTP (VLAN Trunking Protocol)

VTP هو بروتوكول من Cisco يُستخدم لإدارة VLANs بشكل مركزي عبر عدة محولات.

### أوضاع VTP:

#### 1. Server Mode
- يمكنه إنشاء وتعديل وحذف VLANs
- ينشر التغييرات للمحولات الأخرى
- الوضع الافتراضي

#### 2. Client Mode
- لا يمكنه تعديل VLANs
- يستقبل التحديثات من الخادم ويطبقها

#### 3. Transparent Mode
- يمكنه إنشاء VLANs محلياً
- يمرر رسائل VTP ولكن لا يطبقها

### إعداد VTP:
\`\`\`
Switch(config)# vtp mode server
Switch(config)# vtp domain MyNetwork
Switch(config)# vtp password cisco123
Switch(config)# vtp version 2
\`\`\`

### أوامر العرض:
\`\`\`
Switch# show vtp status
Switch# show vtp password
\`\`\`

### تحذيرات مهمة:
- **رقم المراجعة (Revision Number):** إضافة محول بـ revision number أعلى قد يمسح جميع VLANs!
- تأكد من تصفير الـ revision number قبل إضافة محول جديد
- استخدم كلمة مرور لحماية نطاق VTP`
      }
    ]
  },
  {
    id: "routing",
    title: "التوجيه",
    icon: "Route",
    color: "from-green-500 to-green-700",
    topics: [
      {
        id: "static-routing",
        title: "التوجيه الثابت",
        content: `## التوجيه الثابت (Static Routing)

التوجيه الثابت هو تحديد مسارات الشبكة يدوياً بواسطة مدير الشبكة.

### الصيغة:
\`\`\`
Router(config)# ip route [شبكة الوجهة] [قناع الشبكة] [العنوان التالي أو المنفذ]
\`\`\`

### أنواع المسارات الثابتة:

#### 1. مسار عادي:
\`\`\`
Router(config)# ip route 192.168.2.0 255.255.255.0 10.0.0.2
\`\`\`

#### 2. مسار افتراضي (Default Route):
\`\`\`
Router(config)# ip route 0.0.0.0 0.0.0.0 10.0.0.1
\`\`\`

#### 3. مسار عبر المنفذ:
\`\`\`
Router(config)# ip route 192.168.2.0 255.255.255.0 GigabitEthernet0/1
\`\`\`

### أوامر العرض:
\`\`\`
Router# show ip route
Router# show ip route static
\`\`\`

### المزايا:
- بسيط وسهل الفهم
- لا يستهلك موارد المعالج
- آمن (لا يُرسل معلومات التوجيه)

### العيوب:
- لا يتكيف مع تغييرات الشبكة
- صعب الإدارة في الشبكات الكبيرة
- يحتاج تحديث يدوي عند حدوث تغييرات`
      },
      {
        id: "ospf",
        title: "بروتوكول توجيه OSPF",
        content: `## OSPF (Open Shortest Path First)

OSPF هو بروتوكول توجيه ديناميكي يعتمد على حالة الرابط (Link-State).

### الخصائص:
- بروتوكول مفتوح (غير خاص بشركة)
- يستخدم خوارزمية Dijkstra لحساب أقصر مسار
- يدعم تقسيم الشبكة إلى مناطق (Areas)
- القيمة الإدارية: 110

### المفاهيم الأساسية:
- **Router ID:** معرف فريد لكل جهاز توجيه
- **Area:** منطقة منطقية لتجميع الشبكات
- **Area 0 (Backbone):** المنطقة الرئيسية
- **Cost:** تكلفة المسار (تعتمد على سرعة الرابط)

### إعداد OSPF:
\`\`\`
Router(config)# router ospf 1
Router(config-router)# network 192.168.1.0 0.0.0.255 area 0
Router(config-router)# network 10.0.0.0 0.0.0.3 area 0
Router(config-router)# exit
\`\`\`

### أوامر العرض:
\`\`\`
Router# show ip ospf
Router# show ip ospf neighbor
Router# show ip ospf interface
Router# show ip route ospf
\`\`\`

### حالات الجوار (Neighbor States):
Down → Init → 2-Way → ExStart → Exchange → Loading → Full`
      },
      {
        id: "rip",
        title: "بروتوكول توجيه RIP",
        content: `## RIP (Routing Information Protocol)

RIP هو بروتوكول توجيه ديناميكي يعتمد على متجه المسافة (Distance Vector).

### الإصدارات:
- **RIPv1:** لا يدعم VLSM، يستخدم البث (Broadcast)
- **RIPv2:** يدعم VLSM، يستخدم Multicast (\`224.0.0.9\`)

### الخصائص:
- أقصى عدد قفزات: 15 (16 = غير قابل للوصول)
- يُرسل تحديثات كل 30 ثانية
- القيمة الإدارية: 120
- بسيط ومناسب للشبكات الصغيرة

### إعداد RIP:
\`\`\`
Router(config)# router rip
Router(config-router)# version 2
Router(config-router)# network 192.168.1.0
Router(config-router)# network 10.0.0.0
Router(config-router)# no auto-summary
Router(config-router)# exit
\`\`\`

### أوامر العرض:
\`\`\`
Router# show ip rip database
Router# show ip route rip
Router# show ip protocols
\`\`\`

### المؤقتات:
| المؤقت | المدة | الوظيفة |
|--------|-------|---------|
| Update | 30 ثانية | إرسال تحديثات |
| Invalid | 180 ثانية | تعليم المسار كغير صالح |
| Holddown | 180 ثانية | منع تحديثات خاطئة |
| Flush | 240 ثانية | حذف المسار نهائياً |`
      },
      {
        id: "tracert-rip",
        title: "توجيه TraceRT + RIP",
        content: `## TraceRT مع بروتوكول RIP

### أمر Traceroute:
يُستخدم لتتبع المسار الذي تسلكه الحزم من المصدر إلى الوجهة.

### كيف يعمل Traceroute؟
1. يُرسل حزم بقيمة TTL تبدأ من 1
2. كل جهاز توجيه يُنقص TTL بمقدار 1
3. عندما يصل TTL إلى 0، يُرسل رسالة ICMP Time Exceeded
4. يزيد TTL تدريجياً حتى يصل إلى الوجهة

### استخدام Traceroute:
\`\`\`
PC> tracert 192.168.3.10
\`\`\`

### مثال على النتيجة:
\`\`\`
Tracing route to 192.168.3.10

  1   10 ms   10.0.0.1
  2   20 ms   10.0.1.2
  3   30 ms   192.168.3.10

Trace complete.
\`\`\`

### التمرين العملي:
1. أنشئ شبكة بثلاثة أجهزة توجيه
2. فعّل RIP v2 على جميع الأجهزة
3. تحقق من الاتصال باستخدام ping
4. استخدم tracert لتتبع المسار
5. قم بتعطيل رابط وراقب كيف يتكيف RIP

### أوامر التشخيص:
\`\`\`
Router# debug ip rip
Router# show ip route
Router# ping [address]
Router# traceroute [address]
\`\`\``
      }
    ]
  },
  {
    id: "wireless",
    title: "الشبكات اللاسلكية",
    icon: "Radio",
    color: "from-cyan-500 to-cyan-700",
    topics: [
      {
        id: "wireless-basics",
        title: "نقطة الوصول وجهاز التوجيه اللاسلكي",
        content: `## الشبكات اللاسلكية

### المكونات الأساسية:

#### نقطة الوصول (Access Point - AP):
- جهاز يربط الأجهزة اللاسلكية بالشبكة السلكية
- يعمل كجسر بين الشبكتين
- لا يقوم بالتوجيه

#### جهاز التوجيه اللاسلكي (Wireless Router):
- يجمع بين: جهاز توجيه + نقطة وصول + محول
- يقوم بالتوجيه بين الشبكات
- يوفر DHCP و NAT

### معايير Wi-Fi:
| المعيار | التردد | السرعة القصوى |
|---------|--------|--------------|
| 802.11a | 5 GHz | 54 Mbps |
| 802.11b | 2.4 GHz | 11 Mbps |
| 802.11g | 2.4 GHz | 54 Mbps |
| 802.11n | 2.4/5 GHz | 600 Mbps |
| 802.11ac | 5 GHz | 6.93 Gbps |

### أنواع التشفير:
1. **WEP** - قديم وغير آمن
2. **WPA** - تحسين على WEP
3. **WPA2** - الأكثر شيوعاً وأماناً
4. **WPA3** - الأحدث والأكثر أماناً

### إعدادات أساسية:
- **SSID:** اسم الشبكة اللاسلكية
- **Channel:** قناة البث
- **Security Mode:** نوع التشفير
- **Password:** كلمة المرور`
      },
      {
        id: "wireless-router-integration",
        title: "إضافة جهاز توجيه لاسلكي لشبكة موجودة",
        content: `## إضافة جهاز توجيه لاسلكي لشبكة موجودة

### الخطوات:

#### 1. التوصيل الفيزيائي:
- وصّل منفذ Internet/WAN بالشبكة الموجودة
- تأكد من التوصيل الصحيح

#### 2. إعداد WAN:
- اختر DHCP أو Static IP حسب الشبكة
- إذا Static: أدخل عنوان IP وقناع الشبكة والبوابة

#### 3. إعداد LAN:
- حدد نطاق عناوين الشبكة الداخلية
- مثال: \`192.168.0.0/24\`
- يجب أن يكون مختلفاً عن شبكة WAN

#### 4. إعداد DHCP:
- فعّل خادم DHCP
- حدد نطاق العناوين
- مثال: من \`192.168.0.100\` إلى \`192.168.0.200\`

#### 5. إعداد اللاسلكي:
\`\`\`
SSID: MyNetwork
Security: WPA2-PSK
Password: ********
Channel: Auto
\`\`\`

#### 6. اختبار الاتصال:
- تحقق من اتصال الأجهزة اللاسلكية
- تحقق من الوصول إلى الإنترنت
- اختبر الاتصال بالشبكة الأصلية

### نصائح:
- ضع جهاز التوجيه في موقع مركزي
- تجنب العوائق المعدنية
- استخدم WPA2 أو أحدث للأمان`
      }
    ]
  },
  {
    id: "security",
    title: "أمن المعلومات",
    icon: "Shield",
    color: "from-red-500 to-red-700",
    topics: [
      {
        id: "switch-security",
        title: "إعدادات أمان المحول (Switch)",
        content: `## أمان المحول (Port Security)

Port Security يسمح بتحديد عدد عناوين MAC المسموح بها على كل منفذ.

### إعداد Port Security:
\`\`\`
Switch(config)# interface FastEthernet0/1
Switch(config-if)# switchport mode access
Switch(config-if)# switchport port-security
Switch(config-if)# switchport port-security maximum 1
Switch(config-if)# switchport port-security mac-address sticky
Switch(config-if)# switchport port-security violation shutdown
\`\`\`

### أوضاع الانتهاك (Violation Modes):

| الوضع | الإجراء | إرسال تنبيه | زيادة العداد |
|-------|---------|------------|-------------|
| Shutdown | إيقاف المنفذ | نعم | نعم |
| Restrict | إسقاط الحزم | نعم | نعم |
| Protect | إسقاط الحزم | لا | لا |

### أوامر العرض:
\`\`\`
Switch# show port-security
Switch# show port-security interface FastEthernet0/1
Switch# show port-security address
\`\`\`

### إعادة تفعيل منفذ معطل:
\`\`\`
Switch(config)# interface FastEthernet0/1
Switch(config-if)# shutdown
Switch(config-if)# no shutdown
\`\`\`

### حماية إضافية:
- تعطيل المنافذ غير المستخدمة
- تعيينها لـ VLAN غير مستخدم`
      },
      {
        id: "router-security",
        title: "إعدادات أمان جهاز التوجيه",
        content: `## أمان جهاز التوجيه

### كلمات المرور:

#### 1. كلمة مرور Console:
\`\`\`
Router(config)# line console 0
Router(config-line)# password cisco
Router(config-line)# login
\`\`\`

#### 2. كلمة مرور Enable:
\`\`\`
Router(config)# enable secret class
\`\`\`

#### 3. كلمة مرور VTY (Telnet/SSH):
\`\`\`
Router(config)# line vty 0 4
Router(config-line)# password cisco
Router(config-line)# login
\`\`\`

### تشفير كلمات المرور:
\`\`\`
Router(config)# service password-encryption
\`\`\`

### إعداد Banner:
\`\`\`
Router(config)# banner motd #
*** تحذير: الوصول غير المصرح به ممنوع ***
*** جميع الأنشطة مراقبة ومسجلة ***
#
\`\`\`

### إعداد SSH:
\`\`\`
Router(config)# hostname R1
R1(config)# ip domain-name example.com
R1(config)# crypto key generate rsa
R1(config)# username admin secret class
R1(config)# line vty 0 4
R1(config-line)# transport input ssh
R1(config-line)# login local
\`\`\`

### أفضل الممارسات:
- استخدم \`enable secret\` بدلاً من \`enable password\`
- فعّل تشفير كلمات المرور
- استخدم SSH بدلاً من Telnet
- أضف banner تحذيري`
      },
      {
        id: "standard-acl-1",
        title: "قائمة التحكم بالوصول القياسية 1",
        content: `## قوائم التحكم بالوصول القياسية (Standard ACL) - الجزء 1

ACL هي قوائم تُستخدم لتصفية حركة البيانات بناءً على معايير محددة.

### أنواع ACL:
1. **Standard ACL (1-99):** تصفية بناءً على عنوان المصدر فقط
2. **Extended ACL (100-199):** تصفية بناءً على المصدر والوجهة والبروتوكول والمنفذ

### قواعد Standard ACL:
- تُطبق على عنوان IP المصدر فقط
- تُوضع أقرب ما يمكن من **الوجهة**
- تُعالج من الأعلى للأسفل
- يوجد \`deny all\` ضمني في النهاية

### الصيغة:
\`\`\`
Router(config)# access-list [رقم] [permit|deny] [عنوان] [wildcard mask]
\`\`\`

### أمثلة:

#### منع شبكة محددة:
\`\`\`
Router(config)# access-list 1 deny 192.168.1.0 0.0.0.255
Router(config)# access-list 1 permit any
\`\`\`

#### السماح لمضيف محدد:
\`\`\`
Router(config)# access-list 2 permit host 192.168.1.10
Router(config)# access-list 2 deny any
\`\`\`

### تطبيق ACL على واجهة:
\`\`\`
Router(config)# interface GigabitEthernet0/0
Router(config-if)# ip access-group 1 out
\`\`\`

### Wildcard Mask:
عكس قناع الشبكة:
- \`255.255.255.0\` → \`0.0.0.255\`
- \`255.255.0.0\` → \`0.0.255.255\``
      },
      {
        id: "standard-acl-2",
        title: "قائمة التحكم بالوصول القياسية 2",
        content: `## قوائم التحكم بالوصول القياسية - الجزء 2

### Named ACL (قوائم مسماة):
\`\`\`
Router(config)# ip access-list standard BLOCK_SALES
Router(config-std-nacl)# deny 192.168.10.0 0.0.0.255
Router(config-std-nacl)# permit any
Router(config-std-nacl)# exit
Router(config)# interface GigabitEthernet0/1
Router(config-if)# ip access-group BLOCK_SALES out
\`\`\`

### تعديل ACL مسماة:
\`\`\`
Router(config)# ip access-list standard BLOCK_SALES
Router(config-std-nacl)# no 10
Router(config-std-nacl)# 10 deny 192.168.20.0 0.0.0.255
\`\`\`

### أوامر العرض:
\`\`\`
Router# show access-lists
Router# show ip access-lists
Router# show running-config | include access-list
\`\`\`

### سيناريو عملي:
**المطلوب:** منع قسم المحاسبة (192.168.20.0/24) من الوصول لخادم الويب، مع السماح للباقي.

\`\`\`
Router(config)# access-list 10 deny 192.168.20.0 0.0.0.255
Router(config)# access-list 10 permit any
Router(config)# interface GigabitEthernet0/1
Router(config-if)# ip access-group 10 out
\`\`\`

### نصائح مهمة:
- لا تنسَ إضافة \`permit any\` في النهاية
- الترتيب مهم: القاعدة الأولى المطابقة تُطبق
- وثّق كل ACL بتعليق واضح
- اختبر ACL قبل تطبيقها في بيئة إنتاج`
      }
    ]
  },
  {
    id: "network-services",
    title: "خدمات الشبكة",
    icon: "Server",
    color: "from-amber-500 to-amber-700",
    topics: [
      {
        id: "dhcp-server",
        title: "خادم DHCP",
        content: `## إعداد خادم DHCP

### إعداد DHCP على جهاز التوجيه:
\`\`\`
Router(config)# ip dhcp pool OFFICE
Router(dhcp-config)# network 192.168.1.0 255.255.255.0
Router(dhcp-config)# default-router 192.168.1.1
Router(dhcp-config)# dns-server 8.8.8.8
Router(dhcp-config)# exit
\`\`\`

### استثناء عناوين:
\`\`\`
Router(config)# ip dhcp excluded-address 192.168.1.1 192.168.1.10
\`\`\`

### أوامر العرض:
\`\`\`
Router# show ip dhcp binding
Router# show ip dhcp pool
Router# show ip dhcp server statistics
\`\`\`

### إعداد DHCP في Packet Tracer:
1. أضف خادم (Server) للشبكة
2. اذهب إلى Services → DHCP
3. فعّل الخدمة (ON)
4. أدخل:
   - Default Gateway
   - DNS Server
   - Start IP Address
   - Subnet Mask
   - Maximum Users

### إعداد العملاء:
- على كل جهاز، اختر DHCP بدلاً من Static
- سيحصل تلقائياً على: IP, Subnet, Gateway, DNS`
      },
      {
        id: "dns-http",
        title: "خوادم DNS و HTTP",
        content: `## DNS و HTTP

### DNS (Domain Name System):
نظام يربط أسماء النطاقات بعناوين IP.

#### إعداد خادم DNS في Packet Tracer:
1. أضف خادم → Services → DNS
2. فعّل الخدمة
3. أضف سجلات:
   - Name: \`www.example.com\`
   - Address: \`192.168.1.100\`
   - Type: A Record

#### أنواع السجلات:
| النوع | الوظيفة |
|-------|---------|
| A | ربط اسم بعنوان IPv4 |
| AAAA | ربط اسم بعنوان IPv6 |
| CNAME | اسم بديل |
| MX | خادم البريد |
| NS | خادم الأسماء |

### HTTP (HyperText Transfer Protocol):

#### إعداد خادم HTTP في Packet Tracer:
1. أضف خادم → Services → HTTP
2. فعّل HTTP و HTTPS
3. عدّل صفحة \`index.html\`

#### اختبار:
- افتح متصفح ويب على جهاز PC
- أدخل عنوان IP الخادم أو اسم النطاق
- يجب أن تظهر الصفحة

### الربط بين DNS و HTTP:
1. خادم DNS يربط \`www.example.com\` بـ \`192.168.1.100\`
2. المستخدم يكتب \`www.example.com\`
3. DNS يُحوّل الاسم إلى IP
4. المتصفح يتصل بخادم HTTP`
      },
      {
        id: "email-server",
        title: "خادم البريد الإلكتروني",
        content: `## خادم البريد الإلكتروني

### البروتوكولات:
- **SMTP:** إرسال البريد (المنفذ 25)
- **POP3:** استقبال البريد (المنفذ 110)

### إعداد خادم البريد في Packet Tracer:

#### 1. على الخادم:
- Services → EMAIL
- أدخل اسم النطاق: \`example.com\`
- فعّل SMTP و POP3
- أضف مستخدمين:
  - User: \`ahmed\`, Password: \`pass123\`
  - User: \`sara\`, Password: \`pass456\`

#### 2. على أجهزة العملاء:
- Desktop → Email
- أدخل:
  - Your Name: Ahmed
  - Email: \`ahmed@example.com\`
  - Incoming: IP الخادم
  - Outgoing: IP الخادم
  - User: ahmed
  - Password: pass123

### اختبار إرسال بريد:
1. من جهاز Ahmed: Compose → To: \`sara@example.com\`
2. اكتب الموضوع والرسالة
3. Send
4. على جهاز Sara: Receive

### ملاحظات:
- تأكد من إعداد DNS لربط اسم النطاق بعنوان IP الخادم
- يجب أن تكون جميع الأجهزة في نفس الشبكة أو تستطيع الوصول للخادم`
      },
      {
        id: "ftp",
        title: "خادم FTP",
        content: `## FTP (File Transfer Protocol)

بروتوكول نقل الملفات يُستخدم لنقل الملفات بين الأجهزة.

### المنافذ:
- **المنفذ 20:** نقل البيانات
- **المنفذ 21:** أوامر التحكم

### إعداد خادم FTP في Packet Tracer:

#### على الخادم:
1. Services → FTP
2. فعّل الخدمة
3. أضف مستخدمين مع صلاحيات:
   - Username: admin
   - Password: admin123
   - صلاحيات: Read, Write, Delete, Rename, List

### استخدام FTP من سطر الأوامر:
\`\`\`
PC> ftp 192.168.1.100
Username: admin
Password: admin123
ftp> dir
ftp> get filename.txt
ftp> put myfile.txt
ftp> quit
\`\`\`

### الأوامر الشائعة:
| الأمر | الوظيفة |
|-------|---------|
| dir/ls | عرض الملفات |
| get | تحميل ملف |
| put | رفع ملف |
| delete | حذف ملف |
| rename | إعادة تسمية |
| quit | خروج |

### FTP مقابل TFTP:
| الميزة | FTP | TFTP |
|--------|-----|------|
| المصادقة | نعم | لا |
| الأمان | أفضل | أقل |
| السرعة | أبطأ | أسرع |
| المنفذ | 20/21 | 69 |`
      },
      {
        id: "servers-exercise",
        title: "تمرين ختامي حول الخوادم",
        content: `## تمرين ختامي شامل حول الخوادم

### المطلوب:
أنشئ شبكة تحتوي على جميع الخوادم وقم بإعدادها.

### مكونات الشبكة:
- 3 أجهزة كمبيوتر (PC0, PC1, PC2)
- 1 محول (Switch)
- 1 جهاز توجيه (Router)
- 4 خوادم: DHCP, DNS, HTTP/HTTPS, Email

### المهام:

#### المهمة 1: إعداد الشبكة الأساسية
- عنوان الشبكة: \`192.168.1.0/24\`
- البوابة: \`192.168.1.1\`

#### المهمة 2: خادم DHCP
- نطاق العناوين: \`192.168.1.100 - 192.168.1.200\`
- DNS: \`192.168.1.10\`

#### المهمة 3: خادم DNS
- ربط \`www.school.com\` بعنوان خادم HTTP
- ربط \`mail.school.com\` بعنوان خادم البريد

#### المهمة 4: خادم HTTP
- إنشاء صفحة ترحيب بسيطة
- تفعيل HTTPS

#### المهمة 5: خادم البريد
- النطاق: \`school.com\`
- إنشاء 3 حسابات بريد
- إرسال واستقبال رسائل اختبارية

#### المهمة 6: الاختبار
- تحقق من حصول الأجهزة على عناوين DHCP
- افتح \`www.school.com\` من المتصفح
- أرسل بريداً بين المستخدمين`
      },
      {
        id: "telnet-router",
        title: "Telnet - اتصال عن بعد بالموجه",
        content: `## Telnet - الاتصال عن بعد بجهاز التوجيه

### ما هو Telnet؟
بروتوكول يسمح بالتحكم عن بعد بأجهزة الشبكة عبر سطر الأوامر.

### إعداد Telnet على جهاز التوجيه:
\`\`\`
Router(config)# enable secret class
Router(config)# line vty 0 4
Router(config-line)# password cisco
Router(config-line)# login
Router(config-line)# transport input telnet
Router(config-line)# exit
\`\`\`

### الاتصال بجهاز التوجيه:
\`\`\`
PC> telnet 192.168.1.1
Password: cisco
Router> enable
Password: class
Router#
\`\`\`

### تحذير أمني:
- Telnet يُرسل البيانات بنص واضح (غير مشفر)
- يُفضل استخدام SSH بدلاً منه
- كلمات المرور يمكن التقاطها بسهولة

### إعداد SSH (البديل الآمن):
\`\`\`
Router(config)# hostname R1
R1(config)# ip domain-name lab.com
R1(config)# crypto key generate rsa
R1(config)# username admin privilege 15 secret class
R1(config)# line vty 0 4
R1(config-line)# transport input ssh
R1(config-line)# login local
\`\`\`

### الاتصال عبر SSH:
\`\`\`
PC> ssh -l admin 192.168.1.1
\`\`\``
      },
      {
        id: "telnet-switch",
        title: "Telnet - اتصال عن بعد بالمحول + SVI",
        content: `## Telnet للمحول مع إعداد SVI

### ما هو SVI؟
SVI (Switch Virtual Interface) هو واجهة افتراضية تُعطي المحول عنوان IP للإدارة عن بعد.

### إعداد SVI:
\`\`\`
Switch(config)# interface vlan 1
Switch(config-if)# ip address 192.168.1.2 255.255.255.0
Switch(config-if)# no shutdown
Switch(config-if)# exit
Switch(config)# ip default-gateway 192.168.1.1
\`\`\`

### إعداد Telnet على المحول:
\`\`\`
Switch(config)# enable secret class
Switch(config)# line vty 0 15
Switch(config-line)# password cisco
Switch(config-line)# login
Switch(config-line)# transport input telnet
Switch(config-line)# exit
\`\`\`

### الاتصال:
\`\`\`
PC> telnet 192.168.1.2
Password: cisco
Switch> enable
Password: class
Switch#
\`\`\`

### إعداد SSH على المحول:
\`\`\`
Switch(config)# hostname SW1
SW1(config)# ip domain-name lab.com
SW1(config)# crypto key generate rsa
SW1(config)# username admin secret class
SW1(config)# line vty 0 15
SW1(config-line)# transport input ssh
SW1(config-line)# login local
\`\`\`

### أوامر التحقق:
\`\`\`
Switch# show ip interface brief
Switch# show vlan brief
Switch# show line vty 0 4
\`\`\``
      }
    ]
  },
  {
    id: "iot",
    title: "إنترنت الأشياء (IoT)",
    icon: "Cpu",
    color: "from-indigo-500 to-indigo-700",
    topics: [
      {
        id: "iot-basics",
        title: "إنترنت الأشياء - تعريفات أساسية",
        content: `## إنترنت الأشياء (IoT) - المفاهيم الأساسية

### ما هو إنترنت الأشياء؟
شبكة من الأجهزة الفيزيائية المتصلة بالإنترنت، قادرة على جمع ومشاركة البيانات.

### الأركان الأربعة لـ IoT:
1. **الأجهزة (Things):** حساسات، مشغلات، أجهزة ذكية
2. **الاتصال (Connectivity):** Wi-Fi, Bluetooth, Zigbee, LoRa
3. **معالجة البيانات (Data Processing):** تحليل البيانات واتخاذ قرارات
4. **واجهة المستخدم (User Interface):** تطبيقات ولوحات تحكم

### مكونات نظام IoT:
- **الحساسات (Sensors):** تقيس البيئة المحيطة
  - حرارة، رطوبة، ضوء، حركة، ضغط
- **المشغلات (Actuators):** تنفذ إجراءات
  - محركات، أضواء، صمامات، مراوح
- **المتحكم (Controller):** يعالج البيانات ويتخذ القرارات
- **البوابة (Gateway):** يربط أجهزة IoT بالإنترنت

### أمثلة تطبيقية:
- المنزل الذكي (إضاءة، تكييف، أمان)
- المدن الذكية (إشارات مرور، مواقف)
- الصحة (مراقبة المرضى)
- الزراعة (ري ذكي)
- الصناعة (صيانة تنبؤية)`
      },
      {
        id: "iot-terms",
        title: "إنترنت الأشياء - تعريف المصطلحات",
        content: `## مصطلحات إنترنت الأشياء

### المصطلحات الأساسية:

| المصطلح | التعريف |
|---------|---------|
| **IoT** | Internet of Things - إنترنت الأشياء |
| **M2M** | Machine to Machine - اتصال آلة بآلة |
| **Sensor** | حساس - يجمع بيانات من البيئة |
| **Actuator** | مشغل - ينفذ إجراءات فيزيائية |
| **Embedded System** | نظام مدمج - حاسوب مصغر داخل جهاز |
| **Firmware** | برنامج ثابت محفوظ في الجهاز |
| **Edge Computing** | معالجة البيانات قرب المصدر |
| **Cloud Computing** | معالجة البيانات في السحابة |
| **Big Data** | بيانات ضخمة تُجمع من أجهزة IoT |
| **API** | واجهة برمجية للتواصل بين الأنظمة |

### بروتوكولات IoT:
| البروتوكول | الاستخدام |
|-----------|----------|
| **MQTT** | رسائل خفيفة للأجهزة المحدودة |
| **CoAP** | نقل بيانات لأجهزة IoT |
| **HTTP/HTTPS** | تطبيقات الويب |
| **WebSocket** | اتصال ثنائي الاتجاه |
| **Bluetooth** | اتصال قصير المدى |
| **Zigbee** | شبكات منخفضة الطاقة |
| **LoRaWAN** | اتصال بعيد المدى منخفض الطاقة |

### تحديات IoT:
1. **الأمان:** حماية الأجهزة والبيانات
2. **الخصوصية:** حماية بيانات المستخدمين
3. **التوافق:** معايير مختلفة بين الشركات
4. **الطاقة:** عمر البطارية للأجهزة
5. **القياسية:** إدارة ملايين الأجهزة`
      },
      {
        id: "iot-wireless",
        title: "إنترنت الأشياء - المكونات اللاسلكية",
        content: `## المكونات اللاسلكية في IoT

### تقنيات الاتصال اللاسلكي:

#### 1. Wi-Fi (IEEE 802.11)
- **المدى:** 50-100 متر
- **السرعة:** عالية
- **الطاقة:** عالية نسبياً
- **الاستخدام:** أجهزة المنزل الذكي

#### 2. Bluetooth / BLE
- **المدى:** 10-100 متر
- **السرعة:** متوسطة
- **الطاقة:** منخفضة (BLE)
- **الاستخدام:** أجهزة قابلة للارتداء، حساسات

#### 3. Zigbee (IEEE 802.15.4)
- **المدى:** 10-100 متر
- **السرعة:** منخفضة (250 Kbps)
- **الطاقة:** منخفضة جداً
- **الاستخدام:** أتمتة المنزل، إضاءة ذكية

#### 4. LoRa / LoRaWAN
- **المدى:** حتى 15 كم
- **السرعة:** منخفضة جداً
- **الطاقة:** منخفضة جداً
- **الاستخدام:** مدن ذكية، زراعة

#### 5. NFC (Near Field Communication)
- **المدى:** حتى 10 سم
- **السرعة:** منخفضة
- **الاستخدام:** دفع إلكتروني، تعريف

### مقارنة شاملة:
| التقنية | المدى | الطاقة | السرعة | التكلفة |
|---------|-------|--------|--------|---------|
| Wi-Fi | متوسط | عالية | عالية | متوسطة |
| BLE | قصير | منخفضة | متوسطة | منخفضة |
| Zigbee | قصير | منخفضة | منخفضة | منخفضة |
| LoRa | طويل | منخفضة | منخفضة | منخفضة |
| NFC | قصير جداً | منخفضة | منخفضة | منخفضة |

### اختيار التقنية المناسبة:
- **سرعة عالية + مدى متوسط:** Wi-Fi
- **طاقة منخفضة + مدى قصير:** BLE أو Zigbee
- **مدى طويل + طاقة منخفضة:** LoRa
- **قرب شديد + أمان:** NFC`
      }
    ]
  }
];

export default courseData;