from sqlalchemy import create_engine, text
from sqlalchemy.engine import URL
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import OperationalError
import logging

logger = logging.getLogger(__name__)

# ── Engine — uses URL.create to safely handle special chars in password ────────
engine = create_engine(
    URL.create(
        drivername="postgresql",
        username="postgres",
        password="himansu@2004",
        host="localhost",
        port=5433,
        database="gamified_learning",
    ),
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=10,
    pool_timeout=10,
    pool_recycle=1800,
    connect_args={
        "connect_timeout": 5,
        "options": "-c statement_timeout=30000",
    },
    echo=False,
)

# ── Verify DB is reachable at startup ─────────────────────────────────────────
def verify_db_connection():
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        logger.info("✅ Database connected successfully")
        return True
    except OperationalError as e:
        logger.error("❌ Database connection FAILED: %s", e)
        logger.error("👉 Check: correct port? PostgreSQL running?")
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
        logger.error("DB session error: %s", e)
        raise
    finally:
        db.close()