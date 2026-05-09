import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AdminShell } from "@/components/AdminShell";
import { Plus, Pencil, Trash2, X, Check, Loader2, ArrowUp, ArrowDown } from "lucide-react";

export const Route = createFileRoute("/admin/categories")({
  component: () => <AdminShell><CategoriesPage /></AdminShell>,
});

type Category = {
  id?: string;
  slug: string;
  name: string;
  name_ar?: string | null;
  icon?: string | null;
  sort_order: number;
  is_active: boolean;
};

const empty: Category = { slug: "", name: "", name_ar: "", icon: "", sort_order: 0, is_active: true };

function CategoriesPage() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Category | null>(null);

  const { data: categories, isLoading } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("categories")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true });
      if (error) throw error;
      return (data || []) as Category[];
    },
  });

  async function remove(id: string) {
    if (!confirm("Supprimer cette catégorie ? Les produits liés ne seront pas supprimés.")) return;
    const { error } = await (supabase as any).from("categories").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Catégorie supprimée"); qc.invalidateQueries({ queryKey: ["admin-categories"] }); }
  }

  async function move(cat: Category, delta: number) {
    if (!cat.id) return;
    const { error } = await (supabase as any)
      .from("categories")
      .update({ sort_order: cat.sort_order + delta })
      .eq("id", cat.id);
    if (error) toast.error(error.message);
    else qc.invalidateQueries({ queryKey: ["admin-categories"] });
  }

  async function toggleActive(cat: Category) {
    if (!cat.id) return;
    const { error } = await (supabase as any)
      .from("categories")
      .update({ is_active: !cat.is_active })
      .eq("id", cat.id);
    if (error) toast.error(error.message);
    else qc.invalidateQueries({ queryKey: ["admin-categories"] });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--navy-deep)]">Catégories</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Organisez les catégories visibles sur la boutique.</p>
        </div>
        <button
          onClick={() => setEditing({ ...empty })}
          className="btn-bolt px-4 py-2 rounded-lg inline-flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> Nouvelle catégorie
        </button>
      </div>

      <div className="bg-card border rounded-xl overflow-hidden shadow-[var(--shadow-soft)]">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-[11px] uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="text-left p-3">Nom</th>
              <th className="text-left p-3 hidden md:table-cell">Slug</th>
              <th className="text-left p-3 hidden md:table-cell">Nom (AR)</th>
              <th className="text-center p-3">Ordre</th>
              <th className="text-center p-3">Actif</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin inline" />
              </td></tr>
            )}
            {categories?.map((c) => (
              <tr key={c.id} className="border-t hover:bg-muted/20">
                <td className="p-3 font-semibold text-[var(--navy-deep)]">{c.name}</td>
                <td className="p-3 hidden md:table-cell text-muted-foreground font-mono text-xs">{c.slug}</td>
                <td className="p-3 hidden md:table-cell text-muted-foreground" dir="rtl">{c.name_ar || "—"}</td>
                <td className="p-3 text-center">
                  <div className="inline-flex items-center gap-1">
                    <button onClick={() => move(c, -10)} className="p-1 rounded hover:bg-muted"><ArrowUp className="h-3.5 w-3.5" /></button>
                    <span className="text-xs font-mono w-8">{c.sort_order}</span>
                    <button onClick={() => move(c, 10)} className="p-1 rounded hover:bg-muted"><ArrowDown className="h-3.5 w-3.5" /></button>
                  </div>
                </td>
                <td className="p-3 text-center">
                  <button
                    onClick={() => toggleActive(c)}
                    className={`inline-flex items-center justify-center h-6 w-10 rounded-full transition-colors ${c.is_active ? "bg-emerald-500" : "bg-muted"}`}
                  >
                    <span className={`h-4 w-4 rounded-full bg-white shadow transition-transform ${c.is_active ? "translate-x-2" : "-translate-x-2"}`} />
                  </button>
                </td>
                <td className="p-3 text-right whitespace-nowrap">
                  <button onClick={() => setEditing(c)} className="p-1.5 hover:text-[var(--cyan-bright)]" title="Modifier">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button onClick={() => c.id && remove(c.id)} className="p-1.5 hover:text-destructive" title="Supprimer">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
            {!isLoading && !categories?.length && (
              <tr><td colSpan={6} className="p-10 text-center text-muted-foreground">Aucune catégorie. Créez-en une !</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {editing && (
        <CategoryDialog
          category={editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); qc.invalidateQueries({ queryKey: ["admin-categories"] }); }}
        />
      )}
    </div>
  );
}

function CategoryDialog({ category, onClose, onSaved }: { category: Category; onClose: () => void; onSaved: () => void }) {
  const [c, setC] = useState<Category>(category);
  const [saving, setSaving] = useState(false);

  function update<K extends keyof Category>(k: K, v: Category[K]) { setC((x) => ({ ...x, [k]: v })); }

  async function save() {
    if (!c.name.trim() || !c.slug.trim()) { toast.error("Nom et slug requis"); return; }
    setSaving(true);
    const payload = {
      slug: c.slug.trim(),
      name: c.name.trim(),
      name_ar: c.name_ar?.trim() || null,
      icon: c.icon?.trim() || null,
      sort_order: Number(c.sort_order) || 0,
      is_active: c.is_active,
    };
    const { error } = c.id
      ? await (supabase as any).from("categories").update(payload).eq("id", c.id)
      : await (supabase as any).from("categories").insert(payload);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Enregistré !");
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-lg border border-border/40 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="text-lg font-bold text-[var(--navy-deep)]">{c.id ? "Modifier la catégorie" : "Nouvelle catégorie"}</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-muted"><X className="h-5 w-5" /></button>
        </div>

        <div className="p-5 space-y-4">
          <Field label="Nom (FR)" value={c.name} onChange={(v) => {
            update("name", v);
            if (!c.id) update("slug", slugify(v));
          }} />
          <Field label="Nom (AR)" value={c.name_ar || ""} onChange={(v) => update("name_ar", v)} dir="rtl" />
          <Field label="Slug (URL)" value={c.slug} onChange={(v) => update("slug", slugify(v))} mono />
          <Field label="Icône (nom Lucide, optionnel)" value={c.icon || ""} onChange={(v) => update("icon", v)} placeholder="Headphones, Watch, Home..." />

          <div className="grid grid-cols-2 gap-4">
            <Field label="Ordre" type="number" value={String(c.sort_order)} onChange={(v) => update("sort_order", Number(v) || 0)} />
            <label className="flex items-end gap-2 text-sm pb-2">
              <input
                type="checkbox"
                checked={c.is_active}
                onChange={(e) => update("is_active", e.target.checked)}
                className="h-4 w-4"
              />
              Visible sur la boutique
            </label>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 p-5 border-t bg-muted/20 rounded-b-2xl">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium hover:bg-muted">Annuler</button>
          <button
            onClick={save}
            disabled={saving}
            className="btn-bolt px-5 py-2 rounded-lg text-sm font-bold inline-flex items-center gap-2 disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label, value, onChange, type = "text", placeholder, mono, dir,
}: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string; mono?: boolean; dir?: "ltr" | "rtl";
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-[var(--navy-deep)]">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        dir={dir}
        className={`mt-1.5 w-full border border-border/60 rounded-xl px-3.5 py-2.5 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[var(--cyan-bright)] focus:border-[var(--cyan-bright)] transition-all ${mono ? "font-mono text-xs" : ""}`}
      />
    </label>
  );
}

function slugify(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);
}
