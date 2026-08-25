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
    try:
        await db.db["user_likes"].create_index([("user_id", 1), ("product_id", 1)], unique=True)
        await db.db["users"].create_index("uid", unique=True)
    except Exception as e:
        print(f"Index creation notice: {e}")

async def close_mongo_connection():
    if db.client is not None:
        db.client.close()
        print("Closed MongoDB connection")

