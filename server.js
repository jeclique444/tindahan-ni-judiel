const express = require("express");
const path = require("path");
const Database = require("better-sqlite3");

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Simpleng database path — gagana sa Render free tier
const db = new Database("tindahan.db");
db.pragma("journal_mode = WAL");

db.exec(`
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  meta TEXT,
  price REAL NOT NULL,
  category TEXT,
  emoji TEXT,
  image_url TEXT,
  art_class TEXT,
  label TEXT,
  featured INTEGER DEFAULT 0,
  stock INTEGER DEFAULT 100,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  pickup_time TEXT,
  message TEXT,
  total REAL NOT NULL,
  status TEXT DEFAULT "pending",
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL,
  price REAL NOT NULL
);
CREATE TABLE IF NOT EXISTS contact_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  message TEXT NOT NULL,
  pickup_time TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
`);

const productCount = db.prepare("SELECT COUNT(*) AS c FROM products").get().c;
if (productCount === 0) {
  const insert = db.prepare("INSERT INTO products (name, meta, price, category, emoji, image_url, art_class, label, featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
  
  const seed = [
    // =========================================================
    // ====== FEATURED (Top 6) - /images/products/ ======
    // =========================================================
    ["Nescafe 25g", "Nescafe Original · 25g", 30, "coffee", "☕", "/images/products/coffee.jpg", "product-art-coffee", "Pang-gising", 1],
    ["Quatro", "Local Liquor · 500ml", 155, "drink", "🍾", "/images/products/alcohol.jpg", "product-art-drink", "Pang-celebrate", 1],
    ["Ariel Sachet", "Laundry Powder · Sachet", 18, "household", "🧼", "/images/products/sabon.jpg", "product-art-household", "Home care", 1],
    ["Bear Brand Milk", "Large pack / 1L", 120, "canned", "🥛", "/images/products/bearbrand.jpg", "product-art-canned", "Pantry basic", 1],
    ["Softdrinks 1.5L", "Coke, Royal, Mountain Dew · 1.5L", 80, "drink", "🥤", "/images/products/softdrinks.jpg", "product-art-drink", "Chill break", 1],
    ["Fudgee Bar", "Chocolate cake · Single", 10, "snack", "🍫", "/images/products/fudgee.jpg", "product-art-snack", "Sweet bite", 1],
    
    // =========================================================
    // ====== 1. COFFEE - /images/coffee/ ======
    // =========================================================
    ["Nescafe Black 25g", "Nescafe · 25g", 30, "coffee", "☕", "/images/coffee/coffee.jpg", "product-art-coffee", "", 0],
    ["Kopiko Brown 40g", "Kopiko · 40g", 18, "coffee", "☕", "/images/coffee/kopiko-brown.jpg", "product-art-coffee", "", 0],
    ["Kopiko Blanca 40g", "Kopiko · 40g", 18, "coffee", "☕", "/images/coffee/kopiko-blanca.jpg", "product-art-coffee", "", 0],
    ["Great Taste White 40g", "Great Taste · 40g", 18, "coffee", "☕", "/images/coffee/great-taste-white.jpg", "product-art-coffee", "", 0],
    ["Milo 24g", "Milo · 24g", 13, "coffee", "☕", "/images/coffee/milo.jpg", "product-art-coffee", "", 0],
    ["Nescafe Classic 1.9g", "Nescafe · 1.9g", 5, "coffee", "☕", "/images/coffee/nescafe-classic.jpg", "product-art-coffee", "", 0],
    
    // =========================================================
    // ====== 2. SEASONINGS - /images/seasonings/ ======
    // =========================================================
    ["Knor Cubes", "Knorr · Cube", 8, "seasoning", "🧂", "/images/seasonings/knor-cubes.jpg", "product-art-seasoning", "", 0],
    ["Vetsin", "Aji-no-moto · Sachet", 10, "seasoning", "🧂", "/images/seasonings/vetsin.jpg", "product-art-seasoning", "", 0],
    ["Magic Sarap", "Magic Sarap · Sachet", 6, "seasoning", "🧂", "/images/seasonings/magic-sarap.jpg", "product-art-seasoning", "", 0],
    ["Knor Sampalok", "Knorr · Sampalok Mix", 20, "seasoning", "🧂", "/images/seasonings/knor-sampalok.jpg", "product-art-seasoning", "", 0],
    ["Oyster Sauce", "Sachet · Oyster", 8, "seasoning", "🧂", "/images/seasonings/oyster-sauce.jpg", "product-art-seasoning", "", 0],
    ["Asin", "Salt · Sachet", 8, "seasoning", "🧂", "/images/seasonings/asin.jpg", "product-art-seasoning", "", 0],
    
    // =========================================================
    // ====== 3. SNACKS - /images/snacks/ ======
    // =========================================================
    ["Pancit Canton", "Lucky Me! · Original", 18, "snack", "🍜", "/images/snacks/pancit-canton.jpg", "product-art-snack", "", 0],
    ["Piatos", "Round · Cheese", 25, "snack", "🍟", "/images/snacks/piatos.jpg", "product-art-snack", "", 0],
    ["Oishi", "Pillows · Single", 10, "snack", "🥨", "/images/snacks/oishi.jpg", "product-art-snack", "", 0],
    ["Cracklings", "Chicharon · Pack", 10, "snack", "🥓", "/images/snacks/cracklings.jpg", "product-art-snack", "", 0],
    ["Tattoos", "Snack · Single", 12, "snack", "🍪", "/images/snacks/tattoos.jpg", "product-art-snack", "", 0],
    ["X-Sakto", "Corn Snack · Single", 12, "snack", "🌽", "/images/snacks/x-sakto.jpg", "product-art-snack", "", 0],
    ["Crispy Patata", "Potato Chips · Pack", 10, "snack", "🍟", "/images/snacks/crispy-patata.jpg", "product-art-snack", "", 0],
    ["Potato Fries", "Snack · Pack", 10, "snack", "🍟", "/images/snacks/potato-fries.jpg", "product-art-snack", "", 0],
    ["Alibaba", "Snack · Single", 10, "snack", "🥨", "/images/snacks/alibaba.jpg", "product-art-snack", "", 0],
    
    // =========================================================
    // ====== 4. CANNED GOODS - /images/CannedGoods/ ======
    // =========================================================
    ["Argentina Corned Beef", "150g can", 35, "canned", "🥫", "/images/CannedGoods/argentina.jpg", "product-art-canned", "", 0],
    ["555 Sardines", "155g · Tomato", 30, "canned", "🐟", "/images/CannedGoods/555.jpg", "product-art-canned", "", 0],
    ["Century Tuna", "155g · Flakes in Oil", 35, "canned", "🐠", "/images/CannedGoods/century-tuna.jpg", "product-art-canned", "", 0],
    ["San Marino", "Corned Tuna · 150g", 35, "canned", "🐟", "/images/CannedGoods/san-marino.jpg", "product-art-canned", "", 0],
    
    // =========================================================
    // ====== 5. INSTANT NOODLES - /images/InstantNoodles/ ======
    // =========================================================
    ["Lucky Me Beef", "55g · Original", 15, "noodles", "🍜", "/images/InstantNoodles/lucky-me-beef.jpg", "product-art-noodles", "", 0],
    ["Payless Xtra Big", "60g · Chicken", 20, "noodles", "🍜", "/images/InstantNoodles/payless.jpg", "product-art-noodles", "", 0],
    ["Nissin Cup Noodles", "60g · Seafood", 45, "noodles", "🍜", "/images/InstantNoodles/nissin.jpg", "product-art-noodles", "", 0],
    ["Quickchow Bihon", "50g · Guisado", 18, "noodles", "🍜", "/images/InstantNoodles/quickchow.jpg", "product-art-noodles", "", 0],
    
    // =========================================================
    // ====== 6. SOFTDRINKS - /images/Softdrinks/ ======
    // =========================================================
    ["Coke Mismo", "300ml · Regular", 25, "drink", "🥤", "/images/Softdrinks/coke-mismo.jpg", "product-art-drink", "", 0],
    ["Royal Mismo", "300ml · Tru-Orange", 25, "drink", "🥤", "/images/Softdrinks/royal-mismo.jpg", "product-art-drink", "", 0],
    ["Sprite Mismo", "300ml · Lemon", 25, "drink", "🥤", "/images/Softdrinks/sprite-mismo.jpg", "product-art-drink", "", 0],
    ["Mountain Dew Mismo", "300ml · Citrus", 25, "drink", "🥤", "/images/Softdrinks/mountain-dew-mismo.jpg", "product-art-drink", "", 0],
    ["C2 Green Tea", "230ml · Apple", 22, "drink", "🍵", "/images/Softdrinks/c2-green-tea.jpg", "product-art-drink", "", 0],
    ["Coke 1.5L", "Coca-Cola · 1.5L", 80, "drink", "🥤", "/images/Softdrinks/coke-15l.jpg", "product-art-drink", "", 0],
    ["Royal 1.5L", "Royal · 1.5L", 80, "drink", "🥤", "/images/Softdrinks/royal-15l.jpg", "product-art-drink", "", 0],
    ["Sprite 1.5L", "Sprite · 1.5L", 80, "drink", "🥤", "/images/Softdrinks/sprite-15l.jpg", "product-art-drink", "", 0],
    ["Mountain Dew 1.5L", "Mountain Dew · 1.5L", 80, "drink", "🥤", "/images/Softdrinks/mountain-dew-15l.jpg", "product-art-drink", "", 0],
    
    // =========================================================
    // ====== 7. HOUSEHOLD ESSENTIALS - /images/HouseholdEssentials/ ======
    // =========================================================
    ["Surf Powder", "Sachet · Lavender", 18, "household", "🧼", "/images/HouseholdEssentials/sabon.jpg", "product-art-household", "", 0],
    ["Tide Powder", "Sachet · Original", 18, "household", "🧼", "/images/HouseholdEssentials/tide.jpg", "product-art-household", "", 0],
    ["Bottle Joy Dishwashing", "Bottle · Lemon", 25, "household", "🍋", "/images/HouseholdEssentials/joy.jpg", "product-art-household", "", 0],
    ["Downy Fabcon", "Sachet · Passion", 15, "household", "🌸", "/images/HouseholdEssentials/downy.jpg", "product-art-household", "", 0],
    
    // =========================================================
    // ====== 8. SCHOOL SUPPLIES - /images/SchoolSupplies/ ======
    // =========================================================
    ["Ballpen", "Black / Blue / Red", 10, "school", "🖊️", "/images/SchoolSupplies/ballpen.jpg", "product-art-school", "", 0],
    ["Pencil", "Mongol · Single", 10, "school", "✏️", "/images/SchoolSupplies/pencil.jpg", "product-art-school", "", 0],
    ["Notebook", "80 leaves · Ruled", 25, "school", "📓", "/images/SchoolSupplies/notebook.jpg", "product-art-school", "", 0],
    ["Pad Paper", "Intermediate · Pad", 20, "school", "📄", "/images/SchoolSupplies/pad-paper.jpg", "product-art-school", "", 0],
    ["Eraser", "White · Single", 10, "school", "🧽", "/images/SchoolSupplies/eraser.jpg", "product-art-school", "", 0],
    ["Pentelpen Marker", "Black · Single", 10, "school", "🖍️", "/images/SchoolSupplies/pentelpen.jpg", "product-art-school", "", 0],
    ["Colored Paper", "Assorted · per sheet", 2, "school", "🎨", "/images/SchoolSupplies/colored-paper.jpg", "product-art-school", "", 0],
    ["Typewriting Paper", "Short · per sheet", 1, "school", "📃", "/images/SchoolSupplies/typewriting.jpg", "product-art-school", "", 0],
    
    // =========================================================
    // ====== 9. FROZEN FOODS - /images/FrozenFoods/ ======
    // =========================================================
    ["Hotdog", "Tender Juicy · 250g", 70, "frozen", "🌭", "/images/FrozenFoods/hotdog.jpg", "product-art-frozen", "", 0],
    ["Longanisa", "Curing's · 250g", 60, "frozen", "🥓", "/images/FrozenFoods/longanisa.jpg", "product-art-frozen", "", 0],
    ["Tocino", "Frozen · 250g", 75, "frozen", "🥩", "/images/FrozenFoods/tocino.jpg", "product-art-frozen", "", 0],
    ["Chicken Nuggets", "Frozen · 250g", 60, "frozen", "🍗", "/images/FrozenFoods/chicken-nuggets.jpg", "product-art-frozen", "", 0],
    ["Shanghai", "Lumpia · 250g", 60, "frozen", "🥟", "/images/FrozenFoods/shanghai.jpg", "product-art-frozen", "", 0],
    
    // =========================================================
    // ====== 10. BISCUITS - /images/Biscuits/ ======
    // =========================================================
    ["Rebisco Sandwich", "Cream · Pack", 10, "biscuit", "🍪", "/images/Biscuits/rebisco.jpg", "product-art-biscuit", "", 0],
    ["Skyflakes", "Crackers · 10 pcs", 10, "biscuit", "🍘", "/images/Biscuits/skyflakes.jpg", "product-art-biscuit", "", 0],
    ["Cream-O", "Vanilla · Pack", 10, "biscuit", "🍪", "/images/Biscuits/cream-o.jpg", "product-art-biscuit", "", 0],
    ["Hansel Sandwich", "Mocha · Pack", 10, "biscuit", "🍪", "/images/Biscuits/hansel.jpg", "product-art-biscuit", "", 0],
    ["Cloud-9", "Chocolate · Pack", 10, "biscuit", "🍫", "/images/Biscuits/cloud-9.jpg", "product-art-biscuit", "", 0],
    ["Richoco", "Chocolate · Pack", 15, "biscuit", "🍫", "/images/Biscuits/richoco.jpg", "product-art-biscuit", "", 0],
    ["Choco Mucho", "Chocolate wafer", 10, "biscuit", "🍫", "/images/Biscuits/choco-mucho.jpg", "product-art-biscuit", "", 0],
    ["Beng Beng", "Wafer · Single", 10, "biscuit", "🍫", "/images/Biscuits/beng-beng.jpg", "product-art-biscuit", "", 0],
    
    // =========================================================
    // ====== 11. CANDIES - /images/Candies/ ======
    // =========================================================
    ["Max", "4 pieces · Pack", 5, "candy", "🍬", "/images/Candies/max.jpg", "product-art-candy", "", 0],
    ["Lollipop", "Single · Assorted", 2, "candy", "🍭", "/images/Candies/lollipop.jpg", "product-art-candy", "", 0],
    ["Snowbear", "Single · Assorted", 2, "candy", "🍬", "/images/Candies/snowbear.jpg", "product-art-candy", "", 0],
    ["Gummy Worms", "per piece", 1, "candy", "🪱", "/images/Candies/gummy-worms.jpg", "product-art-candy", "", 0],
    ["Nips", "Chocolate · Pack", 5, "candy", "🍫", "/images/Candies/nips.jpg", "product-art-candy", "", 0],
    ["Chubby", "4 pieces · Pack", 5, "candy", "🍬", "/images/Candies/chubby.jpg", "product-art-candy", "", 0]
  ];
  
  const insertMany = db.transaction((rows) => {
    for (const row of rows) insert.run(...row);
  });
  insertMany(seed);
}

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/products", (req, res) => {
  const featured = req.query.featured === "true";
  const rows = featured
    ? db.prepare("SELECT * FROM products WHERE featured = 1 ORDER BY id").all()
    : db.prepare("SELECT * FROM products ORDER BY id").all();
  res.json(rows);
});

