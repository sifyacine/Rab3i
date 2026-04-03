import { useParams, Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";
import { 
  ArrowRight, Edit, Trash, ExternalLink, Calendar, 
  Briefcase, User, Info, CheckCircle2, Clock, Archive,
  MessageSquare, FileText, Play, DollarSign
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
export type ProjectStatus = "analysis" | "in_discussion" | "offered" | "ongoing" | "completed" | "archived";

export const statusMap: Record<ProjectStatus, { label: string; variant: string }> = {
  analysis: { label: "تحليل", variant: "secondary" },
  in_discussion: { label: "قيد المناقشة", variant: "outline" },
  offered: { label: "تم تقديم العرض", variant: "secondary" },
  ongoing: { label: "جاري التنفيذ", variant: "default" },
  completed: { label: "مكتمل", variant: "default" }, // Using valid badge variants
  archived: { label: "مؤرشف", variant: "destructive" },
};
const ProjectDetailsAdmin = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  // Mock project data with milestones
  const [project, setProject] = useState({
    id: "1", 
    title: "موقع شركة النبراس", 
    category: "تطوير ويب", 
    client: "النبراس العقارية", 
    status: "ongoing" as ProjectStatus, 
    description: "تطوير موقع تعريفي متكامل لشركة النبراس العقارية مع لوحة تحكم متقدمة لإدارة العقارات والمشاريع الخاصة بالشركة. المشروع تم تنفيذه باستخدام أحدث التقنيات لضمان السرعة والأمان.",
    startDate: "2024-03-15",
    endDate: "2024-04-20",
    budget: "5000$",
    link: "https://al-nebras.com",
    features: ["نظام إدارة محتوى", "لوحة تحكم عقارية", "تصميم متجاوب", "تحسين محركات البحث"],
    milestones: [
      { id: "m1", title: "تحليل المتطلبات والتدشين", description: "جمع كافة المتطلبات التقنية والهوية البصرية", weight: 10, status: "completed", client_approval: "approved" },
      { id: "m2", title: "تصميم واجهة المستخدم (UI/UX)", description: "تصميم كافة صفحات الموقع بنسخته الجوال والمكتبي", weight: 20, status: "completed", client_approval: "approved" },
      { id: "m3", title: "تطوير الواجهة الأمامية", description: "برمجة كافة الصفحات التفاعلية", weight: 30, status: "in_progress", client_approval: "pending" },
      { id: "m4", title: "تطوير لوحة التحكم والربط", description: "برمجة النظام الخلفي ولوحة التحكم", weight: 30, status: "pending", client_approval: "pending" },
      { id: "m5", title: "الاختبار النهائي والتسليم", description: "التأكد من خلو الموقع من الأخطاء ورفعه", weight: 10, status: "pending", client_approval: "pending" },
    ]
  });

  const confirmDelete = () => {
    toast.success("تم حذف المشروع بنجاح");
    navigate("/admin/projects");
  };

  const calculateProgress = () => {
    return project.milestones.reduce((acc, m) => m.status === "completed" ? acc + m.weight : acc, 0);
  };

  const getStatusIcon = (status: ProjectStatus) => {
    switch (status) {
      case "analysis": return <FileText className="h-5 w-5" />;
      case "in_discussion": return <MessageSquare className="h-5 w-5" />;
      case "offered": return <CheckCircle2 className="h-5 w-5" />;
      case "ongoing": return <Play className="h-5 w-5" />;
      case "completed": return <CheckCircle2 className="h-5 w-5" />;
      case "archived": return <Archive className="h-5 w-5" />;
      default: return <Clock className="h-5 w-5" />;
    }
  };

  const progress = calculateProgress();

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
              <Badge variant={statusMap[project.status].variant as any}>
                {statusMap[project.status].label}
              </Badge>
            </div>
            <p className="text-muted-foreground flex items-center gap-2 mt-1">
              <Briefcase className="h-3.5 w-3.5" />
              {project.category}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" asChild className="gap-2">
            <Link to={`/admin/projects/${id}/edit`}><Edit className="h-4 w-4" /> تعديل</Link>
          </Button>
          <Button variant="destructive" onClick={() => setIsAlertOpen(true)} className="gap-2 border-none">
            <Trash className="h-4 w-4" /> حذف
          </Button>
        </div>
      </div>

      {/* Dynamic Progress Bar */}
      <Card className="border-border/40 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold">نسبة الإنجاز الإجمالية</span>
            <span className="text-sm font-bold text-primary">{progress}%</span>
          </div>
          <div className="w-full bg-secondary/30 rounded-full h-3">
            <div 
              className="bg-primary h-3 rounded-full transition-all duration-1000 ease-out" 
              style={{ width: `${progress}%` }} 
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border/40 bg-card/50">
            <CardHeader>
              <CardTitle className="text-xl">مراحل المشروع (Milestones)</CardTitle>
              <CardDescription>إدارة مراحل المشروع وتتبع الإنجاز</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {project.milestones.map((m) => (
                  <div key={m.id} className="flex items-start gap-4 p-4 rounded-xl border border-border/40 bg-background/50 hover:bg-background transition-colors">
                    <div className={`mt-1 h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      m.status === "completed" ? "bg-primary border-primary text-white" :
                      m.status === "in_progress" ? "border-primary text-primary" :
                      "border-muted-foreground/30 text-muted-foreground"
                    }`}>
                      {m.status === "completed" && <CheckCircle2 className="h-3 w-3" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">{m.title}</h4>
                        <span className="text-xs font-bold text-muted-foreground">{m.weight}%</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{m.description}</p>
                      
                      <div className="flex items-center gap-3 mt-3">
                        <Badge variant={m.status === "completed" ? "default" : m.status === "in_progress" ? "outline" : "secondary"}>
                          {m.status === "completed" ? "مكتمل" : m.status === "in_progress" ? "جاري العمل" : "مجدول"}
                        </Badge>
                        {m.client_approval === "approved" && (
                          <Badge variant="outline" className="text-emerald-500 border-emerald-500/30 gap-1 bg-emerald-500/5">
                            <CheckCircle2 className="h-3 w-3" /> معتمد من العميل
                          </Badge>
                        )}
                        {m.client_approval === "pending" && m.status === "completed" && (
                          <Badge variant="outline" className="text-amber-500 border-amber-500/30 gap-1 bg-amber-500/5">
                            <Clock className="h-3 w-3" /> بانتظار اعتماد العميل
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/40 bg-card/50">
            <CardHeader>
              <CardTitle className="text-xl">وصف المشروع</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="leading-relaxed text-muted-foreground">{project.description}</p>
              
              <div className="pt-4 border-t border-border/40">
                <h4 className="font-semibold mb-3">مميزات المشروع:</h4>
                <div className="flex flex-wrap gap-2 text-right">
                  {project.features.map((feature, index) => (
                    <Badge key={index} variant="secondary" className="px-3 py-1">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6 text-right">
          <Card className="border-border/40 bg-card/50">
            <CardHeader>
              <CardTitle className="text-lg">تفاصيل الحالة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-primary/10 text-primary`}>
                    {getStatusIcon(project.status)}
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">المرحلة الحالية</p>
                    <p className="font-bold">{statusMap[project.status].label}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">العميل</p>
                    <p className="font-bold">{project.client}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                    <DollarSign className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">الميزانية / المبلغ</p>
                    <p className="font-bold text-emerald-500 font-sans">{project.budget}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">تاريخ البدء</p>
                    <p className="font-bold">{project.startDate}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                    <ExternalLink className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">رابط المشروع</p>
                    <a href={project.link} target="_blank" className="font-bold text-primary hover:underline">{project.link}</a>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
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
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              تأكيد الحذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
};

export default ProjectDetailsAdmin;
