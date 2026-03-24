import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { SmartDataTable } from "@/components/admin/SmartDataTable";
import { Badge } from "@/components/ui/badge";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { CheckCircle, Clock, Trash, Eye } from "lucide-react";
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

interface Request {
  id: string;
  sender: string;
  type: string;
  status: "analysis" | "replied" | "closed";
  date: string;
}

const mockRequests: Request[] = [
  { id: "1", sender: "شركة المعالي", type: "مشروع جديد", status: "analysis", date: "2024-03-21" },
  { id: "2", sender: "محمد الحسن", type: "استفسار", status: "replied", date: "2024-03-20" },
  { id: "3", sender: "آمال عبدالله", type: "تطوير تطبيق", status: "analysis", date: "2024-03-19" },
];

const Requests = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<Request[]>(mockRequests);
  const [requestToDelete, setRequestToDelete] = useState<string | null>(null);

  const confirmDelete = () => {
    if (requestToDelete) {
      setRequests(requests.filter(r => r.id !== requestToDelete));
      toast.success("تم حذف الطلب بنجاح");
      setRequestToDelete(null);
    }
  };

  const columns = [
    { header: "المرسل", accessorKey: "sender" as const },
    { header: "نوع الطلب", accessorKey: "type" as const },
    {
      header: "الحالة",
      accessorKey: "status" as const,
      cell: (item: Request) => (
        <Badge
          variant={
            item.status === "analysis" ? "default" :
            item.status === "replied" ? "secondary" : "destructive"
          }
        >
          {item.status === "analysis" ? "جديد (تحليل)" :
           item.status === "replied" ? "تم الرد" : "مغلق"}
        </Badge>
      ),
    },
    { header: "التاريخ", accessorKey: "date" as const },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <h1 className="text-2xl font-bold">إدارة الطلبات</h1>
      <SmartDataTable
        data={requests}
        columns={columns}
        cardTitle={(r) => r.sender}
        cardSubtitle={(r) => r.type}
        onRowClick={(r) => navigate(`/admin/requests/${r.id}`)}
        actions={(item) => (
          <>
            <DropdownMenuItem className="gap-2 cursor-pointer" onClick={(e) => {
              e.stopPropagation();
              navigate(`/admin/requests/${item.id}`);
            }}>
              <Eye className="h-4 w-4" />
              عرض التفاصيل
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 cursor-pointer text-primary focus:text-primary" onClick={(e) => {
              e.stopPropagation();
              toast.info("جاري التحويل لإنشاء مشروع بناءً على بيانات الطلب...");
              navigate("/admin/projects/new", { state: { request: item } });
            }}>
              <CheckCircle className="h-4 w-4" />
              الموافقة وبدء مشروع
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 cursor-pointer" onClick={(e) => e.stopPropagation()}>
              <CheckCircle className="h-4 w-4" />
              تحديد كـ "تم الرد"
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 cursor-pointer" onClick={(e) => e.stopPropagation()}>
              <Clock className="h-4 w-4" />
              أرشفة
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="gap-2 cursor-pointer text-destructive focus:text-destructive" 
              onClick={(e) => {
                e.stopPropagation();
                setRequestToDelete(item.id);
              }}
            >
              <Trash className="h-4 w-4" />
              حذف
            </DropdownMenuItem>
          </>
        )}
      />

      <AlertDialog open={!!requestToDelete} onOpenChange={(open) => !open && setRequestToDelete(null)}>
        <AlertDialogContent className="text-right" dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>حذف الطلب؟</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف هذا الطلب؟ لا يمكن استعادة البيانات المحذوفة.
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

export default Requests;
