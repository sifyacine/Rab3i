import { useParams, Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";
import { 
  ArrowRight, Edit, Trash, CheckCircle2, 
  Tag, Info, DollarSign, Layers, XCircle
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

const ServiceDetailsAdmin = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  // Mock service data
  const service = {
    id: "1", 
    name: "تصميم وتطوير المواقع", 
    category: "تطوير ويب",
    price: "تبدأ من 500$", 
    status: "active",
    description: "تصميم وتطوير مواقع احترافية سريعة ومتجاوبة مع كافة الشاشات. نركز على تجربة المستخدم والأداء العالي لضمان نجاح أعمالك على الإنترنت.",
    features: ["تصميم عصري وجذاب", "لوحة تحكم سهلة الإدارة", "تحسين محركات البحث الأساسي", "استضافة مجانية لأول شهر", "دعم فني مستمر لمدة 3 أشهر"],
  };

  const confirmDelete = () => {
    toast.success("تم حذف الخدمة بنجاح");
    navigate("/admin/services");
  };

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
            <Link to="/admin/services"><ArrowRight className="h-4 w-4" /></Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{service.name}</h1>
              <Badge variant={service.status === 'active' ? 'default' : 'secondary'}>
                {service.status === "active" ? "نشط" : "غير نشط"}
              </Badge>
            </div>
            <p className="text-muted-foreground flex items-center gap-2 mt-1">
              <Tag className="h-3.5 w-3.5" />
              {service.category}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" asChild className="gap-2">
            <Link to={`/admin/services/${id}/edit`}><Edit className="h-4 w-4" /> تعديل</Link>
          </Button>
          <Button variant="destructive" onClick={() => setIsAlertOpen(true)} className="gap-2">
            <Trash className="h-4 w-4" /> حذف
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border/40 bg-card/50">
            <CardHeader>
              <CardTitle className="text-xl">وصف الخدمة</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="leading-relaxed text-muted-foreground">{service.description}</p>
            </CardContent>
          </Card>

          <Card className="border-border/40 bg-card/50">
            <CardHeader>
              <CardTitle className="text-xl">المميزات والخصائص</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {service.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/20 border border-border/40">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6 text-right">
          <Card className="border-border/40 bg-card/50">
            <CardHeader>
              <CardTitle className="text-lg">معلومات التسعير والحالة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                    <DollarSign className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">التسعير</p>
                    <p className="font-bold text-lg">{service.price}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${service.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-secondary text-muted-foreground'}`}>
                    {service.status === 'active' ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">حالة الظهور</p>
                    <p className="font-bold">{service.status === "active" ? "منشورة على الموقع" : "مخفية"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                    <Layers className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">الفئة الرئيسية</p>
                    <p className="font-bold">{service.category}</p>
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
            <AlertDialogTitle>حذف الخدمة؟</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف هذه الخدمة؟ لا يمكن جلب البيانات المحذوفة مرة أخرى.
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

export default ServiceDetailsAdmin;
