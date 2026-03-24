import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Check, Info, FileText, User, Calendar, 
  Image as ImageIcon, ChevronRight, ChevronLeft, Layout
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
  { id: 1, title: "المحتوى الأساسي", icon: FileText },
  { id: 2, title: "المحرر", icon: Layout },
  { id: 3, title: "إعدادات النشر", icon: Check },
];

const BlogFormAdmin = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<any>({
    title: "",
    author: "ياسين سيف",
    category: "",
    summary: "",
    content: "",
    status: "draft",
    publishDate: new Date().toISOString().split('T')[0],
    image: ""
  });

  useEffect(() => {
    if (isEditing) {
      // Mock data
      setFormData({
        id: "1", 
        title: "مستقبل الذكاء الاصطناعي في التصميم", 
        author: "ياسين سيف", 
        status: "published", 
        category: "ذكاء اصطناعي",
        summary: "كيف يغير الذكاء الاصطناعي طريقة عمل المصممين في العصر الحديث.",
        content: "هنا يوضع المحتوى الكامل للمقال...",
        publishDate: "2024-02-10",
        image: "https://images.unsplash.com/photo-1677442136019-21780ecad995"
      });
    }
  }, [id, isEditing]);

  const nextStep = () => {
    if (currentStep === 1 && (!formData.title || !formData.summary)) {
      toast.error("يرجى إكمال الحقول الأساسية");
      return;
    }
    if (currentStep < steps.length) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSave = () => {
    toast.success(isEditing ? "تم تحديث المقال بنجاح" : "تم نشر المقال بنجاح");
    navigate("/admin/blog");
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">عنوان المقال</Label>
                <Input 
                  id="title" 
                  value={formData.title} 
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="مثال: أهمية تجربة المستخدم..." 
                  className="text-lg font-bold"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">الفئة</Label>
                <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                  <SelectTrigger id="category"><SelectValue placeholder="اختر الفئة" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ذكاء اصطناعي">ذكاء اصطناعي</SelectItem>
                    <SelectItem value="تصميم">تصميم</SelectItem>
                    <SelectItem value="تطوير ويب">تطوير ويب</SelectItem>
                    <SelectItem value="أعمال">أعمال</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="summary">وصف مختصر (Summary)</Label>
                <Textarea 
                  id="summary" 
                  rows={3} 
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  placeholder="وصف يظهر في بطاقة المقال..." 
                />
              </div>
            </div>
          </motion.div>
        );
      case 2:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="content">محتوى المقال</Label>
              <div className="min-h-[400px] rounded-xl border border-border/40 p-4 bg-secondary/10">
                <Textarea 
                  id="content" 
                  className="min-h-[350px] border-none focus-visible:ring-0 bg-transparent resize-none leading-relaxed" 
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="ابدأ الكتابة هنا..." 
                />
              </div>
              <p className="text-[10px] text-muted-foreground">ملاحظة: يدعم المحرر محتوى النص الغني.</p>
            </div>
          </motion.div>
        );
      case 3:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="status">حالة النشر</Label>
                  <Select value={formData.status} onValueChange={(v: any) => setFormData({ ...formData, status: v })}>
                    <SelectTrigger id="status"><SelectValue placeholder="اختر الحالة" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="published">منشور</SelectItem>
                      <SelectItem value="draft">مسودة</SelectItem>
                      <SelectItem value="scheduled">مجدول</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="author">الكاتب</Label>
                  <Input id="author" value={formData.author} readOnly />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">تاريخ النشر</Label>
                  <Input id="date" type="date" value={formData.publishDate} onChange={(e) => setFormData({ ...formData, publishDate: e.target.value })} />
                </div>
              </div>
              <div className="space-y-4">
                <Label>الصورة البارزة</Label>
                <div className="aspect-video rounded-xl border-2 border-dashed border-border/40 flex flex-col items-center justify-center gap-3 bg-secondary/5 overflow-hidden relative group">
                  {formData.image ? (
                    <img src={formData.image} className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <ImageIcon className="h-10 w-10 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">اضغط لرفع صورة</p>
                    </>
                  )}
                  <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" />
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
    <div className="max-w-4xl mx-auto space-y-8" dir="rtl">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{isEditing ? "تعديل المقال" : "كتابة مقال جديد"}</h1>
        <Button variant="ghost" asChild><Link to="/admin/blog">الغاء</Link></Button>
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
          <ChevronRight size={18} /> السابق
        </Button>
        {currentStep === steps.length ? (
          <Button onClick={handleSave} className="bg-gradient-brand gap-2 rounded-xl px-12 shadow-lg shadow-primary/20">
            {isEditing ? "تحديث المقال" : "نشر المقال"} <Check size={18} />
          </Button>
        ) : (
          <Button onClick={nextStep} className="gap-2 rounded-xl px-8">التالي <ChevronLeft size={18} /></Button>
        )}
      </div>
    </div>
  );
};

export default BlogFormAdmin;
