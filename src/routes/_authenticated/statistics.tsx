import { createFileRoute } from "@tanstack/react-router";
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { TrendingUp } from "lucide-react";
import { occupancy, useZones } from "@/lib/parking";
import { HOURS, heatmap, hourlyCheckIns, nextPredictionSlot, peakTimes } from "@/lib/stats-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/statistics")({
  head: () => ({
    meta: [
      { title: "Statistics — Ezpark.com" },
      { name: "description", content: "สถิติการใช้งานที่จอดรถ ช่วงเวลาเร่งด่วน และการคาดการณ์" },
      { property: "og:title", content: "Statistics — Ezpark.com" },
      { property: "og:description", content: "กราฟการเข้าจอดรายชั่วโมง สัดส่วนแต่ละโซน และ Heatmap" },
    ],
  }),
  component: StatisticsPage,
});

const PIE_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
];

function StatisticsPage() {
  const { data: zones = [] } = useZones();
  const prediction = nextPredictionSlot();

  const pieData = zones.map((z) => ({
    name: z.zone_name,
    value: z.total_slots - z.available_slots || 1,
  }));
  const maxHeat = Math.max(...heatmap.flatMap((row) => row.values));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Statistics</h1>
        <p className="text-sm text-muted-foreground">ภาพรวมการใช้งานพื้นที่จอดรถของคณะ</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="card-surface p-5">
          <h2 className="text-base font-semibold">จำนวนรถที่เข้าจอดตามช่วงเวลา</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyCheckIns}>
                <XAxis dataKey="hour" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} width={28} />
                <Tooltip cursor={{ fill: "var(--color-muted)" }} />
                <Bar dataKey="count" radius={[8, 8, 0, 0]} fill="var(--color-chart-1)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="card-surface p-5">
          <h2 className="text-base font-semibold">สัดส่วนการใช้งานแต่ละ Zone</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90}>
                  {pieData.map((entry, index) => (
                    <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <section className="card-surface overflow-x-auto p-5">
        <h2 className="text-base font-semibold">Heatmap การใช้งานตามช่วงเวลา</h2>
        <table className="mt-4 w-full min-w-md border-separate border-spacing-1 text-center text-xs">
          <thead>
            <tr>
              <th className="text-left font-medium text-muted-foreground">Zone</th>
              {HOURS.map((h) => (
                <th key={h} className="font-medium text-muted-foreground">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {heatmap.map((row) => (
              <tr key={row.zone}>
                <td className="text-left text-sm font-medium">{row.zone}</td>
                {row.values.map((value, i) => (
                  <td key={`${row.zone}-${i}`}>
                    <div
                      className="rounded-lg py-2 font-medium text-primary-dark"
                      style={{
                        backgroundColor: `color-mix(in oklab, var(--color-primary) ${Math.round((value / maxHeat) * 100)}%, white)`,
                      }}
                      title={`${row.zone} ${HOURS[i]} — ${value} คัน`}
                    >
                      {value}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="card-surface overflow-x-auto p-5">
        <h2 className="text-base font-semibold">Parking Summary</h2>
        <table className="mt-4 w-full min-w-md text-sm">
          <thead>
            <tr className="text-left text-muted-foreground">
              <th className="py-2 font-medium">Zone</th>
              <th className="py-2 font-medium">Total</th>
              <th className="py-2 font-medium">Available</th>
              <th className="py-2 font-medium">Occupied</th>
              <th className="py-2 font-medium">Occupancy</th>
            </tr>
          </thead>
          <tbody>
            {zones.map((z) => (
              <tr key={z.id} className="border-t border-border">
                <td className="py-2.5 font-medium">{z.zone_name}</td>
                <td className="py-2.5 tabular-nums">{z.total_slots}</td>
                <td className="py-2.5 tabular-nums text-primary">{z.available_slots}</td>
                <td className="py-2.5 tabular-nums">{z.total_slots - z.available_slots}</td>
                <td className="py-2.5 tabular-nums">{occupancy(z)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="card-surface p-5 lg:col-span-2">
          <h2 className="text-base font-semibold">Peak Time Analysis</h2>
          <ul className="mt-3 space-y-2">
            {peakTimes.map((item) => (
              <li
                key={item.label}
                className={cn(
                  "flex flex-wrap items-center justify-between gap-2 rounded-2xl px-4 py-3 text-sm",
                  item.tone === "danger" && "bg-danger-soft text-destructive",
                  item.tone === "warning" && "bg-warning-soft text-warning-foreground",
                  item.tone === "success" && "bg-primary-soft text-primary-dark",
                )}
              >
                <span>{item.label}</span>
                <span className="font-semibold">{item.value}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl bg-primary p-5 text-primary-foreground shadow-card">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            <h2 className="text-base font-semibold">คาดการณ์พื้นที่ว่าง</h2>
          </div>
          <p className="mt-4 text-sm text-primary-foreground/85">คาดว่าเวลา {prediction.time}</p>
          <p className="text-4xl font-bold">{prediction.free} ช่อง</p>
          <p className="mt-2 text-xs text-primary-foreground/80">
            คำนวณจากข้อมูลย้อนหลัง พร้อมเชื่อมต่อข้อมูลจริงในอนาคต
          </p>
        </section>
      </div>
    </div>
  );
}
