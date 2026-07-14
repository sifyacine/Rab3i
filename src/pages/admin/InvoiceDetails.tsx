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
import { invoicesService, Invoice, computeInvoiceTotals, invoiceToPreviewData, VAT_RATE } from "@/services/invoicesService";
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
  const items = invoice.items ?? [];

  // Breakdown for display. When items exist they are authoritative; otherwise
  // derive a net subtotal from the VAT-inclusive stored total (legacy invoices).
  const totals = items.length
    ? computeInvoiceTotals(items)
    : (() => {
        const subtotal = Math.round((invoice.total / (1 + VAT_RATE)) * 100) / 100;
        return { subtotal, vat: Math.round((invoice.total - subtotal) * 100) / 100, total: invoice.total };
      })();

  // print + PDF happen inside the shared dialog (same helper the list uses).
  const previewData = invoiceToPreviewData(invoice);

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
            <CardTitle>تفاصيل البنود</CardTitle>
            <FileText className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {items.length > 0 ? (
              <table className="w-full">
                <thead>
                  <tr className="text-xs text-muted-foreground border-b border-border/20">
                    <th className="text-right font-medium pb-2">البند</th>
                    <th className="text-center font-medium pb-2">الكمية</th>
                    <th className="text-left font-medium pb-2">السعر (صافي)</th>
                    <th className="text-left font-medium pb-2">المجموع</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/10">
                  {items.map((item, i) => (
                    <tr key={item.id ?? i} className="text-sm">
                      <td className="py-4 font-medium">{item.description || "—"}</td>
                      <td className="py-4 text-center font-sans">{item.quantity}</td>
                      <td className="py-4 text-left font-sans">{Number(item.unit_price).toLocaleString()}</td>
                      <td className="py-4 text-left font-sans">{(Number(item.quantity) * Number(item.unit_price)).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-sm text-muted-foreground pb-4">لا توجد بنود مُفصّلة لهذه الفاتورة — يظهر الإجمالي فقط.</p>
            )}

            <div className="mt-4 space-y-2 border-t border-border/20 pt-4">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>المجموع الفرعي</span>
                <span className="font-sans">{totals.subtotal.toLocaleString()} ر.س</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>ضريبة القيمة المضافة (15%)</span>
                <span className="font-sans">{totals.vat.toLocaleString()} ر.س</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-secondary/10 px-4 py-4 mt-2">
                <span className="text-base font-bold">الإجمالي (شامل الضريبة)</span>
                <span className="text-xl font-bold font-sans">{invoice.total.toLocaleString()} ر.س</span>
              </div>
            </div>
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
