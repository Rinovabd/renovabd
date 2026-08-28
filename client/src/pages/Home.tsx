/** Ribbon Modernism: this landing page uses staggered editorial bands, strong Rinova Pink fields, and clear purchase routes. */
import { ArrowDownRight, ArrowRight, Check, ChevronRight, Minus, Plus, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import { StoreHeader } from "@/components/StoreHeader";
import { formatBDT, productSeed, type Product } from "@/lib/catalog";
import { fetchProducts } from "@/lib/api";
import { cloudflareAssets } from "@/lib/cloudflare-assets";

type BagEntry = Product & { quantity: number };

export default function Home() {
  const [bag, setBag] = useState<BagEntry[]>([]);
  const [products, setProducts] = useState<Product[]>(productSeed);
  const [bagOpen, setBagOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    fetchProducts().then((remoteProducts) => {
      if (remoteProducts.length) setProducts(remoteProducts);
    }).catch(() => undefined);
  }, []);

  const count = useMemo(() => bag.reduce((sum, product) => sum + product.quantity, 0), [bag]);
  const subtotal = useMemo(() => bag.reduce((sum, product) => sum + product.quantity * product.price, 0), [bag]);
  const addToBag = (product: Product) => {
    setBag((current) => {
      const exists = current.find((item) => item.id === product.id);
      return exists ? current.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item) : [...current, { ...product, quantity: 1 }];
    });
    setBagOpen(true);
  };
  const adjust = (id: string, amount: number) => setBag((current) => current.flatMap((item) => item.id !== id ? [item] : item.quantity + amount > 0 ? [{ ...item, quantity: item.quantity + amount }] : []));

  return (
    <div className="site-shell">
      <StoreHeader bagCount={count} onBagClick={() => setBagOpen(true)} />
      <main>
        <section className="hero-section">
          <div className="hero-copy">
            <div className="eyebrow">Drop 01 · everyday colour</div>
            <h1>Colour,<br /><em>considered.</em></h1>
            <p>Beauty that fits the life you are actually living. Bright edits, clear ingredients, delivered across Bangladesh.</p>
            <div className="hero-actions"><a className="button button--ink" href="#the-edit">Shop the edit <ArrowDownRight size={18} /></a><a className="text-action" href="#story">Why Rinova <ArrowRight size={17} /></a></div>
            <div className="hero-proof"><span><Check size={15} />Cash on delivery</span><span><Check size={15} />Thoughtfully sourced</span></div>
          </div>
          <div className="hero-visual">
            <img src={cloudflareAssets.heroRitual} alt="Rinova skincare ritual" />
            <div className="hero-sticker"><span>YOUR<br />DAILY<br />EDIT</span><ArrowDownRight size={24} /></div>
            <div className="hero-caption">A luminous new<br />point of view.</div>
          </div>
        </section>

        <section className="marquee-band" aria-label="Rinova promises"><div className="marquee-track"><span>Made for real ritual</span><i /> <span>Beauty, without the noise</span><i /> <span>Rinova Pink is in season</span><i /> <span>Made for real ritual</span><i /></div></section>

        <section id="the-edit" className="product-section section-pad">
          <div className="section-intro section-intro--offset"><div><span className="eyebrow">Start here</span><h2>The edit<br /><em>of the moment.</em></h2></div><p>Four easy pieces. One brighter way to meet your mirror.</p></div>
          <div className="product-grid">
            {products.map((product, index) => <ProductCard key={product.id} product={product} onAdd={addToBag} featured={index === 1} />)}
          </div>
          <a href="/shop" className="button button--outline all-products">Explore the full shop <ArrowRight size={18} /></a>
        </section>

        <section className="split-feature">
          <div className="feature-image"><img src={cloudflareAssets.shopEditorialRibbon} alt="Rinova beauty essentials arranged among folded pink ribbon" /></div>
          <div className="feature-copy"><span className="eyebrow">The Ritual, made simple</span><h2>Good skin days<br />don’t need a <em>twelve-step plan.</em></h2><p>We choose the pieces that earn their place in a bag: considered colour, useful textures, and a little daily lift.</p><a href="/shop" className="text-action text-action--dark">Build your ritual <ArrowRight size={17} /></a><div className="numbered-note"><span>01</span><p>Shop by how you want to feel, not by a 19-step routine.</p></div></div>
        </section>

        <section id="story" className="story-section section-pad">
          <div className="story-header"><span className="eyebrow">Our point of view</span><p>Rinova is a Bangladesh beauty house for an expressive, uncomplicated everyday.</p></div>
          <div className="story-grid"><div className="story-image"><img src={cloudflareAssets.collectionFace} alt="A Rinova makeup look" /></div><div className="story-statement"><h2>Less noise.<br />More <em>you.</em></h2><p>We believe a beauty routine can look like a pause, a colour decision, or a tiny act of showing up for yourself.</p><a href="/shop" className="button button--pink">Meet the collection <ArrowRight size={18} /></a></div></div>
        </section>

        <section className="newsletter-section"><div><span className="eyebrow">Keep close</span><h2>Ritual notes, <em>before they go live.</em></h2></div>{subscribed ? <div className="subscription-success"><Check size={19} /> You’re on the edit list.</div> : <form onSubmit={(event) => { event.preventDefault(); if (email.trim()) setSubscribed(true); }}><label htmlFor="email">Your email</label><div><input id="email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" /><button aria-label="Subscribe"><ArrowRight size={20} /></button></div><p>Launch notes only. No unnecessary noise.</p></form>}</section>
      </main>
      <footer className="site-footer"><div><span className="footer-wordmark">rinova<span>bd</span></span><p>Beauty, brought back to feeling.</p></div><div className="footer-links"><a href="/shop">Shop</a><a href="/admin">Studio</a><a href="#story">Our view</a></div><p className="footer-meta">© 2026 Rinovabd<br />Bangladesh</p></footer>

      {bagOpen && <div className="bag-overlay" role="dialog" aria-modal="true" aria-label="Shopping bag"><div className="bag-drawer"><div className="bag-top"><div><span className="eyebrow">Your bag</span><h2>Chosen with care.</h2></div><button onClick={() => setBagOpen(false)} aria-label="Close bag"><X size={22} /></button></div>{bag.length === 0 ? <div className="bag-empty"><p>Your bag is waiting for a good ritual.</p><button className="button button--pink" onClick={() => setBagOpen(false)}>Keep exploring</button></div> : <><div className="bag-items">{bag.map((item) => <div className="bag-item" key={item.id}><img src={item.image} alt="" /><div><p>{item.category}</p><h3>{item.name}</h3><strong>{formatBDT(item.price)}</strong><div className="quantity-control"><button onClick={() => adjust(item.id, -1)} aria-label={`Remove one ${item.name}`}><Minus size={14} /></button><span>{item.quantity}</span><button onClick={() => adjust(item.id, 1)} aria-label={`Add one ${item.name}`}><Plus size={14} /></button></div></div></div>)}</div><div className="bag-summary"><p><span>Subtotal</span><strong>{formatBDT(subtotal)}</strong></p><small>Delivery is calculated at checkout.</small><button className="button button--ink" onClick={() => window.alert("The new Cloudflare checkout endpoint is being connected to this action.")}>Checkout <ChevronRight size={18} /></button></div></>}</div></div>}
    </div>
  );
}
