import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { SmartDataTable } from "@/components/admin/SmartDataTable";
import { Badge } from "@/components/ui/badge";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { 
  ExternalLink, Edit, Trash, Eye
} from "lucide-react";
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

export type ProjectStatus = "analysis" | "in_discussion" | "offered" | "ongoing" | "completed" | "archived";

export interface Milestone {
  id: string;
  title: string;
  description: string;
  weight: number; // Percentage
  status: "pending" | "in_progress" | "completed";
  client_approval: "pending" | "approved" | "rejected";
}

export interface Project {
  id: string;
  title: string;
  category: string;
  client: string;
  status: ProjectStatus;
  description: string;
  image?: string;
  startDate: string;
  endDate?: string;
  budget?: string;
  link?: string;
  milestones?: Milestone[];
}

export const statusMap: Record<ProjectStatus, { label: string, variant: string, className?: string }> = {
  analysis: { label: "قيد المراجعة / التحليل", variant: "secondary", className: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  in_discussion: { label: "قيد النقاش / الاجتماع", variant: "outline", className: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  offered: { label: "تم تقديم العرض", variant: "outline", className: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20" },
  ongoing: { label: "قيد التنفيذ", variant: "default", className: "bg-primary text-white" },
  completed: { label: "مكتمل", variant: "default", className: "bg-emerald-500 text-white" },
  archived: { label: "مؤرشف", variant: "destructive", className: "bg-red-500/10 text-red-600 border-red-500/20" },
};

const mockProjects: Project[] = [
  { 
    id: "1", 
    title: "موقع شركة النبراس", 
    category: "تطوير ويب", 
    client: "النبراس العقارية", 
    status: "completed", 
    description: "تطوير موقع تعريفي متكامل لشركة النبراس العقارية مع لوحة تحكم.",
    startDate: "2024-03-15",
    budget: "5000$",
    link: "https://al-nebras.com"
  },
  { 
    id: "2", 
    title: "تطبيق ربيعي للمسافرين", 
    category: "تطبيق جوال", 
    client: "شركة ربيعي", 
    status: "ongoing", 
    description: "تطبيق لمساعدة المسافرين في العثور على أفضل الوجهات والخدمات في المملكة.",
    startDate: "2024-05-20",
    budget: "12000$"
  },
  { 
    id: "3", 
    title: "هوية بصرية لستوديو فنون", 
    category: "تصميم جرافيك", 
    client: "ستوديو فنون", 
    status: "archived", 
    description: "تصميم شعار وهوية بصرية كاملة لستوديو فنون المتخصص في التصوير.",
    startDate: "2023-11-10"
  },
];

const Projects = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

  const confirmDelete = () => {
    if (projectToDelete) {
      setProjects(projects.filter(p => p.id !== projectToDelete));
      toast.success("تم حذف المشروع بنجاح");
      setProjectToDelete(null);
    }
  };

  const columns = [
    { header: "المشروع", accessorKey: "title" as const },
    { header: "الفئة", accessorKey: "category" as const },
    { header: "العميل", accessorKey: "client" as const },
    {
      header: "الحالة",
      accessorKey: "status" as const,
      cell: (item: Project) => (
        <Badge
          variant={statusMap[item.status].variant as any}
          className={cn("font-medium", statusMap[item.status].className)}
        >
          {statusMap[item.status].label}
        </Badge>
      ),
    },
    { header: "التاريخ", accessorKey: "startDate" as const },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">إدارة المشاريع</h1>
      </div>

      <SmartDataTable
        data={projects}
        columns={columns}
        cardTitle={(p) => p.title}
        cardSubtitle={(p) => p.category}
        onAdd={() => navigate("/admin/projects/new")}
        onRowClick={(p) => navigate(`/admin/projects/${p.id}`)}
        actions={(item) => (
          <>
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
