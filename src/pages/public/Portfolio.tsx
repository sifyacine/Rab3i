import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Eye, Calendar, Filter, X } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProjectCardSkeleton from "@/components/ui/ProjectCardSkeleton";
import { projectsService } from "@/services/projectsService";
import { categoryService } from "@/services/categoryService";
import { servicesService } from "@/services/servicesService";
import { Project, Category, Service } from "@/types/portfolio";

const Portfolio = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [showServiceFilter, setShowServiceFilter] = useState(false);

  const { data: projectsResult, isLoading: loadingProjects } = useQuery({
    queryKey: ["portfolio-projects"],
    queryFn: () => projectsService.getProjects({ publishedOnly: true }),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoryService.getCategories(),
  });

  const { data: services = [] } = useQuery({
    queryKey: ["services-active"],
    queryFn: () => servicesService.getServices(true),
  });

  const allProjects: Project[] = projectsResult?.data ?? [];

  const toggleService = (id: string) => {
    setSelectedServices(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const clearFilters = () => {
    setSelectedCategory(null);
    setSelectedServices([]);
  };

  const filtered = allProjects.filter(p => {
    const catMatch = !selectedCategory || p.category_id === selectedCategory;
    const svcMatch =
      selectedServices.length === 0 ||
      selectedServices.every(sid =>
        p.services?.some(s => s.id === sid)
      );
    return catMatch && svcMatch;
  });

  const hasActiveFilter = selectedCategory || selectedServices.length > 0;

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-28 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-2xl mx-auto"
          >
            <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-4">معرض الأعمال</span>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              أعمالنا الإبداعية
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              استعرض مجموعة مختارة من مشاريعنا المميزة عبر مختلف التخصصات والصناعات
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters */}
      <section className="sticky top-16 z-30 bg-background/80 backdrop-blur-xl border-b border-border/40 shadow-sm">
        <div className="container py-3 space-y-3">
          {/* Category row */}
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.05 } }
            }}
            className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none"
          >
            <motion.button
              variants={{
                hidden: { opacity: 0, x: -10 },
                visible: { opacity: 1, x: 0 }
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedCategory(null)}
              className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200 ${
                !selectedCategory
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "bg-secondary text-foreground hover:bg-secondary/70"
              }`}
            >
              الكل
            </motion.button>
            {categories.map(cat => (
              <motion.button
                key={cat.id}
                variants={{
                  hidden: { opacity: 0, x: -10 },
                  visible: { opacity: 1, x: 0 }
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(cat.id === selectedCategory ? null : cat.id)}
                className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200 ${
                  selectedCategory === cat.id
                    ? "bg-primary text-white shadow-md shadow-primary/20"
                    : "bg-secondary text-foreground hover:bg-secondary/70"
                }`}
              >
                {cat.title_ar || cat.name_ar}
                <span className="ms-1 text-xs opacity-60">{cat.title_en || cat.name_en}</span>
              </motion.button>
            ))}

            {/* Services filter toggle */}
            <motion.button
              variants={{
                hidden: { opacity: 0, x: 10 },
                visible: { opacity: 1, x: 0 }
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowServiceFilter(v => !v)}
              className={`ms-auto whitespace-nowrap flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium border transition-all ${
                selectedServices.length > 0
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border hover:border-primary/40"
              }`}
            >
              <Filter className="h-3.5 w-3.5" />
              الخدمات {selectedServices.length > 0 && `(${selectedServices.length})`}
            </motion.button>

            {/* Clear filters */}
            <AnimatePresence>
              {hasActiveFilter && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  whileHover={{ scale: 1.05, color: "var(--destructive)" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={clearFilters}
                  className="flex items-center gap-1 text-xs text-muted-foreground transition-colors"
                >
                  <X className="h-3.5 w-3.5" /> مسح
                </motion.button>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Services sub-filter */}
          <AnimatePresence>
            {showServiceFilter && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <motion.div 
                  initial="hidden"
                  animate="visible"
                  variants={{
                    visible: { transition: { staggerChildren: 0.03 } }
                  }}
                  className="flex flex-wrap gap-2 pt-1 pb-2"
                >
                  {services.map(svc => (
                    <motion.button
                      key={svc.id}
                      variants={{
                        hidden: { opacity: 0, scale: 0.9 },
                        visible: { opacity: 1, scale: 1 }
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => toggleService(svc.id)}
                      className={`whitespace-nowrap rounded-lg px-3 py-1 text-xs font-medium border transition-all ${
                        selectedServices.includes(svc.id)
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-secondary hover:border-primary/40"
                      }`}
                    >
                      {svc.title_ar}
                      <span className="ms-1 opacity-50">{svc.title_en}</span>
                    </motion.button>
                  ))}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="container py-12">
        {loadingProjects ? (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 space-y-5">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="break-inside-avoid" style={{ height: 300 + (i % 3) * 50 }}>
                <ProjectCardSkeleton index={i} />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-center"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
              <div className="relative bg-background border border-border rounded-2xl p-8 shadow-xl">
                <Filter className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">لا توجد مشاريع بهذا الفلتر</h3>
                <p className="text-muted-foreground max-w-sm mx-auto mb-6">
                  جرب تغيير الفئة أو إزالة بعض الخدمات المختارة للوصول إلى نتائج أفضل.
                </p>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={clearFilters} 
                  className="bg-primary text-white px-8 py-2.5 rounded-full font-bold shadow-lg shadow-primary/20"
                >
                  مسح جميع الفلاتر
                </motion.button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            layout
            className="columns-1 sm:columns-2 lg:columns-3 gap-5 space-y-5"
          >
            <AnimatePresence>
              {filtered.map((project, i) => (
                <ProjectCard key={project.id} project={project} index={i} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </section>

      <Footer />
    </div>
  );
};

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const [isHovered, setIsHovered] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const rotateX = useTransform(y, [-0.5, 0.5], [3, -3]);
  const rotateY = useTransform(x, [-0.5, 0.5], [-3, 3]);

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
    <motion.div
      layout
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className="break-inside-avoid"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
    >
      <Link to={`/portfolio/${project.slug}`} className="group block">
        <motion.div
          animate={{ scale: isHovered ? 1.02 : 1 }}
          transition={{ duration: 0.3 }}
          className="relative overflow-hidden rounded-2xl bg-card border border-border/40 shadow-sm hover:shadow-xl hover:shadow-primary/10 transition-all duration-500 hover:-translate-y-1"
        >
          {/* Cover */}
          <div className="relative overflow-hidden bg-secondary/40" style={{ minHeight: 200 }}>
            {project.cover_image ? (
              <motion.img
                src={project.cover_image}
                alt={project.title}
                className="w-full h-full object-cover"
                animate={{
                  scale: isHovered ? 1.1 : 1,
                }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                loading="lazy"
              />
            ) : (
              <div className="flex h-48 items-center justify-center text-muted-foreground">
                <span className="text-4xl">🎨</span>
              </div>
            )}
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
              <div className="flex items-center gap-2 text-white text-sm">
                <Eye className="h-4 w-4" />
                <span>{project.views ?? 0} مشاهدة</span>
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="p-4 space-y-2">
            <h3 className="font-bold text-base leading-snug group-hover:text-primary transition-colors line-clamp-2">
              {project.title}
            </h3>

            {/* Category badge */}
            {project.category && (
              <span className="inline-block text-xs rounded-full bg-primary/10 text-primary px-2.5 py-0.5 font-medium">
                {project.category.title_ar || project.category.name}
              </span>
            )}

            {/* Services tags */}
            {project.services && project.services.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {project.services.slice(0, 4).map(svc => (
                  <span key={svc.id} className="text-xs rounded-md bg-secondary px-2 py-0.5 text-muted-foreground">
                    {svc.title_ar}
                  </span>
                ))}
                {project.services.length > 4 && (
                  <span className="text-xs text-muted-foreground">+{project.services.length - 4}</span>
                )}
              </div>
            )}

            <div className="flex items-center gap-1 text-xs text-muted-foreground pt-1">
              <Calendar className="h-3 w-3" />
              {new Date(project.created_at).toLocaleDateString("ar-SA", { year: "numeric", month: "short" })}
            </div>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}

export default Portfolio;
