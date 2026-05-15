import { createFileRoute, Link, useNavigate, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect, useRef } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { StoreLayout } from "@/components/StoreLayout";
import { HtmlContent } from "@/components/HtmlContent";
import { useT } from "@/lib/i18n";
import { trackViewContent, trackInitiateCheckout, trackConversion } from "@/lib/pixel";
import { getConversionEvent } from "@/components/PixelInjector";
import {
  ShoppingBag,
  ShieldCheck,
  Truck,
  Package,
  Star,
  BadgeCheck,
  ChevronLeft,
  MessageSquare,
  X,
  Loader2,
  Check,
} from "lucide-react";

type Variant = { name: string; name_ar?: string | null; options: string[] };

const checkoutSchema = z.object({
  customer_name: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(6).max(30),
  city: z.string().trim().min(2).max(80),
  address: z.string().trim().min(2).max(400),
  notes: z.string().max(500).optional(),
});

export const Route = createFileRoute("/p/$slug")({
  component: ProductPage,
});

function ProductPage() {
  const { slug } = Route.useParams();
  const { t, lang, dir } = useT();
  const [imgIdx, setImgIdx] = useState(0);
  const [qty, setQty] = useState(1);
  const [variantSel, setVariantSel] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const { data: product, isLoading, isError } = useQuery({
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
    retry: false,
  });

  useEffect(() => {
    if (!product) return;
    const id = setTimeout(() => {
      trackViewContent({ id: product.id, name: product.name, value: Number(product.price), currency: "MAD" });
    }, 700);
    return () => clearTimeout(id);
  }, [product]);

  if (isLoading) {
    return (
      <StoreLayout>
        <div className="container py-32 text-center">
          <div className="h-8 w-8 border-2 border-[var(--cyan-bright)] border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      </StoreLayout>
    );
  }
  if (isError || !product) {
    return (
      <StoreLayout>
        <div className="container py-32 text-center max-w-md mx-auto">
          <Package className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-[var(--navy-deep)] mb-2">
            {lang === "ar" ? "المنتج غير موجود" : "Produit introuvable"}
          </h1>
          <p className="text-sm text-muted-foreground mb-6">
            {lang === "ar"
              ? "ربما تم حذفه أو لم يعد متوفرًا."
              : "Il a peut-être été supprimé ou n'est plus disponible."}
          </p>
          <Link
            to="/"
            className="btn-bolt inline-flex items-center gap-2 px-6 py-3 rounded-xl"
          >
            <ChevronLeft className="h-4 w-4" />
            {lang === "ar" ? "العودة للمتجر" : "Retour à la boutique"}
          </Link>
        </div>
      </StoreLayout>
    );
  }

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
          <div className="space-y-3 md:sticky md:top-24 md:self-start">
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
            <div className="mt-5 flex items-baseline gap-3 flex-wrap">
              <span className={`text-3xl md:text-4xl font-extrabold ${hasDiscount ? "text-red-500" : "text-[var(--navy-deep)]"}`}>
                {Number(product.price).toFixed(0)}
                <span className="text-lg font-bold ml-1">MAD</span>
              </span>
              {hasDiscount && (
                <span className="text-lg text-muted-foreground line-through">
                  {Number(product.compare_at_price).toFixed(0)} MAD
                </span>
              )}
              {hasDiscount && (
                <span className="text-sm font-bold text-red-500 bg-red-50 border border-red-100 px-2 py-0.5 rounded-md">
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

            {/* 3-column trust card (matches design) */}
            <div className="mt-6 bg-white rounded-2xl border border-border/50 shadow-[0_8px_24px_-12px_rgba(10,25,47,0.12)] p-4 grid grid-cols-3 gap-2">
              {[
                { Icon: ShieldCheck, title: lang === "ar" ? "الدفع" : "Paiement", sub: lang === "ar" ? "عند الاستلام" : "À la livraison" },
                { Icon: Truck, title: lang === "ar" ? "التوصيل" : "Livraison", sub: "24-72h" },
                { Icon: BadgeCheck, title: lang === "ar" ? "إرجاع" : "Retour", sub: lang === "ar" ? "خلال 7 أيام" : "Sous 7 jours" },
              ].map(({ Icon, title, sub }) => (
                <div key={title} className="flex flex-col items-center text-center gap-1.5">
                  <div className="h-9 w-9 rounded-full flex items-center justify-center bg-[var(--cyan-bright)]/12 text-[var(--cyan-bright)]">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="text-xs font-bold text-[var(--navy-deep)]">{title}</div>
                  <div className="text-[10px] text-muted-foreground leading-tight">{sub}</div>
                </div>
              ))}
            </div>

            {/* Variants */}
            {product.has_variants && Array.isArray(product.variants) && product.variants.length > 0 && (
              <div className="mt-6 space-y-4">
                {(product.variants as Variant[]).map((v) => {
                  const vname = lang === "ar" && v.name_ar ? v.name_ar : v.name;
                  const selected = variantSel[v.name];
                  return (
                    <div key={v.name}>
                      <div className="text-sm font-semibold text-[var(--navy-deep)] mb-2">
                        {vname}
                        {selected && <span className="ml-2 text-[var(--cyan-bright)]">: {selected}</span>}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {v.options.map((opt) => {
                          const active = selected === opt;
                          return (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => setVariantSel((s) => ({ ...s, [v.name]: opt }))}
                              className={`px-4 py-2 rounded-xl border-2 text-sm font-semibold transition-all ${
                                active
                                  ? "bg-[var(--navy-deep)] text-white border-[var(--navy-deep)]"
                                  : "bg-white text-[var(--navy-deep)] border-border/60 hover:border-[var(--cyan-bright)]"
                              }`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Inline order form — clean bordered card, right under the price */}
            {inStock && (
              <CheckoutForm
                product={product}
                qty={qty}
                setQty={setQty}
                variantSel={variantSel}
                submitting={submitting}
                setSubmitting={setSubmitting}
                navigate={navigate}
                t={t}
                lang={lang}
              />
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

        {/* ── You may also like ── */}
        <RelatedProducts
          category={product.category}
          currentId={product.id}
          lang={lang}
        />

        {/* ── Reviews Section ── */}
        <ProductReviews productId={product.id} />
      </div>
    </StoreLayout>
  );
}

function RelatedProducts({
  category,
  currentId,
  lang,
}: {
  category: string | null | undefined;
  currentId: string;
  lang: "fr" | "ar";
}) {
  const { data: items } = useQuery({
    queryKey: ["related-products", category, currentId],
    queryFn: async () => {
      let q = supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .neq("id", currentId)
        .order("is_featured", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(10);
      if (category) q = q.eq("category", category);
      const { data } = await q;
      return data ?? [];
    },
  });

  if (!items || items.length === 0) return null;

  return (
    <section dir={lang === "ar" ? "rtl" : "ltr"} className="mt-20 pt-12 border-t border-border/60">
      <div className="mb-6">
        <span className="text-xs font-semibold uppercase tracking-widest text-[var(--cyan-bright)]">
          ⚡ {lang === "ar" ? "مقترحات" : "Suggestions"}
        </span>
        <h2 className="text-2xl md:text-3xl font-bold mt-1 tracking-tight text-[var(--navy-deep)]">
          {lang === "ar" ? "قد يعجبك أيضًا" : "Vous aimerez aussi"}
        </h2>
      </div>

      <div className="flex gap-3 md:gap-5 overflow-x-auto snap-x snap-mandatory pb-4 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-thin scroll-smooth">
        {items.map((rp: any) => {
          const rname = lang === "ar" && rp.name_ar ? rp.name_ar : rp.name;
          const rDiscount =
            rp.compare_at_price && Number(rp.compare_at_price) > Number(rp.price);
          const rPct = rDiscount
            ? Math.round(
                ((Number(rp.compare_at_price) - Number(rp.price)) /
                  Number(rp.compare_at_price)) *
                  100
              )
            : 0;
          return (
            <Link
              key={rp.id}
              to="/p/$slug"
              params={{ slug: rp.slug }}
              className="product-glow group snap-start shrink-0 w-[46%] sm:w-[40%] md:w-[240px] bg-card rounded-2xl overflow-hidden border border-border/60"
            >
              <div
                className="aspect-square overflow-hidden relative"
                style={{
                  background:
                    "linear-gradient(160deg, rgba(0,210,255,0.10) 0%, rgba(10,25,47,0.06) 100%)",
                }}
              >
                {rDiscount && (
                  <span className="absolute top-2.5 left-2.5 z-10 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-lg">
                    -{rPct}%
                  </span>
                )}
                {rp.images?.[0] ? (
                  <img
                    src={rp.images[0]}
                    alt={rname}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-[1.06] transition-transform duration-500 ease-out"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="h-10 w-10 text-[var(--navy-deep)]/25" />
                  </div>
                )}
              </div>
              <div className="p-3.5">
                <h3 className="font-bold text-sm line-clamp-2 min-h-[2.5rem] text-[var(--navy-deep)]">
                  {rname}
                </h3>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-base font-extrabold text-[var(--navy-deep)]">
                    {Number(rp.price).toFixed(0)}
                    <span className="text-[11px] font-semibold ml-0.5">MAD</span>
                  </span>
                  {rDiscount && (
                    <span className="text-xs text-muted-foreground line-through">
                      {Number(rp.compare_at_price).toFixed(0)}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function ProductReviews({ productId }: { productId: string }) {
  const { t, lang, dir } = useT();
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ user_name: "", rating: 5, comment: "" });

  const { data: reviews, refetch } = useQuery({
    queryKey: ["reviews", productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_reviews")
        .select("*")
        .eq("product_id", productId)
        .eq("is_approved", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const avgRating = reviews?.length
    ? (reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : "5.0";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { error } = await supabase.from("product_reviews").insert({
        product_id: productId,
        ...formData,
        is_approved: false, // Wait for admin approval
      });
      if (error) throw error;
      import("sonner").then(({ toast }) => toast.success(lang === "ar" ? "تم إرسال تقييمك بنجاح، سيظهر بعد المراجعة" : "Avis envoyé ! Il apparaîtra après validation."));
      setShowForm(false);
      setFormData({ user_name: "", rating: 5, comment: "" });
    } catch (err: any) {
      import("sonner").then(({ toast }) => toast.error(err.message));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-20 pt-12 border-t border-border/60 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h2 className="text-2xl font-bold text-[var(--navy-deep)]">
            {lang === "ar" ? "آراء العملاء" : "Avis des clients"}
          </h2>
          <div className="flex items-center gap-3 mt-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`h-4 w-4 ${i < Math.floor(Number(avgRating)) ? "text-amber-400 fill-amber-400" : "text-muted"}`} />
              ))}
            </div>
            <span className="text-sm font-bold">{avgRating} / 5.0</span>
            <span className="text-sm text-muted-foreground">({reviews?.length || 0} {lang === "ar" ? "تقييم" : "avis"})</span>
          </div>
        </div>
        {!showForm && (
          <button 
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 bg-white border-2 border-[var(--navy-deep)] text-[var(--navy-deep)] px-6 py-3 rounded-xl font-bold hover:bg-[var(--navy-deep)] hover:text-white transition-all"
          >
            <MessageSquare className="h-4 w-4" /> {lang === "ar" ? "أضف تقييمك" : "Écrire un avis"}
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-muted/30 p-6 md:p-8 rounded-2xl border border-border/40 mb-12 animate-in slide-in-from-top-4 duration-300">
          <div className="flex justify-between items-start mb-6">
            <h3 className="font-bold text-lg">{lang === "ar" ? "اترك تقييمك" : "Donnez votre avis"}</h3>
            <button type="button" onClick={() => setShowForm(false)} className="text-muted-foreground"><X className="h-5 w-5" /></button>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">{lang === "ar" ? "الاسم الكامل" : "Nom complet"}</label>
                <input 
                  required
                  className="w-full bg-white border rounded-xl px-4 py-3 text-sm focus:ring-2 ring-[var(--cyan-bright)] outline-none"
                  value={formData.user_name}
                  onChange={e => setFormData({...formData, user_name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">{lang === "ar" ? "التقييم" : "Note"}</label>
                <div className="flex gap-2">
                  {[1,2,3,4,5].map(n => (
                    <button 
                      key={n}
                      type="button"
                      onClick={() => setFormData({...formData, rating: n})}
                      className={`p-1 transition-transform active:scale-90 ${formData.rating >= n ? "text-amber-400" : "text-muted/50"}`}
                    >
                      <Star className={`h-7 w-7 ${formData.rating >= n ? "fill-current" : ""}`} />
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">{lang === "ar" ? "تعليقك" : "Votre commentaire"}</label>
              <textarea 
                required
                rows={4}
                className="w-full bg-white border rounded-xl px-4 py-3 text-sm focus:ring-2 ring-[var(--cyan-bright)] outline-none resize-none"
                value={formData.comment}
                onChange={e => setFormData({...formData, comment: e.target.value})}
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button 
              disabled={submitting}
              className="btn-bolt px-8 py-3 rounded-xl flex items-center gap-2 disabled:opacity-50"
            >
              {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Check className="h-5 w-5" />}
              {lang === "ar" ? "إرسال التقييم" : "Envoyer l'avis"}
            </button>
          </div>
        </form>
      )}

      <div className="grid gap-6">
        {reviews?.map((review: any) => (
          <div key={review.id} className="bg-white p-6 rounded-2xl border border-border/40 shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="font-bold text-[var(--navy-deep)]">{review.user_name}</div>
                <div className="flex gap-0.5 mt-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`h-3 w-3 ${i < review.rating ? "text-amber-400 fill-amber-400" : "text-muted/30"}`} />
                  ))}
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                {new Date(review.created_at).toLocaleDateString(lang === "ar" ? "ar-MA" : "fr-FR")}
              </div>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed italic">
              "{review.comment}"
            </p>
          </div>
        ))}
        {reviews?.length === 0 && !showForm && (
          <div className="text-center py-10 bg-muted/20 rounded-2xl border border-dashed border-border/60">
            <MessageSquare className="h-10 w-10 text-muted/30 mx-auto mb-3" />
            <p className="text-muted-foreground italic">
              {lang === "ar" ? "لا توجد تعليقات بعد. كن أول من يترك رأيه!" : "Aucun avis pour le moment. Soyez le premier à donner votre avis !"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function CheckoutForm({
  product,
  qty,
  setQty,
  variantSel,
  submitting,
  setSubmitting,
  navigate,
  t,
  lang,
}: {
  product: any;
  qty: number;
  setQty: (n: number) => void;
  variantSel: Record<string, string>;
  submitting: boolean;
  setSubmitting: (b: boolean) => void;
  navigate: ReturnType<typeof useNavigate>;
  t: (k: string) => string;
  lang: "fr" | "ar";
}) {
  const total = Number(product.price) * qty;
  const requiredVariants: Variant[] = product.has_variants && Array.isArray(product.variants) ? product.variants : [];
  const missing = requiredVariants.filter((v) => !variantSel[v.name]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (missing.length) {
      toast.error(
        lang === "ar"
          ? `يرجى اختيار: ${missing.map((m) => m.name_ar || m.name).join(", ")}`
          : `Veuillez choisir : ${missing.map((m) => m.name).join(", ")}`
      );
      return;
    }
    const fd = new FormData(e.currentTarget);
    const city = String(fd.get("city") || "").trim();
    const parsed = checkoutSchema.safeParse({
      customer_name: fd.get("customer_name"),
      phone: fd.get("phone"),
      city,
      // No separate address field anymore — reuse the city so the
      // NOT NULL orders.address constraint is still satisfied.
      address: city,
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }
    setSubmitting(true);
    const payload: any = {
      ...parsed.data,
      product_id: product.id,
      product_name: product.name,
      quantity: qty,
      unit_price: product.price,
      total_price: total,
      status: "pending",
    };
    if (requiredVariants.length) payload.variant_selection = variantSel;
    const { error } = await supabase.from("orders").insert(payload);
    setSubmitting(false);
    if (error) {
      toast.error(t("checkout.error"));
      return;
    }
    toast.success(t("checkout.success"));
    trackConversion(getConversionEvent(), { value: total, currency: "MAD", id: product.id });
    setTimeout(() => navigate({ to: "/thank-you" }), 1200);
  }

  const firedRef = useRef(false);
  function onFirstInteract() {
    if (firedRef.current) return;
    firedRef.current = true;
    trackInitiateCheckout({ id: product.id, value: Number(product.price), currency: "MAD" });
  }

  return (
    <form
      onSubmit={onSubmit}
      onFocusCapture={onFirstInteract}
      className="mt-6 max-w-sm space-y-3"
    >
      {/* Quantity + total */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center border border-border/70 rounded-lg overflow-hidden">
          <button
            type="button"
            onClick={() => setQty(Math.max(1, qty - 1))}
            className="h-9 w-9 flex items-center justify-center font-bold text-[var(--navy-deep)] hover:bg-muted/60 transition-colors"
          >−</button>
          <span className="h-9 px-4 flex items-center justify-center font-bold text-[var(--navy-deep)] border-x border-border/70 min-w-[3rem]">{qty}</span>
          <button
            type="button"
            onClick={() => setQty(Math.min(product.stock_count || 50, qty + 1))}
            className="h-9 w-9 flex items-center justify-center font-bold text-[var(--navy-deep)] hover:bg-muted/60 transition-colors"
          >+</button>
        </div>
        <div className="text-right">
          <span className="text-xs text-muted-foreground">{t("checkout.total")} </span>
          <span className="text-lg font-extrabold text-[var(--navy-deep)]">
            {total.toFixed(0)} <span className="text-xs font-bold">MAD</span>
          </span>
        </div>
      </div>

      <CheckoutField label={t("checkout.name")} name="customer_name" required />
      <CheckoutField label={t("checkout.phone")} name="phone" type="tel" required inputMode="tel" />
      <CheckoutField label={t("checkout.city")} name="city" required />

      <button
        type="submit"
        disabled={submitting}
        className="btn-bolt w-full flex items-center justify-center gap-2 py-3 rounded-lg text-sm disabled:opacity-60"
      >
        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingBag className="h-4 w-4" />}
        {t("checkout.submit")}
      </button>
    </form>
  );
}

function CheckoutField({ label, name, type = "text", required, textarea, inputMode }: {
  label: string; name: string; type?: string; required?: boolean; textarea?: boolean; inputMode?: "tel" | "text" | "email";
}) {
  const cls = "w-full border border-border/60 rounded-xl px-3.5 py-3 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[var(--cyan-bright)] focus:border-[var(--cyan-bright)] transition-all";
  return (
    <label className="block">
      <span className="text-sm font-semibold text-[var(--navy-deep)]">{label}{required && <span className="text-red-500"> *</span>}</span>
      {textarea ? (
        <textarea name={name} required={required} rows={3} className={`mt-1.5 ${cls} resize-none`} />
      ) : (
        <input name={name} type={type} inputMode={inputMode} required={required} className={`mt-1.5 ${cls}`} />
      )}
    </label>
  );
}
