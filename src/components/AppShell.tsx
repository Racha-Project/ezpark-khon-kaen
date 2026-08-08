import { useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  BarChart3,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  ParkingCircle,
  User,
  X,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { useProfile, useZones, useRealtimeParking } from "@/lib/parking";
import { useNotifications, useNotificationScheduler } from "@/lib/notifications";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/check-in", label: "Check In", icon: LogIn },
  { to: "/check-out", label: "Check Out", icon: LogOut },
  { to: "/statistics", label: "Statistics", icon: BarChart3 },
  { to: "/profile", label: "Profile", icon: User },
] as const;

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex min-w-0 items-center gap-2">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground shadow-soft">
        <ParkingCircle className="h-5 w-5" />
      </span>
      {!compact && <span className="truncate text-lg font-bold">Ezpark.com</span>}
    </span>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { data: profile } = useProfile();
  const { data: zones } = useZones();
  const { data: notifications } = useNotifications();

  useRealtimeParking();
  useNotificationScheduler(zones);

  const unread = (notifications ?? []).filter((n) => !n.read).length;

  const markRead = async () => {
    if (!unread) return;
    await supabase.from("notifications").update({ read: true }).eq("read", false);
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
  };

  const signOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur">
        <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3">
          <div className="flex min-w-0 items-center gap-6">
            <Link to="/dashboard" className="min-w-0">
              <Logo />
            </Link>
            <nav className="hidden items-center gap-1 md:flex">
              {NAV.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted",
                    pathname === item.to && "bg-primary-soft text-primary-dark",
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <DropdownMenu onOpenChange={(open) => open && void markRead()}>
              <DropdownMenuTrigger className="relative grid h-10 w-10 place-items-center rounded-xl transition-colors hover:bg-muted">
                <Bell className="h-5 w-5" />
                {unread > 0 && (
                  <span className="absolute right-1.5 top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
                    {unread}
                  </span>
                )}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>🔔 การแจ้งเตือน</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {(notifications ?? []).length === 0 ? (
                  <p className="px-2 py-4 text-center text-sm text-muted-foreground">
                    ยังไม่มีการแจ้งเตือน
                  </p>
                ) : (
                  (notifications ?? []).slice(0, 8).map((n) => (
                    <div key={n.id} className="border-b border-border/60 px-2 py-2 last:border-0">
                      <p className="text-sm font-medium">{n.title}</p>
                      <p className="text-xs text-muted-foreground">{n.message}</p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        {new Date(n.created_at).toLocaleString("th-TH")}
                      </p>
                    </div>
                  ))
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 rounded-xl px-2 py-1.5 transition-colors hover:bg-muted">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary-soft text-sm font-bold text-primary-dark">
                  {(profile?.name || profile?.username || "U").charAt(0).toUpperCase()}
                </span>
                <span className="hidden max-w-28 truncate text-sm font-medium sm:block">
                  {profile?.name || profile?.username || "ผู้ใช้"}
                </span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{profile?.username ?? "บัญชีของฉัน"}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile">โปรไฟล์</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => void signOut()}>ออกจากระบบ</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="grid h-10 w-10 place-items-center rounded-xl hover:bg-muted md:hidden"
              aria-label="เมนู"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav className="border-t border-border bg-card px-4 py-2 md:hidden">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMenuOpen(false)}
                className="block rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-border bg-card md:hidden">
        {NAV.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={cn(
              "flex flex-col items-center gap-1 py-2.5 text-[11px] text-muted-foreground",
              pathname === item.to && "text-primary",
            )}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
