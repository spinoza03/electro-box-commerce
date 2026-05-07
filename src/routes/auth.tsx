import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Zap, Loader2 } from "lucide-react";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  if (session) {
    navigate({ to: "/admin" });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (error) return toast.error(error.message);
      navigate({ to: "/admin" });
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin + "/admin" },
      });
      setLoading(false);
      if (error) return toast.error(error.message);
      toast.success("Compte créé. Demandez à un admin de vous accorder le rôle.");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundImage: "var(--gradient-hero)" }}>
      <div className="w-full max-w-md bg-card rounded-2xl shadow-[var(--shadow-elevated)] p-8">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg text-[var(--navy-deep)] justify-center mb-6">
          <span className="inline-flex items-center justify-center h-10 w-10 rounded-md" style={{ backgroundImage: "var(--gradient-bolt)" }}>
            <Zap className="h-5 w-5 text-[var(--navy-deep)]" />
          </span>
          Electro Box <span className="text-[var(--cyan-bright)]">Edge</span>
        </Link>
        <h1 className="text-xl font-bold text-center mb-1">{mode === "signin" ? "Connexion Admin" : "Créer un compte"}</h1>
        <p className="text-sm text-muted-foreground text-center mb-6">Accès au tableau de bord</p>

        <form onSubmit={submit} className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium">Email</span>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full border rounded-md px-3 py-2.5 bg-background focus:outline-none focus:ring-2 focus:ring-[var(--cyan-bright)]" />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Mot de passe</span>
            <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full border rounded-md px-3 py-2.5 bg-background focus:outline-none focus:ring-2 focus:ring-[var(--cyan-bright)]" />
          </label>
          <button type="submit" disabled={loading} className="btn-bolt w-full py-3 rounded-md flex items-center justify-center gap-2 disabled:opacity-60">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === "signin" ? "Se connecter" : "Créer le compte"}
          </button>
        </form>

        <button onClick={() => setMode(mode === "signin" ? "signup" : "signin")} className="text-sm text-muted-foreground hover:text-[var(--cyan-bright)] mt-4 w-full text-center">
          {mode === "signin" ? "Pas de compte ? Créer un compte" : "J'ai déjà un compte"}
        </button>
        <p className="text-xs text-muted-foreground text-center mt-4">
          Le premier compte créé doit être promu admin manuellement depuis la base de données.
        </p>
      </div>
    </div>
  );
}
