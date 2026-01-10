import { useTheme } from "../../lib/theme/ThemeProvider";
import { Moon, Sun } from "lucide-react";

/**
 * Light/dark mode toggle. Light is the default; the choice is persisted.
 */
export default function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="p-2.5 rounded-xl border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text-muted))] hover:text-[rgb(var(--zx-primary))] hover:bg-[rgb(var(--zx-surface-hover))] transition-colors"
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
