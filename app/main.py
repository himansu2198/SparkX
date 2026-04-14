from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.config import settings

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

@app.exception_handler(422)
async def validation_exception_handler(request: Request, exc):
    errors = exc.errors() if hasattr(exc, "errors") else []
    messages = []
    for e in errors:
        field = " → ".join(str(l) for l in e.get("loc", []))
        messages.append(f"{field}: {e.get('msg', 'invalid')}")
    return JSONResponse(status_code=422, content={"detail": messages or "Validation error"})

from app.routers import auth, levels, tasks, progress, leaderboard, mentors, roadmap, feedback

app.include_router(auth.router,         prefix="/auth",         tags=["Auth"])
app.include_router(levels.router,       prefix="/levels",       tags=["Levels"])
app.include_router(tasks.router,        prefix="/tasks",        tags=["Tasks"])
app.include_router(progress.router,     prefix="/progress",     tags=["Progress"])
app.include_router(leaderboard.router,  prefix="/leaderboard",  tags=["Leaderboard"])
app.include_router(mentors.router,      prefix="/mentors",      tags=["Mentors"])
app.include_router(roadmap.router,      prefix="/roadmap",      tags=["Roadmap"])
app.include_router(feedback.router,     prefix="/feedback",     tags=["Feedback"])

@app.get("/", tags=["Health"])
def root():
    return {"status": "ok", "app": settings.APP_NAME, "docs": "/docs"}

@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "healthy"}