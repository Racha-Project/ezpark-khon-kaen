import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Loader2, ParkingCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import heroImage from "@/assets/parking-hero.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ezpark.com — ระบบค้นหาที่จอดรถ มนุษยศาสตร์ฯ ม.ขอนแก่น" },
      {
        name: "description",
        content:
          "Ezpark.com ระบบค้นหาและจัดการพื้นที่จอดรถแบบเรียลไทม์ สำหรับนักศึกษาคณะมนุษยศาสตร์และสังคมศาสตร์ มหาวิทยาลัยขอนแก่น",
      },
      { property: "og:title", content: "Ezpark.com — ระบบค้นหาที่จอดรถ ม.ขอนแก่น" },
      {
        property: "og:description",
        content: "เช็คที่จอดรถว่างแบบเรียลไทม์ Check In / Check Out และดูสถิติการใช้งานแต่ละโซน",
      },
    ],
  }),
  component: LoginPage,
});

const emailFor = (username: string) => `${username.trim().toLowerCase()}@ezpark.local`;

function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard", replace: true });
    });
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || password.length < 6) {
      toast.error("กรุณากรอกชื่อผู้ใช้ และรหัสผ่านอย่างน้อย 6 ตัวอักษร");
      return;
    }
    setLoading(true);
    try {
      if (mode === "register") {
        const { data, error } = await supabase.auth.signUp({
          email: emailFor(username),
          password,
        });
        if (error) throw error;
        if (data.user) {
          await supabase.from("profiles").insert({
            id: data.user.id,
            username: username.trim(),
            name: name.trim() || username.trim(),
          });
        }
        toast.success("ลงทะเบียนสำเร็จ ยินดีต้อนรับสู่ Ezpark.com");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: emailFor(username),
          password,
        });
        if (error) throw error;
        toast.success("เข้าสู่ระบบสำเร็จ");
      }
      if (remember) localStorage.setItem("ezpark_username", username.trim());
      navigate({ to: "/dashboard", replace: true });
    } catch (error) {
      toast.error(
        mode === "login"
          ? "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง"
          : `ลงทะเบียนไม่สำเร็จ: ${(error as Error).message}`,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-primary-soft lg:block">
        <img
          src={heroImage}
          alt="ลานจอดรถภายในมหาวิทยาลัย"
          width={1024}
          height={1280}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-primary-dark/90 to-transparent p-10">
          <h2 className="text-2xl font-bold text-primary-foreground">
            หาที่จอดรถได้ง่าย ๆ ในไม่กี่วินาที
          </h2>
          <p className="mt-2 max-w-md text-sm text-primary-foreground/85">
            ตรวจสอบพื้นที่ว่างแต่ละโซนแบบเรียลไทม์ พร้อมระบบแนะนำโซนเมื่อที่จอดเต็ม
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-md">
          <div className="text-center">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-primary text-primary-foreground shadow-card">
              <ParkingCircle className="h-8 w-8" />
            </span>
            <h1 className="mt-4 text-3xl font-bold">Ezpark.com</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              ระบบค้นหาที่จอดรถ คณะมนุษยศาสตร์และสังคมศาสตร์ มหาวิทยาลัยขอนแก่น
            </p>
          </div>

          <form onSubmit={submit} className="card-surface mt-6 space-y-4 p-6">
            <div className="space-y-2">
              <Label htmlFor="username">ชื่อผู้ใช้</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="เช่น student01"
                autoComplete="username"
              />
            </div>

            {mode === "register" && (
              <div className="space-y-2">
                <Label htmlFor="name">ชื่อ-นามสกุล</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ชื่อที่แสดงในระบบ"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="password">รหัสผ่าน</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="อย่างน้อย 6 ตัวอักษร"
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  aria-label="แสดงรหัสผ่าน"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-muted-foreground">
                <Checkbox
                  checked={remember}
                  onCheckedChange={(v) => setRemember(Boolean(v))}
                  id="remember"
                />
                จดจำฉัน
              </label>
              <button
                type="button"
                onClick={() => toast.info("กรุณาติดต่อเจ้าหน้าที่คณะเพื่อรีเซ็ตรหัสผ่าน")}
                className="font-medium text-primary hover:underline"
              >
                ลืมรหัสผ่าน?
              </button>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === "login" ? "เข้าสู่ระบบ" : "ลงทะเบียน"}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              {mode === "login" ? "ยังไม่มีบัญชี?" : "มีบัญชีอยู่แล้ว?"}{" "}
              <button
                type="button"
                onClick={() => setMode(mode === "login" ? "register" : "login")}
                className="font-medium text-primary hover:underline"
              >
                {mode === "login" ? "ลงทะเบียน" : "เข้าสู่ระบบ"}
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
