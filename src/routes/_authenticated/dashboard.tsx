import { createFileRoute, Link } from "@tanstack/react-router";
import { Home, Mail, Phone, Map, Contact, BatteryMedium, Clock } from "lucide-react";

import { AppShell, EmptyState } from "@/components/AppShell";
import { formatDateTime, useDeviceRows, useSelectedDevice } from "@/lib/tracker";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard | MobileTracker" },
      { name: "description", content: "Overview of the phone you follow: recent messages, calls and locations." },
      { property: "og:title", content: "Dashboard | MobileTracker" },
      { property: "og:description", content: "Overview of the phone you follow with MobileTracker." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { device, isLoading } = useSelectedDevice();
  const messages = useDeviceRows<{ id: string }>("messages", device?.id);
  const calls = useDeviceRows<{ id: string }>("calls", device?.id);
  const locations = useDeviceRows<{ id: string; address: string | null; occurred_at: string }>(
    "locations",
    device?.id,
  );
  const contacts = useDeviceRows<{ id: string }>("contacts", device?.id, "created_at");

  if (isLoading) return <AppShell title="Dashboard" icon={Home}><EmptyState message="Loading…" /></AppShell>;

  if (!device) {
    return (
      <AppShell title="Dashboard" icon={Home}>
        <div className="px-6 py-14 text-center md:px-8">
          <p className="text-lg font-light text-muted-foreground">
            You have not added a phone yet.
          </p>
          <Link
            to="/add-phone"
            className="mt-6 inline-flex rounded-sm bg-success px-6 py-3 text-sm font-semibold uppercase tracking-wide text-success-foreground"
          >
            Add a phone
          </Link>
        </div>
      </AppShell>
    );
  }

  const cards = [
    { label: "Messages", value: messages.data?.length ?? 0, icon: Mail, to: "/sms" as const },
    { label: "Calls", value: calls.data?.length ?? 0, icon: Phone, to: "/calls" as const },
    { label: "Locations", value: locations.data?.length ?? 0, icon: Map, to: "/locations" as const },
    { label: "Contacts", value: contacts.data?.length ?? 0, icon: Contact, to: "/contacts" as const },
  ];

  const lastLocation = locations.data?.[0];

  return (
    <AppShell title="Dashboard" icon={Home}>
      <div className="px-6 py-6 md:px-8">
        <div className="rounded-sm border border-border p-5">
          <h2 className="text-lg font-semibold">{device.name}</h2>
          <p className="text-sm text-muted-foreground">
            {device.model} · {device.os}
            {device.phone_number ? ` · ${device.phone_number}` : ""}
          </p>
          <div className="mt-3 flex flex-wrap gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <BatteryMedium className="size-4" /> Battery {device.battery}%
            </span>
            <span className="flex items-center gap-2">
              <Clock className="size-4" /> Last seen {formatDateTime(device.last_seen)}
            </span>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map(({ label, value, icon: Icon, to }) => (
            <Link key={label} to={to} className="rounded-sm border border-border p-5 transition-colors hover:bg-muted">
              <Icon className="size-6 text-brand" strokeWidth={1.5} />
              <p className="mt-3 text-3xl font-semibold">{value}</p>
              <p className="text-sm text-muted-foreground">{label}</p>
            </Link>
          ))}
        </div>

        {lastLocation && (
          <div className="mt-6 rounded-sm border border-border p-5">
            <p className="text-sm text-muted-foreground">Last known place</p>
            <p className="mt-1 text-lg">{lastLocation.address}</p>
            <p className="text-sm text-muted-foreground">{formatDateTime(lastLocation.occurred_at)}</p>
          </div>
        )}
      </div>
    </AppShell>
  );
}
