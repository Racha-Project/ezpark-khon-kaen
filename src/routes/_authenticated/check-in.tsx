import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Bike, Car, CheckCircle2, Loader2, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ZoneCard } from "@/components/parking/ZoneCard";
import { cn } from "@/lib/utils";
import { formatTime, useProfile, useSessions, useSlots, useZones } from "@/lib/parking";

export const Route = createFileRoute("/_authenticated/check-in")({
  head: () => ({
    meta: [
      { title: "Check In — Ezpark.com" },
      { name: "description", content: "เลือกโซนและ Check In เพื่อรับช่องจอดอัตโนมัติ" },
      { property: "og:title", content: "Check In — Ezpark.com" },
      { property: "og:description", content: "ระบบจะเลือกช่องจอดว่างให้อัตโนมัติเมื่อ Check In" },
    ],
  }),
  component: CheckInPage,
});

type SuccessInfo = { zone: string; slot: string; time: string };

function CheckInPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: zones = [] } = useZones();
  const { data: slots = [] } = useSlots();
  const { data: profile } = useProfile();
  const { data: sessions = [] } = useSessions();

  const [name, setName] = useState("");
  const [vehicle, setVehicle] = useState<"motorcycle" | "car">("motorcycle");
  const [zoneId, setZoneId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<SuccessInfo | null>(null);
  const [failedZone, setFailedZone] = useState<string | null>(null);

  const active = sessions.find((s) => s.status === "PARKED");
  const displayName = name || profile?.name || profile?.username || "นักศึกษา";

  const submit = async (targetZoneId: string | null) => {
    const id = targetZoneId ?? zoneId;
    if (!id) return;
    setLoading(true);
    setFailedZone(null);
    const { data, error } = await supabase.rpc("check_in", {
      p_zone_id: id,
      p_vehicle_type: vehicle,
      p_username: displayName,
    });
    setLoading(false);

    if (error || !data) {
      const zoneName = zones.find((z) => z.id === id)?.zone_name ?? "โซนนี้";
      setFailedZone(zoneName);
      return;
    }
    const session = Array.isArray(data) ? data[0] : data;
    const slot = slots.find((s) => s.id === session.slot_id);
    setSuccess({
      zone: zones.find((z) => z.id === session.zone_id)?.zone_name ?? "-",
      slot: slot?.slot_number ?? "-",
      time: formatTime(session.check_in_time),
    });
    queryClient.invalidateQueries();
  };

  if (active) {
    return (
      <div className="card-surface mx-auto max-w-lg p-6 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-primary" />
        <h1 className="mt-3 text-xl font-semibold">คุณกำลังจอดรถอยู่</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          กรุณา Check Out ก่อนทำการ Check In ครั้งใหม่
        </p>
        <Button className="mt-4" onClick={() => navigate({ to: "/check-out" })}>
          ไปหน้า Check Out
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Check In</h1>
        <p className="text-sm text-muted-foreground">
          เลือกโซนที่ต้องการ ระบบจะจัดช่องจอดว่างให้อัตโนมัติ
        </p>
      </div>

      <div className="card-surface space-y-5 p-5">
        <div className="space-y-2">
          <Label htmlFor="name">ชื่อผู้ใช้</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={profile?.name || profile?.username || "ชื่อของคุณ"}
          />
        </div>

        <div className="space-y-2">
          <Label>ประเภทรถ</Label>
          <div className="grid grid-cols-2 gap-3">
            {(
              [
                { value: "motorcycle", label: "รถจักรยานยนต์", icon: Bike },
                { value: "car", label: "รถยนต์", icon: Car },
              ] as const
            ).map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setVehicle(option.value)}
                className={cn(
                  "flex items-center gap-2 rounded-2xl border p-3 text-sm font-medium transition-colors",
                  vehicle === option.value
                    ? "border-primary bg-primary-soft text-primary-dark"
                    : "border-border bg-card text-muted-foreground hover:bg-muted",
                )}
              >
                <option.icon className="h-5 w-5" />
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>เลือก Zone</Label>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {zones.map((z) => (
              <ZoneCard key={z.id} zone={z} active={zoneId === z.id} onClick={() => setZoneId(z.id)} />
            ))}
          </div>
        </div>

        <Button
          size="lg"
          className="w-full"
          disabled={!zoneId || loading}
          onClick={() => void submit(null)}
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Check In
        </Button>
      </div>

      <Dialog open={Boolean(success)} onOpenChange={() => setSuccess(null)}>
        <DialogContent className="max-w-sm text-center">
          <CheckCircle2 className="mx-auto h-14 w-14 animate-in zoom-in text-primary" />
          <h2 className="text-xl font-bold">Check In สำเร็จ</h2>
          <div className="rounded-2xl bg-primary-soft p-4 text-primary-dark">
            <p className="text-lg font-semibold">{success?.zone}</p>
            <p className="text-sm">ช่อง {success?.slot}</p>
            <p className="mt-2 text-sm">เวลาเข้า: {success?.time} น.</p>
          </div>
          <Button onClick={() => navigate({ to: "/dashboard" })}>กลับสู่ Dashboard</Button>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(failedZone)} onOpenChange={() => setFailedZone(null)}>
        <DialogContent className="max-w-sm">
          <div className="text-center">
            <XCircle className="mx-auto h-14 w-14 text-destructive" />
            <h2 className="mt-2 text-xl font-bold">พื้นที่จอดเต็ม</h2>
            <p className="text-sm text-muted-foreground">ขออภัย {failedZone} เต็มแล้ว</p>
          </div>
          <p className="text-sm font-medium">แนะนำโซนอื่น:</p>
          <div className="space-y-2">
            {zones
              .filter((z) => z.available_slots > 0)
              .slice(0, 3)
              .map((z) => (
                <button
                  key={z.id}
                  type="button"
                  onClick={() => {
                    setZoneId(z.id);
                    void submit(z.id);
                  }}
                  className="flex w-full items-center justify-between rounded-2xl border border-primary/30 bg-primary-soft px-4 py-3 text-sm font-medium text-primary-dark transition-transform hover:-translate-y-0.5"
                >
                  <span>{z.zone_name}</span>
                  <span>ว่าง {z.available_slots} ช่อง</span>
                </button>
              ))}
            {zones.every((z) => z.available_slots === 0) && (
              <p className="text-sm text-muted-foreground">ขณะนี้ทุกโซนเต็ม กรุณารอสักครู่</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
