from config import Config
from datetime import timezone
import datetime
import pymongo
from bson import ObjectId
import pandas as pd
from pandas import DataFrame, ExcelWriter
import jwt


# intialize configuration file
config = Config


# format the timestamp date object
def convert_timestamp(timestamp):
	date_object = datetime.datetime.utcfromtimestamp(timestamp)
	return date_object.strftime('%Y-%m-%d %H:%M:%S')


# define token generator
def generate_token(**kargs):
	payload = {
		'iss': config.TOKEN_ISSUER,
		'data': {
		}
	}

	# build up a payload
	for key, value in kargs.items():
		payload['data'].update({key: value})

	# generate the JWT token
	token = jwt.encode(payload, config.TOKEN_SECRET_KEY, algorithm='HS256')
	return token


# define MongoDB driver functionality (copy-pasted from backend)
class DBDriverV1:
	@staticmethod
	def find(collection: str = None, limit: int = None, skip: int = None, id: str = None):
		client = pymongo.MongoClient(config.MONGO_DSN)
		coll = client[config.DB_NAME][collection]

		if id != None:
			object_id = ObjectId(id)
			ret = coll.find_one({'_id': object_id})

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

	@staticmethod
	def remove_by_params(collection: str, **params):
		client = pymongo.MongoClient(config.MONGO_DSN)
		coll = client[config.DB_NAME][collection]

		coll.delete_many(params)

	@staticmethod
	async def reset_by_ref_id(ref_id: str, counter:str, collection: str, value):
		client = pymongo.MongoClient(config.MONGO_DSN)
		coll = client[config.DB_NAME][collection]
		
		doc = coll.find_one_and_update({'ref_id': ref_id}, {'$set': {counter: value}}, upsert=True, new=True)

		return doc


# define functions to convert mongo db data to xlsx
def fetch_seats_xlsx(event_id: str):
	client = pymongo.MongoClient(config.MONGO_DSN)
	coll = client[config.DB_NAME]['order']
	event = DBDriverV1.find('event', id=event_id)

	fields = {'user_id': 1, 'place_id': 1, 'timestamp': 1, '_id': 0}

	data_list = []
	for document in coll.find({'event_id': event_id}, projection=fields):
		data_list.append(document)

	df = DataFrame(data_list)

	df['timestamp'] = pd.to_datetime(df['timestamp'], unit='s')
	df['place_id'] = df['place_id']

	writer = ExcelWriter(config.TEMP_DIR + 'seats_data.xlsx', engine='xlsxwriter')
	df.to_excel(writer, sheet_name='seats', index=True)
	writer.close()

	return config.TEMP_DIR + 'seats_data.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
