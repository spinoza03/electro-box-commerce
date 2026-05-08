import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, lazy, Suspense, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AdminShell } from "@/components/AdminShell";
import { Plus, Pencil, Trash2, X, Image as ImageIcon, Eye, Code as CodeIcon } from "lucide-react";
import { ImageUpload } from "@/components/ImageUpload";
import { HtmlContent } from "@/components/HtmlContent";
// ... (existing code)
import Editor from 'react-simple-wysiwyg';



function RichHtmlEditor({ label, value, onChange, isRtl }: { label: string; value: string; onChange: (v: string) => void; isRtl?: boolean }) {
  const [view, setView] = useState<"code" | "preview">("code");
  const [savedRange, setSavedRange] = useState<Range | null>(null);

  const handleSaveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      setSavedRange(sel.getRangeAt(0));
    }
  };


  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">{label}</label>
        <div className="flex items-center gap-2">
          <div className="flex border rounded-lg overflow-hidden h-8">
            <button
              onClick={() => setView("code")}
              className={`px-3 flex items-center gap-1.5 text-xs font-semibold transition-colors ${view === "code" ? "bg-[var(--navy-deep)] text-white" : "bg-muted/50 hover:bg-muted text-muted-foreground"}`}
            >
              <CodeIcon className="h-3 w-3" /> Code
            </button>
            <button
              onClick={() => setView("preview")}
              className={`px-3 flex items-center gap-1.5 text-xs font-semibold transition-colors ${view === "preview" ? "bg-[var(--navy-deep)] text-white" : "bg-muted/50 hover:bg-muted text-muted-foreground"}`}
            >
              <Eye className="h-3 w-3" /> Visuel
            </button>
          </div>
        </div>
      </div>
      
      {view === "code" ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={14}
          className={`w-full border rounded-lg px-3 py-2 bg-background font-mono text-xs focus:ring-2 focus:ring-[var(--cyan-bright)] outline-none transition-all ${isRtl ? "text-right" : ""}`}
          placeholder="<h1>Titre</h1><p>Description...</p>"
          dir={isRtl ? "rtl" : "ltr"}
        />
      ) : (
        <div className={`relative w-full border rounded-lg overflow-hidden bg-white ${isRtl ? "text-right" : ""}`} dir={isRtl ? "rtl" : "ltr"}>
          <style dangerouslySetInnerHTML={{__html: `
            .rsw-editor { min-height: 250px; border: none !important; }
            .rsw-toolbar { border-top: none !important; border-left: none !important; border-right: none !important; background: #f8fafc; border-bottom: 1px solid #e2e8f0; padding-right: 48px !important; }
          `}} />
          <div className="absolute top-1 right-2 z-10" title="Insérer une image" onMouseDown={handleSaveSelection}>
            <ImageUpload 
              label="" 
              onUpload={(url) => {
                if (savedRange) {
                  const sel = window.getSelection();
                  sel?.removeAllRanges();
                  sel?.addRange(savedRange);
                }
                document.execCommand('insertImage', false, url);
              }} 
            />
          </div>
          <Editor 
            value={value} 
            onChange={(e: any) => onChange(e.target.value)}
          />
        </div>
      )}
    </div>
  );
}

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

  if (editing) {
    return <ProductDialog product={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); qc.invalidateQueries({ queryKey: ["admin-products"] }); }} />;
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
    const { data, error } = p.id
      ? await supabase.from("products").update(payload).eq("id", p.id).select().single()
      : await supabase.from("products").insert(payload).select().single();
    setSaving(false);
    if (error) { toast.error(error.message); }
    else { 
      toast.success("Enregistré avec succès !"); 
      if (!p.id && data) update("id", data.id);
      qc.invalidateQueries({ queryKey: ["admin-products"] }); 
    }
  }

  return (
    <div className="flex flex-col h-full bg-background relative">
      <div className="sticky top-0 z-20 flex items-center justify-between mb-4 pb-4 pt-2 bg-background/95 backdrop-blur border-b">
        <div>
          <button onClick={onClose} className="text-sm text-muted-foreground hover:text-foreground mb-1 flex items-center gap-1">
            &larr; Retour aux produits
          </button>
          <h2 className="text-2xl font-bold text-[var(--navy-deep)]">{p.id ? "Modifier le" : "Nouveau"} produit</h2>
        </div>
        <div className="flex gap-2 items-center">
          {p.id && (
            <a href={`/p/${p.slug}`} target="_blank" rel="noreferrer" className="px-4 py-2 rounded-md text-sm font-medium text-[var(--navy-deep)] hover:bg-muted flex items-center gap-2">
              <Eye className="h-4 w-4" /> Voir en boutique
            </a>
          )}
          <button onClick={save} disabled={saving} className="btn-bolt px-6 py-2.5 rounded-lg font-bold shadow-md hover:shadow-lg transition-all">{saving ? "Enregistrement..." : "Enregistrer"}</button>
        </div>
      </div>
      
      <div className="bg-card border rounded-xl p-6 shadow-sm flex-1 overflow-y-auto">
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
          <div className="md:col-span-2 space-y-3">
            <ImageUpload 
              label="Ajouter une image au produit" 
              onUpload={(url) => setImgs(prev => prev ? `${prev}\n${url}` : url)} 
            />
            <div>
              <label className="text-sm font-medium">URLs des images (une par ligne)</label>
              <textarea value={imgs} onChange={(e) => setImgs(e.target.value)} rows={3} className="mt-1 w-full border rounded-md px-3 py-2 bg-background font-mono text-xs" />
            </div>
          </div>
          <Field label="Description courte (FR)" value={p.short_description || ""} onChange={(v) => update("short_description", v)} textarea />
          <Field label="Description courte (AR)" value={p.short_description_ar || ""} onChange={(v) => update("short_description_ar", v)} textarea />
          <div className="md:col-span-2">
            <RichHtmlEditor 
              label="Description HTML (FR)" 
              value={p.html_description || ""} 
              onChange={(v) => update("html_description", v)} 
            />
          </div>
          <div className="md:col-span-2">
            <RichHtmlEditor 
              label="Description HTML (AR)" 
              value={p.html_description_ar || ""} 
              onChange={(v) => update("html_description_ar", v)} 
              isRtl
            />
          </div>
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
