import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Check, Info, Briefcase, ChevronRight, ChevronLeft, Image as ImageIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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

const steps = [
  { id: 1, title: "المعلومات الأساسية", icon: Briefcase },
  { id: 2, title: "التفاصيل والنشر", icon: Info },
  { id: 3, title: "الوسائط والصور", icon: ImageIcon },
];

const ProjectFormAdmin = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = !!id;
  
  const [currentStep, setCurrentStep] = useState(1);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    category_id: "",
    description: "",
    is_published: false,
    cover_image: "",
  });

  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoryService.getCategories()
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

      if (isEditing) {
        return projectsService.updateProject(id!, payload);
      } else {
        return projectsService.createProject(payload as any);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success(isEditing ? "تم تحديث المشروع بنجاح" : "تم إضافة المشروع بنجاح");
      navigate("/admin/projects");
    },
    onError: (err: any) => {
      toast.dismiss("upload");
      toast.error(err.message || "حدث خطأ غير متوقع");
    }
  });

  const nextStep = () => {
    if (currentStep === 1 && (!formData.title || !formData.category_id)) {
      toast.error("يرجى تعبئة العنوان والفئة");
      return;
    }
    if (currentStep < steps.length) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">اسم المشروع</Label>
                <Input 
                  id="title" 
                  value={formData.title} 
                  onChange={(e) => {
                    const slug = e.target.value.toLowerCase().replace(/\s+/g, '-');
                    setFormData({ ...formData, title: e.target.value, slug });
                  }}
                  placeholder="مثال: واجهة تطبيق محاسبي" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">الرابط المخصص (Slug)</Label>
                <Input 
                  id="slug" 
                  value={formData.slug} 
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="my-awesome-project" 
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">الفئة</Label>
                <Select 
                  value={formData.category_id} 
                  onValueChange={(v) => setFormData({ ...formData, category_id: v })}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="اختر الفئة" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoriesData?.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </motion.div>
        );
      case 2:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2 flex items-center justify-between border p-4 rounded-xl">
                <div>
                  <Label htmlFor="published" className="text-base">نشر المشروع للملأ</Label>
                  <p className="text-sm text-muted-foreground mt-1">إذا تم إيقافه، سيتم حفظه كمسودة فقط ولن يظهر للزوار</p>
                </div>
                <Switch 
                  id="published" 
                  checked={formData.is_published}
                  onCheckedChange={(c) => setFormData({ ...formData, is_published: c })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">وصف المشروع</Label>
                <Textarea 
                  id="description" 
                  rows={6} 
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="تحدث بتفصيل عن هذا العمل المميز وما حققه..." 
                />
              </div>
            </div>
          </motion.div>
        );
      case 3:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cover">الصورة الرئيسية (Cover Image)</Label>
                <Input 
                  id="cover" 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files?.[0]) setCoverFile(e.target.files[0]);
                  }}
                />
                {(formData.cover_image || coverFile) && (
                  <div className="mt-4 w-full h-48 border rounded-xl overflow-hidden relative">
                    <img 
                      src={coverFile ? URL.createObjectURL(coverFile) : formData.cover_image} 
                      alt="Cover preview" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
              {/* Media Gallery feature is pending separate task for component upload, can add later */}
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
          <h1 className="text-2xl font-bold">{isEditing ? "تعديل المشروع" : "مشروع جديد"}</h1>
          <p className="text-muted-foreground mt-1">إضافة مشروع إلى مععرض الأعمال الخاص بك.</p>
        </div>
        <Button variant="ghost" asChild>
          <Link to="/admin/projects" className="gap-2">
            الغاء
          </Link>
        </Button>
      </div>

      <div className="relative flex justify-between items-center px-4">
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-secondary -translate-y-1/2" />
        {steps.map((step) => (
          <div key={step.id} className="relative flex flex-col items-center">
            <div 
              className={`h-10 w-10 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                currentStep >= step.id 
                  ? "bg-primary border-primary text-white shadow-lg shadow-primary/20" 
                  : "bg-background border-secondary text-muted-foreground"
              }`}
            >
              {currentStep > step.id ? <Check size={18} /> : <step.icon size={18} />}
            </div>
            <span className={`text-[10px] mt-2 font-medium ${currentStep >= step.id ? "text-primary" : "text-muted-foreground"}`}>
              {step.title}
            </span>
          </div>
        ))}
      </div>

      <div className="bg-card border border-border/40 rounded-2xl p-8 shadow-sm min-h-[400px]">
        <AnimatePresence mode="wait">
          {renderStep()}
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-between pb-10">
        <Button 
          variant="outline" 
          onClick={prevStep} 
          disabled={currentStep === 1 || saveMutation.isPending}
          className="gap-2 rounded-xl"
        >
          <ChevronRight size={18} /> الخطوة السابقة
        </Button>
        
        {currentStep === steps.length ? (
          <Button 
            onClick={() => saveMutation.mutate()} 
            disabled={saveMutation.isPending}
            className="bg-gradient-brand gap-2 rounded-xl px-8 shadow-lg shadow-primary/20"
          >
            {saveMutation.isPending ? "جاري الحفظ..." : "حفظ المشروع"} <Check size={18} />
          </Button>
        ) : (
          <Button 
            onClick={nextStep} 
            className="gap-2 rounded-xl px-8"
          >
            الخطوة التالية <ChevronLeft size={18} />
          </Button>
        )}
      </div>
    </div>
  );
};

export default ProjectFormAdmin;
