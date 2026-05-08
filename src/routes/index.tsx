import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { StoreLayout } from "@/components/StoreLayout";
import { useT } from "@/lib/i18n";
import {
  Zap,
  Truck,
  ShieldCheck,
  Wallet,
  ArrowRight,
  Star,
  ShoppingBag,
  Package,
  Clock,
  BadgeCheck,
} from "lucide-react";

export const Route = createFileRoute("/")(  {
  head: () => ({
    meta: [
      {
        title:
          "Electro Box Edge — Électronique haute performance · COD Maroc",
      },
      {
        name: "description",
        content:
          "Boutique d'électronique nouvelle génération au Maroc. Paiement à la livraison, expédition rapide partout au Maroc.",
      },
      { property: "og:title", content: "Electro Box Edge" },
      {
        property: "og:description",
        content:
          "Électronique haute performance avec paiement à la livraison.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const { t, lang, dir } = useT();

  // Featured products
  const { data: featured } = useQuery({
    queryKey: ["featured-products"],
    queryFn: async () => {
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .eq("is_featured", true)
        .order("created_at", { ascending: false })
        .limit(8);
      return data ?? [];
    },
  });

  // ALL active products (so newly added products always appear)
  const { data: allProducts } = useQuery({
    queryKey: ["all-products"],
    queryFn: async () => {
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(20);
      return data ?? [];
    },
  });

  const hasFeatured = featured && featured.length > 0;

  return (
    <StoreLayout>
      {/* ═══ HERO ═══ */}
      <section
        dir={dir}
        className="relative overflow-hidden text-white"
        style={{ backgroundImage: "var(--gradient-hero)" }}
      >
        {/* Animated accent orbs */}
        <div className="absolute -right-40 -top-40 w-[600px] h-[600px] rounded-full opacity-[0.08] blur-[100px] animate-pulse" style={{ background: "var(--cyan-bright)" }} />
        <div className="absolute -left-20 bottom-0 w-[400px] h-[400px] rounded-full opacity-[0.05] blur-[80px]" style={{ background: "var(--cyan-bright)" }} />

        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        <div className="container mx-auto px-4 md:px-6 pt-32 pb-20 md:pt-40 md:pb-28 relative">
          {/* Trust badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.07] border border-[var(--cyan-bright)]/30 backdrop-blur-sm">
            <div className="flex -space-x-1">
              <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
              <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
              <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
              <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
              <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
            </div>
            <span className="text-xs font-medium text-[var(--cyan-bright)] tracking-wide uppercase">
              {t("hero.badge")}
            </span>
          </div>

          <h1 className="mt-6 text-4xl sm:text-5xl md:text-[3.5rem] lg:text-6xl font-extrabold leading-[1.1] max-w-3xl tracking-tight">
            {t("hero.title")}
          </h1>
          <p className="mt-5 text-base md:text-lg text-white/70 max-w-xl leading-relaxed">
            {t("hero.subtitle")}
          </p>

          {/* CTA row */}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <a
              href="#products"
              className="btn-bolt inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl text-sm font-bold"
            >
              {t("hero.cta")}
              <ArrowRight className="h-4 w-4" />
            </a>
            <div className="flex items-center gap-3 text-white/50 text-sm">
              <span className="inline-flex items-center gap-1.5">
                <Truck className="h-4 w-4" /> 24-72h
              </span>
              <span className="w-1 h-1 rounded-full bg-white/30" />
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4" /> COD
              </span>
            </div>
          </div>

          {/* Social proof counters */}
          <div className="mt-12 grid grid-cols-3 gap-6 max-w-md">
            {[
              { value: "5000+", label: lang === "ar" ? "عميل سعيد" : "Clients satisfaits" },
              { value: "24-72h", label: lang === "ar" ? "توصيل سريع" : "Livraison rapide" },
              { value: "100%", label: lang === "ar" ? "دفع آمن" : "Paiement sécurisé" },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-2xl md:text-3xl font-extrabold text-[var(--cyan-bright)]">
                  {s.value}
                </div>
                <div className="text-xs text-white/40 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom fade edge */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* ═══ TRUST STRIP ═══ */}
      <section dir={dir} className="border-b border-border/50 bg-card/50 backdrop-blur-sm -mt-1 relative z-10">
        <div className="container mx-auto px-4 md:px-6 py-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[
              { Icon: Wallet, title: t("why.cod.title"), sub: t("why.cod.body") },
              { Icon: Truck, title: t("why.fast.title"), sub: t("why.fast.body") },
              { Icon: ShieldCheck, title: t("why.quality.title"), sub: t("why.quality.body") },
              { Icon: Package, title: lang === "ar" ? "شحن مجاني" : "Livraison gratuite", sub: lang === "ar" ? "على جميع الطلبات" : "Sur toutes les commandes" },
            ].map(({ Icon, title, sub }) => (
              <div
                key={title}
                className="flex items-start gap-3 group"
              >
                <div className="flex-shrink-0 h-10 w-10 rounded-lg flex items-center justify-center bg-[var(--cyan-bright)]/10 text-[var(--cyan-bright)] group-hover:bg-[var(--cyan-bright)]/20 transition-colors duration-300">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">{title}</div>
                  <div className="text-xs text-muted-foreground leading-snug mt-0.5 hidden md:block">{sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FEATURED PRODUCTS ═══ */}
      {hasFeatured && (
        <section dir={dir} className="container mx-auto px-4 md:px-6 pt-14 pb-4">
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-[var(--cyan-bright)]">
                ⚡ {lang === "ar" ? "الأكثر مبيعًا" : "Populaire"}
              </span>
              <h2 className="text-2xl md:text-3xl font-bold mt-1 tracking-tight">
                {t("featured.title")}
              </h2>
            </div>
            <a
              href="#products"
              className="hidden md:inline-flex items-center gap-1.5 text-sm font-medium text-[var(--cyan-bright)] hover:underline"
            >
              {lang === "ar" ? "عرض الكل" : "Voir tout"} <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} lang={lang} t={t} />
            ))}
          </div>
        </section>
      )}

      {/* ═══ ALL PRODUCTS ═══ */}
      <section id="products" dir={dir} className="container mx-auto px-4 md:px-6 pt-14 pb-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-[var(--cyan-bright)]">
              🛒 {lang === "ar" ? "تسوق الآن" : "Boutique"}
            </span>
            <h2 className="text-2xl md:text-3xl font-bold mt-1 tracking-tight">
              {t("nav.products")}
            </h2>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
          {allProducts?.map((p) => (
            <ProductCard key={p.id} product={p} lang={lang} t={t} />
          ))}
        </div>
        {allProducts?.length === 0 && (
          <div className="text-center py-20">
            <Package className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">
              {lang === "ar" ? "لا توجد منتجات حاليًا" : "Aucun produit pour le moment"}
            </p>
          </div>
        )}
      </section>

      {/* ═══ CTA BANNER ═══ */}
      <section dir={dir} className="relative overflow-hidden" style={{ backgroundImage: "var(--gradient-hero)" }}>
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="container mx-auto px-4 md:px-6 py-16 md:py-20 text-center relative">
          <h2 className="text-2xl md:text-4xl font-bold text-white max-w-2xl mx-auto leading-tight">
            {lang === "ar"
              ? "لا تفوت العروض — اطلب الآن!"
              : "Ne manquez pas nos offres — Commandez maintenant !"}
          </h2>
          <p className="mt-3 text-white/60 text-sm max-w-lg mx-auto">
            {lang === "ar"
              ? "الدفع عند الاستلام · توصيل سريع في جميع أنحاء المغرب"
              : "Paiement à la livraison · Livraison rapide partout au Maroc"}
          </p>
          <a
            href="#products"
            className="btn-bolt mt-8 inline-flex items-center gap-2.5 px-8 py-4 rounded-xl text-sm font-bold"
          >
            {t("hero.cta")} <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </section>
    </StoreLayout>
  );
}

/* ── Product Card ── */
function ProductCard({
  product: p,
  lang,
  t,
}: {
  product: any;
  lang: string;
  t: (k: string) => string;
}) {
  const name = lang === "ar" && p.name_ar ? p.name_ar : p.name;
  const hasDiscount = p.compare_at_price && Number(p.compare_at_price) > Number(p.price);
  const discount = hasDiscount
    ? Math.round(((Number(p.compare_at_price) - Number(p.price)) / Number(p.compare_at_price)) * 100)
    : 0;

  return (
    <Link
      to="/p/$slug"
      params={{ slug: p.slug }}
      className="group relative bg-card rounded-2xl overflow-hidden border border-border/60 hover:border-[var(--cyan-bright)]/30 transition-all duration-300 hover:shadow-[0_12px_40px_-12px_rgba(0,210,255,0.15)]"
    >
      {/* Discount badge */}
      {hasDiscount && (
        <div className="absolute top-2.5 left-2.5 z-10 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-lg">
          -{discount}%
        </div>
      )}

      {/* Image */}
      <div className="aspect-square bg-muted overflow-hidden">
        {p.images?.[0] ? (
          <img
            src={p.images[0]}
            alt={name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-[1.06] transition-transform duration-500 ease-out"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="h-10 w-10 text-muted-foreground/20" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3.5">
        <h3 className="font-semibold text-sm line-clamp-2 min-h-[2.5rem] text-foreground/90 group-hover:text-foreground transition-colors">
          {name}
        </h3>
        <div className="mt-2.5 flex items-baseline gap-2">
          <span className="text-base font-extrabold text-[var(--navy-deep)]">
            {Number(p.price).toFixed(0)}
            <span className="text-[11px] font-semibold ml-0.5">MAD</span>
          </span>
          {hasDiscount && (
            <span className="text-xs text-muted-foreground line-through">
              {Number(p.compare_at_price).toFixed(0)}
            </span>
          )}
        </div>

        {/* Quick CTA */}
        <div className="mt-3">
          <span className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold py-2 rounded-lg bg-[var(--navy-deep)] text-white group-hover:bg-[var(--cyan-bright)] group-hover:text-[var(--navy-deep)] transition-all duration-300">
            <ShoppingBag className="h-3.5 w-3.5" />
            {t("product.buy")}
          </span>
        </div>
      </div>
    </Link>
  );
}
