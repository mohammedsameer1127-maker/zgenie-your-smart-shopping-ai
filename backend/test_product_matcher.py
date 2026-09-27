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
    extract_product_entity,
    detect_product_category,
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

def test_user_category_detection():
    print("\n--- TEST 2: User Product Category Detection ---")
    category_cases = [
        ("iQOO 15R", "smartphone", "smartphone", False),
        ("iPhone 17 Pro Max", "smartphone", "smartphone", False),
        ("Samsung Galaxy S26 Ultra", "smartphone", "smartphone", False),
        ("iQOO Neo 10R", "smartphone", "smartphone", False),
        ("iPhone 17 Pro Max case", "phone_case", "phone_case", True),
        ("iPhone 17 charger", "charger", "charger", True),
        ("AirPods Pro", "earbuds", "audio_device", False),
        ("HP Victus 15", "laptop", "laptop", False),
        ("MacBook Air M2", "laptop", "laptop", False),
    ]

    for query, exp_cat, exp_ptype, exp_is_acc in category_cases:
        cat, ptype, is_acc = detect_product_category(query)
        assert cat == exp_cat, f"For '{query}': expected cat '{exp_cat}', got '{cat}'"
        assert ptype == exp_ptype, f"For '{query}': expected ptype '{exp_ptype}', got '{ptype}'"
        assert is_acc == exp_is_acc, f"For '{query}': expected is_acc {exp_is_acc}, got {is_acc}"
        print(f"  [PASS] '{query}' -> Category: {cat} | ProductType: {ptype} | IsAccessory: {is_acc}")

def test_iqoo_15r_phone_vs_accessories():
    print("\n--- TEST 3: iQOO 15R Smartphone Query Returns ONLY Phone ---")
    query = "iQOO 15R"

    # Positive Candidates (Real Smartphones)
    phone_1 = NormalizedProduct(title="iQOO 15R 8GB 256GB Smartphone", price=39999.0, platform="Amazon")
    phone_2 = NormalizedProduct(title="iQOO 15R 12GB 256GB Smartphone", price=44999.0, platform="Flipkart")
    phone_3 = NormalizedProduct(title="iQOO 15R 5G 8GB RAM 256GB", price=39999.0, platform="Croma")

    # Negative Candidates (Accessories & Mismatched Models)
    acc_1 = NormalizedProduct(title="iQOO 15R Back Cover", price=399.0, platform="Amazon")
    acc_2 = NormalizedProduct(title="iQOO 15R Tempered Glass", price=199.0, platform="Flipkart")
    acc_3 = NormalizedProduct(title="iQOO 15R Charger 120W FlashCharge", price=1499.0, platform="Amazon")
    acc_4 = NormalizedProduct(title="iQOO 15R Silicone Case", price=299.0, platform="Meesho")
    acc_5 = NormalizedProduct(title="Shockproof Bumper Case for iQOO 15R", price=499.0, platform="Flipkart")
    acc_6 = NormalizedProduct(title="iQOO 15R compatible case with Stand", price=599.0, platform="Amazon")
    acc_7 = NormalizedProduct(title="iQOO 15R Touch Screen Display Replacement", price=2999.0, platform="Amazon")
    diff_phone_1 = NormalizedProduct(title="OnePlus 15R 5G 12GB 256GB", price=42999.0, platform="Amazon")
    diff_phone_2 = NormalizedProduct(title="iQOO 15 5G (16GB RAM, 512GB)", price=59999.0, platform="Amazon")

    # Verify phones are ACCEPTED
    assert score_candidate_product(query, phone_1)[0] is True, "iQOO 15R 8GB 256GB should match"
    assert score_candidate_product(query, phone_2)[0] is True, "iQOO 15R 12GB 256GB should match"
    assert score_candidate_product(query, phone_3)[0] is True, "iQOO 15R 5G 8GB RAM 256GB should match"
    print("  [PASS] Accepted all verified iQOO 15R smartphones.")

    # Verify accessories are REJECTED
    assert score_candidate_product(query, acc_1)[0] is False, "Back Cover must be rejected"
    assert score_candidate_product(query, acc_2)[0] is False, "Tempered Glass must be rejected"
    assert score_candidate_product(query, acc_3)[0] is False, "Charger must be rejected"
    assert score_candidate_product(query, acc_4)[0] is False, "Silicone Case must be rejected"
    assert score_candidate_product(query, acc_5)[0] is False, "Case for iQOO 15R must be rejected"
    assert score_candidate_product(query, acc_6)[0] is False, "Compatible case must be rejected"
    assert score_candidate_product(query, acc_7)[0] is False, "Display replacement must be rejected"
    assert score_candidate_product(query, diff_phone_1)[0] is False, "OnePlus 15R must be rejected for iQOO 15R"
    assert score_candidate_product(query, diff_phone_2)[0] is False, "iQOO 15 must be rejected for iQOO 15R"
    print("  [PASS] Rejected all accessories and mismatched models (Covers, Glasses, Chargers, OnePlus 15R, iQOO 15).")

