import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Zone = {
  id: string;
  zone_name: string;
  total_slots: number;
  available_slots: number;
  status: string;
};

export type Slot = {
  id: string;
  zone_id: string;
  slot_number: string;
  status: string;
};

export type Session = {
  id: string;
  user_id: string;
  username: string;
  zone_id: string;
  slot_id: string;
  vehicle_type: string;
  check_in_time: string;
  check_out_time: string | null;
  status: string;
};

export type Profile = {
  id: string;
  username: string;
  name: string;
  role: string;
  vehicle_type: string;
};

export function zoneTone(zone: Pick<Zone, "available_slots" | "total_slots">) {
  if (zone.available_slots === 0) return "full" as const;
  if (zone.available_slots <= Math.max(1, Math.floor(zone.total_slots / 5)))
    return "almost" as const;
  return "free" as const;
}

export function occupancy(zone: Pick<Zone, "available_slots" | "total_slots">) {
  if (!zone.total_slots) return 0;
  return Math.round(((zone.total_slots - zone.available_slots) / zone.total_slots) * 100);
}

export function formatTime(value: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDate(value: string) {
  return new Date(value).toLocaleDateString("th-TH", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function durationText(from: string, to: string | null) {
  const end = to ? new Date(to).getTime() : Date.now();
  const mins = Math.max(0, Math.round((end - new Date(from).getTime()) / 60000));
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h} ชั่วโมง ${m} นาที` : `${m} นาที`;
}

export function useZones() {
  return useQuery({
    queryKey: ["zones"],
    queryFn: async (): Promise<Zone[]> => {
      const { data, error } = await supabase
        .from("parking_zones")
        .select("id, zone_name, total_slots, available_slots, status")
        .order("zone_name");
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useSlots() {
  return useQuery({
    queryKey: ["slots"],
    queryFn: async (): Promise<Slot[]> => {
      const { data, error } = await supabase
        .from("parking_slots")
        .select("id, zone_id, slot_number, status")
        .order("slot_number");
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: async (): Promise<Profile | null> => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return null;
      const { data } = await supabase
        .from("profiles")
        .select("id, username, name, role, vehicle_type")
        .eq("id", auth.user.id)
        .maybeSingle();
      return data ?? null;
    },
  });
}

export function useSessions() {
  return useQuery({
    queryKey: ["sessions"],
    queryFn: async (): Promise<Session[]> => {
      const { data, error } = await supabase
        .from("parking_sessions")
        .select("*")
        .order("check_in_time", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Session[];
    },
  });
}

/** Live updates for zones, slots and sessions — no manual refresh needed. */
export function useRealtimeParking() {
  const queryClient = useQueryClient();
  useEffect(() => {
    const channel = supabase
      .channel("ezpark-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "parking_zones" }, () => {
        queryClient.invalidateQueries({ queryKey: ["zones"] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "parking_slots" }, () => {
        queryClient.invalidateQueries({ queryKey: ["slots"] });
        queryClient.invalidateQueries({ queryKey: ["zones"] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "parking_sessions" }, () => {
        queryClient.invalidateQueries({ queryKey: ["sessions"] });
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
}
