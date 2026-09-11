import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Mail, Phone, Map, Contact, ShieldCheck, Smartphone } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MobileTracker — follow a phone's messages, calls and locations" },
      {
        name: "description",
        content:
          "MobileTracker lets you add a phone to your account and follow its messages, calls, locations and contacts from one simple dashboard.",
      },
      { property: "og:title", content: "MobileTracker — follow a phone's messages, calls and locations" },
      {
        property: "og:description",
        content: "Add a phone to your account and follow its messages, calls, locations and contacts.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LandingPage,
});

const features = [
  { icon: Mail, title: "Messages", text: "Read every text sent and received, with contact and time." },
  { icon: Phone, title: "Calls", text: "Incoming, outgoing and missed calls with durations." },
  { icon: Map, title: "Locations", text: "A timeline of where the phone has been, down to the street." },
  { icon: Contact, title: "Contacts", text: "The full address book saved on the phone." },
];

function LandingPage() {
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSignedIn(Boolean(data.session)));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setSignedIn(Boolean(session));
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <header className="flex items-center gap-3 bg-[var(--topbar)] px-6 py-5 text-[var(--topbar-foreground)]">
        <span className="flex size-7 items-center justify-center rounded-full bg-brand text-[15px] font-bold text-[var(--topbar)]">
          M
        </span>
        <div className="leading-none">
          <span className="text-[22px] font-semibold">Mobile</span>
          <span className="text-[22px] font-light">Tracker</span>
        </div>
        <nav className="ml-auto">
          {signedIn ? (
            <Link
              to="/dashboard"
              className="rounded-sm bg-brand px-4 py-2 text-sm font-semibold uppercase tracking-wide text-[var(--topbar)]"
            >
              Go to dashboard
            </Link>
          ) : (
            <Link
              to="/auth"
              className="rounded-sm bg-brand px-4 py-2 text-sm font-semibold uppercase tracking-wide text-[var(--topbar)]"
            >
              Sign in
            </Link>
          )}
        </nav>
      </header>

      <main>
        <section className="bg-[var(--sidebar)] px-6 py-20 text-center text-[var(--sidebar-foreground)]">
          <h1 className="mx-auto max-w-3xl text-4xl font-light leading-tight md:text-5xl">
            Follow a phone's activity from one simple dashboard
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg font-light opacity-90">
            Create an account, add the phone you want to follow, and see its messages, calls, locations and
            contacts in one place.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-4">
            <Link
              to={signedIn ? "/dashboard" : "/auth"}
              className="inline-flex items-center gap-3 rounded-sm bg-success px-7 py-4 text-sm font-semibold uppercase tracking-wide text-success-foreground"
            >
              <Smartphone className="size-5" />
              {signedIn ? "Open my dashboard" : "Create a free account"}
            </Link>
            <Link
              to="/auth"
              className="inline-flex items-center gap-3 rounded-sm bg-info px-7 py-4 text-sm font-semibold uppercase tracking-wide text-info-foreground"
            >
              Sign in
            </Link>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="text-center text-2xl font-light">Everything you can follow</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-sm border border-border bg-card p-6">
                <Icon className="size-7 text-brand" strokeWidth={1.5} />
                <h3 className="mt-4 text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm font-light text-muted-foreground">{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-t border-border bg-card px-6 py-14">
          <div className="mx-auto flex max-w-3xl items-start gap-4">
            <ShieldCheck className="mt-1 size-7 shrink-0 text-brand" strokeWidth={1.5} />
            <p className="text-sm font-light leading-relaxed text-muted-foreground">
              Only you can see the phones on your account and their activity. Use this only on a phone you own or
              have permission to follow — following someone without their consent may be illegal where you live.
            </p>
          </div>
        </section>
      </main>

      <footer className="bg-[var(--topbar)] px-6 py-8 text-center text-sm font-light text-[var(--topbar-foreground)]">
        MobileTracker — a demo tracking dashboard.
      </footer>
    </div>
  );
}
