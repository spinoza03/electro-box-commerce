import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { StoreLayout } from "@/components/StoreLayout";
import { HtmlContent } from "@/components/HtmlContent";
import { useT } from "@/lib/i18n";
import {
  ShoppingBag,
  ShieldCheck,
  Truck,
  Package,
  Star,
  BadgeCheck,
  ChevronLeft,
} from "lucide-react";

export const Route = createFileRoute("/p/$slug")({
  component: ProductPage,
});

function ProductPage() {
  const { slug } = Route.useParams();
  const { t, lang, dir } = useT();
  const [imgIdx, setImgIdx] = useState(0);

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("slug", slug)
        .eq("is_active", true)
        .maybeSingle();
      if (error) throw error;
      if (!data) throw notFound();
      return data;
    },
  });

  if (isLoading) {
    return (
      <StoreLayout>
        <div className="container py-32 text-center">
          <div className="h-8 w-8 border-2 border-[var(--cyan-bright)] border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      </StoreLayout>
    );
  }
  if (!product) return null;

  const name =
    lang === "ar" && product.name_ar ? product.name_ar : product.name;
  const shortDesc =
    lang === "ar" && product.short_description_ar
      ? product.short_description_ar
      : product.short_description;
  const html =
    lang === "ar" && product.html_description_ar
      ? product.html_description_ar
      : product.html_description;
  const inStock = product.stock_count > 0;
  const hasDiscount =
    product.compare_at_price &&
    Number(product.compare_at_price) > Number(product.price);
  const discount = hasDiscount
    ? Math.round(
        ((Number(product.compare_at_price) - Number(product.price)) /
          Number(product.compare_at_price)) *
          100
      )
    : 0;

  return (
    <StoreLayout>
      <div dir={dir} className="container mx-auto px-4 md:px-6 pt-24 md:pt-28 pb-16">
        {/* Breadcrumb */}
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-[var(--cyan-bright)] transition-colors mb-6"
        >
          <ChevronLeft className="h-4 w-4" />
          {lang === "ar" ? "العودة للمتجر" : "Retour à la boutique"}
        </Link>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* ── Images ── */}
          <div className="space-y-3">
            <div className="aspect-square bg-muted rounded-2xl overflow-hidden border border-border/60 relative">
              {hasDiscount && (
                <div className="absolute top-3 left-3 z-10 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow-lg">
                  -{discount}%
                </div>
              )}
              {product.images?.[imgIdx] ? (
                <img
                  src={product.images[imgIdx]}
                  alt={name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="h-16 w-16 text-muted-foreground/20" />
                </div>
              )}
            </div>
            {product.images && product.images.length > 1 && (
              <div className="flex gap-2.5">
                {product.images.map((src: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => setImgIdx(i)}
                    className={`h-16 w-16 md:h-20 md:w-20 rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                      i === imgIdx
                        ? "border-[var(--cyan-bright)] shadow-[0_0_0_2px_rgba(0,210,255,0.2)]"
                        : "border-border/40 hover:border-border"
                    }`}
                  >
                    <img
                      src={src}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Details ── */}
          <div>
            {/* Category */}
            {product.category && (
              <span className="text-xs font-semibold uppercase tracking-widest text-[var(--cyan-bright)]">
                {product.category}
              </span>
            )}

            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[var(--navy-deep)] mt-1 tracking-tight leading-tight">
              {name}
            </h1>

            {/* Rating placeholder for social proof */}
            <div className="flex items-center gap-2 mt-3">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 text-amber-400 fill-amber-400"
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">
                (127 {lang === "ar" ? "تقييم" : "avis"})
              </span>
            </div>

            {/* Price */}
            <div className="mt-5 flex items-baseline gap-3">
              <span className="text-3xl md:text-4xl font-extrabold text-[var(--navy-deep)]">
                {Number(product.price).toFixed(0)}
                <span className="text-lg font-bold ml-1">MAD</span>
              </span>
              {hasDiscount && (
                <span className="text-lg text-muted-foreground line-through">
                  {Number(product.compare_at_price).toFixed(0)} MAD
                </span>
              )}
              {hasDiscount && (
                <span className="text-sm font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-md">
                  -{discount}%
                </span>
              )}
            </div>

            {/* Short description */}
            {shortDesc && (
              <p className="mt-4 text-muted-foreground text-sm leading-relaxed">
                {shortDesc}
              </p>
            )}

            {/* Stock */}
            <div className="mt-4">
              <span
                className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${
                  inStock
                    ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                    : "bg-red-50 text-red-600 border border-red-200"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    inStock ? "bg-emerald-500" : "bg-red-500"
                  }`}
                />
                {inStock ? t("product.inStock") : t("product.outOfStock")}
              </span>
            </div>

            {/* Trust badges */}
            <div className="mt-5 flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Truck className="h-4 w-4 text-[var(--cyan-bright)]" />{" "}
                {lang === "ar" ? "توصيل 24-72 ساعة" : "Livraison 24-72h"}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-[var(--cyan-bright)]" />{" "}
                {lang === "ar" ? "الدفع عند الاستلام" : "Paiement à la livraison"}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <BadgeCheck className="h-4 w-4 text-[var(--cyan-bright)]" />{" "}
                {lang === "ar" ? "جودة مضمونة" : "Qualité garantie"}
              </span>
            </div>

            {/* CTA */}
            {inStock && (
              <Link
                to="/checkout/$slug"
                params={{ slug: product.slug }}
                className="btn-bolt mt-8 inline-flex items-center gap-2.5 px-8 py-4 rounded-xl text-base w-full md:w-auto justify-center"
              >
                <ShoppingBag className="h-5 w-5" /> {t("product.buy")}
              </Link>
            )}

            {/* HTML Description */}
            {html && (
              <div className="mt-10 pt-8 border-t border-border/60">
                <h2 className="text-lg font-bold mb-4 text-[var(--navy-deep)]">
                  {lang === "ar" ? "التفاصيل" : "Détails du produit"}
                </h2>
                <HtmlContent html={html} />
              </div>
            )}
          </div>
        </div>
      </div>
    </StoreLayout>
  );
}
