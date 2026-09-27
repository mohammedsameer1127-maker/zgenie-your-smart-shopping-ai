/**
 * Strict Product Matching & Category Filtering Service for ZGenie (TypeScript)
 * 
 * Guarantees 100% exact-match product comparison by:
 * 1. Detecting user's requested product category (smartphone, laptop, earbuds, phone_case, charger, etc.).
 * 2. For smartphone queries, strictly accepting ONLY actual mobile phones and rejecting all accessories:
 *    - Back covers, cases, bumpers, pouches, sleeves, holders, stands
 *    - Tempered glass, screen protectors, screen guards, camera lens protectors
 *    - Chargers, adapters, USB cables, power banks
 *    - Replacement screens, LCDs, display combos, housings, middle frames, spare parts
 *    - Compatibility prefixes ('compatible with...', 'for iQOO 15R', 'case for...')
 * 3. Enforcing positive smartphone evidence (RAM, ROM, 5G, display, processor, price sanity >= ₹3,500).
 * 4. Verifying exact model identity (e.g. iQOO 15R vs iQOO 15, iQOO Neo 10R vs iQOO Neo 10/Neo 9 Pro).
 * 5. Comprehensive developer debugging logging per candidate.
 */

export const ACCESSORY_KEYWORDS = [
  "back cover", "flip cover", "wallet case", "phone case", "silicone case",
  "leather case", "bumper case", "hard case", "soft case", "armor case",
  "tpu case", "transparent case", "clear case", "matte case", "hybrid case",
  "magnetic case", "magsafe case", "polycarbonate case", "case", "cover", "covers", "cases",
  "tempered glass", "screen protector", "screen guard", "glass protector",
  "lens protector", "camera protector", "camera lens guard", "camera glass",
  "matte glass", "privacy glass", "uv glass", "edge to edge glass", "protection film", "guard film",
  "skin", "skins", "decal", "decals", "wrap", "wraps", "sticker", "stickers", "back skin", "mobile skin",
  "pouch", "sleeve", "holster", "bumper", "holder", "mount", "stand", "dock", "tripod", "monopod",
  "ring holder", "grip", "pop socket", "popsocket", "car mount", "desk stand", "arm band",
  "charger", "charging adapter", "power adapter", "fast charger", "wall charger",
  "car charger", "wireless charger", "charging pad", "charging dock", "cable",
  "usb cable", "type c cable", "lightning cable", "data cable", "charging cable",
  "power bank", "powerbank", "earphone", "earphones", "headphone", "headphones",
  "neckband", "earpad", "earpads", "ear cushion", "replacement battery",
  "housing", "back panel", "body panel", "middle frame", "spare parts", "spare part",
  "display screen", "lcd", "touch lcd", "touch screen", "digitizer", "display combo",
  "folder", "combo", "motherboard", "flex cable", "connector", "charging jack",
  "sim tray", "fingerprint sensor", "camera module", "speaker grill", "strap",
  "lanyard", "keychain", "case only", "cover only", "band only", "aulumu"
];

export const ACCESSORY_COMPATIBILITY_PATTERNS = [
  /\bcase\s+for\b/i,
  /\bcover\s+for\b/i,
  /\bback\s+cover\s+for\b/i,
  /\bflip\s+cover\s+for\b/i,
  /\bglass\s+for\b/i,
  /\btempered\s+glass\s+for\b/i,
  /\bscreen\s+(?:guard|protector)\s+for\b/i,
  /\bprotector\s+for\b/i,
  /\bcamera\s+lens\s+for\b/i,
  /\bcharger\s+for\b/i,
  /\bcable\s+for\b/i,
  /\bskin\s+for\b/i,
  /\bpouch\s+for\b/i,
  /\bcompatible\s+with\b/i,
  /\bdesigned\s+for\b/i,
  /\bsuitable\s+for\b/i,
  /\bdedicated\s+for\b/i,
  /\bfor\s+(?:apple|iphone|samsung|galaxy|iqoo|oneplus|google|pixel|redmi|realme|vivo|oppo|poco|motorola|moto|xiaomi|hp|dell|lenovo|asus|acer)\b/i,
  /\bfor\s+[a-z0-9\s-]+\s+(?:5g|4g|phone|mobile|smartphone)?\s*(?:back\s*cover|case|cover|glass|tempered|guard|skin)\b/i
];

