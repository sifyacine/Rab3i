import { motion } from "framer-motion";
import { SmartDataTable } from "@/components/admin/SmartDataTable";
import { Badge } from "@/components/ui/badge";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { MessageSquare, Eye, Clock, CheckCircle } from "lucide-react";

interface ClientRequest {
  id: string;
  type: string;
  subject: string;
  status: "pending" | "in-review" | "approved" | "closed";
  date: string;
}

const mockRequests: ClientRequest[] = [
  { id: "1", type: "مشروع جديد", subject: "طلب إنشاء منصة تعليمية", status: "approved", date: "2024-03-20" },
  { id: "2", type: "تطوير تطبيق", subject: "إضافة ميزات جديدة لتطبيق ربيعي", status: "in-review", date: "2024-03-24" },
];

const PortalRequests = () => {
  const columns = [
    { header: "الموضوع", accessorKey: "subject" as const },
    { header: "النوع", accessorKey: "type" as const },
    {
      header: "الحالة",
      accessorKey: "status" as const,
      cell: (item: ClientRequest) => (
        <Badge
          variant={
            item.status === "approved" ? "default" :
            item.status === "pending" ? "secondary" : "outline"
          }
        >
          {item.status === "approved" ? "تمت الموافقة" :
           item.status === "in-review" ? "قيد المراجعة" :
           item.status === "pending" ? "قيد الانتظار" : "مغلق"}
        </Badge>
      ),
    },
    { header: "التاريخ", accessorKey: "date" as const },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">طلباتي واستفساراتي</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-primary/5 p-6 rounded-2xl border border-primary/10">
        <div className="space-y-2">
          <h3 className="font-bold flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            تتبع طلباتك
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            هنا يمكنك تتبع جميع الطلبات التي أرسلتها إلينا. سنقوم بتحديث الحالة فور مراجعتها من قبل فريقنا.
          </p>
        </div>
        <div className="flex flex-col justify-center">
            <div className="flex items-center gap-4 text-sm font-medium">
                <span className="flex items-center gap-1"><div className="h-2 w-2 rounded-full bg-primary" /> تمت الموافقة: 1</span>
                <span className="flex items-center gap-1"><div className="h-2 w-2 rounded-full bg-secondary" /> قيد المراجعة: 1</span>
            </div>
        </div>
      </div>

      <SmartDataTable
        data={mockRequests}
        columns={columns}
        cardTitle={(r) => r.subject}
        cardSubtitle={(r) => r.type}
        actions={(item) => (
          <>
            {item.status === "approved" && (
              <DropdownMenuItem 
                className="gap-2 cursor-pointer text-emerald-500 focus:text-emerald-500 text-right" 
                dir="rtl"
                onClick={() => toast.success("تم قبول العرض! سنقوم بإنشاء المشروع فوراً.")}
              >
                <CheckCircle className="h-4 w-4" />
                قبول العرض والبدء
              </DropdownMenuItem>
            )}
            <DropdownMenuItem className="gap-2 cursor-pointer text-right" dir="rtl">
              <Eye className="h-4 w-4" />
              عرض الرد
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 cursor-pointer text-right" dir="rtl">
              <MessageSquare className="h-4 w-4" />
              إرسال تعقيب
            </DropdownMenuItem>
          </>
        )}
      />
    </motion.div>
  );
};

export default PortalRequests;
