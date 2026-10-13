import { createContext, useCallback, useContext, useRef, useState } from "react";
import {
  AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogAction, AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { t, useLang, useDir } from "@/lib/i18n";

/**
 * DialogProvider — بديل لنوافذ confirm() و alert() الأصلية للمتصفح.
 *
 * لماذا؟ داخل WebView (أندرويد/iOS) النوافذ الأصلية قد تُتجاهل أو تُرجع false بصمت
 * ما لم يكن التطبيق المغلِّف يدعمها، فتتعطل أزرار مثل "تسليم الامتحان" و"حذف".
 *
 * الاستخدام:
 *   const { confirmDialog, alertDialog } = useDialogs();
 *   if (!(await confirmDialog("هل أنت متأكد؟"))) return;
 *   await alertDialog("تم الحفظ");
 */
const DialogContext = createContext(null);

export function DialogProvider({ children }) {
  useLang();
  const dir = useDir();
  const [state, setState] = useState(null); // { kind, message }
  const resolverRef = useRef(null);

  const open = useCallback((kind, message) => new Promise((resolve) => {
    // لو كانت هناك نافذة مفتوحة نُغلقها (تُعتبر إلغاءً)
    if (resolverRef.current) resolverRef.current(false);
    resolverRef.current = resolve;
    setState({ kind, message: String(message ?? "") });
  }), []);

  const confirmDialog = useCallback((message) => open("confirm", message), [open]);
  const alertDialog = useCallback((message) => open("alert", message).then(() => undefined), [open]);

  const finish = (value) => {
    const r = resolverRef.current;
    resolverRef.current = null;
    setState(null);
    if (r) r(value);
  };

  return (
    <DialogContext.Provider value={{ confirmDialog, alertDialog }}>
      {children}
      <AlertDialog open={!!state} onOpenChange={(o) => { if (!o) finish(false); }}>
        <AlertDialogContent dir={dir} className="max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="sr-only">{t("appName")}</AlertDialogTitle>
            <AlertDialogDescription className="text-sm leading-relaxed text-foreground whitespace-pre-line">
              {state?.message}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            {state?.kind === "confirm" && (
              <AlertDialogCancel onClick={() => finish(false)}>{t("dialogCancel")}</AlertDialogCancel>
            )}
            <AlertDialogAction onClick={() => finish(true)}>
              {state?.kind === "confirm" ? t("dialogConfirm") : t("dialogOk")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DialogContext.Provider>
  );
}

export function useDialogs() {
  const ctx = useContext(DialogContext);
  if (ctx) return ctx;
  // احتياط (لا يجب أن يحدث): العودة للنوافذ الأصلية إن لم يوجد Provider
  return {
    confirmDialog: async (m) => window.confirm(m),
    alertDialog: async (m) => { window.alert(m); },
  };
}
