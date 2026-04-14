from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import OperationalError
from app.config import settings
import logging

logger = logging.getLogger(__name__)

# ── Engine ────────────────────────────────────────────────────────────────────
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=10,
    pool_timeout=10,       # fail fast if no connection in 10s (not hang forever)
    pool_recycle=1800,     # recycle connections every 30 mins
    connect_args={
        "connect_timeout": 5,   # TCP connect timeout — catches wrong port instantly
        "options": "-c statement_timeout=30000",  # 30s max per query
    },
    echo=False,            # set True only for SQL debug
)

# ── Verify DB is actually reachable at startup ────────────────────────────────
def verify_db_connection():
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        logger.info("✅ Database connected successfully")
        return True
    except OperationalError as e:
        logger.error(f"❌ Database connection FAILED: {e}")
        logger.error("👉 Check: correct port in DATABASE_URL? PostgreSQL running?")
        return False

# ── Session factory ───────────────────────────────────────────────────────────
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


# ── Dependency ────────────────────────────────────────────────────────────────
def get_db():
    db = SessionLocal()
    try:
        yield db
    except OperationalError as e:
        db.rollback()
        logger.error(f"DB session error: {e}")
        raise
    finally:
        db.close()