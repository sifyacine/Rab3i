import { supabase } from "@/lib/supabase";

export interface ProcessStep {
  title: string;
  description: string;
}

export interface SiteContent {
  hero_title: string | null;
  hero_subtitle: string | null;
  cta_text: string | null;
  process_steps: ProcessStep[] | null;
  partners: string[] | null;
}

const EMPTY: SiteContent = {
  hero_title: null,
  hero_subtitle: null,
  cta_text: null,
  process_steps: null,
  partners: null,
};

// The homepage's built-in copy. Used as the fallback everywhere content is
// unset, and as the seed values in the dashboard editor, so both stay in sync.
export const SITE_CONTENT_DEFAULTS = {
  hero_title: "شريكك في المجلس… وقسمك الرابع في السوق",
  hero_subtitle:
    "في رُبْعي نشتغل معك كأننا جزء من فريقك. نجلس في المجلس، نفهم مشروعك، ونبني تسويق يخدم النمو الحقيقي — مو مجرد حملات.",
  cta_text: "تواصل معنا",
  process_steps: [
    { title: "تحليل", description: "نفهم مشروعك من الداخل قبل ما نفكر بالسوق ونفهم جمهورك لنصنع رسالة تناسبهم." },
    { title: "تخطيط", description: "نبني استراتيجية واضحة مبنية على أرقام وواقع ونصمم خطة اتصال واضحة تخاطب الجمهور بفعالية." },
    { title: "تنفيذ", description: "نصمم هوية، ونقدم محتوى مبدعاً وعالي الجودة يلفت الانتباه ويؤثر في أنظمة التسويق." },
    { title: "تحسين", description: "نراقب النتائج ونحسن أداءنا باستمرار لضمان النجاح." },
  ] as ProcessStep[],
  partners: [
    "شركة النخبة", "مجموعة الريادة", "تقنية المستقبل", "منصة ابتكار",
    "حلول رقمية", "شركة الأفق", "مؤسسة البناء", "شركة المسار",
  ],
};

const CONTENT_COLUMNS = "hero_title, hero_subtitle, cta_text, process_steps, partners";

// Homepage-editable content lives on the store_settings singleton (same row as
// social links + invoice business info). Public read + manager write already
// exist on that table — see docs/sql/2026-07-14-site-content.sql.
export const siteContentService = {
  async getSiteContent(): Promise<SiteContent> {
    if (!supabase) return EMPTY;

    const { data, error } = await supabase
      .from("store_settings")
      .select(CONTENT_COLUMNS)
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    if (!data) return EMPTY;

    return {
      hero_title: data.hero_title ?? null,
      hero_subtitle: data.hero_subtitle ?? null,
      cta_text: data.cta_text ?? null,
      process_steps: (data.process_steps as ProcessStep[] | null) ?? null,
      partners: (data.partners as string[] | null) ?? null,
    };
  },

  async updateSiteContent(input: Partial<SiteContent>) {
    if (!supabase) throw new Error("SUPABASE_UNAVAILABLE");

    // store_settings is a singleton: update the existing row, or insert one if
    // this is a brand-new project with no settings row yet.
    const { data: existing, error: findError } = await supabase
      .from("store_settings")
      .select("id")
      .limit(1)
      .maybeSingle();
    if (findError) throw findError;

    if (existing?.id) {
      const { error } = await supabase.from("store_settings").update(input).eq("id", existing.id);
      if (error) throw error;
    } else {
      const { error } = await supabase.from("store_settings").insert([input]);
      if (error) throw error;
    }
  },
};
