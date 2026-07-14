import { useState } from "react";
import { useNavigate, Link, useLocation, Navigate } from "react-router-dom";
import { Mail, Lock, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useQueryClient } from "@tanstack/react-query";
import { getLoginErrorMessage } from "@/lib/authErrors";
import { normalizeStaffRole } from "@/lib/authSession";
import { useAuth } from "@/contexts/AuthContext";
import { AuthShell, AuthField, AuthSubmit } from "@/components/auth/AuthShell";

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
        role?: string;
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
  const { sessionValid, role: sessionRole, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Get the redirect path from state, or default to the dashboard
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

      // The profiles row is authoritative for roles. Sign out only on a
      // definitive denial (explicit non-staff role, or confirmed missing row);
      // a transient lookup failure is not a verdict — navigate and let
      // AuthContext + ProtectedRoute make the final call.
      let denied = false;
      try {
        const { data: profile, error: profileError } = await withAuthTimeout(
          Promise.resolve(
            supabase.from("profiles").select("role").eq("id", data.user.id).single()
          ),
          "ROLE_TIMEOUT"
        );
        if (profileError) {
          // PGRST116 = zero rows: this account has no staff profile
          denied = profileError.code === "PGRST116";
        } else {
          denied = normalizeStaffRole(profile?.role) === null;
        }
      } catch {
        // Timeout/network error — leave the decision to the route guards
      }

      if (denied) {
        await supabase.auth.signOut();
        toast.error("هذا الحساب لا يملك صلاحية الوصول إلى لوحة التحكم");
        return;
      }

      queryClient.clear();
      toast.success("تم تسجيل الدخول بنجاح");

      navigate(from ?? "/admin", { replace: true });
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

  // Already signed in as staff — no need to show the login form.
  // Never redirect mid-submit: the auth listener can resolve the role while
  // handleSubmit is still running, and unmounting would abort it.
  if (!authLoading && sessionValid && sessionRole && !loading) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <AuthShell title="تسجيل الدخول" subtitle="ادخل إلى لوحة تحكم الفريق">
      <form onSubmit={handleSubmit} className="space-y-5">
        <AuthField
          id="login-email"
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

        <AuthField
          id="login-password"
          name="password"
          type="password"
          label="كلمة المرور"
          icon={Lock}
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          labelAction={
            <Link to="/forgot-password" className="text-xs text-primary transition-all hover:underline">
              نسيت كلمة المرور؟
            </Link>
          }
        />

        <AuthSubmit loading={loading} loadingText="جارٍ تسجيل الدخول..." icon={ArrowLeft}>
          تسجيل الدخول
        </AuthSubmit>
      </form>
    </AuthShell>
  );
};

export default Login;
