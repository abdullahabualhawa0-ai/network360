import React from "react";

/**
 * DeviceIcons.jsx — أيقونات أجهزة شبكية واقعية وعالية الدقة والترتيب
 * مصممة بتقنية المتجهات (SVG) الاحترافية لتعكس المظهر الحقيقي لأجهزة الشبكات
 * بدلاً من الرموز التعبيرية (Emojis) والرسومات البسيطة.
 */

export function RouterIcon({ size = 32, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* جسم الراوتر الرئيسي */}
      <rect x="4" y="16" width="40" height="20" rx="4" fill="#0F172A" stroke="#334155" strokeWidth="1.5" />
      {/* لوحة الواجهة المعدنية */}
      <rect x="7" y="19" width="34" height="14" rx="2.5" fill="#1E293B" />
      
      {/* هوائيات الراوتر الخلفية المنحنية بدقة */}
      <path d="M12 16V9C12 7.89543 12.8954 7 14 7H15" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
      <path d="M36 16V9C36 7.89543 35.1046 7 34 7H33" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
      
      {/* شعار التوجيه الشبكي في المنتصف (Universal Routing Arrows) */}
      <circle cx="24" cy="26" r="4.5" fill="#0284C7" fillOpacity="0.2" stroke="#0EA5E9" strokeWidth="1" />
      {/* أسهم التوجيه الأربعة */}
      <path d="M22 24L20 26L22 28" stroke="#38BDF8" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M26 24L28 26L26 28" stroke="#38BDF8" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M24 22L26 20L28 22" stroke="#38BDF8" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M24 30L22 32L20 30" stroke="#38BDF8" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />

      {/* منافذ الشبكة اليسرى */}
      <rect x="9" y="23" width="3" height="4" rx="0.5" fill="#334155" />
      <rect x="13.5" y="23" width="3" height="4" rx="0.5" fill="#334155" />

      {/* لمبات البيان والمؤشرات الضوئية (LEDs) */}
      <circle cx="34" cy="23.5" r="1.2" fill="#10B981" />
      <circle cx="37" cy="23.5" r="1.2" fill="#38BDF8" />
      <circle cx="34" cy="28.5" r="1.2" fill="#F59E0B" />
      <circle cx="37" cy="28.5" r="1.2" fill="#10B981" />
    </svg>
  );
}

export function SwitchIcon({ size = 32, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* هيكل السويتش المعدني لرف الخوادم (Rackmount Chassis) */}
      <rect x="3" y="17" width="42" height="16" rx="3" fill="#0B132B" stroke="#1E293B" strokeWidth="1.5" />
      <rect x="5.5" y="19" width="37" height="12" rx="2" fill="#1C2541" />

      {/* صفين من منافذ RJ45 الإيثرنت المنظمة */}
      {[8, 12.5, 17, 21.5, 26, 30.5].map((x, idx) => (
        <g key={idx}>
          {/* المنفذ العلوي */}
          <rect x={x} y="20.5" width="3.2" height="3" rx="0.5" fill="#0B132B" stroke="#3A506B" strokeWidth="0.5" />
          {/* مؤشر LED نشاط المنفذ */}
          <circle cx={x + 1.6} cy="24.5" r="0.6" fill={idx % 2 === 0 ? "#10B981" : "#F59E0B"} />
          {/* المنفذ السفلي */}
          <rect x={x} y="26" width="3.2" height="3" rx="0.5" fill="#0B132B" stroke="#3A506B" strokeWidth="0.5" />
        </g>
      ))}

      {/* أسهم التبديل المزدوجة (Switching Fabric Symbol) */}
      <path d="M37 22H40M40 22L38.5 20.5M40 22L38.5 23.5" stroke="#10B981" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M40 28H37M37 28L38.5 26.5M37 28L38.5 29.5" stroke="#10B981" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function PCIcon({ size = 32, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* شاشة العرض المسطحة الحديثة */}
      <rect x="5" y="8" width="28" height="20" rx="2.5" fill="#0F172A" stroke="#334155" strokeWidth="1.5" />
      {/* شاشة مضاءة زرقاء/سماوية بواجهة شبكة */}
      <rect x="7" y="10" width="24" height="16" rx="1.5" fill="#1E293B" />
      <path d="M10 14H20M10 17H16M10 20H23" stroke="#38BDF8" strokeWidth="1" strokeLinecap="round" />
      {/* حامل الشاشة المعدني */}
      <path d="M19 28V33M15 33H23" stroke="#64748B" strokeWidth="1.8" strokeLinecap="round" />

      {/* صندوق الحاسوب المكتبي (Tower Chassis) */}
      <rect x="35" y="11" width="9" height="22" rx="2" fill="#0F172A" stroke="#334155" strokeWidth="1.2" />
      <rect x="37" y="13.5" width="5" height="1.5" rx="0.5" fill="#475569" />
      <circle cx="39.5" cy="18" r="1.2" fill="#0EA5E9" />
      <rect x="37" y="24" width="5" height="6" rx="1" fill="#1E293B" />
      <line x1="38" y1="26" x2="41" y2="26" stroke="#475569" strokeWidth="0.8" />
      <line x1="38" y1="28" x2="41" y2="28" stroke="#475569" strokeWidth="0.8" />
    </svg>
  );
}

