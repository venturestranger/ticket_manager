from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from handlers import QueueViewV1, OrderViewV1, EventViewV1, BannerViewV1
from utils import Queue, Order, Event


# intialize the app (root) and api (might be versioned)
app = FastAPI()
api_v1 = FastAPI()


# define API endpoints for V1 version
# QUEUE endpoints
@api_v1.get('/queue')
async def queue_get_v1():
	return 200

@api_v1.post('/queue')
async def queue_post_v1():
	return 200

@api_v1.put('/queue')
async def queue_put_v1(id: int):
	return 200

@api_v1.delete('/queue')
async def queue_delete_v1(id: int):
	return 200

# ORDER endpoints
@api_v1.get('/order')
async def order_get_v1():
	return 200

@api_v1.post('/order')
async def order_post_v1():
	return 200

@api_v1.put('/order')
async def order_put_v1(id: int):
	return 200

@api_v1.delete('/order')
async def order_delete_v1(id: int):
	return 200

# EVENT endpoints
@api_v1.get('/event')
async def event_get_v1():
	return 200

@api_v1.post('/event')
async def event_post_v1():
	return 200

@api_v1.put('/event')
async def event_put_v1(id: int):
	return 200

@api_v1.delete('/event')
async def event_delete_v1(id: int):
	return 200

# BANNER endpoints
@api_v1.get('/banner')
async def banner_get_v1(file: str):
	return 200

@api_v1.post('/banner')
async def banner_post_v1():
	return 200

@api_v1.delete('/banner')
async def banner_delete_v1(file: str):
	return 200


# ensuring api versioning
api.mount('/api/rest/v1/', api_v1)

# ensuring CORS policy supported
app.add_middleware(
	CORSMiddleware,
	allow_origins=['*'],
	allow_credentials=True,
	allow_methods=['*'],
	allow_headers=['*']
)


# entry points depending on whether python or process manager launches the program
if __name__ == '__main__':
	import uvicorn 
	uvicorn.run(app, hostgc)

def app_factory() -> FastAPI:
	return app
