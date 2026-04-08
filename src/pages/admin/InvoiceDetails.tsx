import { useParams, Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";
import { 
  ArrowRight, Edit, Trash, Download, 
  User, DollarSign, Calendar, Hash, CheckCircle2, 
  Printer, Share2, Info, Clock, FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";

const InvoiceDetailsAdmin = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Mock invoice data
  const invoice = {
    id: "1", 
    invoiceNumber: "INV-2024-001", 
    client: "ياسين سيف", 
    amount: "5000 ⃁", 
    status: "paid", 
    dueDate: "2024-04-01",
    issueDate: "2024-03-20",
    items: [
      { id: 1, title: "تطوير موقع الكتروني", price: "4000 ⃁" },
      { id: 2, title: "تصميم الهوية البصرية", price: "1000 ⃁" }
    ]
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
              <h1 className="text-3xl font-bold font-sans">{invoice.invoiceNumber}</h1>
              <Badge variant={invoice.status === 'paid' ? 'default' : 'secondary'} className={invoice.status === 'paid' ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20' : ''}>
                {invoice.status === "paid" ? "مدفوعة" : "قيد الانتظار"}
              </Badge>
            </div>
            <p className="text-muted-foreground flex items-center gap-2 mt-1">
              <User className="h-3.5 w-3.5" />
              {invoice.client}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2"><Printer className="h-4 w-4" /> طباعة</Button>
          <Button variant="outline" className="gap-2"><Download className="h-4 w-4" /> PDF</Button>
          <Button variant="outline" asChild className="gap-2">
            <Link to={`/admin/invoices/${id}/edit`}><Edit className="h-4 w-4" /> تعديل</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border/40 bg-card/30">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border/20 mb-4 pb-4">
              <CardTitle>تفاصيل البنود</CardTitle>
              <FileText className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <table className="w-full">
                <thead>
                  <tr className="text-xs text-muted-foreground border-b border-border/20">
                    <th className="text-right font-medium pb-2">البند</th>
                    <th className="text-left font-medium pb-2">السعر</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/10">
                  {invoice.items.map((item) => (
                    <tr key={item.id} className="text-sm">
                      <td className="py-4 font-medium">{item.title}</td>
                      <td className="py-4 text-left font-sans">{item.price}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="text-base font-bold bg-secondary/10">
                    <td className="py-4 pr-4 rounded-r-xl">الإجمالي الكلي</td>
                    <td className="py-4 pl-4 text-left rounded-l-xl font-sans">{invoice.amount}</td>
                  </tr>
                </tfoot>
              </table>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-border/40 bg-card/30">
            <CardHeader>
              <CardTitle className="text-lg">ملخص الفاتورة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center justify-between py-2 border-b border-border/20">
                  <span className="text-sm text-muted-foreground flex items-center gap-2"><Calendar className="h-4 w-4" /> تاريخ الإصدار</span>
                  <span className="text-sm font-medium font-sans">{invoice.issueDate}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border/20">
                  <span className="text-sm text-muted-foreground flex items-center gap-2"><Clock className="h-4 w-4" /> مجدولة للدفع</span>
                  <span className="text-sm font-medium font-sans text-amber-500">{invoice.dueDate}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border/20">
                  <span className="text-sm text-muted-foreground flex items-center gap-2"><DollarSign className="h-4 w-4" /> المبلغ المستلم</span>
                  <span className="text-sm font-bold font-sans text-emerald-500">5000.00 ⃁</span>
                </div>
              </div>
              <Button className="w-full gap-2" variant="secondary"><Share2 className="h-4 w-4" /> مشاركة الرابط مع العميل</Button>
            </CardContent>
          </Card>

          <Card className="border-border/40 bg-card/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2 text-primary">
                <Info className="h-4 w-4" /> ملاحظات إدارية
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground italic leading-loose">
              تم تسليم كامل بنود الفاتورة. تم استلام الدفعة عبر تحويل بنكي بتاريخ 21 مارس.
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
};

export default InvoiceDetailsAdmin;
