/** Ribbon Modernism: product cards balance expressive crop treatment with plain, fast purchase information. */
import { ArrowUpRight, Plus } from "lucide-react";
import type { Product } from "@/lib/catalog";
import { formatBDT } from "@/lib/catalog";

type ProductCardProps = {
  product: Product;
  onAdd: (product: Product) => void;
  featured?: boolean;
};

export function ProductCard({ product, onAdd, featured = false }: ProductCardProps) {
  return (
    <article className={`product-card ${featured ? "product-card--featured" : ""}`}>
      <div className="product-image-frame">
        <img src={product.image} alt={product.name} />
        <div className="product-image-topline"><span>{product.category}</span>{product.status === "Low stock" && <span className="inventory-flag">Few left</span>}</div>
        <button className="quick-add" onClick={() => onAdd(product)} aria-label={`Add ${product.name} to bag`}><Plus size={19} />Quick add</button>
      </div>
      <div className="product-copy">
        <div><p>{product.shade}</p><h3>{product.name}</h3></div>
        <div className="product-price"><strong>{formatBDT(product.price)}</strong>{product.compareAt && <del>{formatBDT(product.compareAt)}</del>}</div>
      </div>
      <div className="product-actions"><button className="product-buy" onClick={() => onAdd(product)}>Add to bag <Plus size={15} /></button><a href={`/shop#${product.id}`} className="product-line-link">Details <ArrowUpRight size={15} /></a></div>
    </article>
  );
}
