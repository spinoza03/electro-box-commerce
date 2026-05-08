import { createFileRoute, Link } from "@tanstack/react-router";
import { StoreLayout } from "@/components/StoreLayout";
import { useT } from "@/lib/i18n";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { useEffect } from "react";
import confetti from "canvas-confetti";

export const Route = createFileRoute("/thank-you")({
  component: ThankYouPage,
});

function ThankYouPage() {
  const { t, lang, dir } = useT();

  useEffect(() => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function () {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  return (
    <StoreLayout>
      <div dir={dir} className="container mx-auto px-4 py-20 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="h-24 w-24 bg-emerald-100 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-emerald-100/50">
          <CheckCircle2 className="h-12 w-12 text-emerald-600" />
        </div>
        
        <h1 className="text-4xl md:text-5xl font-extrabold text-[var(--navy-deep)] tracking-tight mb-4">
          {lang === "ar" ? "شكرًا لطلبك!" : "Merci pour votre commande !"}
        </h1>
        
        <p className="text-lg text-muted-foreground max-w-md mx-auto mb-8 leading-relaxed">
          {lang === "ar" 
            ? "لقد استلمنا طلبك بنجاح. سيقوم فريقنا بالاتصال بك قريبًا لتأكيد الشحن." 
            : "Votre commande a été reçue avec succès. Notre équipe vous contactera bientôt pour confirmer l'expédition."}
        </p>

        <Link
          to="/"
          className="btn-bolt inline-flex items-center gap-2.5 px-8 py-4 rounded-xl text-sm font-bold"
        >
          {lang === "ar" ? "العودة إلى المتجر" : "Retour à la boutique"}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </StoreLayout>
  );
}