app.post("/api/orders", (req, res) => {
  const { name, phone, pickup, message, items } = req.body;
  if (!name || !phone || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Missing name, phone, or items." });
  }
  try {
    const result = db.transaction(() => {
      const getProduct = db.prepare("SELECT id, price FROM products WHERE id = ?");
      const lines = items.map((item) => {
        const product = getProduct.get(item.productId);
        if (!product) throw new Error("Product " + item.productId + " not found");
        const qty = Math.max(1, Number(item.quantity) || 1);
        return { productId: product.id, quantity: qty, price: product.price, lineTotal: product.price * qty };
      });
      const total = lines.reduce((sum, line) => sum + line.lineTotal, 0);
      const info = db.prepare("INSERT INTO orders (customer_name, phone, pickup_time, message, total) VALUES (?, ?, ?, ?, ?)")
        .run(name, phone, pickup || "", message || "", total);
      const orderId = info.lastInsertRowid;
      const insertItem = db.prepare("INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)");
      for (const line of lines) insertItem.run(orderId, line.productId, line.quantity, line.price);
      return { orderId, total };
    })();
    res.json({ ok: true, orderId: result.orderId, total: result.total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "Could not save order." });
  }
});

app.post("/api/contact", (req, res) => {
  const { name, phone, message, pickup } = req.body;
  if (!name || !phone || !message) return res.status(400).json({ error: "Missing fields." });
  db.prepare("INSERT INTO contact_messages (name, phone, message, pickup_time) VALUES (?, ?, ?, ?)")
    .run(name, phone, message, pickup || "");
  res.json({ ok: true });
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log("Tindahan server running on http://localhost:" + PORT);
});