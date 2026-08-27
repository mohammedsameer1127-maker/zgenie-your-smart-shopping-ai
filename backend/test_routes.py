import sys
from pathlib import Path

# Add project root and backend dir to sys.path
BASE_DIR = Path(__file__).resolve().parent
ROOT_DIR = BASE_DIR.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from fastapi.testclient import TestClient
from backend.api.main import app

def test_api_routes():
    client = TestClient(app)
    
    print("Testing GET /debug/test-serpapi?q=iphone+15 ...")
    resp = client.get("/debug/test-serpapi?q=iphone+15")
    assert resp.status_code == 200, f"Expected 200, got {resp.status_code}: {resp.text}"
    data = resp.json()
    assert data["success"] is True
    assert data["total_results"] > 0
    assert len(data["products"]) > 0
    print(f"-> SUCCESS: /debug/test-serpapi returned {data['total_results']} products in {data['duration_ms']}ms")

    print("\nTesting GET /api/compare/config ...")
    config_resp = client.get("/api/compare/config")
    assert config_resp.status_code == 200
    config_data = config_resp.json()
    print(f"-> Config fallback order: {config_data['fallback_order']}")

    print("\nTesting GET /api/compare/search?q=macbook+air+m3 ...")
    comp_resp = client.get("/api/compare/search?q=macbook+air+m3")
    assert comp_resp.status_code == 200
    comp_data = comp_resp.json()
    print(f"-> Compare endpoint returned {comp_data['total_results']} products via connector '{comp_data['source_connector']}'")
    
    print("\nALL FASTAPI ROUTE TESTS PASSED!")

if __name__ == "__main__":
    test_api_routes()
