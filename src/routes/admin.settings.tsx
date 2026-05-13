import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AdminShell } from "@/components/AdminShell";
import { Save, Facebook, Music2, BarChart3 } from "lucide-react";

export const Route = createFileRoute("/admin/settings")({
  component: () => <AdminShell><SettingsPage /></AdminShell>,
});

type FieldDef =
  | { kind: "input"; key: string; label: string; placeholder?: string; Icon?: typeof Facebook }
  | { kind: "select"; key: string; label: string; options: { value: string; label: string }[]; help?: string };

const KEYS: FieldDef[] = [
  { kind: "input", key: "store_name", label: "Nom de la boutique", placeholder: "Electro Box Edge" },
  { kind: "input", key: "store_alert", label: "Bannière d'alerte (laisser vide pour cacher)", placeholder: "Promo -50% ce week-end !" },
  { kind: "input", key: "whatsapp_number", label: "Numéro WhatsApp", placeholder: "+212600000000" },
  { kind: "input", key: "meta_pixel_id", label: "Meta Pixel ID", placeholder: "123456789012345", Icon: Facebook },
  { kind: "input", key: "tiktok_pixel_id", label: "TikTok Pixel ID", placeholder: "C4XXXXXXXXXXXX", Icon: Music2 },
  { kind: "input", key: "google_id", label: "Google Tag ID (G-XXX ou GTM-XXX)", placeholder: "G-XXXXXXX", Icon: BarChart3 },
  {
    kind: "select",
    key: "pixel_conversion_event",
    label: "Événement de conversion (à la soumission de la commande)",
    help: "Choisissez quel événement déclencher quand un client envoie le formulaire de commande.",
    options: [
      { value: "Purchase", label: "Purchase (achat — recommandé pour COD confirmés)" },
      { value: "Lead", label: "Lead (prospect — pour optimiser des prospects qualifiés)" },
    ],
  },
];

function SettingsPage() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.from("settings").select("key,value").then(({ data }) => {
      const m: Record<string, string> = {};
      (data || []).forEach((r) => { m[r.key] = r.value || ""; });
      setValues(m); setLoading(false);
    });
  }, []);

  async function save() {
    setSaving(true);
    const rows = Object.entries(values).map(([key, value]) => ({ key, value }));
    const { error } = await supabase.from("settings").upsert(rows, { onConflict: "key" });
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success("Paramètres enregistrés");
  }

  if (loading) return <p className="text-muted-foreground">…</p>;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-1">Paramètres</h1>
      <p className="text-sm text-muted-foreground mb-2">
        Les Pixels sont injectés automatiquement dans la boutique si l'ID est renseigné.
      </p>
      <div className="mb-6 text-xs text-muted-foreground bg-muted/40 border border-border/60 rounded-lg p-3">
        <strong className="text-[var(--navy-deep)]">Événements installés automatiquement :</strong>
        <ul className="list-disc pl-5 mt-1 space-y-0.5">
          <li><code>PageView</code> — toutes les pages</li>
          <li><code>ViewLandingPage</code> — page d'accueil</li>
          <li><code>ViewContent</code> — page produit</li>
          <li><code>InitiateCheckout</code> — clic sur « Commander »</li>
          <li><code>Purchase</code> ou <code>Lead</code> — à la soumission du formulaire (selon le choix ci-dessous)</li>
        </ul>
      </div>
      <div className="bg-card border rounded-xl p-5 space-y-4 shadow-[var(--shadow-soft)]">
        {KEYS.map((f) => {
          if (f.kind === "select") {
            return (
              <label key={f.key} className="block">
                <span className="text-sm font-medium">{f.label}</span>
                <select
                  value={values[f.key] || f.options[0].value}
                  onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
                  className="mt-1 w-full border rounded-md px-3 py-2.5 bg-background focus:outline-none focus:ring-2 focus:ring-[var(--cyan-bright)]"
                >
                  {f.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                {f.help && <p className="text-xs text-muted-foreground mt-1">{f.help}</p>}
              </label>
            );
          }
          const { key, label, placeholder, Icon } = f;
          return (
            <label key={key} className="block">
              <span className="text-sm font-medium flex items-center gap-2">
                {Icon && <Icon className="h-4 w-4 text-[var(--cyan-bright)]" />}
                {label}
              </span>
              <input
                value={values[key] || ""}
                onChange={(e) => setValues({ ...values, [key]: e.target.value })}
                placeholder={placeholder}
                className="mt-1 w-full border rounded-md px-3 py-2.5 bg-background focus:outline-none focus:ring-2 focus:ring-[var(--cyan-bright)]"
              />
            </label>
          );
        })}
        <button onClick={save} disabled={saving} className="btn-bolt px-5 py-2.5 rounded inline-flex items-center gap-2">
          <Save className="h-4 w-4" /> {saving ? "…" : "Enregistrer"}
        </button>
      </div>
    </div>
  );
}
