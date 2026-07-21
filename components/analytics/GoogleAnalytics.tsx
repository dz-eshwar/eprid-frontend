"use client";

import Script from "next/script";

// Loads GA4 only when NEXT_PUBLIC_GA_MEASUREMENT_ID is set and we're in a
// production build — keeps local/dev traffic and preview deploys out of
// analytics data, and means nothing is added to the page at all until the
// id is configured. The id itself isn't a secret (it's public in every page
// load once shipped), so NEXT_PUBLIC_ exposure is fine.
export function GoogleAnalytics() {
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  if (!gaId || process.env.NODE_ENV !== "production") {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}', { anonymize_ip: true });
        `}
      </Script>
    </>
  );
}
