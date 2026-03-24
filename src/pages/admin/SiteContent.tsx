import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Save, Layout, ListChecks, MessageSquare, Image as ImageIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const SiteContent = () => {
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState({
    heroTitle: "نحول رؤيتك الرقمية إلى واقع ملموس",
    heroSubtitle: "استوديو إبداعي متخصص في بناء التجارب الرقمية الفريدة التي تجمع بين الفن والتقنية",
    processSteps: [
      { id: 1, title: "التحليل والتخطيط", description: "نبدأ بفهم عميق لأهدافك وجمهورك المستهدف" },
      { id: 2, title: "التصميم الإبداعي", description: "نبتكر هوية بصرية وتجربة مستخدم لا تُنسى" },
      { id: 3, title: "التطوير البرمجي", description: "نحول التصاميم إلى كود عالي الأداء وقابل للتوسع" },
      { id: 4, title: "الإطلاق والدعم", description: "نرافقك في مرحلة الإطلاق ونضمن استمرارية النجاح" }
    ],
    ctaText: "ابدأ مشروعك الآن"
  });

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("تم تحديث محتوى الموقع بنجاح");
    }, 1000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="space-y-6"
      dir="rtl"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">إدارة محتوى الموقع</h1>
          <p className="text-sm text-muted-foreground mt-1">تحكم في النصوص والأقسام التي تظهر في الصفحة الرئيسية</p>
        </div>
        <Button onClick={handleSave} disabled={loading} className="bg-gradient-brand shadow-lg">
          <Save className="ml-2 h-4 w-4" />
          {loading ? "جاري الحفظ..." : "حفظ التغييرات"}
        </Button>
      </div>

      <Tabs defaultValue="hero" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-secondary/50 rounded-xl p-1">
          <TabsTrigger value="hero" className="rounded-lg gap-2">
            <Layout className="h-4 w-4" /> القسم الرئيسي
          </TabsTrigger>
          <TabsTrigger value="process" className="rounded-lg gap-2">
            <ListChecks className="h-4 w-4" /> خطوات العمل
          </TabsTrigger>
          <TabsTrigger value="cta" className="rounded-lg gap-2">
            <MessageSquare className="h-4 w-4" /> نداء العمل (CTA)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="hero" className="mt-6 space-y-6">
          <Card className="border-border/40 bg-card/30">
            <CardHeader>
              <CardTitle>القسم الرئيسي (Hero Section)</CardTitle>
              <CardDescription>العنوان والعنوان الفرعي في أعلى الصفحة</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="heroTitle">العنوان الرئيسي</Label>
                <Input 
                  id="heroTitle" 
                  value={content.heroTitle} 
                  onChange={(e) => setContent({...content, heroTitle: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="heroSubtitle">العنوان الفرعي</Label>
                <Textarea 
                  id="heroSubtitle" 
                  rows={3}
                  value={content.heroSubtitle} 
                  onChange={(e) => setContent({...content, heroSubtitle: e.target.value})}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="process" className="mt-6 space-y-6">
          <Card className="border-border/40 bg-card/30">
            <CardHeader>
              <CardTitle>خطوات العمل (How We Work)</CardTitle>
              <CardDescription>الخطوات الأربع التي تظهر في قسم منهجية العمل</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {content.processSteps.map((step, index) => (
                <div key={step.id} className="p-4 rounded-xl border border-border/20 bg-background/30 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">الخطوة {index + 1}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>عنوان الخطوة</Label>
                      <Input 
                        value={step.title} 
                        onChange={(e) => {
                          const newSteps = [...content.processSteps];
                          newSteps[index].title = e.target.value;
                          setContent({...content, processSteps: newSteps});
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>الوصف</Label>
                      <Input 
                        value={step.description} 
                        onChange={(e) => {
                          const newSteps = [...content.processSteps];
                          newSteps[index].description = e.target.value;
                          setContent({...content, processSteps: newSteps});
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cta" className="mt-6 space-y-6">
          <Card className="border-border/40 bg-card/30">
            <CardHeader>
              <CardTitle>أزرار ونداءات العمل</CardTitle>
              <CardDescription>تخصيص نصوص الأزرار والروابط السريعة</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cta">نص زر "تواصل معنا"</Label>
                <Input 
                  id="cta" 
                  value={content.ctaText} 
                  onChange={(e) => setContent({...content, ctaText: e.target.value})}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default SiteContent;
