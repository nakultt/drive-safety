"""
PACER Database Layer
Async MongoDB client using Motor with collection accessors and index creation.
"""

import motor.motor_asyncio
from config import settings


# Motor async client
client = motor.motor_asyncio.AsyncIOMotorClient(settings.MONGO_URI)
db = client[settings.MONGO_DB_NAME]

# Collection accessors
violations_collection = db["violations"]
cameras_collection = db["cameras"]
vehicles_collection = db["vehicles"]


async def create_indexes():
    """Create required indexes on startup."""
    # Violations indexes
    await violations_collection.create_index("timestamp")
    await violations_collection.create_index("number_plate")
    await violations_collection.create_index("violation_type")
    await violations_collection.create_index("violation_id", unique=True)

    # Vehicles unique index
    await vehicles_collection.create_index("number_plate", unique=True)

    # Cameras unique index
    await cameras_collection.create_index("camera_id", unique=True)

    print("[DB] Indexes created successfully")


async def check_connection() -> bool:
    """Check if MongoDB connection is alive."""
    try:
        await client.admin.command("ping")
        return True
    except Exception:
        return False
