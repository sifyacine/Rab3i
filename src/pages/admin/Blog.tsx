import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { SmartDataTable } from "@/components/admin/SmartDataTable";
import { Badge } from "@/components/ui/badge";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Edit, Eye, Trash, MessageSquare } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

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
  const navigate = useNavigate();
  const [posts, setPosts] = useState<BlogPost[]>(mockPosts);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);

  const confirmDelete = () => {
    if (postToDelete) {
      setPosts(posts.filter(p => p.id !== postToDelete));
      toast.success("تم حذف المقال بنجاح");
      setPostToDelete(null);
    }
  };

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
          {item.status === "published" ? "منشور" : 
           item.status === "draft" ? "مسودة" : "مجدول"}
        </Badge>
      ),
    },
    { header: "المشاهدات", accessorKey: "views" as const },
    { header: "التاريخ", accessorKey: "date" as const },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">إدارة المدونة</h1>
      </div>

      <SmartDataTable
        data={posts}
        columns={columns}
        cardTitle={(p) => p.title}
        cardSubtitle={(p) => `بواسطة ${p.author}`}
        onAdd={() => navigate("/admin/blog/new")}
        onRowClick={(p) => navigate(`/admin/blog/${p.id}`)}
        actions={(item) => (
          <>
            <DropdownMenuItem className="gap-2 cursor-pointer" onClick={(e) => {
              e.stopPropagation();
              navigate(`/admin/blog/${item.id}`);
            }}>
              <Eye className="h-4 w-4" />
              عرض التفاصيل
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 cursor-pointer" onClick={(e) => {
              e.stopPropagation();
              navigate(`/admin/blog/${item.id}/edit`);
            }}>
              <Edit className="h-4 w-4" />
              تعديل
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 cursor-pointer">
              <MessageSquare className="h-4 w-4" />
              التعليقات ({item.comments})
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="gap-2 cursor-pointer text-destructive focus:text-destructive" 
              onClick={(e) => {
                e.stopPropagation();
                setPostToDelete(item.id);
              }}
            >
              <Trash className="h-4 w-4" />
              حذف
            </DropdownMenuItem>
          </>
        )}
      />

      <AlertDialog open={!!postToDelete} onOpenChange={(open) => !open && setPostToDelete(null)}>
        <AlertDialogContent className="text-right" dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>حذف المقال؟</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف هذا المقال؟ سيتم إزالته نهائياً من المدونة.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:justify-start">
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              تأكيد الحذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
};

export default Blog;
