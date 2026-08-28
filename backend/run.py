import sys
import os
from pathlib import Path
import uvicorn

# Setup paths
BASE_DIR = Path(__file__).resolve().parent
ROOT_DIR = BASE_DIR.parent

if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

# Ensure subprocess / reloader inherits PYTHONPATH
os.environ["PYTHONPATH"] = str(ROOT_DIR) + (os.pathsep + os.environ["PYTHONPATH"] if "PYTHONPATH" in os.environ else "")

if __name__ == "__main__":
    print("Starting ZGenie FastAPI Server on http://127.0.0.1:8000 ...")
    uvicorn.run("backend.api.main:app", host="127.0.0.1", port=8000, reload=True, app_dir=str(ROOT_DIR))
