/**
 * csvStudents.js — قراءة قائمة الطلاب من ملف CSV داخل المتصفح (بدون رفع الملف لأي خادم).
 * يدعم الفاصل , أو ; أو Tab، والحقول المقتبسة، وBOM، وعناوين أعمدة عربية/إنجليزية.
 * إن لم توجد عناوين: الترتيب المفترض = الاسم، الرمز، البريد.
 */
function detectDelimiter(headerLine) {
  const counts = { ",": 0, ";": 0, "\t": 0 };
  let inQ = false;
  for (const ch of headerLine) {
    if (ch === '"') inQ = !inQ;
    else if (!inQ && ch in counts) counts[ch]++;
  }
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
}

export function parseCsv(text) {
  const src = String(text || "").replace(/^\uFEFF/, "");
  const firstLine = src.split(/\r?\n/, 1)[0] || "";
  const delim = detectDelimiter(firstLine);
  const rows = [];
  let row = [], cell = "", inQ = false;
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (inQ) {
      if (ch === '"') {
        if (src[i + 1] === '"') { cell += '"'; i++; } else inQ = false;
      } else cell += ch;
    } else if (ch === '"') inQ = true;
    else if (ch === delim) { row.push(cell); cell = ""; }
    else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && src[i + 1] === "\n") i++;
      row.push(cell); cell = "";
      if (row.some((c) => c.trim() !== "")) rows.push(row);
      row = [];
    } else cell += ch;
  }
  row.push(cell);
  if (row.some((c) => c.trim() !== "")) rows.push(row);
  return rows;
}

const NAME_HDR = ["full_name", "fullname", "name", "student_name", "الاسم", "اسم الطالب", "اسم", "שם", "שם מלא"];
const CODE_HDR = ["student_code", "code", "studentcode", "id", "الرمز", "رمز الطالب", "رمز", "קוד", "קוד תלמיד"];
const MAIL_HDR = ["email", "e-mail", "mail", "البريد", "البريد الإلكتروني", "דוא\"ل", "אימייל"];
const CLASS_HDR = ["class_name", "class", "grade", "section", "classroom", "الصف", "صف", "الشعبة", "شعبة", "كلاس", "כיתה"];

/** يعيد [{ full_name, student_code, email }] */
export function studentsFromCsv(text) {
  const rows = parseCsv(text);
  if (!rows.length) return [];
  const norm = (s) => String(s || "").trim().toLowerCase();
  const head = rows[0].map(norm);
  const find = (list) => head.findIndex((h) => list.includes(h));
  let iName = find(NAME_HDR), iCode = find(CODE_HDR), iMail = find(MAIL_HDR), iClass = find(CLASS_HDR);
  let start = 1;
  if (iName < 0 || iCode < 0) { iName = 0; iCode = 1; iMail = 2; iClass = 3; start = 0; } // بلا عناوين
  return rows.slice(start).map((r) => ({
    full_name: String(r[iName] ?? "").trim(),
    student_code: String(r[iCode] ?? "").trim(),
    email: iMail >= 0 ? String(r[iMail] ?? "").trim() : "",
    class_name: iClass >= 0 ? String(r[iClass] ?? "").trim() : "",
  })).filter((s) => s.full_name && s.student_code);
}