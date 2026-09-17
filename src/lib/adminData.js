/**
 * adminData.js — طبقة وصول موحدة لبيانات الإدارة
 * توجّه الاستدعاءات حسب نوع المصادقة:
 *   - جلسة مشرف المدرسة (schoolAdminSession) → دالة schoolAdminApi الخلفية
 *   - مصادقة Base44 (المالك/الاونرز) → base44.entities مباشرة
 */
import { base44 } from "@/api/base44Client";
import { getSchoolAdminSession, schoolAdminApi } from "./schoolAdminSession";

function isSchoolAdminSession() {
  return !!getSchoolAdminSession();
}

export async function adminList(entity, sort, limit) {
  if (isSchoolAdminSession()) {
    return await schoolAdminApi("list", entity, { sort, limit });
  }
  return await base44.entities[entity].list(sort, limit);
}

export async function adminFilter(entity, query, sort, limit) {
  if (isSchoolAdminSession()) {
    return await schoolAdminApi("filter", entity, { query, sort, limit });
  }
  return await base44.entities[entity].filter(query, sort, limit);
}

export async function adminGet(entity, id) {
  if (isSchoolAdminSession()) {
    return await schoolAdminApi("get", entity, { id });
  }
  return await base44.entities[entity].get(id);
}

export async function adminCreate(entity, data) {
  if (isSchoolAdminSession()) {
    return await schoolAdminApi("create", entity, { data });
  }
  return await base44.entities[entity].create(data);
}

export async function adminUpdate(entity, id, data) {
  if (isSchoolAdminSession()) {
    return await schoolAdminApi("update", entity, { id, data });
  }
  return await base44.entities[entity].update(id, data);
}

export async function adminDelete(entity, id) {
  if (isSchoolAdminSession()) {
    return await schoolAdminApi("delete", entity, { id });
  }
  return await base44.entities[entity].delete(id);
}