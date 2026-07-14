import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { SmartDataTable } from "@/components/admin/SmartDataTable";
import { Badge } from "@/components/ui/badge";
import { DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Trash, Eye, Edit, Ban, ShieldCheck, ArrowLeftRight } from "lucide-react";
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
import { usersService, Profile } from "@/services/usersService";
import { useAuth } from "@/contexts/AuthContext";
import { normalizeStaffRole } from "@/lib/authSession";

const Users = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: () => usersService.getUsers()
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["users"] });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => usersService.deleteUser(id),
    onSuccess: () => { invalidate(); toast.success("تم حذف المستخدم بنجاح"); },
    onError: (e: Error) => toast.error(e.message || "حدث خطأ أثناء الحذف"),
  });

  const roleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: "manager" | "worker" }) =>
      usersService.setUserRole(id, role),
    onSuccess: () => { invalidate(); toast.success("تم تحديث رتبة المستخدم"); },
    onError: (e: Error) => toast.error(e.message || "تعذّر تغيير الرتبة"),
  });

  const banMutation = useMutation({
    mutationFn: ({ id, ban }: { id: string; ban: boolean }) =>
      ban ? usersService.banUser(id) : usersService.unbanUser(id),
    onSuccess: (_d, v) => { invalidate(); toast.success(v.ban ? "تم حظر المستخدم" : "تم رفع الحظر"); },
    onError: (e: Error) => toast.error(e.message || "تعذّر تنفيذ الإجراء"),
  });

  const busy = roleMutation.isPending || banMutation.isPending || deleteMutation.isPending;

  const confirmDelete = () => {
    if (userToDelete) {
      deleteMutation.mutate(userToDelete);
      setUserToDelete(null);
    }
  };

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('ar-SA-u-ca-gregory-nu-latn');

  const columns = [
    { header: "البريد الإلكتروني", accessorKey: "email" as const },
    { header: "الاسم", accessorKey: "full_name" as const },
    {
      header: "الدور",
      accessorKey: "role" as const,
      cell: (item: Profile) => {
        const staffRole = normalizeStaffRole(item.role);
        return (
          <div className="flex items-center gap-2">
            <Badge
              variant={staffRole === "manager" ? "default" : "secondary"}
              className={cn(
                "font-medium",
                staffRole === "manager" ? "bg-primary text-white" : "bg-secondary text-secondary-foreground"
              )}
            >
              {staffRole === "manager" ? "مدير" : staffRole === "worker" ? "موظف" : "بدون صلاحية"}
            </Badge>
            {item.is_banned && (
              <Badge variant="outline" className="font-medium bg-red-500/15 text-red-600 border-red-500/30">
                محظور
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      header: "تاريخ الإنشاء",
      accessorKey: "created_at" as const,
      cell: (item: Profile) => formatDate(item.created_at)
    },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <h1 className="text-2xl font-bold">إدارة المستخدمين</h1>
      <SmartDataTable
        data={users}
        columns={columns}
        isLoading={isLoading}
        cardTitle={(u) => u.full_name || u.email}
        onAdd={() => navigate("/admin/users/new")}
        onRowClick={(u) => navigate(`/admin/users/${u.id}`)}
        actions={(item) => {
          const isSelf = item.id === currentUser?.id;
          const staffRole = normalizeStaffRole(item.role);
          const nextRole = staffRole === "manager" ? "worker" : "manager";
          return (
            <>
              <DropdownMenuItem className="gap-2 cursor-pointer" onClick={(e) => {
                e.stopPropagation();
                navigate(`/admin/users/${item.id}`);
              }}>
                <Eye className="h-4 w-4" /> عرض التفاصيل
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2 cursor-pointer" onClick={(e) => {
                e.stopPropagation();
                navigate(`/admin/users/${item.id}/edit`);
              }}>
                <Edit className="h-4 w-4" /> تعديل
              </DropdownMenuItem>

              {!isSelf && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="gap-2 cursor-pointer" disabled={busy} onClick={(e) => {
                    e.stopPropagation();
                    roleMutation.mutate({ id: item.id, role: nextRole });
                  }}>
                    <ArrowLeftRight className="h-4 w-4" />
                    {nextRole === "manager" ? "ترقية إلى مدير" : "تحويل إلى موظف"}
                  </DropdownMenuItem>
                  <DropdownMenuItem className="gap-2 cursor-pointer" disabled={busy} onClick={(e) => {
                    e.stopPropagation();
                    banMutation.mutate({ id: item.id, ban: !item.is_banned });
                  }}>
                    {item.is_banned ? <ShieldCheck className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                    {item.is_banned ? "رفع الحظر" : "حظر الحساب"}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="gap-2 cursor-pointer text-destructive focus:text-destructive"
                    disabled={busy}
                    onClick={(e) => { e.stopPropagation(); setUserToDelete(item.id); }}
                  >
                    <Trash className="h-4 w-4" /> حذف
                  </DropdownMenuItem>
                </>
              )}
            </>
          );
        }}
      />

      <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <AlertDialogContent className="text-right" dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>حذف المستخدم؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيُحذف حساب الدخول وملفه نهائياً ولا يمكن التراجع. إن أردت منع الدخول مؤقتاً فاستخدم «حظر الحساب» بدلاً من الحذف.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:justify-start">
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              تأكيد الحذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
};

export default Users;
