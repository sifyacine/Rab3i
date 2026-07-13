import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  User, Mail, Shield, Save,
  Key, AlertCircle, Loader2, Phone, Briefcase
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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersService } from "@/services/usersService";
import { getSignupErrorMessage } from "@/lib/authErrors";
import { normalizeStaffRole, type AuthUserRole } from "@/lib/authSession";
import { useAuth } from "@/contexts/AuthContext";

const UserFormAdmin = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();
  const isEditing = !!id;
  const isSelf = isEditing && id === currentUser?.id;

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<AuthUserRole>("worker");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [jobTitle, setJobTitle] = useState("");

  const { data: existingUser, isLoading: loadingUser } = useQuery({
    queryKey: ["user", id],
    queryFn: () => usersService.getUserById(id!),
    enabled: isEditing,
  });

  useEffect(() => {
    if (existingUser) {
      setFullName(existingUser.full_name ?? "");
      setEmail(existingUser.email ?? "");
      setRole(normalizeStaffRole(existingUser.role) ?? "worker");
      setPhone(existingUser.phone ?? "");
      setJobTitle(existingUser.job_title ?? "");
    }
  }, [existingUser]);

  const createMutation = useMutation({
    mutationFn: () =>
      usersService.createUser({
        email: email.trim(),
        password,
        full_name: fullName.trim(),
        role,
        phone: phone.trim() || undefined,
        job_title: jobTitle.trim() || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("تم إنشاء الحساب بنجاح ويمكن للمستخدم تسجيل الدخول مباشرة.");
      navigate("/admin/users");
    },
    onError: (error: Error) => {
      toast.error(getSignupErrorMessage(error.message));
    },
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      // Profile fields go through a normal update; a role change is a
      // privileged action routed to the edge function.
      await usersService.updateUser(id!, {
        full_name: fullName.trim(),
        phone: phone.trim() || null,
        job_title: jobTitle.trim() || null,
      });
      // A manager can't change their own role (the server refuses self-demote);
      // the Select is disabled for self, so this only runs for other users.
      if (!isSelf && normalizeStaffRole(existingUser?.role) !== role) {
        await usersService.setUserRole(id!, role);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user", id] });
      toast.success("تم تحديث بيانات المستخدم");
      navigate("/admin/users");
    },
    onError: (error: Error) => toast.error(error.message || "حدث خطأ أثناء حفظ التعديلات"),
  });

  const saving = createMutation.isPending || updateMutation.isPending;

  const handleSave = () => {
    if (!fullName.trim()) {
      toast.error("يرجى إدخال اسم المستخدم");
      return;
    }
    if (!isEditing) {
      if (!email.trim()) {
        toast.error("يرجى إدخال البريد الإلكتروني");
        return;
      }
      if (password.length < 6) {
        toast.error("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
        return;
      }
      createMutation.mutate();
    } else {
      updateMutation.mutate();
    }
  };

  if (isEditing && loadingUser) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary/50" />
      </div>
    );
  }

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
              <Label htmlFor="full-name">الاسم الكامل</Label>
              <div className="relative">
                <User className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="full-name" className="pr-10" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="الاسم الثلاثي" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="email" type="email" className="pr-10" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" disabled={isEditing} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="user-phone">رقم الهاتف</Label>
                <div className="relative">
                  <Phone className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="user-phone" dir="ltr" className="pr-10" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+966 5XXXXXXXX" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="user-job-title">المسمى الوظيفي</Label>
                <div className="relative">
                  <Briefcase className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="user-job-title" className="pr-10" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="مصمم، مطوّر، مسوّق..." />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role">الدور (الرتبة)</Label>
                <Select value={role} onValueChange={(v) => setRole(v as AuthUserRole)} disabled={isSelf}>
                  <SelectTrigger id="role" className="relative pr-10">
                    <Shield className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="اختر الرتبة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manager">مدير (كامل الصلاحيات)</SelectItem>
                    <SelectItem value="worker">موظف (بدون الأقسام الإدارية)</SelectItem>
                  </SelectContent>
                </Select>
                {isSelf && <p className="text-xs text-muted-foreground">لا يمكنك تغيير رتبتك بنفسك.</p>}
              </div>
              {!isEditing && (
                <div className="space-y-2">
                  <Label htmlFor="password">كلمة المرور</Label>
                  <div className="relative">
                    <Key className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="password" type="password" className="pr-10" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
                  </div>
                </div>
              )}
            </div>
          </div>
          {isEditing ? (
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 flex gap-3 text-xs text-amber-500">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <p>لتغيير كلمة المرور، يستخدم المستخدم خيار «نسيت كلمة المرور» في صفحة تسجيل الدخول.</p>
            </div>
          ) : (
            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 flex gap-3 text-xs text-blue-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <p>يُفعَّل الحساب فوراً — سلّم المستخدم بريده وكلمة المرور ليسجّل الدخول.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3 pb-10">
        <Button variant="outline" asChild><Link to="/admin/users">إلغاء الأمر</Link></Button>
        <Button onClick={handleSave} disabled={saving} className="bg-gradient-brand gap-2 px-8 shadow-lg shadow-primary/20">
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} حفظ المستخدم
        </Button>
      </div>
    </div>
  );
};

export default UserFormAdmin;
