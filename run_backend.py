import sys
import os
from pathlib import Path
import uvicorn

# Setup paths
ROOT_DIR = Path(__file__).resolve().parent
BASE_DIR = ROOT_DIR / "backend"

if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

if __name__ == "__main__":
    print("Starting ZGenie FastAPI Server on http://127.0.0.1:8000 ...")
    uvicorn.run("backend.api.main:app", host="127.0.0.1", port=8000, reload=True)
