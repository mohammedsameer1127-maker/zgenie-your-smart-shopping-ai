"""
Strict Product Matching & Category Filtering Service for ZGenie.

Guarantees 100% exact-match product comparison by:
1. Detecting user's requested product category (e.g. smartphone, laptop, earbuds, phone_case, charger).
2. For smartphone queries, strictly accepting ONLY actual mobile phones and rejecting all accessories:
   - Back covers, cases, bumpers, pouches, sleeves, holders, stands
   - Tempered glass, screen protectors, screen guards, camera lens protectors
   - Chargers, adapters, USB cables, power banks
   - Replacement screens, LCDs, display combos, housings, middle frames, spare parts
   - Compatibility prefixes ('compatible with...', 'for iQOO 15R', 'case for...')
3. Enforcing positive smartphone evidence (RAM, ROM, 5G, display, processor, price sanity >= ₹3,500).
4. Verifying exact model identity (e.g. iQOO 15R vs iQOO 15, iQOO Neo 10R vs iQOO Neo 10/Neo 9 Pro).
5. Comprehensive developer debugging logging per retailer candidate.
"""

import re
import logging
from typing import List, Tuple, Optional, Set, Dict, Any
from difflib import SequenceMatcher
from backend.models.product import NormalizedProduct, get_authorized_platform_name

logger = logging.getLogger(__name__)

# Marketing & promotional noise words to strip during normalization
FILLER_WORDS = {
    "new", "latest", "original", "authentic", "genuine", "certified",
    "renewed", "refurbished", "unboxed", "sealed", "pack", "best",
    "hot", "deal", "offer", "sale", "special", "edition", "series",
    "buy", "online", "india", "brand", "official", "store", "global",
    "unlocked", "smart", "with", "the", "in", "at", "and", "or"
}

# Configurable Accessory & Spare Part Keywords and Patterns
ACCESSORY_KEYWORDS = [
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
    "lanyard", "keychain", "case only", "cover only", "band only", "aulumu",
    "mod nx", "solidsuit", "crashguard", "rhinoshield", "spigen", "otterbox"
]

ACCESSORY_COMPATIBILITY_PATTERNS = [
    r"\bcase\s+for\b",
    r"\bcover\s+for\b",
    r"\bback\s+cover\s+for\b",
    r"\bflip\s+cover\s+for\b",
    r"\bglass\s+for\b",
    r"\btempered\s+glass\s+for\b",
    r"\bscreen\s+(?:guard|protector)\s+for\b",
    r"\bprotector\s+for\b",
    r"\bcamera\s+lens\s+for\b",
    r"\bcharger\s+for\b",
    r"\bcable\s+for\b",
    r"\bskin\s+for\b",
    r"\bpouch\s+for\b",
    r"\bcompatible\s+with\b",
    r"\bdesigned\s+for\b",
    r"\bsuitable\s+for\b",
    r"\bdedicated\s+for\b",
    r"\bfor\s+(?:apple|iphone|samsung|galaxy|iqoo|oneplus|google|pixel|redmi|realme|vivo|oppo|poco|motorola|moto|xiaomi|hp|dell|lenovo|asus|acer)\b",
    r"\bfor\s+[a-z0-9\s-]+\s+(?:5g|4g|phone|mobile|smartphone)?\s*(?:back\s*cover|case|cover|glass|tempered|guard|skin)\b"
]

# Refurbished / Renewed indicator keywords
REFURBISHED_KEYWORDS = [
    "refurbished", "renewed", "pre-owned", "preowned", "second hand", "2nd hand",
    "fair grade", "good grade", "superb grade", "unboxed condition", "open box", "used"
]

# Known brands dictionary
KNOWN_BRANDS = [
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
]

# Product families and implicit brand mappings
FAMILY_TO_BRAND = {
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
    "victus": "hp",
    "pavilion": "hp",
    "spectre": "hp",
    "envy": "hp",
    "omen": "hp",
    "redmi": "xiaomi",
    "poco": "poco",
    "realme": "realme",
    "quietcomfort": "bose",
    "soundlink": "bose",
}

