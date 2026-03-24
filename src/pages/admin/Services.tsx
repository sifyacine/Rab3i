import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { SmartDataTable } from "@/components/admin/SmartDataTable";
import { Badge } from "@/components/ui/badge";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Edit, Trash, Eye } from "lucide-react";
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

interface Service {
  id: string;
  name: string;
  price: string;
  status: "active" | "inactive";
  category: string;
}

const mockServices: Service[] = [
  { id: "1", name: "تصميم وتطوير المواقع", price: "تبدأ من 500$", status: "active", category: "تطوير ويب" },
  { id: "2", name: "تطوير تطبيقات الجوال", price: "تبدأ من 1200$", status: "active", category: "تطبيق جوال" },
  { id: "3", name: "تحليل البيانات والذكاء الاصطناعي", price: "حسب الطلب", status: "inactive", category: "تطوير ويب" },
  { id: "4", name: "الهوية البصرية والتصميم", price: "تبدأ من 300$", status: "active", category: "تصميم جرافيك" },
];

const ServicesAdmin = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>(mockServices);
  const [serviceToDelete, setServiceToDelete] = useState<string | null>(null);

  const confirmDelete = () => {
    if (serviceToDelete) {
      setServices(services.filter(s => s.id !== serviceToDelete));
      toast.success("تم حذف الخدمة بنجاح");
      setServiceToDelete(null);
    }
  };

  const columns = [
    { header: "الخدمة", accessorKey: "name" as const },
    { header: "الفئة", accessorKey: "category" as const },
    { header: "السعر", accessorKey: "price" as const },
    {
      header: "الحالة",
      accessorKey: "status" as const,
      cell: (item: Service) => (
        <Badge variant={item.status === "active" ? "default" : "secondary"}>
          {item.status === "active" ? "نشط" : "غير نشط"}
        </Badge>
      ),
    },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">إدارة الخدمات</h1>
      </div>

      <SmartDataTable
        data={services}
        columns={columns}
        cardTitle={(s) => s.name}
        cardSubtitle={(s) => s.category}
        onAdd={() => navigate("/admin/services/new")}
        onRowClick={(s) => navigate(`/admin/services/${s.id}`)}
        actions={(item) => (
          <>
            <DropdownMenuItem className="gap-2 cursor-pointer" onClick={(e) => {
              e.stopPropagation();
              navigate(`/admin/services/${item.id}`);
            }}>
              <Eye className="h-4 w-4" />
              عرض التفاصيل
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 cursor-pointer" onClick={(e) => {
              e.stopPropagation();
              navigate(`/admin/services/${item.id}/edit`);
            }}>
              <Edit className="h-4 w-4" />
              تعديل
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="gap-2 cursor-pointer text-destructive focus:text-destructive" 
              onClick={(e) => {
                e.stopPropagation();
                setServiceToDelete(item.id);
              }}
            >
              <Trash className="h-4 w-4" />
              حذف
            </DropdownMenuItem>
          </>
        )}
      />

      <AlertDialog open={!!serviceToDelete} onOpenChange={(open) => !open && setServiceToDelete(null)}>
        <AlertDialogContent className="text-right" dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>حذف الخدمة؟</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف هذه الخدمة؟ لا يمكن جلب البيانات المحذوفة مرة أخرى. سيتم إخفاء الخدمة من الموقع لجميع العملاء.
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

export default ServicesAdmin;
