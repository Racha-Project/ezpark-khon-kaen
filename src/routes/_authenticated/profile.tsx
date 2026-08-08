import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  durationText,
  formatDate,
  formatTime,
  useProfile,
  useSessions,
  useSlots,
  useZones,
} from "@/lib/parking";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "Profile — Ezpark.com" },
      { name: "description", content: "ข้อมูลผู้ใช้ ประเภทรถ และประวัติการจอดรถทั้งหมด" },
      { property: "og:title", content: "Profile — Ezpark.com" },
      { property: "og:description", content: "จัดการข้อมูลส่วนตัวและดูประวัติการจอดรถ" },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const queryClient = useQueryClient();
  const { data: profile } = useProfile();
  const { data: sessions = [] } = useSessions();
  const { data: zones = [] } = useZones();
  const { data: slots = [] } = useSlots();

  const [name, setName] = useState("");
  const [vehicle, setVehicle] = useState("motorcycle");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setVehicle(profile.vehicle_type);
    }
  }, [profile]);

  const save = async () => {
    if (!profile) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ name, vehicle_type: vehicle })
      .eq("id", profile.id);
    if (password) {
      if (password.length < 6) {
        toast.error("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
        setSaving(false);
        return;
      }
      await supabase.auth.updateUser({ password });
      setPassword("");
    }
    setSaving(false);
    if (error) toast.error("บันทึกไม่สำเร็จ");
    else {
      toast.success("บันทึกข้อมูลเรียบร้อย");
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-sm text-muted-foreground">ข้อมูลผู้ใช้และประวัติการจอดรถ</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
        <section className="card-surface space-y-4 p-5">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-primary-soft text-xl font-bold text-primary-dark">
              {(profile?.name || profile?.username || "U").charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0">
              <p className="truncate font-semibold">{profile?.name || "-"}</p>
              <p className="truncate text-sm text-muted-foreground">@{profile?.username}</p>
              <p className="text-xs text-muted-foreground">
                ประเภทผู้ใช้งาน: {profile?.role === "admin" ? "ผู้ดูแล" : "นักศึกษา"}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pname">ชื่อ</Label>
            <Input id="pname" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>ประเภทรถ</Label>
            <Select value={vehicle} onValueChange={setVehicle}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="motorcycle">รถจักรยานยนต์</SelectItem>
                <SelectItem value="car">รถยนต์</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pw">รหัสผ่านใหม่</Label>
            <Input
              id="pw"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="เว้นว่างหากไม่ต้องการเปลี่ยน"
            />
          </div>

          <Button className="w-full" disabled={saving} onClick={() => void save()}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            บันทึกข้อมูล
          </Button>
        </section>

        <section className="card-surface overflow-x-auto p-5">
          <h2 className="text-base font-semibold">Parking History</h2>
          {sessions.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">ยังไม่มีประวัติการจอดรถ</p>
          ) : (
            <table className="mt-4 w-full min-w-2xl text-sm">
              <thead>
                <tr className="text-left text-muted-foreground">
                  <th className="py-2 font-medium">Date</th>
                  <th className="py-2 font-medium">Zone</th>
                  <th className="py-2 font-medium">Slot</th>
                  <th className="py-2 font-medium">Vehicle</th>
                  <th className="py-2 font-medium">Check In</th>
                  <th className="py-2 font-medium">Check Out</th>
                  <th className="py-2 font-medium">Duration</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((s) => (
                  <tr key={s.id} className="border-t border-border">
                    <td className="py-2.5">{formatDate(s.check_in_time)}</td>
                    <td className="py-2.5">
                      {zones.find((z) => z.id === s.zone_id)?.zone_name ?? "-"}
                    </td>
                    <td className="py-2.5">
                      {slots.find((sl) => sl.id === s.slot_id)?.slot_number ?? "-"}
                    </td>
                    <td className="py-2.5">
                      {s.vehicle_type === "car" ? "Car" : "Motorcycle"}
                    </td>
                    <td className="py-2.5">{formatTime(s.check_in_time)}</td>
                    <td className="py-2.5">
                      {s.check_out_time ? formatTime(s.check_out_time) : "กำลังจอด"}
                    </td>
                    <td className="py-2.5">
                      {s.check_out_time ? durationText(s.check_in_time, s.check_out_time) : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </div>
  );
}