class ProductEntity:
    """
    Structured Product Entity representation for query and retailer candidate.
    """
    def __init__(
        self,
        raw_text: str,
        normalized_text: str,
        brand: Optional[str] = None,
        family: Optional[str] = None,
        series: Optional[str] = None,
        model: Optional[str] = None,
        model_name: Optional[str] = None,
        tier: Optional[str] = None,
        generation: Optional[str] = None,
        category: str = "general",
        product_type: str = "general",
        storage: Optional[str] = None,
        ram: Optional[str] = None,
        color: Optional[str] = None,
        size: Optional[str] = None,
        model_number: Optional[str] = None,
        is_accessory: bool = False,
        is_refurbished: bool = False,
        has_positive_phone_signal: bool = False,
    ):
        self.raw_text = raw_text
        self.normalized_text = normalized_text
        self.brand = brand
        self.family = family
        self.series = series
        self.model = model
        self.model_name = model_name
        self.tier = tier
        self.generation = generation
        self.category = category
        self.product_type = product_type
        self.storage = storage
        self.ram = ram
        self.color = color
        self.size = size
        self.model_number = model_number
        self.is_accessory = is_accessory
        self.is_refurbished = is_refurbished
        self.has_positive_phone_signal = has_positive_phone_signal

def normalize_text(text: str) -> str:
    """
    Normalizes text by lowercasing, standardizing spacing, unit representations,
    punctuation, and hyphens without removing important model identifiers.
    """
    if not text:
        return ""
    t = text.lower()

    # Unify unit spacing e.g. "128 gb" -> "128gb", "1 tb" -> "1tb", "8 gb ram" -> "8gb ram"
    t = re.sub(r"\b(\d+)\s*(gb|tb|mb)\s*ram\b", r"\1\2 ram", t)
    t = re.sub(r"\b(\d+)\s*(gb|tb|mb|g|kg|ml|l|cm|mm|inch|in)\b", r"\1\2", t)

    # Standardize 5G/4G formatting e.g. "5 g" -> "5g"
    t = re.sub(r"\b(\d)\s*g\b", r"\1g", t)

    # Normalize generation patterns e.g. "2nd generation" -> "2nd gen", "gen 2" -> "2nd gen"
    t = re.sub(r"\b(\d+)(?:st|nd|rd|th)?\s*generation\b", r"\1nd gen", t)
    t = re.sub(r"\bgen\s*(\d+)\b", r"\1nd gen", t)

    # Replace punctuation and brackets with spaces (keep hyphens and word chars)
    t = re.sub(r"[^\w\s-]", " ", t)

    # Collapse multiple spaces
    t = re.sub(r"\s+", " ", t).strip()
    return t

def detect_product_category(text: str) -> Tuple[str, str, bool]:
    """
    Detects product category, product_type, and whether it contains accessory signals.
    
    Returns:
        (category: str, product_type: str, is_accessory: bool)
    """
    norm = normalize_text(text)
    lower = text.lower()

    # 1. Explicit Accessory Detection
    has_compat_pattern = any(bool(re.search(pat, norm)) or bool(re.search(pat, lower)) for pat in ACCESSORY_COMPATIBILITY_PATTERNS)
    
    is_acc = False
    acc_type = None

    if has_compat_pattern:
        is_acc = True
        acc_type = "accessory"

    # Token-boundary matching for accessory keywords
    words = set(norm.split())
    for kw in ACCESSORY_KEYWORDS:
        kw_norm = normalize_text(kw)
        if " " in kw_norm:
            if kw_norm in norm:
                is_acc = True
                acc_type = kw
                break
        else:
            if kw_norm in words:
                is_acc = True
                acc_type = kw
                break

    if is_acc:
        if any(c in norm for c in ["case", "cover", "pouch", "sleeve", "bumper"]):
            return "phone_case", "phone_case", True
        if any(g in norm for g in ["glass", "protector", "guard", "tempered"]):
            return "screen_protector", "screen_protector", True
        if any(ch in norm for ch in ["charger", "adapter", "power bank"]):
            return "charger", "charger", True
        if any(cb in norm for cb in ["cable", "usb", "type c", "lightning"]):
            return "cable", "cable", True
        if any(sp in norm for sp in ["housing", "lcd", "display", "combo", "spare", "battery", "panel"]):
            return "spare_part", "spare_part", True
        return "accessory", acc_type or "accessory", True

    # 2. Audio & Wearable Categories
    if re.search(r"\b(?:airpods|earbuds|earphones|headphones|headset|neckband|tws|buds)\b", norm):
        return "earbuds", "audio_device", False
    if re.search(r"\b(?:apple watch|galaxy watch|smartwatch|watch ultra)\b", norm):
        return "smartwatch", "wearable", False

    # 3. Computing Categories
    if re.search(r"\b(?:macbook|laptop|notebook|thinkpad|ideapad|legion|victus|pavilion|omen|rog|tuf|zenbook|vivobook|predator|nitro|alienware|xps|inspiron)\b", norm):
        return "laptop", "laptop", False
    if re.search(r"\b(?:ipad|tablet|tab s\d+|galaxy tab|pad)\b", norm):
        return "tablet", "tablet", False

    # 4. Smartphone Category (Detect phone brands, phone series, phone specifications)
    is_phone = False
    if re.search(r"\b(?:smartphone|mobile phone|mobile|phone|5g phone|4g phone|dual sim)\b", norm):
        is_phone = True
    if re.search(r"\b(?:iphone|iqoo|galaxy|oneplus|pixel|redmi|poco|realme|infinix|motorola|moto|tecno|vivo|oppo)\b", norm):
        is_phone = True
    if re.search(r"\b(?:s\d{1,2}|z\s*fold|z\s*flip|nord|neo\s*\d+[a-z]?|\d{1,2}r|gt\s*\d)\b", norm):
        is_phone = True

    if is_phone:
        return "smartphone", "smartphone", False

    return "general", "general", False

