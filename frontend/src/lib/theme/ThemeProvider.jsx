import { createContext, useContext, useEffect, useState, useCallback } from "react";

/**
 * Theme is applied by toggling the standard `dark` class on <html>.
 *
 * Auth pages (login, register, forgot-password) are not affected because
 * their dark-mode styles are CSS-scoped to the `[data-app="true"]`
 * wrapper, which the app shell adds and auth pages do not.
 *
 * The class is the same Tailwind and most libraries expect; only our
 * custom rules in index.css have been rewritten to use the scoped
 * selector `.dark [data-app="true"]`.
 */
const ThemeContext = createContext(null);
const STORAGE_KEY = "zyncro-theme";

function getInitialTheme() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "dark" || stored === "light") return stored;
  } catch {
    // localStorage unavailable — fall back to light
  }
  return "light"; // light is the default experience
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // ignore persistence failures
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark: theme === "dark" }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
}
