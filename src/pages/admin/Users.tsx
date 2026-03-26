import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { SmartDataTable } from "@/components/admin/SmartDataTable";
import { Badge } from "@/components/ui/badge";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Shield, UserPlus, Trash, Key, Eye, Edit } from "lucide-react";
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

interface AdminUser {
  id: string;
  username: string;
  role: "admin" | "editor";
  lastLogin: string;
}

const mockUsers: AdminUser[] = [
  { id: "1", username: "admin_yassine", role: "admin", lastLogin: "2024-03-21 15:30" },
  { id: "2", username: "editor_sara", role: "editor", lastLogin: "2024-03-20 09:15" },
];

const Users = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<AdminUser[]>(mockUsers);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  const confirmDelete = () => {
    if (userToDelete) {
      setUsers(users.filter(u => u.id !== userToDelete));
      toast.success("تم حذف المستخدم بنجاح");
      setUserToDelete(null);
    }
  };

  const columns = [
    { header: "اسم المستخدم", accessorKey: "username" as const },
    {
      header: "الدور",
      accessorKey: "role" as const,
      cell: (item: AdminUser) => (
        <Badge 
          variant={item.role === "admin" ? "default" : "secondary"}
          className={cn(
            "font-medium",
            item.role === "admin" ? "bg-primary text-white" : "bg-secondary text-secondary-foreground"
          )}
        >
          {item.role === "admin" ? "مدير" : "محرر"}
        </Badge>
      ),
    },
    { header: "آخر دخول", accessorKey: "lastLogin" as const },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <h1 className="text-2xl font-bold">إدارة المستخدمين</h1>
      <SmartDataTable
        data={users}
        columns={columns}
        cardTitle={(u) => u.username}
        onAdd={() => navigate("/admin/users/new")}
        onRowClick={(u) => navigate(`/admin/users/${u.id}`)}
        actions={(item) => (
          <>
            <DropdownMenuItem className="gap-2 cursor-pointer" onClick={(e) => {
              e.stopPropagation();
              navigate(`/admin/users/${item.id}`);
            }}>
              <Eye className="h-4 w-4" />
              عرض التفاصيل
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 cursor-pointer" onClick={(e) => {
              e.stopPropagation();
              navigate(`/admin/users/${item.id}/edit`);
            }}>
              <Edit className="h-4 w-4" />
              تعديل
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 cursor-pointer" onClick={(e) => e.stopPropagation()}>
              <Key className="h-4 w-4" />
              تغيير كلمة المرور
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="gap-2 cursor-pointer text-destructive focus:text-destructive" 
              onClick={(e) => {
                e.stopPropagation();
                setUserToDelete(item.id);
              }}
            >
              <Trash className="h-4 w-4" />
              حذف
            </DropdownMenuItem>
          </>
        )}
      />

      <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <AlertDialogContent className="text-right" dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>حذف المستخدم؟</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف هذا الحساب؟ سيتم سحب كافة الصلاحيات فوراً.
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
