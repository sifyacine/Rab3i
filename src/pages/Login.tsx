import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useQueryClient } from "@tanstack/react-query";

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

    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        let errorMsg = "خطأ في تسجيل الدخول";
        const msg = error.message.toLowerCase();
        
        if (msg.includes("invalid login credentials")) {
          errorMsg = "البريد الإلكتروني أو كلمة المرور غير صحيحة";
        } else if (msg.includes("email not confirmed")) {
          errorMsg = "يرجى تأكيد البريد الإلكتروني الخاص بك";
        } else if (msg.includes("rate limit")) {
          errorMsg = "لقد تجاوزت الحد المسموح به من المحاولات، يرجى المحاولة لاحقاً";
        } else {
          errorMsg = error.message;
        }
        
        toast.error(errorMsg);
        throw error;
      }

      if (data.user) {
        // Clear stale query data
        queryClient.clear();
        
        toast.success("تم تسجيل الدخول بنجاح");
        
        // Fetch role to determine redirection
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .single();

        let role = profile?.role;
        
        // Fallback to metadata if profile is not found
        if (!role && data.user.user_metadata?.role) {
          role = data.user.user_metadata.role;
        }
        
        role = role || "client";
        
        // Wait a bit for AuthContext to fully update before navigation
        // This prevents race conditions with protected routes
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Redirect logic
        if (from) {
          navigate(from, { replace: true });
        } else {
          navigate(role === "admin" ? "/admin" : "/portal", { replace: true });
        }
      }
    } catch (err: any) {
      console.error("Login Error:", err);
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

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="block text-sm font-medium text-foreground/80">كلمة المرور</label>
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
                  type={showPass ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-border/50 bg-secondary/50 py-3 pr-10 pl-10 text-sm text-foreground outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
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
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
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

