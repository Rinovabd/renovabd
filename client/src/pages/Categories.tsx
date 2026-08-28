/** Ribbon Modernism categories: a lightweight editorial index that makes collection navigation feel intentional rather than grid-bound. */
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { StoreHeader } from "@/components/StoreHeader";
import { fetchCategories, type Category } from "@/lib/api";
import { cloudflareAssets } from "@/lib/cloudflare-assets";
const images = [cloudflareAssets.productEssentials, cloudflareAssets.heroRitual, cloudflareAssets.collectionFace, cloudflareAssets.shopEditorialRibbon];
export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  useEffect(() => { fetchCategories().then(setCategories).catch(() => setCategories([])); }, []);
  return <div className="site-shell commerce-page"><StoreHeader /><main className="category-index">
    <header><span className="eyebrow">Shop by feeling</span><h1>Make space for<br /><em>your ritual.</em></h1><p>Four concise shelves for the pieces that earn their place in your morning.</p></header>
    <div className="category-ribbon-rail" aria-label="Rinovabd category index"><span>Ritual index</span><i /><span>Four ways to shop</span><i /><span>Rinova Pink / 01</span></div>
    <section className="category-shelves">{categories.map((category, index) => <a href={`/categories/${category.slug}`} key={category.id} className="category-panel"><img src={images[index % images.length]} alt="" /><div><span>0{index + 1} / {category.productCount} pieces</span><h2>{category.name}</h2><p>{category.description}</p><b>Explore <ArrowRight size={16} /></b></div></a>)}</section>
    <aside className="category-editorial-band"><div><span className="eyebrow">The useful edit</span><h2>One small<br /><em>decision</em> at a time.</h2><p>Every shelf begins with a clear purpose: colour, care, a finishing touch, or a compact ritual to take with you.</p><a href="/shop">Browse the full edit <ArrowRight size={16} /></a></div><div className="category-paper-field" aria-hidden="true"><i /><i /><i /><span>Rinova / considered commerce</span></div></aside>
  </main></div>;
}
