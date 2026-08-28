/** Ribbon Modernism: even an unavailable route keeps the brand’s clear editorial voice and provides a direct escape. */
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return <main className="not-found"><span className="eyebrow">404 / route unavailable</span><h1>This page took<br /><em>the long way home.</em></h1><a className="button button--pink" href="/"><ArrowLeft size={18} />Return to Rinova</a></main>;
}
