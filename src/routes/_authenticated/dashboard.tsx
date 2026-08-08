import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Car, CircleParking, Clock, TrendingUp } from "lucide-react";
import { StatCard } from "@/components/parking/StatCard";
import { ZoneCard } from "@/components/parking/ZoneCard";
import { SlotGrid } from "@/components/parking/SlotGrid";
import { Button } from "@/components/ui/button";
import {
  formatTime,
  occupancy,
  useProfile,
  useSessions,
  useSlots,
  useZones,
} from "@/lib/parking";
import { nextPredictionSlot } from "@/lib/stats-data";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Ezpark.com" },
      { name: "description", content: "ดูพื้นที่จอดรถว่างทั้งหมดและสถานะแต่ละโซนแบบเรียลไทม์" },
      { property: "og:title", content: "Dashboard — Ezpark.com" },
      { property: "og:description", content: "พื้นที่จอดรถว่างแบบเรียลไทม์ทุกโซน" },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { data: zones = [] } = useZones();
  const { data: slots = [] } = useSlots();
  const { data: profile } = useProfile();
  const { data: sessions = [] } = useSessions();
  const [selectedZone, setSelectedZone] = useState<string | null>(null);

  const totalSlots = zones.reduce((s, z) => s + z.total_slots, 0);
  const totalFree = zones.reduce((s, z) => s + z.available_slots, 0);
  const active = sessions.find((s) => s.status === "PARKED");
  const prediction = nextPredictionSlot();
  const zone = zones.find((z) => z.id === selectedZone) ?? zones[0];

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-gradient-to-br from-primary to-primary-dark p-6 text-primary-foreground shadow-card">
        <h1 className="text-2xl font-bold">สวัสดี, {profile?.name || "นักศึกษา"} 👋</h1>
        <p className="mt-1 text-sm text-primary-foreground/85">ยินดีต้อนรับเข้าสู่ Ezpark.com</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button asChild variant="secondary" size="sm">
            <Link to="/check-in">Check In ทันที</Link>
          </Button>
          {active && (
            <Button asChild variant="secondary" size="sm">
              <Link to="/check-out">Check Out</Link>
            </Button>
          )}
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Car}
          variant="primary"
          label="พื้นที่จอดรถว่างทั้งหมด"
          value={`${totalFree} ช่อง`}
          hint={`จากทั้งหมด ${totalSlots} ช่อง`}
        />
        <StatCard
          icon={CircleParking}
          label="อัตราการใช้งานรวม"
          value={`${totalSlots ? Math.round(((totalSlots - totalFree) / totalSlots) * 100) : 0}%`}
          hint={`ใช้งานอยู่ ${totalSlots - totalFree} ช่อง`}
        />
        <StatCard
          icon={TrendingUp}
          label={`คาดการณ์พื้นที่ว่าง เวลา ${prediction.time}`}
          value={`${prediction.free} ช่อง`}
          hint="คำนวณจากสถิติย้อนหลัง"
        />
        <StatCard
          icon={Clock}
          label="สถานะการจอดของคุณ"
          value={active ? "กำลังจอด" : "ยังไม่ได้จอด"}
          hint={active ? `เข้าเมื่อ ${formatTime(active.check_in_time)}` : "กด Check In เพื่อเริ่ม"}
          variant={active ? "warning" : "default"}
        />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Parking Zone Map</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {zones.map((z) => (
            <ZoneCard
              key={z.id}
              zone={z}
              active={zone?.id === z.id}
              onClick={() => setSelectedZone(z.id)}
            />
          ))}
        </div>
      </section>

      {zone && (
        <section className="card-surface p-5">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
            <h2 className="truncate text-lg font-semibold">รายละเอียด {zone.zone_name}</h2>
            <span className="shrink-0 rounded-full bg-primary-soft px-3 py-1 text-xs font-medium text-primary-dark">
              Occupancy {occupancy(zone)}%
            </span>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Total", value: zone.total_slots },
              { label: "Available", value: zone.available_slots },
              { label: "Occupied", value: zone.total_slots - zone.available_slots },
              { label: "Occupancy", value: `${occupancy(zone)}%` },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl bg-muted p-3">
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="text-xl font-bold tabular-nums">{item.value}</p>
              </div>
            ))}
          </div>
          <div className="mt-5">
            <SlotGrid slots={slots.filter((s) => s.zone_id === zone.id)} />
          </div>
        </section>
      )}
    </div>
  );
}
