from utils import QueueV1, OrderV1, EventV1, SessionV1
from utils import DBDriverV1 as ddr1
from utils import config, get_random_name, generate_token, validate_token
from datetime import datetime, timedelta
from fastapi import Request
from fastapi.responses import Response, FileResponse, StreamingResponse
from utils import config
import jwt
import os


# define views for API V1 endpoints
class QueueViewV1:
	@staticmethod
	async def get(id: str, limit: int, skip: int, all: bool):
		note = await ddr1.find(id, limit, skip, all, 'queue')
		return note

	@staticmethod
	async def post(note: QueueV1):
		await ddr1.insert(note.dict(), 'queue')
		return 'OK'

	@staticmethod
	async def put(id: str, note: QueueV1):
		await ddr1.update_by_id(id, note.dict(), 'queue')
		return 'OK'

	@staticmethod
	async def delete(id: str):
		await ddr1.remove_by_id(id, 'queue')
		return 'OK'


class OrderViewV1:
	@staticmethod
	async def get(id: str, limit: int, skip: int, all: bool):
		note = await ddr1.find(id, limit, skip, all, 'order')
		return note

	@staticmethod
	async def post(note: OrderV1):
		await ddr1.insert(note.dict(), 'order')
		return 'OK'

	@staticmethod
	async def put(id: str, note: OrderV1):
		await ddr1.update_by_id(id, note.dict(), 'order')
		return 'OK'

	@staticmethod
	async def delete(id: str):
		await ddr1.remove_by_id(id, 'order')
		return 'OK'


class EventViewV1:
	@staticmethod
	async def get(id: str, limit: int, skip: int, all: bool):
		note = await ddr1.find(id, limit, skip, all, 'event')
		return note

	@staticmethod
	async def post(note: EventV1):
		await ddr1.insert(note.dict(), 'event')
		return 'OK'

	@staticmethod
	async def put(id: str, note: EventV1):
		await ddr1.update_by_id(id, note.dict(), 'event')
		return 'OK'

	@staticmethod
	async def delete(id: str):
		await ddr1.remove_by_id(id, 'event')
		return 'OK'


class BannerViewV1:
	@staticmethod
	async def get(id: str, limit: int, skip: int):
		if id == None:
			if limit == None:
				limit = 1
			if skip == None:
				skip = 0

			return os.listdir(config.STORAGE_DIR)[skip:skip + limit]
		else:
			def read_chunks():
				with open(config.STORAGE_DIR + id, 'rb') as f:
					while True:
						chunk = f.read(config.STREAM_FILE_CHUNK)

						if not chunk:
							break
						yield chunk

			return StreamingResponse(
				content=read_chunks(),
				media_type='application/octet-stream',
				headers={"Content-Disposition": f"attachment;filename={id}"}
			)

	@staticmethod
	async def post(file):
		file_name = get_random_name() + '.' + file.filename.split('.')[-1]

		with open(config.STORAGE_DIR + file_name, 'wb') as f:
			f.write(await file.read())

		return file_name

	@staticmethod
	async def delete(id: str):
		os.remove(config.STORAGE_DIR + file)
		return 'OK'


# define handlers for other endpoints
async def auth_handler_v1(key: str):
	if key == config.API_SECRET_KEY:
		payload = {
			'iss': config.TOKEN_ISSUER
			# 'exp': datetime.utcnow() + timedelta(seconds=config.TOKEN_EXPIRATION)
		}
		auth_token = jwt.encode(payload, config.TOKEN_SECRET_KEY, algorithm='HS256')

		return auth_token
	else:
		return Response(content='Forbidden', status_code=403)

# validate user in the queue for a specific event
async def init_queue_handler_v1(event_id: str, request: Request, response: Response):
	try:
		user_id = validate_token(request.cookies.get('user_id', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzb21lIGlzc3VlciIsImV4cCI6MTcxOTkxMzA0NCwiZGF0YSI6eyJtYWlsIjoiYm9nZGFuIn19.zbGzW8YZ2qNYTfLzCvCcEucZlLpBp4xl-UnadgKMrsQ'))
	except Exception as e:
		return Response(content='Not Acceptable', status_code=406)

	# check if the user has already got in the queue 
	queue_note = await ddr1.find_by_params(user_id=user_id, event_id=event_id, collection='queue')

	# check if the user has already booked a place for this event
	order_note = await ddr1.find_by_params(user_id=user_id, event_id=event_id, collection='order')
	print(queue_note, order_note)

	# don't let the user get in the queue 
	# if the user is already in the valid queue
	# or the user has already booked a place
	if len(queue_note) != 0 or len(order_note) != 0:
		return Response(content='Not Acceptable', status_code=406)
	else:
		event = await ddr1.find(id=event_id, collection='event')

		queue_duration = event.get('queue_duration', config.COOKIE_EXPIRATION)
		queue_start_time = event.get('queue_start_time', 0)
		queue_batch_size = event.get('queue_batch_size', 1)
		queue_position = await ddr1.increment_by_ref_id(event_id, 'position', 'queue_counter')

		queue_start = queue_start_time + queue_position // queue_batch_size * queue_duration
		queue_finish = queue_start + queue_duration

		await ddr1.insert({'user_id': user_id, 'event_id': event_id,'queue_start': queue_start, 'queue_finish': queue_finish}, 'queue')

		response.set_cookie(
			key=f'{event_id}$queue_start',
			value=queue_start,
			expires=config.COOKIE_EXPIRATION,
			httponly=True,
			secure=config.COOKIE_SECURE
		)
		response.set_cookie(
			key=f'{event_id}$queue_finish',
			value=queue_finish,
			expires=config.COOKIE_EXPIRATION,
			httponly=True,
			secure=config.COOKIE_SECURE
		)

		return { f'{event_id}$queue_start': queue_start, f'{event_id}$queue_finish': queue_finish }

# book a place for a user if they are in the queue
# and have requested booking in their time span
async def book_place_handler_v1(event_id: str, place_id: str, request: Request, response: Response):
	try:
		user_id = validate_token(request.cookies.get('user_id', ''))
	except:
		return Response(content='Not Acceptable', status_code=406)

	# check if the user is in the queue
	queue_note = await ddr1.find_by_params(user_id=user_id, event_id=event_id, collection='queue')

	# check if the user has already booked a place
	order_note = await ddr1.find_by_params(user_id=user_id, event_id=event_id, collection='order')

	if len(queue_note) == 0:
		queue_note = {}
	else:
		queue_note = queue_note[0]

	response.delete_cookie(f'{event_id}$queue_start')
	response.delete_cookie(f'{event_id}$queue_finish')

	# do not let the user book a place
	# if they have already done that
	# or if their queue has expired
	if len(order_note) != 0 or queue_note.get('queue_start', -1) > datetime.timestamp(datetime.utcnow()) or queue_note.get('queue_finish', -1) < datetime.timestamp(datetime.utcnow()):
		return Response(content='Not Acceptable', status_code=406)
	else:
		await ddr1.insert({'user_id': user_id, 'event_id': event_id,'place_id': place_id}, 'order')

		return 'OK'

# initialize session
async def init_session_handler_v1(session: SessionV1, response: Response):
	mail = session.mail
	token = generate_token(mail=mail)

	response.set_cookie(
		key=f'user_id',
		value=token,
		expires=config.COOKIE_EXPIRATION,
		httponly=False,
		secure=config.COOKIE_SECURE
	)

	return { 'user_id': token }

