import Script from "next/script";

export default function UmamiAnalytics() {
  const websiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;
  if (!websiteId) return null;

  return (
    <Script
      id="umami-analytics"
      src={process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL ?? "https://cloud.umami.is/script.js"}
      data-website-id={websiteId}
      data-performance="true"
      data-exclude-search="true"
      data-exclude-hash="true"
      data-do-not-track="true"
      strategy="afterInteractive"
    />
  );
}
