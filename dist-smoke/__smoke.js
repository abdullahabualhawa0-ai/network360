import * as React from "react";
import React__default, { useState, useEffect, createContext, useContext, useRef, useCallback, useMemo } from "react";
import { renderToString } from "react-dom/server";
import { useLocation, Link, Outlet, useSearchParams, useParams, useNavigate, Navigate, BrowserRouter, Routes, Route as Route$1, MemoryRouter } from "react-router-dom";
import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { cva } from "class-variance-authority";
import { X, BookOpen, Home as Home$1, MonitorPlay, BarChart2, FlaskConical, History, ClipboardList, Settings as Settings$1, School, GraduationCap, Users, FileText, FileCheck, Tag, Route, Cpu, Radio, Server, Shield, Globe, Network, ChevronDown, MessageCircle, CheckCircle2, AlertTriangle, Send, Loader2, Copy, Menu, LogIn, Mail, Lock, Minus, UserPlus, ArrowLeft, Terminal, Lightbulb, RotateCcw, XCircle, ChevronUp, Trophy, Volume2, Play, Pause, Square, Clock, ChevronLeft, Zap, ArrowRight, Trash2, ChevronRight, Link as Link$1, Wifi, Grid3x3, Bot, ZoomOut, ZoomIn, Undo2, Redo2, Save, Sparkles, Circle, Activity, Star, TrendingUp, Target, Award, ShieldAlert, RefreshCw, Search, AlertCircle, FileQuestion, Ban, Percent, Inbox, User, Check, LogOut, Plus, KeyRound, ShieldCheck, CheckSquare, Printer, Calendar, Eye, Pencil } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { QueryClient, useQuery, QueryClientProvider } from "@tanstack/react-query";
import { createClient } from "@base44/sdk";
import { createAxiosClient } from "@base44/sdk/dist/utils/axios-client.js";
import { AnimatePresence, motion } from "framer-motion";
import { Slot } from "@radix-ui/react-slot";
import * as LabelPrimitive from "@radix-ui/react-label";
import { OTPInput, OTPInputContext } from "input-otp";
import ReactMarkdown from "react-markdown";
import moment from "moment";
globalThis.window = globalThis.window || {};
window.localStorage = {
  store: {},
  getItem(k) {
    return this.store[k] ?? null;
  },
  setItem(k, v) {
    this.store[k] = String(v);
  },
  removeItem(k) {
    delete this.store[k];
  }
};
window.location = { href: "http://localhost/", pathname: "/", search: "", hash: "" };
window.addEventListener = () => {
};
window.removeEventListener = () => {
};
window.dispatchEvent = () => {
};
window.matchMedia = window.matchMedia || (() => ({ matches: false, addListener: () => {
}, removeListener: () => {
}, addEventListener: () => {
}, removeEventListener: () => {
} }));
window.performance = window.performance || { getEntriesByType: () => [] };
globalThis.document = globalThis.document || {
  documentElement: { dir: "rtl", lang: "ar" },
  getElementById: () => null
};
globalThis.navigator = globalThis.navigator || { userAgent: "smoke" };
const TOAST_LIMIT = 20;
const TOAST_REMOVE_DELAY = 1e6;
const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST"
};
let count = 0;
function genId() {
  count = (count + 1) % Number.MAX_VALUE;
  return count.toString();
}
const toastTimeouts = /* @__PURE__ */ new Map();
const addToRemoveQueue = (toastId) => {
  if (toastTimeouts.has(toastId)) {
    return;
  }
  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId);
    dispatch({
      type: actionTypes.REMOVE_TOAST,
      toastId
    });
  }, TOAST_REMOVE_DELAY);
  toastTimeouts.set(toastId, timeout);
};
const reducer = (state, action) => {
  switch (action.type) {
    case actionTypes.ADD_TOAST:
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT)
      };
    case actionTypes.UPDATE_TOAST:
      return {
        ...state,
        toasts: state.toasts.map(
          (t2) => t2.id === action.toast.id ? { ...t2, ...action.toast } : t2
        )
      };
    case actionTypes.DISMISS_TOAST: {
      const { toastId } = action;
      if (toastId) {
        addToRemoveQueue(toastId);
      } else {
        state.toasts.forEach((toast2) => {
          addToRemoveQueue(toast2.id);
        });
      }
      return {
        ...state,
        toasts: state.toasts.map(
          (t2) => t2.id === toastId || toastId === void 0 ? {
            ...t2,
            open: false
          } : t2
        )
      };
    }
    case actionTypes.REMOVE_TOAST:
      if (action.toastId === void 0) {
        return {
          ...state,
          toasts: []
        };
      }
      return {
        ...state,
        toasts: state.toasts.filter((t2) => t2.id !== action.toastId)
      };
  }
};
const listeners = [];
let memoryState = { toasts: [] };
function dispatch(action) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener) => {
    listener(memoryState);
  });
}
function toast({ ...props }) {
  const id = genId();
  const update = (props2) => dispatch({
    type: actionTypes.UPDATE_TOAST,
    toast: { ...props2, id }
  });
  const dismiss = () => dispatch({ type: actionTypes.DISMISS_TOAST, toastId: id });
  dispatch({
    type: actionTypes.ADD_TOAST,
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss();
      }
    }
  });
  return {
    id,
    dismiss,
    update
  };
}
function useToast() {
  const [state, setState] = useState(memoryState);
  useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, [state]);
  return {
    ...state,
    toast,
    dismiss: (toastId) => dispatch({ type: actionTypes.DISMISS_TOAST, toastId })
  };
}
function cn(...inputs) {
  return twMerge(clsx(inputs));
}
const ToastProvider = React.forwardRef(({ ...props }, ref) => /* @__PURE__ */ jsx(
  "div",
  {
    ref,
    className: "fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]",
    ...props
  }
));
ToastProvider.displayName = "ToastProvider";
const ToastViewport = React.forwardRef(({ ...props }, ref) => /* @__PURE__ */ jsx(
  "div",
  {
    ref,
    className: "fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]",
    ...props
  }
));
ToastViewport.displayName = "ToastViewport";
const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full",
  {
    variants: {
      variant: {
        default: "border bg-background text-foreground",
        destructive: "destructive group border-destructive bg-destructive text-destructive-foreground"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);
const Toast = React.forwardRef(({ className, variant, ...props }, ref) => {
  return /* @__PURE__ */ jsx(
    "div",
    {
      ref,
      className: cn(toastVariants({ variant }), className),
      ...props
    }
  );
});
Toast.displayName = "Toast";
const ToastAction = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  "div",
  {
    ref,
    className: cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-muted/40 group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground group-[.destructive]:focus:ring-destructive",
      className
    ),
    ...props
  }
));
ToastAction.displayName = "ToastAction";
const ToastClose = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  "button",
  {
    ref,
    className: cn(
      "absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100 group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600",
      className
    ),
    "toast-close": "",
    ...props,
    children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4" })
  }
));
ToastClose.displayName = "ToastClose";
const ToastTitle = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  "div",
  {
    ref,
    className: cn("text-sm font-semibold", className),
    ...props
  }
));
ToastTitle.displayName = "ToastTitle";
const ToastDescription = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  "div",
  {
    ref,
    className: cn("text-sm opacity-90", className),
    ...props
  }
));
ToastDescription.displayName = "ToastDescription";
function Toaster() {
  const { toasts } = useToast();
  return /* @__PURE__ */ jsxs(ToastProvider, { children: [
    toasts.map(function({ id, title, description, action, ...props }) {
      return /* @__PURE__ */ jsxs(Toast, { ...props, children: [
        /* @__PURE__ */ jsxs("div", { className: "grid gap-1", children: [
          title && /* @__PURE__ */ jsx(ToastTitle, { children: title }),
          description && /* @__PURE__ */ jsx(ToastDescription, { children: description })
        ] }),
        action,
        /* @__PURE__ */ jsx(ToastClose, {})
      ] }, id);
    }),
    /* @__PURE__ */ jsx(ToastViewport, {})
  ] });
}
const queryClientInstance = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
});
const isNode = typeof window === "undefined";
const windowObj = isNode ? { localStorage: /* @__PURE__ */ new Map() } : window;
const storage = windowObj.localStorage;
const toSnakeCase = (str) => {
  return str.replace(/([A-Z])/g, "_$1").toLowerCase();
};
const getAppParamValue = (paramName, { defaultValue = void 0, removeFromUrl = false } = {}) => {
  if (isNode) {
    return defaultValue;
  }
  const storageKey = `base44_${toSnakeCase(paramName)}`;
  const urlParams = new URLSearchParams(window.location.search);
  const searchParam = urlParams.get(paramName);
  if (removeFromUrl) {
    urlParams.delete(paramName);
    const newUrl = `${window.location.pathname}${urlParams.toString() ? `?${urlParams.toString()}` : ""}${window.location.hash}`;
    window.history.replaceState({}, document.title, newUrl);
  }
  if (searchParam) {
    storage.setItem(storageKey, searchParam);
    return searchParam;
  }
  if (defaultValue) {
    storage.setItem(storageKey, defaultValue);
    return defaultValue;
  }
  const storedValue = storage.getItem(storageKey);
  if (storedValue) {
    return storedValue;
  }
  return null;
};
const getAppParams = () => {
  if (getAppParamValue("clear_access_token") === "true") {
    storage.removeItem("base44_access_token");
    storage.removeItem("token");
  }
  return {
    appId: getAppParamValue("app_id", { defaultValue: "69d03b21d08930672e1b680e" }),
    token: getAppParamValue("access_token", { removeFromUrl: true }),
    fromUrl: getAppParamValue("from_url", { defaultValue: window.location.href }),
    functionsVersion: getAppParamValue("functions_version", { defaultValue: "preview" }),
    appBaseUrl: getAppParamValue("app_base_url", { defaultValue: void 0 })
  };
};
const appParams = {
  ...getAppParams()
};
const { appId, token, functionsVersion, appBaseUrl } = appParams;
const base44 = createClient({
  appId,
  token,
  functionsVersion,
  serverUrl: "",
  requiresAuth: false,
  appBaseUrl
});
function PageNotFound({}) {
  var _a;
  const location = useLocation();
  const pageName = location.pathname.substring(1);
  const { data: authData, isFetched } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      try {
        const user = await base44.auth.me();
        return { user, isAuthenticated: true };
      } catch (error) {
        return { user: null, isAuthenticated: false };
      }
    }
  });
  return /* @__PURE__ */ jsx("div", { className: "min-h-screen flex items-center justify-center p-6 bg-slate-50", children: /* @__PURE__ */ jsx("div", { className: "max-w-md w-full", children: /* @__PURE__ */ jsxs("div", { className: "text-center space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-7xl font-light text-slate-300", children: "404" }),
      /* @__PURE__ */ jsx("div", { className: "h-0.5 w-16 bg-slate-200 mx-auto" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-2xl font-medium text-slate-800", children: "Page Not Found" }),
      /* @__PURE__ */ jsxs("p", { className: "text-slate-600 leading-relaxed", children: [
        "The page ",
        /* @__PURE__ */ jsxs("span", { className: "font-medium text-slate-700", children: [
          '"',
          pageName,
          '"'
        ] }),
        " could not be found in this application."
      ] })
    ] }),
    isFetched && authData.isAuthenticated && ((_a = authData.user) == null ? void 0 : _a.role) === "admin" && /* @__PURE__ */ jsx("div", { className: "mt-8 p-4 bg-slate-100 rounded-lg border border-slate-200", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start space-x-3", children: [
      /* @__PURE__ */ jsx("div", { className: "flex-shrink-0 w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center mt-0.5", children: /* @__PURE__ */ jsx("div", { className: "w-2 h-2 rounded-full bg-orange-400" }) }),
      /* @__PURE__ */ jsxs("div", { className: "text-left space-y-1", children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-slate-700", children: "Admin Note" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-600 leading-relaxed", children: "This could mean that the AI hasn't implemented this page yet. Ask it to implement it in the chat." })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "pt-6", children: /* @__PURE__ */ jsxs(
      "button",
      {
        onClick: () => window.location.href = "/",
        className: "inline-flex items-center px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500",
        children: [
          /* @__PURE__ */ jsx("svg", { className: "w-4 h-4 mr-2", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" }) }),
          "Go Home"
        ]
      }
    ) })
  ] }) }) });
}
const AuthContext = createContext();
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [appPublicSettings, setAppPublicSettings] = useState(null);
  useEffect(() => {
    checkAppState();
  }, []);
  const checkAppState = async () => {
    var _a, _b;
    try {
      setIsLoadingPublicSettings(true);
      setAuthError(null);
      const appClient = createAxiosClient({
        baseURL: `/api/apps/public`,
        headers: {
          "X-App-Id": appParams.appId
        },
        token: appParams.token,
        // Include token if available
        interceptResponses: true
      });
      try {
        const publicSettings = await appClient.get(`/prod/public-settings/by-id/${appParams.appId}`);
        setAppPublicSettings(publicSettings);
        if (appParams.token) {
          await checkUserAuth();
        } else {
          setIsLoadingAuth(false);
          setIsAuthenticated(false);
        }
        setIsLoadingPublicSettings(false);
      } catch (appError) {
        console.error("App state check failed:", appError);
        if (appError.status === 403 && ((_b = (_a = appError.data) == null ? void 0 : _a.extra_data) == null ? void 0 : _b.reason)) {
          const reason = appError.data.extra_data.reason;
          if (reason === "auth_required") {
            setAuthError({
              type: "auth_required",
              message: "Authentication required"
            });
          } else if (reason === "user_not_registered") {
            setAuthError({
              type: "user_not_registered",
              message: "User not registered for this app"
            });
          } else {
            setAuthError({
              type: reason,
              message: appError.message
            });
          }
        } else {
          setAuthError({
            type: "unknown",
            message: appError.message || "Failed to load app"
          });
        }
        setIsLoadingPublicSettings(false);
        setIsLoadingAuth(false);
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      setAuthError({
        type: "unknown",
        message: error.message || "An unexpected error occurred"
      });
      setIsLoadingPublicSettings(false);
      setIsLoadingAuth(false);
    }
  };
  const checkUserAuth = async () => {
    try {
      setIsLoadingAuth(true);
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      setIsAuthenticated(true);
      setIsLoadingAuth(false);
    } catch (error) {
      console.error("User auth check failed:", error);
      setIsLoadingAuth(false);
      setIsAuthenticated(false);
      if (error.status === 401 || error.status === 403) {
        setAuthError({
          type: "auth_required",
          message: "Authentication required"
        });
      }
    }
  };
  const logout = (shouldRedirect = true) => {
    setUser(null);
    setIsAuthenticated(false);
    if (shouldRedirect) {
      base44.auth.logout(window.location.href);
    } else {
      base44.auth.logout();
    }
  };
  const navigateToLogin = () => {
    base44.auth.redirectToLogin(window.location.href);
  };
  return /* @__PURE__ */ jsx(AuthContext.Provider, { value: {
    user,
    isAuthenticated,
    isLoadingAuth,
    isLoadingPublicSettings,
    authError,
    appPublicSettings,
    logout,
    navigateToLogin,
    checkAppState
  }, children });
};
const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
const UNITS_1_9 = [
  // ━━━━━━━━━━ الوحدة 1 ━━━━━━━━━━
  {
    id: "unit1-basics",
    unit: 1,
    title: "أساسيات شبكات الاتصال",
    icon: "Network",
    color: "from-blue-500 to-blue-700",
    hours: { theory: 8, practical: 2, total: 10 },
    difficulty: "beginner",
    topics: [
      {
        id: "network-components",
        title: "مكونات الشبكة الأساسية",
        unitNumber: 1,
        content: `## مكونات الشبكة الأساسية

### ما هي الشبكة؟
شبكة الاتصال هي مجموعة من الأجهزة المترابطة التي تتشارك الموارد والبيانات.

### المكونات الرئيسية:

#### 1. المضيف (Host)
كل جهاز متصل بالشبكة: حاسوب، هاتف، طابعة، خادم.

#### 2. أنواع الشبكات من حيث البنية:
- **Peer-to-Peer (P2P):** الأجهزة تتصل مباشرة ببعضها دون خادم مركزي
- **Client-Server:** أجهزة عميل تطلب خدمات من خادم مركزي

#### 3. أنواع الأجهزة:
| النوع | الوظيفة | الأمثلة |
|-------|---------|---------|
| End Devices | مصدر أو وجهة البيانات | PC, Laptop, Phone |
| Intermediary Devices | تنقل وتوجه البيانات | Router, Switch, AP |
| Network Media | وسيط نقل البيانات | كابل، ألياف، لاسلكي |

### برنامج Cisco Packet Tracer:
- محاكاة بيئة شبكات حقيقية
- تمثيل الأجهزة بيانياً (Logical View)
- محاكاة البيئة الفيزيائية (Physical View)

### أنواع الشبكات:
| النوع | النطاق | الاستخدام |
|-------|--------|----------|
| **LAN** | مبنى واحد | المكاتب والمنازل |
| **WAN** | مناطق جغرافية واسعة | ربط المدن والدول |
| **Internet** | عالمي | شبكة الشبكات |

### الطوبولوجيا (Topology):
- **الفيزيائية:** الترتيب الفعلي للكابلات والأجهزة
- **المنطقية:** كيفية تدفق البيانات بين الأجهزة`
      },
      {
        id: "packet-tracer-intro",
        title: "مقدمة في برنامج Packet Tracer",
        unitNumber: 1,
        content: `## برنامج Cisco Packet Tracer

### واجهة البرنامج:
- **Menu Bar / Toolbar:** أوامر البرنامج
- **Workspace:** منطقة تصميم الشبكة
- **Device Box:** اختيار الأجهزة
- **Connections Box:** اختيار الكابلات

### البيئتان:
1. **Logical Workspace:** تصميم الشبكة منطقياً
2. **Physical Workspace:** محاكاة المبنى الفيزيائي

### خطوات إنشاء شبكة بسيطة:
1. اسحب جهازين PC إلى منطقة العمل
2. اختر كابل Copper Straight-through
3. وصّل FastEthernet0 في كل جهاز
4. أدخل عناوين IP لكل جهاز
5. اختبر الاتصال بأمر ping

### أوضاع المحاكاة:
- **Realtime Mode:** عمل فوري كالواقع
- **Simulation Mode:** خطوة بخطوة لمتابعة تدفق الحزم`
      }
    ]
  },
  // ━━━━━━━━━━ الوحدة 2 ━━━━━━━━━━
  {
    id: "unit2-ios",
    unit: 2,
    title: "نظام تشغيل الأجهزة (Cisco IOS)",
    icon: "Cpu",
    color: "from-violet-500 to-violet-700",
    hours: { theory: 8, practical: 12, total: 20 },
    difficulty: "beginner",
    topics: [
      {
        id: "ios-access-modes",
        title: "أوضاع الوصول إلى Cisco IOS",
        unitNumber: 2,
        content: `## نظام تشغيل Cisco IOS

### طرق الوصول للجهاز:
- **Console Port:** اتصال مادي مباشر للإعداد الأولي
- **Telnet:** بعيد عبر الشبكة (غير مشفر)
- **SSH:** بعيد عبر الشبكة (مشفر وآمن)

### أوضاع العمل (Modes):
\`\`\`
Router>            ← User EXEC Mode
Router#            ← Privileged EXEC Mode
Router(config)#    ← Global Configuration Mode
Router(config-if)# ← Interface Configuration Mode
\`\`\`

### أوامر التنقل:
\`\`\`
Router> enable
Router# configure terminal
Router(config)# interface g0/0
Router(config-if)# exit
Router(config)# end
\`\`\`

### اختصارات لوحة المفاتيح:
| الاختصار | الوظيفة |
|---------|---------|
| ? | عرض الأوامر المتاحة |
| Tab | إكمال الأمر |
| Ctrl+Z | العودة لوضع الامتياز |
| Ctrl+Shift+6 | إيقاف عملية جارية |`
      },
      {
        id: "ios-initial-config",
        title: "الإعدادات الأولية للجهاز",
        unitNumber: 2,
        content: `## الإعدادات الأولية لجهاز Cisco

\`\`\`
Router(config)# hostname R1
R1(config)# enable secret cisco123
R1(config)# service password-encryption
R1(config)# banner motd # Authorized Access Only #
\`\`\`

### تأمين Console:
\`\`\`
R1(config)# line console 0
R1(config-line)# password cisco
R1(config-line)# login
\`\`\`

### حفظ الإعدادات:
\`\`\`
R1# copy running-config startup-config
\`\`\`

### ملفات الإعداد:
- **running-config:** النشط (في RAM)
- **startup-config:** المخزن (في NVRAM)

### أوامر العرض:
\`\`\`
R1# show running-config
R1# show ip interface brief
\`\`\`

### إعداد SVI على المحول:
\`\`\`
Switch(config)# interface vlan 1
Switch(config-if)# ip address 192.168.1.2 255.255.255.0
Switch(config-if)# no shutdown
Switch(config)# ip default-gateway 192.168.1.1
\`\`\``
      }
    ]
  },
  // ━━━━━━━━━━ الوحدة 3 ━━━━━━━━━━
  {
    id: "unit3-protocols-models",
    unit: 3,
    title: "البروتوكولات والنماذج القياسية",
    icon: "Network",
    color: "from-sky-500 to-sky-700",
    hours: { theory: 10, practical: 4, total: 14 },
    difficulty: "beginner",
    topics: [
      {
        id: "osi-tcpip-models",
        title: "نموذجا OSI و TCP/IP",
        unitNumber: 3,
        content: `## النماذج القياسية للشبكات

### نموذج OSI (7 طبقات):
\`\`\`
7 - Application   (HTTP, DNS, SMTP)
6 - Presentation
5 - Session
4 - Transport     (TCP / UDP)
3 - Network       (IP, Routing)
2 - Data Link     (MAC, Ethernet)
1 - Physical      (كابلات، إشارات)
\`\`\`

### نموذج TCP/IP (4 طبقات):
\`\`\`
4 - Application
3 - Transport
2 - Internet
1 - Network Access
\`\`\`

### وحدات البيانات (PDU):
| الطبقة | وحدة البيانات |
|--------|--------------|
| Transport | Segment |
| Network | Packet |
| Data Link | Frame |
| Physical | Bits |

### التغليف (Encapsulation):
عند الإرسال تُضاف رؤوس في كل طبقة، وعند الاستقبال تُزال طبقة بطبقة.`
      }
    ]
  },
  // ━━━━━━━━━━ الوحدة 4 ━━━━━━━━━━
  {
    id: "unit4-physical",
    unit: 4,
    title: "الطبقة الفيزيائية",
    icon: "Server",
    color: "from-orange-500 to-orange-700",
    hours: { theory: 8, practical: 4, total: 12 },
    difficulty: "beginner",
    topics: [
      {
        id: "physical-media",
        title: "وسائط الطبقة الفيزيائية",
        unitNumber: 4,
        content: `## الطبقة الفيزيائية (Physical Layer)

### الوظيفة:
تحويل البتات إلى إشارات كهربائية أو ضوئية أو لاسلكية.

### مقاييس الأداء:
- **Bandwidth:** السعة النظرية
- **Throughput:** السرعة الفعلية
- **Latency:** زمن التأخير

## كابلات النحاس:
### UTP (Unshielded Twisted Pair):
- الأكثر شيوعاً في LAN
- **Straight-through:** PC→Switch
- **Crossover:** PC→PC, Switch→Switch
- **Auto-MDIX:** كشف تلقائي لنوع الكابل

### STP (Shielded):
محمي ضد التشويش الكهرومغناطيسي.

## الألياف الضوئية (Fiber):
- **Single-mode (SMF):** مسافات طويلة
- **Multi-mode (MMF):** مسافات قصيرة

### مقارنة الكابلات:
| النوع | المسافة | السرعة |
|-------|---------|--------|
| UTP Cat6 | 100م | 1 Gbps |
| Fiber SMF | 100 كم | 100 Gbps |
| Fiber MMF | 2 كم | 10 Gbps |

## الوسائط اللاسلكية:
Wi-Fi (802.11), Bluetooth, WiMAX`
      }
    ]
  },
  // ━━━━━━━━━━ الوحدة 5 ━━━━━━━━━━
  {
    id: "unit5-numbering",
    unit: 5,
    title: "أنظمة العد والترقيم",
    icon: "Cpu",
    color: "from-teal-500 to-teal-700",
    hours: { theory: 12, practical: 8, total: 20 },
    difficulty: "beginner",
    topics: [
      {
        id: "binary-system",
        title: "النظام الثنائي والتحويلات",
        unitNumber: 5,
        content: `## أنظمة العد في الشبكات

## النظام الثنائي (Binary):
- أرقامه: 0 و 1
- كل 8 بتات = **Octet**

### التحويل من ثنائي إلى عشري:
\`\`\`
11000000 = 128+64 = 192
10101000 = 128+32+8 = 168
\`\`\`

### قيم البتات:
\`\`\`
128  64  32  16  8  4  2  1
\`\`\`

## النظام السداسي العشري (Hex):
- أرقامه: 0-9 ثم A-F
- يُستخدم في عناوين MAC وIPv6

### جدول التحويل:
| ثنائي | عشري | سداسي |
|-------|------|-------|
| 1010 | 10 | A |
| 1111 | 15 | F |
| 11111111 | 255 | FF |`
      }
    ]
  },
  // ━━━━━━━━━━ الوحدة 6 ━━━━━━━━━━
  {
    id: "unit6-data-link",
    unit: 6,
    title: "طبقة ربط البيانات (Layer 2)",
    icon: "Network",
    color: "from-emerald-500 to-emerald-700",
    hours: { theory: 3, practical: 7, total: 10 },
    difficulty: "easy",
    topics: [
      {
        id: "data-link-functions",
        title: "وظائف طبقة ربط البيانات",
        unitNumber: 6,
        content: `## طبقة ربط البيانات (Data Link Layer)

### الوظائف:
1. التحكم في الوصول للوسيط (MAC)
2. بناء وتفكيك الإطارات (Frames)
3. كشف الأخطاء (Error Detection)

### بروتوكول Ethernet (IEEE 802.3):
المعيار الأكثر استخداماً في LAN.

### بنية إطار Ethernet:
\`\`\`
Preamble | Dest MAC | Src MAC | Data | FCS
 8B      | 6B       | 6B      | 46-1500B | 4B
\`\`\`

### طرق الإرسال:
- **Full-Duplex:** إرسال واستقبال معاً
- **Half-Duplex:** إرسال أو استقبال

### التحكم في الوصول:
- **CSMA/CD:** سلكي (كشف التصادم)
- **CSMA/CA:** لاسلكي (تجنب التصادم)`
      }
    ]
  },
  // ━━━━━━━━━━ الوحدة 7 ━━━━━━━━━━
  {
    id: "unit7-ethernet-switching",
    unit: 7,
    title: "تبديل شبكات الإيثرنت",
    icon: "Server",
    color: "from-blue-600 to-blue-800",
    hours: { theory: 6, practical: 8, total: 14 },
    difficulty: "easy",
    topics: [
      {
        id: "mac-addresses",
        title: "عناوين MAC وجدول المحول",
        unitNumber: 7,
        content: `## عناوين MAC وتبديل الإيثرنت

### خصائص MAC:
- **الطول:** 48 بت (6 بايت)
- **التمثيل:** \`AA:BB:CC:DD:EE:FF\`
- **النصف الأول (OUI):** الشركة المصنعة

### أنواع العناوين:
| النوع | المثال |
|-------|--------|
| Unicast | 00:1A:2B:3C:4D:5E |
| Broadcast | FF:FF:FF:FF:FF:FF |
| Multicast | 01:00:5E:xx:xx:xx |

## آلية عمل المحول:
1. **تعلّم:** يحفظ MAC المصدر مع المنفذ
2. **توجيه:** يُرسل للمنفذ الصحيح
3. **Flooding:** إذا لم يعرف الوجهة يُرسل للجميع

### أوامر:
\`\`\`
Switch# show mac address-table
Switch# clear mac address-table dynamic
\`\`\``
      }
    ]
  },
  // ━━━━━━━━━━ الوحدة 8 ━━━━━━━━━━
  {
    id: "unit8-network-layer",
    unit: 8,
    title: "طبقة الشبكة (Layer 3)",
    icon: "Globe",
    color: "from-cyan-500 to-cyan-700",
    hours: { theory: 3, practical: 8, total: 11 },
    difficulty: "easy",
    topics: [
      {
        id: "network-layer-functions",
        title: "وظائف طبقة الشبكة وIPv4/IPv6",
        unitNumber: 8,
        content: `## طبقة الشبكة (Network Layer)

### الوظائف:
1. **عنونة الأجهزة** - عنوان IP لكل جهاز
2. **التغليف** - رأس IP حول البيانات
3. **التوجيه** - اختيار أفضل مسار

### رأس حزمة IPv4:
- **TTL:** يُنقص عند كل راوتر
- **Protocol:** TCP=6, UDP=17, ICMP=1
- **Source/Destination IP**

### IPv6:
- طول العنوان: 128 بت
- رأس مبسّط، يدعم SLAAC

## آلية التوجيه عند المضيف:
1. الوجهة في نفس الشبكة → إرسال مباشر
2. الوجهة في شبكة مختلفة → Default Gateway
3. Loopback (127.x) → محلياً`
      }
    ]
  },
  // ━━━━━━━━━━ الوحدة 9 ━━━━━━━━━━
  {
    id: "unit9-arp",
    unit: 9,
    title: "بروتوكول حل العناوين (ARP)",
    icon: "Network",
    color: "from-pink-500 to-pink-700",
    hours: { theory: 5, practical: 7, total: 12 },
    difficulty: "easy",
    topics: [
      {
        id: "arp-protocol",
        title: "كيف يعمل بروتوكول ARP",
        unitNumber: 9,
        content: `## بروتوكول ARP (Address Resolution Protocol)

### الهدف:
تحويل عنوان IP معروف إلى عنوان MAC.

### سيناريو 1: نفس الشبكة:
\`\`\`
1. PC-A يبحث في جدول ARP
2. إذا لم يجد → ARP Request (Broadcast)
3. PC-B يرد بـ ARP Reply (Unicast)
4. PC-A يحفظ في جدول ARP
\`\`\`

### سيناريو 2: شبكة مختلفة:
- يُرسل ARP Request للـ Default Gateway
- الراوتر يرد بـ MAC واجهته

### أوامر:
\`\`\`
PC> arp -a
Router# show arp
Router# clear arp-cache
\`\`\``
      }
    ]
  }
];
const UNITS_10_18 = [
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
\`\`\``
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
const UNITS_19_27 = [
  // ━━━━━━━━━━ الوحدة 19 ━━━━━━━━━━
  {
    id: "unit19-dhcp",
    unit: 19,
    title: "بروتوكول التهيئة الديناميكية (DHCP)",
    icon: "Server",
    color: "from-amber-500 to-amber-700",
    hours: { theory: 8, practical: 10, total: 18 },
    difficulty: "medium",
    topics: [
      {
        id: "dhcp-server",
        title: "إعداد خادم DHCP على الراوتر",
        unitNumber: 19,
        content: `## بروتوكول DHCP

### عملية DORA:
\`\`\`
Client ──Discover──▶ Server (Broadcast)
Client ◀──Offer──── Server (عرض IP)
Client ──Request──▶ Server (قبول)
Client ◀──Ack───── Server (تأكيد)
\`\`\`

### إعداد DHCP على الراوتر:
\`\`\`
R1(config)# ip dhcp excluded-address 192.168.1.1 192.168.1.10
R1(config)# ip dhcp pool OFFICE_POOL
R1(dhcp-config)# network 192.168.1.0 255.255.255.0
R1(dhcp-config)# default-router 192.168.1.1
R1(dhcp-config)# dns-server 8.8.8.8
R1(dhcp-config)# lease 7
\`\`\`

### التحقق:
\`\`\`
R1# show ip dhcp binding
R1# show ip dhcp pool
\`\`\`

### DHCP Relay:
\`\`\`
R1(config-if)# ip helper-address 10.0.0.2
\`\`\`
(يحوّل Broadcast إلى Unicast لخادم في شبكة أخرى)

### الراوتر كـ Client:
\`\`\`
R1(config-if)# ip address dhcp
\`\`\``
      }
    ]
  },
  // ━━━━━━━━━━ الوحدة 20 ━━━━━━━━━━
  {
    id: "unit20-switch-security",
    unit: 20,
    title: "إعدادات حماية وأمن المحولات",
    icon: "Shield",
    color: "from-red-600 to-red-800",
    hours: { theory: 12, practical: 8, total: 20 },
    difficulty: "medium",
    topics: [
      {
        id: "switch-security",
        title: "Port Security وحماية المنافذ",
        unitNumber: 20,
        content: `## أمن المحولات

### 1. تعطيل المنافذ غير المستخدمة:
\`\`\`
Switch(config)# interface range FastEthernet0/5-24
Switch(config-if-range)# shutdown
Switch(config-if-range)# switchport access vlan 999
\`\`\`

### 2. Port Security:
\`\`\`
Switch(config)# interface FastEthernet0/1
Switch(config-if)# switchport mode access
Switch(config-if)# switchport port-security
Switch(config-if)# switchport port-security maximum 1
Switch(config-if)# switchport port-security mac-address sticky
Switch(config-if)# switchport port-security violation shutdown
\`\`\`

### أوضاع الانتهاك:
| الوضع | الإجراء | تنبيه |
|-------|---------|-------|
| Shutdown | إغلاق المنفذ | نعم |
| Restrict | منع الحزم | نعم |
| Protect | منع الحزم | لا |

### التحقق:
\`\`\`
Switch# show port-security
Switch# show port-security interface FastEthernet0/1
\`\`\`

### إعادة تفعيل منفذ مغلق:
\`\`\`
Switch(config-if)# shutdown
Switch(config-if)# no shutdown
\`\`\`

### 3. الحماية من MAC Flooding:
هجوم يملأ جدول MAC → Port Security هو الحل.`
      }
    ]
  },
  // ━━━━━━━━━━ الوحدة 21 ━━━━━━━━━━
  {
    id: "unit21-wlan-intro",
    unit: 21,
    title: "مقدمة في الشبكات اللاسلكية (WLAN)",
    icon: "Radio",
    color: "from-cyan-500 to-cyan-700",
    hours: { theory: 7, practical: 10, total: 17 },
    difficulty: "medium",
    topics: [
      {
        id: "wireless-basics",
        title: "مفاهيم الشبكات اللاسلكية ومعاييرها",
        unitNumber: 21,
        content: `## الشبكات اللاسلكية

### الأنواع:
| النوع | النطاق | المثال |
|-------|--------|--------|
| WPAN | أمتار | Bluetooth |
| WLAN | عشرات الأمتار | Wi-Fi |
| WMAN | كم | WiMAX |
| WWAN | كم واسعة | 4G/5G |

### معايير IEEE 802.11:
| المعيار | التردد | السرعة | الاسم |
|---------|--------|--------|-------|
| 802.11n | 2.4/5 GHz | 600 Mbps | Wi-Fi 4 |
| 802.11ac | 5 GHz | 3.5 Gbps | Wi-Fi 5 |
| 802.11ax | 2.4/5/6 GHz | 9.6 Gbps | Wi-Fi 6 |

### المكونات:
- **AP:** نقطة وصول لاسلكية
- **Wireless Router:** راوتر + AP + Switch
- **WLC:** تحكم مركزي بعدة APs

### الأمن:
| البروتوكول | الحالة |
|-----------|--------|
| WEP | ❌ لا تستخدم |
| WPA2 | ✅ شائع |
| WPA3 | ✅ الأحدث |`
      }
    ]
  },
  // ━━━━━━━━━━ الوحدة 22 ━━━━━━━━━━
  {
    id: "unit22-wlan-config",
    unit: 22,
    title: "إعداد وتكوين الشبكات اللاسلكية",
    icon: "Radio",
    color: "from-sky-500 to-sky-700",
    hours: { theory: 6, practical: 10, total: 16 },
    difficulty: "medium",
    topics: [
      {
        id: "wireless-router-integration",
        title: "إعداد جهاز التوجيه اللاسلكي",
        unitNumber: 22,
        content: `## إعداد جهاز التوجيه اللاسلكي

### الدخول لواجهة الإدارة:
\`\`\`
المتصفح → 192.168.1.1 → admin / كلمة المرور
\`\`\`

### إعداد WLAN:
\`\`\`
SSID: MyOfficeWiFi
Security: WPA2-Personal
Password: StrongP@ss2024!
Channel: Auto (أو 1, 6, 11)
\`\`\`

### إعداد LAN وDHCP:
\`\`\`
LAN IP: 192.168.1.1
DHCP: 192.168.1.100 - 192.168.1.200
\`\`\`

### Port Forwarding:
\`\`\`
External Port 80 → 192.168.1.100:80 (TCP)
\`\`\`

### Mesh Networks:
نقاط وصول متصلة ببعضها لتوسيع التغطية تلقائياً.`
      }
    ]
  },
  // ━━━━━━━━━━ الوحدة 23 ━━━━━━━━━━
  {
    id: "unit23-routing-how",
    unit: 23,
    title: "آلية عمل التوجيه",
    icon: "Route",
    color: "from-green-500 to-green-700",
    hours: { theory: 15, practical: 8, total: 23 },
    difficulty: "hard",
    topics: [
      {
        id: "routing-table",
        title: "جدول التوجيه وآلية اتخاذ القرار",
        unitNumber: 23,
        content: `## آلية عمل التوجيه

### دور الراوتر:
1. استقبال الحزمة
2. قراءة IP الوجهة
3. البحث في جدول التوجيه
4. إعادة التغليف (تغيير MAC)
5. الإرسال عبر الواجهة

### قراءة جدول التوجيه:
\`\`\`
C  192.168.1.0/24 is directly connected, GigabitEthernet0/0
S  10.0.0.0/8 [1/0] via 192.168.1.2
O  172.16.0.0/16 [110/2] via 192.168.1.3
S* 0.0.0.0/0 [1/0] via 203.0.113.1
\`\`\`

### رموز المصادر:
| الرمز | المعنى |
|-------|--------|
| C | Connected |
| S | Static |
| O | OSPF |
| D | EIGRP |
| S* | Default |

### Administrative Distance:
| المصدر | AD |
|--------|-----|
| Connected | 0 |
| Static | 1 |
| OSPF | 110 |
| RIP | 120 |

الأقل = الأكثر ثقة.`
      }
    ]
  },
  // ━━━━━━━━━━ الوحدة 24 ━━━━━━━━━━
  {
    id: "unit24-static-routing",
    unit: 24,
    title: "التوجيه الثابت وتوجيه الملاذ الأخير",
    icon: "Route",
    color: "from-teal-600 to-teal-800",
    hours: { theory: 14, practical: 9, total: 23 },
    difficulty: "hard",
    topics: [
      {
        id: "static-routing",
        title: "إعداد التوجيه الثابت",
        unitNumber: 24,
        content: `## التوجيه الثابت (Static Routing)

### 1. مسار عادي:
\`\`\`
R1(config)# ip route 192.168.2.0 255.255.255.0 10.0.0.2
\`\`\`

### 2. مسار عبر منفذ:
\`\`\`
R1(config)# ip route 192.168.2.0 255.255.255.0 GigabitEthernet0/1
\`\`\`

### 3. Default Route:
\`\`\`
R1(config)# ip route 0.0.0.0 0.0.0.0 203.0.113.1
\`\`\`

### 4. Floating Static (احتياطي):
\`\`\`
R1(config)# ip route 0.0.0.0 0.0.0.0 203.0.113.2 200
\`\`\`
AD=200 → يُستخدم فقط عند فشل المسار الرئيسي

### التحقق:
\`\`\`
R1# show ip route static
R1# ping 192.168.2.10
\`\`\``
      }
    ]
  },
  // ━━━━━━━━━━ الوحدة 25 ━━━━━━━━━━
  {
    id: "unit25-ospf",
    unit: 25,
    title: "التوجيه الديناميكي باستخدام OSPFv2",
    icon: "Route",
    color: "from-green-600 to-green-800",
    hours: { theory: 14, practical: 17, total: 31 },
    difficulty: "hard",
    topics: [
      {
        id: "ospf",
        title: "مفهوم OSPF وإعداده",
        unitNumber: 25,
        content: `## بروتوكول OSPF

### خصائص OSPF:
- بروتوكول **Link-State**
- ينظم الشبكة في **Areas**
- خوارزمية **Dijkstra**
- AD = 110

### مفاهيم:
- **Router ID:** معرف فريد (أعلى Loopback IP)
- **Area 0 (Backbone):** المنطقة الرئيسية
- **DR/BDR:** رئيسي واحتياطي

### إعداد OSPFv2:
\`\`\`
R1(config)# router ospf 1
R1(config-router)# router-id 1.1.1.1
R1(config-router)# network 192.168.1.0 0.0.0.255 area 0
R1(config-router)# network 10.0.0.0 0.0.0.3 area 0
R1(config-router)# passive-interface GigabitEthernet0/0
\`\`\`

### Wildcard Mask (عكس القناع):
\`\`\`
255.255.255.0   →  0.0.0.255
255.255.255.252 →  0.0.0.3
\`\`\`

### التحقق:
\`\`\`
R1# show ip ospf neighbor
R1# show ip route ospf
\`\`\`

### حالات الجوار:
\`\`\`
Down → Init → 2-Way → ExStart → Exchange → Loading → Full
\`\`\``
      }
    ]
  },
  // ━━━━━━━━━━ الوحدة 26 ━━━━━━━━━━
  {
    id: "unit26-acl",
    unit: 26,
    title: "قوائم التحكم في الوصول - ACL",
    icon: "Shield",
    color: "from-red-500 to-red-700",
    hours: { theory: 15, practical: 20, total: 35 },
    difficulty: "hard",
    topics: [
      {
        id: "standard-acl-1",
        title: "قوائم ACL القياسية",
        unitNumber: 26,
        content: `## قوائم التحكم بالوصول (ACL)

### قاعدة أساسية:
"قائمة واحدة، لكل واجهة، لكل اتجاه، لكل بروتوكول"

### Implicit Deny All:
كل قائمة تنتهي ضمنياً بـ \`deny any\`.

## Standard ACL (1-99):
تُصفّي حسب **المصدر فقط** — تُوضع قرب **الوجهة**

\`\`\`
R1(config)# access-list 10 deny 192.168.10.0 0.0.0.255
R1(config)# access-list 10 permit any
R1(config)# interface GigabitEthernet0/1
R1(config-if)# ip access-group 10 out
\`\`\`

### Wildcard:
\`\`\`
host 192.168.1.1 = 192.168.1.1 0.0.0.0
any = 0.0.0.0 255.255.255.255
\`\`\`

### التحقق:
\`\`\`
R1# show access-lists
\`\`\``
      },
      {
        id: "standard-acl-2",
        title: "قوائم ACL الممتدة",
        unitNumber: 26,
        content: `## Extended ACL (100-199)

تُصفّي حسب **المصدر + الوجهة + البروتوكول + المنفذ**
تُوضع قرب **المصدر**

### أمثلة:
\`\`\`
! منع HTTP من شبكة محددة
access-list 100 deny tcp 192.168.1.0 0.0.0.255 any eq 80

! السماح بـ SSH لخادم فقط
access-list 101 permit tcp any host 192.168.1.100 eq 22

! السماح بالباقي
access-list 100 permit ip any any
\`\`\`

### ACL مسماة:
\`\`\`
R1(config)# ip access-list extended PROTECT_SERVER
R1(config-ext-nacl)# permit tcp any host 192.168.1.100 eq 443
R1(config-ext-nacl)# deny ip any host 192.168.1.100
R1(config-ext-nacl)# permit ip any any
\`\`\`

### تأمين VTY:
\`\`\`
R1(config)# access-list 10 permit host 192.168.1.5
R1(config)# line vty 0 4
R1(config-line)# access-class 10 in
\`\`\`

### تعديل بـ Sequence Numbers:
\`\`\`
R1(config-std-nacl)# no 20          ← حذف السطر 20
R1(config-std-nacl)# 15 permit host 192.168.1.50  ← إدراج
\`\`\``
      }
    ]
  },
  // ━━━━━━━━━━ الوحدة 27 ━━━━━━━━━━
  {
    id: "unit27-nat",
    unit: 27,
    title: "تقنية ترجمة عناوين الشبكة (NAT)",
    icon: "Globe",
    color: "from-indigo-600 to-indigo-800",
    hours: { theory: 8, practical: 10, total: 18 },
    difficulty: "hard",
    topics: [
      {
        id: "nat",
        title: "Static NAT و Dynamic NAT",
        unitNumber: 27,
        content: `## تقنية NAT

### مصطلحات:
| المصطلح | المعنى |
|---------|--------|
| Inside Local | العنوان الداخلي (خاص) |
| Inside Global | العنوان كما يظهر خارجياً |

## 1. Static NAT (1:1):
\`\`\`
R1(config)# ip nat inside source static 192.168.1.10 203.0.113.10
R1(config-if)# ip nat inside
R1(config-if)# ip nat outside
\`\`\`

## 2. Dynamic NAT (Pool):
\`\`\`
R1(config)# ip nat pool POOL 203.0.113.1 203.0.113.10 netmask 255.255.255.240
R1(config)# access-list 1 permit 192.168.1.0 0.0.0.255
R1(config)# ip nat inside source list 1 pool POOL
\`\`\`

### التحقق:
\`\`\`
R1# show ip nat translations
R1# show ip nat statistics
\`\`\``
      },
      {
        id: "pat",
        title: "إعداد PAT (NAT Overload)",
        unitNumber: 27,
        content: `## PAT - NAT Overload

### كيف يعمل؟
مئات الأجهزة تشارك عنواناً عاماً واحداً عبر أرقام المنافذ:
\`\`\`
192.168.1.10:1025 → 203.0.113.1:5001
192.168.1.11:1025 → 203.0.113.1:5002
\`\`\`

### الإعداد الكامل:
\`\`\`
! 1. الأجهزة المسموحة
R1(config)# access-list 1 permit 192.168.1.0 0.0.0.255

! 2. PAT عبر واجهة الخروج
R1(config)# ip nat inside source list 1 interface GigabitEthernet0/1 overload

! 3. تحديد الواجهات
R1(config)# interface GigabitEthernet0/0
R1(config-if)# ip nat inside
R1(config)# interface GigabitEthernet0/1
R1(config-if)# ip nat outside
\`\`\`

### المراقبة:
\`\`\`
R1# show ip nat translations
Pro Inside local      Inside global
tcp 192.168.1.10:1025 203.0.113.1:5001
\`\`\`

### الإيجابيات مقابل السلبيات:
| إيجابيات | سلبيات |
|-----------|--------|
| توفير العناوين | تأخير المعالجة |
| حماية الشبكة | كسر End-to-End |`
      }
    ]
  }
];
const LEGACY_TOPICS = {
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
const IOT_UNIT = {
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
const mergeLegacy = (units) => units.map((unit) => {
  const extra = LEGACY_TOPICS[unit.id];
  return extra ? { ...unit, topics: [...unit.topics, ...extra] } : unit;
});
const courseData = [
  ...mergeLegacy(UNITS_1_9),
  ...mergeLegacy(UNITS_10_18),
  ...mergeLegacy(UNITS_19_27),
  IOT_UNIT
];
const LANG_DIR = { ar: "rtl", en: "ltr", he: "rtl" };
const STORAGE_KEY$2 = "app-language";
const T = {
  /* ─── التطبيق والهيكل ─── */
  appName: { ar: "مبادئ الشبكات", en: "Networking Principles", he: "יסודות הרשתות" },
  appTagline: { ar: "منصة تعليمية تفاعلية", en: "Interactive learning platform", he: "פלטפורמת למידה אינטראקטיבית" },
  navHome: { ar: "الصفحة الرئيسية", en: "Home", he: "בית" },
  navSimulator: { ar: "محاكاة الشبكات", en: "Network Simulator", he: "סימולטור רשתות" },
  navDashboard: { ar: "لوحة التقدم", en: "Progress", he: "לוח התקדמות" },
  navScenarioLab: { ar: "مختبر السيناريوهات", en: "Scenario Lab", he: "מעבדת תרחישים" },
  navLabHistory: { ar: "سجل المحاولات", en: "Lab History", he: "היסטוריית מעבדה" },
  navExams: { ar: "الامتحانات", en: "Exams", he: "בחינות" },
  navSettings: { ar: "الإعدادات", en: "Settings", he: "הגדרות" },
  navSchools: { ar: "المدارس", en: "Schools", he: "בתי ספר" },
  navMyStudents: { ar: "طلاب مدرستي", en: "My Students", he: "התלמידים שלי" },
  navStudentReports: { ar: "تقارير الطلاب", en: "Student Reports", he: "דוחות תלמידים" },
  navExamManage: { ar: "إدارة الامتحانات", en: "Exam Management", he: "ניהול בחינות" },
  navExamResults: { ar: "نتائج الامتحانات", en: "Exam Results", he: "תוצאות בחינות" },
  courseContent: { ar: "محتوى الدورة", en: "Course Content", he: "תוכן הקורס" },
  footerRights: { ar: "جميع حقوق النشر محفوظة", en: "All rights reserved", he: "כל הזכויות שמורות" },
  /* ─── عام ─── */
  back: { ar: "رجوع", en: "Back", he: "חזור" },
  save: { ar: "حفظ", en: "Save", he: "שמור" },
  refresh: { ar: "تحديث", en: "Refresh", he: "רענן" },
  close: { ar: "إغلاق", en: "Close", he: "סגור" },
  loading: { ar: "جاري التحميل...", en: "Loading...", he: "טוען..." },
  copy: { ar: "نسخ", en: "Copy", he: "העתק" },
  copiedMsg: { ar: "تم نسخ البريد الإلكتروني بنجاح.", en: "Email copied successfully.", he: "האימייל הועתק בהצלחה." },
  /* ─── تسجيل الدخول (بالرموز فقط) ─── */
  loginTitle: { ar: "تسجيل الدخول", en: "Login", he: "התחברות" },
  loginSubtitle: {
    ar: "أدخل رمز المدرسة ورمز الطالب للدخول إلى حسابك — لا يُقبل الدخول إلا برموز صحيحة ومتطابقة",
    en: "Enter your School Code and Student Code — login is accepted only with valid, matching codes",
    he: "הזינו את קוד בית הספר וקוד התלמיד — הכניסה מתקבלת רק עם קודים תקינים ותואמים"
  },
  schoolCode: { ar: "رمز المدرسة", en: "School Code", he: "קוד בית הספר" },
  studentCode: { ar: "رمز الطالب", en: "Student Code", he: "קוד תלמיד" },
  loginBtn: { ar: "تسجيل الدخول", en: "Login", he: "התחברות" },
  loginPendingNote: { ar: "بعد الدخول ينتظر حسابك موافقة مشرف مدرستك قبل استخدام التطبيق", en: "After login, your account awaits your school admin's approval", he: "לאחר הכניסה החשבון ממתין לאישור מנהל בית הספר" },
  createAccount: { ar: "إنشاء حساب جديد", en: "Create New Account", he: "יצירת חשבון חדש" },
  createAccountNote: { ar: "اختر خطة الاشتراك أولاً — شخصية أو مدرسية", en: "Choose a subscription plan first — personal or school", he: "בחרו תחילה תוכנית מנוי — אישית או בית ספרית" },
  personalOption: { ar: "التسجيل بشكل مستقل بدون مدرسة", en: "Register independently without a school", he: "הרשמה עצמאית ללא בית ספר" },
  personalOptionDesc: { ar: "أريد استخدام المنصة بشكل شخصي — بدون رمز مدرسة", en: "I want to use the platform personally — no school code needed", he: "אני רוצה להשתמש בפלטפורמה באופן אישי — ללא קוד בית ספר" },
  goPersonalPlans: { ar: "الخطط الشخصية", en: "Personal Plans", he: "תוכניות אישיות" },
  /* ─── رسائل التحقق (تسجيل الدخول) ─── */
  errSchoolCode: { ar: "رمز المدرسة غير صحيح.", en: "Invalid school code.", he: "קוד בית הספר שגוי." },
  errStudentCode: { ar: "رمز الطالب غير صحيح.", en: "Invalid student code.", he: "קוד התלמיד שגוי." },
  errMismatch: { ar: "بيانات تسجيل الدخول غير متطابقة.", en: "Login details do not match.", he: "פרטי ההתחברות אינם תואמים." },
  errDisabled: { ar: "هذا الحساب معطل. يرجى التواصل مع إدارة المدرسة.", en: "This account is disabled. Please contact the school administration.", he: "החשבון מושבת. פנו להנהלת בית הספר." },
  errNotApproved: { ar: "الحساب غير معتمد. يرجى التواصل مع إدارة المدرسة.", en: "Account not approved. Please contact the school administration.", he: "החשבון לא מאושר. פנו להנהלת בית הספר." },
  errTaken: { ar: "هذا الرمز مستخدم ومسجل مسبقاً — تواصل مع إدارة مدرستك", en: "This code is already registered — contact your school administration", he: "הקוד כבר רשום — פנו להנהלת בית הספר" },
  errUnexpected: { ar: "حدث خطأ غير متوقع — تأكد من الاتصال وحاول مجدداً", en: "Unexpected error — check your connection and try again", he: "שגיאה לא צפויה — בדקו את החיבור ונסו שוב" },
  /* ─── شاشات حالة الحساب ─── */
  pendingTitle: { ar: "الحساب بانتظار موافقة إدارة المدرسة.", en: "Account awaiting school administration approval.", he: "החשבון ממתין לאישור הנהלת בית הספר." },
  rejectedTitle: { ar: "تم رفض حسابك", en: "Your account was rejected", he: "החשבון שלכם נדחה" },
  pendingDesc: { ar: "تم تسجيلك في مدرستك بنجاح. لن تستطيع استخدام التطبيق حتى يوافق مشرف المدرسة على حسابك.", en: "You registered successfully. You can use the app once the school admin approves your account.", he: "נרשמתם בהצלחה. תוכלו להשתמש באפליקציה לאחר אישור מנהל בית הספר." },
  statusDesc: { ar: "راجع إدارة مدرستك بخصوص حالة حسابك.", en: "Please contact your school administration about your account status.", he: "פנו להנהלת בית הספר לגבי מצב החשבון." },
  logout: { ar: "تسجيل الخروج", en: "Logout", he: "התנתקות" },
  studentCodeLabel: { ar: "رمز الطالب", en: "Student Code", he: "קוד תלמיד" },
  /* ─── الإعدادات ─── */
  settingsTitle: { ar: "الإعدادات", en: "Settings", he: "הגדרות" },
  settingsSubtitle: { ar: "حسابك، لغة الواجهة، ومعلومات مدرستك", en: "Your account, interface language, and school information", he: "החשבון, שפת הממשק ומידע על בית הספר" },
  accountSection: { ar: "الحساب", en: "Account", he: "חשבון" },
  nameLabel: { ar: "الاسم", en: "Name", he: "שם" },
  emailLabel: { ar: "البريد الإلكتروني", en: "Email", he: "אימייל" },
  roleLabel: { ar: "الدور", en: "Role", he: "תפקיד" },
  roleAdmin: { ar: "معلم / مدير", en: "Teacher / Admin", he: "מורה / מנהל" },
  roleStudent: { ar: "طالب", en: "Student", he: "תלמיד" },
  statusLabel: { ar: "حالة الحساب", en: "Account Status", he: "מצב החשבון" },
  languageSection: { ar: "لغة الواجهة", en: "Interface Language", he: "שפת הממשק" },
  langNote: { ar: "يتم حفظ تفضيلك تلقائياً وتحديث اتجاه الواجهة", en: "Your preference is saved automatically and the layout direction updates", he: "ההעדפה נשמרת אוטומטית וכיוון הממשק מתעדכן" },
  saving: { ar: "جاري الحفظ...", en: "Saving...", he: "שומר..." },
  saved: { ar: "تم الحفظ", en: "Saved", he: "נשמר" },
  schoolSection: { ar: "المدرسة", en: "School", he: "בית הספר" },
  schoolGeneral: { ar: "عام", en: "General", he: "כללי" },
  schoolLinked: { ar: "بياناتك (التقدم، النتائج، السيناريوهات) مرتبطة بهذه المدرسة فقط", en: "Your data (progress, results, scenarios) is linked to this school only", he: "הנתונים שלכם מקושרים לבית הספר הזה בלבד" },
  schoolUnlinked: { ar: "لم يتم إلحاقك بمدرسة بعد — بياناتك على النطاق العام", en: "You are not linked to a school yet — your data is on the general scope", he: "טרם שויכתם לבית ספר — הנתונים בטווח הכללי" },
  contactSection: { ar: "معلومات التواصل", en: "Contact Information", he: "פרטי קשר" },
  contactSectionDesc: { ar: "البريد الذي تصل إليه ملاحظات المستخدمين عبر زر «تواصل معنا»", en: "The email that receives user feedback via the Contact Us button", he: "האימייל שמקבל את הערות המשתמשים דרך כפתור יצירת קשר" },
  saveEmail: { ar: "حفظ البريد", en: "Save Email", he: "שמור אימייל" },
  adminOnlyNote: { ar: "تعديل البريد متاح لمالك المنصة فقط", en: "Editing the email is available to the platform owner only", he: "עריכת האימייל זמינה לבעל הפלטפורמה בלבד" },
  /* ─── الخطط ─── */
  plansTitle: { ar: "إنشاء حساب جديد — اختيار الخطة", en: "Create New Account — Choose a Plan", he: "יצירת חשבון חדש — בחירת תוכנית" },
  plansSubtitle: { ar: "لا يُنشأ الحساب قبل اختيار الخطة المناسبة", en: "The account is not created before choosing a plan", he: "החשבון לא נוצר לפני בחירת תוכנית" },
  personalPlanSection: { ar: "الخطة الشخصية", en: "Personal Plan", he: "תוכנית אישית" },
  personalPlanDesc: { ar: "لمتعلم واحد — حساب طالب كامل بدون مدرسة", en: "For one learner — a full student account without a school", he: "ללומד אחד — חשבון תלמיד מלא ללא בית ספר" },
  monthly: { ar: "شهريًا", en: "Monthly", he: "חודשי" },
  annually: { ar: "سنويًا", en: "Annually", he: "שנתי" },
  pay8months: { ar: "ادفع 8 أشهر وباقي السنة مجانًا", en: "Pay for 8 months, get the rest of the year free", he: "שלמו על 8 חודשים וקבלו את שאר השנה בחינם" },
  choosePlan: { ar: "اختيار هذه الخطة", en: "Choose this plan", he: "בחירת תוכנית זו" },
  schoolPlanSection: { ar: "الخطة المدرسية", en: "School Plan", he: "תוכנית בית ספרית" },
  schoolPlanDesc: { ar: "تعتمد على عدد الطلاب — اختر الخطة المناسبة لمدرستك", en: "Based on the number of students — choose the right plan for your school", he: "תלויה במספר התלמידים — בחרו את התוכנית המתאימה" },
  studentLimitLabel: { ar: "الحد الأقصى", en: "Maximum", he: "מקסימום" },
  /* ─── مختبر السيناريوهات ─── */
  scenarioLabTitle: { ar: "مختبر السيناريوهات", en: "Scenario Lab", he: "מעבדת תרחישים" },
  scenarioLabSubtitle: { ar: "سيناريوهات عملية مرتبطة بدروسك — نفّذها على محاكي الشبكة واحصل على تقييم فوري", en: "Practical scenarios linked to your lessons — run them on the simulator and get instant evaluation", he: "תרחישים מעשיים הקשורים לשיעורים — הריצו בסימולטור וקבלו הערכה מיידית" },
  syncedNote: { ar: "تقدمك متزامن مع حسابك", en: "Your progress is synced to your account", he: "ההתקדמות מסונכרנת לחשבון שלכם" },
  syncingNote: { ar: "جاري مزامنة تقدمك مع حسابك...", en: "Syncing your progress...", he: "מסנכרן את ההתקדמות..." },
  diffSortedNote: { ar: "السيناريوهات مرتبة حسب الصعوبة — من الأسهل إلى الأصعب", en: "Scenarios are sorted by difficulty — easiest first", he: "התרחישים מסודרים לפי קושי — מהקל לקשה" },
  completedProgress: { ar: "أكملت", en: "Completed", he: "הושלמו" },
  ofScenarios: { ar: "سيناريو", en: "scenarios", he: "תרחישים" },
  newLabel: { ar: "جديد", en: "New", he: "חדש" },
  continueLabel: { ar: "متابعة", en: "Continue", he: "המשך" },
  startLabel: { ar: "ابدأ", en: "Start", he: "התחל" },
  allCompletedMsg: { ar: "لقد أكملت جميع السيناريوهات المتاحة لك.", en: "You have completed all scenarios available to you.", he: "השלמתם את כל התרחישים הזמינים לכם." },
  viewHistory: { ar: "عرض السجل", en: "View History", he: "צפייה בהיסטוריה" },
  backToAllScenarios: { ar: "كل السيناريوهات", en: "All scenarios", he: "כל התרחישים" },
  lessonScenariosTitle: { ar: "سيناريوهات هذا الدرس", en: "Scenarios for this lesson", he: "תרחישים לשיעור זה" },
  lessonScenariosDesc: { ar: "نفّذ ما تعلمته في المحاكي — سيناريوهات مرتبطة بهذا الدرس فقط", en: "Apply what you learned in the simulator — scenarios linked to this lesson only", he: "יישמו את מה שלמדתם בסימולטור — תרחישים הקשורים לשיעור זה בלבד" },
  relatedLesson: { ar: "الدرس المرتبط", en: "Related lesson", he: "שיעור קשור" },
  objectivesTitle: { ar: "الأهداف", en: "Objectives", he: "מטרות" },
  completedCount: { ar: "مكتمل", en: "completed", he: "הושלם" },
  openInSimulator: { ar: "افتح في المحاكي", en: "Open in Simulator", he: "פתח בסימולטור" },
  evaluate: { ar: "تقييم الحل", en: "Evaluate Solution", he: "הערכת הפתרון" },
  hints: { ar: "تلميحات", en: "Hints", he: "רמזים" },
  aiHintBtn: { ar: "تلميح AI", en: "AI Hint", he: "רמז AI" },
  aiThinking: { ar: "جاري التفكير...", en: "Thinking...", he: "חושב..." },
  passedMsg: { ar: "ممتاز! اجتزت السيناريو", en: "Excellent! Scenario passed", he: "מעולה! התרחיש עבר" },
  failedMsg: { ar: "لم تجتز السيناريو بعد", en: "Scenario not passed yet", he: "התרחיש טרם עבר" },
  backToScenarios: { ar: "العودة للسيناريوهات", en: "Back to scenarios", he: "חזרה לתרחישים" },
  backHome: { ar: "الرئيسية", en: "Home", he: "בית" },
  /* ─── مستويات الصعوبة ─── */
  diffBeginner: { ar: "مبتدئ", en: "Beginner", he: "מתחיל" },
  diffEasy: { ar: "سهل", en: "Easy", he: "קל" },
  diffMedium: { ar: "متوسط", en: "Medium", he: "בינוני" },
  diffHard: { ar: "صعب", en: "Hard", he: "קשה" },
  diffAdvanced: { ar: "متقدم", en: "Advanced", he: "מתקדם" },
  /* ─── سجل المحاولات ─── */
  historyTitle: { ar: "سجل محاولات السيناريوهات", en: "Scenario Lab History", he: "היסטוריית מעבדת התרחישים" },
  historySubtitle: { ar: "تقدمك في كل سيناريو — محفوظ تلقائياً مهما غادرت الصفحة", en: "Your progress per scenario — saved automatically", he: "ההתקדמות בכל תרחיש — נשמרת אוטומטית" },
  totalAttempts: { ar: "إجمالي المحاولات", en: "Total Attempts", he: "סך הניסיונות" },
  completedScenarios: { ar: "سيناريوهات مكتملة", en: "Completed Scenarios", he: "תרחישים שהושלמו" },
  totalXp: { ar: "إجمالي XP", en: "Total XP", he: "סך XP" },
  avgScore: { ar: "متوسط النتيجة", en: "Average Score", he: "ציון ממוצע" },
  noAttempts: { ar: "لا توجد محاولات بعد", en: "No attempts yet", he: "אין ניסיונות עדיין" },
  noAttemptsDesc: { ar: "ابدأ بأول سيناريو وسيظهر تقدمك هنا تلقائياً", en: "Start your first scenario — your progress will appear here", he: "התחילו תרחיש ראשון וההתקדמות תופיע כאן" },
  startNow: { ar: "ابدأ الآن", en: "Start now", he: "התחילו עכשיו" },
  loadingHistory: { ar: "جاري تحميل سجلك...", en: "Loading your history...", he: "טוען את ההיסטוריה..." },
  lessonLabel: { ar: "الدرس", en: "Lesson", he: "שיעור" },
  startedAtLabel: { ar: "تاريخ البدء", en: "Started", he: "התחיל" },
  completedAtLabel: { ar: "تاريخ الإكمال", en: "Completed", he: "הושלם" },
  lastActivityLabel: { ar: "آخر نشاط", en: "Last activity", he: "פעילות אחרונת" },
  scoreLabel: { ar: "النتيجة", en: "Score", he: "ציון" },
  tasksLabel: { ar: "مهمة", en: "tasks", he: "משימות" },
  stCompleted: { ar: "مكتمل", en: "Completed", he: "הושלם" },
  stPartial: { ar: "منجز جزئياً", en: "Partially completed", he: "הושלם חלקית" },
  stInProgress: { ar: "جارية", en: "In progress", he: "בתהליך" },
  stNotStarted: { ar: "لم تبدأ", en: "Not started", he: "לא התחיל" },
  /* ─── تواصل معنا ─── */
  contactButton: { ar: "تواصل معنا", en: "Contact Us", he: "צור קשר" },
  contactTitle: { ar: "تواصل معنا", en: "Contact Us", he: "צור קשר" },
  contactDesc: { ar: "شاركنا تعليقك أو ملاحظتك عن التطبيق — ستصل مباشرة إلى فريق الدعم", en: "Share your comment or feedback about the app — it goes straight to our team", he: "שתפו את הערתכם על האפליקציה — תגיע ישירות לצוות התמיכה" },
  contactPlaceholder: { ar: "اكتب تعليقك أو ملاحظتك هنا...", en: "Write your comment or feedback here...", he: "כתבו את ההערה שלכם כאן..." },
  contactSend: { ar: "إرسال", en: "Send", he: "שלח" },
  contactSending: { ar: "جاري الإرسال...", en: "Sending...", he: "שולח..." },
  contactSent: { ar: "تم إرسال ملاحظتك بنجاح — شكراً لك", en: "Your feedback was sent — thank you", he: "ההערה נשלחה — תודה" },
  contactError: { ar: "تعذر الإرسال المباشر — أرسل ملاحظتك عبر بريدك الإلكتروني", en: "Direct sending failed — send your feedback via your email", he: "השליחה הישירה נכשלה — שלחו את ההערה מהמייל שלכם" },
  contactOpenMail: { ar: "إرسال عبر بريدي", en: "Send via my email", he: "שלח מהמייל שלי" },
  contactCancel: { ar: "إغلاق", en: "Close", he: "סגור" },
  /* ─── الصفحة الرئيسية ─── */
  homeHeroBadge: { ar: "منصة تعليمية تفاعلية متكاملة", en: "A complete interactive learning platform", he: "פלטפורמת למידה אינטראקטיבית מלאה" },
  homeHeroTitleA: { ar: "تعلّم مبادئ", en: "Learn the Principles of", he: "למדו את יסודות" },
  homeHeroTitleB: { ar: "الشبكات", en: "Networking", he: "הרשתות" },
  homeHeroDesc: { ar: "دليلك الشامل لفهم أساسيات الشبكات من العناوين والتوجيه إلى الأمان وإنترنت الأشياء", en: "Your complete guide to networking fundamentals — from addressing and routing to security and the Internet of Things", he: "המדריך המלא שלכם ליסודות הרשתות — מכתובוּת וניתוב ועד אבטחה והאינטרנט של הדברים" },
  simCTATitle: { ar: "محاكاة بناء شبكة", en: "Network Building Simulator", he: "סימולטור בניית רשת" },
  simCTADesc: { ar: "اسحب الأجهزة وابنِ شبكتك بصرياً — تفاعلي", en: "Drag devices and build your network visually — fully interactive", he: "גררו מכשירים ובנו את הרשת שלכם בצורה חזותית — אינטראקטיבי" },
  courseTopicsTitle: { ar: "مواضيع الدورة", en: "Course Topics", he: "נושאי הקורס" },
  lessonWord: { ar: "درس", en: "lessons", he: "שיעורים" },
  /* ─── لوحة التقدم ─── */
  dashTitle: { ar: "لوحة تقدمك", en: "Your Progress Dashboard", he: "לוח ההתקדמות שלכם" },
  dashSubtitle: { ar: "تابع تقدمك في دروس الشبكات ونتائج الاختبارات", en: "Track your progress through networking lessons and quiz results", he: "עקבו אחר ההתקדמות בשיעורי הרשתות ובתוצאות הבחינות" },
  dashLessonsDone: { ar: "الدروس المكتملة", en: "Lessons Visited", he: "שיעורים שנצפו" },
  dashQuizzesDone: { ar: "الاختبارات المكتملة", en: "Quizzes Completed", he: "בחינות שהושלמו" },
  dashAvgScore: { ar: "متوسط الدرجات", en: "Average Score", he: "ציון ממוצע" },
  dashProgressPct: { ar: "نسبة التقدم", en: "Progress", he: "אחוז התקדמות" },
  dashOverall: { ar: "التقدم الإجمالي في الدورة", en: "Overall Course Progress", he: "ההתקדמות הכוללת בקורס" },
  dashBySection: { ar: "التقدم حسب القسم", en: "Progress by Section", he: "התקדמות לפי מקטע" },
  dashTakeQuiz: { ar: "اختبر", en: "Take quiz", he: "הבחן" },
  dashLessonsDoneShort: { ar: "درس مكتمل", en: "lessons done", he: "שיעורים שהושלמו" },
  dashQuizResults: { ar: "نتائج الاختبارات", en: "Quiz Results", he: "תוצאות בחינות" },
  dashEmptyMsg: { ar: "ابدأ الدراسة لترى تقدمك هنا!", en: "Start learning to see your progress here!", he: "התחילו ללמוד כדי לראות כאן את ההתקדמות שלכם!" },
  dashGoLessons: { ar: "اذهب إلى الدروس", en: "Go to lessons", he: "מעבר לשיעורים" },
  /* ─── صفحة الدرس ─── */
  topicNotFound: { ar: "الموضوع غير موجود", en: "Topic not found", he: "הנושא לא נמצא" },
  ttsReadLabel: { ar: "قراءة الشرح", en: "Read aloud", he: "קריאה בקול" },
  ttsReadQuestions: { ar: "قراءة الأسئلة", en: "Read questions", he: "קריאת השאלות" },
  navPrev: { ar: "السابق", en: "Previous", he: "הקודם" },
  navNext: { ar: "التالي", en: "Next", he: "הבא" },
  translatingLesson: { ar: "جارٍ ترجمة الدرس آلياً — للحظات فقط...", en: "Translating this lesson automatically — just a moment...", he: "מתרגם את השיעור אוטומטית — רק רגע..." }
};
function getLang() {
  try {
    return localStorage.getItem(STORAGE_KEY$2) || "ar";
  } catch {
    return "ar";
  }
}
function setLang(lang) {
  try {
    localStorage.setItem(STORAGE_KEY$2, lang);
  } catch {
  }
  document.documentElement.dir = LANG_DIR[lang] || "rtl";
  document.documentElement.lang = lang;
  window.dispatchEvent(new Event("app-lang-change"));
}
function t(key, lang = getLang()) {
  var _a, _b;
  return ((_a = T[key]) == null ? void 0 : _a[lang]) || ((_b = T[key]) == null ? void 0 : _b.ar) || key;
}
function useLang() {
  const [lang, setLocal] = useState(getLang);
  useEffect(() => {
    const onChange = () => setLocal(getLang());
    window.addEventListener("app-lang-change", onChange);
    return () => window.removeEventListener("app-lang-change", onChange);
  }, []);
  return lang;
}
try {
  document.documentElement.dir = LANG_DIR[getLang()] || "rtl";
} catch {
}
const SECTION_TITLES = {
  "unit1-basics": { en: "Communication Networks Fundamentals", he: "יסודות רשתות תקשורת" },
  "unit2-ios": { en: "Device Operating System (Cisco IOS)", he: "מערכת הפעלה למכשירים (Cisco IOS)" },
  "unit3-protocols-models": { en: "Protocols & Standard Models", he: "פרוטוקולים ומודלים תקניים" },
  "unit4-physical": { en: "The Physical Layer", he: "השכבה הפיזית" },
  "unit5-numbering": { en: "Numbering Systems", he: "שיטות ספירה" },
  "unit6-data-link": { en: "Data Link Layer (Layer 2)", he: "שכבת קישור הנתונים (Layer 2)" },
  "unit7-ethernet-switching": { en: "Ethernet Switching", he: "מיתוג Ethernet" },
  "unit8-network-layer": { en: "Network Layer (Layer 3)", he: "שכבת הרשת (Layer 3)" },
  "unit9-arp": { en: "Address Resolution Protocol (ARP)", he: "פרוטוקול פענוח כתובות (ARP)" },
  "unit10-router-basic": { en: "Basic Router Configuration", he: "הגדרה בסיסית של נתב" },
  "unit11-ipv4": { en: "IPv4 Protocol & Network Addressing", he: "פרוטוקול IPv4 וכתובות רשת" },
  "unit12-icmp": { en: "Internet Control Message Protocol (ICMP)", he: "פרוטוקול הודעות בקרה (ICMP)" },
  "unit13-transport": { en: "Transport Layer (Layer 4) – TCP & UDP", he: "שכבת התעבורה (Layer 4) – TCP ו-UDP" },
  "unit14-application": { en: "Application Layer (Layer 7)", he: "שכבת היישומים (Layer 7)" },
  "unit15-advanced-initial": { en: "Advanced Initial Setup for Switch & Router", he: "הגדרות התחלתיות מתקדמות למתג ולנתב" },
  "unit16-switching-concepts": { en: "Switching Concepts & Techniques", he: "מושגים וטכניקות של מיתוג" },
  "unit17-vlan": { en: "Virtual LANs (VLAN)", he: "רשתות מקומיות וירטואליות (VLAN)" },
  "unit18-inter-vlan": { en: "Inter-VLAN Routing", he: "ניתוב בין VLAN (Inter-VLAN)" },
  "unit19-dhcp": { en: "Dynamic Host Configuration Protocol (DHCP)", he: "פרוטוקול הגדרה דינמית (DHCP)" },
  "unit20-switch-security": { en: "Switch Security & Protection", he: "אבטחת מתגים והגנה" },
  "unit21-wlan-intro": { en: "Intro to Wireless Networks (WLAN)", he: "מבוא לרשתות אלחוטיות (WLAN)" },
  "unit22-wlan-config": { en: "Wireless Network Setup & Configuration", he: "הקמה והגדרת רשתות אלחוטיות" },
  "unit23-routing-how": { en: "How Routing Works", he: "כיצד עובד הניתוב" },
  "unit24-static-routing": { en: "Static Routing & Default Route", he: "ניתוב סטטי ונתיב ברירת מחדל" },
  "unit25-ospf": { en: "Dynamic Routing with OSPFv2", he: "ניתוב דינמי עם OSPFv2" },
  "unit26-acl": { en: "Access Control Lists (ACL)", he: "רשימות בקרת גישה (ACL)" },
  "unit27-nat": { en: "Network Address Translation (NAT)", he: "תרגום כתובות רשת (NAT)" },
  iot: { en: "Internet of Things (IoT)", he: "האינטרנט של הדברים (IoT)" }
};
const TOPIC_TITLES = {
  "network-components": { en: "Basic Network Components", he: "רכיבי רשת בסיסיים" },
  "packet-tracer-intro": { en: "Introduction to Packet Tracer", he: "מבוא ל-Packet Tracer" },
  "ios-access-modes": { en: "Cisco IOS Access Modes", he: "מצבי גישה ל-Cisco IOS" },
  "ios-initial-config": { en: "Initial Device Configuration", he: "הגדרות ראשוניות למכשיר" },
  "osi-tcpip-models": { en: "OSI and TCP/IP Models", he: "מודלי OSI ו-TCP/IP" },
  "physical-media": { en: "Physical Layer Media", he: "אמצעי שידור של השכבה הפיזית" },
  "binary-system": { en: "Binary System & Conversions", he: "השיטה הבינארית והמרות" },
  "data-link-functions": { en: "Data Link Layer Functions", he: "פונקציות שכבת קישור הנתונים" },
  "mac-addresses": { en: "MAC Addresses & ARP Table", he: "כתובות MAC וטבלת ARP" },
  "network-layer-functions": { en: "Network Layer Functions & IPv4/IPv6", he: "פונקציות שכבת הרשת ו-IPv4/IPv6" },
  "arp-protocol": { en: "How ARP Works", he: "כיצד ARP פועל" },
  "router-basic-config": { en: "Router Configuration Step by Step", he: "הגדרת נתב שלב אחר שלב" },
  "ipv4-addresses": { en: "IPv4 Address Structure & Subnetting", he: "מבנה כתובות IPv4 וחלוקה לתתי-רשתות" },
  "ipv4-broadcast-types": { en: "Broadcast Types in IPv4", he: "סוגי שידור ב-IPv4" },
  ipv6: { en: "IPv6 Addresses", he: "כתובות IPv6" },
  "ipv6-exercise": { en: "Exercise – IPv6 Address Definitions", he: "תרגול – הגדרות כתובות IPv6" },
  "icmp-ping-traceroute": { en: "Ping and Traceroute Commands", he: "פקודות Ping ו-Traceroute" },
  "tcp-udp": { en: "TCP vs UDP & Port Numbers", he: "TCP מול UDP ומספרי יציאות" },
  "application-protocols": { en: "Application Layer Protocols", he: "פרוטוקולי שכבת היישומים" },
  "dns-http": { en: "DNS and HTTP Servers", he: "שרתי DNS ו-HTTP" },
  "email-server": { en: "Email Server", he: "שרת דואר אלקטרוני" },
  ftp: { en: "FTP Server", he: "שרת FTP" },
  "servers-exercise": { en: "Final Exercise on Servers", he: "תרגול מסכם על שרתים" },
  "telnet-router": { en: "Telnet – Remote Access to a Router", he: "Telnet – גישה מרחוק לנתב" },
  "telnet-switch": { en: "Telnet – Remote Access to a Switch + SVI", he: "Telnet – גישה מרחוק למתג + SVI" },
  "advanced-switch-router": { en: "SSH Setup & Advanced Interfaces", he: "הגדרת SSH וממשקים מתקדמים" },
  "switching-concepts": { en: "Collision & Broadcast Domains", he: "תחומי התנגשות ותחומי שידור" },
  "vlan-gui": { en: "VLAN Concept & Configuration", he: "מושג ה-VLAN והגדרתו" },
  vtp: { en: "VTP Protocol for VLAN Management", he: "פרוטוקול VTP לניהול VLAN" },
  "vlan-cli": { en: "Basic VLAN Setup – CLI", he: "הגדרות VLAN בסיסיות – CLI" },
  "router-on-stick": { en: "Router-on-a-Stick & Inter-VLAN Routing", he: "Router-on-a-Stick וניתוב Inter-VLAN" },
  "dhcp-server": { en: "DHCP Server Setup on a Router", he: "הקמת שרת DHCP על נתב" },
  dhcp: { en: "Distributing IP Addresses with DHCP", he: "חלוקת כתובות IP באמצעות DHCP" },
  "switch-security": { en: "Port Security", he: "אבטחת יציאות (Port Security)" },
  "router-security": { en: "Router Security Settings", he: "הגדרות אבטחה לנתב" },
  "wireless-basics": { en: "Wireless Concepts & Standards", he: "מושגי רשתות אלחוטיות ותקנים" },
  "wireless-router-integration": { en: "Wireless Router Setup", he: "הקמת נתב אלחוטי" },
  "routing-table": { en: "Routing Table & Decision Making", he: "טבלת ניתוב וקבלת החלטות" },
  "static-routing": { en: "Static Routing Configuration", he: "הגדרת ניתוב סטטי" },
  rip: { en: "RIP Routing Protocol", he: "פרוטוקול ניתוב RIP" },
  "tracert-rip": { en: "TraceRT + RIP Routing", he: "TraceRT + ניתוב RIP" },
  ospf: { en: "OSPF Concept & Configuration", he: "מושג ה-OSPF והגדרתו" },
  "standard-acl-1": { en: "Standard ACL Lists", he: "רשימות ACL סטנדרטיות" },
  "standard-acl-2": { en: "Extended ACL Lists", he: "רשימות ACL מורחבות" },
  nat: { en: "Static NAT and Dynamic NAT", he: "NAT סטטי ו-NAT דינמי" },
  pat: { en: "PAT Configuration (NAT Overload)", he: "הגדרת PAT (NAT Overload)" },
  "iot-basics": { en: "IoT – Basic Definitions", he: "IoT – הגדרות בסיסיות" },
  "iot-terms": { en: "IoT – Terminology", he: "IoT – מונחים" },
  "iot-wireless": { en: "IoT – Wireless Components", he: "IoT – רכיבים אלחוטיים" }
};
function sectionTitle(section) {
  var _a;
  const lang = getLang();
  return ((_a = SECTION_TITLES[section == null ? void 0 : section.id]) == null ? void 0 : _a[lang]) || (section == null ? void 0 : section.title) || "";
}
function topicTitle(topic) {
  var _a;
  const lang = getLang();
  return ((_a = TOPIC_TITLES[topic == null ? void 0 : topic.id]) == null ? void 0 : _a[lang]) || (topic == null ? void 0 : topic.title) || "";
}
function topicTitleById(topicId, fallback = "") {
  var _a;
  const lang = getLang();
  return ((_a = TOPIC_TITLES[topicId]) == null ? void 0 : _a[lang]) || fallback;
}
const iconMap$2 = { Network, Globe, Shield, Server, Radio, Cpu, Route, Tag };
function Sidebar({ onClose }) {
  const location = useLocation();
  const [expandedSections, setExpandedSections] = useState({});
  const { user } = useAuth();
  useLang();
  const isSuperAdmin = (user == null ? void 0 : user.role) === "admin";
  const isSchoolAdmin = (user == null ? void 0 : user.role) === "school_admin";
  const isAdmin = isSuperAdmin || isSchoolAdmin;
  const toggleSection = (id) => {
    setExpandedSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };
  const navItem = (to, icon, label, gradient, badge) => {
    const isActive = location.pathname === to;
    return /* @__PURE__ */ jsx("div", { className: "px-3 pt-1", children: /* @__PURE__ */ jsxs(
      Link,
      {
        to,
        onClick: onClose,
        className: `flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all text-sm font-medium group relative overflow-hidden ${isActive ? "font-bold text-primary" : "text-muted-foreground hover:text-foreground"}`,
        style: isActive ? {
          background: "rgba(47,102,144,0.1)"
        } : {},
        children: [
          !isActive && /* @__PURE__ */ jsx(
            "div",
            {
              className: "absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity",
              style: { background: "rgba(47,102,144,0.06)" }
            }
          ),
          icon,
          /* @__PURE__ */ jsx("span", { children: label }),
          badge && /* @__PURE__ */ jsx(
            "span",
            {
              className: "mr-auto text-[9px] font-black px-1.5 py-0.5 rounded-full hidden",
              style: { background: "rgba(47,102,144,0.12)", color: "#2F6690", border: "1px solid rgba(47,102,144,0.25)" },
              children: badge
            }
          )
        ]
      }
    ) });
  };
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: "w-80 h-full flex flex-col overflow-hidden",
      style: { background: "hsl(var(--sidebar-background))", borderLeft: "1px solid hsl(var(--sidebar-border))" },
      children: [
        /* @__PURE__ */ jsx("div", { className: "p-5", style: { borderBottom: "1px solid hsl(var(--sidebar-border))" }, children: /* @__PURE__ */ jsxs(Link, { to: "/", onClick: onClose, className: "flex items-center gap-3 group", children: [
          /* @__PURE__ */ jsx(
            "div",
            {
              className: "w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-105",
              style: { background: "#173F5F" },
              children: /* @__PURE__ */ jsx(BookOpen, { className: "text-white", size: 20 })
            }
          ),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h1", { className: "font-black text-foreground text-base", children: t("appName") }),
            /* @__PURE__ */ jsx("p", { className: "text-[11px] text-muted-foreground", children: t("appTagline") })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxs("div", { className: "pt-2", children: [
          navItem("/", /* @__PURE__ */ jsx(Home$1, { size: 16 }), t("navHome")),
          navItem("/network-simulator", /* @__PURE__ */ jsx(MonitorPlay, { size: 16 }), t("navSimulator")),
          navItem("/dashboard", /* @__PURE__ */ jsx(BarChart2, { size: 16 }), t("navDashboard")),
          navItem("/scenario-lab", /* @__PURE__ */ jsx(FlaskConical, { size: 16 }), t("navScenarioLab"), "linear-gradient(135deg,#7c3aed,#0891b2)", "جديد"),
          navItem("/lab-history", /* @__PURE__ */ jsx(History, { size: 16 }), t("navLabHistory")),
          navItem("/exams", /* @__PURE__ */ jsx(ClipboardList, { size: 16 }), t("navExams")),
          navItem("/settings", /* @__PURE__ */ jsx(Settings$1, { size: 16 }), t("navSettings")),
          isSuperAdmin && navItem("/admin/schools", /* @__PURE__ */ jsx(School, { size: 16 }), t("navSchools")),
          isSchoolAdmin && navItem("/admin/school-students", /* @__PURE__ */ jsx(GraduationCap, { size: 16 }), t("navMyStudents")),
          isSuperAdmin && navItem("/admin/students", /* @__PURE__ */ jsx(Users, { size: 16 }), t("navStudentReports")),
          isAdmin && navItem("/admin/exams", /* @__PURE__ */ jsx(FileText, { size: 16 }), t("navExamManage")),
          isAdmin && navItem("/admin/exam-results", /* @__PURE__ */ jsx(FileCheck, { size: 16 }), t("navExamResults"))
        ] }),
        /* @__PURE__ */ jsx("div", { className: "mx-4 my-3", style: { height: 1, background: "#E2E8F0" } }),
        /* @__PURE__ */ jsx("div", { className: "px-4 mb-2", children: /* @__PURE__ */ jsx("span", { className: "text-[10px] font-black uppercase tracking-widest", style: { color: "rgba(47,102,144,0.55)" }, children: t("courseContent") }) }),
        /* @__PURE__ */ jsx("nav", { className: "flex-1 overflow-y-auto px-3 pb-4 space-y-1", children: courseData.map((section) => {
          const Icon = iconMap$2[section.icon] || Network;
          const isExpanded = expandedSections[section.id];
          const hasActiveTopic = section.topics.some(
            (t2) => location.pathname === `/topic/${section.id}/${t2.id}`
          );
          return /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: () => toggleSection(section.id),
                className: "w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all text-sm group",
                style: {
                  color: hasActiveTopic ? "#173F5F" : "rgba(31,41,55,0.65)",
                  background: hasActiveTopic ? "rgba(47,102,144,0.08)" : "transparent",
                  border: hasActiveTopic ? "1px solid rgba(47,102,144,0.22)" : "1px solid transparent"
                },
                onMouseEnter: (e) => {
                  if (!hasActiveTopic) {
                    e.currentTarget.style.background = "rgba(47,102,144,0.05)";
                    e.currentTarget.style.color = "#173F5F";
                  }
                },
                onMouseLeave: (e) => {
                  if (!hasActiveTopic) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "rgba(31,41,55,0.65)";
                  }
                },
                children: [
                  /* @__PURE__ */ jsx(Icon, { size: 16 }),
                  /* @__PURE__ */ jsx("span", { className: "font-bold flex-1 text-right", children: sectionTitle(section) }),
                  /* @__PURE__ */ jsx(ChevronDown, { size: 14, className: `transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`, style: { color: "rgba(47,102,144,0.45)" } })
                ]
              }
            ),
            isExpanded && /* @__PURE__ */ jsx("div", { className: "mr-7 mt-1 mb-1.5 space-y-1", style: { borderRight: "2px solid rgba(47,102,144,0.2)", paddingRight: 12 }, children: section.topics.map((topic) => {
              const isActive = location.pathname === `/topic/${section.id}/${topic.id}`;
              return /* @__PURE__ */ jsx(
                Link,
                {
                  to: `/topic/${section.id}/${topic.id}`,
                  onClick: onClose,
                  className: "block px-3.5 py-2 rounded-lg text-[13px] transition-all",
                  style: {
                    background: isActive ? "rgba(47,102,144,0.12)" : "transparent",
                    color: isActive ? "#173F5F" : "rgba(31,41,55,0.6)",
                    fontWeight: isActive ? 700 : 400,
                    border: isActive ? "1px solid rgba(47,102,144,0.25)" : "1px solid transparent"
                  },
                  onMouseEnter: (e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = "rgba(47,102,144,0.05)";
                      e.currentTarget.style.color = "#173F5F";
                    }
                  },
                  onMouseLeave: (e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = "rgba(31,41,55,0.6)";
                    }
                  },
                  children: topicTitle(topic)
                },
                topic.id
              );
            }) })
          ] }, section.id);
        }) })
      ]
    }
  );
}
const SESSION_KEY = "student-session";
const SESSION_EVENT = "student-session-change";
function getStudentSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
  } catch {
    return null;
  }
}
function setStudentSession(session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  window.dispatchEvent(new Event(SESSION_EVENT));
}
function clearStudentSession() {
  localStorage.removeItem(SESSION_KEY);
  window.dispatchEvent(new Event(SESSION_EVENT));
}
function useStudentSession() {
  const [session, setSession] = useState(getStudentSession());
  useEffect(() => {
    const handler = () => setSession(getStudentSession());
    window.addEventListener(SESSION_EVENT, handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener(SESSION_EVENT, handler);
      window.removeEventListener("storage", handler);
    };
  }, []);
  return session;
}
async function studentLogin(schoolCode, studentCode) {
  const res = await base44.functions.invoke("studentLogin", { schoolCode, studentCode });
  return res.data;
}
async function studentApi(action, entity, payload = {}) {
  var _a;
  const session = getStudentSession();
  if (!session) throw new Error("No student session");
  try {
    const res = await base44.functions.invoke("studentApi", {
      session,
      action,
      entity,
      ...payload
    });
    return res.data;
  } catch (e) {
    if ((e == null ? void 0 : e.status) === 401 || ((_a = e == null ? void 0 : e.data) == null ? void 0 : _a.error) === "Invalid session") {
      clearStudentSession();
    }
    throw e;
  }
}
const CONTACT_EMAIL = "edupro.education09@gmail.com";
function ContactUsButton() {
  const { user } = useAuth();
  const session = useStudentSession();
  useLang();
  const [contactEmail, setContactEmail] = useState(CONTACT_EMAIL);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    (async () => {
      var _a;
      try {
        const rows = session ? await studentApi("filter", "SystemSetting", { query: { key: "contact_email" } }) : await base44.entities.SystemSetting.filter({ key: "contact_email" });
        if ((_a = rows == null ? void 0 : rows[0]) == null ? void 0 : _a.value) setContactEmail(rows[0].value);
      } catch {
      }
    })();
  }, [session == null ? void 0 : session.student_id]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [failed, setFailed] = useState(false);
  const [copied, setCopied] = useState(false);
  const copyEmailToClipboard = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(contactEmail);
      } else {
        const ta = document.createElement("textarea");
        ta.value = contactEmail;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
    }
  };
  const send = async () => {
    const text = message.trim();
    if (!text || busy) return;
    setBusy(true);
    setFailed(false);
    try {
      await base44.integrations.Core.SendEmail({
        to: contactEmail,
        subject: `ملاحظة عن التطبيق — ${(user == null ? void 0 : user.full_name) || (user == null ? void 0 : user.email) || (session == null ? void 0 : session.student_name) || (session == null ? void 0 : session.student_code) || "مستخدم"}`,
        body: `المرسل: ${(user == null ? void 0 : user.full_name) || (session == null ? void 0 : session.student_name) || "—"} (${(user == null ? void 0 : user.email) || (session == null ? void 0 : session.student_code) || "بدون بريد"})

الملاحظة:
${text}`
      });
      setSent(true);
      setMessage("");
      setTimeout(() => {
        setSent(false);
        setOpen(false);
      }, 2200);
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs(
      "button",
      {
        onClick: () => setOpen(true),
        title: t("contactButton"),
        className: "fixed bottom-5 left-5 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl text-xs font-black text-white transition-all hover:scale-105",
        style: { background: "#173F5F", boxShadow: "0 6px 18px rgba(23,63,95,0.25)" },
        children: [
          /* @__PURE__ */ jsx(MessageCircle, { size: 15 }),
          /* @__PURE__ */ jsx("span", { className: "hidden sm:inline", children: t("contactButton") })
        ]
      }
    ),
    /* @__PURE__ */ jsx(AnimatePresence, { children: open && /* @__PURE__ */ jsx(
      motion.div,
      {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        className: "fixed inset-0 z-[60] flex items-center justify-center p-4",
        style: { background: "rgba(2,6,23,0.75)", backdropFilter: "blur(4px)" },
        onClick: () => !busy && setOpen(false),
        children: /* @__PURE__ */ jsxs(
          motion.div,
          {
            initial: { scale: 0.92, y: 16 },
            animate: { scale: 1, y: 0 },
            exit: { scale: 0.92, opacity: 0 },
            transition: { type: "spring", duration: 0.3 },
            className: "w-full max-w-md rounded-2xl p-5",
            style: { background: "#FFFFFF", border: "1px solid #E2E8F0", boxShadow: "0 24px 60px rgba(23,63,95,0.25)" },
            onClick: (e) => e.stopPropagation(),
            dir: "rtl",
            children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-3", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsx(
                    "div",
                    {
                      className: "w-9 h-9 rounded-xl flex items-center justify-center",
                      style: { background: "#173F5F" },
                      children: /* @__PURE__ */ jsx(MessageCircle, { className: "text-white", size: 16 })
                    }
                  ),
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("h3", { className: "text-sm font-black", style: { color: "#173F5F" }, children: t("contactTitle") }),
                    /* @__PURE__ */ jsx("p", { className: "text-[10px]", style: { color: "rgba(31,41,55,0.55)" }, children: t("contactDesc") })
                  ] })
                ] }),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: () => !busy && setOpen(false),
                    className: "p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors",
                    children: /* @__PURE__ */ jsx(X, { size: 15 })
                  }
                )
              ] }),
              sent ? /* @__PURE__ */ jsxs(
                "div",
                {
                  className: "flex items-center gap-2.5 px-4 py-6 rounded-xl justify-center text-sm font-bold",
                  style: { background: "rgba(46,125,91,0.08)", border: "1px solid rgba(46,125,91,0.35)", color: "#2E7D5B" },
                  children: [
                    /* @__PURE__ */ jsx(CheckCircle2, { size: 18 }),
                    " ",
                    t("contactSent")
                  ]
                }
              ) : /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx(
                  "textarea",
                  {
                    value: message,
                    onChange: (e) => setMessage(e.target.value),
                    placeholder: t("contactPlaceholder"),
                    rows: 5,
                    dir: "rtl",
                    className: "w-full px-4 py-3 rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none resize-none mb-3",
                    style: { background: "#F7F9FC", border: "1px solid #E2E8F0" }
                  }
                ),
                failed && /* @__PURE__ */ jsxs(
                  "div",
                  {
                    className: "px-3 py-3 rounded-xl mb-3",
                    style: { background: "rgba(214,158,46,0.08)", border: "1px solid rgba(214,158,46,0.35)" },
                    children: [
                      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-[11px] font-bold mb-2", style: { color: "#D69E2E" }, children: [
                        /* @__PURE__ */ jsx(AlertTriangle, { size: 13 }),
                        " ",
                        t("contactError")
                      ] }),
                      /* @__PURE__ */ jsxs(
                        "a",
                        {
                          href: `mailto:${contactEmail}?subject=${encodeURIComponent("ملاحظة عن التطبيق — " + ((user == null ? void 0 : user.full_name) || (user == null ? void 0 : user.email) || "مستخدم"))}&body=${encodeURIComponent(message.trim())}`,
                          className: "flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-black text-white",
                          style: { background: "#D69E2E" },
                          children: [
                            /* @__PURE__ */ jsx(Send, { size: 11 }),
                            " ",
                            t("contactOpenMail")
                          ]
                        }
                      )
                    ]
                  }
                ),
                /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      onClick: () => !busy && setOpen(false),
                      className: "flex-1 py-2.5 rounded-xl text-xs font-bold transition-all hover:bg-muted",
                      style: { border: "1px solid #E2E8F0", color: "rgba(31,41,55,0.6)" },
                      children: t("contactCancel")
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      onClick: send,
                      disabled: !message.trim() || busy,
                      className: "flex-1 py-2.5 rounded-xl text-xs font-black text-white transition-all disabled:opacity-40 flex items-center justify-center gap-1.5",
                      style: { background: "#173F5F" },
                      children: busy ? /* @__PURE__ */ jsxs(Fragment, { children: [
                        /* @__PURE__ */ jsx(Loader2, { size: 12, className: "animate-spin" }),
                        " ",
                        t("contactSending")
                      ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
                        /* @__PURE__ */ jsx(Send, { size: 12 }),
                        " ",
                        t("contactSend")
                      ] })
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center gap-2 mt-3", children: [
                  /* @__PURE__ */ jsx("p", { className: "text-center text-xl truncate font-bold", style: { color: "#2F6690" }, children: contactEmail }),
                  /* @__PURE__ */ jsxs(
                    "button",
                    {
                      onClick: copyEmailToClipboard,
                      title: t("copy"),
                      className: "flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all hover:bg-muted",
                      style: { border: "1px solid rgba(47,102,144,0.3)", color: "#2F6690", background: "rgba(47,102,144,0.07)" },
                      children: [
                        copied ? /* @__PURE__ */ jsx(CheckCircle2, { size: 11 }) : /* @__PURE__ */ jsx(Copy, { size: 11 }),
                        copied ? t("copiedMsg") : t("copy")
                      ]
                    }
                  )
                ] })
              ] })
            ]
          }
        )
      }
    ) })
  ] });
}
function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  useLang();
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-background font-main", children: [
    /* @__PURE__ */ jsxs(
      "div",
      {
        className: "lg:hidden fixed top-0 right-0 left-0 z-50 flex items-center justify-between px-4 py-3",
        style: {
          background: "rgba(255,255,255,0.97)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid #E2E8F0"
        },
        children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setSidebarOpen(!sidebarOpen),
              className: "p-2 rounded-lg transition-all",
              style: { color: "#173F5F", background: "rgba(47,102,144,0.08)", border: "1px solid rgba(47,102,144,0.25)" },
              children: sidebarOpen ? /* @__PURE__ */ jsx(X, { size: 20 }) : /* @__PURE__ */ jsx(Menu, { size: 20 })
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(
              "div",
              {
                className: "w-7 h-7 rounded-lg flex items-center justify-center",
                style: { background: "#173F5F" },
                children: /* @__PURE__ */ jsx("span", { className: "text-white text-xs font-black", children: "ش" })
              }
            ),
            /* @__PURE__ */ jsx("span", { className: "font-black text-sm text-primary", children: t("appName") })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "w-10" })
        ]
      }
    ),
    sidebarOpen && /* @__PURE__ */ jsx(
      "div",
      {
        className: "lg:hidden fixed inset-0 z-40",
        style: { background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" },
        onClick: () => setSidebarOpen(false)
      }
    ),
    /* @__PURE__ */ jsx("div", { className: `fixed top-0 right-0 h-full z-40 transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"}`, children: /* @__PURE__ */ jsx(Sidebar, { onClose: () => setSidebarOpen(false) }) }),
    /* @__PURE__ */ jsx("div", { className: "lg:mr-80 pt-16 lg:pt-0", children: /* @__PURE__ */ jsx(Outlet, {}) }),
    /* @__PURE__ */ jsxs("footer", { className: "lg:mr-80 py-4 text-center text-[11px] text-white", style: { background: "#173F5F" }, children: [
      "© ",
      (/* @__PURE__ */ new Date()).getFullYear(),
      " ",
      t("footerRights")
    ] }),
    /* @__PURE__ */ jsx(ContactUsButton, {})
  ] });
}
const UserNotRegisteredError = () => {
  return /* @__PURE__ */ jsx("div", { className: "flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-white to-slate-50", children: /* @__PURE__ */ jsx("div", { className: "max-w-md w-full p-8 bg-white rounded-lg shadow-lg border border-slate-100", children: /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
    /* @__PURE__ */ jsx("div", { className: "inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-orange-100", children: /* @__PURE__ */ jsx("svg", { className: "w-8 h-8 text-orange-600", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" }) }) }),
    /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold text-slate-900 mb-4", children: "Access Restricted" }),
    /* @__PURE__ */ jsx("p", { className: "text-slate-600 mb-8", children: "You are not registered to use this application. Please contact the app administrator to request access." }),
    /* @__PURE__ */ jsxs("div", { className: "p-4 bg-slate-50 rounded-md text-sm text-slate-600", children: [
      /* @__PURE__ */ jsx("p", { children: "If you believe this is an error, you can:" }),
      /* @__PURE__ */ jsxs("ul", { className: "list-disc list-inside mt-2 space-y-1", children: [
        /* @__PURE__ */ jsx("li", { children: "Verify you are logged in with the correct account" }),
        /* @__PURE__ */ jsx("li", { children: "Contact the app administrator for access" }),
        /* @__PURE__ */ jsx("li", { children: "Try logging out and back in again" })
      ] })
    ] })
  ] }) }) });
};
const DefaultFallback = () => /* @__PURE__ */ jsx("div", { className: "fixed inset-0 flex items-center justify-center", children: /* @__PURE__ */ jsx("div", { className: "w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" }) });
function ProtectedRoute({ fallback = /* @__PURE__ */ jsx(DefaultFallback, {}), unauthenticatedElement }) {
  const { isAuthenticated, isLoadingAuth, authError } = useAuth();
  if (isLoadingAuth) {
    return fallback;
  }
  if (authError) {
    if (authError.type === "user_not_registered") {
      return /* @__PURE__ */ jsx(UserNotRegisteredError, {});
    }
    return unauthenticatedElement;
  }
  if (!isAuthenticated) {
    return unauthenticatedElement;
  }
  return /* @__PURE__ */ jsx(Outlet, {});
}
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline: "border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline"
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);
const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";
  return /* @__PURE__ */ jsx(
    Comp,
    {
      className: cn(buttonVariants({ variant, size, className })),
      ref,
      ...props
    }
  );
});
Button.displayName = "Button";
const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return /* @__PURE__ */ jsx(
    "input",
    {
      type,
      className: cn(
        "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      ),
      ref,
      ...props
    }
  );
});
Input.displayName = "Input";
const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
);
const Label = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(LabelPrimitive.Root, { ref, className: cn(labelVariants(), className), ...props }));
Label.displayName = LabelPrimitive.Root.displayName;
function AuthLayout({ icon: Icon, title, subtitle, footer, children }) {
  return /* @__PURE__ */ jsx("div", { className: "min-h-screen flex items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxs("div", { className: "w-full max-w-md", children: [
    /* @__PURE__ */ jsxs("div", { className: "text-center mb-10", children: [
      /* @__PURE__ */ jsx("div", { className: "inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary mb-4", children: /* @__PURE__ */ jsx(Icon, { className: "w-7 h-7 text-primary-foreground", "aria-hidden": "true" }) }),
      /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold tracking-tight text-foreground", children: title }),
      subtitle && /* @__PURE__ */ jsx("p", { className: "text-muted-foreground mt-2", children: subtitle })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "bg-card rounded-2xl shadow-sm border border-border p-8", children }),
    footer && /* @__PURE__ */ jsx("p", { className: "text-center text-sm text-muted-foreground mt-6", children: footer })
  ] }) });
}
function GoogleIcon({ className = "w-5 h-5" }) {
  return /* @__PURE__ */ jsxs("svg", { className, viewBox: "0 0 24 24", "aria-hidden": "true", children: [
    /* @__PURE__ */ jsx("path", { d: "M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z", fill: "#4285F4" }),
    /* @__PURE__ */ jsx("path", { d: "M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z", fill: "#34A853" }),
    /* @__PURE__ */ jsx("path", { d: "M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z", fill: "#FBBC05" }),
    /* @__PURE__ */ jsx("path", { d: "M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z", fill: "#EA4335" })
  ] });
}
function safeReturnTo() {
  const raw = new URLSearchParams(window.location.search).get("returnTo");
  if (!raw) return "/";
  try {
    const url = new URL(raw, window.location.origin);
    if (url.origin !== window.location.origin) return "/";
    for (const p of ["access_token", "clear_access_token", "app_id", "app_base_url", "functions_version", "from_url"]) {
      url.searchParams.delete(p);
    }
    const path = url.pathname + url.search;
    if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) return "/";
    return path;
  } catch {
    return "/";
  }
}
function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const returnTo = safeReturnTo();
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await base44.auth.loginViaEmailPassword(email, password);
      window.location.href = returnTo;
    } catch (err) {
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };
  const handleGoogle = () => {
    base44.auth.loginWithProvider("google", returnTo);
  };
  return /* @__PURE__ */ jsxs(
    AuthLayout,
    {
      icon: LogIn,
      title: "Welcome back",
      subtitle: "Log in to your account",
      footer: /* @__PURE__ */ jsxs(Fragment, { children: [
        "Don't have an account?",
        " ",
        /* @__PURE__ */ jsx(
          Link,
          {
            to: "/register" + (returnTo !== "/" ? "?returnTo=" + encodeURIComponent(returnTo) : ""),
            className: "text-primary font-medium hover:underline",
            children: "Create one"
          }
        )
      ] }),
      children: [
        /* @__PURE__ */ jsxs(
          Button,
          {
            variant: "outline",
            className: "w-full h-12 text-sm font-medium mb-6",
            onClick: handleGoogle,
            children: [
              /* @__PURE__ */ jsx(GoogleIcon, { className: "w-5 h-5 mr-2" }),
              "Continue with Google"
            ]
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "relative mb-6", children: [
          /* @__PURE__ */ jsx("div", { className: "absolute inset-0 flex items-center", children: /* @__PURE__ */ jsx("div", { className: "w-full border-t border-border" }) }),
          /* @__PURE__ */ jsx("div", { className: "relative flex justify-center text-xs uppercase", children: /* @__PURE__ */ jsx("span", { className: "bg-card px-3 text-muted-foreground", children: "or" }) })
        ] }),
        error && /* @__PURE__ */ jsx("div", { className: "mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm", children: error }),
        /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "email", children: "Email" }),
            /* @__PURE__ */ jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsx(Mail, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground", "aria-hidden": "true" }),
              /* @__PURE__ */ jsx(
                Input,
                {
                  id: "email",
                  type: "email",
                  autoComplete: "email",
                  autoFocus: true,
                  placeholder: "you@example.com",
                  value: email,
                  onChange: (e) => setEmail(e.target.value),
                  className: "pl-10 h-12",
                  required: true
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "password", children: "Password" }),
              /* @__PURE__ */ jsx(Link, { to: "/forgot-password", className: "text-xs text-primary hover:underline", children: "Forgot password?" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsx(Lock, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground", "aria-hidden": "true" }),
              /* @__PURE__ */ jsx(
                Input,
                {
                  id: "password",
                  type: "password",
                  autoComplete: "current-password",
                  placeholder: "••••••••",
                  value: password,
                  onChange: (e) => setPassword(e.target.value),
                  className: "pl-10 h-12",
                  required: true
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsx(Button, { type: "submit", className: "w-full h-12 font-medium", disabled: loading, children: loading ? /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(Loader2, { className: "w-4 h-4 mr-2 animate-spin" }),
            "Logging in..."
          ] }) : "Log in" })
        ] })
      ]
    }
  );
}
د;
const InputOTP = React.forwardRef(({ className, containerClassName, ...props }, ref) => /* @__PURE__ */ jsx(
  OTPInput,
  {
    ref,
    containerClassName: cn("flex items-center gap-2 has-[:disabled]:opacity-50", containerClassName),
    className: cn("disabled:cursor-not-allowed", className),
    ...props
  }
));
InputOTP.displayName = "InputOTP";
const InputOTPGroup = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx("div", { ref, className: cn("flex items-center", className), ...props }));
InputOTPGroup.displayName = "InputOTPGroup";
const InputOTPSlot = React.forwardRef(({ index, className, ...props }, ref) => {
  const inputOTPContext = React.useContext(OTPInputContext);
  const { char, hasFakeCaret, isActive } = inputOTPContext.slots[index];
  return /* @__PURE__ */ jsxs(
    "div",
    {
      ref,
      className: cn(
        "relative flex h-9 w-9 items-center justify-center border-y border-r border-input text-sm shadow-sm transition-all first:rounded-l-md first:border-l last:rounded-r-md",
        isActive && "z-10 ring-1 ring-ring",
        className
      ),
      ...props,
      children: [
        char,
        hasFakeCaret && /* @__PURE__ */ jsx(
          "div",
          {
            className: "pointer-events-none absolute inset-0 flex items-center justify-center",
            children: /* @__PURE__ */ jsx("div", { className: "h-4 w-px animate-caret-blink bg-foreground duration-1000" })
          }
        )
      ]
    }
  );
});
InputOTPSlot.displayName = "InputOTPSlot";
const InputOTPSeparator = React.forwardRef(({ ...props }, ref) => /* @__PURE__ */ jsx("div", { ref, role: "separator", ...props, children: /* @__PURE__ */ jsx(Minus, {}) }));
InputOTPSeparator.displayName = "InputOTPSeparator";
function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await base44.auth.register({ email, password });
      setShowOtp(true);
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };
  const handleVerify = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await base44.auth.verifyOtp({ email, otpCode });
      if (result == null ? void 0 : result.access_token) {
        base44.auth.setToken(result.access_token);
      }
      window.location.href = safeReturnTo();
    } catch (err) {
      setError(err.message || "Invalid verification code");
    } finally {
      setLoading(false);
    }
  };
  const handleResend = async () => {
    setError("");
    try {
      await base44.auth.resendOtp(email);
      toast({
        title: "Code sent",
        description: "Check your email for the new code."
      });
    } catch (err) {
      setError(err.message || "Failed to resend code");
    }
  };
  const handleGoogle = () => {
    base44.auth.loginWithProvider("google", safeReturnTo());
  };
  if (showOtp) {
    return /* @__PURE__ */ jsxs(
      AuthLayout,
      {
        icon: Mail,
        title: "Verify your email",
        subtitle: `We sent a code to ${email}`,
        children: [
          error && /* @__PURE__ */ jsx("div", { className: "mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm", children: error }),
          /* @__PURE__ */ jsx("div", { className: "flex justify-center mb-6", children: /* @__PURE__ */ jsx(
            InputOTP,
            {
              maxLength: 6,
              value: otpCode,
              onChange: setOtpCode,
              autoFocus: true,
              autoComplete: "one-time-code",
              children: /* @__PURE__ */ jsxs(InputOTPGroup, { children: [
                /* @__PURE__ */ jsx(InputOTPSlot, { index: 0 }),
                /* @__PURE__ */ jsx(InputOTPSlot, { index: 1 }),
                /* @__PURE__ */ jsx(InputOTPSlot, { index: 2 }),
                /* @__PURE__ */ jsx(InputOTPSlot, { index: 3 }),
                /* @__PURE__ */ jsx(InputOTPSlot, { index: 4 }),
                /* @__PURE__ */ jsx(InputOTPSlot, { index: 5 })
              ] })
            }
          ) }),
          /* @__PURE__ */ jsx(
            Button,
            {
              className: "w-full h-12 font-medium",
              onClick: handleVerify,
              disabled: loading || otpCode.length < 6,
              children: loading ? /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx(Loader2, { className: "w-4 h-4 mr-2 animate-spin" }),
                "Verifying..."
              ] }) : "Verify"
            }
          ),
          /* @__PURE__ */ jsxs("p", { className: "text-center text-sm text-muted-foreground mt-4", children: [
            "Didn't receive the code?",
            " ",
            /* @__PURE__ */ jsx("button", { onClick: handleResend, className: "text-primary font-medium hover:underline", children: "Resend" })
          ] })
        ]
      }
    );
  }
  return /* @__PURE__ */ jsxs(
    AuthLayout,
    {
      icon: UserPlus,
      title: "Create your account",
      subtitle: "Sign up to get started",
      footer: /* @__PURE__ */ jsxs(Fragment, { children: [
        "Already have an account?",
        " ",
        /* @__PURE__ */ jsx(
          Link,
          {
            to: "/login" + (safeReturnTo() !== "/" ? "?returnTo=" + encodeURIComponent(safeReturnTo()) : ""),
            className: "text-primary font-medium hover:underline",
            children: "Log in"
          }
        )
      ] }),
      children: [
        /* @__PURE__ */ jsxs(
          Button,
          {
            variant: "outline",
            className: "w-full h-12 text-sm font-medium mb-6",
            onClick: handleGoogle,
            children: [
              /* @__PURE__ */ jsx(GoogleIcon, { className: "w-5 h-5 mr-2" }),
              "Continue with Google"
            ]
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "relative mb-6", children: [
          /* @__PURE__ */ jsx("div", { className: "absolute inset-0 flex items-center", children: /* @__PURE__ */ jsx("div", { className: "w-full border-t border-border" }) }),
          /* @__PURE__ */ jsx("div", { className: "relative flex justify-center text-xs uppercase", children: /* @__PURE__ */ jsx("span", { className: "bg-card px-3 text-muted-foreground", children: "or" }) })
        ] }),
        error && /* @__PURE__ */ jsx("div", { className: "mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm", children: error }),
        /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "email", children: "Email" }),
            /* @__PURE__ */ jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsx(Mail, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground", "aria-hidden": "true" }),
              /* @__PURE__ */ jsx(
                Input,
                {
                  id: "email",
                  type: "email",
                  autoComplete: "email",
                  autoFocus: true,
                  placeholder: "you@example.com",
                  value: email,
                  onChange: (e) => setEmail(e.target.value),
                  className: "pl-10 h-12",
                  required: true
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "password", children: "Password" }),
            /* @__PURE__ */ jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsx(Lock, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground", "aria-hidden": "true" }),
              /* @__PURE__ */ jsx(
                Input,
                {
                  id: "password",
                  type: "password",
                  autoComplete: "new-password",
                  placeholder: "••••••••",
                  value: password,
                  onChange: (e) => setPassword(e.target.value),
                  className: "pl-10 h-12",
                  required: true
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "confirm", children: "Confirm Password" }),
            /* @__PURE__ */ jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsx(Lock, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground", "aria-hidden": "true" }),
              /* @__PURE__ */ jsx(
                Input,
                {
                  id: "confirm",
                  type: "password",
                  autoComplete: "new-password",
                  placeholder: "••••••••",
                  value: confirmPassword,
                  onChange: (e) => setConfirmPassword(e.target.value),
                  className: "pl-10 h-12",
                  required: true
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsx(Button, { type: "submit", className: "w-full h-12 font-medium", disabled: loading, children: loading ? /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(Loader2, { className: "w-4 h-4 mr-2 animate-spin" }),
            "Creating account..."
          ] }) : "Create account" })
        ] })
      ]
    }
  );
}
function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await base44.auth.resetPasswordRequest(email);
    } catch {
    } finally {
      setLoading(false);
      setSent(true);
    }
  };
  return /* @__PURE__ */ jsx(
    AuthLayout,
    {
      icon: Mail,
      title: "Reset password",
      subtitle: "We'll send you a link to reset it",
      footer: /* @__PURE__ */ jsxs(Link, { to: "/login", className: "text-primary font-medium hover:underline", children: [
        /* @__PURE__ */ jsx(ArrowLeft, { className: "w-3 h-3 inline mr-1" }),
        "Back to log in"
      ] }),
      children: sent ? /* @__PURE__ */ jsx("p", { className: "text-sm text-foreground text-center", children: "If an account exists with that email, you'll receive a password reset link shortly." }) : /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "email", children: "Email address" }),
          /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsx(Mail, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground", "aria-hidden": "true" }),
            /* @__PURE__ */ jsx(
              Input,
              {
                id: "email",
                type: "email",
                autoComplete: "email",
                autoFocus: true,
                placeholder: "you@example.com",
                value: email,
                onChange: (e) => setEmail(e.target.value),
                className: "pl-10 h-12",
                required: true
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsx(Button, { type: "submit", className: "w-full h-12 font-medium", disabled: loading, children: loading ? /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(Loader2, { className: "w-4 h-4 mr-2 animate-spin" }),
          "Sending..."
        ] }) : "Send reset link" })
      ] })
    }
  );
}
function ResetPassword() {
  const [searchParams] = useSearchParams();
  const resetToken = searchParams.get("token");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await base44.auth.resetPassword({ resetToken, newPassword });
      window.location.href = "/login";
    } catch (err) {
      setError(err.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };
  if (!resetToken) {
    return /* @__PURE__ */ jsx(
      AuthLayout,
      {
        icon: AlertTriangle,
        title: "Invalid reset link",
        subtitle: "This password reset link is missing or invalid",
        footer: /* @__PURE__ */ jsx(Link, { to: "/forgot-password", className: "text-primary font-medium hover:underline", children: "Request a new link" }),
        children: /* @__PURE__ */ jsx("p", { className: "text-sm text-foreground text-center", children: "The link you used appears to be incomplete. Please request a new password reset email." })
      }
    );
  }
  return /* @__PURE__ */ jsxs(
    AuthLayout,
    {
      icon: Lock,
      title: "New password",
      subtitle: "Enter your new password below",
      children: [
        error && /* @__PURE__ */ jsx("div", { className: "mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm", children: error }),
        /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "password", children: "New Password" }),
            /* @__PURE__ */ jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsx(Lock, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground", "aria-hidden": "true" }),
              /* @__PURE__ */ jsx(
                Input,
                {
                  id: "password",
                  type: "password",
                  autoComplete: "new-password",
                  autoFocus: true,
                  placeholder: "••••••••",
                  value: newPassword,
                  onChange: (e) => setNewPassword(e.target.value),
                  className: "pl-10 h-12",
                  required: true
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "confirm", children: "Confirm Password" }),
            /* @__PURE__ */ jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsx(Lock, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground", "aria-hidden": "true" }),
              /* @__PURE__ */ jsx(
                Input,
                {
                  id: "confirm",
                  type: "password",
                  autoComplete: "new-password",
                  placeholder: "••••••••",
                  value: confirmPassword,
                  onChange: (e) => setConfirmPassword(e.target.value),
                  className: "pl-10 h-12",
                  required: true
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsx(Button, { type: "submit", className: "w-full h-12 font-medium", disabled: loading, children: loading ? /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(Loader2, { className: "w-4 h-4 mr-2 animate-spin" }),
            "Resetting..."
          ] }) : "Reset password" })
        ] })
      ]
    }
  );
}
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}
const iconMap$1 = { Network, Globe, Shield, Server, Radio, Cpu, Route, Tag };
function CategoryCard({ section, index }) {
  useLang();
  const Icon = iconMap$1[section.icon] || Network;
  return /* @__PURE__ */ jsx(
    motion.div,
    {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { delay: index * 0.07, duration: 0.4 },
      children: /* @__PURE__ */ jsxs(
        "div",
        {
          className: "group rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 cursor-default bg-white",
          style: { border: "1px solid #E2E8F0" },
          onMouseEnter: (e) => {
            e.currentTarget.style.border = "1px solid #3A86A8";
            e.currentTarget.style.boxShadow = "0 6px 18px rgba(23,63,95,0.08)";
          },
          onMouseLeave: (e) => {
            e.currentTarget.style.border = "1px solid #E2E8F0";
            e.currentTarget.style.boxShadow = "none";
          },
          children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between mb-4", children: [
              /* @__PURE__ */ jsx("div", { className: "w-11 h-11 rounded-xl flex items-center justify-center", style: { background: "#2F6690" }, children: /* @__PURE__ */ jsx(Icon, { className: "text-white", size: 20 }) }),
              /* @__PURE__ */ jsxs(
                "span",
                {
                  className: "text-[10px] font-bold px-2.5 py-1 rounded-full",
                  style: { background: "rgba(47,102,144,0.08)", color: "#2F6690", border: "1px solid rgba(47,102,144,0.2)" },
                  children: [
                    section.topics.length,
                    " ",
                    t("lessonWord")
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsx("h3", { className: "font-black text-base mb-3", style: { color: "#173F5F" }, children: sectionTitle(section) }),
            /* @__PURE__ */ jsx("div", { className: "space-y-0.5", children: section.topics.map((topic) => /* @__PURE__ */ jsxs(
              Link,
              {
                to: `/topic/${section.id}/${topic.id}`,
                className: "flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-all group/item",
                style: { color: "rgba(31,41,55,0.65)" },
                onMouseEnter: (e) => {
                  e.currentTarget.style.background = "rgba(47,102,144,0.07)";
                  e.currentTarget.style.color = "#173F5F";
                },
                onMouseLeave: (e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "rgba(31,41,55,0.65)";
                },
                children: [
                  /* @__PURE__ */ jsx("div", { className: "w-1 h-1 rounded-full flex-shrink-0", style: { background: "rgba(47,102,144,0.5)" } }),
                  /* @__PURE__ */ jsx("span", { className: "text-xs flex-1", children: topicTitle(topic) }),
                  /* @__PURE__ */ jsx(ArrowLeft, { size: 11, className: "opacity-0 group-hover/item:opacity-100 transition-opacity", style: { color: "#2F6690" } })
                ]
              },
              topic.id
            )) })
          ]
        }
      )
    }
  );
}
function Home() {
  useLang();
  courseData.reduce((sum, s) => sum + s.topics.length, 0);
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen", children: [
    /* @__PURE__ */ jsxs("div", { className: "relative overflow-hidden", style: { background: "#F7F9FC" }, children: [
      /* @__PURE__ */ jsx(
        "div",
        {
          className: "absolute inset-0",
          style: {
            backgroundImage: `linear-gradient(rgba(47,102,144,0.05) 1px, transparent 1px),
              linear-gradient(90deg, rgba(47,102,144,0.05) 1px, transparent 1px)`,
            backgroundSize: "48px 48px"
          }
        }
      ),
      /* @__PURE__ */ jsx("div", { className: "absolute -top-20 -left-20 w-72 h-72 rounded-full pointer-events-none", style: { background: "rgba(58,134,168,0.06)" } }),
      /* @__PURE__ */ jsx("div", { className: "absolute -bottom-24 -right-16 w-80 h-80 rounded-full pointer-events-none", style: { background: "rgba(47,102,144,0.05)" } }),
      /* @__PURE__ */ jsxs("div", { className: "absolute inset-0 pointer-events-none overflow-hidden", children: [
        [
          { x: "10%", y: "22%", delay: 0 },
          { x: "85%", y: "18%", delay: 0.5 },
          { x: "76%", y: "68%", delay: 1 },
          { x: "18%", y: "74%", delay: 1.5 },
          { x: "50%", y: "12%", delay: 0.8 },
          { x: "90%", y: "45%", delay: 0.3 }
        ].map(
          (dot, i) => /* @__PURE__ */ jsx(
            motion.div,
            {
              style: { position: "absolute", left: dot.x, top: dot.y },
              animate: { y: [0, -10, 0], opacity: [0.35, 0.65, 0.35] },
              transition: { duration: 4 + i * 0.5, repeat: Infinity, delay: dot.delay, ease: "easeInOut" },
              children: /* @__PURE__ */ jsx("div", { className: "w-2 h-2 rounded-full", style: { background: "rgba(58,134,168,0.5)" } })
            },
            i
          )
        ),
        /* @__PURE__ */ jsxs("svg", { className: "absolute inset-0 w-full h-full opacity-20", children: [
          /* @__PURE__ */ jsx("line", { x1: "10%", y1: "22%", x2: "50%", y2: "12%", stroke: "#2F6690", strokeWidth: "1" }),
          /* @__PURE__ */ jsx("line", { x1: "50%", y1: "12%", x2: "85%", y2: "18%", stroke: "#2F6690", strokeWidth: "1" }),
          /* @__PURE__ */ jsx("line", { x1: "85%", y1: "18%", x2: "90%", y2: "45%", stroke: "#2F6690", strokeWidth: "1" }),
          /* @__PURE__ */ jsx("line", { x1: "90%", y1: "45%", x2: "76%", y2: "68%", stroke: "#3A86A8", strokeWidth: "1" }),
          /* @__PURE__ */ jsx("line", { x1: "18%", y1: "74%", x2: "76%", y2: "68%", stroke: "#3A86A8", strokeWidth: "1" }),
          /* @__PURE__ */ jsx("line", { x1: "10%", y1: "22%", x2: "18%", y2: "74%", stroke: "#173F5F", strokeWidth: "1" })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "relative max-w-5xl mx-auto px-6 py-16 lg:py-24", children: /* @__PURE__ */ jsxs(
        motion.div,
        {
          initial: { opacity: 0, y: 24 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.6 },
          className: "text-center",
          children: [
            /* @__PURE__ */ jsx(
              motion.div,
              {
                initial: { opacity: 0, scale: 0.9 },
                animate: { opacity: 1, scale: 1 },
                transition: { delay: 0.1 },
                className: "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6",
                style: { background: "rgba(47,102,144,0.08)", border: "1px solid rgba(47,102,144,0.2)", color: "#2F6690" },
                children: t("homeHeroBadge")
              }
            ),
            /* @__PURE__ */ jsxs("h1", { className: "text-4xl sm:text-5xl lg:text-6xl font-black mb-5 leading-tight", style: { color: "#173F5F" }, children: [
              t("homeHeroTitleA"),
              " ",
              /* @__PURE__ */ jsx("span", { style: { color: "#2F6690" }, children: t("homeHeroTitleB") })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-base sm:text-lg max-w-2xl mx-auto leading-relaxed mb-6", style: { color: "#1F2937" }, children: t("homeHeroDesc") }),
            /* @__PURE__ */ jsx("p", { className: "text-xs mb-10", style: { color: "rgba(31,41,55,0.55)" }, dir: "rtl", children: "عمل الطلاب: عبد الله أبو الهوى ، امير دراويش" }),
            /* @__PURE__ */ jsx("p", { className: "mb-10 text-xl", style: { color: "rgba(31,41,55,0.55)" }, dir: "rtl", children: "EDUPRO+" })
          ]
        }
      ) })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "max-w-5xl mx-auto px-6 pt-10", children: /* @__PURE__ */ jsx(
      motion.div,
      {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { delay: 0.2 },
        children: /* @__PURE__ */ jsx(Link, { to: "/network-simulator", children: /* @__PURE__ */ jsx(
          "div",
          {
            className: "rounded-2xl p-6 transition-all group cursor-pointer bg-white hover:shadow-lg",
            style: { border: "1px solid #E2E8F0" },
            children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
                /* @__PURE__ */ jsx("div", { className: "w-14 h-14 rounded-2xl flex items-center justify-center", style: { background: "#173F5F" }, children: /* @__PURE__ */ jsx(MonitorPlay, { className: "text-white", size: 26 }) }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2 mb-1", children: /* @__PURE__ */ jsx("h3", { className: "font-black text-lg", style: { color: "#173F5F" }, children: t("simCTATitle") }) }),
                  /* @__PURE__ */ jsx("p", { className: "text-sm", style: { color: "#1F2937" }, children: t("simCTADesc") })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 group-hover:gap-3 transition-all", style: { color: "#2F6690" }, children: [
                /* @__PURE__ */ jsx("span", { className: "text-sm font-medium hidden sm:block", children: t("startNow") }),
                /* @__PURE__ */ jsx(ArrowLeft, { size: 20 })
              ] })
            ] })
          }
        ) })
      }
    ) }),
    /* @__PURE__ */ jsx("div", { className: "max-w-5xl mx-auto px-6 pt-10 pb-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsx("div", { className: "w-1 h-6 rounded-full", style: { background: "#173F5F" } }),
      /* @__PURE__ */ jsx("h2", { className: "text-lg font-bold text-foreground", children: t("courseTopicsTitle") })
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "max-w-5xl mx-auto px-6 pb-20", children: /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-5", children: courseData.map(
      (section, index) => /* @__PURE__ */ jsx(CategoryCard, { section, index }, section.id)
    ) }) })
  ] });
}
const NEW_UNIT_QUIZZES = {
  "network-components": {
    title: "اختبار: مكونات الشبكة الأساسية",
    questions: [
      {
        question: "ما الفرق بين End Device و Intermediary Device؟",
        options: ["لا فرق", "End Device مصدر أو وجهة للبيانات، Intermediary ينقلها", "End Device أسرع", "Intermediary يعمل بلا كهرباء"],
        correct: 1,
        explanation: "أجهزة النهاية (PC, Printer) هي مصدر أو وجهة البيانات، أما الأجهزة الوسيطة (Router, Switch) فتنقل وتوجه البيانات."
      },
      {
        question: "ما الفرق بين شبكة LAN و WAN؟",
        options: ["LAN عالمية و WAN محلية", "LAN محلية بمبنى واحد و WAN تغطي مناطق جغرافية واسعة", "LAN لاسلكية فقط", "WAN أبطأ دائماً"],
        correct: 1,
        explanation: "LAN تغطي مساحة محدودة كمبنى أو مكتب، بينما WAN تربط شبكات LAN عبر مسافات جغرافية واسعة."
      },
      {
        question: "ما الفرق بين بنية Peer-to-Peer و Client-Server؟",
        options: ["لا فرق", "P2P الأجهزة تتصل مباشرة ببعضها، Client-Server عبر خادم مركزي", "Client-Server أرخص", "P2P تحتاج خادماً"],
        correct: 1,
        explanation: "في P2P كل جهاز يلعب دوري المرسل والمستقبل، أما Client-Server فيكون هناك خادم مركزي يقدم الخدمات."
      },
      {
        question: "ما وظيفة برنامج Cisco Packet Tracer؟",
        options: ["تصفح الإنترنت", "محاكاة الشبكات واختبارها قبل تنفيذها فعلياً", "إدارة الخوادم", "تشفير البيانات"],
        correct: 1,
        explanation: "Packet Tracer محاكي شبكات يتيح تصميم الشبكات واختبارها وتجربة الإعدادات بدون معدات حقيقية."
      },
      {
        question: "ما الفرق بين الطوبولوجيا الفيزيائية والمنطقية؟",
        options: ["لا فرق", "الفيزيائية ترتيب الكابلات والأجهزة فعلياً، المنطقية طريقة تدفق البيانات", "المنطقية أوضح دائماً", "الفيزيائية للشبكات الصغيرة فقط"],
        correct: 1,
        explanation: "الطوبولوجيا الفيزيائية تصف الترتيب المادي، بينما المنطقية تصف مسار البيانات الفعلي وقد تختلف عنها."
      }
    ]
  },
  "packet-tracer-intro": {
    title: "اختبار: برنامج Packet Tracer",
    questions: [
      {
        question: "ما الفرق بين Realtime Mode و Simulation Mode؟",
        options: ["لا فرق", "Realtime فوري كالواقع، Simulation يعرض الحزم خطوة بخطوة", "Simulation أسرع", "Realtime للمحاكاة فقط"],
        correct: 1,
        explanation: "Realtime يحاكي عمل الشبكة الفوري، أما Simulation فيُوقف الحزم ويعرض رحلتها طبقة بطبقة — مثالي للتعلم."
      },
      {
        question: "أي كابل يُستخدم لتوصيل PC بـ Switch مباشرة؟",
        options: ["Crossover", "Copper Straight-through", "Serial", "Fiber"],
        correct: 1,
        explanation: "كابل Straight-through يُستخدم لتوصيل الأجهزة الطرفية بالمحولات؛ Crossover كان يُستخدم بين جهازين متشابهين."
      },
      {
        question: "ما الهدف من Logical Workspace؟",
        options: ["عرض المبنى الفيزيائي", "تصميم الشبكة منطقياً بالرموز والخطوط", "تشغيل التطبيقات", "طباعة التصميم"],
        correct: 1,
        explanation: "Logical Workspace يعرض الشبكة كمخطط منطقي بالرموز، بينما Physical Workspace يعرضها في بيئة مبنية حقيقية."
      },
      {
        question: "ما الخطوة الأخيرة بعد توصيل جهازين في Packet Tracer؟",
        options: ["طباعة التصميم", "اختبار الاتصال بأمر ping", "حفظ الصورة", "إيقاف البرنامج"],
        correct: 1,
        explanation: "بعد التوصيل وإدخال عناوين IP، يتم اختبار الاتصال بين الجهازين باستخدام الأمر ping."
      }
    ]
  },
  "ios-access-modes": {
    title: "اختبار: أوضاع الوصول إلى IOS",
    questions: [
      {
        question: "ما هو الرمز الذي يسبق الأوامر في Privileged EXEC Mode؟",
        options: ["Router>", "Router#", "Router(config)#", "Router(config-if)#"],
        correct: 1,
        explanation: "علامة # تدل على وضع الامتياز (Privileged EXEC) حيث تتوفر أوامر الفحص والإدارة."
      },
      {
        question: "ما الأمر للانتقال من User EXEC إلى وضع الامتياز؟",
        options: ["config t", "enable", "exit", "login"],
        correct: 1,
        explanation: "الأمر enable ينقل من وضع المستخدم (>) إلى وضع الامتياز (#)."
      },
      {
        question: "في أي وضع يظهر السطر Router(config-if)#؟",
        options: ["الإعداد العام", "إعداد الواجهة", "إعداد الخطوط", "وضع المستخدم"],
        correct: 1,
        explanation: "config-if يعني أنك داخل وضع إعداد واجهة محددة بعد الأمر interface."
      },
      {
        question: "ما وظيفة علامة الاستفهام (?) في IOS؟",
        options: ["إلغاء الأمر", "عرض الأوامر المتاحة في الموضع الحالي", "الخروج", "حفظ الإعدادات"],
        correct: 1,
        explanation: "كتابة ? تعرض قائمة بكل الأوامر الممكنة في موضع المؤشر الحالي — أداة تعلم أساسية."
      },
      {
        question: "أي بروتوكول وصول عن بُعد يُشفر البيانات؟",
        options: ["Telnet", "SSH", "HTTP", "TFTP"],
        correct: 1,
        explanation: "SSH يُشفر جميع البيانات المتبادلة، بينما Telnet يُرسلها بنص واضح بما فيه كلمات المرور."
      }
    ]
  },
  "ios-initial-config": {
    title: "اختبار: الإعدادات الأولية",
    questions: [
      {
        question: "أين يُخزن startup-config؟",
        options: ["RAM", "NVRAM", "Flash", "ROM"],
        correct: 1,
        explanation: "startup-config يُخزن في NVRAM ويبقى بعد إعادة التشغيل، بينما running-config في RAM ويزول بانقطاع الطاقة."
      },
      {
        question: "ما الأمر لحفظ الإعدادات الحالية؟",
        options: ["save config", "copy running-config startup-config", "write memory only", "store config"],
        correct: 1,
        explanation: "copy running-config startup-config ينسخ الإعداد النشط من RAM إلى NVRAM ليُحفظ بعد إعادة التشغيل."
      },
      {
        question: "ما وظيفة الأمر service password-encryption؟",
        options: ["إنشاء كلمات مرور", "تشفير كلمات المرور الظاهرة بنص واضح", "حذف كلمات المرور", "توليد مفاتيح RSA"],
        correct: 1,
        explanation: "هذا الأمر يُشفر جميع كلمات المرور المخزنة بنص واضح في ملف الإعداد."
      },
      {
        question: "ما أمر إعطاء المحول عنوان IP للإدارة؟",
        options: ["ip address على المنفذ الفيزيائي", "interface vlan 1 ثم ip address", "ip management address", "switchport ip"],
        correct: 1,
        explanation: "المحول يُدار عبر SVI — ندخل interface vlan 1 ونُعين له عنوان IP مع ip default-gateway."
      },
      {
        question: "ما الأمر لعرض ملخص الواجهات وعناوينها؟",
        options: ["show interfaces all", "show ip interface brief", "display interfaces", "show ports"],
        correct: 1,
        explanation: "show ip interface brief يعرض جدولاً مختصراً بكل الواجهات وعناوينها وحالتها."
      }
    ]
  },
  "osi-tcpip-models": {
    title: "اختبار: نموذجا OSI و TCP/IP",
    questions: [
      {
        question: "كم عدد طبقات نموذج OSI؟",
        options: ["4", "5", "7", "9"],
        correct: 2,
        explanation: "OSI يتكون من 7 طبقات: Application, Presentation, Session, Transport, Network, Data Link, Physical."
      },
      {
        question: "ما وحدة البيانات (PDU) في طبقة Network؟",
        options: ["Frame", "Packet", "Segment", "Bits"],
        correct: 1,
        explanation: "الترتيب: Transport=Segment، Network=Packet، Data Link=Frame، Physical=Bits."
      },
      {
        question: "أي طبقة مسؤولة عن التوجيه (Routing)؟",
        options: ["Transport", "Network", "Session", "Physical"],
        correct: 1,
        explanation: "طبقة الشبكة (Network - Layer 3) مسؤولة عن التوجيه والعنونة المنطقية بعناوين IP."
      },
      {
        question: "طبقة Internet في نموذج TCP/IP تعادل أي طبقة في OSI؟",
        options: ["Transport", "Network", "Application", "Data Link"],
        correct: 1,
        explanation: "طبقة Internet في TCP/IP تعادل طبقة Network في OSI وتقوم بنفس وظيفة التوجيه عبر IP."
      },
      {
        question: "ماذا يحدث للرؤوس (Headers) عند استقبال البيانات؟",
        options: ["تُضاف طبقة بطبقة", "تُزال طبقة بطبقة (De-encapsulation)", "تبقى كما هي", "تُشفّر من جديد"],
        correct: 1,
        explanation: "عند الاستقبال تُزال رؤوس الطبقات تدريجياً من الأسفل للأعلى حتى تصل البيانات الصافية للتطبيق."
      }
    ]
  },
  "physical-media": {
    title: "اختبار: وسائط الطبقة الفيزيائية",
    questions: [
      {
        question: "ما أقصى مسافة لكابل UTP؟",
        options: ["10 أمتار", "100 متر", "2 كم", "100 كم"],
        correct: 1,
        explanation: "كابلات النحاس UTP تعمل لمسافة 100 متر كحد أقصى قبل ضعف الإشارة."
      },
      {
        question: "ما الفرق بين Single-mode و Multi-mode في الألياف؟",
        options: ["لا فرق", "Single-mode لمسافات طويلة جداً و Multi-mode لمسافات قصيرة", "Multi-mode أسرع", "Single-mode أرخص"],
        correct: 1,
        explanation: "Single-mode يستخدم نبضة ضوئية واحدة لمسافات تصل لكيلومترات، وMulti-mode عدة أنماط لمسافات أقصر."
      },
      {
        question: "ميزة Auto-MDIX في المحولات الحديثة؟",
        options: ["زيادة السرعة", "كشف نوع الكابل تلقائياً (Straight/Crossover)", "التشفير", "توفير الطاقة"],
        correct: 1,
        explanation: "Auto-MDIX تجعل المحول يكتشف نوع الكابل تلقائياً فلا حاجة للتمييز بين Straight-through و Crossover."
      },
      {
        question: "لماذا تُستخدم كابلات STP بدلاً من UTP في المصانع؟",
        options: ["أرخص", "محمية ضد التشويش الكهرومغناطيسي", "أطول", "أسهل في التركيب"],
        correct: 1,
        explanation: "STP تحتوي على طبقة درع معدنية تحمي من التشويش الكهرومغناطيسي الشائع في البيئات الصناعية."
      },
      {
        question: "ما الفرق بين Bandwidth و Throughput؟",
        options: ["نفس الشيء", "Bandwidth السعة النظرية و Throughput السرعة الفعلية", "Throughput نظري", "Bandwidth لاسلكي فقط"],
        correct: 1,
        explanation: "Bandwidth هي السعة النظرية للوصلة، أما Throughput فهي معدل النقل الفعلي بعد الحساب بالأعباء والفقد."
      }
    ]
  },
  "binary-system": {
    title: "اختبار: أنظمة العد والترقيم",
    questions: [
      {
        question: "ما قيمة 11000000 بالنظام العشري؟",
        options: ["128", "192", "224", "255"],
        correct: 1,
        explanation: "11000000 = 128 + 64 = 192. القيم المضاءة: البت الأول (128) والثاني (64)."
      },
      {
        question: "كم بت في الـ Octet الواحد؟",
        options: ["4", "8", "16", "32"],
        correct: 1,
        explanation: "الـ Octet هو 8 بتات، وعنوان IPv4 يتكون من 4 Octets أي 32 بت."
      },
      {
        question: "ما قيمة FF بالنظام العشري؟",
        options: ["15", "16", "255", "256"],
        correct: 2,
        explanation: "FF في السداسي عشري = 15×16 + 15 = 255، وهي قناع /32 وقيمة البث MAC."
      },
      {
        question: "لماذا يُستخدم النظام السداسي عشري في عناوين MAC؟",
        options: ["لجماله فقط", "لتمثيل 48 بت بشكل مختصر (12 خانة)", "لأنه أسرع", "لأن الشبكات لا تفهم الثنائي"],
        correct: 1,
        explanation: "كل خانة سداسية تمثل 4 بتات، فيُمثل عنوان MAC بـ 12 خانة بدلاً من 48 بت."
      },
      {
        question: "قيم البتات في Octet من اليسار هي:",
        options: ["1,2,4,8...", "128,64,32,16,8,4,2,1", "256,128,64...", "لا قيم ثابتة"],
        correct: 1,
        explanation: "قيم المواقع من اليسار لليمين: 128، 64، 32، 16، 8، 4، 2، 1 — أساس كل تحويل ثنائي."
      }
    ]
  },
  "data-link-functions": {
    title: "اختبار: طبقة ربط البيانات",
    questions: [
      {
        question: "ما معيار الشبكات المحلية السلكية الأكثر استخداماً؟",
        options: ["802.11", "802.3 (Ethernet)", "802.15", "802.1Q"],
        correct: 1,
        explanation: "IEEE 802.3 هو معيار Ethernet المستخدم في جميع الشبكات المحلية السلكية تقريباً."
      },
      {
        question: "ما الفرق بين Full-Duplex و Half-Duplex؟",
        options: ["لا فرق", "Full-Duplex إرسال واستقبال معاً، Half-Duplex أحدهما فقط", "Half-Duplex أسرع", "Full-Duplex للاسلكي فقط"],
        correct: 1,
        explanation: "Full-Duplex يسمح بالإرسال والاستقبال في نفس الوقت، وHalf-Duplex باتجاه واحد في كل مرة."
      },
      {
        question: "ما وظيفة حقل FCS في إطار Ethernet؟",
        options: ["عنوان الوجهة", "كشف أخطاء الإطار", "رقم VLAN", "نوع البروتوكول"],
        correct: 1,
        explanation: "FCS (Frame Check Sequence) يحتوي قيمة CRC لكشف أخطاء الإطار أثناء النقل."
      },
      {
        question: "ما طريقة التحكم بالوصول للشبكات اللاسلكية؟",
        options: ["CSMA/CD", "CSMA/CA", "Token Passing", "Polling"],
        correct: 1,
        explanation: "اللاسلكي يستخدم CSMA/CA (تجنب التصادم) لأن كشف التصادم غير ممكن عملياً في الأثير."
      }
    ]
  },
  "network-layer-functions": {
    title: "اختبار: طبقة الشبكة",
    questions: [
      {
        question: "ماذا يحدث لقيمة TTL عند مرور الحزمة بكل راوتر؟",
        options: ["تزيد 1", "تنقص 1", "لا تتغير", "تتضاعف"],
        correct: 1,
        explanation: "كل جهاز توجيه يُنقص TTL بمقدار 1، وعند الوصول لصفر تُسقط الحزمة ويُرسل ICMP Time Exceeded."
      },
      {
        question: "ماذا يفعل المضيف إذا كانت الوجهة في شبكة مختلفة؟",
        options: ["يُسقط الحزمة", "يُرسلها للـ Default Gateway", "يُبثها للجميع", "ينتظر DNS"],
        correct: 1,
        explanation: "إذا كانت الوجهة خارج شبكته، يُرسل الحزمة إلى البوابة الافتراضية (الراوتر) لتوجيهها."
      },
      {
        question: "أي بروتوكول يشير له حقل Protocol بقيمة 6؟",
        options: ["UDP", "TCP", "ICMP", "ARP"],
        correct: 1,
        explanation: "القيمة 6 تعني TCP، و17 تعني UDP، و1 تعني ICMP."
      },
      {
        question: "كم بت في عنوان IPv6؟",
        options: ["32", "64", "128", "256"],
        correct: 2,
        explanation: "IPv6 يستخدم 128 بت مقابل 32 بت في IPv4، مما يوفر فضاء عناوين شبه غير محدود."
      }
    ]
  },
  "arp-protocol": {
    title: "اختبار: بروتوكول ARP",
    questions: [
      {
        question: "ما وظيفة ARP؟",
        options: ["توزيع عناوين IP", "معرفة عنوان MAC من عنوان IP", "توجيه الحزم", "تشفير البيانات"],
        correct: 1,
        explanation: "ARP يحوّل عنوان IP معروف إلى عنوان MAC مجهول لإكمال تسليم الإطار في الشبكة المحلية."
      },
      {
        question: "كيف يُرسل ARP Request؟",
        options: ["Unicast", "Broadcast", "Multicast", "Anycast"],
        correct: 1,
        explanation: "ARP Request يُرسل بثاً شاملاً (Broadcast) لأن العميل لا يعرف من يملك العنوان المطلوب."
      },
      {
        question: "إلى من يُرسل PC الـ ARP Request إذا كانت الوجهة في شبكة أخرى؟",
        options: ["للوجهة مباشرة", "للـ Default Gateway", "للجميع على الإنترنت", "لا يُرسل شيئاً"],
        correct: 1,
        explanation: "يُرسل ARP للبوابة الافتراضية؛ الراوتر يرد بعنوان MAC واجهته ثم يوجه الحزمة للوجهة."
      },
      {
        question: "ما أمر عرض جدول ARP على Windows؟",
        options: ["arp -a", "show arp table", "display mac", "ip arp"],
        correct: 0,
        explanation: "arp -a تعرض جدول ARP المحلي. وعلى أجهزة Cisco: show arp."
      }
    ]
  },
  "router-basic-config": {
    title: "اختبار: الإعداد الأساسي للراوتر",
    questions: [
      {
        question: "ما الأمر لتهيئة واجهة بـ IP وتشغيلها؟",
        options: ["ip 192.168.1.1 / enable", "ip address 192.168.1.1 255.255.255.0 ثم no shutdown", "set ip interface", "ip interface enable"],
        correct: 1,
        explanation: "داخل الواجهة: ip address ثم no shutdown لتفعيلها — الواجهات تأتي معطلة (administratively down) افتراضياً."
      },
      {
        question: "لماذا نستخدم no shutdown على الواجهة؟",
        options: ["لإيقافها", "لتفعيلها", "لحفظها", "لحذفها"],
        correct: 1,
        explanation: "الواجهات في أجهزة Cisco معطلة إدارياً افتراضياً، وno shutdown يفعّلها."
      },
      {
        question: "ما أمر التحقق السريع من حالة جميع الواجهات؟",
        options: ["show interfaces detail", "show ip interface brief", "show config", "list interfaces"],
        correct: 1,
        explanation: "show ip interface brief يعرض جميع الواجهات مع عناوينها وحالتها في جدول واحد موجز."
      },
      {
        question: "ما وظيفة ip default-gateway على المحول؟",
        options: ["تفعيل VLANs", "تمكين الوصول الإداري للمحول من شبكة بعيدة", "توزيع عناوين", "إنشاء Trunk"],
        correct: 1,
        explanation: "المحول L2 لا يوجّه، لكنه يحتاج بوابة افتراضية ليُدار من شبكات أخرى عبر الراوتر."
      }
    ]
  },
  "ipv4-broadcast-types": {
    title: "اختبار: أنواع البث في IPv4",
    questions: [
      {
        question: "ما عنوان البث المحدود (Limited Broadcast)؟",
        options: ["192.168.1.255", "255.255.255.255", "127.0.0.1", "0.0.0.0"],
        correct: 1,
        explanation: "255.255.255.255 هو البث المحدود الذي لا تمرره الراوترات، ويستخدم في DHCP Discover مثلاً."
      },
      {
        question: "هل تمرر الراوترات رسائل Broadcast؟",
        options: ["نعم دائماً", "لا، الراوتر يحد من نطاق البث", "فقط OSPF", "فقط RIP"],
        correct: 1,
        explanation: "الراوتر يفصل نطاقات البث — رسالة البث تبقى داخل شبكتها المحلية."
      },
      {
        question: "ما نطاق عناوين Multicast؟",
        options: ["127.0.0.0/8", "169.254.0.0/16", "224.0.0.0 - 239.255.255.255", "240.0.0.0/4"],
        correct: 2,
        explanation: "الصنف D من 224 إلى 239 مخصص للـ Multicast مثل بروتوكولات التوجيه OSPF (224.0.0.5)."
      },
      {
        question: "ما معنى عنوان 192.168.1.255 في شبكة /24؟",
        options: ["أول جهاز", "عنوان الشبكة", "البث الموجه (Directed Broadcast)", "البوابة"],
        correct: 2,
        explanation: "آخر عنوان في الشبكة هو البث الموجه — يصل لجميع أجهزة تلك الشبكة المحددة."
      }
    ]
  },
  "icmp-ping-traceroute": {
    title: "اختبار: ICMP و Ping و Traceroute",
    questions: [
      {
        question: "ماذا تعني علامة ! في نتيجة ping؟",
        options: ["فشل الاستجابة", "نجح الاستلام", "وجهة غير موجودة", "انتهاء المهلة"],
        correct: 1,
        explanation: "علامة ! تعني استلام رد ناجح، والنقطة . تعني انتهاء المهلة، وU تعني غير قابل للوصول."
      },
      {
        question: "ما أول اختبار ping يجب تنفيذه لتشخيص الاتصال؟",
        options: ["ping 8.8.8.8", "ping 127.0.0.1", "ping www.google.com", "ping البوابة"],
        correct: 1,
        explanation: "ping 127.0.0.1 يختبر حزمة TCP/IP داخل الجهاز نفسه — إذا فشل فالمشكلة محلية."
      },
      {
        question: "كيف يعمل Traceroute؟",
        options: ["يرسل حزماً بـ TTL متزايد", "يسأل كل راوتر مباشرة", "يفحص الكابلات", "يستخدم DNS"],
        correct: 0,
        explanation: "يبدأ بـ TTL=1 فيرد الراوتر الأول، ثم TTL=2 فيرد الثاني... حتى تصل الحزمة للوجهة."
      },
      {
        question: "ما رسالة ICMP التي يرسلها الراوتر عند انتهاء TTL؟",
        options: ["Echo Reply", "Time Exceeded", "Destination Unreachable", "Redirect"],
        correct: 1,
        explanation: "ICMP Time Exceeded تعيد للمصدر معرفة أن الحزمة سقطت عندها لانتهاء عمرها."
      }
    ]
  },
  "tcp-udp": {
    title: "اختبار: TCP و UDP",
    questions: [
      {
        question: "ما بروتوكول يضمن وصول البيانات وترتيبها؟",
        options: ["UDP", "TCP", "ICMP", "ARP"],
        correct: 1,
        explanation: "TCP موجه بالاتصال ويضمن الوصول والترتيب وإعادة الإرسال عند الفقد."
      },
      {
        question: "ما خطوات Three-Way Handshake؟",
        options: ["ACK, SYN, FIN", "SYN, SYN-ACK, ACK", "OFFER, REQUEST, ACK", "DISCOVER, OFFER, REQUEST"],
        correct: 1,
        explanation: "SYN ثم SYN-ACK ثم ACK — بها يُنشأ اتصال TCP قبل تبادل أي بيانات."
      },
      {
        question: "أي خدمة تستخدم UDP؟",
        options: ["HTTP", "FTP", "DNS", "SSH"],
        correct: 2,
        explanation: "DNS يستخدم UDP للسرعة (استعلامات خفيفة)، وكذلك DHCP وTFTP والبث المباشر."
      },
      {
        question: "ما نطاق Well Known Ports؟",
        options: ["0-1023", "1024-49151", "49152-65535", "0-65535"],
        correct: 0,
        explanation: "0-1023 للبروتوكولات الرئيسية (HTTP 80, SSH 22)، و1024-49151 مسجلة، والباقي ديناميكية."
      }
    ]
  },
  "application-protocols": {
    title: "اختبار: بروتوكولات طبقة التطبيقات",
    questions: [
      {
        question: "ما منفذ HTTPS؟",
        options: ["80", "443", "8080", "22"],
        correct: 1,
        explanation: "HTTPS يعمل على المنفذ 443 مع تشفير TLS/SSL، بينما HTTP العادي على 80."
      },
      {
        question: "ما البروتوكول المستخدم لإرسال البريد؟",
        options: ["POP3", "SMTP", "IMAP", "DNS"],
        correct: 1,
        explanation: "SMTP (المنفذ 25) يُستخدم للإرسال، وPOP3 (110) وIMAP (143) للاستلام."
      },
      {
        question: "ما وظيفة DHCP على المنفذ 67/68؟",
        options: ["ترجمة الأسماء", "توزيع عناوين IP تلقائياً", "نقل الملفات", "إدارة الشبكة"],
        correct: 1,
        explanation: "DHCP يوزع عناوين IP والإعدادات تلقائياً عبر عملية DORA باستخدام UDP."
      },
      {
        question: "ما الفرق بين IMAP و POP3؟",
        options: ["لا فرق", "IMAP يُبقي البريد على الخادم، POP3 ينزله للجهاز", "POP3 أحدث", "IMAP أسرع"],
        correct: 1,
        explanation: "IMAP يزامن البريد مع الخادم (يبقى هناك)، وPOP3 ينزله ويحذفه عادة من الخادم."
      }
    ]
  },
  "advanced-switch-router": {
    title: "اختبار: الإعدادات المتقدمة",
    questions: [
      {
        question: "ما أول خطوة لتفعيل SSH على جهاز؟",
        options: ["إنشاء مستخدم", "تعريف hostname و ip domain-name لتوليد مفاتيح RSA", "فتح المنفذ 22", "تشغيل Telnet"],
        correct: 1,
        explanation: "توليد مفاتيح RSA يتطلب اسم جهاز واسم نطاق، ثم crypto key generate rsa."
      },
      {
        question: "ما وظيفة واجهة Loopback؟",
        options: ["ربط شبكات خارجية", "معرف دائم للجهاز لا يسقط أبداً (Router ID)", "توزيع عناوين", "مراقبة الحزم"],
        correct: 1,
        explanation: "Loopback واجهة منطقية دائمة Up تُستخدم كـ Router ID في OSPF وللإدارة عن بعد."
      },
      {
        question: "ما ترتيب إقلاع المحول الصحيح؟",
        options: ["IOS ← NVRAM ← Bootstrap", "Bootstrap ← IOS من Flash ← startup-config من NVRAM", "NVRAM ← Flash ← RAM", "لا يوجد ترتيب"],
        correct: 1,
        explanation: "Bootstrap من ROM أولاً، ثم تحميل IOS من Flash، ثم startup-config من NVRAM."
      },
      {
        question: "ماذا يحدث إذا لم يجد المحول startup-config عند الإقلاع؟",
        options: ["يتوقف", "يدخل Setup Mode للإعداد الحواري", "يحذف IOS", "يعيد التشغيل"],
        correct: 1,
        explanation: "بدون إعداد مخزن يدخل الجهاز وضع Setup الذي يطرح أسئلة لإعداد أولي."
      }
    ]
  },
  "switching-concepts": {
    title: "اختبار: مفاهيم التبديل",
    questions: [
      {
        question: "كم نطاق تصادم (Collision Domain) يوفر Hub بـ 8 منافذ؟",
        options: ["8", "1", "16", "0"],
        correct: 1,
        explanation: "Hub يضع جميع منافذه في نطاق تصادم واحد — سبب رئيسي لضعف أدائه."
      },
      {
        question: "كم نطاق بث (Broadcast Domain) لدى Switch بـ 24 منفذ؟",
        options: ["24", "12", "1", "0"],
        correct: 2,
        explanation: "المحول نطاق بث واحد شاملاً جميع منافذه؛ فقط الراوتر أو VLAN يفصل نطاقات البث."
      },
      {
        question: "ماذا يفعل المحول بعنوان MAC الوجهة غير الموجود في جدوله؟",
        options: ["يسقط الإطار", "يرسله لجميع المنافذ (Flooding)", "يرسله للراوتر فقط", "يخزنه"],
        correct: 1,
        explanation: "Flooding — يُرسل الإطار من جميع المنافذ عدا القادم منه حتى يتعلم العنوان."
      },
      {
        question: "أي جهاز يفصل نطاقات البث؟",
        options: ["Hub", "Switch", "Router", "Repeater"],
        correct: 2,
        explanation: "الراوتر (وأيضاً VLAN) يفصل نطاقات البث؛ الـ Hub والمحول لا يفعلان."
      }
    ]
  },
  "routing-table": {
    title: "اختبار: جدول التوجيه",
    questions: [
      {
        question: "ماذا يعني الرمز S* في جدول التوجيه؟",
        options: ["شبكة مباشرة", "مسار افتراضي (Default Route)", "مسار OSPF", "مسار تالف"],
        correct: 1,
        explanation: "S* هو المسار الافتراضي 0.0.0.0/0 الذي يُستخدم لأي وجهة غير موجودة في الجدول."
      },
      {
        question: "ما القيمة الإدارية (AD) للمسار المتصل مباشرة؟",
        options: ["0", "1", "90", "110"],
        correct: 0,
        explanation: "Connected = 0 (الأكثر ثقة)، Static = 1، EIGRP = 90، OSPF = 110، RIP = 120."
      },
      {
        question: "إذا وُجد مساران ل نفس الشبكة بـ AD 1 و AD 120، أيهما يُستخدم؟",
        options: ["AD 120", "AD 1", "كلاهما", "عشوائي"],
        correct: 1,
        explanation: "الراوتر يختار المسار ذا القيمة الإدارية الأقل — AD 1 (Static) هنا."
      },
      {
        question: "ماذا يفعل الراوتر إذا لم يجد أي مسار مطابق للوجهة؟",
        options: ["يُرسلها للجميع", "يسقطها ويرسل ICMP Destination Unreachable", "ينتظر", "يُعيد الإرسال"],
        correct: 1,
        explanation: "بلا مسار افتراضي، تُسقط الحزمة ويُرسل الراوتر رسالة ICMP Unreachable للمصدر."
      }
    ]
  }
};
const quizData = {
  "mac-addresses": {
    title: "اختبار: عناوين MAC",
    questions: [
      {
        question: "ما هو طول عنوان MAC؟",
        options: ["32 بت", "48 بت", "64 بت", "128 بت"],
        correct: 1,
        explanation: "عنوان MAC يتكون من 48 بت (6 بايت) ويُكتب بصيغة سداسية عشرية."
      },
      {
        question: "ما هو عنوان MAC للبث العام (Broadcast)؟",
        options: ["00:00:00:00:00:00", "FF:FF:FF:FF:FF:FF", "01:00:5E:00:00:01", "127:0:0:1"],
        correct: 1,
        explanation: "عنوان FF:FF:FF:FF:FF:FF هو عنوان البث العام الذي يُرسل لجميع الأجهزة في الشبكة المحلية."
      },
      {
        question: "ما هو بروتوكول ARP؟",
        options: ["لإرسال البريد الإلكتروني", "لمعرفة عنوان MAC من عنوان IP", "لتوزيع عناوين IP", "للتشفير"],
        correct: 1,
        explanation: "بروتوكول ARP (Address Resolution Protocol) يُستخدم للحصول على عنوان MAC عند معرفة عنوان IP فقط."
      },
      {
        question: "ما هو الجزء الأول من عنوان MAC (OUI)؟",
        options: ["رقم تسلسلي فريد", "معرف الشركة المصنعة", "رقم الشبكة", "معرف الجهاز"],
        correct: 1,
        explanation: "الـ OUI (Organizationally Unique Identifier) هو أول 3 بايت من عنوان MAC ويُحدد الشركة المصنعة."
      },
      {
        question: "أي جهاز يحتفظ بجدول عناوين MAC؟",
        options: ["جهاز التوجيه (Router)", "المحول (Switch)", "الموزع (Hub)", "الخادم (Server)"],
        correct: 1,
        explanation: "المحول (Switch) هو الذي يحتفظ بجدول MAC Address Table لتحديد على أي منفذ يوجد كل جهاز."
      }
    ]
  },
  "ipv4-addresses": {
    title: "اختبار: عناوين IPv4",
    questions: [
      {
        question: "ما هو طول عنوان IPv4؟",
        options: ["16 بت", "32 بت", "64 بت", "128 بت"],
        correct: 1,
        explanation: "عنوان IPv4 يتكون من 32 بت (4 بايت) ويُمثل بأربع مجموعات عشرية."
      },
      {
        question: "ما هو قناع الشبكة الافتراضي للشبكة من الصنف C؟",
        options: ["255.0.0.0", "255.255.0.0", "255.255.255.0", "255.255.255.255"],
        correct: 2,
        explanation: "الصنف C يستخدم قناع 255.255.255.0 أي /24، مما يسمح بـ 254 مضيف في الشبكة."
      },
      {
        question: "أي من العناوين التالية هو عنوان خاص (Private)؟",
        options: ["8.8.8.8", "172.16.0.1", "200.100.50.1", "203.0.113.1"],
        correct: 1,
        explanation: "172.16.0.1 ينتمي لنطاق العناوين الخاصة 172.16.0.0/12 التي لا تُستخدم على الإنترنت مباشرة."
      },
      {
        question: "كم عدد العناوين الإجمالية في IPv4؟",
        options: ["حوالي مليار", "حوالي 4.3 مليار", "حوالي 10 مليارات", "غير محدود"],
        correct: 1,
        explanation: "IPv4 يوفر 2^32 = حوالي 4.3 مليار عنوان، وهو ما أدى إلى نقص العناوين واعتماد IPv6."
      },
      {
        question: "ما هو استخدام الصنف D في IPv4؟",
        options: ["شبكات كبيرة", "شبكات صغيرة", "Multicast", "محجوز للتجارب"],
        correct: 2,
        explanation: "الصنف D (224.0.0.0 - 239.255.255.255) مخصص لبروتوكول Multicast لإرسال البيانات لمجموعة محددة."
      }
    ]
  },
  "dhcp": {
    title: "اختبار: بروتوكول DHCP",
    questions: [
      {
        question: "ما هي الخطوة الأولى في عملية DORA؟",
        options: ["Offer", "Discover", "Request", "Acknowledge"],
        correct: 1,
        explanation: "DORA تبدأ بـ Discover حيث يُرسل الجهاز رسالة بث للبحث عن خادم DHCP في الشبكة."
      },
      {
        question: "ما هي مدة الإيجار (Lease Time) في DHCP؟",
        options: ["المدة التي يظل فيها المستخدم متصلاً", "المدة التي يحتفظ فيها الجهاز بعنوان IP", "وقت استجابة الخادم", "مدة تخزين الجلسة"],
        correct: 1,
        explanation: "مدة الإيجار هي المدة الزمنية التي يُخصص فيها عنوان IP لجهاز معين قبل أن يحتاج لتجديده."
      },
      {
        question: "ماذا يُرسل خادم DHCP في خطوة Offer؟",
        options: ["طلب عنوان IP", "عرض عنوان IP متاح", "تأكيد التخصيص", "رسالة خطأ"],
        correct: 1,
        explanation: "في خطوة Offer، يعرض الخادم عنوان IP متاحاً مع معلومات الشبكة على الجهاز الطالب."
      },
      {
        question: "ما هي المعلومات التي يُوفرها DHCP للعميل؟",
        options: ["عنوان IP فقط", "عنوان IP وقناع الشبكة فقط", "عنوان IP وقناع الشبكة والبوابة وخادم DNS", "كلمة مرور الشبكة"],
        correct: 2,
        explanation: "DHCP يُوفر: عنوان IP، قناع الشبكة (Subnet Mask)، البوابة الافتراضية، وعنوان خادم DNS."
      },
      {
        question: "ما الفائدة الرئيسية من DHCP؟",
        options: ["تشفير البيانات", "التوزيع التلقائي للعناوين وتقليل الأخطاء", "زيادة سرعة الشبكة", "حماية الشبكة من الاختراق"],
        correct: 1,
        explanation: "DHCP يُوفر الوقت والجهد بتوزيع العناوين تلقائياً ويُقلل الأخطاء الناتجة عن الإدخال اليدوي."
      }
    ]
  },
  "nat": {
    title: "اختبار: بروتوكول NAT",
    questions: [
      {
        question: "ماذا تعني NAT؟",
        options: ["Network Access Technology", "Network Address Translation", "Network Application Transfer", "Node Access Table"],
        correct: 1,
        explanation: "NAT تعني Network Address Translation - ترجمة عناوين الشبكة من خاصة إلى عامة والعكس."
      },
      {
        question: "ما هو Inside Local في NAT؟",
        options: ["العنوان العام للجهاز الداخلي", "العنوان الخاص للجهاز داخل الشبكة", "عنوان الوجهة الخارجية", "عنوان جهاز التوجيه"],
        correct: 1,
        explanation: "Inside Local هو العنوان الخاص للجهاز كما يُعرَّف داخل الشبكة الداخلية."
      },
      {
        question: "ما هو الأمر لتعريف منفذ NAT الداخلي؟",
        options: ["ip nat outside", "ip nat inside", "ip nat enable", "nat inside enable"],
        correct: 1,
        explanation: "الأمر 'ip nat inside' يُطبق على الواجهة المتصلة بالشبكة الداخلية."
      },
      {
        question: "ما الفرق بين Static NAT وDynamic NAT؟",
        options: ["لا فرق بينهما", "Static يربط عنوان واحد بعنوان واحد، Dynamic يستخدم مجموعة عناوين", "Dynamic أكثر أماناً", "Static لا يعمل مع IPv4"],
        correct: 1,
        explanation: "Static NAT ربط ثابت 1:1، أما Dynamic NAT فيُخصص عنواناً من مجموعة (Pool) بشكل ديناميكي."
      },
      {
        question: "لماذا ظهرت الحاجة لـ NAT؟",
        options: ["لزيادة سرعة الشبكة", "لحل مشكلة نقص عناوين IPv4 العامة", "لتشفير البيانات", "لتحسين أداء التوجيه"],
        correct: 1,
        explanation: "النقص الكبير في عناوين IPv4 العامة دفع إلى استخدام NAT لمشاركة عنوان عام واحد بين أجهزة متعددة."
      }
    ]
  },
  "pat": {
    title: "اختبار: PAT/NAT Overload",
    questions: [
      {
        question: "ما الفرق الأساسي بين PAT و NAT؟",
        options: ["PAT أقدم من NAT", "PAT يستخدم أرقام المنافذ لتمييز الاتصالات", "NAT يدعم IPv6", "لا فرق بينهما"],
        correct: 1,
        explanation: "PAT يُضيف أرقام المنافذ (Port Numbers) للتمييز بين اتصالات متعددة تشارك عنوان IP واحداً."
      },
      {
        question: "ما الكلمة التي تُضاف في أمر PAT؟",
        options: ["static", "dynamic", "overload", "translate"],
        correct: 2,
        explanation: "كلمة 'overload' في نهاية أمر NAT هي ما يحول الأمر من NAT عادي إلى PAT."
      },
      {
        question: "كم جهازاً يمكن أن يتشارك عنوان IP واحد في PAT؟",
        options: ["255 جهاز فقط", "1024 جهاز", "آلاف الأجهزة", "جهازان فقط"],
        correct: 2,
        explanation: "PAT يدعم نظرياً حتى 65,535 اتصالاً متزامناً لأنه يستخدم نطاق أرقام المنافذ كاملاً."
      },
      {
        question: "في أي السيناريوهات يكون PAT الأنسب؟",
        options: ["تشغيل خادم ويب", "اتصال منزلي بالإنترنت", "ربط شبكتين خاصتين", "شبكة VPN"],
        correct: 1,
        explanation: "PAT مثالي للاتصالات المنزلية والشركات الصغيرة حيث يحتاج كثيرون لمشاركة عنوان IP عام واحد."
      },
      {
        question: "ماذا يحتفظ جهاز التوجيه في PAT؟",
        options: ["جدول عناوين MAC", "جدول ترجمة يربط العنوان الداخلي+المنفذ بالعنوان الخارجي+المنفذ", "قائمة كلمات المرور", "جدول التوجيه فقط"],
        correct: 1,
        explanation: "جهاز التوجيه يُنشئ جدول ترجمة (Translation Table) يربط كل جلسة داخلية بمنفذ خارجي فريد."
      }
    ]
  },
  "ipv6": {
    title: "اختبار: عناوين IPv6",
    questions: [
      {
        question: "ما هو طول عنوان IPv6؟",
        options: ["32 بت", "64 بت", "96 بت", "128 بت"],
        correct: 3,
        explanation: "عنوان IPv6 يتكون من 128 بت، مما يوفر عدداً هائلاً من العناوين يكفي المستقبل البعيد."
      },
      {
        question: "كيف يُكتب عنوان IPv6 المختصر 2001:0DB8:0000:0000:0000:0000:0000:0001 بشكل مختصر؟",
        options: ["2001:DB8::1", "2001:DB8:0::1", "2001::DB8::1", "2001:DB8:1"],
        correct: 0,
        explanation: "يمكن حذف الأصفار البادئة وتجميع المجموعات الصفرية المتتالية باستخدام :: مرة واحدة."
      },
      {
        question: "ما هو نوع عنوان FE80::1؟",
        options: ["Global Unicast", "Link-Local", "Multicast", "Loopback"],
        correct: 1,
        explanation: "العناوين التي تبدأ بـ FE80 هي Link-Local وتُستخدم للتواصل المحلي فقط ولا تُرسل عبر جهاز التوجيه."
      },
      {
        question: "كم مرة يمكن استخدام :: في عنوان IPv6 واحد؟",
        options: ["مرة واحدة فقط", "مرتان", "ثلاث مرات", "بدون حد"],
        correct: 0,
        explanation: "يمكن استخدام :: مرة واحدة فقط في العنوان لتجنب الالتباس في تفسير العنوان."
      },
      {
        question: "ما الذي يحل محل ARP في IPv6؟",
        options: ["DHCP", "NDP (Neighbor Discovery Protocol)", "OSPF", "NAT66"],
        correct: 1,
        explanation: "IPv6 يستخدم NDP بدلاً من ARP لاكتشاف الجيران والحصول على عناوين MAC."
      }
    ]
  },
  "ipv6-exercise": {
    title: "اختبار: تمارين عناوين IPv6",
    questions: [
      {
        question: "ما الشكل المختصر الصحيح لـ FF02:0000:0000:0000:0000:0000:0000:0001؟",
        options: ["FF02::01", "FF02::1", "FF02:0::1", "FF02:00::1"],
        correct: 1,
        explanation: "FF02::1 هو الشكل الصحيح، تُحذف الأصفار البادئة والمجموعات الصفرية باستخدام ::."
      },
      {
        question: "ما نوع العنوان ::1؟",
        options: ["Link-Local", "Global Unicast", "Loopback", "Multicast"],
        correct: 2,
        explanation: "العنوان ::1 هو عنوان Loopback في IPv6، يُعادل 127.0.0.1 في IPv4."
      },
      {
        question: "ما الصيغة الكاملة لعنوان FE80::1؟",
        options: ["FE80:0000:0000:0000:0000:0000:0000:0001", "FE80:1:0:0:0:0:0:0", "FE80:0001:0000:0000", "FE8000000001"],
        correct: 0,
        explanation: "FE80::1 يتوسع إلى FE80:0000:0000:0000:0000:0000:0000:0001 عند الكتابة الكاملة."
      },
      {
        question: "هل يحتاج IPv6 إلى NAT؟",
        options: ["نعم دائماً", "لا، لأن العناوين كافية", "أحياناً", "فقط في الشبكات الكبيرة"],
        correct: 1,
        explanation: "IPv6 يوفر عدداً كافياً من العناوين لكل جهاز على وجه الأرض، لذا لا حاجة لـ NAT."
      },
      {
        question: "ما نطاق عناوين Global Unicast في IPv6؟",
        options: ["FE80::/10", "FC00::/7", "2000::/3", "FF00::/8"],
        correct: 2,
        explanation: "عناوين Global Unicast تبدأ من النطاق 2000::/3 وهي العناوين العامة المستخدمة على الإنترنت."
      }
    ]
  },
  "vlan-gui": {
    title: "اختبار: VLAN (واجهة رسومية)",
    questions: [
      {
        question: "ما هو رقم VLAN الافتراضي في معظم المحولات؟",
        options: ["VLAN 0", "VLAN 1", "VLAN 10", "VLAN 100"],
        correct: 1,
        explanation: "VLAN 1 هو الـ VLAN الافتراضي الذي تنتمي إليه جميع المنافذ عند الإعداد الأولي."
      },
      {
        question: "ما الفائدة الرئيسية من VLANs؟",
        options: ["زيادة سرعة الشبكة", "تقليل البث وفصل حركة البيانات أمنياً", "توفير عناوين IP", "تشفير البيانات"],
        correct: 1,
        explanation: "VLANs تُقسم الشبكة منطقياً لتقليل حركة البث وتحسين الأمان بفصل أقسام الشبكة."
      },
      {
        question: "هل يمكن لجهازين في VLANs مختلفة التواصل مباشرة؟",
        options: ["نعم دائماً", "لا، يحتاجان لجهاز توجيه", "نعم إذا كانا في نفس المحول", "نعم إذا كانا في نفس الغرفة"],
        correct: 1,
        explanation: "للتواصل بين VLANs مختلفة يلزم جهاز توجيه أو Layer 3 Switch لتوجيه الحركة بينهما."
      },
      {
        question: "ما هو وضع المنفذ المناسب لتوصيل جهاز كمبيوتر؟",
        options: ["Trunk", "Access", "Dynamic", "Hybrid"],
        correct: 1,
        explanation: "وضع Access يُستخدم لتوصيل الأجهزة الطرفية (PC, Printer) وينقل حركة VLAN واحدة فقط."
      },
      {
        question: "ما وظيفة Trunk Port؟",
        options: ["توصيل كمبيوتر واحد فقط", "نقل حركة عدة VLANs بين المحولات", "زيادة سرعة المنفذ", "تشفير البيانات"],
        correct: 1,
        explanation: "منفذ Trunk يحمل حركة عدة VLANs في وقت واحد ويُستخدم لربط المحولات ببعضها أو بجهاز التوجيه."
      }
    ]
  },
  "vlan-cli": {
    title: "اختبار: VLAN (سطر الأوامر)",
    questions: [
      {
        question: "ما الأمر الصحيح لإنشاء VLAN 10 بالاسم Sales؟",
        options: ["vlan create 10 Sales", "vlan 10 / name Sales", "vlan 10 ثم name Sales", "add vlan 10 name Sales"],
        correct: 2,
        explanation: "ندخل أولاً 'vlan 10' ثم 'name Sales' داخل وضع تهيئة VLAN."
      },
      {
        question: "ما الأمر لتعيين منفذ لـ VLAN 10؟",
        options: ["switchport access vlan 10", "set port vlan 10", "vlan assign 10", "port vlan 10"],
        correct: 0,
        explanation: "الأمر 'switchport access vlan 10' يُطبق على المنفذ لتعيينه لـ VLAN 10."
      },
      {
        question: "ما الأمر لعرض ملخص VLANs؟",
        options: ["show vlan all", "display vlan", "show vlan brief", "list vlan"],
        correct: 2,
        explanation: "الأمر 'show vlan brief' يعرض ملخصاً لجميع VLANs والمنافذ المعينة لها."
      },
      {
        question: "ما الأمر لضبط منفذ كـ Trunk؟",
        options: ["switchport trunk enable", "switchport mode trunk", "set trunk on", "trunk port enable"],
        correct: 1,
        explanation: "الأمر 'switchport mode trunk' يُحول المنفذ إلى وضع Trunk."
      },
      {
        question: "أين يجب تطبيق أوامر تهيئة المنافذ؟",
        options: ["في وضع المستخدم (>)", "في وضع الامتياز (#)", "في وضع تهيئة الواجهة (config-if)", "في وضع VLAN"],
        correct: 2,
        explanation: "أوامر إعداد المنافذ تُطبق في وضع تهيئة الواجهة الذي يظهر كـ (config-if)."
      }
    ]
  },
  "router-on-stick": {
    title: "اختبار: Router on a Stick",
    questions: [
      {
        question: "ما هو مفهوم Router on a Stick؟",
        options: ["توجيه عبر عدة واجهات فيزيائية", "توجيه بين VLANs عبر واجهة فيزيائية واحدة", "توجيه لاسلكي", "توجيه IPv6 فقط"],
        correct: 1,
        explanation: "Router on a Stick يستخدم واجهة فيزيائية واحدة مقسمة إلى واجهات فرعية للتوجيه بين VLANs."
      },
      {
        question: "ما هو الأمر لإنشاء واجهة فرعية؟",
        options: ["interface sub 10", "interface Gi0/0.10", "create subinterface 10", "interface vlan 10"],
        correct: 1,
        explanation: "الواجهة الفرعية تُنشأ بإضافة نقطة ورقم بعد اسم الواجهة مثل GigabitEthernet0/0.10"
      },
      {
        question: "ما الأمر المطلوب على كل واجهة فرعية؟",
        options: ["ip nat inside", "encapsulation dot1Q [vlan-id]", "no shutdown", "ip helper-address"],
        correct: 1,
        explanation: "الأمر 'encapsulation dot1Q' يُخبر الواجهة الفرعية بـ VLAN ID الخاص بها."
      },
      {
        question: "ما وضع منفذ المحول المتصل بجهاز التوجيه؟",
        options: ["Access", "Trunk", "Dynamic", "Monitor"],
        correct: 1,
        explanation: "المنفذ يجب أن يكون Trunk لأنه ينقل حركة عدة VLANs إلى جهاز التوجيه."
      },
      {
        question: "ما عيب Router on a Stick؟",
        options: ["معقد جداً في الإعداد", "يشكل عنق زجاجة لأن كل حركة تمر عبر رابط واحد", "لا يدعم IPv4", "يحتاج لخادم DHCP خاص"],
        correct: 1,
        explanation: "الرابط الوحيد بين المحول وجهاز التوجيه يصبح نقطة اختناق عند ارتفاع حركة البيانات."
      }
    ]
  },
  "vtp": {
    title: "اختبار: بروتوكول VTP",
    questions: [
      {
        question: "ما وظيفة VTP؟",
        options: ["التوجيه بين VLANs", "إدارة VLANs مركزياً عبر عدة محولات", "تشفير حركة VLAN", "توزيع عناوين IP"],
        correct: 1,
        explanation: "VTP يُتيح إنشاء وتعديل وحذف VLANs من محول مركزي (Server) ونشرها تلقائياً."
      },
      {
        question: "أي وضع VTP لا يستطيع تعديل VLANs؟",
        options: ["Server", "Client", "Transparent", "Active"],
        correct: 1,
        explanation: "في وضع Client لا يمكن إنشاء أو تعديل VLANs، فقط استقبال وتطبيق التحديثات من الخادم."
      },
      {
        question: "ما خطر إضافة محول بـ Revision Number أعلى للشبكة؟",
        options: ["سيتوقف الشبكة", "قد يمسح جميع VLANs الموجودة", "ستزداد سرعة الشبكة", "لن يحدث شيء"],
        correct: 1,
        explanation: "محول بـ Revision Number أعلى سيُعلم بقية المحولات بإعداداته القديمة ويمسح VLANs الحالية."
      },
      {
        question: "ما أمر عرض حالة VTP؟",
        options: ["display vtp", "show vtp info", "show vtp status", "list vtp"],
        correct: 2,
        explanation: "الأمر 'show vtp status' يعرض وضع VTP والنطاق ورقم المراجعة والإصدار."
      },
      {
        question: "ما الوضع الذي يمرر رسائل VTP دون تطبيقها؟",
        options: ["Server", "Client", "Transparent", "Passive"],
        correct: 2,
        explanation: "في وضع Transparent المحول يمرر رسائل VTP لغيره لكنه يُنشئ ويدير VLANs بشكل مستقل."
      }
    ]
  },
  "static-routing": {
    title: "اختبار: التوجيه الثابت",
    questions: [
      {
        question: "ما هو التوجيه الثابت؟",
        options: ["توجيه يتعلم المسارات تلقائياً", "توجيه يُعين فيه مسارات الشبكة يدوياً", "توجيه للشبكات اللاسلكية فقط", "بروتوكول توجيه ديناميكي"],
        correct: 1,
        explanation: "التوجيه الثابت يعتمد على إدخال المسارات يدوياً من قِبل مدير الشبكة."
      },
      {
        question: "ما هو المسار الافتراضي (Default Route)؟",
        options: ["0.0.0.0 255.255.255.255", "0.0.0.0 0.0.0.0", "255.255.255.255 0.0.0.0", "192.168.0.0 0.0.0.0"],
        correct: 1,
        explanation: "المسار الافتراضي 0.0.0.0/0 يُستخدم لتوجيه أي حركة لا يوجد لها مسار محدد في جدول التوجيه."
      },
      {
        question: "ما ميزة التوجيه الثابت؟",
        options: ["يتكيف مع تغييرات الشبكة تلقائياً", "لا يستهلك موارد المعالج ويعمل بكفاءة", "يتعلم مسارات جديدة بدون تدخل", "مناسب للشبكات الكبيرة جداً"],
        correct: 1,
        explanation: "التوجيه الثابت لا يستلزم تبادل رسائل توجيه فلا يستهلك معالج جهاز التوجيه أو الحيز."
      },
      {
        question: "ما عيب التوجيه الثابت؟",
        options: ["معقد في الإعداد", "لا يتكيف تلقائياً مع تغييرات الشبكة", "يستهلك موارد كبيرة", "لا يدعم IPv4"],
        correct: 1,
        explanation: "التوجيه الثابت لا يتكيف مع الأعطال أو التغييرات، مما يجعله غير مناسب للشبكات الكبيرة."
      },
      {
        question: "ما الأمر لعرض جدول التوجيه؟",
        options: ["show routing table", "display ip route", "show ip route", "list routes"],
        correct: 2,
        explanation: "الأمر 'show ip route' يعرض جدول التوجيه بجميع مساراته (ثابتة وديناميكية وشبكات مباشرة)."
      }
    ]
  },
  "ospf": {
    title: "اختبار: بروتوكول OSPF",
    questions: [
      {
        question: "ما خوارزمية OSPF لحساب أقصر مسار؟",
        options: ["Bellman-Ford", "Dijkstra", "Floyd-Warshall", "A*"],
        correct: 1,
        explanation: "OSPF يستخدم خوارزمية Dijkstra (SPF - Shortest Path First) لحساب أقصر مسار لكل وجهة."
      },
      {
        question: "ما هي القيمة الإدارية لـ OSPF؟",
        options: ["90", "100", "110", "120"],
        correct: 2,
        explanation: "القيمة الإدارية لـ OSPF هي 110، وكلما كانت القيمة أقل كلما كان المصدر أكثر موثوقية."
      },
      {
        question: "ما وظيفة Area 0 في OSPF؟",
        options: ["تعريف العناوين الافتراضية", "هي المنطقة الرئيسية (Backbone) التي يجب أن تتصل بها جميع المناطق الأخرى", "منطقة للشبكات الخارجية", "منطقة احتياطية"],
        correct: 1,
        explanation: "Area 0 هي منطقة العمود الفقري (Backbone) ويجب أن تتصل بها جميع مناطق OSPF الأخرى."
      },
      {
        question: "ما آخر حالة في تكوين الجوار (Adjacency) في OSPF؟",
        options: ["2-Way", "Exchange", "Loading", "Full"],
        correct: 3,
        explanation: "حالة Full تعني اكتمال تبادل قواعد بيانات OSPF وأن الجهازين في جوار كامل."
      },
      {
        question: "ما أمر عرض الجيران في OSPF؟",
        options: ["show ospf neighbors", "show ip ospf neighbor", "display ospf peers", "list ospf adjacency"],
        correct: 1,
        explanation: "الأمر 'show ip ospf neighbor' يعرض قائمة الأجهزة المجاورة وحالة الجوار مع كل منها."
      }
    ]
  },
  "rip": {
    title: "اختبار: بروتوكول RIP",
    questions: [
      {
        question: "ما أقصى عدد قفزات يدعمه RIP؟",
        options: ["8", "10", "15", "255"],
        correct: 2,
        explanation: "RIP يدعم حتى 15 قفزة. عند وصول العدد إلى 16 يُعتبر الوجهة غير قابلة للوصول."
      },
      {
        question: "كل كم يُرسل RIP تحديثات التوجيه؟",
        options: ["10 ثوانٍ", "30 ثانية", "60 ثانية", "90 ثانية"],
        correct: 1,
        explanation: "RIP يُرسل جدول التوجيه الكامل كل 30 ثانية لجميع الجيران."
      },
      {
        question: "ما الفرق بين RIPv1 و RIPv2؟",
        options: ["RIPv2 أبطأ", "RIPv2 يدعم VLSM ويستخدم Multicast بدلاً من Broadcast", "RIPv1 أكثر أماناً", "لا فرق"],
        correct: 1,
        explanation: "RIPv2 يُضيف دعم VLSM والمصادقة ويستخدم 224.0.0.9 Multicast بدلاً من البث."
      },
      {
        question: "ما وظيفة الأمر 'no auto-summary'؟",
        options: ["إيقاف OSPF", "منع التلخيص التلقائي للعناوين لدعم VLSM الصحيح", "تعطيل التحديثات", "حذف جدول التوجيه"],
        correct: 1,
        explanation: "auto-summary يُلخص الشبكات تلقائياً على حدود الأصناف، وإيقافه يُتيح نشر عناوين VLSM بدقة."
      },
      {
        question: "ما القيمة الإدارية لـ RIP؟",
        options: ["90", "100", "110", "120"],
        correct: 3,
        explanation: "القيمة الإدارية لـ RIP هي 120، وهي أعلى من OSPF (110) مما يجعل OSPF مفضلاً عند توفر كلاهما."
      }
    ]
  },
  "tracert-rip": {
    title: "اختبار: TraceRT و RIP",
    questions: [
      {
        question: "ما وظيفة أمر Traceroute؟",
        options: ["اختبار سرعة الشبكة", "تتبع المسار الذي تسلكه الحزم من المصدر إلى الوجهة", "فحص ملفات الإعداد", "إرسال بريد إلكتروني"],
        correct: 1,
        explanation: "Traceroute يكشف كل جهاز توجيه يمر عبره الحزم في طريقها للوجهة."
      },
      {
        question: "ما الحقل المستخدم في Traceroute؟",
        options: ["Sequence Number", "TTL (Time to Live)", "Port Number", "MAC Address"],
        correct: 1,
        explanation: "Traceroute يُرسل حزماً بـ TTL متزايد (1, 2, 3...) وكل جهاز توجيه يُنقص TTL ويُرسل رسالة ICMP عند وصوله 0."
      },
      {
        question: "ما الرسالة التي يُرسلها جهاز التوجيه عند انتهاء TTL؟",
        options: ["ICMP Echo Reply", "ICMP Time Exceeded", "ICMP Destination Unreachable", "ICMP Redirect"],
        correct: 1,
        explanation: "عند وصول TTL إلى 0، يُرسل جهاز التوجيه رسالة ICMP Time Exceeded للمصدر."
      },
      {
        question: "ما أمر Traceroute على أجهزة Cisco؟",
        options: ["tracert", "traceroute", "trace", "path"],
        correct: 1,
        explanation: "على أجهزة Cisco وLinux يُستخدم 'traceroute'، بينما يُستخدم 'tracert' على Windows."
      },
      {
        question: "كيف يتكيف RIP عند انقطاع مسار؟",
        options: ["يتوقف فوراً", "ينتظر انتهاء مؤقت Invalid ثم يبحث عن مسار بديل", "يُرسل تنبيهاً للمدير", "لا يتكيف أبداً"],
        correct: 1,
        explanation: "RIP ينتظر 180 ثانية (Invalid Timer) قبل اعتبار المسار غير صالح والبحث عن بديل."
      }
    ]
  },
  "wireless-basics": {
    title: "اختبار: الشبكات اللاسلكية",
    questions: [
      {
        question: "ما الفرق بين Access Point وWireless Router؟",
        options: ["لا فرق بينهما", "Wireless Router يجمع توجيه + AP + محول، بينما AP يعمل كجسر فقط", "Access Point أسرع دائماً", "Wireless Router لاسلكي فقط"],
        correct: 1,
        explanation: "جهاز التوجيه اللاسلكي يدمج عدة وظائف (توجيه، DHCP، NAT، AP) بينما AP فقط يربط اللاسلكي بالسلكي."
      },
      {
        question: "ما معيار Wi-Fi الذي يدعم كلا التردين 2.4 GHz و 5 GHz؟",
        options: ["802.11a", "802.11b", "802.11g", "802.11n"],
        correct: 3,
        explanation: "802.11n (Wi-Fi 4) هو أول معيار يدعم التشغيل على كلا التردين 2.4 GHz و 5 GHz."
      },
      {
        question: "ما بروتوكول التشفير الأكثر أماناً من القائمة؟",
        options: ["WEP", "WPA", "WPA2", "Open (بدون تشفير)"],
        correct: 2,
        explanation: "WPA2 يستخدم معيار تشفير AES وهو أكثر أماناً من WEP وWPA القديمين."
      },
      {
        question: "ما هو SSID؟",
        options: ["بروتوكول أمان لاسلكي", "اسم الشبكة اللاسلكية التي تظهر للمستخدمين", "تردد الشبكة", "كلمة مرور الشبكة"],
        correct: 1,
        explanation: "SSID (Service Set Identifier) هو اسم الشبكة اللاسلكية الذي يظهر في قائمة الشبكات المتاحة."
      },
      {
        question: "لماذا يُفضل تردد 5 GHz على 2.4 GHz؟",
        options: ["مدى أبعد", "سرعة أعلى وتداخل أقل", "استهلاك طاقة أقل", "توافق مع أجهزة أقدم"],
        correct: 1,
        explanation: "5 GHz يوفر سرعات أعلى وتداخل أقل لأن معظم الأجهزة المنزلية تستخدم 2.4 GHz."
      }
    ]
  },
  "wireless-router-integration": {
    title: "اختبار: إضافة جهاز توجيه لاسلكي",
    questions: [
      {
        question: "أي منفذ يجب توصيله بالشبكة الموجودة؟",
        options: ["أحد منافذ LAN", "منفذ WAN/Internet", "المنفذ الأول فقط", "أي منفذ"],
        correct: 1,
        explanation: "منفذ WAN/Internet يجب توصيله بالشبكة الخارجية أو المزود، بينما منافذ LAN للأجهزة الداخلية."
      },
      {
        question: "ما الشرط عند إعداد شبكة LAN الداخلية؟",
        options: ["يجب أن تكون نفس شبكة WAN", "يجب أن تكون مختلفة عن شبكة WAN لتجنب التعارض", "يجب أن تبدأ بـ 10.x.x.x", "لا يهم"],
        correct: 1,
        explanation: "شبكة LAN الداخلية يجب أن تختلف عن WAN ليستطيع جهاز التوجيه التمييز بين الحركة الداخلية والخارجية."
      },
      {
        question: "أين يُفضل وضع جهاز التوجيه اللاسلكي؟",
        options: ["في الركن البعيد من المنزل", "في موقع مركزي بعيد عن العوائق المعدنية", "بجانب التلفاز", "أي مكان"],
        correct: 1,
        explanation: "الموقع المركزي يوزع الإشارة بالتساوي على جميع الأجهزة، والعوائق المعدنية تضعف الإشارة."
      },
      {
        question: "ما الخطوة التالية بعد التوصيل الفيزيائي؟",
        options: ["الاختبار مباشرة", "إعداد WAN ثم LAN ثم اللاسلكي", "تثبيت برامج خاصة", "الاتصال بالدعم الفني"],
        correct: 1,
        explanation: "الترتيب الصحيح: إعداد WAN أولاً، ثم LAN، ثم DHCP، ثم الشبكة اللاسلكية."
      },
      {
        question: "ما بروتوكول أمان يُنصح باستخدامه؟",
        options: ["WEP", "بدون كلمة مرور", "WPA2 أو WPA3", "MAC Filtering فقط"],
        correct: 2,
        explanation: "WPA2/WPA3 يوفران تشفيراً قوياً. WEP قديم وضعيف ولا يُنصح باستخدامه."
      }
    ]
  },
  "switch-security": {
    title: "اختبار: أمان المحول",
    questions: [
      {
        question: "ما وظيفة Port Security؟",
        options: ["تشفير البيانات", "تحديد عدد عناوين MAC المسموح بها على المنفذ", "زيادة سرعة المنفذ", "إدارة VLANs"],
        correct: 1,
        explanation: "Port Security يُقيد الوصول للمنفذ بناءً على عناوين MAC لمنع الأجهزة غير المصرح بها."
      },
      {
        question: "ما وضع انتهاك Port Security الذي يوقف المنفذ؟",
        options: ["Protect", "Restrict", "Shutdown", "Block"],
        correct: 2,
        explanation: "وضع Shutdown يُوقف المنفذ تلقائياً عند الكشف عن انتهاك ويتطلب إعادة تفعيل يدوية."
      },
      {
        question: "ما وظيفة الأمر 'mac-address sticky'؟",
        options: ["حذف عناوين MAC", "تعلم عناوين MAC تلقائياً وحفظها في الإعداد", "منع تعلم عناوين MAC جديدة", "زيادة عدد العناوين المسموحة"],
        correct: 1,
        explanation: "Sticky يجعل المحول يتعلم عنوان MAC المتصل تلقائياً ويحفظه كعنوان ثابت مسموح."
      },
      {
        question: "كيف تُعيد تفعيل منفذ في حالة err-disabled؟",
        options: ["إعادة تشغيل المحول", "shutdown ثم no shutdown على المنفذ", "فصل الكابل وتوصيله", "حذف VLAN"],
        correct: 1,
        explanation: "تنفيذ 'shutdown' ثم 'no shutdown' على المنفذ يُعيد تفعيله بعد معالجة سبب الإيقاف."
      },
      {
        question: "ما أفضل ممارسة لأمان المنافذ غير المستخدمة؟",
        options: ["تركها بدون إعداد", "تعطيلها وتعيينها لـ VLAN غير مستخدم", "تفعيل Port Security عليها", "تحويلها لـ Trunk"],
        correct: 1,
        explanation: "تعطيل المنافذ غير المستخدمة ونقلها لـ VLAN معزول يمنع الوصول غير المصرح به."
      }
    ]
  },
  "router-security": {
    title: "اختبار: أمان جهاز التوجيه",
    questions: [
      {
        question: "ما الفرق بين 'enable password' و 'enable secret'؟",
        options: ["لا فرق", "enable secret مشفر بـ MD5، enable password نص واضح", "enable password أقوى", "enable secret للمشرفين فقط"],
        correct: 1,
        explanation: "enable secret يُخزن كلمة المرور مشفرة بـ MD5 وهو أكثر أماناً من enable password الذي يخزنها بنص واضح."
      },
      {
        question: "ما وظيفة أمر 'service password-encryption'؟",
        options: ["تعطيل كلمات المرور", "تشفير جميع كلمات المرور في ملف الإعداد", "إنشاء كلمة مرور تلقائية", "مزامنة كلمات المرور"],
        correct: 1,
        explanation: "هذا الأمر يُشفر جميع كلمات المرور الظاهرة بنص واضح في ملف الإعداد."
      },
      {
        question: "ما بروتوكول الاتصال عن بُعد الأكثر أماناً؟",
        options: ["Telnet", "SSH", "HTTP", "FTP"],
        correct: 1,
        explanation: "SSH يُشفر جميع البيانات المتبادلة بخلاف Telnet الذي يُرسلها بنص واضح."
      },
      {
        question: "ما وظيفة Banner MOTD؟",
        options: ["اسم جهاز التوجيه", "عرض رسالة تحذيرية عند تسجيل الدخول", "إعداد كلمة المرور", "تهيئة الواجهة"],
        correct: 1,
        explanation: "Banner MOTD (Message of the Day) يعرض رسالة تحذيرية لأي شخص يحاول الوصول للجهاز."
      },
      {
        question: "ما المتطلبات اللازمة لتفعيل SSH؟",
        options: ["كلمة مرور فقط", "اسم مضيف + اسم نطاق + مفاتيح RSA + مستخدم محلي", "فقط تفعيل الخدمة", "بروتوكول SSL فقط"],
        correct: 1,
        explanation: "SSH يحتاج: hostname، ip domain-name، توليد مفاتيح RSA، ومستخدم محلي للمصادقة."
      }
    ]
  },
  "standard-acl-1": {
    title: "اختبار: قوائم التحكم بالوصول (1)",
    questions: [
      {
        question: "ما نطاق أرقام Standard ACL؟",
        options: ["1-99", "100-199", "200-299", "1-199"],
        correct: 0,
        explanation: "Standard ACL تستخدم أرقام 1-99 (وأيضاً 1300-1999 في الأرقام الموسعة)."
      },
      {
        question: "ما معيار التصفية في Standard ACL؟",
        options: ["عنوان الوجهة فقط", "عنوان المصدر فقط", "المصدر والوجهة والبروتوكول", "رقم المنفذ فقط"],
        correct: 1,
        explanation: "Standard ACL تُصفي حركة البيانات بناءً على عنوان IP المصدر فقط."
      },
      {
        question: "أين يُفضل تطبيق Standard ACL؟",
        options: ["أقرب ما يمكن من المصدر", "أقرب ما يمكن من الوجهة", "في منتصف الشبكة", "على جميع الواجهات"],
        correct: 1,
        explanation: "Standard ACL تُوضع قرب الوجهة لأنها لا تُميز الوجهة، وتطبيقها قرب المصدر قد يمنع حركة مشروعة."
      },
      {
        question: "ما هي قاعدة الـ 'deny all' الضمنية؟",
        options: ["قاعدة اختيارية", "قاعدة مخفية في نهاية كل ACL ترفض كل ما لم يُصرح به", "قاعدة تُطبق على Trunk فقط", "قاعدة لـ IPv6 فقط"],
        correct: 1,
        explanation: "كل ACL تنتهي بـ 'deny any' ضمني مخفي، لذا يجب إضافة 'permit any' صريح إذا أردت السماح بالباقي."
      },
      {
        question: "ما الـ Wildcard Mask المقابل لـ 255.255.255.0؟",
        options: ["255.255.255.255", "0.0.0.255", "0.255.255.0", "255.0.0.0"],
        correct: 1,
        explanation: "Wildcard Mask هو عكس قناع الشبكة. 255.255.255.0 معكوسها 0.0.0.255."
      }
    ]
  },
  "standard-acl-2": {
    title: "اختبار: قوائم التحكم بالوصول (2)",
    questions: [
      {
        question: "ما ميزة Named ACL على Numbered ACL؟",
        options: ["أسرع في المعالجة", "يمكن تعديل قواعد فردية دون حذف القائمة كاملة", "تدعم IPv6 فقط", "لا تحتاج تطبيق على واجهة"],
        correct: 1,
        explanation: "Named ACL يتيح إضافة وحذف وتعديل قواعد فردية، بينما Numbered ACL تُحذف بالكامل لإعادة كتابتها."
      },
      {
        question: "كيف تُطبق ACL على واجهة؟",
        options: ["access-group apply", "ip access-group [اسم/رقم] [in/out]", "apply access-list", "acl bind interface"],
        correct: 1,
        explanation: "الأمر 'ip access-group' يُطبق ACL على واجهة بتحديد الاتجاه in (داخل) أو out (خارج)."
      },
      {
        question: "ما الفرق بين 'in' و 'out' عند تطبيق ACL؟",
        options: ["لا فرق", "in: تُفلتر الحركة الداخلة للواجهة، out: تُفلتر الخارجة منها", "in للداخل الخارجي out للداخل الداخلي", "in للـ IPv4 out للـ IPv6"],
        correct: 1,
        explanation: "in تُطبق على الحزم الواصلة إلى الواجهة، وout تُطبق على الحزم الخارجة منها."
      },
      {
        question: "ما أمر عرض جميع ACLs؟",
        options: ["show acl all", "display access-list", "show access-lists", "list ip acl"],
        correct: 2,
        explanation: "الأمر 'show access-lists' يعرض جميع قوائم التحكم بالوصول المعرفة مع عداد مطابقة كل قاعدة."
      },
      {
        question: "ماذا يحدث إذا لم تتطابق أي قاعدة في ACL؟",
        options: ["يُسمح بالحزمة", "تُرفض الحزمة بسبب deny all الضمني", "تُرسل للمنفذ الافتراضي", "تُرسل للمدير"],
        correct: 1,
        explanation: "القاعدة الضمنية deny any في نهاية كل ACL تضمن رفض أي حركة لم تُطابق قاعدة صريحة."
      }
    ]
  },
  "dhcp-server": {
    title: "اختبار: خادم DHCP",
    questions: [
      {
        question: "ما الأمر لاستثناء عناوين من توزيع DHCP؟",
        options: ["ip dhcp exclude", "ip dhcp excluded-address", "no dhcp assign", "dhcp reserve"],
        correct: 1,
        explanation: "الأمر 'ip dhcp excluded-address' يُحدد العناوين التي لن يوزعها خادم DHCP (للخوادم والبوابات)."
      },
      {
        question: "ما المعلومات الضرورية في إعداد DHCP Pool؟",
        options: ["عنوان الشبكة فقط", "network + default-router على الأقل", "dns-server فقط", "lease time فقط"],
        correct: 1,
        explanation: "كحد أدنى يحتاج Pool إلى: عنوان الشبكة (network) والبوابة الافتراضية (default-router)."
      },
      {
        question: "ما أمر عرض تخصيصات DHCP الحالية؟",
        options: ["show dhcp leases", "show ip dhcp binding", "display dhcp clients", "list dhcp assignments"],
        correct: 1,
        explanation: "الأمر 'show ip dhcp binding' يعرض جميع عناوين IP المخصصة وعناوين MAC الجهازة المرتبطة بها."
      },
      {
        question: "ما لمسة الإعداد في Packet Tracer لـ DHCP؟",
        options: ["CLI → router dhcp", "Server → Services → DHCP", "Switch → DHCP tab", "PC → Network settings"],
        correct: 1,
        explanation: "في Packet Tracer، يُعد DHCP من خادم مخصص عبر تبويب Services → DHCP."
      },
      {
        question: "لماذا نستثني عناوين في DHCP؟",
        options: ["لتوفير عناوين IP", "لحجب عناوين الخوادم والأجهزة الثابتة من التوزيع التلقائي", "لزيادة أمان الشبكة", "لدعم IPv6"],
        correct: 1,
        explanation: "الخوادم وأجهزة التوجيه تحتاج عناوين IP ثابتة. استثناؤها يمنع DHCP من منحها لأجهزة أخرى."
      }
    ]
  },
  "dns-http": {
    title: "اختبار: DNS و HTTP",
    questions: [
      {
        question: "ما وظيفة DNS؟",
        options: ["تخزين الملفات", "ترجمة أسماء النطاقات إلى عناوين IP", "إرسال البريد الإلكتروني", "توزيع عناوين IP"],
        correct: 1,
        explanation: "DNS يعمل كـ'دليل هاتف' للإنترنت، يترجم www.example.com إلى عنوان IP مثل 192.168.1.10."
      },
      {
        question: "ما نوع سجل DNS الذي يربط اسم بعنوان IPv4؟",
        options: ["AAAA Record", "MX Record", "A Record", "CNAME Record"],
        correct: 2,
        explanation: "سجل A (Address) يربط اسم النطاق بعنوان IPv4. AAAA للـ IPv6، MX للبريد، CNAME للأسماء البديلة."
      },
      {
        question: "ما منفذ HTTP الافتراضي؟",
        options: ["21", "25", "80", "443"],
        correct: 2,
        explanation: "HTTP يعمل على المنفذ 80، بينما HTTPS (المشفر) يعمل على المنفذ 443."
      },
      {
        question: "ما ترتيب الخطوات عند فتح www.example.com؟",
        options: ["HTTP مباشرة ← DNS", "DNS أولاً لتحويل الاسم لـ IP ← ثم HTTP للوصول للخادم", "DHCP ← DNS ← HTTP", "التوجيه ← HTTP"],
        correct: 1,
        explanation: "الترتيب: DNS يُحول الاسم لـ IP، ثم يتصل المتصفح بخادم HTTP باستخدام هذا الـ IP."
      },
      {
        question: "ما سجل DNS المستخدم لخادم البريد؟",
        options: ["A Record", "CNAME Record", "MX Record", "NS Record"],
        correct: 2,
        explanation: "سجل MX (Mail Exchanger) يُحدد خادم البريد المسؤول عن استقبال الرسائل لنطاق معين."
      }
    ]
  },
  "email-server": {
    title: "اختبار: خادم البريد الإلكتروني",
    questions: [
      {
        question: "ما بروتوكول إرسال البريد الإلكتروني؟",
        options: ["POP3", "IMAP", "SMTP", "FTP"],
        correct: 2,
        explanation: "SMTP (Simple Mail Transfer Protocol) يُستخدم لإرسال البريد بين الخوادم وللإرسال من العميل."
      },
      {
        question: "على أي منفذ يعمل SMTP؟",
        options: ["25", "110", "143", "465"],
        correct: 0,
        explanation: "SMTP يعمل على المنفذ 25 للتواصل بين الخوادم. المنفذ 587 للإرسال المصادق."
      },
      {
        question: "ما بروتوكول استقبال البريد المستخدم في Packet Tracer؟",
        options: ["SMTP", "POP3", "IMAP", "HTTP"],
        correct: 1,
        explanation: "Packet Tracer يدعم POP3 لاسترجاع البريد. POP3 يعمل على المنفذ 110."
      },
      {
        question: "ما المعلومات اللازمة لإعداد عميل بريد؟",
        options: ["الاسم فقط", "عنوان البريد + كلمة المرور + عناوين خوادم الإرسال والاستقبال", "IP الخادم فقط", "اسم المستخدم فقط"],
        correct: 1,
        explanation: "إعداد العميل يحتاج: البريد الإلكتروني، كلمة المرور، خادم SMTP للإرسال، وخادم POP3/IMAP للاستقبال."
      },
      {
        question: "لماذا نحتاج DNS مع خادم البريد؟",
        options: ["لتشفير البريد", "لربط اسم النطاق (مثل sara@school.com) بعنوان IP الخادم", "لتوزيع عناوين IP", "لا نحتاجه"],
        correct: 1,
        explanation: "سجل MX في DNS يُحدد خادم البريد لكل نطاق، بدونه لن يعرف المرسل أين يرسل البريد."
      }
    ]
  },
  "ftp": {
    title: "اختبار: بروتوكول FTP",
    questions: [
      {
        question: "ما وظيفة بروتوكول FTP؟",
        options: ["إرسال البريد الإلكتروني", "نقل الملفات بين الأجهزة", "الوصول عن بُعد", "تصفح المواقع"],
        correct: 1,
        explanation: "FTP (File Transfer Protocol) يُستخدم لرفع وتحميل الملفات بين الخادم والعميل."
      },
      {
        question: "على أي منفذ يتلقى FTP أوامر التحكم؟",
        options: ["20", "21", "22", "23"],
        correct: 1,
        explanation: "المنفذ 21 لأوامر التحكم والتحقق من الهوية، والمنفذ 20 لنقل البيانات الفعلي."
      },
      {
        question: "ما أمر FTP لتحميل ملف من الخادم؟",
        options: ["put", "upload", "get", "download"],
        correct: 2,
        explanation: "الأمر 'get' يُحمّل ملفاً من الخادم إلى العميل، بينما 'put' يرفع ملفاً من العميل للخادم."
      },
      {
        question: "ما الفرق الرئيسي بين FTP و TFTP؟",
        options: ["FTP أسرع", "FTP يتطلب مصادقة بينما TFTP لا يتطلب", "TFTP أكثر أماناً", "TFTP يدعم ملفات أكبر"],
        correct: 1,
        explanation: "TFTP (Trivial FTP) بسيط وسريع لكنه بلا مصادقة. يُستخدم لنقل ملفات الإعداد على أجهزة الشبكة."
      },
      {
        question: "على أي منفذ يعمل TFTP؟",
        options: ["21", "22", "69", "80"],
        correct: 2,
        explanation: "TFTP يعمل على المنفذ 69 باستخدام UDP بدلاً من TCP مما يجعله أخف وأسرع."
      }
    ]
  },
  "servers-exercise": {
    title: "اختبار: تمرين الخوادم الشامل",
    questions: [
      {
        question: "ما الترتيب الصحيح لإعداد خدمات الشبكة؟",
        options: ["HTTP ← DNS ← DHCP", "DHCP ← DNS ← HTTP ← Email", "Email ← FTP ← DNS", "لا يهم الترتيب"],
        correct: 1,
        explanation: "يُفضل إعداد DHCP أولاً لتوزيع العناوين، ثم DNS للأسماء، ثم الخدمات التي تعتمد عليهما."
      },
      {
        question: "لماذا نحتاج DNS مع خادم HTTP؟",
        options: ["لتشفير المحتوى", "للوصول للموقع باسم بدلاً من عنوان IP", "لزيادة السرعة", "للتحقق من الهوية"],
        correct: 1,
        explanation: "DNS يسمح بالوصول للموقع بكتابة www.school.com بدلاً من عنوان IP مثل 192.168.1.100."
      },
      {
        question: "ما الخطوة الأولى في التحقق من عمل الشبكة؟",
        options: ["فتح موقع ويب", "اختبار ping بين الأجهزة", "إرسال بريد إلكتروني", "تسجيل الدخول لخادم FTP"],
        correct: 1,
        explanation: "ping يتحقق من الاتصال الأساسي بين الأجهزة قبل اختبار الخدمات المتقدمة."
      },
      {
        question: "ما الخادم الذي يحتاج إعداد سجل MX في DNS؟",
        options: ["HTTP Server", "FTP Server", "Email Server", "DHCP Server"],
        correct: 2,
        explanation: "خادم البريد يحتاج سجل MX في DNS لأن بروتوكول SMTP يبحث عن سجل MX لتوجيه البريد."
      },
      {
        question: "ما فائدة تمرين خادم DHCP في الشبكة؟",
        options: ["تشفير البيانات", "تجنب تعارض العناوين وتوزيعها تلقائياً على الأجهزة", "زيادة سرعة الشبكة", "إدارة VLANs"],
        correct: 1,
        explanation: "DHCP يُوزع عناوين IP تلقائياً ويمنع التعارض الناتج عن تعيين نفس العنوان لأجهزة متعددة."
      }
    ]
  },
  "telnet-router": {
    title: "اختبار: Telnet للموجه",
    questions: [
      {
        question: "ما وظيفة بروتوكول Telnet؟",
        options: ["نقل الملفات", "الاتصال عن بُعد وإدارة الأجهزة عبر سطر الأوامر", "إرسال البريد", "تصفح الإنترنت"],
        correct: 1,
        explanation: "Telnet يُتيح التحكم عن بُعد بأجهزة الشبكة كأنك جالس أمامها مباشرة."
      },
      {
        question: "ما المشكلة الأمنية الرئيسية في Telnet؟",
        options: ["بطيء جداً", "يُرسل جميع البيانات بنص واضح غير مشفر", "لا يدعم IPv6", "يحتاج موارد كثيرة"],
        correct: 1,
        explanation: "Telnet لا يُشفر البيانات، بما فيها كلمات المرور، مما يجعلها عرضة للاعتراض."
      },
      {
        question: "على أي خطوط يُعد Telnet في Cisco؟",
        options: ["Console lines", "VTY lines", "AUX lines", "Serial lines"],
        correct: 1,
        explanation: "خطوط VTY (Virtual Terminal) هي التي تُستخدم للاتصال عن بُعد عبر Telnet أو SSH."
      },
      {
        question: "ما البديل الآمن لـ Telnet؟",
        options: ["HTTP", "FTP", "SSH", "TFTP"],
        correct: 2,
        explanation: "SSH (Secure Shell) يُشفر جميع البيانات ويوفر مصادقة أقوى من Telnet."
      },
      {
        question: "ما سبب الحاجة لكلمة مرور Enable عند Telnet؟",
        options: ["لفتح الاتصال", "للانتقال من وضع المستخدم إلى وضع الامتياز", "لإنهاء الاتصال", "لتشفير البيانات"],
        correct: 1,
        explanation: "عند الاتصال بـ Telnet تبدأ في وضع المستخدم (>). للوصول لوضع الامتياز (#) تحتاج كلمة مرور Enable."
      }
    ]
  },
  "telnet-switch": {
    title: "اختبار: Telnet للمحول و SVI",
    questions: [
      {
        question: "ما هو SVI؟",
        options: ["بروتوكول توجيه", "واجهة افتراضية تمنح المحول عنوان IP للإدارة", "نوع من أنواع VLANs", "برتوكول أمان"],
        correct: 1,
        explanation: "SVI (Switch Virtual Interface) هو واجهة منطقية يُعطى لها عنوان IP لإدارة المحول عن بُعد."
      },
      {
        question: "ما الأمر لإنشاء SVI على VLAN 1؟",
        options: ["create svi vlan 1", "interface vlan 1", "svi vlan 1 enable", "add management vlan 1"],
        correct: 1,
        explanation: "الأمر 'interface vlan 1' يفتح واجهة SVI الخاصة بـ VLAN 1."
      },
      {
        question: "لماذا يحتاج المحول لـ ip default-gateway؟",
        options: ["لتفعيل VLANs", "للوصول للمحول من شبكة مختلفة", "لتفعيل SVI", "لإعداد Trunk"],
        correct: 1,
        explanation: "المحول يحتاج default-gateway للرد على الطلبات الإدارية القادمة من شبكة مختلفة عبر جهاز توجيه."
      },
      {
        question: "ما عدد خطوط VTY في المحولات عادةً؟",
        options: ["5 خطوط (0-4)", "16 خطاً (0-15)", "8 خطوط (0-7)", "32 خطاً"],
        correct: 1,
        explanation: "المحولات تدعم عادةً 16 خطاً من VTY (0-15) للسماح بـ 16 اتصالاً متزامناً."
      },
      {
        question: "ما الأمر للتحقق من عنوان IP على المحول؟",
        options: ["show ip address", "show interface brief", "show ip interface brief", "display ip"],
        correct: 2,
        explanation: "الأمر 'show ip interface brief' يعرض جميع الواجهات بما فيها SVI وعناوين IP المعيّنة."
      }
    ]
  },
  "iot-basics": {
    title: "اختبار: مبادئ IoT",
    questions: [
      {
        question: "ما تعريف إنترنت الأشياء (IoT)؟",
        options: ["شبكة كمبيوترات فقط", "شبكة أجهزة فيزيائية متصلة بالإنترنت تجمع وتشارك البيانات", "برنامج لإدارة الشبكات", "بروتوكول اتصال"],
        correct: 1,
        explanation: "IoT هو مفهوم ربط الأجهزة الفيزيائية بالإنترنت لجمع البيانات والتحكم بها عن بُعد."
      },
      {
        question: "ما وظيفة الحساس (Sensor) في IoT؟",
        options: ["تنفيذ إجراءات فيزيائية", "جمع البيانات من البيئة المحيطة", "توجيه البيانات", "تخزين البيانات"],
        correct: 1,
        explanation: "الحساسات تقيس المتغيرات البيئية كالحرارة والرطوبة والضوء وتحوّلها لبيانات رقمية."
      },
      {
        question: "ما الفرق بين Sensor و Actuator؟",
        options: ["لا فرق", "Sensor يجمع البيانات، Actuator ينفذ إجراءات فيزيائية", "Actuator أغلى دائماً", "Sensor لاسلكي فقط"],
        correct: 1,
        explanation: "Sensor يقرأ من البيئة (مدخل)، Actuator يؤثر في البيئة (مخرج) مثل تشغيل محرك أو ضوء."
      },
      {
        question: "ما وظيفة البوابة (Gateway) في IoT؟",
        options: ["تخزين البيانات", "ربط أجهزة IoT بالإنترنت والسحابة", "توليد الطاقة", "عرض البيانات"],
        correct: 1,
        explanation: "البوابة تعمل كوسيط يجمع بيانات أجهزة IoT وترسلها للسحابة أو تستقبل الأوامر منها."
      },
      {
        question: "أي من التطبيقات التالية مثال على IoT؟",
        options: ["برنامج معالج النصوص", "ترموستات ذكي يتحكم في التكييف عن بُعد", "خادم بريد إلكتروني", "برنامج تصميم"],
        correct: 1,
        explanation: "الترموستات الذكي جهاز فيزيائي متصل بالإنترنت يجمع بيانات الحرارة ويُتيح التحكم عن بُعد."
      }
    ]
  },
  "iot-terms": {
    title: "اختبار: مصطلحات IoT",
    questions: [
      {
        question: "ما معنى M2M؟",
        options: ["Mobile to Mobile", "Machine to Machine - تواصل مباشر بين الآلات", "Managed to Managed", "Multi to Multi"],
        correct: 1,
        explanation: "M2M (Machine to Machine) يشير لتواصل الأجهزة مع بعضها تلقائياً دون تدخل بشري."
      },
      {
        question: "ما بروتوكول IoT المناسب للأجهزة ذات الموارد المحدودة؟",
        options: ["HTTP", "FTP", "MQTT", "SMTP"],
        correct: 2,
        explanation: "MQTT بروتوكول خفيف الوزن مصمم خصيصاً للأجهزة ذات الموارد المحدودة وشبكات الحيز الضيق."
      },
      {
        question: "ما هو Edge Computing؟",
        options: ["معالجة البيانات في السحابة البعيدة", "معالجة البيانات قرب مصدرها لتقليل التأخير", "نوع من الحساسات", "بروتوكول اتصال"],
        correct: 1,
        explanation: "Edge Computing يُعالج البيانات قرب الجهاز المصدر بدلاً من إرسالها للسحابة، مما يُقلل التأخير."
      },
      {
        question: "ما أحد أكبر تحديات IoT؟",
        options: ["كثرة الأجهزة", "الأمان وحماية الأجهزة والبيانات من الاختراق", "ارتفاع الأسعار", "محدودية الاستخدامات"],
        correct: 1,
        explanation: "أمن IoT تحدٍّ كبير لأن ملايين الأجهزة المتصلة تُشكل أهدافاً للهجمات الإلكترونية."
      },
      {
        question: "ما البروتوكول المناسب للـ IoT في المدى الطويل؟",
        options: ["Bluetooth", "Wi-Fi", "LoRaWAN", "NFC"],
        correct: 2,
        explanation: "LoRaWAN مناسب للمسافات الطويلة (كيلومترات) بطاقة منخفضة جداً، مثالي للمدن الذكية والزراعة."
      }
    ]
  },
  "iot-wireless": {
    title: "اختبار: المكونات اللاسلكية في IoT",
    questions: [
      {
        question: "ما تقنية الاتصال الأنسب لجهاز استشعار بعيد في حقل زراعي؟",
        options: ["Bluetooth", "Wi-Fi", "NFC", "LoRa"],
        correct: 3,
        explanation: "LoRa يصل لمسافات تصل لـ 15 كم بطاقة منخفضة جداً، مثالي للتطبيقات الزراعية البعيدة."
      },
      {
        question: "ما تقنية NFC؟",
        options: ["اتصال بعيد المدى", "اتصال لاسلكي قصير جداً (حتى 10 سم)", "بروتوكول سحابي", "شبكة محلية"],
        correct: 1,
        explanation: "NFC (Near Field Communication) يعمل على مسافة لا تتجاوز 10 سم، مستخدم في الدفع الإلكتروني والبطاقات الذكية."
      },
      {
        question: "ما تقنية الاتصال الأنسب للساعة الذكية؟",
        options: ["LoRa", "Wi-Fi", "BLE (Bluetooth Low Energy)", "Zigbee"],
        correct: 2,
        explanation: "BLE مثالي للأجهزة القابلة للارتداء لاستهلاكه المنخفض جداً للطاقة مع مدى كافٍ."
      },
      {
        question: "ما ميزة Zigbee عن Wi-Fi؟",
        options: ["Zigbee أسرع", "Zigbee أكثر أماناً", "Zigbee يستهلك طاقة أقل بكثير", "Zigbee مدى أبعد"],
        correct: 2,
        explanation: "Zigbee مصمم للأجهزة ذات البطارية المحدودة، يستهلك طاقة أقل بكثير من Wi-Fi."
      },
      {
        question: "أي تقنية تستخدم في أتمتة المنزل مثل إضاءة Philips Hue؟",
        options: ["LoRa", "Zigbee", "NFC", "Bluetooth Classic"],
        correct: 1,
        explanation: "Zigbee شائع جداً في أتمتة المنازل وإضاءة الأجهزة الذكية لكفاءته في الطاقة وقدرته على شبكات Mesh."
      }
    ]
  }
};
const mergedQuizzes = { ...quizData, ...NEW_UNIT_QUIZZES };
const PROGRESS_KEY$1 = "topic-progress";
const QUIZ_KEY$1 = "quiz-results";
function loadLocal(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || "{}");
  } catch {
    return {};
  }
}
async function syncProgressToServer() {
  try {
    const session = getStudentSession();
    if (!session) return;
    const topicProgress = loadLocal(PROGRESS_KEY$1);
    const quizResults = loadLocal(QUIZ_KEY$1);
    const totalTopics2 = courseData.reduce((s, sec) => s + sec.topics.length, 0);
    const visitedTopics = Object.keys(topicProgress).filter((k) => {
      var _a;
      return (_a = topicProgress[k]) == null ? void 0 : _a.visited;
    }).length;
    const completedQuizzes = Object.keys(quizResults).length;
    const avgScore = completedQuizzes > 0 ? Math.round(Object.values(quizResults).reduce((s, r) => s + (r.score || 0), 0) / completedQuizzes) : 0;
    const payload = {
      student_email: session.student_code,
      // معرّف بديل (الرمز فريد لكل طالب)
      student_name: session.student_name || session.student_code,
      topic_progress: topicProgress,
      quiz_results: quizResults,
      total_topics_visited: visitedTopics,
      total_quizzes_completed: completedQuizzes,
      avg_quiz_score: avgScore,
      last_synced_at: (/* @__PURE__ */ new Date()).toISOString()
    };
    const existing = await studentApi("filter", "StudentProgress", { query: {} });
    if (existing && existing.length > 0) {
      await studentApi("update", "StudentProgress", {
        id: existing[0].id,
        data: payload
      });
    } else {
      await studentApi("create", "StudentProgress", { data: payload });
    }
  } catch (e) {
    console.warn("Progress sync failed:", e);
  }
}
const terminalData = {
  "mac-addresses": {
    device: "Switch",
    prompt: "Switch#",
    description: "جرب أوامر المحول للتعرف على عناوين MAC",
    commands: {
      "show mac address-table": {
        output: `          Mac Address Table
-------------------------------------------
Vlan    Mac Address       Type        Ports
----    -----------       --------    -----
   1    0010.1111.aaaa    DYNAMIC     Fa0/1
   1    0010.2222.bbbb    DYNAMIC     Fa0/2
   1    0010.3333.cccc    DYNAMIC     Fa0/3
   1    aaaa.bbbb.cccc    STATIC      Fa0/4
Total Mac Addresses for this criterion: 4`
      },
      "show mac address-table count": {
        output: `Mac Entries for Vlan 1:
---------------------------
Dynamic Address Count  :   3
Static  Address Count  :   1
Total Mac Addresses    :   4`
      },
      "show interfaces fa0/1": {
        output: `FastEthernet0/1 is up, line protocol is up (connected)
  Hardware is Lance, address is 0010.1111.aaaa (bia 0010.1111.aaaa)
  MTU 1500 bytes, BW 100000 Kbit, DLY 1000 usec,
  Full-duplex, 100Mb/s
  input flow-control is off, output flow-control is off
  Auto-duplex, Auto-speed`
      },
      "clear mac address-table dynamic": {
        output: `MAC address table cleared.`
      },
      "show arp": {
        output: `Protocol  Address          Age (min)  Hardware Addr   Type   Interface
Internet  192.168.1.1             -   aabb.ccdd.eeff  ARPA   Vlan1
Internet  192.168.1.10            2   0010.1111.aaaa  ARPA   Vlan1
Internet  192.168.1.20            5   0010.2222.bbbb  ARPA   Vlan1`
      }
    }
  },
  "ipv4-addresses": {
    device: "Router",
    prompt: "Router#",
    description: "جرب أوامر التحقق من عناوين IPv4",
    commands: {
      "show ip interface brief": {
        output: `Interface              IP-Address      OK? Method Status                Protocol
GigabitEthernet0/0     192.168.1.1     YES NVRAM  up                    up
GigabitEthernet0/1     10.0.0.1        YES NVRAM  up                    up
GigabitEthernet0/2     unassigned      YES NVRAM  administratively down down
Loopback0              1.1.1.1         YES NVRAM  up                    up`
      },
      "show ip route": {
        output: `Codes: L - local, C - connected, S - static, R - RIP, O - OSPF

Gateway of last resort is 10.0.0.2 to network 0.0.0.0

C     10.0.0.0/30 is directly connected, GigabitEthernet0/1
L     10.0.0.1/32 is directly connected, GigabitEthernet0/1
C     192.168.1.0/24 is directly connected, GigabitEthernet0/0
L     192.168.1.1/32 is directly connected, GigabitEthernet0/0
S*    0.0.0.0/0 [1/0] via 10.0.0.2`
      },
      "show interfaces gi0/0": {
        output: `GigabitEthernet0/0 is up, line protocol is up
  Hardware is ISR4331-3x1GE, address is aabb.ccdd.1100 (bia aabb.ccdd.1100)
  Internet address is 192.168.1.1/24
  MTU 1500 bytes, BW 1000000 Kbit/sec
  Full Duplex, 1000Mbps, link type is auto`
      },
      "ping 192.168.1.10": {
        output: `Type escape sequence to abort.
Sending 5, 100-byte ICMP Echos to 192.168.1.10, timeout is 2 seconds:
!!!!!
Success rate is 100 percent (5/5), round-trip min/avg/max = 1/2/4 ms`
      },
      "ping 8.8.8.8": {
        output: `Type escape sequence to abort.
Sending 5, 100-byte ICMP Echos to 8.8.8.8, timeout is 2 seconds:
!!!!!
Success rate is 100 percent (5/5), round-trip min/avg/max = 10/15/22 ms`
      }
    }
  },
  "dhcp": {
    device: "Router",
    prompt: "Router#",
    description: "جرب أوامر فحص خادم DHCP",
    commands: {
      "show ip dhcp binding": {
        output: `Bindings from all pools not associated with VRF:
IP address       Client-ID/              Lease expiration        Type
                 Hardware address/
                 User name
192.168.1.100    0100.1122.3344.55       Apr 04 2026 08:00 AM    Automatic
192.168.1.101    0100.aabb.ccdd.ee       Apr 04 2026 09:30 AM    Automatic
192.168.1.102    0100.1234.5678.9a       Apr 04 2026 10:15 AM    Automatic`
      },
      "show ip dhcp pool": {
        output: `Pool OFFICE :
 Utilization mark (high/low)    : 100 / 0
 Subnet size (first/next)       : 0 / 0
 Total addresses                : 254
 Leased addresses               : 3
 Pending event                  : none
 1 subnet is currently in the pool :
 Current index        IP address range                    Leased addresses
 192.168.1.103        192.168.1.1      - 192.168.1.254     3`
      },
      "show ip dhcp server statistics": {
        output: `Memory usage         35063
Address pools        1
Database agents      0
Automatic bindings   3
Manual bindings      0
Expired bindings     0
Malformed messages   0
Secure arp entries   0

Message              Received
BOOTREQUEST          0
DHCPDISCOVER         5
DHCPREQUEST          3
DHCPDECLINE          0
DHCPRELEASE          2
DHCPINFORM           0

Message              Sent
BOOTREPLY            0
DHCPOFFER            5
DHCPACK              3
DHCPNAK              0`
      },
      "show running-config | section dhcp": {
        output: `ip dhcp excluded-address 192.168.1.1 192.168.1.10
!
ip dhcp pool OFFICE
 network 192.168.1.0 255.255.255.0
 default-router 192.168.1.1
 dns-server 8.8.8.8
 lease 1`
      }
    }
  },
  "nat": {
    device: "Router",
    prompt: "Router#",
    description: "جرب أوامر فحص NAT",
    commands: {
      "show ip nat translations": {
        output: `Pro Inside global      Inside local       Outside local      Outside global
tcp 203.0.113.10:80   192.168.1.10:80    ---                ---
tcp 203.0.113.11:80   192.168.1.11:80    ---                ---
--- 203.0.113.12      192.168.1.12       ---                ---`
      },
      "show ip nat statistics": {
        output: `Total active translations: 3 (2 static, 1 dynamic; 0 extended)
Outside interfaces:
  GigabitEthernet0/1
Inside interfaces:
  GigabitEthernet0/0
Hits: 156  Misses: 0
CEF Translated packets: 156, CEF Punted packets: 0
Expired translations: 12
Dynamic mappings:
-- Inside Source
[Id: 1] access-list 1 pool NAT_POOL refcount 1
 pool NAT_POOL: netmask 255.255.255.0
        start 203.0.113.10 end 203.0.113.20
        type generic, total addresses 11, allocated 1 (9%), misses 0`
      },
      "clear ip nat translation *": {
        output: `NAT translations cleared.`
      },
      "show running-config | include nat": {
        output: `ip nat inside source static 192.168.1.10 203.0.113.10
ip nat inside source static 192.168.1.11 203.0.113.11
 ip nat inside
 ip nat outside`
      }
    }
  },
  "pat": {
    device: "Router",
    prompt: "Router#",
    description: "جرب أوامر فحص PAT/NAT Overload",
    commands: {
      "show ip nat translations": {
        output: `Pro Inside global        Inside local           Outside local      Outside global
tcp 203.0.113.1:2001    192.168.1.10:1025      8.8.8.8:53         8.8.8.8:53
tcp 203.0.113.1:2002    192.168.1.11:1026      142.250.80.46:80   142.250.80.46:80
tcp 203.0.113.1:2003    192.168.1.12:1025      93.184.216.34:443  93.184.216.34:443
udp 203.0.113.1:3001    192.168.1.10:5353      8.8.8.8:53         8.8.8.8:53`
      },
      "show ip nat statistics": {
        output: `Total active translations: 4 (0 static, 4 dynamic; 4 extended)
Outside interfaces: GigabitEthernet0/1
Inside interfaces:  GigabitEthernet0/0
Hits: 1432  Misses: 0
Dynamic mappings:
-- Inside Source
[Id: 1] access-list 1 interface GigabitEthernet0/1 refcount 4
Overloading enabled, using port allocation: 2048-65535`
      },
      "show access-lists 1": {
        output: `Standard IP access list 1
    10 permit 192.168.1.0, wildcard bits 0.0.0.255 (1432 matches)`
      }
    }
  },
  "vlan-cli": {
    device: "Switch",
    prompt: "Switch#",
    description: "جرب أوامر إعداد VLAN",
    commands: {
      "show vlan brief": {
        output: `VLAN Name                             Status    Ports
---- -------------------------------- --------- -------------------------------
1    default                          active    Fa0/5, Fa0/6, Fa0/7, Fa0/8
10   Sales                            active    Fa0/1, Fa0/2
20   Accounting                       active    Fa0/3, Fa0/4
30   IT                               active    Fa0/9, Fa0/10
1002 fddi-default                     act/unsup
1003 token-ring-default               act/unsup
1004 fddinet-default                  act/unsup
1005 trnet-default                    act/unsup`
      },
      "show interfaces trunk": {
        output: `Port        Mode         Encapsulation  Status        Native vlan
Gi0/1       on           802.1q         trunking      1

Port        Vlans allowed on trunk
Gi0/1       10,20,30

Port        Vlans allowed and active in management domain
Gi0/1       10,20,30

Port        Vlans in spanning tree forwarding state and not pruned
Gi0/1       10,20,30`
      },
      "show interfaces fa0/1 switchport": {
        output: `Name: Fa0/1
Switchport: Enabled
Administrative Mode: static access
Operational Mode: static access
Administrative Trunking Encapsulation: dot1q
Operational Trunking Encapsulation: native
Negotiation of Trunking: Off
Access Mode VLAN: 10 (Sales)
Trunking Native Mode VLAN: 1 (default)`
      },
      "show spanning-tree vlan 10": {
        output: `VLAN0010
  Spanning tree enabled protocol ieee
  Root ID    Priority    32778
             Address     aabb.ccdd.1100
             This bridge is the root
             Hello Time   2 sec  Max Age 20 sec  Forward Delay 15 sec

  Bridge ID  Priority    32778  (priority 32768 sys-id-ext 10)
             Address     aabb.ccdd.1100
             Hello Time   2 sec  Max Age 20 sec  Forward Delay 15 sec
             Aging Time  300 sec

Interface           Role Sts Cost      Prio.Nbr Type
------------------- ---- --- --------- -------- --------------------------------
Fa0/1               Desg FWD 19        128.1    P2p
Fa0/2               Desg FWD 19        128.2    P2p
Gi0/1               Desg FWD 4         128.25   P2p`
      }
    }
  },
  "static-routing": {
    device: "Router",
    prompt: "Router#",
    description: "جرب أوامر التوجيه الثابت",
    commands: {
      "show ip route": {
        output: `Codes: L - local, C - connected, S - static

Gateway of last resort is 10.0.0.2 to network 0.0.0.0
S*    0.0.0.0/0 [1/0] via 10.0.0.2
      10.0.0.0/8 is variably subnetted, 2 subnets, 2 masks
C        10.0.0.0/30 is directly connected, GigabitEthernet0/1
L        10.0.0.1/32 is directly connected, GigabitEthernet0/1
      192.168.1.0/24 is variably subnetted, 2 subnets, 2 masks
C        192.168.1.0/24 is directly connected, GigabitEthernet0/0
L        192.168.1.1/32 is directly connected, GigabitEthernet0/0
S     192.168.2.0/24 [1/0] via 10.0.0.2
S     192.168.3.0/24 [1/0] via 10.0.0.2`
      },
      "show ip route static": {
        output: `Codes: S - static

S*    0.0.0.0/0 [1/0] via 10.0.0.2
S     192.168.2.0/24 [1/0] via 10.0.0.2
S     192.168.3.0/24 [1/0] via 10.0.0.2`
      },
      "ping 192.168.2.1": {
        output: `Type escape sequence to abort.
Sending 5, 100-byte ICMP Echos to 192.168.2.1, timeout is 2 seconds:
!!!!!
Success rate is 100 percent (5/5), round-trip min/avg/max = 1/2/5 ms`
      },
      "ping 192.168.99.1": {
        output: `Type escape sequence to abort.
Sending 5, 100-byte ICMP Echos to 192.168.99.1, timeout is 2 seconds:
.....
Success rate is 0 percent (0/5)`
      },
      "traceroute 192.168.3.10": {
        output: `Type escape sequence to abort.
Tracing the route to 192.168.3.10

  1   10.0.0.2        1 msec  1 msec  1 msec
  2   10.0.1.2        2 msec  2 msec  3 msec
  3   192.168.3.10    3 msec  3 msec  4 msec`
      }
    }
  },
  "ospf": {
    device: "Router",
    prompt: "Router#",
    description: "جرب أوامر فحص OSPF",
    commands: {
      "show ip ospf neighbor": {
        output: `Neighbor ID     Pri   State           Dead Time   Address         Interface
2.2.2.2           1   FULL/DR         00:00:33    10.0.0.2        GigabitEthernet0/1
3.3.3.3           1   FULL/BDR        00:00:38    10.0.1.2        GigabitEthernet0/2`
      },
      "show ip ospf": {
        output: `Routing Process "ospf 1" with ID 1.1.1.1
 Start time: 00:01:30.000, Time elapsed: 02:15:45.123
 Supports only single TOS(TOS0) routes
 Supports opaque LSA
 Supports Link-local Signaling (LLS)
 It is an area border and autonomous system boundary router
 Number of areas in this router is 1. 1 normal 0 stub 0 nssa
 Number of interfaces in this router is 3
   Area BACKBONE(0)
       Number of interfaces in this area is 3
       SPF algorithm last executed 00:02:10.456 ago
       Number of LSA 6. Checksum Sum 0x028FCA`
      },
      "show ip ospf interface gi0/1": {
        output: `GigabitEthernet0/1 is up, line protocol is up
  Internet Address 10.0.0.1/30, Area 0, Attached via Network Statement
  Process ID 1, Router ID 1.1.1.1, Network Type BROADCAST, Cost: 1
  Transmit Delay is 1 sec, State DR, Priority 1
  Designated Router (ID) 1.1.1.1, Interface address 10.0.0.1
  Backup Designated router (ID) 2.2.2.2, Interface address 10.0.0.2
  Timer intervals configured, Hello 10, Dead 40, Wait 40, Retransmit 5
  Hello due in 00:00:02
  Neighbor Count is 1, Adjacent neighbor count is 1`
      },
      "show ip route ospf": {
        output: `Codes: O - OSPF

O     172.16.1.0/24 [110/2] via 10.0.0.2, 02:10:15, GigabitEthernet0/1
O     172.16.2.0/24 [110/3] via 10.0.0.2, 02:10:15, GigabitEthernet0/1
O     192.168.10.0/24 [110/2] via 10.0.1.2, 01:50:30, GigabitEthernet0/2`
      }
    }
  },
  "rip": {
    device: "Router",
    prompt: "Router#",
    description: "جرب أوامر فحص RIP",
    commands: {
      "show ip rip database": {
        output: `192.168.1.0/24    auto-summary
192.168.1.0/24    directly connected, GigabitEthernet0/0
192.168.2.0/24
    [2] via 10.0.0.2, 00:00:12, GigabitEthernet0/1
192.168.3.0/24
    [3] via 10.0.0.2, 00:00:12, GigabitEthernet0/1
10.0.0.0/30       auto-summary
10.0.0.0/30       directly connected, GigabitEthernet0/1`
      },
      "show ip protocols": {
        output: `*** IP Routing is NSF aware ***

Routing Protocol is "rip"
  Outgoing update filter list for all interfaces is not set
  Incoming update filter list for all interfaces is not set
  Sending updates every 30 seconds, next due in 17 seconds
  Invalid after 180 seconds, hold down 180, flushed after 240
  Redistributing: rip
  Default version control: send version 2, receive version 2
    Interface             Send  Recv  Triggered RIP  Key-chain
    GigabitEthernet0/0    2     2
    GigabitEthernet0/1    2     2
  Automatic network summarization is not in effect
  Maximum path: 4
  Routing for Networks:
    10.0.0.0
    192.168.1.0
  Routing Information Sources:
    Gateway         Distance      Last Update
    10.0.0.2             120      00:00:12
  Distance: (default is 120)`
      },
      "show ip route rip": {
        output: `Codes: R - RIP

R     192.168.2.0/24 [120/1] via 10.0.0.2, 00:00:12, GigabitEthernet0/1
R     192.168.3.0/24 [120/2] via 10.0.0.2, 00:00:12, GigabitEthernet0/1`
      },
      "debug ip rip": {
        output: `RIP protocol debugging is on
RIP: sending v2 update to 224.0.0.9 via GigabitEthernet0/0 (192.168.1.1)
RIP: build update entries
      192.168.2.0/24 via 0.0.0.0, metric 2, tag 0
      192.168.3.0/24 via 0.0.0.0, metric 3, tag 0
RIP: received v2 update from 10.0.0.2 on GigabitEthernet0/1
      192.168.2.0/24 -> 0.0.0.0 in 1 hops
      192.168.3.0/24 -> 0.0.0.0 in 2 hops`
      }
    }
  },
  "tracert-rip": {
    device: "Router",
    prompt: "Router#",
    description: "جرب Traceroute والأوامر المرتبطة",
    commands: {
      "traceroute 192.168.3.10": {
        output: `Type escape sequence to abort.
Tracing the route to 192.168.3.10
VRF info: (vrf in name/id, vrf out name/id)
  1   10.0.0.2 [AS 1]  2 msec  1 msec  2 msec
  2   10.0.1.2 [AS 1]  3 msec  3 msec  4 msec
  3   192.168.3.10 [AS 1]  5 msec  4 msec  5 msec`
      },
      "ping 192.168.3.10": {
        output: `Type escape sequence to abort.
Sending 5, 100-byte ICMP Echos to 192.168.3.10, timeout is 2 seconds:
!!!!!
Success rate is 100 percent (5/5), round-trip min/avg/max = 4/5/8 ms`
      },
      "show ip route": {
        output: `R     192.168.2.0/24 [120/1] via 10.0.0.2, 00:00:08, GigabitEthernet0/1
R     192.168.3.0/24 [120/2] via 10.0.0.2, 00:00:08, GigabitEthernet0/1
C     192.168.1.0/24 is directly connected, GigabitEthernet0/0
C     10.0.0.0/30 is directly connected, GigabitEthernet0/1`
      },
      "traceroute 10.0.0.2": {
        output: `Tracing the route to 10.0.0.2
  1   10.0.0.2  1 msec  1 msec  1 msec`
      }
    }
  },
  "switch-security": {
    device: "Switch",
    prompt: "Switch#",
    description: "جرب أوامر أمان المحول",
    commands: {
      "show port-security": {
        output: `Secure Port  MaxSecureAddr  CurrentAddr  SecurityViolation  Security Action
              (Count)        (Count)       (Count)
---------------------------------------------------------------------------
      Fa0/1              1              1                 0         Shutdown
      Fa0/2              1              1                 0         Restrict
      Fa0/3              2              1                 0         Protect
---------------------------------------------------------------------------
Total Addresses in System (excluding one mac per port)     : 0
Max Addresses limit in System (excluding one mac per port) : 4096`
      },
      "show port-security interface fa0/1": {
        output: `Port Security              : Enabled
Port Status               : Secure-up
Violation Mode            : Shutdown
Aging Time                : 0 mins
Aging Type                : Absolute
SecureStatic Address Aging : Disabled
Maximum MAC Addresses      : 1
Total MAC Addresses        : 1
Configured MAC Addresses   : 0
Sticky MAC Addresses       : 1
Last Source Address:Vlan   : 0010.1111.aaaa:1
Security Violation Count   : 0`
      },
      "show port-security address": {
        output: `               Secure Mac Address Table
-----------------------------------------------------------------------------
Vlan    Mac Address       Type                          Ports   Remaining Age
                                                                   (mins)
----    -----------       ----                          -----   -------------
   1    0010.1111.aaaa    SecureSticky                  Fa0/1        -
   1    0010.2222.bbbb    SecureSticky                  Fa0/2        -
   1    0010.3333.cccc    SecureConfigured              Fa0/3        -
-----------------------------------------------------------------------------
Total Addresses in System (excluding one mac per port)     : 2
Max Addresses limit in System (excluding one mac per port) : 4096`
      },
      "show interfaces fa0/1 status": {
        output: `Port      Name               Status       Vlan       Duplex  Speed Type
Fa0/1                        connected    1          a-full  a-100 10/100BaseTX`
      }
    }
  },
  "router-security": {
    device: "Router",
    prompt: "Router#",
    description: "جرب أوامر فحص أمان جهاز التوجيه",
    commands: {
      "show running-config | include password": {
        output: `enable secret 5 $1$mERr$hx5rVt7rPNoS4wqbXKX7m0
 password 7 08701E1D5D4C
line vty 0 4
 password 7 060506324F41`
      },
      "show running-config | include banner": {
        output: `banner motd ^C
*** تحذير: الوصول غير المصرح به ممنوع ***
*** جميع الأنشطة مراقبة ومسجلة ***
^C`
      },
      "show users": {
        output: `    Line       User       Host(s)              Idle       Location
*  0 con 0                idle                 00:00:00
   2 vty 0    admin      192.168.1.10         00:02:15`
      },
      "show line vty 0 4": {
        output: `   Tty Typ     Tx/Rx    A Modem  Roty AccO AccI   Uses   Noise  Overruns   Int
*    2 VTY  9600/9600  -    -      -    -    -      3       0     0/0       -
     3 VTY  9600/9600  -    -      -    -    -      0       0     0/0       -
     4 VTY  9600/9600  -    -      -    -    -      0       0     0/0       -

 Transport input: ssh
 Transport output: ssh`
      },
      "show version": {
        output: `Cisco IOS Software, Version 15.4(3)M2
Technical Support: http://www.cisco.com/techsupport
ROM: System Bootstrap, Version 15.4(3r)M2

Router uptime is 2 days, 5 hours, 30 minutes
System image file is "flash:c2900-universalk9-mz.SPA.154-3.M2.bin"

Cisco CISCO2911/K9 (revision 1.0) with 491520K/32768K bytes of memory.
Processor board ID FTX152400KS
3 Gigabit Ethernet interfaces
1 Serial interface
DRAM configuration is 64 bits wide with parity disabled.
255K bytes of non-volatile configuration memory.
250880K bytes of ATA System CompactFlash 0 (Read/Write)`
      }
    }
  },
  "standard-acl-1": {
    device: "Router",
    prompt: "Router#",
    description: "جرب أوامر فحص قوائم التحكم بالوصول",
    commands: {
      "show access-lists": {
        output: `Standard IP access list 1
    10 permit 192.168.10.0, wildcard bits 0.0.0.255 (125 matches)
    20 deny   192.168.20.0, wildcard bits 0.0.0.255 (47 matches)
    30 permit any (312 matches)
Standard IP access list 2
    10 permit host 192.168.1.10 (23 matches)
    20 deny   any`
      },
      "show ip access-lists": {
        output: `Standard IP access list 1
    10 permit 192.168.10.0, wildcard bits 0.0.0.255 (125 matches)
    20 deny   192.168.20.0, wildcard bits 0.0.0.255 (47 matches)
    30 permit any (312 matches)`
      },
      "show ip interface gi0/1": {
        output: `GigabitEthernet0/1 is up, line protocol is up
  Internet address is 10.0.0.1/30
  Broadcast address is 255.255.255.255
  Inbound  access list is not set
  Outbound access list is 1
  Proxy ARP is enabled`
      },
      "show running-config | include access-list": {
        output: `access-list 1 permit 192.168.10.0 0.0.0.255
access-list 1 deny 192.168.20.0 0.0.0.255
access-list 1 permit any
access-list 2 permit host 192.168.1.10
access-list 2 deny any`
      }
    }
  },
  "telnet-router": {
    device: "Router",
    prompt: "Router#",
    description: "جرب أوامر إعداد والتحقق من Telnet/SSH",
    commands: {
      "show line vty 0 4": {
        output: `   Tty Typ     Tx/Rx    A Modem  Roty AccO AccI   Uses   Noise  Overruns   Int
     2 VTY  9600/9600  -    -      -    -    -      5       0     0/0       -
     3 VTY  9600/9600  -    -      -    -    -      2       0     0/0       -
     4 VTY  9600/9600  -    -      -    -    -      0       0     0/0       -
     5 VTY  9600/9600  -    -      -    -    -      0       0     0/0       -
     6 VTY  9600/9600  -    -      -    -    -      0       0     0/0       -

 Transport input: telnet ssh
 Transport output: telnet ssh`
      },
      "show users": {
        output: `    Line       User       Host(s)              Idle       Location
*  0 con 0                idle                 00:00:00
   2 vty 0    admin      192.168.1.50         00:01:30
   3 vty 1    student    192.168.1.51         00:05:00`
      },
      "show ssh": {
        output: `Connection  Version  Mode  Encryption   Hmac         State                 Username
0           2.0      IN    aes128-cbc   hmac-sha1    Session started          admin
0           2.0      OUT   aes128-cbc   hmac-sha1    Session started          admin
%No SSHv1 server connections running.`
      },
      "show crypto key mypubkey rsa": {
        output: `% Key pair was generated at: 09:00:00 Apr 3 2026
Key name: R1.lab.com
Key type: RSA KEYS
 Storage Device: private-config
 Usage: General Purpose Key
 Key is not exportable.
 Key Data:
  30820122 300D0609 2A864886 F70D0101 01050003 82010F00 30820...`
      },
      "ping 192.168.1.1": {
        output: `Type escape sequence to abort.
Sending 5, 100-byte ICMP Echos to 192.168.1.1, timeout is 2 seconds:
!!!!!
Success rate is 100 percent (5/5), round-trip min/avg/max = 1/1/1 ms`
      }
    }
  },
  "telnet-switch": {
    device: "Switch",
    prompt: "Switch#",
    description: "جرب أوامر إعداد SVI و Telnet للمحول",
    commands: {
      "show ip interface brief": {
        output: `Interface              IP-Address      OK? Method Status                Protocol
Vlan1                  192.168.1.2     YES NVRAM  up                    up
FastEthernet0/1        unassigned      YES unset  up                    up
FastEthernet0/2        unassigned      YES unset  up                    up
FastEthernet0/3        unassigned      YES unset  down                  down`
      },
      "show interface vlan 1": {
        output: `Vlan1 is up, line protocol is up
  Hardware is CPU Interface, address is aabb.ccdd.0001 (bia aabb.ccdd.0001)
  Internet address is 192.168.1.2/24
  MTU 1500 bytes, BW 100000 Kbit/sec
  Reliability 255/255, txload 1/255, rxload 1/255
  5 minute input rate 0 bits/sec, 0 packets/sec
  5 minute output rate 0 bits/sec, 0 packets/sec`
      },
      "show running-config | section vty": {
        output: `line vty 0 15
 password 7 060506324F41
 login
 transport input telnet ssh`
      },
      "show users": {
        output: `    Line       User       Host(s)              Idle       Location
*  0 con 0                idle                 00:00:00
   2 vty 0               192.168.1.100        00:00:45`
      },
      "ping 192.168.1.1": {
        output: `Type escape sequence to abort.
Sending 5, 100-byte ICMP Echos to 192.168.1.1, timeout is 2 seconds:
!!!!!
Success rate is 100 percent (5/5), round-trip min/avg/max = 1/2/3 ms`
      }
    }
  }
};
function TerminalSimulator({ terminalConfig }) {
  const [history, setHistory] = useState([]);
  const [input, setInput] = useState("");
  const [commandHistory, setCommandHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [showHints, setShowHints] = useState(false);
  const inputRef = useRef(null);
  const bottomRef = useRef(null);
  const { prompt, commands, description } = terminalConfig;
  useEffect(() => {
    var _a;
    (_a = bottomRef.current) == null ? void 0 : _a.scrollIntoView({ behavior: "smooth" });
  }, [history]);
  const handleCommand = (cmd) => {
    const trimmed = cmd.trim().toLowerCase();
    if (!trimmed) return;
    const matchedKey = Object.keys(commands).find(
      (k) => k.toLowerCase() === trimmed
    );
    let output;
    if (matchedKey) {
      output = { type: "success", text: commands[matchedKey].output };
    } else if (trimmed === "?" || trimmed === "help") {
      output = {
        type: "info",
        text: "الأوامر المتاحة:\n" + Object.keys(commands).map((c) => `  ${c}`).join("\n")
      };
    } else if (trimmed === "clear" || trimmed === "cls") {
      setHistory([]);
      setInput("");
      return;
    } else if (trimmed === "exit" || trimmed === "quit") {
      output = { type: "info", text: "Connection closed." };
    } else {
      const partial = Object.keys(commands).filter((k) => k.toLowerCase().startsWith(trimmed.split(" ")[0]));
      if (partial.length > 0) {
        output = {
          type: "error",
          text: `% Ambiguous command: "${trimmed}"
أوامر مشابهة:
${partial.map((c) => `  ${c}`).join("\n")}`
        };
      } else {
        output = {
          type: "error",
          text: `% Unknown command or computer name, or unable to find computer address
% الأمر "${trimmed}" غير معروف. اكتب ? أو help لعرض الأوامر المتاحة.`
        };
      }
    }
    setHistory((prev) => [...prev, { cmd, output }]);
    setCommandHistory((prev) => [cmd, ...prev.slice(0, 19)]);
    setHistoryIndex(-1);
    setInput("");
  };
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleCommand(input);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const next = Math.min(historyIndex + 1, commandHistory.length - 1);
      setHistoryIndex(next);
      setInput(commandHistory[next] || "");
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = Math.max(historyIndex - 1, -1);
      setHistoryIndex(next);
      setInput(next === -1 ? "" : commandHistory[next]);
    } else if (e.key === "Tab") {
      e.preventDefault();
      const match = Object.keys(commands).find((k) => k.toLowerCase().startsWith(input.toLowerCase()));
      if (match) setInput(match);
    }
  };
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };
  return /* @__PURE__ */ jsxs("div", { className: "mt-10 mb-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("div", { className: "w-10 h-10 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center shadow-lg", children: /* @__PURE__ */ jsx(Terminal, { className: "text-green-400", size: 18 }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h2", { className: "text-lg font-bold text-foreground", children: "محاكي سطر الأوامر" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: description })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => setShowHints(!showHints),
            className: "flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg hover:bg-amber-100 transition-colors",
            children: [
              /* @__PURE__ */ jsx(Lightbulb, { size: 13 }),
              /* @__PURE__ */ jsx("span", { children: showHints ? "إخفاء" : "أوامر" })
            ]
          }
        ),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => setHistory([]),
            className: "flex items-center gap-1.5 text-xs text-muted-foreground bg-muted border border-border px-3 py-1.5 rounded-lg hover:bg-muted/80 transition-colors",
            children: [
              /* @__PURE__ */ jsx(RotateCcw, { size: 13 }),
              /* @__PURE__ */ jsx("span", { children: "مسح" })
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsx(AnimatePresence, { children: showHints && /* @__PURE__ */ jsx(
      motion.div,
      {
        initial: { opacity: 0, height: 0 },
        animate: { opacity: 1, height: "auto" },
        exit: { opacity: 0, height: 0 },
        className: "overflow-hidden mb-3",
        children: /* @__PURE__ */ jsxs("div", { className: "bg-amber-50 border border-amber-200 rounded-xl p-4", children: [
          /* @__PURE__ */ jsxs("p", { className: "text-xs font-semibold text-amber-800 mb-2 flex items-center gap-1", children: [
            /* @__PURE__ */ jsx(Lightbulb, { size: 12 }),
            "الأوامر المتاحة (انقر لتطبيق):"
          ] }),
          /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: Object.keys(commands).map((cmd) => /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => {
                var _a;
                setInput(cmd);
                (_a = inputRef.current) == null ? void 0 : _a.focus();
              },
              className: "text-xs font-mono bg-white border border-amber-300 text-amber-900 px-2.5 py-1 rounded-lg hover:bg-amber-100 transition-colors",
              dir: "ltr",
              children: cmd
            },
            cmd
          )) }),
          /* @__PURE__ */ jsxs("p", { className: "text-xs text-amber-700 mt-2", children: [
            "💡 اضغط ",
            /* @__PURE__ */ jsx("kbd", { className: "bg-amber-200 px-1 rounded", children: "Tab" }),
            " للإكمال التلقائي،",
            /* @__PURE__ */ jsx("kbd", { className: "bg-amber-200 px-1 rounded mx-1", children: "↑" }),
            " لسجل الأوامر، اكتب ",
            /* @__PURE__ */ jsx("kbd", { className: "bg-amber-200 px-1 rounded", children: "?" }),
            " لعرض الأوامر"
          ] })
        ] })
      }
    ) }),
    /* @__PURE__ */ jsxs(
      "div",
      {
        className: "bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-700",
        onClick: () => {
          var _a;
          return (_a = inputRef.current) == null ? void 0 : _a.focus();
        },
        children: [
          /* @__PURE__ */ jsxs("div", { className: "bg-slate-800 px-4 py-2.5 flex items-center gap-2 border-b border-slate-700", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex gap-1.5", children: [
              /* @__PURE__ */ jsx("div", { className: "w-3 h-3 rounded-full bg-red-500" }),
              /* @__PURE__ */ jsx("div", { className: "w-3 h-3 rounded-full bg-yellow-500" }),
              /* @__PURE__ */ jsx("div", { className: "w-3 h-3 rounded-full bg-green-500" })
            ] }),
            /* @__PURE__ */ jsxs("span", { className: "text-slate-400 text-xs font-mono mx-auto", children: [
              prompt.replace("#", ""),
              " — Terminal"
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "p-4 min-h-48 max-h-80 overflow-y-auto font-mono text-sm", dir: "ltr", style: { textAlign: "left" }, children: [
            history.length === 0 && /* @__PURE__ */ jsx("div", { className: "text-slate-500 text-xs mb-3", children: `Welcome to Cisco IOS Simulator
Type '?' or 'help' to see available commands
Press Tab for autocomplete, ↑↓ for history
` }),
            history.map((item, index) => /* @__PURE__ */ jsxs("div", { className: "mb-3", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1 group", children: [
                /* @__PURE__ */ jsx("span", { className: "text-green-400 font-bold", children: prompt }),
                /* @__PURE__ */ jsx("span", { className: "text-white ml-1", children: item.cmd }),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: (e) => {
                      e.stopPropagation();
                      copyToClipboard(item.cmd);
                    },
                    className: "opacity-0 group-hover:opacity-100 transition-opacity ml-auto text-slate-600 hover:text-slate-400",
                    children: /* @__PURE__ */ jsx(Copy, { size: 11 })
                  }
                )
              ] }),
              /* @__PURE__ */ jsx("div", { className: `mt-1 whitespace-pre text-xs leading-relaxed ${item.output.type === "error" ? "text-red-400" : item.output.type === "info" ? "text-yellow-300" : "text-slate-300"}`, children: item.output.text })
            ] }, index)),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
              /* @__PURE__ */ jsx("span", { className: "text-green-400 font-bold flex-shrink-0", children: prompt }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  ref: inputRef,
                  value: input,
                  onChange: (e) => setInput(e.target.value),
                  onKeyDown: handleKeyDown,
                  className: "bg-transparent text-white outline-none flex-1 ml-1 caret-green-400",
                  placeholder: "",
                  autoComplete: "off",
                  autoCorrect: "off",
                  spellCheck: false
                }
              )
            ] }),
            /* @__PURE__ */ jsx("div", { ref: bottomRef })
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mt-2 text-center", children: "هذا محاكي تعليمي — لا تتطلب أوامره جهاز حقيقي" })
  ] });
}
function QuizSection({ quiz }) {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [showExplanations, setShowExplanations] = useState({});
  if (!quiz) return null;
  const totalQuestions = quiz.questions.length;
  const correctAnswers = submitted ? quiz.questions.filter((q, i) => answers[i] === q.correct).length : 0;
  const score = submitted ? Math.round(correctAnswers / totalQuestions * 100) : 0;
  const handleSelect = (qIndex, optionIndex) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [qIndex]: optionIndex }));
  };
  const handleSubmit = () => {
    var _a;
    if (Object.keys(answers).length < totalQuestions) return;
    const finalScore = Math.round(quiz.questions.filter((q, i) => answers[i] === q.correct).length / totalQuestions * 100);
    setSubmitted(true);
    try {
      const quizId = quiz.id;
      if (quizId) {
        const existing = JSON.parse(localStorage.getItem("quiz-results") || "{}");
        existing[quizId] = { score: finalScore, completedAt: (/* @__PURE__ */ new Date()).toISOString() };
        localStorage.setItem("quiz-results", JSON.stringify(existing));
      }
    } catch {
    }
    base44.analytics.track({
      eventName: "quiz_completed",
      properties: {
        quiz_id: quiz.id || "unknown",
        quiz_title: quiz.title || "",
        score: finalScore,
        passed: finalScore >= 60
      }
    });
    syncProgressToServer();
    window.scrollTo({ top: ((_a = document.querySelector("#quiz-section")) == null ? void 0 : _a.offsetTop) - 100, behavior: "smooth" });
  };
  const handleReset = () => {
    setAnswers({});
    setSubmitted(false);
    setShowExplanations({});
  };
  const toggleExplanation = (index) => {
    setShowExplanations((prev) => ({ ...prev, [index]: !prev[index] }));
  };
  const getScoreInfo = () => {
    if (score >= 80) return { label: "ممتاز! 🎉", color: "text-success", bg: "bg-success/10", border: "border-success/25", ring: "bg-success" };
    if (score >= 60) return { label: "جيد! استمر في التحسن", color: "text-warning", bg: "bg-warning/10", border: "border-warning/25", ring: "bg-warning" };
    return { label: "راجع الدرس مرة أخرى", color: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/25", ring: "bg-destructive" };
  };
  const scoreInfo = getScoreInfo();
  return /* @__PURE__ */ jsxs("div", { id: "quiz-section", className: "mt-10 mb-8", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-6", children: [
      /* @__PURE__ */ jsx("div", { className: "w-10 h-10 rounded-xl bg-primary flex items-center justify-center", children: /* @__PURE__ */ jsx(BookOpen, { className: "text-white", size: 18 }) }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h2", { className: "text-lg font-bold text-foreground", children: quiz.title }),
        /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground", children: [
          totalQuestions,
          " أسئلة اختيار من متعدد"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx(AnimatePresence, { children: submitted && /* @__PURE__ */ jsx(
      motion.div,
      {
        initial: { opacity: 0, scale: 0.95, y: -10 },
        animate: { opacity: 1, scale: 1, y: 0 },
        className: `mb-6 p-5 rounded-2xl border ${scoreInfo.bg} ${scoreInfo.border}`,
        children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
          /* @__PURE__ */ jsx("div", { className: `w-16 h-16 rounded-full ${scoreInfo.ring} flex items-center justify-center shadow-md`, children: /* @__PURE__ */ jsxs("span", { className: "text-white font-black text-xl", children: [
            score,
            "%"
          ] }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: `text-lg font-bold ${scoreInfo.color}`, children: scoreInfo.label }),
            /* @__PURE__ */ jsxs("p", { className: "text-sm text-muted-foreground", children: [
              "أجبت بشكل صحيح على ",
              /* @__PURE__ */ jsx("strong", { children: correctAnswers }),
              " من ",
              /* @__PURE__ */ jsx("strong", { children: totalQuestions }),
              " سؤال"
            ] })
          ] }),
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: handleReset,
              className: "mr-auto flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors bg-white/70 px-3 py-2 rounded-lg border border-border",
              children: [
                /* @__PURE__ */ jsx(RotateCcw, { size: 14 }),
                /* @__PURE__ */ jsx("span", { children: "إعادة" })
              ]
            }
          )
        ] })
      }
    ) }),
    /* @__PURE__ */ jsx("div", { className: "space-y-5", children: quiz.questions.map((question, qIndex) => {
      const userAnswer = answers[qIndex];
      const isCorrect = submitted && userAnswer === question.correct;
      const isWrong = submitted && userAnswer !== void 0 && userAnswer !== question.correct;
      const isExpanded = showExplanations[qIndex];
      return /* @__PURE__ */ jsx(
        "div",
        {
          className: `bg-card border rounded-2xl overflow-hidden transition-all ${submitted ? isCorrect ? "border-success/40 shadow-md" : isWrong ? "border-destructive/40 shadow-md" : "border-border opacity-70" : "border-border"}`,
          children: /* @__PURE__ */ jsxs("div", { className: "p-4 sm:p-5", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 mb-4", children: [
              /* @__PURE__ */ jsx("span", { className: `flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${submitted ? isCorrect ? "bg-success/10 text-success" : isWrong ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"}`, children: submitted ? isCorrect ? /* @__PURE__ */ jsx(CheckCircle2, { size: 14 }) : isWrong ? /* @__PURE__ */ jsx(XCircle, { size: 14 }) : qIndex + 1 : qIndex + 1 }),
              /* @__PURE__ */ jsx("p", { className: "font-semibold text-foreground text-sm sm:text-base leading-relaxed", children: question.question })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "space-y-2 mr-10", children: question.options.map((option, oIndex) => {
              const isSelected = userAnswer === oIndex;
              const isCorrectOption = submitted && oIndex === question.correct;
              const isWrongSelected = submitted && isSelected && oIndex !== question.correct;
              return /* @__PURE__ */ jsxs(
                "button",
                {
                  onClick: () => handleSelect(qIndex, oIndex),
                  disabled: submitted,
                  className: `w-full text-right px-4 py-3 rounded-xl border text-sm transition-all flex items-center gap-3 ${isCorrectOption ? "bg-success/10 border-success text-success font-medium" : isWrongSelected ? "bg-destructive/10 border-destructive text-destructive" : isSelected && !submitted ? "bg-primary/10 border-primary text-primary font-medium" : submitted ? "bg-muted/30 border-border text-muted-foreground cursor-default" : "bg-background border-border text-foreground hover:bg-muted hover:border-primary/50 cursor-pointer"}`,
                  children: [
                    /* @__PURE__ */ jsx("span", { className: `flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold ${isCorrectOption ? "border-success bg-success text-white" : isWrongSelected ? "border-destructive bg-destructive text-white" : isSelected ? "border-primary bg-primary text-white" : "border-border"}`, children: isCorrectOption ? /* @__PURE__ */ jsx(CheckCircle2, { size: 12 }) : isWrongSelected ? /* @__PURE__ */ jsx(XCircle, { size: 12 }) : String.fromCharCode(65 + oIndex) }),
                    /* @__PURE__ */ jsx("span", { className: "flex-1", children: option })
                  ]
                },
                oIndex
              );
            }) }),
            submitted && /* @__PURE__ */ jsxs("div", { className: "mr-10 mt-3", children: [
              /* @__PURE__ */ jsxs(
                "button",
                {
                  onClick: () => toggleExplanation(qIndex),
                  className: `flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${isCorrect ? "text-success hover:bg-success/10" : "text-destructive hover:bg-destructive/10"}`,
                  children: [
                    isExpanded ? /* @__PURE__ */ jsx(ChevronUp, { size: 13 }) : /* @__PURE__ */ jsx(ChevronDown, { size: 13 }),
                    /* @__PURE__ */ jsx("span", { children: "شرح الإجابة" })
                  ]
                }
              ),
              /* @__PURE__ */ jsx(AnimatePresence, { children: isExpanded && /* @__PURE__ */ jsx(
                motion.div,
                {
                  initial: { opacity: 0, height: 0 },
                  animate: { opacity: 1, height: "auto" },
                  exit: { opacity: 0, height: 0 },
                  className: "overflow-hidden",
                  children: /* @__PURE__ */ jsxs("div", { className: `mt-2 p-3 rounded-xl text-sm leading-relaxed ${isCorrect ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`, children: [
                    "💡 ",
                    question.explanation
                  ] })
                }
              ) })
            ] })
          ] })
        },
        qIndex
      );
    }) }),
    !submitted && /* @__PURE__ */ jsxs("div", { className: "mt-6 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("span", { className: "text-sm text-muted-foreground", children: [
        Object.keys(answers).length,
        "/",
        totalQuestions,
        " تم الإجابة عليها"
      ] }),
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: handleSubmit,
          disabled: Object.keys(answers).length < totalQuestions,
          className: `flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all ${Object.keys(answers).length < totalQuestions ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-primary text-white hover:shadow-lg hover:scale-105"}`,
          children: [
            /* @__PURE__ */ jsx(Trophy, { size: 16 }),
            /* @__PURE__ */ jsx("span", { children: "تحقق من إجاباتي" })
          ]
        }
      )
    ] })
  ] });
}
function splitByLanguage(text) {
  const tokens = text.split(/(\s+)/);
  const segments = [];
  let current = null;
  for (const token2 of tokens) {
    if (!token2) continue;
    const hasArabic = /[\u0600-\u06FF]/.test(token2);
    const hasLatin = /[a-zA-Z]/.test(token2);
    if (!hasArabic && !hasLatin) {
      if (current) current.text += token2;
      continue;
    }
    const lang = hasArabic ? "ar" : "en";
    if (current && current.lang === lang) {
      current.text += token2;
    } else {
      if (current && current.text.trim()) segments.push(current);
      current = { text: token2, lang };
    }
  }
  if (current && current.text.trim()) segments.push(current);
  return segments;
}
function getBestVoice(lang, voices) {
  if (lang === "ar") {
    return voices.find((v) => v.lang.startsWith("ar") && v.name.toLowerCase().includes("google")) || voices.find((v) => v.lang.startsWith("ar-SA")) || voices.find((v) => v.lang.startsWith("ar")) || null;
  } else {
    return voices.find((v) => v.lang === "en-US" && v.name.toLowerCase().includes("google")) || voices.find((v) => v.lang.startsWith("en-US")) || voices.find((v) => v.lang.startsWith("en-GB")) || voices.find((v) => v.lang.startsWith("en")) || null;
  }
}
function TextToSpeech({ text, label = "قراءة النص" }) {
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);
  const [supported, setSupported] = useState(false);
  const stoppedRef = useRef(false);
  const voicesRef = useRef([]);
  useEffect(() => {
    if (!("speechSynthesis" in window)) return;
    setSupported(true);
    const load = () => {
      voicesRef.current = window.speechSynthesis.getVoices();
    };
    load();
    window.speechSynthesis.onvoiceschanged = load;
    return () => {
      var _a;
      (_a = window.speechSynthesis) == null ? void 0 : _a.cancel();
    };
  }, []);
  useEffect(() => {
    var _a;
    (_a = window.speechSynthesis) == null ? void 0 : _a.cancel();
    setSpeaking(false);
    setPaused(false);
  }, [text]);
  if (!supported) return null;
  const speakSegments = (segments, index) => {
    if (stoppedRef.current || index >= segments.length) {
      setSpeaking(false);
      setPaused(false);
      return;
    }
    const seg = segments[index];
    const utter = new SpeechSynthesisUtterance(seg.text);
    utter.lang = seg.lang === "ar" ? "ar-SA" : "en-US";
    utter.rate = seg.lang === "ar" ? 0.88 : 1;
    utter.pitch = 1;
    const voice = getBestVoice(seg.lang, voicesRef.current);
    if (voice) utter.voice = voice;
    utter.onend = () => speakSegments(segments, index + 1);
    utter.onerror = () => {
      setSpeaking(false);
      setPaused(false);
    };
    window.speechSynthesis.speak(utter);
  };
  const handlePlay = () => {
    if (paused) {
      window.speechSynthesis.resume();
      setPaused(false);
      return;
    }
    window.speechSynthesis.cancel();
    stoppedRef.current = false;
    const clean = text.replace(/#{1,6}\s/g, "").replace(/[*`>~\[\]|]/g, "").replace(/\n{2,}/g, ". ").replace(/\n/g, " ").replace(/\s{2,}/g, " ").trim();
    const segments = splitByLanguage(clean).filter((s) => s.text.trim().length > 1);
    if (voicesRef.current.length === 0) {
      window.speechSynthesis.onvoiceschanged = () => {
        voicesRef.current = window.speechSynthesis.getVoices();
        setSpeaking(true);
        speakSegments(segments, 0);
      };
    } else {
      setSpeaking(true);
      speakSegments(segments, 0);
    }
  };
  const handlePause = () => {
    window.speechSynthesis.pause();
    setPaused(true);
  };
  const handleStop = () => {
    stoppedRef.current = true;
    window.speechSynthesis.cancel();
    setSpeaking(false);
    setPaused(false);
  };
  return /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2", children: !speaking ? /* @__PURE__ */ jsxs(
    "button",
    {
      onClick: handlePlay,
      className: "flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-l from-primary/10 to-secondary/10 border border-primary/20 text-primary hover:from-primary/20 hover:to-secondary/20 transition-all text-sm font-medium group",
      children: [
        /* @__PURE__ */ jsx(Volume2, { size: 15, className: "group-hover:scale-110 transition-transform" }),
        /* @__PURE__ */ jsx("span", { children: label })
      ]
    }
  ) : /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 bg-primary/5 border border-primary/20 rounded-xl px-3 py-1.5", children: [
    /* @__PURE__ */ jsx("div", { className: "flex items-center gap-0.5 mr-1", children: [1, 2, 3].map((i) => /* @__PURE__ */ jsx(
      "div",
      {
        className: "w-1 bg-primary rounded-full animate-pulse",
        style: { height: `${8 + i * 4}px`, animationDelay: `${i * 0.15}s` }
      },
      i
    )) }),
    /* @__PURE__ */ jsx("span", { className: "text-xs text-primary font-medium", children: paused ? "متوقف" : "يقرأ..." }),
    /* @__PURE__ */ jsx(
      "button",
      {
        onClick: paused ? handlePlay : handlePause,
        className: "p-1.5 rounded-lg hover:bg-primary/10 transition-colors text-primary",
        children: paused ? /* @__PURE__ */ jsx(Play, { size: 13 }) : /* @__PURE__ */ jsx(Pause, { size: 13 })
      }
    ),
    /* @__PURE__ */ jsx(
      "button",
      {
        onClick: handleStop,
        className: "p-1.5 rounded-lg hover:bg-red-50 transition-colors text-red-500",
        children: /* @__PURE__ */ jsx(Square, { size: 13 })
      }
    )
  ] }) });
}
function calcReadTime(text) {
  const words = (text == null ? void 0 : text.split(/\s+/).length) || 0;
  if (words < 200) return 45;
  if (words < 500) return 60;
  if (words < 900) return 90;
  return 120;
}
function ReadingGate({ content, children }) {
  const readTime = calcReadTime(content);
  const [elapsed, setElapsed] = useState(0);
  const [unlocked, setUnlocked] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  useEffect(() => {
    setElapsed(0);
    setUnlocked(false);
    setShowQuiz(false);
  }, [content]);
  useEffect(() => {
    if (unlocked) return;
    const id = setInterval(() => {
      setElapsed((e) => {
        if (e + 1 >= readTime) {
          setUnlocked(true);
          clearInterval(id);
          return readTime;
        }
        return e + 1;
      });
    }, 1e3);
    return () => clearInterval(id);
  }, [readTime, unlocked, content]);
  const pct = Math.min(elapsed / readTime * 100, 100);
  const remaining = readTime - elapsed;
  if (showQuiz) return /* @__PURE__ */ jsx(Fragment, { children });
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(AnimatePresence, { children: !unlocked && /* @__PURE__ */ jsxs(
      motion.div,
      {
        initial: { opacity: 0, y: -10 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -10 },
        className: "mb-6 bg-card border border-border rounded-2xl p-4",
        children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-2", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm text-muted-foreground", children: [
              /* @__PURE__ */ jsx(BookOpen, { size: 14, className: "text-primary" }),
              /* @__PURE__ */ jsx("span", { children: "اقرأ الشرح أولاً قبل الأسئلة" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 text-sm font-mono text-primary", children: [
              /* @__PURE__ */ jsx(Clock, { size: 13 }),
              /* @__PURE__ */ jsxs("span", { children: [
                Math.floor(remaining / 60),
                ":",
                String(remaining % 60).padStart(2, "0")
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "w-full h-2 bg-muted rounded-full overflow-hidden", children: /* @__PURE__ */ jsx(
            motion.div,
            {
              className: "h-full bg-primary rounded-full",
              animate: { width: `${pct}%` },
              transition: { duration: 0.5 }
            }
          ) })
        ]
      }
    ) }),
    /* @__PURE__ */ jsx(AnimatePresence, { children: unlocked && /* @__PURE__ */ jsxs(
      motion.div,
      {
        initial: { opacity: 0, scale: 0.9, y: 10 },
        animate: { opacity: 1, scale: 1, y: 0 },
        className: "mb-6 flex flex-col items-center",
        children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm text-success mb-3", children: [
            /* @__PURE__ */ jsx(CheckCircle2, { size: 16 }),
            /* @__PURE__ */ jsx("span", { children: "انتهى وقت القراءة — أنت مستعد للاختبار!" })
          ] }),
          /* @__PURE__ */ jsxs(
            motion.button,
            {
              onClick: () => setShowQuiz(true),
              whileHover: { scale: 1.04 },
              whileTap: { scale: 0.97 },
              className: "flex items-center gap-2 px-8 py-3 rounded-2xl bg-primary text-white font-bold text-base hover:shadow-lg transition-shadow",
              children: [
                /* @__PURE__ */ jsx(CheckCircle2, { size: 18 }),
                "اختبر نفسك",
                /* @__PURE__ */ jsx(ChevronDown, { size: 16, className: "rotate-[-90deg]" })
              ]
            }
          )
        ]
      }
    ) })
  ] });
}
const ctxOf = (nodes, connections) => {
  const of = (t2) => nodes.filter((n) => n.type === t2);
  const count2 = (t2) => of(t2).length;
  const deg = (id) => connections.filter((c) => c.from === id || c.to === id).length;
  const connected = (id) => deg(id) > 0;
  const anyConn = (t2) => of(t2).some((n) => connected(n.id));
  const allConn = (t2) => of(t2).length > 0 && of(t2).every((n) => connected(n.id));
  const linked = (a, b) => connections.some((c) => c.from === a.id && c.to === b.id || c.from === b.id && c.to === a.id);
  const anyLink = (t1, t2) => of(t1).some((a) => of(t2).some((b) => linked(a, b)));
  return { nodes, connections, of, count: count2, deg, connected, anyConn, allConn, linked, anyLink };
};
const N = (id, type, label, x, y) => ({ id, type, label, x, y });
function lab(s) {
  const { checks, passScore = 80, passMsg, failMsg, ...rest } = s;
  return {
    status: "published",
    ...rest,
    tasks: checks.map((c) => c.label),
    eval: (nodes, connections) => {
      const c = ctxOf(nodes, connections);
      const details = checks.map((ch) => ({ label: ch.label, ok: !!ch.test(c) }));
      const okCount = details.filter((d) => d.ok).length;
      const score = details.length ? Math.round(okCount / details.length * 100) : 0;
      const passed = score >= passScore;
      return {
        score,
        passed,
        feedback: passed ? passMsg || "أحسنت! أنجزت مهام السيناريو بنجاح." : failMsg || "لم تكتمل جميع المهام بعد — راجع الأهداف غير المنجزة وحاول مجدداً.",
        details
      };
    }
  };
}
const DIFF_ORDER = { "مبتدئ": 0, "سهل": 1, "متوسط": 2, "صعب": 3, "متقدم": 4 };
const DIFF_LABEL_KEYS = {
  "مبتدئ": "diffBeginner",
  "سهل": "diffEasy",
  "متوسط": "diffMedium",
  "صعب": "diffHard",
  "متقدم": "diffAdvanced"
};
const DIFF_STYLE = {
  "مبتدئ": "text-secondary bg-secondary/10 border-secondary/30",
  "سهل": "text-accent bg-accent/10 border-accent/30",
  "متوسط": "text-warning bg-warning/10 border-warning/30",
  "صعب": "text-destructive bg-destructive/10 border-destructive/30",
  "متقدم": "text-primary bg-primary/10 border-primary/30"
};
const withStyle = (arr) => arr.map((s) => ({ ...s, diffColor: DIFF_STYLE[s.difficulty] || DIFF_STYLE["متوسط"] }));
const SCENARIOS = withStyle([
  /* ══════════ مبتدئ (Beginner) ══════════ */
  lab({
    id: "first_lan",
    title: "أول شبكة محلية",
    desc: "ابنِ أول شبكة لك: سويتش يربط جهازي PC ويتواصلان عبره.",
    objective: "فهم مكونات الشبكة الأساسية وطوبولوجيا النجمة (Star).",
    unitId: "unit1-basics",
    lessonId: "network-components",
    difficulty: "مبتدئ",
    time: "10 دقائق",
    xp: 80,
    icon: "🌐",
    objectives: ["أضف سويتشاً رئيسياً", "أضف جهازي PC", "اربط الجهازين بالسويتش", "أرسل حزمة ping بينهما"],
    hints: ["السويتش يربط الأجهزة في شبكة النجمة", "كل جهاز يحتاج كابلاً يصله بالسويتش"],
    expected: "شبكة نجمة صغيرة: سويتش + جهازا PC متصلان به.",
    checks: [
      { label: "سويتش موجود", test: (c) => c.count("Switch") >= 1 },
      { label: "جهازا PC موجودان", test: (c) => c.count("PC") >= 2 },
      { label: "السويتش متصل بشبكة", test: (c) => c.anyConn("Switch") },
      { label: "الأجهزة متصلة (اتصالان+)", test: (c) => c.connections.length >= 2 && c.anyLink("PC", "Switch") }
    ]
  }),
  lab({
    id: "client_server",
    title: "نموذج العميل والخادم",
    desc: "أنشئ شبكة Client-Server: خادم مركزي يخدم أجهزة عملاء.",
    objective: "التمييز بين نموذج P2P ونموذج Client-Server عملياً.",
    unitId: "unit1-basics",
    lessonId: "network-components",
    difficulty: "مبتدئ",
    time: "12 دقيقة",
    xp: 90,
    icon: "🖥️",
    objectives: ["أضف Server", "أضف سويتشاً", "أضف جهازي PC كعملاء", "اربط الجميع بالسويتش"],
    hints: ["الخادم يقدم الخدمة والعميل يطلبها", "كل الأجهزة تتصل عبر السويتش"],
    expected: "خادم + سويتش + عميلان متصلون عبر السويتش.",
    checks: [
      { label: "Server موجود", test: (c) => c.count("Server") >= 1 },
      { label: "سويتش موجود", test: (c) => c.count("Switch") >= 1 },
      { label: "عميلان (PC)", test: (c) => c.count("PC") >= 2 },
      { label: "الخادم متصل بالشبكة", test: (c) => c.anyConn("Server") },
      { label: "العملاء متصلون بالسويتش", test: (c) => c.anyLink("PC", "Switch") }
    ]
  }),
  lab({
    id: "two_pc_direct",
    title: "ربط جهازين مباشرة",
    desc: "كما في Packet Tracer: جهازا PC يتصلان مباشرة بكابل Crossover ثم ping.",
    objective: "إتقان الخطوات الأولى: سحب الأجهزة، اختيار الكابل، ربط المنافذ، الاختبار.",
    unitId: "unit1-basics",
    lessonId: "packet-tracer-intro",
    difficulty: "مبتدئ",
    time: "8 دقائق",
    xp: 70,
    icon: "🔌",
    objectives: ["أضف جهازي PC", "اربطهما بكابل مباشر", "أرسل ping من أحدهما للآخر"],
    hints: ["ربط PC بـ PC يتم بكابل Crossover", "لا يلزم أي جهاز وسيط بين جهازين فقط"],
    expected: "جهازا PC متصلان مباشرة ببعضهما.",
    checks: [
      { label: "جهازا PC موجودان", test: (c) => c.count("PC") >= 2 },
      { label: "اتصال مباشر بينهما", test: (c) => c.anyLink("PC", "PC") }
    ]
  }),
  lab({
    id: "console_access",
    title: "الوصول لجهاز عبر Console",
    desc: "جهّز جهاز توجيه وحاسب إدارة متصل به عبر منفذ الإدارة.",
    objective: "فهم طرق الوصول لجهاز الشبكة (Console / Telnet / SSH).",
    unitId: "unit2-ios",
    lessonId: "ios-access-modes",
    difficulty: "مبتدئ",
    time: "10 دقائق",
    xp: 90,
    icon: "⌨️",
    objectives: ["أضف Router", "أضف PC إدارة", "اربط الـ PC بالراوتر (كابل إدارة)"],
    hints: ["Console هو الاتصال المادي المباشر للإعداد الأولي", "اربط PC بالـ Router مباشرة"],
    expected: "راوتر متصل بحاسب إدارة لمهمة الإعداد.",
    checks: [
      { label: "Router موجود", test: (c) => c.count("Router") >= 1 },
      { label: "حاسب إدارة (PC)", test: (c) => c.count("PC") >= 1 },
      { label: "الـ PC متصل بالراوتر", test: (c) => c.anyLink("PC", "Router") }
    ]
  }),
  lab({
    id: "initial_device_config",
    title: "الإعدادات الأولية للجهاز",
    desc: "جهّز شبكة إدارة: راوتر + سويتش + حاسب إدارة جميعها متصلة.",
    objective: "تطبيق تسلسل الإعداد الأولي وحفظ الإعدادات.",
    unitId: "unit2-ios",
    lessonId: "ios-initial-config",
    difficulty: "مبتدئ",
    time: "15 دقيقة",
    xp: 100,
    icon: "⚙️",
    objectives: ["أضف Router وSwitch وPC", "اربط الـ PC بالسويتش", "اربط السويتش بالراوتر"],
    hints: ["السويتش يوزع الاتصال للأجهزة", "الراوتر يربط الشبكة بالعالم الخارجي"],
    expected: "سلسلة متصلة: PC → Switch → Router.",
    checks: [
      { label: "Router + Switch + PC", test: (c) => c.count("Router") >= 1 && c.count("Switch") >= 1 && c.count("PC") >= 1 },
      { label: "PC متصل بالسويتش", test: (c) => c.anyLink("PC", "Switch") },
      { label: "السويتش متصل بالراوتر", test: (c) => c.anyLink("Switch", "Router") }
    ]
  }),
  lab({
    id: "layer_stack",
    title: "مسار التغليف عبر الطبقات",
    desc: "ابنِ مساراً كاملاً من جهاز مستخدم إلى الإنترنت يمر بالطبقات كلها.",
    objective: "ترسيخ نموذج OSI عملياً: طبقة فيزيائية → ربط → شبكة → تطبيق.",
    unitId: "unit3-protocols-models",
    lessonId: "osi-tcpip-models",
    difficulty: "مبتدئ",
    time: "15 دقيقة",
    xp: 110,
    icon: "🧱",
    objectives: ["أضف PC (طبقة التطبيق)", "أضف Switch (طبقة ربط البيانات)", "أضف Router (طبقة الشبكة)", "أضف Cloud (الإنترنت)", "اربط السلسلة كاملة"],
    hints: ["البيانات تُغلّف رأساً عند كل طبقة", "المسار: PC → Switch → Router → Cloud"],
    expected: "سلسلة متصلة كاملة PC → Switch → Router → Cloud.",
    checks: [
      { label: "PC + Switch + Router + Cloud", test: (c) => ["PC", "Switch", "Router", "Cloud"].every((t2) => c.count(t2) >= 1) },
      { label: "PC متصل بالسويتش", test: (c) => c.anyLink("PC", "Switch") },
      { label: "السويتش متصل بالراوتر", test: (c) => c.anyLink("Switch", "Router") },
      { label: "الراوتر متصل بالإنترنت (Cloud)", test: (c) => c.anyLink("Router", "Cloud") }
    ]
  }),
  /* ══════════ سهل (Easy) ══════════ */
  lab({
    id: "cable_lab",
    title: "مختبر الكابلات والمنافذ",
    desc: "اربط 3 أجهزة PC بسويتش بكابلات Straight-Through مناسبة.",
    objective: "اختيار الكابل الصحيح بين الأجهزة وفهم Auto-MDIX.",
    unitId: "unit4-physical",
    lessonId: "physical-media",
    difficulty: "سهل",
    time: "12 دقيقة",
    xp: 120,
    icon: "🧵",
    objectives: ["أضف سويتشاً", "أضف 3 أجهزة PC", "اربط كل جهاز بالسويتش بكابل مناسب"],
    hints: ["PC إلى Switch = Straight-Through", "راجع توافق المنافذ قبل التأكيد"],
    expected: "سويتش تتوفر عليه 3 منافذ مشغولة بأجهزة PC.",
    checks: [
      { label: "سويتش موجود", test: (c) => c.count("Switch") >= 1 },
      { label: "3 أجهزة PC", test: (c) => c.count("PC") >= 3 },
      { label: "جميع الأجهزة متصلة", test: (c) => c.allConn("PC") },
      { label: "الاتصال عبر السويتش", test: (c) => c.anyLink("PC", "Switch") }
    ]
  }),
  lab({
    id: "subnet_basics",
    title: "عنونة IP الأساسية",
    desc: "جهّز شبكة عنونة صحيحة: جهازان في شبكة واحدة يمران عبر راوتر البوابة.",
    objective: "فهم جزء الشبكة وجزء المضيف في عنوان IPv4 والبوابة الافتراضية.",
    unitId: "unit5-numbering",
    lessonId: "binary-system",
    difficulty: "سهل",
    time: "15 دقيقة",
    xp: 130,
    icon: "🔢",
    objectives: ["أضف سويتشاً وجهازي PC", "أضف راوتراً كبوابة", "اربط الشبكة بالبوابة"],
    hints: ["الأجهزة في نفس الشبكة تستخدم نفس القناع", "البوابة الافتراضية على الراوتر"],
    expected: "شبكة محلية مع بوابة راوتر جاهزة.",
    checks: [
      { label: "سويتش + جهازا PC", test: (c) => c.count("Switch") >= 1 && c.count("PC") >= 2 },
      { label: "راوتر البوابة موجود", test: (c) => c.count("Router") >= 1 },
      { label: "الأجهزة متصلة بالسويتش", test: (c) => c.anyLink("PC", "Switch") },
      { label: "السويتش متصل بالراوتر", test: (c) => c.anyLink("Switch", "Router") }
    ]
  }),
  lab({
    id: "frame_flow",
    title: "تدفق الإطارات بين المحولات",
    desc: "محولان يربط كل منهما أجهزته — واربط المحولين بناقل مشترك.",
    objective: "فهم بناء الإطارات وانتقالها بين المحولات (Frames).",
    unitId: "unit6-data-link",
    lessonId: "data-link-functions",
    difficulty: "سهل",
    time: "12 دقيقة",
    xp: 130,
    icon: "🧬",
    objectives: ["أضف سويتشين", "اربط PC بكل سويتش", "اربط السويتشين معاً"],
    hints: ["كل إطار يحمل MAC مصدر وMAC وجهة", "الربط بين المحولين يوسع نطاق البث"],
    expected: "محولان متصلان، وعلى كل منهما جهاز PC.",
    checks: [
      { label: "سويتشان", test: (c) => c.count("Switch") >= 2 },
      { label: "جهازا PC", test: (c) => c.count("PC") >= 2 },
      { label: "السويتشان مترابطان", test: (c) => c.anyLink("Switch", "Switch") },
      { label: "كل سويتش متصل بجهاز", test: (c) => c.anyLink("PC", "Switch") }
    ]
  }),
  lab({
    id: "mac_learning",
    title: "تعلّم عناوين MAC",
    desc: "اربط 3 أجهزة بسويتش واحد وشاهد كيف يتعلّم جدول MAC.",
    objective: "فهم آلية تعلّم المحول وتوجيهه للإطارات.",
    unitId: "unit7-ethernet-switching",
    lessonId: "mac-addresses",
    difficulty: "سهل",
    time: "10 دقائق",
    xp: 120,
    icon: "📇",
    objectives: ["أضف سويتشاً", "أضف 3 أجهزة PC", "اربط جميع الأجهزة", "أرسل حزم بين الأجهزة"],
    hints: ["المحول يحفظ MAC المصدر مع منفذه", "إرسال حزمة يجبر المحول على التعلّم"],
    expected: "سويتش عليه 3 أجهزة متصلة وجدول MAC يتعلمها.",
    checks: [
      { label: "سويتش موجود", test: (c) => c.count("Switch") >= 1 },
      { label: "3 أجهزة PC", test: (c) => c.count("PC") >= 3 },
      { label: "جميع الأجهزة متصلة بالسويتش", test: (c) => c.allConn("PC") && c.anyLink("PC", "Switch") }
    ]
  }),
  lab({
    id: "gateway_setup",
    title: "إعداد البوابة الافتراضية",
    desc: "شبكتان منفصلتان بمحولين، يربطهما راوتر كبوابة بينهما.",
    objective: "فهم متى يُرسل المضيف الحزمة إلى البوابة الافتراضية.",
    unitId: "unit8-network-layer",
    lessonId: "network-layer-functions",
    difficulty: "سهل",
    time: "15 دقيقة",
    xp: 140,
    icon: "🚪",
    objectives: ["أضف محولين", "اربط جهازي PC (واحد لكل محول)", "أضف راوتراً واربطه بالمحولين"],
    hints: ["الوجهة في شبكة مختلفة → أرسل للبوابة", "الراوتر يملك واجهة في كل شبكة"],
    expected: "شبكتان متصلتان عبر راوتر مشترك.",
    checks: [
      { label: "محولان", test: (c) => c.count("Switch") >= 2 },
      { label: "جهازا PC", test: (c) => c.count("PC") >= 2 },
      { label: "الراوتر متصل بالمحولين", test: (c) => c.count("Router") >= 1 && c.anyLink("Router", "Switch") },
      { label: "أجهزة متصلة بالمحولات", test: (c) => c.anyLink("PC", "Switch") }
    ]
  }),
  lab({
    id: "arp_same_net",
    title: "حل العناوين في نفس الشبكة",
    desc: "جهازان في نفس الشبكة: اربطهما وشاهد طلب ARP بالبث.",
    objective: "فهم تسلسل ARP: Broadcast للطلب وUnicast للرد.",
    unitId: "unit9-arp",
    lessonId: "arp-protocol",
    difficulty: "سهل",
    time: "10 دقيقة",
    xp: 120,
    icon: "📡",
    objectives: ["أضف سويتشاً وجهازي PC", "اربط الجهازين بالسويتش", "أرسل ping وشاهد ARP"],
    hints: ["ARP Request يُرسل بالبث للجميع", "الرد يُرسل Unicast للسائل فقط"],
    expected: "جهازان متصلان عبر سويتش في نفس الشبكة.",
    checks: [
      { label: "سويتش + جهازا PC", test: (c) => c.count("Switch") >= 1 && c.count("PC") >= 2 },
      { label: "الجهازان متصلان بالسويتش", test: (c) => c.allConn("PC") && c.anyLink("PC", "Switch") }
    ]
  }),
  lab({
    id: "ping_path",
    title: "مسار Ping إلى الإنترنت",
    desc: "ابنِ مسار اختبار متسلسل: PC → Switch → Router → Cloud كما في اختبارات Ping.",
    objective: "إتقان اختبارات الاتصال المتسلسلة (Local → Gateway → Internet).",
    unitId: "unit12-icmp",
    lessonId: "icmp-ping-traceroute",
    difficulty: "سهل",
    time: "15 دقيقة",
    xp: 140,
    icon: "🛰️",
    objectives: ["أضف PC وسويتشاً وراوتراً وCloud", "اربط السلسلة من الـ PC حتى الإنترنت", "أرسل ICMP على المسار"],
    hints: ["اختبر أولاً loopback ثم البوابة ثم الإنترنت", "Traceroute يستخدم TTL متزايداً"],
    expected: "مسار ICMP كامل من الجهاز حتى الإنترنت.",
    checks: [
      { label: "السلسلة كاملة (PC+Switch+Router+Cloud)", test: (c) => ["PC", "Switch", "Router", "Cloud"].every((t2) => c.count(t2) >= 1) },
      { label: "PC متصل بالسويتش", test: (c) => c.anyLink("PC", "Switch") },
      { label: "السويتش متصل بالراوتر", test: (c) => c.anyLink("Switch", "Router") },
      { label: "الراوتر متصل بالإنترنت", test: (c) => c.anyLink("Router", "Cloud") }
    ]
  }),
  lab({
    id: "router_first_config",
    title: "أول إعداد لجهاز التوجيه",
    desc: "جهّز راوتراً يخدم شبكتين: محولان متصلان به وأجهزة في كل منهما.",
    objective: "تطبيق إعداد الواجهات (no shutdown) وربط شبكتين براوتر واحد.",
    unitId: "unit10-router-basic",
    lessonId: "router-basic-config",
    difficulty: "سهل",
    time: "20 دقيقة",
    xp: 150,
    icon: "🧭",
    objectives: ["أضف Router", "أضف محولين واربط كل محول براوتر", "أضف PC في كل شبكة", "تحقق من الواجهات"],
    hints: ["كل واجهة راوتر تخدم شبكة مختلفة", "no shutdown أساسية لتفعيل الواجهة"],
    expected: "راوتر يربط شبكتين محليتين عبر واجهتين فعالتين.",
    checks: [
      { label: "Router موجود", test: (c) => c.count("Router") >= 1 },
      { label: "محولان", test: (c) => c.count("Switch") >= 2 },
      { label: "الراوتر متصل بالمحولين", test: (c) => c.anyLink("Router", "Switch") },
      { label: "جهاز في كل شبكة", test: (c) => c.count("PC") >= 2 && c.anyLink("PC", "Switch") }
    ]
  }),
  /* ══════════ متوسط (Medium) ══════════ */
  lab({
    id: "vlan_setup",
    title: "إعداد VLAN أساسي",
    desc: "أنشئ شبكتين VLAN معزولتين على نفس المحول وتحقق من العزل.",
    objective: "تقسيم المحول منطقياً إلى VLANs مع منافذ Access.",
    unitId: "unit17-vlan",
    lessonId: "vlan-gui",
    difficulty: "متوسط",
    time: "15 دقيقة",
    xp: 200,
    icon: "🔀",
    template: {
      nodes: [N("vlan_setup-pc1", "PC", "PC1", 380, 200), N("vlan_setup-pc2", "PC", "PC2", 380, 320), N("vlan_setup-pc3", "PC", "PC3", 620, 200), N("vlan_setup-pc4", "PC", "PC4", 620, 320)],
      connections: []
    },
    objectives: ["أضف سويتشاً رئيسياً", "اربط 4 أجهزة PC (اثنان لكل VLAN)", "وزّع المنافذ على VLAN10 وVLAN20", "تأكد من عزل المجموعتين"],
    hints: ["عرّف VLAN على المحول أولاً", "استخدم Access Mode لمنافذ الأجهزة", "لا اتصال بين VLANs بدون راوتر"],
    expected: "محول عليه VLAN10 وVLAN20 معزولان تماماً.",
    checks: [
      { label: "سويتش موجود", test: (c) => c.count("Switch") >= 1 },
      { label: "4 أجهزة PC", test: (c) => c.count("PC") >= 4 },
      { label: "اتصالات كافية (4+)", test: (c) => c.connections.length >= 4 },
      { label: "جميع الأجهزة مربوطة", test: (c) => c.allConn("PC") }
    ]
  }),
  lab({
    id: "vtp_trunk",
    title: "ربط Trunk بين المحولات",
    desc: "محولان يتبادلان VLANs عبر منفذ Trunk واحد بينهما.",
    objective: "فهم منفذ Trunk وتمرير عدة VLANs على رابط واحد.",
    unitId: "unit17-vlan",
    lessonId: "vtp",
    difficulty: "متوسط",
    time: "20 دقيقة",
    xp: 210,
    icon: "🛤️",
    objectives: ["أضف محولين", "اربط بينهما برابط Trunk", "أضف جهازاً على كل محول", "تحقق من مرور VLANs عبر الرابط"],
    hints: ["Trunk يمرر كل VLANs المسموح بها", "المنفذ الآخر للاتصال بين المحولين يكون Access"],
    expected: "رابط Trunk يربط محولين مع أجهزة على كل منهما.",
    checks: [
      { label: "محولان", test: (c) => c.count("Switch") >= 2 },
      { label: "رابط بين المحولين", test: (c) => c.anyLink("Switch", "Switch") },
      { label: "جهاز على كل محول", test: (c) => c.count("PC") >= 2 && c.anyLink("PC", "Switch") }
    ]
  }),
  lab({
    id: "inter_vlan_roas",
    title: "التوجيه بين VLANs (Router-on-a-Stick)",
    desc: "اربط راوتراً واحداً بمحول Trunk لتوجيه حركة VLANs المتعددة.",
    objective: "تنفيذ Inter-VLAN Routing بواجهات فرعية (Sub-interfaces).",
    unitId: "unit18-inter-vlan",
    lessonId: "router-on-stick",
    difficulty: "متوسط",
    time: "25 دقيقة",
    xp: 240,
    icon: "🧩",
    objectives: ["أضف Router وSwitch", "اربط الراوتر بالمحول برابط Trunk", "أضف 4 أجهزة (2 لكل VLAN)", "اختبر الوصول بين المجموعتين"],
    hints: ["الواجهة الفرعية لكل VLAN مع dot1Q", "no shutdown على الواجهة الرئيسية", "المحول يضبط منفذه Trunk نحو الراوتر"],
    expected: "راوتر يوجه بين VLAN10 وVLAN20 عبر رابط واحد.",
    checks: [
      { label: "Router + Switch", test: (c) => c.count("Router") >= 1 && c.count("Switch") >= 1 },
      { label: "الراوتر متصل بالمحول", test: (c) => c.anyLink("Router", "Switch") },
      { label: "4 أجهزة PC", test: (c) => c.count("PC") >= 4 },
      { label: "الأجهزة متصلة بالمحول", test: (c) => c.anyLink("PC", "Switch") }
    ]
  }),
  lab({
    id: "dhcp_fix",
    title: "إصلاح مشكلة DHCP",
    desc: "الشبكة لا تُوزّع عناوين IP تلقائياً — اكتشف الخلل وأصلحه.",
    objective: "تشخيص وعلاج خدمة DHCP: الخادم، النطاق، البوابة.",
    unitId: "unit19-dhcp",
    lessonId: "dhcp-server",
    difficulty: "متوسط",
    time: "25 دقيقة",
    xp: 220,
    icon: "⚡",
    template: {
      nodes: [N("dhcp_fix-pc1", "PC", "PC1", 380, 220), N("dhcp_fix-pc2", "PC", "PC2", 380, 340), N("dhcp_fix-sw", "Switch", "SW1", 520, 280)],
      connections: []
    },
    objectives: ["أضف خادم DHCP (Server)", "اربط الخادم بالسويتش", "تحقق من نطاق التوزيع (Pool)", "اختبر استلام الأجهزة لعناوينها"],
    hints: ["خادم DHCP يحتاج IP ثابتاً", "تأكد من Default Gateway في الـ Pool", "النطاق يجب أن يطابق الشبكة"],
    expected: "خادم متصل يوزع عناوين IP تلقائياً على العملاء.",
    checks: [
      { label: "خادم DHCP (Server)", test: (c) => c.count("Server") >= 1 },
      { label: "الخادم متصل بالشبكة", test: (c) => c.anyConn("Server") },
      { label: "سويتش للتوزيع", test: (c) => c.count("Switch") >= 1 },
      { label: "عميلان فأكثر", test: (c) => c.count("PC") >= 2 }
    ]
  }),
  lab({
    id: "dhcp_relay",
    title: "DHCP عبر شبكات (Relay)",
    desc: "خادم DHCP في شبكة بعيدة — اربطه بالعملاء عبر راوتر وhelper-address.",
    objective: "فهم DHCP Relay وتحويل البث إلى Unicast عبر الراوتر.",
    unitId: "unit19-dhcp",
    lessonId: "dhcp-server",
    difficulty: "متوسط",
    time: "25 دقيقة",
    xp: 230,
    icon: "🔁",
    objectives: ["أضف Server في شبكة الخوادم", "أضف راوتراً يربط الشبكتين", "أضف سويتشاً وعملاء", "فعّل ip helper-address نحو الخادم"],
    hints: ["البث لا يعبر الراوتر — هنا يأتي دور الـ Relay", "helper-address يوجه طلبات DHCP للخادم"],
    expected: "خادم DHCP يخدم عملاء في شبكة أخرى عبر راوتر.",
    checks: [
      { label: "خادم موجود", test: (c) => c.count("Server") >= 1 },
      { label: "راوتر يربط الشبكتين", test: (c) => c.count("Router") >= 1 && c.anyConn("Router") },
      { label: "الخادم متصل بالراوتر", test: (c) => c.anyLink("Server", "Router") },
      { label: "عملاء متصلون (PC)", test: (c) => c.count("PC") >= 2 && c.anyLink("PC", "Switch") }
    ]
  }),
  lab({
    id: "port_security",
    title: "تأمين منافذ المحول",
    desc: "أغلق المنافذ غير المستخدمة وفعّل Port Security على منافذ الأجهزة.",
    objective: "تطبيق Port Security: حدود MAC ووضع الانتهاك.",
    unitId: "unit20-switch-security",
    lessonId: "switch-security",
    difficulty: "متوسط",
    time: "20 دقيقة",
    xp: 220,
    icon: "🔐",
    objectives: ["أضف سويتشاً و3 أجهزة PC", "اربط الأجهزة بالمنافذ المؤمّنة", "فعّل Sticky MAC", "أعد تفعيل منفذ مغلق"],
    hints: ["maximum 1 لكل منفذ أجهزة", "وضع Shutdown يغلق المنفذ عند الانتهاك", "no shutdown يعيد المنفذ للعمل"],
    expected: "محول مؤمّن المنافذ بجهاز واحد مسموح لكل منفذ.",
    checks: [
      { label: "سويتش موجود", test: (c) => c.count("Switch") >= 1 },
      { label: "3 أجهزة PC", test: (c) => c.count("PC") >= 3 },
      { label: "جميع الأجهزة متصلة", test: (c) => c.allConn("PC") },
      { label: "اتصالات كافية (3+)", test: (c) => c.connections.length >= 3 }
    ]
  }),
  lab({
    id: "wifi_network",
    title: "شبكة Wi-Fi للمكتب",
    desc: "أنشئ شبكة لاسلكية بتغطية كاملة وأمان WPA2.",
    objective: "فهم مكونات WLAN: نقطة الوصول، الراوتر، معايير 802.11.",
    unitId: "unit21-wlan-intro",
    lessonId: "wireless-basics",
    difficulty: "متوسط",
    time: "20 دقيقة",
    xp: 200,
    icon: "📶",
    objectives: ["أضف Router متصلاً بالإنترنت (Cloud)", "أضف Access Point", "اربط الـ AP بالراوتر", "أضف 3 أجهزة لابتوب", "تحقق من التغطية الكاملة"],
    hints: ["نقطة الوصول وسيط بين الراوتر والأجهزة اللاسلكية", "ضع الـ AP في مركز التغطية", "WEP مهجور — استخدم WPA2 أو أحدث"],
    expected: "شبكة لاسلكية كاملة: راوتر + AP + لابتوبات متصلة بالإنترنت.",
    checks: [
      { label: "Router موجود", test: (c) => c.count("Router") >= 1 },
      { label: "Access Point موجود", test: (c) => c.count("AccessPoint") >= 1 },
      { label: "متصل بالإنترنت (Cloud)", test: (c) => c.count("Cloud") >= 1 },
      { label: "3 أجهزة لابتوب", test: (c) => c.count("Laptop") >= 3 },
      { label: "AP متصل بالشبكة", test: (c) => c.anyConn("AccessPoint") }
    ]
  }),
  lab({
    id: "wireless_office",
    title: "إعداد جهاز التوجيه اللاسلكي",
    desc: "مكتب بشبكتين لاسلكيتين: راوتر مركزي تتبعه نقطتا وصول.",
    objective: "إدارة الشبكات اللاسلكية: SSID وقنوات وربط Mesh.",
    unitId: "unit22-wlan-config",
    lessonId: "wireless-router-integration",
    difficulty: "متوسط",
    time: "25 دقيقة",
    xp: 230,
    icon: "🏨",
    objectives: ["أضف Router واربطه بالإنترنت (Cloud)", "أضف نقطتي وصول (AP)", "اربط APs بالراوتر", "أضف لابتوبين للمستخدمين", "اضبط قنوات غير متداخلة (1/6/11)"],
    hints: ["القنوات 1 و6 و11 غير متداخلة في 2.4GHz", "Mesh يوسع التغطية تلقائياً"],
    expected: "شبكة مكتب لاسلكية مزدوجة AP بتغطية موسعة.",
    checks: [
      { label: "Router + Cloud", test: (c) => c.count("Router") >= 1 && c.count("Cloud") >= 1 },
      { label: "نقطتا وصول", test: (c) => c.count("AccessPoint") >= 2 },
      { label: "الراوتر متصل بالإنترنت", test: (c) => c.anyLink("Router", "Cloud") },
      { label: "APs متصلة بالراوتر", test: (c) => c.anyLink("AccessPoint", "Router") },
      { label: "لابتوب للمستخدمين", test: (c) => c.count("Laptop") >= 2 }
    ]
  }),
  lab({
    id: "subnet_plan",
    title: "خطة تقسيم شبكات",
    desc: "قسّم 192.168.1.0/24 إلى شبكتين /26 واربطهما براوترين.",
    objective: "تطبيق Subnetting وتوزيع النطاقات على شبكتين فعليتين.",
    unitId: "unit11-ipv4",
    lessonId: "ipv4-addresses",
    difficulty: "متوسط",
    time: "30 دقيقة",
    xp: 250,
    icon: "✂️",
    objectives: ["أضف راوترين واربطهما معاً", "أضف سويتشاً لكل راوتر", "أضف جهازين في كل شبكة", "وزّع النطاقات /26 بشكل صحيح"],
    hints: ["/26 = قناع 255.255.255.192 و62 جهازاً", "الشبكة الأولى 192.168.1.0 والثانية 192.168.1.64"],
    expected: "شبكتان مقسمتان /26 متصلتان عبر راوترين.",
    checks: [
      { label: "راوتران مترابطان", test: (c) => c.count("Router") >= 2 && c.anyLink("Router", "Router") },
      { label: "سويتش لكل شبكة", test: (c) => c.count("Switch") >= 2 },
      { label: "4 أجهزة (2 لكل شبكة)", test: (c) => c.count("PC") >= 4 },
      { label: "الشبكة مكتملة (6+ عناصر)", test: (c) => c.nodes.length >= 6 }
    ]
  }),
  lab({
    id: "broadcast_boundaries",
    title: "حدود نطاق البث",
    desc: "أظهر كيف يقسم الراوتر نطاق البث: شبكتان ببث منفصل.",
    objective: "التمييز بين نطاق البث ونطاق التصادم عبر أجهزة حقيقية.",
    unitId: "unit11-ipv4",
    lessonId: "ipv4-broadcast-types",
    difficulty: "متوسط",
    time: "20 دقيقة",
    xp: 220,
    icon: "📢",
    objectives: ["أضف راوتراً", "أضف محولين (واحد لكل واجهة)", "أضف جهازين لكل محول", "اختبر البث داخل كل شبكة"],
    hints: ["المحول الواحد نطاق بث واحد", "الراوتر لا يمرر البث بين واجهاته"],
    expected: "راوتر يفصل نطاقي بث مستقلين.",
    checks: [
      { label: "راوتر + محولان", test: (c) => c.count("Router") >= 1 && c.count("Switch") >= 2 },
      { label: "4 أجهزة PC", test: (c) => c.count("PC") >= 4 },
      { label: "الراوتر متصل بالمحولين", test: (c) => c.anyLink("Router", "Switch") },
      { label: "أجهزة متصلة بالمحولات", test: (c) => c.anyLink("PC", "Switch") }
    ]
  }),
  lab({
    id: "tcp_services",
    title: "خدمات TCP للمنشأة",
    desc: "خادم يقدم خدمات موجهة بالاتصال (HTTP/SSH) لثلاثة عملاء.",
    objective: "فهم TCP والاتصال الموجه (Three-Way Handshake) عبر خدمات فعلية.",
    unitId: "unit13-transport",
    lessonId: "tcp-udp",
    difficulty: "متوسط",
    time: "15 دقيقة",
    xp: 210,
    icon: "🤝",
    objectives: ["أضف Server", "أضف سويتشاً و3 أجهزة PC", "اربط الجميع", "افتح جلسة HTTP من عميل للخادم"],
    hints: ["HTTP على المنفذ 80 وSSH على 22 — كلاهما TCP", "الاتصال يبدأ بـ SYN وينتهي بـ ACK"],
    expected: "خادم خدمات متصل بثلاثة عملاء عبر سويتش.",
    checks: [
      { label: "Server موجود", test: (c) => c.count("Server") >= 1 },
      { label: "3 عملاء", test: (c) => c.count("PC") >= 3 },
      { label: "الخادم متصل", test: (c) => c.anyConn("Server") },
      { label: "العملاء متصلون", test: (c) => c.anyLink("PC", "Switch") }
    ]
  }),
  lab({
    id: "app_protocols",
    title: "مزرعة خوادم الخدمات",
    desc: "ثلاثة خوادم (ويب، DHCP/DNS، بريد) يخدمون العملاء عبر سويتش واحد.",
    objective: "تشغيل بروتوكولات طبقة التطبيقات: HTTP وDNS وDHCP وSMTP.",
    unitId: "unit14-application",
    lessonId: "application-protocols",
    difficulty: "متوسط",
    time: "25 دقيقة",
    xp: 240,
    icon: "🏛️",
    objectives: ["أضف 3 خوادم", "أضف سويتشاً وعميلين", "اربط جميع الخوادم", "اختبر DNS وHTTP من عميل"],
    hints: ["DNS يحول الاسم إلى IP قبل HTTP", "DHCP يعمل بـ UDP 67/68", "SMTP لإرسال البريد على 25"],
    expected: "ثلاثة خوادم خدمات متصلة بعملاء عبر سويتش مركزي.",
    checks: [
      { label: "3 خوادم", test: (c) => c.count("Server") >= 3 },
      { label: "سويتش مركزي", test: (c) => c.count("Switch") >= 1 },
      { label: "جميع الخوادم متصلة", test: (c) => c.allConn("Server") },
      { label: "عميلان+", test: (c) => c.count("PC") >= 2 }
    ]
  }),
  lab({
    id: "ssh_hardening",
    title: "تأمين الوصول بـ SSH",
    desc: "جهّز جهاز إدارة يصل للشبكة عبر SSH فقط — بلا Telnet.",
    objective: "تطبيق SSH: مفاتيح RSA ومستخدم محلي وtransport input ssh.",
    unitId: "unit15-advanced-initial",
    lessonId: "advanced-switch-router",
    difficulty: "متوسط",
    time: "20 دقيقة",
    xp: 230,
    icon: "🗝️",
    objectives: ["أضف Router وSwitch وPC إدارة", "اربط الجميع", "فعّل SSH على الراوتر", "اختبر الوصول من الـ PC"],
    hints: ["SSH يحتاج hostname وdomain-name ومفاتيح RSA", "transport input ssh يمنع Telnet", "SSH مشفر على المنفذ 22"],
    expected: "شبكة إدارة يصلها حاسب الإدارة عبر SSH فقط.",
    checks: [
      { label: "Router + Switch + PC", test: (c) => c.count("Router") >= 1 && c.count("Switch") >= 1 && c.count("PC") >= 1 },
      { label: "PC متصل بالسويتش", test: (c) => c.anyLink("PC", "Switch") },
      { label: "السويتش متصل بالراوتر", test: (c) => c.anyLink("Switch", "Router") },
      { label: "الشبكة مكتملة (4+)", test: (c) => c.nodes.length >= 4 }
    ]
  }),
  lab({
    id: "collision_domains",
    title: "نطاقات التصادم والبث",
    desc: "ابنِ شبكة تُظهر: كل منفذ محول نطاق تصادم، وكل واجهة راوتر نطاق بث.",
    objective: "تطبيق الفروق بين تأثير Hub/Switch/Router على النطاقات.",
    unitId: "unit16-switching-concepts",
    lessonId: "switching-concepts",
    difficulty: "متوسط",
    time: "20 دقيقة",
    xp: 220,
    icon: "🚧",
    objectives: ["أضف محولين، جهازين على كل محول", "أضف راوتراً يربط المحولين", "حدد نطاقات التصادم", "اختبر البث في كل قسم"],
    hints: ["كل منفذ سويتش نطاق تصادم مستقل", "الراوتر وحده يقسم نطاق البث", "VLAN تقسيم منطقي لنطاق البث"],
    expected: "شبكة من قسمين بنطاقي بث منفصلين و4 نطاقات تصادم.",
    checks: [
      { label: "محولان", test: (c) => c.count("Switch") >= 2 },
      { label: "4 أجهزة PC", test: (c) => c.count("PC") >= 4 },
      { label: "راوتر يربط القسمين", test: (c) => c.count("Router") >= 1 && c.anyLink("Router", "Switch") },
      { label: "أجهزة متصلة", test: (c) => c.anyLink("PC", "Switch") }
    ]
  }),
  /* ══════════ صعب (Hard) ══════════ */
  lab({
    id: "static_routing",
    title: "إعداد Static Routing",
    desc: "اربط شبكتين مختلفتين عبر راوترين ومسارات ثابتة.",
    objective: "تنفيذ ip route يدوياً بين شبكتين والتحقق بالـ ping.",
    unitId: "unit24-static-routing",
    lessonId: "static-routing",
    difficulty: "صعب",
    time: "30 دقيقة",
    xp: 300,
    icon: "🗺️",
    objectives: ["أضف راوترين واربطهما معاً", "أضف شبكة أجهزة لكل راوتر", "أضف Static Routes بينهما", "اختبر الاتصال بين الشبكتين"],
    hints: ["كل راوتر يحتاج مساراً نحو شبكة الآخر", "ip route [dest] [mask] [next-hop]", "تحقق بـ ping بعد الإعداد"],
    expected: "شبكتان تتواصلان عبر مسارات ثابتة صحيحة.",
    checks: [
      { label: "راوتران مترابطان", test: (c) => c.count("Router") >= 2 && c.anyLink("Router", "Router") },
      { label: "4 أجهزة في الشبكتين", test: (c) => c.count("PC") >= 4 },
      { label: "شبكة متكاملة (6+)", test: (c) => c.nodes.length >= 6 },
      { label: "اتصالات كافية (6+)", test: (c) => c.connections.length >= 6 }
    ]
  }),
  lab({
    id: "routing_chain",
    title: "سلسلة توجيه من ثلاثة راوترات",
    desc: "ثلاثة راوترات على التوالي — حزمة تعبر ثلاث قفزات (Hops).",
    objective: "قراءة جدول التوجيه وتتبع مسار حزمة عبر عدة راوترات.",
    unitId: "unit23-routing-how",
    lessonId: "routing-table",
    difficulty: "صعب",
    time: "35 دقيقة",
    xp: 320,
    icon: "⛓️",
    objectives: ["أضف 3 راوترات على التوالي واربطها", "أضف شبكة أجهزة في طرفي السلسلة", "اضبط مسارات السلسلة", "تتبع الحزمة Traceroute"],
    hints: ["كل قفزة تعني تغيير MAC مع بقاء IP", "AD للمسار الثابت = 1", "ping من الطرف للطرف هو الاختبار النهائي"],
    expected: "سلسلة ثلاثية القفزات توصل شبكتي الطرفين.",
    checks: [
      { label: "3 راوترات", test: (c) => c.count("Router") >= 3 },
      { label: "الراوترات مترابطة تسلسلياً", test: (c) => c.anyLink("Router", "Router") },
      { label: "أجهزة في طرفي السلسلة", test: (c) => c.count("PC") >= 2 },
      { label: "الشبكة مكتملة (6+)", test: (c) => c.nodes.length >= 6 }
    ]
  }),
  lab({
    id: "floating_backup",
    title: "مسار احتياطي Floating Static",
    desc: "مسار أساسي ومسار احتياطي بـ AD أعلى بين راوترين.",
    objective: "فهم تفضيل المسارات عبر Administrative Distance والتعافي عند الفشل.",
    unitId: "unit24-static-routing",
    lessonId: "static-routing",
    difficulty: "صعب",
    time: "30 دقيقة",
    xp: 330,
    icon: "🪜",
    objectives: ["أضف راوترين", "اربط بينهما برابطين (أساسي + احتياطي)", "أضف أجهزة لكل راوتر", "اضبط المسار الاحتياطي بـ AD 200"],
    hints: ["المسار ذو AD الأقل يفوز", "AD 200 يُستخدم فقط عند فشل الأساسي", "ارابطان فيزيائيان بين الراوترين"],
    expected: "راوتران برابطين: أساسي نشط واحتياطي صامت.",
    checks: [
      { label: "راوتران", test: (c) => c.count("Router") >= 2 },
      { label: "رابطان بينهما", test: (c) => {
        const rs = c.of("Router");
        return rs.length >= 2 && c.connections.filter(
          (conn) => rs.some((r) => r.id === conn.from) && rs.some((r) => r.id === conn.to)
        ).length >= 2;
      } },
      { label: "أجهزة على الجانبين", test: (c) => c.count("PC") >= 2 }
    ]
  }),
  lab({
    id: "ospf_area",
    title: "منطقة OSPF واحدة",
    desc: "ثلاثة راوترات في Area 0 بجيران Full وRouter-IDs ثابتة.",
    objective: "إعداد OSPFv2: network بـ wildcard وpassive-interface وجيران Full.",
    unitId: "unit25-ospf",
    lessonId: "ospf",
    difficulty: "صعب",
    time: "40 دقيقة",
    xp: 350,
    icon: "🕸️",
    objectives: ["أضف 3 راوترات", "اربطها بشكل كامل (Full Mesh)", "فعّل OSPF على الواجهات", "تحقق من الجيران Full"],
    hints: ["Router-ID يفضل أعلى Loopback", "Wildcard عكس القناع: /24 → 0.0.0.255", "show ip ospf neighbor للتحقق"],
    expected: "جيران OSPF بحالة Full بين ثلاثة راوترات.",
    checks: [
      { label: "3 راوترات", test: (c) => c.count("Router") >= 3 },
      { label: "روابط كافية (3+)", test: (c) => {
        const rs = c.of("Router");
        return c.connections.filter(
          (conn) => rs.some((r) => r.id === conn.from) && rs.some((r) => r.id === conn.to)
        ).length >= 3;
      } },
      { label: "أجهزة نهائية متصلة", test: (c) => c.count("PC") >= 2 && c.anyLink("PC", "Switch") },
      { label: "سويتشات للتوزيع", test: (c) => c.count("Switch") >= 1 }
    ]
  }),
  lab({
    id: "redundant_network",
    title: "شبكة Redundant عالية الإتاحة",
    desc: "صمّم شبكة بمسارات احتياطية تضمن عدم انقطاع الخدمة.",
    objective: "تطبيق التكرار: مسارات متعددة مع STP وOSPF للتعافي التلقائي.",
    unitId: "unit25-ospf",
    lessonId: "ospf",
    difficulty: "صعب",
    time: "35 دقيقة",
    xp: 340,
    icon: "♻️",
    objectives: ["أضف راوترين واربطهما (مسار احتياطي)", "أضف محولين+", "وفر أكثر من مسار بين الأجهزة", "تحقق من التعافي التلقائي"],
    hints: ["التكرار = مساران لنفس الوجهة", "STP يمنع الحلقات في المحولات", "OSPF يعيد التوجيه تلقائياً عند الفشل"],
    expected: "شبكة بمسارات متعددة تتعدى عدد العقد.",
    checks: [
      { label: "راوتران مترابطان", test: (c) => c.count("Router") >= 2 && c.anyLink("Router", "Router") },
      { label: "محولان+", test: (c) => c.count("Switch") >= 2 },
      { label: "مسارات متعددة", test: (c) => c.connections.length > c.nodes.length },
      { label: "أجهزة متصلة", test: (c) => c.count("PC") >= 2 }
    ]
  }),
  lab({
    id: "acl_standard",
    title: "قائمة ACL قياسية",
    desc: "امنع شبكة من الوصول لأخرى مع السماح للباقي — قرب الوجهة.",
    objective: "تطبيق Standard ACL بالـ wildcard وترتيب القواعد وimplicit deny.",
    unitId: "unit26-acl",
    lessonId: "standard-acl-1",
    difficulty: "صعب",
    time: "30 دقيقة",
    xp: 320,
    icon: "🚫",
    objectives: ["أضف راوتراً بين شبكتين", "محول وPC لكل شبكة", "طبّق قائمة ترشح حسب المصدر", "تحقق من المنع والسماح"],
    hints: ["Standard ACL ترشح المصدر فقط", "توضع قرب الوجهة", "كل قائمة تنتهي ضمنياً بـ deny any"],
    expected: "شبكة مصدر ممنوعة من شبكة الوجهة والباقي مسموح.",
    checks: [
      { label: "راوتر بين الشبكتين", test: (c) => c.count("Router") >= 1 },
      { label: "محولان", test: (c) => c.count("Switch") >= 2 },
      { label: "أجهزة في الشبكتين", test: (c) => c.count("PC") >= 2 },
      { label: "الراوتر متصل بالمحولين", test: (c) => c.anyLink("Router", "Switch") }
    ]
  }),
  lab({
    id: "firewall_acl",
    title: "إعداد Firewall وACL",
    desc: "احمِ الشبكة الداخلية من الوصول الخارجي غير المصرح به.",
    objective: "تطبيق Extended ACL: مصدر + وجهة + بروتوكول ومنفذ.",
    unitId: "unit26-acl",
    lessonId: "standard-acl-2",
    difficulty: "صعب",
    time: "40 دقيقة",
    xp: 350,
    icon: "🛡️",
    template: {
      nodes: [N("firewall_acl-cloud", "Cloud", "Internet", 640, 280), N("firewall_acl-sw", "Switch", "SW1", 380, 280)],
      connections: []
    },
    objectives: ["أضف Firewall بين الداخل والخارج", "وصّله بالشبكتين", "اضبط قواعد المنع والسماح", "اختبر القواعد"],
    hints: ["الـ Firewall يوضع بين الشبكتين", "Extended ACL قرب المصدر", "لا تنسَ قاعدة permit للسماح المتبقي"],
    expected: "جدار ناري بين شبكتين بقواعد ترشيح فعالة.",
    checks: [
      { label: "Firewall موجود", test: (c) => c.count("Firewall") >= 1 },
      { label: "Firewall متصل بشبكتين", test: (c) => {
        const fws = c.of("Firewall");
        return fws.length > 0 && fws.every((f) => c.deg(f.id) >= 2 || fws.some((f2) => c.deg(f2.id) >= 2));
      } },
      { label: "شبكة داخلية (Switch)", test: (c) => c.count("Switch") >= 1 },
      { label: "شبكة كاملة (4+)", test: (c) => c.nodes.length >= 4 }
    ]
  }),
  lab({
    id: "nat_static",
    title: "NAT ثابت للخادم العام",
    desc: "خادم داخلي يحتاج عنواناً عاماً ثابتاً 1:1 عبر الراوتر.",
    objective: "تنفيذ Static NAT: inside/outside وتحويل عنوان واحد ثابت.",
    unitId: "unit27-nat",
    lessonId: "nat",
    difficulty: "صعب",
    time: "30 دقيقة",
    xp: 330,
    icon: "🔄",
    objectives: ["أضف خادماً داخلياً وسويتشاً", "أضف راوتر NAT بين الداخل والخارج", "اربط الخارج بـ Cloud", "اضبط inside/outside"],
    hints: ["ip nat inside على واجهة الشبكة الداخلية", "outside على واجهة الإنترنت", "show ip nat translations للتحقق"],
    expected: "خادم داخلي يظهر للعالم بعنوان عام ثابت.",
    checks: [
      { label: "راوتر NAT", test: (c) => c.count("Router") >= 1 },
      { label: "خادم داخلي متصل", test: (c) => c.count("Server") >= 1 && c.anyConn("Server") },
      { label: "خارج (Cloud) متصل بالراوتر", test: (c) => c.anyLink("Router", "Cloud") },
      { label: "شبكة داخلية (Switch)", test: (c) => c.count("Switch") >= 1 }
    ]
  }),
  /* ══════════ متقدم (Advanced) ══════════ */
  lab({
    id: "pat_overload",
    title: "PAT — NAT Overload",
    desc: "مئات الأجهزة تشارك عنواناً عاماً واحداً عبر أرقام المنافذ.",
    objective: "تنفيذ PAT الكامل: قائمة وصول وpool عبر واجهة الخروج overload.",
    unitId: "unit27-nat",
    lessonId: "pat",
    difficulty: "متقدم",
    time: "40 دقيقة",
    xp: 420,
    icon: "🧵",
    objectives: ["أضف سويتشاً و3 أجهزة داخلية", "أضف راوتر PAT", "اربط الراوتر بالإنترنت (Cloud)", "فعّل overload على واجهة الخروج"],
    hints: ["عنوان واحد يكفي كل الشبكة عبر المنافذ", "access-list تحدد الأجهزة المسموحة", "interface overload بدل الـ pool"],
    expected: "شبكة كاملة تخرج للإنترنت بعنوان عام واحد.",
    checks: [
      { label: "راوتر PAT متصل بالإنترنت", test: (c) => c.count("Router") >= 1 && c.anyLink("Router", "Cloud") },
      { label: "3 أجهزة داخلية", test: (c) => c.count("PC") >= 3 },
      { label: "الشبكة الداخلية متصلة", test: (c) => c.anyLink("PC", "Switch") },
      { label: "الشبكة مكتملة (6+)", test: (c) => c.nodes.length >= 6 }
    ]
  }),
  lab({
    id: "dmz_setup",
    title: "إعداد DMZ للسيرفرات",
    desc: "منطقة DMZ آمنة للخوادم العامة مع عزل الشبكة الداخلية.",
    objective: "تصميم ثلاثي المناطق: إنترنت وDMZ وداخل — عبر جدار ناري.",
    unitId: "unit26-acl",
    lessonId: "standard-acl-2",
    difficulty: "متقدم",
    time: "45 دقيقة",
    xp: 430,
    icon: "🔒",
    objectives: ["أضف Firewall مركزياً", "أضف خادمين في DMZ", "أضف شبكة داخلية (Switch + PC)", "اربط الـ Firewall بالإنترنت", "اعزل الداخل عن الخارج"],
    hints: ["DMZ بين الـ Firewall والإنترنت", "خوادم DMZ يصلها الإنترنت ولا تصل الشبكة الداخلية", "3 نقاط اتصال على الأقل للجدار"],
    expected: "جدار ناري ثلاثي المناطق مع خادمي DMZ وشبكة داخلية معزولة.",
    checks: [
      { label: "Firewall مركزي", test: (c) => c.count("Firewall") >= 1 },
      { label: "Firewall متصل بـ3 شبكات", test: (c) => {
        const fws = c.of("Firewall");
        return fws.length > 0 && fws.some((f) => c.deg(f.id) >= 3);
      } },
      { label: "خادمان في DMZ", test: (c) => c.count("Server") >= 2 },
      { label: "شبكة داخلية (PC)", test: (c) => c.count("PC") >= 1 },
      { label: "اتصال بالإنترنت (Cloud)", test: (c) => c.count("Cloud") >= 1 }
    ]
  }),
  lab({
    id: "backbone_network",
    title: "شبكة Backbone للمؤسسة",
    desc: "بنية هرمية كاملة: Core → Distribution → Access لشركة متعددة الأدوار.",
    objective: "تصميم البنية الهرمية الثلاثية الطبقات لمؤسسة كبيرة.",
    unitId: "unit23-routing-how",
    lessonId: "routing-table",
    difficulty: "متقدم",
    time: "50 دقيقة",
    xp: 460,
    icon: "🏢",
    objectives: ["أضف Core Router", "أضف 3 محولات توزيع", "وزّع 6 أجهزة عليها", "أضف خادماً مركزياً", "اربط الهيكل كاملاً"],
    hints: ["Core → Distribution → Access هرمياً", "كل محول توزيع يخدم مجموعة أجهزة", "الراوتر المركزي يربط كل شيء"],
    expected: "هيكل مؤسسي هرمي متصل بالكامل مع خادم مركزي.",
    checks: [
      { label: "Core Router", test: (c) => c.count("Router") >= 1 },
      { label: "3 محولات توزيع", test: (c) => c.count("Switch") >= 3 },
      { label: "6 أجهزة+", test: (c) => c.count("PC") >= 6 },
      { label: "خادم مركزي", test: (c) => c.count("Server") >= 1 },
      { label: "الراوتر متصل بالمحولات", test: (c) => c.anyLink("Router", "Switch") }
    ]
  }),
  lab({
    id: "enterprise_fortress",
    title: "قلعة المؤسسة الشاملة",
    desc: "دمج كل ما تعلمته: NAT + DMZ + ACL + هيكل هرمي بشبكة واحدة محصّنة.",
    objective: "التصميم الأمني الشامل: جدار، مناطق، ترجمة عناوين وتوزيع هرمي.",
    unitId: "unit27-nat",
    lessonId: "pat",
    difficulty: "متقدم",
    time: "60 دقيقة",
    xp: 500,
    icon: "🏰",
    objectives: ["أضف Firewall وراوتر NAT", "خوادم في DMZ", "شبكة داخلية هرمية (سويتشان+4 أجهزة)", "اربط الجميع بالإنترنت (Cloud)", "طبّق قواعد ACL على الحدود"],
    hints: ["ابدأ من الخارج: Cloud → Firewall → داخل", "DMZ للخدمات العامة فقط", "كل منطقة نطاق عناوين مستقل"],
    expected: "شبكة مؤسسية محصّنة كاملة المناطق والقواعد.",
    checks: [
      { label: "Firewall + Router معاً", test: (c) => c.count("Firewall") >= 1 && c.count("Router") >= 1 },
      { label: "خوادم DMZ", test: (c) => c.count("Server") >= 2 },
      { label: "شبكة داخلية (سويتشان)", test: (c) => c.count("Switch") >= 2 },
      { label: "4 أجهزة+", test: (c) => c.count("PC") >= 4 },
      { label: "اتصال بالإنترنت (Cloud)", test: (c) => c.anyLink("Router", "Cloud") || c.anyLink("Firewall", "Cloud") }
    ]
  })
]);
const SORTED_SCENARIOS = [...SCENARIOS].sort(
  (a, b) => (DIFF_ORDER[a.difficulty] ?? 9) - (DIFF_ORDER[b.difficulty] ?? 9)
);
const TOTAL_SCENARIOS = SCENARIOS.length;
function getScenarioById(id) {
  return SCENARIOS.find((s) => s.id === id) || null;
}
function getLessonInfo(lessonId) {
  var _a;
  for (const unit of courseData) {
    const topic = (_a = unit.topics) == null ? void 0 : _a.find((t2) => t2.id === lessonId);
    if (topic) {
      return { lessonId, lessonTitle: topic.title, unitId: unit.id, unitTitle: unit.title };
    }
  }
  return null;
}
const LANG_NAMES = { en: "English", he: "Hebrew" };
const cacheKeyFor = (lang, key) => `ai-tr-${lang}-${key}`;
function useAiTranslation(key, text) {
  const lang = getLang();
  const [translated, setTranslated] = useState(null);
  const [translating, setTranslating] = useState(false);
  useEffect(() => {
    if (lang === "ar" || !text) {
      setTranslated(null);
      setTranslating(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const cached = localStorage.getItem(cacheKeyFor(lang, key));
        if (cached) {
          if (!cancelled) setTranslated(cached);
          return;
        }
      } catch {
      }
      setTranslating(true);
      try {
        const res = await base44.integrations.Core.InvokeLLM({
          prompt: `Translate the following networking lesson from Arabic to ${LANG_NAMES[lang]}.
Rules:
- Keep all Markdown formatting intact (headings, tables, lists, bold, links).
- Keep code blocks and CLI commands EXACTLY as they are — do not translate or modify them.
- Use the standard technical terms in ${LANG_NAMES[lang]}.
- Return ONLY the translated Markdown text, with no commentary.

` + text
        });
        const out = typeof res === "string" ? res : (res == null ? void 0 : res.response) || (res == null ? void 0 : res.text) || "";
        if (out && !cancelled) {
          try {
            localStorage.setItem(cacheKeyFor(lang, key), out);
          } catch {
          }
          setTranslated(out);
        }
      } catch {
      } finally {
        if (!cancelled) setTranslating(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [lang, key, text]);
  return {
    content: lang === "ar" ? text : translated || text,
    translating: lang !== "ar" && !translated
  };
}
const iconMap = {
  Network,
  Globe,
  Shield,
  Server,
  Radio,
  Cpu,
  Route,
  Tag
};
function markTopicVisited(topicId) {
  try {
    const data = JSON.parse(localStorage.getItem("topic-progress") || "{}");
    data[topicId] = { visited: true, visitedAt: (/* @__PURE__ */ new Date()).toISOString() };
    localStorage.setItem("topic-progress", JSON.stringify(data));
  } catch {
  }
}
function TopicPage() {
  const { sectionId, topicId } = useParams();
  useNavigate();
  useLang();
  const section = courseData.find((s) => s.id === sectionId);
  const topic = section == null ? void 0 : section.topics.find((tp) => tp.id === topicId);
  const { content: displayContent, translating } = useAiTranslation(topicId, (topic == null ? void 0 : topic.content) || "");
  useEffect(() => {
    markTopicVisited(topicId);
    base44.analytics.track({
      eventName: "topic_visited",
      properties: {
        topic_id: topicId,
        topic_title: (topic == null ? void 0 : topic.title) || "",
        section_id: sectionId,
        section_title: (section == null ? void 0 : section.title) || ""
      }
    });
    syncProgressToServer();
  }, [topicId]);
  if (!section || !topic) {
    return /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center min-h-screen", children: /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-xl font-bold text-foreground mb-2", children: t("topicNotFound") }),
      /* @__PURE__ */ jsx(Link, { to: "/", className: "text-primary hover:underline text-sm", children: t("backHome") })
    ] }) });
  }
  const Icon = iconMap[section.icon] || Network;
  const currentIndex = section.topics.findIndex((t2) => t2.id === topicId);
  const prevTopic = currentIndex > 0 ? section.topics[currentIndex - 1] : null;
  const nextTopic = currentIndex < section.topics.length - 1 ? section.topics[currentIndex + 1] : null;
  const sectionIndex = courseData.findIndex((s) => s.id === sectionId);
  const nextSection = !nextTopic && sectionIndex < courseData.length - 1 ? courseData[sectionIndex + 1] : null;
  const prevSection = !prevTopic && sectionIndex > 0 ? courseData[sectionIndex - 1] : null;
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen", children: [
    /* @__PURE__ */ jsx("div", { className: "relative overflow-hidden border-b border-border", style: { background: "#F7F9FC" }, children: /* @__PURE__ */ jsx("div", { className: "relative max-w-4xl mx-auto px-6 py-10 lg:py-14", children: /* @__PURE__ */ jsxs(
      motion.div,
      {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.3 },
        children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm mb-4", style: { color: "rgba(47,102,144,0.75)" }, children: [
            /* @__PURE__ */ jsx(Link, { to: "/", className: "transition-colors hover:text-primary", children: t("backHome") }),
            /* @__PURE__ */ jsx(ChevronLeft, { size: 14 }),
            /* @__PURE__ */ jsx("span", { children: sectionTitle(section) }),
            /* @__PURE__ */ jsx(ChevronLeft, { size: 14 }),
            /* @__PURE__ */ jsx("span", { style: { color: "#173F5F" }, children: topicTitle(topic) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-2", children: [
            /* @__PURE__ */ jsx("div", { className: "w-10 h-10 rounded-xl flex items-center justify-center", style: { background: "#2F6690" }, children: /* @__PURE__ */ jsx(Icon, { className: "text-white", size: 20 }) }),
            /* @__PURE__ */ jsx("span", { className: "text-sm font-medium", style: { color: "#2F6690" }, children: sectionTitle(section) })
          ] }),
          /* @__PURE__ */ jsx("h1", { className: "text-2xl sm:text-3xl font-black", style: { color: "#173F5F" }, children: topicTitle(topic) })
        ]
      }
    ) }) }),
    /* @__PURE__ */ jsxs("div", { className: "max-w-4xl mx-auto px-6 py-10", children: [
      /* @__PURE__ */ jsxs(
        motion.div,
        {
          initial: { opacity: 0, y: 10 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.3, delay: 0.1 },
          className: "bg-card rounded-2xl border border-border p-6 sm:p-8 shadow-sm",
          children: [
            /* @__PURE__ */ jsx("div", { className: "flex justify-end mb-4", children: /* @__PURE__ */ jsx(TextToSpeech, { text: displayContent, label: t("ttsReadLabel") }) }),
            translating && /* @__PURE__ */ jsxs(
              "div",
              {
                className: "flex items-center gap-2 mb-4 px-3 py-2 rounded-xl text-[11px] font-bold",
                style: { background: "rgba(47,102,144,0.07)", border: "1px solid rgba(47,102,144,0.25)", color: "#2F6690" },
                children: [
                  /* @__PURE__ */ jsx(Loader2, { size: 12, className: "animate-spin" }),
                  " ",
                  t("translatingLesson")
                ]
              }
            ),
            /* @__PURE__ */ jsx(
              ReactMarkdown,
              {
                className: "prose prose-sm sm:prose-base prose-slate max-w-none\n              prose-headings:font-bold prose-headings:text-foreground\n              prose-h2:text-xl prose-h2:mt-0 prose-h2:mb-4\n              prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-3\n              prose-h4:text-base prose-h4:mt-4\n              prose-p:text-muted-foreground prose-p:leading-relaxed\n              prose-strong:text-foreground\n              prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono prose-code:text-primary\n              prose-pre:bg-slate-900 prose-pre:text-slate-100 prose-pre:rounded-xl prose-pre:p-4 prose-pre:text-sm prose-pre:overflow-x-auto prose-pre:direction-ltr prose-pre:text-left\n              prose-table:text-sm\n              prose-th:bg-muted prose-th:px-3 prose-th:py-2 prose-th:font-semibold\n              prose-td:px-3 prose-td:py-2 prose-td:border-b prose-td:border-border\n              prose-li:text-muted-foreground\n              prose-blockquote:border-primary prose-blockquote:bg-primary/5 prose-blockquote:rounded-lg prose-blockquote:py-1 prose-blockquote:px-4\n              prose-a:text-primary prose-a:no-underline hover:prose-a:underline",
                components: {
                  code: ({ inline, className, children, ...props }) => {
                    if (!inline && className) {
                      return /* @__PURE__ */ jsx("pre", { className: "bg-slate-900 text-slate-100 rounded-xl p-4 overflow-x-auto text-sm", dir: "ltr", style: { textAlign: "left" }, children: /* @__PURE__ */ jsx("code", { className, ...props, children }) });
                    }
                    if (!inline) {
                      return /* @__PURE__ */ jsx("pre", { className: "bg-slate-900 text-slate-100 rounded-xl p-4 overflow-x-auto text-sm", dir: "ltr", style: { textAlign: "left" }, children: /* @__PURE__ */ jsx("code", { ...props, children }) });
                    }
                    return /* @__PURE__ */ jsx("code", { className: "bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-primary", ...props, children });
                  }
                },
                children: displayContent
              }
            )
          ]
        }
      ),
      terminalData[topicId] && /* @__PURE__ */ jsx("div", { className: "bg-card rounded-2xl border border-border p-6 sm:p-8 shadow-sm mt-6", children: /* @__PURE__ */ jsx(TerminalSimulator, { terminalConfig: terminalData[topicId] }) }),
      mergedQuizzes[topicId] && /* @__PURE__ */ jsx("div", { className: "mt-6", children: /* @__PURE__ */ jsx(ReadingGate, { content: displayContent, children: /* @__PURE__ */ jsxs("div", { className: "bg-card rounded-2xl border border-border p-6 sm:p-8 shadow-sm", children: [
        /* @__PURE__ */ jsx("div", { className: "flex justify-end mb-2", children: /* @__PURE__ */ jsx(
          TextToSpeech,
          {
            text: mergedQuizzes[topicId].questions.map((q, i) => `${t("lessonLabel")} ${i + 1}: ${q.question}`).join(". "),
            label: t("ttsReadQuestions")
          }
        ) }),
        /* @__PURE__ */ jsx(QuizSection, { quiz: { ...mergedQuizzes[topicId], id: topicId } })
      ] }) }) }),
      (() => {
        const lessonScenarios = SCENARIOS.filter((s) => s.lessonId === topicId);
        if (!lessonScenarios.length) return null;
        return /* @__PURE__ */ jsxs("div", { className: "mt-6 bg-card rounded-2xl border border-border p-6 sm:p-8 shadow-sm", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
            /* @__PURE__ */ jsx(FlaskConical, { size: 17, className: "text-primary" }),
            /* @__PURE__ */ jsx("h2", { className: "font-black text-base", children: t("lessonScenariosTitle") })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-[11px] text-muted-foreground mb-4", children: t("lessonScenariosDesc") }),
          /* @__PURE__ */ jsx("div", { className: "grid sm:grid-cols-2 gap-3", children: lessonScenarios.map((sc) => /* @__PURE__ */ jsxs(
            Link,
            {
              to: `/scenario-lab?lesson=${topicId}&open=${sc.id}`,
              className: "rounded-xl p-4 transition-all hover:shadow-md",
              style: { background: "rgba(47,102,144,0.04)", border: "1px solid rgba(47,102,144,0.22)" },
              children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-2", children: [
                  /* @__PURE__ */ jsx("span", { className: "text-xl", children: sc.icon }),
                  /* @__PURE__ */ jsx("span", { className: `text-[10px] border px-2 py-0.5 rounded-full font-bold ${sc.diffColor}`, children: t(DIFF_LABEL_KEYS[sc.difficulty] || "diffMedium") })
                ] }),
                /* @__PURE__ */ jsx("div", { className: "text-sm font-bold mb-1.5", children: sc.title }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 text-[10px] text-muted-foreground", children: [
                  /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
                    /* @__PURE__ */ jsx(Clock, { size: 11 }),
                    " ",
                    sc.time
                  ] }),
                  /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
                    /* @__PURE__ */ jsx(Zap, { size: 11, className: "text-warning" }),
                    " ",
                    sc.xp,
                    " XP"
                  ] })
                ] })
              ]
            },
            sc.id
          )) })
        ] });
      })(),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mt-8 gap-4", children: [
        prevTopic || prevSection ? /* @__PURE__ */ jsxs(
          Link,
          {
            to: prevTopic ? `/topic/${sectionId}/${prevTopic.id}` : `/topic/${prevSection.id}/${prevSection.topics[prevSection.topics.length - 1].id}`,
            className: "flex items-center gap-2 px-4 py-3 rounded-xl bg-card border border-border hover:shadow-md transition-all group flex-1 max-w-xs",
            children: [
              /* @__PURE__ */ jsx(ArrowRight, { size: 16, className: "text-muted-foreground group-hover:text-primary transition-colors" }),
              /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
                /* @__PURE__ */ jsx("div", { className: "text-[10px] text-muted-foreground", children: t("navPrev") }),
                /* @__PURE__ */ jsx("div", { className: "text-sm font-medium text-foreground truncate", children: prevTopic ? topicTitle(prevTopic) : topicTitle(prevSection.topics[prevSection.topics.length - 1]) })
              ] })
            ]
          }
        ) : /* @__PURE__ */ jsx("div", {}),
        nextTopic || nextSection ? /* @__PURE__ */ jsxs(
          Link,
          {
            to: nextTopic ? `/topic/${sectionId}/${nextTopic.id}` : `/topic/${nextSection.id}/${nextSection.topics[0].id}`,
            className: "flex items-center gap-2 px-4 py-3 rounded-xl bg-card border border-border hover:shadow-md transition-all group flex-1 max-w-xs justify-end",
            children: [
              /* @__PURE__ */ jsxs("div", { className: "text-left", children: [
                /* @__PURE__ */ jsx("div", { className: "text-[10px] text-muted-foreground", children: t("navNext") }),
                /* @__PURE__ */ jsx("div", { className: "text-sm font-medium text-foreground truncate", children: nextTopic ? topicTitle(nextTopic) : topicTitle(nextSection.topics[0]) })
              ] }),
              /* @__PURE__ */ jsx(ArrowLeft, { size: 16, className: "text-muted-foreground group-hover:text-primary transition-colors" })
            ]
          }
        ) : /* @__PURE__ */ jsx("div", {})
      ] })
    ] })
  ] });
}
const DEVICE_STYLES = {
  Router: { glow: "#173F5F", bg: "rgba(23,63,95,0.06)", border: "rgba(23,63,95,0.45)" },
  Switch: { glow: "#2E7D5B", bg: "rgba(46,125,91,0.06)", border: "rgba(46,125,91,0.45)" },
  PC: { glow: "#2F6690", bg: "rgba(47,102,144,0.06)", border: "rgba(47,102,144,0.45)" },
  Server: { glow: "#3A86A8", bg: "rgba(58,134,168,0.06)", border: "rgba(58,134,168,0.45)" },
  Firewall: { glow: "#C94C4C", bg: "rgba(201,76,76,0.06)", border: "rgba(201,76,76,0.45)" },
  AccessPoint: { glow: "#D69E2E", bg: "rgba(214,158,46,0.07)", border: "rgba(214,158,46,0.45)" },
  Cloud: { glow: "#64748B", bg: "rgba(100,116,139,0.06)", border: "rgba(100,116,139,0.45)" },
  Laptop: { glow: "#2F6690", bg: "rgba(47,102,144,0.06)", border: "rgba(47,102,144,0.45)" }
};
const DEVICE_ICONS = {
  Router: /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 40 40", fill: "none", className: "w-9 h-9", children: [
    /* @__PURE__ */ jsx("rect", { x: "4", y: "14", width: "32", height: "12", rx: "3", fill: "#173F5F", opacity: "0.9" }),
    /* @__PURE__ */ jsx("circle", { cx: "12", cy: "20", r: "2.5", fill: "#9DB8CE" }),
    /* @__PURE__ */ jsx("circle", { cx: "20", cy: "20", r: "2.5", fill: "#C7D8E6" }),
    /* @__PURE__ */ jsx("circle", { cx: "28", cy: "20", r: "2.5", fill: "#9DB8CE" }),
    /* @__PURE__ */ jsx("rect", { x: "10", y: "8", width: "3", height: "6", rx: "1", fill: "#3A86A8" }),
    /* @__PURE__ */ jsx("rect", { x: "19", y: "6", width: "3", height: "8", rx: "1", fill: "#9DB8CE" }),
    /* @__PURE__ */ jsx("rect", { x: "28", y: "9", width: "3", height: "5", rx: "1", fill: "#3A86A8" })
  ] }),
  Switch: /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 40 40", fill: "none", className: "w-9 h-9", children: [
    /* @__PURE__ */ jsx("rect", { x: "4", y: "15", width: "32", height: "10", rx: "2", fill: "#2E7D5B", opacity: "0.9" }),
    [8, 13, 18, 23, 28].map((x) => /* @__PURE__ */ jsx("rect", { x, y: "19", width: "3", height: "2", rx: "0.5", fill: "#BFDCCF" }, x)),
    /* @__PURE__ */ jsx("path", { d: "M8 15 L8 10 M15 15 L15 10 M22 15 L22 10 M29 15 L29 10", stroke: "#2E7D5B", strokeWidth: "1.5" }),
    /* @__PURE__ */ jsx("path", { d: "M8 25 L8 30 M15 25 L15 30 M22 25 L22 30 M29 25 L29 30", stroke: "#2E7D5B", strokeWidth: "1.5" })
  ] }),
  PC: /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 40 40", fill: "none", className: "w-9 h-9", children: [
    /* @__PURE__ */ jsx("rect", { x: "6", y: "8", width: "28", height: "18", rx: "2", fill: "#2F6690", opacity: "0.9" }),
    /* @__PURE__ */ jsx("rect", { x: "8", y: "10", width: "24", height: "14", rx: "1", fill: "#3A86A8", opacity: "0.7" }),
    /* @__PURE__ */ jsx("rect", { x: "15", y: "28", width: "10", height: "3", rx: "1", fill: "#3A86A8" }),
    /* @__PURE__ */ jsx("rect", { x: "12", y: "31", width: "16", height: "1.5", rx: "0.75", fill: "#2F6690" })
  ] }),
  Server: /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 40 40", fill: "none", className: "w-9 h-9", children: [
    /* @__PURE__ */ jsx("rect", { x: "8", y: "7", width: "24", height: "8", rx: "2", fill: "#3A86A8", opacity: "0.9" }),
    /* @__PURE__ */ jsx("rect", { x: "8", y: "17", width: "24", height: "8", rx: "2", fill: "#2F6690", opacity: "0.9" }),
    /* @__PURE__ */ jsx("rect", { x: "8", y: "27", width: "24", height: "6", rx: "2", fill: "#173F5F", opacity: "0.9" }),
    /* @__PURE__ */ jsx("circle", { cx: "28", cy: "11", r: "1.5", fill: "#A8CBE0" }),
    /* @__PURE__ */ jsx("circle", { cx: "28", cy: "21", r: "1.5", fill: "#A8CBE0" })
  ] }),
  Firewall: /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 40 40", fill: "none", className: "w-9 h-9", children: [
    /* @__PURE__ */ jsx("path", { d: "M20 4 L34 10 L34 22 C34 30 20 36 20 36 C20 36 6 30 6 22 L6 10 Z", fill: "#C94C4C", opacity: "0.9" }),
    /* @__PURE__ */ jsx("path", { d: "M20 10 L28 14 L28 22 C28 27 20 31 20 31 C20 31 12 27 12 22 L12 14 Z", fill: "#E0A9A9", opacity: "0.7" }),
    /* @__PURE__ */ jsx("path", { d: "M20 16 L24 18 L24 22 C24 24.5 20 26 20 26 C20 26 16 24.5 16 22 L16 18 Z", fill: "#C94C4C" })
  ] }),
  AccessPoint: /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 40 40", fill: "none", className: "w-9 h-9", children: [
    /* @__PURE__ */ jsx("circle", { cx: "20", cy: "26", r: "4", fill: "#D69E2E", opacity: "0.9" }),
    /* @__PURE__ */ jsx("path", { d: "M12 18 Q20 10 28 18", stroke: "#E7C683", strokeWidth: "2.5", strokeLinecap: "round", fill: "none" }),
    /* @__PURE__ */ jsx("path", { d: "M8 13 Q20 3 32 13", stroke: "#F0E1BF", strokeWidth: "2", strokeLinecap: "round", fill: "none" }),
    /* @__PURE__ */ jsx("line", { x1: "20", y1: "26", x2: "20", y2: "34", stroke: "#D69E2E", strokeWidth: "2" }),
    /* @__PURE__ */ jsx("rect", { x: "14", y: "33", width: "12", height: "2", rx: "1", fill: "#D69E2E" })
  ] }),
  Cloud: /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 40 40", fill: "none", className: "w-9 h-9", children: [
    /* @__PURE__ */ jsx("path", { d: "M10 28 C6 28 4 25 4 22 C4 19 6.5 17 9.5 17 C9.5 12 13 8 18 8 C22 8 25.5 10.5 26.5 14 C27 14 27.5 14 28 14 C32 14 36 17 36 22 C36 26 33 28 29 28 Z", fill: "#3A86A8", opacity: "0.9" }),
    /* @__PURE__ */ jsx("path", { d: "M15 28 L15 34 M20 28 L20 36 M25 28 L25 34", stroke: "#A8CBE0", strokeWidth: "1.5", strokeLinecap: "round" })
  ] }),
  Laptop: /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 40 40", fill: "none", className: "w-9 h-9", children: [
    /* @__PURE__ */ jsx("rect", { x: "7", y: "9", width: "26", height: "18", rx: "2", fill: "#1E293B" }),
    /* @__PURE__ */ jsx("rect", { x: "9", y: "11", width: "22", height: "14", rx: "1", fill: "#3A86A8", opacity: "0.7" }),
    /* @__PURE__ */ jsx("path", { d: "M4 29 L36 29 L34 32 L6 32 Z", fill: "#334155" }),
    /* @__PURE__ */ jsx("rect", { x: "16", y: "29", width: "8", height: "1", rx: "0.5", fill: "#475569" })
  ] })
};
function NetworkNode({
  node,
  selected,
  highlighted,
  connectMode,
  deleteMode,
  onClick,
  onDelete,
  onMove,
  onMoveEnd,
  zoom,
  hasActivePacket
}) {
  const [dragging, setDragging] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const hasDragged = useRef(false);
  const style = DEVICE_STYLES[node.type] || DEVICE_STYLES.PC;
  const isConnectSource = highlighted;
  const isActive = hasActivePacket;
  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    if (connectMode || deleteMode) {
      return;
    }
    hasDragged.current = false;
    setDragging(true);
    dragOffset.current = {
      x: e.clientX / zoom - node.x,
      y: e.clientY / zoom - node.y
    };
    const onMoveHandler = (ev) => {
      hasDragged.current = true;
      onMove(node.id, ev.clientX / zoom - dragOffset.current.x, ev.clientY / zoom - dragOffset.current.y);
    };
    const onUp = (ev) => {
      setDragging(false);
      window.removeEventListener("mousemove", onMoveHandler);
      window.removeEventListener("mouseup", onUp);
      if (hasDragged.current && onMoveEnd) {
        onMoveEnd(node.id, ev.clientX / zoom - dragOffset.current.x, ev.clientY / zoom - dragOffset.current.y);
      }
    };
    window.addEventListener("mousemove", onMoveHandler);
    window.addEventListener("mouseup", onUp);
  };
  const handleClick = (e) => {
    e.stopPropagation();
    onClick();
  };
  const boxShadow = selected || isConnectSource ? `0 4px 16px rgba(${hexToRgb$3(style.glow)},0.25)` : `0 2px 8px rgba(23,63,95,0.1)`;
  return /* @__PURE__ */ jsx(
    "div",
    {
      onMouseDown: handleMouseDown,
      onClick: handleClick,
      onMouseEnter: () => setShowDelete(true),
      onMouseLeave: () => setShowDelete(false),
      style: {
        position: "absolute",
        left: node.x,
        top: node.y,
        transform: "translate(-50%, -50%)",
        cursor: deleteMode ? "not-allowed" : connectMode ? "crosshair" : dragging ? "grabbing" : "grab",
        zIndex: dragging ? 1e3 : selected ? 100 : 1,
        userSelect: "none"
      },
      children: /* @__PURE__ */ jsxs(
        "div",
        {
          className: "flex flex-col items-center gap-1.5",
          style: {
            transform: dragging ? "scale(1.08)" : isConnectSource ? "scale(1.1)" : "scale(1)",
            transition: "transform 0.15s"
          },
          children: [
            /* @__PURE__ */ jsxs(
              "div",
              {
                style: {
                  width: 64,
                  height: 64,
                  borderRadius: 16,
                  background: "#FFFFFF",
                  border: `1.5px solid ${selected || isConnectSource ? style.glow : style.border}`,
                  boxShadow,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  transition: "box-shadow 0.2s, border-color 0.2s"
                },
                children: [
                  DEVICE_ICONS[node.type],
                  isActive && /* @__PURE__ */ jsx(
                    "div",
                    {
                      className: "absolute inset-0 rounded-2xl animate-ping",
                      style: {
                        border: `1px solid ${style.glow}`,
                        opacity: 0.4,
                        animationDuration: "1.5s"
                      }
                    }
                  ),
                  showDelete && !connectMode && !deleteMode && /* @__PURE__ */ jsx(
                    "button",
                    {
                      onMouseDown: (e) => e.stopPropagation(),
                      onClick: (e) => {
                        e.stopPropagation();
                        onDelete();
                      },
                      className: "absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center shadow-lg z-10 transition-all hover:scale-110",
                      style: {
                        background: "#C94C4C",
                        border: "1px solid rgba(201,76,76,0.5)"
                      },
                      children: /* @__PURE__ */ jsx(Trash2, { size: 9, className: "text-white" })
                    }
                  )
                ]
              }
            ),
            /* @__PURE__ */ jsx(
              "span",
              {
                className: "text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap",
                style: {
                  color: style.glow,
                  background: `rgba(${hexToRgb$3(style.glow)},0.08)`,
                  border: `1px solid rgba(${hexToRgb$3(style.glow)},0.25)`
                },
                children: node.label
              }
            ),
            node.ip && /* @__PURE__ */ jsx(
              "span",
              {
                className: "text-[9px] font-mono whitespace-nowrap",
                style: {
                  color: "#2F6690",
                  background: "rgba(47,102,144,0.06)",
                  border: "1px solid rgba(47,102,144,0.2)",
                  padding: "1px 6px",
                  borderRadius: 6
                },
                children: node.ip
              }
            )
          ]
        }
      )
    }
  );
}
function hexToRgb$3(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}
const CONNECTION_STYLES = {
  ethernet: { label: "Ethernet", color: "#2F6690", dash: "none", description: "كابل إيثرنت (UTP/Cat5e)" },
  fiber: { label: "Fiber Optic", color: "#3A86A8", dash: "8 3", description: "ألياف بصرية — سرعة عالية جداً" },
  serial: { label: "Serial", color: "#D69E2E", dash: "4 4", description: "اتصال تسلسلي بين راوترات" },
  wifi: { label: "Wi-Fi", color: "#2E7D5B", dash: "3 6", description: "اتصال لاسلكي" },
  copper: { label: "Copper Cable", color: "#64748B", dash: "none", description: "نحاسي — شبكات قصيرة المدى" }
};
function getConnectionType(typeA, typeB) {
  const pair = [typeA, typeB].sort().join("-");
  const rules = {
    "Laptop-Router": "wifi",
    "AccessPoint-Laptop": "wifi",
    "AccessPoint-PC": "wifi",
    "AccessPoint-Router": "ethernet",
    "AccessPoint-Switch": "ethernet",
    "PC-Router": "ethernet",
    "PC-Switch": "ethernet",
    "Laptop-Switch": "ethernet",
    "Router-Server": "ethernet",
    "PC-Server": "ethernet",
    "Laptop-Server": "ethernet",
    "Router-Switch": "ethernet",
    "Router-Router": "fiber",
    "Cloud-Router": "fiber",
    "Cloud-Firewall": "fiber",
    "Firewall-Router": "ethernet",
    "Firewall-Switch": "ethernet",
    "Server-Switch": "ethernet",
    "Server-Server": "fiber"
  };
  return rules[pair] || "ethernet";
}
function ConnectionLines({ connections, nodes, deleteConnection, zoom }) {
  const [hoveredConn, setHoveredConn] = useState(null);
  const getNode = (id) => nodes.find((n) => n.id === id);
  return /* @__PURE__ */ jsx(Fragment, { children: connections.map((conn) => {
    const from = getNode(conn.from);
    const to = getNode(conn.to);
    if (!from || !to) return null;
    const isHovered = hoveredConn === conn.id;
    const mx = (from.x + to.x) / 2;
    const my = (from.y + to.y) / 2;
    const connTypeKey = conn.connectionType || getConnectionType(from.type, to.type);
    const connStyle = CONNECTION_STYLES[connTypeKey] || CONNECTION_STYLES.ethernet;
    const lineColor = isHovered ? "#EF4444" : connStyle.color;
    const dashArray = isHovered ? "8 4" : connStyle.dash === "none" ? void 0 : connStyle.dash;
    return /* @__PURE__ */ jsxs("g", { children: [
      /* @__PURE__ */ jsx(
        "line",
        {
          x1: from.x,
          y1: from.y,
          x2: to.x,
          y2: to.y,
          stroke: `${connStyle.color}30`,
          strokeWidth: isHovered ? 12 : 8,
          style: { pointerEvents: "none", transition: "stroke-width 0.2s" }
        }
      ),
      /* @__PURE__ */ jsx(
        "line",
        {
          x1: from.x,
          y1: from.y,
          x2: to.x,
          y2: to.y,
          stroke: "transparent",
          strokeWidth: 16,
          style: { cursor: "pointer", pointerEvents: "stroke" },
          onMouseEnter: () => setHoveredConn(conn.id),
          onMouseLeave: () => setHoveredConn(null)
        }
      ),
      /* @__PURE__ */ jsx(
        "line",
        {
          x1: from.x,
          y1: from.y,
          x2: to.x,
          y2: to.y,
          stroke: lineColor,
          strokeWidth: isHovered ? 2.5 : 2,
          strokeDasharray: dashArray,
          style: { pointerEvents: "none", transition: "stroke 0.2s" }
        }
      ),
      !isHovered && /* @__PURE__ */ jsx("circle", { r: "3", fill: connStyle.color, opacity: "0.75", children: /* @__PURE__ */ jsx(
        "animateMotion",
        {
          dur: `${2 + conn.id.length % 3}s`,
          repeatCount: "indefinite",
          path: `M${from.x},${from.y} L${to.x},${to.y}`
        }
      ) }),
      isHovered && !deleteConnection && /* @__PURE__ */ jsx(
        "text",
        {
          x: mx,
          y: my - 14,
          textAnchor: "middle",
          fill: connStyle.color,
          fontSize: "9",
          fontFamily: "monospace",
          fontWeight: "bold",
          style: { pointerEvents: "none" },
          children: connStyle.label
        }
      ),
      !isHovered && /* @__PURE__ */ jsx(
        "text",
        {
          x: mx,
          y: my - 10,
          textAnchor: "middle",
          fill: connStyle.color,
          fontSize: "8",
          fontFamily: "monospace",
          opacity: "0.65",
          style: { pointerEvents: "none" },
          children: connStyle.label
        }
      ),
      isHovered && /* @__PURE__ */ jsxs(
        "g",
        {
          transform: `translate(${mx}, ${my})`,
          style: { cursor: "pointer", pointerEvents: "all" },
          onMouseEnter: () => setHoveredConn(conn.id),
          onMouseLeave: () => setHoveredConn(null),
          onClick: () => deleteConnection(conn.id),
          children: [
            /* @__PURE__ */ jsx("circle", { r: "11", fill: "rgba(239,68,68,0.95)" }),
            /* @__PURE__ */ jsx("circle", { r: "11", fill: "none", stroke: "rgba(239,68,68,0.5)", strokeWidth: "2" }),
            /* @__PURE__ */ jsx("text", { x: "0", y: "4.5", textAnchor: "middle", fill: "white", fontSize: "14", fontWeight: "bold", children: "×" })
          ]
        }
      )
    ] }, conn.id);
  }) });
}
const PROTOCOL_COLORS$2 = {
  ICMP: "#F59E0B",
  TCP: "#06B6D4",
  UDP: "#A78BFA",
  DNS: "#34D399",
  HTTP: "#F97316",
  ARP: "#EC4899",
  default: "#94A3B8"
};
function getStatusLabel(packet) {
  if (packet.progress < 0.15) return "جاري الإرسال...";
  if (packet.progress < 0.5) return "في الطريق";
  if (packet.progress < 0.85) return "إعادة توجيه";
  return "جاري الاستلام";
}
function PacketAnimation({ packets, nodes }) {
  const getNode = (id) => nodes.find((n) => n.id === id);
  return /* @__PURE__ */ jsx(Fragment, { children: packets.map((packet) => {
    const from = getNode(packet.fromId);
    const to = getNode(packet.toId);
    if (!from || !to) return null;
    const px = from.x + (to.x - from.x) * packet.progress;
    const py = from.y + (to.y - from.y) * packet.progress;
    const color = PROTOCOL_COLORS$2[packet.protocol] || PROTOCOL_COLORS$2.default;
    const statusLabel = getStatusLabel(packet);
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    return /* @__PURE__ */ jsxs("g", { children: [
      /* @__PURE__ */ jsx("circle", { cx: px, cy: py, r: 18, fill: color, opacity: 0.06 }),
      /* @__PURE__ */ jsx("circle", { cx: px, cy: py, r: 11, fill: color, opacity: 0.13 }),
      /* @__PURE__ */ jsx("circle", { cx: px, cy: py, r: 6, fill: color, opacity: 0.95, children: /* @__PURE__ */ jsx("animate", { attributeName: "r", values: "5;7;5", dur: "0.45s", repeatCount: "indefinite" }) }),
      /* @__PURE__ */ jsx("g", { transform: `translate(${px},${py}) rotate(${angle})`, children: /* @__PURE__ */ jsx(
        "polygon",
        {
          points: "12,0 6,-4 6,4",
          fill: color,
          opacity: 0.8
        }
      ) }),
      /* @__PURE__ */ jsx(
        "text",
        {
          x: px,
          y: py - 18,
          textAnchor: "middle",
          fill: color,
          fontSize: "8",
          fontWeight: "bold",
          fontFamily: "monospace",
          opacity: 0.9,
          children: packet.protocol
        }
      ),
      /* @__PURE__ */ jsx(
        "text",
        {
          x: px,
          y: py + 22,
          textAnchor: "middle",
          fill: "rgba(226,232,240,0.75)",
          fontSize: "8",
          fontFamily: "Tajawal, sans-serif",
          children: statusLabel
        }
      ),
      packet.totalHops > 1 && /* @__PURE__ */ jsxs(
        "text",
        {
          x: px,
          y: py + 32,
          textAnchor: "middle",
          fill: "rgba(148,163,184,0.5)",
          fontSize: "7",
          fontFamily: "monospace",
          children: [
            "hop ",
            (packet.hopIndex || 0) + 1,
            "/",
            packet.totalHops
          ]
        }
      )
    ] }, packet.id);
  }) });
}
function NetworkCanvas({
  nodes,
  connections,
  zoom,
  pan,
  setPan,
  addNode,
  moveNode,
  moveNodeEnd,
  deleteNode,
  handleNodeClick,
  deleteConnection,
  connectMode,
  connectFrom,
  packetMode,
  packetFrom,
  selectedNode,
  setSelectedNode,
  activePackets = [],
  highlightNodeId,
  activeTool
}) {
  const canvasRef = useRef(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [dragOver, setDragOver] = useState(false);
  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const type = e.dataTransfer.getData("deviceType");
    if (!type) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - pan.x) / zoom;
    const y = (e.clientY - rect.top - pan.y) / zoom;
    addNode(type, x, y);
  };
  const handleMouseDown = (e) => {
    if (e.target === canvasRef.current || e.target.classList.contains("canvas-bg")) {
      setSelectedNode(null);
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };
  const handleMouseMove = (e) => {
    if (!isPanning) return;
    setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
  };
  const handleMouseUp = () => setIsPanning(false);
  const cursor = isPanning ? "grabbing" : connectMode || packetMode ? "crosshair" : activeTool === "delete" ? "not-allowed" : "default";
  return /* @__PURE__ */ jsxs(
    "div",
    {
      ref: canvasRef,
      className: "flex-1 w-full h-full relative overflow-hidden select-none",
      style: {
        cursor,
        background: dragOver ? "rgba(47,102,144,0.05)" : "#F7F9FC"
      },
      onDrop: handleDrop,
      onDragOver: (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "copy";
        setDragOver(true);
      },
      onDragLeave: () => setDragOver(false),
      onMouseDown: handleMouseDown,
      onMouseMove: handleMouseMove,
      onMouseUp: handleMouseUp,
      onMouseLeave: handleMouseUp,
      children: [
        /* @__PURE__ */ jsx(
          "div",
          {
            className: "canvas-bg absolute inset-0 pointer-events-none",
            style: {
              backgroundImage: `
            linear-gradient(rgba(47,102,144,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(47,102,144,0.06) 1px, transparent 1px)
          `,
              backgroundSize: `${32 * zoom}px ${32 * zoom}px`,
              backgroundPosition: `${pan.x % (32 * zoom)}px ${pan.y % (32 * zoom)}px`
            }
          }
        ),
        /* @__PURE__ */ jsx(
          "div",
          {
            className: "canvas-bg absolute inset-0 pointer-events-none",
            style: {
              backgroundImage: `radial-gradient(circle, rgba(47,102,144,0.12) 1px, transparent 1px)`,
              backgroundSize: `${32 * zoom}px ${32 * zoom}px`,
              backgroundPosition: `${pan.x % (32 * zoom)}px ${pan.y % (32 * zoom)}px`
            }
          }
        ),
        nodes.length === 0 && !dragOver && /* @__PURE__ */ jsx("div", { className: "absolute inset-0 flex flex-col items-center justify-center pointer-events-none", children: /* @__PURE__ */ jsxs("div", { className: "text-center opacity-20", children: [
          /* @__PURE__ */ jsx("div", { className: "text-5xl mb-3", children: "🖧" }),
          /* @__PURE__ */ jsx("p", { className: "font-bold text-sm", style: { color: "#2F6690" }, children: "اسحب الأجهزة من الشريط الجانبي" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs mt-1", style: { color: "rgba(47,102,144,0.6)" }, children: "وأفلتها هنا لبدء بناء شبكتك" })
        ] }) }),
        dragOver && /* @__PURE__ */ jsx(
          "div",
          {
            className: "absolute inset-0 pointer-events-none flex items-center justify-center",
            style: { border: "2px dashed rgba(47,102,144,0.5)" },
            children: /* @__PURE__ */ jsx(
              "div",
              {
                className: "px-4 py-2 rounded-xl text-sm font-bold",
                style: { background: "#FFFFFF", border: "1px solid rgba(47,102,144,0.4)", color: "#2F6690" },
                children: "أفلت الجهاز هنا"
              }
            )
          }
        ),
        /* @__PURE__ */ jsxs("div", { style: { transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: "0 0", position: "absolute", width: "100%", height: "100%" }, children: [
          /* @__PURE__ */ jsxs("svg", { className: "absolute inset-0", style: { overflow: "visible", width: "100%", height: "100%", pointerEvents: "none" }, children: [
            /* @__PURE__ */ jsx("g", { style: { pointerEvents: "all" }, children: /* @__PURE__ */ jsx(ConnectionLines, { connections, nodes, deleteConnection, zoom }) }),
            /* @__PURE__ */ jsx(PacketAnimation, { packets: activePackets, nodes, connections })
          ] }),
          nodes.map((node) => /* @__PURE__ */ jsx(
            NetworkNode,
            {
              node,
              selected: selectedNode === node.id,
              highlighted: highlightNodeId === node.id,
              connectMode: connectMode || packetMode,
              deleteMode: activeTool === "delete",
              onClick: () => handleNodeClick(node.id),
              onDelete: () => deleteNode(node.id),
              onMove: moveNode,
              onMoveEnd: moveNodeEnd,
              zoom,
              hasActivePacket: activePackets.some((p) => p.fromId === node.id || p.toId === node.id)
            },
            node.id
          ))
        ] })
      ]
    }
  );
}
const DEVICES = [
  { type: "Router", label: "راوتر", glow: "#173F5F", icon: "🔀" },
  { type: "Switch", label: "سويتش", glow: "#2E7D5B", icon: "🔌" },
  { type: "PC", label: "حاسوب", glow: "#2F6690", icon: "🖥️" },
  { type: "Server", label: "سيرفر", glow: "#3A86A8", icon: "🗄️" },
  { type: "Firewall", label: "جدار ناري", glow: "#C94C4C", icon: "🛡️" },
  { type: "AccessPoint", label: "Wi-Fi", glow: "#D69E2E", icon: "📡" },
  { type: "Cloud", label: "إنترنت", glow: "#64748B", icon: "☁️" },
  { type: "Laptop", label: "لابتوب", glow: "#2F6690", icon: "💻" }
];
const PROTOCOLS = ["ICMP", "TCP", "UDP", "DNS", "HTTP", "ARP"];
const PROTOCOL_COLORS$1 = {
  ICMP: "#D69E2E",
  TCP: "#2F6690",
  UDP: "#3A86A8",
  DNS: "#2E7D5B",
  HTTP: "#B45309",
  ARP: "#64748B"
};
function hexToRgb$2(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}
function Divider() {
  return /* @__PURE__ */ jsx("div", { className: "mx-3 my-2", style: { height: 1, background: "#E2E8F0" } });
}
function SectionLabel({ label, color = "#2F6690" }) {
  return /* @__PURE__ */ jsx("div", { className: "px-3 py-1 mb-0.5", children: /* @__PURE__ */ jsx("span", { className: "text-[9px] font-black uppercase tracking-widest", style: { color: `${color}80` }, children: label }) });
}
function ToolBtn({ icon: BtnIcon, label, active, onClick, color = "#2F6690", disabled = false }) {
  return /* @__PURE__ */ jsxs(
    "button",
    {
      onClick,
      disabled,
      title: label,
      className: "w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all disabled:opacity-30 disabled:cursor-not-allowed",
      style: {
        background: active ? `rgba(${hexToRgb$2(color)},0.12)` : "rgba(23,63,95,0.03)",
        border: active ? `1px solid rgba(${hexToRgb$2(color)},0.45)` : "1px solid #E2E8F0",
        color: active ? color : "rgba(31,41,55,0.65)"
      },
      onMouseEnter: (e) => {
        if (!active && !disabled) {
          e.currentTarget.style.background = `rgba(${hexToRgb$2(color)},0.07)`;
          e.currentTarget.style.borderColor = `rgba(${hexToRgb$2(color)},0.3)`;
          e.currentTarget.style.color = color;
        }
      },
      onMouseLeave: (e) => {
        if (!active) {
          e.currentTarget.style.background = "rgba(23,63,95,0.03)";
          e.currentTarget.style.borderColor = "#E2E8F0";
          e.currentTarget.style.color = "rgba(31,41,55,0.65)";
        }
      },
      children: [
        /* @__PURE__ */ jsx(BtnIcon, { size: 13 }),
        /* @__PURE__ */ jsx("span", { children: label })
      ]
    }
  );
}
function SimSidebar({
  activeTool,
  setTool,
  connectFrom,
  packetFrom,
  showSniffer,
  setShowSniffer,
  showAI,
  setShowAI,
  zoom,
  zoomIn,
  zoomOut,
  resetView,
  undo,
  redo,
  reset,
  snifferCount,
  selectedProtocol,
  setSelectedProtocol,
  packetSpeed,
  setPacketSpeed,
  autoArrange,
  nodes,
  connections,
  activeScenario,
  setActiveScenario
}) {
  const [collapsed, setCollapsed] = useState(false);
  const connectMode = activeTool === "connect";
  const packetMode = activeTool === "packet";
  const deleteMode = activeTool === "delete";
  return /* @__PURE__ */ jsxs(
    motion.div,
    {
      animate: { width: collapsed ? 52 : 210 },
      transition: { duration: 0.22, ease: "easeInOut" },
      className: "h-full flex-shrink-0 flex flex-col overflow-hidden relative",
      style: {
        background: "#FFFFFF",
        borderLeft: "1px solid #E2E8F0"
      },
      children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setCollapsed(!collapsed),
            className: "absolute -left-3 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full flex items-center justify-center transition-all hover:scale-110",
            style: { background: "rgba(47,102,144,0.12)", border: "1px solid rgba(47,102,144,0.35)", color: "#2F6690" },
            children: collapsed ? /* @__PURE__ */ jsx(ChevronLeft, { size: 12 }) : /* @__PURE__ */ jsx(ChevronRight, { size: 12 })
          }
        ),
        collapsed ? /* @__PURE__ */ jsx("div", { className: "flex flex-col items-center gap-2 pt-4 px-2 overflow-y-auto", style: { scrollbarWidth: "none" }, children: DEVICES.map((d) => /* @__PURE__ */ jsx(
          "div",
          {
            draggable: true,
            onDragStart: (e) => e.dataTransfer.setData("deviceType", d.type),
            className: "w-9 h-9 rounded-xl flex items-center justify-center cursor-grab text-base transition-all hover:scale-110",
            style: { background: `rgba(${hexToRgb$2(d.glow)},0.1)`, border: `1px solid rgba(${hexToRgb$2(d.glow)},0.2)` },
            title: d.label,
            children: d.icon
          },
          d.type
        )) }) : /* @__PURE__ */ jsxs("div", { className: "flex flex-col h-full overflow-y-auto", style: { scrollbarWidth: "none" }, children: [
          /* @__PURE__ */ jsxs("div", { className: "px-3 py-3 flex-shrink-0", style: { borderBottom: "1px solid #E2E8F0" }, children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx("div", { className: "w-2 h-2 rounded-full animate-pulse", style: { background: "#2E7D5B" } }),
              /* @__PURE__ */ jsx("span", { className: "text-[11px] font-black tracking-wide", style: { color: "#173F5F" }, children: "SIM TOOLS" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex gap-2 mt-1.5 text-[9px] font-mono", style: { color: "rgba(47,102,144,0.6)" }, children: [
              /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
                /* @__PURE__ */ jsx("span", { className: "w-1 h-1 rounded-full inline-block", style: { background: "#3A86A8" } }),
                (nodes == null ? void 0 : nodes.length) || 0,
                " أجهزة"
              ] }),
              /* @__PURE__ */ jsx("span", { style: { color: "#E2E8F0" }, children: "|" }),
              /* @__PURE__ */ jsxs("span", { children: [
                (connections == null ? void 0 : connections.length) || 0,
                " روابط"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex-1 py-2 space-y-0.5 px-1", children: [
            /* @__PURE__ */ jsx(SectionLabel, { label: "الأجهزة" }),
            /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-1 px-1 pb-2", children: DEVICES.map((device) => /* @__PURE__ */ jsxs(
              "div",
              {
                draggable: true,
                onDragStart: (e) => {
                  e.dataTransfer.setData("deviceType", device.type);
                  e.dataTransfer.effectAllowed = "copy";
                },
                className: "flex flex-col items-center gap-1 p-2 rounded-xl cursor-grab active:cursor-grabbing transition-all",
                style: { background: `rgba(${hexToRgb$2(device.glow)},0.05)`, border: `1px solid rgba(${hexToRgb$2(device.glow)},0.12)` },
                onMouseEnter: (e) => {
                  e.currentTarget.style.background = `rgba(${hexToRgb$2(device.glow)},0.13)`;
                  e.currentTarget.style.borderColor = `rgba(${hexToRgb$2(device.glow)},0.35)`;
                },
                onMouseLeave: (e) => {
                  e.currentTarget.style.background = `rgba(${hexToRgb$2(device.glow)},0.05)`;
                  e.currentTarget.style.borderColor = `rgba(${hexToRgb$2(device.glow)},0.12)`;
                },
                title: `اسحب ${device.label} للكانفاس`,
                children: [
                  /* @__PURE__ */ jsx("span", { className: "text-base leading-none", children: device.icon }),
                  /* @__PURE__ */ jsx("span", { className: "text-[9px] font-medium text-center leading-tight", style: { color: "rgba(31,41,55,0.65)" }, children: device.label })
                ]
              },
              device.type
            )) }),
            /* @__PURE__ */ jsx(Divider, {}),
            /* @__PURE__ */ jsx(SectionLabel, { label: "الأدوات", color: "#2F6690" }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-1 px-1", children: [
              /* @__PURE__ */ jsx(
                ToolBtn,
                {
                  icon: Link$1,
                  label: connectMode ? connectFrom ? "الجهاز الثاني..." : "الجهاز الأول..." : "ربط أجهزة",
                  active: connectMode,
                  onClick: () => setTool("connect"),
                  color: "#2F6690"
                }
              ),
              /* @__PURE__ */ jsx(
                ToolBtn,
                {
                  icon: packetMode ? Square : Play,
                  label: packetMode ? packetFrom ? "اختر الوجهة..." : "اختر المصدر..." : "إرسال Packet",
                  active: packetMode,
                  onClick: () => setTool("packet"),
                  color: "#3A86A8",
                  disabled: connections.length === 0
                }
              ),
              /* @__PURE__ */ jsx(
                ToolBtn,
                {
                  icon: Trash2,
                  label: "حذف جهاز",
                  active: deleteMode,
                  onClick: () => setTool("delete"),
                  color: "#C94C4C"
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "px-1 pt-1 pb-1", children: [
              /* @__PURE__ */ jsx("div", { className: "text-[8px] font-bold px-2 mb-1.5", style: { color: "rgba(46,125,91,0.65)" }, children: "سرعة الإرسال" }),
              /* @__PURE__ */ jsx("div", { className: "grid grid-cols-4 gap-1 px-1", children: [{ v: 0.5, l: "0.5x" }, { v: 1, l: "1x" }, { v: 2, l: "2x" }, { v: 3, l: "3x" }].map(({ v, l }) => /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => setPacketSpeed(v),
                  className: "py-1 rounded-lg text-[8px] font-black transition-all",
                  style: {
                    background: packetSpeed === v ? "rgba(46,125,91,0.14)" : "rgba(23,63,95,0.03)",
                    border: `1px solid ${packetSpeed === v ? "#2E7D5B" : "#E2E8F0"}`,
                    color: packetSpeed === v ? "#2E7D5B" : "rgba(31,41,55,0.5)"
                  },
                  children: l
                },
                v
              )) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "px-1 pt-1 pb-1", children: [
              /* @__PURE__ */ jsx("div", { className: "text-[8px] font-bold px-2 mb-1.5", style: { color: "rgba(47,102,144,0.6)" }, children: "PROTOCOL" }),
              /* @__PURE__ */ jsx("div", { className: "grid grid-cols-3 gap-1 px-1", children: PROTOCOLS.map((p) => /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => setSelectedProtocol(p),
                  className: "py-1 rounded-lg text-[8px] font-black transition-all",
                  style: {
                    background: selectedProtocol === p ? `rgba(${hexToRgb$2(PROTOCOL_COLORS$1[p])},0.14)` : "rgba(23,63,95,0.03)",
                    border: `1px solid ${selectedProtocol === p ? PROTOCOL_COLORS$1[p] : "#E2E8F0"}`,
                    color: selectedProtocol === p ? PROTOCOL_COLORS$1[p] : "rgba(31,41,55,0.5)"
                  },
                  children: p
                },
                p
              )) })
            ] }),
            /* @__PURE__ */ jsx(Divider, {}),
            /* @__PURE__ */ jsx(SectionLabel, { label: "المحاكاة", color: "#2E7D5B" }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-1 px-1", children: [
              /* @__PURE__ */ jsx(
                ToolBtn,
                {
                  icon: Wifi,
                  label: `مراقب الحزم${snifferCount > 0 ? ` (${snifferCount})` : ""}`,
                  active: showSniffer,
                  onClick: () => setShowSniffer(!showSniffer),
                  color: "#2F6690"
                }
              ),
              /* @__PURE__ */ jsx(
                ToolBtn,
                {
                  icon: Grid3x3,
                  label: "ترتيب تلقائي",
                  active: false,
                  onClick: autoArrange,
                  color: "#2E7D5B",
                  disabled: nodes.length < 2
                }
              )
            ] }),
            /* @__PURE__ */ jsx(Divider, {}),
            /* @__PURE__ */ jsx(SectionLabel, { label: "الذكاء والمختبر", color: "#3A86A8" }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-1 px-1", children: [
              /* @__PURE__ */ jsx(
                ToolBtn,
                {
                  icon: Bot,
                  label: "مساعد ذكي",
                  active: showAI,
                  onClick: () => setShowAI(!showAI),
                  color: "#3A86A8"
                }
              ),
              /* @__PURE__ */ jsx(Link, { to: "/scenario-lab", className: "block", children: /* @__PURE__ */ jsx(
                ToolBtn,
                {
                  icon: FlaskConical,
                  label: "مختبر السيناريوهات",
                  active: false,
                  onClick: () => {
                  },
                  color: "#2F6690"
                }
              ) })
            ] }),
            /* @__PURE__ */ jsx(Divider, {}),
            /* @__PURE__ */ jsx(SectionLabel, { label: "العرض والسجل" }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-1.5 px-1 pb-2", children: [
              /* @__PURE__ */ jsxs(
                "div",
                {
                  className: "flex items-center justify-between px-2 py-1.5 rounded-xl",
                  style: { background: "rgba(47,102,144,0.05)", border: "1px solid #E2E8F0" },
                  children: [
                    /* @__PURE__ */ jsx("button", { onClick: zoomOut, className: "p-1 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-primary", children: /* @__PURE__ */ jsx(ZoomOut, { size: 12 }) }),
                    /* @__PURE__ */ jsxs("span", { className: "text-[10px] font-mono", style: { color: "#2F6690" }, children: [
                      Math.round(zoom * 100),
                      "%"
                    ] }),
                    /* @__PURE__ */ jsx("button", { onClick: zoomIn, className: "p-1 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-primary", children: /* @__PURE__ */ jsx(ZoomIn, { size: 12 }) })
                  ]
                }
              ),
              /* @__PURE__ */ jsxs("div", { className: "flex gap-1", children: [
                /* @__PURE__ */ jsxs(
                  "button",
                  {
                    onClick: undo,
                    className: "flex-1 flex items-center justify-center gap-1 py-1.5 rounded-xl text-[10px] font-medium transition-all text-muted-foreground hover:text-foreground hover:bg-muted",
                    style: { border: "1px solid #E2E8F0" },
                    children: [
                      /* @__PURE__ */ jsx(Undo2, { size: 11 }),
                      " تراجع"
                    ]
                  }
                ),
                /* @__PURE__ */ jsxs(
                  "button",
                  {
                    onClick: redo,
                    className: "flex-1 flex items-center justify-center gap-1 py-1.5 rounded-xl text-[10px] font-medium transition-all text-muted-foreground hover:text-foreground hover:bg-muted",
                    style: { border: "1px solid #E2E8F0" },
                    children: [
                      /* @__PURE__ */ jsx(Redo2, { size: 11 }),
                      " إعادة"
                    ]
                  }
                )
              ] }),
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: resetView,
                  className: "w-full py-1.5 rounded-xl text-[10px] font-medium transition-all text-muted-foreground hover:text-foreground hover:bg-muted",
                  style: { border: "1px solid #E2E8F0" },
                  children: "إعادة ضبط العرض"
                }
              ),
              /* @__PURE__ */ jsxs(
                "button",
                {
                  onClick: reset,
                  className: "w-full flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-[10px] font-bold transition-all",
                  style: { background: "rgba(201,76,76,0.06)", border: "1px solid rgba(201,76,76,0.25)", color: "#C94C4C" },
                  children: [
                    /* @__PURE__ */ jsx(RotateCcw, { size: 11 }),
                    " مسح الكل"
                  ]
                }
              )
            ] })
          ] })
        ] })
      ]
    }
  );
}
const DEVICE_DEFAULTS = {
  Router: { ip: "192.168.1.1", subnet: "255.255.255.0", gateway: "" },
  Switch: { ip: "192.168.1.2", subnet: "255.255.255.0", gateway: "192.168.1.1" },
  PC: { ip: "192.168.1.10", subnet: "255.255.255.0", gateway: "192.168.1.1" },
  Server: { ip: "192.168.1.100", subnet: "255.255.255.0", gateway: "192.168.1.1" },
  Firewall: { ip: "10.0.0.1", subnet: "255.255.255.0", gateway: "" },
  AccessPoint: { ip: "192.168.1.5", subnet: "255.255.255.0", gateway: "192.168.1.1" },
  Cloud: { ip: "", subnet: "", gateway: "" },
  Laptop: { ip: "192.168.1.11", subnet: "255.255.255.0", gateway: "192.168.1.1" }
};
const DEVICE_GLOW = {
  Router: "#173F5F",
  Switch: "#2E7D5B",
  PC: "#2F6690",
  Server: "#3A86A8",
  Firewall: "#C94C4C",
  AccessPoint: "#D69E2E",
  Cloud: "#64748B",
  Laptop: "#2F6690"
};
function NodeConfigPanel({ node, onUpdate, onClose }) {
  const defaults = DEVICE_DEFAULTS[node.type] || {};
  const [label, setLabel] = useState(node.label || "");
  const [ip, setIp] = useState(node.ip || defaults.ip || "");
  const [subnet, setSubnet] = useState(node.subnet || defaults.subnet || "");
  const [gateway, setGateway] = useState(node.gateway || defaults.gateway || "");
  useEffect(() => {
    var _a, _b, _c;
    setLabel(node.label || "");
    setIp(node.ip || ((_a = DEVICE_DEFAULTS[node.type]) == null ? void 0 : _a.ip) || "");
    setSubnet(node.subnet || ((_b = DEVICE_DEFAULTS[node.type]) == null ? void 0 : _b.subnet) || "");
    setGateway(node.gateway || ((_c = DEVICE_DEFAULTS[node.type]) == null ? void 0 : _c.gateway) || "");
  }, [node.id]);
  const handleSave = () => {
    onUpdate(node.id, { label, ip, subnet, gateway });
    onClose();
  };
  const showIp = node.type !== "Cloud";
  const glow = DEVICE_GLOW[node.type] || "#2F6690";
  const inputStyle = {
    background: "#F7F9FC",
    border: "1px solid #E2E8F0",
    color: "#1F2937",
    borderRadius: 8,
    padding: "6px 10px",
    fontSize: 12,
    fontFamily: "monospace",
    width: "100%",
    outline: "none"
  };
  return /* @__PURE__ */ jsxs(
    motion.div,
    {
      initial: { opacity: 0, x: 20 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: 20 },
      className: "absolute top-4 right-4 z-50 w-64 overflow-hidden",
      style: {
        background: "#FFFFFF",
        border: `1px solid rgba(${hexToRgb$1(glow)},0.4)`,
        borderRadius: 16,
        boxShadow: "0 12px 32px rgba(23,63,95,0.15)"
      },
      children: [
        /* @__PURE__ */ jsxs(
          "div",
          {
            className: "flex items-center justify-between px-4 py-3",
            style: { borderBottom: "1px solid #E2E8F0" },
            children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsx(
                  "div",
                  {
                    className: "w-2 h-2 rounded-full animate-pulse",
                    style: { background: glow }
                  }
                ),
                /* @__PURE__ */ jsx("span", { className: "text-xs font-bold", style: { color: "#173F5F" }, children: "إعدادات الجهاز" }),
                /* @__PURE__ */ jsx(
                  "span",
                  {
                    className: "text-[9px] font-bold px-1.5 py-0.5 rounded-md",
                    style: {
                      background: `rgba(${hexToRgb$1(glow)},0.15)`,
                      color: glow,
                      border: `1px solid rgba(${hexToRgb$1(glow)},0.3)`
                    },
                    children: node.type
                  }
                )
              ] }),
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: onClose,
                  className: "text-muted-foreground hover:text-destructive transition-colors",
                  children: /* @__PURE__ */ jsx(X, { size: 14 })
                }
              )
            ]
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "px-4 py-3 space-y-3", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-[10px] font-bold mb-1", style: { color: "rgba(6,182,212,0.7)" }, children: "اسم الجهاز" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                value: label,
                onChange: (e) => setLabel(e.target.value),
                style: inputStyle,
                placeholder: "Router 1",
                dir: "ltr",
                onFocus: (e) => e.target.style.borderColor = "rgba(47,102,144,0.6)",
                onBlur: (e) => e.target.style.borderColor = "#E2E8F0"
              }
            )
          ] }),
          showIp && /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-[10px] font-bold mb-1", style: { color: "#2F6690" }, children: "عنوان IP" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  value: ip,
                  onChange: (e) => setIp(e.target.value),
                  style: inputStyle,
                  placeholder: "192.168.1.1",
                  dir: "ltr",
                  onFocus: (e) => e.target.style.borderColor = "rgba(6,182,212,0.6)",
                  onBlur: (e) => e.target.style.borderColor = "rgba(6,182,212,0.2)"
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-[10px] font-bold mb-1", style: { color: "#2F6690" }, children: "Subnet Mask" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  value: subnet,
                  onChange: (e) => setSubnet(e.target.value),
                  style: inputStyle,
                  placeholder: "255.255.255.0",
                  dir: "ltr",
                  onFocus: (e) => e.target.style.borderColor = "rgba(6,182,212,0.6)",
                  onBlur: (e) => e.target.style.borderColor = "rgba(6,182,212,0.2)"
                }
              )
            ] }),
            node.type !== "Router" && node.type !== "Firewall" && /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-[10px] font-bold mb-1", style: { color: "#2F6690" }, children: "Default Gateway" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  value: gateway,
                  onChange: (e) => setGateway(e.target.value),
                  style: inputStyle,
                  placeholder: "192.168.1.1",
                  dir: "ltr",
                  onFocus: (e) => e.target.style.borderColor = "rgba(6,182,212,0.6)",
                  onBlur: (e) => e.target.style.borderColor = "rgba(6,182,212,0.2)"
                }
              )
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "px-4 pb-4", children: /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: handleSave,
            className: "w-full flex items-center justify-center gap-2 text-xs font-bold py-2 rounded-xl transition-all hover:scale-105",
            style: {
              background: "#173F5F",
              border: "1px solid #173F5F",
              color: "white"
            },
            children: [
              /* @__PURE__ */ jsx(Save, { size: 13 }),
              "حفظ الإعدادات"
            ]
          }
        ) })
      ]
    }
  );
}
function hexToRgb$1(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}
const PROTOCOL_COLORS = {
  ICMP: "text-warning bg-warning/10",
  TCP: "text-secondary bg-secondary/10",
  UDP: "text-accent bg-accent/10",
  ARP: "text-success bg-success/10",
  DNS: "text-muted-foreground bg-muted",
  HTTP: "text-primary bg-primary/10"
};
function PacketSniffer({ packets, onClose }) {
  const [filter, setFilter] = useState("ALL");
  const protocols = ["ALL", "ICMP", "TCP", "UDP", "ARP", "DNS", "HTTP"];
  const filtered = filter === "ALL" ? packets : packets.filter((p) => p.protocol === filter);
  return /* @__PURE__ */ jsxs(
    motion.div,
    {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: 20 },
      className: "absolute bottom-4 left-4 right-4 z-50 rounded-2xl overflow-hidden",
      style: {
        background: "#FFFFFF",
        border: "1px solid #E2E8F0",
        boxShadow: "0 12px 32px rgba(23,63,95,0.18)",
        maxHeight: "260px"
      },
      children: [
        /* @__PURE__ */ jsxs(
          "div",
          {
            className: "flex items-center justify-between px-4 py-2 border-b",
            style: { borderColor: "#E2E8F0" },
            children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsx(Wifi, { size: 14, className: "text-secondary" }),
                /* @__PURE__ */ jsx("span", { className: "text-secondary font-mono text-xs font-bold", children: "PACKET SNIFFER" }),
                /* @__PURE__ */ jsxs("span", { className: "text-muted-foreground text-xs font-mono", children: [
                  "[",
                  filtered.length,
                  " packets]"
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsx("div", { className: "flex items-center gap-1", children: protocols.map((p) => /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: () => setFilter(p),
                    className: `text-[9px] font-mono px-2 py-0.5 rounded transition-all ${filter === p ? "bg-secondary/15 text-secondary border border-secondary/40" : "text-muted-foreground hover:text-foreground"}`,
                    children: p
                  },
                  p
                )) }),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: onClose,
                    className: "text-muted-foreground hover:text-destructive transition-colors",
                    children: /* @__PURE__ */ jsx(X, { size: 14 })
                  }
                )
              ] })
            ]
          }
        ),
        /* @__PURE__ */ jsxs(
          "div",
          {
            className: "grid text-[9px] font-mono font-bold text-muted-foreground px-4 py-1 border-b",
            style: {
              gridTemplateColumns: "60px 1fr 1fr 60px 50px 60px 80px",
              borderColor: "#E2E8F0"
            },
            children: [
              /* @__PURE__ */ jsx("span", { children: "#" }),
              /* @__PURE__ */ jsx("span", { children: "SRC IP" }),
              /* @__PURE__ */ jsx("span", { children: "DST IP" }),
              /* @__PURE__ */ jsx("span", { children: "PROTO" }),
              /* @__PURE__ */ jsx("span", { children: "TTL" }),
              /* @__PURE__ */ jsx("span", { children: "SIZE" }),
              /* @__PURE__ */ jsx("span", { children: "STATUS" })
            ]
          }
        ),
        /* @__PURE__ */ jsx("div", { className: "overflow-y-auto", style: { maxHeight: "160px" }, children: /* @__PURE__ */ jsx(AnimatePresence, { children: filtered.length === 0 ? /* @__PURE__ */ jsx("div", { className: "text-center py-6 text-muted-foreground font-mono text-xs", children: "لا توجد packets بعد..." }) : [...filtered].reverse().map((p, i) => /* @__PURE__ */ jsxs(
          motion.div,
          {
            initial: { opacity: 0, x: -10 },
            animate: { opacity: 1, x: 0 },
            className: "grid items-center px-4 py-1 hover:bg-muted/50 transition-colors",
            style: {
              gridTemplateColumns: "60px 1fr 1fr 60px 50px 60px 80px",
              borderBottom: "1px solid #F1F5F9"
            },
            children: [
              /* @__PURE__ */ jsx("span", { className: "text-muted-foreground font-mono text-[9px]", children: String(filtered.length - i).padStart(4, "0") }),
              /* @__PURE__ */ jsx("span", { className: "text-success font-mono text-[9px]", children: p.srcIP }),
              /* @__PURE__ */ jsx("span", { className: "text-secondary font-mono text-[9px]", children: p.dstIP }),
              /* @__PURE__ */ jsx(
                "span",
                {
                  className: `font-mono text-[9px] font-bold px-1 rounded ${PROTOCOL_COLORS[p.protocol] || "text-muted-foreground"}`,
                  children: p.protocol
                }
              ),
              /* @__PURE__ */ jsx("span", { className: "text-muted-foreground font-mono text-[9px]", children: p.ttl }),
              /* @__PURE__ */ jsxs("span", { className: "text-muted-foreground font-mono text-[9px]", children: [
                p.size,
                "B"
              ] }),
              /* @__PURE__ */ jsx(
                "span",
                {
                  className: `font-mono text-[9px] font-bold ${p.status === "delivered" ? "text-success" : p.status === "failed" ? "text-destructive" : "text-warning"}`,
                  children: p.status === "delivered" ? "✓ DELIVERED" : p.status === "failed" ? "✗ FAILED" : "⏳ TRANSIT"
                }
              )
            ]
          },
          p.id
        )) }) })
      ]
    }
  );
}
const MEMORY_KEY = "net-ai-memory";
function loadMemory() {
  try {
    return JSON.parse(localStorage.getItem(MEMORY_KEY) || "[]");
  } catch {
    return [];
  }
}
function saveMemory(msgs) {
  try {
    localStorage.setItem(MEMORY_KEY, JSON.stringify(msgs.slice(-30)));
  } catch {
  }
}
function AIAssistant({ nodes, connections, onClose }) {
  const [messages, setMessages] = useState(() => loadMemory());
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  useEffect(() => {
    var _a;
    (_a = bottomRef.current) == null ? void 0 : _a.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  const networkContext = `
الشبكة الحالية تحتوي على ${nodes.length} جهاز:
${nodes.map((n) => `- ${n.type} "${n.label}" IP: ${n.ip || "غير محدد"}`).join("\n")}
عدد الاتصالات: ${connections.length}
  `.trim();
  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: "user", content: input.trim() };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput("");
    setLoading(true);
    const historyText = messages.slice(-6).map((m) => `${m.role === "user" ? "المستخدم" : "المساعد"}: ${m.content}`).join("\n");
    const prompt = `أنت مساعد ذكي متخصص في شبكات الحاسوب (CCNA level).
تساعد الطلاب بشرح المفاهيم، تشخيص الأخطاء، واقتراح الحلول.
أجب باللغة العربية دائماً بشكل واضح ومختصر.

سياق الشبكة الحالية:
${networkContext}

سجل المحادثة:
${historyText}

سؤال الطالب: ${userMsg.content}

أجب بشكل تعليمي، استخدم أمثلة عملية عند الحاجة.`;
    try {
      const response = await base44.integrations.Core.InvokeLLM({ prompt });
      const assistantMsg = { role: "assistant", content: response };
      const updated = [...history, assistantMsg];
      setMessages(updated);
      saveMemory(updated);
    } catch {
      const errMsg = {
        role: "assistant",
        content: "عذراً، حدث خطأ. حاول مرة أخرى."
      };
      setMessages([...history, errMsg]);
    } finally {
      setLoading(false);
    }
  };
  const suggestions = [
    "ما الفرق بين Router و Switch؟",
    "كيف أعرّف VLAN؟",
    "ما هو DHCP؟",
    "لماذا فشل الـ Ping؟"
  ];
  return /* @__PURE__ */ jsxs(
    motion.div,
    {
      initial: { opacity: 0, scale: 0.9, y: 20 },
      animate: { opacity: 1, scale: 1, y: 0 },
      exit: { opacity: 0, scale: 0.9, y: 20 },
      className: "absolute bottom-4 right-4 w-80 z-50 rounded-2xl overflow-hidden flex flex-col",
      style: {
        background: "#FFFFFF",
        border: "1px solid #E2E8F0",
        boxShadow: "0 12px 32px rgba(23,63,95,0.18)",
        height: "420px"
      },
      children: [
        /* @__PURE__ */ jsxs(
          "div",
          {
            className: "flex items-center justify-between px-4 py-3 border-b flex-shrink-0",
            style: { borderColor: "#E2E8F0" },
            children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsx("div", { className: "w-7 h-7 rounded-lg flex items-center justify-center", style: { background: "#173F5F" }, children: /* @__PURE__ */ jsx(Sparkles, { size: 13, className: "text-white" }) }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("span", { className: "font-bold text-xs", style: { color: "#173F5F" }, children: "مساعد الشبكات" }),
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
                    /* @__PURE__ */ jsx("div", { className: "w-1.5 h-1.5 rounded-full animate-pulse", style: { background: "#2E7D5B" } }),
                    /* @__PURE__ */ jsx("span", { className: "text-[9px] text-success", children: "متصل" })
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: onClose,
                  className: "text-muted-foreground hover:text-destructive transition-colors",
                  children: /* @__PURE__ */ jsx(X, { size: 14 })
                }
              )
            ]
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "flex-1 overflow-y-auto px-3 py-3 space-y-3", children: [
          messages.length === 0 && /* @__PURE__ */ jsxs("div", { className: "text-center py-4", children: [
            /* @__PURE__ */ jsx("div", { className: "text-muted-foreground text-xs mb-3", children: "اسألني عن شبكتك أو أي مفهوم" }),
            /* @__PURE__ */ jsx("div", { className: "space-y-2", children: suggestions.map((s) => /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => setInput(s),
                className: "block w-full text-right text-xs px-3 py-2 rounded-lg bg-secondary/10 text-secondary border border-secondary/20 hover:bg-secondary/20 transition-colors",
                children: s
              },
              s
            )) })
          ] }),
          messages.map((msg, i) => /* @__PURE__ */ jsx(
            "div",
            {
              className: `flex ${msg.role === "user" ? "justify-end" : "justify-start"}`,
              children: /* @__PURE__ */ jsx(
                "div",
                {
                  className: `max-w-[90%] rounded-xl px-3 py-2 text-xs ${msg.role === "user" ? "bg-secondary/15 text-foreground border border-secondary/30" : "bg-muted text-foreground border border-border"}`,
                  children: msg.role === "assistant" ? /* @__PURE__ */ jsx(ReactMarkdown, { className: "prose prose-xs max-w-none [&>*]:text-xs [&>*:first-child]:mt-0 [&>*:last-child]:mb-0", children: msg.content }) : msg.content
                }
              )
            },
            i
          )),
          loading && /* @__PURE__ */ jsx("div", { className: "flex justify-start", children: /* @__PURE__ */ jsx("div", { className: "bg-muted border border-border rounded-xl px-3 py-2", children: /* @__PURE__ */ jsx("div", { className: "flex gap-1", children: [0, 1, 2].map((i) => /* @__PURE__ */ jsx(
            "div",
            {
              className: "w-1.5 h-1.5 rounded-full bg-secondary animate-bounce",
              style: { animationDelay: `${i * 0.15}s` }
            },
            i
          )) }) }) }),
          /* @__PURE__ */ jsx("div", { ref: bottomRef })
        ] }),
        /* @__PURE__ */ jsxs(
          "div",
          {
            className: "px-3 py-3 border-t flex gap-2 flex-shrink-0",
            style: { borderColor: "#E2E8F0" },
            children: [
              /* @__PURE__ */ jsx(
                "input",
                {
                  value: input,
                  onChange: (e) => setInput(e.target.value),
                  onKeyDown: (e) => e.key === "Enter" && sendMessage(),
                  placeholder: "اسأل عن الشبكات...",
                  className: "flex-1 bg-muted border border-border rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-secondary",
                  dir: "rtl"
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: sendMessage,
                  disabled: loading || !input.trim(),
                  className: "w-8 h-8 rounded-lg flex items-center justify-center transition-all disabled:opacity-40 hover:scale-105",
                  style: { background: "#173F5F" },
                  children: /* @__PURE__ */ jsx(Send, { size: 13, className: "text-white" })
                }
              )
            ]
          }
        )
      ]
    }
  );
}
const STORAGE_KEY$1 = "net-gamification";
const BADGES = [
  { id: "first_node", icon: "🖥️", name: "أول جهاز", desc: "أضف جهازك الأول", xp: 10 },
  { id: "first_connection", icon: "🔗", name: "أول ربط", desc: "اربط جهازين", xp: 20 },
  { id: "five_nodes", icon: "🌐", name: "شبكة صغيرة", desc: "أضف 5 أجهزة", xp: 50 },
  { id: "first_ping", icon: "📡", name: "أول Ping", desc: "أرسل packet ناجح", xp: 30 },
  { id: "scenario_done", icon: "🏆", name: "سيناريو مكتمل", desc: "أكمل سيناريو", xp: 100 }
];
const LEVELS = [
  { min: 0, name: "مبتدئ", color: "#64748B" },
  { min: 50, name: "متعلم", color: "#2F6690" },
  { min: 150, name: "متقدم", color: "#3A86A8" },
  { min: 350, name: "خبير", color: "#D69E2E" },
  { min: 700, name: "محترف", color: "#173F5F" }
];
function loadGamification() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY$1) || '{"xp":0,"badges":[]}');
  } catch {
    return { xp: 0, badges: [] };
  }
}
function saveGamification(data) {
  try {
    localStorage.setItem(STORAGE_KEY$1, JSON.stringify(data));
  } catch {
  }
}
function awardXP(amount, badgeId) {
  const g = loadGamification();
  g.xp += amount;
  if (badgeId && !g.badges.includes(badgeId)) g.badges.push(badgeId);
  saveGamification(g);
  window.dispatchEvent(new CustomEvent("gamification-update", { detail: g }));
  return g;
}
function GamificationBar() {
  const [gdata, setGdata] = useState(loadGamification);
  const [toast2, setToast] = useState(null);
  useEffect(() => {
    const handler = (e) => {
      setGdata(e.detail);
      setToast(`+XP earned!`);
      setTimeout(() => setToast(null), 2500);
    };
    window.addEventListener("gamification-update", handler);
    return () => window.removeEventListener("gamification-update", handler);
  }, []);
  const level = [...LEVELS].reverse().find((l) => gdata.xp >= l.min) || LEVELS[0];
  const nextLevel = LEVELS[LEVELS.indexOf(level) + 1];
  const progress = nextLevel ? (gdata.xp - level.min) / (nextLevel.min - level.min) * 100 : 100;
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: "flex items-center gap-3 px-3 py-1.5 rounded-xl",
      style: {
        background: "#FFFFFF",
        border: "1px solid #E2E8F0"
      },
      children: [
        /* @__PURE__ */ jsx(Zap, { size: 13, style: { color: level.color } }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold", style: { color: level.color }, children: level.name }),
          /* @__PURE__ */ jsx(
            "div",
            {
              className: "w-20 h-1.5 rounded-full overflow-hidden",
              style: { background: "rgba(23,63,95,0.08)" },
              children: /* @__PURE__ */ jsx(
                motion.div,
                {
                  className: "h-full rounded-full",
                  style: { background: level.color },
                  initial: { width: 0 },
                  animate: { width: `${progress}%` },
                  transition: { duration: 0.5 }
                }
              )
            }
          ),
          /* @__PURE__ */ jsxs("span", { className: "text-[10px] text-muted-foreground font-mono", children: [
            gdata.xp,
            " XP"
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex gap-1", children: BADGES.filter((b) => gdata.badges.includes(b.id)).map((b) => /* @__PURE__ */ jsx("span", { title: b.name, className: "text-sm cursor-default", children: b.icon }, b.id)) }),
        /* @__PURE__ */ jsx(AnimatePresence, { children: toast2 && /* @__PURE__ */ jsxs(
          motion.div,
          {
            initial: { opacity: 0, y: -10 },
            animate: { opacity: 1, y: 0 },
            exit: { opacity: 0, y: -10 },
            className: "absolute top-16 left-1/2 -translate-x-1/2 text-xs font-bold px-3 py-1.5 rounded-full shadow-lg z-50",
            style: { background: "#D69E2E", color: "#FFFFFF" },
            children: [
              "⭐ ",
              toast2
            ]
          }
        ) })
      ]
    }
  );
}
async function ensureLabRecord(scenario, tasksTotal) {
  const existing = await studentApi("filter", "LabHistory", {
    query: { scenario_id: scenario.id }
  });
  if (existing && existing.length > 0) {
    const lab2 = existing[0];
    if (tasksTotal && (lab2.tasks_total || 0) !== tasksTotal) {
      await studentApi("update", "LabHistory", {
        id: lab2.id,
        data: { tasks_total: tasksTotal }
      });
      lab2.tasks_total = tasksTotal;
    }
    return lab2;
  }
  const now = (/* @__PURE__ */ new Date()).toISOString();
  return await studentApi("create", "LabHistory", {
    data: {
      scenario_id: scenario.id,
      scenario_title: scenario.title,
      scenario_difficulty: scenario.difficulty,
      status: "in_progress",
      tasks_total: tasksTotal || 0,
      tasks_completed: 0,
      score: 0,
      xp_earned: 0,
      started_at: now,
      last_activity_at: now
    }
  });
}
async function loadTaskStatuses(labId) {
  const rows = await studentApi("filter", "ScenarioTaskStatus", {
    query: { lab_history_id: labId }
  });
  return rows || [];
}
async function syncLabCounters(lab2, completedCount) {
  if ((lab2.tasks_completed || 0) === completedCount) return;
  await studentApi("update", "LabHistory", {
    id: lab2.id,
    data: { tasks_completed: completedCount }
  });
  lab2.tasks_completed = completedCount;
}
async function markTaskCompleted({ lab: lab2, scenario, taskIndex, taskLabel }) {
  const rows = await studentApi("filter", "ScenarioTaskStatus", {
    query: {
      lab_history_id: lab2.id,
      scenario_id: scenario.id,
      task_index: taskIndex
    }
  });
  const now = (/* @__PURE__ */ new Date()).toISOString();
  if (rows && rows.length > 0) {
    if (rows[0].status === "completed") return lab2;
    await studentApi("update", "ScenarioTaskStatus", {
      id: rows[0].id,
      data: {
        status: "completed",
        task_label: taskLabel,
        completed_at: now
      }
    });
  } else {
    await studentApi("create", "ScenarioTaskStatus", {
      data: {
        lab_history_id: lab2.id,
        scenario_id: scenario.id,
        task_index: taskIndex,
        task_label: taskLabel,
        status: "completed",
        completed_at: now
      }
    });
  }
  const completed = (lab2.tasks_completed || 0) + 1;
  const total = lab2.tasks_total || 0;
  const allDone = total > 0 && completed >= total;
  const score = total > 0 ? Math.round(completed / total * 100) : 0;
  await studentApi("update", "LabHistory", {
    id: lab2.id,
    data: {
      tasks_completed: completed,
      score,
      status: allDone ? "completed" : "partially_completed",
      xp_earned: allDone ? scenario.xp || lab2.xp_earned || 0 : lab2.xp_earned || 0,
      completed_at: allDone ? now : lab2.completed_at || null,
      last_activity_at: now
    }
  });
  lab2.tasks_completed = completed;
  lab2.score = score;
  lab2.status = allDone ? "completed" : "partially_completed";
  lab2.xp_earned = allDone ? scenario.xp || lab2.xp_earned || 0 : lab2.xp_earned || 0;
  if (allDone) lab2.completed_at = now;
  return lab2;
}
const safe = (p) => p.catch((e) => console.warn("تخطي حفظ تقدم السيناريو:", e == null ? void 0 : e.message));
function ScenarioPanel({ scenario, nodes, connections, onClose, onComplete }) {
  const [showHints, setShowHints] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const session = useStudentSession();
  const labRef = useRef(null);
  const savedRef = useRef(/* @__PURE__ */ new Set());
  const [savedDone, setSavedDone] = useState(/* @__PURE__ */ new Set());
  const [trackingReady, setTrackingReady] = useState(false);
  const result = (scenario == null ? void 0 : scenario.eval) ? scenario.eval(nodes, connections) : null;
  const details = (result == null ? void 0 : result.details) || [];
  const totalCount = details.length;
  useEffect(() => {
    let cancelled = false;
    setTrackingReady(false);
    labRef.current = null;
    savedRef.current = /* @__PURE__ */ new Set();
    setSavedDone(/* @__PURE__ */ new Set());
    if (!session || !(scenario == null ? void 0 : scenario.eval)) return void 0;
    const init = async () => {
      var _a;
      const total = (((_a = scenario.eval([], [])) == null ? void 0 : _a.details) || []).length;
      if (cancelled) return;
      const lab2 = await ensureLabRecord(scenario, total);
      if (cancelled) return;
      const statuses = await loadTaskStatuses(lab2.id);
      if (cancelled) return;
      const done = new Set(
        (statuses || []).filter((s) => s.status === "completed").map((s) => s.task_index)
      );
      await syncLabCounters(lab2, done.size);
      if (cancelled) return;
      labRef.current = lab2;
      savedRef.current = done;
      setSavedDone(new Set(done));
      setTrackingReady(true);
    };
    safe(init());
    return () => {
      cancelled = true;
    };
  }, [scenario, session == null ? void 0 : session.student_id]);
  useEffect(() => {
    if (!trackingReady || !labRef.current || totalCount === 0) return;
    const newly = details.map((d, i) => ({ ok: d.ok, label: d.label, i })).filter(({ ok, i }) => ok && !savedRef.current.has(i));
    if (newly.length === 0) return;
    const sync = async () => {
      var _a;
      for (const t2 of newly) {
        savedRef.current.add(t2.i);
        await markTaskCompleted({
          lab: labRef.current,
          scenario,
          taskIndex: t2.i,
          taskLabel: t2.label
        });
        setSavedDone(new Set(savedRef.current));
      }
      const total = ((_a = labRef.current) == null ? void 0 : _a.tasks_total) || totalCount;
      if (savedRef.current.size >= total) onComplete == null ? void 0 : onComplete();
    };
    safe(sync());
  }, [trackingReady, nodes, connections]);
  if (!scenario || dismissed) return null;
  const isDone = (task, i) => task.ok || savedDone.has(i);
  const completedCount = details.reduce((acc, d, i) => acc + (isDone(d, i) ? 1 : 0), 0);
  const progressPct = totalCount > 0 ? Math.round(completedCount / totalCount * 100) : 0;
  const allDone = totalCount > 0 && completedCount >= totalCount;
  return /* @__PURE__ */ jsxs(
    motion.div,
    {
      initial: { opacity: 0, x: 40 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: 40 },
      className: "absolute top-4 left-4 z-30 w-72 rounded-2xl overflow-hidden shadow-2xl",
      style: {
        background: "#FFFFFF",
        border: "1px solid #E2E8F0",
        boxShadow: "0 12px 32px rgba(23,63,95,0.15)"
      },
      children: [
        /* @__PURE__ */ jsxs(
          "div",
          {
            className: "flex items-center justify-between px-4 py-3",
            style: { borderBottom: "1px solid #E2E8F0", background: "rgba(47,102,144,0.05)" },
            children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsx("span", { className: "text-lg", children: scenario.icon }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("div", { className: "text-xs font-black", style: { color: "#173F5F" }, children: scenario.title }),
                  /* @__PURE__ */ jsxs("div", { className: "text-[9px]", style: { color: "rgba(47,102,144,0.7)" }, children: [
                    scenario.difficulty,
                    " • ",
                    scenario.xp,
                    " XP"
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => {
                    setDismissed(true);
                    onClose == null ? void 0 : onClose();
                  },
                  className: "p-1 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground",
                  children: /* @__PURE__ */ jsx(X, { size: 13 })
                }
              )
            ]
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "px-4 pt-3 pb-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-[9px] mb-1.5", style: { color: "rgba(31,41,55,0.6)" }, children: [
            /* @__PURE__ */ jsxs("span", { children: [
              "التقدم ",
              trackingReady && /* @__PURE__ */ jsx(Save, { size: 8, className: "inline", style: { color: "#2E7D5B" } })
            ] }),
            /* @__PURE__ */ jsxs("span", { className: "font-bold", style: { color: allDone ? "#2E7D5B" : "#2F6690" }, children: [
              completedCount,
              "/",
              totalCount,
              " مهمة"
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "h-1.5 rounded-full", style: { background: "rgba(23,63,95,0.08)" }, children: /* @__PURE__ */ jsx(
            motion.div,
            {
              className: "h-full rounded-full",
              style: { background: allDone ? "#2E7D5B" : "#2F6690" },
              animate: { width: `${progressPct}%` },
              transition: { duration: 0.5 }
            }
          ) })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "px-4 pb-2 space-y-1.5 max-h-48 overflow-y-auto", style: { scrollbarWidth: "none" }, children: details.map((task, i) => {
          const done = isDone(task, i);
          const savedOnly = done && !task.ok;
          return /* @__PURE__ */ jsxs(
            motion.div,
            {
              className: "flex items-start gap-2 py-1.5 px-2 rounded-lg",
              style: {
                background: done ? "rgba(46,125,91,0.06)" : "rgba(23,63,95,0.03)",
                border: `1px solid ${done ? "rgba(46,125,91,0.25)" : "#E2E8F0"}`
              },
              animate: { opacity: 1 },
              children: [
                done ? /* @__PURE__ */ jsx(CheckCircle2, { size: 13, className: "text-success flex-shrink-0 mt-0.5" }) : /* @__PURE__ */ jsx(Circle, { size: 13, className: "flex-shrink-0 mt-0.5 text-muted-foreground" }),
                /* @__PURE__ */ jsxs("span", { className: "text-[11px] leading-snug flex-1", style: { color: done ? "#2E7D5B" : "rgba(31,41,55,0.75)" }, children: [
                  task.label,
                  savedOnly && /* @__PURE__ */ jsxs("span", { className: "block text-[8px] mt-0.5 flex items-center gap-0.5", style: { color: "rgba(46,125,91,0.6)" }, children: [
                    /* @__PURE__ */ jsx(Save, { size: 7 }),
                    " محفوظة — منجزة سابقاً"
                  ] })
                ] })
              ]
            },
            i
          );
        }) }),
        /* @__PURE__ */ jsxs("div", { className: "px-4 pb-2", children: [
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => setShowHints(!showHints),
              className: "w-full flex items-center justify-between px-3 py-2 rounded-xl text-[11px] font-bold transition-all",
              style: {
                background: showHints ? "rgba(214,158,46,0.12)" : "rgba(214,158,46,0.06)",
                border: "1px solid rgba(214,158,46,0.3)",
                color: "#D69E2E"
              },
              children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
                  /* @__PURE__ */ jsx(Lightbulb, { size: 11 }),
                  /* @__PURE__ */ jsx("span", { children: "تلميحات" })
                ] }),
                showHints ? /* @__PURE__ */ jsx(ChevronUp, { size: 11 }) : /* @__PURE__ */ jsx(ChevronDown, { size: 11 })
              ]
            }
          ),
          /* @__PURE__ */ jsx(AnimatePresence, { children: showHints && /* @__PURE__ */ jsx(
            motion.div,
            {
              initial: { opacity: 0, height: 0 },
              animate: { opacity: 1, height: "auto" },
              exit: { opacity: 0, height: 0 },
              className: "overflow-hidden",
              children: /* @__PURE__ */ jsx("div", { className: "pt-2 space-y-1.5", children: scenario.hints.map((h, i) => /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-1.5 text-[10px]", style: { color: "rgba(31,41,55,0.7)" }, children: [
                /* @__PURE__ */ jsx("span", { className: "flex-shrink-0 mt-0.5", children: "•" }),
                /* @__PURE__ */ jsx("span", { children: h })
              ] }, i)) })
            }
          ) })
        ] }),
        /* @__PURE__ */ jsx(AnimatePresence, { children: allDone && /* @__PURE__ */ jsxs(
          motion.div,
          {
            initial: { opacity: 0, scale: 0.9 },
            animate: { opacity: 1, scale: 1 },
            className: "mx-4 mb-4 rounded-xl p-3 text-center",
            style: { background: "rgba(46,125,91,0.1)", border: "1px solid rgba(46,125,91,0.4)" },
            children: [
              /* @__PURE__ */ jsx(Trophy, { size: 20, className: "text-warning mx-auto mb-1" }),
              /* @__PURE__ */ jsx("div", { className: "text-sm font-black text-success", children: "🎉 أحسنت! أكملت السيناريو" }),
              /* @__PURE__ */ jsxs("div", { className: "text-[10px] text-success mt-0.5", children: [
                "+",
                scenario.xp,
                " XP مكتسبة — تم حفظ التقدم في سجلك"
              ] })
            ]
          }
        ) })
      ]
    }
  );
}
function findPath(fromId, toId, connections) {
  if (fromId === toId) return [fromId];
  const adj = {};
  for (const c of connections) {
    if (!adj[c.from]) adj[c.from] = [];
    if (!adj[c.to]) adj[c.to] = [];
    adj[c.from].push({ neighbor: c.to, connId: c.id });
    adj[c.to].push({ neighbor: c.from, connId: c.id });
  }
  const visited = /* @__PURE__ */ new Set([fromId]);
  const queue = [{ nodeId: fromId, path: [fromId], connPath: [] }];
  while (queue.length > 0) {
    const { nodeId, path, connPath } = queue.shift();
    for (const { neighbor, connId } of adj[nodeId] || []) {
      if (neighbor === toId) {
        return { nodePath: [...path, neighbor], connPath: [...connPath, connId] };
      }
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push({ nodeId: neighbor, path: [...path, neighbor], connPath: [...connPath, connId] });
      }
    }
  }
  return null;
}
function useHistory(setNodes, setConnections) {
  const history = useRef([]);
  const idx = useRef(-1);
  const pushHistory = useCallback((nodes, connections) => {
    history.current = history.current.slice(0, idx.current + 1);
    history.current.push({
      nodes: JSON.parse(JSON.stringify(nodes)),
      connections: JSON.parse(JSON.stringify(connections))
    });
    if (history.current.length > 50) {
      history.current.shift();
    } else {
      idx.current = history.current.length - 1;
    }
  }, []);
  const undo = useCallback(() => {
    if (idx.current <= 0) return false;
    idx.current--;
    const snap = history.current[idx.current];
    setNodes(snap.nodes);
    setConnections(snap.connections);
    return true;
  }, [setNodes, setConnections]);
  const redo = useCallback(() => {
    if (idx.current >= history.current.length - 1) return false;
    idx.current++;
    const snap = history.current[idx.current];
    setNodes(snap.nodes);
    setConnections(snap.connections);
    return true;
  }, [setNodes, setConnections]);
  const canUndo = useCallback(() => idx.current > 0, []);
  const canRedo = useCallback(() => idx.current < history.current.length - 1, []);
  const reset = useCallback(() => {
    history.current = [];
    idx.current = -1;
  }, []);
  return { pushHistory, undo, redo, canUndo, canRedo, reset };
}
const fastEthernetPorts = (count2) => Array.from({ length: count2 }, (_, i) => ({ name: `FastEthernet0/${i + 1}` }));
const PORT_TEMPLATES = {
  Switch: [
    ...fastEthernetPorts(24),
    { name: "GigabitEthernet0/1" },
    { name: "GigabitEthernet0/2" }
  ],
  Router: [
    { name: "GigabitEthernet0/0" },
    { name: "GigabitEthernet0/1" },
    { name: "Serial0/0/0", disabled: true, note: "يتطلب no shutdown + clock rate" },
    { name: "Serial0/0/1", disabled: true, note: "يتطلب no shutdown + clock rate" }
  ],
  PC: [{ name: "FastEthernet0/1" }],
  Laptop: [{ name: "FastEthernet0/1" }, { name: "Wlan0" }],
  Server: [{ name: "FastEthernet0/1" }, { name: "GigabitEthernet0/1" }],
  Firewall: [
    { name: "GigabitEthernet0/0" },
    { name: "GigabitEthernet0/1" },
    { name: "GigabitEthernet0/2" }
  ],
  AccessPoint: [{ name: "GigabitEthernet0/1" }, { name: "GigabitEthernet0/2" }],
  Cloud: [{ name: "GigabitEthernet0/0" }]
};
function getPortsForDevice(type) {
  return PORT_TEMPLATES[type] || [{ name: "Port0" }];
}
const CABLE_TYPES = [
  {
    id: "utp",
    label: "UTP",
    icon: "🔌",
    color: "#D69E2E",
    desc: "كابل نحاسي غير محمي — الأكثر شيوعاً في الشبكات المحلية"
  },
  {
    id: "stp",
    label: "STP",
    icon: "🛡️",
    color: "#173F5F",
    desc: "كابل نحاسي محمي ضد التشويش الكهرومغناطيسي"
  },
  {
    id: "fiber",
    label: "Fiber",
    icon: "💠",
    color: "#3A86A8",
    desc: "ألياف ضوئية — سرعة عالية جداً ومسافات طويلة"
  },
  {
    id: "wifi",
    label: "Wi-Fi",
    icon: "📶",
    color: "#2E7D5B",
    desc: "اتصال لاسلكي — لا يحتاج منفذاً فيزيائياً"
  }
];
const COPPER_DEVICES = /* @__PURE__ */ new Set(["PC", "Server", "Switch", "Router", "Firewall", "AccessPoint", "Laptop"]);
const FIBER_DEVICES = /* @__PURE__ */ new Set(["Router", "Switch", "Server", "Cloud", "Firewall"]);
const WIRELESS_DEVICES = /* @__PURE__ */ new Set(["Laptop", "AccessPoint"]);
function isCableCompatible(cableId, typeA, typeB) {
  if (cableId === "utp" || cableId === "stp") {
    return COPPER_DEVICES.has(typeA) && COPPER_DEVICES.has(typeB);
  }
  if (cableId === "fiber") {
    return FIBER_DEVICES.has(typeA) && FIBER_DEVICES.has(typeB);
  }
  if (cableId === "wifi") {
    return COPPER_DEVICES.has(typeA) && COPPER_DEVICES.has(typeB) && (WIRELESS_DEVICES.has(typeA) || WIRELESS_DEVICES.has(typeB));
  }
  return false;
}
function getUsedPorts(connections, nodeId) {
  const used = /* @__PURE__ */ new Set();
  for (const c of connections || []) {
    if (c.from === nodeId && c.fromPort) used.add(c.fromPort);
    if (c.to === nodeId && c.toPort) used.add(c.toPort);
  }
  return used;
}
function getPortStatus(port, usedPorts) {
  if (usedPorts.has(port.name)) return "connected";
  if (port.disabled) return "disabled";
  return "available";
}
const PORT_STATUS_LABELS = {
  available: { label: "متاح", color: "#2E7D5B" },
  connected: { label: "متصل", color: "#D69E2E" },
  disabled: { label: "معطّل", color: "#C94C4C" }
};
function PortList({ node, connections, selected, onSelect }) {
  const ports = useMemo(() => node ? getPortsForDevice(node.type) : [], [node]);
  const used = useMemo(() => node ? getUsedPorts(connections, node.id) : /* @__PURE__ */ new Set(), [connections, node]);
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: "rounded-xl p-3",
      style: { background: "rgba(23,63,95,0.03)", border: "1px solid #E2E8F0" },
      children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xs font-bold", style: { color: "#173F5F" }, children: node == null ? void 0 : node.label }),
          /* @__PURE__ */ jsx(
            "span",
            {
              className: "text-[9px] font-mono px-1.5 py-0.5 rounded",
              style: { background: "rgba(47,102,144,0.1)", color: "#2F6690" },
              children: node == null ? void 0 : node.type
            }
          )
        ] }),
        /* @__PURE__ */ jsx("div", { className: "max-h-44 overflow-y-auto space-y-1", style: { scrollbarWidth: "thin" }, children: ports.map((port) => {
          const status = getPortStatus(port, used);
          const st = PORT_STATUS_LABELS[status];
          const selectable = status === "available";
          const isSel = selected === port.name;
          return /* @__PURE__ */ jsxs(
            "button",
            {
              disabled: !selectable,
              onClick: () => onSelect(port.name),
              title: port.note || st.label,
              className: "w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-[10px] font-mono transition-all disabled:cursor-not-allowed",
              style: {
                background: isSel ? "rgba(47,102,144,0.12)" : "rgba(23,63,95,0.03)",
                border: `1px solid ${isSel ? "#2F6690" : "#E2E8F0"}`,
                opacity: selectable ? 1 : 0.55
              },
              children: [
                /* @__PURE__ */ jsx("span", { style: { color: isSel ? "#2F6690" : "rgba(31,41,55,0.75)" }, children: port.name }),
                /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1 font-sans", children: [
                  /* @__PURE__ */ jsx("span", { className: "w-1.5 h-1.5 rounded-full", style: { background: st.color } }),
                  /* @__PURE__ */ jsx("span", { style: { color: st.color }, children: st.label })
                ] })
              ]
            },
            port.name
          );
        }) })
      ]
    }
  );
}
function ConnectionDialog({ fromNode, toNode, connections, onConfirm, onCancel }) {
  const [cableId, setCableId] = useState(null);
  const [fromPort, setFromPort] = useState(null);
  const [toPort, setToPort] = useState(null);
  const isWireless = cableId === "wifi";
  const incompatible = cableId && !isCableCompatible(cableId, fromNode == null ? void 0 : fromNode.type, toNode == null ? void 0 : toNode.type);
  const canConfirm = cableId && !incompatible && (isWireless || fromPort && toPort);
  const selectedCable = CABLE_TYPES.find((c) => c.id === cableId);
  return /* @__PURE__ */ jsx(
    motion.div,
    {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      className: "absolute inset-0 z-40 flex items-center justify-center p-4",
      style: { background: "rgba(2,6,23,0.75)", backdropFilter: "blur(4px)" },
      onClick: onCancel,
      children: /* @__PURE__ */ jsxs(
        motion.div,
        {
          initial: { scale: 0.92, y: 16 },
          animate: { scale: 1, y: 0 },
          exit: { scale: 0.92, opacity: 0 },
          transition: { type: "spring", duration: 0.3 },
          className: "w-full max-w-2xl rounded-2xl p-5 max-h-[90%] overflow-y-auto",
          style: {
            background: "#FFFFFF",
            border: "1px solid #E2E8F0",
            boxShadow: "0 24px 60px rgba(23,63,95,0.25)"
          },
          onClick: (e) => e.stopPropagation(),
          children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsxs("h3", { className: "text-sm font-black", style: { color: "#173F5F" }, children: [
                  "🔗 توصيل ",
                  fromNode == null ? void 0 : fromNode.label,
                  " → ",
                  toNode == null ? void 0 : toNode.label
                ] }),
                /* @__PURE__ */ jsx("p", { className: "text-[10px] mt-0.5", style: { color: "rgba(31,41,55,0.55)" }, children: "اختر نوع الكابل ثم المنفذ في كل جهاز" })
              ] }),
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: onCancel,
                  className: "p-1.5 rounded-lg transition-colors text-muted-foreground hover:text-foreground hover:bg-muted",
                  children: /* @__PURE__ */ jsx(X, { size: 16 })
                }
              )
            ] }),
            /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3", children: CABLE_TYPES.map((cable) => {
              const ok = isCableCompatible(cable.id, fromNode == null ? void 0 : fromNode.type, toNode == null ? void 0 : toNode.type);
              const active = cableId === cable.id;
              return /* @__PURE__ */ jsxs(
                "button",
                {
                  onClick: () => {
                    setCableId(cable.id);
                    setFromPort(null);
                    setToPort(null);
                  },
                  disabled: !ok,
                  className: "flex flex-col items-center gap-1 p-2.5 rounded-xl transition-all disabled:opacity-25 disabled:cursor-not-allowed",
                  style: {
                    background: active ? `${cable.color}1A` : "rgba(23,63,95,0.03)",
                    border: `1px solid ${active ? cable.color : "#E2E8F0"}`
                  },
                  children: [
                    /* @__PURE__ */ jsx("span", { className: "text-lg leading-none", children: cable.icon }),
                    /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold", style: { color: active ? cable.color : "rgba(31,41,55,0.7)" }, children: cable.label })
                  ]
                },
                cable.id
              );
            }) }),
            incompatible && /* @__PURE__ */ jsxs(
              "div",
              {
                className: "flex items-center gap-2 px-3 py-2 rounded-xl mb-3 text-[11px] font-bold",
                style: { background: "rgba(201,76,76,0.08)", border: "1px solid rgba(201,76,76,0.35)", color: "#C94C4C" },
                children: [
                  /* @__PURE__ */ jsx(AlertTriangle, { size: 13 }),
                  "نوع الكابل «",
                  selectedCable == null ? void 0 : selectedCable.label,
                  "» غير متوافق مع ",
                  fromNode == null ? void 0 : fromNode.type,
                  " و ",
                  toNode == null ? void 0 : toNode.type
                ]
              }
            ),
            cableId && !incompatible && /* @__PURE__ */ jsxs("p", { className: "text-[10px] mb-3 px-1", style: { color: `${selectedCable == null ? void 0 : selectedCable.color}` }, children: [
              selectedCable == null ? void 0 : selectedCable.icon,
              " ",
              selectedCable == null ? void 0 : selectedCable.desc
            ] }),
            cableId && !incompatible && !isWireless && /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4", children: [
              /* @__PURE__ */ jsx(
                PortList,
                {
                  title: "من",
                  node: fromNode,
                  connections,
                  selected: fromPort,
                  onSelect: setFromPort
                }
              ),
              /* @__PURE__ */ jsx(
                PortList,
                {
                  title: "إلى",
                  node: toNode,
                  connections,
                  selected: toPort,
                  onSelect: setToPort
                }
              )
            ] }),
            isWireless && /* @__PURE__ */ jsx(
              "div",
              {
                className: "px-3 py-2.5 rounded-xl mb-4 text-[11px]",
                style: { background: "rgba(46,125,91,0.08)", border: "1px solid rgba(46,125,91,0.3)", color: "#2E7D5B" },
                children: "📶 اتصال لاسلكي — لا يحتاج اختيار منفذ فيزيائي"
              }
            ),
            /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: onCancel,
                  className: "flex-1 py-2.5 rounded-xl text-xs font-bold transition-all hover:bg-muted",
                  style: { border: "1px solid #E2E8F0", color: "rgba(31,41,55,0.65)" },
                  children: "إلغاء"
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  disabled: !canConfirm,
                  onClick: () => onConfirm({ cableType: cableId, fromPort: isWireless ? null : fromPort, toPort: isWireless ? null : toPort }),
                  className: "flex-1 py-2.5 rounded-xl text-xs font-black transition-all disabled:opacity-30 disabled:cursor-not-allowed",
                  style: {
                    background: canConfirm ? "#173F5F" : "rgba(23,63,95,0.05)",
                    border: "1px solid rgba(23,63,95,0.4)",
                    color: "#fff"
                  },
                  children: canConfirm ? "إنشاء الاتصال" : "اختر الكابل والمنافذ"
                }
              )
            ] })
          ]
        }
      )
    }
  );
}
const STORAGE_KEY = "network-simulator-state";
function activeScenarioId() {
  try {
    return localStorage.getItem("active-scenario-id");
  } catch {
    return null;
  }
}
function loadState() {
  var _a, _b;
  const sid = activeScenarioId();
  const key = sid ? `network-simulator-state-s${sid}` : STORAGE_KEY;
  const empty = { nodes: [], connections: [], nextId: 1 };
  try {
    const saved = localStorage.getItem(key);
    if (saved) return { key, state: JSON.parse(saved) };
    if (sid) {
      const sc = getScenarioById(sid);
      if ((_b = (_a = sc == null ? void 0 : sc.template) == null ? void 0 : _a.nodes) == null ? void 0 : _b.length) {
        return {
          key,
          state: {
            nodes: sc.template.nodes.map((n) => ({ ...n })),
            connections: (sc.template.connections || []).map((c) => ({ ...c })),
            nextId: sc.template.nodes.length + 1
          }
        };
      }
    }
    return { key, state: empty };
  } catch {
    return { key, state: empty };
  }
}
function generatePacketSegments(path, connections, nodes, protocol) {
  const segments = [];
  for (let i = 0; i < path.nodePath.length - 1; i++) {
    const fromNode = nodes.find((n) => n.id === path.nodePath[i]);
    const toNode = nodes.find((n) => n.id === path.nodePath[i + 1]);
    const connId = path.connPath[i];
    if (!fromNode || !toNode) continue;
    segments.push({
      fromId: fromNode.id,
      toId: toNode.id,
      connId,
      srcIP: fromNode.ip || `192.168.1.${fromNode.id}`,
      dstIP: toNode.ip || `192.168.1.${toNode.id}`,
      protocol: protocol || "ICMP",
      ttl: 64 - i,
      size: Math.floor(Math.random() * 1400) + 64,
      hopIndex: i,
      totalHops: path.nodePath.length - 1
    });
  }
  return segments;
}
function NetworkSimulator() {
  const [session] = useState(loadState);
  const [nodes, setNodes] = useState(session.state.nodes);
  const [connections, setConnections] = useState(session.state.connections);
  const [nextId, setNextId] = useState(session.state.nextId || session.state.nodes.length + 1);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [activeTool, setActiveTool] = useState(null);
  const [connectFrom, setConnectFrom] = useState(null);
  const [packetFrom, setPacketFrom] = useState(null);
  const [selectedProtocol, setSelectedProtocol] = useState("ICMP");
  const [selectedNode, setSelectedNode] = useState(null);
  const [activePackets, setActivePackets] = useState([]);
  const [snifferLog, setSnifferLog] = useState([]);
  const [showSniffer, setShowSniffer] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [packetSpeed, setPacketSpeed] = useState(1);
  const pendingChains = useRef([]);
  const [errorMsg, setErrorMsg] = useState(null);
  const [statusMsg, setStatusMsg] = useState(null);
  const [connInfo, setConnInfo] = useState(null);
  const [pendingConnection, setPendingConnection] = useState(null);
  const [activeScenario, setActiveScenario] = useState(() => {
    try {
      localStorage.removeItem("active-scenario");
      const id = localStorage.getItem("active-scenario-id");
      return id ? getScenarioById(id) : null;
    } catch {
      return null;
    }
  });
  const { pushHistory, undo: undoHistory, redo: redoHistory, reset: resetHistory } = useHistory(setNodes, setConnections);
  useEffect(() => {
    localStorage.setItem(session.key, JSON.stringify({ nodes, connections, nextId }));
  }, [nodes, connections, nextId]);
  useEffect(() => {
    const step = 0.022 * packetSpeed;
    const interval = setInterval(() => {
      setActivePackets((prev) => {
        if (prev.length === 0) return prev;
        const stillMoving = [];
        const completedPacketIds = [];
        for (const p of prev) {
          const newProgress = p.progress + step;
          if (newProgress >= 1) {
            completedPacketIds.push(p.id);
            const final = { ...p, progress: 1, status: "delivered" };
            setSnifferLog((log) => [...log.slice(-99), final]);
          } else {
            stillMoving.push({ ...p, progress: newProgress });
          }
        }
        if (completedPacketIds.length > 0) {
          const nextHops = [];
          for (const pid of completedPacketIds) {
            const chainIdx = pendingChains.current.findIndex((c) => c.currentPacketId === pid);
            if (chainIdx !== -1) {
              const chain = pendingChains.current[chainIdx];
              const nextHopIdx = chain.currentHop + 1;
              if (nextHopIdx < chain.segments.length) {
                const seg = chain.segments[nextHopIdx];
                const nextId2 = `pkt-${Date.now()}-${nextHopIdx}-${Math.random()}`;
                pendingChains.current[chainIdx] = { ...chain, currentHop: nextHopIdx, currentPacketId: nextId2 };
                nextHops.push({ id: nextId2, ...seg, progress: 0, status: "transit", startedAt: Date.now() });
              } else {
                if (chain.segments.length > 0) {
                  const lastSeg = chain.segments[chain.segments.length - 1];
                  setStatusMsg({ text: `✅ تم الاستلام — ${lastSeg.protocol}`, type: "success" });
                  setTimeout(() => setStatusMsg(null), 2e3);
                }
                pendingChains.current.splice(chainIdx, 1);
              }
            }
          }
          return [...stillMoving, ...nextHops];
        }
        return stillMoving;
      });
    }, 40);
    return () => clearInterval(interval);
  }, [packetSpeed]);
  const showError = (msg) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(null), 3e3);
  };
  const setTool = useCallback((tool) => {
    setActiveTool((prev) => prev === tool ? null : tool);
    setConnectFrom(null);
    setPacketFrom(null);
    setSelectedNode(null);
  }, []);
  const addNode = useCallback((type, x, y) => {
    const newNode = { id: nextId, type, x, y, label: `${type} ${nextId}` };
    setNodes((prev) => {
      const updated = [...prev, newNode];
      pushHistory(updated, connections);
      if (updated.length === 1) awardXP(10, "first_node");
      if (updated.length === 5) awardXP(50, "five_nodes");
      return updated;
    });
    setNextId((prev) => prev + 1);
  }, [nextId, connections, pushHistory]);
  const moveNode = useCallback((id, x, y) => {
    setNodes((prev) => prev.map((n) => n.id === id ? { ...n, x, y } : n));
  }, []);
  const moveNodeEnd = useCallback((id, x, y) => {
    setNodes((prev) => {
      const updated = prev.map((n) => n.id === id ? { ...n, x, y } : n);
      pushHistory(updated, connections);
      return updated;
    });
  }, [connections, pushHistory]);
  const deleteNode = useCallback((id) => {
    setNodes((prev) => {
      const updated = prev.filter((n) => n.id !== id);
      setConnections((cs) => {
        const updatedCs = cs.filter((c) => c.from !== id && c.to !== id);
        pushHistory(updated, updatedCs);
        return updatedCs;
      });
      return updated;
    });
    setSelectedNode(null);
  }, [pushHistory]);
  const updateNode = useCallback((id, data) => {
    setNodes((prev) => {
      const updated = prev.map((n) => n.id === id ? { ...n, ...data } : n);
      pushHistory(updated, connections);
      return updated;
    });
  }, [connections, pushHistory]);
  const confirmConnection = useCallback(({ cableType, fromPort, toPort }) => {
    const pc = pendingConnection;
    if (!pc) return;
    const fromNode = nodes.find((n) => n.id === pc.fromId);
    const toNode = nodes.find((n) => n.id === pc.toId);
    if (!fromNode || !toNode) {
      setPendingConnection(null);
      return;
    }
    const connType = getConnectionType(fromNode.type, toNode.type);
    setConnections((prev) => {
      const updated = [...prev, {
        id: `${pc.fromId}-${pc.toId}`,
        from: pc.fromId,
        to: pc.toId,
        connectionType: connType,
        cableType,
        fromPort,
        toPort
      }];
      pushHistory(nodes, updated);
      return updated;
    });
    awardXP(20, "first_connection");
    const cable = CABLE_TYPES.find((c) => c.id === cableType);
    if (cable) {
      setConnInfo({ label: `🔗 ${cable.label}`, desc: cable.desc });
      setTimeout(() => setConnInfo(null), 3e3);
    }
    setPendingConnection(null);
  }, [pendingConnection, nodes, pushHistory]);
  const deleteConnection = useCallback((connId) => {
    setConnections((prev) => {
      const updated = prev.filter((c) => c.id !== connId);
      pushHistory(nodes, updated);
      return updated;
    });
  }, [nodes, pushHistory]);
  const handleNodeClick = useCallback((id) => {
    if (activeTool === "delete") {
      deleteNode(id);
      return;
    }
    if (activeTool === "packet") {
      if (!packetFrom) {
        setPacketFrom(id);
      } else if (packetFrom !== id) {
        const fromNode = nodes.find((n) => n.id === packetFrom);
        const toNode = nodes.find((n) => n.id === id);
        if (fromNode && toNode) {
          const path = findPath(packetFrom, id, connections);
          if (!path) {
            showError(`❌ لا يوجد مسار بين "${fromNode.label}" و"${toNode.label}" — تحقق من الاتصالات`);
          } else {
            const segments = generatePacketSegments(path, connections, nodes, selectedProtocol);
            if (segments.length === 0) {
              showError("لا توجد قطاعات للإرسال");
              return;
            }
            const lostIdx = Math.random() < 0.1 ? Math.floor(Math.random() * segments.length) : -1;
            if (lostIdx !== -1) {
              showError(`⚠️ Packet Lost عند الـ Hop ${lostIdx + 1}! إعادة الإرسال...`);
              segments.splice(lostIdx);
              if (segments.length === 0) return;
            }
            const firstSeg = segments[0];
            const firstId = `pkt-${Date.now()}-0-${Math.random()}`;
            pendingChains.current.push({ segments, currentHop: 0, currentPacketId: firstId });
            setActivePackets((prev) => [...prev, { id: firstId, ...firstSeg, progress: 0, status: "transit", startedAt: Date.now() }]);
            setSnifferLog((log) => [...log.slice(-99), {
              id: `log-${Date.now()}`,
              fromId: packetFrom,
              toId: id,
              srcIP: fromNode.ip || `192.168.1.${fromNode.id}`,
              dstIP: toNode.ip || `192.168.1.${toNode.id}`,
              protocol: selectedProtocol,
              hops: path.nodePath.length - 1,
              status: "sending",
              startedAt: Date.now()
            }]);
            awardXP(30, "first_ping");
          }
        }
        setPacketFrom(null);
        setActiveTool(null);
      }
      return;
    }
    if (activeTool === "connect") {
      if (!connectFrom) {
        setConnectFrom(id);
      } else if (connectFrom !== id) {
        const exists = connections.some(
          (c) => c.from === connectFrom && c.to === id || c.from === id && c.to === connectFrom
        );
        if (!exists) {
          setPendingConnection({ fromId: connectFrom, toId: id });
        } else {
          showError("الاتصال موجود مسبقاً بين الجهازين");
        }
        setConnectFrom(null);
        setActiveTool(null);
      }
      return;
    }
    setSelectedNode((prev) => prev === id ? null : id);
  }, [activeTool, packetFrom, connectFrom, connections, nodes, pushHistory, selectedProtocol, deleteNode]);
  const undo = useCallback(() => undoHistory(), [undoHistory]);
  const redo = useCallback(() => redoHistory(), [redoHistory]);
  const autoArrange = useCallback(() => {
    if (nodes.length < 2) return;
    const cx = 500, cy = 350;
    const r = Math.min(280, 70 * nodes.length);
    setNodes((prev) => {
      const updated = prev.map((n, i) => ({
        ...n,
        x: cx + r * Math.cos(2 * Math.PI * i / prev.length),
        y: cy + r * Math.sin(2 * Math.PI * i / prev.length)
      }));
      pushHistory(updated, connections);
      return updated;
    });
  }, [nodes.length, connections, pushHistory]);
  const reset = useCallback(() => {
    setNodes([]);
    setConnections([]);
    setNextId(1);
    setSelectedNode(null);
    setConnectFrom(null);
    setActiveTool(null);
    setPacketFrom(null);
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setActivePackets([]);
    setSnifferLog([]);
    pendingChains.current = [];
    setPendingConnection(null);
    resetHistory();
  }, [resetHistory]);
  const zoomIn = () => setZoom((z) => Math.min(z + 0.15, 3));
  const zoomOut = () => setZoom((z) => Math.max(z - 0.15, 0.2));
  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };
  const connectMode = activeTool === "connect";
  const packetMode = activeTool === "packet";
  return /* @__PURE__ */ jsxs("div", { className: "h-screen flex flex-col overflow-hidden", style: { background: "#F7F9FC", color: "#1F2937" }, children: [
    /* @__PURE__ */ jsxs(
      "div",
      {
        className: "flex-shrink-0 flex items-center justify-between px-4 py-2",
        style: { background: "#FFFFFF", borderBottom: "1px solid #E2E8F0", height: 48 },
        children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsxs(
              Link,
              {
                to: "/",
                className: "flex items-center gap-1 text-xs transition-colors",
                style: { color: "rgba(31,41,55,0.55)" },
                onMouseEnter: (e) => e.currentTarget.style.color = "#173F5F",
                onMouseLeave: (e) => e.currentTarget.style.color = "rgba(31,41,55,0.55)",
                children: [
                  /* @__PURE__ */ jsx(ChevronLeft, { size: 12 }),
                  " الرئيسية"
                ]
              }
            ),
            /* @__PURE__ */ jsx("div", { className: "w-px h-4", style: { background: "#E2E8F0" } }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(
                "div",
                {
                  className: "w-6 h-6 rounded-lg flex items-center justify-center",
                  style: { background: "#173F5F" },
                  children: /* @__PURE__ */ jsx(Activity, { size: 12, className: "text-white" })
                }
              ),
              /* @__PURE__ */ jsx("span", { className: "font-black text-sm", style: { color: "#173F5F" }, children: "Network Simulator" })
            ] }),
            activeTool && /* @__PURE__ */ jsxs(
              "div",
              {
                className: "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold animate-pulse",
                style: {
                  background: connectMode ? "rgba(47,102,144,0.1)" : packetMode ? "rgba(58,134,168,0.1)" : "rgba(201,76,76,0.1)",
                  border: `1px solid ${connectMode ? "rgba(47,102,144,0.35)" : packetMode ? "rgba(58,134,168,0.35)" : "rgba(201,76,76,0.4)"}`,
                  color: connectMode ? "#2F6690" : packetMode ? "#3A86A8" : "#C94C4C"
                },
                children: [
                  /* @__PURE__ */ jsx("div", { className: "w-1.5 h-1.5 rounded-full bg-current" }),
                  connectMode ? connectFrom ? "انقر الجهاز الثاني" : "انقر الجهاز الأول" : packetMode ? packetFrom ? "انقر الوجهة" : "انقر المصدر" : "وضع الحذف — انقر جهازاً"
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsx(GamificationBar, {})
        ]
      }
    ),
    /* @__PURE__ */ jsxs(AnimatePresence, { children: [
      errorMsg && /* @__PURE__ */ jsxs(
        motion.div,
        {
          initial: { opacity: 0, y: -16 },
          animate: { opacity: 1, y: 0 },
          exit: { opacity: 0, y: -16 },
          className: "absolute top-14 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-bold shadow-2xl",
          style: { background: "#FFFFFF", border: "1px solid rgba(201,76,76,0.5)", color: "#C94C4C", boxShadow: "0 8px 24px rgba(23,63,95,0.15)" },
          children: [
            /* @__PURE__ */ jsx(AlertTriangle, { size: 15, className: "text-destructive" }),
            errorMsg
          ]
        },
        "err"
      ),
      statusMsg && /* @__PURE__ */ jsx(
        motion.div,
        {
          initial: { opacity: 0, y: -16 },
          animate: { opacity: 1, y: 0 },
          exit: { opacity: 0, y: -16 },
          className: "absolute top-14 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-bold shadow-2xl",
          style: { background: "#FFFFFF", border: "1px solid rgba(46,125,91,0.5)", color: "#2E7D5B", boxShadow: "0 8px 24px rgba(23,63,95,0.15)" },
          children: statusMsg.text
        },
        "status"
      ),
      connInfo && /* @__PURE__ */ jsxs(
        motion.div,
        {
          initial: { opacity: 0, y: -16 },
          animate: { opacity: 1, y: 0 },
          exit: { opacity: 0, y: -16 },
          className: "absolute top-14 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-xl shadow-2xl",
          style: { background: "#FFFFFF", border: "1px solid rgba(47,102,144,0.45)", boxShadow: "0 8px 24px rgba(23,63,95,0.15)" },
          children: [
            /* @__PURE__ */ jsxs("span", { className: "font-black text-sm", style: { color: "#2F6690" }, children: [
              "🔗 ",
              connInfo.label
            ] }),
            /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground", children: connInfo.desc })
          ]
        },
        "conn"
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-1 overflow-hidden", children: [
      /* @__PURE__ */ jsx(
        SimSidebar,
        {
          activeTool,
          setTool,
          connectFrom,
          packetFrom,
          showSniffer,
          setShowSniffer,
          showAI,
          setShowAI,
          zoom,
          zoomIn,
          zoomOut,
          resetView,
          undo,
          redo,
          reset,
          snifferCount: snifferLog.length,
          selectedProtocol,
          setSelectedProtocol,
          packetSpeed,
          setPacketSpeed,
          autoArrange,
          nodes,
          connections,
          activeScenario,
          setActiveScenario
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "flex-1 relative overflow-hidden", children: [
        /* @__PURE__ */ jsx(AnimatePresence, { children: activeScenario && /* @__PURE__ */ jsx(
          ScenarioPanel,
          {
            scenario: activeScenario,
            nodes,
            connections,
            onClose: () => {
              setActiveScenario(null);
              localStorage.removeItem("active-scenario-id");
            }
          }
        ) }),
        /* @__PURE__ */ jsx(AnimatePresence, { children: pendingConnection && /* @__PURE__ */ jsx(
          ConnectionDialog,
          {
            fromNode: nodes.find((n) => n.id === pendingConnection.fromId),
            toNode: nodes.find((n) => n.id === pendingConnection.toId),
            connections,
            onConfirm: confirmConnection,
            onCancel: () => setPendingConnection(null)
          }
        ) }),
        /* @__PURE__ */ jsx(AnimatePresence, { children: selectedNode && !activeTool && /* @__PURE__ */ jsx(
          NodeConfigPanel,
          {
            node: nodes.find((n) => n.id === selectedNode),
            onUpdate: updateNode,
            onClose: () => setSelectedNode(null)
          }
        ) }),
        /* @__PURE__ */ jsx(
          NetworkCanvas,
          {
            nodes,
            connections,
            zoom,
            pan,
            setPan,
            addNode,
            moveNode,
            moveNodeEnd,
            deleteNode,
            handleNodeClick,
            deleteConnection,
            connectMode,
            connectFrom,
            packetMode,
            packetFrom,
            selectedNode: activeTool ? null : selectedNode,
            setSelectedNode: activeTool ? () => {
            } : setSelectedNode,
            activePackets,
            highlightNodeId: packetMode ? packetFrom : connectMode ? connectFrom : null,
            activeTool
          }
        ),
        /* @__PURE__ */ jsx(AnimatePresence, { children: showSniffer && /* @__PURE__ */ jsx(PacketSniffer, { packets: snifferLog, onClose: () => setShowSniffer(false) }) }),
        /* @__PURE__ */ jsx(AnimatePresence, { children: showAI && /* @__PURE__ */ jsx(AIAssistant, { nodes, connections, onClose: () => setShowAI(false) }) })
      ] })
    ] })
  ] });
}
const PROGRESS_KEY = "topic-progress";
const QUIZ_KEY = "quiz-results";
function loadProgress() {
  try {
    return JSON.parse(localStorage.getItem(PROGRESS_KEY) || "{}");
  } catch {
    return {};
  }
}
function loadQuizResults() {
  try {
    return JSON.parse(localStorage.getItem(QUIZ_KEY) || "{}");
  } catch {
    return {};
  }
}
const SECTION_ICONS = {
  "network-addresses": "🌐",
  "vlan": "🏷️",
  "routing": "🔀",
  "wireless": "📡",
  "security": "🛡️",
  "network-services": "⚙️",
  "iot": "💡"
};
function Dashboard() {
  useLang();
  const [progress, setProgress] = useState(loadProgress());
  const [quizResults, setQuizResults] = useState(loadQuizResults());
  useEffect(() => {
    const handleStorage = () => {
      setProgress(loadProgress());
      setQuizResults(loadQuizResults());
    };
    window.addEventListener("storage", handleStorage);
    window.addEventListener("focus", handleStorage);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("focus", handleStorage);
    };
  }, []);
  const totalTopics2 = courseData.reduce((s, sec) => s + sec.topics.length, 0);
  const visitedTopics = Object.keys(progress).filter((k) => {
    var _a;
    return (_a = progress[k]) == null ? void 0 : _a.visited;
  }).length;
  const completedQuizzes = Object.keys(quizResults).length;
  const totalQuizzes2 = Object.keys(mergedQuizzes).length;
  const avgScore = completedQuizzes > 0 ? Math.round(Object.values(quizResults).reduce((s, r) => s + (r.score || 0), 0) / completedQuizzes) : 0;
  const sectionStrengths = courseData.map((sec) => {
    const topicsWithQuiz = sec.topics.filter((t2) => mergedQuizzes[t2.id]);
    const done = topicsWithQuiz.filter((t2) => quizResults[t2.id]);
    const scores = done.map((t2) => {
      var _a;
      return ((_a = quizResults[t2.id]) == null ? void 0 : _a.score) || 0;
    });
    const avgSec = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;
    const visited = sec.topics.filter((t2) => {
      var _a;
      return (_a = progress[t2.id]) == null ? void 0 : _a.visited;
    }).length;
    return { ...sec, avgScore: avgSec, visited, total: sec.topics.length };
  });
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-background", children: [
    /* @__PURE__ */ jsxs("div", { className: "relative overflow-hidden border-b border-border", style: { background: "#F7F9FC" }, children: [
      /* @__PURE__ */ jsx("div", { className: "absolute inset-0", style: {
        backgroundImage: `linear-gradient(rgba(47,102,144,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(47,102,144,0.05) 1px, transparent 1px)`,
        backgroundSize: "40px 40px"
      } }),
      /* @__PURE__ */ jsx("div", { className: "relative max-w-5xl mx-auto px-6 py-10", children: /* @__PURE__ */ jsxs(motion.div, { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm mb-2", style: { color: "rgba(47,102,144,0.7)" }, children: [
          /* @__PURE__ */ jsx(Link, { to: "/", className: "transition-colors hover:text-primary", children: t("backHome") }),
          /* @__PURE__ */ jsx(ChevronLeft, { size: 13 }),
          /* @__PURE__ */ jsx("span", { style: { color: "#173F5F" }, children: t("navDashboard") })
        ] }),
        /* @__PURE__ */ jsx("h1", { className: "text-3xl sm:text-4xl font-black mb-1", style: { color: "#173F5F" }, children: t("dashTitle") }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: t("dashSubtitle") })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "max-w-5xl mx-auto px-6 py-8 space-y-8", children: [
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-4", children: [
        { icon: BookOpen, label: t("dashLessonsDone"), val: `${visitedTopics}/${totalTopics2}`, color: "text-secondary", bg: "bg-card border-border" },
        { icon: CheckCircle2, label: t("dashQuizzesDone"), val: `${completedQuizzes}/${totalQuizzes2}`, color: "text-success", bg: "bg-card border-border" },
        { icon: Star, label: t("dashAvgScore"), val: completedQuizzes ? `${avgScore}%` : "—", color: "text-warning", bg: "bg-card border-border" },
        { icon: TrendingUp, label: t("dashProgressPct"), val: `${totalTopics2 ? Math.round(visitedTopics / totalTopics2 * 100) : 0}%`, color: "text-primary", bg: "bg-card border-border" }
      ].map(({ icon: Icon, label, val, color, bg }, i) => /* @__PURE__ */ jsxs(
        motion.div,
        {
          initial: { opacity: 0, y: 16 },
          animate: { opacity: 1, y: 0 },
          transition: { delay: i * 0.07 },
          className: `rounded-2xl border p-4 ${bg}`,
          children: [
            /* @__PURE__ */ jsx(Icon, { size: 20, className: `${color} mb-2` }),
            /* @__PURE__ */ jsx("div", { className: `text-2xl font-black ${color}`, children: val }),
            /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground mt-0.5", children: label })
          ]
        },
        i
      )) }),
      /* @__PURE__ */ jsxs(
        motion.div,
        {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          transition: { delay: 0.2 },
          className: "bg-card border border-border rounded-2xl p-5",
          children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-3", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsx(Target, { size: 16, className: "text-primary" }),
                /* @__PURE__ */ jsx("span", { className: "font-bold text-sm text-foreground", children: t("dashOverall") })
              ] }),
              /* @__PURE__ */ jsxs("span", { className: "text-xs font-bold text-primary", children: [
                visitedTopics,
                "/",
                totalTopics2,
                " ",
                t("lessonWord")
              ] })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "h-3 bg-muted rounded-full overflow-hidden", children: /* @__PURE__ */ jsx(
              motion.div,
              {
                className: "h-full bg-primary rounded-full",
                initial: { width: 0 },
                animate: { width: `${totalTopics2 ? visitedTopics / totalTopics2 * 100 : 0}%` },
                transition: { duration: 1, ease: "easeOut", delay: 0.3 }
              }
            ) })
          ]
        }
      ),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-4", children: [
          /* @__PURE__ */ jsx("div", { className: "w-1 h-5 bg-primary rounded-full" }),
          /* @__PURE__ */ jsx("h2", { className: "font-bold text-foreground", children: t("dashBySection") })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: sectionStrengths.map((sec, i) => /* @__PURE__ */ jsxs(
          motion.div,
          {
            initial: { opacity: 0, y: 12 },
            animate: { opacity: 1, y: 0 },
            transition: { delay: 0.1 + i * 0.06 },
            className: "bg-card border border-border rounded-2xl p-4 hover:shadow-md transition-shadow",
            children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-3", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsx("span", { className: "text-xl", children: SECTION_ICONS[sec.id] || "📚" }),
                  /* @__PURE__ */ jsx("span", { className: "font-semibold text-sm text-foreground", children: sectionTitle(sec) })
                ] }),
                sec.avgScore !== null && /* @__PURE__ */ jsxs("span", { className: `text-xs font-bold px-2 py-0.5 rounded-full ${sec.avgScore >= 80 ? "bg-success/10 text-success" : sec.avgScore >= 60 ? "bg-warning/10 text-warning" : "bg-destructive/10 text-destructive"}`, children: [
                  sec.avgScore,
                  "%"
                ] })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "space-y-1.5 mb-3", children: sec.topics.map((topic) => {
                var _a;
                const visited = (_a = progress[topic.id]) == null ? void 0 : _a.visited;
                const qResult = quizResults[topic.id];
                const hasQuiz = !!mergedQuizzes[topic.id];
                return /* @__PURE__ */ jsxs(
                  Link,
                  {
                    to: `/topic/${sec.id}/${topic.id}`,
                    className: "flex items-center gap-2 group",
                    children: [
                      /* @__PURE__ */ jsx("div", { className: `w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${qResult ? "bg-success" : visited ? "bg-primary/70" : "bg-muted"}`, children: qResult ? /* @__PURE__ */ jsx(CheckCircle2, { size: 10, className: "text-white" }) : visited ? /* @__PURE__ */ jsx("div", { className: "w-1.5 h-1.5 bg-white rounded-full" }) : /* @__PURE__ */ jsx(Lock, { size: 8, className: "text-muted-foreground" }) }),
                      /* @__PURE__ */ jsx("span", { className: `text-xs flex-1 truncate transition-colors ${visited ? "text-foreground" : "text-muted-foreground"} group-hover:text-primary`, children: topicTitle(topic) }),
                      qResult && /* @__PURE__ */ jsxs("span", { className: "text-[10px] font-bold text-success", children: [
                        qResult.score,
                        "%"
                      ] }),
                      hasQuiz && !qResult && visited && /* @__PURE__ */ jsx("span", { className: "text-[10px] text-warning", children: t("dashTakeQuiz") })
                    ]
                  },
                  topic.id
                );
              }) }),
              /* @__PURE__ */ jsx("div", { className: "h-1.5 bg-muted rounded-full overflow-hidden", children: /* @__PURE__ */ jsx(
                "div",
                {
                  className: "h-full bg-secondary rounded-full transition-all",
                  style: { width: `${sec.total ? sec.visited / sec.total * 100 : 0}%` }
                }
              ) }),
              /* @__PURE__ */ jsxs("div", { className: "text-[10px] text-muted-foreground mt-1", children: [
                sec.visited,
                "/",
                sec.total,
                " ",
                t("dashLessonsDoneShort")
              ] })
            ]
          },
          sec.id
        )) })
      ] }),
      completedQuizzes > 0 && /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-4", children: [
          /* @__PURE__ */ jsx("div", { className: "w-1 h-5 bg-warning rounded-full" }),
          /* @__PURE__ */ jsx("h2", { className: "font-bold text-foreground", children: t("dashQuizResults") })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "bg-card border border-border rounded-2xl divide-y divide-border overflow-hidden", children: Object.entries(quizResults).map(([topicId, result]) => {
          const sec = courseData.find((s) => s.topics.some((t2) => t2.id === topicId));
          const topic = sec == null ? void 0 : sec.topics.find((t2) => t2.id === topicId);
          if (!topic) return null;
          return /* @__PURE__ */ jsxs(
            Link,
            {
              to: `/topic/${sec.id}/${topicId}`,
              className: "flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors",
              children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                  /* @__PURE__ */ jsx(Award, { size: 15, className: result.score >= 80 ? "text-warning" : "text-muted-foreground" }),
                  /* @__PURE__ */ jsx("span", { className: "text-sm text-foreground", children: topicTitle(topic) })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsx("div", { className: "w-20 h-2 bg-muted rounded-full overflow-hidden", children: /* @__PURE__ */ jsx(
                    "div",
                    {
                      className: `h-full rounded-full ${result.score >= 80 ? "bg-success" : result.score >= 60 ? "bg-warning" : "bg-destructive"}`,
                      style: { width: `${result.score}%` }
                    }
                  ) }),
                  /* @__PURE__ */ jsxs("span", { className: `text-xs font-bold w-10 text-right ${result.score >= 80 ? "text-success" : result.score >= 60 ? "text-warning" : "text-destructive"}`, children: [
                    result.score,
                    "%"
                  ] })
                ] })
              ]
            },
            topicId
          );
        }) })
      ] }),
      visitedTopics === 0 && completedQuizzes === 0 && /* @__PURE__ */ jsxs("div", { className: "text-center py-12", children: [
        /* @__PURE__ */ jsx(Zap, { size: 40, className: "text-muted-foreground/30 mx-auto mb-3" }),
        /* @__PURE__ */ jsx("p", { className: "text-muted-foreground text-sm", children: t("dashEmptyMsg") }),
        /* @__PURE__ */ jsxs(Link, { to: "/", className: "mt-4 inline-block text-primary text-sm hover:underline font-medium", children: [
          t("dashGoLessons"),
          " ←"
        ] })
      ] })
    ] })
  ] });
}
const totalTopics = courseData.reduce((s, sec) => s + sec.topics.length, 0);
const totalQuizzes = Object.keys(mergedQuizzes).length;
function AdminStudentsReport() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(null);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  useNavigate();
  useEffect(() => {
    (async () => {
      try {
        const user = await base44.auth.me();
        if ((user == null ? void 0 : user.role) !== "admin") {
          setIsAdmin(false);
          return;
        }
        setIsAdmin(true);
        const data = await base44.entities.StudentProgress.list("-last_synced_at", 100);
        setStudents(data || []);
      } catch {
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    })();
  }, []);
  const refresh = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.StudentProgress.list("-last_synced_at", 100);
      setStudents(data || []);
    } finally {
      setLoading(false);
    }
  };
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center min-h-screen", children: /* @__PURE__ */ jsx("div", { className: "w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" }) });
  }
  if (isAdmin === false) {
    return /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center min-h-screen gap-4", children: [
      /* @__PURE__ */ jsx(ShieldAlert, { size: 48, className: "text-red-400" }),
      /* @__PURE__ */ jsx("h2", { className: "text-xl font-bold text-foreground", children: "غير مصرح لك بالوصول" }),
      /* @__PURE__ */ jsx("p", { className: "text-muted-foreground text-sm", children: "هذه الصفحة للمشرفين فقط." }),
      /* @__PURE__ */ jsx(Link, { to: "/", className: "text-primary hover:underline text-sm", children: "العودة للرئيسية" })
    ] });
  }
  const filtered = students.filter(
    (s) => {
      var _a, _b;
      return ((_a = s.student_name) == null ? void 0 : _a.toLowerCase().includes(search.toLowerCase())) || ((_b = s.student_email) == null ? void 0 : _b.toLowerCase().includes(search.toLowerCase()));
    }
  );
  const selectedStudent = selected ? students.find((s) => s.id === selected) : null;
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-background", children: [
    /* @__PURE__ */ jsxs("div", { className: "relative overflow-hidden bg-gradient-to-bl from-slate-900 via-purple-950 to-slate-900", children: [
      /* @__PURE__ */ jsx("div", { className: "absolute inset-0", style: {
        backgroundImage: `linear-gradient(rgba(139,92,246,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.07) 1px, transparent 1px)`,
        backgroundSize: "40px 40px"
      } }),
      /* @__PURE__ */ jsx("div", { className: "relative max-w-6xl mx-auto px-6 py-10", children: /* @__PURE__ */ jsxs(motion.div, { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-purple-300/70 text-sm mb-2", children: [
          /* @__PURE__ */ jsx(Link, { to: "/", className: "hover:text-purple-200 transition-colors", children: "الرئيسية" }),
          /* @__PURE__ */ jsx(ChevronLeft, { size: 13 }),
          /* @__PURE__ */ jsx("span", { className: "text-purple-200", children: "تقارير الطلاب" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h1", { className: "text-3xl font-black text-white mb-1", children: "تقارير الطلاب" }),
            /* @__PURE__ */ jsxs("p", { className: "text-slate-400 text-sm", children: [
              students.length,
              " طالب مسجل — يتحدث تلقائياً"
            ] })
          ] }),
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: refresh,
              className: "flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 text-white text-sm hover:bg-white/20 transition-all",
              children: [
                /* @__PURE__ */ jsx(RefreshCw, { size: 14 }),
                /* @__PURE__ */ jsx("span", { children: "تحديث" })
              ]
            }
          )
        ] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "max-w-6xl mx-auto px-6 py-8", children: students.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "text-center py-16", children: [
      /* @__PURE__ */ jsx(Users, { size: 48, className: "text-muted-foreground/30 mx-auto mb-3" }),
      /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: "لا يوجد طلاب قاموا بمزامنة تقدمهم بعد." })
    ] }) : /* @__PURE__ */ jsxs("div", { className: "flex gap-6", children: [
      /* @__PURE__ */ jsxs("div", { className: `${selectedStudent ? "hidden sm:block sm:w-80" : "w-full"} flex-shrink-0`, children: [
        /* @__PURE__ */ jsxs("div", { className: "relative mb-4", children: [
          /* @__PURE__ */ jsx(Search, { size: 15, className: "absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              value: search,
              onChange: (e) => setSearch(e.target.value),
              placeholder: "ابحث عن طالب...",
              className: "w-full bg-card border border-border rounded-xl px-4 py-2.5 pr-9 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            }
          )
        ] }),
        /* @__PURE__ */ jsx("div", { className: "space-y-2", children: filtered.map((student, i) => /* @__PURE__ */ jsxs(
          motion.button,
          {
            initial: { opacity: 0, x: -10 },
            animate: { opacity: 1, x: 0 },
            transition: { delay: i * 0.04 },
            onClick: () => setSelected(student.id),
            className: `w-full text-right p-4 rounded-2xl border transition-all ${selected === student.id ? "bg-primary/10 border-primary shadow-md" : "bg-card border-border hover:shadow-sm hover:border-primary/30"}`,
            children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-2", children: [
                /* @__PURE__ */ jsx("div", { className: `text-xs font-bold px-2 py-0.5 rounded-full ${(student.avg_quiz_score || 0) >= 80 ? "bg-green-100 text-green-700" : (student.avg_quiz_score || 0) >= 60 ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-500"}`, children: student.avg_quiz_score ? `${student.avg_quiz_score}%` : "—" }),
                /* @__PURE__ */ jsx("div", { className: "font-semibold text-sm text-foreground", children: student.student_name })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground text-right", children: student.student_email }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-end gap-3 mt-2 text-xs text-muted-foreground", children: [
                /* @__PURE__ */ jsxs("span", { children: [
                  student.total_quizzes_completed || 0,
                  "/",
                  totalQuizzes,
                  " اختبار"
                ] }),
                /* @__PURE__ */ jsxs("span", { children: [
                  student.total_topics_visited || 0,
                  "/",
                  totalTopics,
                  " درس"
                ] })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "h-1 bg-muted rounded-full mt-2 overflow-hidden", children: /* @__PURE__ */ jsx(
                "div",
                {
                  className: "h-full bg-gradient-to-r from-primary to-secondary rounded-full",
                  style: { width: `${totalTopics ? (student.total_topics_visited || 0) / totalTopics * 100 : 0}%` }
                }
              ) })
            ]
          },
          student.id
        )) })
      ] }),
      selectedStudent && /* @__PURE__ */ jsxs(
        motion.div,
        {
          initial: { opacity: 0, x: 20 },
          animate: { opacity: 1, x: 0 },
          className: "flex-1 min-w-0",
          children: [
            /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: () => setSelected(null),
                className: "sm:hidden flex items-center gap-1 text-sm text-muted-foreground mb-4",
                children: [
                  /* @__PURE__ */ jsx(ChevronLeft, { size: 14 }),
                  " عودة للقائمة"
                ]
              }
            ),
            /* @__PURE__ */ jsxs("div", { className: "bg-card border border-border rounded-2xl p-6 mb-4", children: [
              /* @__PURE__ */ jsx("div", { className: "flex items-start justify-between mb-4", children: /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("h2", { className: "text-xl font-black text-foreground", children: selectedStudent.student_name }),
                /* @__PURE__ */ jsx("p", { className: "text-muted-foreground text-sm", children: selectedStudent.student_email }),
                selectedStudent.last_synced_at && /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground mt-1 flex items-center gap-1", children: [
                  /* @__PURE__ */ jsx(Clock, { size: 11 }),
                  "آخر تزامن: ",
                  new Date(selectedStudent.last_synced_at).toLocaleString("ar-SA")
                ] })
              ] }) }),
              /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-3", children: [
                { icon: BookOpen, label: "الدروس", val: `${selectedStudent.total_topics_visited || 0}/${totalTopics}`, color: "text-blue-500", bg: "bg-blue-50" },
                { icon: CheckCircle2, label: "الاختبارات", val: `${selectedStudent.total_quizzes_completed || 0}/${totalQuizzes}`, color: "text-green-500", bg: "bg-green-50" },
                { icon: Award, label: "متوسط الدرجات", val: selectedStudent.avg_quiz_score ? `${selectedStudent.avg_quiz_score}%` : "—", color: "text-amber-500", bg: "bg-amber-50" },
                { icon: TrendingUp, label: "نسبة التقدم", val: `${totalTopics ? Math.round((selectedStudent.total_topics_visited || 0) / totalTopics * 100) : 0}%`, color: "text-purple-500", bg: "bg-purple-50" }
              ].map(({ icon: Icon, label, val, color, bg }, i) => /* @__PURE__ */ jsxs("div", { className: `rounded-xl p-3 ${bg}`, children: [
                /* @__PURE__ */ jsx(Icon, { size: 16, className: `${color} mb-1` }),
                /* @__PURE__ */ jsx("div", { className: `text-xl font-black ${color}`, children: val }),
                /* @__PURE__ */ jsx("div", { className: "text-xs text-slate-500", children: label })
              ] }, i)) })
            ] }),
            selectedStudent.quiz_results && Object.keys(selectedStudent.quiz_results).length > 0 && /* @__PURE__ */ jsxs("div", { className: "bg-card border border-border rounded-2xl overflow-hidden mb-4", children: [
              /* @__PURE__ */ jsxs("div", { className: "px-5 py-3 border-b border-border flex items-center gap-2", children: [
                /* @__PURE__ */ jsx(BarChart2, { size: 15, className: "text-primary" }),
                /* @__PURE__ */ jsx("span", { className: "font-semibold text-sm text-foreground", children: "نتائج الاختبارات" })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "divide-y divide-border", children: Object.entries(selectedStudent.quiz_results).map(([topicId, result]) => {
                const sec = courseData.find((s) => s.topics.some((t2) => t2.id === topicId));
                const topic = sec == null ? void 0 : sec.topics.find((t2) => t2.id === topicId);
                if (!topic) return null;
                return /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-5 py-3", children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                    /* @__PURE__ */ jsx(Award, { size: 14, className: result.score >= 80 ? "text-amber-500" : "text-slate-300" }),
                    /* @__PURE__ */ jsx("span", { className: "text-sm text-foreground", children: topic.title })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                    /* @__PURE__ */ jsx("div", { className: "w-20 h-2 bg-muted rounded-full overflow-hidden", children: /* @__PURE__ */ jsx("div", { className: `h-full rounded-full ${result.score >= 80 ? "bg-green-500" : result.score >= 60 ? "bg-amber-400" : "bg-red-400"}`, style: { width: `${result.score}%` } }) }),
                    /* @__PURE__ */ jsxs("span", { className: `text-xs font-bold w-9 text-right ${result.score >= 80 ? "text-green-600" : result.score >= 60 ? "text-amber-600" : "text-red-500"}`, children: [
                      result.score,
                      "%"
                    ] })
                  ] })
                ] }, topicId);
              }) })
            ] }),
            selectedStudent.topic_progress && /* @__PURE__ */ jsxs("div", { className: "bg-card border border-border rounded-2xl overflow-hidden", children: [
              /* @__PURE__ */ jsxs("div", { className: "px-5 py-3 border-b border-border flex items-center gap-2", children: [
                /* @__PURE__ */ jsx(BookOpen, { size: 15, className: "text-secondary" }),
                /* @__PURE__ */ jsx("span", { className: "font-semibold text-sm text-foreground", children: "المواضيع المدروسة" })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "p-4 grid grid-cols-1 sm:grid-cols-2 gap-3", children: courseData.map((sec) => {
                const visitedInSec = sec.topics.filter((t2) => {
                  var _a;
                  return (_a = selectedStudent.topic_progress[t2.id]) == null ? void 0 : _a.visited;
                }).length;
                return /* @__PURE__ */ jsxs("div", { className: "text-sm", children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-1", children: [
                    /* @__PURE__ */ jsx("span", { className: "text-xs font-bold text-foreground", children: sec.title }),
                    /* @__PURE__ */ jsxs("span", { className: "text-xs text-muted-foreground", children: [
                      visitedInSec,
                      "/",
                      sec.topics.length
                    ] })
                  ] }),
                  /* @__PURE__ */ jsx("div", { className: "h-1.5 bg-muted rounded-full overflow-hidden", children: /* @__PURE__ */ jsx(
                    "div",
                    {
                      className: "h-full bg-gradient-to-r from-primary to-secondary rounded-full",
                      style: { width: `${sec.topics.length ? visitedInSec / sec.topics.length * 100 : 0}%` }
                    }
                  ) })
                ] }, sec.id);
              }) })
            ] })
          ]
        },
        selectedStudent.id
      )
    ] }) })
  ] });
}
const simStateKey = (scenarioId) => scenarioId ? `network-simulator-state-s${scenarioId}` : "network-simulator-state";
function getSimNetwork(scenarioId) {
  try {
    const s = JSON.parse(localStorage.getItem(simStateKey(scenarioId)) || "{}");
    return { nodes: s.nodes || [], connections: s.connections || [] };
  } catch {
    return { nodes: [], connections: [] };
  }
}
function ScenarioLab() {
  const [selected, setSelected] = useState(null);
  const [result, setResult] = useState(null);
  const [showHints, setShowHints] = useState(false);
  const [aiTip, setAiTip] = useState("");
  const [loadingTip, setLoadingTip] = useState(false);
  const [dbMap, setDbMap] = useState({});
  const [dbReady, setDbReady] = useState(false);
  const navigate = useNavigate();
  const session = useStudentSession();
  useLang();
  const [searchParams, setSearchParams] = useSearchParams();
  const lessonFilter = searchParams.get("lesson");
  const lessonInfo = lessonFilter ? getLessonInfo(lessonFilter) : null;
  useEffect(() => {
    if (!session) return;
    (async () => {
      try {
        const rows = await studentApi("filter", "LabHistory", {
          query: {},
          sort: "-updated_date",
          limit: 200
        });
        const map = {};
        for (const r of rows || []) {
          map[r.scenario_id] = {
            score: r.score || 0,
            status: r.status,
            tasksCompleted: r.tasks_completed || 0,
            tasksTotal: r.tasks_total || 0,
            completedAt: r.completed_at || r.updated_date
          };
        }
        setDbMap(map);
      } catch {
      } finally {
        setDbReady(true);
      }
    })();
  }, [session == null ? void 0 : session.student_id]);
  const startLab = async (scenario) => {
    var _a;
    if (!session || !scenario) return;
    try {
      await ensureLabRecord(scenario, ((_a = scenario.tasks) == null ? void 0 : _a.length) || 0);
    } catch {
    }
  };
  useEffect(() => {
    if (!dbReady) return;
    const openId = searchParams.get("open");
    if (openId && !selected) {
      const sc = getScenarioById(openId);
      if (sc) {
        setSelected(sc);
        setResult(null);
        setAiTip("");
        setShowHints(false);
        startLab(sc);
      }
    }
  }, [dbReady]);
  const persistEvaluation = async (scenario, res) => {
    if (!session) return;
    try {
      const details = res.details || [];
      let lab2 = await ensureLabRecord(scenario, details.length);
      for (let i = 0; i < details.length; i++) {
        if (details[i].ok) {
          lab2 = await markTaskCompleted({
            lab: lab2,
            scenario,
            taskIndex: i,
            taskLabel: details[i].label
          });
        }
      }
      if (res.passed) {
        const now = (/* @__PURE__ */ new Date()).toISOString();
        await studentApi("update", "LabHistory", {
          id: lab2.id,
          data: {
            status: "completed",
            score: typeof res.score === "number" ? res.score : lab2.score,
            xp_earned: scenario.xp || lab2.xp_earned || 0,
            completed_at: lab2.completed_at || now,
            last_activity_at: now
          }
        });
      }
      setDbMap((prev) => ({
        ...prev,
        [scenario.id]: {
          score: res.score,
          status: res.passed ? "completed" : "partially_completed",
          tasksCompleted: details.filter((d) => d.ok).length,
          tasksTotal: details.length,
          completedAt: res.passed ? (/* @__PURE__ */ new Date()).toISOString() : null
        }
      }));
    } catch {
    }
  };
  const evaluate = () => {
    if (!selected) return;
    const { nodes, connections } = getSimNetwork(selected.id);
    const res = selected.eval(nodes, connections);
    setResult(res);
    if (res.passed) persistEvaluation(selected, res);
  };
  const openInSimulator = () => {
    if (!selected) return;
    localStorage.setItem("active-scenario-id", selected.id);
    navigate("/network-simulator");
  };
  const getAiTip = async () => {
    if (!selected) return;
    setLoadingTip(true);
    setAiTip("");
    try {
      const { nodes, connections } = getSimNetwork(selected.id);
      const prompt = `أنا طالب أحاول إكمال سيناريو: "${selected.title}".
الأهداف: ${selected.objectives.join(", ")}
شبكتي الحالية: ${nodes.length} جهاز، ${connections.length} اتصال.
الأجهزة: ${nodes.map((n) => `${n.type}(${n.label})`).join(", ")}

أعطني تلميحاً واحداً مفيداً بدون إفساد الحل كاملاً. جملتين فقط بالعربية.`;
      const tip = await base44.integrations.Core.InvokeLLM({ prompt });
      setAiTip(tip);
    } catch {
      setAiTip("تعذر الاتصال بالمساعد. تحقق من الاتصال.");
    } finally {
      setLoadingTip(false);
    }
  };
  const completedIds = new Set(
    Object.entries(dbMap).filter(([, v]) => v.status === "completed").map(([id]) => id)
  );
  const completedCount = [...completedIds].filter((id) => SCENARIOS.some((s) => s.id === id)).length;
  const availableBase = SORTED_SCENARIOS.filter((s) => !completedIds.has(s.id));
  const available = lessonFilter ? availableBase.filter((s) => s.lessonId === lessonFilter) : availableBase;
  const backToList = () => {
    setSelected(null);
    setResult(null);
    if (searchParams.get("open")) {
      const next = new URLSearchParams(searchParams);
      next.delete("open");
      setSearchParams(next, { replace: true });
    }
  };
  const diffLabel = (d) => t(DIFF_LABEL_KEYS[d] || "diffMedium");
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-background text-foreground", children: [
    /* @__PURE__ */ jsxs("div", { className: "relative overflow-hidden border-b border-border", style: { background: "#F7F9FC" }, children: [
      /* @__PURE__ */ jsx(
        "div",
        {
          className: "absolute inset-0 pointer-events-none",
          style: { backgroundImage: "linear-gradient(rgba(47,102,144,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(47,102,144,0.05) 1px,transparent 1px)", backgroundSize: "40px 40px" }
        }
      ),
      /* @__PURE__ */ jsx("div", { className: "relative max-w-6xl mx-auto px-6 py-10", children: /* @__PURE__ */ jsxs(motion.div, { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-3 text-sm", style: { color: "rgba(47,102,144,0.75)" }, children: [
          /* @__PURE__ */ jsx(Link, { to: "/", className: "hover:text-primary transition-colors", children: t("backHome") }),
          /* @__PURE__ */ jsx(ChevronLeft, { size: 13 }),
          /* @__PURE__ */ jsx("span", { style: { color: "#173F5F" }, children: t("scenarioLabTitle") })
        ] }),
        /* @__PURE__ */ jsxs("h1", { className: "text-3xl font-black mb-2", style: { color: "#173F5F" }, children: [
          "🧪 ",
          lessonInfo ? t("lessonScenariosTitle") : t("scenarioLabTitle")
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: lessonInfo ? `${t("lessonScenariosDesc")} — ${lessonInfo.lessonTitle}` : t("scenarioLabSubtitle") }),
        /* @__PURE__ */ jsx("p", { className: "text-[10px] mt-1", style: { color: dbReady ? "#2E7D5B" : "rgba(31,41,55,0.5)" }, children: dbReady ? `✓ ${t("syncedNote")}` : t("syncingNote") }),
        /* @__PURE__ */ jsx("p", { className: "text-[10px] mt-0.5", style: { color: "rgba(47,102,144,0.7)" }, children: t("diffSortedNote") }),
        /* @__PURE__ */ jsxs("div", { className: "mt-4 max-w-md", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-[10px] mb-1", children: [
            /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1 font-bold", style: { color: "#2E7D5B" }, children: [
              /* @__PURE__ */ jsx(Trophy, { size: 11 }),
              " ",
              t("completedProgress")
            ] }),
            /* @__PURE__ */ jsxs("span", { className: "font-bold text-muted-foreground", children: [
              completedCount,
              " / ",
              TOTAL_SCENARIOS,
              " ",
              t("ofScenarios")
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "h-1.5 rounded-full", style: { background: "rgba(23,63,95,0.08)" }, children: /* @__PURE__ */ jsx(
            "div",
            {
              className: "h-full rounded-full transition-all duration-700",
              style: { width: `${Math.round(completedCount / TOTAL_SCENARIOS * 100)}%`, background: "#2E7D5B" }
            }
          ) })
        ] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "max-w-6xl mx-auto px-6 py-8", children: !selected ? /* @__PURE__ */ jsxs(Fragment, { children: [
      lessonInfo && /* @__PURE__ */ jsxs(
        Link,
        {
          to: "/scenario-lab",
          className: "inline-flex items-center gap-1.5 mb-5 px-3 py-1.5 rounded-xl text-[11px] font-bold",
          style: { background: "rgba(47,102,144,0.07)", border: "1px solid rgba(47,102,144,0.25)", color: "#2F6690" },
          children: [
            /* @__PURE__ */ jsx(ChevronLeft, { size: 12 }),
            " ",
            t("backToAllScenarios")
          ]
        }
      ),
      available.length === 0 ? (
        /* اكتملت جميع السيناريوهات — لا تعود المكتملة للظهور */
        /* @__PURE__ */ jsxs(
          motion.div,
          {
            initial: { opacity: 0, y: 16 },
            animate: { opacity: 1, y: 0 },
            className: "rounded-2xl p-12 text-center bg-card",
            style: { border: "1px solid rgba(46,125,91,0.35)" },
            children: [
              /* @__PURE__ */ jsx("div", { className: "text-5xl mb-4", children: "🏆" }),
              /* @__PURE__ */ jsx("h2", { className: "text-xl font-black mb-2", style: { color: "#2E7D5B" }, children: t("allCompletedMsg") }),
              /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground mb-6", children: [
                completedCount,
                " / ",
                TOTAL_SCENARIOS,
                " ",
                t("ofScenarios")
              ] }),
              /* @__PURE__ */ jsxs(
                Link,
                {
                  to: "/lab-history",
                  className: "inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-bold text-white",
                  style: { background: "#173F5F" },
                  children: [
                    /* @__PURE__ */ jsx(History, { size: 14 }),
                    " ",
                    t("viewHistory")
                  ]
                }
              )
            ]
          }
        )
      ) : /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-5", children: available.map((sc, i) => {
        const rec = dbMap[sc.id];
        const inProgress = rec && rec.status && rec.status !== "completed";
        const lesson = getLessonInfo(sc.lessonId);
        return /* @__PURE__ */ jsxs(
          motion.div,
          {
            initial: { opacity: 0, y: 20 },
            animate: { opacity: 1, y: 0 },
            transition: { delay: i * 0.05 },
            className: "rounded-2xl p-6 cursor-pointer transition-all hover:shadow-lg hover:-translate-y-0.5 group bg-white",
            style: {
              border: inProgress ? "1px solid rgba(214,158,46,0.45)" : "1px solid #E2E8F0"
            },
            onMouseEnter: (e) => {
              e.currentTarget.style.borderColor = inProgress ? "rgba(214,158,46,0.6)" : "#3A86A8";
            },
            onMouseLeave: (e) => {
              e.currentTarget.style.borderColor = inProgress ? "rgba(214,158,46,0.45)" : "#E2E8F0";
            },
            onClick: () => {
              setSelected(sc);
              setResult(null);
              setAiTip("");
              setShowHints(false);
              startLab(sc);
            },
            children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between mb-4", children: [
                /* @__PURE__ */ jsx("span", { className: "text-3xl", children: sc.icon }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                  inProgress && /* @__PURE__ */ jsxs(
                    "span",
                    {
                      className: "text-[10px] px-2 py-0.5 rounded-full font-bold",
                      style: { background: "rgba(214,158,46,0.1)", color: "#D69E2E", border: "1px solid rgba(214,158,46,0.3)" },
                      children: [
                        "⏳ ",
                        t("continueLabel"),
                        " (",
                        rec.score,
                        "%)"
                      ]
                    }
                  ),
                  !rec && /* @__PURE__ */ jsx(
                    "span",
                    {
                      className: "text-[10px] px-2 py-0.5 rounded-full font-bold",
                      style: { background: "rgba(47,102,144,0.08)", color: "#2F6690", border: "1px solid rgba(47,102,144,0.25)" },
                      children: t("newLabel")
                    }
                  ),
                  /* @__PURE__ */ jsx("span", { className: `text-[10px] border px-2.5 py-0.5 rounded-full font-bold ${sc.diffColor}`, children: diffLabel(sc.difficulty) })
                ] })
              ] }),
              /* @__PURE__ */ jsx("h3", { className: "font-black text-lg mb-2", style: { color: "#173F5F" }, children: sc.title }),
              /* @__PURE__ */ jsx("p", { className: "text-sm mb-3 leading-relaxed", style: { color: "rgba(31,41,55,0.7)" }, children: sc.desc }),
              lesson && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 text-[10px] mb-4", style: { color: "#2F6690" }, children: [
                /* @__PURE__ */ jsx(BookOpen, { size: 11 }),
                " ",
                t("relatedLesson"),
                ": ",
                topicTitleById(lesson.lessonId, lesson.lessonTitle)
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 text-xs text-muted-foreground", children: [
                  /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1.5", children: [
                    /* @__PURE__ */ jsx(Clock, { size: 12 }),
                    " ",
                    sc.time
                  ] }),
                  /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1.5", children: [
                    /* @__PURE__ */ jsx(Zap, { size: 12, className: "text-warning" }),
                    " ",
                    sc.xp,
                    " XP"
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("button", { className: "flex items-center gap-1.5 text-xs font-bold text-secondary group-hover:text-primary transition-colors", children: [
                  /* @__PURE__ */ jsx(Play, { size: 12 }),
                  " ",
                  inProgress ? t("continueLabel") : t("startLabel"),
                  " ",
                  /* @__PURE__ */ jsx(ArrowRight, { size: 11 })
                ] })
              ] })
            ]
          },
          sc.id
        );
      }) })
    ] }) : /* @__PURE__ */ jsxs("div", { className: "max-w-2xl mx-auto", children: [
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: backToList,
          className: "flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6 text-sm group",
          children: [
            /* @__PURE__ */ jsx(ChevronLeft, { size: 16, className: "group-hover:-translate-x-1 transition-transform" }),
            t("backToScenarios")
          ]
        }
      ),
      /* @__PURE__ */ jsxs(
        "div",
        {
          className: "rounded-2xl p-6 mb-4 bg-white",
          style: { border: "1px solid #E2E8F0", boxShadow: "0 1px 4px rgba(23,63,95,0.06)" },
          children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-4", children: [
              /* @__PURE__ */ jsx("span", { className: "text-4xl", children: selected.icon }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("h2", { className: "text-xl font-black", style: { color: "#173F5F" }, children: selected.title }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 flex-wrap mt-1", children: [
                  /* @__PURE__ */ jsxs("span", { className: `text-[10px] border px-2 py-0.5 rounded-full font-bold ${selected.diffColor}`, children: [
                    diffLabel(selected.difficulty),
                    " • ",
                    selected.time,
                    " • ",
                    selected.xp,
                    " XP"
                  ] }),
                  (() => {
                    const lesson = getLessonInfo(selected.lessonId);
                    return lesson ? /* @__PURE__ */ jsxs(
                      Link,
                      {
                        to: `/topic/${lesson.unitId}/${lesson.lessonId}`,
                        className: "text-[10px] flex items-center gap-1 hover:underline",
                        style: { color: "#2F6690" },
                        children: [
                          /* @__PURE__ */ jsx(BookOpen, { size: 10 }),
                          " ",
                          topicTitleById(lesson.lessonId, lesson.lessonTitle)
                        ]
                      }
                    ) : null;
                  })()
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-sm mb-5 leading-relaxed", style: { color: "rgba(31,41,55,0.75)" }, children: selected.desc }),
            (() => {
              const { nodes, connections } = getSimNetwork(selected.id);
              const liveResult = selected.eval(nodes, connections);
              const details = liveResult.details || [];
              const completedCountTasks = details.filter((d) => d.ok).length;
              const totalCount = details.length;
              const pct = totalCount > 0 ? Math.round(completedCountTasks / totalCount * 100) : 0;
              return /* @__PURE__ */ jsxs("div", { className: "mb-5", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-2", children: [
                  /* @__PURE__ */ jsx("h3", { className: "text-xs font-bold uppercase tracking-wider", style: { color: "#2F6690" }, children: t("objectivesTitle") }),
                  /* @__PURE__ */ jsxs("span", { className: "text-[10px] font-bold", style: { color: pct === 100 ? "#2E7D5B" : "#2F6690" }, children: [
                    completedCountTasks,
                    "/",
                    totalCount,
                    " ",
                    t("completedCount")
                  ] })
                ] }),
                /* @__PURE__ */ jsx("div", { className: "h-1 rounded-full mb-3", style: { background: "rgba(23,63,95,0.08)" }, children: /* @__PURE__ */ jsx(
                  "div",
                  {
                    className: "h-full rounded-full transition-all duration-500",
                    style: { width: `${pct}%`, background: pct === 100 ? "#2E7D5B" : "#2F6690" }
                  }
                ) }),
                /* @__PURE__ */ jsx("ul", { className: "space-y-2", children: details.map((d, i) => /* @__PURE__ */ jsxs("li", { className: "flex items-start gap-2 text-sm", children: [
                  d.ok ? /* @__PURE__ */ jsx(CheckCircle2, { size: 14, className: "text-success flex-shrink-0 mt-0.5" }) : /* @__PURE__ */ jsx(AlertCircle, { size: 14, className: "flex-shrink-0 mt-0.5 text-muted-foreground" }),
                  /* @__PURE__ */ jsx("span", { style: { color: d.ok ? "#2E7D5B" : "rgba(31,41,55,0.7)" }, children: d.label })
                ] }, i)) })
              ] });
            })(),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-2", children: [
              /* @__PURE__ */ jsxs(
                "button",
                {
                  onClick: openInSimulator,
                  className: "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-105",
                  style: { background: "#173F5F" },
                  children: [
                    /* @__PURE__ */ jsx(Play, { size: 14 }),
                    " ",
                    t("openInSimulator")
                  ]
                }
              ),
              /* @__PURE__ */ jsxs(
                "button",
                {
                  onClick: evaluate,
                  className: "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-105",
                  style: { background: "#2E7D5B" },
                  children: [
                    /* @__PURE__ */ jsx(Target, { size: 14 }),
                    " ",
                    t("evaluate")
                  ]
                }
              ),
              /* @__PURE__ */ jsxs(
                "button",
                {
                  onClick: () => setShowHints(!showHints),
                  className: "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-105",
                  style: { background: showHints ? "rgba(214,158,46,0.15)" : "rgba(214,158,46,0.08)", border: "1px solid rgba(214,158,46,0.35)", color: "#D69E2E" },
                  children: [
                    /* @__PURE__ */ jsx(Lightbulb, { size: 14 }),
                    " ",
                    t("hints")
                  ]
                }
              ),
              /* @__PURE__ */ jsxs(
                "button",
                {
                  onClick: getAiTip,
                  disabled: loadingTip,
                  className: "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-105 disabled:opacity-60",
                  style: { background: "rgba(47,102,144,0.08)", border: "1px solid rgba(47,102,144,0.3)", color: "#2F6690" },
                  children: [
                    /* @__PURE__ */ jsx(Bot, { size: 14 }),
                    " ",
                    loadingTip ? t("aiThinking") : t("aiHintBtn")
                  ]
                }
              )
            ] })
          ]
        }
      ),
      /* @__PURE__ */ jsx(AnimatePresence, { children: showHints && /* @__PURE__ */ jsxs(
        motion.div,
        {
          initial: { opacity: 0, height: 0 },
          animate: { opacity: 1, height: "auto" },
          exit: { opacity: 0, height: 0 },
          className: "rounded-2xl p-5 mb-4 overflow-hidden",
          style: { background: "rgba(214,158,46,0.05)", border: "1px solid rgba(214,158,46,0.25)" },
          children: [
            /* @__PURE__ */ jsxs("h3", { className: "font-bold text-sm mb-3 flex items-center gap-2", style: { color: "#D69E2E" }, children: [
              /* @__PURE__ */ jsx(Lightbulb, { size: 14 }),
              " ",
              t("hints")
            ] }),
            /* @__PURE__ */ jsx("ul", { className: "space-y-2", children: selected.hints.map((h, i) => /* @__PURE__ */ jsxs("li", { className: "flex items-start gap-2 text-sm", style: { color: "rgba(31,41,55,0.75)" }, children: [
              /* @__PURE__ */ jsx("span", { className: "flex-shrink-0 mt-0.5", style: { color: "#D69E2E" }, children: "•" }),
              " ",
              h
            ] }, i)) })
          ]
        }
      ) }),
      /* @__PURE__ */ jsx(AnimatePresence, { children: aiTip && /* @__PURE__ */ jsxs(
        motion.div,
        {
          initial: { opacity: 0, y: 10 },
          animate: { opacity: 1, y: 0 },
          exit: { opacity: 0 },
          className: "rounded-2xl p-5 mb-4",
          style: { background: "rgba(47,102,144,0.05)", border: "1px solid rgba(47,102,144,0.25)" },
          children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
              /* @__PURE__ */ jsx(Bot, { size: 14, className: "text-secondary" }),
              /* @__PURE__ */ jsx("h3", { className: "text-secondary font-bold text-sm", children: t("aiHintBtn") })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-sm leading-relaxed", style: { color: "rgba(31,41,55,0.8)" }, children: aiTip })
          ]
        }
      ) }),
      /* @__PURE__ */ jsx(AnimatePresence, { children: result && /* @__PURE__ */ jsxs(
        motion.div,
        {
          initial: { opacity: 0, scale: 0.95 },
          animate: { opacity: 1, scale: 1 },
          className: "rounded-2xl p-6",
          style: {
            background: result.passed ? "rgba(46,125,91,0.06)" : "rgba(201,76,76,0.06)",
            border: `1px solid ${result.passed ? "rgba(46,125,91,0.35)" : "rgba(201,76,76,0.35)"}`
          },
          children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 mb-4", children: [
              /* @__PURE__ */ jsxs(
                "div",
                {
                  className: "w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-black",
                  style: { background: result.passed ? "#2E7D5B" : "#C94C4C", color: "white" },
                  children: [
                    result.score,
                    "%"
                  ]
                }
              ),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("h3", { className: "text-lg font-black", style: { color: result.passed ? "#2E7D5B" : "#C94C4C" }, children: result.passed ? `🎉 ${t("passedMsg")}` : `❌ ${t("failedMsg")}` }),
                /* @__PURE__ */ jsx("p", { className: "text-sm", style: { color: "rgba(31,41,55,0.75)" }, children: result.feedback }),
                result.passed && /* @__PURE__ */ jsxs("p", { className: "text-[10px] mt-1", style: { color: "#2E7D5B" }, children: [
                  "→ ",
                  /* @__PURE__ */ jsx(Link, { to: "/lab-history", className: "underline", children: t("viewHistory") })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "space-y-2", children: result.details.map((d, i) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm", children: [
              d.ok ? /* @__PURE__ */ jsx(CheckCircle2, { size: 14, className: "text-success" }) : /* @__PURE__ */ jsx(AlertCircle, { size: 14, className: "text-destructive" }),
              /* @__PURE__ */ jsx("span", { style: { color: d.ok ? "#2E7D5B" : "#C94C4C" }, children: d.label })
            ] }, i)) })
          ]
        }
      ) })
    ] }) })
  ] });
}
const STATUS_MAP = {
  completed: { key: "stCompleted", color: "#2E7D5B", bg: "rgba(46,125,91,0.10)", border: "rgba(46,125,91,0.35)" },
  partially_completed: { key: "stPartial", color: "#D69E2E", bg: "rgba(214,158,46,0.10)", border: "rgba(214,158,46,0.35)" },
  in_progress: { key: "stInProgress", color: "#2F6690", bg: "rgba(47,102,144,0.10)", border: "rgba(47,102,144,0.3)" },
  not_started: { key: "stNotStarted", color: "#64748B", bg: "rgba(100,116,139,0.10)", border: "rgba(100,116,139,0.3)" }
};
function formatDate(d) {
  if (!d) return "—";
  return moment(d).format("YYYY/MM/DD — HH:mm");
}
function LabHistory() {
  const session = useStudentSession();
  useLang();
  const [records, setRecords] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const load = async () => {
    setRefreshing(true);
    try {
      const rows = await studentApi("filter", "LabHistory", {
        query: {},
        sort: "-last_activity_at",
        limit: 100
      });
      setRecords(rows || []);
    } catch {
      setRecords([]);
    }
    setRefreshing(false);
  };
  useEffect(() => {
    load();
  }, [session == null ? void 0 : session.student_id]);
  const completedCount = (records == null ? void 0 : records.filter((r) => r.status === "completed").length) || 0;
  const totalXp = (records == null ? void 0 : records.reduce((a, r) => a + (r.xp_earned || 0), 0)) || 0;
  const avgScore = (records == null ? void 0 : records.length) ? Math.round(records.reduce((a, r) => a + (r.score || 0), 0) / records.length) : 0;
  return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-background text-foreground", dir: "rtl", children: /* @__PURE__ */ jsxs("div", { className: "max-w-6xl mx-auto px-4 py-8", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx(
          "div",
          {
            className: "w-11 h-11 rounded-xl flex items-center justify-center",
            style: { background: "#173F5F" },
            children: /* @__PURE__ */ jsx(History, { className: "text-white", size: 20 })
          }
        ),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "font-black text-xl", children: t("historyTitle") }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: t("historySubtitle") })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: load,
          disabled: refreshing,
          className: "flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-50",
          style: { border: "1px solid hsl(var(--border))", color: "hsl(var(--primary))" },
          children: [
            refreshing ? /* @__PURE__ */ jsx(Loader2, { size: 13, className: "animate-spin" }) : /* @__PURE__ */ jsx(RefreshCw, { size: 13 }),
            t("refresh")
          ]
        }
      )
    ] }),
    records && records.length > 0 && /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6", children: [
      { label: t("totalAttempts"), value: records.length, icon: /* @__PURE__ */ jsx(FlaskConical, { size: 16 }), color: "#2F6690" },
      { label: t("completedScenarios"), value: completedCount, icon: /* @__PURE__ */ jsx(CheckCircle2, { size: 16 }), color: "#2E7D5B" },
      { label: t("totalXp"), value: totalXp, icon: /* @__PURE__ */ jsx(Zap, { size: 16 }), color: "#D69E2E" },
      { label: t("avgScore"), value: `${avgScore}%`, icon: /* @__PURE__ */ jsx(Trophy, { size: 16 }), color: "#173F5F" }
    ].map((s) => /* @__PURE__ */ jsxs("div", { className: "rounded-2xl p-4 bg-card", style: { border: "1px solid hsl(var(--border))" }, children: [
      /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2 mb-1.5", style: { color: s.color }, children: s.icon }),
      /* @__PURE__ */ jsx("div", { className: "text-xl font-black", children: s.value }),
      /* @__PURE__ */ jsx("div", { className: "text-[10px] text-muted-foreground", children: s.label })
    ] }, s.label)) }),
    records === null && /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center py-24 gap-3", children: [
      /* @__PURE__ */ jsx(Loader2, { size: 32, className: "animate-spin", style: { color: "hsl(var(--primary))" } }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: t("loadingHistory") })
    ] }),
    records && records.length === 0 && /* @__PURE__ */ jsxs(
      motion.div,
      {
        initial: { opacity: 0, y: 16 },
        animate: { opacity: 1, y: 0 },
        className: "rounded-2xl p-10 text-center bg-card",
        style: { border: "1px solid hsl(var(--border))" },
        children: [
          /* @__PURE__ */ jsx(FlaskConical, { size: 44, className: "mx-auto mb-4 opacity-40", style: { color: "hsl(var(--primary))" } }),
          /* @__PURE__ */ jsx("h2", { className: "font-black text-lg mb-1", children: t("noAttempts") }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mb-5", children: t("noAttemptsDesc") }),
          /* @__PURE__ */ jsxs(
            Link,
            {
              to: "/scenario-lab",
              className: "inline-block px-5 py-2.5 rounded-xl text-sm font-bold text-white",
              style: { background: "linear-gradient(90deg,#0891b2,#7c3aed)" },
              children: [
                t("startNow"),
                " 🚀"
              ]
            }
          )
        ]
      }
    ),
    records && records.length > 0 && /* @__PURE__ */ jsx("div", { className: "space-y-3", children: records.map((r, idx) => {
      const scenario = SCENARIOS.find((s) => s.id === r.scenario_id);
      const lesson = scenario ? getLessonInfo(scenario.lessonId) : null;
      const st = STATUS_MAP[r.status] || STATUS_MAP.in_progress;
      const total = r.tasks_total || 0;
      const done = r.tasks_completed || 0;
      const pct = total > 0 ? Math.round(done / total * 100) : 0;
      return /* @__PURE__ */ jsxs(
        motion.div,
        {
          initial: { opacity: 0, y: 10 },
          animate: { opacity: 1, y: 0 },
          transition: { delay: idx * 0.04 },
          className: "rounded-2xl p-4 bg-card flex flex-col sm:flex-row sm:items-center gap-4",
          style: { border: "1px solid hsl(var(--border))" },
          children: [
            /* @__PURE__ */ jsx(
              "div",
              {
                className: "w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0",
                style: { background: "rgba(47,102,144,0.08)", border: "1px solid rgba(47,102,144,0.25)" },
                children: (scenario == null ? void 0 : scenario.icon) || "🧪"
              }
            ),
            /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 flex-wrap mb-1", children: [
                /* @__PURE__ */ jsx("span", { className: "font-bold text-sm truncate", children: r.scenario_title || (scenario == null ? void 0 : scenario.title) || r.scenario_id }),
                /* @__PURE__ */ jsx(
                  "span",
                  {
                    className: "text-[9px] font-bold px-2 py-0.5 rounded-full",
                    style: { background: st.bg, border: `1px solid ${st.border}`, color: st.color },
                    children: t(st.key)
                  }
                ),
                r.scenario_difficulty && /* @__PURE__ */ jsx("span", { className: "text-[9px] text-muted-foreground", children: r.scenario_difficulty }),
                lesson && /* @__PURE__ */ jsxs("span", { className: "text-[9px] text-muted-foreground", children: [
                  "📖 ",
                  t("lessonLabel"),
                  ": ",
                  topicTitleById(lesson.lessonId, lesson.lessonTitle)
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-2", children: [
                /* @__PURE__ */ jsx("div", { className: "flex-1 h-1.5 rounded-full", style: { background: "rgba(23,63,95,0.08)" }, children: /* @__PURE__ */ jsx(
                  "div",
                  {
                    className: "h-full rounded-full",
                    style: {
                      width: `${pct}%`,
                      background: r.status === "completed" ? "#2E7D5B" : "#2F6690"
                    }
                  }
                ) }),
                /* @__PURE__ */ jsxs("span", { className: "text-[10px] font-bold flex-shrink-0", style: { color: st.color }, children: [
                  done,
                  "/",
                  total,
                  " ",
                  t("tasksLabel")
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "text-[10px] text-muted-foreground leading-relaxed", children: [
                t("startedAtLabel"),
                ": ",
                formatDate(r.started_at),
                " • ",
                t("lastActivityLabel"),
                ": ",
                formatDate(r.last_activity_at),
                r.status === "completed" && r.completed_at && /* @__PURE__ */ jsxs(Fragment, { children: [
                  " • ",
                  /* @__PURE__ */ jsxs("span", { style: { color: "#2E7D5B" }, children: [
                    t("completedAtLabel"),
                    ": ",
                    formatDate(r.completed_at)
                  ] })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 flex-shrink-0", children: [
              /* @__PURE__ */ jsxs("div", { className: "px-3 py-1.5 rounded-xl text-center", style: { background: "rgba(47,102,144,0.08)", border: "1px solid rgba(47,102,144,0.25)" }, children: [
                /* @__PURE__ */ jsxs("div", { className: "text-sm font-black", style: { color: "#2F6690" }, children: [
                  r.score || 0,
                  "%"
                ] }),
                /* @__PURE__ */ jsx("div", { className: "text-[8px] text-muted-foreground", children: t("scoreLabel") })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "px-3 py-1.5 rounded-xl text-center", style: { background: "rgba(214,158,46,0.1)", border: "1px solid rgba(214,158,46,0.3)" }, children: [
                /* @__PURE__ */ jsxs("div", { className: "text-sm font-black", style: { color: "#D69E2E" }, children: [
                  "+",
                  r.xp_earned || 0
                ] }),
                /* @__PURE__ */ jsx("div", { className: "text-[8px] text-muted-foreground", children: "XP" })
              ] }),
              r.status !== "completed" && /* @__PURE__ */ jsx(
                Link,
                {
                  to: "/scenario-lab",
                  className: "px-3 py-2 rounded-xl text-[10px] font-bold text-white whitespace-nowrap",
                  style: { background: "#173F5F" },
                  children: t("continueLabel")
                }
              )
            ] })
          ]
        },
        r.id
      );
    }) })
  ] }) });
}
const GENERAL_SCHOOL = "general";
async function resolveAdminSchool(user) {
  var _a;
  if (user == null ? void 0 : user.school_id) return user.school_id;
  try {
    const schools = await base44.entities.School.filter({ admin_email: user == null ? void 0 : user.email });
    return ((_a = schools == null ? void 0 : schools[0]) == null ? void 0 : _a.id) || null;
  } catch {
    return null;
  }
}
const REQ_STATUS = {
  pending: { label: "بانتظار الموافقة", color: "#D69E2E", bg: "rgba(214,158,46,0.1)", border: "rgba(214,158,46,0.35)" },
  rejected: { color: "#C94C4C", bg: "rgba(201,76,76,0.1)", border: "rgba(201,76,76,0.35)" }
};
function Exams() {
  const session = useStudentSession();
  const [loading, setLoading] = useState(true);
  const [exams, setExams] = useState([]);
  const [requests, setRequests] = useState([]);
  const [results, setResults] = useState([]);
  const [schoolId, setSchoolId] = useState(GENERAL_SCHOOL);
  const [requesting, setRequesting] = useState(null);
  useEffect(() => {
    (async () => {
      try {
        const sid = (session == null ? void 0 : session.school_id) || GENERAL_SCHOOL;
        setSchoolId(sid);
        const [ex, rq, rs] = await Promise.all([
          studentApi("filter", "Exam", { query: {}, sort: "-created_date", limit: 100 }),
          studentApi("filter", "ExamAccessRequest", { query: {} }),
          studentApi("filter", "ExamResult", { query: {}, sort: "-submission_time", limit: 100 })
        ]);
        setExams(ex || []);
        setRequests(rq || []);
        setResults(rs || []);
      } catch {
        setExams([]);
      }
      setLoading(false);
    })();
  }, [session == null ? void 0 : session.student_id]);
  const visibleExams = exams.filter(
    (e) => !e.school_id || e.school_id === GENERAL_SCHOOL || e.school_id === schoolId
  );
  const requestAccess = async (exam) => {
    setRequesting(exam.id);
    await studentApi("create", "ExamAccessRequest", {
      data: {
        student_name: (session == null ? void 0 : session.student_name) || (session == null ? void 0 : session.student_code),
        student_email: session == null ? void 0 : session.student_code,
        exam_id: exam.id,
        exam_title: exam.title,
        status: "pending"
      }
    });
    const rq = await studentApi("filter", "ExamAccessRequest", { query: {} });
    setRequests(rq || []);
    setRequesting(null);
  };
  if (loading) {
    return /* @__PURE__ */ jsxs("div", { className: "min-h-screen flex flex-col items-center justify-center gap-3 bg-background", children: [
      /* @__PURE__ */ jsx(Loader2, { size: 32, className: "animate-spin", style: { color: "hsl(var(--primary))" } }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "جاري تحميل الامتحانات..." })
    ] });
  }
  return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-background text-foreground", dir: "rtl", children: /* @__PURE__ */ jsxs("div", { className: "max-w-6xl mx-auto px-4 py-8", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-6", children: [
      /* @__PURE__ */ jsx(
        "div",
        {
          className: "w-11 h-11 rounded-xl flex items-center justify-center",
          style: { background: "#173F5F" },
          children: /* @__PURE__ */ jsx(ClipboardList, { className: "text-white", size: 20 })
        }
      ),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "font-black text-xl", children: "الامتحانات" }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "اطلب دخولاً للامتحان، وبعد موافقة المعلم ابدأ التأدية" })
      ] })
    ] }),
    visibleExams.length === 0 && /* @__PURE__ */ jsxs("div", { className: "rounded-2xl p-10 text-center bg-card", style: { border: "1px solid hsl(var(--border))" }, children: [
      /* @__PURE__ */ jsx(FileQuestion, { size: 44, className: "mx-auto mb-4 opacity-40", style: { color: "hsl(var(--primary))" } }),
      /* @__PURE__ */ jsx("h2", { className: "font-black text-lg mb-1", children: "لا توجد امتحانات متاحة حالياً" }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "سيتعين عليك الانتظار حتى ينشر المعلم امتحاناً جديد" })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "grid gap-3", children: visibleExams.map((exam, i) => {
      var _a;
      const myRequests = requests.filter((r) => r.exam_id === exam.id);
      const lastRequest = myRequests[myRequests.length - 1];
      const myResults = results.filter((r) => r.exam_id === exam.id);
      const bestResult = myResults.length ? myResults.reduce((a, b) => (a.percentage || 0) >= (b.percentage || 0) ? a : b) : null;
      return /* @__PURE__ */ jsxs(
        motion.div,
        {
          initial: { opacity: 0, y: 10 },
          animate: { opacity: 1, y: 0 },
          transition: { delay: i * 0.04 },
          className: "rounded-2xl p-4 bg-card flex flex-col sm:flex-row sm:items-center gap-4",
          style: { border: "1px solid hsl(var(--border))" },
          children: [
            /* @__PURE__ */ jsx(
              "div",
              {
                className: "w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0",
                style: { background: "rgba(47,102,144,0.08)", border: "1px solid rgba(47,102,144,0.2)" },
                children: "📋"
              }
            ),
            /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 flex-wrap mb-1", children: [
                /* @__PURE__ */ jsx("span", { className: "font-bold text-sm", children: exam.title }),
                exam.section_title && /* @__PURE__ */ jsxs("span", { className: "text-[10px] text-muted-foreground", children: [
                  exam.section_title,
                  " › ",
                  exam.topic_title
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 text-[10px] text-muted-foreground flex-wrap", children: [
                /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
                  /* @__PURE__ */ jsx(FileQuestion, { size: 10 }),
                  " ",
                  ((_a = exam.questions) == null ? void 0 : _a.length) || 0,
                  " سؤال"
                ] }),
                exam.duration_minutes && /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
                  /* @__PURE__ */ jsx(Clock, { size: 10 }),
                  " ",
                  exam.duration_minutes,
                  " دقيقة"
                ] }),
                bestResult && /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1 font-bold", style: { color: "#2E7D5B" }, children: [
                  /* @__PURE__ */ jsx(Trophy, { size: 10 }),
                  " أفضل نتيجة: ",
                  bestResult.percentage,
                  "%",
                  /* @__PURE__ */ jsxs("span", { className: "text-muted-foreground font-normal", children: [
                    "(",
                    moment(bestResult.submission_time).format("YYYY/MM/DD"),
                    ")"
                  ] })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 flex-shrink-0", children: [
              bestResult && /* @__PURE__ */ jsxs(
                "span",
                {
                  className: "px-3 py-1.5 rounded-xl text-[10px] font-bold flex items-center gap-1",
                  style: { background: "rgba(46,125,91,0.08)", border: "1px solid rgba(46,125,91,0.3)", color: "#2E7D5B" },
                  children: [
                    /* @__PURE__ */ jsx(CheckCircle2, { size: 11 }),
                    " مؤدّى"
                  ]
                }
              ),
              !lastRequest && !bestResult && /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => requestAccess(exam),
                  disabled: requesting === exam.id,
                  className: "px-4 py-2 rounded-xl text-xs font-bold text-white whitespace-nowrap disabled:opacity-60",
                  style: { background: "#173F5F" },
                  children: requesting === exam.id ? "جاري الإرسال..." : /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1.5", children: [
                    /* @__PURE__ */ jsx(Send, { size: 12 }),
                    " طلب دخول"
                  ] })
                }
              ),
              (lastRequest == null ? void 0 : lastRequest.status) === "pending" && /* @__PURE__ */ jsxs(
                "span",
                {
                  className: "px-3 py-2 rounded-xl text-[10px] font-bold",
                  style: { background: REQ_STATUS.pending.bg, border: `1px solid ${REQ_STATUS.pending.border}`, color: REQ_STATUS.pending.color },
                  children: [
                    REQ_STATUS.pending.label,
                    " ⏳"
                  ]
                }
              ),
              (lastRequest == null ? void 0 : lastRequest.status) === "rejected" && /* @__PURE__ */ jsxs(
                "span",
                {
                  className: "px-3 py-2 rounded-xl text-[10px] font-bold flex items-center gap-1",
                  style: { background: REQ_STATUS.rejected.bg, border: `1px solid ${REQ_STATUS.rejected.border}`, color: REQ_STATUS.rejected.color },
                  children: [
                    /* @__PURE__ */ jsx(Ban, { size: 11 }),
                    " تم الرفض"
                  ]
                }
              ),
              (lastRequest == null ? void 0 : lastRequest.status) === "approved" && !bestResult && /* @__PURE__ */ jsx(
                Link,
                {
                  to: `/exams/${exam.id}`,
                  className: "px-4 py-2 rounded-xl text-xs font-bold text-white whitespace-nowrap",
                  style: { background: "#2E7D5B" },
                  children: "ابدأ الامتحان 🚀"
                }
              ),
              (lastRequest == null ? void 0 : lastRequest.status) === "approved" && bestResult && /* @__PURE__ */ jsx(
                Link,
                {
                  to: `/exams/${exam.id}`,
                  className: "px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap",
                  style: { background: "rgba(47,102,144,0.08)", border: "1px solid rgba(47,102,144,0.3)", color: "#2F6690" },
                  children: "إعادة التأدية"
                }
              )
            ] })
          ]
        },
        exam.id
      );
    }) })
  ] }) });
}
const norm = (s) => (s || "").toString().trim().replace(/\s+/g, " ").toLowerCase();
function fmtTime(s) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}
function TakeExam() {
  const { examId } = useParams();
  const session = useStudentSession();
  const [exam, setExam] = useState(null);
  const [allowed, setAllowed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({});
  const [secondsLeft, setSecondsLeft] = useState(null);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [schoolId, setSchoolId] = useState("general");
  const answersRef = useRef({});
  const submittingRef = useRef(false);
  const startedAtRef = useRef(/* @__PURE__ */ new Date());
  useEffect(() => {
    if (!examId) return;
    (async () => {
      const ex = await studentApi("get", "Exam", { id: examId }).catch(() => null);
      setSchoolId((session == null ? void 0 : session.school_id) || "general");
      if (!ex || ex.status !== "published") {
        setLoading(false);
        return;
      }
      const reqs = await studentApi("filter", "ExamAccessRequest", {
        query: { exam_id: examId }
      }).catch(() => []);
      const ok = (reqs || []).some((r) => r.status === "approved");
      setExam(ex);
      setAllowed(ok);
      if (ok) setSecondsLeft((ex.duration_minutes || 30) * 60);
      setLoading(false);
    })();
  }, [session == null ? void 0 : session.student_id, examId]);
  const setAnswer = (i, val) => {
    answersRef.current = { ...answersRef.current, [i]: val };
    setAnswers(answersRef.current);
  };
  const submit = useCallback(async () => {
    if (submittingRef.current || !exam) return;
    submittingRef.current = true;
    setSubmitting(true);
    const qs2 = exam.questions || [];
    let correct = 0;
    const review = {};
    qs2.forEach((q, i) => {
      const given = answersRef.current[i] ?? "";
      const isCorrect = q.type === "short" ? !!norm(given) && norm(given) === norm(q.answer) : !!given && given === q.answer;
      if (isCorrect) correct++;
      review[String(i)] = {
        question: q.text,
        type: q.type,
        given: given || "—",
        model_answer: q.answer,
        is_correct: isCorrect
      };
    });
    const total = qs2.length;
    const pct = total ? Math.round(correct / total * 100) : 0;
    const now = (/* @__PURE__ */ new Date()).toISOString();
    await studentApi("create", "ExamResult", {
      data: {
        student_name: (session == null ? void 0 : session.student_name) || (session == null ? void 0 : session.student_code),
        student_email: session == null ? void 0 : session.student_code,
        exam_id: exam.id,
        exam_title: exam.title,
        score: pct,
        percentage: pct,
        total_questions: total,
        correct_answers: correct,
        wrong_answers: total - correct,
        answers: review,
        start_time: startedAtRef.current.toISOString(),
        submission_time: now,
        status: "submitted"
      }
    });
    setResult({ pct, correct, total, review });
  }, [exam, session, schoolId]);
  useEffect(() => {
    if (loading || result || secondsLeft === null) return;
    if (secondsLeft <= 0) {
      submit();
      return;
    }
    const t2 = setTimeout(() => setSecondsLeft((s) => s - 1), 1e3);
    return () => clearTimeout(t2);
  }, [secondsLeft, loading, result, submit]);
  const confirmSubmit = () => {
    const unanswered = ((exam == null ? void 0 : exam.questions) || []).length - Object.keys(answers).length;
    if (unanswered > 0 && !confirm(`لديك ${unanswered} سؤال بدون إجابة. هل تريد التسليم الآن؟`)) return;
    submit();
  };
  if (loading) {
    return /* @__PURE__ */ jsxs("div", { className: "min-h-screen flex flex-col items-center justify-center gap-3 bg-background", children: [
      /* @__PURE__ */ jsx(Loader2, { size: 32, className: "animate-spin", style: { color: "hsl(var(--primary))" } }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "جاري تحضير الامتحان..." })
    ] });
  }
  if (!exam) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen flex items-center justify-center bg-background", dir: "rtl", children: /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsx(AlertTriangle, { size: 36, className: "text-red-400 mx-auto mb-3" }),
      /* @__PURE__ */ jsx("h2", { className: "font-black text-lg mb-2", children: "الامتحان غير موجود" }),
      /* @__PURE__ */ jsx(Link, { to: "/exams", className: "text-xs font-bold", style: { color: "hsl(var(--primary))" }, children: "العودة للامتحانات" })
    ] }) });
  }
  if (!allowed) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen flex items-center justify-center bg-background", dir: "rtl", children: /* @__PURE__ */ jsxs("div", { className: "text-center max-w-sm", children: [
      /* @__PURE__ */ jsx(AlertTriangle, { size: 36, className: "text-amber-400 mx-auto mb-3" }),
      /* @__PURE__ */ jsx("h2", { className: "font-black text-lg mb-2", children: "لا تملك موافقة دخول بعد" }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mb-5", children: "أرسل طلب دخول من صفحة الامتحانات وبعد موافقة المعلم يمكنك التأدية." }),
      /* @__PURE__ */ jsx(
        Link,
        {
          to: "/exams",
          className: "px-5 py-2.5 rounded-xl text-sm font-bold text-white inline-block",
          style: { background: "linear-gradient(90deg,#0891b2,#7c3aed)" },
          children: "طلب دخول"
        }
      )
    ] }) });
  }
  if (result) {
    const passed = result.pct >= 60;
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-background text-foreground", dir: "rtl", children: /* @__PURE__ */ jsxs("div", { className: "max-w-3xl mx-auto px-4 py-8", children: [
      /* @__PURE__ */ jsxs(
        motion.div,
        {
          initial: { opacity: 0, scale: 0.94 },
          animate: { opacity: 1, scale: 1 },
          className: "rounded-2xl p-8 text-center mb-6",
          style: {
            background: passed ? "linear-gradient(135deg,rgba(5,150,105,0.15),rgba(52,211,153,0.08))" : "linear-gradient(135deg,rgba(239,68,68,0.12),rgba(245,158,11,0.06))",
            border: `1px solid ${passed ? "rgba(52,211,153,0.4)" : "rgba(239,68,68,0.35)"}`
          },
          children: [
            /* @__PURE__ */ jsxs("div", { className: "text-5xl font-black mb-1", style: { color: passed ? "#34d399" : "#f87171" }, children: [
              result.pct,
              "%"
            ] }),
            /* @__PURE__ */ jsx("div", { className: "font-black text-lg mb-1", children: passed ? "🎉 ناجح — أحسنت!" : "لم تجتز — راجع الأخطاء" }),
            /* @__PURE__ */ jsxs("div", { className: "text-xs text-muted-foreground", children: [
              result.correct,
              " إجابة صحيحة من ",
              result.total,
              " سؤال — النتيجة محفوظة في سجلك"
            ] })
          ]
        }
      ),
      /* @__PURE__ */ jsx("h3", { className: "font-black text-sm mb-3", children: "مراجعة الإجابات" }),
      /* @__PURE__ */ jsx("div", { className: "space-y-2 mb-6", children: (exam.questions || []).map((q, i) => {
        const r = result.review[String(i)];
        const ok = r == null ? void 0 : r.is_correct;
        return /* @__PURE__ */ jsx(
          "div",
          {
            className: "rounded-xl p-3.5 bg-card",
            style: { border: `1px solid ${ok ? "rgba(52,211,153,0.3)" : "rgba(239,68,68,0.3)"}` },
            children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2", children: [
              ok ? /* @__PURE__ */ jsx(CheckCircle2, { size: 14, className: "text-green-400 mt-0.5 flex-shrink-0" }) : /* @__PURE__ */ jsx(XCircle, { size: 14, className: "text-red-400 mt-0.5 flex-shrink-0" }),
              /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
                /* @__PURE__ */ jsxs("div", { className: "text-xs font-bold mb-1.5", children: [
                  i + 1,
                  ". ",
                  q.text
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "text-[11px] flex flex-wrap gap-x-4 gap-y-1", children: [
                  /* @__PURE__ */ jsxs("span", { className: "text-muted-foreground", children: [
                    "إجابتك: ",
                    /* @__PURE__ */ jsx("span", { className: ok ? "text-green-400" : "text-red-400", children: r == null ? void 0 : r.given })
                  ] }),
                  !ok && /* @__PURE__ */ jsxs("span", { className: "text-muted-foreground", children: [
                    "الإجابة الصحيحة: ",
                    /* @__PURE__ */ jsx("span", { className: "text-green-400", children: q.answer })
                  ] })
                ] })
              ] })
            ] })
          },
          i
        );
      }) }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsx(
          Link,
          {
            to: "/exams",
            className: "flex-1 py-2.5 rounded-xl text-xs font-bold text-center",
            style: { border: "1px solid hsl(var(--border))", color: "hsl(var(--primary))" },
            children: "جميع الامتحانات"
          }
        ),
        /* @__PURE__ */ jsx(
          Link,
          {
            to: "/dashboard",
            className: "flex-1 py-2.5 rounded-xl text-xs font-bold text-white text-center",
            style: { background: "linear-gradient(90deg,#0891b2,#7c3aed)" },
            children: "لوحة التقدم"
          }
        )
      ] })
    ] }) });
  }
  const qs = exam.questions || [];
  const answeredCount = Object.keys(answers).length;
  const timeDanger = secondsLeft !== null && secondsLeft <= 60;
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-background text-foreground", dir: "rtl", children: [
    /* @__PURE__ */ jsxs(
      "div",
      {
        className: "sticky top-0 z-20 px-4 py-3 flex items-center justify-between gap-3 flex-wrap",
        style: { background: "rgba(2,6,23,0.98)", borderBottom: "1px solid rgba(6,182,212,0.15)" },
        children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 min-w-0", children: [
            /* @__PURE__ */ jsx("span", { className: "font-black text-xs truncate", children: exam.title }),
            /* @__PURE__ */ jsxs("span", { className: "text-[10px] text-muted-foreground", children: [
              "(",
              answeredCount,
              "/",
              qs.length,
              " تمت الإجابة)"
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsxs(
              "span",
              {
                className: "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-black font-mono",
                style: {
                  background: timeDanger ? "rgba(239,68,68,0.12)" : "rgba(6,182,212,0.1)",
                  border: `1px solid ${timeDanger ? "rgba(239,68,68,0.4)" : "rgba(6,182,212,0.3)"}`,
                  color: timeDanger ? "#f87171" : "#06b6d4"
                },
                children: [
                  /* @__PURE__ */ jsx(Clock, { size: 13 }),
                  " ",
                  fmtTime(secondsLeft ?? 0)
                ]
              }
            ),
            /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: confirmSubmit,
                disabled: submitting,
                className: "flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold text-white disabled:opacity-60",
                style: { background: "linear-gradient(90deg,#059669,#10b981)" },
                children: [
                  submitting ? /* @__PURE__ */ jsx(Loader2, { size: 12, className: "animate-spin" }) : /* @__PURE__ */ jsx(Send, { size: 12 }),
                  "تسليم"
                ]
              }
            )
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "max-w-3xl mx-auto px-4 py-6 space-y-4", children: [
      qs.map((q, i) => /* @__PURE__ */ jsxs(
        motion.div,
        {
          initial: { opacity: 0, y: 8 },
          animate: { opacity: 1, y: 0 },
          transition: { delay: i * 0.03 },
          className: "rounded-2xl p-5 bg-card",
          style: { border: "1px solid hsl(var(--border))" },
          children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2 mb-4", children: [
              /* @__PURE__ */ jsx(
                "span",
                {
                  className: "w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-black flex-shrink-0",
                  style: { background: "rgba(6,182,212,0.12)", color: "#06b6d4" },
                  children: i + 1
                }
              ),
              /* @__PURE__ */ jsx("span", { className: "text-sm font-bold leading-relaxed", children: q.text })
            ] }),
            q.type === "mcq" && /* @__PURE__ */ jsx("div", { className: "space-y-2", children: (q.options || []).map((opt, oi) => {
              const selected = answers[i] === opt;
              return /* @__PURE__ */ jsxs(
                "button",
                {
                  onClick: () => setAnswer(i, opt),
                  className: "w-full text-right px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2",
                  style: {
                    background: selected ? "rgba(6,182,212,0.15)" : "rgba(255,255,255,0.03)",
                    border: `1px solid ${selected ? "#06b6d4" : "rgba(255,255,255,0.08)"}`,
                    color: selected ? "#06b6d4" : "hsl(var(--foreground))"
                  },
                  children: [
                    /* @__PURE__ */ jsx(
                      "span",
                      {
                        className: "w-5 h-5 rounded-lg flex items-center justify-center text-[9px] flex-shrink-0",
                        style: { background: selected ? "#06b6d4" : "rgba(255,255,255,0.08)", color: selected ? "#fff" : "hsl(var(--muted-foreground))" },
                        children: String.fromCharCode(1571 + oi)
                      }
                    ),
                    opt
                  ]
                },
                oi
              );
            }) }),
            q.type === "truefalse" && /* @__PURE__ */ jsx("div", { className: "flex gap-3", children: ["صح", "خطأ"].map((opt) => {
              const selected = answers[i] === opt;
              return /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => setAnswer(i, opt),
                  className: "flex-1 py-2.5 rounded-xl text-sm font-bold transition-all",
                  style: {
                    background: selected ? "rgba(6,182,212,0.15)" : "rgba(255,255,255,0.03)",
                    border: `1px solid ${selected ? "#06b6d4" : "rgba(255,255,255,0.08)"}`,
                    color: selected ? "#06b6d4" : "hsl(var(--muted-foreground))"
                  },
                  children: opt
                },
                opt
              );
            }) }),
            q.type === "short" && /* @__PURE__ */ jsx(
              "input",
              {
                value: answers[i] || "",
                onChange: (e) => setAnswer(i, e.target.value),
                placeholder: "اكتب إجابتك هنا...",
                className: "w-full px-4 py-2.5 rounded-xl text-sm bg-transparent focus:outline-none",
                style: { border: "1px solid rgba(6,182,212,0.3)" }
              }
            )
          ]
        },
        i
      )),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: confirmSubmit,
          disabled: submitting,
          className: "w-full py-3.5 rounded-2xl text-sm font-black text-white disabled:opacity-60",
          style: { background: "linear-gradient(90deg,#059669,#10b981)" },
          children: submitting ? "جاري التسليم..." : "تسليم الامتحان وعرض النتيجة"
        }
      ),
      /* @__PURE__ */ jsxs(Link, { to: "/exams", className: "flex items-center justify-center gap-1 text-[11px] text-muted-foreground hover:opacity-80", children: [
        "إلغاء والخروج ",
        /* @__PURE__ */ jsx(ChevronRight, { size: 11, className: "rotate-180" })
      ] })
    ] })
  ] });
}
const REQ_PENDING = { bg: "rgba(251,191,36,0.1)", border: "rgba(251,191,36,0.35)" };
function ExamResults() {
  const { user, isLoadingAuth } = useAuth();
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("results");
  const [results, setResults] = useState([]);
  const [pending, setPending] = useState([]);
  const [schoolId, setSchoolId] = useState(GENERAL_SCHOOL);
  const [processing, setProcessing] = useState(null);
  const isAdmin = (user == null ? void 0 : user.role) === "admin" || (user == null ? void 0 : user.role) === "school_admin";
  const load = async () => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }
    const sid = await resolveAdminSchool(user) || GENERAL_SCHOOL;
    setSchoolId(sid);
    const [rs, reqs] = await Promise.all([
      base44.entities.ExamResult.filter({ school_id: sid }, "-submission_time", 200),
      base44.entities.ExamAccessRequest.filter({ school_id: sid, status: "pending" }, "-created_date", 100)
    ]);
    setResults(rs || []);
    setPending(reqs || []);
    setLoading(false);
  };
  useEffect(() => {
    if (isLoadingAuth) return;
    load();
  }, [isLoadingAuth, isAdmin]);
  const reviewRequest = async (req, status) => {
    setProcessing(req.id);
    await base44.entities.ExamAccessRequest.update(req.id, {
      status,
      reviewed_by: user.email,
      reviewed_at: (/* @__PURE__ */ new Date()).toISOString()
    });
    const reqs = await base44.entities.ExamAccessRequest.filter({ school_id: schoolId, status: "pending" }, "-created_date", 100);
    setPending(reqs || []);
    setProcessing(null);
  };
  if (isLoadingAuth || loading) {
    return /* @__PURE__ */ jsxs("div", { className: "min-h-screen flex flex-col items-center justify-center gap-3 bg-background", children: [
      /* @__PURE__ */ jsx(Loader2, { size: 32, className: "animate-spin", style: { color: "hsl(var(--primary))" } }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "جاري التحميل..." })
    ] });
  }
  if (!isAdmin) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen flex items-center justify-center bg-background", dir: "rtl", children: /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsx(AlertCircle, { size: 36, className: "text-red-400 mx-auto mb-3" }),
      /* @__PURE__ */ jsx("h2", { className: "font-black text-lg mb-2", children: "وصول مقيّد" }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mb-5", children: "هذه الصفحة للمعلمين والمديرين فقط." }),
      /* @__PURE__ */ jsx(Link, { to: "/", className: "text-xs font-bold", style: { color: "hsl(var(--primary))" }, children: "العودة للرئيسية" })
    ] }) });
  }
  const avgPct = results.length ? Math.round(results.reduce((a, r) => a + (r.percentage || 0), 0) / results.length) : 0;
  const passCount = results.filter((r) => (r.percentage || 0) >= 60).length;
  const studentCount = new Set(results.map((r) => r.student_id)).size;
  return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-background text-foreground", dir: "rtl", children: /* @__PURE__ */ jsxs("div", { className: "max-w-6xl mx-auto px-4 py-8", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx(
          "div",
          {
            className: "w-11 h-11 rounded-xl flex items-center justify-center",
            style: { background: "linear-gradient(135deg,#059669,#4f46e5)" },
            children: /* @__PURE__ */ jsx(FileCheck, { className: "text-white", size: 20 })
          }
        ),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "font-black text-xl", children: "نتائج الامتحانات" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "نتائج وطلبات دخول طلاب مدرستك فقط" })
        ] })
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: load,
          className: "p-2 rounded-xl transition-colors hover:bg-white/5",
          style: { border: "1px solid hsl(var(--border))", color: "hsl(var(--primary))" },
          children: /* @__PURE__ */ jsx(RefreshCw, { size: 14 })
        }
      )
    ] }),
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6", children: [
      { label: "إجمالي المحاولات", value: results.length, icon: /* @__PURE__ */ jsx(FileCheck, { size: 15 }), color: "#06b6d4" },
      { label: "عدد المشاركين", value: studentCount, icon: /* @__PURE__ */ jsx(Users, { size: 15 }), color: "#a78bfa" },
      { label: "متوسط النتائج", value: `${avgPct}%`, icon: /* @__PURE__ */ jsx(Percent, { size: 15 }), color: "#fbbf24" },
      { label: "ناجحون (60%+)", value: passCount, icon: /* @__PURE__ */ jsx(Trophy, { size: 15 }), color: "#34d399" }
    ].map((s) => /* @__PURE__ */ jsxs("div", { className: "rounded-2xl p-4 bg-card", style: { border: "1px solid hsl(var(--border))" }, children: [
      /* @__PURE__ */ jsx("div", { style: { color: s.color }, className: "mb-1.5", children: s.icon }),
      /* @__PURE__ */ jsx("div", { className: "text-xl font-black", children: s.value }),
      /* @__PURE__ */ jsx("div", { className: "text-[10px] text-muted-foreground", children: s.label })
    ] }, s.label)) }),
    /* @__PURE__ */ jsx("div", { className: "flex gap-2 mb-4", children: [
      { id: "results", label: `النتائج (${results.length})` },
      { id: "requests", label: `طلبات الدخول (${pending.length})`, dot: pending.length > 0 }
    ].map((t2) => /* @__PURE__ */ jsxs(
      "button",
      {
        onClick: () => setTab(t2.id),
        className: "px-4 py-2 rounded-xl text-xs font-bold transition-all",
        style: {
          background: tab === t2.id ? "rgba(6,182,212,0.15)" : "rgba(255,255,255,0.03)",
          border: `1px solid ${tab === t2.id ? "rgba(6,182,212,0.4)" : "hsl(var(--border))"}`,
          color: tab === t2.id ? "#06b6d4" : "hsl(var(--muted-foreground))"
        },
        children: [
          t2.label,
          " ",
          t2.dot && /* @__PURE__ */ jsx("span", { className: "inline-block w-1.5 h-1.5 rounded-full bg-amber-400 mr-1" })
        ]
      },
      t2.id
    )) }),
    tab === "results" && (results.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "rounded-2xl p-10 text-center bg-card", style: { border: "1px solid hsl(var(--border))" }, children: [
      /* @__PURE__ */ jsx(Inbox, { size: 40, className: "mx-auto mb-3 opacity-40", style: { color: "hsl(var(--primary))" } }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "لا توجد نتائج بعد — بانتظار تأدية الطلاب" })
    ] }) : /* @__PURE__ */ jsx("div", { className: "space-y-2", children: results.map((r, i) => {
      const passed = (r.percentage || 0) >= 60;
      return /* @__PURE__ */ jsxs(
        motion.div,
        {
          initial: { opacity: 0, y: 8 },
          animate: { opacity: 1, y: 0 },
          transition: { delay: i * 0.02 },
          className: "rounded-xl p-3.5 bg-card flex flex-col sm:flex-row sm:items-center gap-3",
          style: { border: "1px solid hsl(var(--border))" },
          children: [
            /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsx("div", { className: "text-sm font-bold truncate", children: r.student_name || r.student_email }),
              /* @__PURE__ */ jsxs("div", { className: "text-[10px] text-muted-foreground truncate", children: [
                r.exam_title,
                " • ",
                moment(r.submission_time).format("YYYY/MM/DD HH:mm")
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "text-[10px] text-muted-foreground flex-shrink-0", children: [
              r.correct_answers,
              "/",
              r.total_questions,
              " صحيحة"
            ] }),
            /* @__PURE__ */ jsxs(
              "div",
              {
                className: "px-3 py-1.5 rounded-xl text-sm font-black flex-shrink-0",
                style: {
                  background: passed ? "rgba(52,211,153,0.1)" : "rgba(248,113,113,0.1)",
                  border: `1px solid ${passed ? "rgba(52,211,153,0.3)" : "rgba(248,113,113,0.3)"}`,
                  color: passed ? "#34d399" : "#f87171"
                },
                children: [
                  r.percentage,
                  "%"
                ]
              }
            )
          ]
        },
        r.id
      );
    }) })),
    tab === "requests" && (pending.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "rounded-2xl p-10 text-center bg-card", style: { border: "1px solid hsl(var(--border))" }, children: [
      /* @__PURE__ */ jsx(CheckCircle2, { size: 40, className: "mx-auto mb-3 opacity-40 text-green-400" }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "لا توجد طلبات دخول معلقة" })
    ] }) : /* @__PURE__ */ jsx("div", { className: "space-y-2", children: pending.map((req) => /* @__PURE__ */ jsxs(
      "div",
      {
        className: "rounded-xl p-3.5 bg-card flex flex-col sm:flex-row sm:items-center gap-3",
        style: { border: `1px solid ${REQ_PENDING.border}` },
        children: [
          /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsx("div", { className: "text-sm font-bold truncate", children: req.student_name || req.student_email }),
            /* @__PURE__ */ jsxs("div", { className: "text-[10px] text-muted-foreground truncate", children: [
              "يرغب بالدخول إلى: ",
              req.exam_title
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex gap-2 flex-shrink-0", children: [
            /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: () => reviewRequest(req, "approved"),
                disabled: processing === req.id,
                className: "flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white disabled:opacity-60",
                style: { background: "linear-gradient(90deg,#059669,#10b981)" },
                children: [
                  /* @__PURE__ */ jsx(CheckCircle2, { size: 12 }),
                  " موافقة"
                ]
              }
            ),
            /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: () => reviewRequest(req, "rejected"),
                disabled: processing === req.id,
                className: "flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold disabled:opacity-60",
                style: { background: REQ_PENDING.bg, border: `1px solid ${REQ_PENDING.border}`, color: "#f87171" },
                children: [
                  /* @__PURE__ */ jsx(XCircle, { size: 12 }),
                  " رفض"
                ]
              }
            )
          ] })
        ]
      },
      req.id
    )) }))
  ] }) });
}
const LANGUAGES = [
  { id: "ar", label: "العربية", native: "العربية", flag: "🇸🇦", dir: "rtl" },
  { id: "en", label: "الإنجليزية", native: "English", flag: "🇬🇧", dir: "ltr" },
  { id: "he", label: "العبرية", native: "עברית", flag: "🇮🇱", dir: "rtl" }
];
const PROFILE_STATUS = {
  pending: { label: "بانتظار موافقة المدرسة", color: "#D69E2E" },
  approved: { label: "حساب موثّق ✓", color: "#2E7D5B" },
  rejected: { label: "تم رفض الحساب", color: "#C94C4C" },
  disabled: { label: "الحساب معطّل", color: "#64748B" }
};
function Settings() {
  const { user } = useAuth();
  const session = useStudentSession();
  const navigate = useNavigate();
  useLang();
  const isStudent = !!session;
  const isAdmin = (user == null ? void 0 : user.role) === "admin";
  const [lang, setLang$1] = useState(getLang);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [profile, setProfile] = useState(null);
  const [schoolName, setSchoolName] = useState("عام");
  useEffect(() => {
    if (!isStudent) return;
    (async () => {
      try {
        const p = await studentApi("get", "StudentProfile", { id: session.student_id });
        setProfile(p);
        const school = await studentApi("get", "School", { id: session.school_id });
        if (school == null ? void 0 : school.name) setSchoolName(school.name);
      } catch {
      }
    })();
  }, [isStudent, session == null ? void 0 : session.student_id]);
  useEffect(() => {
    setLang(lang);
  }, [lang]);
  const saveLanguage = async (newLang) => {
    setLang$1(newLang);
    setSaving(true);
    setSaved(false);
    if (isStudent && (profile == null ? void 0 : profile.id)) {
      await studentApi("update", "StudentProfile", {
        id: profile.id,
        data: { preferred_language: newLang }
      }).catch(() => {
      });
    } else if (user) {
      await base44.auth.updateMe({ preferred_language: newLang }).catch(() => {
      });
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };
  const [contactEmail, setContactEmail] = useState("");
  const [savingContact, setSavingContact] = useState(false);
  const [contactSaved, setContactSaved] = useState(false);
  useEffect(() => {
    (async () => {
      var _a;
      try {
        const rows = isStudent ? await studentApi("filter", "SystemSetting", { query: { key: "contact_email" } }) : await base44.entities.SystemSetting.filter({ key: "contact_email" });
        setContactEmail(((_a = rows == null ? void 0 : rows[0]) == null ? void 0 : _a.value) || "");
      } catch {
      }
    })();
  }, [isStudent]);
  const saveContactEmail = async () => {
    const v = contactEmail.trim();
    if (!v) return;
    setSavingContact(true);
    setContactSaved(false);
    try {
      const rows = await base44.entities.SystemSetting.filter({ key: "contact_email" });
      if ((rows == null ? void 0 : rows.length) > 0) await base44.entities.SystemSetting.update(rows[0].id, { value: v });
      else await base44.entities.SystemSetting.create({ key: "contact_email", value: v });
      setContactSaved(true);
      setTimeout(() => setContactSaved(false), 2500);
    } catch {
    }
    setSavingContact(false);
  };
  const studentLogout = () => {
    clearStudentSession();
    navigate("/student-login", { replace: true });
  };
  const statusInfo = profile ? PROFILE_STATUS[profile.status] || PROFILE_STATUS.pending : null;
  const displayName = isStudent ? (profile == null ? void 0 : profile.full_name) || session.student_name || session.student_code : (user == null ? void 0 : user.full_name) || "—";
  const displayId = isStudent ? (profile == null ? void 0 : profile.email) || session.student_code || "—" : (user == null ? void 0 : user.email) || "—";
  const roleLabel = isStudent ? "طالب" : (user == null ? void 0 : user.role) === "admin" ? "معلم / مدير" : user ? "مستخدم" : "—";
  return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-background text-foreground", dir: "rtl", children: /* @__PURE__ */ jsxs("div", { className: "max-w-3xl mx-auto px-4 py-8", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-6", children: [
      /* @__PURE__ */ jsx(
        "div",
        {
          className: "w-11 h-11 rounded-xl flex items-center justify-center",
          style: { background: "#173F5F" },
          children: /* @__PURE__ */ jsx(Settings$1, { className: "text-white", size: 20 })
        }
      ),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "font-black text-xl", children: t("settingsTitle") }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: t("settingsSubtitle") })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "rounded-2xl p-5 mb-4 bg-card", style: { border: "1px solid hsl(var(--border))" }, children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-4", style: { color: "#2F6690" }, children: [
        /* @__PURE__ */ jsx(User, { size: 15 }),
        /* @__PURE__ */ jsx("h2", { className: "text-sm font-black", children: t("accountSection") })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid sm:grid-cols-2 gap-3 text-xs", children: [
        /* @__PURE__ */ jsxs("div", { className: "rounded-xl p-3", style: { background: "rgba(23,63,95,0.03)" }, children: [
          /* @__PURE__ */ jsx("div", { className: "text-[10px] text-muted-foreground mb-1", children: "الاسم" }),
          /* @__PURE__ */ jsx("div", { className: "font-bold", children: displayName })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "rounded-xl p-3", style: { background: "rgba(23,63,95,0.03)" }, children: [
          /* @__PURE__ */ jsx("div", { className: "text-[10px] text-muted-foreground mb-1", children: isStudent ? "رمز الطالب" : "البريد الإلكتروني" }),
          /* @__PURE__ */ jsx("div", { className: "font-bold truncate", dir: "ltr", children: displayId })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "rounded-xl p-3", style: { background: "rgba(23,63,95,0.03)" }, children: [
          /* @__PURE__ */ jsx("div", { className: "text-[10px] text-muted-foreground mb-1", children: "الدور" }),
          /* @__PURE__ */ jsx("div", { className: "font-bold", children: roleLabel })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "rounded-xl p-3", style: { background: "rgba(23,63,95,0.03)" }, children: [
          /* @__PURE__ */ jsx("div", { className: "text-[10px] text-muted-foreground mb-1", children: "حالة الحساب" }),
          /* @__PURE__ */ jsx("div", { className: "font-bold", style: { color: (statusInfo == null ? void 0 : statusInfo.color) || "#2E7D5B" }, children: isStudent ? (statusInfo == null ? void 0 : statusInfo.label) || "حساب موثّق ✓" : "مسجّل" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "rounded-2xl p-5 mb-4 bg-card", style: { border: "1px solid hsl(var(--border))" }, children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-4", style: { color: "#2F6690" }, children: [
        /* @__PURE__ */ jsx(GraduationCap, { size: 15 }),
        /* @__PURE__ */ jsx("h2", { className: "text-sm font-black", children: t("languageSection") })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-3 gap-3", children: LANGUAGES.map((l) => {
        const active = lang === l.id;
        return /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => saveLanguage(l.id),
            disabled: saving,
            className: "rounded-xl p-4 text-center transition-all disabled:opacity-60",
            style: {
              background: active ? "rgba(47,102,144,0.1)" : "rgba(23,63,95,0.03)",
              border: `1px solid ${active ? "#2F6690" : "#E2E8F0"}`
            },
            children: [
              /* @__PURE__ */ jsx("div", { className: "text-2xl mb-1.5", children: l.flag }),
              /* @__PURE__ */ jsx("div", { className: "text-xs font-bold", style: { color: active ? "#173F5F" : "hsl(var(--foreground))" }, children: l.native })
            ]
          },
          l.id
        );
      }) }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mt-3 text-[10px]", children: [
        /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "يتم حفظ تفضيلك تلقائياً وتحديث اتجاه الواجهة" }),
        saving ? /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1 text-muted-foreground", children: [
          /* @__PURE__ */ jsx(Loader2, { size: 10, className: "animate-spin" }),
          " جاري الحفظ..."
        ] }) : saved ? /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", style: { color: "#2E7D5B" }, children: [
          /* @__PURE__ */ jsx(Check, { size: 10 }),
          " تم الحفظ"
        ] }) : null
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "rounded-2xl p-5 bg-card", style: { border: "1px solid hsl(var(--border))" }, children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-4", style: { color: "#2F6690" }, children: [
        /* @__PURE__ */ jsx(School, { size: 15 }),
        /* @__PURE__ */ jsx("h2", { className: "text-sm font-black", children: t("schoolSection") })
      ] }),
      /* @__PURE__ */ jsxs(
        motion.div,
        {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          className: "flex items-center justify-between rounded-xl p-3",
          style: { background: "rgba(23,63,95,0.03)" },
          children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("div", { className: "text-xs font-bold", children: schoolName }),
              /* @__PURE__ */ jsx("div", { className: "text-[10px] text-muted-foreground", children: isStudent ? "بياناتك (التقدم، النتائج، السيناريوهات) مرتبطة بهذه المدرسة فقط" : "بياناتك على النطاق العام" })
            ] }),
            statusInfo && /* @__PURE__ */ jsx(
              "span",
              {
                className: "text-[10px] font-bold px-2.5 py-1 rounded-full",
                style: { background: `color-mix(in srgb, ${statusInfo.color} 12%, transparent)`, color: statusInfo.color },
                children: statusInfo.label
              }
            )
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "rounded-2xl p-5 mt-4 bg-card", style: { border: "1px solid hsl(var(--border))" }, children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-4", style: { color: "#2F6690" }, children: [
        /* @__PURE__ */ jsx(Mail, { size: 15 }),
        /* @__PURE__ */ jsx("h2", { className: "text-sm font-black", children: t("contactSection") })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-[11px] text-muted-foreground mb-3", children: t("contactSectionDesc") }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row gap-2", children: [
        /* @__PURE__ */ jsx(
          "input",
          {
            value: contactEmail,
            onChange: (e) => setContactEmail(e.target.value),
            disabled: !isAdmin,
            dir: "ltr",
            className: "flex-1 px-4 py-2.5 rounded-xl text-sm bg-transparent focus:outline-none disabled:opacity-60",
            style: { border: "1px solid hsl(var(--border))" }
          }
        ),
        isAdmin && /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: saveContactEmail,
            disabled: savingContact || !contactEmail.trim(),
            className: "px-4 py-2.5 rounded-xl text-xs font-black text-white disabled:opacity-50 flex items-center justify-center gap-1.5",
            style: { background: "#173F5F" },
            children: [
              savingContact ? /* @__PURE__ */ jsx(Loader2, { size: 12, className: "animate-spin" }) : contactSaved ? /* @__PURE__ */ jsx(Check, { size: 12 }) : null,
              savingContact ? t("saving") : contactSaved ? t("saved") : t("saveEmail")
            ]
          }
        )
      ] }),
      !isAdmin && /* @__PURE__ */ jsx("p", { className: "text-[10px] text-muted-foreground mt-2", children: t("adminOnlyNote") })
    ] }),
    isStudent && /* @__PURE__ */ jsxs(
      "button",
      {
        onClick: studentLogout,
        className: "w-full mt-4 py-3 rounded-xl text-sm font-black flex items-center justify-center gap-2 transition-all",
        style: { border: "1px solid rgba(201,76,76,0.35)", color: "#C94C4C", background: "rgba(201,76,76,0.05)" },
        children: [
          /* @__PURE__ */ jsx(LogOut, { size: 14 }),
          " تسجيل الخروج"
        ]
      }
    )
  ] }) });
}
const UNCLAIMED = "__unclaimed__";
const PLANS = {
  personal_monthly: {
    id: "personal_monthly",
    personal: true,
    student_limit: 1,
    label: "الخطة الشخصية — شهريًا",
    period: "شهريًا",
    price: "50 ₪ / شهر"
  },
  personal_annual: {
    id: "personal_annual",
    personal: true,
    student_limit: 1,
    label: "الخطة الشخصية — سنويًا",
    period: "سنويًا",
    price: "400 ₪ / سنة",
    highlight: "ادفع 8 أشهر وباقي السنة مجانًا"
  },
  school_50: { id: "school_50", student_limit: 50, label: "حتى 50 طالب", price: "4,000 ₪ سنويًا" },
  school_100: { id: "school_100", student_limit: 100, label: "حتى 100 طالب", price: "6,000 ₪ سنويًا" },
  school_200: { id: "school_200", student_limit: 200, label: "حتى 200 طالب", price: "9,000 ₪ سنويًا" },
  school_max: { id: "school_max", student_limit: 500, label: "أكثر من 200 طالب", price: "10,000 ₪ سنويًا" }
};
const SCHOOL_TIERS = ["school_50", "school_100", "school_200", "school_max"];
const STUDENT_LIMIT_MSG = "لقد وصلت المدرسة إلى الحد الأقصى لعدد الطلاب في خطتك الحالية. يرجى ترقية الخطة لإضافة طلاب جدد.";
function randomCode(prefix = "SCH") {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 5; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return `${prefix}${s}`;
}
function planLabel(planId) {
  var _a;
  return ((_a = PLANS[planId]) == null ? void 0 : _a.label) || planId || "—";
}
const STATUS_UI = {
  pending: { label: "بانتظار الموافقة", color: "#fbbf24", bg: "rgba(251,191,36,0.1)", border: "rgba(251,191,36,0.35)" },
  approved: { label: "فعّال ✓", color: "#34d399", bg: "rgba(52,211,153,0.1)", border: "rgba(52,211,153,0.35)" },
  rejected: { label: "مرفوض", color: "#f87171", bg: "rgba(248,113,113,0.1)", border: "rgba(248,113,113,0.35)" },
  disabled: { label: "معطّل", color: "#94a3b8", bg: "rgba(148,163,184,0.1)", border: "rgba(148,163,184,0.3)" }
};
function StudentsManager({ school, onBack }) {
  const { user } = useAuth();
  const [students, setStudents] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", code: "", email: "" });
  const [formError, setFormError] = useState(null);
  const [busy, setBusy] = useState(false);
  const load = () => base44.entities.StudentProfile.filter({ school_id: school.id }, "-created_date", 200).then((rows) => setStudents(rows || []));
  useEffect(() => {
    if (school == null ? void 0 : school.id) load();
  }, [school == null ? void 0 : school.id]);
  const addStudent = async (e) => {
    e.preventDefault();
    const code = form.code.trim();
    if (!form.name.trim() || !code) {
      setFormError("أدخل اسم الطالب ورمزه");
      return;
    }
    setBusy(true);
    setFormError(null);
    const all = await base44.entities.StudentProfile.filter({ school_id: school.id }, "-created_date", 500);
    const limit = school.student_limit || 0;
    if (limit > 0 && (all || []).length >= limit) {
      setFormError(STUDENT_LIMIT_MSG);
      setBusy(false);
      return;
    }
    if ((all || []).some((s) => s.student_code === code)) {
      setFormError("رمز الطالب مستخدم مسبقاً داخل هذه المدرسة");
      setBusy(false);
      return;
    }
    await base44.entities.StudentProfile.create({
      school_id: school.id,
      student_code: code,
      full_name: form.name.trim(),
      email: form.email.trim() || null,
      status: "pending",
      user_id: UNCLAIMED
    });
    base44.entities.School.update(school.id, { current_student_count: (all || []).length + 1 }).catch(() => {
    });
    setForm({ name: "", code: "", email: "" });
    setShowForm(false);
    setBusy(false);
    load();
  };
  const setStatus = async (s, status) => {
    await base44.entities.StudentProfile.update(s.id, {
      status,
      approved_by: user.email,
      approved_at: (/* @__PURE__ */ new Date()).toISOString()
    });
    load();
  };
  const deleteStudent = async (s) => {
    if (!confirm(`حذف الطالب "${s.full_name}" (${s.student_code})؟`)) return;
    await base44.entities.StudentProfile.delete(s.id);
    base44.entities.StudentProfile.filter({ school_id: school.id }, "-created_date", 500).then((rows) => base44.entities.School.update(school.id, { current_student_count: (rows || []).length }).catch(() => {
    })).catch(() => {
    });
    load();
  };
  if (!school) return /* @__PURE__ */ jsx(FullSpinnerLocal, {});
  const claimed = (students || []).filter((s) => s.user_id && s.user_id !== UNCLAIMED);
  const pendingCount = claimed.filter((s) => s.status === "pending").length;
  return /* @__PURE__ */ jsxs("div", { dir: "rtl", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-3 flex-wrap mb-5", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 min-w-0", children: [
        onBack && /* @__PURE__ */ jsx(
          "button",
          {
            onClick: onBack,
            className: "px-3 py-1.5 rounded-xl text-xs font-bold",
            style: { border: "1px solid hsl(var(--border))", color: "hsl(var(--primary))" },
            children: "رجوع"
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsxs("h2", { className: "font-black text-base truncate", children: [
            "طلاب مدرسة ",
            school.name
          ] }),
          /* @__PURE__ */ jsxs("p", { className: "text-[10px] text-muted-foreground", children: [
            (students == null ? void 0 : students.length) || 0,
            school.student_limit > 0 ? ` / ${school.student_limit}` : "",
            " طالب • ",
            pendingCount,
            " بانتظار الموافقة • رمز المدرسة: ",
            school.code
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: load,
            className: "p-2 rounded-xl hover:bg-white/5",
            style: { border: "1px solid hsl(var(--border))", color: "hsl(var(--primary))" },
            children: /* @__PURE__ */ jsx(RefreshCw, { size: 13 })
          }
        ),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => setShowForm(!showForm),
            className: "flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white",
            style: { background: "linear-gradient(90deg,#0891b2,#7c3aed)" },
            children: [
              /* @__PURE__ */ jsx(UserPlus, { size: 13 }),
              " إضافة طالب"
            ]
          }
        )
      ] })
    ] }),
    showForm && /* @__PURE__ */ jsxs(
      motion.form,
      {
        initial: { opacity: 0, y: -8 },
        animate: { opacity: 1, y: 0 },
        onSubmit: addStudent,
        className: "rounded-2xl p-4 mb-4 grid sm:grid-cols-4 gap-3 items-end bg-card",
        style: { border: "1px solid rgba(6,182,212,0.3)" },
        children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-[10px] font-bold text-muted-foreground mb-1", children: "اسم الطالب *" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                value: form.name,
                onChange: (e) => setForm({ ...form, name: e.target.value }),
                dir: "rtl",
                className: "w-full px-3 py-2 rounded-xl text-xs bg-transparent focus:outline-none",
                style: { border: "1px solid hsl(var(--border))" }
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-[10px] font-bold text-muted-foreground mb-1", children: "رمز الطالب *" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                value: form.code,
                onChange: (e) => setForm({ ...form, code: e.target.value }),
                placeholder: "ST10025",
                dir: "ltr",
                className: "w-full px-3 py-2 rounded-xl text-xs font-mono bg-transparent focus:outline-none",
                style: { border: "1px solid hsl(var(--border))" }
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-[10px] font-bold text-muted-foreground mb-1", children: "Email (اختياري)" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                value: form.email,
                onChange: (e) => setForm({ ...form, email: e.target.value }),
                dir: "ltr",
                className: "w-full px-3 py-2 rounded-xl text-xs bg-transparent focus:outline-none",
                style: { border: "1px solid hsl(var(--border))" }
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsxs(
              "button",
              {
                type: "submit",
                disabled: busy,
                className: "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold text-white disabled:opacity-60",
                style: { background: "linear-gradient(90deg,#059669,#10b981)" },
                children: [
                  busy ? /* @__PURE__ */ jsx(Loader2, { size: 12, className: "animate-spin" }) : /* @__PURE__ */ jsx(Plus, { size: 12 }),
                  " حفظ"
                ]
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: () => setShowForm(false),
                className: "px-3 py-2 rounded-xl text-xs",
                style: { border: "1px solid hsl(var(--border))", color: "hsl(var(--muted-foreground))" },
                children: /* @__PURE__ */ jsx(X, { size: 12 })
              }
            )
          ] }),
          formError && /* @__PURE__ */ jsx(
            "div",
            {
              className: "sm:col-span-4 text-[11px] font-bold px-3 py-2 rounded-xl",
              style: { background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5" },
              children: formError
            }
          )
        ]
      }
    ),
    students === null ? /* @__PURE__ */ jsx(FullSpinnerLocal, {}) : students.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "rounded-2xl p-10 text-center bg-card", style: { border: "1px solid hsl(var(--border))" }, children: [
      /* @__PURE__ */ jsx(KeyRound, { size: 36, className: "mx-auto mb-3 opacity-40", style: { color: "hsl(var(--primary))" } }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "لا يوجد طلاب — أضف أول طالب برمزه الخاص" })
    ] }) : /* @__PURE__ */ jsx("div", { className: "space-y-2", children: students.map((s, i) => {
      const isClaimed = s.user_id && s.user_id !== UNCLAIMED;
      const st = STATUS_UI[s.status] || STATUS_UI.pending;
      return /* @__PURE__ */ jsxs(
        motion.div,
        {
          initial: { opacity: 0, y: 6 },
          animate: { opacity: 1, y: 0 },
          transition: { delay: i * 0.02 },
          className: "rounded-xl p-3.5 bg-card flex flex-col sm:flex-row sm:items-center gap-3",
          style: { border: "1px solid hsl(var(--border))" },
          children: [
            /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
                /* @__PURE__ */ jsx("span", { className: "text-sm font-bold truncate", children: s.full_name || "بدون اسم" }),
                /* @__PURE__ */ jsx(
                  "span",
                  {
                    className: "text-[10px] font-mono px-2 py-0.5 rounded-lg",
                    style: { background: "rgba(6,182,212,0.08)", border: "1px solid rgba(6,182,212,0.25)", color: "#06b6d4" },
                    children: s.student_code
                  }
                ),
                /* @__PURE__ */ jsx(
                  "span",
                  {
                    className: "text-[10px] px-2 py-0.5 rounded-full font-bold",
                    style: { background: st.bg, border: `1px solid ${st.border}`, color: st.color },
                    children: isClaimed ? st.label : "رمز غير مُفعّل بعد"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "text-[10px] text-muted-foreground mt-0.5 truncate", children: [
                s.email || "بدون بريد",
                " ",
                isClaimed ? "• حساب مرتبط" : "• بانتظار تفعيل الطالب لرمزه"
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 flex-shrink-0", children: [
              isClaimed && s.status === "pending" && /* @__PURE__ */ jsxs(
                "button",
                {
                  onClick: () => setStatus(s, "approved"),
                  className: "flex items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-bold text-white",
                  style: { background: "linear-gradient(90deg,#059669,#10b981)" },
                  children: [
                    /* @__PURE__ */ jsx(Check, { size: 11 }),
                    " موافقة"
                  ]
                }
              ),
              isClaimed && s.status === "approved" && /* @__PURE__ */ jsxs(
                "button",
                {
                  onClick: () => setStatus(s, "disabled"),
                  className: "flex items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-bold",
                  style: { border: "1px solid hsl(var(--border))", color: "hsl(var(--muted-foreground))" },
                  children: [
                    /* @__PURE__ */ jsx(Ban, { size: 11 }),
                    " تعطيل"
                  ]
                }
              ),
              isClaimed && (s.status === "rejected" || s.status === "disabled") && /* @__PURE__ */ jsxs(
                "button",
                {
                  onClick: () => setStatus(s, "approved"),
                  className: "flex items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-bold",
                  style: { border: "1px solid rgba(52,211,153,0.35)", color: "#34d399" },
                  children: [
                    /* @__PURE__ */ jsx(Check, { size: 11 }),
                    " إعادة تفعيل"
                  ]
                }
              ),
              isClaimed && s.status === "pending" && /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => setStatus(s, "rejected"),
                  className: "px-3 py-1.5 rounded-xl text-[11px] font-bold",
                  style: { background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.3)", color: "#f87171" },
                  children: "رفض"
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => deleteStudent(s),
                  className: "p-1.5 rounded-xl",
                  style: { background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" },
                  children: /* @__PURE__ */ jsx(Trash2, { size: 11 })
                }
              )
            ] })
          ]
        },
        s.id
      );
    }) })
  ] });
}
function FullSpinnerLocal() {
  return /* @__PURE__ */ jsx("div", { className: "py-20 flex justify-center", children: /* @__PURE__ */ jsx(Loader2, { size: 26, className: "animate-spin", style: { color: "hsl(var(--primary))" } }) });
}
function SchoolsManager() {
  const { user, isLoadingAuth } = useAuth();
  const [schools, setSchools] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", code: "", plan: "school_50" });
  const [formError, setFormError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [view, setView] = useState("list");
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [assignEmail, setAssignEmail] = useState({});
  const [assignMsg, setAssignMsg] = useState({});
  const isSuperAdmin = (user == null ? void 0 : user.role) === "admin";
  const load = () => base44.entities.School.list("-created_date", 100).then((r) => setSchools(r || []));
  useEffect(() => {
    if (!isLoadingAuth && isSuperAdmin) load();
  }, [isLoadingAuth, isSuperAdmin]);
  const addSchool = async (e) => {
    var _a;
    e.preventDefault();
    const code = form.code.trim();
    if (!form.name.trim() || !code) {
      setFormError("أدخل اسم المدرسة ورمزها");
      return;
    }
    setBusy(true);
    setFormError(null);
    const dup = await base44.entities.School.filter({ code });
    if (dup && dup.length > 0) {
      setFormError(`رمز المدرسة "${code}" مستخدم مسبقاً — لا يمكن تكراره`);
      setBusy(false);
      return;
    }
    await base44.entities.School.create({
      name: form.name.trim(),
      code,
      is_active: true,
      created_by_id: user.id,
      subscription_plan: form.plan,
      student_limit: ((_a = PLANS[form.plan]) == null ? void 0 : _a.student_limit) || 50,
      current_student_count: 0,
      subscription_status: "active"
    });
    setForm({ name: "", code: "" });
    setShowForm(false);
    setBusy(false);
    load();
  };
  const toggleActive = async (s) => {
    await base44.entities.School.update(s.id, { is_active: !s.is_active });
    load();
  };
  const changePlan = async (s, planId) => {
    var _a;
    await base44.entities.School.update(s.id, {
      subscription_plan: planId,
      student_limit: ((_a = PLANS[planId]) == null ? void 0 : _a.student_limit) || 50
    });
    load();
  };
  const assignAdmin = async (school) => {
    const email = (assignEmail[school.id] || "").trim();
    if (!email) return;
    setAssignMsg((m) => ({ ...m, [school.id]: null }));
    const users = await base44.entities.User.filter({ email });
    if (!users || users.length === 0) {
      setAssignMsg((m) => ({ ...m, [school.id]: { ok: false, text: "لا يوجد مستخدم بهذا البريد — يجب أن يسجل دخوله للتطبيق أولاً" } }));
      return;
    }
    await base44.entities.User.update(users[0].id, { role: "school_admin", school_id: school.id });
    setAssignEmail((m) => ({ ...m, [school.id]: "" }));
    setAssignMsg((m) => ({ ...m, [school.id]: { ok: true, text: "تم تعيينه مشرفاً لهذه المدرسة ✓" } }));
  };
  if (isLoadingAuth) return /* @__PURE__ */ jsx(FullSpinner, {});
  if (!isSuperAdmin) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen flex items-center justify-center bg-background", dir: "rtl", children: /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsx(AlertTriangle, { size: 36, className: "text-red-400 mx-auto mb-3" }),
      /* @__PURE__ */ jsx("h2", { className: "font-black text-lg mb-2", children: "وصول مقيّد" }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mb-5", children: "هذه الشاشة للمالك (Owner) فقط." }),
      /* @__PURE__ */ jsx(Link, { to: "/", className: "text-xs font-bold", style: { color: "hsl(var(--primary))" }, children: "العودة للرئيسية" })
    ] }) });
  }
  if (view === "students" && selectedSchool) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-background text-foreground", dir: "rtl", children: /* @__PURE__ */ jsx("div", { className: "max-w-5xl mx-auto px-4 py-8", children: /* @__PURE__ */ jsx(StudentsManager, { school: selectedSchool, onBack: () => {
      setView("list");
      setSelectedSchool(null);
    } }) }) });
  }
  return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-background text-foreground", dir: "rtl", children: /* @__PURE__ */ jsxs("div", { className: "max-w-5xl mx-auto px-4 py-8", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-3 flex-wrap mb-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx(
          "div",
          {
            className: "w-11 h-11 rounded-xl flex items-center justify-center",
            style: { background: "linear-gradient(135deg,#0891b2,#7c3aed)" },
            children: /* @__PURE__ */ jsx(School, { className: "text-white", size: 20 })
          }
        ),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "font-black text-xl", children: "المدارس" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "شاشة المالك (Owner) — مدارس جديدة برموز فريدة، خطط الاشتراك وحدود الطلاب، تعيين المشرفين" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: load,
            className: "p-2 rounded-xl hover:bg-white/5",
            style: { border: "1px solid hsl(var(--border))", color: "hsl(var(--primary))" },
            children: /* @__PURE__ */ jsx(RefreshCw, { size: 14 })
          }
        ),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => setShowForm(!showForm),
            className: "flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white",
            style: { background: "linear-gradient(90deg,#0891b2,#7c3aed)" },
            children: [
              /* @__PURE__ */ jsx(Plus, { size: 14 }),
              " Add School"
            ]
          }
        )
      ] })
    ] }),
    showForm && /* @__PURE__ */ jsxs(
      motion.form,
      {
        initial: { opacity: 0, y: -8 },
        animate: { opacity: 1, y: 0 },
        onSubmit: addSchool,
        className: "rounded-2xl p-4 mb-5 grid sm:grid-cols-4 gap-3 items-end bg-card",
        style: { border: "1px solid rgba(6,182,212,0.3)" },
        children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-[10px] font-bold text-muted-foreground mb-1", children: "School Name *" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                value: form.name,
                onChange: (e) => setForm({ ...form, name: e.target.value }),
                dir: "rtl",
                className: "w-full px-3 py-2 rounded-xl text-xs bg-transparent focus:outline-none",
                style: { border: "1px solid hsl(var(--border))" }
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-[10px] font-bold text-muted-foreground mb-1", children: "School Code *" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                value: form.code,
                onChange: (e) => setForm({ ...form, code: e.target.value }),
                placeholder: "SCH2026A",
                dir: "ltr",
                className: "w-full px-3 py-2 rounded-xl text-xs font-mono bg-transparent focus:outline-none",
                style: { border: "1px solid hsl(var(--border))" }
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-[10px] font-bold text-muted-foreground mb-1", children: "خطة الاشتراك *" }),
            /* @__PURE__ */ jsx(
              "select",
              {
                value: form.plan,
                onChange: (e) => setForm({ ...form, plan: e.target.value }),
                className: "w-full px-3 py-2 rounded-xl text-xs bg-transparent focus:outline-none",
                style: { border: "1px solid hsl(var(--border))" },
                children: SCHOOL_TIERS.map((id) => /* @__PURE__ */ jsxs("option", { value: id, className: "bg-card", children: [
                  PLANS[id].label,
                  " — ",
                  PLANS[id].price
                ] }, id))
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsxs(
              "button",
              {
                type: "submit",
                disabled: busy,
                className: "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold text-white disabled:opacity-60",
                style: { background: "linear-gradient(90deg,#059669,#10b981)" },
                children: [
                  busy ? /* @__PURE__ */ jsx(Loader2, { size: 12, className: "animate-spin" }) : /* @__PURE__ */ jsx(Check, { size: 12 }),
                  " حفظ المدرسة"
                ]
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: () => setShowForm(false),
                className: "px-3 py-2 rounded-xl text-xs",
                style: { border: "1px solid hsl(var(--border))", color: "hsl(var(--muted-foreground))" },
                children: /* @__PURE__ */ jsx(X, { size: 12 })
              }
            )
          ] }),
          formError && /* @__PURE__ */ jsx(
            "div",
            {
              className: "sm:col-span-3 text-[11px] font-bold px-3 py-2 rounded-xl",
              style: { background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5" },
              children: formError
            }
          )
        ]
      }
    ),
    schools === null ? /* @__PURE__ */ jsx(FullSpinner, {}) : schools.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "rounded-2xl p-10 text-center bg-card", style: { border: "1px solid hsl(var(--border))" }, children: [
      /* @__PURE__ */ jsx(School, { size: 40, className: "mx-auto mb-3 opacity-40", style: { color: "hsl(var(--primary))" } }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "لا توجد مدارس — أضف أول مدرسة" })
    ] }) : /* @__PURE__ */ jsx("div", { className: "space-y-3", children: schools.map((s, i) => /* @__PURE__ */ jsxs(
      motion.div,
      {
        initial: { opacity: 0, y: 8 },
        animate: { opacity: 1, y: 0 },
        transition: { delay: i * 0.04 },
        className: "rounded-2xl p-4 bg-card",
        style: { border: "1px solid hsl(var(--border))" },
        children: [
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center gap-3", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 flex-wrap mb-1", children: [
                /* @__PURE__ */ jsx("span", { className: "font-black text-sm", children: s.name }),
                /* @__PURE__ */ jsx(
                  "span",
                  {
                    className: "text-[11px] font-mono px-2 py-0.5 rounded-lg",
                    style: { background: "rgba(6,182,212,0.08)", border: "1px solid rgba(6,182,212,0.25)", color: "#06b6d4" },
                    children: s.code
                  }
                ),
                /* @__PURE__ */ jsx(
                  "span",
                  {
                    className: "text-[10px] px-2 py-0.5 rounded-full font-bold",
                    style: s.is_active ? { background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.35)", color: "#34d399" } : { background: "rgba(148,163,184,0.1)", border: "1px solid rgba(148,163,184,0.3)", color: "#94a3b8" },
                    children: s.is_active ? "Active" : "Inactive"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "text-[10px] text-muted-foreground font-mono mb-1", dir: "ltr", children: [
                "school_id: ",
                s.id
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 flex-wrap text-[10px]", children: [
                /* @__PURE__ */ jsx(
                  "span",
                  {
                    className: "px-2 py-0.5 rounded-full font-bold",
                    style: { background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.3)", color: "#a78bfa" },
                    children: planLabel(s.subscription_plan)
                  }
                ),
                /* @__PURE__ */ jsxs(
                  "span",
                  {
                    className: "px-2 py-0.5 rounded-full font-bold",
                    style: { background: "rgba(6,182,212,0.08)", border: "1px solid rgba(6,182,212,0.25)", color: "#06b6d4" },
                    children: [
                      "الطلاب: ",
                      s.current_student_count || 0,
                      " / ",
                      s.student_limit || "—"
                    ]
                  }
                ),
                /* @__PURE__ */ jsxs(
                  "span",
                  {
                    className: "px-2 py-0.5 rounded-full font-bold",
                    style: s.subscription_status === "active" ? { background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.35)", color: "#34d399" } : s.subscription_status === "expired" ? { background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.35)", color: "#f87171" } : { background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.35)", color: "#fbbf24" },
                    children: [
                      "اشتراك: ",
                      s.subscription_status === "active" ? "فعّال" : s.subscription_status === "expired" ? "منتهي" : "بانتظار التفعيل"
                    ]
                  }
                ),
                /* @__PURE__ */ jsxs("span", { className: "text-muted-foreground", children: [
                  "التسجيل: ",
                  new Date(s.created_date).toLocaleDateString("ar")
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 flex-shrink-0", children: [
              /* @__PURE__ */ jsx(
                "select",
                {
                  value: s.subscription_plan || "school_50",
                  onChange: (e) => changePlan(s, e.target.value),
                  title: "تغيير خطة الاشتراك",
                  className: "px-2 py-1.5 rounded-xl text-[10px] font-bold bg-transparent focus:outline-none",
                  style: { border: "1px solid hsl(var(--border))", color: "hsl(var(--muted-foreground))" },
                  children: SCHOOL_TIERS.map((id) => /* @__PURE__ */ jsx("option", { value: id, className: "bg-card", children: PLANS[id].label }, id))
                }
              ),
              /* @__PURE__ */ jsxs(
                "button",
                {
                  onClick: () => {
                    setSelectedSchool(s);
                    setView("students");
                  },
                  className: "flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold",
                  style: { background: "rgba(6,182,212,0.08)", border: "1px solid rgba(6,182,212,0.3)", color: "#06b6d4" },
                  children: [
                    /* @__PURE__ */ jsx(GraduationCap, { size: 13 }),
                    " Students"
                  ]
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => toggleActive(s),
                  className: "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold",
                  style: { border: "1px solid hsl(var(--border))", color: "hsl(var(--muted-foreground))" },
                  children: s.is_active ? /* @__PURE__ */ jsxs(Fragment, { children: [
                    /* @__PURE__ */ jsx(Ban, { size: 11 }),
                    " تعطيل"
                  ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
                    /* @__PURE__ */ jsx(Check, { size: 11 }),
                    " تفعيل"
                  ] })
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs(
            "div",
            {
              className: "mt-3 pt-3 flex flex-col sm:flex-row sm:items-center gap-2",
              style: { borderTop: "1px solid hsl(var(--border))" },
              children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 text-[11px] font-bold flex-shrink-0", style: { color: "#a78bfa" }, children: [
                  /* @__PURE__ */ jsx(ShieldCheck, { size: 12 }),
                  " تعيين مشرف المدرسة:"
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex flex-1 gap-2", children: [
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      value: assignEmail[s.id] || "",
                      onChange: (e) => setAssignEmail((m) => ({ ...m, [s.id]: e.target.value })),
                      placeholder: "بريد المستخدم (سجل دخوله أولاً)",
                      dir: "ltr",
                      className: "flex-1 px-3 py-1.5 rounded-xl text-[11px] bg-transparent focus:outline-none",
                      style: { border: "1px solid hsl(var(--border))" }
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      onClick: () => assignAdmin(s),
                      className: "px-3 py-1.5 rounded-xl text-[11px] font-bold text-white",
                      style: { background: "linear-gradient(90deg,#7c3aed,#0891b2)" },
                      children: "تعيين"
                    }
                  )
                ] }),
                assignMsg[s.id] && /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold", style: { color: assignMsg[s.id].ok ? "#34d399" : "#fca5a5" }, children: assignMsg[s.id].text })
              ]
            }
          )
        ]
      },
      s.id
    )) })
  ] }) });
}
function FullSpinner() {
  return /* @__PURE__ */ jsx("div", { className: "py-24 flex justify-center", children: /* @__PURE__ */ jsx(Loader2, { size: 28, className: "animate-spin", style: { color: "hsl(var(--primary))" } }) });
}
function SchoolStudents() {
  const { user, isLoadingAuth } = useAuth();
  const [school, setSchool] = useState(void 0);
  const isSchoolAdmin = (user == null ? void 0 : user.role) === "school_admin";
  useEffect(() => {
    if (isLoadingAuth || !isSchoolAdmin) {
      setSchool(null);
      return;
    }
    base44.entities.School.get(user.school_id).then(setSchool).catch(() => setSchool(null));
  }, [isLoadingAuth, isSchoolAdmin, user == null ? void 0 : user.school_id]);
  if (isLoadingAuth || school === void 0) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen flex items-center justify-center bg-background", children: /* @__PURE__ */ jsx(
      "div",
      {
        className: "w-8 h-8 rounded-full animate-spin",
        style: { border: "3px solid rgba(6,182,212,0.2)", borderTopColor: "#06b6d4" }
      }
    ) });
  }
  if (!isSchoolAdmin) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen flex items-center justify-center bg-background", dir: "rtl", children: /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsx(AlertTriangle, { size: 36, className: "text-red-400 mx-auto mb-3" }),
      /* @__PURE__ */ jsx("h2", { className: "font-black text-lg mb-2", children: "وصول مقيّد" }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mb-5", children: "هذه الصفحة لمشرفي المدارس فقط." }),
      /* @__PURE__ */ jsx(Link, { to: "/", className: "text-xs font-bold", style: { color: "hsl(var(--primary))" }, children: "العودة للرئيسية" })
    ] }) });
  }
  return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-background text-foreground", dir: "rtl", children: /* @__PURE__ */ jsx("div", { className: "max-w-5xl mx-auto px-4 py-8", children: school ? /* @__PURE__ */ jsx(StudentsManager, { school }) : /* @__PURE__ */ jsxs("div", { className: "rounded-2xl p-10 text-center bg-card", style: { border: "1px solid hsl(var(--border))" }, children: [
    /* @__PURE__ */ jsx(AlertTriangle, { size: 36, className: "mx-auto mb-3 text-amber-400" }),
    /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "لم يتم ربطك بمدرسة بعد — اطلب من المدير العام تعيينك مشرفاً لمدرستك" })
  ] }) }) });
}
function StudentGuard() {
  const session = useStudentSession();
  const { isAuthenticated, user, isLoadingAuth } = useAuth();
  if (isLoadingAuth) {
    return /* @__PURE__ */ jsx("div", { className: "fixed inset-0 flex items-center justify-center", style: { background: "#F7F9FC" }, children: /* @__PURE__ */ jsx(
      "div",
      {
        className: "w-8 h-8 rounded-full animate-spin",
        style: { border: "3px solid rgba(47,102,144,0.2)", borderTopColor: "#173F5F" }
      }
    ) });
  }
  if (session) return /* @__PURE__ */ jsx(Outlet, {});
  const isAdmin = isAuthenticated && ((user == null ? void 0 : user.role) === "admin" || (user == null ? void 0 : user.role) === "school_admin");
  if (isAdmin) return /* @__PURE__ */ jsx(Outlet, {});
  return /* @__PURE__ */ jsx(Navigate, { to: "/student-login", replace: true });
}
function StudentLogin() {
  useLang();
  const navigate = useNavigate();
  const [schoolCode, setSchoolCode] = useState("");
  const [studentCode, setStudentCode] = useState("");
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    var _a;
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const session = await studentLogin(schoolCode, studentCode);
      setStudentSession(session);
      navigate("/", { replace: true });
    } catch (err) {
      setError(((_a = err == null ? void 0 : err.data) == null ? void 0 : _a.error) || (err == null ? void 0 : err.message) || t("errUnexpected"));
    } finally {
      setBusy(false);
    }
  };
  const inputStyle = {
    background: "#F7F9FC",
    border: "1px solid #E2E8F0"
  };
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: "min-h-screen flex items-center justify-center p-4",
      dir: "rtl",
      style: { background: "#F7F9FC" },
      children: /* @__PURE__ */ jsxs(
        "div",
        {
          className: "w-full max-w-md rounded-2xl p-6 bg-white",
          style: { border: "1px solid #E2E8F0", boxShadow: "0 4px 20px rgba(23,63,95,0.08)" },
          children: [
            /* @__PURE__ */ jsxs("div", { className: "text-center mb-6", children: [
              /* @__PURE__ */ jsx(
                "div",
                {
                  className: "w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center",
                  style: { background: "#173F5F" },
                  children: /* @__PURE__ */ jsx(KeyRound, { className: "text-white", size: 24 })
                }
              ),
              /* @__PURE__ */ jsx("h1", { className: "font-black text-lg", style: { color: "#173F5F" }, children: t("loginTitle") }),
              /* @__PURE__ */ jsx("p", { className: "text-xs mt-1 text-muted-foreground", children: t("loginSubtitle") })
            ] }),
            /* @__PURE__ */ jsxs("form", { onSubmit: submit, className: "space-y-3", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { className: "block text-[11px] font-bold text-muted-foreground mb-1.5", children: t("schoolCode") }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    value: schoolCode,
                    onChange: (e) => setSchoolCode(e.target.value),
                    required: true,
                    placeholder: "SCH2026A",
                    dir: "ltr",
                    className: "w-full px-4 py-2.5 rounded-xl text-sm text-foreground font-mono focus:outline-none",
                    style: inputStyle
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { className: "block text-[11px] font-bold text-muted-foreground mb-1.5", children: t("studentCode") }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    value: studentCode,
                    onChange: (e) => setStudentCode(e.target.value),
                    required: true,
                    placeholder: "ST10025",
                    dir: "ltr",
                    className: "w-full px-4 py-2.5 rounded-xl text-sm text-foreground font-mono focus:outline-none",
                    style: inputStyle
                  }
                )
              ] }),
              error && /* @__PURE__ */ jsxs(
                "div",
                {
                  className: "flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold",
                  style: { background: "rgba(201,76,76,0.08)", border: "1px solid rgba(201,76,76,0.35)", color: "#C94C4C" },
                  children: [
                    /* @__PURE__ */ jsx(AlertTriangle, { size: 13 }),
                    " ",
                    error
                  ]
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  type: "submit",
                  disabled: busy,
                  className: "w-full py-3 rounded-xl text-sm font-black text-white transition-all disabled:opacity-60",
                  style: { background: "#173F5F" },
                  children: busy ? /* @__PURE__ */ jsx(Loader2, { size: 15, className: "animate-spin mx-auto" }) : t("loginBtn")
                }
              )
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-[10px] text-center mt-4 text-muted-foreground leading-relaxed", children: t("loginPendingNote") }),
            /* @__PURE__ */ jsxs("div", { className: "mt-4 pt-4 text-center", style: { borderTop: "1px solid #E2E8F0" }, children: [
              /* @__PURE__ */ jsxs(
                Link,
                {
                  to: "/login",
                  className: "inline-flex items-center gap-1.5 text-xs font-bold",
                  style: { color: "#2F6690" },
                  children: [
                    /* @__PURE__ */ jsx(ShieldCheck, { size: 13 }),
                    " دخول الإدارة / المعلمين"
                  ]
                }
              ),
              /* @__PURE__ */ jsx("p", { className: "text-[10px] text-muted-foreground mt-1", children: "لإدارة المدارس والطلاب والامتحانات" })
            ] })
          ]
        }
      )
    }
  );
}
function PersonalPlans({ isStudent, hasProfile, busy, onSelect }) {
  useLang();
  const plans = [PLANS.personal_monthly, PLANS.personal_annual];
  return /* @__PURE__ */ jsxs("section", { className: "mb-10", children: [
    /* @__PURE__ */ jsx("h2", { className: "font-black text-base mb-1", children: t("personalPlanSection") }),
    /* @__PURE__ */ jsx("p", { className: "text-[11px] text-muted-foreground mb-4", children: t("personalPlanDesc") }),
    /* @__PURE__ */ jsx("div", { className: "grid sm:grid-cols-2 gap-4", children: plans.map((p) => /* @__PURE__ */ jsxs(
      "div",
      {
        className: "rounded-2xl p-5 bg-card",
        style: { border: `1px solid ${p.highlight ? "rgba(46,125,91,0.4)" : "hsl(var(--border))"}` },
        children: [
          /* @__PURE__ */ jsx("div", { className: "text-[11px] font-black mb-2", style: { color: "#2F6690" }, children: p.period }),
          /* @__PURE__ */ jsx("div", { className: "text-3xl font-black mb-2", children: p.price }),
          p.highlight && /* @__PURE__ */ jsx(
            "div",
            {
              className: "mb-3 px-3 py-2 rounded-xl text-xs font-black text-center",
              style: { background: "rgba(46,125,91,0.1)", border: "1px solid rgba(46,125,91,0.45)", color: "#2E7D5B" },
              children: p.highlight
            }
          ),
          /* @__PURE__ */ jsxs("ul", { className: "text-[11px] text-muted-foreground space-y-1 mb-4", children: [
            /* @__PURE__ */ jsx("li", { children: "• الوصول الكامل للدروس والمختبرات والامتحانات" }),
            /* @__PURE__ */ jsx("li", { children: "• تتبع التقدم الشخصي" })
          ] }),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => onSelect(p.id),
              disabled: !isStudent || hasProfile || busy !== null,
              className: "w-full py-2.5 rounded-xl text-xs font-black text-white transition-all disabled:opacity-50",
              style: { background: "#173F5F" },
              children: busy === p.id ? /* @__PURE__ */ jsx(Loader2, { size: 13, className: "animate-spin mx-auto" }) : hasProfile ? "لديك حساب بالفعل" : !isStudent ? "للطلاب فقط" : "اختيار هذه الخطة"
            }
          )
        ]
      },
      p.id
    )) }),
    !isStudent && /* @__PURE__ */ jsx("p", { className: "text-[10px] text-muted-foreground mt-2", children: "الخطة الشخصية متاحة عند الدخول بحساب طالب" })
  ] });
}
function SchoolPlans({ busy, form, setForm, onSelect }) {
  useLang();
  return /* @__PURE__ */ jsxs("section", { children: [
    /* @__PURE__ */ jsxs("h2", { className: "font-black text-base mb-1 flex items-center gap-2", children: [
      /* @__PURE__ */ jsx(School, { size: 16, style: { color: "#2F6690" } }),
      " ",
      t("schoolPlanSection")
    ] }),
    /* @__PURE__ */ jsx("p", { className: "text-[11px] text-muted-foreground mb-4", children: t("schoolPlanDesc") }),
    /* @__PURE__ */ jsxs(
      "div",
      {
        className: "rounded-2xl p-4 mb-4 grid sm:grid-cols-2 gap-3 bg-card",
        style: { border: "1px solid rgba(47,102,144,0.25)" },
        children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-[10px] font-bold text-muted-foreground mb-1", children: "اسم المدرسة *" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                value: form.name,
                onChange: (e) => setForm({ ...form, name: e.target.value }),
                dir: "rtl",
                className: "w-full px-3 py-2 rounded-xl text-xs bg-transparent focus:outline-none",
                style: { border: "1px solid hsl(var(--border))" }
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-[10px] font-bold text-muted-foreground mb-1", children: "بريد مشرف المدرسة *" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                value: form.email,
                onChange: (e) => setForm({ ...form, email: e.target.value }),
                dir: "ltr",
                className: "w-full px-3 py-2 rounded-xl text-xs bg-transparent focus:outline-none",
                style: { border: "1px solid hsl(var(--border))" }
              }
            )
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsx("div", { className: "grid sm:grid-cols-2 gap-4", children: SCHOOL_TIERS.map((id) => {
      const p = PLANS[id];
      return /* @__PURE__ */ jsxs("div", { className: "rounded-2xl p-5 bg-card", style: { border: "1px solid hsl(var(--border))" }, children: [
        /* @__PURE__ */ jsx("div", { className: "text-[11px] font-black mb-2", style: { color: "#2F6690" }, children: p.label }),
        /* @__PURE__ */ jsx("div", { className: "text-2xl font-black mb-1", children: p.price }),
        /* @__PURE__ */ jsxs("div", { className: "text-[11px] text-muted-foreground mb-4", children: [
          t("studentLimitLabel"),
          ": ",
          p.student_limit,
          " طالب"
        ] }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => onSelect(id),
            disabled: busy !== null,
            className: "w-full py-2.5 rounded-xl text-xs font-black text-white transition-all disabled:opacity-50",
            style: { background: "#173F5F" },
            children: busy === id ? /* @__PURE__ */ jsx(Loader2, { size: 13, className: "animate-spin mx-auto" }) : "اختيار هذه الخطة"
          }
        )
      ] }, id);
    }) })
  ] });
}
function Plans() {
  const { user } = useAuth();
  useLang();
  const [busy, setBusy] = useState(null);
  const [hasProfile, setHasProfile] = useState(false);
  const [schoolDone, setSchoolDone] = useState(null);
  const [schoolForm, setSchoolForm] = useState({ name: "", email: (user == null ? void 0 : user.email) || "" });
  const [error, setError] = useState(null);
  useEffect(() => {
    if (!user || user.role !== "student") return;
    base44.entities.StudentProfile.filter({ user_id: user.id }).then((rows) => setHasProfile((rows || []).length > 0)).catch(() => setHasProfile(false));
  }, [user == null ? void 0 : user.id, user == null ? void 0 : user.role]);
  const uniqueCode = async (prefix) => {
    let code = randomCode(prefix);
    while ((await base44.entities.School.filter({ code })).length > 0) code = randomCode(prefix);
    return code;
  };
  const startPersonal = async (planId) => {
    setBusy(planId);
    setError(null);
    try {
      const code = await uniqueCode("P");
      const school = await base44.entities.School.create({
        name: `${user.full_name || "حساب"} — شخصي`,
        code,
        is_active: true,
        created_by_id: user.id,
        subscription_plan: planId,
        student_limit: 1,
        current_student_count: 0,
        subscription_status: "active"
      });
      let sCode = randomCode("STU-");
      while ((await base44.entities.StudentProfile.filter({ school_id: school.id, student_code: sCode })).length > 0) {
        sCode = randomCode("STU-");
      }
      await base44.entities.StudentProfile.create({
        school_id: school.id,
        student_code: sCode,
        full_name: user.full_name || "طالب",
        email: user.email,
        status: "approved",
        user_id: user.id,
        approved_by: "self",
        approved_at: (/* @__PURE__ */ new Date()).toISOString()
      });
      await base44.auth.updateMe({ school_id: school.id, account_type: "personal" }).catch(() => {
      });
      window.location.href = "/";
    } catch {
      setError("تعذر إنشاء الحساب — حاول مجدداً");
      setBusy(null);
    }
  };
  const submitSchool = async (planId) => {
    if (!schoolForm.name.trim()) {
      setError("أدخل اسم المدرسة أولاً");
      return;
    }
    setBusy(planId);
    setError(null);
    try {
      const code = await uniqueCode("SCH");
      await base44.entities.School.create({
        name: schoolForm.name.trim(),
        code,
        admin_email: schoolForm.email.trim() || (user == null ? void 0 : user.email) || null,
        is_active: false,
        created_by_id: user == null ? void 0 : user.id,
        subscription_plan: planId,
        student_limit: PLANS[planId].student_limit,
        current_student_count: 0,
        subscription_status: "pending"
      });
      setSchoolDone({ code, plan: PLANS[planId].label });
    } catch {
      setError("تعذر تسجيل المدرسة — حاول مجدداً");
    } finally {
      setBusy(null);
    }
  };
  return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-background text-foreground", dir: "rtl", children: /* @__PURE__ */ jsxs("div", { className: "max-w-4xl mx-auto px-4 py-10", children: [
    /* @__PURE__ */ jsxs("div", { className: "text-center mb-10", children: [
      /* @__PURE__ */ jsx(
        "div",
        {
          className: "w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center",
          style: { background: "#173F5F" },
          children: /* @__PURE__ */ jsx(Sparkles, { className: "text-white", size: 24 })
        }
      ),
      /* @__PURE__ */ jsx("h1", { className: "font-black text-2xl mb-1", children: t("plansTitle") }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: t("plansSubtitle") })
    ] }),
    schoolDone ? /* @__PURE__ */ jsxs("div", { className: "rounded-2xl p-8 text-center bg-card", style: { border: "1px solid rgba(46,125,91,0.35)" }, children: [
      /* @__PURE__ */ jsx(CheckCircle2, { size: 40, className: "mx-auto mb-3", style: { color: "#2E7D5B" } }),
      /* @__PURE__ */ jsx("h2", { className: "font-black text-lg mb-2", children: "تم استلام طلب مدرستك ✓" }),
      /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground leading-relaxed", children: [
        "الخطة: ",
        /* @__PURE__ */ jsx("b", { children: schoolDone.plan }),
        /* @__PURE__ */ jsx("br", {}),
        "رمز المدرسة: ",
        /* @__PURE__ */ jsx("span", { className: "font-mono", style: { color: "#2F6690" }, children: schoolDone.code }),
        /* @__PURE__ */ jsx("br", {}),
        /* @__PURE__ */ jsx("br", {}),
        "سيقوم مالك المنصة بتفعيل المدرسة وتعيينك مشرفاً عبر بريدك، عندها يمكنك إضافة طلاب مدرستك برموزهم."
      ] })
    ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(
        PersonalPlans,
        {
          isStudent: (user == null ? void 0 : user.role) === "student",
          hasProfile,
          busy,
          onSelect: startPersonal
        }
      ),
      /* @__PURE__ */ jsx(
        SchoolPlans,
        {
          busy,
          form: schoolForm,
          setForm: setSchoolForm,
          onSelect: submitSchool
        }
      )
    ] }),
    error && /* @__PURE__ */ jsxs(
      "div",
      {
        className: "mt-4 flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-bold",
        style: { background: "rgba(201,76,76,0.08)", border: "1px solid rgba(201,76,76,0.35)", color: "#C94C4C" },
        children: [
          /* @__PURE__ */ jsx(AlertTriangle, { size: 13 }),
          " ",
          error
        ]
      }
    )
  ] }) });
}
function emptyQuestion() {
  return { text: "", type: "mcq", options: ["", "", "", ""], answer: "" };
}
function ExamEditor({ exam, onSave, onCancel }) {
  const [title, setTitle] = useState((exam == null ? void 0 : exam.title) || "");
  const [topicId, setTopicId] = useState((exam == null ? void 0 : exam.topic_id) || "");
  const [topicTitle2, setTopicTitle] = useState((exam == null ? void 0 : exam.topic_title) || "");
  const [sectionTitle2, setSectionTitle] = useState((exam == null ? void 0 : exam.section_title) || "");
  const [questions, setQuestions] = useState((exam == null ? void 0 : exam.questions) || [emptyQuestion()]);
  const [duration, setDuration] = useState((exam == null ? void 0 : exam.duration_minutes) || 30);
  const [status, setStatus] = useState((exam == null ? void 0 : exam.status) || "draft");
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [openQ, setOpenQ] = useState(0);
  const allTopics = courseData.flatMap(
    (section) => section.topics.map((topic) => ({
      id: topic.id,
      title: topic.title,
      sectionTitle: section.title,
      content: topic.content
    }))
  );
  const selectedTopic = allTopics.find((t2) => t2.id === topicId);
  const handleTopicChange = (id) => {
    const t2 = allTopics.find((x) => x.id === id);
    setTopicId(id);
    setTopicTitle((t2 == null ? void 0 : t2.title) || "");
    setSectionTitle((t2 == null ? void 0 : t2.sectionTitle) || "");
    if (!title && t2) setTitle(`امتحان: ${t2.title}`);
  };
  const generateQuestions = async () => {
    if (!selectedTopic) return;
    setGenerating(true);
    try {
      const prompt = `أنت أستاذ شبكات حاسوب متخصص. أنشئ 5 أسئلة امتحان متنوعة باللغة العربية حول الموضوع التالي:

الموضوع: ${selectedTopic.title}
المحتوى: ${selectedTopic.content.slice(0, 1500)}

المطلوب: 3 أسئلة اختيار من متعدد (4 خيارات لكل سؤال) + سؤال صح/خطأ + سؤال إجابة قصيرة.

أجب بـ JSON فقط بهذا الشكل:
[
  {"text": "نص السؤال", "type": "mcq", "options": ["أ", "ب", "ج", "د"], "answer": "الإجابة الصحيحة"},
  {"text": "نص السؤال", "type": "truefalse", "options": ["صح", "خطأ"], "answer": "صح"},
  {"text": "نص السؤال", "type": "short", "options": [], "answer": "الإجابة النموذجية"}
]`;
      const raw = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            questions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  text: { type: "string" },
                  type: { type: "string" },
                  options: { type: "array", items: { type: "string" } },
                  answer: { type: "string" }
                },
                required: ["text", "type", "options", "answer"]
              }
            }
          },
          required: ["questions"]
        }
      });
      const generated = Array.isArray(raw) ? raw : (raw == null ? void 0 : raw.questions) || JSON.parse(raw);
      setQuestions(generated.map((q) => ({
        text: q.text || "",
        type: q.type || "mcq",
        options: q.options || [],
        answer: q.answer || ""
      })));
      setOpenQ(0);
    } catch (e) {
      alert("حدث خطأ أثناء توليد الأسئلة. حاول مرة أخرى.");
    } finally {
      setGenerating(false);
    }
  };
  const updateQuestion = (i, field, value) => {
    setQuestions((prev) => prev.map((q, idx) => idx === i ? { ...q, [field]: value } : q));
  };
  const updateOption = (qi, oi, value) => {
    setQuestions((prev) => prev.map((q, idx) => {
      if (idx !== qi) return q;
      const options = [...q.options];
      options[oi] = value;
      return { ...q, options };
    }));
  };
  const addQuestion = () => {
    setQuestions((prev) => [...prev, emptyQuestion()]);
    setOpenQ(questions.length);
  };
  const removeQuestion = (i) => {
    setQuestions((prev) => prev.filter((_, idx) => idx !== i));
    if (openQ >= i) setOpenQ(Math.max(0, openQ - 1));
  };
  const handleSave = async (newStatus = status) => {
    if (!title.trim()) {
      alert("أدخل عنوان الامتحان");
      return;
    }
    if (questions.length === 0) {
      alert("أضف سؤالاً واحداً على الأقل");
      return;
    }
    setSaving(true);
    try {
      await onSave({
        title: title.trim(),
        topic_id: topicId,
        topic_title: topicTitle2,
        section_title: sectionTitle2,
        questions,
        duration_minutes: duration,
        status: newStatus
      });
    } finally {
      setSaving(false);
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen", style: { background: "#020617" }, children: [
    /* @__PURE__ */ jsxs(
      "div",
      {
        className: "sticky top-0 z-20 flex items-center justify-between px-6 py-3",
        style: { background: "rgba(2,6,23,0.98)", borderBottom: "1px solid rgba(6,182,212,0.15)" },
        children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsxs("button", { onClick: onCancel, className: "flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors text-sm", children: [
              /* @__PURE__ */ jsx(ChevronLeft, { size: 16 }),
              " رجوع"
            ] }),
            /* @__PURE__ */ jsx("span", { className: "text-slate-600", children: "|" }),
            /* @__PURE__ */ jsx("span", { className: "font-black text-sm", style: {
              background: "linear-gradient(90deg,#06b6d4,#a78bfa)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }, children: exam ? "تعديل الامتحان" : "إنشاء امتحان جديد" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: () => handleSave("draft"),
                disabled: saving,
                className: "flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all",
                style: { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", color: "#94a3b8" },
                children: [
                  saving ? /* @__PURE__ */ jsx(Loader2, { size: 12, className: "animate-spin" }) : /* @__PURE__ */ jsx(Save, { size: 12 }),
                  "حفظ مسودة"
                ]
              }
            ),
            /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: () => handleSave("published"),
                disabled: saving,
                className: "flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all hover:brightness-110",
                style: { background: "linear-gradient(135deg,#059669,#10b981)" },
                children: [
                  saving ? /* @__PURE__ */ jsx(Loader2, { size: 12, className: "animate-spin" }) : /* @__PURE__ */ jsx(CheckSquare, { size: 12 }),
                  "نشر الامتحان"
                ]
              }
            )
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "max-w-3xl mx-auto px-6 py-8 space-y-6", children: [
      /* @__PURE__ */ jsxs(
        motion.div,
        {
          initial: { opacity: 0, y: 10 },
          animate: { opacity: 1, y: 0 },
          className: "rounded-2xl p-6",
          style: { background: "rgba(12,20,40,0.95)", border: "1px solid rgba(6,182,212,0.15)" },
          children: [
            /* @__PURE__ */ jsx("h2", { className: "text-sm font-black text-cyan-400 uppercase tracking-wider mb-4", children: "معلومات الامتحان" }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { className: "block text-xs font-bold text-slate-400 mb-1.5", children: "عنوان الامتحان *" }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    value: title,
                    onChange: (e) => setTitle(e.target.value),
                    placeholder: "مثال: امتحان الفصل الثاني - عناوين IP",
                    className: "w-full px-4 py-2.5 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none",
                    style: { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(6,182,212,0.2)", direction: "rtl" },
                    dir: "rtl"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("label", { className: "block text-xs font-bold text-slate-400 mb-1.5", children: "الدرس / الموضوع" }),
                  /* @__PURE__ */ jsxs(
                    "select",
                    {
                      value: topicId,
                      onChange: (e) => handleTopicChange(e.target.value),
                      className: "w-full px-3 py-2.5 rounded-xl text-sm text-white focus:outline-none",
                      style: { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(6,182,212,0.2)", direction: "rtl" },
                      dir: "rtl",
                      children: [
                        /* @__PURE__ */ jsx("option", { value: "", children: "— اختر درساً —" }),
                        courseData.map((section) => /* @__PURE__ */ jsx("optgroup", { label: section.title, children: section.topics.map((topic) => /* @__PURE__ */ jsx("option", { value: topic.id, children: topic.title }, topic.id)) }, section.id))
                      ]
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsxs("label", { className: "block text-xs font-bold text-slate-400 mb-1.5", children: [
                    /* @__PURE__ */ jsx(Clock, { size: 11, className: "inline ml-1" }),
                    "مدة الامتحان (دقيقة)"
                  ] }),
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      type: "number",
                      value: duration,
                      onChange: (e) => setDuration(Number(e.target.value)),
                      min: 5,
                      max: 180,
                      className: "w-full px-4 py-2.5 rounded-xl text-sm text-white focus:outline-none",
                      style: { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(6,182,212,0.2)" }
                    }
                  )
                ] })
              ] })
            ] })
          ]
        }
      ),
      topicId && /* @__PURE__ */ jsxs(
        motion.div,
        {
          initial: { opacity: 0, y: 10 },
          animate: { opacity: 1, y: 0 },
          className: "rounded-2xl p-5 flex items-center justify-between gap-4",
          style: { background: "rgba(139,92,246,0.07)", border: "1px solid rgba(139,92,246,0.25)" },
          children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsxs("div", { className: "text-sm font-black text-purple-300 flex items-center gap-2", children: [
                /* @__PURE__ */ jsx(Sparkles, { size: 14 }),
                " توليد أسئلة بالذكاء الاصطناعي"
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "text-xs text-slate-400 mt-0.5", children: [
                'سيتم توليد 5 أسئلة تلقائية من محتوى درس "',
                topicTitle2,
                '"'
              ] })
            ] }),
            /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: generateQuestions,
                disabled: generating,
                className: "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 disabled:opacity-60 flex-shrink-0",
                style: { background: "linear-gradient(135deg,#7c3aed,#06b6d4)" },
                children: [
                  generating ? /* @__PURE__ */ jsx(Loader2, { size: 13, className: "animate-spin" }) : /* @__PURE__ */ jsx(Sparkles, { size: 13 }),
                  generating ? "جاري التوليد..." : "توليد الأسئلة"
                ]
              }
            )
          ]
        }
      ),
      /* @__PURE__ */ jsxs(motion.div, { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-3", children: [
          /* @__PURE__ */ jsxs("h2", { className: "text-sm font-black text-cyan-400 uppercase tracking-wider", children: [
            "الأسئلة (",
            questions.length,
            ")"
          ] }),
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: addQuestion,
              className: "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all hover:scale-105",
              style: { background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.3)", color: "#06b6d4" },
              children: [
                /* @__PURE__ */ jsx(Plus, { size: 12 }),
                " سؤال جديد"
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsx("div", { className: "space-y-3", children: questions.map((q, qi) => /* @__PURE__ */ jsx(
          QuestionCard,
          {
            index: qi,
            question: q,
            isOpen: openQ === qi,
            onToggle: () => setOpenQ(openQ === qi ? -1 : qi),
            onChange: (field, value) => updateQuestion(qi, field, value),
            onOptionChange: (oi, value) => updateOption(qi, oi, value),
            onRemove: () => removeQuestion(qi)
          },
          qi
        )) })
      ] })
    ] })
  ] });
}
function QuestionCard({ index, question, isOpen, onToggle, onChange, onOptionChange, onRemove }) {
  var _a;
  return /* @__PURE__ */ jsxs("div", { className: "rounded-2xl overflow-hidden", style: { background: "rgba(12,20,40,0.95)", border: "1px solid rgba(6,182,212,0.12)" }, children: [
    /* @__PURE__ */ jsxs(
      "div",
      {
        className: "flex items-center justify-between px-4 py-3 cursor-pointer select-none",
        onClick: onToggle,
        style: { borderBottom: isOpen ? "1px solid rgba(6,182,212,0.1)" : "none" },
        children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsx(
              "span",
              {
                className: "w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0",
                style: { background: "rgba(6,182,212,0.15)", color: "#06b6d4" },
                children: index + 1
              }
            ),
            /* @__PURE__ */ jsx("span", { className: "text-sm text-slate-300 truncate max-w-xs", children: question.text || "سؤال جديد..." }),
            /* @__PURE__ */ jsx("span", { className: "text-[10px] px-2 py-0.5 rounded-full border text-slate-500 border-slate-700 flex-shrink-0", children: (_a = QUESTION_TYPES.find((t2) => t2.value === question.type)) == null ? void 0 : _a.label })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: (e) => {
                  e.stopPropagation();
                  onRemove();
                },
                className: "p-1 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-400/10 transition-colors",
                children: /* @__PURE__ */ jsx(Trash2, { size: 12 })
              }
            ),
            isOpen ? /* @__PURE__ */ jsx(ChevronDown, { size: 14, className: "text-slate-500" }) : /* @__PURE__ */ jsx(ChevronLeft, { size: 14, className: "text-slate-500 -rotate-90" })
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsx(AnimatePresence, { children: isOpen && /* @__PURE__ */ jsx(
      motion.div,
      {
        initial: { height: 0, opacity: 0 },
        animate: { height: "auto", opacity: 1 },
        exit: { height: 0, opacity: 0 },
        className: "overflow-hidden",
        children: /* @__PURE__ */ jsxs("div", { className: "px-4 py-4 space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-[11px] font-bold text-slate-500 mb-1.5", children: "نص السؤال" }),
            /* @__PURE__ */ jsx(
              "textarea",
              {
                value: question.text,
                onChange: (e) => onChange("text", e.target.value),
                placeholder: "اكتب السؤال هنا...",
                rows: 2,
                className: "w-full px-3 py-2 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none resize-none",
                style: { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(6,182,212,0.15)", direction: "rtl" },
                dir: "rtl"
              }
            )
          ] }),
          /* @__PURE__ */ jsx("div", { className: "flex gap-2 flex-wrap", children: QUESTION_TYPES.map((t2) => /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => onChange("type", t2.value),
              className: "px-3 py-1 rounded-lg text-[11px] font-bold transition-all",
              style: {
                background: question.type === t2.value ? "rgba(6,182,212,0.18)" : "rgba(255,255,255,0.03)",
                border: `1px solid ${question.type === t2.value ? "rgba(6,182,212,0.45)" : "rgba(255,255,255,0.07)"}`,
                color: question.type === t2.value ? "#06b6d4" : "#64748b"
              },
              children: t2.label
            },
            t2.value
          )) }),
          question.type === "mcq" && /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-[11px] font-bold text-slate-500 mb-1.5", children: "الخيارات" }),
            /* @__PURE__ */ jsx("div", { className: "space-y-2", children: (question.options.length >= 4 ? question.options : [...question.options, ...Array(4 - question.options.length).fill("")]).slice(0, 4).map((opt, oi) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(
                "span",
                {
                  className: "w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-black flex-shrink-0",
                  style: { background: "rgba(6,182,212,0.1)", color: "#06b6d4" },
                  children: String.fromCharCode(1571 + oi)
                }
              ),
              /* @__PURE__ */ jsx(
                "input",
                {
                  value: opt,
                  onChange: (e) => onOptionChange(oi, e.target.value),
                  placeholder: `الخيار ${oi + 1}`,
                  className: "flex-1 px-3 py-1.5 rounded-lg text-xs text-white placeholder:text-slate-600 focus:outline-none",
                  style: { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(6,182,212,0.12)", direction: "rtl" },
                  dir: "rtl"
                }
              )
            ] }, oi)) })
          ] }),
          question.type === "truefalse" && /* @__PURE__ */ jsx("div", { className: "flex gap-3", children: ["صح", "خطأ"].map((opt) => /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => onChange("answer", opt),
              className: "flex-1 py-2 rounded-xl text-sm font-bold transition-all",
              style: {
                background: question.answer === opt ? opt === "صح" ? "rgba(52,211,153,0.15)" : "rgba(239,68,68,0.15)" : "rgba(255,255,255,0.03)",
                border: `1px solid ${question.answer === opt ? opt === "صح" ? "rgba(52,211,153,0.4)" : "rgba(239,68,68,0.4)" : "rgba(255,255,255,0.07)"}`,
                color: question.answer === opt ? opt === "صح" ? "#34d399" : "#f87171" : "#64748b"
              },
              children: opt
            },
            opt
          )) }),
          question.type !== "truefalse" && /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-[11px] font-bold text-slate-500 mb-1.5", children: question.type === "mcq" ? "الإجابة الصحيحة (اكتب نص الخيار)" : "الإجابة النموذجية" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                value: question.answer,
                onChange: (e) => onChange("answer", e.target.value),
                placeholder: question.type === "mcq" ? "انسخ نص الإجابة الصحيحة" : "الإجابة المثالية...",
                className: "w-full px-3 py-2 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none",
                style: { background: "rgba(52,211,153,0.04)", border: "1px solid rgba(52,211,153,0.2)", direction: "rtl" },
                dir: "rtl"
              }
            )
          ] })
        ] })
      }
    ) })
  ] });
}
const QUESTION_TYPES = [
  { value: "mcq", label: "اختيار من متعدد" },
  { value: "truefalse", label: "صح / خطأ" },
  { value: "short", label: "إجابة قصيرة" }
];
function ExamPreview({ exam, onBack }) {
  var _a;
  const printRef = useRef(null);
  const handlePrint = () => {
    window.print();
  };
  const questionLetters = ["أ", "ب", "ج", "د"];
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("style", { children: `
        @media print {
          body * { visibility: hidden !important; }
          #print-area, #print-area * { visibility: visible !important; }
          #print-area { position: fixed !important; top: 0 !important; left: 0 !important; width: 100% !important; background: white !important; color: black !important; font-family: 'Tajawal', Arial, sans-serif; padding: 20mm !important; direction: rtl !important; }
          .no-print { display: none !important; }
          @page { size: A4; margin: 20mm; }
        }
      ` }),
    /* @__PURE__ */ jsxs("div", { className: "min-h-screen", style: { background: "#020617" }, children: [
      /* @__PURE__ */ jsxs(
        "div",
        {
          className: "no-print sticky top-0 z-20 flex items-center justify-between px-6 py-3",
          style: { background: "rgba(2,6,23,0.98)", borderBottom: "1px solid rgba(6,182,212,0.15)" },
          children: [
            /* @__PURE__ */ jsxs("button", { onClick: onBack, className: "flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors text-sm", children: [
              /* @__PURE__ */ jsx(ChevronLeft, { size: 16 }),
              " رجوع"
            ] }),
            /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2", children: /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: handlePrint,
                className: "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all hover:scale-105",
                style: { background: "linear-gradient(135deg,#0891b2,#7c3aed)" },
                children: [
                  /* @__PURE__ */ jsx(Printer, { size: 14 }),
                  " طباعة الامتحان"
                ]
              }
            ) })
          ]
        }
      ),
      /* @__PURE__ */ jsx("div", { className: "no-print max-w-3xl mx-auto px-6 py-6 mb-4", children: /* @__PURE__ */ jsxs(
        "div",
        {
          className: "rounded-2xl p-4 flex items-center gap-3",
          style: { background: "rgba(6,182,212,0.05)", border: "1px solid rgba(6,182,212,0.2)" },
          children: [
            /* @__PURE__ */ jsx(FileText, { size: 16, className: "text-cyan-400" }),
            /* @__PURE__ */ jsx("span", { className: "text-sm text-slate-300", children: "معاينة ورقة الامتحان — ستُطبع بتنسيق A4" })
          ]
        }
      ) }),
      /* @__PURE__ */ jsx(
        "div",
        {
          id: "print-area",
          ref: printRef,
          className: "max-w-3xl mx-auto px-6 pb-12",
          style: { fontFamily: "'Tajawal', Arial, sans-serif", direction: "rtl" },
          children: /* @__PURE__ */ jsxs(
            motion.div,
            {
              initial: { opacity: 0, y: 10 },
              animate: { opacity: 1, y: 0 },
              className: "rounded-2xl overflow-hidden shadow-2xl",
              style: { background: "white", color: "#1e293b" },
              children: [
                /* @__PURE__ */ jsx("div", { style: { background: "linear-gradient(135deg,#0891b2,#7c3aed)", padding: "28px 32px" }, children: /* @__PURE__ */ jsxs("div", { className: "text-center text-white", children: [
                  /* @__PURE__ */ jsx("div", { className: "text-xs font-bold mb-1 opacity-80", children: "منصة تعلم الشبكات التعليمية" }),
                  /* @__PURE__ */ jsx("h1", { style: { fontSize: 22, fontWeight: 900, margin: "8px 0" }, children: exam.title }),
                  exam.section_title && /* @__PURE__ */ jsxs("div", { className: "text-sm opacity-85", children: [
                    exam.section_title,
                    exam.topic_title ? ` › ${exam.topic_title}` : ""
                  ] })
                ] }) }),
                /* @__PURE__ */ jsxs("div", { style: { padding: "20px 32px", borderBottom: "2px solid #e2e8f0", display: "flex", gap: 24, flexWrap: "wrap" }, children: [
                  /* @__PURE__ */ jsxs("div", { style: { flex: 1, minWidth: 200 }, children: [
                    /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: 6, marginBottom: 6, color: "#64748b", fontSize: 12, fontWeight: 700 }, children: [
                      /* @__PURE__ */ jsx(User, { size: 12 }),
                      " اسم الطالب"
                    ] }),
                    /* @__PURE__ */ jsx("div", { style: { borderBottom: "2px solid #cbd5e1", height: 28, minWidth: 200 } })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { style: { flex: 1, minWidth: 150 }, children: [
                    /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: 6, marginBottom: 6, color: "#64748b", fontSize: 12, fontWeight: 700 }, children: [
                      /* @__PURE__ */ jsx(Calendar, { size: 12 }),
                      " التاريخ"
                    ] }),
                    /* @__PURE__ */ jsx("div", { style: { borderBottom: "2px solid #cbd5e1", height: 28, minWidth: 150 } })
                  ] }),
                  exam.duration_minutes && /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: 6, color: "#64748b", fontSize: 12, fontWeight: 700, alignSelf: "center" }, children: [
                    /* @__PURE__ */ jsx(Clock, { size: 12 }),
                    " المدة: ",
                    exam.duration_minutes,
                    " دقيقة"
                  ] }),
                  /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: 6, color: "#64748b", fontSize: 12, fontWeight: 700, alignSelf: "center" }, children: [
                    /* @__PURE__ */ jsx(FileText, { size: 12 }),
                    " العلامة: ______ / ",
                    ((_a = exam.questions) == null ? void 0 : _a.length) || 0
                  ] })
                ] }),
                /* @__PURE__ */ jsx("div", { style: { padding: "24px 32px" }, children: (exam.questions || []).map((q, qi) => {
                  var _a2;
                  return /* @__PURE__ */ jsxs("div", { style: { marginBottom: 28, pageBreakInside: "avoid" }, children: [
                    /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 10, marginBottom: 12 }, children: [
                      /* @__PURE__ */ jsx("div", { style: {
                        minWidth: 28,
                        height: 28,
                        borderRadius: 8,
                        background: "#0891b2",
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 13,
                        fontWeight: 900,
                        flexShrink: 0
                      }, children: qi + 1 }),
                      /* @__PURE__ */ jsx("p", { style: { fontSize: 15, fontWeight: 700, lineHeight: 1.6, margin: 0, flex: 1 }, children: q.text })
                    ] }),
                    q.type === "mcq" && ((_a2 = q.options) == null ? void 0 : _a2.length) > 0 && /* @__PURE__ */ jsx("div", { style: { paddingRight: 38, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 24px" }, children: q.options.map((opt, oi) => opt ? /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8 }, children: [
                      /* @__PURE__ */ jsx("div", { style: {
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        border: "2px solid #cbd5e1",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 11,
                        fontWeight: 700,
                        color: "#64748b",
                        flexShrink: 0
                      }, children: questionLetters[oi] }),
                      /* @__PURE__ */ jsx("span", { style: { fontSize: 13, color: "#374151" }, children: opt })
                    ] }, oi) : null) }),
                    q.type === "truefalse" && /* @__PURE__ */ jsx("div", { style: { paddingRight: 38, display: "flex", gap: 24 }, children: ["صح", "خطأ"].map((opt) => /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8 }, children: [
                      /* @__PURE__ */ jsx("div", { style: { width: 18, height: 18, borderRadius: "50%", border: "2px solid #cbd5e1" } }),
                      /* @__PURE__ */ jsx("span", { style: { fontSize: 13, color: "#374151", fontWeight: 700 }, children: opt })
                    ] }, opt)) }),
                    q.type === "short" && /* @__PURE__ */ jsxs("div", { style: { paddingRight: 38 }, children: [
                      /* @__PURE__ */ jsx("div", { style: { borderBottom: "1.5px solid #cbd5e1", height: 32, marginBottom: 8 } }),
                      /* @__PURE__ */ jsx("div", { style: { borderBottom: "1.5px solid #cbd5e1", height: 32 } })
                    ] })
                  ] }, qi);
                }) }),
                /* @__PURE__ */ jsx("div", { style: { padding: "16px 32px", borderTop: "2px solid #e2e8f0", textAlign: "center", color: "#94a3b8", fontSize: 11 }, children: "منصة تعلم الشبكات التعليمية — بالتوفيق للجميع 🌐" })
              ]
            }
          )
        }
      )
    ] })
  ] });
}
function ExamManager() {
  const { user, isLoadingAuth } = useAuth();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("list");
  const [selectedExam, setSelectedExam] = useState(null);
  const [adminSchoolId, setAdminSchoolId] = useState("general");
  const isAdmin = (user == null ? void 0 : user.role) === "admin" || (user == null ? void 0 : user.role) === "school_admin";
  useEffect(() => {
    if (isLoadingAuth) return;
    if (!isAdmin) {
      setLoading(false);
      return;
    }
    resolveAdminSchool(user).then((sid) => setAdminSchoolId(sid || "general"));
    base44.entities.Exam.list("-created_date", 100).then((rows) => setExams((user == null ? void 0 : user.school_id) ? (rows || []).filter((e) => e.school_id === user.school_id) : rows || [])).finally(() => setLoading(false));
  }, [isAdmin, isLoadingAuth]);
  const refreshExams = () => base44.entities.Exam.list("-created_date", 100).then((rows) => setExams((user == null ? void 0 : user.school_id) ? (rows || []).filter((e) => e.school_id === user.school_id) : rows || []));
  const deleteExam = async (id) => {
    if (!confirm("هل أنت متأكد من حذف هذا الامتحان؟")) return;
    await base44.entities.Exam.delete(id);
    setExams((prev) => prev.filter((e) => e.id !== id));
  };
  if (isLoadingAuth || loading) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen flex items-center justify-center", style: { background: "#020617" }, children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-3", children: [
      /* @__PURE__ */ jsx(Loader2, { size: 32, className: "animate-spin text-cyan-400" }),
      /* @__PURE__ */ jsx("span", { className: "text-slate-400 text-sm", children: "جاري التحميل..." })
    ] }) });
  }
  if (!isAdmin) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen flex items-center justify-center", style: { background: "#020617" }, children: /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsx(
        "div",
        {
          className: "w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center",
          style: { background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)" },
          children: /* @__PURE__ */ jsx(AlertCircle, { size: 36, className: "text-red-400" })
        }
      ),
      /* @__PURE__ */ jsx("h2", { className: "text-xl font-black text-white mb-2", children: "وصول مقيّد" }),
      /* @__PURE__ */ jsx("p", { className: "text-slate-400 text-sm mb-6", children: "هذه الصفحة للمعلمين والمديرين فقط." }),
      /* @__PURE__ */ jsx(Link, { to: "/", className: "px-4 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-sm hover:bg-cyan-500/20 transition-colors", children: "العودة للرئيسية" })
    ] }) });
  }
  if (view === "edit" && selectedExam) {
    return /* @__PURE__ */ jsx(
      ExamEditor,
      {
        exam: selectedExam,
        onSave: async (data) => {
          await base44.entities.Exam.update(selectedExam.id, data);
          await refreshExams();
          setView("list");
          setSelectedExam(null);
        },
        onCancel: () => {
          setView("list");
          setSelectedExam(null);
        }
      }
    );
  }
  if (view === "create") {
    return /* @__PURE__ */ jsx(
      ExamEditor,
      {
        exam: null,
        onSave: async (data) => {
          await base44.entities.Exam.create({ ...data, school_id: adminSchoolId });
          await refreshExams();
          setView("list");
        },
        onCancel: () => setView("list")
      }
    );
  }
  if (view === "preview" && selectedExam) {
    return /* @__PURE__ */ jsx(
      ExamPreview,
      {
        exam: selectedExam,
        onBack: () => {
          setView("list");
          setSelectedExam(null);
        }
      }
    );
  }
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen", style: { background: "#020617" }, children: [
    /* @__PURE__ */ jsxs(
      "div",
      {
        className: "relative overflow-hidden",
        style: { background: "linear-gradient(135deg,#0d1117 0%,#0d1a2a 50%,#0d1117 100%)", borderBottom: "1px solid rgba(6,182,212,0.2)" },
        children: [
          /* @__PURE__ */ jsx(
            "div",
            {
              className: "absolute inset-0 pointer-events-none",
              style: { backgroundImage: "linear-gradient(rgba(6,182,212,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(6,182,212,0.04) 1px,transparent 1px)", backgroundSize: "40px 40px" }
            }
          ),
          /* @__PURE__ */ jsx("div", { className: "relative max-w-6xl mx-auto px-6 py-8", children: /* @__PURE__ */ jsxs(motion.div, { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-3 text-sm", style: { color: "rgba(6,182,212,0.65)" }, children: [
              /* @__PURE__ */ jsx(Link, { to: "/", className: "hover:text-cyan-300 transition-colors", children: "الرئيسية" }),
              /* @__PURE__ */ jsx(ChevronLeft, { size: 13 }),
              /* @__PURE__ */ jsx("span", { className: "text-cyan-300", children: "لوحة الامتحانات" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between flex-wrap gap-4", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("h1", { className: "text-3xl font-black mb-1", style: {
                  background: "linear-gradient(135deg,#06b6d4,#a78bfa)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent"
                }, children: "📋 إدارة الامتحانات" }),
                /* @__PURE__ */ jsx("p", { className: "text-slate-400 text-sm", children: "إنشاء وإدارة امتحانات مواد الشبكات" })
              ] }),
              /* @__PURE__ */ jsxs(
                "button",
                {
                  onClick: () => setView("create"),
                  className: "flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white transition-all hover:scale-105 hover:brightness-110 text-sm",
                  style: { background: "linear-gradient(135deg,#0891b2,#7c3aed)" },
                  children: [
                    /* @__PURE__ */ jsx(Plus, { size: 16 }),
                    " إنشاء امتحان جديد"
                  ]
                }
              )
            ] })
          ] }) })
        ]
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "max-w-6xl mx-auto px-6 py-8", children: [
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8", children: [
        { label: "إجمالي الامتحانات", value: exams.length, color: "#06b6d4" },
        { label: "منشورة", value: exams.filter((e) => e.status === "published").length, color: "#34d399" },
        { label: "مسودة", value: exams.filter((e) => e.status === "draft").length, color: "#fbbf24" },
        { label: "إجمالي الأسئلة", value: exams.reduce((s, e) => {
          var _a;
          return s + (((_a = e.questions) == null ? void 0 : _a.length) || 0);
        }, 0), color: "#a78bfa" }
      ].map((stat) => /* @__PURE__ */ jsxs(
        motion.div,
        {
          initial: { opacity: 0, y: 10 },
          animate: { opacity: 1, y: 0 },
          className: "rounded-2xl p-4",
          style: { background: "rgba(12,20,40,0.9)", border: `1px solid rgba(${hexToRgb(stat.color)},0.2)` },
          children: [
            /* @__PURE__ */ jsx("div", { className: "text-2xl font-black", style: { color: stat.color }, children: stat.value }),
            /* @__PURE__ */ jsx("div", { className: "text-xs text-slate-400 mt-0.5", children: stat.label })
          ]
        },
        stat.label
      )) }),
      exams.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "text-center py-20", children: [
        /* @__PURE__ */ jsx("div", { className: "text-5xl mb-4", children: "📝" }),
        /* @__PURE__ */ jsx("h3", { className: "text-lg font-bold text-slate-300 mb-2", children: "لا توجد امتحانات بعد" }),
        /* @__PURE__ */ jsx("p", { className: "text-slate-500 text-sm mb-6", children: "ابدأ بإنشاء أول امتحان لطلابك" }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setView("create"),
            className: "px-5 py-2.5 rounded-xl text-sm font-bold text-white",
            style: { background: "linear-gradient(135deg,#0891b2,#7c3aed)" },
            children: "إنشاء امتحان جديد"
          }
        )
      ] }) : /* @__PURE__ */ jsx("div", { className: "grid gap-4", children: exams.map((exam, i) => {
        var _a;
        return /* @__PURE__ */ jsxs(
          motion.div,
          {
            initial: { opacity: 0, y: 10 },
            animate: { opacity: 1, y: 0 },
            transition: { delay: i * 0.04 },
            className: "rounded-2xl p-5 flex items-center justify-between gap-4 flex-wrap",
            style: { background: "rgba(12,20,40,0.9)", border: "1px solid rgba(6,182,212,0.12)" },
            children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
                /* @__PURE__ */ jsx(
                  "div",
                  {
                    className: "w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0",
                    style: { background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.2)" },
                    children: "📋"
                  }
                ),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("h3", { className: "font-black text-white text-base", children: exam.title }),
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mt-1 flex-wrap", children: [
                    exam.topic_title && /* @__PURE__ */ jsxs("span", { className: "text-xs text-slate-400 flex items-center gap-1", children: [
                      /* @__PURE__ */ jsx(BookOpen, { size: 10 }),
                      " ",
                      exam.section_title,
                      " › ",
                      exam.topic_title
                    ] }),
                    /* @__PURE__ */ jsxs("span", { className: "text-xs text-slate-500 flex items-center gap-1", children: [
                      /* @__PURE__ */ jsx(FileText, { size: 10 }),
                      " ",
                      ((_a = exam.questions) == null ? void 0 : _a.length) || 0,
                      " سؤال"
                    ] }),
                    exam.duration_minutes && /* @__PURE__ */ jsxs("span", { className: "text-xs text-slate-500 flex items-center gap-1", children: [
                      /* @__PURE__ */ jsx(Clock, { size: 10 }),
                      " ",
                      exam.duration_minutes,
                      " دقيقة"
                    ] }),
                    /* @__PURE__ */ jsx("span", { className: `text-[10px] px-2 py-0.5 rounded-full font-bold border ${exam.status === "published" ? "text-green-400 bg-green-400/10 border-green-400/30" : "text-amber-400 bg-amber-400/10 border-amber-400/30"}`, children: exam.status === "published" ? "✓ منشور" : "مسودة" })
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxs(
                  "button",
                  {
                    onClick: () => {
                      setSelectedExam(exam);
                      setView("preview");
                    },
                    className: "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all hover:scale-105",
                    style: { background: "rgba(6,182,212,0.08)", border: "1px solid rgba(6,182,212,0.25)", color: "#06b6d4" },
                    children: [
                      /* @__PURE__ */ jsx(Eye, { size: 12 }),
                      " معاينة"
                    ]
                  }
                ),
                /* @__PURE__ */ jsxs(
                  "button",
                  {
                    onClick: () => {
                      setSelectedExam(exam);
                      setView("edit");
                    },
                    className: "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all hover:scale-105",
                    style: { background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.25)", color: "#a78bfa" },
                    children: [
                      /* @__PURE__ */ jsx(Pencil, { size: 12 }),
                      " تعديل"
                    ]
                  }
                ),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: () => deleteExam(exam.id),
                    className: "p-1.5 rounded-xl text-xs transition-all hover:scale-105",
                    style: { background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" },
                    children: /* @__PURE__ */ jsx(Trash2, { size: 12 })
                  }
                )
              ] })
            ]
          },
          exam.id
        );
      }) })
    ] })
  ] });
}
function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}
const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings } = useAuth();
  if (isLoadingPublicSettings || isLoadingAuth) {
    return /* @__PURE__ */ jsx("div", { className: "fixed inset-0 flex items-center justify-center", style: { background: "#F7F9FC" }, children: /* @__PURE__ */ jsx("div", { className: "w-8 h-8 rounded-full animate-spin", style: { border: "3px solid rgba(47,102,144,0.2)", borderTopColor: "#173F5F" } }) });
  }
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(ScrollToTop, {}),
    /* @__PURE__ */ jsxs(Routes, { children: [
      /* @__PURE__ */ jsx(Route$1, { path: "/login", element: /* @__PURE__ */ jsx(Login, {}) }),
      /* @__PURE__ */ jsx(Route$1, { path: "/register", element: /* @__PURE__ */ jsx(Register, {}) }),
      /* @__PURE__ */ jsx(Route$1, { path: "/forgot-password", element: /* @__PURE__ */ jsx(ForgotPassword, {}) }),
      /* @__PURE__ */ jsx(Route$1, { path: "/reset-password", element: /* @__PURE__ */ jsx(ResetPassword, {}) }),
      /* @__PURE__ */ jsx(Route$1, { path: "/student-login", element: /* @__PURE__ */ jsx(StudentLogin, {}) }),
      /* @__PURE__ */ jsxs(Route$1, { element: /* @__PURE__ */ jsx(ProtectedRoute, { unauthenticatedElement: /* @__PURE__ */ jsx(Navigate, { to: "/login", replace: true }) }), children: [
        /* @__PURE__ */ jsx(Route$1, { path: "/plans", element: /* @__PURE__ */ jsx(Plans, {}) }),
        /* @__PURE__ */ jsxs(Route$1, { element: /* @__PURE__ */ jsx(Layout, {}), children: [
          /* @__PURE__ */ jsx(Route$1, { path: "/admin/schools", element: /* @__PURE__ */ jsx(SchoolsManager, {}) }),
          /* @__PURE__ */ jsx(Route$1, { path: "/admin/school-students", element: /* @__PURE__ */ jsx(SchoolStudents, {}) }),
          /* @__PURE__ */ jsx(Route$1, { path: "/admin/students", element: /* @__PURE__ */ jsx(AdminStudentsReport, {}) }),
          /* @__PURE__ */ jsx(Route$1, { path: "/admin/exams", element: /* @__PURE__ */ jsx(ExamManager, {}) }),
          /* @__PURE__ */ jsx(Route$1, { path: "/admin/exam-results", element: /* @__PURE__ */ jsx(ExamResults, {}) })
        ] })
      ] }),
      /* @__PURE__ */ jsx(Route$1, { element: /* @__PURE__ */ jsx(StudentGuard, {}), children: /* @__PURE__ */ jsxs(Route$1, { element: /* @__PURE__ */ jsx(Layout, {}), children: [
        /* @__PURE__ */ jsx(Route$1, { path: "/", element: /* @__PURE__ */ jsx(Home, {}) }),
        /* @__PURE__ */ jsx(Route$1, { path: "/topic/:sectionId/:topicId", element: /* @__PURE__ */ jsx(TopicPage, {}) }),
        /* @__PURE__ */ jsx(Route$1, { path: "/network-simulator", element: /* @__PURE__ */ jsx(NetworkSimulator, {}) }),
        /* @__PURE__ */ jsx(Route$1, { path: "/dashboard", element: /* @__PURE__ */ jsx(Dashboard, {}) }),
        /* @__PURE__ */ jsx(Route$1, { path: "/scenario-lab", element: /* @__PURE__ */ jsx(ScenarioLab, {}) }),
        /* @__PURE__ */ jsx(Route$1, { path: "/lab-history", element: /* @__PURE__ */ jsx(LabHistory, {}) }),
        /* @__PURE__ */ jsx(Route$1, { path: "/exams", element: /* @__PURE__ */ jsx(Exams, {}) }),
        /* @__PURE__ */ jsx(Route$1, { path: "/exams/:examId", element: /* @__PURE__ */ jsx(TakeExam, {}) }),
        /* @__PURE__ */ jsx(Route$1, { path: "/settings", element: /* @__PURE__ */ jsx(Settings, {}) })
      ] }) }),
      /* @__PURE__ */ jsx(Route$1, { path: "*", element: /* @__PURE__ */ jsx(PageNotFound, {}) })
    ] })
  ] });
};
function App() {
  return /* @__PURE__ */ jsx(AuthProvider, { children: /* @__PURE__ */ jsxs(QueryClientProvider, { client: queryClientInstance, children: [
    /* @__PURE__ */ jsx(BrowserRouter, { children: /* @__PURE__ */ jsx(AuthenticatedApp, {}) }),
    /* @__PURE__ */ jsx(Toaster, {})
  ] }) });
}
function tryRender(name, Component, wrap) {
  try {
    const el = wrap ? wrap(React__default.createElement(Component)) : React__default.createElement(Component);
    const html = renderToString(el);
    console.log(`OK   ${name} (${html.length} chars)`);
  } catch (e) {
    console.error(`FAIL ${name}:`, e && e.stack ? e.stack.split("\n").slice(0, 6).join("\n") : e);
  }
}
const fullWrap = (el) => React__default.createElement(
  QueryClientProvider,
  { client: queryClientInstance },
  React__default.createElement(AuthProvider, null, React__default.createElement(MemoryRouter, null, el))
);
tryRender("App", App, fullWrap);
tryRender("StudentLogin", StudentLogin, fullWrap);
tryRender("Home", Home, fullWrap);
tryRender("Dashboard", Dashboard, fullWrap);
tryRender("LabHistory", LabHistory, fullWrap);
tryRender("Exams", Exams, fullWrap);
tryRender("ScenarioLab", ScenarioLab, fullWrap);
tryRender("Settings", Settings, fullWrap);
tryRender("Layout", Layout, fullWrap);
tryRender("NetworkSimulator", NetworkSimulator, fullWrap);
tryRender("TopicPage", TopicPage, fullWrap);
tryRender("TakeExam", TakeExam, fullWrap);
console.log("SMOKE DONE");
