import { Link } from "react-router-dom";
import { Instagram, Twitter, Linkedin, Mail } from "lucide-react";

const Footer = () => (
  <footer className="border-t border-border/50 bg-background py-16">
    <div className="container mx-auto px-6">
      <div className="grid gap-12 md:grid-cols-4">
        {/* Brand */}
        <div className="md:col-span-1 text-center md:text-start">
          <div className="mb-4 flex items-center justify-center md:justify-start gap-2">
            <img src="/Logo Arabic Version 02.png" alt="ربيعي" className="h-10 w-auto" />
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            الشريك الإبداعي اللي تساعدك على إيصال رسائلك بشكل إبداعي يبني تصوّر ويحقق هدف
          </p>
        </div>

        {/* Quick links */}
        <div>
          <h4 className="mb-4 text-sm font-semibold text-foreground">روابط سريعة</h4>
          <div className="flex flex-col gap-3">
            {[
              { label: "الرئيسية", path: "/" },
              { label: "خدماتنا", path: "/services" },
              { label: "أعمالنا", path: "/portfolio" },
              { label: "المدونة", path: "/blog" },
              { label: "دخول العملاء", path: "/login" },
            ].map((l) => (
              <Link key={l.path} to={l.path} className="text-sm text-muted-foreground transition-colors hover:text-primary">
                {l.label}
              </Link>
            ))}
          </div>
        </div>

        {/* More */}
        <div>
          <h4 className="mb-4 text-sm font-semibold text-foreground">المزيد</h4>
          <div className="flex flex-col gap-3">
            {[
              { label: "من نحن", path: "/about" },
              { label: "تواصل معنا", path: "/request" },
              { label: "سياسة الخصوصية", path: "#" },
              { label: "الشروط والأحكام", path: "#" },
            ].map((l) => (
              <Link key={l.label} to={l.path} className="text-sm text-muted-foreground transition-colors hover:text-primary">
                {l.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Social */}
        <div>
          <h4 className="mb-4 text-sm font-semibold text-foreground">تابعنا</h4>
          <div className="flex gap-3">
            {[Instagram, Twitter, Linkedin, Mail].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-border/50 text-muted-foreground transition-all duration-300 hover:border-primary/50 hover:text-primary hover:shadow-md hover:shadow-primary/10 active:scale-95"
              >
                <Icon size={18} />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-12 border-t border-border/30 pt-8 text-center">
        <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} ربيعي. جميع الحقوق محفوظة</p>
      </div>
    </div>
  </footer>
);

export default Footer;
