import DOMPurify from "dompurify";
import { useMemo } from "react";

// Strip leaked react-simple-wysiwyg toolbar/wrapper markup from previously-saved descriptions.
// The toolbar uses class names prefixed with "rsw-" (rsw-toolbar, rsw-btn, rsw-dd, etc).
function stripEditorChrome(input: string): string {
  if (!input) return "";
  if (typeof window === "undefined") return input;
  const tpl = document.createElement("div");
  tpl.innerHTML = input;
  tpl.querySelectorAll('[class*="rsw-"]').forEach((el) => {
    // Drop toolbars and dropdown chrome entirely; unwrap the editable area so its content survives.
    if (el.classList.contains("rsw-ce")) {
      while (el.firstChild) el.parentNode?.insertBefore(el.firstChild, el);
      el.remove();
    } else {
      el.remove();
    }
  });
  return tpl.innerHTML;
}

export function HtmlContent({ html, className = "" }: { html: string; className?: string }) {
  const clean = useMemo(() => {
    if (typeof window === "undefined") return "";
    const stripped = stripEditorChrome(html || "");
    return DOMPurify.sanitize(stripped, {
      ADD_ATTR: ["target", "rel", "style"],
      ALLOWED_TAGS: [
        "h1","h2","h3","h4","p","ul","ol","li","strong","em","b","i","u","a",
        "img","br","hr","blockquote","code","pre","span","div","table","thead",
        "tbody","tr","td","th","figure","figcaption","iframe",
      ],
      ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel):|\/|#)/i,
    });
  }, [html]);
  return <div className={`prose-rich ${className}`} dangerouslySetInnerHTML={{ __html: clean }} />;
}
