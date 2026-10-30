import logging
import httpx
import re
import os
import urllib.parse
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
from backend.core.config import settings
from backend.models.product import parse_price_to_float
from backend.retailers.base import RetailerProductResult

logger = logging.getLogger(__name__)

SERPAPI_SEARCH_URL = "https://serpapi.com/search.json"
SERPER_SHOPPING_URL = "https://google.serper.dev/shopping"

# Configurable pagination limits
MAX_PAGES_PER_RETAILER = int(os.getenv("MAX_PAGES_PER_RETAILER", "3"))
MAX_RESULTS_PER_RETAILER = int(os.getenv("MAX_RESULTS_PER_RETAILER", "30"))

DESKTOP_USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
]

def get_direct_store_url(store_name: str, domain: str, query: str) -> str:
    encoded = urllib.parse.quote_plus(query)
    s_lower = store_name.lower()
    if "amazon" in s_lower:
        return f"https://www.amazon.in/s?k={encoded}"
    elif "flipkart" in s_lower:
        return f"https://www.flipkart.com/search?q={encoded}"
    elif "croma" in s_lower:
        return f"https://www.croma.com/searchB?q={encoded}%3Arelevance"
    elif "reliance" in s_lower:
        return f"https://www.reliancedigital.in/search?q={encoded}:relevance"
    elif "blinkit" in s_lower:
        return f"https://blinkit.com/s/?q={encoded}"
    elif "zepto" in s_lower:
        return f"https://www.zeptonow.com/search?query={encoded}"
    elif "jiomart" in s_lower:
        return f"https://www.jiomart.com/search/{encoded}"
    elif "vijay" in s_lower:
        return f"https://www.vijaysales.com/search/{encoded}"
    elif "myntra" in s_lower:
        return f"https://www.myntra.com/{encoded}"
    elif "meesho" in s_lower:
        return f"https://www.meesho.com/search?q={encoded}"
    elif "tata" in s_lower:
        return f"https://www.tatacliq.com/search/?searchCategory=all&text={encoded}"
    return f"https://www.{domain}/search?q={encoded}"

def build_scoped_retailer_query(query: str, domain: str, retailer_name: str = "") -> str:
    """
    Builds clean targeted search query for Google Shopping (NO site: operator).
    Google Shopping rejects 'site:' syntax and returns 0 items if used.
    """
    clean_store = retailer_name or domain.split(".")[0]
    return f"{query} {clean_store}"

