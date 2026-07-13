import { useParams, Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight, Edit, Trash, User, Shield,
  Mail, Calendar, AlertCircle, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersService } from "@/services/usersService";
import { normalizeStaffRole } from "@/lib/authSession";

const UserDetailsAdmin = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  const { data: user, isLoading } = useQuery({
    queryKey: ["user", id],
    queryFn: () => usersService.getUserById(id!),
    enabled: !!id,
  });

  const deleteMutation = useMutation({
    mutationFn: () => usersService.deleteUser(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("تم حذف المستخدم بنجاح");
      navigate("/admin/users");
    },
    onError: () => toast.error("حدث خطأ أثناء الحذف"),
  });

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary/50" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-20 space-y-4">
        <p className="text-muted-foreground">لم يتم العثور على المستخدم</p>
        <Button variant="outline" asChild><Link to="/admin/users">العودة للمستخدمين</Link></Button>
      </div>
    );
  }

  const staffRole = normalizeStaffRole(user.role);
  const roleLabel = staffRole === "manager" ? "مدير" : staffRole === "worker" ? "موظف" : "بدون صلاحية";
  const roleDescription =
    staffRole === "manager"
      ? "مدير كامل الصلاحيات"
      : staffRole === "worker"
        ? "موظف — بدون الأقسام الإدارية"
        : "لا يملك صلاحية الوصول إلى لوحة التحكم";
  const displayName = user.full_name || user.email;
  const joinDate = new Date(user.created_at).toLocaleDateString("ar-SA");

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-4xl mx-auto" dir="rtl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild className="rounded-full">
            <Link to="/admin/users"><ArrowRight className="h-4 w-4" /></Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{displayName}</h1>
              <Badge variant={staffRole === "manager" ? "default" : "secondary"}>
                {roleLabel}
              </Badge>
            </div>
            <p className="text-muted-foreground flex items-center gap-2 mt-1">
              <Mail className="h-3.5 w-3.5" />
              {user.email}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" asChild className="gap-2">
            <Link to={`/admin/users/${id}/edit`}><Edit className="h-4 w-4" /> تعديل</Link>
          </Button>
          <Button variant="destructive" onClick={() => setIsAlertOpen(true)} className="gap-2 border-none">
            <Trash className="h-4 w-4" /> حذف
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 border-border/40 bg-card/30">
          <CardHeader>
            <CardTitle className="text-xl">معلومات الحساب</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1">
                <Label className="text-muted-foreground">الاسم الكامل</Label>
                <p className="font-bold flex items-center gap-2 font-sans"><User className="h-4 w-4 text-primary" /> {displayName}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground">الرتبة</Label>
                <p className="font-bold flex items-center gap-2"><Shield className="h-4 w-4 text-primary" /> {roleDescription}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground">تاريخ الانضمام</Label>
                <p className="font-medium flex items-center gap-2"><Calendar className="h-4 w-4 text-primary" /> {joinDate}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {staffRole === "manager" && (
          <Card className="border-border/40 bg-pink-500/5 h-fit">
            <CardHeader>
              <CardTitle className="text-lg text-pink-500 flex items-center gap-2"><AlertCircle className="h-4 w-4" /> تنبيه أمني</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-pink-500/80 leading-relaxed">
              هذا الحساب يمتلك صلاحيات إدارية كاملة. يرجى الحذر عند تعديل بياناته أو صلاحياته لتجنب فقدان الوصول إلى لوحة التحكم.
            </CardContent>
          </Card>
        )}
      </div>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent className="text-right" dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>حذف حساب المستخدم؟</AlertDialogTitle>
            <AlertDialogDescription>هل أنت متأكد؟ سيتم سحب كافة الصلاحيات فوراً وإغلاق الجلسة الحالية للمستخدم إذا كان مسجلاً للدخول.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:justify-start">
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteMutation.mutate()} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">تأكيد الحذف</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
};

export default UserDetailsAdmin;
