/** Ribbon Modernism: the shop page is a clean product archive with pink filters and non-generic editorial information rhythm. */
import { ArrowLeft, SlidersHorizontal } from "lucide-react";
import { useEffect, useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import { StoreHeader } from "@/components/StoreHeader";
import { productSeed, type Product } from "@/lib/catalog";
import { fetchProducts } from "@/lib/api";
import { cloudflareAssets } from "@/lib/cloudflare-assets";

export default function Shop() {
  const [category, setCategory] = useState("All");
  const [bag, setBag] = useState(0);
  const [products, setProducts] = useState<Product[]>(productSeed);
  const categories = ["All", "Complexion", "Skin ritual", "Lips", "Sets"];
  const shown = category === "All" ? products : products.filter((product) => product.category === category);
  const add = (_product: Product) => setBag((current) => current + 1);
  useEffect(() => { fetchProducts().then((remoteProducts) => { if (remoteProducts.length) setProducts(remoteProducts); }).catch(() => undefined); }, []);
  return <div className="site-shell shop-page"><StoreHeader bagCount={bag} onBagClick={() => window.alert("Add an item from the edit to open your bag.")} /><main className="shop-archive"><aside className="shop-rail"><a href="/" className="back-link"><ArrowLeft size={16} />Home</a><div><span>Rinovabd</span><i /><span>Product archive</span><i /><span>Drop 01</span></div><p>Make room<br />for <em>ritual.</em></p></aside><div className="shop-stage"><section className="shop-heading"><div><span className="eyebrow">The full shelf</span><h1>Find your<br /><em>daily edit.</em></h1></div><p>Make space only for the pieces that are good at their job.</p></section><section className="shop-campaign"><img src={cloudflareAssets.shopEditorialRibbon} alt="Beauty products in the Rinovabd pink ribbon campaign" /><div><span className="eyebrow">New in the house</span><h2>Four pieces.<br />One <em>clearer</em> ritual.</h2><a href="#archive">Explore the shelf <ArrowLeft size={15} /></a></div></section><div className="filter-row"><span><SlidersHorizontal size={17} />Filter the archive</span><div>{categories.map((item) => <button className={category === item ? "active" : ""} key={item} onClick={() => setCategory(item)}>{item}</button>)}</div></div><section id="archive" className="product-grid product-grid--shop product-grid--archive">{shown.map((product, index) => <ProductCard key={product.id} product={product} onAdd={add} featured={index === 1} />)}</section><section className="shop-editorial-break"><div><span className="eyebrow">The face of the edit</span><h2>Good colour<br />doesn’t need<br />a <em>grand entrance.</em></h2><p>It just makes the morning feel more like yours.</p></div><img src={cloudflareAssets.shopBeautyCrop} alt="Rinovabd editorial beauty look" /></section></div></main></div>;
}
