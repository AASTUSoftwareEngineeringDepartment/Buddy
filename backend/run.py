import os
import uvicorn

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))  # Use Render's PORT or default to 8000
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=True)