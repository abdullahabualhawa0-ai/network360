/**
 * courseData.js — المجمّع الرئيسي للمنهج الدراسي
 * المنهج الرسمي: "البنية التحتية وشبكات الاتصال" - تخصص المقاصة 70%
 * 27 وحدة رسمية (450 ساعة) + وحدة IoT إضافية محفوظة من المحتوى السابق
 *
 * البنية:
 * - curriculum/units1_9.js   : الوحدات 1-9
 * - curriculum/units10_18.js : الوحدات 10-18
 * - curriculum/units19_27.js : الوحدات 19-27
 * - curriculum/legacyTopics.js : دروس إضافية محفوظة للتوافق مع الاختبارات القديمة
 */

import { UNITS_1_9 } from "./curriculum/units1_9";
import { UNITS_10_18 } from "./curriculum/units10_18";
import { UNITS_19_27 } from "./curriculum/units19_27";
import { LEGACY_TOPICS, IOT_UNIT } from "./curriculum/legacyTopics";

// دمج الدروس الإضافية في وحداتها المنطقية (مع الحفاظ على المعرّفات القديمة)
const mergeLegacy = (units) =>
  units.map((unit) => {
    const extra = LEGACY_TOPICS[unit.id];
    return extra ? { ...unit, topics: [...unit.topics, ...extra] } : unit;
  });

const courseData = [
  ...mergeLegacy(UNITS_1_9),
  ...mergeLegacy(UNITS_10_18),
  ...mergeLegacy(UNITS_19_27),
  IOT_UNIT,
];

export default courseData;