import { motion } from "framer-motion";
import { MessageSquare, Phone, Mail, Clock, HelpCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const PortalSupport = () => {
  const faqs = [
    { q: "كيف يمكنني متابعة تقدم مشروعي؟", a: "يمكنك متابعة التقدم من خلال صفحة 'مشاريعي' حيث يتم تحديث حالة كل مشروع ونسبة الإنجاز بشكل دوري." },
    { q: "كيف أقوم بسداد الفواتير؟", a: "في صفحة 'الفواتير'، ستجد خيار 'سداد الآن' بجانب كل فاتورة غير مدفوعة. يمكنك السداد عبر طرق الدفع المتاحة." },
    { q: "ما هي أوقات العمل والدعم؟", a: "نحن متاحون للدعم الفني من الأحد إلى الخميس، من الساعة 9 صباحاً حتى 5 مساءً." },
    { q: "كيف يمكنني طلب تعديل على المشروع؟", a: "يمكنك التواصل مباشرة مع مدير المشروع عبر واتساب أو البريد الإلكتروني الموضح في صفحة الدعم." },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">مركز الدعم والمساعدة</h1>
        <p className="text-muted-foreground mt-2">نحن هنا لضمان حصولك على أفضل تجربة ممكنة.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-primary" />
              الأسئلة الشائعة
            </CardTitle>
            <CardDescription>إجابات سريعة على التساؤلات الأكثر تكراراً.</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, i) => (
                <AccordionItem key={i} value={`item-${i}`}>
                  <AccordionTrigger className="text-right">{faq.q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">تواصل سريع</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start gap-3 bg-[#25D366] hover:bg-[#20ba56] text-white" asChild>
                <a href="https://wa.me/966500000000" target="_blank" rel="noreferrer">
                  <MessageSquare className="h-4 w-4" /> واتساب
                </a>
              </Button>
              <Button variant="outline" className="w-full justify-start gap-3" asChild>
                <a href="tel:+966500000000">
                  <Phone className="h-4 w-4" /> اتصال مباشر
                </a>
              </Button>
              <Button variant="outline" className="w-full justify-start gap-3" asChild>
                <a href="mailto:support@rabii.sa">
                  <Mail className="h-4 w-4" /> البريد الإلكتروني
                </a>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-secondary/30 border-none shadow-none">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <h4 className="font-semibold text-sm">ساعات العمل</h4>
                  <p className="text-xs text-muted-foreground mt-1">الأحد - الخميس</p>
                  <p className="text-xs text-muted-foreground">09:00 ص - 05:00 م</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
};

export default PortalSupport;
