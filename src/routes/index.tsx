import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { StoreLayout } from "@/components/StoreLayout";
import { useT } from "@/lib/i18n";
import { Zap, Truck, ShieldCheck, Wallet, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Electro Box Edge — Électronique haute performance · COD Maroc" },
      { name: "description", content: "Boutique d'électronique nouvelle génération au Maroc. Paiement à la livraison, expédition rapide partout au Maroc." },
      { property: "og:title", content: "Electro Box Edge" },
      { property: "og:description", content: "Électronique haute performance avec paiement à la livraison." },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const { t, lang, dir } = useT();
  const { data: products } = useQuery({
    queryKey: ["featured-products"],
    queryFn: async () => {
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .eq("is_featured", true)
        .limit(8);
      return data ?? [];
    },
  });

  return (
    <StoreLayout>
      <section dir={dir} className="relative overflow-hidden text-white slant-cut" style={{ backgroundImage: "var(--gradient-hero)" }}>
        <div className="absolute -right-32 -top-32 w-[500px] h-[500px] rounded-full opacity-20 blur-3xl" style={{ backgroundImage: "var(--gradient-bolt)" }} />
        <div className="container mx-auto px-4 py-20 md:py-28 relative">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-[var(--cyan-bright)]/40 text-xs uppercase tracking-wider text-[var(--cyan-bright)]">
            <Zap className="h-3.5 w-3.5" /> {t("hero.badge")}
          </span>
          <h1 className="mt-6 text-4xl md:text-6xl font-extrabold leading-tight max-w-3xl">
            {t("hero.title")}
          </h1>
          <p className="mt-4 text-lg text-white/80 max-w-xl">{t("hero.subtitle")}</p>
          <a href="#featured" className="btn-bolt mt-8 inline-flex items-center gap-2 px-7 py-3.5 rounded-md">
            {t("hero.cta")} <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </section>

      <section dir={dir} className="container mx-auto px-4 py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">{t("why.title")}</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { Icon: Wallet, k: "cod" },
            { Icon: Truck, k: "fast" },
            { Icon: ShieldCheck, k: "quality" },
          ].map(({ Icon, k }) => (
            <div key={k} className="card-hover bg-card border rounded-xl p-6 shadow-[var(--shadow-soft)]">
              <div className="h-12 w-12 rounded-lg flex items-center justify-center mb-4" style={{ backgroundImage: "var(--gradient-bolt)" }}>
                <Icon className="h-6 w-6 text-[var(--navy-deep)]" />
              </div>
              <h3 className="font-bold text-lg">{t(`why.${k}.title`)}</h3>
              <p className="text-muted-foreground mt-1 text-sm">{t(`why.${k}.body`)}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="featured" dir={dir} className="container mx-auto px-4 py-12">
        <h2 className="text-2xl md:text-3xl font-bold mb-8">{t("featured.title")}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {products?.map((p) => {
            const name = lang === "ar" && p.name_ar ? p.name_ar : p.name;
            return (
              <Link
                key={p.id}
                to="/p/$slug"
                params={{ slug: p.slug }}
                className="card-hover group block bg-card border rounded-xl overflow-hidden shadow-[var(--shadow-soft)]"
              >
                <div className="aspect-square bg-muted overflow-hidden">
                  {p.images?.[0] && (
                    <img src={p.images[0]} alt={name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  )}
                </div>
                <div className="p-3">
                  <h3 className="font-semibold text-sm line-clamp-2 min-h-[2.5em]">{name}</h3>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="font-bold text-[var(--navy-deep)]">{Number(p.price).toFixed(2)} MAD</span>
                    {p.compare_at_price && (
                      <span className="text-xs text-muted-foreground line-through">{Number(p.compare_at_price).toFixed(2)}</span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
          {products?.length === 0 && (
            <p className="col-span-full text-center text-muted-foreground py-12">—</p>
          )}
        </div>
      </section>
    </StoreLayout>
  );
}