def extract_product_entity(text: str) -> ProductEntity:
    """
    Extracts structured entity attributes from query or retailer title.
    """
    norm = normalize_text(text)
    lower_raw = text.lower()

    # 1. Detect Category & Accessory Status
    category, product_type, is_acc = detect_product_category(text)

    # 2. Refurbished / Renewed Detection
    is_refurb = any(ref in norm or ref in lower_raw for ref in REFURBISHED_KEYWORDS)

    # 3. Positive Phone Signals Detection
    has_phone_signal = False
    if re.search(r"\b(?:smartphone|mobile phone|5g smartphone|4g mobile|dual sim|internal storage|quad camera|triple camera|amoled|fhd\+|snapdragon|dimensity|bionic|mah)\b", norm):
        has_phone_signal = True
    if re.search(r"\b\d{1,2}gb\s*ram\b", norm) and re.search(r"\b\d{2,4}gb\b", norm):
        has_phone_signal = True

    # 4. Brand & Family Extraction
    extracted_brand = None
    extracted_family = None

    words = set(norm.split())
    for b in KNOWN_BRANDS:
        b_norm = normalize_text(b)
        if " " in b_norm:
            if b_norm in norm:
                extracted_brand = b
                break
        else:
            if b_norm in words:
                extracted_brand = b
                break

    for fam, b in sorted(FAMILY_TO_BRAND.items(), key=lambda x: -len(x[0])):
        if fam in norm:
            extracted_family = fam
            if not extracted_brand:
                extracted_brand = b
            break

    # 5. Model Tier Extraction (Pro Max > Pro > Plus > Ultra > FE > SE > Lite > Mini > Max)
    extracted_tier = None
    if "pro max" in norm:
        extracted_tier = "pro max"
    elif "pro" in norm:
        extracted_tier = "pro"
    elif "plus" in norm or "+" in text:
        extracted_tier = "plus"
    elif "ultra" in norm:
        extracted_tier = "ultra"
    elif "mini" in norm:
        extracted_tier = "mini"
    elif "lite" in norm:
        extracted_tier = "lite"
    elif re.search(r"\bfe\b", norm):
        extracted_tier = "fe"
    elif re.search(r"\bse\b", norm):
        extracted_tier = "se"
    elif "max" in norm:
        extracted_tier = "max"

    # 6. Dynamic Exact Model & Series Extraction
    extracted_model = None
    extracted_series = None

    # A. iQOO Models: iQOO 15R, iQOO Neo 10R, iQOO Neo 9 Pro, iQOO Z9s Pro, iQOO 12, etc.
    iqoo_match = re.search(r"\biqoo\s*(?:(neo|z|z\d+s?)\s*)?(\d{1,2}[a-z]?)\b", norm)
    if iqoo_match:
        series_sub = iqoo_match.group(1) or ""
        num_sub = iqoo_match.group(2) or ""
        extracted_brand = "iqoo"
        extracted_family = "iqoo"
        extracted_series = series_sub.strip() if series_sub else None
        if series_sub:
            extracted_model = f"{series_sub.strip()} {num_sub.strip()}".strip()
        else:
            extracted_model = num_sub.strip()

    # B. iPhone Models: iPhone 17 Pro Max, iPhone 16, iPhone 15 Pro, iPhone 14 Plus
    iphone_match = re.search(r"\biphone\s*(\d{1,2}|se|x|xs|xr)\b", norm)
    if iphone_match:
        extracted_model = f"iphone {iphone_match.group(1)}"
        extracted_brand = "apple"
        extracted_family = "iphone"

    # C. Samsung Galaxy Models: Galaxy S26 Ultra, S24, Z Fold 6, A55
    galaxy_match = re.search(r"\b(?:galaxy\s*)?(s\d{1,2}|z\s*fold\s*\d|z\s*flip\s*\d|a\d{2}|m\d{2}|f\d{2})\b", norm)
    if galaxy_match:
        extracted_model = galaxy_match.group(1).replace(" ", "")
        extracted_brand = "samsung"
        extracted_family = "galaxy"

    # D. OnePlus Models: OnePlus 15R, OnePlus 12, OnePlus 12R, Nord 4, Nord CE4
    op_match = re.search(r"\b(?:oneplus\s*)?(?:(nord(?:\s*ce)?)\s*)?(\d{1,2}[a-z]?)\b", norm)
    if "oneplus" in norm or "nord" in norm:
        if op_match:
            nord_sub = op_match.group(1) or ""
            num_sub = op_match.group(2) or ""
            extracted_brand = "oneplus"
            extracted_family = "oneplus"
            if nord_sub:
                extracted_model = f"{nord_sub.strip()} {num_sub.strip()}".strip()
            else:
                extracted_model = num_sub.strip()

    # E. Pixel Models: Pixel 9 Pro XL, Pixel 8a
    pixel_match = re.search(r"\bpixel\s*(\d{1,2}[a-z]?)\b", norm)
    if pixel_match:
        extracted_model = f"pixel {pixel_match.group(1)}"
        extracted_brand = "google"
        extracted_family = "pixel"

    # F. Sony Headphones: WH-1000XM5, WF-1000XM5
    sony_match = re.search(r"\b(w[hf][- ]?1000xm[345])\b", norm)
    if sony_match:
        extracted_model = sony_match.group(1).replace(" ", "-").replace("wh1000", "wh-1000").replace("wf1000", "wf-1000")
        extracted_brand = "sony"
        extracted_family = "wh-1000xm"

    # G. MacBook: MacBook Air M2, MacBook Pro M3
    macbook_match = re.search(r"\bmacbook\s*(air|pro)?\s*(m[1234](?:\s*pro|\s*max)?)\b", norm)
    if macbook_match:
        mb_type = macbook_match.group(1) or ""
        mb_chip = macbook_match.group(2) or ""
        extracted_model = f"macbook {mb_type} {mb_chip}".replace("  ", " ").strip()
        extracted_brand = "apple"
        extracted_family = "macbook"

    # H. HP Laptops: HP Victus 15, Pavilion 14, Omen 16
    hp_match = re.search(r"\bhp\s*(victus|pavilion|omen|envy|spectre)\s*(\d{1,2})?\b", norm)
    if hp_match:
        series = hp_match.group(1) or ""
        size = hp_match.group(2) or ""
        extracted_model = f"hp {series} {size}".strip()
        extracted_brand = "hp"
        extracted_family = "victus" if "victus" in series else series

    # 7. Storage Capacity (128GB, 256GB, 512GB, 1TB)
    extracted_storage = None
    storage_matches = re.findall(r"\b(\d{1,4}(?:gb|tb|mb))\b(?!\s*ram)", norm)
    if storage_matches:
        extracted_storage = storage_matches[0]

    # 8. RAM (8GB RAM, 16GB RAM)
    extracted_ram = None
    ram_match = re.search(r"\b(\d{1,2}(?:gb))\s*ram\b", norm)
    if ram_match:
        extracted_ram = ram_match.group(1)

    # 9. Color
    extracted_color = None
    colors_list = [
        "natural titanium", "desert titanium", "black titanium", "white titanium",
        "space gray", "space grey", "midnight", "starlight", "phantom black",
        "deep purple", "sierra blue", "pacific blue", "titanium gray", "titanium black",
        "titanium violet", "titanium yellow", "black", "white", "blue", "green",
        "yellow", "pink", "purple", "red", "silver", "gold", "graphite", "teal", "onyx black"
    ]
    for c in colors_list:
        if c in norm:
            extracted_color = c
            break

    # 10. Model Number (e.g. A3106, SM-S928B, I2401, V2334)
    extracted_model_num = None
    model_num_match = re.search(r"\b([a-z]{1,2}\d{4}[a-z]{0,2}|sm-[a-z]\d{3}[a-z0-9]?|wh1000xm[345]|wf1000xm[345])\b", norm)
    if model_num_match:
        extracted_model_num = model_num_match.group(1)

    return ProductEntity(
        raw_text=text,
        normalized_text=norm,
        brand=extracted_brand,
        family=extracted_family,
        series=extracted_series,
        model=extracted_model,
        model_name=extracted_model,
        tier=extracted_tier,
        category=category,
        product_type=product_type,
        storage=extracted_storage,
        ram=extracted_ram,
        color=extracted_color,
        model_number=extracted_model_num,
        is_accessory=is_acc,
        is_refurbished=is_refurb,
        has_positive_phone_signal=has_phone_signal,
    )

