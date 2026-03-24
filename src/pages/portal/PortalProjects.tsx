import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { SmartDataTable } from "@/components/admin/SmartDataTable";
import { Badge } from "@/components/ui/badge";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { ExternalLink, Paperclip } from "lucide-react";

interface PortalProject {
  id: string;
  title: string;
  category: string;
  status: "completed" | "in-progress" | "on-hold";
  progress: number;
  startDate: string;
}

const mockPortalProjects: PortalProject[] = [
  { id: "1", title: "تطبيق ربيعي للمسافرين", category: "تطبيق جوال", status: "in-progress", progress: 65, startDate: "2024-05-20" },
  { id: "2", title: "موقع شركة النبراس", category: "تطوير ويب", status: "completed", progress: 100, startDate: "2024-03-15" },
];

const PortalProjects = () => {
  const columns = [
    { header: "المشروع", accessorKey: "title" as const },
    { header: "الفئة", accessorKey: "category" as const },
    {
      header: "الحالة",
      accessorKey: "status" as const,
      cell: (item: PortalProject) => (
        <Badge
          variant={
            item.status === "completed" ? "default" :
            item.status === "in-progress" ? "secondary" : "destructive"
          }
        >
          {item.status === "completed" ? "مكتمل" :
           item.status === "in-progress" ? "قيد التنفيذ" : "متوقف مؤقتاً"}
        </Badge>
      ),
    },
    {
      header: "التقدم",
      accessorKey: "progress" as const,
      cell: (item: PortalProject) => (
        <div className="flex items-center gap-3">
          <div className="h-1.5 w-16 bg-secondary rounded-full overflow-hidden">
            <div className="h-full bg-primary" style={{ width: `${item.progress}%` }} />
          </div>
          <span className="text-xs font-medium">{item.progress}%</span>
        </div>
      ),
    },
    { header: "تاريخ البدء", accessorKey: "startDate" as const },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <h1 className="text-2xl font-bold">مشاريعي</h1>
      <SmartDataTable
        data={mockPortalProjects}
        columns={columns}
        cardTitle={(p) => p.title}
        cardSubtitle={(p) => p.category}
        actions={(item) => (
          <>
            <DropdownMenuItem className="gap-2 cursor-pointer" asChild>
              <Link to={`/portal/projects/${item.id}`} className="flex items-center gap-2">
                <ExternalLink className="h-4 w-4" />
                عرض التفاصيل
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 cursor-pointer">
              <Paperclip className="h-4 w-4" />
              عرض الملفات
            </DropdownMenuItem>
          </>
        )}
      />
    </motion.div>
  );
};

export default PortalProjects;
