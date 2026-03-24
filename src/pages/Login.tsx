import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@rabii.sa");
  const [password, setPassword] = useState("admin123");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Mock auth — just validate non-empty
    setTimeout(() => {
      if (email && password) {
        const role = email.includes("admin") ? "admin" : "client";
        const authKey = role === "admin" ? "rabii_mock_auth" : "rabii_portal_auth";
        localStorage.setItem(authKey, JSON.stringify({ email, role }));
        toast.success("تم تسجيل الدخول بنجاح");
        navigate(role === "admin" ? "/admin" : "/portal");
      } else {
        toast.error("يرجى إدخال البريد الإلكتروني وكلمة المرور");
      }
      setLoading(false);
    }, 800);
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-border/50 bg-secondary/50 py-3 pr-10 pl-4 text-sm text-foreground outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                  placeholder="admin@rabii.sa"
                />
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="block text-sm font-medium text-foreground/80">كلمة المرور</label>
                <button 
                  type="button" 
                  onClick={() => toast.info("سيتم إرسال رابط استعادة كلمة المرور لبريدك قريباً")}
                  className="text-xs text-primary hover:underline transition-all"
                >
                  نسيت كلمة المرور؟
                </button>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type={showPass ? "text" : "password"}
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

            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                id="remember" 
                className="h-4 w-4 rounded border-border/50 bg-secondary/50 accent-primary"
              />
              <label htmlFor="remember" className="text-xs text-muted-foreground cursor-pointer select-none">
                تذكرني على هذا الجهاز
              </label>
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

          <div className="mt-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-border/50" />
            <span className="text-xs text-muted-foreground">أو</span>
            <div className="h-px flex-1 bg-border/50" />
          </div>

          <button className="mt-4 flex w-full items-center justify-center gap-3 rounded-xl border border-border/50 bg-secondary/30 py-3 text-sm font-medium text-foreground transition-all hover:bg-secondary/60 active:scale-[0.97]">
            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            الدخول بحساب Google
          </button>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            ⚠️ هذا نموذج تجريبي — البيانات المعبأة مسبقاً للاختبار فقط
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
