from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

from app.settings import settings
from app.seed import seed_database
from app.schemas import HealthResponse
from app.api import applications, dashboard, evc, compliance, notifications, audit

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables and synthetic seed data on startup
    seed_database()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Integrated AICTE Approval Workflow Automation, Compliance Monitoring and Alert Management System (Problem Statement 26262)",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/api/v1/openapi.json",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins if settings.cors_origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Consistent JSON error handling for validation
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": "Validation Error",
            "status_code": 422,
            "details": exc.errors()
        }
    )

# Root and Health check endpoints
@app.get("/health", response_model=HealthResponse, tags=["Health"])
@app.get(f"{settings.API_V1_STR}/health", response_model=HealthResponse, tags=["Health"])
def health_check():
    """
    Basic service health check with no exposed credentials or internal diagnostics.
    """
    return HealthResponse(
        status="ok",
        version=settings.VERSION,
        environment="prototype" if settings.DEMO_MODE else "production",
        database="connected"
    )

@app.get("/", tags=["Root"])
def root():
    return {
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "api_docs": "/docs",
        "api_prefix": settings.API_V1_STR
    }

# Include API v1 routers
app.include_router(applications.router, prefix=settings.API_V1_STR)
app.include_router(dashboard.router, prefix=settings.API_V1_STR)
app.include_router(evc.router, prefix=settings.API_V1_STR)
app.include_router(compliance.router, prefix=settings.API_V1_STR)
app.include_router(notifications.router, prefix=settings.API_V1_STR)
app.include_router(audit.router, prefix=settings.API_V1_STR)
