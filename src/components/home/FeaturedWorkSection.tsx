import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import ScrollReveal from "../ScrollReveal";

const projects = [
  { title: "هوية بصرية لشركة تقنية", category: "علامة تجارية", color: "from-[hsl(270,60%,35%)] to-[hsl(300,50%,25%)]" },
  { title: "حملة إطلاق منتج رقمي", category: "حملات تسويقية", color: "from-[hsl(230,60%,30%)] to-[hsl(260,50%,22%)]" },
  { title: "محتوى سوشال ميديا", category: "إنتاج محتوى", color: "from-[hsl(200,55%,30%)] to-[hsl(230,50%,20%)]" },
  { title: "تصميم تطبيق جوال", category: "علامة تجارية", color: "from-[hsl(280,55%,30%)] to-[hsl(310,45%,22%)]" },
];

const FeaturedWorkSection = () => (
  <section className="py-32">
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

      <div className="grid gap-6 sm:grid-cols-2">
        {projects.map((project, i) => (
          <ScrollReveal key={i} delay={i * 0.1}>
            <Link to="/portfolio">
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="group relative aspect-[4/3] overflow-hidden rounded-2xl"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${project.color}`} />
                {/* Pattern */}
                <div className="absolute inset-0 opacity-10" style={{
                  backgroundImage: "radial-gradient(circle at 2px 2px, hsl(var(--foreground)) 1px, transparent 0)",
                  backgroundSize: "32px 32px"
                }} />
                {/* Content overlay */}
                <div className="absolute inset-0 flex flex-col justify-end p-8">
                  <div className="translate-y-4 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                    <span className="mb-2 inline-block rounded-full bg-white/10 px-3 py-1 text-xs backdrop-blur-sm text-white/80">
                      {project.category}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white transition-transform duration-500 group-hover:-translate-y-1">
                    {project.title}
                  </h3>
                </div>
              </motion.div>
            </Link>
          </ScrollReveal>
        ))}
      </div>
    </div>
  </section>
);

export default FeaturedWorkSection;
