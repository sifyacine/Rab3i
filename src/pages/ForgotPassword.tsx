import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, Send } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { buildAuthRedirectUrl } from "@/lib/authRedirect";

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) {
      return message;
    }
  }
  return fallback;
};

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("يرجى إدخال البريد الإلكتروني");
      return;
    }

    setLoading(true);

    try {
      if (!supabase) {
        toast.error("الخدمة غير متاحة حالياً");
        return;
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: buildAuthRedirectUrl("/reset-password"),
      });

      if (error) {
        toast.error(error.message || "خطأ في إرسال طلب استعادة كلمة المرور");
        throw error;
      }

      setSubmitted(true);
      toast.success("تم إرسال تعليمات استعادة كلمة المرور إلى بريدك الإلكتروني");
    } catch (err: unknown) {
      console.error("Reset Password Error:", err);
      toast.error(getErrorMessage(err, "خطأ في إرسال طلب استعادة كلمة المرور"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 animate-gradient bg-gradient-to-br from-[hsl(0,84%,12%)] via-[hsl(350,70%,8%)] to-[hsl(10,60%,10%)] bg-[length:300%_300%]" />

      <motion.div
        initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 mx-4 w-full max-w-md"
      >
        <div className="rounded-2xl border border-border/40 bg-card/80 p-8 backdrop-blur-xl shadow-2xl shadow-black/20">
          <div className="mb-8 text-center">
            <Link to="/login" className="mb-6 flex flex-col items-center justify-center">
              <img src="/Logo Arabic Version 02.png" alt="ربيعي" className="h-16 w-auto" />
            </Link>
            <h1 className="text-xl font-bold text-foreground">استعادة كلمة المرور</h1>
            {!submitted ? (
              <p className="mt-2 text-sm text-muted-foreground">أدخل بريدك الإلكتروني وسنرسل لك رابطاً لتعيين كلمة مرور جديدة</p>
            ) : (
              <p className="mt-2 text-sm text-primary font-medium">تم الإرسال بنجاح! تفقد بريدك الإلكتروني.</p>
            )}
          </div>

          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground/80">البريد الإلكتروني</label>
                <div className="relative">
                  <Mail size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-border/50 bg-secondary/50 py-3 pr-10 pl-4 text-sm text-foreground outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-brand py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-all duration-300 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.97] disabled:opacity-60"
              >
                {loading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <>
                    إرسال رابط الاستعادة
                    <Send size={16} className="transition-transform duration-300 group-hover:-translate-x-1" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
              >
                <ArrowLeft size={16} />
                العودة لتسجيل الدخول
              </Link>
            </div>
          )}

          {!submitted && (
            <div className="mt-8 text-center border-t border-border/40 pt-6">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-all"
              >
                <ArrowLeft size={16} />
                العودة لتسجيل الدخول
              </Link>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
