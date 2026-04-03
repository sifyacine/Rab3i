import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Info, Tag, Layers, ChevronRight, ChevronLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { servicesService } from "@/services/servicesService";
import { CreateServiceDTO } from "@/types/portfolio";

const steps = [
  { id: 1, title: "الاسم والمعرّف", icon: Tag },
  { id: 2, title: "الوصف", icon: Info },
  { id: 3, title: "الإعدادات", icon: Layers },
];

const iconOptions = [
  "Palette", "Layers", "Monitor", "Users", "Code", "Smartphone",
  "FileText", "Share2", "Search", "Camera", "Video", "Zap",
  "Target", "ShoppingCart", "Globe", "Database", "PenTool", "Image"
];

function generateSlug(text: string) {
  return text.toLowerCase()
    .replace(/[\u0600-\u06ff]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const ServiceFormAdmin = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = !!id;

  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState<CreateServiceDTO>({
    title_ar: "",
    title_en: "",
    slug: "",
    description_ar: "",
    description_en: "",
    icon: "Zap",
    is_active: true,
  });

  const { data: existingService, isLoading: loadingExisting } = useQuery({
    queryKey: ["admin-service", id],
    queryFn: () => servicesService.getServiceById(id!),
    enabled: isEditing,
  });

  useEffect(() => {
    if (existingService) {
      setForm({
        title_ar: existingService.title_ar,
        title_en: existingService.title_en,
        slug: existingService.slug,
        description_ar: existingService.description_ar ?? "",
        description_en: existingService.description_en ?? "",
        icon: existingService.icon ?? "Zap",
        is_active: existingService.is_active,
      });
    }
  }, [existingService]);

  const createMutation = useMutation({
    mutationFn: (data: CreateServiceDTO) => servicesService.createService(data),
    onSuccess: () => {
      toast.success("تمت إضافة الخدمة بنجاح");
      queryClient.invalidateQueries({ queryKey: ["admin-services"] });
      navigate("/admin/services");
    },
    onError: (err: Error) => toast.error(err.message || "حدث خطأ أثناء الحفظ"),
  });

  const updateMutation = useMutation({
    mutationFn: (data: CreateServiceDTO) => servicesService.updateService(id!, data),
    onSuccess: () => {
      toast.success("تم تحديث الخدمة بنجاح");
      queryClient.invalidateQueries({ queryKey: ["admin-services"] });
      navigate("/admin/services");
    },
    onError: (err: Error) => toast.error(err.message || "حدث خطأ أثناء الحفظ"),
  });

  const isSaving = createMutation.isPending || updateMutation.isPending;

  // Auto-generate slug from English title
  useEffect(() => {
    if (!isEditing && form.title_en) {
      const slug = generateSlug(form.title_en);
      if (slug) setForm(f => ({ ...f, slug }));
    }
  }, [form.title_en, isEditing]);

  const nextStep = () => {
    if (currentStep === 1) {
      if (!form.title_ar || !form.title_en || !form.slug) {
        toast.error("يرجى إكمال الحقول الإلزامية");
        return;
      }
    }
    if (currentStep < steps.length) setCurrentStep(s => s + 1);
  };

  const handleSave = () => {
    if (!form.title_ar || !form.title_en || !form.slug) {
      toast.error("يرجى إكمال الحقول الإلزامية");
      return;
    }
    if (isEditing) {
      updateMutation.mutate(form);
    } else {
      createMutation.mutate(form);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title_ar">الاسم بالعربية *</Label>
                <Input
                  id="title_ar"
                  value={form.title_ar}
                  onChange={e => setForm(f => ({ ...f, title_ar: e.target.value }))}
                  placeholder="مثال: تصميم الشعارات"
                  dir="rtl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="title_en">Name in English *</Label>
                <Input
                  id="title_en"
                  value={form.title_en}
                  onChange={e => setForm(f => ({ ...f, title_en: e.target.value }))}
                  placeholder="e.g. Logo Design"
                  dir="ltr"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug (معرّف URL) *</Label>
              <Input
                id="slug"
                value={form.slug}
                onChange={e => setForm(f => ({ ...f, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") }))}
                placeholder="logo-design"
                dir="ltr"
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">يُستخدم في الروابط والتصفية – يُنشأ تلقائياً من الاسم الإنجليزي</p>
            </div>
            <div className="space-y-2">
              <Label>الأيقونة</Label>
              <div className="flex flex-wrap gap-2">
                {iconOptions.map(icon => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, icon }))}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-mono transition-all ${form.icon === icon ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/50"}`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        );
      case 2:
        return (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="desc_ar">الوصف بالعربية</Label>
              <Textarea
                id="desc_ar"
                rows={3}
                value={form.description_ar ?? ""}
                onChange={e => setForm(f => ({ ...f, description_ar: e.target.value }))}
                placeholder="صِف هذه الخدمة للزوار بالعربية..."
                dir="rtl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="desc_en">Description in English</Label>
              <Textarea
                id="desc_en"
                rows={3}
                value={form.description_en ?? ""}
                onChange={e => setForm(f => ({ ...f, description_en: e.target.value }))}
                placeholder="Describe this service for visitors in English..."
                dir="ltr"
              />
            </div>
          </motion.div>
        );
      case 3:
        return (
          <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <div className="flex items-center justify-between p-5 rounded-xl border border-border/50 bg-secondary/20">
              <div>
                <p className="font-medium">تفعيل الخدمة</p>
                <p className="text-sm text-muted-foreground mt-0.5">الخدمات النشطة تظهر في الموقع وتُستخدم لتصفية المشاريع</p>
              </div>
              <Switch
                checked={form.is_active}
                onCheckedChange={v => setForm(f => ({ ...f, is_active: v }))}
              />
            </div>

            {/* Summary */}
            <div className="space-y-3 p-5 rounded-xl border border-primary/20 bg-primary/5">
              <h3 className="font-semibold text-sm text-primary">ملخص الخدمة</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-muted-foreground">الاسم العربي:</span>
                <span className="font-medium">{form.title_ar || "—"}</span>
                <span className="text-muted-foreground">English Name:</span>
                <span className="font-medium">{form.title_en || "—"}</span>
                <span className="text-muted-foreground">Slug:</span>
                <span className="font-mono text-xs">{form.slug || "—"}</span>
                <span className="text-muted-foreground">الأيقونة:</span>
                <span className="font-mono text-xs">{form.icon || "—"}</span>
              </div>
            </div>
          </motion.div>
        );
    }
  };

  if (isEditing && loadingExisting) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{isEditing ? "تعديل الخدمة" : "إضافة خدمة جديدة"}</h1>
          <p className="text-muted-foreground mt-1 text-sm">أكمل الخطوات لإضافة خدمة ثنائية اللغة</p>
        </div>
        <Button variant="ghost" asChild><Link to="/admin/services">إلغاء</Link></Button>
      </div>

      {/* Step progress */}
      <div className="relative flex justify-between items-center px-4">
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

      <div className="bg-card border border-border/40 rounded-2xl p-8 shadow-sm min-h-[300px]">
        <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>
      </div>

      <div className="flex items-center justify-between pb-10">
        <Button variant="outline" onClick={() => setCurrentStep(s => s - 1)} disabled={currentStep === 1} className="gap-2 rounded-xl">
          <ChevronRight size={18} /> السابق
        </Button>
        {currentStep === steps.length ? (
          <Button onClick={handleSave} disabled={isSaving} className="bg-gradient-brand gap-2 rounded-xl px-8 shadow-lg shadow-primary/20">
            {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
            {isEditing ? "تحديث الخدمة" : "حفظ الخدمة"}
          </Button>
        ) : (
          <Button onClick={nextStep} className="gap-2 rounded-xl px-8">
            التالي <ChevronLeft size={18} />
          </Button>
        )}
      </div>
    </div>
  );
};

export default ServiceFormAdmin;
