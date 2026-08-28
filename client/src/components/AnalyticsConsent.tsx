/** Ribbon Modernism consent notice: a compact paper-and-pink choice gives visitors control before optional analytics signals leave the browser. */
import { useState } from "react";
import { analyticsConsentIsKnown, setAnalyticsConsent } from "@/lib/analytics";

export function AnalyticsConsent() {
  const [visible, setVisible] = useState(() => !analyticsConsentIsKnown());
  if (!visible) return null;
  const choose = (granted: boolean) => { setAnalyticsConsent(granted); setVisible(false); };
  return <aside className="analytics-consent" role="dialog" aria-label="Analytics preference"><div><span className="eyebrow">Your choice</span><p>Optional analytics help us understand the storefront. We do not send account, delivery, payment, or password data.</p></div><div><button className="button button--outline button--small" onClick={() => choose(false)}>Not now</button><button className="button button--pink button--small" onClick={() => choose(true)}>Allow analytics</button></div></aside>;
}
