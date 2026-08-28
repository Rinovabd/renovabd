/** Ribbon Modernism route signal: client-side page changes become a single named GTM event only after a visitor opts in. */
import { useEffect } from "react";
import { useLocation } from "wouter";
import { trackPage } from "@/lib/analytics";

export function AnalyticsRouteTracker() {
  const [location] = useLocation();
  useEffect(() => { const report = () => trackPage(location); report(); window.addEventListener("rinova-consent-granted", report); return () => window.removeEventListener("rinova-consent-granted", report); }, [location]);
  return null;
}
