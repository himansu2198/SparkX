import os
import sys
from uvicorn import run

# Ensure the app package is importable when this file is run from the repo root.
repo_root = os.path.dirname(os.path.abspath(__file__))
if repo_root not in sys.path:
    sys.path.insert(0, repo_root)


def main():
    run("app.main:app", host="0.0.0.0", port=8000)


if __name__ == "__main__":
    main()
