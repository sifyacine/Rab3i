import { useState, useEffect } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Check, Info, Briefcase, ChevronRight, ChevronLeft, Image as ImageIcon,
  Zap, X, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { projectsService } from "@/services/projectsService";
import { categoryService } from "@/services/categoryService";
import { mediaService } from "@/services/mediaService";
import { servicesService } from "@/services/servicesService";
import { GuestRequest } from "@/services/requestsService";
import { requestsService } from "@/services/requestsService";

const steps = [
  { id: 1, title: "المعلومات الأساسية", icon: Briefcase },
  { id: 2, title: "التصنيف والخدمات", icon: Zap },
  { id: 3, title: "التفاصيل والنشر", icon: Info },
  { id: 4, title: "الصور والوسائط", icon: ImageIcon },
];

const ProjectFormAdmin = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const isEditing = !!id;
  
  // Source request when converting a guest request → project
  const sourceRequest = location.state?.request as GuestRequest | undefined;
  
  const [currentStep, setCurrentStep] = useState(1);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    title: sourceRequest ? `${sourceRequest.project_type} – ${sourceRequest.guest_name}` : "",
    slug: "",
    category_id: "",
    description: sourceRequest?.details ?? "",
    is_published: false,
    cover_image: "",
  });

  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoryService.getCategories()
  });

  const { data: allServices = [] } = useQuery({
    queryKey: ["services-all"],
    queryFn: () => servicesService.getServices(true)
  });

  const { data: projectToEdit } = useQuery({
    queryKey: ["project", id],
    queryFn: () => projectsService.getProjects().then(res => res.data.find(p => p.id === id)),
    enabled: isEditing
  });

  useEffect(() => {
    if (projectToEdit) {
      setFormData({
        title: projectToEdit.title,
        slug: projectToEdit.slug,
        category_id: projectToEdit.category_id || "",
        description: projectToEdit.description || "",
        is_published: projectToEdit.is_published,
        cover_image: projectToEdit.cover_image || "",
      });
      // Load services for this project
      servicesService.getProjectServices(projectToEdit.id)
        .then(svcs => setSelectedServiceIds(svcs.map(s => s.id)));
    }
  }, [projectToEdit]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      let cover_image = formData.cover_image;
      if (coverFile) {
        toast.loading("جاري رفع الصورة الشاملة...", { id: "upload" });
        cover_image = await mediaService.uploadMedia(coverFile, `cover`);
        toast.dismiss("upload");
      }

      const payload = {
        title: formData.title,
        slug: formData.slug || formData.title.toLowerCase().replace(/\s+/g, '-'),
        category_id: formData.category_id || undefined,
        description: formData.description,
        is_published: formData.is_published,
        cover_image
      };

      let project;
      if (isEditing) {
        project = await projectsService.updateProject(id!, payload);
        await servicesService.setProjectServices(id!, selectedServiceIds);
      } else {
        project = await projectsService.createProject(payload as any);
        if (project && selectedServiceIds.length) {
          await servicesService.setProjectServices(project.id, selectedServiceIds);
        }
        // If this project was created from a guest request, link them
        if (project && sourceRequest?.id) {
          await requestsService.updateRequest(sourceRequest.id, {
            status: "converted",
            project_id: project.id,
          });
        }
      }
      return project;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["admin-requests"] });
      toast.success(isEditing ? "تم تحديث المشروع بنجاح" : "تم إضافة المشروع بنجاح");
      if (sourceRequest) {
        toast.success(`تم تحويل طلب ${sourceRequest.guest_name} إلى مشروع ✓`);
      }
      navigate("/admin/projects");
    },
    onError: (err: Error) => {
      toast.dismiss("upload");
      toast.error(err.message || "حدث خطأ غير متوقع");
    }
  });

  const toggleService = (serviceId: string) => {
    setSelectedServiceIds(prev =>
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const nextStep = () => {
    if (currentStep === 1 && !formData.title) {
      toast.error("يرجى إدخال اسم المشروع");
      return;
    }
    if (currentStep < steps.length) setCurrentStep(s => s + 1);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="title">اسم المشروع *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={e => {
                  const slug = e.target.value.toLowerCase().replace(/[\u0600-\u06ff\s]+/g, '-').replace(/-+/g, '-').replace(/(^-|-$)/g, '');
                  setFormData({ ...formData, title: e.target.value, slug });
                }}
                placeholder="مثال: هوية بصرية لمطعم Sakura"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug (معرّف الرابط)</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={e => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                placeholder="sakura-restaurant-brand"
                dir="ltr"
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">يُستخدم في رابط المشروع: /portfolio/<span className="text-primary">{formData.slug || "slug"}</span></p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cover">الصورة الرئيسية (Cover)</Label>
              <Input
                id="cover"
                type="file"
                accept="image/*"
                onChange={e => { if (e.target.files?.[0]) setCoverFile(e.target.files[0]); }}
              />
              {(formData.cover_image || coverFile) && (
                <div className="mt-3 w-full h-48 border border-border/50 rounded-xl overflow-hidden">
                  <img
                    src={coverFile ? URL.createObjectURL(coverFile) : formData.cover_image}
                    alt="Cover preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="category">الفئة الرئيسية (Category)</Label>
              <Select
                value={formData.category_id}
                onValueChange={v => setFormData({ ...formData, category_id: v })}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="اختر فئة المشروع" />
                </SelectTrigger>
                <SelectContent>
                  {categoriesData?.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>
                      <span className="flex items-center gap-2">
                        <span>{cat.title_ar || cat.name}</span>
                        <span className="text-xs text-muted-foreground">/ {cat.title_en || cat.slug}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <div>
                <Label>الخدمات والأدوات المستخدمة</Label>
                <p className="text-xs text-muted-foreground mt-1">اختر كل الخدمات المستخدمة في هذا المشروع – ستظهر كعلامات فلترة</p>
              </div>
              
              {/* Selected services tags */}
              {selectedServiceIds.length > 0 && (
                <div className="flex flex-wrap gap-2 p-3 rounded-xl bg-primary/5 border border-primary/20">
                  {selectedServiceIds.map(sid => {
                    const svc = allServices.find(s => s.id === sid);
                    if (!svc) return null;
                    return (
                      <Badge key={sid} className="gap-1 bg-primary/15 text-primary border-primary/30 cursor-pointer hover:bg-destructive/15 hover:text-destructive hover:border-destructive/30 transition-colors"
                        onClick={() => toggleService(sid)}>
                        {svc.title_ar}
                        <X className="h-3 w-3" />
                      </Badge>
                    );
                  })}
                </div>
              )}

              {/* All services grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-72 overflow-y-auto rounded-xl border border-border/50 p-3">
                {allServices.map(svc => {
                  const isSelected = selectedServiceIds.includes(svc.id);
                  return (
                    <button
                      key={svc.id}
                      type="button"
                      onClick={() => toggleService(svc.id)}
                      className={`flex flex-col items-start gap-0.5 rounded-lg border p-3 text-right transition-all ${
                        isSelected
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:border-primary/40 hover:bg-secondary/50"
                      }`}
                    >
                      <span className="text-sm font-medium">{svc.title_ar}</span>
                      <span className="text-xs text-muted-foreground">{svc.title_en}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
            <div className="flex items-center justify-between p-4 border border-border/50 rounded-xl bg-secondary/20">
              <div>
                <Label htmlFor="published" className="text-base cursor-pointer">نشر المشروع للجمهور</Label>
                <p className="text-sm text-muted-foreground mt-0.5">إذا كان مغلقاً، يُحفظ كمسودة ولا يظهر للزوار</p>
              </div>
              <Switch
                id="published"
                checked={formData.is_published}
                onCheckedChange={c => setFormData({ ...formData, is_published: c })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">وصف المشروع</Label>
              <Textarea
                id="description"
                rows={7}
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder="اشرح هذا المشروع — ما هو التحدي؟ ما هو الحل؟ ما هي النتائج؟ مثل Behance."
              />
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
            <div className="p-5 rounded-xl border border-border/50 bg-secondary/20 space-y-2">
              <h3 className="font-semibold">ملخص المشروع</h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
                <span className="text-muted-foreground">الاسم:</span>
                <span className="font-medium">{formData.title}</span>
                <span className="text-muted-foreground">الفئة:</span>
                <span>{categoriesData?.find(c => c.id === formData.category_id)?.title_ar || "—"}</span>
                <span className="text-muted-foreground">الخدمات:</span>
                <span>{selectedServiceIds.length} خدمة</span>
                <span className="text-muted-foreground">الحالة:</span>
                <span>{formData.is_published ? "✅ منشور" : "⏸ مسودة"}</span>
              </div>
            </div>
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm text-primary">
              اضغط "حفظ المشروع" لنشره في معرض أعمالك. يمكنك إضافة وسائط إضافية من صفحة تفاصيل المشروع لاحقاً.
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{isEditing ? "تعديل المشروع" : sourceRequest ? "تحويل طلب إلى مشروع" : "مشروع جديد"}</h1>
          <p className="text-muted-foreground mt-1 text-sm">أضف مشروعاً إلى معرض أعمالك على طريقة Behance.</p>
        </div>
        <Button variant="ghost" asChild><Link to="/admin/projects">إلغاء</Link></Button>
      </div>

      {/* Source request banner */}
      {sourceRequest && (
        <div className="rounded-xl border border-blue-500/20 bg-blue-500/8 p-4 flex items-start gap-3">
          <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0 mt-0.5">
            <Zap className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-blue-700">تحويل من طلب عميل</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              طلب <span className="font-semibold">{sourceRequest.guest_name}</span> ({sourceRequest.guest_email}) — {sourceRequest.project_type}
            </p>
            <p className="text-xs text-muted-foreground">تم تعبئة العنوان والوصف مسبقاً من بيانات الطلب. يمكنك تعديلها.</p>
          </div>
        </div>
      )}

      {/* Step indicator */}
      <div className="relative flex justify-between items-center px-2">
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-secondary" />
        {steps.map(step => (
          <div key={step.id} className="relative flex flex-col items-center z-10">
            <div className={`h-10 w-10 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${currentStep >= step.id ? "bg-primary border-primary text-white shadow-lg shadow-primary/20" : "bg-background border-border text-muted-foreground"}`}>
              {currentStep > step.id ? <Check size={18} /> : <step.icon size={18} />}
            </div>
            <span className={`text-[10px] mt-2 font-medium whitespace-nowrap ${currentStep >= step.id ? "text-primary" : "text-muted-foreground"}`}>{step.title}</span>
          </div>
        ))}
      </div>

      <div className="bg-card border border-border/40 rounded-2xl p-8 shadow-sm min-h-[400px]">
        <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>
      </div>

      <div className="flex items-center justify-between pb-10">
        <Button variant="outline" onClick={() => setCurrentStep(s => s - 1)} disabled={currentStep === 1 || saveMutation.isPending} className="gap-2 rounded-xl">
          <ChevronRight size={18} /> الخطوة السابقة
        </Button>
        {currentStep === steps.length ? (
          <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="bg-gradient-brand gap-2 rounded-xl px-8 shadow-lg shadow-primary/20">
            {saveMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
            {isEditing ? "تحديث المشروع" : "حفظ المشروع"}
          </Button>
        ) : (
          <Button onClick={nextStep} className="gap-2 rounded-xl px-8">
            الخطوة التالية <ChevronLeft size={18} />
          </Button>
        )}
      </div>
    </div>
  );
};

export default ProjectFormAdmin;
