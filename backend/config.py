# define base config class
class Config:
	HOST = '0.0.0.0'
	PORT = 6875
	MONGO_DSN = 'mongodb://localhost:27017'
	DB_NAME = 'table'
	STORAGE_DIR = './storage/'
	RANDOM_NAME_LENGTH = 32
	STREAM_FILE_CHUNK = 4 * 1024 # 4KB - streaming file package length limit
	API_SECRET_KEY = 'api'
	TOKEN_SECRET_KEY = 'some secret key'
	TOKEN_ISSUER = 'some issuer'
	TOKEN_EXPIRATION = 3600
	TOKEN_SECRET_KEY = 'some token secret key'
	AUTH_SKIP = True
	INFINITE_COOKIE_EXPIRATION = 100000000
	COOKIE_EXPIRATION = 3600
	COOKIE_SECURE = False


# define development config
class Dev(Config):
	AUTH_SKIP = True


# define production config (enables client authentication via tokens)
class Prod(Config):
	AUTH_SKIP = False


configs = {
	'dev': Dev,
	'prod': Prod,

	'default': Dev
}
