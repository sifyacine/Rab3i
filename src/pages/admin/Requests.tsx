import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { SmartDataTable } from "@/components/admin/SmartDataTable";
import { Badge } from "@/components/ui/badge";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { CheckCircle, Clock, Trash, Eye, Loader2, UserPlus } from "lucide-react";
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
import { requestsService, GuestRequest, RequestStatus } from "@/services/requestsService";

const statusConfig: Record<RequestStatus, { label: string; className: string }> = {
  new:       { label: "جديد", className: "bg-blue-500/15 text-blue-600 border-blue-500/30" },
  analysis:  { label: "قيد المراجعة", className: "bg-amber-500/15 text-amber-600 border-amber-500/30" },
  replied:   { label: "تم الرد", className: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30" },
  converted: { label: "تحوّل لمشروع", className: "bg-primary/15 text-primary border-primary/30" },
  closed:    { label: "مغلق", className: "bg-muted text-muted-foreground border-border" },
};

const Requests = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [requestToDelete, setRequestToDelete] = useState<string | null>(null);

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ["admin-requests"],
    queryFn: () => requestsService.getRequests(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => requestsService.deleteRequest(id),
    onSuccess: () => {
      toast.success("تم حذف الطلب");
      queryClient.invalidateQueries({ queryKey: ["admin-requests"] });
      setRequestToDelete(null);
    },
    onError: () => toast.error("حدث خطأ أثناء الحذف"),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: RequestStatus }) =>
      requestsService.updateRequest(id, { status }),
    onSuccess: () => {
      toast.success("تم تحديث الحالة");
      queryClient.invalidateQueries({ queryKey: ["admin-requests"] });
    },
  });

  const columns = [
    {
      header: "المرسل",
      accessorKey: "guest_name" as const,
      cell: (item: GuestRequest) => (
        <div>
          <p className="font-medium">{item.guest_name}</p>
          <p className="text-xs text-muted-foreground" dir="ltr">{item.guest_email}</p>
          {item.guest_phone && <p className="text-xs text-muted-foreground" dir="ltr">{item.guest_phone}</p>}
        </div>
      ),
    },
    { header: "نوع المشروع", accessorKey: "project_type" as const },
    {
      header: "الحالة",
      accessorKey: "status" as const,
      cell: (item: GuestRequest) => {
        const cfg = statusConfig[item.status];
        return (
          <Badge variant="outline" className={cn("font-medium text-xs", cfg.className)}>
            {cfg.label}
          </Badge>
        );
      },
    },
    {
      header: "حساب مرتبط",
      accessorKey: "user_id" as const,
      cell: (item: GuestRequest) => (
        <span className={cn("text-xs", item.user_id ? "text-emerald-600" : "text-muted-foreground")}>
          {item.user_id ? "✓ نعم" : "ضيف"}
        </span>
      ),
    },
    {
      header: "التاريخ",
      accessorKey: "created_at" as const,
      cell: (item: GuestRequest) => (
        <span className="text-xs text-muted-foreground">
          {new Date(item.created_at).toLocaleDateString("ar-SA", { year: "numeric", month: "short", day: "numeric" })}
        </span>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">إدارة الطلبات</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {requests.length} طلب إجمالاً — {requests.filter(r => r.status === "new").length} جديد
          </p>
        </div>
      </div>

      <SmartDataTable
        data={requests}
        columns={columns}
        cardTitle={(r) => r.guest_name}
        cardSubtitle={(r) => r.project_type}
        onRowClick={(r) => navigate(`/admin/requests/${r.id}`)}
        actions={(item: GuestRequest) => (
          <>
            <DropdownMenuItem className="gap-2 cursor-pointer" onClick={(e) => {
              e.stopPropagation();
              navigate(`/admin/requests/${item.id}`);
            }}>
              <Eye className="h-4 w-4" /> عرض التفاصيل
            </DropdownMenuItem>

            <DropdownMenuItem className="gap-2 cursor-pointer text-primary focus:text-primary" onClick={(e) => {
              e.stopPropagation();
              updateStatusMutation.mutate({ id: item.id, status: "analysis" });
              navigate("/admin/projects/new", { state: { request: item } });
            }}>
              <CheckCircle className="h-4 w-4" /> الموافقة وبدء مشروع
            </DropdownMenuItem>

            {item.status === "new" && (
              <DropdownMenuItem className="gap-2 cursor-pointer" onClick={(e) => {
                e.stopPropagation();
                updateStatusMutation.mutate({ id: item.id, status: "replied" });
              }}>
                <CheckCircle className="h-4 w-4" /> تحديد كـ "تم الرد"
              </DropdownMenuItem>
            )}

            <DropdownMenuItem className="gap-2 cursor-pointer" onClick={(e) => {
              e.stopPropagation();
              updateStatusMutation.mutate({ id: item.id, status: "closed" });
            }}>
              <Clock className="h-4 w-4" /> إغلاق الطلب
            </DropdownMenuItem>

            {!item.user_id && (
              <DropdownMenuItem className="gap-2 cursor-pointer text-blue-600 focus:text-blue-600" onClick={(e) => {
                e.stopPropagation();
                toast.info(`سيُربط تلقائياً عند تسجيل ${item.guest_email} كحساب`);
              }}>
                <UserPlus className="h-4 w-4" /> إرسال دعوة إنشاء حساب
              </DropdownMenuItem>
            )}

            <DropdownMenuItem
              className="gap-2 cursor-pointer text-destructive focus:text-destructive"
              onClick={(e) => { e.stopPropagation(); setRequestToDelete(item.id); }}
            >
              <Trash className="h-4 w-4" /> حذف
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
            <AlertDialogAction
              onClick={() => requestToDelete && deleteMutation.mutate(requestToDelete)}
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

export default Requests;
