import { motion } from "framer-motion";
import { SmartDataTable } from "@/components/admin/SmartDataTable";
import { Badge } from "@/components/ui/badge";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Edit, Trash, Plus } from "lucide-react";

interface Service {
  id: string;
  name: string;
  price: string;
  status: "active" | "inactive";
}

const mockServices: Service[] = [
  { id: "1", name: "تصميم وتطوير المواقع", price: "تبدأ من 500$", status: "active" },
  { id: "2", name: "تطوير تطبيقات الجوال", price: "تبدأ من 1200$", status: "active" },
  { id: "3", name: "تحليل البيانات والذكاء الاصطناعي", price: "حسب الطلب", status: "inactive" },
  { id: "4", name: "الهوية البصرية والتصميم", price: "تبدأ من 300$", status: "active" },
];

const ServicesAdmin = () => {
  const columns = [
    { header: "الخدمة", accessorKey: "name" as const },
    { header: "السعر", accessorKey: "price" as const },
    {
      header: "الحالة",
      accessorKey: "status" as const,
      cell: (item: Service) => (
        <Badge variant={item.status === "active" ? "default" : "secondary"}>
          {item.status === "active" ? "نشط" : "غير نشط"}
        </Badge>
      ),
    },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <h1 className="text-2xl font-bold">إدارة الخدمات</h1>
      <SmartDataTable
        data={mockServices}
        columns={columns}
        cardTitle={(s) => s.name}
        actions={(item) => (
          <>
            <DropdownMenuItem className="gap-2 cursor-pointer">
              <Edit className="h-4 w-4" />
              تعديل
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

export default ServicesAdmin;
