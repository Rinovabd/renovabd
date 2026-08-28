/** Ribbon Modernism: structured, candid commerce data with Rinova Pink as the active launch signal. */
export type ProductStatus = "Live" | "Draft" | "Low stock";

export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  compareAt?: number;
  image: string;
  shade: string;
  stock: number;
  status: ProductStatus;
  description: string;
};

export const productSeed: Product[] = [
  {
    id: "rnv-001",
    name: "Cloud Melt Blush",
    category: "Complexion",
    price: 1290,
    compareAt: 1490,
    image: "/manus-storage/rinovabd-product-pink-essentials_5fd5096d.png",
    shade: "Rose flush",
    stock: 28,
    status: "Live",
    description: "A sheer cream flush that builds softly without hiding skin.",
  },
  {
    id: "rnv-002",
    name: "Satin Drop Serum",
    category: "Skin ritual",
    price: 1690,
    image: "/manus-storage/rinovabd-hero-ritual_f76d3417.png",
    shade: "30 ml",
    stock: 42,
    status: "Live",
    description: "A lightweight daily serum made for a luminous, hydrated finish.",
  },
  {
    id: "rnv-003",
    name: "Gloss in Pink",
    category: "Lips",
    price: 890,
    image: "/manus-storage/rinovabd-collection-face_bcb32ab5.png",
    shade: "Petal wash",
    stock: 8,
    status: "Low stock",
    description: "A glassy lip oil with a translucent petal tint and cushiony slip.",
  },
  {
    id: "rnv-004",
    name: "The Daily Edit",
    category: "Sets",
    price: 2490,
    image: "/manus-storage/rinovabd-product-pink-essentials_5fd5096d.png",
    shade: "Four-piece ritual",
    stock: 16,
    status: "Live",
    description: "A concise, colour-considered collection for a better everyday ritual.",
  },
];

export const formatBDT = (amount: number) => `৳${amount.toLocaleString("en-BD")}`;
