import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, LogOut, Settings, ChevronDown, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useAuth from "../../lib/auth/useAuth";
import BrandLogo from "../common/BrandLogo";
import ThemeToggle from "../common/ThemeToggle";
import { ROLE_LABEL, ROLE_HOME } from "../../config/navigation";

/**
 * Unified topbar for every role: mobile menu button, brand logo,
 * theme toggle and the account menu.
 */
export default function DashboardTopbar({ role, onMenuClick, sidebarCollapsed = false }) {
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const profilePath = role === "admin" ? "/dashboard/profile" : `${ROLE_HOME_PATH(role)}/profile`;

  return (
    <header className="h-20 bg-[rgb(var(--zx-surface))]/90 backdrop-blur-md border-b border-[rgb(var(--zx-border))] flex items-center justify-between px-4 sm:px-8 sticky top-0 z-30 shrink-0">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
          className="lg:hidden p-2.5 rounded-xl border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text-muted))] hover:text-brand-teal-600 dark:hover:text-brand-teal-300 transition-colors"
        >
          <Menu size={20} />
        </button>

        {/*
          | Exactly one primary logo is visible at a time:
          |  - sidebar expanded  -> logo lives in the sidebar
          |  - sidebar collapsed -> logo moves to the topbar
          |  - mobile            -> drawer carries its own logo
          */}
        <div className={`hidden lg:block ${sidebarCollapsed ? "" : "lg:hidden"}`}>
          <BrandLogo className="h-9 w-auto" />
        </div>
        <div className="lg:hidden">
          <BrandLogo className="h-9 w-auto" />
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-5">
        <ThemeToggle />

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            aria-haspopup="menu"
            aria-expanded={isDropdownOpen}
            className="flex items-center gap-3 p-2 pr-3 sm:pr-4 rounded-2xl hover:bg-[rgb(var(--zx-surface-hover))] border border-transparent hover:border-[rgb(var(--zx-border))] transition-all duration-200 group"
          >
            <div className="text-right leading-tight hidden sm:block px-1">
              <div className="text-sm font-bold text-[rgb(var(--zx-text))] group-hover:text-brand-teal-600 dark:group-hover:text-brand-teal-300 transition-colors">
                {user?.name || "User Name"}
              </div>
              <div className="text-[11px] font-semibold text-[rgb(var(--zx-text-muted))] uppercase tracking-widest mt-0.5">
                {ROLE_LABEL[role] || user?.role || "Member"}
              </div>
            </div>

            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-brand-teal-500 to-brand-blue-700 flex items-center justify-center text-white shadow-lg shadow-brand-teal-500/20 group-hover:rotate-3 transition-transform">
              <User size={22} />
            </div>

            <ChevronDown
              size={16}
              className={`text-[rgb(var(--zx-text-muted))] transition-transform duration-300 ${isDropdownOpen ? "rotate-180" : ""}`}
            />
          </button>

          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 15, scale: 0.95 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                role="menu"
                className="absolute right-0 mt-3 w-60 bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] rounded-2xl shadow-2xl overflow-hidden py-2 z-50"
              >
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    navigate(profilePath);
                  }}
                  className="w-full flex items-center gap-3.5 px-5 py-3 text-sm font-medium text-[rgb(var(--zx-text))] hover:bg-[rgb(var(--zx-surface-hover))] hover:text-brand-teal-600 dark:hover:text-brand-teal-300 transition-colors"
                >
                  <Settings size={18} className="text-[rgb(var(--zx-text-muted))]" />
                  Manage Profile
                </button>
                <div className="h-px bg-[rgb(var(--zx-border))] mx-3 my-1.5" />
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-3.5 px-5 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                >
                  <LogOut size={18} />
                  Logout Account
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}

function ROLE_HOME_PATH(role) {
  return { admin: "/dashboard", student: "/student", faculty: "/faculty", franchise: "/franchise", employee: "/employee" }[role] || "/";
}
