import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Save, Layout, ListChecks, MessageSquare, Building2, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { siteContentService, SITE_CONTENT_DEFAULTS } from "@/services/siteContentService";

interface EditableContent {
  heroTitle: string;
  heroSubtitle: string;
  ctaText: string;
  processSteps: { title: string; description: string }[];
  partners: string[];
}

const SiteContent = () => {
  const queryClient = useQueryClient();

  const { data: siteContent, isLoading } = useQuery({
    queryKey: ["site-content"],
    queryFn: () => siteContentService.getSiteContent(),
  });

  const [content, setContent] = useState<EditableContent | null>(null);

  // Seed the editor once the query settles (success OR error), falling back to
  // the built-in homepage copy — so a load error still yields an editable form
  // instead of an infinite spinner.
  useEffect(() => {
    if (isLoading || content) return;
    const c = siteContent;
    setContent({
      heroTitle: c?.hero_title ?? SITE_CONTENT_DEFAULTS.hero_title,
      heroSubtitle: c?.hero_subtitle ?? SITE_CONTENT_DEFAULTS.hero_subtitle,
      ctaText: c?.cta_text ?? SITE_CONTENT_DEFAULTS.cta_text,
      processSteps:
        c?.process_steps && c.process_steps.length
          ? c.process_steps.map((s) => ({ title: s.title, description: s.description }))
          : SITE_CONTENT_DEFAULTS.process_steps.map((s) => ({ ...s })),
      partners:
        c?.partners && c.partners.length
          ? [...c.partners]
          : [...SITE_CONTENT_DEFAULTS.partners],
    });
  }, [isLoading, siteContent, content]);

  const saveMutation = useMutation({
    mutationFn: () =>
      siteContentService.updateSiteContent({
        // Store cleared fields as null so "cleared" reads back as the default
        // both in the editor and on the public homepage.
        hero_title: content!.heroTitle.trim() || null,
        hero_subtitle: content!.heroSubtitle.trim() || null,
        cta_text: content!.ctaText.trim() || null,
        process_steps: content!.processSteps
          .map((s) => ({ title: s.title.trim(), description: s.description.trim() }))
          .filter((s) => s.title || s.description),
        partners: content!.partners.map((p) => p.trim()).filter(Boolean),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site-content"] });
      toast.success("تم تحديث محتوى الموقع بنجاح");
    },
    onError: () => toast.error("حدث خطأ أثناء حفظ المحتوى"),
  });

  if (isLoading || !content) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary/50" />
      </div>
    );
  }

  const setStep = (index: number, patch: Partial<{ title: string; description: string }>) =>
    setContent({
      ...content,
      processSteps: content.processSteps.map((s, i) => (i === index ? { ...s, ...patch } : s)),
    });

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
        <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="bg-gradient-brand shadow-lg">
          {saveMutation.isPending ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Save className="ml-2 h-4 w-4" />}
          {saveMutation.isPending ? "جاري الحفظ..." : "حفظ التغييرات"}
        </Button>
      </div>

      <Tabs defaultValue="hero" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-secondary/50 rounded-xl p-1">
          <TabsTrigger value="hero" className="rounded-lg gap-2">
            <Layout className="h-4 w-4" /> القسم الرئيسي
          </TabsTrigger>
          <TabsTrigger value="process" className="rounded-lg gap-2">
            <ListChecks className="h-4 w-4" /> خطوات العمل
          </TabsTrigger>
          <TabsTrigger value="cta" className="rounded-lg gap-2">
            <MessageSquare className="h-4 w-4" /> نداء العمل (CTA)
          </TabsTrigger>
          <TabsTrigger value="partners" className="rounded-lg gap-2">
            <Building2 className="h-4 w-4" /> شركاء النجاح
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
                  onChange={(e) => setContent({ ...content, heroTitle: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="heroSubtitle">العنوان الفرعي</Label>
                <Textarea
                  id="heroSubtitle"
                  rows={3}
                  value={content.heroSubtitle}
                  onChange={(e) => setContent({ ...content, heroSubtitle: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="process" className="mt-6 space-y-6">
          <Card className="border-border/40 bg-card/30">
            <CardHeader>
              <CardTitle>خطوات العمل (How We Work)</CardTitle>
              <CardDescription>الخطوات التي تظهر في قسم منهجية العمل</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {content.processSteps.map((step, index) => (
                <div key={index} className="p-4 rounded-xl border border-border/20 bg-background/30 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">الخطوة {index + 1}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>عنوان الخطوة</Label>
                      <Input value={step.title} onChange={(e) => setStep(index, { title: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>الوصف</Label>
                      <Input value={step.description} onChange={(e) => setStep(index, { description: e.target.value })} />
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
              <CardDescription>تخصيص نص زر «تواصل معنا» في قسم نداء العمل بأسفل الصفحة</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cta">نص زر "تواصل معنا"</Label>
                <Input
                  id="cta"
                  value={content.ctaText}
                  onChange={(e) => setContent({ ...content, ctaText: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="partners" className="mt-6 space-y-6">
          <Card className="border-border/40 bg-card/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>شركاء النجاح</CardTitle>
                <CardDescription>إدارة أسماء الشركات التي تظهر في شريط الشركاء</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => {
                  const name = prompt("أدخل اسم الشريك الجديد:");
                  if (name) setContent({ ...content, partners: [...content.partners, name] });
                }}
              >
                إضافة شريك
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {content.partners.map((partner, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-xl border border-border/20 bg-background/30 group">
                    <span className="text-sm">{partner}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => setContent({ ...content, partners: content.partners.filter((_, i) => i !== index) })}
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default SiteContent;
