from motor.motor_asyncio import AsyncIOMotorClient
from backend.core.config import settings

class MongoDB:
    client: AsyncIOMotorClient = None
    db = None

db = MongoDB()

async def connect_to_mongo():
    db.client = AsyncIOMotorClient(settings.MONGODB_URI)
    db.db = db.client[settings.MONGODB_DB_NAME]
    print(f"Connected to MongoDB at {settings.MONGODB_URI}")

async def close_mongo_connection():
    if db.client is not None:
        db.client.close()
        print("Closed MongoDB connection")