async def fetch_retailer_live_listings(
    retailer_name: str,
    domain: str,
    query: str,
    max_pages: int = MAX_PAGES_PER_RETAILER,
    limit: int = MAX_RESULTS_PER_RETAILER
) -> List[RetailerProductResult]:
    """
    Executes dynamic live product discovery for ANY search query against the target retailer.
    Supports multi-page pagination across SerpApi, Serper, and direct live web engines.
    """
    results: List[RetailerProductResult] = []
    seen_urls = set()
    now_iso = datetime.now(timezone.utc).isoformat()
    scoped_query = build_scoped_retailer_query(query, domain, retailer_name)

    # =========================================================================
    # TIER 1: SerpApi Google Shopping Multi-Page Retrieval
    # =========================================================================
    serpapi_key = settings.SERPAPI_KEY.strip() if settings.SERPAPI_KEY else ""
    if serpapi_key:
        try:
            async with httpx.AsyncClient(timeout=12.0) as client:
                for page in range(min(max_pages, 2)):
                    if len(results) >= limit:
                        break
                    start_idx = page * 20
                    resp = await client.get(
                        SERPAPI_SEARCH_URL,
                        params={
                            "engine": "google_shopping",
                            "q": scoped_query,
                            "api_key": serpapi_key,
                            "google_domain": "google.co.in",
                            "gl": "in",
                            "hl": "en",
                            "start": start_idx,
                            "num": 20
                        }
                    )
                    if resp.status_code == 200:
                        data = resp.json()
                        shopping_results = data.get("shopping_results", [])
                        if not shopping_results:
                            break

                        for item in shopping_results:
                            link = item.get("link") or item.get("product_link") or ""
                            source_str = (item.get("source") or item.get("merchant") or "").lower()

                            # Verify retailer match
                            dom_match = domain.lower() in link.lower() or domain.lower().split(".")[0] in source_str or retailer_name.lower() in source_str
                            if not dom_match:
                                continue

                            final_link = link if (link and "http" in link and "google." not in link) else get_direct_store_url(retailer_name, domain, query)
                            if final_link in seen_urls:
                                continue

                            raw_price = item.get("extracted_price") or item.get("price")
                            price = parse_price_to_float(raw_price)
                            if not price or price <= 0:
                                continue

                            raw_old = item.get("extracted_old_price") or item.get("old_price")
                            orig_price = parse_price_to_float(raw_old)
                            if orig_price and orig_price <= price:
                                orig_price = None

                            discount_str = None
                            if orig_price and orig_price > price:
                                discount_str = f"{round(((orig_price - price) / orig_price) * 100)}% OFF"

                            delivery_str = item.get("delivery") or "Standard Delivery"
                            is_out_of_stock = any(kw in delivery_str.lower() for kw in ["out of stock", "unavailable", "sold out"])
                            stock_status = "OUT_OF_STOCK" if is_out_of_stock else "AVAILABLE"

                            # Categorize offers from extensions and tags
                            extensions = item.get("extensions") or []
                            bank_offer = None
                            coupon_offer = None
                            exchange_offer = None
                            for ext in extensions:
                                e_str = str(ext)
                                e_lower = e_str.lower()
                                if any(b in e_lower for b in ["bank", "card", "hdfc", "sbi", "icici", "axis", "kotak", "cashback"]):
                                    bank_offer = e_str
                                elif any(c in e_lower for c in ["coupon", "code", "promo"]):
                                    coupon_offer = e_str
                                elif "exchange" in e_lower:
                                    exchange_offer = e_str

                            asin_match = re.search(r"/([A-Z0-9]{10})(?:[/?]|$)", final_link)
                            product_id = asin_match.group(1) if asin_match else item.get("product_id")

                            seen_urls.add(final_link)
                            results.append(RetailerProductResult(
                                retailer=retailer_name,
                                title=item.get("title") or query,
                                product_url=final_link,
                                image_url=item.get("thumbnail") or item.get("serpapi_thumbnail"),
                                price=price,
                                selling_price=price,
                                original_price=orig_price,
                                mrp=orig_price,
                                discount=discount_str,
                                coupon_discount=coupon_offer,
                                bank_discount=bank_offer,
                                exchange_bonus=exchange_offer,
                                delivery_charges="Free Delivery" if "free" in delivery_str.lower() else delivery_str,
                                currency="INR",
                                availability=not is_out_of_stock,
                                stock_status=stock_status,
                                is_verified=True,
                                verification_status="VERIFIED",
                                is_stale=False,
                                seller=item.get("source") or retailer_name,
                                product_id=product_id,
                                source="serpapi_live",
                                fetched_at=now_iso
                            ))
        except Exception as e:
            logger.debug(f"[{retailer_name}] SerpApi live query failed: {e}")

    # =========================================================================
    # TIER 1.5: SerpApi Google Web Organic Fallback (For Flipkart, Amazon, Croma)
    # =========================================================================
    if len(results) == 0 and serpapi_key:
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.get(
                    SERPAPI_SEARCH_URL,
                    params={
                        "engine": "google",
                        "q": f"site:{domain} {query}",
                        "api_key": serpapi_key,
                        "gl": "in",
                        "hl": "en",
                        "num": 8
                    }
                )
                if resp.status_code == 200:
                    data = resp.json()
                    organic_items = data.get("organic_results", [])
                    dom_root = domain.split(".")[0].lower()

                    for item in organic_items:
                        title = item.get("title") or ""
                        snippet = item.get("snippet") or ""
                        raw_link = item.get("link") or ""
                        lower_link = raw_link.lower()

                        # Strictly reject accessory links
                        if any(acc in title.lower() for acc in ["case", "cover", "glass", "protector"]):
                            continue

                        # Strictly reject blog, unboxed, news, and article URLs
                        if any(art in lower_link for art in ["/unboxed/", "/article/", "/news/", "/blog/", "/story/", "/review/", "/buying-guide/"]):
                            continue

                        # Strictly require the actual organic link to belong to the retailer domain
                        if dom_root not in lower_link or "google." in lower_link:
                            continue

                        # Extract price from snippet or rich extensions
                        price_val = None
                        pm = re.search(r"(?:₹|Rs\.?|INR)\s*([\d,]+(?:\.\d{2})?)", snippet)
                        if pm:
                            price_val = parse_price_to_float(pm.group(1))

                        if not price_val and "rich_snippet" in item:
                            rich_ext = item.get("rich_snippet", {}).get("bottom", {}).get("detected_extensions", {})
                            if "price" in rich_ext:
                                price_val = parse_price_to_float(rich_ext["price"])

                        final_link = raw_link if (raw_link and "http" in raw_link) else get_direct_store_url(retailer_name, domain, query)
                        if final_link in seen_urls:
                            continue

                        has_verified_price = price_val is not None and price_val > 0
                        stock_status = "AVAILABLE" if has_verified_price else "NOT_FOUND"

                        seen_urls.add(final_link)
                        results.append(RetailerProductResult(
                            retailer=retailer_name,
                            title=title or f"{query} on {retailer_name}",
                            product_url=final_link,
                            image_url=item.get("thumbnail") or None,
                            price=price_val,
                            selling_price=price_val,
                            original_price=None,
                            mrp=None,
                            currency="INR",
                            availability=has_verified_price,
                            stock_status=stock_status,
                            is_verified=has_verified_price,
                            verification_status="VERIFIED" if has_verified_price else "UNAVAILABLE",
                            is_stale=False,
                            seller=retailer_name,
                            source="serpapi_organic_verified",
                            fetched_at=now_iso
                        ))
                        if len(results) >= limit:
                            break
        except Exception as e:
            logger.debug(f"[{retailer_name}] Organic fallback search failed: {e}")

    # =========================================================================
    # TIER 2: Serper Shopping Multi-Page Retrieval (Backup / Parallel)
    # =========================================================================
    serper_key = settings.SERPER_API_KEY.strip() if settings.SERPER_API_KEY else ""
    if len(results) < limit and serper_key:
        try:
            async with httpx.AsyncClient(timeout=12.0) as client:
                for page in range(min(max_pages, 2)):
                    if len(results) >= limit:
                        break
                    resp = await client.post(
                        SERPER_SHOPPING_URL,
                        headers={
                            "X-API-KEY": serper_key,
                            "Content-Type": "application/json"
                        },
                        json={
                            "q": scoped_query,
                            "gl": "in",
                            "hl": "en",
                            "page": page + 1,
                            "num": 20
                        }
                    )
                    if resp.status_code == 200:
                        data = resp.json()
                        shopping_items = data.get("shopping", [])
                        if not shopping_items:
                            break

                        for item in shopping_items:
                            link = item.get("link") or ""
                            source_str = (item.get("source") or "").lower()

                            if domain.lower() not in link.lower() and domain.lower().split(".")[0] not in source_str:
                                continue

                            if link in seen_urls:
                                continue

                            price = parse_price_to_float(item.get("price"))
                            if not price or price <= 0:
                                continue

                            orig_price = parse_price_to_float(item.get("oldPrice") or item.get("originalPrice"))
                            discount_str = None
                            if orig_price and orig_price > price:
                                discount_str = f"{round(((orig_price - price) / orig_price) * 100)}% OFF"

                            seen_urls.add(link)
                            results.append(RetailerProductResult(
                                retailer=retailer_name,
                                title=item.get("title") or query,
                                product_url=link,
                                image_url=item.get("imageUrl") or item.get("thumbnail"),
                                price=price,
                                original_price=orig_price,
                                discount=discount_str,
                                currency="INR",
                                availability=True,
                                stock_status="AVAILABLE",
                                seller=item.get("source") or retailer_name,
                                source="serper_live",
                                fetched_at=now_iso
                            ))
        except Exception as e:
            logger.debug(f"[{retailer_name}] Serper live query failed: {e}")

    # =========================================================================
    # TIER 3: Direct Live Web Discovery Engine (No static limitations)
    # =========================================================================
    if len(results) == 0:
        try:
            # Query live web search index (DuckDuckGo HTML / Retailer search endpoints)
            encoded_q = urllib.parse.quote_plus(scoped_query)
            ddg_url = f"https://html.duckduckgo.com/html/?q={encoded_q}"
            headers = {
                "User-Agent": DESKTOP_USER_AGENTS[0],
                "Accept-Language": "en-US,en;q=0.9",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
            }
            async with httpx.AsyncClient(timeout=8.0, follow_redirects=True) as client:
                resp = await client.get(ddg_url, headers=headers)
                if resp.status_code == 200:
                    html = resp.text
                    # Extract result links and titles
                    matches = re.findall(r'<a\s+class="result__url"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)</a>', html)
                    title_matches = re.findall(r'<a\s+class="result__snippet"[^>]*>([\s\S]*?)</a>', html)

                    for idx, (raw_link, raw_snippet) in enumerate(matches):
                        clean_link = urllib.parse.unquote(raw_link)
                        # Extract actual URL if redirected
                        actual_url_match = re.search(r"uddg=([^&]+)", clean_link)
                        actual_url = urllib.parse.unquote(actual_url_match.group(1)) if actual_url_match else clean_link

                        if domain.lower() not in actual_url.lower():
                            continue

                        if actual_url in seen_urls:
                            continue

                        # Extract price from snippet if present e.g. "Rs. 34,999" or "₹34,999"
                        price_match = re.search(r"(?:₹|Rs\.?|INR)\s*([\d,]+)", raw_snippet)
                        price_val = parse_price_to_float(price_match.group(1)) if price_match else None

                        # Strip HTML tags from title
                        clean_title = re.sub(r"<[^>]+>", "", raw_snippet).strip()
                        if len(clean_title) < 5:
                            clean_title = f"{query} on {retailer_name}"

                        seen_urls.add(actual_url)
                        results.append(RetailerProductResult(
                            retailer=retailer_name,
                            title=clean_title,
                            product_url=actual_url,
                            price=price_val,
                            currency="INR",
                            availability=True,
                            stock_status="AVAILABLE",
                            seller=retailer_name,
                            source="direct_live_discovery",
                            fetched_at=now_iso
                        ))
        except Exception as e:
            logger.debug(f"[{retailer_name}] Direct web discovery engine encountered: {e}")

    logger.info(f"[{retailer_name.upper()}] Discovered {len(results)} live listings for '{query}' across {max_pages} pages")
    return results[:limit]