def test_iqoo_neo_10r_exact_model_preservation():
    print("\n--- TEST 4: iQOO Neo 10R Exact Model Preservation ---")
    query = "iQOO Neo 10R"

    cand_valid_1 = NormalizedProduct(title="iQOO Neo 10R 5G 8GB 128GB", price=31999.0, platform="Amazon")
    cand_valid_2 = NormalizedProduct(title="iQOO Neo 10R 5G 12GB 256GB", price=34999.0, platform="Flipkart")

    cand_neo_10 = NormalizedProduct(title="iQOO Neo 10 5G 8GB 256GB", price=36999.0, platform="Amazon")
    cand_neo_9_pro = NormalizedProduct(title="iQOO Neo 9 Pro 5G (Fiery Red, 8GB RAM, 128GB Storage)", price=34999.0, platform="Amazon")
    cand_iqoo_15r = NormalizedProduct(title="iQOO 15R 5G 8GB 256GB", price=39999.0, platform="Amazon")
    cand_z10r = NormalizedProduct(title="iQOO Z10R 5G 8GB 128GB", price=21999.0, platform="Flipkart")
    cand_case = NormalizedProduct(title="iQOO Neo 10R Case Rugged Armor", price=499.0, platform="Amazon")

    # Allowed
    assert score_candidate_product(query, cand_valid_1)[0] is True, "Neo 10R 8GB 128GB must match"
    assert score_candidate_product(query, cand_valid_2)[0] is True, "Neo 10R 12GB 256GB must match"
    print("  [PASS] Accepted exact iQOO Neo 10R listings.")

    # Rejected
    assert score_candidate_product(query, cand_neo_10)[0] is False, "Neo 10 must be rejected for Neo 10R"
    assert score_candidate_product(query, cand_neo_9_pro)[0] is False, "Neo 9 Pro must be rejected for Neo 10R"
    assert score_candidate_product(query, cand_iqoo_15r)[0] is False, "iQOO 15R must be rejected for Neo 10R"
    assert score_candidate_product(query, cand_z10r)[0] is False, "iQOO Z10R must be rejected for Neo 10R"
    assert score_candidate_product(query, cand_case)[0] is False, "Neo 10R Case must be rejected"
    print("  [PASS] Strictly rejected Neo 10, Neo 9 Pro, iQOO 15R, Z10R, and Case.")

