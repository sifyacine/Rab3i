import { useParams, Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight, Edit, Trash, CheckCircle2,
  DollarSign, XCircle, Loader2, Hash
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
import { servicesService } from "@/services/servicesService";

const ServiceDetailsAdmin = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  const { data: service, isLoading } = useQuery({
    queryKey: ["service", id],
    queryFn: () => servicesService.getServiceById(id!),
    enabled: !!id,
  });

  const deleteMutation = useMutation({
    mutationFn: () => servicesService.deleteService(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-services"] });
      toast.success("تم حذف الخدمة بنجاح");
      navigate("/admin/services");
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

  if (!service) {
    return (
      <div className="text-center py-20 space-y-4">
        <p className="text-muted-foreground">لم يتم العثور على الخدمة</p>
        <Button variant="outline" asChild><Link to="/admin/services">العودة للخدمات</Link></Button>
      </div>
    );
  }

  const pricing = [service.price_from, service.price_note_ar].filter(Boolean).join(" ") || "—";

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
              <h1 className="text-3xl font-bold">{service.title_ar}</h1>
              <Badge variant={service.is_active ? "default" : "secondary"}>
                {service.is_active ? "نشط" : "غير نشط"}
              </Badge>
            </div>
            {service.title_en && (
              <p className="text-muted-foreground flex items-center gap-2 mt-1">{service.title_en}</p>
            )}
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
          {service.image_url && (
            <Card className="border-border/40 bg-card/50 overflow-hidden">
              <img src={service.image_url} alt={service.title_ar} className="w-full max-h-72 object-cover" />
            </Card>
          )}
          <Card className="border-border/40 bg-card/50">
            <CardHeader>
              <CardTitle className="text-xl">وصف الخدمة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="leading-relaxed text-muted-foreground whitespace-pre-wrap">
                {service.description_ar || "لا يوجد وصف بعد."}
              </p>
              {service.description_en && (
                <p className="leading-relaxed text-muted-foreground/80 text-sm" dir="ltr">
                  {service.description_en}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6 text-right">
          <Card className="border-border/40 bg-card/50">
            <CardHeader>
              <CardTitle className="text-lg">معلومات التسعير والحالة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                  <DollarSign className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">التسعير</p>
                  <p className="font-bold text-lg">{pricing}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${service.is_active ? "bg-emerald-500/10 text-emerald-500" : "bg-secondary text-muted-foreground"}`}>
                  {service.is_active ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">حالة الظهور</p>
                  <p className="font-bold">{service.is_active ? "منشورة على الموقع" : "مخفية"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                  <Hash className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">المُعرّف (slug)</p>
                  <p className="font-bold font-sans text-sm" dir="ltr">{service.slug}</p>
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
            <AlertDialogAction onClick={() => deleteMutation.mutate()} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              تأكيد الحذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
};

export default ServiceDetailsAdmin;
