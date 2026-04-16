from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.config import settings
from app.database import verify_db_connection  # ← ADD THIS
import logging                                  # ← ADD THIS

logger = logging.getLogger(__name__)           # ← ADD THIS

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Gamified Learning Tracker API",
    docs_url="/docs",
    redoc_url="/redoc",
)

ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["Authorization", "Content-Type", "Accept", "Origin", "X-Requested-With"],
    expose_headers=["Content-Length"],
    max_age=600,
)

# ── ADD THIS STARTUP EVENT ─────────────────────────────────────────────────────
@app.on_event("startup")
async def startup_event():
    from app.database import engine, Base

    # 🔥 IMPORTANT: all models import karo
    from app.models import users, tasks, levels, progress, feedback, mentors, pathforge
    # 🔥 auto create missing tables
    Base.metadata.create_all(bind=engine)

    logger.info("🚀 Starting up...")

    ok = verify_db_connection()
    if not ok:
        logger.error("❌ DB unreachable — check DATABASE_URL in .env")
    else:
        logger.info("✅ DB connected — backend ready")

from fastapi.exceptions import RequestValidationError

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors()},  # 🔥 actual error dikhega
    )
from app.routers import auth, levels, tasks, progress, leaderboard, mentors, roadmap, feedback, pathforge

app.include_router(auth.router,         prefix="/auth",         tags=["Auth"])
app.include_router(levels.router,       prefix="/levels",       tags=["Levels"])
app.include_router(tasks.router,        prefix="/tasks",        tags=["Tasks"])
app.include_router(progress.router,     prefix="/progress",     tags=["Progress"])
app.include_router(leaderboard.router,  prefix="/leaderboard",  tags=["Leaderboard"])
app.include_router(mentors.router,      prefix="/mentors",      tags=["Mentors"])
app.include_router(roadmap.router,      prefix="/roadmap",      tags=["Roadmap"])
app.include_router(feedback.router,     prefix="/feedback",     tags=["Feedback"])
app.include_router(pathforge.router,    prefix="/pathforge",    tags=["PathForge AI"])

@app.get("/", tags=["Health"])
def root():
    return {"status": "ok", "app": settings.APP_NAME, "docs": "/docs"}

# ── UPDATE HEALTH CHECK TO VERIFY DB ──────────────────────────────────────────
@app.get("/health", tags=["Health"])
def health_check():
    from app.database import engine
    from sqlalchemy import text
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "database": str(e)}