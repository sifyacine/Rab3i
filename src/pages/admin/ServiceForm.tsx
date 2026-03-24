import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Check, Info, Briefcase, Tag, DollarSign, 
  Layers, ChevronRight, ChevronLeft, Plus, Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const steps = [
  { id: 1, title: "المعلومات الأساسية", icon: Tag },
  { id: 2, title: "الوصف والمميزات", icon: Info },
  { id: 3, title: "الحالة والظهور", icon: Layers },
];

const ServiceFormAdmin = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<any>({
    name: "",
    category: "",
    price: "",
    description: "",
    features: ["", "", ""],
    status: "active"
  });

  useEffect(() => {
    if (isEditing) {
      // Mock data
      setFormData({
        id: "1", 
        name: "تصميم وتطوير المواقع", 
        category: "تطوير ويب",
        price: "تبدأ من 500$", 
        status: "active",
        description: "تصميم وتطوير مواقع احترافية سريعة ومتجاوبة مع كافة الشاشات.",
        features: ["تصميم عصري", "لوحة تحكم سهلة", "تحسين SEO", "دعم فني"]
      });
    }
  }, [id, isEditing]);

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData({ ...formData, features: newFeatures });
  };

  const addFeature = () => {
    setFormData({ ...formData, features: [...formData.features, ""] });
  };

  const removeFeature = (index: number) => {
    const newFeatures = formData.features.filter((_: any, i: number) => i !== index);
    setFormData({ ...formData, features: newFeatures });
  };

  const nextStep = () => {
    if (currentStep === 1 && (!formData.name || !formData.category || !formData.price)) {
      toast.error("يرجى إكمال الحقول الأساسية");
      return;
    }
    if (currentStep < steps.length) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSave = () => {
    toast.success(isEditing ? "تم تحديث الخدمة بنجاح" : "تم إضافة الخدمة بنجاح");
    navigate("/admin/services");
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">اسم الخدمة</Label>
                <Input 
                  id="name" 
                  value={formData.name} 
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="مثال: تطوير تطبيقات الجوال" 
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">الفئة</Label>
                  <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                    <SelectTrigger id="category"><SelectValue placeholder="اختر الفئة" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="تطوير ويب">تطوير ويب</SelectItem>
                      <SelectItem value="تطبيق جوال">تطبيق جوال</SelectItem>
                      <SelectItem value="تصميم جرافيك">تصميم جرافيك</SelectItem>
                      <SelectItem value="تسويق رقمي">تسويق رقمي</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">السعر التقريبي</Label>
                  <Input 
                    id="price" 
                    value={formData.price} 
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="مثال: تبدأ من 500$ أو حسب الطلب" 
                  />
                </div>
              </div>
            </div>
          </motion.div>
        );
      case 2:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="description">وصف الخدمة</Label>
                <Textarea 
                  id="description" 
                  rows={4} 
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="اشرح ما تقدمه هذه الخدمة للعملاء..." 
                />
              </div>
              <div className="space-y-3">
                <Label>المميزات والخصائص</Label>
                {formData.features.map((feature: string, index: number) => (
                  <div key={index} className="flex gap-2">
                    <Input 
                      value={feature} 
                      onChange={(e) => handleFeatureChange(index, e.target.value)}
                      placeholder={`ميزة ${index + 1}`} 
                    />
                    <Button variant="ghost" size="icon" onClick={() => removeFeature(index)} className="text-destructive">
                      <Trash2 size={18} />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={addFeature} className="gap-2">
                  <Plus size={16} /> إضافة ميزة
                </Button>
              </div>
            </div>
          </motion.div>
        );
      case 3:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="status">حالة الخدمة</Label>
                <Select value={formData.status} onValueChange={(v: any) => setFormData({ ...formData, status: v })}>
                  <SelectTrigger id="status"><SelectValue placeholder="اختر الحالة" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">نشطة (تظهر في الموقع)</SelectItem>
                    <SelectItem value="inactive">غير نشطة (مخفية)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="p-4 rounded-xl border border-primary/20 bg-primary/5">
                <p className="text-sm text-primary font-medium">سيتم عرض هذه الخدمة في صفحة "خدماتنا" على الموقع الرئيسي للعملاء.</p>
              </div>
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
          <h1 className="text-3xl font-bold">{isEditing ? "تعديل الخدمة" : "إضافة خدمة جديدة"}</h1>
          <p className="text-muted-foreground mt-1">أكمل الخطوات التالية لإضافة بيانات الخدمة.</p>
        </div>
        <Button variant="ghost" asChild>
          <Link to="/admin/services">الغاء</Link>
        </Button>
      </div>

      <div className="relative flex justify-between items-center px-4">
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-secondary -translate-y-1/2" />
        {steps.map((step) => (
          <div key={step.id} className="relative flex flex-col items-center">
            <div className={`h-10 w-10 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${currentStep >= step.id ? "bg-primary border-primary text-white shadow-lg shadow-primary/20" : "bg-background border-secondary text-muted-foreground"}`}>
              {currentStep > step.id ? <Check size={18} /> : <step.icon size={18} />}
            </div>
            <span className={`text-[10px] mt-2 font-medium ${currentStep >= step.id ? "text-primary" : "text-muted-foreground"}`}>{step.title}</span>
          </div>
        ))}
      </div>

      <div className="bg-card border border-border/40 rounded-2xl p-8 shadow-sm min-h-[400px]">
        <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>
      </div>

      <div className="flex items-center justify-between pb-10">
        <Button variant="outline" onClick={prevStep} disabled={currentStep === 1} className="gap-2 rounded-xl">
          <ChevronRight size={18} /> الخطوة السابقة
        </Button>
        {currentStep === steps.length ? (
          <Button onClick={handleSave} className="bg-gradient-brand gap-2 rounded-xl px-8 shadow-lg shadow-primary/20">حفظ الخدمة <Check size={18} /></Button>
        ) : (
          <Button onClick={nextStep} className="gap-2 rounded-xl px-8">الخطوة التالية <ChevronLeft size={18} /></Button>
        )}
      </div>
    </div>
  );
};

export default ServiceFormAdmin;
