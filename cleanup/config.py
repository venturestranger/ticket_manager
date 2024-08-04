# define base config class
class Config:
	MONGO_DSN = 'mongodb://localhost:27017'
	DB_NAME = 'table'
	CLEANUP_SLEEP = 5
	DISCARDED_QUEUE_LIFETIME = 21600
	HISTORY_ITEM_LIFETIME = 2592000
