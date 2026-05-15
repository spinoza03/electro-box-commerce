import { Link } from "@tanstack/react-router";
import { useT, useLangStore, HtmlLangSync } from "@/lib/i18n";
import { Globe, Menu, X, ChevronRight, Facebook, Instagram, Phone, Mail, Wallet, Truck, BadgeCheck, RotateCcw } from "lucide-react";
import { useState, useEffect } from "react";

export function StoreLayout({ children }: { children: React.ReactNode }) {
  const { t } = useT();
  const lang = useLangStore((s) => s.lang);
  const setLang = useLangStore((s) => s.setLang);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <HtmlLangSync />

      {/* ─── Navbar ─── */}
      <header
        className="fixed top-0 inset-x-0 z-50 transition-all duration-500 ease-out"
        style={{
          background: scrolled
            ? "rgba(10, 25, 47, 0.92)"
            : "transparent",
          backdropFilter: scrolled ? "blur(16px) saturate(1.8)" : "none",
          borderBottom: scrolled ? "1px solid rgba(0, 210, 255, 0.12)" : "1px solid transparent",
          boxShadow: scrolled ? "0 4px 30px rgba(0, 0, 0, 0.15)" : "none",
        }}
      >
        <div className="container mx-auto px-4 md:px-6">
          <div className="h-16 md:h-[68px] flex items-center justify-between">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center group"
              onClick={() => setMobileOpen(false)}
            >
              <img src="/logo.png" alt="Electro Box Edge" className="h-10 w-auto md:h-12 transition-transform duration-300 group-hover:scale-105" />
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {[
                { to: "/", label: t("nav.home") },
                { to: "/privacy", label: t("nav.privacy") },
                { to: "/terms", label: t("nav.terms") },
              ].map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className="relative text-sm font-medium text-white/75 hover:text-white px-3.5 py-2 rounded-lg transition-colors duration-200 hover:bg-white/[0.06]"
                >
                  {label}
                </Link>
              ))}

              <div className="w-px h-5 bg-white/15 mx-2" />

              <button
                onClick={() => setLang(lang === "fr" ? "ar" : "fr")}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-white/75 hover:text-white px-3 py-2 rounded-lg border border-white/10 hover:border-[var(--cyan-bright)]/50 hover:bg-[var(--cyan-bright)]/[0.06] transition-all duration-200"
              >
                <Globe className="h-3.5 w-3.5" />
                {t("lang.toggle")}
              </button>
            </nav>

            {/* Mobile Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
          {/* Apple-style services sub-nav */}
          <div className="hidden md:flex items-center justify-center gap-8 lg:gap-12 h-9 border-t border-white/[0.07]">
            {[
              { Icon: Wallet, label: lang === "ar" ? "الدفع عند الاستلام" : "Paiement à la livraison" },
              { Icon: Truck, label: lang === "ar" ? "توصيل 24-72 ساعة" : "Livraison 24-72h" },
              { Icon: BadgeCheck, label: lang === "ar" ? "جودة مختارة" : "Qualité sélectionnée" },
              { Icon: RotateCcw, label: lang === "ar" ? "إرجاع خلال 7 أيام" : "Retour sous 7 jours" },
            ].map(({ Icon, label }) => (
              <div
                key={label}
                className="inline-flex items-center gap-1.5 text-[12px] font-medium text-white/55 hover:text-white/90 transition-colors duration-200"
              >
                <Icon className="h-3.5 w-3.5 text-[var(--cyan-bright)]" />
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Slide Panel */}
        <div
          className={`md:hidden fixed inset-0 top-16 z-40 transition-all duration-300 ease-out ${
            mobileOpen
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }`}
        >
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div
            className={`relative bg-[var(--navy-deep)] border-t border-white/10 transition-transform duration-300 ease-out ${
              mobileOpen ? "translate-y-0" : "-translate-y-4"
            }`}
          >
            <nav className="container mx-auto px-4 py-4 flex flex-col gap-1">
              {[
                { to: "/", label: t("nav.home") },
                { to: "/privacy", label: t("nav.privacy") },
                { to: "/terms", label: t("nav.terms") },
              ].map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-between text-white/80 hover:text-white py-3 px-4 rounded-lg hover:bg-white/[0.06] transition-colors"
                >
                  <span className="text-sm font-medium">{label}</span>
                  <ChevronRight className="h-4 w-4 opacity-40" />
                </Link>
              ))}
              <div className="h-px bg-white/10 my-2" />
              <button
                onClick={() => {
                  setLang(lang === "fr" ? "ar" : "fr");
                  setMobileOpen(false);
                }}
                className="flex items-center gap-2 text-white/80 hover:text-white py-3 px-4 rounded-lg hover:bg-white/[0.06] transition-colors"
              >
                <Globe className="h-4 w-4" />
                <span className="text-sm font-medium">{t("lang.toggle")}</span>
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* ─── Main ─── */}
      <main className="flex-1">{children}</main>

      {/* ─── Footer ─── */}
      <footer className="bg-[var(--navy-deep)] text-white/60 border-t border-white/5">
        <div className="container mx-auto px-4 md:px-6 py-10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            {/* Footer Logo */}
            <div className="flex flex-col items-center md:items-start gap-4">
              <img src="/logo.png" alt="Electro Box Edge" className="h-8 w-auto opacity-80" />
              <div className="flex items-center gap-4">
                <a href="https://www.facebook.com/share/18afZVodp6/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href="https://www.instagram.com/electro_box_edge?igsh=MWhuNmF0dzQ5ZThnYw==" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  <Instagram className="h-5 w-5" />
                </a>
              </div>
            </div>

            {/* Contact Info */}
            <div className="flex flex-col items-center md:items-start gap-2 text-sm">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-[var(--cyan-bright)]" />
                <span>0664 299 799</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-[var(--cyan-bright)]" />
                <a href="mailto:Contact@electroboxedge.com" className="hover:text-white transition-colors">Contact@electroboxedge.com</a>
              </div>
            </div>

            {/* Footer Links */}
            <div className="flex flex-col items-center md:items-end gap-2 text-sm">
              <Link to="/privacy" className="hover:text-white transition-colors duration-200">
                {t("nav.privacy")}
              </Link>
              <Link to="/terms" className="hover:text-white transition-colors duration-200">
                {t("nav.terms")}
              </Link>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/[0.06] text-center text-xs text-white/40">
            © {new Date().getFullYear()} Electro Box Edge. {t("footer.rights")}
          </div>
        </div>
      </footer>

      {/* Sticky WhatsApp Button */}
      <a
        href="https://wa.me/212664299799"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-[60] bg-[#25D366] text-white p-4 rounded-full shadow-lg hover:scale-110 transition-transform duration-300 flex items-center justify-center group"
        aria-label="WhatsApp"
      >
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 ease-in-out whitespace-nowrap text-sm font-bold">
          <span className="px-2">WhatsApp</span>
        </span>
        <svg
          viewBox="0 0 24 24"
          width="24"
          height="24"
          fill="currentColor"
          className="h-6 w-6"
          aria-hidden="true"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.247-.694.247-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.886 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0 0 20.464 3.488" />
        </svg>
      </a>
    </div>
  );
}
