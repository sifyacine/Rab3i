import { motion } from "framer-motion";
import ScrollReveal from "../ScrollReveal";
import { MessageCircle } from "lucide-react";

const DirectMessageSection = () => {
  return (
    <section className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 animate-gradient bg-gradient-to-br from-[hsl(0,84%,12%)] via-[hsl(350,70%,8%)] to-[hsl(10,60%,10%)] bg-[length:300%_300%]" />
      
      <div className="container mx-auto px-6 relative z-10">
        <ScrollReveal className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 text-white mb-8">
            <MessageCircle size={32} />
          </div>
          
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-snug text-white mb-6" style={{ textWrap: "balance" }}>
            إذا كنت تدور وكالة…
            <br />
            <span className="text-muted-foreground">يمكن مو إحنا.</span>
          </h2>
          
          <p className="text-lg leading-relaxed text-white/80" style={{ textWrap: "pretty" }}>
            لكن إذا كنت تدور شريك يفهم مشروعك،
            ويجلس معك في المجلس،
            ويشتغل على نمو حقيقي طويل المدى…
          </p>
          <p className="text-2xl font-bold text-gradient mt-6">
            فأهلًا بك في <span className="text-white">رُبْع</span>.
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default DirectMessageSection;
