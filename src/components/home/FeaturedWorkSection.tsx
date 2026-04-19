import { motion, useMotionValue, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Eye } from "lucide-react";
import { useState } from "react";
import ScrollReveal from "../ScrollReveal";
import ProjectCardSkeleton from "../ui/ProjectCardSkeleton";
import { projectsService } from "@/services/projectsService";
import { Project } from "@/types/portfolio";

const gradients = [
  "from-[hsl(0,84%,35%)] to-[hsl(350,70%,25%)]",
  "from-[hsl(15,80%,30%)] to-[hsl(0,70%,22%)]",
  "from-[hsl(340,75%,30%)] to-[hsl(355,60%,20%)]",
  "from-[hsl(10,80%,35%)] to-[hsl(350,70%,25%)]",
];

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const [isHovered, setIsHovered] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const rotateX = useTransform(y, [-0.5, 0.5], [5, -5]);
  const rotateY = useTransform(x, [-0.5, 0.5], [-5, 5]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set((e.clientX - centerX) / rect.width);
    y.set((e.clientY - centerY) / rect.height);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  return (
    <ScrollReveal delay={index * 0.1} className="h-full">
      <Link to={`/portfolio/${project.slug}`} className="block h-full">
        <motion.div
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={handleMouseLeave}
          style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
          animate={{ scale: isHovered ? 1.02 : 1 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="group relative h-full overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl hover:shadow-primary/20 transition-shadow duration-500"
        >
          {project.cover_image ? (
            <img
              src={project.cover_image}
              alt={project.title}
              className="absolute inset-0 h-full w-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-110"
            />
          ) : (
            <div className={`absolute inset-0 bg-gradient-to-br ${gradients[index % gradients.length]}`} />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-[var(--brand-ochre)]/20 via-transparent to-transparent mix-blend-overlay" />

          {/* Content */}
          <div className="absolute inset-0 flex flex-col justify-end p-6">
            {project.category && (
              <motion.div
                initial={{ y: 8, opacity: 0 }}
                animate={isHovered ? { y: 0, opacity: 1 } : { y: 8, opacity: 0 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="mb-2"
              >
                <motion.span
                  whileHover={{ scale: 1.05 }}
                  className="inline-block rounded-full bg-white/15 px-3 py-1 text-xs backdrop-blur-sm text-white/90 border border-white/10"
                >
                  {project.category.title_ar || project.category.name}
                </motion.span>
              </motion.div>
            )}
            <h3 className="text-xl font-bold text-white leading-snug group-hover:-translate-y-1 transition-transform duration-500">
              {project.title}
            </h3>
            {/* Services */}
            {project.services && project.services.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                {project.services.slice(0, 3).map(svc => (
                  <span key={svc.id} className="text-[10px] rounded bg-white/10 px-2 py-0.5 text-white/70 backdrop-blur-sm">
                    {svc.title_ar}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="absolute top-4 left-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/0 text-white/0 transition-all duration-300 group-hover:bg-white/20 group-hover:text-white group-hover:backdrop-blur-sm">
            <motion.div
              animate={isHovered ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 0.5, repeat: isHovered ? Infinity : 0, repeatDelay: 1 }}
            >
              <Eye className="h-4 w-4" />
            </motion.div>
          </div>
          
          {project.views !== undefined && project.views > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={isHovered ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
              transition={{ duration: 0.3 }}
              className="absolute top-4 left-16 flex items-center gap-1.5 rounded-full bg-black/40 backdrop-blur-sm px-3 py-1.5 text-xs text-white/90"
            >
              <span className="font-medium">{project.views.toLocaleString('ar-SA')}</span>
              <span className="text-white/60">مشاهدة</span>
            </motion.div>
          )}
        </motion.div>
      </Link>
    </ScrollReveal>
  );
}

const FeaturedWorkSection = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["featured-projects"],
    queryFn: () => projectsService.getProjects({ publishedOnly: true, limit: 4 }),
  });

  const projects: Project[] = data?.data ?? [];

  if (error) {
    console.error("Failed to load projects:", error);
  }

  return (
    <section className="py-32" dir="rtl">
      <div className="container mx-auto px-6">
        <ScrollReveal className="mb-12 flex items-end justify-between">
          <div>
            <span className="mb-4 block text-xs font-semibold uppercase tracking-widest text-primary">أعمالنا</span>
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl">مشاريع مميزة</h2>
          </div>
          <Link to="/portfolio" className="text-sm font-medium text-primary transition-colors hover:text-primary/80">
            عرض الكل ←
          </Link>
        </ScrollReveal>

        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 auto-rows-[280px]">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={
                  i === 0
                    ? "sm:col-span-2 sm:row-span-2"
                    : i === 3
                    ? "lg:col-span-2"
                    : ""
                }
              >
                <ProjectCardSkeleton index={i} />
              </div>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="mb-4 rounded-full bg-muted/50 p-6">
              <Eye className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">لا توجد مشاريع حالياً</h3>
            <p className="text-muted-foreground max-w-md">
              نعمل على إضافة مشاريع جديدة قريباً. تابعنا لمشاهدة أحدث أعمالنا.
            </p>
          </motion.div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 auto-rows-[280px]">
            {projects.map((project, i) => (
              <div
                key={project.id}
                className={
                  i === 0
                    ? "sm:col-span-2 sm:row-span-2"
                    : i === 3
                    ? "lg:col-span-2"
                    : ""
                }
              >
                <ProjectCard project={project} index={i} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedWorkSection;
