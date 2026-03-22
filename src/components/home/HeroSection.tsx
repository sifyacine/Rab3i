import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, Play } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 animate-gradient bg-gradient-to-br from-[hsl(0,84%,12%)] via-[hsl(350,70%,8%)] to-[hsl(10,60%,10%)] bg-[length:300%_300%]" />

      {/* Abstract floating shapes - Reduced for mobile performance */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className={`absolute rounded-full opacity-20 blur-3xl ${i > 1 ? 'hidden sm:block' : ''}`}
          style={{
            width: 200 + i * 120,
            height: 200 + i * 120,
            background: `radial-gradient(circle, hsl(${0 + i * 5}, 80%, ${40 + i * 5}%), transparent)`,
            top: `${15 + i * 15}%`,
            right: `${10 + i * 18}%`,
          }}
          animate={{
            x: [0, 30 * (i % 2 === 0 ? 1 : -1), 0],
            y: [0, -20 * (i % 2 === 0 ? -1 : 1), 0],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 8 + i * 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="mb-6 inline-block rounded-full border border-primary/30 bg-primary/10 px-5 py-2 text-xs font-medium text-primary">
            الشريك الإبداعي لنجاح مشروعك
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 40, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto mb-6 max-w-4xl text-4xl font-bold leading-[1.3] tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl"
          style={{ textWrap: "balance" }}
        >
          وصّل رسالتك
          <br />
          <span className="text-gradient">بإبداع يحقق هدفك</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.8, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto mb-10 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg"
          style={{ textWrap: "pretty" }}
        >
          مو صعب تطلق حملة، ولكن مو أي حملة تأثر وتحقق هدفك.
          <br className="hidden sm:block" />
          ربيعي هي الشريك اللي يبني تصوّر ويوصل رسالتك بشكل مختلف
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-wrap items-center justify-center gap-4"
        >
          <Link
            to="/request"
            className="group flex items-center gap-2 rounded-xl bg-gradient-brand px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-all duration-300 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.97]"
          >
            ابدأ مشروعك
            <ArrowLeft size={16} className="transition-transform duration-300 group-hover:-translate-x-1" />
          </Link>
          <Link
            to="/portfolio"
            className="group flex items-center gap-2 rounded-xl border border-border/50 bg-secondary/50 px-8 py-3.5 text-sm font-semibold text-foreground/90 transition-all duration-300 hover:border-primary/30 hover:bg-secondary active:scale-[0.97]"
          >
            <Play size={14} className="text-primary" />
            شاهد أعمالنا
          </Link>
        </motion.div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default HeroSection;