export function ServerIcon({ size = 32, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* خادم الحوسبة والبيانات (Rack Server Chassis) */}
      <rect x="6" y="8" width="36" height="32" rx="3" fill="#0B132B" stroke="#1E293B" strokeWidth="1.5" />
      
      {/* طبقات وحدات الأقراص والتخزين (Drive Trays) */}
      {[12, 21, 30].map((y, idx) => (
        <g key={idx}>
          <rect x="9" y={y} width="30" height="7" rx="1.5" fill="#1C2541" stroke="#3A506B" strokeWidth="0.8" />
          {/* مزاليج أقراص التخزين */}
          <rect x="11.5" y={y + 2} width="8" height="3" rx="0.8" fill="#0B132B" />
          <rect x="21" y={y + 2} width="8" height="3" rx="0.8" fill="#0B132B" />
          {/* لمبات بيان القراءة والكتابة (LEDs) */}
          <circle cx="32" cy={y + 3.5} r="1" fill="#10B981" />
          <circle cx="35.5" cy={y + 3.5} r="1" fill={idx === 1 ? "#F59E0B" : "#38BDF8"} />
        </g>
      ))}

      {/* مقابض تثبيت الرف (Rack Ears) */}
      <rect x="4" y="10" width="2" height="6" rx="0.5" fill="#64748B" />
      <rect x="4" y="32" width="2" height="6" rx="0.5" fill="#64748B" />
      <rect x="42" y="10" width="2" height="6" rx="0.5" fill="#64748B" />
      <rect x="42" y="32" width="2" height="6" rx="0.5" fill="#64748B" />
    </svg>
  );
}

export function FirewallIcon({ size = 32, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* جهاز الجدار الناري والحماية (Next-Gen Firewall Appliance) */}
      <rect x="4" y="16" width="40" height="19" rx="3.5" fill="#18181B" stroke="#DC2626" strokeWidth="1.2" />
      <rect x="7" y="19" width="34" height="13" rx="2" fill="#27272A" />

      {/* درع الأمان الناري في المنتصف */}
      <path
        d="M24 10L33 14V22C33 27.5 24 33 24 33C24 33 15 27.5 15 22V14L24 10Z"
        fill="#991B1B"
        fillOpacity="0.3"
        stroke="#EF4444"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      
      {/* نمط طوب الحماية النارية داخل الدرع */}
      <path d="M19 18H29M24 14V18M21.5 18V22M26.5 18V22M19 22H29M24 22V26" stroke="#F87171" strokeWidth="1" strokeLinecap="round" />

      {/* لمبات بيان الحماية والفحص الحي */}
      <circle cx="10" cy="25" r="1.2" fill="#10B981" />
      <circle cx="13" cy="25" r="1.2" fill="#EF4444" />
      <circle cx="37" cy="25" r="1.2" fill="#10B981" />
    </svg>
  );
}

