import { useState } from "react";
import { motion } from "framer-motion";
import { SmartDataTable } from "@/components/admin/SmartDataTable";
import { Badge } from "@/components/ui/badge";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Download, CreditCard, Info, Eye } from "lucide-react";
import InvoicePreviewDialog from "@/components/admin/InvoicePreviewDialog";

interface PortalInvoice {
  id: string;
  project: string;
  amount: string;
  status: "paid" | "unpaid" | "overdue" | "canceled";
  dueDate: string;
  clientName: string;
  clientEmail: string;
  date: string;
}

const mockPortalInvoices: PortalInvoice[] = [
  { id: "INV-001", project: "موقع شركة النبراس", amount: "1200", status: "paid", dueDate: "2024-03-30", date: "2024-03-21", clientName: "ياسين سيف", clientEmail: "yacine@example.com" },
  { id: "INV-002", project: "تطبيق ربيعي للمسافرين", amount: "3500", status: "unpaid", dueDate: "2024-06-15", date: "2024-03-24", clientName: "ياسين سيف", clientEmail: "yacine@example.com" },
];

const PortalInvoices = () => {
  const [selectedInvoice, setSelectedInvoice] = useState<PortalInvoice | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const columns = [
    { header: "رقم الفاتورة", accessorKey: "id" as const },
    { header: "المشروع", accessorKey: "project" as const },
    { header: "المبلغ", accessorKey: "amount" as const },
    {
      header: "الحالة",
      accessorKey: "status" as const,
      cell: (item: PortalInvoice) => (
        <Badge
          variant={
            item.status === "paid" ? "default" :
            item.status === "unpaid" ? "secondary" : 
            item.status === "canceled" ? "outline" : "destructive"
          }
        >
          {item.status === "paid" ? "مدفوعة" :
           item.status === "unpaid" ? "قيد الانتظار" : 
           item.status === "canceled" ? "ملغاة" : "متأخرة"}
        </Badge>
      ),
    },
    { header: "تاريخ الاستحقاق", accessorKey: "dueDate" as const },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <h1 className="text-2xl font-bold">الفواتير والمدفوعات</h1>
      <SmartDataTable
        data={mockPortalInvoices}
        columns={columns}
        cardTitle={(i) => i.id}
        cardSubtitle={(i) => i.project}
        actions={(item) => (
          <>
            <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => {
              setSelectedInvoice(item);
              setIsPreviewOpen(true);
            }}>
              <Eye className="h-4 w-4" />
              معاينة وتحميل PDF
            </DropdownMenuItem>
            {item.status !== "paid" && (
              <DropdownMenuItem className="gap-2 cursor-pointer font-bold text-primary">
                <CreditCard className="h-4 w-4" />
                سداد الآن
              </DropdownMenuItem>
            )}
            <DropdownMenuItem className="gap-2 cursor-pointer">
              <Info className="h-4 w-4" />
              تفاصيل الفاتورة
            </DropdownMenuItem>
          </>
        )}
      />
      <InvoicePreviewDialog 
        isOpen={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
        invoice={selectedInvoice ? {
          id: selectedInvoice.id,
          clientName: selectedInvoice.clientName,
          clientEmail: selectedInvoice.clientEmail,
          amount: parseFloat(selectedInvoice.amount),
          currency: "SAR",
          status: selectedInvoice.status,
          date: selectedInvoice.date,
          dueDate: selectedInvoice.dueDate,
          items: [
            { description: selectedInvoice.project, quantity: 1, price: parseFloat(selectedInvoice.amount) }
          ]
        } : null}
      />
    </motion.div>
  );
};

export default PortalInvoices;
