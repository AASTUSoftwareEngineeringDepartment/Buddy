import asyncio
from app.db.mongo import MongoDB
from app.models.settings import Settings
from datetime import datetime

async def create_missing_settings():
    # Initialize MongoDB connection
    await MongoDB.connect_to_db()
    
    try:
        # Get collections
        db = MongoDB.get_db()
        children_collection = db["children"]
        settings_collection = db["settings"]
        
        # Get all children
        children = await children_collection.find({}).to_list(length=None)
        print(f"Found {len(children)} total children")
        
        # Get all existing settings
        existing_settings = await settings_collection.find({}).to_list(length=None)
        existing_child_ids = {setting["child_id"] for setting in existing_settings}
        print(f"Found {len(existing_child_ids)} children with existing settings")
        
        # Find children without settings
        children_without_settings = [
            child for child in children 
            if child["child_id"] not in existing_child_ids
        ]
        print(f"Found {len(children_without_settings)} children without settings")
        
        # Create settings for children without settings
        for child in children_without_settings:
            settings = Settings(
                child_id=child["child_id"],
                preferences=[],
                themes=[],
                moral_values=[],
                favorite_animal=None,
                favorite_character=None,
                screen_time=0
            )
            await settings_collection.insert_one(settings.model_dump(by_alias=True))
            print(f"Created settings for child: {child['child_id']} ({child['first_name']} {child['last_name']})")
        
        print(f"Successfully created settings for {len(children_without_settings)} children")
        
    except Exception as e:
        print(f"Error: {str(e)}")
    finally:
        # Close MongoDB connection
        await MongoDB.close_db_connection()

if __name__ == "__main__":
    asyncio.run(create_missing_settings()) 