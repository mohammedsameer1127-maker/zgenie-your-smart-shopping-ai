import asyncio
import sys
import base64
import json
from pathlib import Path
import httpx

# Add project root and backend dir to sys.path
BASE_DIR = Path(__file__).resolve().parent
ROOT_DIR = BASE_DIR.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

from backend.api.main import app

def make_test_jwt(uid: str = "test_user_123", email: str = "test@example.com") -> str:
    header = base64.urlsafe_b64encode(json.dumps({"alg": "none", "typ": "JWT"}).encode()).decode().rstrip("=")
    payload = base64.urlsafe_b64encode(json.dumps({"uid": uid, "user_id": uid, "email": email, "name": "Test User"}).encode()).decode().rstrip("=")
    return f"{header}.{payload}.test_signature"

async def test_api_routes():
    print("=" * 65)
    print("RUNNING COMPLETE ZGENIE ENDPOINT & INTEGRATION AUDIT")
    print("=" * 65)

    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test", timeout=30.0) as client:
        # 1. Health Checks
        print("\n[1/7] Testing Health Checks (/health & /api/health) ...", flush=True)
        h1 = await client.get("/health")
        assert h1.status_code == 200 and h1.json()["status"] == "ok"
        h2 = await client.get("/api/health")
        assert h2.status_code == 200 and h2.json()["status"] == "ok"
        print("  -> PASS: Health check endpoints return 200 OK", flush=True)

        # 2. Config Check & OAuth Secrets Protection
        print("\n[2/7] Testing Debug Config Check (/debug/config-check) ...", flush=True)
        cfg_resp = await client.get("/debug/config-check")
        assert cfg_resp.status_code == 200
        cfg_data = cfg_resp.json()
        assert "client_secret" not in cfg_data.get("google_oauth", {}), "Client secret leak in config check!"
        print(f"  -> PASS: Status is '{cfg_data['status']}', Client Secret securely masked.", flush=True)

        # 3. Search & Comparison APIs
        print("\n[3/7] Testing Compare Config & Search ...", flush=True)
        cmp_cfg = await client.get("/api/compare/config")
        assert cmp_cfg.status_code == 200
        print(f"  -> PASS: Compare config active, fallback: {cmp_cfg.json()['fallback_order']}", flush=True)

        search_resp = await client.get("/api/compare/search?q=iPhone+16+Pro")
        assert search_resp.status_code == 200
        search_data = search_resp.json()
        print(f"  -> PASS: Search response status: {search_data['status']} | Results: {search_data['total_results']}", flush=True)

        # 4. User Sync with Auth Token
        print("\n[4/7] Testing User Sync (/api/users/sync) ...", flush=True)
        test_token = make_test_jwt("test_uid_456", "tester@zgenie.com")
        sync_resp = await client.post(
            "/api/users/sync",
            headers={"Authorization": f"Bearer {test_token}"},
            json={
                "uid": "test_uid_456",
                "email": "tester@zgenie.com",
                "name": "Tester",
                "photo_url": None,
                "provider_id": "google.com",
            }
        )
        assert sync_resp.status_code == 200
        print("  -> PASS: User sync returns 200 OK without errors.", flush=True)

        # 5. Likes Retrieval
        print("\n[5/7] Testing Likes API (/api/likes) ...", flush=True)
        likes_resp = await client.get(
            "/api/likes",
            headers={"Authorization": f"Bearer {test_token}"}
        )
        assert likes_resp.status_code == 200
        assert isinstance(likes_resp.json(), list)
        print(f"  -> PASS: Likes endpoint returns 200 OK with list (count: {len(likes_resp.json())}).", flush=True)

        # 6. Google Auth Status & Gmail Endpoints
        print("\n[6/7] Testing Google Auth Endpoints (/api/auth/google/status) ...", flush=True)
        status_resp = await client.get(
            "/api/auth/google/status",
            headers={"Authorization": f"Bearer {test_token}"}
        )
        assert status_resp.status_code == 200
        gstatus = status_resp.json()
        assert "connected" in gstatus
        print(f"  -> PASS: Google Auth status endpoint returned connected={gstatus['connected']}", flush=True)

        # 7. Shopping History Endpoint
        print("\n[7/7] Testing Shopping History (/api/shopping-history & /api/orders) ...", flush=True)
        hist_resp = await client.get(
            "/api/shopping-history",
            headers={"Authorization": f"Bearer {test_token}"}
        )
        assert hist_resp.status_code == 200
        hist_data = hist_resp.json()
        assert "orders" in hist_data
        print(f"  -> PASS: Shopping history returns 200 OK (total orders: {hist_data['total']})", flush=True)

        print("\n" + "=" * 65, flush=True)
        print("ALL 7 ZGENIE INTEGRATION & ROUTE AUDIT CHECKS PASSED WITH 100% SUCCESS!", flush=True)
        print("=" * 65, flush=True)

if __name__ == "__main__":
    asyncio.run(test_api_routes())
