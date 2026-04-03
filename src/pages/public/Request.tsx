import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Loader2, Phone, Mail, User, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/ScrollReveal";
import { toast } from "sonner";
import { useMutation, useQuery } from "@tanstack/react-query";
import { requestsService, CreateRequestDTO } from "@/services/requestsService";
import { servicesService } from "@/services/servicesService";
import { cn } from "@/lib/utils";

const projectTypes = [
  "تصميم هوية بصرية",
  "تطوير موقع ويب",
  "تطبيق جوال",
  "حملة تسويقية",
  "إنتاج محتوى",
  "تصويرة ومونتاج",
  "استشارة استراتيجية",
  "أخرى",
];

const budgets = [
  "أقل من 5,000 ر.س",
  "5,000 – 15,000 ر.س",
  "15,000 – 50,000 ر.س",
  "أكثر من 50,000 ر.س",
  "لم أحدد بعد",
];

const Request = () => {
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState<CreateRequestDTO & { phone: string; selectedServices: string[] }>({
    guest_name: "",
    guest_email: "",
    guest_phone: "",
    phone: "",
    project_type: "",
    budget: "",
    details: "",
    service_ids: [],
    selectedServices: [],
  });

  const { data: services = [] } = useQuery({
    queryKey: ["services-active"],
    queryFn: () => servicesService.getServices(true),
  });

  const submitMutation = useMutation({
    mutationFn: () =>
      requestsService.submitRequest({
        guest_name: form.guest_name,
        guest_email: form.guest_email,
        guest_phone: form.guest_phone || undefined,
        project_type: form.project_type,
        budget: form.budget || undefined,
        details: form.details,
        service_ids: form.selectedServices,
      }),
    onSuccess: () => setSubmitted(true),
    onError: (err: Error) => toast.error(err.message || "حدث خطأ أثناء إرسال الطلب. حاول مرة أخرى."),
  });

  const steps = [
    { label: "معلوماتك", icon: User },
    { label: "المشروع", icon: MessageSquare },
    { label: "الخدمات", icon: Check },
    { label: "التفاصيل", icon: MessageSquare },
  ];

  const canNext =
    step === 0 ? form.guest_name.trim() && form.guest_email.trim() && form.guest_email.includes("@") :
    step === 1 ? !!form.project_type :
    step === 2 ? true : // services optional
    form.details.trim().length >= 10;

  const toggleService = (slug: string) => {
    setForm(f => ({
      ...f,
      selectedServices: f.selectedServices.includes(slug)
        ? f.selectedServices.filter(s => s !== slug)
        : [...f.selectedServices, slug],
    }));
  };

  if (submitted) {
    return (
      <>
        <Navbar />
        <main className="flex min-h-screen items-center justify-center pt-20 pb-20">
          <ScrollReveal className="text-center max-w-md mx-auto px-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", bounce: 0.5 }}
              className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10"
            >
              <Check size={40} className="text-primary" />
            </motion.div>
            <h2 className="mb-3 text-3xl font-bold text-foreground">تم إرسال طلبك بنجاح! 🎉</h2>
            <p className="text-muted-foreground mb-2">
              شكراً <span className="font-semibold text-foreground">{form.guest_name}</span>، فريقنا سيتواصل معك قريباً على{" "}
              <span className="font-semibold text-primary">{form.guest_email}</span>
            </p>
            <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
              يمكنك لاحقاً إنشاء حساب بنفس البريد الإلكتروني لمتابعة مشروعك
              والاطلاع على حالته بشكل مباشر.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/signup"
                className="rounded-xl bg-gradient-brand px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/20 hover:shadow-xl transition-all"
              >
                إنشاء حساب الآن
              </Link>
              <Link
                to="/"
                className="rounded-xl border border-border/60 px-8 py-3 text-sm font-medium hover:bg-secondary/50 transition-all"
              >
                العودة للرئيسية
              </Link>
            </div>
          </ScrollReveal>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="flex min-h-screen items-center justify-center pt-24 pb-20" dir="rtl">
        <div className="container mx-auto max-w-xl px-6">
          <ScrollReveal className="mb-10 text-center">
            <span className="mb-3 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary">
              ابدأ رحلتك معنا
            </span>
            <h1 className="mb-3 text-3xl font-bold text-foreground sm:text-4xl">أخبرنا عن مشروعك</h1>
            <p className="text-muted-foreground">لا تحتاج لحساب – أرسل طلبك مباشرة وسنتواصل معك</p>
          </ScrollReveal>

          {/* Progress bar */}
          <div className="mb-8 flex items-center justify-center gap-1.5">
            {steps.map((s, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all duration-500",
                  i < step ? "bg-primary text-white" :
                  i === step ? "bg-primary text-white shadow-lg shadow-primary/30" :
                  "border border-border text-muted-foreground"
                )}>
                  {i < step ? <Check size={13} /> : i + 1}
                </div>
                <span className={cn(
                  "hidden text-xs sm:block transition-colors",
                  i <= step ? "text-foreground font-medium" : "text-muted-foreground"
                )}>
                  {s.label}
                </span>
                {i < steps.length - 1 && (
                  <div className={cn(
                    "h-px w-6 sm:w-10 transition-colors duration-500",
                    i < step ? "bg-primary" : "bg-border"
                  )} />
                )}
              </div>
            ))}
          </div>

          {/* Form card */}
          <div className="rounded-2xl border border-border/40 bg-card p-7 shadow-sm">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20, filter: "blur(4px)" }}
                animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, x: -20, filter: "blur(4px)" }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* Step 0: Contact Info */}
                {step === 0 && (
                  <div className="space-y-5">
                    <div>
                      <h3 className="font-semibold text-base mb-4">معلومات التواصل</h3>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-foreground">
                          الاسم الكامل *
                        </label>
                        <div className="relative">
                          <User className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <input
                            value={form.guest_name}
                            onChange={e => setForm(f => ({ ...f, guest_name: e.target.value }))}
                            className="w-full rounded-xl border border-border/50 bg-background pe-4 ps-10 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/15 transition-all"
                            placeholder="اسمك الكامل"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-foreground">
                          البريد الإلكتروني *
                        </label>
                        <div className="relative">
                          <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <input
                            type="email"
                            value={form.guest_email}
                            onChange={e => setForm(f => ({ ...f, guest_email: e.target.value }))}
                            className="w-full rounded-xl border border-border/50 bg-background pe-4 ps-10 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/15 transition-all"
                            placeholder="email@example.com"
                            dir="ltr"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-foreground">
                          رقم الهاتف <span className="text-muted-foreground font-normal">(اختياري)</span>
                        </label>
                        <div className="relative">
                          <Phone className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <input
                            type="tel"
                            value={form.guest_phone}
                            onChange={e => setForm(f => ({ ...f, guest_phone: e.target.value }))}
                            className="w-full rounded-xl border border-border/50 bg-background pe-4 ps-10 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/15 transition-all"
                            placeholder="+966 5XXXXXXXX"
                            dir="ltr"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="rounded-xl bg-primary/5 border border-primary/15 p-3 text-xs text-muted-foreground">
                      💡 يمكنك لاحقاً تحويل هذا الطلب لحساب باستخدام نفس البريد الإلكتروني لمتابعة مشروعك
                    </div>
                  </div>
                )}

                {/* Step 1: Project Type & Budget */}
                {step === 1 && (
                  <div className="space-y-6">
                    <div>
                      <label className="mb-3 block text-sm font-medium text-foreground">نوع المشروع *</label>
                      <div className="grid grid-cols-2 gap-2.5">
                        {projectTypes.map(type => (
                          <button
                            key={type}
                            onClick={() => setForm(f => ({ ...f, project_type: type }))}
                            className={cn(
                              "rounded-xl border px-4 py-3 text-sm transition-all duration-200 active:scale-95 text-right",
                              form.project_type === type
                                ? "border-primary bg-primary/10 text-primary font-medium"
                                : "border-border/50 text-muted-foreground hover:border-primary/30 hover:bg-secondary/50"
                            )}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="mb-3 block text-sm font-medium text-foreground">
                        الميزانية التقريبية <span className="text-muted-foreground font-normal">(اختياري)</span>
                      </label>
                      <div className="grid grid-cols-1 gap-2">
                        {budgets.map(b => (
                          <button
                            key={b}
                            onClick={() => setForm(f => ({ ...f, budget: b }))}
                            className={cn(
                              "rounded-xl border px-4 py-2.5 text-sm transition-all duration-200 active:scale-95 text-right",
                              form.budget === b
                                ? "border-primary bg-primary/10 text-primary font-medium"
                                : "border-border/50 text-muted-foreground hover:border-primary/30"
                            )}
                          >
                            {b}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Services multi-select */}
                {step === 2 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">الخدمات المطلوبة</label>
                      <p className="text-xs text-muted-foreground mb-3">اختر الخدمات التي تريدها – يمكنك تعديلها لاحقاً</p>
                    </div>
                    {services.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8 text-sm">جاري تحميل الخدمات...</p>
                    ) : (
                      <div className="grid grid-cols-2 gap-2 max-h-72 overflow-y-auto rounded-xl border border-border/40 p-3">
                        {services.map(svc => {
                          const selected = form.selectedServices.includes(svc.slug);
                          return (
                            <button
                              key={svc.id}
                              onClick={() => toggleService(svc.slug)}
                              className={cn(
                                "flex flex-col items-start gap-0.5 rounded-lg border p-3 text-right transition-all text-sm",
                                selected
                                  ? "border-primary bg-primary/10 text-primary"
                                  : "border-border/50 hover:border-primary/30 hover:bg-secondary/40"
                              )}
                            >
                              <span className="font-medium">{svc.title_ar}</span>
                              <span className="text-xs text-muted-foreground">{svc.title_en}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                    {form.selectedServices.length > 0 && (
                      <p className="text-xs text-primary">
                        ✓ اخترت {form.selectedServices.length} خدمة
                      </p>
                    )}
                  </div>
                )}

                {/* Step 3: Details */}
                {step === 3 && (
                  <div className="space-y-4">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-foreground">
                        تفاصيل المشروع *
                      </label>
                      <textarea
                        value={form.details}
                        onChange={e => setForm(f => ({ ...f, details: e.target.value }))}
                        rows={7}
                        className="w-full rounded-xl border border-border/50 bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/15 transition-all resize-none"
                        placeholder="أخبرنا عن مشروعك بالتفصيل... ما هو هدفه؟ من جمهورك المستهدف؟ هل لديك مرجع أو تصور مسبق؟"
                      />
                      <p className="mt-1.5 text-xs text-muted-foreground">
                        {form.details.length}/10 حرف كحد أدنى
                      </p>
                    </div>

                    {/* Summary card */}
                    <div className="rounded-xl border border-border/40 bg-secondary/20 p-4 space-y-2 text-sm">
                      <p className="font-medium text-foreground text-xs mb-2">ملخص طلبك:</p>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                        <span className="text-muted-foreground">الاسم:</span>
                        <span className="font-medium">{form.guest_name}</span>
                        <span className="text-muted-foreground">البريد:</span>
                        <span className="font-medium" dir="ltr">{form.guest_email}</span>
                        {form.guest_phone && (
                          <>
                            <span className="text-muted-foreground">الهاتف:</span>
                            <span className="font-medium" dir="ltr">{form.guest_phone}</span>
                          </>
                        )}
                        <span className="text-muted-foreground">نوع المشروع:</span>
                        <span className="font-medium">{form.project_type}</span>
                        {form.budget && (
                          <>
                            <span className="text-muted-foreground">الميزانية:</span>
                            <span className="font-medium">{form.budget}</span>
                          </>
                        )}
                        {form.selectedServices.length > 0 && (
                          <>
                            <span className="text-muted-foreground">الخدمات:</span>
                            <span className="font-medium">{form.selectedServices.length} خدمة</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="mt-8 flex items-center justify-between">
              <button
                onClick={() => setStep(s => s - 1)}
                disabled={step === 0 || submitMutation.isPending}
                className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground disabled:opacity-0"
              >
                <ArrowRight size={14} /> السابق
              </button>

              {step < steps.length - 1 ? (
                <button
                  onClick={() => {
                    if (!canNext) return toast.error("يرجى إكمال الحقول المطلوبة");
                    setStep(s => s + 1);
                  }}
                  className="flex items-center gap-2 rounded-xl bg-gradient-brand px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-all hover:shadow-xl active:scale-[0.97] disabled:opacity-60"
                >
                  التالي <ArrowLeft size={14} />
                </button>
              ) : (
                <button
                  onClick={() => {
                    if (!canNext) return toast.error("يرجى كتابة تفاصيل المشروع (10 أحرف كحد أدنى)");
                    submitMutation.mutate();
                  }}
                  disabled={submitMutation.isPending}
                  className="flex items-center gap-2 rounded-xl bg-gradient-brand px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-all hover:shadow-xl disabled:opacity-60 active:scale-[0.97]"
                >
                  {submitMutation.isPending ? (
                    <><Loader2 size={14} className="animate-spin" /> جاري الإرسال...</>
                  ) : (
                    <>إرسال الطلب <Check size={14} /></>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Request;
