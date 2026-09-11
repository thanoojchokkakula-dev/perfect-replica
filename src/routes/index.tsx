import { createFileRoute } from "@tanstack/react-router";
import {
  Home,
  Mail,
  Image as ImageIcon,
  Phone,
  Map,
  Images,
  Compass,
  Calendar,
  Contact,
  Globe,
  Clipboard,
  ChevronLeft,
  Menu,
  User,
  ShoppingBasket,
  LogOut,
  Smartphone,
  Info,
  Download,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Add a phone to your account | Mobile Tracker" },
      {
        name: "description",
        content:
          "Add a phone to your Mobile Tracker account: download and install the application on the phone you want to follow.",
      },
      { property: "og:title", content: "Add a phone to your account | Mobile Tracker" },
      {
        property: "og:description",
        content:
          "Add a phone to your Mobile Tracker account: download and install the application on the phone you want to follow.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AddPhonePage,
});

const navItems = [
  { label: "Dashboard", icon: Home, arrow: false },
  { label: "SMS", icon: Mail, arrow: true },
  { label: "MMS", icon: ImageIcon, arrow: false },
  { label: "Calls", icon: Phone, arrow: true },
  { label: "Locations", icon: Map, arrow: true },
  { label: "Pictures", icon: Images, arrow: false },
  { label: "Apps", icon: Compass, arrow: false },
  { label: "Calendar", icon: Calendar, arrow: false },
  { label: "Contacts", icon: Contact, arrow: false },
  { label: "Site Web", icon: Globe, arrow: true },
  { label: "Clipboard", icon: Clipboard, arrow: false },
];

function AddPhonePage() {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <div className="flex min-h-screen">
        <aside className="w-[352px] shrink-0 bg-[var(--sidebar)] text-[var(--sidebar-foreground)]">
          <div className="flex h-[95px] items-center gap-3 bg-[var(--topbar)] px-6">
            <span className="flex size-7 items-center justify-center rounded-full bg-brand text-[15px] font-bold text-[var(--topbar)]">
              M
            </span>
            <div className="leading-none">
              <span className="text-[28px] font-semibold text-[var(--topbar-foreground)]">
                Mobile
              </span>
              <span className="text-[28px] font-light text-[var(--topbar-foreground)]">
                Tracker
              </span>
              <div className="-mt-1 text-right text-[15px] font-light italic text-[var(--topbar-foreground)]/80">
                free
              </div>
            </div>
            <Menu className="ml-2 size-7 text-[var(--topbar-foreground)]" strokeWidth={2} />
          </div>

          <nav>
            {navItems.map(({ label, icon: Icon, arrow }) => (
              <a
                key={label}
                href="#"
                className="flex items-center gap-5 border-b border-[var(--sidebar-border)] px-7 py-[18px] text-[20px] font-light transition-colors hover:bg-[var(--sidebar-accent)]"
              >
                <Icon className="size-6 opacity-90" strokeWidth={1.5} />
                <span className="flex-1">{label}</span>
                {arrow && <ChevronLeft className="size-5 opacity-70" strokeWidth={2} />}
              </a>
            ))}
          </nav>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-[95px] items-center justify-end gap-8 bg-[var(--topbar)] px-8 text-[var(--topbar-foreground)]">
            <User className="size-7" strokeWidth={1.5} />
            <ShoppingBasket className="size-7" strokeWidth={1.5} />
            <LogOut className="size-7" strokeWidth={1.5} />
          </header>

          <div className="flex items-center gap-3 bg-card px-8 py-6 text-[22px] font-light text-muted-foreground">
            <span>Dashboard</span>
            <span className="text-[10px]">●</span>
            <span>Add phone</span>
          </div>

          <main className="px-8 py-6">
            <section className="rounded-sm border border-border bg-card">
              <div className="px-8 pb-6 pt-8">
                <h1 className="flex items-center gap-3 text-[22px] font-semibold uppercase tracking-wide text-brand">
                  <Smartphone className="size-6" strokeWidth={1.5} />
                  Add a phone to your account
                </h1>
              </div>

              <div className="border-t border-border px-8 py-9 text-center text-[22px] font-light">
                Add a phone to your account, for that you just need to download and install the
                application on the phone you want to follow.
              </div>

              <div className="border-t border-border px-8 py-9 text-center">
                <p className="text-[22px] font-light leading-relaxed">
                  <Info className="mr-1 inline size-5 -translate-y-0.5" strokeWidth={2} />
                  Please read and follow all steps correctly before downloading and installing the
                  application.
                  <br />
                  If this is not done, the application may not work properly.
                </p>

                <div className="mt-8 flex flex-col items-center gap-6">
                  <button className="inline-flex items-center gap-3 rounded-sm bg-info px-7 py-4 text-[17px] font-semibold uppercase tracking-wide text-info-foreground transition-opacity hover:opacity-90">
                    <Info className="size-5" strokeWidth={2} />
                    Help for installation
                  </button>
                  <button className="inline-flex items-center gap-3 rounded-sm bg-success px-7 py-4 text-[17px] font-semibold uppercase tracking-wide text-success-foreground transition-opacity hover:opacity-90">
                    <Download className="size-5" strokeWidth={2} />
                    Download application
                  </button>
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
