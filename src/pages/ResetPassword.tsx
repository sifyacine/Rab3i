import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff, ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

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
  const [showPass, setShowPass] = useState(false);
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

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!cancelled && !session) {
        // No session now — let the timer handle redirect if still missing after 3s
      }
    });

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

      const { error } = await supabase.auth.updateUser({
        password: password
      });

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
          <div className="mb-6 text-center">
            <Link to="/" className="mb-4 flex flex-col items-center justify-center">
              <img src="/Logo Arabic Version 02.png" alt="ربيعي" className="h-14 w-auto" />
            </Link>
            <h1 className="text-xl font-bold text-foreground">تعيين كلمة مرور جديدة</h1>
            <p className="mt-2 text-sm text-muted-foreground">أدخل كلمة المرور الجديدة الخاصة بك أدناه</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground/80">كلمة المرور الجديدة</label>
              <div className="relative">
                <Lock size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type={showPass ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-border/50 bg-secondary/50 py-2.5 pr-10 pl-10 text-sm text-foreground outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground/80">تأكيد كلمة المرور</label>
              <div className="relative">
                <Lock size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type={showPass ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-xl border border-border/50 bg-secondary/50 py-2.5 pr-10 pl-10 text-sm text-foreground outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-brand py-3 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-all duration-300 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.97] disabled:opacity-60"
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <>
                  تحديث كلمة المرور
                  <Save size={16} className="transition-transform duration-300 group-hover:-translate-x-1" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-border/40 pt-6">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-all"
            >
              <ArrowLeft size={16} />
              العودة لتسجيل الدخول
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
