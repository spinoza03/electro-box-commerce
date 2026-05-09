import { Link, useNavigate, useLocation } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Zap, LayoutDashboard, Package, ShoppingCart, Settings, LogOut, Loader2, MessageSquare } from "lucide-react";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { session, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const loc = useLocation();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-[var(--cyan-bright)]" /></div>;
  }
  if (!session) {
    if (typeof window !== "undefined") navigate({ to: "/auth" });
    return null;
  }
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <h1 className="text-xl font-bold">Accès refusé</h1>
        <p className="text-muted-foreground mt-2 max-w-md">Votre compte n'a pas le rôle <code className="bg-muted px-1 rounded">admin</code>. Promouvez-le depuis la base de données :</p>
        <pre className="bg-muted text-xs p-3 rounded mt-3 overflow-x-auto max-w-full">{`INSERT INTO user_roles (user_id, role)\nVALUES ('${session.user.id}', 'admin');`}</pre>
        <button onClick={() => supabase.auth.signOut().then(() => navigate({ to: "/auth" }))} className="mt-4 text-sm underline">Se déconnecter</button>
      </div>
    );
  }

  const links = [
    { to: "/admin", label: "Dashboard", Icon: LayoutDashboard },
    { to: "/admin/products", label: "Produits", Icon: Package },
    { to: "/admin/orders", label: "Commandes", Icon: ShoppingCart },
    { to: "/admin/reviews", label: "Avis", Icon: MessageSquare },
    { to: "/admin/settings", label: "Paramètres", Icon: Settings },
  ];

  return (
    <div className="min-h-screen flex bg-muted/30">
      <aside className="hidden md:flex flex-col w-60 bg-[var(--navy-deep)] text-white">
        <Link to="/admin" className="flex items-center justify-center p-5 border-b border-white/10">
          <img src="/logo.png" alt="EBE Admin" className="h-8 w-auto" />
        </Link>
        <nav className="flex-1 p-3 space-y-1">
          {links.map(({ to, label, Icon }) => {
            const active = loc.pathname === to || (to !== "/admin" && loc.pathname.startsWith(to));
            return (
              <Link key={to} to={to} className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition ${active ? "bg-[var(--cyan-bright)] text-[var(--navy-deep)] font-semibold" : "hover:bg-white/10"}`}>
                <Icon className="h-4 w-4" /> {label}
              </Link>
            );
          })}
        </nav>
        <button onClick={() => supabase.auth.signOut().then(() => navigate({ to: "/auth" }))} className="m-3 flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-white/10">
          <LogOut className="h-4 w-4" /> Déconnexion
        </button>
      </aside>
      <main className="flex-1 overflow-x-auto">
        <div className="md:hidden bg-[var(--navy-deep)] text-white p-3 flex gap-3 overflow-x-auto">
          {links.map(({ to, label }) => (
            <Link key={to} to={to} className="text-xs whitespace-nowrap px-3 py-1.5 rounded bg-white/10">{label}</Link>
          ))}
        </div>
        <div className="p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
}
