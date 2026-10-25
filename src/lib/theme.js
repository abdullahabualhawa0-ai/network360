export function getTheme() {
  try {
    return localStorage.getItem("app-theme") || "dark";
  } catch {
    return "dark";
  }
}

export function applyTheme(theme) {
  try {
    localStorage.setItem("app-theme", theme);
  } catch {}
  const isDark =
    theme === "dark" ||
    (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  if (isDark) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
  window.dispatchEvent(new Event("app-theme-change"));
}