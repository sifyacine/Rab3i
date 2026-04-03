import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { SmartDataTable } from "@/components/admin/SmartDataTable";
import { Badge } from "@/components/ui/badge";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Edit, Eye, Trash, MessageSquare, Loader2, RefreshCw } from "lucide-react";
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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { blogService, BlogPost } from "@/services/blogService";
import { useAuth } from "@/contexts/AuthContext";
import { useRefresh } from "@/contexts/RefreshContext";
import { cn } from "@/lib/utils";

const Blog = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { role } = useAuth();
  const { refreshData, isRefreshing } = useRefresh();
  const [postToDelete, setPostToDelete] = useState<string | null>(null);

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["admin-blog"],
    queryFn: () => blogService.getBlogPosts(),
    enabled: role === "admin",
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => blogService.deleteBlogPost(id),
    onSuccess: () => {
      toast.success("تم حذف المقال بنجاح");
      queryClient.invalidateQueries({ queryKey: ["admin-blog"] });
      setPostToDelete(null);
    },
    onError: () => toast.error("حدث خطأ أثناء الحذف"),
  });

  const handleRefresh = async () => {
    await refreshData(["admin-blog"]);
  };

  const columns = [
    { header: "العنوان", accessorKey: "title" as const },
    { header: "الفئة", accessorKey: "category" as const },
    { header: "الكاتب", accessorKey: "author" as const },
    {
      header: "الحالة",
      accessorKey: "status" as const,
      cell: (item: BlogPost) => (
        <Badge
          className={cn(
            "font-medium",
            item.status === "published"
              ? "bg-emerald-500/15 text-emerald-600 border-emerald-500/30"
              : item.status === "draft"
              ? "bg-blue-500/15 text-blue-600 border-blue-500/30"
              : "bg-amber-500/15 text-amber-600 border-amber-500/30"
          )}
          variant="outline"
        >
          {item.status === "published"
            ? "منشور"
            : item.status === "draft"
            ? "مسودة"
            : "مجدول"}
        </Badge>
      ),
    },
    {
      header: "المشاهدات",
      accessorKey: "views" as const,
      cell: (item: BlogPost) => <span className="font-medium">{item.views.toLocaleString("ar-SA")}</span>,
    },
  ];

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">إدارة المدونة</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {posts.length} مقال {posts.length > 0 ? `(${posts.filter(p => p.status === "published").length} منشور)` : ""}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="gap-2"
        >
          <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
          تحديث
        </Button>
      </div>

      <SmartDataTable
        data={posts}
        columns={columns}
        cardTitle={(p: BlogPost) => p.title}
        cardSubtitle={(p: BlogPost) => `بواسطة ${p.author}`}
        onAdd={() => navigate("/admin/blog/new")}
        onRowClick={(p: BlogPost) => {
          navigate(`/admin/blog/${p.id}`);
          handleRefresh();
        }}
        actions={(item: BlogPost) => (
          <>
            <DropdownMenuItem
              className="gap-2 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/admin/blog/${item.id}`);
                handleRefresh();
              }}
            >
              <Eye className="h-4 w-4" />
              عرض التفاصيل
            </DropdownMenuItem>
            <DropdownMenuItem
              className="gap-2 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/admin/blog/${item.id}/edit`);
                handleRefresh();
              }}
            >
              <Edit className="h-4 w-4" />
              تعديل
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 cursor-pointer">
              <MessageSquare className="h-4 w-4" />
              التعليقات
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
            <AlertDialogAction
              onClick={() => postToDelete && deleteMutation.mutate(postToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              تأكيد الحذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
};

export default Blog;
