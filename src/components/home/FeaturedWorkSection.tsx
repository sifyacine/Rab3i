import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Eye } from "lucide-react";
import ScrollReveal from "../ScrollReveal";
import { projectsService } from "@/services/projectsService";
import { Project } from "@/types/portfolio";

const gradients = [
  "from-[hsl(0,84%,35%)] to-[hsl(350,70%,25%)]",
  "from-[hsl(15,80%,30%)] to-[hsl(0,70%,22%)]",
  "from-[hsl(340,75%,30%)] to-[hsl(355,60%,20%)]",
  "from-[hsl(10,80%,35%)] to-[hsl(350,70%,25%)]",
];

function ProjectCard({ project, index }: { project: Project; index: number }) {
  return (
    <ScrollReveal delay={index * 0.1}>
      <Link to={`/portfolio/${project.slug}`}>
        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="group relative aspect-[4/3] overflow-hidden rounded-2xl"
        >
          {project.cover_image ? (
            <img
              src={project.cover_image}
              alt={project.title}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className={`absolute inset-0 bg-gradient-to-br ${gradients[index % gradients.length]}`} />
          )}

          {/* Overlay always visible at bottom */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          {/* Content */}
          <div className="absolute inset-0 flex flex-col justify-end p-6">
            {project.category && (
              <div className="translate-y-2 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100 mb-2">
                <span className="inline-block rounded-full bg-white/15 px-3 py-1 text-xs backdrop-blur-sm text-white/90">
                  {project.category.title_ar || project.category.name}
                </span>
              </div>
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

          {/* View icon */}
          <div className="absolute top-4 left-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/0 text-white/0 transition-all duration-300 group-hover:bg-white/20 group-hover:text-white group-hover:backdrop-blur-sm">
            <Eye className="h-4 w-4" />
          </div>
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
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : projects.length === 0 ? (
          <div className="grid gap-6 sm:grid-cols-2">
            {/* Fallback placeholders */}
            {[0, 1, 2, 3].map(i => (
              <div key={i} className={`group relative aspect-[4/3] overflow-hidden rounded-2xl bg-gradient-to-br ${gradients[i]}`}>
                <div className="absolute inset-0 opacity-10" style={{
                  backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
                  backgroundSize: "32px 32px"
                }} />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            {projects.map((project, i) => (
              <ProjectCard key={project.id} project={project} index={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedWorkSection;
