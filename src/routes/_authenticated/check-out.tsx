import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Clock, Loader2, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { durationText, formatTime, useSessions, useSlots, useZones } from "@/lib/parking";

export const Route = createFileRoute("/_authenticated/check-out")({
  head: () => ({
    meta: [
      { title: "Check Out — Ezpark.com" },
      { name: "description", content: "ออกจากที่จอดรถและคืนช่องจอดให้ระบบอัตโนมัติ" },
      { property: "og:title", content: "Check Out — Ezpark.com" },
      { property: "og:description", content: "บันทึกเวลาออกและคำนวณระยะเวลาจอดอัตโนมัติ" },
    ],
  }),
  component: CheckOutPage,
});

function CheckOutPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: sessions = [] } = useSessions();
  const { data: zones = [] } = useZones();
  const { data: slots = [] } = useSlots();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ time: string; duration: string } | null>(null);

  const active = sessions.find((s) => s.status === "PARKED");
  const zoneName = zones.find((z) => z.id === active?.zone_id)?.zone_name ?? "-";
  const slotNumber = slots.find((s) => s.id === active?.slot_id)?.slot_number ?? "-";

  const doCheckOut = async () => {
    setLoading(true);
    const { data, error } = await supabase.rpc("check_out");
    setLoading(false);
    if (error || !data) return;
    const session = Array.isArray(data) ? data[0] : data;
    setResult({
      time: formatTime(session.check_out_time),
      duration: durationText(session.check_in_time, session.check_out_time),
    });
    queryClient.invalidateQueries();
  };

  if (!active) {
    return (
      <div className="card-surface mx-auto max-w-lg p-8 text-center">
        <MapPin className="mx-auto h-10 w-10 text-muted-foreground" />
        <h1 className="mt-3 text-xl font-semibold">ยังไม่มีการจอดรถในขณะนี้</h1>
        <p className="mt-1 text-sm text-muted-foreground">กรุณา Check In ก่อนทำการ Check Out</p>
        <Button asChild className="mt-4">
          <Link to="/check-in">ไปหน้า Check In</Link>
        </Button>

        <Dialog open={Boolean(result)} onOpenChange={() => setResult(null)}>
          <DialogContent className="max-w-sm text-center">
            <CheckCircle2 className="mx-auto h-14 w-14 animate-in zoom-in text-primary" />
            <h2 className="text-xl font-bold">Check Out สำเร็จ</h2>
            <div className="rounded-2xl bg-primary-soft p-4 text-primary-dark">
              <p className="text-sm">เวลาออก: {result?.time} น.</p>
              <p className="mt-1 text-sm">ระยะเวลาจอด: {result?.duration}</p>
            </div>
            <Button onClick={() => navigate({ to: "/dashboard" })}>กลับสู่ Dashboard</Button>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Check Out</h1>
        <p className="text-sm text-muted-foreground">ข้อมูลการจอดปัจจุบันของคุณ</p>
      </div>

      <div className="card-surface space-y-4 p-6">
        <div className="rounded-2xl bg-primary-soft p-4 text-primary-dark">
          <p className="text-lg font-bold">{zoneName}</p>
          <p className="text-sm">Parking Slot {slotNumber}</p>
        </div>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">ประเภทรถ</dt>
            <dd className="font-medium">
              {active.vehicle_type === "car" ? "รถยนต์" : "รถจักรยานยนต์"}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">เวลาเข้า</dt>
            <dd className="font-medium">{formatTime(active.check_in_time)} น.</dd>
          </div>
          <div className="flex justify-between">
            <dt className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-4 w-4" /> จอดมาแล้ว
            </dt>
            <dd className="font-medium">{durationText(active.check_in_time, null)}</dd>
          </div>
        </dl>
        <Button size="lg" className="w-full" disabled={loading} onClick={() => void doCheckOut()}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Check Out
        </Button>
      </div>

      <Dialog open={Boolean(result)} onOpenChange={() => setResult(null)}>
        <DialogContent className="max-w-sm text-center">
          <CheckCircle2 className="mx-auto h-14 w-14 animate-in zoom-in text-primary" />
          <h2 className="text-xl font-bold">Check Out สำเร็จ</h2>
          <div className="rounded-2xl bg-primary-soft p-4 text-primary-dark">
            <p className="text-sm">เวลาออก: {result?.time} น.</p>
            <p className="mt-1 text-sm">ระยะเวลาจอด: {result?.duration}</p>
          </div>
          <Button onClick={() => navigate({ to: "/dashboard" })}>กลับสู่ Dashboard</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
