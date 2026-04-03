import { useParams, Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight, Edit, Trash, Calendar,
  User, Eye, MessageSquare, Share2, Tag,
  Clock, CheckCircle2, ChevronRight, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { blogService } from "@/services/blogService";
import { useRefresh } from "@/contexts/RefreshContext";

const BlogDetailsAdmin = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { refreshData } = useRefresh();
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  // Fetch blog post
  const { data: post, isLoading, error } = useQuery({
    queryKey: ["blog-details", id],
    queryFn: () => (id ? blogService.getBlogPostById(id) : null),
    enabled: !!id,
  });

  const deleteMutation = useMutation({
    mutationFn: () => (id ? blogService.deleteBlogPost(id) : Promise.reject()),
    onSuccess: () => {
      toast.success("تم حذف المقال بنجاح");
      queryClient.invalidateQueries({ queryKey: ["admin-blog"] });
      refreshData(["admin-blog"]);
      navigate("/admin/blog");
    },
    onError: (err: Error) => toast.error(err.message || "حدث خطأ أثناء الحذف"),
  });

  const handleShare = async () => {
    const url = `${window.location.origin}/blog/${post?.slug}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: post?.title,
          text: post?.excerpt,
          url: url,
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(url);
        toast.success("تم نسخ الرابط");
      }
    } catch (err) {
      console.error("Share failed:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground mb-4">لم يتم العثور على المقال</p>
        <Button asChild>
          <Link to="/admin/blog">العودة للقائمة</Link>
        </Button>
      </div>
    );
  }

  const readingTime = Math.ceil(post.content.split(/\s+/).length / 200);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-5xl mx-auto pb-20"
      dir="rtl"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild className="rounded-full">
            <Link to="/admin/blog">
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-bold">{post.title}</h1>
            <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" /> {post.author}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />{" "}
                {post.published_at
                  ? new Date(post.published_at).toLocaleDateString("ar-SA")
                  : "—"}
              </span>
              <Badge variant="outline" className="text-[10px]">
                {post.category}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" title="معاينة المقال" asChild>
            <Link to={`/blog/${post.slug}`} target="_blank">
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" asChild className="gap-2">
            <Link to={`/admin/blog/${id}/edit`}>
              <Edit className="h-4 w-4" /> تعديل
            </Link>
          </Button>
          <Button
            variant="destructive"
            onClick={() => setIsAlertOpen(true)}
            className="gap-2 shadow-sm border-none"
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash className="h-4 w-4" />
            )}
            حذف
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="overflow-hidden border-border/40 bg-card/30">
            {post.featured_image_url && (
              <div className="aspect-video w-full relative">
                <img
                  src={post.featured_image_url}
                  className="w-full h-full object-cover"
                  alt={post.title}
                />
                <div className="absolute top-4 right-4">
                  <Badge className="bg-primary/90 hover:bg-primary shadow-lg backdrop-blur-sm">
                    {post.status === "published"
                      ? "منشور"
                      : post.status === "draft"
                      ? "مسودة"
                      : "مجدول"}
                  </Badge>
                </div>
              </div>
            )}
            <CardContent className="p-8 space-y-6">
              <div className="space-y-4">
                <p className="text-xl font-medium leading-relaxed italic text-primary/80">
                  {post.excerpt}
                </p>
                <div className="prose prose-invert max-w-none">
                  <p className="whitespace-pre-wrap leading-loose text-muted-foreground text-lg">
                    {post.content}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between p-6 rounded-2xl border border-border/40 bg-secondary/10">
            <div className="flex items-center gap-6">
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold">{post.views}</span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Eye className="h-3 w-3" /> مشاهدة
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="border-border/40 bg-card/30">
            <CardHeader>
              <CardTitle className="text-lg">إعدادات النشر</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm py-2 border-b border-border/20">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Clock className="h-4 w-4" /> وقت القراءة
                </span>
                <span className="font-medium font-sans">{readingTime} دقيقة</span>
              </div>
              <div className="flex items-center justify-between text-sm py-2 border-b border-border/20">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Tag className="h-4 w-4" /> الحالة
                </span>
                <Badge
                  variant="outline"
                  className={
                    post.status === "published"
                      ? "bg-emerald-500/15 text-emerald-600"
                      : post.status === "draft"
                      ? "bg-blue-500/15 text-blue-600"
                      : "bg-amber-500/15 text-amber-600"
                  }
                >
                  {post.status === "published"
                    ? "منشور"
                    : post.status === "draft"
                    ? "مسودة"
                    : "مجدول"}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm py-2 border-b border-border/20">
                <span className="text-muted-foreground flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" /> الظهور
                </span>
                <span className="font-medium">الجميع</span>
              </div>
              <Button onClick={handleShare} className="w-full mt-4 gap-2" variant="secondary">
                <Share2 className="h-4 w-4" /> مشاركة الرابط
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent className="text-right" dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>حذف المقال؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم إزالة هذا المقال من جميع أجزاء الموقع الرئيسي ومن قاعدة البيانات نهائياً.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:justify-start">
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "جاري الحذف..." : "تأكيد الحذف"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
};

export default BlogDetailsAdmin;
