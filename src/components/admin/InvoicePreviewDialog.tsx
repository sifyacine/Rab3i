import { useState } from "react";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, 
  DialogDescription, DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Download, Printer, Globe, FileText, 
  User, Calendar, Landmark, CreditCard 
} from "lucide-react";
import { toast } from "sonner";

interface InvoiceData {
  id: string;
  clientName: string;
  clientEmail: string;
  amount: number;
  currency: string;
  status: "paid" | "unpaid" | "overdue" | "canceled";
  date: string;
  dueDate: string;
  items: Array<{ description: string; quantity: number; price: number }>;
}

interface InvoicePreviewDialogProps {
  invoice: InvoiceData | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const InvoicePreviewDialog = ({ invoice, isOpen, onOpenChange }: InvoicePreviewDialogProps) => {
  const [lang, setLang] = useState<"ar" | "en">("ar");

  if (!invoice) return null;

  const handleDownload = () => {
    toast.success(lang === "ar" ? "جاري تحضير الفاتورة للتحميل..." : "Preparing invoice for download...");
  };

  const handlePrint = () => {
    window.print();
  };

  const t = {
    ar: {
      invoice: "فاتورة",
      billTo: "مقدمة إلى",
      date: "التاريخ",
      dueDate: "تاريخ الاستحقاق",
      status: "الحالة",
      description: "الوصف",
      quantity: "الكمية",
      price: "السعر",
      total: "الإجمالي",
      subtotal: "المجموع الفرعي",
      tax: "الضريبة (15%)",
      grandTotal: "المجموع الكلي",
      paid: "مدفوعة",
      unpaid: "غير مدفوعة",
      overdue: "متأخرة",
      canceled: "ملغاة",
      download: "تحميل PDF",
      print: "طباعة",
      language: "English",
      close: "إغلاق"
    },
    en: {
      invoice: "Invoice",
      billTo: "Bill To",
      date: "Date",
      dueDate: "Due Date",
      status: "Status",
      description: "Description",
      quantity: "Qty",
      price: "Price",
      total: "Total",
      subtotal: "Subtotal",
      tax: "Tax (15%)",
      grandTotal: "Grand Total",
      paid: "Paid",
      unpaid: "Unpaid",
      overdue: "Overdue",
      canceled: "Canceled",
      download: "Download PDF",
      print: "Print",
      language: "العربية",
      close: "Close"
    }
  };

  const content = t[lang];
  const isRtl = lang === "ar";

  const subtotal = invoice.items.reduce((acc, item) => acc + (item.quantity * item.price), 0);
  const tax = subtotal * 0.15;
  const total = subtotal + tax;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between border-b pb-4 mb-6">
          <div className="space-y-1 text-right">
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" />
              {content.invoice} #{invoice.id}
            </DialogTitle>
            <DialogDescription>
              {isRtl ? "معاينة الفاتورة وتفاصيل السداد" : "Preview invoice and payment details"}
            </DialogDescription>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setLang(lang === "ar" ? "en" : "ar")}
              className="gap-2"
            >
              <Globe className="h-4 w-4" />
              {content.language}
            </Button>
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className={`p-8 bg-white text-slate-900 rounded-lg shadow-inner border font-sans ${isRtl ? "text-right" : "text-left"}`} dir={isRtl ? "rtl" : "ltr"}>
          <div className="flex justify-between items-start mb-12">
            <div className="space-y-4">
              <div className="h-12 w-32 flex items-center">
                <img src="/Logo Arabic Version 02.png" alt="Rabii" className="h-10 w-auto" />
              </div>
              <div className="text-sm text-slate-500">
                <p>شارع التخصصي، حي المعذر</p>
                <p>الرياض، المملكة العربية السعودية</p>
                <p>VAT: 310000000000003</p>
              </div>
            </div>
            <div className="text-right space-y-1">
              <h2 className="text-3xl font-bold text-primary">{content.invoice}</h2>
              <p className="text-slate-500">#{invoice.id}</p>
              <Badge 
                variant={invoice.status === "paid" ? "default" : "destructive"}
                className="mt-2"
              >
                {content[invoice.status]}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-12">
            <div className="space-y-2">
              <h4 className="text-xs uppercase tracking-wider text-slate-400 font-bold">{content.billTo}</h4>
              <p className="font-bold text-lg">{invoice.clientName}</p>
              <p className="text-slate-500">{invoice.clientEmail}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <h4 className="text-xs uppercase tracking-wider text-slate-400 font-bold">{content.date}</h4>
                <p className="font-medium">{invoice.date}</p>
              </div>
              <div className="space-y-1">
                <h4 className="text-xs uppercase tracking-wider text-slate-400 font-bold">{content.dueDate}</h4>
                <p className="font-medium">{invoice.dueDate}</p>
              </div>
            </div>
          </div>

          <table className="w-full mb-12">
            <thead>
              <tr className="border-b-2 border-slate-100 text-slate-400 text-xs uppercase tracking-wider">
                <th className={`py-4 font-bold ${isRtl ? "text-right" : "text-left"}`}>{content.description}</th>
                <th className="py-4 font-bold text-center">{content.quantity}</th>
                <th className={`py-4 font-bold ${isRtl ? "text-left" : "text-right"}`}>{content.price}</th>
                <th className={`py-4 font-bold ${isRtl ? "text-left" : "text-right"}`}>{content.total}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoice.items.map((item, i) => (
                <tr key={i}>
                  <td className="py-6 font-medium">{item.description}</td>
                  <td className="py-6 text-center">{item.quantity}</td>
                  <td className={`py-6 font-medium ${isRtl ? "text-left" : "text-right"}`}>
                    {item.price.toLocaleString()} {invoice.currency}
                  </td>
                  <td className={`py-6 font-bold ${isRtl ? "text-left" : "text-right"}`}>
                    {(item.quantity * item.price).toLocaleString()} {invoice.currency}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className={`flex ${isRtl ? "justify-start" : "justify-end"}`}>
            <div className="w-full max-w-xs space-y-3">
              <div className="flex justify-between text-slate-500">
                <span>{content.subtotal}</span>
                <span>{subtotal.toLocaleString()} {invoice.currency}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>{content.tax}</span>
                <span>{tax.toLocaleString()} {invoice.currency}</span>
              </div>
              <div className="flex justify-between text-xl font-bold border-t pt-3 text-primary">
                <span>{content.grandTotal}</span>
                <span>{total.toLocaleString()} {invoice.currency}</span>
              </div>
            </div>
          </div>
          
          <div className="mt-16 pt-8 border-t border-slate-100 text-center text-xs text-slate-400">
            {isRtl ? "شكراً لتعاملك مع شركتنا. هذا مستند أصلي تم إنشاؤه آلياً." : "Thank you for your business. This is a computer generated original document."}
          </div>
        </div>

        <DialogFooter className="mt-6 gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>{content.close}</Button>
          <Button onClick={handleDownload} className="gap-2">
            <Download className="h-4 w-4" />
            {content.download}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InvoicePreviewDialog;
