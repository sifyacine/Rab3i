import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { SmartDataTable } from "@/components/admin/SmartDataTable";
import { Badge } from "@/components/ui/badge";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Download, Eye, Edit, Trash, Printer, FileText } from "lucide-react";
import InvoicePreviewDialog from "@/components/admin/InvoicePreviewDialog";
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
import { invoicesService, Invoice } from "@/services/invoicesService";

const InvoicesAdmin = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [invoiceToDelete, setInvoiceToDelete] = useState<string | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ["invoices"],
    queryFn: () => invoicesService.getInvoices()
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => invoicesService.deleteInvoice(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast.success("تم حذف الفاتورة بنجاح");
    },
    onError: () => toast.error("حدث خطأ أثناء الحذف")
  });

  const confirmDelete = () => {
    if (invoiceToDelete) {
      deleteMutation.mutate(invoiceToDelete);
      setInvoiceToDelete(null);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ar-SA');
  };

  const columns = [
    { header: "العميل", accessorKey: "customer_name" as const },
    { 
      header: "المبلغ", 
      accessorKey: "total" as const,
      cell: (item: Invoice) => <span>⃁ {item.total.toLocaleString()}</span>
    },
    {
      header: "الحالة",
      accessorKey: "status" as const,
      cell: (item: Invoice) => (
        <Badge
          variant={
            item.status === "paid" ? "default" :
            item.status === "unpaid" ? "secondary" : 
            item.status === "canceled" ? "outline" : "destructive"
          }
          className={cn(
            "font-medium",
            item.status === "paid" ? "bg-emerald-500 text-white" :
            item.status === "unpaid" ? "bg-amber-500/10 text-amber-600 border-amber-500/20" : 
            item.status === "canceled" ? "bg-slate-500/10 text-slate-600 border-slate-500/20" : ""
          )}
        >
          {item.status === "paid" ? "مدفوعة" :
           item.status === "unpaid" ? "غير مدفوعة" :
           item.status === "canceled" ? "ملغاة" : "متأخرة"}
        </Badge>
      ),
    },
    { 
      header: "التاريخ", 
      accessorKey: "created_at" as const,
      cell: (item: Invoice) => formatDate(item.created_at)
    },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <h1 className="text-2xl font-bold">إدارة الفواتير</h1>
      <SmartDataTable
        data={invoices}
        columns={columns}
        isLoading={isLoading}
        cardTitle={(i) => i.customer_name}
        cardSubtitle={(i) => <span>⃁ {i.total.toLocaleString()}</span>}
        onAdd={() => navigate("/admin/invoices/new")}
        onRowClick={(i) => navigate(`/admin/invoices/${i.id}`)}
        actions={(item) => (
          <>
            <DropdownMenuItem className="gap-2 cursor-pointer" onClick={(e) => {
              e.stopPropagation();
              setSelectedInvoice(item);
              setIsPreviewOpen(true);
            }}>
              <Eye className="h-4 w-4" />
              معاينة وطباعة
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 cursor-pointer" onClick={(e) => {
              e.stopPropagation();
              navigate(`/admin/invoices/${item.id}/edit`);
            }}>
              <Edit className="h-4 w-4" />
              تعديل
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 cursor-pointer" onClick={(e) => e.stopPropagation()}>
              <Download className="h-4 w-4" />
              تحميل PDF
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 cursor-pointer" onClick={(e) => e.stopPropagation()}>
              <Printer className="h-4 w-4" />
              طباعة
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="gap-2 cursor-pointer text-destructive focus:text-destructive" 
              onClick={(e) => {
                e.stopPropagation();
                setInvoiceToDelete(item.id);
              }}
            >
              <Trash className="h-4 w-4" />
              حذف
            </DropdownMenuItem>
          </>
        )}
      />

      <AlertDialog open={!!invoiceToDelete} onOpenChange={(open) => !open && setInvoiceToDelete(null)}>
        <AlertDialogContent className="text-right" dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>حذف الفاتورة؟</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف هذه الفاتورة؟ سيتم إزالتها من سجلات النظام.
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
      <InvoicePreviewDialog 
        isOpen={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
        invoice={selectedInvoice ? {
          id: selectedInvoice.id,
          clientName: selectedInvoice.customer_name,
          clientEmail: selectedInvoice.customer_phone || "",
          amount: selectedInvoice.total,
          currency: "SAR",
          status: selectedInvoice.status,
          date: selectedInvoice.created_at,
          dueDate: selectedInvoice.created_at,
          items: [
            { description: "خدمات تصميم وتطوير متكاملة", quantity: 1, price: selectedInvoice.total }
          ]
        } : null}
      />
    </motion.div>
  );
};

export default InvoicesAdmin;
