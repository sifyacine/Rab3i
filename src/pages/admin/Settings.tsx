import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Save, User, Globe, Bell, Shield, Moon, Sun } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

const Settings = () => {
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark");

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "light") {
      root.classList.add("light");
    } else {
      root.classList.remove("light");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const handleSave = () => {
    toast.success("تم حفظ الإعدادات بنجاح");
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
      </div>
    </motion.div>
  );
};

export default Settings;
