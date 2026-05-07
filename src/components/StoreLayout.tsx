import { Link } from "@tanstack/react-router";
import { useT, useLangStore, HtmlLangSync } from "@/lib/i18n";
import { PixelInjector } from "./PixelInjector";
import { Zap, Globe } from "lucide-react";

export function StoreLayout({ children }: { children: React.ReactNode }) {
  const { t } = useT();
  const lang = useLangStore((s) => s.lang);
  const setLang = useLangStore((s) => s.setLang);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <HtmlLangSync />
      <PixelInjector />
      <header className="sticky top-0 z-40 bg-[var(--navy-deep)] text-white border-b border-white/10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg">
            <span className="inline-flex items-center justify-center h-9 w-9 rounded-md" style={{ backgroundImage: "var(--gradient-bolt)" }}>
              <Zap className="h-5 w-5 text-[var(--navy-deep)]" />
            </span>
            <span>Electro Box <span className="text-[var(--cyan-bright)]">Edge</span></span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <Link to="/" className="hover:text-[var(--cyan-bright)]">{t("nav.home")}</Link>
            <Link to="/privacy" className="hover:text-[var(--cyan-bright)]">{t("nav.privacy")}</Link>
            <Link to="/terms" className="hover:text-[var(--cyan-bright)]">{t("nav.terms")}</Link>
          </nav>
          <button
            onClick={() => setLang(lang === "fr" ? "ar" : "fr")}
            className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md border border-white/20 hover:border-[var(--cyan-bright)] hover:text-[var(--cyan-bright)] transition"
          >
            <Globe className="h-4 w-4" />
            {t("lang.toggle")}
          </button>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="bg-[var(--navy-deep)] text-white/70 mt-12">
        <div className="container mx-auto px-4 py-8 text-sm flex flex-col md:flex-row justify-between gap-4">
          <p>© {new Date().getFullYear()} Electro Box Edge. {t("footer.rights")}</p>
          <div className="flex gap-4">
            <Link to="/privacy" className="hover:text-[var(--cyan-bright)]">{t("nav.privacy")}</Link>
            <Link to="/terms" className="hover:text-[var(--cyan-bright)]">{t("nav.terms")}</Link>
            <Link to="/auth" className="hover:text-[var(--cyan-bright)]">{t("nav.admin")}</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
