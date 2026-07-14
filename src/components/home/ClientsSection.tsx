import ScrollReveal from "../ScrollReveal";
import { useQuery } from "@tanstack/react-query";
import { siteContentService, SITE_CONTENT_DEFAULTS } from "@/services/siteContentService";

const ClientsSection = () => {
  const { data } = useQuery({ queryKey: ["site-content"], queryFn: () => siteContentService.getSiteContent() });
  const clients = data?.partners && data.partners.length ? data.partners : SITE_CONTENT_DEFAULTS.partners;

  return (
  <section className="border-y border-border/30 py-24 overflow-hidden">
    <div className="container mx-auto px-6">
      <ScrollReveal className="mb-12 text-center">
        <span className="text-xs font-semibold uppercase tracking-widest text-primary">شركاء النجاح</span>
      </ScrollReveal>
    </div>

    {/* Marquee */}
    <div className="relative">
      <div className="absolute right-0 top-0 bottom-0 z-10 w-32 bg-gradient-to-l from-background to-transparent" />
      <div className="absolute left-0 top-0 bottom-0 z-10 w-32 bg-gradient-to-r from-background to-transparent" />
      <div className="flex animate-marquee whitespace-nowrap" style={{ animationDuration: '40s' }}>
        {[...clients, ...clients, ...clients].map((client, i) => (
          <div
            key={i}
            className="mx-8 flex h-16 items-center justify-center rounded-xl border border-border/20 bg-card/40 px-8 transition-colors hover:border-primary/30"
          >
            <span className="text-sm font-medium text-muted-foreground/80 whitespace-nowrap">{client}</span>
          </div>
        ))}
      </div>
    </div>
  </section>
  );
};

export default ClientsSection;
