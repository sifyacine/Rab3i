import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Check, User, Mail, Phone, MapPin, 
  Briefcase, Save, ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";

const ClientFormAdmin = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  
  const [formData, setFormData] = useState<any>({
    name: "",
    email: "",
    phone: "",
    company: "",
    address: "",
    notes: ""
  });

  useEffect(() => {
    if (isEditing) {
      // Mock data
      setFormData({
        id: "1", 
        name: "ياسين سيف", 
        email: "yassine@example.com", 
        phone: "+966 50 123 4567", 
        company: "شركة سيف التقنية", 
        address: "الرياض، المملكة العربية السعودية",
        notes: "عميل منذ فترة طويلة مهتم بتطوير الويب."
      });
    }
  }, [id, isEditing]);

  const handleSave = () => {
    toast.success(isEditing ? "تم تحديث بيانات العميل" : "تم إضافة العميل بنجاح");
    navigate("/admin/clients");
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{isEditing ? "تعديل بيانات العميل" : "عميل جديد"}</h1>
          <p className="text-muted-foreground mt-1">إدخال بيانات التواصل والشركة للعميل.</p>
        </div>
        <Button variant="ghost" asChild><Link to="/admin/clients">الغاء</Link></Button>
      </div>

      <Card className="border-border/40 bg-card/30">
        <CardHeader>
          <CardTitle>المعلومات الشخصية</CardTitle>
          <CardDescription>بيانات التواصل الأساسية للعميل</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">الإسم الكامل</Label>
              <div className="relative">
                <User className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="name" className="pr-10" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="ياسين سيف" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="email" className="pr-10" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="example@mail.com" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">رقم الجوال</Label>
              <div className="relative">
                <Phone className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="phone" className="pr-10" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} placeholder="+966 --- --- ----" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">اسم الشركة (اختياري)</Label>
              <div className="relative">
                <Briefcase className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="company" className="pr-10" value={formData.company} onChange={(e) => setFormData({...formData, company: e.target.value})} placeholder="اسم المنشأة" />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">العنوان</Label>
            <div className="relative">
              <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input id="address" className="pr-10" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} placeholder="المدينة، الحي..." />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3 pb-10">
        <Button variant="outline" asChild><Link to="/admin/clients">إلغاء الأمر</Link></Button>
        <Button onClick={handleSave} className="bg-gradient-brand gap-2 px-8">
          <Save size={18} /> حفظ البيانات
        </Button>
      </div>
    </div>
  );
};

export default ClientFormAdmin;
