import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";
import { 
  ArrowRight, CheckCircle2, Clock, Calendar, 
  Briefcase, FileText, Play, CheckCircle, XCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";

const PortalProjectDetails = () => {
  const { id } = useParams();

  // Mock project data with milestones
  const [project, setProject] = useState({
    id: "1", 
    title: "موقع شركة النبراس", 
    category: "تطوير ويب", 
    status: "ongoing", 
    description: "تطوير موقع تعريفي متكامل لشركة النبراس العقارية مع لوحة تحكم متقدمة لإدارة العقارات والمشاريع الخاصة بالشركة.",
    startDate: "2024-03-15",
    milestones: [
      { id: "m1", title: "تحليل المتطلبات والتدشين", description: "جمع كافة المتطلبات التقنية والهوية البصرية", weight: 10, status: "completed", client_approval: "approved" },
      { id: "m2", title: "تصميم واجهة المستخدم (UI/UX)", description: "تصميم كافة صفحات الموقع بنسخته الجوال والمكتبي", weight: 20, status: "completed", client_approval: "approved" },
      { id: "m3", title: "تطوير الواجهة الأمامية", description: "برمجة كافة الصفحات التفاعلية", weight: 30, status: "in_progress", client_approval: "pending" },
      { id: "m4", title: "تطوير لوحة التحكم والربط", description: "برمجة النظام الخلفي ولوحة التحكم", weight: 30, status: "pending", client_approval: "pending" },
      { id: "m5", title: "الاختبار النهائي والتسليم", description: "التأكد من خلو الموقع من الأخطاء ورفعه", weight: 10, status: "pending", client_approval: "pending" },
    ]
  });

  const calculateProgress = () => {
    return project.milestones.reduce((acc, m) => m.status === "completed" ? acc + m.weight : acc, 0);
  };

  const handleApprove = (mId: string) => {
    toast.success("تم اعتماد المرحلة بنجاح. شكراً لك!");
    setProject(prev => ({
      ...prev,
      milestones: prev.milestones.map(m => m.id === mId ? { ...m, client_approval: "approved" } : m)
    }));
  };

  const handleReject = (mId: string) => {
    toast.error("تم إرسال ملاحظاتك للفريق. سنتواصل معك قريباً.");
  };

  const progress = calculateProgress();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="space-y-6"
      dir="rtl"
    >
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild className="rounded-full">
          <Link to="/portal/projects"><ArrowRight className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{project.title}</h1>
          <p className="text-muted-foreground text-sm">{project.category}</p>
        </div>
      </div>

      {/* Progress Card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold">نسبة إنجاز المشروع</span>
            <span className="text-sm font-bold text-primary">{progress}%</span>
          </div>
          <div className="w-full bg-secondary rounded-full h-3">
            <div 
              className="bg-primary h-3 rounded-full transition-all duration-1000" 
              style={{ width: `${progress}%` }} 
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>مراحل المشروع</CardTitle>
              <CardDescription>تابع تقدم العمل في كل مرحلة واعتمد النتائج</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {project.milestones.map((m) => (
                  <div key={m.id} className="p-4 rounded-xl border border-border/50 bg-card/50">
                    <div className="flex items-start gap-4">
                      <div className={`mt-1 h-6 w-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        m.status === "completed" ? "bg-primary border-primary text-white" : "border-muted-foreground/30"
                      }`}>
                        {m.status === "completed" && <CheckCircle2 className="h-4 w-4" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold">{m.title}</h4>
                          <Badge variant={m.status === "completed" ? "default" : "outline"}>
                            {m.status === "completed" ? "مكتمل" : m.status === "in_progress" ? "جاري" : "قادم"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{m.description}</p>
                        
                        {m.status === "completed" && m.client_approval === "pending" && (
                          <div className="mt-4 flex items-center gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                            <span className="text-sm font-medium ml-auto text-primary">هل تم إنجاز هذه المرحلة حسب الاتفاق؟</span>
                            <Button size="sm" onClick={() => handleApprove(m.id)} className="gap-1">
                              <CheckCircle className="h-3 w-3" /> اعتماد
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleReject(m.id)} className="gap-1 border-destructive text-destructive hover:bg-destructive/5">
                              <XCircle className="h-3 w-3" /> رفض
                            </Button>
                          </div>
                        )}

                        {m.client_approval === "approved" && (
                          <div className="mt-3 flex items-center gap-2 text-emerald-500 text-xs font-medium bg-emerald-500/5 p-2 rounded w-fit">
                            <CheckCircle2 className="h-3 w-3" /> تم الاعتماد بنجاح
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>معلومات المشروع</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">تاريخ البدء</p>
                  <p className="text-sm font-medium">{project.startDate}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Play className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">الحالة العامة</p>
                  <p className="text-sm font-medium">جاري التنفيذ</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-brand text-white border-none shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">هل تحتاج لمساعدة؟</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-white/80 mb-4">يمكنك التواصل مع مدير المشروع مباشرة لمناقشة أي تفاصيل.</p>
              <Button variant="secondary" className="w-full text-primary" asChild>
                <Link to="/portal/support">تواصل معنا</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
};

export default PortalProjectDetails;
