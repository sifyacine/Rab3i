import { useState, useRef } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/ScrollReveal";
import { useCursorFollow, useCardTilt } from "@/hooks/use-cursor-follow";
import { useQuery } from "@tanstack/react-query";
import { projectsService } from "@/services/projectsService";
import { categoryService } from "@/services/categoryService";
import { Project } from "@/types/portfolio";
import { Loader2 } from "lucide-react";

const ProjectCard = ({ project, index }: { project: Project; index: number }) => {
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

  // Generate size based on index for masonry effect
  const isTall = index % 5 === 0;
  const isWide = index % 7 === 0 && !isTall;

  // Generate a fallback gradient based on id
  const fallbackColor = "from-[hsl(0,84%,20%)] to-[hsl(350,70%,10%)]";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 30 }}
      transition={{ duration: 0.5, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
      className={`${isTall ? "row-span-2" : ""} ${isWide ? "sm:col-span-2" : ""}`}
    >
      <Link to={`/portfolio/${project.slug}`}>
        <div
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="group relative overflow-hidden rounded-2xl transition-[transform,box-shadow] duration-500 ease-out will-change-transform bg-secondary"
          style={{
            transform,
            aspectRatio: isTall ? "3/5" : isWide ? "2/1" : "4/3",
          }}
        >
          {/* Cover image or gradient bg */}
          {project.cover_image ? (
            <div 
              className="absolute inset-0 transition-transform duration-700 group-hover:scale-110" 
              style={{
                backgroundImage: `url(${project.cover_image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
          ) : (
            <div className={`absolute inset-0 bg-gradient-to-br ${fallbackColor} transition-transform duration-700 group-hover:scale-110`} />
          )}

          {/* Dark Overlay for text readability */}
          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all duration-500" />

          {/* Cursor spotlight */}
          {pos.isInside && (
            <div
              className="pointer-events-none absolute z-10 h-64 w-64 rounded-full transition-opacity duration-300 mix-blend-overlay"
              style={{
                background: "radial-gradient(circle, hsla(0,0%,100%,0.2) 0%, transparent 70%)",
                left: pos.x - 128,
                top: pos.y - 128,
              }}
            />
          )}

          {/* Scan line effect on hover */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.05] to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            style={{
              transform: pos.isInside ? `translateY(${pos.y - 100}px)` : "translateY(-100%)",
              height: "200px",
            }}
          />

          {/* Content overlay */}
          <div className="absolute inset-0 flex flex-col justify-end p-8 z-20">
            <div className="translate-y-6 opacity-0 transition-all duration-500 ease-out group-hover:translate-y-0 group-hover:opacity-100">
              {project.category && (
                <span className="mb-2 inline-block rounded-full bg-white/20 px-3 py-1 text-xs backdrop-blur-sm text-white/90 shadow-sm border border-white/10">
                  {project.category.name}
                </span>
              )}
            </div>
            <h3 className="text-xl font-bold text-white transition-all duration-500 group-hover:-translate-y-1 drop-shadow-md">
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
  const [activeSlug, setActiveSlug] = useState<string>("all");
  const heroRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const { pos: cursorPos, onMouseMove: onPageMouseMove, onMouseLeave: onPageMouseLeave } = useCursorFollow();

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoryService.getCategories()
  });

  const { data: projectsData, isLoading } = useQuery({
    queryKey: ["projects", activeSlug],
    queryFn: () => projectsService.getProjects(activeSlug !== "all" ? { categorySlug: activeSlug } : undefined)
  });

  const projects = projectsData?.data || [];
  // Ensure we only show published projects to normal users. The RLS should already filter this out, but filtering securely is great.
  // Wait, RLS handles it.

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
          <div className="absolute inset-0 animate-gradient bg-gradient-to-br from-[hsl(0,84%,12%)] via-[hsl(350,70%,8%)] to-[hsl(10,60%,10%)] bg-[length:300%_300%]" />
          <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 text-center px-6">
            <ScrollReveal>
              <h1 className="mb-4 text-5xl font-bold text-foreground sm:text-6xl lg:text-7xl" style={{ lineHeight: 1.2 }}>معرض الأعمال</h1>
              <p className="text-lg text-muted-foreground max-w-md mx-auto">مشاريع إبداعية نفخر بها ونقدمها بأعلى معايير الجودة</p>
            </ScrollReveal>
          </motion.div>
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
        </div>

        <div className="container mx-auto px-6 -mt-8 relative z-10 min-h-[40vh]">
          {/* Filters */}
          <ScrollReveal className="mb-12 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => setActiveSlug("all")}
              className={`relative rounded-full px-6 py-2.5 text-sm font-medium transition-all duration-300 active:scale-95 ${
                activeSlug === "all"
                  ? "text-white shadow-lg shadow-primary/20"
                  : "border border-border/50 text-muted-foreground hover:border-primary/30 hover:text-foreground bg-background/50 backdrop-blur-sm"
              }`}
            >
              {activeSlug === "all" && (
                <motion.div
                  layoutId="filter-bg"
                  className="absolute inset-0 rounded-full bg-gradient-brand"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <span className="relative z-10">الكل</span>
            </button>
            {categories?.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveSlug(cat.slug)}
                className={`relative rounded-full px-6 py-2.5 text-sm font-medium transition-all duration-300 active:scale-95 ${
                  activeSlug === cat.slug
                    ? "text-white shadow-lg shadow-primary/20"
                    : "border border-border/50 text-muted-foreground hover:border-primary/30 hover:text-foreground bg-background/50 backdrop-blur-sm"
                }`}
              >
                {activeSlug === cat.slug && (
                  <motion.div
                    layoutId="filter-bg"
                    className="absolute inset-0 rounded-full bg-gradient-brand"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{cat.name}</span>
              </button>
            ))}
          </ScrollReveal>

          {/* Grid or Loading State */}
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : projects.length > 0 ? (
            <motion.div layout className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 auto-rows-[minmax(200px,auto)]">
              <AnimatePresence>
                {projects.map((project, i) => (
                  <ProjectCard key={project.id} project={project} index={i} />
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <div className="text-center py-20 text-muted-foreground">
              لا توجد مشاريع في هذه الفئة حالياً.
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Portfolio;
