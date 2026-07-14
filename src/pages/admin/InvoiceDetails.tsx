import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight, Edit, User, DollarSign, Calendar,
  CreditCard, Loader2, FileText, Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { invoicesService, Invoice } from "@/services/invoicesService";
import InvoicePreviewDialog from "@/components/admin/InvoicePreviewDialog";

const statusConfig: Record<Invoice["status"], { label: string; className: string }> = {
  paid: { label: "مدفوعة", className: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30" },
  unpaid: { label: "غير مدفوعة", className: "bg-amber-500/15 text-amber-600 border-amber-500/30" },
  overdue: { label: "متأخرة", className: "bg-red-500/15 text-red-600 border-red-500/30" },
  canceled: { label: "ملغاة", className: "bg-muted text-muted-foreground border-border" },
};

const InvoiceDetailsAdmin = () => {
  const { id } = useParams();
  const [previewOpen, setPreviewOpen] = useState(false);

  const { data: invoice, isLoading } = useQuery({
    queryKey: ["invoice", id],
    queryFn: () => invoicesService.getInvoiceById(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary/50" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="text-center py-20 space-y-4">
        <p className="text-muted-foreground">لم يتم العثور على الفاتورة</p>
        <Button variant="outline" asChild><Link to="/admin/invoices">العودة للفواتير</Link></Button>
      </div>
    );
  }

  const issued = new Date(invoice.created_at).toLocaleDateString("ar-SA");
  const status = statusConfig[invoice.status] ?? statusConfig.unpaid;

  // Mapped shape the shared preview/PDF dialog expects. Itemised billing is not
  // stored yet, so we present the invoice total as a single line (see the
  // invoice-line-items task); print + PDF happen inside the dialog.
  const previewData = {
    id: invoice.id,
    clientName: invoice.customer_name,
    clientEmail: invoice.customer_phone || "",
    amount: invoice.total,
    currency: "ر.س",
    status: invoice.status,
    date: issued,
    dueDate: "—",
    items: [{ description: "خدمات تصميم وتطوير", quantity: 1, price: invoice.total }],
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-5xl mx-auto pb-20" dir="rtl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild className="rounded-full">
            <Link to="/admin/invoices"><ArrowRight className="h-4 w-4" /></Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold font-sans">{invoice.id}</h1>
              <Badge variant="outline" className={cn("font-medium", status.className)}>{status.label}</Badge>
            </div>
            <p className="text-muted-foreground flex items-center gap-2 mt-1">
              <User className="h-3.5 w-3.5" />
              {invoice.customer_name}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2" onClick={() => setPreviewOpen(true)}>
            <Eye className="h-4 w-4" /> معاينة / طباعة / PDF
          </Button>
          <Button variant="outline" asChild className="gap-2">
            <Link to={`/admin/invoices/${id}/edit`}><Edit className="h-4 w-4" /> تعديل</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-border/40 bg-card/30">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border/20 mb-4 pb-4">
            <CardTitle>الإجمالي</CardTitle>
            <FileText className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between rounded-xl bg-secondary/10 px-4 py-6">
              <span className="text-base font-bold">الإجمالي الكلي</span>
              <span className="text-2xl font-bold font-sans">{invoice.total.toLocaleString()} ر.س</span>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              تفصيل البنود غير مُخزّن حالياً — يظهر الإجمالي فقط. لعرض/طباعة فاتورة منسّقة استخدم زر «معاينة».
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/40 bg-card/30">
          <CardHeader>
            <CardTitle className="text-lg">ملخص الفاتورة</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-border/20">
              <span className="text-sm text-muted-foreground flex items-center gap-2"><Calendar className="h-4 w-4" /> تاريخ الإصدار</span>
              <span className="text-sm font-medium font-sans">{issued}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border/20">
              <span className="text-sm text-muted-foreground flex items-center gap-2"><CreditCard className="h-4 w-4" /> طريقة الدفع</span>
              <span className="text-sm font-medium">{invoice.payment_method || "—"}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-muted-foreground flex items-center gap-2"><DollarSign className="h-4 w-4" /> المبلغ</span>
              <span className="text-sm font-bold font-sans text-emerald-500">{invoice.total.toLocaleString()} ر.س</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <InvoicePreviewDialog invoice={previewData} isOpen={previewOpen} onOpenChange={setPreviewOpen} />
    </motion.div>
  );
};

export default InvoiceDetailsAdmin;
