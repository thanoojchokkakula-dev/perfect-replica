import { useCallback, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Device = {
  id: string;
  name: string;
  model: string;
  phone_number: string | null;
  os: string;
  battery: number;
  last_seen: string;
  created_at: string;
};

const STORAGE_KEY = "mt.selectedDevice";

export function useDevices() {
  return useQuery({
    queryKey: ["devices"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("devices")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Device[];
    },
  });
}

export function useSelectedDevice() {
  const devices = useDevices();
  const [storedId, setStoredId] = useState<string | null>(null);

  useEffect(() => {
    setStoredId(window.localStorage.getItem(STORAGE_KEY));
  }, []);

  const select = useCallback((id: string) => {
    window.localStorage.setItem(STORAGE_KEY, id);
    setStoredId(id);
  }, []);

  const list = devices.data ?? [];
  const device = list.find((d) => d.id === storedId) ?? list[0] ?? null;

  return { devices: list, device, select, isLoading: devices.isLoading };
}

export function useDeviceRows<T>(table: string, deviceId: string | undefined, orderColumn = "occurred_at") {
  return useQuery({
    queryKey: [table, deviceId],
    enabled: Boolean(deviceId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from(table as never)
        .select("*")
        .eq("device_id", deviceId!)
        .order(orderColumn, { ascending: false })
        .limit(200);
      if (error) throw error;
      return (data ?? []) as T[];
    },
  });
}

export function formatDateTime(value: string) {
  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDuration(seconds: number) {
  if (seconds <= 0) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${String(s).padStart(2, "0")}s`;
}
