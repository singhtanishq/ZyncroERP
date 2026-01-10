import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, ChevronDown, ChevronLeft, X } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import BrandLogo from "../common/BrandLogo";
import { navForRole, ROLE_HOME } from "../../config/navigation";

/**
 * Unified sidebar for every role. Visual identity is shared; only the
 * modules differ. Collapses on desktop, becomes an overlay drawer on
 * mobile (when `mobileOpen`/`setMobileOpen` are provided).
 */
export default function DashboardSidebar({ role, collapsed = false, setCollapsed, mobileOpen = false, onMobileNavigate }) {
  const [openKey, setOpenKey] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const navigate = useNavigate();
  const location = useLocation();

  const modules = navForRole(role);
  const home = ROLE_HOME[role] || "/";

  useEffect(() => {
    const currentPath = location.pathname;

    if (currentPath === home || currentPath === `${home}/`) {
      setActiveTab("dashboard");
      setOpenKey(null);
      return;
    }

    const activeModule = modules.find((mod) =>
      mod.items.some((item) => item.path && currentPath.startsWith(item.path))
    );

    if (activeModule) {
      setActiveTab(activeModule.key);
      if (!collapsed) setOpenKey(activeModule.key);
    }
  }, [location.pathname, collapsed, home, modules]);

  const go = (path) => {
    navigate(path);
    onMobileNavigate?.();
  };

  const toggleModule = (key) => {
    if (collapsed) {
      setCollapsed?.(false);
      setOpenKey(key);
      setActiveTab(key);
      return;
    }
    const isClosing = openKey === key;
    setOpenKey(isClosing ? null : key);
    setActiveTab(isClosing ? "dashboard" : key);
  };

  const nav = (
    <nav className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-6 space-y-1.5 zx-scroll">
      <div className="relative group px-1">
        <button
          onClick={() => {
            setActiveTab("dashboard");
            setOpenKey(null);
            go(home);
          }}
          className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${
            activeTab === "dashboard"
              ? "bg-brand-teal-500 text-white shadow-lg shadow-brand-teal-500/25"
              : "text-[rgb(var(--zx-text))] hover:bg-[rgb(var(--zx-surface))] hover:shadow-md hover:text-brand-teal-600 dark:hover:text-brand-teal-300"
          }`}
        >
          <div
            className={`p-1 rounded-lg transition-colors ${
              activeTab === "dashboard"
                ? "bg-white/20"
                : "bg-[rgb(var(--zx-surface-hover))] group-hover:bg-brand-teal-500/10"
            }`}
          >
            <LayoutDashboard size={20} />
          </div>
          {!collapsed && <span className="text-sm tracking-wide font-bold">Dashboard</span>}
        </button>
      </div>

      <div className="h-px bg-[rgb(var(--zx-border))] mx-3 my-4 opacity-60" />

      {modules.map((mod) => {
        const Icon = mod.icon;
        const isOpen = openKey === mod.key;
        const isActive = activeTab === mod.key;
        const singleItem = mod.items.length === 1;

        return (
          <div key={mod.key} className="relative px-1 group">
            <button
              onClick={() => {
                // Single-item modules navigate directly.
                if (singleItem && mod.items[0].path) {
                  setActiveTab(mod.key);
                  setOpenKey(null);
                  go(mod.items[0].path);
                  return;
                }
                toggleModule(mod.key);
              }}
              className={`w-full flex items-center justify-between px-3 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? "bg-brand-teal-500 text-white shadow-lg shadow-brand-teal-500/25"
                  : "text-[rgb(var(--zx-text))] hover:bg-[rgb(var(--zx-surface))] hover:shadow-md hover:text-brand-teal-600 dark:hover:text-brand-teal-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-1 rounded-lg transition-colors ${
                    isActive
                      ? "bg-white/20"
                      : "bg-[rgb(var(--zx-surface-hover))] group-hover:bg-brand-teal-500/10"
                  }`}
                >
                  <Icon size={20} />
                </div>
                {!collapsed && <span className="text-sm tracking-wide font-bold">{mod.title}</span>}
              </div>
              {!collapsed && !singleItem && (
                <ChevronDown
                  size={16}
                  className={`transition-transform duration-300 ${isOpen ? "rotate-180" : "opacity-40"}`}
                />
              )}
            </button>

            <AnimatePresence>
              {!collapsed && isOpen && !singleItem && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-2 ml-6 pl-4 border-l-2 border-brand-teal-500/20 space-y-1">
                    {mod.items.map((item, idx) => {
                      const isSubActive = item.path && location.pathname === item.path;

                      return (
                        <div
                          key={idx}
                          onClick={() => item.path && go(item.path)}
                          className={`text-sm font-medium px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                            item.path
                              ? isSubActive
                                ? "text-brand-teal-600 dark:text-brand-teal-300 bg-brand-teal-500/10"
                                : "text-[rgb(var(--zx-text-muted))] hover:text-brand-teal-600 dark:hover:text-brand-teal-300 hover:bg-brand-teal-500/5"
                              : "text-[rgb(var(--zx-text-muted))] opacity-50 cursor-not-allowed"
                          }`}
                        >
                          {item.label}
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 90 : 310 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="hidden lg:flex h-screen bg-[rgb(var(--zx-surface))] border-r border-[rgb(var(--zx-border))] flex-col sticky top-0 left-0 overflow-hidden shadow-sm z-40 shrink-0"
      >
        <div className="h-20 flex items-center justify-between px-6 border-b border-[rgb(var(--zx-border))] shrink-0">
          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.div
                key="sidebar-logo"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
              >
                <BrandLogo className="h-10 w-auto" />
              </motion.div>
            )}
          </AnimatePresence>

          {collapsed && (
            <button
              onClick={() => setCollapsed?.(!collapsed)}
              aria-label="Expand sidebar"
              className="p-2 rounded-xl bg-[rgb(var(--zx-surface-hover))] border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text-muted))] hover:text-brand-teal-600 dark:hover:text-brand-teal-300 transition-all duration-200"
            >
              <ChevronLeft size={18} className="rotate-180" />
            </button>
          )}

          {!collapsed && (
            <button
              onClick={() => setCollapsed?.(!collapsed)}
              aria-label="Collapse sidebar"
              className="p-2 rounded-xl bg-[rgb(var(--zx-surface-hover))] border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text-muted))] hover:text-brand-teal-600 dark:hover:text-brand-teal-300 transition-all duration-200"
            >
              <ChevronLeft size={18} />
            </button>
          )}
        </div>

        {nav}
      </motion.aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onMobileNavigate}
              className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm z-50 lg:hidden"
            />
            <motion.aside
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="fixed inset-y-0 left-0 w-[300px] bg-[rgb(var(--zx-surface))] border-r border-[rgb(var(--zx-border))] flex flex-col z-50 lg:hidden"
            >
              <div className="h-20 flex items-center justify-between px-6 border-b border-[rgb(var(--zx-border))] shrink-0">
                <BrandLogo className="h-10 w-auto" />
                <button
                  onClick={onMobileNavigate}
                  aria-label="Close menu"
                  className="p-2 rounded-xl bg-[rgb(var(--zx-surface-hover))] border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text-muted))]"
                >
                  <X size={18} />
                </button>
              </div>
              {nav}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
