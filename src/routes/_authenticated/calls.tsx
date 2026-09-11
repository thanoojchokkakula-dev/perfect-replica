import { createFileRoute } from "@tanstack/react-router";
import { Phone } from "lucide-react";

import { AppShell, EmptyState } from "@/components/AppShell";
import { formatDateTime, formatDuration, useDeviceRows, useSelectedDevice } from "@/lib/tracker";

type Call = {
  id: string;
  contact_name: string | null;
  contact_number: string;
  direction: string;
  duration_seconds: number;
  occurred_at: string;
};

export const Route = createFileRoute("/_authenticated/calls")({
  head: () => ({
    meta: [
      { title: "Calls | MobileTracker" },
      { name: "description", content: "Review incoming, outgoing and missed calls on the phone you follow." },
      { property: "og:title", content: "Calls | MobileTracker" },
      { property: "og:description", content: "Incoming, outgoing and missed calls on the followed phone." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CallsPage,
});

function CallsPage() {
  const { device } = useSelectedDevice();
  const { data, isLoading } = useDeviceRows<Call>("calls", device?.id);

  return (
    <AppShell title="Calls" icon={Phone}>
      {!device ? (
        <EmptyState message="Add a phone first to see its calls." />
      ) : isLoading ? (
        <EmptyState message="Loading calls…" />
      ) : !data?.length ? (
        <EmptyState message="No calls recorded yet." />
      ) : (
        <ul className="divide-y divide-border">
          {data.map((c) => (
            <li key={c.id} className="flex flex-wrap items-center gap-3 px-6 py-4 md:px-8">
              <div className="min-w-0">
                <p className="font-medium">{c.contact_name ?? c.contact_number}</p>
                <p className="text-xs text-muted-foreground">{c.contact_number}</p>
              </div>
              <span
                className={`rounded-sm px-2 py-0.5 text-xs uppercase ${
                  c.direction === "missed"
                    ? "bg-destructive text-destructive-foreground"
                    : c.direction === "incoming"
                      ? "bg-info text-info-foreground"
                      : "bg-success text-success-foreground"
                }`}
              >
                {c.direction}
              </span>
              <span className="text-sm text-muted-foreground">{formatDuration(c.duration_seconds)}</span>
              <span className="ml-auto text-xs text-muted-foreground">{formatDateTime(c.occurred_at)}</span>
            </li>
          ))}
        </ul>
      )}
    </AppShell>
  );
}
