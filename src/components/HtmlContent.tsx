import DOMPurify from "dompurify";
import { useMemo } from "react";

export function HtmlContent({ html, className = "" }: { html: string; className?: string }) {
  const clean = useMemo(() => {
    if (typeof window === "undefined") return "";
    return DOMPurify.sanitize(html || "", {
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
