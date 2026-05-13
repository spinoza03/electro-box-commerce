import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

// Lightweight cache for the conversion event setting (Purchase | Lead).
let cachedConversionEvent: "Purchase" | "Lead" | null = null;
export function getConversionEvent(): "Purchase" | "Lead" {
  return cachedConversionEvent || "Purchase";
}

export function PixelInjector() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    let cancelled = false;
    supabase
      .from("settings")
      .select("key,value")
      .in("key", ["meta_pixel_id", "tiktok_pixel_id", "google_id", "pixel_conversion_event"])
      .then(({ data }) => {
        if (cancelled || !data) return;
        const map = Object.fromEntries(data.map((r) => [r.key, r.value || ""]));
        if (map.meta_pixel_id) injectMeta(map.meta_pixel_id);
        if (map.tiktok_pixel_id) injectTiktok(map.tiktok_pixel_id);
        if (map.google_id) injectGoogle(map.google_id);
        cachedConversionEvent = map.pixel_conversion_event === "Lead" ? "Lead" : "Purchase";
      });
    return () => {
      cancelled = true;
    };
  }, []);
  return null;
}

function once(id: string, fn: () => void) {
  if (document.getElementById(id)) return;
  const marker = document.createElement("meta");
  marker.id = id;
  document.head.appendChild(marker);
  fn();
}

function injectMeta(id: string) {
  once("px-meta", () => {
    const s = document.createElement("script");
    s.innerHTML = `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${id}');fbq('track','PageView');`;
    document.head.appendChild(s);
  });
}

function injectTiktok(id: string) {
  once("px-tiktok", () => {
    const s = document.createElement("script");
    s.innerHTML = `!function (w, d, t) {w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};ttq.load('${id}');ttq.page();}(window, document, 'ttq');`;
    document.head.appendChild(s);
  });
}

function injectGoogle(id: string) {
  once("px-google", () => {
    const s1 = document.createElement("script");
    s1.async = true;
    s1.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
    document.head.appendChild(s1);
    const s2 = document.createElement("script");
    s2.innerHTML = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${id}');`;
    document.head.appendChild(s2);
  });
}
