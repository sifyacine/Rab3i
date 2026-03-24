import { useState, useEffect } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowRight, ArrowLeft, Check, Info, Briefcase, 
  User, Calendar, ExternalLink, ChevronRight, ChevronLeft, DollarSign
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

export type ProjectStatus = "pending_approval" | "in_discussion" | "offered" | "ongoing" | "completed" | "archived";

const steps = [
  { id: 1, title: "المعلومات الأساسية", icon: Briefcase },
  { id: 2, title: "التفاصيل والحالة", icon: Info },
  { id: 3, title: "التواريخ والروابط", icon: Calendar },
];

const ProjectFormAdmin = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isEditing = !!id;
  
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<any>({
    title: "",
    client: "",
    category: "",
    status: "pending_approval",
    description: "",
    startDate: new Date().toISOString().split('T')[0],
    endDate: "",
    budget: "",
    link: ""
  });

  useEffect(() => {
    // Check if we are passing a request from RequestsAdmin
    if (location.state?.request && !isEditing) {
      const req = location.state.request;
      setFormData((prev: any) => ({
        ...prev,
        client: req.sender,
        title: req.type,
        status: "pending_approval",
        description: `تم إنشاء هذا المشروع بناءً على طلب من ${req.sender} بتاريخ ${req.date}.\nنوع الطلب: ${req.type}`,
      }));
      toast.info("تم ملء البيانات من الطلب المعتمد");
    }

    if (isEditing) {
      // In a real app, fetch project by ID. Here we mock it.
      setFormData({
        id: "1", 
        title: "موقع شركة النبراس", 
        category: "تطوير ويب", 
        client: "النبراس العقارية", 
        status: "completed", 
        progress: 100,
        description: "تطوير موقع تعريفي متكامل لشركة النبراس العقارية مع لوحة تحكم.",
        startDate: "2024-03-15",
        link: "https://al-nebras.com"
      });
    }
  }, [id, isEditing, location.state]);

  const nextStep = () => {
    if (currentStep === 1 && (!formData.title || !formData.client || !formData.category)) {
      toast.error("يرجى إكمال الحقول الأساسية");
      return;
    }
    if (currentStep < steps.length) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSave = () => {
    toast.success(isEditing ? "تم تحديث المشروع بنجاح" : "تم إضافة المشروع بنجاح");
    navigate("/admin/projects");
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }} 
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">اسم المشروع</Label>
                <Input 
                  id="title" 
                  value={formData.title} 
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="مثال: موقع شركة النبراس" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="client">العميل</Label>
                <Input 
                  id="client" 
                  value={formData.client} 
                  onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                  placeholder="اسم العميل أو الشركة" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">الفئة</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(v) => setFormData({ ...formData, category: v })}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="اختر الفئة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="تطوير ويب">تطوير ويب</SelectItem>
                    <SelectItem value="تطبيق جوال">تطبيق جوال</SelectItem>
                    <SelectItem value="تصميم جرافيك">تصميم جرافيك</SelectItem>
                    <SelectItem value="تسويق رقمي">تسويق رقمي</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </motion.div>
        );
      case 2:
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }} 
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="status">الحالة</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(v: any) => setFormData({ ...formData, status: v })}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="اختر الحالة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending_approval">قيد المراجعة / التحليل</SelectItem>
                    <SelectItem value="in_discussion">قيد النقاش / الاجتماع</SelectItem>
                    <SelectItem value="offered">تم تقديم العرض</SelectItem>
                    <SelectItem value="ongoing">قيد التنفيذ (جاري)</SelectItem>
                    <SelectItem value="completed">مكتمل / تم التسليم</SelectItem>
                    <SelectItem value="archived">مؤرشف</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">وصف المشروع</Label>
                <Textarea 
                  id="description" 
                  rows={6} 
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="اكتب وصفاً مختصراً للمشروع وتفاصيله والاتفاقات الحالية..." 
                />
              </div>
            </div>
          </motion.div>
        );
      case 3:
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }} 
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="startDate">تاريخ البدء</Label>
                <Input 
                  id="startDate" 
                  type="date" 
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="budget">الميزانية المتوقعة / المبلغ</Label>
                <div className="relative">
                  <DollarSign className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="budget" 
                    className="pr-10" 
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    placeholder="مثال: 5000$" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">تاريخ الانتهاء المتوقع (اختياري)</Label>
                <Input 
                  id="endDate" 
                  type="date" 
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="link">رابط المشروع الخارجي (إن وجد)</Label>
                <div className="relative">
                  <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="link" 
                    type="url" 
                    value={formData.link}
                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                    className="pl-10"
                    placeholder="https://example.com" 
                  />
                </div>
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
          <h1 className="text-3xl font-bold">{isEditing ? "تعديل المشروع" : "مشروع جديد"}</h1>
          <p className="text-muted-foreground mt-1">أكمل الخطوات التالية لإضافة بيانات المشروع بدقة.</p>
        </div>
        <Button variant="ghost" asChild>
          <Link to="/admin/projects" className="gap-2">
            الغاء
          </Link>
        </Button>
      </div>

      {/* Steps Indicator */}
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
          disabled={currentStep === 1}
          className="gap-2 rounded-xl"
        >
          <ChevronRight size={18} /> الخطوة السابقة
        </Button>
        
        {currentStep === steps.length ? (
          <Button 
            onClick={handleSave} 
            className="bg-gradient-brand gap-2 rounded-xl px-8 shadow-lg shadow-primary/20"
          >
            حفظ المشروع <Check size={18} />
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
