import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check, Info, FileText, User, Calendar,
  Image as ImageIcon, ChevronRight, ChevronLeft, Layout, Loader2, X
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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { blogService, BlogPost, CreateBlogDTO } from "@/services/blogService";
import { useAuth } from "@/contexts/AuthContext";
import { useRefresh } from "@/contexts/RefreshContext";

const steps = [
  { id: 1, title: "المحتوى الأساسي", icon: FileText },
  { id: 2, title: "المحرر", icon: Layout },
  { id: 3, title: "إعدادات النشر", icon: Check },
];

const CATEGORIES = [
  "ذكاء اصطناعي",
  "تصميم",
  "تطوير ويب",
  "أعمال",
  "التسويق الرقمي",
  "محتوى",
  "علامة تجارية",
];

const BlogFormAdmin = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { refreshData } = useRefresh();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEditing = !!id;

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<any>({
    title: "",
    author: user?.email?.split("@")[0] || "ربيعي",
    category: "",
    excerpt: "",
    content: "",
    status: "draft",
    published_at: new Date().toISOString().split("T")[0],
    featured_image_url: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Fetch post if editing
  const { data: existingPost, isLoading } = useQuery({
    queryKey: ["blog-post", id],
    queryFn: () => (id ? blogService.getBlogPostById(id) : null),
    enabled: isEditing,
  });

  useEffect(() => {
    if (existingPost) {
      setFormData({
        title: existingPost.title,
        author: existingPost.author,
        category: existingPost.category,
        excerpt: existingPost.excerpt,
        content: existingPost.content,
        status: existingPost.status,
        published_at: existingPost.published_at || new Date().toISOString().split("T")[0],
        featured_image_url: existingPost.featured_image_url || "",
      });
      if (existingPost.featured_image_url) {
        setImagePreview(existingPost.featured_image_url);
      }
    }
  }, [existingPost]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith("image/")) {
      toast.error("يرجى اختيار ملف صورة");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("حجم الصورة يجب أن يكون أقل من 5 MB");
      return;
    }

    setSelectedFile(file);

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const createMutation = useMutation({
    mutationFn: async (data: CreateBlogDTO) => {
      const post = await blogService.createBlogPost(data);

      // Upload image if selected
      if (selectedFile) {
        setUploadingImage(true);
        try {
          const imageUrl = await blogService.uploadImage(selectedFile, post.id);
          await blogService.updateBlogPost(post.id, {
            ...data,
            featured_image_url: imageUrl,
          });
        } finally {
          setUploadingImage(false);
        }
      }

      return post;
    },
    onSuccess: () => {
      toast.success("تم نشر المقال بنجاح");
      queryClient.invalidateQueries({ queryKey: ["admin-blog"] });
      refreshData(["admin-blog"]);
      navigate("/admin/blog");
    },
    onError: (err: Error) => toast.error(err.message || "حدث خطأ"),
  });

  const updateMutation = useMutation({
    mutationFn: async (data: CreateBlogDTO) => {
      if (!id) throw new Error("No post ID");

      // Upload image if selected
      if (selectedFile) {
        setUploadingImage(true);
        try {
          const imageUrl = await blogService.uploadImage(selectedFile, id);
          data.featured_image_url = imageUrl;
        } finally {
          setUploadingImage(false);
        }
      }

      return blogService.updateBlogPost(id, data);
    },
    onSuccess: () => {
      toast.success("تم تحديث المقال بنجاح");
      queryClient.invalidateQueries({ queryKey: ["admin-blog"] });
      refreshData(["admin-blog"]);
      navigate("/admin/blog");
    },
    onError: (err: Error) => toast.error(err.message || "حدث خطأ"),
  });

  const nextStep = () => {
    if (currentStep === 1 && (!formData.title || !formData.excerpt || !formData.category)) {
      toast.error("يرجى إكمال الحقول الأساسية");
      return;
    }
    if (currentStep < steps.length) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSave = () => {
    const payload: CreateBlogDTO = {
      title: formData.title,
      author: formData.author,
      category: formData.category,
      excerpt: formData.excerpt,
      content: formData.content,
      status: formData.status,
      published_at: formData.status === "published" ? formData.published_at : undefined,
      featured_image_url: formData.featured_image_url || undefined,
    };

    if (isEditing) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  };

  if (isEditing && isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

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
                  <SelectTrigger id="category">
                    <SelectValue placeholder="اختر الفئة" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="excerpt">وصف مختصر (Excerpt)</Label>
                <Textarea
                  id="excerpt"
                  rows={3}
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
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
                    <SelectTrigger id="status">
                      <SelectValue placeholder="اختر الحالة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="published">منشور</SelectItem>
                      <SelectItem value="draft">مسودة</SelectItem>
                      <SelectItem value="scheduled">مجدول</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="author">الكاتب</Label>
                  <Input
                    id="author"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">تاريخ النشر</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.published_at}
                    onChange={(e) => setFormData({ ...formData, published_at: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-4">
                <Label>الصورة البارزة</Label>
                <div
                  className="aspect-video rounded-xl border-2 border-dashed border-border/40 flex flex-col items-center justify-center gap-3 bg-secondary/5 overflow-hidden relative group cursor-pointer transition-all hover:border-primary/40 hover:bg-secondary/10"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {imagePreview ? (
                    <>
                      <img src={imagePreview} className="w-full h-full object-cover absolute inset-0" />
                      <Button
                        size="sm"
                        variant="secondary"
                        className="relative z-10 gap-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFile(null);
                          setImagePreview(null);
                        }}
                      >
                        <X className="h-3 w-3" /> إزالة
                      </Button>
                    </>
                  ) : (
                    <>
                      <ImageIcon className="h-10 w-10 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">اضغط لرفع صورة</p>
                      <p className="text-xs text-muted-foreground">PNG, JPG (Max 5MB)</p>
                    </>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
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

  const isSubmitting = createMutation.isPending || updateMutation.isPending || uploadingImage;

  return (
    <div className="max-w-4xl mx-auto space-y-8" dir="rtl">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{isEditing ? "تعديل المقال" : "كتابة مقال جديد"}</h1>
        <Button variant="ghost" asChild>
          <Link to="/admin/blog">إلغاء</Link>
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
            <span
              className={`text-[10px] mt-2 font-medium ${
                currentStep >= step.id ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {step.title}
            </span>
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
          <Button
            onClick={handleSave}
            disabled={isSubmitting}
            className="bg-gradient-brand gap-2 rounded-xl px-12 shadow-lg shadow-primary/20"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin" /> جاري الحفظ...
              </>
            ) : (
              <>
                {isEditing ? "تحديث المقال" : "نشر المقال"} <Check size={18} />
              </>
            )}
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

export default BlogFormAdmin;
