from config import Config
from datetime import datetime, timedelta, timezone
from time import sleep
import pymongo


# function for removing all queue rows with expired queue_finish time
def remove_expired_queues():
	client = pymongo.MongoClient(Config.MONGO_DSN)
	conn = client[Config.DB_NAME]
	conn = conn['queue']

	conn.delete_many({'queue_finish': {'$lt': datetime.timestamp(datetime.utcnow().replace(tzinfo=timezone.utc))}})


if __name__ == '__main__':
	while True:
		sleep(Config.CLEANUP_SLEEP)
		remove_expired_queues()
		print(datetime.utcnow(), 'Cleanup completed')
