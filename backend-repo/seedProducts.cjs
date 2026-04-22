// seed-from-excel.js
// Run this from your backend-repo folder:
//   node seed-from-excel.js
//
// Requirements:
//   npm install xlsx mongoose dotenv
//   Make sure your .env has MONGO_URI set to your Atlas connection string
//   Place TITLES_EXCEL_.xlsx in the same folder as this script

const mongoose = require("mongoose");
const xlsx = require("xlsx");
require("dotenv").config();

const path = require("path");
const { fileURLToPath } = require("url");

const filePath = path.join(__dirname, "TITLES_EXCEL.xlsx");

// ─── MODELS ──────────────────────────────────────────────────────────────────

const categorySchema = new mongoose.Schema(
  {
    name: String,
    slug: String,
    description: String,
    emoji: String,
    order: Number,
    isActive: { type: Boolean, default: true },
    subCategories: [
      { name: String, slug: String, description: String, brands: [String] },
    ],
  },
  { timestamps: true },
);

const productSchema = new mongoose.Schema(
  {
    name: String,
    slug: { type: String, unique: true },
    sku: String,
    description: String,
    shortDescription: String,
    price: Number,
    salePrice: Number,
    onSale: { type: Boolean, default: false },
    unit: { type: String, default: "m²" },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    subCategory: String,
    brand: String,
    supplier: String,
    dimension: String,
    synonym: String,
    tags: [String],
    images: [{ url: String, alt: String }],
    coverImage: String,
    specs: [{ key: String, value: String }],
    attributes: {
      waterproof: Boolean,
      slipResistant: Boolean,
      herringbone: Boolean,
      diyFriendly: Boolean,
      petFriendly: Boolean,
      outdoorRated: Boolean,
      fscCertified: Boolean,
      lowVoc: Boolean,
      colour: String,
      finish: String,
      thickness: String,
      warranty: String,
    },
    stock: { type: Number, default: 100 },
    inStock: { type: Boolean, default: true },
    sampleAvailable: { type: Boolean, default: true },
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
    isNew: { type: Boolean, default: false },
    isBestseller: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    gradientFrom: String,
    gradientTo: String,
  },
  { timestamps: true },
);

const Category = mongoose.model("Category", categorySchema);
const Product = mongoose.model("Product", productSchema);

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const slugify = (text) =>
  String(text)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

const normaliseCategory = (raw) => {
  const c = raw.toLowerCase();
  if (
    c.includes("hybrid") ||
    c.includes("waterproof") ||
    c.includes("spc") ||
    c.includes("splendid") ||
    c.includes("deluxe") ||
    c.includes("luvanto") ||
    c.includes("silva") ||
    c.includes("axen") ||
    c.includes("guardian") ||
    c.includes("duro") ||
    c.includes("obsidian") ||
    c.includes("stone classic") ||
    c.includes("stone signature") ||
    c.includes("easyliving") ||
    c.includes("green earth hybrid")
  )
    return "hybrid";
  if (c.includes("bamboo")) return "bamboo";
  if (c.includes("carpet")) return "carpet";
  if (c.includes("marble") || c.includes("tile")) return "tiles";
  if (c.includes("laminate") || c.includes("lamination")) return "laminate";
  if (c.includes("accessories") || c.includes("scotia") || c.includes("quad"))
    return "accessories";
  return "timber";
};

const GRADIENTS = {
  timber: { from: "#C8A870", to: "#A88050" },
  hybrid: { from: "#8B8E9A", to: "#606878" },
  laminate: { from: "#D8D0C0", to: "#B8B0A0" },
  tiles: { from: "#E8E0D4", to: "#C8BEB0" },
  bamboo: { from: "#C8C080", to: "#A8A060" },
  carpet: { from: "#A0A0A8", to: "#808088" },
  accessories: { from: "#C0C8D0", to: "#A0A8B0" },
};

