import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, X, UserPlus, Check, Loader2 } from "lucide-react";
import { t, useDir } from "@/lib/i18n";

export default function CreateClassModal({
  isOpen,
  onClose,
  existingClasses = [],
  onSubmit, // (className: string, andAddStudent: boolean) => Promise<void>
}) {
  const direction = useDir();
  const [className, setClassName] = useState("");
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleAction = async (andAddStudent) => {
    const trimmed = className.trim();
    if (!trimmed) {
      setError(t("smErrClassName"));
      return;
    }
    const isDup = existingClasses.some(
      (c) => c.toLowerCase() === trimmed.toLowerCase()
    );
    if (isDup) {
      setError(t("smErrClassExists"));
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await onSubmit(trimmed, andAddStudent);
      setClassName("");
      onClose();
    } catch (err) {
      setError(err?.message || t("errUnexpected"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
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
                <h3 className="font-black text-base text-foreground">
                  {t("smCreateClassTitle")}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {t("smCreateClassDesc")}
                </p>
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
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAction(true);
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1.5">
                {t("smClassNameLabel")}
              </label>
              <input
                autoFocus
                value={className}
                onChange={(e) => {
                  setClassName(e.target.value);
                  if (error) setError(null);
                }}
                placeholder={t("smStudentClassPh")}
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

            {/* Action buttons */}
            <div className="flex flex-col gap-2 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-[10px] text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-all disabled:opacity-60 shadow-sm"
              >
                {saving ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <UserPlus size={14} />
                )}
                {t("smCreateClassAndAdd")}
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => handleAction(false)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-[10px] text-xs font-bold border border-border text-foreground hover:bg-accent transition-colors disabled:opacity-60"
                >
                  <Check size={13} /> {t("smSaveClassOnly")}
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={onClose}
                  className="px-4 py-2 rounded-[10px] text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                >
                  {t("cancelBtn")}
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}