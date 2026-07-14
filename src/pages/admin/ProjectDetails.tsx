import { useParams, Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight, Edit, Trash, ExternalLink, Calendar,
  Briefcase, Eye, CheckCircle2, EyeOff, Layers, Loader2, Image as ImageIcon
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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { projectsService } from "@/services/projectsService";

const ProjectDetailsAdmin = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  const { data: project, isLoading } = useQuery({
    queryKey: ["project", id],
    queryFn: () => projectsService.getProjectById(id!),
    enabled: !!id,
  });

  const deleteMutation = useMutation({
    mutationFn: () => projectsService.deleteProject(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("تم حذف المشروع بنجاح");
      navigate("/admin/projects");
    },
    onError: () => toast.error("حدث خطأ أثناء الحذف"),
  });

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary/50" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-20 space-y-4">
        <p className="text-muted-foreground">لم يتم العثور على المشروع</p>
        <Button variant="outline" asChild><Link to="/admin/projects">العودة للمشاريع</Link></Button>
      </div>
    );
  }

  const categoryName = project.category?.title_ar || project.category?.name || "بدون فئة";
  const media = project.project_media ?? [];
  const services = project.services ?? [];
  const createdAt = new Date(project.created_at).toLocaleDateString("ar-SA-u-ca-gregory-nu-latn");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-5xl mx-auto"
      dir="rtl"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild className="rounded-full">
            <Link to="/admin/projects"><ArrowRight className="h-4 w-4" /></Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{project.title}</h1>
              <Badge variant={project.is_published ? "default" : "secondary"} className="gap-1">
                {project.is_published ? <CheckCircle2 className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                {project.is_published ? "منشور" : "مسودة"}
              </Badge>
            </div>
            <p className="text-muted-foreground flex items-center gap-2 mt-1">
              <Briefcase className="h-3.5 w-3.5" />
              {categoryName}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {project.is_published && (
            <Button variant="outline" asChild className="gap-2">
              <a href={`/portfolio/${project.slug}`} target="_blank" rel="noreferrer"><ExternalLink className="h-4 w-4" /> عرض على الموقع</a>
            </Button>
          )}
          <Button variant="outline" asChild className="gap-2">
            <Link to={`/admin/projects/${id}/edit`}><Edit className="h-4 w-4" /> تعديل</Link>
          </Button>
          <Button variant="destructive" onClick={() => setIsAlertOpen(true)} className="gap-2 border-none">
            <Trash className="h-4 w-4" /> حذف
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {project.cover_image && (
            <Card className="border-border/40 bg-card/50 overflow-hidden">
              <img src={project.cover_image} alt={project.title} className="w-full max-h-80 object-cover" />
            </Card>
          )}

          <Card className="border-border/40 bg-card/50">
            <CardHeader>
              <CardTitle className="text-xl">وصف المشروع</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="leading-relaxed text-muted-foreground whitespace-pre-wrap">
                {project.description || "لا يوجد وصف بعد."}
              </p>
            </CardContent>
          </Card>

          {media.length > 0 && (
            <Card className="border-border/40 bg-card/50">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2"><ImageIcon className="h-5 w-5 text-primary" /> معرض الوسائط ({media.length})</CardTitle>
                <CardDescription>الصور والفيديوهات المرتبطة بالمشروع</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {media.map((m) => (
                    <div key={m.id} className="aspect-video overflow-hidden rounded-lg border border-border/40 bg-secondary/20">
                      {m.type === "video" ? (
                        <video src={m.media_url} className="h-full w-full object-cover" controls />
                      ) : (
                        <img src={m.media_url} alt="" className="h-full w-full object-cover" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6 text-right">
          <Card className="border-border/40 bg-card/50">
            <CardHeader>
              <CardTitle className="text-lg">معلومات المشروع</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                  <Briefcase className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">الفئة</p>
                  <p className="font-bold">{categoryName}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Eye className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">عدد المشاهدات</p>
                  <p className="font-bold font-sans">{project.views ?? 0}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">تاريخ الإنشاء</p>
                  <p className="font-bold">{createdAt}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {services.length > 0 && (
            <Card className="border-border/40 bg-card/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2"><Layers className="h-5 w-5 text-primary" /> الخدمات المرتبطة</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {services.map((s) => (
                  <Badge key={s.id} variant="secondary" className="px-3 py-1">{s.title_ar}</Badge>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent className="text-right" dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد تماماً؟</AlertDialogTitle>
            <AlertDialogDescription>
              هذا الإجراء لا يمكن التراجع عنه. سيتم حذف المشروع وكافة البيانات المتعلقة به نهائياً من قاعدة البيانات.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:justify-start">
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteMutation.mutate()} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              تأكيد الحذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
};

export default ProjectDetailsAdmin;
