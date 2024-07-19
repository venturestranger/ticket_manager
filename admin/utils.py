from config import Config
from datetime import timezone
import datetime
import pymongo
from bson import ObjectId


# intialize configuration file
config = Config


# format the timestamp date object
def convert_timestamp(timestamp):
	date_object = datetime.datetime.utcfromtimestamp(timestamp)
	return date_object.strftime("%Y-%m-%d %H:%M:%S")


# define MongoDB driver functionality (copy-pasted from backend)
class DBDriverV1:
	@staticmethod
	def find(collection: str = None, limit: int = None, skip: int = None, id: str = None):
		client = pymongo.MongoClient(config.MONGO_DSN)
		coll = client[config.DB_NAME][collection]

		if id != None:
			object_id = ObjectId(id)
			ret = coll.find_one({'_id': object_id, 'active': {'$ne': False}})

			if ret != None:
				ret['_id'] = str(ret['_id'])
		else:
			if skip == None:
				skip = 0
			if limit == None:
				limit = 1

			docs = coll.find({}).skip(skip).limit(limit)

			ret = []
			for doc in docs:
				doc['_id'] = str(doc['_id'])
				ret.append(doc)

		return ret
	
	@staticmethod
	def find_by_params(collection: str, **params):
		client = pymongo.MongoClient(config.MONGO_DSN)
		coll = client[config.DB_NAME][collection]

		docs = coll.find(params)

		ret = []
		for doc in docs:
			doc['_id'] = str(doc['_id'])
			ret.append(doc)

		return ret

	@staticmethod
	def insert(note: dict, collection: str):
		client = pymongo.MongoClient(config.MONGO_DSN)
		coll = client[config.DB_NAME][collection]

		coll.insert_one(note)

	@staticmethod
	def update_by_id(id: str, note: dict, collection: str):
		client = pymongo.MongoClient(config.MONGO_DSN)
		coll = client[config.DB_NAME][collection]
		object_id = ObjectId(id)

		coll.update_one({'_id': object_id}, {'$set': note})
	
	@staticmethod
	def remove_by_id(id: str, collection: str):
		client = pymongo.MongoClient(config.MONGO_DSN)
		coll = client[config.DB_NAME][collection]
		object_id = ObjectId(id)

		coll.delete_one({'_id': object_id})