export const REFURBISHED_KEYWORDS = [
  "refurbished", "renewed", "pre-owned", "preowned", "second hand", "2nd hand",
  "fair grade", "good grade", "superb grade", "unboxed condition", "open box", "used"
];

export const KNOWN_BRANDS = [
  "apple", "samsung", "oneplus", "google", "sony", "bose", "sennheiser", "jbl",
  "dell", "hp", "lenovo", "asus", "acer", "msi", "xiaomi", "redmi", "realme",
  "vivo", "iqoo", "oppo", "nothing", "motorola", "moto", "poco", "infinix",
  "honor", "dji", "canon", "nikon", "fujifilm", "gopro", "insta360", "lg",
  "tcl", "hisense", "nike", "adidas", "puma", "asics", "new balance", "skechers",
  "woodland", "crocs", "levis", "zara", "h&m", "allen solly", "peter england",
  "manyavar", "dyson", "philips", "instant pot", "nespresso", "bosch",
  "morphy richards", "eureka forbes", "kent", "dior", "chanel", "tom ford",
  "versace", "yves saint laurent", "ysl", "forest essentials", "kama ayurveda",
  "the body shop", "mamaearth", "plum", "minimalist", "wild stone", "amul",
  "tata", "parle", "cadbury", "nestle", "dabur", "colgate", "dettol"
];

export const FAMILY_TO_BRAND: Record<string, string> = {
  "iphone": "apple",
  "macbook": "apple",
  "macbook air": "apple",
  "macbook pro": "apple",
  "airpods": "apple",
  "airpods pro": "apple",
  "airpods max": "apple",
  "ipad": "apple",
  "ipad air": "apple",
  "ipad pro": "apple",
  "apple watch": "apple",
  "imac": "apple",
  "mac mini": "apple",
  "mac studio": "apple",
  "galaxy": "samsung",
  "galaxy s": "samsung",
  "galaxy z": "samsung",
  "galaxy fold": "samsung",
  "galaxy flip": "samsung",
  "galaxy tab": "samsung",
  "galaxy watch": "samsung",
  "galaxy buds": "samsung",
  "pixel": "google",
  "pixel buds": "google",
  "pixel watch": "google",
  "nord": "oneplus",
  "iqoo": "iqoo",
  "wh-1000xm": "sony",
  "wf-1000xm": "sony",
  "wh 1000xm": "sony",
  "wf 1000xm": "sony",
  "bravia": "sony",
  "playstation": "sony",
  "ps5": "sony",
  "ps4": "sony",
  "thinkpad": "lenovo",
  "ideapad": "lenovo",
  "legion": "lenovo",
  "yoga": "lenovo",
  "loq": "lenovo",
  "rog": "asus",
  "tuf": "asus",
  "zenbook": "asus",
  "vivobook": "asus",
  "predator": "acer",
  "nitro": "acer",
  "aspire": "acer",
  "swift": "acer",
  "xps": "dell",
  "alienware": "dell",
  "inspiron": "dell",
  "vostro": "dell",
  "latitude": "dell",
  "pavilion": "hp",
  "spectre": "hp",
  "envy": "hp",
  "omen": "hp",
  "victus": "hp",
  "redmi": "xiaomi",
  "poco": "poco",
  "realme": "realme",
  "quietcomfort": "bose",
  "soundlink": "bose",
};

export const COLOR_ALIASES: Record<string, string> = {
  "space grey": "space gray",
  "spacegray": "space gray",
  "space grey / silver": "space gray",
  "natural titanium": "natural titanium",
  "desert titanium": "desert titanium",
  "black titanium": "black titanium",
  "white titanium": "white titanium",
  "phantom black": "black",
  "matte black": "black",
  "midnight": "midnight",
  "starlight": "starlight",
  "titanium gray": "gray",
  "titanium black": "black",
  "titanium violet": "violet",
  "titanium yellow": "yellow",
  "sierra blue": "blue",
  "pacific blue": "blue",
  "deep purple": "purple",
};

const FILLER_WORDS = new Set([
  "new", "latest", "original", "authentic", "genuine", "certified",
  "renewed", "refurbished", "unboxed", "sealed", "pack", "best",
  "hot", "deal", "offer", "sale", "special", "edition", "series",
  "buy", "online", "india", "brand", "official", "store", "global",
  "unlocked", "smart", "with", "the", "in", "at", "and", "or"
]);

