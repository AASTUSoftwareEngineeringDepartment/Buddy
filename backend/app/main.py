from fastapi import FastAPI
from fastapi.openapi.utils import get_openapi
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.db.mongo import MongoDB
from app.api.v1.routes import auth, child, story
from app.api.v1.routes.settings import router as settings_router
from app.routers import science_qa
from app.config.settings import get_settings

settings = get_settings()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await MongoDB.connect_to_db()
    yield
    # Shutdown
    await MongoDB.close_db_connection()

app = FastAPI(
    title="Buddy API",
    description="API for Buddy application",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/v1")
app.include_router(child.router, prefix="/api/v1")
app.include_router(story.router, prefix="/api/v1")
app.include_router(science_qa.router)
app.include_router(settings_router, prefix="/api/v1")

def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    
    openapi_schema = get_openapi(
        title="Buddy API",
        version="1.0.0",
        description="API for Buddy application",
        routes=app.routes,
    )
    
    # Add security scheme
    openapi_schema["components"]["securitySchemes"] = {
        "Bearer": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT",
            "description": "Enter your JWT token in the format: Bearer <token>"
        }
    }
    
    # Add security requirement to all endpoints except login and register
    for path in openapi_schema["paths"]:
        if path not in ["/auth/login", "/auth/register", "/auth/verify-otp"]:
            if "post" in openapi_schema["paths"][path]:
                openapi_schema["paths"][path]["post"]["security"] = [{"Bearer": []}]
            if "get" in openapi_schema["paths"][path]:
                openapi_schema["paths"][path]["get"]["security"] = [{"Bearer": []}]
            if "put" in openapi_schema["paths"][path]:
                openapi_schema["paths"][path]["put"]["security"] = [{"Bearer": []}]
            if "delete" in openapi_schema["paths"][path]:
                openapi_schema["paths"][path]["delete"]["security"] = [{"Bearer": []}]
    
    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi 