import { motion } from "framer-motion";
import { SmartDataTable } from "@/components/admin/SmartDataTable";
import { Badge } from "@/components/ui/badge";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Edit, Eye, Trash, MessageSquare } from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  author: string;
  status: "published" | "draft" | "scheduled";
  views: number;
  comments: number;
  date: string;
}

const mockPosts: BlogPost[] = [
  { id: "1", title: "مستقبل الذكاء الاصطناعي في التصميم", author: "ياسين سيف", status: "published", views: 1240, comments: 15, date: "2024-02-10" },
  { id: "2", title: "أهمية تجربة المستخدم في مواقع التجارة", author: "سارة محمد", status: "draft", views: 0, comments: 0, date: "2024-03-20" },
  { id: "3", title: "دليل المبتدئين في تطوير تطبيقات الجوال", author: "أحمد علي", status: "published", views: 850, comments: 8, date: "2024-01-15" },
];

const Blog = () => {
  const columns = [
    { header: "العنوان", accessorKey: "title" as const },
    { header: "الكاتب", accessorKey: "author" as const },
    {
      header: "الحالة",
      accessorKey: "status" as const,
      cell: (item: BlogPost) => (
        <Badge
          variant={item.status === "published" ? "default" : "secondary"}
          className="font-normal"
        >
          {item.status === "published" ? "منشور" : "مسودة"}
        </Badge>
      ),
    },
    { header: "المشاهدات", accessorKey: "views" as const },
    { header: "التاريخ", accessorKey: "date" as const },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">إدارة المدونة</h1>
      </div>

      <SmartDataTable
        data={mockPosts}
        columns={columns}
        cardTitle={(p) => p.title}
        cardSubtitle={(p) => `بواسطة ${p.author}`}
        actions={(item) => (
          <>
            <DropdownMenuItem className="gap-2 cursor-pointer">
              <Eye className="h-4 w-4" />
              عرض المقال
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 cursor-pointer">
              <Edit className="h-4 w-4" />
              تعديل
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 cursor-pointer">
              <MessageSquare className="h-4 w-4" />
              التعليقات ({item.comments})
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

export default Blog;
