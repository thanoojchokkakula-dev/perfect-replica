import { createFileRoute } from "@tanstack/react-router";
import { Contact } from "lucide-react";

import { AppShell, EmptyState } from "@/components/AppShell";
import { useDeviceRows, useSelectedDevice } from "@/lib/tracker";

type ContactRow = {
  id: string;
  name: string;
  phone_number: string;
  email: string | null;
};

export const Route = createFileRoute("/_authenticated/contacts")({
  head: () => ({
    meta: [
      { title: "Contacts | MobileTracker" },
      { name: "description", content: "Browse the address book saved on the phone you follow." },
      { property: "og:title", content: "Contacts | MobileTracker" },
      { property: "og:description", content: "Address book of the followed phone." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ContactsPage,
});

function ContactsPage() {
  const { device } = useSelectedDevice();
  const { data, isLoading } = useDeviceRows<ContactRow>("contacts", device?.id, "created_at");

  return (
    <AppShell title="Contacts" icon={Contact}>
      {!device ? (
        <EmptyState message="Add a phone first to see its contacts." />
      ) : isLoading ? (
        <EmptyState message="Loading contacts…" />
      ) : !data?.length ? (
        <EmptyState message="No contacts recorded yet." />
      ) : (
        <ul className="divide-y divide-border">
          {data.map((c) => (
            <li key={c.id} className="flex flex-wrap items-center gap-3 px-6 py-4 md:px-8">
              <div>
                <p className="font-medium">{c.name}</p>
                <p className="text-xs text-muted-foreground">{c.phone_number}</p>
              </div>
              <span className="ml-auto text-sm text-muted-foreground">{c.email}</span>
            </li>
          ))}
        </ul>
      )}
    </AppShell>
  );
}
