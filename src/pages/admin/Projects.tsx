import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { SmartDataTable } from "@/components/admin/SmartDataTable";
import { Badge } from "@/components/ui/badge";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { ExternalLink, Edit, Trash, Eye, Plus } from "lucide-react";
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
import { projectsService } from "@/services/projectsService";
import { Project } from "@/types/portfolio";
import { Button } from "@/components/ui/button";

const Projects = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

  const { data: projectsData, isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: () => projectsService.getProjects(),
  });

  const deleteMutation = useMutation({
    mutationFn: projectsService.deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("تم حذف المشروع بنجاح");
      setProjectToDelete(null);
    },
    onError: (err: any) => {
      toast.error(err.message || "حدث خطأ أثناء الحذف");
    }
  });

  const confirmDelete = () => {
    if (projectToDelete) {
      deleteMutation.mutate(projectToDelete);
    }
  };

  const columns: any[] = [
    { header: "المشروع", accessorKey: "title" as const },
    { 
      header: "الفئة", 
      accessorKey: "category",
      cell: (item: Project) => item.category?.name || "بدون فئة" 
    },
    { 
      header: "الحالة", 
      accessorKey: "is_published",
      cell: (item: Project) => (
        <Badge variant={item.is_published ? "default" : "secondary"}>
          {item.is_published ? "منشور" : "مسودة"}
        </Badge>
      )
    },
    { 
      header: "تاريخ الإنشاء", 
      accessorKey: "created_at",
      cell: (item: Project) => new Date(item.created_at).toLocaleDateString('ar-SA')
    },
    { header: "المشاهدات", accessorKey: "views" as const },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">إدارة المشاريع (Portfolio)</h1>
      </div>

      <SmartDataTable
        data={projectsData?.data || []}
        columns={columns}
        cardTitle={(p: Project) => p.title}
        cardSubtitle={(p: Project) => p.category?.name || "بدون فئة"}
        onAdd={() => navigate("/admin/projects/new")}
        onRowClick={(p: Project) => navigate(`/admin/projects/${p.id}`)}
        actions={(item: Project) => (
          <>
            <DropdownMenuItem className="gap-2 cursor-pointer" onClick={(e) => {
              e.stopPropagation();
              navigate(`/portfolio/${item.slug}`);
            }}>
              <ExternalLink className="h-4 w-4" />
              عرض كزائر
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 cursor-pointer" onClick={(e) => {
              e.stopPropagation();
              navigate(`/admin/projects/${item.id}`);
            }}>
              <Eye className="h-4 w-4" />
              عرض التفاصيل
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 cursor-pointer" onClick={(e) => {
              e.stopPropagation();
              navigate(`/admin/projects/${item.id}/edit`);
            }}>
              <Edit className="h-4 w-4" />
              تعديل
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="gap-2 cursor-pointer text-destructive focus:text-destructive" 
              onClick={(e) => {
                e.stopPropagation();
                setProjectToDelete(item.id);
              }}
            >
              <Trash className="h-4 w-4" />
              حذف
            </DropdownMenuItem>
          </>
        )}
      />

      <AlertDialog open={!!projectToDelete} onOpenChange={(open) => !open && setProjectToDelete(null)}>
        <AlertDialogContent className="text-right" dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد تماماً؟</AlertDialogTitle>
            <AlertDialogDescription>
              هذا الإجراء لا يمكن التراجع عنه. سيتم حذف المشروع وكافة البيانات المتعلقة به نهائياً من قاعدة البيانات.
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

export default Projects;
