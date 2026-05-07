import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { StoreLayout } from "@/components/StoreLayout";
import { HtmlContent } from "@/components/HtmlContent";
import { useT } from "@/lib/i18n";
import { ShoppingBag, ShieldCheck, Truck } from "lucide-react";

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
    return <StoreLayout><div className="container py-20 text-center text-muted-foreground">…</div></StoreLayout>;
  }
  if (!product) return null;

  const name = lang === "ar" && product.name_ar ? product.name_ar : product.name;
  const html = lang === "ar" && product.html_description_ar ? product.html_description_ar : product.html_description;
  const inStock = product.stock_count > 0;

  return (
    <StoreLayout>
      <div dir={dir} className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <div className="aspect-square bg-muted rounded-xl overflow-hidden border">
              {product.images?.[imgIdx] && (
                <img src={product.images[imgIdx]} alt={name} className="w-full h-full object-cover" />
              )}
            </div>
            {product.images && product.images.length > 1 && (
              <div className="flex gap-2 mt-3">
                {product.images.map((src, i) => (
                  <button
                    key={i}
                    onClick={() => setImgIdx(i)}
                    className={`h-16 w-16 rounded-md overflow-hidden border-2 ${i === imgIdx ? "border-[var(--cyan-bright)]" : "border-transparent"}`}
                  >
                    <img src={src} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <h1 className="text-3xl font-bold text-[var(--navy-deep)]">{name}</h1>
            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-3xl font-extrabold text-[var(--navy-deep)]">{Number(product.price).toFixed(2)} MAD</span>
              {product.compare_at_price && (
                <span className="text-lg text-muted-foreground line-through">{Number(product.compare_at_price).toFixed(2)}</span>
              )}
            </div>
            <span className={`mt-3 inline-block text-xs px-2 py-1 rounded ${inStock ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
              {inStock ? t("product.inStock") : t("product.outOfStock")}
            </span>

            <div className="mt-4 flex flex-wrap gap-3 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5"><Truck className="h-4 w-4 text-[var(--cyan-bright)]"/> 24-72h</span>
              <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-[var(--cyan-bright)]"/> COD</span>
            </div>

            {inStock && (
              <Link
                to="/checkout/$slug"
                params={{ slug: product.slug }}
                className="btn-bolt mt-6 inline-flex items-center gap-2 px-7 py-3.5 rounded-md text-base"
              >
                <ShoppingBag className="h-5 w-5" /> {t("product.buy")}
              </Link>
            )}

            {html && (
              <div className="mt-8 border-t pt-6">
                <HtmlContent html={html} />
              </div>
            )}
          </div>
        </div>
      </div>
    </StoreLayout>
  );
}
