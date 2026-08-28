/** Ribbon Modernism SEO: public editorial shelves receive canonical metadata and structured data; operational routes are explicitly excluded from search. */
import { useEffect } from "react";
import { useLocation } from "wouter";

const origin = "https://shop-v2.rinovabd.com";
const privatePath = (path: string) => /^(\/admin|\/account|\/cart|\/checkout|\/invoice\/|\/track\/)/.test(path);
const titleCase = (slug: string) => slug.split("-").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
const details = (path: string) => {
  if (path === "/") return { title: "Rinovabd — Colour, considered", description: "A Bangladesh-first beauty house for bright, considered everyday rituals.", type: "WebSite" };
  if (path === "/shop") return { title: "Shop the beauty edit | Rinovabd", description: "Explore Rinovabd’s considered beauty edit, from complexion colour to everyday ritual essentials.", type: "CollectionPage" };
  if (path === "/categories") return { title: "Beauty categories | Rinovabd", description: "Browse Rinovabd beauty categories and find a clear, useful ritual for every day.", type: "CollectionPage" };
  if (path.startsWith("/categories/")) { const category = titleCase(path.replace("/categories/", "")); return { title: `${category} beauty edit | Rinovabd`, description: `Explore the ${category} shelf in Rinovabd’s considered Bangladesh beauty edit.`, type: "CollectionPage" }; }
  return { title: "Rinovabd — Colour, considered", description: "A Bangladesh-first beauty house for bright, considered everyday rituals.", type: "WebSite" };
};
function meta(attribute: "name" | "property", key: string, content: string) { let node = document.head.querySelector(`meta[${attribute}="${key}"]`) as HTMLMetaElement | null; if (!node) { node = document.createElement("meta"); node.setAttribute(attribute, key); document.head.append(node); } node.content = content; }
function link(rel: string, href: string) { let node = document.head.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null; if (!node) { node = document.createElement("link"); node.rel = rel; document.head.append(node); } node.href = href; }

export function SeoManager() {
  const [location] = useLocation();
  useEffect(() => {
    const path = location.split("?")[0] || "/";
    const isPrivate = privatePath(path);
    const page = details(path);
    const canonical = `${origin}${isPrivate ? "/" : path}`;
    document.title = isPrivate ? "Rinovabd — Private area" : page.title;
    meta("name", "description", isPrivate ? "Private Rinovabd customer or Studio area." : page.description);
    meta("name", "robots", isPrivate ? "noindex, nofollow, noarchive" : "index, follow, max-image-preview:large");
    meta("property", "og:title", isPrivate ? "Rinovabd" : page.title);
    meta("property", "og:description", isPrivate ? "Private Rinovabd area." : page.description);
    meta("property", "og:type", "website");
    meta("property", "og:url", canonical);
    meta("name", "twitter:card", "summary_large_image");
    meta("name", "twitter:title", isPrivate ? "Rinovabd" : page.title);
    meta("name", "twitter:description", isPrivate ? "Private Rinovabd area." : page.description);
    link("canonical", canonical);
    const scriptId = "rinovabd-page-schema";
    const current = document.getElementById(scriptId);
    if (isPrivate) { current?.remove(); return; }
    const schema = { "@context": "https://schema.org", "@type": page.type, name: page.title.replace(" | Rinovabd", ""), url: canonical, description: page.description, isPartOf: { "@type": "WebSite", name: "Rinovabd", url: origin }, inLanguage: "en-BD" };
    const script = current || Object.assign(document.createElement("script"), { id: scriptId, type: "application/ld+json" });
    script.textContent = JSON.stringify(schema);
    if (!current) document.head.append(script);
  }, [location]);
  return null;
}
