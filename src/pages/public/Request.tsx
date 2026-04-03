import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, ArrowRight, Check, Loader2, Phone, Mail, User,
  MessageSquare, ChevronsUpDown, X
} from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/ScrollReveal";
import { toast } from "sonner";
import { useMutation, useQuery } from "@tanstack/react-query";
import { requestsService, CreateRequestDTO } from "@/services/requestsService";
import { servicesService } from "@/services/servicesService";
import { Service } from "@/types/portfolio";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

// ─── Static project types ─────────────────────────────
const PROJECT_TYPES = [
  "تصميم هوية بصرية",
  "تطوير موقع ويب",
  "تطبيق جوال",
  "حملة تسويقية",
  "إنتاج محتوى",
  "تصوير ومونتاج",
  "استشارة استراتيجية",
  "أخرى",
];

const BUDGETS = [
  "أقل من 5,000 ر.س",
  "5,000 – 15,000 ر.س",
  "15,000 – 50,000 ر.س",
  "أكثر من 50,000 ر.س",
  "لم أحدد بعد",
];

// ─── Multi-select dropdown component ─────────────────
function ServicesMultiSelect({
  services,
  selected,
  onChange,
}: {
  services: Service[];
  selected: string[];
  onChange: (slugs: string[]) => void;
}) {
  const [open, setOpen] = useState(false);

  const toggle = (slug: string) => {
    onChange(
      selected.includes(slug)
        ? selected.filter((s) => s !== slug)
        : [...selected, slug]
    );
  };

  const selectedServices = services.filter((s) => selected.includes(s.slug));

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              "flex min-h-[44px] w-full items-center justify-between rounded-xl border border-border/50 bg-background px-4 py-2 text-sm transition-all",
              "hover:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/15",
              open && "border-primary/50 ring-2 ring-primary/15"
            )}
          >
            <span className={selected.length === 0 ? "text-muted-foreground" : "text-foreground"}>
              {selected.length === 0
                ? "اختر الخدمات المطلوبة..."
                : `${selected.length} ${selected.length === 1 ? "خدمة مختارة" : "خدمات مختارة"}`}
            </span>
            <ChevronsUpDown className="h-4 w-4 text-muted-foreground shrink-0" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start" dir="rtl" style={{ width: "var(--radix-popover-trigger-width)" }}>
          <Command dir="rtl">
            <CommandInput placeholder="ابحث عن خدمة..." className="h-9" />
            <CommandList>
              <CommandEmpty>لا توجد خدمات</CommandEmpty>
              <CommandGroup>
                {services.map((svc) => {
                  const isSelected = selected.includes(svc.slug);
                  return (
                    <CommandItem
                      key={svc.id}
                      value={svc.title_ar}
                      onSelect={() => toggle(svc.slug)}
                      className="flex items-center gap-3 cursor-pointer"
                    >
                      <div className={cn(
                        "flex h-5 w-5 items-center justify-center rounded border transition-colors shrink-0",
                        isSelected ? "border-primary bg-primary text-white" : "border-border"
                      )}>
                        {isSelected && <Check className="h-3 w-3" />}
                      </div>
                      <div className="flex-1 text-right">
                        <p className="text-sm font-medium">{svc.title_ar}</p>
                        <p className="text-xs text-muted-foreground">{svc.title_en}</p>
                      </div>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Selected tags */}
      {selectedServices.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selectedServices.map((svc) => (
            <span
              key={svc.id}
              className="inline-flex items-center gap-1 rounded-lg bg-primary/10 text-primary text-xs px-2.5 py-1 font-medium"
            >
              {svc.title_ar}
              <button
                type="button"
                onClick={() => toggle(svc.slug)}
                className="hover:text-destructive transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────
const Request = () => {
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    guest_name: "",
    guest_email: "",
    guest_phone: "",
    project_type: "",
    project_type_custom: "", // used when "أخرى" selected
    budget: "",
    details: "",
    selectedServices: [] as string[],
  });

  const { data: services = [], isLoading: loadingServices } = useQuery({
    queryKey: ["services-active"],
    queryFn: () => servicesService.getServices(true),
  });

  const submitMutation = useMutation({
    mutationFn: () => {
      const finalType =
        form.project_type === "أخرى" && form.project_type_custom.trim()
          ? form.project_type_custom.trim()
          : form.project_type;

      const payload: CreateRequestDTO = {
        guest_name: form.guest_name.trim(),
        guest_email: form.guest_email.trim(),
        guest_phone: form.guest_phone.trim() || undefined,
        project_type: finalType,
        budget: form.budget || undefined,
        details: form.details.trim(),
        service_ids: form.selectedServices,
      };
      return requestsService.submitRequest(payload);
    },
    onSuccess: () => setSubmitted(true),
    onError: (err: Error) =>
      toast.error(err.message || "حدث خطأ أثناء الإرسال. حاول مرة أخرى."),
  });

  // Step labels
  const steps = [
    { label: "معلوماتك", icon: User },
    { label: "المشروع", icon: MessageSquare },
    { label: "التفاصيل", icon: Check },
  ];

  const effectiveType =
    form.project_type === "أخرى" ? form.project_type_custom : form.project_type;

  const canNext =
    step === 0
      ? form.guest_name.trim() && form.guest_email.includes("@")
      : step === 1
      ? !!form.project_type && (form.project_type !== "أخرى" || form.project_type_custom.trim().length > 0)
      : form.details.trim().length >= 10;

  // ── Success screen ──────────────────────────────────
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
            <h2 className="mb-3 text-3xl font-bold text-foreground">تم إرسال طلبك! 🎉</h2>
            <p className="text-muted-foreground mb-2">
              شكراً <span className="font-semibold text-foreground">{form.guest_name}</span>، سيتواصل معك فريقنا على{" "}
              <span className="font-semibold text-primary dir-ltr">{form.guest_email}</span>
            </p>
            <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
              أنشئ حساباً بنفس البريد لمتابعة تقدم مشروعك مباشرة من لوحتك الشخصية.
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

  // ── Form ────────────────────────────────────────────
  return (
    <>
      <Navbar />
      <main className="flex min-h-screen items-center justify-center pt-24 pb-20" dir="rtl">
        <div className="container mx-auto max-w-lg px-6">
          <ScrollReveal className="mb-10 text-center">
            <span className="mb-3 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary">
              ابدأ رحلتك معنا
            </span>
            <h1 className="mb-3 text-3xl font-bold text-foreground sm:text-4xl">أخبرنا عن مشروعك</h1>
            <p className="text-muted-foreground">لا تحتاج لحساب – أرسل طلبك مباشرة</p>
          </ScrollReveal>

          {/* Progress */}
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
                )}>{s.label}</span>
                {i < steps.length - 1 && (
                  <div className={cn("h-px w-8 sm:w-12 transition-colors duration-500", i < step ? "bg-primary" : "bg-border")} />
                )}
              </div>
            ))}
          </div>

          {/* Card */}
          <div className="rounded-2xl border border-border/40 bg-card p-7 shadow-sm">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20, filter: "blur(4px)" }}
                animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, x: -20, filter: "blur(4px)" }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* ── Step 0: Contact ── */}
                {step === 0 && (
                  <div className="space-y-5">
                    <h3 className="font-semibold">معلومات التواصل</h3>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium">الاسم الكامل *</label>
                      <div className="relative">
                        <User className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                          value={form.guest_name}
                          onChange={e => setForm(f => ({ ...f, guest_name: e.target.value }))}
                          className="w-full rounded-xl border border-border/50 bg-background ps-4 pe-10 py-3 text-sm focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/15 transition-all"
                          placeholder="اسمك الكامل"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium">البريد الإلكتروني *</label>
                      <div className="relative">
                        <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                          type="email"
                          value={form.guest_email}
                          onChange={e => setForm(f => ({ ...f, guest_email: e.target.value }))}
                          className="w-full rounded-xl border border-border/50 bg-background ps-4 pe-10 py-3 text-sm focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/15 transition-all"
                          placeholder="email@example.com"
                          dir="ltr"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium">
                        رقم الهاتف <span className="text-muted-foreground font-normal">(اختياري)</span>
                      </label>
                      <div className="relative">
                        <Phone className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                          type="tel"
                          value={form.guest_phone}
                          onChange={e => setForm(f => ({ ...f, guest_phone: e.target.value }))}
                          className="w-full rounded-xl border border-border/50 bg-background ps-4 pe-10 py-3 text-sm focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/15 transition-all"
                          placeholder="+966 5XXXXXXXX"
                          dir="ltr"
                        />
                      </div>
                    </div>

                    <div className="rounded-xl bg-primary/5 border border-primary/15 p-3 text-xs text-muted-foreground">
                      💡 أنشئ حساباً لاحقاً بنفس البريد لمتابعة مشروعك مباشرة
                    </div>
                  </div>
                )}

                {/* ── Step 1: Project type + Services + Budget ── */}
                {step === 1 && (
                  <div className="space-y-6">
                    {/* Project type */}
                    <div>
                      <label className="mb-3 block text-sm font-medium">نوع المشروع *</label>
                      <div className="grid grid-cols-2 gap-2">
                        {PROJECT_TYPES.map(type => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => setForm(f => ({ ...f, project_type: type, project_type_custom: "" }))}
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

                      {/* "Other" free-text */}
                      <AnimatePresence>
                        {form.project_type === "أخرى" && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-3 overflow-hidden"
                          >
                            <input
                              autoFocus
                              value={form.project_type_custom}
                              onChange={e => setForm(f => ({ ...f, project_type_custom: e.target.value }))}
                              className="w-full rounded-xl border border-primary/40 bg-background px-4 py-3 text-sm focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/15 transition-all"
                              placeholder="صِف نوع مشروعك..."
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Services dropdown */}
                    <div>
                      <label className="mb-2 block text-sm font-medium">
                        الخدمات المطلوبة <span className="text-muted-foreground font-normal">(اختياري)</span>
                      </label>
                      {loadingServices ? (
                        <div className="flex items-center gap-2 rounded-xl border border-border/50 px-4 py-3 text-sm text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin" /> جاري تحميل الخدمات...
                        </div>
                      ) : (
                        <ServicesMultiSelect
                          services={services}
                          selected={form.selectedServices}
                          onChange={slugs => setForm(f => ({ ...f, selectedServices: slugs }))}
                        />
                      )}
                    </div>

                    {/* Budget */}
                    <div>
                      <label className="mb-2 block text-sm font-medium">
                        الميزانية التقريبية <span className="text-muted-foreground font-normal">(اختياري)</span>
                      </label>
                      <div className="grid grid-cols-1 gap-2">
                        {BUDGETS.map(b => (
                          <button
                            key={b}
                            type="button"
                            onClick={() => setForm(f => ({ ...f, budget: f.budget === b ? "" : b }))}
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

                {/* ── Step 2: Details + Summary ── */}
                {step === 2 && (
                  <div className="space-y-5">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium">تفاصيل المشروع *</label>
                      <p className="text-xs text-muted-foreground mb-2">
                        أخبرنا بأكثر ما تستطيع — ما هو هدف المشروع؟ من هو جمهورك؟ أي متطلبات خاصة؟
                      </p>
                      <textarea
                        value={form.details}
                        onChange={e => setForm(f => ({ ...f, details: e.target.value }))}
                        rows={6}
                        className="w-full rounded-xl border border-border/50 bg-background px-4 py-3 text-sm focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/15 transition-all resize-none"
                        placeholder="مثال: أحتاج موقع إلكتروني لمتجر ملابس يدعم الدفع الإلكتروني، يستهدف جمهور شباب 18-30..."
                      />
                      <p className="mt-1 text-xs text-muted-foreground text-left" dir="ltr">
                        {form.details.length} / 10 min chars
                      </p>
                    </div>

                    {/* Summary */}
                    <div className="rounded-xl border border-border/40 bg-secondary/20 p-4 space-y-3 text-sm">
                      <p className="font-semibold text-xs text-muted-foreground uppercase tracking-wide">ملخص طلبك</p>
                      <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-xs">
                        <span className="text-muted-foreground">الاسم</span>
                        <span className="font-medium">{form.guest_name || "—"}</span>

                        <span className="text-muted-foreground">البريد</span>
                        <span className="font-medium" dir="ltr">{form.guest_email || "—"}</span>

                        {form.guest_phone && (
                          <>
                            <span className="text-muted-foreground">الهاتف</span>
                            <span className="font-medium" dir="ltr">{form.guest_phone}</span>
                          </>
                        )}

                        <span className="text-muted-foreground">نوع المشروع</span>
                        <span className="font-medium">{effectiveType || "—"}</span>

                        {form.budget && (
                          <>
                            <span className="text-muted-foreground">الميزانية</span>
                            <span className="font-medium">{form.budget}</span>
                          </>
                        )}

                        {form.selectedServices.length > 0 && (
                          <>
                            <span className="text-muted-foreground">الخدمات</span>
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
                type="button"
                onClick={() => setStep(s => s - 1)}
                disabled={step === 0 || submitMutation.isPending}
                className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground disabled:opacity-0 transition-colors"
              >
                <ArrowRight size={14} /> السابق
              </button>

              {step < steps.length - 1 ? (
                <button
                  type="button"
                  onClick={() => {
                    if (!canNext) {
                      toast.error(step === 0 ? "يرجى إدخال الاسم والبريد الإلكتروني" : "يرجى اختيار نوع المشروع");
                      return;
                    }
                    setStep(s => s + 1);
                  }}
                  className="flex items-center gap-2 rounded-xl bg-gradient-brand px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/20 hover:shadow-xl transition-all active:scale-[0.97]"
                >
                  التالي <ArrowLeft size={14} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    if (!canNext) {
                      toast.error("يرجى كتابة تفاصيل المشروع (10 أحرف كحد أدنى)");
                      return;
                    }
                    submitMutation.mutate();
                  }}
                  disabled={submitMutation.isPending}
                  className="flex items-center gap-2 rounded-xl bg-gradient-brand px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/20 hover:shadow-xl transition-all disabled:opacity-60 active:scale-[0.97]"
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
