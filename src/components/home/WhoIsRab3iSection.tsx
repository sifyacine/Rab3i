import ScrollReveal from "../ScrollReveal";

const WhoIsRab3iSection = () => {
  return (
    <section className="relative overflow-hidden bg-[var(--brand-true-black)] py-24 lg:py-32" dir="rtl">
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage:
          "linear-gradient(hsl(0 0% 100% / 0.08) 1px, transparent 1px), linear-gradient(90deg, hsl(0 0% 100% / 0.08) 1px, transparent 1px)",
        backgroundSize: "56px 56px",
      }} />

      <div className="relative z-10 container mx-auto px-6">
        <div className="grid items-stretch gap-0 overflow-hidden rounded-3xl border border-white/10 bg-black/40 lg:grid-cols-2">
          <div className="relative flex items-center bg-black px-6 py-12 sm:px-10 lg:px-14 lg:py-20">
            <div className="pointer-events-none absolute bottom-[-110px] left-[-90px] h-64 w-64 rounded-full border-[44px] border-[var(--brand-charcoal)] opacity-70" />

            <ScrollReveal className="mx-auto w-full max-w-xl text-right">
              <h2
                className="mb-8 text-4xl font-bold leading-tight text-primary sm:text-5xl lg:text-6xl"
                style={{
                  fontFamily: "var(--font-zain)",
                  textWrap: "balance",
                }}
              >
                وش هي رُبعي؟
              </h2>

              <div
                className="space-y-7 text-lg leading-relaxed text-white/70 sm:text-xl"
                style={{
                  fontFamily: "var(--font-ko-sans)",
                  textWrap: "pretty",
                }}
              >
                <p>
                  في الثقافة الخليجية، <span className="font-semibold text-white">رُبعي</span> هو الشريك اللي يجلس معك في المجلس يكون سندك
                  وصحبك، ويشاركك الرأي، ويتحمّل القرار.
                </p>

                <p>
                  <span className="font-semibold text-white">رُبعي</span> تأسست على نفس الفكرة، نكون القسم الرابع في مشروعك.
                  <br />
                  الإدارة، العمليات، المبيعات... والتسويق.
                </p>
              </div>
            </ScrollReveal>
          </div>

          <div className="relative min-h-[420px] border-t border-white/10 lg:min-h-[680px] lg:border-t-0 lg:border-r lg:border-white/10">
            <div className="absolute inset-0 bg-gradient-to-b from-[#342617] via-[#17120d] to-black" />
            <div className="absolute inset-x-[15%] top-[8%] h-[32%] rounded-full bg-[var(--brand-sandstone)]/20 blur-3xl" />
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black via-black/75 to-transparent" />

            <img
              src="/images/who-is-rab3i-person.jpg"
              alt="شخص سعودي يجلس ويستخدم اللابتوب"
              className="absolute inset-0 h-full w-full object-cover object-top opacity-0"
              onLoad={(e) => (e.currentTarget.style.opacity = "1")}
              style={{ transition: "opacity 0.6s ease" }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhoIsRab3iSection;
