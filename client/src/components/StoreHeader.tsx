/** Ribbon Modernism: navigation is crisp, asymmetric, and always offers a clear route between retail and studio. */
import { Menu, Search, ShoppingBag, SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";
import { BrandMark } from "./BrandMark";

type StoreHeaderProps = {
  bagCount: number;
  onBagClick: () => void;
};

export function StoreHeader({ bagCount, onBagClick }: StoreHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    ["Shop", "/shop"],
    ["The Edit", "#the-edit"],
    ["Our point of view", "#story"],
  ] as const;

  return (
    <>
      <div className="utility-ribbon">Free delivery on edits over ৳2,000 <span>•</span> Bangladesh beauty, considered</div>
      <header className="store-header">
        <button className="mobile-menu" onClick={() => setMobileOpen(true)} aria-label="Open navigation"><Menu size={21} /></button>
        <BrandMark />
        <nav className="desktop-nav" aria-label="Main navigation">
          {links.map(([label, href]) => <a key={label} href={href}>{label}</a>)}
        </nav>
        <div className="header-tools">
          <a href="/shop" aria-label="Search products"><Search size={20} /></a>
          <a className="studio-link" href="/admin"><SlidersHorizontal size={17} /><span>Studio</span></a>
          <button className="bag-button" onClick={onBagClick} aria-label={`Open bag with ${bagCount} items`}><ShoppingBag size={20} /><span>{bagCount}</span></button>
        </div>
      </header>
      {mobileOpen && (
        <div className="mobile-nav-wrap" role="dialog" aria-modal="true" aria-label="Mobile navigation">
          <div className="mobile-nav">
            <div className="mobile-nav-top"><BrandMark /><button onClick={() => setMobileOpen(false)} aria-label="Close navigation"><X size={22} /></button></div>
            {links.map(([label, href], index) => <a key={label} href={href} onClick={() => setMobileOpen(false)}><span>0{index + 1}</span>{label}</a>)}
            <a href="/admin" onClick={() => setMobileOpen(false)}><span>04</span>Studio dashboard</a>
          </div>
        </div>
      )}
    </>
  );
}
