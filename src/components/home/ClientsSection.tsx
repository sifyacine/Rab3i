import ScrollReveal from "../ScrollReveal";

const clients = ["شركة النخبة", "مجموعة الريادة", "تقنية المستقبل", "منصة ابتكار", "حلول رقمية", "شركة الأفق", "مؤسسة البناء", "شركة المسار"];

const ClientsSection = () => (
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
      <div className="flex animate-marquee whitespace-nowrap">
        {[...clients, ...clients].map((client, i) => (
          <div
            key={i}
            className="mx-8 flex h-16 items-center justify-center rounded-lg border border-border/20 bg-card/50 px-8"
          >
            <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">{client}</span>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default ClientsSection;
