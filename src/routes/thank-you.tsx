import { createFileRoute, Link } from "@tanstack/react-router";
import { StoreLayout } from "@/components/StoreLayout";
import { useT } from "@/lib/i18n";
import { Check, ArrowRight } from "lucide-react";
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
      <section
        dir={dir}
        className="relative overflow-hidden text-white min-h-[80vh] flex items-center justify-center"
        style={{ backgroundImage: "var(--gradient-hero)" }}
      >
        <div className="absolute -right-40 -top-40 w-[600px] h-[600px] rounded-full opacity-[0.12] blur-[100px]" style={{ background: "var(--cyan-bright)" }} />
        <div className="absolute -left-20 bottom-0 w-[400px] h-[400px] rounded-full opacity-[0.08] blur-[80px]" style={{ background: "var(--cyan-bright)" }} />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        <div className="container mx-auto px-4 py-24 flex flex-col items-center justify-center text-center relative">
          <div
            className="h-20 w-20 rounded-full flex items-center justify-center mb-6"
            style={{
              background: "var(--cyan-bright)",
              boxShadow: "0 0 60px rgba(0, 210, 255, 0.5), 0 0 0 8px rgba(0, 210, 255, 0.12)",
            }}
          >
            <Check className="h-10 w-10 text-[var(--navy-deep)]" strokeWidth={3} />
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
            {lang === "ar" ? "تم تأكيد الطلب !" : "Commande confirmée !"}
          </h1>

          <p className="text-base md:text-lg text-white/65 max-w-md mx-auto mb-8 leading-relaxed">
            {lang === "ar"
              ? "شكرًا لك. سيتواصل معك فريقنا خلال ساعتين لتأكيد طلبك."
              : "Merci. Notre équipe vous contactera sous 2h pour confirmer votre commande."}
          </p>

          <Link
            to="/"
            className="btn-bolt inline-flex items-center gap-2.5 px-8 py-4 rounded-xl text-sm font-bold"
          >
            {lang === "ar" ? "العودة إلى المتجر" : "Retour à la boutique"}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </StoreLayout>
  );
}
