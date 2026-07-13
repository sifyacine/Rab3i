import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Mail, Phone, Shield, Briefcase, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersService } from "@/services/usersService";
import { useAuth } from "@/contexts/AuthContext";
import { normalizeStaffRole } from "@/lib/authSession";

const MyProfile = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  const { data: profile, isLoading } = useQuery({
    queryKey: ["my-profile", user?.id],
    queryFn: () => usersService.getUserById(user!.id),
    enabled: !!user?.id,
  });

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name ?? "");
      setPhone(profile.phone ?? "");
    }
  }, [profile]);

  const saveMutation = useMutation({
    // Send both current field values so the RPC sets them directly — this lets
    // the user clear their phone (an emptied field is saved, not ignored)
    mutationFn: () =>
      usersService.updateOwnProfile({ full_name: fullName.trim(), phone: phone.trim() }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-profile", user?.id] });
      toast.success("تم حفظ ملفك الشخصي");
    },
    onError: () => toast.error("تعذر حفظ التعديلات"),
  });

  const handleSave = () => {
    if (!fullName.trim()) {
      toast.error("يرجى إدخال الاسم الكامل");
      return;
    }
    saveMutation.mutate();
  };

  if (isLoading || !profile) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary/50" />
      </div>
    );
  }

  const staffRole = normalizeStaffRole(profile.role);
  const roleLabel = staffRole === "manager" ? "مدير" : staffRole === "worker" ? "موظف" : "بدون صلاحية";

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto space-y-8" dir="rtl">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">الملف الشخصي</h1>
        <Badge variant={staffRole === "manager" ? "default" : "secondary"}>{roleLabel}</Badge>
      </div>

      <Card className="border-border/40 bg-card/30">
        <CardHeader>
          <CardTitle>بياناتك</CardTitle>
          <CardDescription>يمكنك تعديل اسمك ورقم هاتفك — البريد والرتبة يديرهما المدير</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="profile-name">الاسم الكامل</Label>
              <div className="relative">
                <User className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="profile-name" className="pr-10" value={fullName} onChange={(e) => setFullName(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-phone">رقم الهاتف</Label>
              <div className="relative">
                <Phone className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="profile-phone" className="pr-10" dir="ltr" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+966 5XXXXXXXX" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>البريد الإلكتروني</Label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input className="pr-10" value={profile.email} disabled />
              </div>
            </div>
            <div className="space-y-2">
              <Label>المسمى الوظيفي</Label>
              <div className="relative">
                <Briefcase className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input className="pr-10" value={profile.job_title ?? "—"} disabled />
              </div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-secondary/40 border border-border/40 flex gap-3 text-xs text-muted-foreground">
            <Shield className="h-4 w-4 shrink-0" />
            <p>لتغيير كلمة المرور استخدم «نسيت كلمة المرور» في صفحة تسجيل الدخول بعد تسجيل الخروج.</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end pb-10">
        <Button onClick={handleSave} disabled={saveMutation.isPending} className="bg-gradient-brand gap-2 px-8 shadow-lg shadow-primary/20">
          {saveMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} حفظ التعديلات
        </Button>
      </div>
    </motion.div>
  );
};

export default MyProfile;
