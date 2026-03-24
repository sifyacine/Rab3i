import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Check, User, Mail, Shield, Save, 
  ArrowRight, Key, AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const UserFormAdmin = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  
  const [formData, setFormData] = useState<any>({
    username: "",
    email: "",
    role: "editor",
    password: ""
  });

  useEffect(() => {
    if (isEditing) {
      // Mock data
      setFormData({
        id: "1", 
        username: "admin_yassine", 
        email: "yassine@example.com", 
        role: "admin",
        password: "********"
      });
    }
  }, [id, isEditing]);

  const handleSave = () => {
    toast.success(isEditing ? "تم تحديث بيانات المستخدم" : "تم إضافة المستخدم بنجاح");
    navigate("/admin/users");
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8" dir="rtl">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{isEditing ? "تعديل المستخدم" : "مستخدم جديد"}</h1>
        <Button variant="ghost" asChild><Link to="/admin/users">الغاء</Link></Button>
      </div>

      <Card className="border-border/40 bg-card/30">
        <CardHeader>
          <CardTitle>بيانات الدخول</CardTitle>
          <CardDescription>هذه البيانات تستخدم للولوج إلى لوحة التحكم</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">اسم المستخدم</Label>
              <div className="relative">
                <User className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="username" className="pr-10" value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} placeholder="admin_name" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="email" className="pr-10" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="admin@example.com" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role">الدور (الرتبة)</Label>
                <Select value={formData.role} onValueChange={(v) => setFormData({...formData, role: v})}>
                  <SelectTrigger id="role" className="relative pr-10">
                    <Shield className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="اختر الرتبة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">مدير نظام (Full Access)</SelectItem>
                    <SelectItem value="editor">محرر (Content Editor)</SelectItem>
                    <SelectItem value="viewer">مشاهد (View Only)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{isEditing ? "كلمة المرور الجديدة" : "كلمة المرور"}</Label>
                <div className="relative">
                  <Key className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="password" type="password" className="pr-10" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} placeholder="••••••••" />
                </div>
              </div>
            </div>
          </div>
          {isEditing && (
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 flex gap-3 text-xs text-amber-500">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <p>اترك حقل كلمة المرور فارغاً إذا كنت لا ترغب في تغييرها.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3 pb-10">
        <Button variant="outline" asChild><Link to="/admin/users">إلغاء الأمر</Link></Button>
        <Button onClick={handleSave} className="bg-gradient-brand gap-2 px-8 shadow-lg shadow-primary/20">
          <Save size={18} /> حفظ المستخدم
        </Button>
      </div>
    </div>
  );
};

export default UserFormAdmin;
