import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Smartphone, Info, Download, Trash2 } from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { formatDateTime, useDevices } from "@/lib/tracker";

export const Route = createFileRoute("/_authenticated/add-phone")({
  head: () => ({
    meta: [
      { title: "Add a phone to your account | MobileTracker" },
      {
        name: "description",
        content:
          "Add a phone to your MobileTracker account: name the device, install the application on it and start following its activity.",
      },
      { property: "og:title", content: "Add a phone to your account | MobileTracker" },
      {
        property: "og:description",
        content: "Add a phone to your MobileTracker account and start following its activity.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AddPhonePage,
});

function AddPhonePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: devices } = useDevices();

  const [name, setName] = useState("");
  const [model, setModel] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [os, setOs] = useState("Android");
  const [error, setError] = useState<string | null>(null);

  const addDevice = useMutation({
    mutationFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("You need to be signed in.");
      const { error: insertError } = await supabase.from("devices").insert({
        user_id: userData.user.id,
        name: name.trim(),
        model: model.trim() || "Unknown model",
        phone_number: phoneNumber.trim() || null,
        os,
        battery: 60 + Math.floor(Math.random() * 40),
      });
      if (insertError) throw insertError;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries();
      navigate({ to: "/dashboard" });
    },
    onError: (err) => setError(err instanceof Error ? err.message : "Could not add the phone."),
  });

  const removeDevice = useMutation({
    mutationFn: async (id: string) => {
      const { error: deleteError } = await supabase.from("devices").delete().eq("id", id);
      if (deleteError) throw deleteError;
    },
    onSuccess: () => queryClient.invalidateQueries(),
  });

  return (
    <AppShell title="Add a phone to your account" icon={Smartphone}>
      <div className="px-6 py-8 text-center text-lg font-light md:px-8">
        Add a phone to your account, for that you just need to download and install the application on the phone
        you want to follow.
      </div>

      <div className="border-t border-border px-6 py-8 md:px-8">
        <p className="text-center text-lg font-light leading-relaxed">
          <Info className="mr-1 inline size-5 -translate-y-0.5" strokeWidth={2} />
          Please read and follow all steps correctly before downloading and installing the application.
          <br />
          If this is not done, the application may not work properly.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            setError(null);
            addDevice.mutate();
          }}
          className="mx-auto mt-8 grid max-w-2xl gap-4 sm:grid-cols-2"
        >
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm text-muted-foreground" htmlFor="name">
              Phone nickname
            </label>
            <input
              id="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Emma's phone"
              className="w-full rounded-sm border border-border bg-background px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-muted-foreground" htmlFor="model">
              Model
            </label>
            <input
              id="model"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="Samsung Galaxy S23"
              className="w-full rounded-sm border border-border bg-background px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-muted-foreground" htmlFor="phoneNumber">
              Phone number
            </label>
            <input
              id="phoneNumber"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+1 202 555 0100"
              className="w-full rounded-sm border border-border bg-background px-3 py-2 text-sm"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm text-muted-foreground" htmlFor="os">
              Operating system
            </label>
            <select
              id="os"
              value={os}
              onChange={(e) => setOs(e.target.value)}
              className="w-full rounded-sm border border-border bg-background px-3 py-2 text-sm"
            >
              <option>Android</option>
              <option>iOS</option>
            </select>
          </div>

          {error && <p className="sm:col-span-2 text-sm text-destructive">{error}</p>}

          <div className="sm:col-span-2 flex flex-col items-center gap-4">
            <button
              type="submit"
              disabled={addDevice.isPending}
              className="inline-flex items-center gap-3 rounded-sm bg-success px-7 py-4 text-sm font-semibold uppercase tracking-wide text-success-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              <Download className="size-5" strokeWidth={2} />
              {addDevice.isPending ? "Adding phone…" : "Add phone"}
            </button>
            <p className="text-sm text-muted-foreground">
              The phone starts with a set of sample activity so you can explore every screen right away.
            </p>
          </div>
        </form>
      </div>

      {!!devices?.length && (
        <div className="border-t border-border px-6 py-6 md:px-8">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Your phones</h2>
          <ul className="divide-y divide-border">
            {devices.map((d) => (
              <li key={d.id} className="flex flex-wrap items-center gap-3 py-3">
                <div>
                  <p className="font-medium">{d.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {d.model} · {d.os} · added {formatDateTime(d.created_at)}
                  </p>
                </div>
                <button
                  onClick={() => removeDevice.mutate(d.id)}
                  className="ml-auto inline-flex items-center gap-2 rounded-sm border border-border px-3 py-1 text-xs uppercase tracking-wide hover:bg-muted"
                >
                  <Trash2 className="size-4" /> Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </AppShell>
  );
}
