export type AnalyticsData = Record<string, string | number | boolean>;

declare global {
  interface Window {
    umami?: { track: (eventName: string, data?: AnalyticsData) => void };
  }
}

export function trackEvent(eventName: string, data?: AnalyticsData) {
  if (typeof window === "undefined" || !window.umami) return false;
  window.umami.track(eventName, data);
  return true;
}
