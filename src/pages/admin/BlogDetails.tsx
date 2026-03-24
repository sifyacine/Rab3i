import { useParams, Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";
import { 
  ArrowRight, Edit, Trash, Calendar, 
  User, Eye, MessageSquare, Share2, Tag, 
  Clock, CheckCircle2, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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

const BlogDetailsAdmin = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  // Mock blog post data
  const post = {
    id: "1", 
    title: "مستقبل الذكاء الاصطناعي في التصميم", 
    author: "ياسين سيف", 
    status: "published", 
    category: "ذكاء اصطناعي",
    summary: "كيف يغير الذكاء الاصطناعي طريقة عمل المصممين في العصر الحديث من خلال الأدوات التوليدية والأتمتة الذكية.",
    content: `الذكاء الاصطناعي لم يعد مجرد مفهوم في أفلام الخيال العلمي، بل أصبح أداة فعالة في يد المصممين المعاصرين. من تحسين الصور تلقائياً إلى إنشاء تصاميم كاملة من الأوامر النصية.

في هذا المقال، نستكشف التوجهات الجديدة وتأثيرها على سوق العمل...`,
    views: 1240,
    comments: 15,
    date: "2024-02-10",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995"
  };

  const confirmDelete = () => {
    toast.success("تم حذف المقال بنجاح");
    navigate("/admin/blog");
  };

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
            <Link to="/admin/blog"><ArrowRight className="h-4 w-4" /></Link>
          </Button>
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-bold">{post.title}</h1>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><User className="h-3 w-3" /> {post.author}</span>
              <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {post.date}</span>
              <Badge variant="outline" className="text-[10px]">{post.category}</Badge>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" title="معاينة المقال"><Eye className="h-4 w-4" /></Button>
          <Button variant="outline" asChild className="gap-2">
            <Link to={`/admin/blog/${id}/edit`}><Edit className="h-4 w-4" /> تعديل</Link>
          </Button>
          <Button variant="destructive" onClick={() => setIsAlertOpen(true)} className="gap-2 shadow-sm border-none">
            <Trash className="h-4 w-4" /> حذف
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="overflow-hidden border-border/40 bg-card/30">
            <div className="aspect-video w-full relative">
              <img src={post.image} className="w-full h-full object-cover" alt="Blog cover" />
              <div className="absolute top-4 right-4 group">
                <Badge className="bg-primary/90 hover:bg-primary shadow-lg backdrop-blur-sm">
                  {post.status === 'published' ? 'منشور' : 'مسودة'}
                </Badge>
              </div>
            </div>
            <CardContent className="p-8 space-y-6">
              <div className="space-y-4">
                <p className="text-xl font-medium leading-relaxed italic text-primary/80">
                  {post.summary}
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
                <span className="text-xs text-muted-foreground flex items-center gap-1"><Eye className="h-3 w-3" /> مشاهدة</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold">{post.comments}</span>
                <span className="text-xs text-muted-foreground flex items-center gap-1"><MessageSquare className="h-3 w-3" /> تعليق</span>
              </div>
            </div>
            <Button variant="ghost" className="gap-2">عرض التعليقات <ChevronRight className="h-4 w-4" /></Button>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="border-border/40 bg-card/30">
            <CardHeader>
              <CardTitle className="text-lg">إعدادات النشر</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm py-2 border-b border-border/20">
                <span className="text-muted-foreground flex items-center gap-2"><Clock className="h-4 w-4" /> وقت القراءة</span>
                <span className="font-medium font-sans">5 min</span>
              </div>
              <div className="flex items-center justify-between text-sm py-2 border-b border-border/20">
                <span className="text-muted-foreground flex items-center gap-2"><Tag className="h-4 w-4" /> الكلمات المفتاحية</span>
                <span className="font-medium">تصميم، AI</span>
              </div>
              <div className="flex items-center justify-between text-sm py-2 border-b border-border/20">
                <span className="text-muted-foreground flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> الظهور</span>
                <span className="font-medium">الجميع</span>
              </div>
              <Button className="w-full mt-4 gap-2" variant="secondary"><Share2 className="h-4 w-4" /> مشاركة الرابط</Button>
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
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              تأكيد الحذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
};

export default BlogDetailsAdmin;
