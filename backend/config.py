# define base config class
class Config:
	HOST = '0.0.0.0'
	PORT = 6875
	MONGO_DSN = ''
	DB_NAME = ''
	STORAGE_DIR = './storage/'
	RANDOM_NAME_LENGTH = 32
	STREAM_FILE_CHUNK = 4 * 1024 # 4KB - streaming file package length limit
	API_SECRET_KEY = ''
	API_ADMIN_SECRET_KEY = ''
	TOKEN_SECRET_KEY = ''
	TOKEN_ISSUER = ''
	TOKEN_EXPIRATION = 36000
	AUTH_SKIP = True
	INFINITE_COOKIE_EXPIRATION = 100000000
	COOKIE_EXPIRATION = 36000
	COOKIE_SECURE = False
	EMAIL_LOGIN = ''
	EMAIL_PASSWORD = ''
	EMAIL_SUBJECT = 'Regarding seat booking'
	EMAIL_BOOKING_MESSAGE_TEMPLATE = "You have successfully booked a seat for an upcoming event.\n\nHere's everything you need to know about getting an event pass:\n\n"
	EMAIL_QUEUE_MESSAGE_TEMPLATE = "We are happy to let you know that you've successfully joined the queue for the upcoming event. Please make sure to be online at the given time to reserve your seat:\n\n"
	EMAIL_QUEUE_MESSAGE_TEMPLATE_1 = '\n\n\n* If YOU MISS the time, your place in the queue will be DISCARDED, but you will be able to REBOOK later.'
	DAILY_QUEUE_TIMESPAN = [5, 17] # from 5:00 GMT to 17:00 GMT
	EMAIL_DOMAIN = '@nu.edu.kz'
	ENCRYPTING_ALGORITHM = ''
	TIME_API_URL = ''


# define development config
class Dev(Config):
	AUTH_SKIP = True


# define production config (enables client authentication via tokens)
class Prod(Config):
	AUTH_SKIP = False


configs = {
	'dev': Dev,
	'prod': Prod,

	'default': Prod
}
