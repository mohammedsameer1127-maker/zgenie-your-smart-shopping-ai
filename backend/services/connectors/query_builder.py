from backend.models.product import IntentPayload
import re

def build_search_query(intent: IntentPayload) -> str:
    """
    Builds an optimized search query string from the intent payload's
    query, keywords, category, and brand fields without duplicating tokens.
    Shared by all shopping connectors (SerpApi, Serper, etc.).
    """
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
        if brand_clean.lower() not in intent.query.lower():
            add_token(brand_clean)

    # 2. Main query
    if intent.query:
        # Split into words or keep phrase intact
        for word in intent.query.strip().split():
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
            # Only add category if query is very short (1-2 tokens)
            if len(tokens) <= 2:
                add_token(cat_clean)

    result_query = " ".join(tokens)
    return result_query.strip() or intent.query.strip()
