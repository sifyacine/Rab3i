import { useState, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/ScrollReveal";
import { useCursorFollow, useCardTilt } from "@/hooks/use-cursor-follow";

const categories = ["الكل", "علامة تجارية", "حملات تسويقية", "إنتاج محتوى"];

const projects = [
  { title: "هوية بصرية لشركة تقنية", category: "علامة تجارية", color: "from-[hsl(270,60%,35%)] to-[hsl(300,50%,25%)]", size: "tall" },
  { title: "حملة إطلاق منتج رقمي", category: "حملات تسويقية", color: "from-[hsl(230,60%,30%)] to-[hsl(260,50%,22%)]", size: "normal" },
  { title: "محتوى سوشال ميديا", category: "إنتاج محتوى", color: "from-[hsl(200,55%,30%)] to-[hsl(230,50%,20%)]", size: "normal" },
  { title: "تصميم تطبيق جوال", category: "علامة تجارية", color: "from-[hsl(280,55%,30%)] to-[hsl(310,45%,22%)]", size: "wide" },
  { title: "حملة رمضانية متكاملة", category: "حملات تسويقية", color: "from-[hsl(250,55%,30%)] to-[hsl(280,50%,22%)]", size: "normal" },
  { title: "فيديوهات موشن جرافيك", category: "إنتاج محتوى", color: "from-[hsl(210,60%,28%)] to-[hsl(240,50%,20%)]", size: "tall" },
];

const ProjectCard = ({ project, index }: { project: typeof projects[0]; index: number }) => {
  const { pos, onMouseMove, onMouseLeave } = useCursorFollow();
  const { transform, onMouseMove: onTiltMove, onMouseLeave: onTiltLeave } = useCardTilt();

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    onMouseMove(e);
    onTiltMove(e);
  };

  const handleMouseLeave = () => {
    onMouseLeave();
    onTiltLeave();
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 30 }}
      transition={{ duration: 0.5, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
      className={`${project.size === "tall" ? "row-span-2" : ""} ${project.size === "wide" ? "sm:col-span-2" : ""}`}
    >
      <Link to="#">
        <div
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="group relative overflow-hidden rounded-2xl transition-[transform,box-shadow] duration-500 ease-out will-change-transform"
          style={{
            transform,
            aspectRatio: project.size === "tall" ? "3/5" : project.size === "wide" ? "2/1" : "4/3",
          }}
        >
          {/* Gradient bg */}
          <div className={`absolute inset-0 bg-gradient-to-br ${project.color} transition-transform duration-700 group-hover:scale-110`} />

          {/* Dot pattern with parallax */}
          <div
            className="absolute inset-0 opacity-10 transition-transform duration-500"
            style={{
              backgroundImage: "radial-gradient(circle at 2px 2px, hsl(var(--foreground)) 1px, transparent 0)",
              backgroundSize: "28px 28px",
              transform: pos.isInside ? `translate(${(pos.x - 200) * 0.02}px, ${(pos.y - 150) * 0.02}px)` : "none",
            }}
          />

          {/* Cursor spotlight */}
          {pos.isInside && (
            <div
              className="pointer-events-none absolute z-10 h-64 w-64 rounded-full transition-opacity duration-300"
              style={{
                background: "radial-gradient(circle, hsla(270,60%,60%,0.15) 0%, transparent 70%)",
                left: pos.x - 128,
                top: pos.y - 128,
              }}
            />
          )}

          {/* Scan line effect on hover */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.03] to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            style={{
              transform: pos.isInside ? `translateY(${pos.y - 100}px)` : "translateY(-100%)",
              height: "200px",
            }}
          />

          {/* Content overlay */}
          <div className="absolute inset-0 flex flex-col justify-end p-8">
            <div className="translate-y-6 opacity-0 transition-all duration-500 ease-out group-hover:translate-y-0 group-hover:opacity-100">
              <span className="mb-2 inline-block rounded-full bg-white/10 px-3 py-1 text-xs backdrop-blur-sm text-white/80">
                {project.category}
              </span>
            </div>
            <h3 className="text-xl font-bold text-white transition-all duration-500 group-hover:-translate-y-1">
              {project.title}
            </h3>
            <div className="mt-3 h-0.5 w-0 rounded-full bg-primary transition-all duration-700 group-hover:w-16" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

const Portfolio = () => {
  const [active, setActive] = useState("الكل");
  const filtered = active === "الكل" ? projects : projects.filter((p) => p.category === active);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const { pos: cursorPos, onMouseMove: onPageMouseMove, onMouseLeave: onPageMouseLeave } = useCursorFollow();

  return (
    <div onMouseMove={onPageMouseMove} onMouseLeave={onPageMouseLeave}>
      {/* Global cursor follower */}
      {cursorPos.isInside && (
        <div
          className="pointer-events-none fixed z-[999] h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-primary/40 mix-blend-difference transition-[width,height] duration-200"
          style={{ left: cursorPos.x, top: cursorPos.y }}
        />
      )}

      <Navbar />
      <main className="pb-20">
        {/* Hero with parallax */}
        <div ref={heroRef} className="relative flex min-h-[60vh] items-center justify-center overflow-hidden">
          <div className="absolute inset-0 animate-gradient bg-gradient-to-br from-[hsl(270,60%,12%)] via-[hsl(250,50%,8%)] to-[hsl(280,60%,10%)] bg-[length:300%_300%]" />
          <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 text-center px-6">
            <ScrollReveal>
              <h1 className="mb-4 text-5xl font-bold text-foreground sm:text-6xl lg:text-7xl" style={{ lineHeight: 1.2 }}>أعمالنا</h1>
              <p className="text-lg text-muted-foreground max-w-md mx-auto">مشاريع إبداعية نفخر بها ونقدمها بأعلى معايير الجودة</p>
            </ScrollReveal>
          </motion.div>
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
        </div>

        <div className="container mx-auto px-6 -mt-8 relative z-10">
          {/* Filters */}
          <ScrollReveal className="mb-12 flex flex-wrap justify-center gap-3">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActive(cat)}
                className={`relative rounded-full px-6 py-2.5 text-sm font-medium transition-all duration-300 active:scale-95 ${
                  active === cat
                    ? "text-white shadow-lg shadow-primary/20"
                    : "border border-border/50 text-muted-foreground hover:border-primary/30 hover:text-foreground"
                }`}
              >
                {active === cat && (
                  <motion.div
                    layoutId="filter-bg"
                    className="absolute inset-0 rounded-full bg-gradient-brand"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{cat}</span>
              </button>
            ))}
          </ScrollReveal>

          {/* Grid */}
          <motion.div layout className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 auto-rows-[minmax(200px,auto)]">
            {filtered.map((project, i) => (
              <ProjectCard key={project.title} project={project} index={i} />
            ))}
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Portfolio;
