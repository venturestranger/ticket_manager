from fastapi import FastAPI, Request, Response, UploadFile
from fastapi.responses import Response
from fastapi.middleware.cors import CORSMiddleware
from handlers import QueueViewV1, OrderViewV1, EventViewV1, HostViewV1, BannerViewV1
from handlers import auth_handler_v1, init_queue_handler_v1, book_place_handler_v1, init_session_handler_v1, list_queues_handler_v1, fetch_host_handler_v1, fetch_taken_seats_handler_v1, validate_payload_handler_v1, remove_by_field_handler_v1, fetch_joined_events_v1, list_bookings_handler_v1, fetch_time_handler_v1
from middlewares import auth_middleware_v1
from utils import QueueV1, OrderV1, EventV1, HostV1, InitSessionRequestV1, BookRequestV1, InitQueueRequestV1
from utils import config


# intialize the app (root) and api (might be versioned)
app = FastAPI()
api_v1 = FastAPI()
api_etc_v1 = FastAPI()


# define API endpoints for V1 version
# QUEUE endpoints
@api_v1.get('/queue')
async def queue_get_v1(id: str = None, limit: int = None, skip: int = None, all: bool = False):
	return await QueueViewV1.get(id, limit, skip, all)

@api_v1.post('/queue')
async def queue_post_v1(note: QueueV1):
	return await QueueViewV1.post(note)

@api_v1.put('/queue')
async def queue_put_v1(id: str, note: QueueV1):
	return await QueueViewV1.put(id, note)

@api_v1.delete('/queue')
async def queue_delete_v1(id: str):
	return await QueueViewV1.delete(id)

# ORDER endpoints
@api_v1.get('/order')
async def order_get_v1(id: str = None, limit: int = None, skip: int = None, all: bool = False):
	return await OrderViewV1.get(id, limit, skip, all)

@api_v1.post('/order')
async def order_post_v1(note: OrderV1):
	return await OrderViewV1.post(note)

@api_v1.put('/order')
async def order_put_v1(id: str, note: OrderV1):
	return await OrderViewV1.put(id, note)

@api_v1.delete('/order')
async def order_delete_v1(id: str):
	return await OrderViewV1.delete(id)

# EVENT endpoints
@api_v1.get('/event')
async def event_get_v1(id: str = None, limit: int = None, skip: int = None, all: bool = False):
	return await EventViewV1.get(id, limit, skip, all)

@api_v1.post('/event')
async def event_post_v1(note: EventV1):
	return await EventViewV1.post(note)

@api_v1.put('/event')
async def event_put_v1(id: str, note: EventV1):
	return await EventViewV1.put(id, note)

@api_v1.delete('/event')
async def event_delete_v1(id: str):
	return await EventViewV1.delete(id)

# HOST endpoints
@api_v1.get('/host')
async def host_get_v1(id: str = None, limit: int = None, skip: int = None, all: bool = False):
	return await HostViewV1.get(id, limit, skip, all)

@api_v1.post('/host')
async def host_post_v1(note: HostV1):
	return await HostViewV1.post(note)

@api_v1.put('/host')
async def host_put_v1(id: str, note: HostV1):
	return await HostViewV1.put(id, note)

@api_v1.delete('/host')
async def host_delete_v1(id: str):
	return await HostViewV1.delete(id)

# BANNER (File manager) endpoints
@api_v1.get('/banner')
async def banner_get_v1(id: str = None, limit: int = None, skip: int = None):
	return await BannerViewV1.get(id, limit, skip)

@api_v1.post('/banner')
async def banner_post_v1(file: UploadFile):
	return await BannerViewV1.post(file)

@api_v1.delete('/banner')
async def banner_delete_v1(id: str):
	return await BannerViewV1.delete(id)

# SECURITY endpoints
@api_v1.get('/auth')
async def _auth_handler_v1(key: str = None):
	return await auth_handler_v1(key)

# other endpoints
@api_v1.post('/init_queue')
async def _init_queue_handler_v1(request: InitQueueRequestV1, response: Response):
	return await init_queue_handler_v1(request, response)

@api_v1.post('/book_place')
async def _book_place_handler_v1(request: BookRequestV1, response: Response):
	return await book_place_handler_v1(request, response)

@api_v1.post('/init_sess')
async def _init_session_handler_v1(request: InitSessionRequestV1, response: Response):
	return await init_session_handler_v1(request, response)

@api_v1.get('/list_queues')
async def _list_queues_handler_v1(user_id: str, response: Response):
	return await list_queues_handler_v1(user_id, response)

@api_v1.get('/list_bookings')
async def _list_bookings_handler_v1(user_id: str, response: Response):
	return await list_bookings_handler_v1(user_id, response)

@api_v1.get('/fetch_host')
async def _fetch_host_handler_v1(name: str, response: Response):
	return await fetch_host_handler_v1(name, response)

@api_v1.get('/fetch_taken_seats')
async def _fetch_taken_seats_handler_v1(event_id: str, response: Response):
	return await fetch_taken_seats_handler_v1(event_id, response)

@api_v1.post('/validate_payload')
async def _validate_payload_handler_v1(hashed_payload: str, request: Request, response: Response):
	return await validate_payload_handler_v1(hashed_payload, request, response)

@api_v1.get('/remove_by_field')
async def _remove_by_field_handler_v1(collection: str, field: str, value: str):
	return await remove_by_field_handler_v1(collection, field, value)

@api_v1.get('/fetch_joined_events')
async def _fetch_joined_events_v1(user_id: str, response: Response):
	return await fetch_joined_events_v1(user_id, response)

# Non-secured (etc) endpoints V1
@api_etc_v1.get('/fetch_time')
async def _fetch_time_handler_v1():
	return fetch_time_handler_v1()


# ensuring CORS policy supported
api_v1.add_middleware(
	CORSMiddleware,
	allow_origins=['http://localhost:3000'],
	allow_credentials=True,
	allow_methods=['*'],
	allow_headers=['*']
)

# ensuring api versioning
app.mount('/api/rest/v1/', api_v1)
app.mount('/api/etc/v1/', api_etc_v1)

# ensuring connection validation by JWT tokens
@api_v1.middleware('http')
async def _auth_middleware_v1(request: Request, handler):
	return await auth_middleware_v1(request, handler)


# entry points depending on whether python or process manager launches the program
if __name__ == '__main__':
	import uvicorn 
	uvicorn.run(app, host=config.HOST, port=config.PORT)

def app_factory() -> FastAPI:
	return app
