import sys
from pathlib import Path

# Add project root and backend dir to sys.path
BASE_DIR = Path(__file__).resolve().parent
ROOT_DIR = BASE_DIR.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

from backend.models.product import parse_price_to_float, NormalizedProduct
from backend.services.product_matcher import (
    score_candidate_product,
    filter_exact_match_products,
    extract_brand,
    extract_storage_variants,
    extract_model_tier_tokens
)

def test_price_parsing():
    print("\n--- TEST 1: Price Parsing Correctness ---")
    test_cases = [
        ("₹69,990", 69990.0),
        ("₹1,19,900.00", 119900.0),
        ("Rs. 54,999", 54999.0),
        ("₹ 1,79,990", 179990.0),
        ("69,990", 69990.0),
        ("$199.99", 199.99),
        ("₹12,499.50", 12499.5),
        ("0", None),
        ("-500", None),
        ("FREE", None),
        (None, None),
        ("", None),
        ("N/A", None),
    ]

    for raw, expected in test_cases:
        parsed = parse_price_to_float(raw)
        assert parsed == expected, f"Failed parsing '{raw}': expected {expected}, got {parsed}"
        print(f"  [PASS] '{raw}' -> {parsed}")

def test_brand_extraction_and_filtering():
    print("\n--- TEST 2: Brand Extraction & Hard Brand Filtering ---")
    assert extract_brand("Apple iPhone 16 Pro") == "apple"
    assert extract_brand("Samsung Galaxy S24 Ultra") == "samsung"
    assert extract_brand("Sony WH-1000XM5") == "sony"
    assert extract_brand("Nike Air Jordan 1") == "nike"
    print("  [PASS] Brand extraction accurate for Apple, Samsung, Sony, Nike.")

    # Candidate with different brand must be rejected
    query = "Apple iPhone 16 Pro"
    spigen_case = NormalizedProduct(
        title="Spigen Ultra Hybrid Back Case for iPhone 16 Pro",
        price=1499.0,
        platform="Amazon"
    )
    is_match, score, reason = score_candidate_product(query, spigen_case)
    assert not is_match, f"Expected Spigen case to be rejected, but passed with reason: {reason}"
    print(f"  [PASS] Spigen accessory rejected: {reason}")

def test_storage_and_variant_matching():
    print("\n--- TEST 3: Storage & Variant Matching ---")
    query = "iPhone 15 128GB"
    
    # 256GB candidate must be rejected when 128GB requested
    cand_256gb = NormalizedProduct(
        title="Apple iPhone 15 (256 GB) - Black",
        price=74900.0,
        platform="Flipkart"
    )
    is_match, score, reason = score_candidate_product(query, cand_256gb)
    assert not is_match, f"Expected 256GB to be rejected for 128GB query, but passed with reason: {reason}"
    print(f"  [PASS] 256GB listing rejected for 128GB query: {reason}")

    # Exact 128GB candidate must be accepted
    cand_128gb = NormalizedProduct(
        title="Apple iPhone 15 (128 GB) - Blue",
        price=64900.0,
        platform="Amazon"
    )
    is_match, score, reason = score_candidate_product(query, cand_128gb)
    assert is_match, f"Expected 128GB to be accepted, but got: {reason}"
    print(f"  [PASS] Exact 128GB listing accepted: score {score}")

def test_model_tier_matching():
    print("\n--- TEST 4: Model Tier Matching (Pro vs Pro Max vs Plus) ---")
    query = "iPhone 16 Pro"

    # Pro Max candidate must be rejected for Pro query
    cand_pro_max = NormalizedProduct(
        title="Apple iPhone 16 Pro Max (256 GB) - Desert Titanium",
        price=144900.0,
        platform="Amazon"
    )
    is_match, score, reason = score_candidate_product(query, cand_pro_max)
    assert not is_match, f"Expected Pro Max to be rejected for Pro query, but got: {reason}"
    print(f"  [PASS] Pro Max rejected for Pro query: {reason}")

    # Plus candidate must be rejected for Pro query
    cand_plus = NormalizedProduct(
        title="Apple iPhone 16 Plus (128 GB) - Teal",
        price=89900.0,
        platform="Flipkart"
    )
    is_match, score, reason = score_candidate_product(query, cand_plus)
    assert not is_match, f"Expected Plus to be rejected for Pro query, but got: {reason}"
    print(f"  [PASS] Plus rejected for Pro query: {reason}")

    # Exact Pro candidate must be accepted
    cand_pro = NormalizedProduct(
        title="Apple iPhone 16 Pro (128 GB) - Natural Titanium",
        price=119900.0,
        platform="Croma"
    )
    is_match, score, reason = score_candidate_product(query, cand_pro)
    assert is_match, f"Expected Pro to be accepted, but got: {reason}"
    print(f"  [PASS] Exact Pro accepted: score {score}")

def test_accessory_and_spare_parts_elimination():
    print("\n--- TEST 5: Accessory, Cover & Screen Guard Elimination ---")
    query = "Samsung Galaxy S24 Ultra"

    accessories = [
        "Samsung Galaxy S24 Ultra Tempered Glass Screen Protector",
        "Rugged Armor Shockproof Back Cover for Galaxy S24 Ultra",
        "Original S24 Ultra S-Pen Stylus Pen Replacement",
        "Samsung Galaxy S24 Ultra Touch LCD Screen Display Folder",
        "iService India Screen Replacement for S24 Ultra",
    ]

    for acc_title in accessories:
        cand = NormalizedProduct(title=acc_title, price=999.0, platform="Amazon")
        is_match, score, reason = score_candidate_product(query, cand)
        assert not is_match, f"Expected accessory '{acc_title}' to be rejected, but got {reason}"
        print(f"  [PASS] Rejected accessory '{acc_title}': {reason}")

def test_obscure_query_no_product_found():
    print("\n--- TEST 6: Obscure / Fake Query Triggers No Match Found ---")
    query = "xyz999fakeproductnonexistent"
    
    candidates = [
        NormalizedProduct(title="Apple iPhone 16 Pro", price=119900.0, platform="Amazon"),
        NormalizedProduct(title="Samsung Galaxy S24 Ultra", price=129999.0, platform="Flipkart"),
    ]

    matched = filter_exact_match_products(query, candidates, min_similarity=0.85)
    assert len(matched) == 0, f"Expected 0 matches for obscure query, got {len(matched)}"
    print("  [PASS] 0 matches returned for obscure query (No Product Found state verified).")

if __name__ == "__main__":
    print("=" * 65)
    print("RUNNING COMPREHENSIVE PRODUCT MATCHER & PRICING TEST SUITE")
    print("=" * 65)
    test_price_parsing()
    test_brand_extraction_and_filtering()
    test_storage_and_variant_matching()
    test_model_tier_matching()
    test_accessory_and_spare_parts_elimination()
    test_obscure_query_no_product_found()
    print("\n" + "=" * 65)
    print("ALL 6 TEST SUITES PASSED WITH 100% SUCCESS!")
    print("=" * 65)
