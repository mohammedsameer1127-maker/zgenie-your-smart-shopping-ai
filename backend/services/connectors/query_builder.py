from backend.models.product import IntentPayload
import re

CONVERSATIONAL_PREFIXES = [
    r"can\s+you\s+(?:please\s+)?(?:find|show|get|search|compare)\s+(?:me\s+)?(?:the\s+)?(?:cheapest\s+|best\s+price\s+for\s+|deals\s+on\s+)?",
    r"find\s+(?:me\s+)?(?:the\s+)?(?:cheapest\s+|best\s+price\s+for\s+|deals\s+on\s+)?",
    r"show\s+(?:me\s+)?(?:the\s+)?(?:cheapest\s+|best\s+price\s+for\s+|deals\s+on\s+)?",
    r"where\s+can\s+i\s+(?:buy|find|get)\s+(?:the\s+)?",
    r"what\s+is\s+the\s+price\s+of\s+(?:the\s+)?",
    r"best\s+price\s+(?:for|of|on)\s+",
    r"cheapest\s+(?:price\s+for\s+)?",
    r"compare\s+(?:prices\s+for\s+|prices\s+of\s+)?",
    r"buy\s+(?:online\s+)?",
    r"price\s+of\s+",
    r"deals\s+on\s+"
]

IMPLICIT_BRAND_PATTERNS = [
    (r"\biphone\b", "Apple"),
    (r"\bmacbook\b", "Apple"),
    (r"\bairpods\b", "Apple"),
    (r"\bipad\b", "Apple"),
    (r"\bgalaxy\s+s\d+\b", "Samsung"),
    (r"\bgalaxy\s+z\b", "Samsung"),
    (r"\bwh[- ]?1000xm[345]\b", "Sony"),
    (r"\bwf[- ]?1000xm[345]\b", "Sony"),
    (r"\bpixel\s+\d+\b", "Google"),
    (r"\bthinkpad\b", "Lenovo"),
    (r"\brog\s+strix\b", "Asus"),
]

def clean_conversational_query(raw_query: str) -> str:
    """
    Cleans conversational natural language phrasing to a focused product search query.
    e.g. 'Can you find me the cheapest iPhone 15 128GB in black?' -> 'Apple iPhone 15 128GB Black'
    """
    if not raw_query:
        return ""
    q = raw_query.strip()

    # Strip conversational lead-ins
    for pattern in CONVERSATIONAL_PREFIXES:
        q = re.sub(f"^{pattern}", "", q, flags=re.IGNORECASE).strip()

    # Clean punctuation and trailing fluff
    q = re.sub(r"^(?:in|for|at|with)\s+", "", q, flags=re.IGNORECASE)
    q = re.sub(r"[?!.,]+$", "", q).strip()

    # Add implicit brand if clearly recognizable and missing
    q_lower = q.lower()
    for pattern, brand in IMPLICIT_BRAND_PATTERNS:
        if re.search(pattern, q_lower) and brand.lower() not in q_lower:
            q = f"{brand} {q}"
            break

    return q

def build_search_query(intent: IntentPayload) -> str:
    """
    Builds an optimized search query string from the intent payload's
    query, keywords, category, and brand fields without duplicating tokens.
    Shared by all shopping connectors (SerpApi, Serper, etc.).
    """
    cleaned_query = clean_conversational_query(intent.query)
    tokens = []
    seen = set()

    def add_token(t: str):
        if not t:
            return
        t_clean = t.strip()
        t_lower = t_clean.lower()
        if t_lower and t_lower not in seen:
            seen.add(t_lower)
            tokens.append(t_clean)

    # 1. Start with brand if specified and not already part of main query
    if intent.brand:
        brand_clean = intent.brand.strip()
        if brand_clean.lower() not in cleaned_query.lower():
            add_token(brand_clean)

    # 2. Main query
    if cleaned_query:
        for word in cleaned_query.split():
            add_token(word)

    # 3. Add keywords if any
    if intent.keywords:
        for kw in intent.keywords:
            if isinstance(kw, str) and kw.strip():
                for word in kw.strip().split():
                    add_token(word)

    # 4. Add category context if not overlapping
    if intent.category:
        cat_clean = intent.category.strip()
        if cat_clean.lower() not in " ".join(tokens).lower():
            if len(tokens) <= 2:
                add_token(cat_clean)

    result_query = " ".join(tokens)
    return result_query.strip() or cleaned_query or intent.query.strip()