async def fetch_all_live_retailer_offers(
    query: str,
    max_pages: int = MAX_PAGES_PER_RETAILER,
    limit: int = 60
) -> List[RetailerProductResult]:
    """
    Executes a unified multi-retailer live search query across Google Shopping & Serper.
    Dynamically identifies and parses listings for ALL verified retailers present in the response
    (e.g. Zepto, Croma, iPlanet, Flipkart, Amazon, Reliance Digital, Blinkit, Vijay Sales, JioMart, etc.).
    """
    from backend.models.product import clean_platform_name
    from backend.services.product_matcher import detect_product_category

    cat, ptype, is_acc = detect_product_category(query)
    clean_q = query
    if cat == "smartphone" and not is_acc:
        clean_q = f"{query} -case -cover -glass -protector -guard -skin -pouch -cable -charger"
    elif cat == "laptop" and not is_acc:
        clean_q = f"{query} -case -sleeve -skin -cable -charger"

    results: List[RetailerProductResult] = []
    seen_keys = set()
    now_iso = datetime.now(timezone.utc).isoformat()

    # 1. SerpApi Multi-Store Shopping Engine
    serpapi_key = settings.SERPAPI_KEY.strip() if settings.SERPAPI_KEY else ""
    if serpapi_key:
        try:
            async with httpx.AsyncClient(timeout=14.0) as client:
                for page in range(min(max_pages, 2)):
                    if len(results) >= limit:
                        break
                    start_idx = page * 20
                    resp = await client.get(
                        SERPAPI_SEARCH_URL,
                        params={
                            "engine": "google_shopping",
                            "q": clean_q,
                            "api_key": serpapi_key,
                            "google_domain": "google.co.in",
                            "gl": "in",
                            "hl": "en",
                            "start": start_idx,
                            "num": 25
                        }
                    )
                    if resp.status_code == 200:
                        data = resp.json()
                        shopping_results = data.get("shopping_results", [])
                        if not shopping_results:
                            break

                        for item in shopping_results:
                            link = item.get("link") or item.get("product_link") or ""
                            raw_source = item.get("source") or item.get("merchant") or ""
                            retailer_name = clean_platform_name(raw_source)

                            raw_price = item.get("extracted_price") or item.get("price")
                            price = parse_price_to_float(raw_price)
                            if not price or price <= 0:
                                continue

                            # Dedup key: retailer + product_id or link
                            asin_match = re.search(r"/([A-Z0-9]{10})(?:[/?]|$)", link)
                            pid = asin_match.group(1) if asin_match else item.get("product_id") or link
                            dedup_key = f"{retailer_name.lower()}:{pid}"
                            if dedup_key in seen_keys:
                                continue

                            raw_old = item.get("extracted_old_price") or item.get("old_price")
                            orig_price = parse_price_to_float(raw_old)
                            discount_str = None
                            if orig_price and orig_price > price:
                                discount_str = f"{round(((orig_price - price) / orig_price) * 100)}% OFF"

                            delivery_str = item.get("delivery") or "Standard Delivery"
                            is_out_of_stock = any(kw in delivery_str.lower() for kw in ["out of stock", "unavailable", "sold out"])
                            stock_status = "OUT_OF_STOCK" if is_out_of_stock else "AVAILABLE"

                            seen_keys.add(dedup_key)
                            results.append(RetailerProductResult(
                                retailer=retailer_name,
                                title=item.get("title") or query,
                                product_url=link,
                                image_url=item.get("thumbnail") or item.get("serpapi_thumbnail"),
                                price=price,
                                original_price=orig_price,
                                discount=discount_str,
                                currency="INR",
                                availability=not is_out_of_stock,
                                stock_status=stock_status,
                                seller=raw_source or retailer_name,
                                product_id=pid,
                                source="google_shopping_multi",
                                fetched_at=now_iso
                            ))
        except Exception as e:
            logger.debug(f"[MultiRetailerEngine] SerpApi multi-store query error: {e}")

    # 2. Serper Multi-Store Shopping Engine
    serper_key = settings.SERPER_API_KEY.strip() if settings.SERPER_API_KEY else ""
    if serper_key and len(results) < limit:
        try:
            async with httpx.AsyncClient(timeout=14.0) as client:
                for page in range(min(max_pages, 2)):
                    if len(results) >= limit:
                        break
                    resp = await client.post(
                        SERPER_SHOPPING_URL,
                        headers={
                            "X-API-KEY": serper_key,
                            "Content-Type": "application/json"
                        },
                        json={
                            "q": clean_q,
                            "gl": "in",
                            "hl": "en",
                            "page": page + 1,
                            "num": 25
                        }
                    )
                    if resp.status_code == 200:
                        data = resp.json()
                        shopping_items = data.get("shopping", [])
                        if not shopping_items:
                            break

                        for item in shopping_items:
                            link = item.get("link") or ""
                            raw_source = item.get("source") or ""
                            retailer_name = clean_platform_name(raw_source)

                            price = parse_price_to_float(item.get("price"))
                            if not price or price <= 0:
                                continue

                            dedup_key = f"{retailer_name.lower()}:{link}"
                            if dedup_key in seen_keys:
                                continue

                            orig_price = parse_price_to_float(item.get("oldPrice") or item.get("originalPrice"))
                            discount_str = None
                            if orig_price and orig_price > price:
                                discount_str = f"{round(((orig_price - price) / orig_price) * 100)}% OFF"

                            seen_keys.add(dedup_key)
                            results.append(RetailerProductResult(
                                retailer=retailer_name,
                                title=item.get("title") or query,
                                product_url=link,
                                image_url=item.get("imageUrl") or item.get("thumbnail"),
                                price=price,
                                original_price=orig_price,
                                discount=discount_str,
                                currency="INR",
                                availability=True,
                                stock_status="AVAILABLE",
                                seller=raw_source or retailer_name,
                                source="serper_multi",
                                fetched_at=now_iso
                            ))
        except Exception as e:
            logger.debug(f"[MultiRetailerEngine] Serper multi-store query error: {e}")

    logger.info(f"[MultiRetailerEngine] Total multi-store listings gathered: {len(results)}")
    return results[:limit]

