import { Outlet } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Wrench } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

const MaintenancePage = () => (
  <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-6 text-center">
    <div className="absolute inset-0 animate-gradient bg-gradient-to-br from-[hsl(0,84%,12%)] via-[hsl(350,70%,8%)] to-[hsl(10,60%,10%)] bg-[length:300%_300%]" />
    <div className="relative z-10 max-w-md space-y-6" dir="rtl">
      <img src="/Logo Arabic Version 02.png" alt="ربيعي" className="mx-auto h-16 w-auto" />
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-white ring-1 ring-white/15">
        <Wrench className="h-8 w-8" />
      </div>
      <h1 className="text-2xl font-bold text-white">الموقع قيد الصيانة</h1>
      <p className="leading-relaxed text-white/70">
        نجري بعض التحسينات حالياً وسنعود قريباً. شكراً لصبرك.
      </p>
    </div>
  </div>
);

// Gates the public marketing pages behind the store_settings.maintenance_mode
// flag. Staff (manager/worker) always bypass, and it fails OPEN (shows the site)
// while loading or on any error — so a settings/DB hiccup never takes the site
// down.
const MaintenanceGate = () => {
  const { role, loading } = useAuth();

  const { data } = useQuery({
    queryKey: ["maintenance-mode"],
    queryFn: async () => {
      if (!supabase) return { maintenance_mode: false };
      const { data } = await supabase
        .from("store_settings")
        .select("maintenance_mode")
        .limit(1)
        .maybeSingle();
      return data ?? { maintenance_mode: false };
    },
    staleTime: 60_000,
  });

  // Fail open while auth is still resolving so staff never flash the
  // maintenance page during bootstrapping.
  if (loading) return <Outlet />;
  if (!role && data?.maintenance_mode === true) {
    return <MaintenancePage />;
  }
  return <Outlet />;
};

export default MaintenanceGate;
