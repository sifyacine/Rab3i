import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Lock, ArrowRight, Save } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
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

const ResetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!supabase) {
      toast.error("الخدمة غير متاحة حالياً");
      navigate("/forgot-password");
      return;
    }

    // Supabase places the recovery token in the URL hash fragment.
    // getSession() resolves it asynchronously; we give it up to 3 seconds
    // before concluding there's no recovery session.
    let cancelled = false;
    const timer = setTimeout(() => {
      if (!cancelled) {
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (!cancelled && !session) {
            toast.error("انتهت صلاحية الجلسة، يرجى طلب رابط استعادة جديد.");
            navigate("/forgot-password");
          }
        });
      }
    }, 3000);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      toast.error("يرجى إدخال كلمة المرور الجديدة");
      return;
    }
    if (password.length < 6) {
      toast.error("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("كلمتا المرور غير متطابقتين");
      return;
    }

    setLoading(true);

    try {
      if (!supabase) {
        toast.error("الخدمة غير متاحة حالياً");
        navigate("/forgot-password");
        return;
      }

      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        toast.error(error.message || "خطأ في تحديث كلمة المرور");
        throw error;
      }

      toast.success("تم تحديث كلمة المرور بنجاح! يمكنك الآن تسجيل الدخول.");
      navigate("/login");
    } catch (err: unknown) {
      console.error("Reset Password Error:", err);
      toast.error(getErrorMessage(err, "خطأ في تحديث كلمة المرور"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="تعيين كلمة مرور جديدة"
      subtitle="أدخل كلمة المرور الجديدة الخاصة بك أدناه"
      footer={
        <div className="border-t border-border/40 pt-6 text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-all hover:text-foreground"
          >
            <ArrowRight size={16} />
            العودة لتسجيل الدخول
          </Link>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <AuthField
          id="reset-password"
          name="new-password"
          type="password"
          label="كلمة المرور الجديدة"
          icon={Lock}
          autoComplete="new-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
        />

        <AuthField
          id="reset-confirm"
          name="confirm-password"
          type="password"
          label="تأكيد كلمة المرور"
          icon={Lock}
          autoComplete="new-password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="••••••••"
        />

        <AuthSubmit loading={loading} loadingText="جارٍ التحديث..." icon={Save}>
          تحديث كلمة المرور
        </AuthSubmit>
      </form>
    </AuthShell>
  );
};

export default ResetPassword;
