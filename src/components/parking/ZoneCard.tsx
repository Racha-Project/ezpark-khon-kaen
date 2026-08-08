import { Car } from "lucide-react";
import { cn } from "@/lib/utils";
import { occupancy, zoneTone, type Zone } from "@/lib/parking";

const toneStyles = {
  free: {
    dot: "bg-primary",
    chip: "bg-primary-soft text-primary-dark",
    bar: "bg-primary",
    label: "ว่าง",
  },
  almost: {
    dot: "bg-warning",
    chip: "bg-warning-soft text-warning-foreground",
    bar: "bg-warning",
    label: "ใกล้เต็ม",
  },
  full: {
    dot: "bg-destructive",
    chip: "bg-danger-soft text-destructive",
    bar: "bg-destructive",
    label: "เต็ม",
  },
};

export function ZoneCard({
  zone,
  active,
  onClick,
}: {
  zone: Zone;
  active?: boolean;
  onClick?: () => void;
}) {
  const tone = toneStyles[zoneTone(zone)];
  const pct = occupancy(zone);

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "card-surface w-full p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card",
        active && "ring-2 ring-primary",
      )}
    >
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className={cn("h-2.5 w-2.5 shrink-0 rounded-full", tone.dot)} />
          <h3 className="truncate text-base font-semibold">{zone.zone_name}</h3>
        </div>
        <span className={cn("shrink-0 rounded-full px-2.5 py-1 text-xs font-medium", tone.chip)}>
          {tone.label}
        </span>
      </div>

      <div className="mt-3 flex items-end gap-2">
        <span className="text-3xl font-bold tabular-nums transition-all">
          {zone.available_slots}
        </span>
        <span className="pb-1 text-sm text-muted-foreground">
          จากทั้งหมด {zone.total_slots} ช่อง
        </span>
      </div>

      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-all duration-500", tone.bar)}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Car className="h-3.5 w-3.5" /> ใช้งาน {zone.total_slots - zone.available_slots} ช่อง
        </span>
        <span>Occupancy {pct}%</span>
      </div>
    </button>
  );
}
