import { createFileRoute } from "@tanstack/react-router";
import { StoreLayout } from "@/components/StoreLayout";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/terms")({
  head: () => ({ meta: [{ title: "Conditions d'utilisation — Electro Box Edge" }] }),
  component: () => {
    const { dir, lang } = useT();
    return (
      <StoreLayout>
        <article dir={dir} className="container mx-auto px-4 py-10 prose-rich max-w-3xl">
          {lang === "ar" ? (
            <>
              <h1>الشروط والأحكام</h1>
              <p>باستخدام موقعنا، فإنك توافق على هذه الشروط.</p>
              <h2>الطلبات</h2>
              <p>جميع الطلبات تخضع للتأكيد الهاتفي. الدفع عند الاستلام.</p>
              <h2>الإرجاع</h2>
              <p>يمكنك إرجاع المنتج خلال 7 أيام من الاستلام إذا كان معيبًا.</p>
            </>
          ) : (
            <>
              <h1>Conditions d'utilisation</h1>
              <p>En utilisant notre site, vous acceptez ces conditions.</p>
              <h2>Commandes</h2>
              <p>Toutes les commandes font l'objet d'une confirmation téléphonique. Paiement à la livraison.</p>
              <h2>Retours</h2>
              <p>Vous pouvez retourner un produit défectueux dans les 7 jours suivant la réception.</p>
            </>
          )}
        </article>
      </StoreLayout>
    );
  },
});