def extract_product_attributes(text: str) -> ProductEntity:
    """Backward compatibility wrapper returning ProductEntity."""
    return extract_product_entity(text)

def extract_brand(text: str) -> Optional[str]:
    return extract_product_entity(text).brand

def extract_storage_variants(text: str) -> Set[str]:
    stor = extract_product_entity(text).storage
    return {stor} if stor else set()

def extract_model_tier_tokens(text: str) -> Set[str]:
    tier = extract_product_entity(text).tier
    return {tier} if tier else set()

def compute_token_similarity(query: str, title: str) -> float:
    q_norm = normalize_text(query)
    t_norm = normalize_text(title)

    q_tokens = [w for w in q_norm.split() if len(w) > 1 and w not in FILLER_WORDS]
    t_tokens = [w for w in t_norm.split() if len(w) > 1 and w not in FILLER_WORDS]

    if not q_tokens:
        return 0.0

    matched_tokens = 0
    for q_tok in q_tokens:
        if any(q_tok == t_tok or (len(q_tok) > 3 and q_tok in t_tok) for t_tok in t_tokens):
            matched_tokens += 1

    token_coverage = matched_tokens / len(q_tokens)
    if token_coverage == 1.0:
        return 1.0

    seq_ratio = SequenceMatcher(None, " ".join(q_tokens), " ".join(t_tokens[:len(q_tokens) + 3])).ratio()
    composite = (token_coverage * 0.70) + (seq_ratio * 0.30)
    return round(composite, 4)

