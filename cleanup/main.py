from config import Config
from datetime import datetime, timedelta, timezone
from time import sleep
import pymongo


# function for removing all queue rows with expired queue_finish time
def remove_expired_queues():
	client = pymongo.MongoClient(Config.MONGO_DSN)
	conn = client[Config.DB_NAME]
	conn = conn['queue']

	conn.delete_many({'queue_finish': {'$lt': datetime.timestamp(datetime.utcnow().replace(tzinfo=timezone.utc) - timedelta(seconds=Config.DISCARDED_QUEUE_LIFETIME))}})

# function for removing all order rows in that were booked in far past
def clean_history():
	client = pymongo.MongoClient(Config.MONGO_DSN)
	conn = client[Config.DB_NAME]
	conn = conn['order']

	conn.delete_many({'timestamp': {'$lt': datetime.timestamp(datetime.utcnow().replace(tzinfo=timezone.utc) - timedelta(seconds=Config.HISTORY_ITEM_LIFETIME))}})


if __name__ == '__main__':
	while True:
		sleep(Config.CLEANUP_SLEEP)
		remove_expired_queues()
		clean_history()
		print(datetime.utcnow(), '- Cleanup completed')
