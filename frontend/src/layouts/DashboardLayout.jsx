import { useState } from "react";
import { Outlet } from "react-router-dom";
import DashboardSidebar from "../components/layout/DashboardSidebar";
import DashboardTopbar from "../components/layout/DashboardTopbar";

/**
 * Unified dashboard shell used by every role. The role selects the
 * navigation; the visual system is shared.
 *
 * `data-app="true"` is the boundary used by the global CSS to scope
 * dark-mode styles. Public auth pages (login, register, etc.) sit
 * OUTSIDE this boundary, so they are always light.
 */
export default function DashboardLayout({ role = "admin" }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div data-app="true" className="flex h-screen bg-[rgb(var(--zx-bg))] overflow-hidden">
      <DashboardSidebar
        role={role}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        onMobileNavigate={() => setMobileOpen(false)}
      />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <DashboardTopbar role={role} onMenuClick={() => setMobileOpen(true)} sidebarCollapsed={collapsed} />

        <main className="flex-1 overflow-y-auto zx-scroll p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