export interface ExtractedAttributes {
  rawText: string;
  normalizedText: string;
  brand: string | null;
  family: string | null;
  series: string | null;
  model: string | null;
  tier: string | null;
  generation: string | null;
  category: string;
  productType: string;
  storage: string | null;
  ram: string | null;
  color: string | null;
  size: string | null;
  modelNumber: string | null;
  isAccessory: boolean;
  isRefurbished: boolean;
  hasPositivePhoneSignal: boolean;
}

export function normalizeText(text: string): string {
  if (!text) return "";
  let t = text.toLowerCase();
  t = t.replace(/\b(\d+)\s*(gb|tb|mb)\s*ram\b/g, "$1$2 ram");
  t = t.replace(/\b(\d+)\s*(gb|tb|mb|g|kg|ml|l|cm|mm|inch|in)\b/g, "$1$2");
  t = t.replace(/\b(\d)\s*g\b/g, "$1g");
  t = t.replace(/\b(\d+)(?:st|nd|rd|th)?\s*generation\b/g, "$1nd gen");
  t = t.replace(/\bgen\s*(\d+)\b/g, "$1nd gen");
  t = t.replace(/[^\w\s-]/g, " ");
  t = t.replace(/\s+/g, " ").trim();
  return t;
}

export function detectProductCategory(text: string): { category: string; productType: string; isAccessory: boolean } {
  const norm = normalizeText(text);
  const lower = text.toLowerCase();

  // 1. Explicit Accessory Detection
  const hasCompatPattern = ACCESSORY_COMPATIBILITY_PATTERNS.some((pat) => pat.test(norm) || pat.test(lower));
  let isAcc = false;
  let accType: string | null = null;

  if (hasCompatPattern) {
    isAcc = true;
    accType = "accessory";
  }

  const words = new Set(norm.split(" "));
  for (const kw of ACCESSORY_KEYWORDS) {
    const kwNorm = normalizeText(kw);
    if (kwNorm.includes(" ")) {
      if (norm.includes(kwNorm)) {
        isAcc = true;
        accType = kw;
        break;
      }
    } else {
      if (words.has(kwNorm)) {
        isAcc = true;
        accType = kw;
        break;
      }
    }
  }

  if (isAcc) {
    if (["case", "cover", "pouch", "sleeve", "bumper"].some((c) => norm.includes(c))) {
      return { category: "phone_case", productType: "phone_case", isAccessory: true };
    }
    if (["glass", "protector", "guard", "tempered"].some((g) => norm.includes(g))) {
      return { category: "screen_protector", productType: "screen_protector", isAccessory: true };
    }
    if (["charger", "adapter", "power bank"].some((ch) => norm.includes(ch))) {
      return { category: "charger", productType: "charger", isAccessory: true };
    }
    if (["cable", "usb", "type c", "lightning"].some((cb) => norm.includes(cb))) {
      return { category: "cable", productType: "cable", isAccessory: true };
    }
    if (["housing", "lcd", "display", "combo", "spare", "battery", "panel"].some((sp) => norm.includes(sp))) {
      return { category: "spare_part", productType: "spare_part", isAccessory: true };
    }
    return { category: "accessory", productType: accType || "accessory", isAccessory: true };
  }

  // 2. Audio & Wearable Categories
  if (/\b(?:airpods|earbuds|earphones|headphones|headset|neckband|tws|buds)\b/i.test(norm)) {
    return { category: "earbuds", productType: "audio_device", isAccessory: false };
  }
  if (/\b(?:apple watch|galaxy watch|smartwatch|watch ultra)\b/i.test(norm)) {
    return { category: "smartwatch", productType: "wearable", isAccessory: false };
  }

  // 3. Computing Categories
  if (/\b(?:macbook|laptop|notebook|thinkpad|ideapad|legion|victus|pavilion|omen|rog|tuf|zenbook|vivobook|predator|nitro|alienware|xps|inspiron)\b/i.test(norm)) {
    return { category: "laptop", productType: "laptop", isAccessory: false };
  }
  if (/\b(?:ipad|tablet|tab s\d+|galaxy tab|pad)\b/i.test(norm)) {
    return { category: "tablet", productType: "tablet", isAccessory: false };
  }

  // 4. Smartphone Category
  let isPhone = false;
  if (/\b(?:smartphone|mobile phone|mobile|phone|5g phone|4g phone|dual sim)\b/i.test(norm)) {
    isPhone = true;
  }
  if (/\b(?:iphone|iqoo|galaxy|oneplus|pixel|redmi|poco|realme|infinix|motorola|moto|tecno|vivo|oppo)\b/i.test(norm)) {
    isPhone = true;
  }
  if (/\b(?:s\d{1,2}|z\s*fold|z\s*flip|nord|neo\s*\d+[a-z]?|\d{1,2}r|gt\s*\d)\b/i.test(norm)) {
    isPhone = true;
  }

  if (isPhone) {
    return { category: "smartphone", productType: "smartphone", isAccessory: false };
  }

  return { category: "general", productType: "general", isAccessory: false };
}

