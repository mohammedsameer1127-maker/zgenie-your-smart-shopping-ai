from motor.motor_asyncio import AsyncIOMotorClient
from backend.core.config import settings
import logging

logger = logging.getLogger(__name__)

class MongoDB:
    def __init__(self):
        self.client: AsyncIOMotorClient = None
        self._db = None

    @property
    def db(self):
        if self._db is None:
            try:
                self.client = AsyncIOMotorClient(settings.MONGODB_URI, serverSelectionTimeoutMS=3000)
                self._db = self.client[settings.MONGODB_DB_NAME]
            except Exception as e:
                logger.error(f"MongoDB lazy connection error: {e}")
        return self._db

    @db.setter
    def db(self, value):
        self._db = value

db = MongoDB()

async def connect_to_mongo():
    try:
        db.client = AsyncIOMotorClient(settings.MONGODB_URI, serverSelectionTimeoutMS=3000)
        db.db = db.client[settings.MONGODB_DB_NAME]
        print(f"Connected to MongoDB at {settings.MONGODB_URI}")
        try:
            await db.db["user_likes"].create_index([("user_id", 1), ("product_id", 1)], unique=True)
            await db.db["users"].create_index("uid", unique=True)
            # Gmail & Shopping History indexes
            await db.db["gmail_connections"].create_index("user_id", unique=True)
            await db.db["shopping_orders"].create_index([("user_id", 1), ("order_date", -1), ("created_at", -1)])
            await db.db["shopping_orders"].create_index([("user_id", 1), ("retailer", 1), ("order_number", 1)])
            await db.db["shopping_orders"].create_index([("user_id", 1), ("email_message_id", 1)])
        except Exception as idx_err:
            logger.info(f"MongoDB index setup notice: {idx_err}")
    except Exception as e:
        logger.warning(f"MongoDB connection notice: {e}")

async def close_mongo_connection():
    if db.client is not None:
        try:
            db.client.close()
            print("Closed MongoDB connection")
        except Exception:
            pass
