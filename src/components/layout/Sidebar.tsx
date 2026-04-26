import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Layers,
  Sprout,
  MessageSquare,
  Images,
  BarChart3,
  Users,
  Settings,
  X
} from "lucide-react";
import { cn } from "../../lib/utils";
import { useEffect } from "react";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/products", label: "Products", icon: Package },
  { to: "/categories", label: "Categories", icon: Layers },
  { to: "/farms", label: "Farms", icon: Sprout },
  { to: "/messages", label: "Bot Messages", icon: MessageSquare },
  { to: "/media", label: "Media", icon: Images },
  { to: "/users", label: "Users", icon: Users },
  { to: "/settings", label: "Settings", icon: Settings }
];

export function Sidebar({ open = false, onClose }: { open?: boolean; onClose?: () => void }) {
  const location = useLocation();

  useEffect(() => {
    // Close mobile sidebar automatically on route change
    if (open && onClose) onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // Only keep automatic close behavior on route change. Do not lock body overflow here.

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:flex-col w-64 border-r bg-card">
        <div className="h-16 flex items-center px-5 border-b">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-blue-600 text-white flex items-center justify-center text-sm font-semibold">
              T
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold text-foreground">TeleBot</span>
              <span className="text-[11px] text-muted-foreground">Manager</span>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-blue-50 hover:text-blue-600 transition-colors",
                    isActive &&
                      "bg-blue-600 text-white hover:bg-blue-600 hover:text-white shadow-sm"
                  )
                }
              >
                <span className={cn("flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500", "transition-colors")}>
                  <Icon className="h-4 w-4" />
                </span>
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
        <div className="border-t px-4 py-4 mt-auto">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-semibold text-slate-700">
              A
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-medium text-foreground">Admin User</span>
              <span className="text-[11px] text-muted-foreground">Admin</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      <div className={`fixed inset-0 z-40 md:hidden ${open ? "" : "pointer-events-none"}`} aria-hidden={open ? "false" : "true"}>
        <div className={`fixed inset-0 bg-black/40 transition-opacity ${open ? "opacity-100" : "opacity-0"}`} onClick={() => onClose && onClose()} />
        <aside className={`fixed left-0 top-0 h-full w-64 bg-card shadow-xl transform transition-transform ${open ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="h-16 flex items-center justify-between px-4 border-b">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-blue-600 text-white flex items-center justify-center text-sm font-semibold">T</div>
              <div className="flex flex-col leading-tight">
                <span className="text-sm font-semibold text-foreground">TeleBot</span>
                <span className="text-[11px] text-muted-foreground">Manager</span>
              </div>
            </div>
            <button className="h-8 w-8 flex items-center justify-center" onClick={() => onClose && onClose()} aria-label="Close sidebar">
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="px-2 py-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/"}
                  onClick={() => onClose && onClose()}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-blue-50 hover:text-blue-600 transition-colors",
                      isActive &&
                        "bg-blue-600 text-white hover:bg-blue-600 hover:text-white shadow-sm"
                    )
                  }
                >
                  <span className={cn("flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500", "transition-colors")}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </aside>
      </div>
    </>
  );
}
