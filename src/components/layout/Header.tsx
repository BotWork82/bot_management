import { useLocation } from "react-router-dom";
import { Input } from "../ui/input";
import { Bell, Menu } from "lucide-react";
import { pageIconMap } from "../ui/icons";

const titles: Record<string, string> = {
  "/": "Dashboard",
  "/products": "Products",
  "/categories": "Categories",
  "/farms": "Farms",
  "/messages": "Bot Messages",
  "/media": "Media",
  "/statistics": "Statistics",
  "/users": "Users",
  "/settings": "Settings"
};

export function Header({ onOpenSidebar }: { onOpenSidebar?: () => void }) {
  const location = useLocation();
  const title = titles[location.pathname] ?? "Dashboard";
  const Icon = pageIconMap[location.pathname] ?? null;

  return (
    <header className="h-16 border-b flex items-center justify-between px-4 md:px-6 bg-background/80">
      <div className="flex items-center gap-3">
        <button
          className="md:hidden h-9 w-9 rounded-md flex items-center justify-center text-slate-600"
          onClick={() => onOpenSidebar && onOpenSidebar()}
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-3">
          {Icon ? (
            <span className="h-9 w-9 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center">
              <Icon className="h-5 w-5" aria-hidden />
            </span>
          ) : null}
          <div className="text-2xl font-semibold tracking-tight">{title}</div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        {/*<div className="relative w-64">*/}
        {/*  <Input*/}
        {/*    placeholder="Search..."*/}
        {/*    className="h-10 rounded-full pl-10 bg-muted/60 border-none"*/}
        {/*  />*/}
        {/*  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">*/}
        {/*    🔍*/}
        {/*  </span>*/}
        {/*</div>*/}
        <button className="relative h-9 w-9 rounded-full bg-muted flex items-center justify-center text-slate-500">
          <Bell className="h-4 w-4" />
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-blue-600 text-[10px] text-white flex items-center justify-center">
            3
          </span>
        </button>
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-semibold text-blue-700">
            A
          </div>
        </div>
      </div>
    </header>
  );
}