export function AccessPointIcon({ size = 32, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* قرص نقطة الوصول اللاسلكية المعلق (Enterprise Ceiling AP) */}
      <circle cx="24" cy="30" r="11" fill="#0F172A" stroke="#334155" strokeWidth="1.5" />
      <circle cx="24" cy="30" r="7.5" fill="#1E293B" />
      {/* حلقة إضاءة الحالة المركزية (Status Glow Ring) */}
      <circle cx="24" cy="30" r="3.5" fill="#0284C7" stroke="#38BDF8" strokeWidth="1.2" />

      {/* موجات البث اللاسلكي المتدرجة (Wi-Fi Radiating Waves) */}
      <path d="M17 19C19.2 16.8 21.5 15.5 24 15.5C26.5 15.5 28.8 16.8 31 19" stroke="#F59E0B" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M13 14C16.2 11 20 9 24 9C28 9 31.8 11 35 14" stroke="#F59E0B" strokeWidth="1.6" strokeLinecap="round" strokeOpacity="0.85" />
      <path d="M9 9C13.2 5.5 18.4 3.5 24 3.5C29.6 3.5 34.8 5.5 39 9" stroke="#FBBF24" strokeWidth="1.6" strokeLinecap="round" strokeOpacity="0.5" />
    </svg>
  );
}

export function CloudIcon({ size = 32, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* السحابة الشبكية المتصلة (Internet / WAN Cloud) */}
      <path
        d="M13 34C9.13401 34 6 30.866 6 27C6 23.3619 8.77508 20.3734 12.3533 20.0385C13.0428 14.3948 17.8767 10 23.7143 10C29.071 10 33.6195 13.6896 34.8213 18.7845C38.8351 19.3496 42 22.8028 42 27C42 30.866 38.866 34 35 34H13Z"
        fill="#0284C7"
        fillOpacity="0.15"
        stroke="#0284C7"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      
      {/* خطوط شبكة الإنترنت العالمية الدقيقة داخل السحابة (Global Web Lines) */}
      <circle cx="24" cy="23" r="7" stroke="#38BDF8" strokeWidth="1" strokeDasharray="2 2" strokeOpacity="0.7" />
      <ellipse cx="24" cy="23" rx="3.5" ry="7" stroke="#38BDF8" strokeWidth="1" strokeOpacity="0.7" />
      <line x1="17" y1="23" x2="31" y2="23" stroke="#38BDF8" strokeWidth="1" strokeOpacity="0.7" />
    </svg>
  );
}

export function LaptopIcon({ size = 32, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* شاشة اللابتوب الرقيقة ذات الحواف الحديثة */}
      <rect x="9" y="10" width="30" height="20" rx="2" fill="#0F172A" stroke="#334155" strokeWidth="1.5" />
      {/* الشاشة الداخلية */}
      <rect x="11.5" y="12.5" width="25" height="15" rx="1" fill="#1E293B" />
      <path d="M15 17H23M15 20H20" stroke="#38BDF8" strokeWidth="1" strokeLinecap="round" />
      
      {/* كاميرا الويب الصغيرة */}
      <circle cx="24" cy="11.2" r="0.6" fill="#64748B" />

      {/* قاعدة لوحة المفاتيح والمسند (Chassis & Trackpad) */}
      <path d="M5 33C5 31.8954 5.89543 31 7 31H41C42.1046 31 43 31.8954 43 33L41.5 36C41.5 36.5 41 37 40.5 37H7.5C7 37 6.5 36.5 6.5 36L5 33Z" fill="#1E293B" stroke="#334155" strokeWidth="1" />
      {/* لوحة اللمس (Trackpad) */}
      <rect x="21" y="32.5" width="6" height="3" rx="0.5" fill="#0F172A" stroke="#475569" strokeWidth="0.5" />
    </svg>
  );
}

/**
 * المكون العام للأجهزة الشبكية — يستقبل نوع الجهاز ويعرض الأيقونة الواقعية المناسبة
 */
export default function DeviceIcon({ type, size = 32, className = "" }) {
  switch (type) {
    case "Router":
      return <RouterIcon size={size} className={className} />;
    case "Switch":
      return <SwitchIcon size={size} className={className} />;
    case "PC":
      return <PCIcon size={size} className={className} />;
    case "Server":
      return <ServerIcon size={size} className={className} />;
    case "Firewall":
      return <FirewallIcon size={size} className={className} />;
    case "AccessPoint":
      return <AccessPointIcon size={size} className={className} />;
    case "Cloud":
      return <CloudIcon size={size} className={className} />;
    case "Laptop":
      return <LaptopIcon size={size} className={className} />;
    default:
      return <PCIcon size={size} className={className} />;
  }
}