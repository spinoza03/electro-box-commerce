import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AdminShell } from "@/components/AdminShell";
import { Plus, Pencil, Trash2, X } from "lucide-react";

export const Route = createFileRoute("/admin/products")({
  component: () => <AdminShell><ProductsPage /></AdminShell>,
});

type Product = {
  id?: string;
  name: string;
  name_ar?: string | null;
  slug: string;
  price: number;
  compare_at_price?: number | null;
  stock_count: number;
  category?: string | null;
  short_description?: string | null;
  short_description_ar?: string | null;
  html_description?: string | null;
  html_description_ar?: string | null;
  images: string[];
  is_active: boolean;
  is_featured: boolean;
};

const empty: Product = {
  name: "", slug: "", price: 0, stock_count: 0, images: [], is_active: true, is_featured: false,
};

function ProductsPage() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Product | null>(null);
  const { data: products } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data } = await supabase.from("products").select("*").order("created_at", { ascending: false });
      return (data || []) as Product[];
    },
  });

  async function remove(id: string) {
    if (!confirm("Supprimer ce produit ?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Supprimé"); qc.invalidateQueries({ queryKey: ["admin-products"] }); }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Produits</h1>
        <button onClick={() => setEditing({ ...empty })} className="btn-bolt px-4 py-2 rounded-md inline-flex items-center gap-2">
          <Plus className="h-4 w-4" /> Nouveau
        </button>
      </div>

      <div className="bg-card border rounded-xl overflow-hidden shadow-[var(--shadow-soft)]">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-3">Produit</th>
              <th className="text-right p-3">Prix</th>
              <th className="text-right p-3">Stock</th>
              <th className="text-center p-3">Actif</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {products?.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    {p.images?.[0] && <img src={p.images[0]} alt="" className="h-10 w-10 rounded object-cover" />}
                    <div>
                      <div className="font-medium">{p.name}</div>
                      <div className="text-xs text-muted-foreground">/{p.slug}</div>
                    </div>
                  </div>
                </td>
                <td className="text-right p-3">{Number(p.price).toFixed(2)}</td>
                <td className="text-right p-3">{p.stock_count}</td>
                <td className="text-center p-3">{p.is_active ? "✓" : "—"}</td>
                <td className="p-3 text-right whitespace-nowrap">
                  <button onClick={() => setEditing(p)} className="p-1.5 hover:text-[var(--cyan-bright)]"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => p.id && remove(p.id)} className="p-1.5 hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
            {!products?.length && <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Aucun produit</td></tr>}
          </tbody>
        </table>
      </div>

      {editing && <ProductDialog product={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); qc.invalidateQueries({ queryKey: ["admin-products"] }); }} />}
    </div>
  );
}

function ProductDialog({ product, onClose, onSaved }: { product: Product; onClose: () => void; onSaved: () => void }) {
  const [p, setP] = useState<Product>(product);
  const [imgs, setImgs] = useState((product.images || []).join("\n"));
  const [saving, setSaving] = useState(false);

  function update<K extends keyof Product>(k: K, v: Product[K]) { setP((x) => ({ ...x, [k]: v })); }

  async function save() {
    if (!p.name || !p.slug) { toast.error("Nom et slug requis"); return; }
    setSaving(true);
    const payload = { ...p, images: imgs.split("\n").map((s) => s.trim()).filter(Boolean), price: Number(p.price), stock_count: Number(p.stock_count), compare_at_price: p.compare_at_price ? Number(p.compare_at_price) : null };
    const { error } = p.id
      ? await supabase.from("products").update(payload).eq("id", p.id)
      : await supabase.from("products").insert(payload);
    setSaving(false);
    if (error) toast.error(error.message);
    else { toast.success("Enregistré"); onSaved(); }
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-card rounded-xl shadow-2xl max-w-3xl w-full my-8 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-card border-b p-4 flex items-center justify-between">
          <h2 className="font-bold">{p.id ? "Modifier" : "Nouveau"} produit</h2>
          <button onClick={onClose}><X className="h-5 w-5" /></button>
        </div>
        <div className="p-4 grid md:grid-cols-2 gap-4">
          <Field label="Nom (FR)" value={p.name} onChange={(v) => { update("name", v); if (!p.id) update("slug", slugify(v)); }} />
          <Field label="Nom (AR)" value={p.name_ar || ""} onChange={(v) => update("name_ar", v)} />
          <Field label="Slug (URL)" value={p.slug} onChange={(v) => update("slug", slugify(v))} />
          <Field label="Catégorie" value={p.category || ""} onChange={(v) => update("category", v)} />
          <Field label="Prix (MAD)" type="number" value={String(p.price)} onChange={(v) => update("price", Number(v))} />
          <Field label="Prix barré" type="number" value={p.compare_at_price ? String(p.compare_at_price) : ""} onChange={(v) => update("compare_at_price", v ? Number(v) : null)} />
          <Field label="Stock" type="number" value={String(p.stock_count)} onChange={(v) => update("stock_count", Number(v))} />
          <div className="flex items-end gap-4">
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={p.is_active} onChange={(e) => update("is_active", e.target.checked)} /> Actif</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={p.is_featured} onChange={(e) => update("is_featured", e.target.checked)} /> Vedette</label>
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-medium">Images (URLs, une par ligne)</label>
            <textarea value={imgs} onChange={(e) => setImgs(e.target.value)} rows={3} className="mt-1 w-full border rounded-md px-3 py-2 bg-background font-mono text-xs" />
          </div>
          <Field label="Description courte (FR)" value={p.short_description || ""} onChange={(v) => update("short_description", v)} textarea />
          <Field label="Description courte (AR)" value={p.short_description_ar || ""} onChange={(v) => update("short_description_ar", v)} textarea />
          <div className="md:col-span-2">
            <label className="text-sm font-medium">Description HTML (FR) — supports h1, h2, ul, img, etc.</label>
            <textarea value={p.html_description || ""} onChange={(e) => update("html_description", e.target.value)} rows={6} className="mt-1 w-full border rounded-md px-3 py-2 bg-background font-mono text-xs" placeholder="<h2>Caractéristiques</h2>..." />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-medium">Description HTML (AR)</label>
            <textarea value={p.html_description_ar || ""} onChange={(e) => update("html_description_ar", e.target.value)} rows={6} className="mt-1 w-full border rounded-md px-3 py-2 bg-background font-mono text-xs" dir="rtl" />
          </div>
        </div>
        <div className="sticky bottom-0 bg-card border-t p-4 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded border">Annuler</button>
          <button onClick={save} disabled={saving} className="btn-bolt px-5 py-2 rounded">{saving ? "…" : "Enregistrer"}</button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", textarea }: { label: string; value: string; onChange: (v: string) => void; type?: string; textarea?: boolean }) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      {textarea ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={2} className="mt-1 w-full border rounded-md px-3 py-2 bg-background" />
      ) : (
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full border rounded-md px-3 py-2 bg-background" />
      )}
    </label>
  );
}

function slugify(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);
}
