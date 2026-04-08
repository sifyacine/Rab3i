import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Eye, Calendar, Tag, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/ScrollReveal";
import { projectsService } from "@/services/projectsService";
import { getClientIP } from "@/lib/getClientIP";
import { useEffect } from "react";
import NotFound from "../NotFound";

const ProjectDetails = () => {
  const { slug } = useParams();
  
  const { data: project, isLoading, error } = useQuery({
    queryKey: ["project", slug],
    queryFn: () => projectsService.getProjectBySlug(slug as string),
    enabled: !!slug
  });

  // Track views once loaded
  useEffect(() => {
    if (project?.id) {
      const timer = setTimeout(async () => {
        const ip = await getClientIP();
        projectsService.incrementViews(project.id, ip ?? undefined).catch(console.error);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [project?.id]);

  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 200]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !project) {
    return <NotFound />;
  }

  return (
    <div className="bg-background min-h-screen">
      <Navbar />
      
      <main className="pb-20">
        {/* Hero Section */}
        <div className="relative h-[60vh] md:h-[80vh] w-full overflow-hidden flex items-end">
          <motion.div 
            style={{ y, opacity }} 
            className="absolute inset-0 z-0"
          >
            {project.cover_image ? (
              <img 
                src={project.cover_image} 
                alt={project.title} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[hsl(0,84%,20%)] to-[hsl(350,70%,10%)]" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          </motion.div>

          <div className="container mx-auto px-6 relative z-10 pb-16">
            <ScrollReveal>
              <Link to="/portfolio" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
                <ArrowRight className="w-4 h-4" />
                <span>العودة لمعرض الأعمال</span>
              </Link>
              
              {project.category && (
                <div className="mb-4">
                  <span className="inline-block rounded-full bg-primary/20 text-primary border border-primary/30 px-4 py-1 text-sm font-medium backdrop-blur-md">
                    {project.category.name}
                  </span>
                </div>
              )}
              
              <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6" style={{ lineHeight: 1.2 }}>
                {project.title}
              </h1>

              <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(project.created_at).toLocaleDateString("ar-SA", { year: "numeric", month: "long" })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  <span>{project.views} مشاهدة</span>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>

        {/* Content Section */}
        <div className="container mx-auto px-6 -mt-8 relative z-20">
          <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-3xl p-8 md:p-12 shadow-2xl max-w-4xl mx-auto">
            <ScrollReveal>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Tag className="w-6 h-6 text-primary" />
                نبذة عن المشروع
              </h2>
              <div className="prose prose-invert prose-lg max-w-none text-muted-foreground leading-relaxed whitespace-pre-line">
                {project.description || "لا يوجد وصف لهذا المشروع حالياً."}
              </div>
            </ScrollReveal>
          </div>
          
          {/* Gallery Section */}
          {project.project_media && project.project_media.length > 0 && (
            <div className="mt-20 max-w-6xl mx-auto">
              <ScrollReveal>
                <h3 className="text-3xl font-bold mb-10 text-center">معرض الصور</h3>
              </ScrollReveal>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {project.project_media.map((media, index) => (
                  <ScrollReveal key={media.id} className={index % 3 === 0 ? "md:col-span-2" : ""}>
                    <div className="rounded-2xl overflow-hidden border border-border/50 shadow-lg group">
                      <img 
                        src={media.media_url} 
                        alt={`${project.title} - صورة ${index + 1}`} 
                        className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ProjectDetails;
