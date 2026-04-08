import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Save, User, Globe, Bell, Shield, Moon, Sun, Share2, Instagram, Facebook, Linkedin, Youtube, Music2 } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

const Settings = () => {
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

  const handleSave = () => {
    toast.success("تم حفظ الإعدادات بنجاح");
  };

  const handleSocialSave = () => {
    socialMutation.mutate();
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl space-y-8"
    >
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">الإعدادات</h1>
        <Button className="bg-gradient-brand" onClick={handleSave}>
          <Save className="ml-2 h-4 w-4" />
          حفظ التغييرات
        </Button>
      </div>

      <div className="grid gap-6">
        <Card className="border-border/40 bg-card/30">
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              <CardTitle>الملف الشخصي</CardTitle>
            </div>
            <CardDescription>إدارة بياناتك الشخصية ومعلومات الدخول</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">اسم المستخدم</Label>
                <Input id="username" defaultValue="admin_yassine" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <Input id="email" defaultValue="admin@rabii.sa" />
              </div>
            </div>
          </CardContent>
        </Card>

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

        <Card className="border-border/40 bg-card/30">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              <CardTitle>إعدادات الموقع</CardTitle>
            </div>
            <CardDescription>إعدادات SEO والميتا والكلمات المفتاحية</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>وصف الموقع (SEO Description)</Label>
              <Input defaultValue="ربيعي - ستوديو تصميم وبرمجة رقمي متكامل" />
            </div>
            <Separator className="my-4" />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>وضع الصيانة</Label>
                <p className="text-sm text-muted-foreground">تفعيل هذا الخيار سيظهر صفحة "قيد الصيانة" للزوار</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/40 bg-card/30">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <CardTitle>التنبيهات</CardTitle>
            </div>
            <CardDescription>إدارة تنبيهات النظام والبريد</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>تنبيهات الطلبات الجديدة</Label>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label>تقارير المدونة الأسبوعية</Label>
              <Switch />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/40 bg-card/30">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Share2 className="h-5 w-5 text-primary" />
              <CardTitle>روابط التواصل الاجتماعي</CardTitle>
            </div>
            <CardDescription>أضف روابط صفحاتك على وسائل التواصل -Icons ستظهر في الصفحة الرئيسية عند وجود رابط</CardDescription>
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
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg> TikTok
                </Label>
                <Input
                  placeholder="https://tiktok.com/..."
                  value={socialLinks.social_tiktok}
                  onChange={(e) => setSocialLinks({ ...socialLinks, social_tiktok: e.target.value })}
                  dir="ltr"
                />
              </div>
            </div>
            <Button onClick={handleSocialSave} disabled={socialMutation.isPending} className="mt-4 bg-gradient-brand">
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
