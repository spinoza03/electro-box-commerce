import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AdminShell } from "@/components/AdminShell";
import { Phone, MapPin } from "lucide-react";

type Order = {
  id: string;
  order_number: number;
  customer_name: string;
  phone: string;
  city: string;
  address: string;
  product_name: string;
  quantity: number;
  total_price: number;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  notes: string | null;
  created_at: string;
};

export const Route = createFileRoute("/admin/orders")({
  component: () => <AdminShell><OrdersPage /></AdminShell>,
});

const COLUMNS: { key: Order["status"]; label: string; color: string }[] = [
  { key: "pending", label: "Nouvelles", color: "bg-amber-100 border-amber-300" },
  { key: "confirmed", label: "Confirmées", color: "bg-sky-100 border-sky-300" },
  { key: "shipped", label: "Expédiées", color: "bg-indigo-100 border-indigo-300" },
  { key: "delivered", label: "Livrées", color: "bg-emerald-100 border-emerald-300" },
  { key: "cancelled", label: "Annulées", color: "bg-red-100 border-red-300" },
];

function OrdersPage() {
  const qc = useQueryClient();
  const { data: orders } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(500);
      return (data || []) as Order[];
    },
  });

  async function setStatus(id: string, status: Order["status"]) {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Mis à jour"); qc.invalidateQueries({ queryKey: ["admin-orders"] }); qc.invalidateQueries({ queryKey: ["admin-stats"] }); }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Commandes (CRM)</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
        {COLUMNS.map((c) => {
          const items = orders?.filter((o) => o.status === c.key) || [];
          return (
            <div key={c.key} className={`rounded-xl border-2 p-3 ${c.color}`}>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-bold text-sm uppercase tracking-wider">{c.label}</h2>
                <span className="text-xs bg-white px-2 py-0.5 rounded-full">{items.length}</span>
              </div>
              <div className="space-y-2 max-h-[70vh] overflow-y-auto">
                {items.map((o) => (
                  <div key={o.id} className="bg-white rounded-lg p-3 shadow-sm text-xs">
                    <div className="flex justify-between font-bold text-[var(--navy-deep)]"><span>#{o.order_number}</span><span>{Number(o.total_price).toFixed(0)} MAD</span></div>
                    <div className="font-medium mt-1">{o.customer_name}</div>
                    <div className="text-muted-foreground mt-0.5 line-clamp-1">{o.product_name} × {o.quantity}</div>
                    <div className="mt-1 flex items-center gap-1 text-muted-foreground"><Phone className="h-3 w-3" /><a href={`tel:${o.phone}`} className="underline">{o.phone}</a></div>
                    <div className="flex items-center gap-1 text-muted-foreground"><MapPin className="h-3 w-3" />{o.city}</div>
                    <div className="text-muted-foreground mt-0.5 line-clamp-2">{o.address}</div>
                    {o.notes && <div className="text-muted-foreground mt-1 italic">"{o.notes}"</div>}
                    <select
                      value={o.status}
                      onChange={(e) => setStatus(o.id, e.target.value as Order["status"])}
                      className="mt-2 w-full text-xs border rounded px-2 py-1 bg-white"
                    >
                      {COLUMNS.map((col) => <option key={col.key} value={col.key}>{col.label}</option>)}
                    </select>
                  </div>
                ))}
                {items.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">—</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
