// Helpers to fire pixel events. They defer until the pixel base code is
// actually injected (PixelInjector loads it after an async Supabase fetch),
// so events are never lost to a race with the script tag.
type Fbq = (...a: unknown[]) => void;
type Ttq = { track?: (e: string, d?: unknown) => void; page?: () => void };
type W = Window & { fbq?: Fbq; ttq?: Ttq; gtag?: (...a: unknown[]) => void };

function w(): W | null {
  if (typeof window === "undefined") return null;
  return window as unknown as W;
}

// Run `fn` once any pixel is present, or after a max wait (so gtag/ttq-only
// setups still fire — every helper uses optional chaining internally).
function whenReady(fn: () => void) {
  const win = w();
  if (!win) return;
  if (win.fbq || win.ttq || win.gtag) {
    fn();
    return;
  }
  let tries = 0;
  const timer = window.setInterval(() => {
    tries += 1;
    if (win.fbq || win.ttq || win.gtag || tries > 50) {
      window.clearInterval(timer);
      fn();
    }
  }, 200); // poll up to ~10s
}

export function trackPageView() {
  whenReady(() => {
    const win = w(); if (!win) return;
    win.fbq?.("track", "PageView");
    win.ttq?.page?.();
    win.gtag?.("event", "page_view", {
      page_location: typeof location !== "undefined" ? location.href : undefined,
    });
  });
}

export function trackViewContent(payload: { id?: string; name?: string; value?: number; currency?: string }) {
  whenReady(() => {
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
  });
}

export function trackViewLandingPage() {
  whenReady(() => {
    const win = w(); if (!win) return;
    // Meta has no standard "ViewLandingPage" event — fire as a custom event.
    win.fbq?.("trackCustom", "ViewLandingPage");
    win.ttq?.track?.("LandingPageView");
    win.gtag?.("event", "page_view", { page_location: typeof location !== "undefined" ? location.href : undefined });
  });
}

export function trackConversion(eventName: "Purchase" | "Lead", payload: { value?: number; currency?: string; id?: string }) {
  whenReady(() => {
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
  });
}

export function trackInitiateCheckout(payload: { value?: number; currency?: string; id?: string }) {
  whenReady(() => {
    const win = w(); if (!win) return;
    const currency = payload.currency || "MAD";
    win.fbq?.("track", "InitiateCheckout", { value: payload.value, currency, content_ids: payload.id ? [payload.id] : undefined });
    win.ttq?.track?.("InitiateCheckout", { value: payload.value, currency });
    win.gtag?.("event", "begin_checkout", { value: payload.value, currency });
  });
}
