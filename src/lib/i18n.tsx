import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useEffect } from "react";

export type Lang = "fr" | "ar";

type Dict = Record<string, { fr: string; ar: string }>;

const D: Dict = {
  "nav.home": { fr: "Accueil", ar: "الرئيسية" },
  "nav.products": { fr: "Produits", ar: "المنتجات" },
  "nav.privacy": { fr: "Confidentialité", ar: "الخصوصية" },
  "nav.terms": { fr: "Conditions", ar: "الشروط" },
  "nav.admin": { fr: "Admin", ar: "الإدارة" },
  "hero.badge": { fr: "Haute Performance · COD Maroc", ar: "أداء عالٍ · الدفع عند الاستلام" },
  "hero.title": { fr: "L'électronique nouvelle génération, livrée chez vous.", ar: "إلكترونيات الجيل الجديد، تصلك إلى باب منزلك." },
  "hero.subtitle": { fr: "Produits sélectionnés, paiement à la livraison partout au Maroc.", ar: "منتجات مختارة، الدفع عند الاستلام في جميع أنحاء المغرب." },
  "hero.cta": { fr: "Découvrir les produits", ar: "اكتشف المنتجات" },
  "featured.title": { fr: "Produits Vedettes", ar: "منتجات مميزة" },
  "why.title": { fr: "Pourquoi nous choisir ?", ar: "لماذا تختارنا؟" },
  "why.cod.title": { fr: "Paiement à la livraison", ar: "الدفع عند الاستلام" },
  "why.cod.body": { fr: "Payez en cash quand vous recevez votre commande.", ar: "ادفع نقدًا عند استلام طلبك." },
  "why.fast.title": { fr: "Livraison rapide", ar: "توصيل سريع" },
  "why.fast.body": { fr: "Expédition partout au Maroc en 24-72h.", ar: "شحن إلى جميع أنحاء المغرب خلال 24-72 ساعة." },
  "why.quality.title": { fr: "Qualité garantie", ar: "جودة مضمونة" },
  "why.quality.body": { fr: "Produits testés et garantis.", ar: "منتجات مختبرة ومضمونة." },
  "product.buy": { fr: "Commander maintenant", ar: "اطلب الآن" },
  "product.outOfStock": { fr: "Rupture de stock", ar: "نفذ المخزون" },
  "product.inStock": { fr: "En stock", ar: "متوفر" },
  "checkout.title": { fr: "Finaliser ma commande", ar: "إتمام الطلب" },
  "checkout.subtitle": { fr: "Paiement à la livraison · Livraison rapide", ar: "الدفع عند الاستلام · توصيل سريع" },
  "checkout.name": { fr: "Nom complet", ar: "الاسم الكامل" },
  "checkout.phone": { fr: "Téléphone", ar: "رقم الهاتف" },
  "checkout.city": { fr: "Ville", ar: "المدينة" },
  "checkout.address": { fr: "Adresse", ar: "العنوان" },
  "checkout.notes": { fr: "Notes (facultatif)", ar: "ملاحظات (اختياري)" },
  "checkout.qty": { fr: "Quantité", ar: "الكمية" },
  "checkout.submit": { fr: "Confirmer la commande", ar: "تأكيد الطلب" },
  "checkout.total": { fr: "Total", ar: "المجموع" },
  "checkout.success": { fr: "Commande reçue ! Nous vous appellerons bientôt.", ar: "تم استلام طلبك! سنتصل بك قريبًا." },
  "checkout.error": { fr: "Erreur, veuillez réessayer.", ar: "خطأ، يرجى المحاولة مرة أخرى." },
  "lang.toggle": { fr: "العربية", ar: "Français" },
  "footer.rights": { fr: "Tous droits réservés.", ar: "جميع الحقوق محفوظة." },
  "admin.signin": { fr: "Connexion Admin", ar: "تسجيل دخول الإدارة" },
  "admin.email": { fr: "Email", ar: "البريد الإلكتروني" },
  "admin.password": { fr: "Mot de passe", ar: "كلمة المرور" },
};

interface LangState {
  lang: Lang;
  setLang: (l: Lang) => void;
}

export const useLangStore = create<LangState>()(
  persist(
    (set) => ({ lang: "ar", setLang: (l) => set({ lang: l }) }),
    { name: "ebe-lang-v2" },
  ),
);

export function useT() {
  const lang = useLangStore((s) => s.lang);
  const t = (k: keyof typeof D | string) => {
    const e = D[k as keyof typeof D];
    return e ? e[lang] : (k as string);
  };
  return { t, lang, dir: lang === "ar" ? ("rtl" as const) : ("ltr" as const) };
}

/** Apply lang/dir to <html> on client */
export function HtmlLangSync() {
  const lang = useLangStore((s) => s.lang);
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);
  return null;
}