const DESCRIPTIONS = {
  timber: (name, sub, dim, supplier) =>
    `${name} engineered timber from the ${sub} collection by ${supplier}. Dimensions: ${dim}. Real wood veneer over engineered core for lasting beauty and stability. Ideal for living areas and bedrooms across Victorian homes.`,
  hybrid: (name, sub, dim, supplier) =>
    `${name} hybrid flooring from ${supplier} — ${sub} series. Size: ${dim}. 100% waterproof SPC rigid core with realistic timber finish. Suitable for all rooms including bathrooms and kitchens. AS 1884 compliant.`,
  laminate: (name, sub, dim, supplier) =>
    `${name} laminate from the ${sub} range by ${supplier}. Dimensions: ${dim}. Scratch-resistant AC4/AC5 surface with authentic timber emboss. Easy click-float installation for DIY or professional install.`,
  tiles: (name, sub, dim, supplier) =>
    `${name} from ${supplier}'s ${sub} collection. Size: ${dim}. Premium porcelain tile for floors and walls. Suitable for bathrooms, kitchens, and living areas. Complies with Australian Standards for slip resistance.`,
  bamboo: (name, sub, dim, supplier) =>
    `${name} bamboo flooring — ${sub} collection by ${supplier}. Dimensions: ${dim}. Eco-friendly, FSC certified strand woven bamboo. Extremely hard-wearing with natural character.`,
  carpet: (name, sub, dim, supplier) =>
    `${name} carpet tile from ${supplier}. ${sub} range. Dimensions: ${dim}. Commercial and residential grade with anti-static, soil-resistant face fibre.`,
  accessories: (name, sub, dim, supplier) =>
    `${name} — ${sub} accessory by ${supplier}. Dimensions: ${dim}. Essential flooring accessory for a professional finish.`,
};

const ATTRIBUTES = {
  timber: { fscCertified: true, diyFriendly: false, waterproof: false },
  hybrid: { waterproof: true, diyFriendly: true, petFriendly: true },
  laminate: { diyFriendly: true, waterproof: false },
  tiles: { slipResistant: true },
  bamboo: { fscCertified: true, lowVoc: true },
  carpet: { soundproof: true },
  accessories: {},
};

const PRICE_RANGES = {
  timber: [65, 120],
  hybrid: [42, 75],
  laminate: [32, 65],
  tiles: [38, 95],
  bamboo: [45, 80],
  carpet: [25, 45],
  accessories: [15, 60],
};

const randomPrice = (catSlug) => {
  const [min, max] = PRICE_RANGES[catSlug] || [30, 80];
  return parseFloat((Math.random() * (max - min) + min).toFixed(2));
};

// ─── PARSE EXCEL ─────────────────────────────────────────────────────────────

const parseExcel = () => {
  const wb = xlsx.readFile(filePath);
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json(sheet, { header: 1 });

  const products = [];
  const slugCount = {};
  let mainCat = "",
    subCat = "",
    dimension = "",
    supplier = "";

  for (const row of rows) {
    console.log(row);
    const c1 =
      row[0] !== undefined && row[0] !== null ? String(row[0]).trim() : "";
    const c2 =
      row[1] !== undefined && row[1] !== null ? String(row[1]).trim() : "";
    const c4 =
      row[3] !== undefined && row[3] !== null ? String(row[3]).trim() : "";
    const c5 =
      row[4] !== undefined && row[4] !== null ? String(row[4]).trim() : "";

    // Skip header/empty
    if (
      c2 === "ORIGINAL NAME" ||
      c2 === "S.NO" ||
      c2 === "TITLES" ||
      (!c1 && !c2)
    )
      continue;

    // Main category: col1 empty, col2 ALL CAPS
    if (!c1 && c2 && c2 === c2.toUpperCase() && c2.length > 2) {
      mainCat = c2;
      subCat = "";
      continue;
    }

    // Sub-category: col1 is single letter A-J
    if (/^[A-J]$/.test(c1) && c2) {
      subCat = c2;
      if (c4 && c4 !== "undefined") dimension = c4;
      if (c5 && c5 !== "undefined") supplier = c5;
      continue;
    }

    // Skip brochures
    if (c2.toUpperCase() === "BROCHURE" || !c2 || c2 === "undefined") continue;

    // Product: col1 is a number
    if (isNaN(Number(c1))) continue;

    // Extract name and SKU
    let name = c2,
      sku = null;
    const m = c2.match(/^(.*?)\s*\(([A-Z0-9\-]+)\)\s*$/);
    if (m) {
      name = m[1].trim();
      sku = m[2];
    }

    if (!name || name.toUpperCase() === "NAN") continue;

    // Slugify with dedup
    const base = slugify(name);
    slugCount[base] = (slugCount[base] || 0) + 1;
    const slug = slugCount[base] > 1 ? `${base}-${slugCount[base]}` : base;

    const catSlug = normaliseCategory(mainCat);
    const grad = GRADIENTS[catSlug] || GRADIENTS.timber;
    const price = randomPrice(catSlug);

    products.push({
      name: name
        .split(" ")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(" "),
      slug,
      sku: sku || `AVS-${String(products.length + 1).padStart(4, "0")}`,
      mainCat,
      catSlug,
      subCategory: subCat
        ? subCat
            .split(" ")
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
            .join(" ")
        : "",
      supplier: supplier || "Avenue Surface",
      dimension,
      price,
      gradientFrom: grad.from,
      gradientTo: grad.to,
    });
  }

  return products;
};

