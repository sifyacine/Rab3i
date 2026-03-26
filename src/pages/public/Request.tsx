import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/ScrollReveal";

const projectTypes = ["علامة تجارية", "حملة تسويقية", "إنتاج محتوى", "أخرى"];
const budgets = ["أقل من ٥,٠٠٠ ر.س", "٥,٠٠٠ - ١٥,٠٠٠ ر.س", "١٥,٠٠٠ - ٥٠,٠٠٠ ر.س", "أكثر من ٥٠,٠٠٠ ر.س"];

const Request = () => {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ name: "", email: "", type: "", budget: "", details: "" });
  const [submitted, setSubmitted] = useState(false);

  const steps = [
    { label: "المعلومات", fields: ["name", "email"] },
    { label: "المشروع", fields: ["type", "budget"] },
    { label: "التفاصيل", fields: ["details"] },
  ];

  const canNext =
    step === 0 ? form.name && form.email :
    step === 1 ? form.type && form.budget :
    form.details;

  const handleSubmit = () => setSubmitted(true);

  if (submitted) {
    return (
      <>
        <Navbar />
        <main className="flex min-h-screen items-center justify-center pt-20">
          <ScrollReveal className="text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              <Check size={36} className="text-primary" />
            </div>
            <h2 className="mb-4 text-3xl font-bold text-foreground">تم إرسال طلبك بنجاح!</h2>
            <p className="text-muted-foreground">شكراً لتواصلك معنا، فريقنا سيتواصل معك قريباً</p>
          </ScrollReveal>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="flex min-h-screen items-center justify-center pt-20 pb-20">
        <div className="container mx-auto max-w-xl px-6">
          <ScrollReveal className="mb-12 text-center">
            <h1 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">ابدأ مشروعك</h1>
            <p className="text-muted-foreground">أخبرنا عن مشروعك وسنتواصل معك</p>
          </ScrollReveal>

          {/* Progress */}
          <div className="mb-10 flex items-center justify-center gap-2">
            {steps.map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all duration-500 ${
                    i <= step ? "bg-primary text-white" : "border border-border text-muted-foreground"
                  }`}
                >
                  {i < step ? <Check size={14} /> : i + 1}
                </div>
                <span className={`hidden text-xs sm:block ${i <= step ? "text-foreground" : "text-muted-foreground"}`}>
                  {s.label}
                </span>
                {i < steps.length - 1 && (
                  <div className={`h-px w-8 transition-colors duration-500 ${i < step ? "bg-primary" : "bg-border"}`} />
                )}
              </div>
            ))}
          </div>

          {/* Form steps */}
          <div className="rounded-2xl border border-border/40 bg-card p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20, filter: "blur(4px)" }}
                animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, x: -20, filter: "blur(4px)" }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              >
                {step === 0 && (
                  <div className="space-y-6">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-foreground">الاسم</label>
                      <input
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full rounded-xl border border-border/50 bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        placeholder="اسمك الكامل"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-foreground">البريد الإلكتروني</label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="w-full rounded-xl border border-border/50 bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        placeholder="email@example.com"
                        dir="ltr"
                      />
                    </div>
                  </div>
                )}

                {step === 1 && (
                  <div className="space-y-6">
                    <div>
                      <label className="mb-3 block text-sm font-medium text-foreground">نوع المشروع</label>
                      <div className="grid grid-cols-2 gap-3">
                        {projectTypes.map((type) => (
                          <button
                            key={type}
                            onClick={() => setForm({ ...form, type })}
                            className={`rounded-xl border px-4 py-3 text-sm transition-all duration-300 active:scale-95 ${
                              form.type === type
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border/50 text-muted-foreground hover:border-primary/30"
                            }`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="mb-3 block text-sm font-medium text-foreground">الميزانية</label>
                      <div className="grid grid-cols-2 gap-3">
                        {budgets.map((b) => (
                          <button
                            key={b}
                            onClick={() => setForm({ ...form, budget: b })}
                            className={`rounded-xl border px-4 py-3 text-sm transition-all duration-300 active:scale-95 ${
                              form.budget === b
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border/50 text-muted-foreground hover:border-primary/30"
                            }`}
                          >
                            {b}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div>
                    <label className="mb-2 block text-sm font-medium text-foreground">تفاصيل المشروع</label>
                    <textarea
                      value={form.details}
                      onChange={(e) => setForm({ ...form, details: e.target.value })}
                      rows={6}
                      className="w-full rounded-xl border border-border/50 bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                      placeholder="أخبرنا عن مشروعك بالتفصيل..."
                    />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="mt-8 flex items-center justify-between">
              <button
                onClick={() => setStep(step - 1)}
                disabled={step === 0}
                className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground disabled:opacity-0"
              >
                <ArrowRight size={14} />
                السابق
              </button>

              {step < 2 ? (
                <button
                  onClick={() => setStep(step + 1)}
                  disabled={!canNext}
                  className="flex items-center gap-2 rounded-xl bg-gradient-brand px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-all hover:shadow-xl disabled:opacity-50 active:scale-[0.97]"
                >
                  التالي
                  <ArrowLeft size={14} />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={!canNext}
                  className="flex items-center gap-2 rounded-xl bg-gradient-brand px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-all hover:shadow-xl disabled:opacity-50 active:scale-[0.97]"
                >
                  إرسال الطلب
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
