import os
import sys
import logging
from uvicorn import run

# Ensure the app package is importable when this file is run from the repo root.
repo_root = os.path.dirname(os.path.abspath(__file__))
if repo_root not in sys.path:
    sys.path.insert(0, repo_root)

logger = logging.getLogger("run")
logging.basicConfig(level=logging.INFO)


def main():
    # Hardcoded port 8000 (do not rely on environment variable)
    port = 8000
    host = "0.0.0.0"
    logger.info("Starting uvicorn on %s:%s (hardcoded)", host, port)
    run("app.main:app", host=host, port=port)


if __name__ == "__main__":
    main()
