import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, X, Pencil, Loader2 } from "lucide-react";
import { t, useDir } from "@/lib/i18n";

/**
 * RenameClassModal — نافذة تعديل اسم صف دراسي.
 * التحقق من الفراغ والتكرار هنا؛ التحديث الفعلي (المدرسة + طلاب الصف) في onSubmit.
 */
export default function RenameClassModal({
  isOpen,
  initialName = "",
  existingClasses = [],
  onClose,
  onSubmit, // (newName: string) => Promise<void>
}) {
  const direction = useDir();
  const [name, setName] = useState("");
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(initialName);
      setError(null);
      setSaving(false);
    }
  }, [isOpen, initialName]);

  if (!isOpen) return null;

  const save = async (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError(t("smErrClassName"));
      return;
    }
    if (trimmed === initialName) {
      onClose();
      return;
    }
    const dup = (existingClasses || []).some(
      (c) => c !== initialName && c.toLowerCase() === trimmed.toLowerCase()
    );
    if (dup) {
      setError(t("smErrClassExists"));
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSubmit(trimmed);
      onClose();
    } catch (err) {
      setError(err?.message || t("errUnexpected"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          dir={direction}
          className="w-full max-w-md rounded-[16px] p-6 bg-card border border-border shadow-2xl font-main text-foreground"
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-[10px] flex items-center justify-center bg-secondary/15 text-secondary border border-secondary/30">
                <GraduationCap size={20} />
              </div>
              <div>
                <h3 className="font-black text-base text-foreground">{t("smRenameClass")}</h3>
                <p className="text-xs text-muted-foreground">{t("smRenameClassDesc")}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={saving}
              className="p-1.5 rounded-[8px] text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={save} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1.5">
                {t("smClassNameLabel")}
              </label>
              <input
                autoFocus
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError(null);
                }}
                dir={direction}
                disabled={saving}
                className="w-full px-3.5 py-2.5 rounded-[10px] text-sm bg-background border border-input focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            {error && (
              <div className="text-xs font-bold px-3 py-2 rounded-[8px] bg-destructive/10 border border-destructive/30 text-destructive">
                {error}
              </div>
            )}

            <div className="flex items-center gap-2 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 min-h-[44px] flex items-center justify-center gap-2 rounded-[10px] text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-all disabled:opacity-60 shadow-sm"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Pencil size={14} />}
                {t("smRenameSave")}
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={onClose}
                className="min-h-[44px] px-4 rounded-[10px] text-xs font-bold border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-colors disabled:opacity-60"
              >
                {t("cancelBtn")}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}