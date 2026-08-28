-- Rinovabd v2 only. This schema is applied exclusively to rinovabd-v2-db and never references legacy tables or resources.
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price_bdt INTEGER NOT NULL CHECK (price_bdt >= 0),
  compare_at_bdt INTEGER CHECK (compare_at_bdt IS NULL OR compare_at_bdt >= price_bdt),
  image_url TEXT NOT NULL,
  shade TEXT NOT NULL DEFAULT '',
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('live', 'draft', 'low-stock')),
  description TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password_hash TEXT NOT NULL,
  password_salt TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE COLLATE NOCASE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'live' CHECK (status IN ('live', 'draft')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS product_meta (
  product_id TEXT PRIMARY KEY REFERENCES products(id) ON DELETE CASCADE,
  sku TEXT UNIQUE,
  barcode TEXT UNIQUE,
  slug TEXT UNIQUE,
  featured INTEGER NOT NULL DEFAULT 0 CHECK (featured IN (0, 1)),
  low_stock_threshold INTEGER NOT NULL DEFAULT 10 CHECK (low_stock_threshold >= 0),
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  delivery_address TEXT NOT NULL,
  items_json TEXT NOT NULL,
  subtotal_bdt INTEGER NOT NULL CHECK (subtotal_bdt >= 0),
  delivery_bdt INTEGER NOT NULL CHECK (delivery_bdt >= 0),
  total_bdt INTEGER NOT NULL CHECK (total_bdt >= 0),
  payment_method TEXT NOT NULL DEFAULT 'cod' CHECK (payment_method IN ('cod', 'mobile-payment')),
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_identity (
  order_id TEXT PRIMARY KEY REFERENCES orders(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  email TEXT NOT NULL COLLATE NOCASE,
  invoice_number TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_access (
  order_id TEXT PRIMARY KEY REFERENCES orders(id) ON DELETE CASCADE,
  access_hash TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS order_items (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES products(id),
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price_bdt INTEGER NOT NULL CHECK (unit_price_bdt >= 0),
  line_total_bdt INTEGER NOT NULL CHECK (line_total_bdt >= 0)
);

CREATE TABLE IF NOT EXISTS invoices (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
  invoice_number TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'issued' CHECK (status IN ('issued', 'void')),
  issued_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tracking_events (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  note TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS inventory_movements (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  delta INTEGER NOT NULL,
  reason TEXT NOT NULL,
  note TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS media_assets (
  id TEXT PRIMARY KEY,
  object_key TEXT NOT NULL UNIQUE,
  content_type TEXT NOT NULL,
  original_name TEXT NOT NULL,
  size_bytes INTEGER NOT NULL CHECK (size_bytes >= 0),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS content_blocks (
  key TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  image_url TEXT,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS analytics_events (
  id TEXT PRIMARY KEY,
  event_name TEXT NOT NULL,
  path TEXT NOT NULL,
  product_id TEXT,
  metadata_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_categories_live ON categories(status, sort_order);
CREATE INDEX IF NOT EXISTS idx_orders_status_created ON orders(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_identity_email ON order_identity(email, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tracking_order ON tracking_events(order_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_inventory_product ON inventory_movements(product_id, created_at DESC);

CREATE TABLE IF NOT EXISTS assistant_knowledge (
  id TEXT PRIMARY KEY,
  audience TEXT NOT NULL CHECK (audience IN ('customer', 'staff')),
  locale TEXT NOT NULL CHECK (locale IN ('en', 'bn', 'bn-Latn')),
  intent TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  product_id TEXT,
  published INTEGER NOT NULL DEFAULT 0 CHECK (published IN (0, 1)),
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS assistant_events (
  id TEXT PRIMARY KEY,
  conversation_hash TEXT NOT NULL,
  channel TEXT NOT NULL CHECK (channel IN ('customer', 'staff')),
  actor_type TEXT NOT NULL CHECK (actor_type IN ('anonymous', 'customer', 'admin')),
  intent TEXT NOT NULL,
  locale TEXT NOT NULL,
  event_type TEXT NOT NULL,
  metadata_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_assistant_knowledge_filter ON assistant_knowledge(audience, locale, published, intent);
CREATE INDEX IF NOT EXISTS idx_assistant_events_conversation ON assistant_events(conversation_hash, created_at DESC);

INSERT OR IGNORE INTO categories (id, name, slug, description, status, sort_order) VALUES
  ('cat-complexion', 'Complexion', 'complexion', 'Skin-first colour for bright, expressive everyday faces.', 'live', 10),
  ('cat-skin-ritual', 'Skin ritual', 'skin-ritual', 'Useful texture and everyday hydration.', 'live', 20),
  ('cat-lips', 'Lips', 'lips', 'Flexible sheen and colour in a single thoughtful step.', 'live', 30),
  ('cat-sets', 'Sets', 'sets', 'Concise rituals made to travel well.', 'live', 40);

INSERT OR IGNORE INTO products (id, name, category, price_bdt, compare_at_bdt, image_url, shade, stock, status, description) VALUES
  ('rnv-001', 'Cloud Melt Blush', 'Complexion', 1290, 1490, 'https://api-v2.rinovabd.com/api/media/site/v2/product-essentials.png', 'Rose flush', 28, 'live', 'A sheer cream flush that builds softly without hiding skin.'),
  ('rnv-002', 'Satin Drop Serum', 'Skin ritual', 1690, NULL, 'https://api-v2.rinovabd.com/api/media/site/v2/hero-ritual.png', '30 ml', 42, 'live', 'A lightweight daily serum made for a luminous, hydrated finish.'),
  ('rnv-003', 'Gloss in Pink', 'Lips', 890, NULL, 'https://api-v2.rinovabd.com/api/media/site/v2/collection-face.png', 'Petal wash', 8, 'low-stock', 'A glassy lip oil with a translucent petal tint and cushiony slip.'),
  ('rnv-004', 'The Daily Edit', 'Sets', 2490, NULL, 'https://api-v2.rinovabd.com/api/media/site/v2/shop-editorial-ribbon.png', 'Four-piece ritual', 16, 'live', 'A concise, colour-considered collection for a better everyday ritual.');

INSERT OR IGNORE INTO product_meta (product_id, sku, barcode, slug, featured, low_stock_threshold) VALUES
  ('rnv-001', 'RNV-CMB-001', '894700000001', 'cloud-melt-blush', 1, 10),
  ('rnv-002', 'RNV-SDS-002', '894700000002', 'satin-drop-serum', 1, 10),
  ('rnv-003', 'RNV-GIP-003', '894700000003', 'gloss-in-pink', 0, 10),
  ('rnv-004', 'RNV-TDE-004', '894700000004', 'the-daily-edit', 1, 10);

INSERT OR IGNORE INTO content_blocks (key, title, body, image_url) VALUES
  ('home-hero', 'Colour, considered.', 'Beauty that fits the life you are actually living.', 'https://api-v2.rinovabd.com/api/media/site/v2/hero-ritual.png');
