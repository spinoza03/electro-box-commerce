import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { StoreLayout } from "@/components/StoreLayout";
import { useT } from "@/lib/i18n";
import { Loader2, ShieldCheck, Check } from "lucide-react";

export const Route = createFileRoute("/checkout/$slug")({
  component: CheckoutPage,
});

const schema = z.object({
  customer_name: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(6).max(30),
  city: z.string().trim().min(2).max(80),
  address: z.string().trim().min(4).max(400),
  notes: z.string().max(500).optional(),
});

function CheckoutPage() {
  const { slug } = Route.useParams();
  const { t, lang, dir } = useT();
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const { data: product } = useQuery({
    queryKey: ["product-checkout", slug],
    queryFn: async () => {
      const { data } = await supabase.from("products").select("*").eq("slug", slug).maybeSingle();
      return data;
    },
  });

  if (!product) return <StoreLayout><div className="container py-20 text-center">…</div></StoreLayout>;

  const name = lang === "ar" && product.name_ar ? product.name_ar : product.name;
  const total = Number(product.price) * qty;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!product) return;
    const fd = new FormData(e.currentTarget);
    const parsed = schema.safeParse({
      customer_name: fd.get("customer_name"),
      phone: fd.get("phone"),
      city: fd.get("city"),
      address: fd.get("address"),
      notes: fd.get("notes") || undefined,
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("orders").insert({
      ...parsed.data,
      product_id: product.id,
      product_name: product.name,
      quantity: qty,
      unit_price: product.price,
      total_price: total,
      status: "pending",
    });
    setSubmitting(false);
    if (error) {
      toast.error(t("checkout.error"));
      return;
    }
    toast.success(t("checkout.success"));
    if (typeof window !== "undefined") {
      const w = window as unknown as { fbq?: (...a: unknown[]) => void; ttq?: { track?: (e: string, d?: unknown) => void } };
      w.fbq?.("track", "Purchase", { value: total, currency: "MAD" });
      w.ttq?.track?.("CompletePayment", { value: total, currency: "MAD" });
    }
    setTimeout(() => navigate({ to: "/thank-you" }), 1500);
  }

  return (
    <StoreLayout>
      <div dir={dir} className="container mx-auto px-4 pt-24 md:pt-28 pb-12 max-w-3xl">
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--navy-deep)] text-center">{t("checkout.title")}</h1>
        <p className="text-muted-foreground text-sm mt-1 text-center inline-flex items-center gap-1.5 justify-center w-full">
          <ShieldCheck className="h-4 w-4 text-[var(--cyan-bright)]" /> {t("checkout.subtitle")}
        </p>

        {/* Step indicator */}
        <div className="mt-6 flex items-center justify-center gap-2 text-xs md:text-sm">
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-full bg-[var(--navy-deep)] text-white flex items-center justify-center">
              <Check className="h-3.5 w-3.5" />
            </span>
            <span className="font-semibold text-[var(--navy-deep)]">{lang === "ar" ? "السلة" : "Panier"}</span>
          </div>
          <div className="h-px w-8 md:w-16 bg-[var(--cyan-bright)]" />
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-full bg-[var(--cyan-bright)] text-[var(--navy-deep)] flex items-center justify-center font-bold text-[11px]">2</span>
            <span className="font-semibold text-[var(--navy-deep)]">{lang === "ar" ? "التوصيل" : "Livraison"}</span>
          </div>
          <div className="h-px w-8 md:w-16 bg-border" />
          <div className="flex items-center gap-2 opacity-50">
            <span className="h-6 w-6 rounded-full border border-border text-muted-foreground flex items-center justify-center font-bold text-[11px]">3</span>
            <span className="font-medium text-muted-foreground hidden sm:inline">{lang === "ar" ? "تأكيد" : "Confirmation"}</span>
          </div>
        </div>

        <div className="mt-8 grid md:grid-cols-[1fr_320px] gap-6">
          <form onSubmit={onSubmit} className="bg-card border border-border/40 rounded-2xl p-5 md:p-6 space-y-4 shadow-[0_8px_24px_-12px_rgba(10,25,47,0.12)]">
            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground -mb-1">
              {lang === "ar" ? "معلومات التوصيل" : "Informations de livraison"}
            </div>
            <Field label={t("checkout.name")} name="customer_name" required />
            <Field label={t("checkout.phone")} name="phone" type="tel" required inputMode="tel" />
            <Field label={t("checkout.city")} name="city" required />
            <Field label={t("checkout.address")} name="address" required textarea />
            <Field label={t("checkout.notes")} name="notes" textarea />

            <button
              type="submit"
              disabled={submitting}
              className="btn-bolt w-full flex items-center justify-center gap-2 py-4 rounded-xl text-base disabled:opacity-60"
            >
              {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
              {t("checkout.submit")}
            </button>
            <p className="text-center text-xs text-muted-foreground inline-flex items-center justify-center gap-1.5 w-full">
              <ShieldCheck className="h-3.5 w-3.5 text-[var(--cyan-bright)]" />
              {lang === "ar" ? "الدفع عند الاستلام · 100% آمن" : "Paiement à la livraison · 100% sécurisé"}
            </p>
          </form>

          <aside className="bg-card border border-border/40 rounded-2xl p-5 shadow-[0_8px_24px_-12px_rgba(10,25,47,0.12)] h-fit">
            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">
              {lang === "ar" ? "طلبك" : "Votre commande"}
            </div>
            <div className="flex gap-3 items-start">
              {product.images?.[0] && (
                <img
                  src={product.images[0]}
                  alt={name}
                  className="h-16 w-16 rounded-xl object-cover border border-border/40"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm line-clamp-2 text-[var(--navy-deep)]">{name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{Number(product.price).toFixed(0)} MAD</p>
              </div>
            </div>

            <div className="mt-4">
              <label className="text-xs text-muted-foreground">{t("checkout.qty")}</label>
              <div className="flex items-center mt-1.5 bg-muted/40 rounded-xl p-1 w-fit">
                <button
                  type="button"
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="h-8 w-8 rounded-lg hover:bg-white text-[var(--navy-deep)] font-bold transition-colors"
                >−</button>
                <span className="h-8 px-4 flex items-center min-w-[3rem] justify-center font-bold text-[var(--navy-deep)]">{qty}</span>
                <button
                  type="button"
                  onClick={() => setQty(Math.min(product.stock_count || 50, qty + 1))}
                  className="h-8 w-8 rounded-lg hover:bg-white text-[var(--navy-deep)] font-bold transition-colors"
                >+</button>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-border/40 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{lang === "ar" ? "المجموع الفرعي" : "Sous-total"}</span>
                <span className="font-semibold text-[var(--navy-deep)]">{total.toFixed(0)} MAD</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{lang === "ar" ? "التوصيل" : "Livraison"}</span>
                <span className="font-bold text-emerald-600">{lang === "ar" ? "مجاني" : "Gratuite"}</span>
              </div>
              <div className="flex justify-between items-baseline pt-3 border-t border-border/40">
                <span className="font-bold text-[var(--navy-deep)]">{t("checkout.total")}</span>
                <span className="text-xl font-extrabold text-[var(--navy-deep)]">{total.toFixed(0)} <span className="text-xs">MAD</span></span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </StoreLayout>
  );
}

function Field({ label, name, type = "text", required, textarea, inputMode }: {
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
