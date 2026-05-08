import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AdminShell } from "@/components/AdminShell";
import { Phone, MapPin, Search, Calendar, ChevronDown, Package, FileText, MessageCircle } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

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

const STATUSES: { key: Order["status"]; label: string; bg: string; text: string; border: string }[] = [
  { key: "pending", label: "Nouvelle", bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  { key: "confirmed", label: "Confirmée", bg: "bg-sky-50", text: "text-sky-700", border: "border-sky-200" },
  { key: "shipped", label: "Expédiée", bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200" },
  { key: "delivered", label: "Livrée", bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  { key: "cancelled", label: "Annulée", bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
];

function OrdersPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<Order["status"] | "all">("all");

  const { data: orders, isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(500);
      if (error) throw error;
      return (data || []) as Order[];
    },
  });

  async function setStatus(id: string, status: Order["status"]) {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) toast.error(error.message);
    else { 
      toast.success("Statut mis à jour"); 
      qc.invalidateQueries({ queryKey: ["admin-orders"] }); 
      qc.invalidateQueries({ queryKey: ["admin-stats"] }); 
    }
  }

  const filteredOrders = orders?.filter(o => {
    const matchesSearch = 
      o.customer_name.toLowerCase().includes(search.toLowerCase()) || 
      o.phone.includes(search) || 
      o.order_number.toString().includes(search) ||
      o.city.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  const totalSales = orders?.reduce((acc, o) => acc + Number(o.total_price), 0) || 0;

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[var(--navy-deep)] tracking-tight">Leads CRM</h1>
          <p className="text-sm text-muted-foreground mt-1">Gérez vos commandes et clients</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Nom, tel, # commande, ville..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 w-full sm:w-64 border rounded-lg text-sm bg-card shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--cyan-bright)] focus:border-transparent transition-all"
            />
          </div>
          <div className="relative">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="appearance-none pl-4 pr-10 py-2 w-full sm:w-40 border rounded-lg text-sm bg-card shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--cyan-bright)] focus:border-transparent transition-all cursor-pointer font-medium"
            >
              <option value="all">Tous les statuts</option>
              {STATUSES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-card p-4 border rounded-xl shadow-sm">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Commandes</p>
          <p className="text-2xl font-bold text-[var(--navy-deep)] mt-1">{orders?.length || 0}</p>
        </div>
        <div className="bg-card p-4 border rounded-xl shadow-sm">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Chiffre d'Affaires</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">
            {totalSales.toFixed(0)} MAD
          </p>
        </div>
      </div>

      <div className="bg-card rounded-xl border shadow-[var(--shadow-soft)] overflow-hidden flex-1">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/40 text-muted-foreground border-b uppercase tracking-wider text-xs">
              <tr>
                <th className="px-5 py-4 font-medium">Commande</th>
                <th className="px-5 py-4 font-medium">Client & Contact</th>
                <th className="px-5 py-4 font-medium">Produit & Montant</th>
                <th className="px-5 py-4 font-medium">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-5 py-12 text-center text-muted-foreground">
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-4 w-4 border-2 border-[var(--cyan-bright)] border-t-transparent rounded-full animate-spin" />
                      Chargement des commandes...
                    </div>
                  </td>
                </tr>
              ) : filteredOrders.length > 0 ? (
                filteredOrders.map((o) => {
                  const statusInfo = STATUSES.find(s => s.key === o.status)!;
                  const waNumber = o.phone.replace(/\D/g, '').replace(/^0/, '212').replace(/^(?!212)/, '212');
                  return (
                    <tr key={o.id} className="hover:bg-muted/20 transition-colors group">
                      <td className="px-5 py-4 align-top">
                        <div className="font-bold text-[var(--navy-deep)] text-base">#{o.order_number}</div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          {format(new Date(o.created_at), "dd MMM yyyy HH:mm", { locale: fr })}
                        </div>
                      </td>
                      <td className="px-5 py-4 align-top">
                        <div className="font-bold text-foreground mb-1.5">{o.customer_name}</div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <a href={`tel:${o.phone}`} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-[var(--cyan-bright)] hover:underline w-fit transition-colors">
                              <Phone className="h-3.5 w-3.5" /> {o.phone}
                            </a>
                            <a 
                              href={`https://wa.me/${waNumber}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-center h-6 w-6 rounded-full bg-emerald-100 text-emerald-600 hover:bg-emerald-200 transition-colors"
                              title="WhatsApp"
                            >
                              <MessageCircle className="h-3.5 w-3.5" />
                            </a>
                          </div>
                          <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5" /> 
                            <span className="line-clamp-2">{o.city} — {o.address}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 align-top">
                        <div className="flex items-start gap-2 mb-1.5">
                          <Package className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                          <span className="font-medium text-sm line-clamp-2 leading-tight">{o.product_name} <span className="text-muted-foreground font-normal">×{o.quantity}</span></span>
                        </div>
                        <div className="font-extrabold text-[var(--navy-deep)] ml-6 mt-1">
                          {Number(o.total_price).toFixed(2)} MAD
                        </div>
                        {o.notes && (
                          <div className="flex items-start gap-1.5 text-xs text-muted-foreground mt-2 ml-6 bg-amber-50/50 p-2 rounded border border-amber-100">
                            <FileText className="h-3.5 w-3.5 shrink-0 text-amber-600 mt-0.5" />
                            <span className="italic text-amber-800">{o.notes}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-4 align-top">
                        <div className="relative inline-block w-40">
                          <select
                            value={o.status}
                            onChange={(e) => setStatus(o.id, e.target.value as Order["status"])}
                            className={`appearance-none w-full pl-3 pr-8 py-1.5 rounded-full text-xs font-bold border cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[var(--cyan-bright)] transition-colors ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border}`}
                          >
                            {STATUSES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                          </select>
                          <ChevronDown className={`absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 pointer-events-none ${statusInfo.text}`} />
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4} className="px-5 py-16 text-center">
                    <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-muted/50 mb-4">
                      <Search className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="text-foreground font-medium">Aucune commande trouvée</p>
                    <p className="text-muted-foreground text-sm mt-1">Modifiez vos filtres de recherche ou attendez de nouvelles commandes.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
