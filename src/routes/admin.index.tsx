import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminShell } from "@/components/AdminShell";
import { Package, ShoppingCart, TrendingUp, Clock } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

export const Route = createFileRoute("/admin/")({
  component: () => <AdminShell><Dashboard /></AdminShell>,
});

const COLORS = ["#00D2FF", "#0A192F", "#10b981", "#f59e0b", "#ef4444"];

function Dashboard() {
  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [products, orders] = await Promise.all([
        supabase.from("products").select("id,stock_count", { count: "exact" }),
        supabase.from("orders").select("id,status,total_price,created_at").order("created_at", { ascending: false }).limit(1000),
      ]);
      const allOrders = orders.data || [];
      const revenue = allOrders.filter((o) => o.status === "delivered" || o.status === "confirmed").reduce((s, o) => s + Number(o.total_price), 0);
      const byStatus = ["pending","confirmed","shipped","delivered","cancelled"].map((s) => ({
        name: s, value: allOrders.filter((o) => o.status === s).length,
      }));
      // Last 7 days revenue
      const days: { day: string; revenue: number; orders: number }[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i); d.setHours(0,0,0,0);
        const next = new Date(d); next.setDate(next.getDate()+1);
        const slice = allOrders.filter((o) => {
          const t = new Date(o.created_at).getTime();
          return t >= d.getTime() && t < next.getTime();
        });
        days.push({
          day: d.toLocaleDateString("fr-FR", { weekday: "short" }),
          revenue: slice.filter((o) => o.status !== "cancelled").reduce((s, o) => s + Number(o.total_price), 0),
          orders: slice.length,
        });
      }
      return {
        productCount: products.count || 0,
        orderCount: allOrders.length,
        pending: allOrders.filter((o) => o.status === "pending").length,
        revenue, byStatus, days,
      };
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Tableau de bord</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Stat Icon={ShoppingCart} label="Commandes" value={stats?.orderCount ?? 0} />
        <Stat Icon={Clock} label="En attente" value={stats?.pending ?? 0} accent />
        <Stat Icon={TrendingUp} label="Revenu (MAD)" value={(stats?.revenue ?? 0).toFixed(0)} />
        <Stat Icon={Package} label="Produits" value={stats?.productCount ?? 0} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card title="Revenu (7 jours)">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={stats?.days || []}>
              <XAxis dataKey="day" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip />
              <Bar dataKey="revenue" fill="#00D2FF" radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card title="Statut des commandes">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={stats?.byStatus || []} dataKey="value" nameKey="name" outerRadius={90} label>
                {(stats?.byStatus || []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}

function Stat({ Icon, label, value, accent }: { Icon: React.ComponentType<{ className?: string }>; label: string; value: number | string; accent?: boolean }) {
  return (
    <div className={`bg-card border rounded-xl p-4 shadow-[var(--shadow-soft)] ${accent ? "border-[var(--cyan-bright)]" : ""}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground uppercase tracking-wider">{label}</span>
        <Icon className="h-4 w-4 text-[var(--cyan-bright)]" />
      </div>
      <div className="text-2xl font-extrabold mt-2 text-[var(--navy-deep)]">{value}</div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border rounded-xl p-4 shadow-[var(--shadow-soft)]">
      <h2 className="font-semibold mb-3">{title}</h2>
      {children}
    </div>
  );
}
