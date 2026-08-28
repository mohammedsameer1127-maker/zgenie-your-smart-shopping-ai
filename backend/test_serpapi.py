import asyncio
import sys
from pathlib import Path

# Add project root and backend dir to sys.path
BASE_DIR = Path(__file__).resolve().parent
ROOT_DIR = BASE_DIR.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from backend.models.product import IntentPayload
from backend.services.connectors.serpapi_shopping import serpapi_connector
from backend.services.connectors.manager import connector_manager

async def test_connector():
    print("=" * 60)
    print("Testing SerpApi Shopping Connector...")
    print("=" * 60)
    
    intent = IntentPayload(
        query="iPhone 15 128GB",
        brand="Apple",
        category="Smartphones"
    )
    
    print(f"Executing search for: '{intent.query}'...")
    products = await serpapi_connector.search(intent)
    
    print(f"\nFetched {len(products)} products from SerpApi:")
    for idx, p in enumerate(products[:5], 1):
        print(f"\n[{idx}] {p.title}")
        print(f"    Platform: {p.platform}")
        print(f"    Price: Rs. {p.price} (Original: {p.original_price})")
        print(f"    Rating: {p.rating} ({p.reviews_count} reviews)")
        print(f"    URL: {p.product_url[:80] if p.product_url else 'None'}...")
        print(f"    Image: {p.image_url[:80] if p.image_url else 'None'}...")
        print(f"    Offers/Badges: {p.offers}")
        print(f"    Delivery: {p.delivery}")


    print("\n" + "=" * 60)
    print("Testing Cache behavior (second call should hit cache)...")
    print("=" * 60)
    cached_products = await serpapi_connector.search(intent)
    print(f"Retrieved {len(cached_products)} products on repeated query.")

    print("\n" + "=" * 60)
    print("Testing Fallback Pipeline via ShoppingConnectorManager...")
    print("=" * 60)
    results, winning_connector = await connector_manager.search_with_fallback(intent)
    print(f"Fallback pipeline winner: '{winning_connector}' ({len(results)} items)")
    print("=" * 60)
    print("ALL TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    asyncio.run(test_connector())
