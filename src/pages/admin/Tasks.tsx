import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { SmartDataTable } from "@/components/admin/SmartDataTable";
import { Badge } from "@/components/ui/badge";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Edit, Trash, Loader2 } from "lucide-react";
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
import { tasksService, Task, taskStatusConfig, taskPriorityConfig } from "@/services/tasksService";
import { useAuth } from "@/contexts/AuthContext";
import { isStaffRole } from "@/lib/authSession";

const Tasks = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { role } = useAuth();
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["admin-tasks"],
    queryFn: () => tasksService.getTasks(),
    enabled: isStaffRole(role),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => tasksService.deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tasks"] });
      toast.success("تم حذف المهمة بنجاح");
    },
    onError: () => toast.error("حدث خطأ أثناء الحذف"),
  });

  const confirmDelete = () => {
    if (taskToDelete) {
      deleteMutation.mutate(taskToDelete);
      setTaskToDelete(null);
    }
  };

  const columns = [
    { header: "المهمة", accessorKey: "title" as const },
    {
      header: "الموظف",
      accessorKey: "assigned_to" as const,
      cell: (item: Task) => (
        <span className="text-sm">
          {item.assignee?.full_name || item.assignee?.email || "غير معيّن"}
        </span>
      ),
    },
    {
      header: "الحالة",
      accessorKey: "status" as const,
      cell: (item: Task) => (
        <Badge variant="outline" className={cn("font-medium", taskStatusConfig[item.status]?.className)}>
          {taskStatusConfig[item.status]?.label ?? item.status}
        </Badge>
      ),
    },
    {
      header: "الأولوية",
      accessorKey: "priority" as const,
      cell: (item: Task) => (
        <Badge variant="outline" className={cn("font-medium", taskPriorityConfig[item.priority]?.className)}>
          {taskPriorityConfig[item.priority]?.label ?? item.priority}
        </Badge>
      ),
    },
    {
      header: "تاريخ الاستحقاق",
      accessorKey: "due_date" as const,
      cell: (item: Task) => (
        <span className="text-sm text-muted-foreground">
          {item.due_date ? new Date(item.due_date).toLocaleDateString("ar-SA-u-ca-gregory-nu-latn") : "—"}
        </span>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary/50" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <h1 className="text-2xl font-bold">إدارة المهام</h1>
      <SmartDataTable
        data={tasks}
        columns={columns}
        isLoading={isLoading}
        searchPlaceholder="ابحث عن مهمة..."
        addButtonLabel="مهمة جديدة"
        cardTitle={(t) => t.title}
        cardSubtitle={(t) => t.assignee?.full_name || t.assignee?.email || "غير معيّن"}
        onAdd={() => navigate("/admin/tasks/new")}
        onRowClick={(t) => navigate(`/admin/tasks/${t.id}/edit`)}
        actions={(item) => (
          <>
            <DropdownMenuItem className="gap-2 cursor-pointer" onClick={(e) => {
              e.stopPropagation();
              navigate(`/admin/tasks/${item.id}/edit`);
            }}>
              <Edit className="h-4 w-4" /> تعديل
            </DropdownMenuItem>
            <DropdownMenuItem
              className="gap-2 cursor-pointer text-destructive focus:text-destructive"
              onClick={(e) => { e.stopPropagation(); setTaskToDelete(item.id); }}
            >
              <Trash className="h-4 w-4" /> حذف
            </DropdownMenuItem>
          </>
        )}
      />

      <AlertDialog open={!!taskToDelete} onOpenChange={(open) => !open && setTaskToDelete(null)}>
        <AlertDialogContent className="text-right" dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>حذف المهمة؟</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف هذه المهمة؟ لا يمكن استعادة البيانات المحذوفة.
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

export default Tasks;
