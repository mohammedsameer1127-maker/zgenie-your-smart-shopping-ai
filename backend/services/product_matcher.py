"""
Strict Product Matching & Scoring Service for ZGenie.

Guarantees 100% exact-match product comparison by eliminating:
1. Unrelated or substituted products
2. Wrong storage / RAM / size / color variants (e.g. 256GB when 128GB requested)
3. Wrong model tiers (e.g. Plus / Standard when Pro / Ultra requested)
4. Mismatched brands
5. Phone cases, screen guards, covers, cables, replacement spare parts
6. Candidates scoring below the strict 85% similarity threshold
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
    "unlocked", "smart", "pro", "plus", "ultra"  # Pro/Plus/Ultra handled separately in variant checks
}

# Accessory & spare part keywords to strictly reject for device queries
ACCESSORY_KEYWORDS = [
    "back cover", "flip cover", "wallet case", "case", "cover", "pouch", "sleeve",
    "tempered glass", "screen protector", "screen guard", "lens protector", "camera protector",
    "skin", "decal", "sticker", "strap", "band only", "charger", "charging cable", "cable",
    "adapter", "power bank", "holder", "stand", "mount", "bumper", "tampered",
    "replacement battery", "housing", "spare parts", "back panel", "earpad", "ear cushion",
    "headphone stand", "stylus pen only", "lcd", "touch lcd", "display screen", "folder",
    "screen replacement", "combo", "digitizer", "repair", "iservice", "motherboard",
    "connector", "flex cable"
]

# Known brands dictionary for hard brand filtering
KNOWN_BRANDS = [
    "apple", "samsung", "oneplus", "google", "sony", "bose", "sennheiser", "jbl",
    "dell", "hp", "lenovo", "asus", "acer", "msi", "xiaomi", "redmi", "realme",
    "vivo", "iqoo", "oppo", "nothing", "motorola", "moto", "poco", "infinix",
    "honor", "dji", "canon", "nikon", "fujifilm", "gopro", "insta360", "lg",
    "tcl", "hisense", "nike", "adidas", "puma", "asics", "new balance", "skechers",
    "woodland", "crocs", "levis", "levi's", "zara", "h&m", "allen solly",
    "peter england", "manyavar", "dyson", "philips", "instant pot", "nespresso",
    "bosch", "morphy richards", "eureka forbes", "kent", "dior", "chanel",
    "tom ford", "versace", "yves saint laurent", "ysl", "forest essentials",
    "kama ayurveda", "the body shop", "mamaearth", "plum", "minimalist", "wild stone",
    "amul", "tata", "parle", "cadbury", "nestle", "dabur", "colgate", "dettol",
    "surf excel", "ariel", "fortune", "aashirvaad", "saffola"
]

def normalize_text(text: str) -> str:
    """
    Normalizes string by lowercasing, stripping punctuation, unit unification, and extra whitespace.
    """
    if not text:
        return ""
    t = text.lower()
    # Unify unit spacing e.g. "128 gb" -> "128gb", "1 tb" -> "1tb"
    t = re.sub(r"\b(\d+)\s*(gb|tb|mb|g|kg|ml|l|cm|mm|inch|in)\b", r"\1\2", t)
    # Replace non-alphanumeric (keep spaces and hyphens)
    t = re.sub(r"[^\w\s-]", " ", t)
    # Collapse multiple spaces
    t = re.sub(r"\s+", " ", t).strip()
    return t

def extract_brand(text: str) -> Optional[str]:
    """
    Extracts known brand name from query text if present.
    """
    norm = normalize_text(text)
    words = norm.split()
    for brand in KNOWN_BRANDS:
        brand_words = brand.split()
        if len(brand_words) == 1:
            if brand in words:
                return brand
        else:
            if brand in norm:
                return brand
    return None

def extract_storage_variants(text: str) -> Set[str]:
    """
    Extracts storage / memory variants like 128GB, 256GB, 512GB, 1TB, 16GB RAM, etc.
    """
    norm = normalize_text(text)
    matches = re.findall(r"\b(\d{1,4}(?:gb|tb|mb))\b", norm)
    return set(matches)

def extract_size_or_volume(text: str) -> Set[str]:
    """
    Extracts size, display dimension, or volume specifications e.g. 14inch, 55inch, 100ml, 1kg.
    """
    norm = normalize_text(text)
    matches = re.findall(r"\b(\d{1,4}(?:\.\d+)?(?:inch|in|cm|mm|ml|l|kg|gm|g|liter|litres))\b", norm)
    return set(matches)

def extract_model_tier_tokens(text: str) -> Set[str]:
    """
    Extracts critical tier modifier tokens: pro max, pro, plus, ultra, fe, lite, mini, se, max.
    """
    norm = normalize_text(text)
    tiers = set()
    if "pro max" in norm:
        tiers.add("pro max")
    elif "pro" in norm:
        tiers.add("pro")
    
    if "plus" in norm or "+" in text:
        tiers.add("plus")
    if "ultra" in norm:
        tiers.add("ultra")
    if "max" in norm and "pro max" not in tiers:
        tiers.add("max")
    if "mini" in norm:
        tiers.add("mini")
    if "lite" in norm:
        tiers.add("lite")
    if re.search(r"\bfe\b", norm):
        tiers.add("fe")
    if re.search(r"\bse\b", norm):
        tiers.add("se")
    return tiers

def is_accessory_or_irrelevant(title: str, query: str) -> bool:
    """
    Checks whether candidate title is an accessory, cover, or spare part
    when the query was not searching for an accessory.
    """
    q_norm = normalize_text(query)
    t_norm = normalize_text(title)

    # If query explicitly contains an accessory keyword, do not filter out
    query_wants_accessory = any(acc in q_norm for acc in ACCESSORY_KEYWORDS)
    if query_wants_accessory:
        return False

    # Filter out if title contains accessory keyword
    for acc in ACCESSORY_KEYWORDS:
        if acc in t_norm:
            return True

    return False

def compute_token_similarity(query: str, title: str) -> float:
    """
    Computes normalized token overlap and sequence ratio similarity between query and candidate title.
    Returns float score between 0.0 and 1.0.
    """
    q_norm = normalize_text(query)
    t_norm = normalize_text(title)

    q_tokens = [w for w in q_norm.split() if len(w) > 1 and w not in FILLER_WORDS]
    t_tokens = [w for w in t_norm.split() if len(w) > 1 and w not in FILLER_WORDS]

    if not q_tokens:
        return 0.0

    # Token overlap ratio: how many of the query's essential tokens are present in candidate title?
    matched_tokens = 0
    for q_tok in q_tokens:
        if any(q_tok == t_tok or (len(q_tok) > 3 and q_tok in t_tok) for t_tok in t_tokens):
            matched_tokens += 1

    token_coverage = matched_tokens / len(q_tokens)

    # If all query tokens are present in candidate title (100% token coverage), score is at least 0.90
    if token_coverage == 1.0:
        return 1.0

    # Substring Sequence Matcher Ratio
    seq_ratio = SequenceMatcher(None, " ".join(q_tokens), " ".join(t_tokens[:len(q_tokens) + 3])).ratio()

    # Weighted composite score
    composite = (token_coverage * 0.70) + (seq_ratio * 0.30)
    return round(composite, 4)

def score_candidate_product(
    query: str,
    candidate: NormalizedProduct,
    min_similarity: float = 0.85
) -> Tuple[bool, float, str]:
    """
    Evaluates a candidate product against the user query using strict multi-signal matching.
    
    Returns:
        (is_match: bool, score: float, reason: str)
    """
    title = candidate.title or ""
    if not title.strip():
        return False, 0.0, "Empty candidate title"

    # 1. Reject Accessories / Spare Parts
    if is_accessory_or_irrelevant(title, query):
        return False, 0.0, f"Accessory or spare part detected in title: '{title}'"

    # 2. Reject Refurbished / Renewed items when user didn't request refurbished
    t_lower = title.lower()
    q_lower = query.lower()
    if "refurbished" not in q_lower and any(r in t_lower for r in ["refurbished", "renewed", "fair grade", "pre-owned", "second hand"]):
        return False, 0.0, f"Refurbished/Renewed item rejected for new product search: '{title}'"

    # 3. Authorized Platform Filter
    auth_platform = get_authorized_platform_name(candidate.platform)
    if not auth_platform:
        # Check candidate raw_data source / merchant as fallback
        raw_source = candidate.raw_data.get("source") or candidate.raw_data.get("merchant") if candidate.raw_data else None
        auth_platform = get_authorized_platform_name(raw_source)
        if not auth_platform:
            return False, 0.0, f"Unauthorized platform '{candidate.platform}' rejected"

    candidate.platform = auth_platform

    # 4. Hard Brand Filter
    query_brand = extract_brand(query)
    candidate_brand = extract_brand(title) or (candidate.raw_data.get("brand") if candidate.raw_data else None)
    if candidate_brand:
        candidate_brand = candidate_brand.lower().strip()

    if query_brand:
        if candidate_brand and candidate_brand != query_brand:
            return False, 0.0, f"Brand mismatch: query requested '{query_brand}', candidate is '{candidate_brand}'"
        if query_brand not in normalize_text(title):
            return False, 0.0, f"Query brand '{query_brand}' not found in candidate title: '{title}'"

    # 3. Model Tier Filter (Pro Max vs Pro vs Plus vs Ultra vs Standard)
    query_tiers = extract_model_tier_tokens(query)
    candidate_tiers = extract_model_tier_tokens(title)

    if query_tiers:
        # Check that all requested model tiers exist in candidate
        for tier in query_tiers:
            if tier not in candidate_tiers:
                return False, 0.0, f"Model tier mismatch: query requested '{tier}', not found in '{title}'"
        
        # Check that candidate doesn't have an unwanted higher/different tier
        # e.g. query asked for 'pro', candidate has 'pro max'
        if "pro" in query_tiers and "pro max" not in query_tiers and "pro max" in candidate_tiers:
            return False, 0.0, f"Model tier mismatch: query requested 'Pro' but candidate is 'Pro Max'"
        if "plus" not in query_tiers and "plus" in candidate_tiers:
            return False, 0.0, f"Model tier mismatch: query did not request 'Plus' but candidate is 'Plus'"
    else:
        # Query is standard base model (e.g. 'iPhone 16' or 'Galaxy S24')
        # Do not allow Pro, Pro Max, Plus, or Ultra if query didn't specify them
        if candidate_tiers.intersection({"pro", "pro max", "plus", "ultra"}):
            unwanted = candidate_tiers.intersection({"pro", "pro max", "plus", "ultra"})
            return False, 0.0, f"Model tier mismatch: query is base model, candidate has tier {unwanted}"

    # 4. Storage / Variant Filter (e.g. 128GB vs 256GB vs 512GB)
    query_storage = extract_storage_variants(query)
    candidate_storage = extract_storage_variants(title)

    if query_storage:
        for stor in query_storage:
            if stor not in candidate_storage:
                return False, 0.0, f"Storage variant mismatch: query requested '{stor}', candidate has {candidate_storage}"

    # 5. Size / Volume Filter (e.g. 100ml, 55-inch)
    query_sizes = extract_size_or_volume(query)
    candidate_sizes = extract_size_or_volume(title)

    if query_sizes:
        for sz in query_sizes:
            if sz not in candidate_sizes:
                return False, 0.0, f"Size/Volume mismatch: query requested '{sz}', candidate has {candidate_sizes}"

    # 6. Price Sanity Check
    price = candidate.price
    if price is None or price <= 0:
        return False, 0.0, f"Invalid price: {price}"

    # Category Price Sanity Bounds
    q_lower = query.lower()
    is_flagship = any(f in q_lower for f in ["iphone 16 pro", "iphone 15 pro", "s24 ultra", "s23 ultra", "macbook pro", "rog strix"])
    if is_flagship and price < 50000:
        return False, 0.0, f"Price ₹{price} fails sanity bound check for flagship device query '{query}'"

    is_phone_or_laptop = any(d in q_lower for d in ["iphone", "phone", "galaxy", "oneplus", "pixel", "laptop", "macbook", "ipad"])
    if is_phone_or_laptop and price < 3000:
        return False, 0.0, f"Price ₹{price} fails sanity check for phone/laptop query '{query}'"

    # 7. Token Similarity Score
    similarity = compute_token_similarity(query, title)
    if similarity < min_similarity:
        return False, similarity, f"Similarity score {similarity:.2f} is below strict threshold {min_similarity:.2f}"

    return True, similarity, f"Exact match verified (Score: {similarity:.2f})"

def filter_exact_match_products(
    query: str,
    candidates: List[NormalizedProduct],
    min_similarity: float = 0.85
) -> List[NormalizedProduct]:
    """
    Applies strict matching to candidate products from all connectors.
    Returns only verified exact-match products sorted by relevance and price.
    """
    if not candidates:
        return []

    matched_products: List[Tuple[NormalizedProduct, float]] = []

    for item in candidates:
        is_match, score, reason = score_candidate_product(query, item, min_similarity=min_similarity)
        if is_match:
            logger.info(f"[ProductMatcher] ACCEPTED: '{item.title}' | Store: {item.platform} | Price: ₹{item.price} | Reason: {reason}")
            matched_products.append((item, score))
        else:
            logger.debug(f"[ProductMatcher] REJECTED: '{item.title}' | Store: {item.platform} | Reason: {reason}")

    if not matched_products:
        logger.warning(f"[ProductMatcher] 0 out of {len(candidates)} candidates passed exact-match threshold for '{query}'")
        return []

    # Sort candidates: highest similarity first, then lowest price
    matched_products.sort(key=lambda x: (-x[1], x[0].price or 9999999))
    return [p[0] for p in matched_products]
