import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { User, Building2, Save, Phone, MapPin, Hash } from "lucide-react";

const PortalProfile = () => {
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    name: "ياسين سيف",
    email: "yacine@example.com",
    company: "شركة الحلول الإبداعية",
    vatNumber: "310123456789003",
    address: "الرياض، حي النخيل، طريق الملك فهد",
    phone: "+966 50 123 4567",
    contactPerson: "مدير المشتريات"
  });

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("تم تحديث الملف الشخصي بنجاح");
    }, 1000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="space-y-8 max-w-4xl mx-auto pb-10"
      dir="rtl"
    >
      <div>
        <h1 className="text-3xl font-bold tracking-tight">الملف الشخصي</h1>
        <p className="text-muted-foreground mt-2">إدارة معلوماتك الشخصية وتفاصيل منشأتك لأغراض التعاقد والفوترة.</p>
      </div>

      <div className="grid gap-6">
        <Card className="border-border/40 bg-card/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              <CardTitle>المعلومات الأساسية</CardTitle>
            </div>
            <CardDescription>بيانات التواصل الأساسية الخاصة بك.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">الاسم الكامل</Label>
                <Input 
                  id="name" 
                  value={profile.name} 
                  onChange={(e) => setProfile({...profile, name: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={profile.email} 
                  disabled 
                  className="bg-secondary/30"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">رقم الجوال</Label>
                <div className="relative">
                  <Phone className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="phone" 
                    value={profile.phone} 
                    onChange={(e) => setProfile({...profile, phone: e.target.value})} 
                    dir="ltr"
                    className="pr-10 text-right"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact">المسؤول عن التواصل</Label>
                <div className="relative">
                  <User className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="contact" 
                    value={profile.contactPerson} 
                    onChange={(e) => setProfile({...profile, contactPerson: e.target.value})} 
                    className="pr-10"
                    placeholder="مثال: مدير المشروع"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/40 bg-card/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              <CardTitle>معلومات المنشأة (للفواتير)</CardTitle>
            </div>
            <CardDescription>تستخدم هذه البيانات في إصدار التصاريح والعقود والفواتير الضريبية.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company">اسم الشركة / المنشأة</Label>
                <div className="relative">
                  <Building2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="company" 
                    value={profile.company} 
                    onChange={(e) => setProfile({...profile, company: e.target.value})} 
                    className="pr-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="vat">الرقم الضريبي (VAT)</Label>
                <div className="relative">
                  <Hash className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="vat" 
                    value={profile.vatNumber} 
                    onChange={(e) => setProfile({...profile, vatNumber: e.target.value})} 
                    className="pr-10"
                  />
                </div>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">العنوان الوطني / المقر</Label>
                <div className="relative">
                  <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="address" 
                    value={profile.address} 
                    onChange={(e) => setProfile({...profile, address: e.target.value})} 
                    className="pr-10"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={loading} className="gap-2 px-8 bg-gradient-brand shadow-lg shadow-primary/20 rounded-xl">
            <Save className="h-4 w-4" />
            {loading ? "جاري الحفظ..." : "حفظ التغييرات"}
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default PortalProfile;