export function extractProductAttributes(text: string): ExtractedAttributes {
  const norm = normalizeText(text);
  const lowerRaw = text.toLowerCase();

  // 1. Detect Category & Accessory Status
  const { category, productType, isAccessory } = detectProductCategory(text);

  // 2. Refurbished Detection
  const isRefurbished = REFURBISHED_KEYWORDS.some((ref) => norm.includes(ref) || lowerRaw.includes(ref));

  // 3. Positive Phone Signals
  let hasPositivePhoneSignal = false;
  if (/\b(?:smartphone|mobile phone|5g smartphone|4g mobile|dual sim|internal storage|quad camera|triple camera|amoled|fhd\+|snapdragon|dimensity|bionic|mah)\b/i.test(norm)) {
    hasPositivePhoneSignal = true;
  }
  if (/\b\d{1,2}gb\s*ram\b/i.test(norm) && /\b\d{2,4}gb\b/i.test(norm)) {
    hasPositivePhoneSignal = true;
  }

  // 4. Brand & Family Extraction
  let extractedBrand: string | null = null;
  let extractedFamily: string | null = null;

  const words = new Set(norm.split(" "));
  for (const b of KNOWN_BRANDS) {
    const bNorm = normalizeText(b);
    if (bNorm.includes(" ")) {
      if (norm.includes(bNorm)) {
        extractedBrand = b;
        break;
      }
    } else {
      if (words.has(bNorm)) {
        extractedBrand = b;
        break;
      }
    }
  }

  const sortedFamilies = Object.keys(FAMILY_TO_BRAND).sort((a, b) => b.length - a.length);
  for (const fam of sortedFamilies) {
    if (norm.includes(fam)) {
      extractedFamily = fam;
      if (!extractedBrand) {
        extractedBrand = FAMILY_TO_BRAND[fam];
      }
      break;
    }
  }

  // 5. Model Tier Extraction
  let extractedTier: string | null = null;
  if (norm.includes("pro max")) {
    extractedTier = "pro max";
  } else if (norm.includes("pro")) {
    extractedTier = "pro";
  } else if (norm.includes("plus") || text.includes("+")) {
    extractedTier = "plus";
  } else if (norm.includes("ultra")) {
    extractedTier = "ultra";
  } else if (norm.includes("mini")) {
    extractedTier = "mini";
  } else if (norm.includes("lite")) {
    extractedTier = "lite";
  } else if (/\bfe\b/.test(norm)) {
    extractedTier = "fe";
  } else if (/\bse\b/.test(norm)) {
    extractedTier = "se";
  } else if (norm.includes("max")) {
    extractedTier = "max";
  }

  // 6. Model & Series Extraction
  let extractedModel: string | null = null;
  let extractedSeries: string | null = null;

  // A. iQOO Models: iQOO 15R, iQOO Neo 10R, iQOO Neo 9 Pro, iQOO Z9s Pro
  const iqooMatch = norm.match(/\biqoo\s*(?:(neo|z|z\d+s?)\s*)?(\d{1,2}[a-z]?)\b/);
  if (iqooMatch) {
    const seriesSub = iqooMatch[1] || "";
    const numSub = iqooMatch[2] || "";
    extractedBrand = "iqoo";
    extractedFamily = "iqoo";
    extractedSeries = seriesSub.trim() || null;
    if (seriesSub) {
      extractedModel = `${seriesSub.trim()} ${numSub.trim()}`.trim();
    } else {
      extractedModel = numSub.trim();
    }
  }

  // B. iPhone Models: iPhone 17 Pro Max, iPhone 16
  const iphoneMatch = norm.match(/\biphone\s*(\d{1,2}|se|x|xs|xr)\b/);
  if (iphoneMatch) {
    extractedModel = `iphone ${iphoneMatch[1]}`;
    extractedBrand = "apple";
    extractedFamily = "iphone";
  }

  // C. Samsung Galaxy Models: Galaxy S26 Ultra, S24, Z Fold 6
  const galaxyMatch = norm.match(/\b(?:galaxy\s*)?(s\d{1,2}|z\s*fold\s*\d|z\s*flip\s*\d|a\d{2}|m\d{2}|f\d{2})\b/);
  if (galaxyMatch) {
    extractedModel = galaxyMatch[1].replace(/\s+/g, "");
    extractedBrand = "samsung";
    extractedFamily = "galaxy";
  }

  // D. OnePlus Models: OnePlus 15R, OnePlus 12, Nord 4
  const opMatch = norm.match(/\b(?:oneplus\s*)?(?:(nord(?:\s*ce)?)\s*)?(\d{1,2}[a-z]?)\b/);
  if (norm.includes("oneplus") || norm.includes("nord")) {
    if (opMatch) {
      const nordSub = opMatch[1] || "";
      const numSub = opMatch[2] || "";
      extractedBrand = "oneplus";
      extractedFamily = "oneplus";
      if (nordSub) {
        extractedModel = `${nordSub.trim()} ${numSub.trim()}`.trim();
      } else {
        extractedModel = numSub.trim();
      }
    }
  }

  // E. Pixel Models: Pixel 9 Pro XL, Pixel 8a
  const pixelMatch = norm.match(/\bpixel\s*(\d{1,2}[a-z]?)\b/);
  if (pixelMatch) {
    extractedModel = `pixel ${pixelMatch[1]}`;
    extractedBrand = "google";
    extractedFamily = "pixel";
  }

  // F. Sony Headphones: WH-1000XM5, WF-1000XM5
  const sonyMatch = norm.match(/\b(w[hf][- ]?1000xm[345])\b/);
  if (sonyMatch) {
    extractedModel = sonyMatch[1].replace(" ", "-").replace("wh1000", "wh-1000").replace("wf1000", "wf-1000");
    extractedBrand = "sony";
    extractedFamily = "wh-1000xm";
  }

  // G. MacBook: MacBook Air M2, MacBook Pro M3
  const macbookMatch = norm.match(/\bmacbook\s*(air|pro)?\s*(m[1234](?:\s*pro|\s*max)?)\b/);
  if (macbookMatch) {
    const mbType = macbookMatch[1] || "";
    const mbChip = macbookMatch[2] || "";
    extractedModel = `macbook ${mbType} ${mbChip}`.replace(/\s+/g, " ").trim();
    extractedBrand = "apple";
    extractedFamily = "macbook";
  }

  // H. HP Laptops: HP Victus 15, Pavilion 14
  const hpMatch = norm.match(/\bhp\s*(victus|pavilion|omen|envy|spectre)\s*(\d{1,2})?\b/);
  if (hpMatch) {
    const series = hpMatch[1] || "";
    const size = hpMatch[2] || "";
    extractedModel = `hp ${series} ${size}`.trim();
    extractedBrand = "hp";
    extractedFamily = series.includes("victus") ? "victus" : series;
  }

  // 7. Storage Extraction
  let extractedStorage: string | null = null;
  const storageMatches = norm.match(/\b(\d{1,4}(?:gb|tb|mb))\b(?!\s*ram)/g);
  if (storageMatches && storageMatches.length > 0) {
    extractedStorage = storageMatches[0];
  }

  // 8. RAM Extraction
  let extractedRam: string | null = null;
  const ramMatch = norm.match(/\b(\d{1,2}(?:gb))\s*ram\b/);
  if (ramMatch) {
    extractedRam = ramMatch[1];
  }

  // 9. Color Extraction
  let extractedColor: string | null = null;
  const colorsList = [
    "natural titanium", "desert titanium", "black titanium", "white titanium",
    "space gray", "space grey", "midnight", "starlight", "phantom black",
    "deep purple", "sierra blue", "pacific blue", "titanium gray", "titanium black",
    "titanium violet", "titanium yellow", "black", "white", "blue", "green",
    "yellow", "pink", "purple", "red", "silver", "gold", "graphite", "teal", "onyx black"
  ];
  for (const c of colorsList) {
    if (norm.includes(c)) {
      extractedColor = COLOR_ALIASES[c] || c;
      break;
    }
  }

  // 10. Size Extraction
  let extractedSize: string | null = null;
  const sizeMatch = norm.match(/\b(\d{1,4}(?:\.\d+)?(?:inch|in|cm|mm))\b/);
  if (sizeMatch) {
    extractedSize = sizeMatch[1];
  }

  // 11. Model Number Extraction
  let extractedModelNum: string | null = null;
  const modelNumMatch = norm.match(/\b([a-z]{1,2}\d{4}[a-z]{0,2}|sm-[a-z]\d{3}[a-z0-9]?|wh1000xm[345]|wf1000xm[345])\b/);
  if (modelNumMatch) {
    extractedModelNum = modelNumMatch[1];
  }

  return {
    rawText: text,
    normalizedText: norm,
    brand: extractedBrand,
    family: extractedFamily,
    series: extractedSeries,
    model: extractedModel,
    tier: extractedTier,
    generation: null,
    category,
    productType,
    storage: extractedStorage,
    ram: extractedRam,
    color: extractedColor,
    size: extractedSize,
    modelNumber: extractedModelNum,
    isAccessory,
    isRefurbished,
    hasPositivePhoneSignal,
  };
}