// ─── SEED ────────────────────────────────────────────────────────────────────

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI, {
    dbName: "avenue-surface",
  });

  // Parse Excel
  const parsed = parseExcel();
  console.log(`📊 Parsed ${parsed.length} products from Excel`);

  // Ensure categories exist (upsert by slug)
  const CAT_META = {
    hybrid: {
      name: "Hybrid Flooring",
      emoji: "🌊",
      order: 1,
      desc: "Waterproof, durable, and realistic timber looks.",
    },
    timber: {
      name: "Engineered Timber",
      emoji: "🪵",
      order: 2,
      desc: "Real timber veneer over engineered core.",
    },
    laminate: {
      name: "Laminate",
      emoji: "📋",
      order: 3,
      desc: "Budget-friendly timber looks with great durability.",
    },
    tiles: {
      name: "Tiles",
      emoji: "🪨",
      order: 4,
      desc: "Floor, wall, and outdoor tiles.",
    },
    bamboo: {
      name: "Bamboo",
      emoji: "🎋",
      order: 5,
      desc: "Eco-friendly, FSC certified bamboo flooring.",
    },
    carpet: {
      name: "Carpet Tiles",
      emoji: "🧶",
      order: 6,
      desc: "Commercial and residential carpet tiles.",
    },
    accessories: {
      name: "Accessories",
      emoji: "🔧",
      order: 7,
      desc: "Trims, underlay, adhesives, and more.",
    },
  };

  const catMap = {};
  for (const [slug, meta] of Object.entries(CAT_META)) {
    const cat = await Category.findOneAndUpdate(
      { slug },
      {
        name: meta.name,
        slug,
        description: meta.desc,
        emoji: meta.emoji,
        order: meta.order,
        isActive: true,
      },
      { upsert: true, new: true },
    );
    catMap[slug] = cat._id;
    console.log(`  📁 Category: ${meta.name} → ${cat._id}`);
  }

  // Build product docs
  const docs = parsed.map((p, i) => {
    const catSlug = p.catSlug;
    const descFn = DESCRIPTIONS[catSlug] || DESCRIPTIONS.timber;
    const attrs = ATTRIBUTES[catSlug] || {};
    const specs = [];
    if (p.dimension) specs.push({ key: "Dimensions", value: p.dimension });
    if (p.sku) specs.push({ key: "SKU", value: p.sku });
    specs.push({ key: "Supplier", value: p.supplier });

    return {
      name: p.name,
      slug: p.slug,
      sku: p.sku,
      description: descFn(
        p.name,
        p.subCategory || "Standard",
        p.dimension || "See supplier",
        p.supplier,
      ),
      shortDescription:
        `${p.name} — ${p.subCategory || ""} ${p.mainCat}. ${p.dimension || ""}`.trim(),
      price: p.price,
      unit: "m²",
      category: catMap[catSlug],
      subCategory: p.subCategory,
      brand: p.supplier,
      supplier: p.supplier,
      dimension: p.dimension,
      tags: [
        catSlug,
        p.subCategory?.toLowerCase(),
        p.supplier?.toLowerCase(),
      ].filter(Boolean),
      specs,
      attributes: attrs,
      stock: Math.floor(Math.random() * 200) + 50,
      inStock: true,
      sampleAvailable: true,
      isFeatured: i < 8, // first 8 are featured
      isNew: i < 16 && i >= 8, // next 8 are new
      isBestseller: i < 4,
      isActive: true,
      gradientFrom: p.gradientFrom,
      gradientTo: p.gradientTo,
      rating: 0,
      numReviews: 0,
    };
  });

  // Delete existing products and re-insert
  const deleted = await Product.deleteMany({});
  console.log(`\n🗑️  Deleted ${deleted.deletedCount} existing products`);

  // Insert in batches of 50
  let inserted = 0;
  for (let i = 0; i < docs.length; i += 50) {
    const batch = docs.slice(i, i + 50);
    await Product.insertMany(batch, { ordered: false });
    inserted += batch.length;
    console.log(`  ✅ Inserted ${inserted}/${docs.length}`);
  }

  console.log(`\n🎉 Done! ${inserted} products uploaded to MongoDB`);
  console.log("\nCategory breakdown:");
  const counts = {};
  docs.forEach((d) => {
    const slug = Object.keys(catMap).find(
      (k) => String(catMap[k]) === String(d.category),
    );
    counts[slug] = (counts[slug] || 0) + 1;
  });
  Object.entries(counts).forEach(([k, v]) =>
    console.log(`  ${k}: ${v} products`),
  );

  process.exit(0);
};

seed().catch((err) => {
  console.error("❌ Error:", err.message);
  process.exit(1);
});
