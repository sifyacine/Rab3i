import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowRight, Send, MailCheck } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { buildAuthRedirectUrl } from "@/lib/authRedirect";
import { AuthShell, AuthField, AuthSubmit } from "@/components/auth/AuthShell";

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

  const backLink = (
    <div className="border-t border-border/40 pt-6 text-center">
      <Link
        to="/login"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-all hover:text-foreground"
      >
        <ArrowRight size={16} />
        العودة لتسجيل الدخول
      </Link>
    </div>
  );

  if (submitted) {
    return (
      <AuthShell title="تحقّق من بريدك" subtitle="أرسلنا رابط استعادة كلمة المرور إن كان الحساب موجوداً" footer={backLink}>
        <div className="flex flex-col items-center gap-4 py-4 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20">
            <MailCheck size={30} />
          </span>
          <p className="text-sm leading-relaxed text-muted-foreground">
            افتح الرابط المُرسَل إلى <span className="font-semibold text-foreground" dir="ltr">{email}</span> لتعيين
            كلمة مرور جديدة. تحقّق من مجلد الرسائل غير المرغوب فيها إن لم تجده.
          </p>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="استعادة كلمة المرور"
      subtitle="أدخل بريدك الإلكتروني وسنرسل لك رابطاً لتعيين كلمة مرور جديدة"
      footer={backLink}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <AuthField
          id="forgot-email"
          name="email"
          type="email"
          label="البريد الإلكتروني"
          icon={Mail}
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@example.com"
        />

        <AuthSubmit loading={loading} loadingText="جارٍ الإرسال..." icon={Send}>
          إرسال رابط الاستعادة
        </AuthSubmit>
      </form>
    </AuthShell>
  );
};

export default ForgotPassword;
