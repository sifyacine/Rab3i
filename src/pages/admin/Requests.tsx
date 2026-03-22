import { motion } from "framer-motion";
import { SmartDataTable } from "@/components/admin/SmartDataTable";
import { Badge } from "@/components/ui/badge";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { CheckCircle, Clock, Trash } from "lucide-react";

interface Request {
  id: string;
  sender: string;
  type: string;
  status: "new" | "replied" | "closed";
  date: string;
}

const mockRequests: Request[] = [
  { id: "1", sender: "شركة المعالي", type: "مشروع جديد", status: "new", date: "2024-03-21" },
  { id: "2", sender: "محمد الحسن", type: "استفسار", status: "replied", date: "2024-03-20" },
  { id: "3", sender: "آمال عبدالله", type: "تطوير تطبيق", status: "new", date: "2024-03-19" },
];

const Requests = () => {
  const columns = [
    { header: "المرسل", accessorKey: "sender" as const },
    { header: "نوع الطلب", accessorKey: "type" as const },
    {
      header: "الحالة",
      accessorKey: "status" as const,
      cell: (item: Request) => (
        <Badge
          variant={
            item.status === "new" ? "default" :
            item.status === "replied" ? "secondary" : "destructive"
          }
        >
          {item.status === "new" ? "جديد" :
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
        data={mockRequests}
        columns={columns}
        cardTitle={(r) => r.sender}
        cardSubtitle={(r) => r.type}
        actions={(item) => (
          <>
            <DropdownMenuItem className="gap-2 cursor-pointer">
              <CheckCircle className="h-4 w-4" />
              تحديد كـ "تم الرد"
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 cursor-pointer">
              <Clock className="h-4 w-4" />
              أرشفة
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 cursor-pointer text-destructive focus:text-destructive">
              <Trash className="h-4 w-4" />
              حذف
            </DropdownMenuItem>
          </>
        )}
      />
    </motion.div>
  );
};

export default Requests;
