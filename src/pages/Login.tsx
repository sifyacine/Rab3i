import { useState, type CSSProperties } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useQueryClient } from "@tanstack/react-query";
import { getLoginErrorMessage } from "@/lib/authErrors";

const AUTH_REQUEST_TIMEOUT_MS = 15000;

const withAuthTimeout = async <T,>(promise: Promise<T>, timeoutMessage: string): Promise<T> => {
  let timeoutHandle: ReturnType<typeof setTimeout> | undefined;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutHandle = setTimeout(() => {
      reject(new Error(timeoutMessage));
    }, AUTH_REQUEST_TIMEOUT_MS);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timeoutHandle) {
      clearTimeout(timeoutHandle);
    }
  }
};

type LoginAuthResult = {
  data: {
    user: {
      id: string;
      user_metadata?: {
        role?: "admin" | "client";
      };
    } | null;
  };
  error: {
    message: string;
  } | null;
};

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  // Get the redirect path from state, or default based on role
  const from = location.state?.from?.pathname || null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("يرجى إدخال البريد الإلكتروني وكلمة المرور");
      return;
    }

    if (!supabase) {
      toast.error("الخدمة غير متاحة حالياً");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await withAuthTimeout<LoginAuthResult>(
        supabase.auth.signInWithPassword({
          email,
          password,
        }),
        "LOGIN_TIMEOUT"
      );

      if (error) {
        toast.error(getLoginErrorMessage(error.message));
        return;
      }

      if (!data.user) {
        toast.error("حدث خطأ غير متوقع، يرجى المحاولة مجدداً");
        return;
      }

      queryClient.clear();
      toast.success("تم تسجيل الدخول بنجاح");

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

      const role = profile?.role ?? data.user.user_metadata?.role ?? "client";

      navigate(from ?? (role === "admin" ? "/admin" : "/portal"), { replace: true });
    } catch (error) {
      if (error instanceof Error && error.message === "LOGIN_TIMEOUT") {
        toast.error("استغرقت العملية وقتاً طويلاً. تحقق من الاتصال وحاول مرة أخرى.");
      } else {
        toast.error("حدث خطأ غير متوقع، يرجى المحاولة مجدداً");
      }
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
            <Link to="/" className="mb-6 flex flex-col items-center justify-center">
              <img src="/Logo Arabic Version 02.png" alt="ربيعي" className="h-16 w-auto" />
            </Link>
            <h1 className="text-xl font-bold text-foreground">تسجيل الدخول</h1>
            <p className="mt-2 text-sm text-muted-foreground">ادخل إلى لوحة التحكم أو بوابة العملاء</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="login-email" className="mb-2 block text-sm font-medium text-foreground/80">البريد الإلكتروني</label>
              <div className="relative">
                <Mail size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="login-email"
                  name="email"
                  autoComplete="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-border/50 bg-secondary/50 py-3 pr-10 pl-4 text-sm text-foreground outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label htmlFor="login-password" className="block text-sm font-medium text-foreground/80">كلمة المرور</label>
                <Link 
                  to="/forgot-password"
                  className="text-xs text-primary hover:underline transition-all"
                >
                  نسيت كلمة المرور؟
                </Link>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="login-password"
                  name="password"
                  autoComplete="current-password"
                  type={showPass ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ WebkitTextSecurity: showPass ? "none" : "disc" } as CSSProperties}
                  className="w-full rounded-xl border border-border/50 bg-secondary/50 py-3 pr-10 pl-10 text-sm text-foreground outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground"
                  placeholder={showPass ? "أدخل كلمة المرور" : "••••••••"}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  aria-label={showPass ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-brand py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-all duration-300 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.97] disabled:opacity-60"
            >
              {loading ? (
                <>
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  <span>جارٍ تسجيل الدخول...</span>
                </>
              ) : (
                <>
                  تسجيل الدخول
                  <ArrowLeft size={16} className="transition-transform duration-300 group-hover:-translate-x-1" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              ليس لديك حساب؟{" "}
              <Link to="/signup" className="font-semibold text-primary hover:underline">
                أنشئ حساباً جديداً
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
