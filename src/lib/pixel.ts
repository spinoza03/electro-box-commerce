// Helpers to fire pixel events. Safe no-ops if the pixel script wasn't injected
// (i.e. no ID configured in Settings).
type Fbq = (...a: unknown[]) => void;
type Ttq = { track?: (e: string, d?: unknown) => void; page?: () => void };
type W = Window & { fbq?: Fbq; ttq?: Ttq; gtag?: (...a: unknown[]) => void };

function w(): W | null {
  if (typeof window === "undefined") return null;
  return window as unknown as W;
}

export function trackViewContent(payload: { id?: string; name?: string; value?: number; currency?: string }) {
  const win = w(); if (!win) return;
  win.fbq?.("track", "ViewContent", {
    content_ids: payload.id ? [payload.id] : undefined,
    content_name: payload.name,
    content_type: "product",
    value: payload.value,
    currency: payload.currency || "MAD",
  });
  win.ttq?.track?.("ViewContent", { value: payload.value, currency: payload.currency || "MAD", contents: payload.id ? [{ content_id: payload.id, content_name: payload.name }] : undefined });
  win.gtag?.("event", "view_item", { items: payload.id ? [{ item_id: payload.id, item_name: payload.name }] : undefined, value: payload.value, currency: payload.currency || "MAD" });
}

export function trackViewLandingPage() {
  const win = w(); if (!win) return;
  // Meta has no standard "ViewLandingPage" event — fire as a custom event + PageView.
  win.fbq?.("trackCustom", "ViewLandingPage");
  win.ttq?.track?.("LandingPageView");
  win.gtag?.("event", "page_view", { page_location: typeof location !== "undefined" ? location.href : undefined });
}

export function trackConversion(eventName: "Purchase" | "Lead", payload: { value?: number; currency?: string; id?: string }) {
  const win = w(); if (!win) return;
  const currency = payload.currency || "MAD";
  win.fbq?.("track", eventName, {
    value: payload.value,
    currency,
    content_ids: payload.id ? [payload.id] : undefined,
    content_type: "product",
  });
  if (eventName === "Purchase") {
    win.ttq?.track?.("CompletePayment", { value: payload.value, currency });
    win.gtag?.("event", "purchase", { value: payload.value, currency });
  } else {
    win.ttq?.track?.("SubmitForm", { value: payload.value, currency });
    win.gtag?.("event", "generate_lead", { value: payload.value, currency });
  }
}

export function trackInitiateCheckout(payload: { value?: number; currency?: string; id?: string }) {
  const win = w(); if (!win) return;
  const currency = payload.currency || "MAD";
  win.fbq?.("track", "InitiateCheckout", { value: payload.value, currency, content_ids: payload.id ? [payload.id] : undefined });
  win.ttq?.track?.("InitiateCheckout", { value: payload.value, currency });
  win.gtag?.("event", "begin_checkout", { value: payload.value, currency });
}