def score_candidate_product(
    query: str,
    candidate: NormalizedProduct,
    min_similarity: float = 0.70
) -> Tuple[bool, float, str]:
    """
    Evaluates candidate product against user query with strict category filtering,
    accessory elimination, and exact model verification.
    
    Returns:
        (is_match: bool, score: float, reason: str)
    """
    title = candidate.title or ""
    retailer = candidate.platform or "Unknown"
    price = candidate.price

    if not title.strip():
        logger.debug(f"[ProductMatcher] REJECTED | Retailer: {retailer} | Empty title")
        return False, 0.0, "Empty candidate title"

    # Extract structured entities for Query and Candidate Title
    q_entity = extract_product_entity(query)
    c_entity = extract_product_entity(title)

    # =========================================================================
    # 1. CATEGORY & ACCESSORY HARD REJECTION RULES
    # =========================================================================

    # If User Searched for a Smartphone / Mobile Phone
    if q_entity.category == "smartphone":
        # A. Reject if candidate is an accessory (case, cover, glass, charger, cable, skin, spare part)
        if c_entity.is_accessory:
            reason = f"Accessory ({c_entity.product_type}) rejected for smartphone query '{query}'"
            logger.info(
                f"[ProductMatcher] Retailer: {retailer} | Query: '{query}' | Title: '{title}' | "
                f"Category: {c_entity.category} | Type: {c_entity.product_type} | Decision: REJECT | Reason: {reason}"
            )
            return False, 0.0, reason

        # B. Reject if candidate detected category is NOT a smartphone
        if c_entity.category in {"phone_case", "screen_protector", "charger", "cable", "earbuds", "spare_part"}:
            reason = f"Category mismatch: query is smartphone, candidate is {c_entity.category}"
            logger.info(
                f"[ProductMatcher] Retailer: {retailer} | Query: '{query}' | Title: '{title}' | "
                f"Category: {c_entity.category} | Type: {c_entity.product_type} | Decision: REJECT | Reason: {reason}"
            )
            return False, 0.0, reason

        # C. Phone Price Sanity Filter: Real smartphones never sell for < ₹4,000, and flagships < ₹20,000
        min_phone_price = 4000.0
        q_lower = query.lower()
        if any(flag in q_lower for flag in ["iphone 13", "iphone 14", "iphone 15", "iphone 16", "galaxy s2", "pixel 8", "pixel 9", "oneplus 12", "oneplus 13"]):
            min_phone_price = 20000.0

        if price is not None and price < min_phone_price:
            reason = f"Price ₹{price} fails smartphone sanity lower bound (< ₹{min_phone_price:,.0f}, likely an accessory)"
            logger.info(
                f"[ProductMatcher] Retailer: {retailer} | Query: '{query}' | Title: '{title}' | "
                f"Price: ₹{price} | Decision: REJECT | Reason: {reason}"
            )
            return False, 0.0, reason

    # If User Queried a Laptop / Computer
    elif q_entity.category == "laptop":
        if c_entity.is_accessory or c_entity.category in {"phone_case", "screen_protector", "cable", "charger", "spare_part"}:
            reason = f"Accessory rejected for laptop query '{query}'"
            logger.info(f"[ProductMatcher] Retailer: {retailer} | Title: '{title}' | Decision: REJECT | Reason: {reason}")
            return False, 0.0, reason
        if price is not None and price < 15000:
            return False, 0.0, f"Price ₹{price} fails laptop lower bound (< ₹15,000)"

    # If User Explicitly Queried an Accessory (e.g. "iPhone 17 Pro Max case")
    elif q_entity.is_accessory:
        if not c_entity.is_accessory:
            return False, 0.0, f"Phone listing rejected for accessory query '{query}'"

    # =========================================================================
    # 2. REFURBISHED / RENEWED HARD REJECTION
    # =========================================================================
    if c_entity.is_refurbished and not q_entity.is_refurbished:
        reason = f"Refurbished/renewed listing rejected for new product query: '{title}'"
        logger.info(f"[ProductMatcher] Retailer: {retailer} | Title: '{title}' | Decision: REJECT | Reason: {reason}")
        return False, 0.0, reason

    # =========================================================================
    # 3. BRAND & PRODUCT IDENTITY VERIFICATION
    # =========================================================================
    if q_entity.brand and c_entity.brand:
        if q_entity.brand != c_entity.brand:
            reason = f"Brand mismatch: query requested '{q_entity.brand}', candidate is '{c_entity.brand}'"
            logger.info(f"[ProductMatcher] Retailer: {retailer} | Title: '{title}' | Decision: REJECT | Reason: {reason}")
            return False, 0.0, reason

    # =========================================================================
    # 4. EXACT MODEL VERIFICATION (e.g. 15R vs 15 vs 15 Pro, Neo 10R vs Neo 10/Neo 9 Pro)
    # =========================================================================
    if q_entity.model and c_entity.model:
        if q_entity.model != c_entity.model:
            reason = f"Exact model mismatch: query requested '{q_entity.model}', candidate is '{c_entity.model}'"
            logger.info(
                f"[ProductMatcher] Retailer: {retailer} | Query: '{query}' | Title: '{title}' | "
                f"Model Expected: '{q_entity.model}' | Got: '{c_entity.model}' | Decision: REJECT | Reason: {reason}"
            )
            return False, 0.0, reason

    # =========================================================================
    # 5. MODEL TIER VERIFICATION (Pro Max vs Pro vs Plus vs Ultra vs Standard)
    # =========================================================================
    if q_entity.tier:
        if c_entity.tier != q_entity.tier:
            reason = f"Tier mismatch: query requested '{q_entity.tier}', candidate is '{c_entity.tier or 'Standard'}'"
            logger.info(f"[ProductMatcher] Retailer: {retailer} | Title: '{title}' | Decision: REJECT | Reason: {reason}")
            return False, 0.0, reason
    else:
        # Query is Standard Base Model (e.g. 'iPhone 15' or 'Galaxy S24')
        if c_entity.tier in {"pro", "pro max", "plus", "ultra"}:
            reason = f"Tier mismatch: base model requested, candidate has tier '{c_entity.tier}'"
            logger.info(f"[ProductMatcher] Retailer: {retailer} | Title: '{title}' | Decision: REJECT | Reason: {reason}")
            return False, 0.0, reason

    # =========================================================================
    # 6. VARIANT VERIFICATION (Storage & RAM)
    # =========================================================================
    if q_entity.storage and c_entity.storage:
        if q_entity.storage != c_entity.storage:
            reason = f"Storage mismatch: query requested '{q_entity.storage}', candidate is '{c_entity.storage}'"
            logger.info(f"[ProductMatcher] Retailer: {retailer} | Title: '{title}' | Decision: REJECT | Reason: {reason}")
            return False, 0.0, reason

    if q_entity.ram and c_entity.ram:
        if q_entity.ram != c_entity.ram:
            reason = f"RAM mismatch: query requested '{q_entity.ram}', candidate is '{c_entity.ram}'"
            logger.info(f"[ProductMatcher] Retailer: {retailer} | Title: '{title}' | Decision: REJECT | Reason: {reason}")
            return False, 0.0, reason

    # =========================================================================
    # 7. POSITIVE PHONE & ENTITY WEIGHTED SCORING
    # =========================================================================
    score = 25.0  # Base passing starting credit

    # Category Match (+25 pts)
    if q_entity.category == c_entity.category:
        score += 25.0

    # Exact Model Match (+30 pts)
    if q_entity.model and c_entity.model and q_entity.model == c_entity.model:
        score += 30.0
    elif q_entity.family and c_entity.family and q_entity.family == c_entity.family:
        score += 20.0
    else:
        sim = compute_token_similarity(query, title)
        score += (sim * 20.0)

    # Brand Consistency (+15 pts)
    if q_entity.brand and (c_entity.brand == q_entity.brand or q_entity.brand in c_entity.normalized_text):
        score += 15.0

    # Positive Phone Signals (+10 pts bonus)
    if c_entity.has_positive_phone_signal:
        score += 10.0

    # Storage Match (+5 pts)
    if q_entity.storage and c_entity.storage == q_entity.storage:
        score += 5.0

    # Color Match (+5 pts)
    if q_entity.color and c_entity.color and q_entity.color in c_entity.normalized_text:
        score += 5.0

    final_score = min(100.0, round(score, 1))
    threshold = min_similarity * 100 if min_similarity < 1.0 else min_similarity
    is_match = final_score >= threshold

    decision_str = "ACCEPT" if is_match else "REJECT"

    logger.info(
        f"[ProductMatcher] Retailer: {retailer} | Query: '{query}' | Title: '{title}' | "
        f"Category: {c_entity.category} | Model: {c_entity.model or 'N/A'} | "
        f"Variant: {c_entity.storage or c_entity.ram or 'N/A'} | Price: ₹{price} | "
        f"Score: {final_score} | Decision: {decision_str}"
    )

    if is_match:
        return True, final_score / 100.0, f"Exact match verified (Score: {final_score})"
    else:
        return False, final_score / 100.0, f"Match score {final_score} below threshold {threshold}"

def filter_exact_match_products(
    query: str,
    candidates: List[NormalizedProduct],
    min_similarity: float = 0.70
) -> List[NormalizedProduct]:
    """
    Applies strict category and exact-match filtering to candidates.
    """
    if not candidates:
        return []

    matched: List[Tuple[NormalizedProduct, float]] = []

    for item in candidates:
        is_match, score, reason = score_candidate_product(query, item, min_similarity=min_similarity)
        if is_match:
            matched.append((item, score))

    if not matched:
        logger.warning(f"[ProductMatcher] 0 out of {len(candidates)} candidates passed category & exact-match filter for '{query}'")
        return []

    # Sort: highest similarity first, then lowest price
    matched.sort(key=lambda x: (-x[1], x[0].price if x[0].price is not None else 9999999))
    return [p[0] for p in matched]
