from pydantic import BaseModel
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from config import configs
import random


# intialize config
config = configs['dev']


# define request models
class QueueV1(BaseModel):
	event_id: str
	user_id: str
	queue_start: float
	queue_finish: float


class OrderV1(BaseModel):
	event_id: str
	user_id: str
	place_id: str


class EventV1(BaseModel):
	banner_url: str
	description: str
	title: str
	active: bool | None = False


# define utility functions
def get_random_name():
	alphabet = 'QWERTYUIOPASDFGHJKLZXCVBNMqwertyuiopasdfghjklzxcvbnm0123456789'
	return ''.join(random.choice(alphabet) for i in range(config.RANDOM_NAME_LENGTH))


# define MongoDB driver functionality
class DBDriverV1:
	@staticmethod
	async def find_by_id(id: str, limit: int, skip: int, all: bool, collection: str):
		client = AsyncIOMotorClient(config.MONGO_DSN)
		coll = client[config.DB_NAME][collection]

		if id != None:
			object_id = ObjectId(id)
			ret = await coll.find_one({'_id': object_id, 'active': {'$ne': False}})
		else:
			if skip == None:
				skip = 0
			if limit == None:
				limit = 1

			if all == False:
				docs = coll.find({
					'active': {'$ne': False}, 
					'queue_start': {'$not': {'$gt': datetime.timestamp(datetime.now())}},
					'queue_finish': {'$not': {'$lt': datetime.timestamp(datetime.now())}}
				}).skip(skip).limit(limit)
			else:
				docs = coll.find({}).skip(skip).limit(limit)

			ret = []
			async for doc in docs:
				doc['_id'] = str(doc['_id'])
				ret.append(doc)

		return ret

	@staticmethod
	async def insert(note: dict, collection: str):
		client = AsyncIOMotorClient(config.MONGO_DSN)
		coll = client[config.DB_NAME][collection]

		await coll.insert_one(note)

	@staticmethod
	async def update_by_id(id: str, note: dict, collection: str):
		client = AsyncIOMotorClient(config.MONGO_DSN)
		coll = client[config.DB_NAME][collection]
		object_id = ObjectId(id)

		await coll.update_one({'_id': object_id}, {'$set': note})
	
	@staticmethod
	async def remove_by_id(id: str, collection: str):
		client = AsyncIOMotorClient(config.MONGO_DSN)
		coll = client[config.DB_NAME][collection]
		object_id = ObjectId(id)

		await coll.delete_one({'_id': object_id})
