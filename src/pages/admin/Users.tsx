import { motion } from "framer-motion";
import { SmartDataTable } from "@/components/admin/SmartDataTable";
import { Badge } from "@/components/ui/badge";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Shield, UserPlus, Trash, Key } from "lucide-react";

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
  const columns = [
    { header: "اسم المستخدم", accessorKey: "username" as const },
    {
      header: "الدور",
      accessorKey: "role" as const,
      cell: (item: AdminUser) => (
        <Badge variant={item.role === "admin" ? "default" : "secondary"}>
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
        data={mockUsers}
        columns={columns}
        cardTitle={(u) => u.username}
        actions={(item) => (
          <>
            <DropdownMenuItem className="gap-2 cursor-pointer">
              <Key className="h-4 w-4" />
              تغيير كلمة المرور
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 cursor-pointer">
              <Shield className="h-4 w-4" />
              تعديل الصلاحيات
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 cursor-pointer text-destructive focus:text-destructive">
              <Trash className="h-4 w-4" />
              حذف
            </DropdownMenuItem>
          </>
        )}
      />
    </motion.div>
  );
};

export default Users;