def test_iphone_17_pro_max_and_galaxy_s26_ultra():
    print("\n--- TEST 5: iPhone 17 Pro Max & Samsung Galaxy S26 Ultra ---")
    
    # iPhone 17 Pro Max
    q_ip17 = "iPhone 17 Pro Max"
    cand_ip17_pm = NormalizedProduct(title="Apple iPhone 17 Pro Max (256 GB) - Cosmic Blue", price=159900.0, platform="Amazon")
    cand_ip17_pro = NormalizedProduct(title="Apple iPhone 17 Pro (128 GB) - Natural Titanium", price=129900.0, platform="Flipkart")
    cand_ip16_pm = NormalizedProduct(title="Apple iPhone 16 Pro Max (256 GB) - Black Titanium", price=144900.0, platform="Croma")
    cand_ip17_case = NormalizedProduct(title="Spigen Ultra Hybrid MagSafe Case for iPhone 17 Pro Max", price=1999.0, platform="Amazon")

    assert score_candidate_product(q_ip17, cand_ip17_pm)[0] is True, "iPhone 17 Pro Max must match"
    assert score_candidate_product(q_ip17, cand_ip17_pro)[0] is False, "iPhone 17 Pro must be rejected for Pro Max"
    assert score_candidate_product(q_ip17, cand_ip16_pm)[0] is False, "iPhone 16 Pro Max must be rejected for 17 Pro Max"
    assert score_candidate_product(q_ip17, cand_ip17_case)[0] is False, "iPhone 17 Pro Max Case must be rejected"
    print("  [PASS] iPhone 17 Pro Max matches exact phone and rejects Pro, 16 Pro Max, and cases.")

    # Samsung Galaxy S26 Ultra
    q_s26 = "Samsung Galaxy S26 Ultra"
    cand_s26_ultra = NormalizedProduct(title="Samsung Galaxy S26 Ultra 5G (Titanium Black, 512GB)", price=139999.0, platform="Amazon")
    cand_s26_base = NormalizedProduct(title="Samsung Galaxy S26 5G (128GB)", price=79999.0, platform="Flipkart")
    cand_s25_ultra = NormalizedProduct(title="Samsung Galaxy S25 Ultra 5G (256GB)", price=119999.0, platform="Croma")
    cand_s26_cover = NormalizedProduct(title="Shockproof Armor Back Cover with Kickstand for Galaxy S26 Ultra", price=599.0, platform="Amazon")

    assert score_candidate_product(q_s26, cand_s26_ultra)[0] is True, "Galaxy S26 Ultra must match"
    assert score_candidate_product(q_s26, cand_s26_base)[0] is False, "Galaxy S26 base must be rejected for S26 Ultra"
    assert score_candidate_product(q_s26, cand_s25_ultra)[0] is False, "Galaxy S25 Ultra must be rejected for S26 Ultra"
    assert score_candidate_product(q_s26, cand_s26_cover)[0] is False, "Galaxy S26 Ultra Cover must be rejected"
    print("  [PASS] Galaxy S26 Ultra matches exact phone and rejects S26 Base, S25 Ultra, and Covers.")

def test_accessory_query_behavior():
    print("\n--- TEST 6: Explicit Accessory Queries Accept Accessories, Reject Phones ---")
    q_case = "iPhone 17 Pro Max case"
    cand_case = NormalizedProduct(title="Spigen Ultra Hybrid Case for iPhone 17 Pro Max", price=1499.0, platform="Amazon")
    cand_phone = NormalizedProduct(title="Apple iPhone 17 Pro Max (256 GB)", price=159900.0, platform="Amazon")

    assert score_candidate_product(q_case, cand_case)[0] is True, "Case query should match case"
    assert score_candidate_product(q_case, cand_phone)[0] is False, "Case query must reject actual phone"
    print("  [PASS] 'iPhone 17 Pro Max case' matches case and rejects phone.")

def test_filter_exact_match_products_ranking():
    print("\n--- TEST 7: Filtering and Ranking Simulation ---")
    query = "iQOO 15R"
    candidates = [
        NormalizedProduct(title="iQOO 15R Back Cover", price=399.0, platform="Amazon"),
        NormalizedProduct(title="iQOO 15R 8GB 256GB Smartphone", price=39999.0, platform="Amazon"),
        NormalizedProduct(title="iQOO 15R Tempered Glass", price=199.0, platform="Flipkart"),
        NormalizedProduct(title="iQOO 15R Charger", price=1499.0, platform="Amazon"),
        NormalizedProduct(title="iQOO 15R Silicone Case", price=299.0, platform="Meesho"),
        NormalizedProduct(title="iQOO 15R 12GB 256GB Smartphone", price=44999.0, platform="Flipkart"),
    ]

    filtered = filter_exact_match_products(query, candidates, min_similarity=0.70)
    assert len(filtered) == 2, f"Expected exactly 2 phone results, got {len(filtered)}"
    assert filtered[0].title == "iQOO 15R 8GB 256GB Smartphone", f"Expected cheapest exact phone first, got {filtered[0].title}"
    assert filtered[1].title == "iQOO 15R 12GB 256GB Smartphone", f"Expected second phone, got {filtered[1].title}"
    print("  [PASS] Returned ONLY the 2 actual iQOO 15R smartphones, rejected all 4 accessories.")

if __name__ == "__main__":
    print("=" * 70)
    print("RUNNING ZGENIE PRODUCT MATCHER & CATEGORY FILTER TEST SUITE")
    print("=" * 70)
    test_price_parsing()
    test_user_category_detection()
    test_iqoo_15r_phone_vs_accessories()
    test_iqoo_neo_10r_exact_model_preservation()
    test_iphone_17_pro_max_and_galaxy_s26_ultra()
    test_accessory_query_behavior()
    test_filter_exact_match_products_ranking()
    print("\n" + "=" * 70)
    print("ALL 7 TEST SUITES PASSED VERIFIED IN SPECIFICATION!")
    print("=" * 70)
