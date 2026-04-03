import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { SmartDataTable } from "@/components/admin/SmartDataTable";
import { Badge } from "@/components/ui/badge";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Edit, Trash, Eye, Zap } from "lucide-react";
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
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { servicesService } from "@/services/servicesService";
import { Service } from "@/types/portfolio";
import { cn } from "@/lib/utils";

const ServicesAdmin = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [serviceToDelete, setServiceToDelete] = useState<string | null>(null);

  const { data: services = [], isLoading } = useQuery({
    queryKey: ["admin-services"],
    queryFn: () => servicesService.getServices(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => servicesService.deleteService(id),
    onSuccess: () => {
      toast.success("تم حذف الخدمة بنجاح");
      queryClient.invalidateQueries({ queryKey: ["admin-services"] });
      setServiceToDelete(null);
    },
    onError: () => toast.error("حدث خطأ أثناء الحذف"),
  });

  const columns = [
    {
      header: "الخدمة (عربي)",
      accessorKey: "title_ar" as const,
      cell: (item: Service) => (
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Zap className="h-4 w-4" />
          </div>
          <span className="font-medium">{item.title_ar}</span>
        </div>
      ),
    },
    { header: "Service (English)", accessorKey: "title_en" as const },
    { header: "Slug", accessorKey: "slug" as const, cell: (item: Service) => (
      <code className="rounded bg-secondary px-2 py-0.5 text-xs">{item.slug}</code>
    )},
    {
      header: "الحالة",
      accessorKey: "is_active" as const,
      cell: (item: Service) => (
        <Badge
          className={cn(
            "font-medium",
            item.is_active
              ? "bg-emerald-500/15 text-emerald-600 border-emerald-500/30"
              : "bg-slate-500/10 text-slate-500 border-slate-500/20"
          )}
          variant="outline"
        >
          {item.is_active ? "نشط" : "غير نشط"}
        </Badge>
      ),
    },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">إدارة الخدمات</h1>
          <p className="text-sm text-muted-foreground mt-1">
            الخدمات والأدوات التي تستخدمها في مشاريعك – يمكن للعملاء التصفية بها
          </p>
        </div>
      </div>

      <SmartDataTable
        data={services}
        columns={columns}
        cardTitle={(s: Service) => s.title_ar}
        cardSubtitle={(s: Service) => s.title_en}
        onAdd={() => navigate("/admin/services/new")}
        onRowClick={(s: Service) => navigate(`/admin/services/${s.id}`)}
        actions={(item: Service) => (
          <>
            <DropdownMenuItem className="gap-2 cursor-pointer" onClick={(e) => {
              e.stopPropagation();
              navigate(`/admin/services/${item.id}`);
            }}>
              <Eye className="h-4 w-4" /> عرض التفاصيل
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 cursor-pointer" onClick={(e) => {
              e.stopPropagation();
              navigate(`/admin/services/${item.id}/edit`);
            }}>
              <Edit className="h-4 w-4" /> تعديل
            </DropdownMenuItem>
            <DropdownMenuItem
              className="gap-2 cursor-pointer text-destructive focus:text-destructive"
              onClick={(e) => { e.stopPropagation(); setServiceToDelete(item.id); }}
            >
              <Trash className="h-4 w-4" /> حذف
            </DropdownMenuItem>
          </>
        )}
      />

      <AlertDialog open={!!serviceToDelete} onOpenChange={(open) => !open && setServiceToDelete(null)}>
        <AlertDialogContent className="text-right" dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>حذف الخدمة؟</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف هذه الخدمة؟ ستُزال من جميع المشاريع المرتبطة بها تلقائياً.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:justify-start">
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => serviceToDelete && deleteMutation.mutate(serviceToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              تأكيد الحذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
};

export default ServicesAdmin;
