import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Save, User, Sun, Moon, Share2, Instagram, Facebook, Linkedin, Youtube, ExternalLink, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { usersService } from "@/services/usersService";

const Settings = () => {
  const { user } = useAuth();
  const [theme, setTheme] = useState(() => localStorage.getItem("rabii-theme") || "dark");
  const queryClient = useQueryClient();

  const [socialLinks, setSocialLinks] = useState({
    social_facebook: "",
    social_twitter: "",
    social_instagram: "",
    social_linkedin: "",
    social_youtube: "",
    social_tiktok: "",
  });

  // Real signed-in staff profile (read-only here; edited at /admin/profile)
  const { data: profile } = useQuery({
    queryKey: ["my-profile", user?.id],
    queryFn: () => usersService.getUserById(user!.id),
    enabled: !!user?.id,
  });

  const { data: settings } = useQuery({
    queryKey: ["store-settings"],
    queryFn: async () => {
      const { data } = await supabase.from("store_settings").select("*").limit(1).single();
      return data;
    },
  });

  useEffect(() => {
    if (settings) {
      setSocialLinks({
        social_facebook: settings.social_facebook || "",
        social_twitter: settings.social_twitter || "",
        social_instagram: settings.social_instagram || "",
        social_linkedin: settings.social_linkedin || "",
        social_youtube: settings.social_youtube || "",
        social_tiktok: settings.social_tiktok || "",
      });
    }
  }, [settings]);

  const socialMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("store_settings").update(socialLinks).eq("id", settings?.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["store-settings"] });
      toast.success("تم حفظ روابط التواصل الاجتماعي بنجاح");
    },
    onError: () => {
      toast.error("حدث خطأ أثناء الحفظ");
    },
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "light") {
      root.classList.add("light");
    } else {
      root.classList.remove("light");
    }
    localStorage.setItem("rabii-theme", theme);
  }, [theme]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl space-y-8"
    >
      <div>
        <h1 className="text-2xl font-bold">الإعدادات</h1>
        <p className="text-sm text-muted-foreground mt-1">كل قسم يُحفظ على حِدة</p>
      </div>

      <div className="grid gap-6">
        {/* Profile — real data, edited from the profile page */}
        <Card className="border-border/40 bg-card/30">
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              <CardTitle>الملف الشخصي</CardTitle>
            </div>
            <CardDescription>بياناتك كما هي مخزّنة — للتعديل انتقل إلى صفحة الملف الشخصي</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {profile ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="full-name">الاسم الكامل</Label>
                    <Input id="full-name" value={profile.full_name || ""} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">البريد الإلكتروني</Label>
                    <Input id="email" value={profile.email || ""} disabled dir="ltr" />
                  </div>
                </div>
                <Button variant="outline" asChild className="gap-2">
                  <Link to="/admin/profile"><ExternalLink className="h-4 w-4" /> تعديل الملف الشخصي</Link>
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> جارٍ التحميل...
              </div>
            )}
          </CardContent>
        </Card>

        {/* Theme — persisted to localStorage */}
        <Card className="border-border/40 bg-card/30">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sun className="h-5 w-5 text-primary" />
              <CardTitle>مظهر اللوحة</CardTitle>
            </div>
            <CardDescription>اختر الوضع الذي يريحك (فاتح أو داكن)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>الوضع الفاتح</Label>
                <p className="text-sm text-muted-foreground">تفعيل المظهر الفاتح للوحة التحكم</p>
              </div>
              <div className="flex items-center gap-2">
                <Moon className="h-4 w-4 text-muted-foreground" />
                <Switch
                  checked={theme === "light"}
                  onCheckedChange={(checked) => setTheme(checked ? "light" : "dark")}
                />
                <Sun className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Social links — persisted to store_settings */}
        <Card className="border-border/40 bg-card/30">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Share2 className="h-5 w-5 text-primary" />
              <CardTitle>روابط التواصل الاجتماعي</CardTitle>
            </div>
            <CardDescription>أضف روابط صفحاتك على وسائل التواصل — تظهر في الصفحة الرئيسية عند وجود رابط</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Facebook className="h-4 w-4 text-blue-600" /> Facebook
                </Label>
                <Input
                  placeholder="https://facebook.com/..."
                  value={socialLinks.social_facebook}
                  onChange={(e) => setSocialLinks({ ...socialLinks, social_facebook: e.target.value })}
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Instagram className="h-4 w-4 text-pink-500" /> Instagram
                </Label>
                <Input
                  placeholder="https://instagram.com/..."
                  value={socialLinks.social_instagram}
                  onChange={(e) => setSocialLinks({ ...socialLinks, social_instagram: e.target.value })}
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Linkedin className="h-4 w-4 text-blue-700" /> LinkedIn
                </Label>
                <Input
                  placeholder="https://linkedin.com/..."
                  value={socialLinks.social_linkedin}
                  onChange={(e) => setSocialLinks({ ...socialLinks, social_linkedin: e.target.value })}
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Youtube className="h-4 w-4 text-red-600" /> YouTube
                </Label>
                <Input
                  placeholder="https://youtube.com/..."
                  value={socialLinks.social_youtube}
                  onChange={(e) => setSocialLinks({ ...socialLinks, social_youtube: e.target.value })}
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" /></svg> TikTok
                </Label>
                <Input
                  placeholder="https://tiktok.com/..."
                  value={socialLinks.social_tiktok}
                  onChange={(e) => setSocialLinks({ ...socialLinks, social_tiktok: e.target.value })}
                  dir="ltr"
                />
              </div>
            </div>
            <Button onClick={() => socialMutation.mutate()} disabled={socialMutation.isPending} className="mt-4 bg-gradient-brand">
              <Save className="ml-2 h-4 w-4" />
              {socialMutation.isPending ? "جاري الحفظ..." : "حفظ روابط التواصل"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
};

export default Settings;
