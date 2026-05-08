import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { StoreLayout } from "@/components/StoreLayout";
import { useT } from "@/lib/i18n";
import { Loader2, ShieldCheck } from "lucide-react";

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
      <div dir={dir} className="container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--navy-deep)]">{t("checkout.title")}</h1>
        <p className="text-muted-foreground text-sm mt-1 inline-flex items-center gap-1.5">
          <ShieldCheck className="h-4 w-4 text-[var(--cyan-bright)]" /> {t("checkout.subtitle")}
        </p>

        <div className="mt-6 grid md:grid-cols-[1fr_320px] gap-6">
          <form onSubmit={onSubmit} className="bg-card border rounded-xl p-5 space-y-4 shadow-[var(--shadow-soft)]">
            <Field label={t("checkout.name")} name="customer_name" required />
            <Field label={t("checkout.phone")} name="phone" type="tel" required inputMode="tel" />
            <Field label={t("checkout.city")} name="city" required />
            <Field label={t("checkout.address")} name="address" required textarea />
            <Field label={t("checkout.notes")} name="notes" textarea />

            <button
              type="submit"
              disabled={submitting}
              className="btn-bolt w-full flex items-center justify-center gap-2 py-3.5 rounded-md text-base disabled:opacity-60"
            >
              {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
              {t("checkout.submit")}
            </button>
          </form>

          <aside className="bg-card border rounded-xl p-5 shadow-[var(--shadow-soft)] h-fit">
            <div className="flex gap-3">
              {product.images?.[0] && <img src={product.images[0]} alt={name} className="h-16 w-16 rounded object-cover" />}
              <div>
                <p className="font-semibold text-sm line-clamp-2">{name}</p>
                <p className="text-xs text-muted-foreground">{Number(product.price).toFixed(2)} MAD</p>
              </div>
            </div>
            <div className="mt-4">
              <label className="text-xs text-muted-foreground">{t("checkout.qty")}</label>
              <div className="flex items-center mt-1">
                <button type="button" onClick={() => setQty(Math.max(1, qty - 1))} className="h-9 w-9 border rounded-l">−</button>
                <span className="h-9 px-4 border-y flex items-center min-w-[3rem] justify-center">{qty}</span>
                <button type="button" onClick={() => setQty(Math.min(product.stock_count || 50, qty + 1))} className="h-9 w-9 border rounded-r">+</button>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t flex justify-between text-base">
              <span className="font-medium">{t("checkout.total")}</span>
              <span className="font-extrabold text-[var(--navy-deep)]">{total.toFixed(2)} MAD</span>
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
  const cls = "w-full border rounded-md px-3 py-2.5 bg-background focus:outline-none focus:ring-2 focus:ring-[var(--cyan-bright)]";
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}{required && <span className="text-destructive"> *</span>}</span>
      {textarea ? (
        <textarea name={name} required={required} rows={3} className={`mt-1 ${cls}`} />
      ) : (
        <input name={name} type={type} inputMode={inputMode} required={required} className={`mt-1 ${cls}`} />
      )}
    </label>
  );
}
