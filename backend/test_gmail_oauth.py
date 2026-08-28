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

from backend.core.encryption import encrypt_dict, decrypt_dict
from backend.services.order_parsers.amazon import AmazonParser
from backend.services.order_parsers.flipkart import FlipkartParser
from backend.services.order_parsers.myntra import MyntraParser
from backend.services.order_parsers.meesho import MeeshoParser
from backend.services.order_parsers.blinkit import BlinkitParser

def run_tests():
    print("=" * 65)
    print("RUNNING GMAIL OAUTH & RETAILER PARSER UNIT TEST SUITE")
    print("=" * 65)

    # 1. Test Fernet Symmetric Encryption Round-trip
    print("\n--- TEST 1: Fernet Symmetric Token Encryption ---")
    sensitive_token_payload = {
        "access_token": "ya29.a0AfH6SMTestAccessTokenValue123456",
        "refresh_token": "1//04TestRefreshTokenValueABCDEF123456",
        "client_id": "test-client-id.apps.googleusercontent.com",
        "scopes": ["https://www.googleapis.com/auth/gmail.readonly"],
    }
    encrypted = encrypt_dict(sensitive_token_payload)
    assert isinstance(encrypted, str) and len(encrypted) > 30, "Encryption failed to produce Fernet string"
    assert "ya29" not in encrypted, "Raw token leaked into ciphertext!"
    assert "1//04" not in encrypted, "Raw refresh token leaked into ciphertext!"

    decrypted = decrypt_dict(encrypted)
    assert decrypted["access_token"] == sensitive_token_payload["access_token"]
    assert decrypted["refresh_token"] == sensitive_token_payload["refresh_token"]
    print("  [PASS] Sensitive tokens encrypted and decrypted securely at rest.")

    # 2. Test Amazon Parser
    print("\n--- TEST 2: Amazon Order Email Parser ---")
    amazon_sender = "auto-confirm@amazon.in"
    amazon_subject = 'Your Amazon.in order of "Apple iPhone 16 Pro (128 GB)" has been placed'
    amazon_body = "Order #408-1234567-8901234\nTotal: Rs. 1,19,900.00\nShipped with Amazon Logistics"
    assert AmazonParser.matches(amazon_sender, amazon_subject) is True
    amz_res = AmazonParser.parse("msg_amz_1", amazon_sender, amazon_subject, amazon_body, amazon_body, "", "2026-08-28T10:00:00Z")
    assert amz_res is not None
    assert amz_res["retailer"] == "Amazon"
    assert amz_res["order_number"] == "408-1234567-8901234"
    assert amz_res["amount"] == 119900.0
    assert "iPhone 16 Pro" in amz_res["product_name"]
    print(f"  [PASS] Amazon order parsed: #{amz_res['order_number']} | Item: {amz_res['product_name']} | Amount: Rs. {amz_res['amount']}")

    # 3. Test Flipkart Parser
    print("\n--- TEST 3: Flipkart Order Email Parser ---")
    fk_sender = "orders@flipkart.com"
    fk_subject = "Order Confirmed: for Samsung Galaxy S24 Ultra 5G has been placed"
    fk_body = "Your Order ID: OD123456789012345600\nTotal Amount: ₹ 1,29,999"
    assert FlipkartParser.matches(fk_sender, fk_subject) is True
    fk_res = FlipkartParser.parse("msg_fk_1", fk_sender, fk_subject, fk_body, fk_body, "", "2026-08-28T10:00:00Z")
    assert fk_res is not None
    assert fk_res["retailer"] == "Flipkart"
    assert fk_res["order_number"] == "OD123456789012345600"
    assert fk_res["amount"] == 129999.0
    print(f"  [PASS] Flipkart order parsed: #{fk_res['order_number']} | Item: {fk_res['product_name']} | Amount: Rs. {fk_res['amount']}")

    # 4. Test Myntra Parser
    print("\n--- TEST 4: Myntra Order Email Parser ---")
    myntra_sender = "orders@myntra.com"
    myntra_subject = "Your Myntra order for Levi's 511 Slim Fit Jeans is confirmed"
    myntra_body = "Order ID: 123456789012\nTotal Amount: INR 2,199"
    assert MyntraParser.matches(myntra_sender, myntra_subject) is True
    myntra_res = MyntraParser.parse("msg_myntra_1", myntra_sender, myntra_subject, myntra_body, myntra_body, "", "2026-08-28T10:00:00Z")
    assert myntra_res is not None
    assert myntra_res["retailer"] == "Myntra"
    assert myntra_res["order_number"] == "123456789012"
    assert myntra_res["amount"] == 2199.0
    print(f"  [PASS] Myntra order parsed: #{myntra_res['order_number']} | Item: {myntra_res['product_name']} | Amount: Rs. {myntra_res['amount']}")

    # 5. Test Meesho Parser
    print("\n--- TEST 5: Meesho Order Email Parser ---")
    meesho_sender = "support@meesho.com"
    meesho_subject = "Your order for Cotton Kurta Set is confirmed"
    meesho_body = "Sub-order ID: MSH-987654321\nAmount paid: Rs. 699"
    assert MeeshoParser.matches(meesho_sender, meesho_subject) is True
    meesho_res = MeeshoParser.parse("msg_meesho_1", meesho_sender, meesho_subject, meesho_body, meesho_body, "", "2026-08-28T10:00:00Z")
    assert meesho_res is not None
    assert meesho_res["retailer"] == "Meesho"
    assert meesho_res["order_number"] == "MSH-987654321"
    assert meesho_res["amount"] == 699.0
    print(f"  [PASS] Meesho order parsed: #{meesho_res['order_number']} | Item: {meesho_res['product_name']} | Amount: Rs. {meesho_res['amount']}")

    # 6. Test Blinkit Parser
    print("\n--- TEST 6: Blinkit Order Email Parser ---")
    blinkit_sender = "orders@blinkit.com"
    blinkit_subject = "Your order for Amul Milk & Groceries has been delivered"
    blinkit_body = "Order ID: BLNK998877\nBill Amount: ₹ 485"
    assert BlinkitParser.matches(blinkit_sender, blinkit_subject) is True
    blinkit_res = BlinkitParser.parse("msg_blinkit_1", blinkit_sender, blinkit_subject, blinkit_body, blinkit_body, "", "2026-08-28T10:00:00Z")
    assert blinkit_res is not None
    assert blinkit_res["retailer"] == "Blinkit"
    assert blinkit_res["order_number"] == "BLNK998877"
    assert blinkit_res["amount"] == 485.0
    assert blinkit_res["delivered"] is True
    print(f"  [PASS] Blinkit order parsed: #{blinkit_res['order_number']} | Item: {blinkit_res['product_name']} | Amount: Rs. {blinkit_res['amount']}")

    # 7. Test Google OAuth Configuration Loader & Startup Validation
    print("\n--- TEST 7: Google OAuth Configuration Loader & Validation ---")
    from backend.core.config import settings
    assert bool(settings.GOOGLE_CLIENT_ID), "GOOGLE_CLIENT_ID must be loaded"
    assert bool(settings.GOOGLE_CLIENT_SECRET), "GOOGLE_CLIENT_SECRET must be loaded"
    assert settings.GOOGLE_REDIRECT_URI == "http://localhost:8000/auth/google/callback"
    print(f"  [PASS] Config loaded GOOGLE_CLIENT_ID: {settings.GOOGLE_CLIENT_ID}")
    print(f"  [PASS] Config loaded GOOGLE_REDIRECT_URI: {settings.GOOGLE_REDIRECT_URI}")
    print("  [PASS] Config loaded GOOGLE_CLIENT_SECRET: [SECURELY LOADED, NOT EXPOSED]")

    # 8. Test /debug/config-check Endpoint
    print("\n--- TEST 8: /debug/config-check Debug Endpoint Validation ---")
    import httpx
    import asyncio
    from backend.api.main import app

    async def test_debug_endpoint():
        transport = httpx.ASGITransport(app=app)
        async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
            resp = await client.get("/debug/config-check")
            assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
            data = resp.json()
            assert data["status"] == "ready"
            assert data["google_oauth"]["client_id"] == settings.GOOGLE_CLIENT_ID
            assert data["google_oauth"]["redirect_uri"] == settings.GOOGLE_REDIRECT_URI
            assert data["google_oauth"]["client_secret_configured"] is True
            assert "client_secret" not in data["google_oauth"], "Security leak: client_secret in response payload!"
            print(f"  [PASS] /debug/config-check status: {data['status']}")
            print("  [PASS] Verified: GOOGLE_CLIENT_SECRET is NEVER exposed in endpoint response.")

    asyncio.run(test_debug_endpoint())

    # 9. Test Google Authorization URL Builder
    print("\n--- TEST 9: Google OAuth Authorization URL Builder ---")
    from backend.routers.auth_google import build_google_oauth_url
    oauth_url = build_google_oauth_url(user_id="test_uid_123")
    assert "https://accounts.google.com/o/oauth2/v2/auth" in oauth_url
    assert settings.GOOGLE_CLIENT_ID in oauth_url
    assert "access_type=offline" in oauth_url
    assert "prompt=consent" in oauth_url
    assert "gmail.readonly" in oauth_url
    assert settings.GOOGLE_CLIENT_SECRET not in oauth_url, "Security leak: secret in authorization URL!"
    print("  [PASS] Google OAuth consent URL generated with offline access and gmail.readonly scope.")

    print("\n" + "=" * 65)
    print("ALL GMAIL OAUTH & ORDER PARSER UNIT TESTS PASSED WITH 100% SUCCESS!")
    print("=" * 65)

if __name__ == "__main__":
    run_tests()
