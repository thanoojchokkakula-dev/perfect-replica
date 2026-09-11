import { createFileRoute } from "@tanstack/react-router";
import { Map } from "lucide-react";

import { AppShell, EmptyState } from "@/components/AppShell";
import { formatDateTime, useDeviceRows, useSelectedDevice } from "@/lib/tracker";

type Location = {
  id: string;
  latitude: number;
  longitude: number;
  address: string | null;
  accuracy_meters: number;
  occurred_at: string;
};

export const Route = createFileRoute("/_authenticated/locations")({
  head: () => ({
    meta: [
      { title: "Locations | MobileTracker" },
      { name: "description", content: "See where the phone you follow has been, with times and accuracy." },
      { property: "og:title", content: "Locations | MobileTracker" },
      { property: "og:description", content: "Location history of the followed phone." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LocationsPage,
});

function LocationsPage() {
  const { device } = useSelectedDevice();
  const { data, isLoading } = useDeviceRows<Location>("locations", device?.id);

  return (
    <AppShell title="Locations" icon={Map}>
      {!device ? (
        <EmptyState message="Add a phone first to see its locations." />
      ) : isLoading ? (
        <EmptyState message="Loading locations…" />
      ) : !data?.length ? (
        <EmptyState message="No locations recorded yet." />
      ) : (
        <ul className="divide-y divide-border">
          {data.map((l) => (
            <li key={l.id} className="flex flex-wrap items-center gap-3 px-6 py-4 md:px-8">
              <div className="min-w-0">
                <p className="font-medium">{l.address ?? "Unknown place"}</p>
                <p className="text-xs text-muted-foreground">
                  {l.latitude.toFixed(5)}, {l.longitude.toFixed(5)} · ±{l.accuracy_meters} m
                </p>
              </div>
              <a
                href={`https://www.openstreetmap.org/?mlat=${l.latitude}&mlon=${l.longitude}#map=16/${l.latitude}/${l.longitude}`}
                target="_blank"
                rel="noreferrer"
                className="rounded-sm border border-border px-3 py-1 text-xs uppercase tracking-wide hover:bg-muted"
              >
                View map
              </a>
              <span className="ml-auto text-xs text-muted-foreground">{formatDateTime(l.occurred_at)}</span>
            </li>
          ))}
        </ul>
      )}
    </AppShell>
  );
}
