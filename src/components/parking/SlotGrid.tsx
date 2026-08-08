import { cn } from "@/lib/utils";
import type { Slot } from "@/lib/parking";

export function SlotGrid({ slots }: { slots: Slot[] }) {
  if (!slots.length) {
    return <p className="text-sm text-muted-foreground">ไม่มีข้อมูลช่องจอด</p>;
  }
  return (
    <div>
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-10">
        {slots.map((slot) => {
          const free = slot.status === "available";
          return (
            <div
              key={slot.id}
              title={free ? "Available" : "Occupied"}
              className={cn(
                "rounded-xl border px-2 py-2 text-center text-xs font-medium transition-colors",
                free
                  ? "border-primary/30 bg-primary-soft text-primary-dark"
                  : "border-destructive/25 bg-danger-soft text-destructive",
              )}
            >
              {slot.slot_number}
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-primary" /> ว่าง
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-destructive" /> ถูกใช้งาน
        </span>
      </div>
    </div>
  );
}
