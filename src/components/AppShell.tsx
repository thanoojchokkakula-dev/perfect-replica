import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";
import {
  Home,
  Mail,
  Phone,
  Map,
  Contact,
  Smartphone,
  User,
  LogOut,
  Menu,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { useSelectedDevice } from "@/lib/tracker";

const navItems = [
  { label: "Dashboard", icon: Home, to: "/dashboard" as const },
  { label: "SMS", icon: Mail, to: "/sms" as const },
  { label: "Calls", icon: Phone, to: "/calls" as const },
  { label: "Locations", icon: Map, to: "/locations" as const },
  { label: "Contacts", icon: Contact, to: "/contacts" as const },
  { label: "Add phone", icon: Smartphone, to: "/add-phone" as const },
];

export function AppShell({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof Home;
  children: ReactNode;
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { devices, device, select } = useSelectedDevice();

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <div className="flex min-h-screen">
        <aside className="hidden w-[280px] shrink-0 bg-[var(--sidebar)] text-[var(--sidebar-foreground)] lg:block">
          <div className="flex h-[80px] items-center gap-3 bg-[var(--topbar)] px-6">
            <span className="flex size-7 items-center justify-center rounded-full bg-brand text-[15px] font-bold text-[var(--topbar)]">
              M
            </span>
            <div className="leading-none">
              <span className="text-[22px] font-semibold text-[var(--topbar-foreground)]">Mobile</span>
              <span className="text-[22px] font-light text-[var(--topbar-foreground)]">Tracker</span>
            </div>
            <Menu className="ml-auto size-6 text-[var(--topbar-foreground)]" strokeWidth={2} />
          </div>

          <nav>
            {navItems.map(({ label, icon: ItemIcon, to }) => (
              <Link
                key={label}
                to={to}
                className={`flex items-center gap-5 border-b border-[var(--sidebar-border)] px-7 py-4 text-[17px] font-light transition-colors hover:bg-[var(--sidebar-accent)] ${
                  pathname === to ? "bg-[var(--sidebar-accent)] text-brand" : ""
                }`}
              >
                <ItemIcon className="size-5 opacity-90" strokeWidth={1.5} />
                <span className="flex-1">{label}</span>
              </Link>
            ))}
          </nav>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-[80px] items-center gap-4 bg-[var(--topbar)] px-6 text-[var(--topbar-foreground)]">
            <span className="text-[20px] font-light lg:hidden">MobileTracker</span>
            {devices.length > 0 && (
              <select
                aria-label="Selected phone"
                value={device?.id ?? ""}
                onChange={(e) => select(e.target.value)}
                className="ml-auto rounded-sm border border-white/20 bg-transparent px-3 py-2 text-sm"
              >
                {devices.map((d) => (
                  <option key={d.id} value={d.id} className="text-foreground">
                    {d.name} — {d.model}
                  </option>
                ))}
              </select>
            )}
            <div className={devices.length > 0 ? "flex items-center gap-6" : "ml-auto flex items-center gap-6"}>
              <User className="size-6" strokeWidth={1.5} />
              <button onClick={handleSignOut} aria-label="Sign out">
                <LogOut className="size-6" strokeWidth={1.5} />
              </button>
            </div>
          </header>

          <nav className="flex gap-1 overflow-x-auto bg-[var(--sidebar)] px-3 py-2 text-[var(--sidebar-foreground)] lg:hidden">
            {navItems.map(({ label, to }) => (
              <Link
                key={label}
                to={to}
                className={`whitespace-nowrap rounded-sm px-3 py-2 text-sm ${
                  pathname === to ? "bg-[var(--sidebar-accent)] text-brand" : ""
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>

          <main className="px-4 py-6 md:px-8">
            <section className="rounded-sm border border-border bg-card">
              <div className="px-6 py-6 md:px-8">
                <h1 className="flex items-center gap-3 text-[20px] font-semibold uppercase tracking-wide text-brand">
                  <Icon className="size-6" strokeWidth={1.5} />
                  {title}
                </h1>
              </div>
              <div className="border-t border-border">{children}</div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return <p className="px-6 py-12 text-center text-lg font-light text-muted-foreground md:px-8">{message}</p>;
}
