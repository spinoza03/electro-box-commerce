export {};
declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    ttq?: { load: (id: string) => void; page: () => void; track: (event: string, data?: unknown) => void };
    dataLayer?: unknown[];
  }
}
