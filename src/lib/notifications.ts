import { useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Zone } from "@/lib/parking";

export type AppNotification = {
  id: string;
  title: string;
  message: string;
  created_at: string;
  read: boolean;
};

const TWO_HOURS = 2 * 60 * 60 * 1000;

export function useNotifications() {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: async (): Promise<AppNotification[]> => {
      const { data, error } = await supabase
        .from("notifications")
        .select("id, title, message, created_at, read")
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data ?? [];
    },
  });
}

function buildMessage(zones: Zone[]) {
  const free = zones.reduce((sum, z) => sum + z.available_slots, 0);
  const fullZone = zones.find((z) => z.available_slots === 0);
  const bestZone = [...zones].sort((a, b) => b.available_slots - a.available_slots)[0];
  if (fullZone && bestZone && bestZone.available_slots > 0) {
    return `${fullZone.zone_name} เต็มแล้ว ระบบแนะนำให้ใช้ ${bestZone.zone_name} (ว่าง ${bestZone.available_slots} ช่อง)`;
  }
  return `ขณะนี้มีพื้นที่จอดรถว่าง ${free} ช่อง`;
}

/** Creates a "Parking Update" notification on entry and then every 2 hours. */
export function useNotificationScheduler(zones: Zone[] | undefined) {
  const queryClient = useQueryClient();
  const zonesRef = useRef<Zone[] | undefined>(zones);
  zonesRef.current = zones;

  useEffect(() => {
    let cancelled = false;

    const push = async (force: boolean) => {
      const current = zonesRef.current;
      if (!current?.length) return;
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user || cancelled) return;

      if (!force) {
        const { data: last } = await supabase
          .from("notifications")
          .select("created_at")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (last && Date.now() - new Date(last.created_at).getTime() < TWO_HOURS) return;
      }

      await supabase.from("notifications").insert({
        user_id: auth.user.id,
        title: "Parking Update",
        message: buildMessage(current),
      });
      if (!cancelled) queryClient.invalidateQueries({ queryKey: ["notifications"] });
    };

    void push(false);
    const timer = window.setInterval(() => void push(true), TWO_HOURS);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [queryClient]);
}
