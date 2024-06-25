from pydantic import BaseModel
from datetime import datetime, timedelta
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from config import configs
import jwt
import random


# intialize config
config = configs['dev']


# define request models
class QueueV1(BaseModel):
	event_id: str
	user_id: str
	queue_start: float
	queue_finish: float
	batch_id: str


class OrderV1(BaseModel):
	event_id: str
	user_id: str
	place_id: str


class EventV1(BaseModel):
	banner_url: str
	description: str
	title: str
	queue_start_time: float
	queue_finish_time: float
	queue_duration: float
	queue_batch_size: int
	active: bool | None = False


class SessionV1(BaseModel):
	mail: str


# define utility functions
def get_random_name():
	alphabet = 'QWERTYUIOPASDFGHJKLZXCVBNMqwertyuiopasdfghjklzxcvbnm0123456789'
	return ''.join(random.choice(alphabet) for i in range(config.RANDOM_NAME_LENGTH))

# define token validator
def validate_token(token):
	try:
		payload = jwt.decode(token, config.TOKEN_SECRET_KEY, algorithms=['HS256'])
		
		if payload['iss'] != config.TOKEN_ISSUER:
			return -1
	except:
		raise Exception('Invalid token')
	else:
		return payload['data']
		

# define token generator to secure data flow
def generate_token(**kargs):
	payload = {
		'iss': config.TOKEN_ISSUER,
		'exp': datetime.utcnow() + timedelta(seconds=config.TOKEN_EXPIRATION),
		'data': {
		}
	}

	# build up a payload
	for key, value in kargs.items():
		payload['data'].update({key: value})

	# generate the JWT token
	token = jwt.encode(payload, config.TOKEN_SECRET_KEY, algorithm='HS256')
	return token

# define MongoDB driver functionality
class DBDriverV1:
	@staticmethod
	async def find(id: str, limit: int = None, skip: int = None, all: bool = False, collection: str = None):
		client = AsyncIOMotorClient(config.MONGO_DSN)
		coll = client[config.DB_NAME][collection]

		if id != None:
			object_id = ObjectId(id)
			ret = await coll.find_one({'_id': object_id, 'active': {'$ne': False}})

			if ret != None:
				ret['_id'] = str(ret['_id'])
		else:
			if skip == None:
				skip = 0
			if limit == None:
				limit = 1

			if all == False:
				docs = coll.find({
					'active': {'$ne': False}, 
					'queue_start': {'$not': {'$gt': datetime.timestamp(datetime.utcnow())}},
					'queue_finish': {'$not': {'$lt': datetime.timestamp(datetime.utcnow())}}
				}).skip(skip).limit(limit)
			else:
				docs = coll.find({}).skip(skip).limit(limit)

			ret = []
			async for doc in docs:
				doc['_id'] = str(doc['_id'])
				ret.append(doc)

		return ret
	
	@staticmethod
	async def find_by_params(collection: str, **params):
		client = AsyncIOMotorClient(config.MONGO_DSN)
		coll = client[config.DB_NAME][collection]

		docs = coll.find(params)

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
	
	@staticmethod
	async def increment_by_ref_id(ref_id: str, counter:str, collection: str):
		client = AsyncIOMotorClient(config.MONGO_DSN)
		coll = client[config.DB_NAME][collection]
		
		doc = await coll.find_one_and_update({'ref_id': ref_id}, {'$inc': {counter: 1}}, upsert=True, new=True)

		return doc.get(counter, 1)
