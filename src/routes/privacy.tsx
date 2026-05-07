import { createFileRoute } from "@tanstack/react-router";
import { StoreLayout } from "@/components/StoreLayout";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/privacy")({
  head: () => ({ meta: [{ title: "Politique de confidentialité — Electro Box Edge" }] }),
  component: () => {
    const { dir, lang } = useT();
    return (
      <StoreLayout>
        <article dir={dir} className="container mx-auto px-4 py-10 prose-rich max-w-3xl">
          {lang === "ar" ? (
            <>
              <h1>سياسة الخصوصية</h1>
              <p>نحن نحترم خصوصيتك. يتم استخدام بياناتك الشخصية فقط لمعالجة طلبك وتسليمه.</p>
              <h2>البيانات التي نجمعها</h2>
              <ul><li>الاسم الكامل</li><li>رقم الهاتف</li><li>عنوان التسليم</li></ul>
              <h2>كيف نستخدم بياناتك</h2>
              <p>تُستخدم بياناتك حصريًا لمعالجة الطلبات والتواصل معك بشأن التسليم.</p>
            </>
          ) : (
            <>
              <h1>Politique de confidentialité</h1>
              <p>Nous respectons votre vie privée. Vos données personnelles sont utilisées uniquement pour traiter et livrer votre commande.</p>
              <h2>Données collectées</h2>
              <ul><li>Nom complet</li><li>Numéro de téléphone</li><li>Adresse de livraison</li></ul>
              <h2>Utilisation de vos données</h2>
              <p>Vos données servent exclusivement au traitement de votre commande et à la communication liée à la livraison.</p>
            </>
          )}
        </article>
      </StoreLayout>
    );
  },
});