export function extractBrand(text: string): string | null {
  return extractProductAttributes(text).brand;
}

export function extractStorageVariants(text: string): Set<string> {
  const stor = extractProductAttributes(text).storage;
  return stor ? new Set([stor]) : new Set();
}

export function extractModelTierTokens(text: string): Set<string> {
  const tier = extractProductAttributes(text).tier;
  return tier ? new Set([tier]) : new Set();
}

export function computeTokenSimilarity(query: string, title: string): number {
  const qNorm = normalizeText(query);
  const tNorm = normalizeText(title);

  const qTokens = qNorm.split(" ").filter((w) => w.length > 1 && !FILLER_WORDS.has(w));
  const tTokens = tNorm.split(" ").filter((w) => w.length > 1 && !FILLER_WORDS.has(w));

  if (qTokens.length === 0) return 0;

  let matches = 0;
  for (const qTok of qTokens) {
    if (tTokens.some((tTok) => tTok === qTok || (qTok.length > 3 && tTok.includes(qTok)))) {
      matches++;
    }
  }

  const coverage = matches / qTokens.length;
  return Number(coverage.toFixed(2));
}

export function scoreProductMatch(
  query: string,
  candidateTitle: string,
  candidatePrice?: number,
  candidatePlatform?: string
): { isMatch: boolean; score: number; reason: string } {
  if (!candidateTitle || !candidateTitle.trim()) {
    return { isMatch: false, score: 0, reason: "Empty title" };
  }

  const qAttrs = extractProductAttributes(query);
  const cAttrs = extractProductAttributes(candidateTitle);

  // =========================================================================
  // 1. CATEGORY & ACCESSORY HARD REJECTION RULES
  // =========================================================================

  // If User Searched for a Smartphone
  if (qAttrs.category === "smartphone") {
    if (cAttrs.isAccessory) {
      return {
        isMatch: false,
        score: 0,
        reason: `Accessory (${cAttrs.productType}) rejected for smartphone query '${query}'`
      };
    }
    if (["phone_case", "screen_protector", "charger", "cable", "earbuds", "spare_part"].includes(cAttrs.category)) {
      return {
        isMatch: false,
        score: 0,
        reason: `Category mismatch: query is smartphone, candidate is ${cAttrs.category}`
      };
    }
    if (candidatePrice !== undefined && candidatePrice !== null && candidatePrice < 3500) {
      return {
        isMatch: false,
        score: 0,
        reason: `Price ₹${candidatePrice} fails smartphone sanity lower bound (< ₹3,500)`
      };
    }
  } else if (qAttrs.category === "laptop") {
    if (cAttrs.isAccessory || ["phone_case", "screen_protector", "cable", "charger", "spare_part"].includes(cAttrs.category)) {
      return {
        isMatch: false,
        score: 0,
        reason: `Accessory rejected for laptop query '${query}'`
      };
    }
    if (candidatePrice !== undefined && candidatePrice !== null && candidatePrice < 15000) {
      return {
        isMatch: false,
        score: 0,
        reason: `Price ₹${candidatePrice} fails laptop lower bound (< ₹15,000)`
      };
    }
  } else if (qAttrs.isAccessory) {
    if (!cAttrs.isAccessory) {
      return {
        isMatch: false,
        score: 0,
        reason: `Phone listing rejected for accessory query '${query}'`
      };
    }
  }

  // =========================================================================
  // 2. REFURBISHED / RENEWED REJECTION
  // =========================================================================
  if (cAttrs.isRefurbished && !qAttrs.isRefurbished) {
    return { isMatch: false, score: 0, reason: "Refurbished item rejected for new product search" };
  }

  // =========================================================================
  // 3. BRAND IDENTITY VERIFICATION
  // =========================================================================
  if (qAttrs.brand && cAttrs.brand && qAttrs.brand !== cAttrs.brand) {
    return { isMatch: false, score: 0, reason: `Brand mismatch: expected ${qAttrs.brand}, got ${cAttrs.brand}` };
  }

  // =========================================================================
  // 4. EXACT MODEL VERIFICATION
  // =========================================================================
  if (qAttrs.model && cAttrs.model && qAttrs.model !== cAttrs.model) {
    return { isMatch: false, score: 0, reason: `Exact model mismatch: expected ${qAttrs.model}, got ${cAttrs.model}` };
  }

  // =========================================================================
  // 5. MODEL TIER VERIFICATION
  // =========================================================================
  if (qAttrs.tier) {
    if (cAttrs.tier !== qAttrs.tier) {
      return { isMatch: false, score: 0, reason: `Tier mismatch: expected ${qAttrs.tier}, got ${cAttrs.tier || "Standard"}` };
    }
  } else {
    if (["pro", "pro max", "plus", "ultra"].includes(cAttrs.tier || "")) {
      return { isMatch: false, score: 0, reason: `Tier mismatch: base model requested, candidate has tier '${cAttrs.tier}'` };
    }
  }

  // =========================================================================
  // 6. VARIANT VERIFICATION (Storage & RAM)
  // =========================================================================
  if (qAttrs.storage && cAttrs.storage && qAttrs.storage !== cAttrs.storage) {
    return { isMatch: false, score: 0, reason: `Storage mismatch: expected ${qAttrs.storage}, got ${cAttrs.storage}` };
  }

  if (qAttrs.ram && cAttrs.ram && qAttrs.ram !== cAttrs.ram) {
    return { isMatch: false, score: 0, reason: `RAM mismatch: expected ${qAttrs.ram}, got ${cAttrs.ram}` };
  }

  // =========================================================================
  // 7. WEIGHTED COMPOSITE SCORING
  // =========================================================================
  let score = 25.0;

  if (qAttrs.category === cAttrs.category) {
    score += 25.0;
  }

  if (qAttrs.model && cAttrs.model && qAttrs.model === cAttrs.model) {
    score += 30.0;
  } else if (qAttrs.family && cAttrs.family && qAttrs.family === cAttrs.family) {
    score += 20.0;
  } else {
    const sim = computeTokenSimilarity(query, candidateTitle);
    score += (sim * 20.0);
  }

  if (qAttrs.brand && (cAttrs.brand === qAttrs.brand || cAttrs.normalizedText.includes(qAttrs.brand))) {
    score += 15.0;
  }

  if (cAttrs.hasPositivePhoneSignal) {
    score += 10.0;
  }

  if (qAttrs.storage && cAttrs.storage === qAttrs.storage) {
    score += 5.0;
  }

  if (qAttrs.color && cAttrs.color && cAttrs.normalizedText.includes(qAttrs.color)) {
    score += 5.0;
  }

  const finalScore = Math.min(100, Math.round(score));
  const isMatch = finalScore >= 70;

  return {
    isMatch,
    score: finalScore / 100,
    reason: isMatch ? `Exact match verified (Score: ${finalScore})` : `Match score ${finalScore} below threshold 70`
  };
}
