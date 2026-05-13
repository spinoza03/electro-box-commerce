import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { StoreLayout } from "@/components/StoreLayout";
import { useT } from "@/lib/i18n";
import { trackViewLandingPage } from "@/lib/pixel";
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
  LayoutGrid,
  Headphones,
  Watch,
  Home as HomeIcon,
  Bike,
  Camera,
  Tag as TagIcon,
} from "lucide-react";

// Maps a category slug to a Lucide icon. Falls back to Tag.
const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  audio: Headphones,
  montres: Watch,
  maison: HomeIcon,
  mobilite: Bike,
  photo: Camera,
};
function iconForCategory(slug?: string | null) {
  if (!slug) return TagIcon;
  return CATEGORY_ICONS[slug.toLowerCase()] ?? TagIcon;
}

type Category = { id: string; slug: string; name: string; name_ar?: string | null; icon?: string | null };

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
  const [selectedCat, setSelectedCat] = useState<string>("");

  useEffect(() => {
    // Wait a tick so the pixel script has a chance to inject before we fire.
    const id = setTimeout(() => trackViewLandingPage(), 800);
    return () => clearTimeout(id);
  }, []);

  // Categories
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("categories")
        .select("id, slug, name, name_ar, icon")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      return (data || []) as Category[];
    },
  });

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

  const filteredProducts = selectedCat
    ? (allProducts ?? []).filter((p: any) => (p.category || "").toLowerCase() === selectedCat)
    : (allProducts ?? []);

  return (
    <StoreLayout>
      {/* ═══ HERO ═══ */}
      <section
        dir={dir}
        className="relative overflow-hidden text-white bg-[var(--navy-deep)]"
      >
        {/* Animated logo background video */}
        <video
          src="/logo-anime.mp4"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          poster="/logo.png"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />

        {/* Dark overlay so the text stays readable on top of the video */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(160deg, rgba(10,25,47,0.78) 0%, rgba(10,25,47,0.55) 50%, rgba(10,25,47,0.85) 100%)",
          }}
        />

        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        <div className="container mx-auto px-4 md:px-6 pt-24 pb-20 md:pt-28 md:pb-24 relative">
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

          <h1 className="mt-6 text-4xl sm:text-5xl md:text-[3.5rem] lg:text-6xl font-extrabold leading-[1.05] max-w-3xl tracking-tight">
            {lang === "ar" ? (
              <>إلكترونيات <span className="text-[var(--cyan-bright)]">الجيل الجديد</span>، تصلك إلى باب منزلك.</>
            ) : (
              <>L'électronique <span className="text-[var(--cyan-bright)]">nouvelle génération</span>, livrée chez vous.</>
            )}
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

        </div>

      </section>

      {/* ═══ TRUST STRIP ═══ */}
      <section dir={dir} className="relative z-10 -mt-10 md:-mt-14">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {[
              { Icon: Wallet, title: lang === "ar" ? "الدفع عند الاستلام" : "COD", sub: lang === "ar" ? "الدفع عند الاستلام" : "Paiement à la livraison" },
              { Icon: Truck, title: "24-72h", sub: lang === "ar" ? "في جميع المغرب" : "Tout le Maroc" },
              { Icon: BadgeCheck, title: lang === "ar" ? "جودة" : "Qualité", sub: lang === "ar" ? "منتجات مختارة" : "Produits sélectionnés" },
              { Icon: Package, title: lang === "ar" ? "إرجاع" : "Retour", sub: lang === "ar" ? "خلال 7 أيام" : "Sous 7 jours" },
            ].map(({ Icon, title, sub }) => (
              <div
                key={title}
                className="bg-white rounded-2xl p-4 md:p-5 border border-border/40 shadow-[0_8px_24px_-12px_rgba(10,25,47,0.18)] flex flex-col items-center text-center gap-2 hover:-translate-y-1 transition-transform duration-300"
              >
                <div className="h-11 w-11 rounded-full flex items-center justify-center bg-[var(--cyan-bright)]/12 text-[var(--cyan-bright)]">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="text-sm font-bold text-[var(--navy-deep)]">{title}</div>
                <div className="text-[11px] md:text-xs text-muted-foreground leading-tight">{sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CATEGORIES ═══ */}
      {categories && categories.length > 0 && (
        <section dir={dir} className="container mx-auto px-4 md:px-6 pt-12 md:pt-16">
          <div className="flex items-end justify-between mb-5">
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-[var(--cyan-bright)]">
                {lang === "ar" ? "الفئات" : "Catégories"}
              </span>
              <h2 className="text-2xl md:text-3xl font-bold mt-1 tracking-tight text-[var(--navy-deep)]">
                {lang === "ar" ? "استكشف" : "Explorer"}
              </h2>
            </div>
            {selectedCat && (
              <button
                onClick={() => setSelectedCat("")}
                className="text-xs md:text-sm font-medium text-muted-foreground hover:text-[var(--navy-deep)] underline"
              >
                {lang === "ar" ? "إعادة تعيين" : "Réinitialiser"}
              </button>
            )}
          </div>

          {/* Horizontal scroll on mobile, wrap on desktop */}
          <div className="flex gap-3 overflow-x-auto md:flex-wrap md:overflow-visible pb-3 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-thin">
            {/* "Tout" pill */}
            <CategoryPill
              icon={LayoutGrid}
              label={lang === "ar" ? "الكل" : "Tout"}
              active={selectedCat === ""}
              onClick={() => setSelectedCat("")}
            />
            {categories.map((c) => (
              <CategoryPill
                key={c.id}
                icon={iconForCategory(c.slug)}
                label={lang === "ar" && c.name_ar ? c.name_ar : c.name}
                active={selectedCat === c.slug}
                onClick={() => {
                  setSelectedCat(c.slug);
                  if (typeof document !== "undefined") {
                    document.getElementById("products")?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }
                }}
              />
            ))}
          </div>
        </section>
      )}

      {/* ═══ FEATURED PRODUCTS ═══ */}
      {hasFeatured && !selectedCat && (
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
        <div className="flex items-end justify-between mb-8 gap-4 flex-wrap">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-[var(--cyan-bright)]">
              🛒 {lang === "ar" ? "تسوق الآن" : "Boutique"}
            </span>
            <h2 className="text-2xl md:text-3xl font-bold mt-1 tracking-tight">
              {selectedCat
                ? (categories?.find((c) => c.slug === selectedCat) &&
                    (lang === "ar"
                      ? (categories.find((c) => c.slug === selectedCat)!.name_ar || categories.find((c) => c.slug === selectedCat)!.name)
                      : categories.find((c) => c.slug === selectedCat)!.name))
                : t("nav.products")}
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              {filteredProducts.length} {lang === "ar" ? "منتج" : "produits"}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
          {filteredProducts.map((p: any) => (
            <ProductCard key={p.id} product={p} lang={lang} t={t} />
          ))}
        </div>
        {filteredProducts.length === 0 && (
          <div className="text-center py-20">
            <Package className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">
              {selectedCat
                ? (lang === "ar" ? "لا توجد منتجات في هذه الفئة" : "Aucun produit dans cette catégorie")
                : (lang === "ar" ? "لا توجد منتجات حاليًا" : "Aucun produit pour le moment")}
            </p>
            {selectedCat && (
              <button
                onClick={() => setSelectedCat("")}
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--cyan-bright)] hover:underline"
              >
                {lang === "ar" ? "عرض كل المنتجات" : "Voir tous les produits"} <ArrowRight className="h-3.5 w-3.5" />
              </button>
            )}
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
  const createdAt = p.created_at ? new Date(p.created_at).getTime() : 0;
  const isNew = createdAt && Date.now() - createdAt < 1000 * 60 * 60 * 24 * 21;

  return (
    <Link
      to="/p/$slug"
      params={{ slug: p.slug }}
      className="group relative bg-card rounded-2xl overflow-hidden border border-border/60 hover:border-[var(--cyan-bright)]/40 transition-all duration-300 hover:shadow-[0_16px_40px_-16px_rgba(10,25,47,0.25)]"
    >
      {/* Badges */}
      <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1.5 items-start">
        {hasDiscount && (
          <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-lg">
            -{discount}%
          </span>
        )}
        {isNew && (
          <span className="bg-white/95 text-[var(--navy-deep)] text-[9px] font-bold tracking-wider px-2 py-0.5 rounded-md shadow uppercase">
            {lang === "ar" ? "جديد" : "Nouveau"}
          </span>
        )}
      </div>

      {/* Image with subtle cyan→navy gradient backdrop (matches PDF) */}
      <div
        className="aspect-square overflow-hidden relative"
        style={{
          background:
            "linear-gradient(160deg, rgba(0,210,255,0.10) 0%, rgba(10,25,47,0.06) 100%)",
        }}
      >
        {p.images?.[0] ? (
          <img
            src={p.images[0]}
            alt={name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-[1.06] transition-transform duration-500 ease-out"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="h-12 w-12 text-[var(--navy-deep)]/25" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3.5">
        <h3 className="font-bold text-sm line-clamp-2 min-h-[2.5rem] text-[var(--navy-deep)] group-hover:text-[var(--navy-deep)] transition-colors">
          {name}
        </h3>

        {/* Rating row */}
        <div className="mt-1.5 flex items-center gap-1 text-[11px] text-muted-foreground">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-3 w-3 text-amber-400 fill-amber-400" />
            ))}
          </div>
          <span className="font-semibold text-[var(--navy-deep)]">
            {(p.rating ?? 4.7).toFixed?.(1) ?? "4.7"}
          </span>
          <span>· {p.review_count ?? 127}</span>
        </div>

        <div className="mt-2 flex items-baseline gap-2">
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

/* ── Category Pill (matches PDF screen 01) ── */
function CategoryPill({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-shrink-0 flex flex-col items-center justify-center gap-2 w-[88px] md:w-[104px] h-[88px] md:h-[104px] rounded-2xl border transition-all duration-300 group ${
        active
          ? "bg-[var(--navy-deep)] border-[var(--navy-deep)] text-white shadow-[0_12px_28px_-12px_rgba(10,25,47,0.45)]"
          : "bg-white border-border/50 text-[var(--navy-deep)] hover:border-[var(--cyan-bright)]/50 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-16px_rgba(10,25,47,0.25)]"
      }`}
    >
      <div
        className={`h-10 w-10 rounded-full flex items-center justify-center transition-colors ${
          active
            ? "bg-[var(--cyan-bright)]/20 text-[var(--cyan-bright)]"
            : "bg-[var(--cyan-bright)]/12 text-[var(--cyan-bright)] group-hover:bg-[var(--cyan-bright)]/20"
        }`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <span className="text-xs font-bold tracking-tight max-w-full px-2 truncate">{label}</span>
    </button>
  );
}
