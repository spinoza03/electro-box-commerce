import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminShell } from "@/components/AdminShell";
import { Check, X, Star, MessageSquare, Trash2, Plus, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/reviews")({
  component: () => <AdminShell><ReviewsManager /></AdminShell>,
});

function ReviewsManager() {
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);

  const { data: reviews, isLoading } = useQuery({
    queryKey: ["admin-reviews"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_reviews")
        .select("*, products(name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: products } = useQuery({
    queryKey: ["admin-products-list"],
    queryFn: async () => {
      const { data } = await supabase.from("products").select("id, name").eq("is_active", true);
      return data || [];
    },
  });

  const approveMutation = useMutation({
    mutationFn: async ({ id, approved }: { id: string; approved: boolean }) => {
      const { error } = await supabase.from("product_reviews").update({ is_approved: approved }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
      toast.success("Statut de l'avis mis à jour");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("product_reviews").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
      toast.success("Avis supprimé");
    },
  });

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-[var(--cyan-bright)]" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--navy-deep)]">Gestion des avis</h1>
          <p className="text-muted-foreground text-sm">Modérez les commentaires clients ou ajoutez des avis manuels.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 bg-[var(--navy-deep)] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[var(--navy-deep)]/90 transition-colors"
        >
          <Plus className="h-4 w-4" /> Ajouter un avis manuel
        </button>
      </div>

      <div className="bg-card border rounded-xl overflow-hidden shadow-[var(--shadow-soft)]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground font-medium border-b">
              <tr>
                <th className="px-4 py-3">Client / Produit</th>
                <th className="px-4 py-3">Note</th>
                <th className="px-4 py-3">Commentaire</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {reviews?.map((review: any) => (
                <tr key={review.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-4">
                    <div className="font-semibold text-[var(--navy-deep)]">{review.user_name}</div>
                    <div className="text-xs text-muted-foreground truncate max-w-[150px]">
                      {review.products?.name}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`h-3 w-3 ${i < review.rating ? "text-amber-400 fill-amber-400" : "text-muted/40"}`} />
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-4 max-w-xs">
                    <p className="line-clamp-2 text-muted-foreground">{review.comment}</p>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${review.is_approved ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                      {review.is_approved ? "Approuvé" : "En attente"}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => approveMutation.mutate({ id: review.id, approved: !review.is_approved })}
                        className={`p-2 rounded-lg transition-colors ${review.is_approved ? "text-amber-600 hover:bg-amber-50" : "text-emerald-600 hover:bg-emerald-50"}`}
                        title={review.is_approved ? "Désapprouver" : "Approuver"}
                      >
                        {review.is_approved ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                      </button>
                      <button 
                        onClick={() => { if(confirm("Supprimer cet avis ?")) deleteMutation.mutate(review.id); }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {reviews?.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground italic">
                    Aucun avis trouvé.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <AddReviewModal 
          products={products} 
          onClose={() => setShowAddModal(false)} 
          onSuccess={() => {
            setShowAddModal(false);
            queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
          }}
        />
      )}
    </div>
  );
}

function AddReviewModal({ products, onClose, onSuccess }: any) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    product_id: "",
    user_name: "",
    rating: 5,
    comment: "",
    is_approved: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.product_id) return toast.error("Sélectionnez un produit");
    setLoading(true);
    try {
      const { error } = await supabase.from("product_reviews").insert(formData);
      if (error) throw error;
      toast.success("Avis ajouté avec succès");
      onSuccess();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b flex items-center justify-between">
          <h2 className="text-xl font-bold text-[var(--navy-deep)]">Ajouter un avis</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-black"><X className="h-5 w-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Produit</label>
            <select 
              required
              className="w-full bg-muted/50 border rounded-lg px-3 py-2 text-sm focus:ring-2 ring-[var(--cyan-bright)] outline-none"
              value={formData.product_id}
              onChange={e => setFormData({...formData, product_id: e.target.value})}
            >
              <option value="">Sélectionner un produit</option>
              {products?.map((p: any) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Nom du client</label>
            <input 
              required
              className="w-full bg-muted/50 border rounded-lg px-3 py-2 text-sm focus:ring-2 ring-[var(--cyan-bright)] outline-none"
              placeholder="Ex: Ahmed M."
              value={formData.user_name}
              onChange={e => setFormData({...formData, user_name: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Note (1-5)</label>
            <div className="flex gap-2">
              {[1,2,3,4,5].map(n => (
                <button 
                  key={n}
                  type="button"
                  onClick={() => setFormData({...formData, rating: n})}
                  className={`p-2 rounded-lg transition-all ${formData.rating >= n ? "text-amber-400" : "text-muted/40 hover:text-muted/60"}`}
                >
                  <Star className={`h-6 w-6 ${formData.rating >= n ? "fill-current" : ""}`} />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Commentaire</label>
            <textarea 
              required
              rows={4}
              className="w-full bg-muted/50 border rounded-lg px-3 py-2 text-sm focus:ring-2 ring-[var(--cyan-bright)] outline-none resize-none"
              placeholder="Écrivez le commentaire ici..."
              value={formData.comment}
              onChange={e => setFormData({...formData, comment: e.target.value})}
            />
          </div>
          <button 
            disabled={loading}
            className="w-full bg-[var(--cyan-bright)] text-[var(--navy-deep)] font-bold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />}
            Enregistrer l'avis
          </button>
        </form>
      </div>
    </div>
  );
}
