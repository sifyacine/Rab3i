import { motion } from "framer-motion";
import { SmartDataTable } from "@/components/admin/SmartDataTable";
import { Badge } from "@/components/ui/badge";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { ExternalLink, Edit, Trash } from "lucide-react";

interface Project {
  id: string;
  title: string;
  category: string;
  client: string;
  status: "completed" | "in-progress" | "archived";
  date: string;
}

const mockProjects: Project[] = [
  { id: "1", title: "موقع شركة النبراس", category: "تطوير ويب", client: "النبراس العقارية", status: "completed", date: "2024-03-15" },
  { id: "2", title: "تطبيق ربيعي للمسافرين", category: "تطبيق جوال", client: "شركة ربيعي", status: "in-progress", date: "2024-05-20" },
  { id: "3", title: "هوية بصرية لستوديو فنون", category: "تصميم جرافيك", client: "ستوديو فنون", status: "archived", date: "2023-11-10" },
  { id: "4", title: "منصة تعليمية إلكترونية", category: "تطوير ويب", client: "أكاديمية المستقبل", status: "completed", date: "2024-01-05" },
];

const Projects = () => {
  const columns = [
    { header: "المشروع", accessorKey: "title" as const },
    { header: "الفئة", accessorKey: "category" as const },
    { header: "العميل", accessorKey: "client" as const },
    {
      header: "الحالة",
      accessorKey: "status" as const,
      cell: (item: Project) => (
        <Badge
          variant={
            item.status === "completed" ? "default" :
            item.status === "in-progress" ? "secondary" : "destructive"
          }
          className="font-normal"
        >
          {item.status === "completed" ? "مكتمل" :
           item.status === "in-progress" ? "قيد التنفيذ" : "مؤرشف"}
        </Badge>
      ),
    },
    { header: "التاريخ", accessorKey: "date" as const },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">إدارة المشاريع</h1>
      </div>

      <SmartDataTable
        data={mockProjects}
        columns={columns}
        cardTitle={(p) => p.title}
        cardSubtitle={(p) => p.category}
        actions={(item) => (
          <>
            <DropdownMenuItem className="gap-2 cursor-pointer">
              <Edit className="h-4 w-4" />
              تعديل
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 cursor-pointer">
              <ExternalLink className="h-4 w-4" />
              عرض المشروع
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

export default Projects;
