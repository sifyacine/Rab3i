import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Eye, Calendar, Loader2, Filter, X } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
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

  const { data: categories = [] }: { data: Category[] } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoryService.getCategories(),
  });

  const { data: services = [] }: { data: Service[] } = useQuery({
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
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200 ${
                !selectedCategory
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "bg-secondary text-foreground hover:bg-secondary/70"
              }`}
            >
              الكل
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id === selectedCategory ? null : cat.id)}
                className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200 ${
                  selectedCategory === cat.id
                    ? "bg-primary text-white shadow-md shadow-primary/20"
                    : "bg-secondary text-foreground hover:bg-secondary/70"
                }`}
              >
                {cat.title_ar || cat.name}
                <span className="ms-1 text-xs opacity-60">{cat.title_en}</span>
              </button>
            ))}

            {/* Services filter toggle */}
            <button
              onClick={() => setShowServiceFilter(v => !v)}
              className={`ms-auto whitespace-nowrap flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium border transition-all ${
                selectedServices.length > 0
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border hover:border-primary/40"
              }`}
            >
              <Filter className="h-3.5 w-3.5" />
              الخدمات {selectedServices.length > 0 && `(${selectedServices.length})`}
            </button>

            {/* Clear filters */}
            {hasActiveFilter && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
              >
                <X className="h-3.5 w-3.5" /> مسح
              </button>
            )}
          </div>

          {/* Services sub-filter */}
          <AnimatePresence>
            {showServiceFilter && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="flex flex-wrap gap-2 pt-1 pb-2">
                  {services.map(svc => (
                    <button
                      key={svc.id}
                      onClick={() => toggleService(svc.id)}
                      className={`whitespace-nowrap rounded-lg px-3 py-1 text-xs font-medium border transition-all ${
                        selectedServices.includes(svc.id)
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-secondary hover:border-primary/40"
                      }`}
                    >
                      {svc.title_ar}
                      <span className="ms-1 opacity-50">{svc.title_en}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="container py-12">
        {loadingProjects ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center h-64 gap-3 text-center"
          >
            <div className="text-4xl">🎨</div>
            <p className="text-xl font-semibold">لا توجد مشاريع بهذا الفلتر</p>
            <p className="text-muted-foreground">جرب تغيير الفئة أو إزالة بعض الفلاتر</p>
            <button onClick={clearFilters} className="text-primary text-sm hover:underline">مسح الفلاتر</button>
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
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className="break-inside-avoid"
    >
      <Link to={`/portfolio/${project.slug}`} className="group block">
        <div className="relative overflow-hidden rounded-2xl bg-card border border-border/40 shadow-sm hover:shadow-xl hover:shadow-primary/10 transition-all duration-500 hover:-translate-y-1">
          {/* Cover */}
          <div className="relative overflow-hidden bg-secondary/40" style={{ minHeight: 200 }}>
            {project.cover_image ? (
              <img
                src={project.cover_image}
                alt={project.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
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
        </div>
      </Link>
    </motion.div>
  );
}

export default Portfolio;
