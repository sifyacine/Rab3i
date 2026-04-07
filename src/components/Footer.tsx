import { Link } from "react-router-dom";
import { Instagram, Twitter, Linkedin, Mail } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

const socialConfig = [
  { key: "social_facebook", Icon: ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
  ), color: "text-blue-600" },
  { key: "social_instagram", Icon: Instagram, color: "text-pink-500" },
  { key: "social_linkedin", Icon: Linkedin, color: "text-blue-700" },
  { key: "social_youtube", Icon: ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="white"/></svg>
  ), color: "text-red-600" },
  { key: "social_tiktok", Icon: ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>
  ), color: "text-black" },
];

const Footer = () => {
  const { data: settings } = useQuery({
    queryKey: ["store-settings"],
    queryFn: async () => {
      const { data } = await supabase.from("store_settings").select("*").limit(1).single();
      return data;
    },
  });

  const socialLinks = socialConfig.filter(s => settings?.[s.key]);

  return (
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
          <p className="text-sm font-semibold text-gradient mt-4">
            رُبْعي — حيث يصبح التسويق جزءًا من الفريق
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
            {socialLinks.map((s, i) => (
              <a
                key={i}
                href={settings?.[s.key]}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex h-10 w-10 items-center justify-center rounded-lg border border-border/50 ${s.color} transition-all duration-300 hover:border-primary/50 hover:shadow-md hover:shadow-primary/10 active:scale-95`}
              >
                <s.Icon size={18} />
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
};

export default Footer;
