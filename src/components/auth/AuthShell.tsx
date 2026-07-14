import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, ArrowRight, ClipboardCheck, FolderKanban, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const FEATURES = [
  { icon: ClipboardCheck, title: "المهام والمتابعة", desc: "وزّع المهام على فريقك وتابع إنجازها" },
  { icon: FolderKanban, title: "المشاريع والفواتير", desc: "كل أعمالك في مكان واحد" },
  { icon: Users, title: "إدارة الفريق", desc: "مدراء وموظفون بصلاحيات واضحة" },
];

interface AuthShellProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

/**
 * Shared shell for the login / password pages: an immersive brand panel
 * (dashboard-for-the-team messaging) beside the form, collapsing to a single
 * centred card on mobile. Arabic-first / RTL.
 */
export function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      {/* Animated brand gradient + soft glows */}
      <div className="absolute inset-0 animate-gradient bg-gradient-to-br from-[hsl(0,84%,12%)] via-[hsl(350,70%,8%)] to-[hsl(10,60%,10%)] bg-[length:300%_300%]" />
      <div className="pointer-events-none absolute -top-32 right-1/4 h-96 w-96 rounded-full bg-primary/25 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 left-1/4 h-96 w-96 rounded-full bg-[hsl(230,70%,50%)]/15 blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 grid w-full max-w-4xl overflow-hidden rounded-3xl border border-white/10 bg-card/70 shadow-2xl shadow-black/50 backdrop-blur-2xl lg:grid-cols-2"
      >
        {/* Brand panel (desktop) */}
        <aside className="relative hidden flex-col justify-between overflow-hidden border-l border-white/10 bg-gradient-to-b from-primary/20 via-transparent to-primary/5 p-10 lg:flex">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "linear-gradient(hsl(0 0% 100%) 1px, transparent 1px), linear-gradient(90deg, hsl(0 0% 100%) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />
          <div className="relative">
            <Link to="/">
              <img src="/Logo Arabic Version 02.png" alt="ربيعي" className="h-12 w-auto" />
            </Link>
          </div>

          <div className="relative space-y-7">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold leading-relaxed text-white">لوحة تحكم فريق ربيعي</h2>
              <p className="text-sm leading-relaxed text-white/65">
                أدر المشاريع والمهام والفريق من منصة واحدة — للمدراء والموظفين.
              </p>
            </div>
            <ul className="space-y-4">
              {FEATURES.map((f) => (
                <li key={f.title} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white ring-1 ring-white/10">
                    <f.icon size={18} />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-white">{f.title}</p>
                    <p className="text-xs text-white/55">{f.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <p className="relative text-xs text-white/40">© ربيعي — لوحة التحكم الداخلية</p>
        </aside>

        {/* Form panel */}
        <div className="p-8 sm:p-10">
          <Link to="/" className="mb-8 flex justify-center lg:hidden">
            <img src="/Logo Arabic Version 02.png" alt="ربيعي" className="h-12 w-auto" />
          </Link>

          <div className="mb-8 text-center lg:text-right">
            <h1 className="text-2xl font-bold text-foreground">{title}</h1>
            {subtitle && <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>}
          </div>

          {children}

          {footer && <div className="mt-8">{footer}</div>}
        </div>
      </motion.div>

      <Link
        to="/"
        className="absolute bottom-5 z-10 inline-flex items-center gap-1.5 text-xs text-white/55 transition-colors hover:text-white"
      >
        <ArrowRight size={14} />
        العودة إلى الموقع
      </Link>
    </div>
  );
}

interface AuthFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  icon: React.ElementType;
  labelAction?: React.ReactNode;
}

/** Labelled input with a leading icon; auto-adds a show/hide toggle for passwords. */
export function AuthField({ id, label, icon: Icon, labelAction, type = "text", className, ...props }: AuthFieldProps) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (show ? "text" : "password") : type;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="block text-sm font-medium text-foreground/80">
          {label}
        </label>
        {labelAction}
      </div>
      <div className="relative">
        <Icon size={16} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          id={id}
          type={inputType}
          className={cn(
            "w-full rounded-xl border border-border/60 bg-secondary/40 py-3 pr-11 text-sm text-foreground outline-none transition-all",
            "placeholder:text-muted-foreground/60 focus:border-primary/60 focus:bg-secondary/60 focus:ring-2 focus:ring-primary/20",
            isPassword ? "pl-11" : "pl-4",
            className
          )}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
          >
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
    </div>
  );
}

interface AuthSubmitProps {
  loading?: boolean;
  loadingText?: string;
  icon?: React.ElementType;
  children: React.ReactNode;
}

/** Full-width brand submit button with a loading state. */
export function AuthSubmit({ loading, loadingText, icon: Icon, children }: AuthSubmitProps) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-brand py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all duration-300 hover:shadow-xl hover:shadow-primary/40 hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
    >
      {loading ? (
        <>
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          {loadingText && <span>{loadingText}</span>}
        </>
      ) : (
        <>
          {children}
          {Icon && <Icon size={16} className="transition-transform duration-300 group-hover:-translate-x-1" />}
        </>
      )}
    </button>
  );
}
