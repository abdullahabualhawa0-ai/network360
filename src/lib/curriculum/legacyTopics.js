/**
 * legacyTopics.js
 * دروس إضافية من المحتوى السابق (غير موجودة في الوحدات الجديدة)
 * تم الحفاظ عليها لضمان استمرار عمل الاختبارات والمحاكاة الطرفية
 */

export const LEGACY_TOPICS = {
  // دروس إضافية لوحدة IPv4
  "unit11-ipv4": [
    {
      id: "ipv6",
      title: "عناوين IPv6",
      unitNumber: 11,
      content: `## عناوين IPv6

IPv6 هو الجيل التالي من بروتوكول الإنترنت، صُمم لحل مشكلة نقص عناوين IPv4.

### الخصائص:
- **الطول:** 128 بت (16 بايت)
- **التمثيل:** 8 مجموعات سداسية عشرية مفصولة بنقطتين
- **مثال:** \`2001:0DB8:0000:0000:0000:0000:0000:0001\`

### قواعد الاختصار:
1. **حذف الأصفار البادئة:** \`0DB8\` → \`DB8\`
2. **استخدام :::** لحذف مجموعات متتالية من الأصفار (مرة واحدة فقط)

### أنواع العناوين:
1. **Unicast** - Global (\`2000::/3\`), Link-Local (\`FE80::/10\`), Loopback (\`::1\`)
2. **Multicast** (\`FF00::/8\`)
3. **Anycast**

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
      unitNumber: 11,
      content: `## تمرين: تعريفات عناوين IPv6

### التمرين 1: اختصر العناوين التالية
1. \`2001:0DB8:0000:0000:0000:0000:0000:0001\`
2. \`FE80:0000:0000:0000:0210:A4FF:FE01:0001\`

**الإجابات:**
1. \`2001:DB8::1\`
2. \`FE80::210:A4FF:FE01:1\`

### التمرين 2: حدد نوع كل عنوان
1. \`2001:DB8:ACAD:1::1\` → **Global Unicast**
2. \`FE80::1\` → **Link-Local**
3. \`FF02::1\` → **Multicast (All Nodes)**
4. \`::1\` → **Loopback**

### التمرين 3: صحيح أم خطأ
1. يمكن استخدام :: أكثر من مرة في عنوان واحد ← **خطأ**
2. عنوان Link-Local يبدأ بـ FE80 ← **صحيح**
3. IPv6 يحتاج إلى NAT ← **خطأ**
4. طول عنوان IPv6 هو 64 بت ← **خطأ** (128 بت)`
    }
  ],

  // درس DHCP الأساسي (إضافة لوحدة DHCP)
  "unit19-dhcp": [
    {
      id: "dhcp",
      title: "توزيع عناوين IP بواسطة DHCP",
      unitNumber: 19,
      content: `## بروتوكول DHCP

DHCP (Dynamic Host Configuration Protocol) يقوم بتوزيع عناوين IP تلقائياً.

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
    }
  ],

  // دروس RIP الإضافية لوحدة التوجيه
  "unit24-static-routing": [
    {
      id: "rip",
      title: "بروتوكول توجيه RIP",
      unitNumber: 24,
      content: `## RIP (Routing Information Protocol)

RIP هو بروتوكول توجيه ديناميكي يعتمد على متجه المسافة (Distance Vector).

### الإصدارات:
- **RIPv1:** لا يدعم VLSM، يستخدم البث (Broadcast)
- **RIPv2:** يدعم VLSM، يستخدم Multicast (\`224.0.0.9\`)

### الخصائص:
- أقصى عدد قفزات: 15 (16 = غير قابل للوصول)
- يُرسل تحديثات كل 30 ثانية
- القيمة الإدارية: 120
- مناسب للشبكات الصغيرة

### إعداد RIP:
\`\`\`
Router(config)# router rip
Router(config-router)# version 2
Router(config-router)# network 192.168.1.0
Router(config-router)# network 10.0.0.0
Router(config-router)# no auto-summary
\`\`\`

### أوامر العرض:
\`\`\`
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
      unitNumber: 24,
      content: `## TraceRT مع بروتوكول RIP

### أمر Traceroute:
يُستخدم لتتبع المسار الذي تسلكه الحزم من المصدر إلى الوجهة.

### كيف يعمل Traceroute؟
1. يُرسل حزم بقيمة TTL تبدأ من 1
2. كل جهاز توجيه يُنقص TTL بمقدار 1
3. عندما يصل TTL إلى 0، يُرسل رسالة ICMP Time Exceeded
4. يزيد TTL تدريجياً حتى يصل إلى الوجهة

### الاستخدام:
\`\`\`
PC> tracert 192.168.3.10
\`\`\`

### مثال على النتيجة:
\`\`\`
  1   10 ms   10.0.0.1
  2   20 ms   10.0.1.2
  3   30 ms   192.168.3.10
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
Router# traceroute [address]
\`\`\``
    }
  ],

  // درس VLAN CLI الإضافي
  "unit17-vlan": [
    {
      id: "vlan-cli",
      title: "إعدادات VLAN الأساسية - سطر الأوامر CLI",
      unitNumber: 17,
      content: `## إعدادات VLAN (سطر الأوامر CLI)

### إنشاء VLAN:
\`\`\`
Switch# configure terminal
Switch(config)# vlan 10
Switch(config-vlan)# name Sales
Switch(config-vlan)# exit
Switch(config)# vlan 20
Switch(config-vlan)# name Accounting
\`\`\`

### تعيين منفذ لـ VLAN (Access Port):
\`\`\`
Switch(config)# interface FastEthernet0/1
Switch(config-if)# switchport mode access
Switch(config-if)# switchport access vlan 10
\`\`\`

### تعيين منفذ Trunk:
\`\`\`
Switch(config)# interface GigabitEthernet0/1
Switch(config-if)# switchport mode trunk
Switch(config-if)# switchport trunk allowed vlan 10,20,30
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
| الاستخدام | أجهزة طرفية | ربط المحولات |
| التعليم (Tagging) | لا | نعم (802.1Q) |`
    }
  ],

  // درس أمان الراوتر الإضافي
  "unit20-switch-security": [
    {
      id: "router-security",
      title: "إعدادات أمان جهاز التوجيه",
      unitNumber: 20,
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
    }
  ],

  // دروس الخوادم الإضافية لوحدة التطبيقات
  "unit14-application": [
    {
      id: "dns-http",
      title: "خوادم DNS و HTTP",
      unitNumber: 14,
      content: `## DNS و HTTP

### DNS (Domain Name System):
نظام يربط أسماء النطاقات بعناوين IP.

#### إعداد خادم DNS في Packet Tracer:
1. أضف خادم → Services → DNS
2. فعّل الخدمة
3. أضف سجلات A Record

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

### الربط بين DNS و HTTP:
1. خادم DNS يربط \`www.example.com\` بـ \`192.168.1.100\`
2. المستخدم يكتب \`www.example.com\`
3. DNS يُحوّل الاسم إلى IP
4. المتصفح يتصل بخادم HTTP`
    },
    {
      id: "email-server",
      title: "خادم البريد الإلكتروني",
      unitNumber: 14,
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
- أدخل بيانات الحساب و IP الخادم (Incoming/Outgoing)

### اختبار إرسال بريد:
1. من جهاز Ahmed: Compose → To: \`sara@example.com\`
2. اكتب الموضوع والرسالة ثم Send
3. على جهاز Sara: Receive

### ملاحظات:
- تأكد من إعداد DNS لربط اسم النطاق بعنوان IP الخادم
- يجب أن تكون جميع الأجهزة قادرة على الوصول للخادم`
    },
    {
      id: "ftp",
      title: "خادم FTP",
      unitNumber: 14,
      content: `## FTP (File Transfer Protocol)

بروتوكول نقل الملفات يُستخدم لنقل الملفات بين الأجهزة.

### المنافذ:
- **المنفذ 20:** نقل البيانات
- **المنفذ 21:** أوامر التحكم

### إعداد خادم FTP في Packet Tracer:
1. Services → FTP
2. فعّل الخدمة
3. أضف مستخدمين مع صلاحيات (Read, Write, Delete, Rename, List)

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
| quit | خروج |

### FTP مقابل TFTP:
| الميزة | FTP | TFTP |
|--------|-----|------|
| المصادقة | نعم | لا |
| السرعة | أبطأ | أسرع |
| المنفذ | 20/21 | 69 |`
    },
    {
      id: "servers-exercise",
      title: "تمرين ختامي حول الخوادم",
      unitNumber: 14,
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
      unitNumber: 14,
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
\`\`\`

### الاتصال بجهاز التوجيه:
\`\`\`
PC> telnet 192.168.1.1
Password: cisco
Router> enable
Password: class
\`\`\`

### تحذير أمني:
- Telnet يُرسل البيانات بنص واضح (غير مشفر)
- يُفضل استخدام SSH بدلاً منه

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
      unitNumber: 14,
      content: `## Telnet للمحول مع إعداد SVI

### ما هو SVI؟
SVI (Switch Virtual Interface) هو واجهة افتراضية تُعطي المحول عنوان IP للإدارة عن بعد.

### إعداد SVI:
\`\`\`
Switch(config)# interface vlan 1
Switch(config-if)# ip address 192.168.1.2 255.255.255.0
Switch(config-if)# no shutdown
Switch(config)# ip default-gateway 192.168.1.1
\`\`\`

### إعداد Telnet على المحول:
\`\`\`
Switch(config)# enable secret class
Switch(config)# line vty 0 15
Switch(config-line)# password cisco
Switch(config-line)# login
Switch(config-line)# transport input telnet
\`\`\`

### الاتصال:
\`\`\`
PC> telnet 192.168.1.2
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
\`\`\``
    }
  ]
};

/**
 * وحدة إنترنت الأشياء (IoT) - محفوظة من المحتوى السابق
 */
export const IOT_UNIT = {
  id: "iot",
  unit: 28,
  title: "إنترنت الأشياء (IoT)",
  icon: "Cpu",
  color: "from-indigo-500 to-indigo-700",
  hours: { theory: 10, practical: 10, total: 20 },
  difficulty: "medium",
  topics: [
    {
      id: "iot-basics",
      title: "إنترنت الأشياء - تعريفات أساسية",
      unitNumber: 28,
      content: `## إنترنت الأشياء (IoT) - المفاهيم الأساسية

### ما هو إنترنت الأشياء؟
شبكة من الأجهزة الفيزيائية المتصلة بالإنترنت، قادرة على جمع ومشاركة البيانات.

### الأركان الأربعة لـ IoT:
1. **الأجهزة (Things):** حساسات، مشغلات، أجهزة ذكية
2. **الاتصال (Connectivity):** Wi-Fi, Bluetooth, Zigbee, LoRa
3. **معالجة البيانات (Data Processing):** تحليل البيانات واتخاذ قرارات
4. **واجهة المستخدم (User Interface):** تطبيقات ولوحات تحكم

### مكونات نظام IoT:
- **الحساسات (Sensors):** حرارة، رطوبة، ضوء، حركة
- **المشغلات (Actuators):** محركات، أضواء، صمامات
- **المتحكم (Controller):** يعالج البيانات
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
      unitNumber: 28,
      content: `## مصطلحات إنترنت الأشياء

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
| **Big Data** | بيانات ضخمة من أجهزة IoT |
| **API** | واجهة برمجية للتواصل بين الأنظمة |

### بروتوكولات IoT:
| البروتوكول | الاستخدام |
|-----------|----------|
| **MQTT** | رسائل خفيفة للأجهزة المحدودة |
| **CoAP** | نقل بيانات لأجهزة IoT |
| **WebSocket** | اتصال ثنائي الاتجاه |
| **Bluetooth** | اتصال قصير المدى |
| **Zigbee** | شبكات منخفضة الطاقة |
| **LoRaWAN** | اتصال بعيد المدى منخفض الطاقة |

### تحديات IoT:
1. **الأمان:** حماية الأجهزة والبيانات
2. **الخصوصية:** حماية بيانات المستخدمين
3. **التوافق:** معايير مختلفة بين الشركات
4. **الطاقة:** عمر البطارية للأجهزة`
    },
    {
      id: "iot-wireless",
      title: "إنترنت الأشياء - المكونات اللاسلكية",
      unitNumber: 28,
      content: `## المكونات اللاسلكية في IoT

### تقنيات الاتصال اللاسلكي:

#### 1. Wi-Fi (IEEE 802.11)
- **المدى:** 50-100 متر | **السرعة:** عالية | **الطاقة:** عالية

#### 2. Bluetooth / BLE
- **المدى:** 10-100 متر | **السرعة:** متوسطة | **الطاقة:** منخفضة

#### 3. Zigbee (IEEE 802.15.4)
- **المدى:** 10-100 متر | **السرعة:** 250 Kbps | **الطاقة:** منخفضة جداً

#### 4. LoRa / LoRaWAN
- **المدى:** حتى 15 كم | **السرعة:** منخفضة | **الطاقة:** منخفضة جداً

#### 5. NFC (Near Field Communication)
- **المدى:** حتى 10 سم | **الاستخدام:** دفع إلكتروني

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
};