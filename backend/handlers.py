from utils import QueueV1, OrderV1, EventV1, HostV1, InitSessionRequestV1, BookRequestV1, InitQueueRequestV1
from utils import DBDriverV1 as ddr1, EmailClientV1 as email1
from utils import config, get_random_name, generate_token, validate_token
from datetime import datetime, timedelta, timezone
from fastapi import Request
from fastapi.responses import Response, FileResponse, StreamingResponse
from utils import config
from json import loads
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
	

class HostViewV1:
	@staticmethod
	async def get(id: str, limit: int, skip: int, all: bool):
		note = await ddr1.find(id, limit, skip, all, 'host')
		return note

	@staticmethod
	async def post(note: HostV1):
		await ddr1.insert(note.dict(), 'host')
		return 'OK'

	@staticmethod
	async def put(id: str, note: HostV1):
		await ddr1.update_by_id(id, note.dict(), 'host')
		return 'OK'

	@staticmethod
	async def delete(id: str):
		await ddr1.remove_by_id(id, 'host')
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
			'iss': config.TOKEN_ISSUER,
			'role': 'user',
			'permissions': {
				'GET': ['fetch_time', 'fetch_joined_events', 'fetch_host', 'fetch_taken_seats', 'list_bookings', 'list_queues', 'queue', 'order', 'event', 'host', 'banner'],
				'POST': ['init_sess', 'book_place', 'init_queue', 'validate_payload'],
				'DELETE': ['queue']
			}
			# 'exp': datetime.utcnow() + timedelta(seconds=config.TOKEN_EXPIRATION)
		}
		auth_token = jwt.encode(payload, config.TOKEN_SECRET_KEY, algorithm=config.ENCRYPTING_ALGORITHM)

		return auth_token
	elif key == config.API_ADMIN_SECRET_KEY: # gives all permissions
		payload = {
			'iss': config.TOKEN_ISSUER,
			'role': 'admin'
		}
		auth_token = jwt.encode(payload, config.TOKEN_SECRET_KEY, algorithm=config.ENCRYPTING_ALGORITHM)

		return auth_token
	else:
		return Response(content='Unauthorized', status_code=401)

# validate user in the queue for a specific event
async def init_queue_handler_v1(request: InitQueueRequestV1, response: Response):
	try:
		user_id = validate_token(request.user_id)['mail']
	except Exception as e:
		return Response(content='Forbidden', status_code=403)

	# check if the user has already got in the queue 
	queue_note = await ddr1.find_by_params(user_id=user_id, event_id=request.event_id, collection='queue')

	# check if the user has already booked a place for this event
	order_note = await ddr1.find_by_params(user_id=user_id, event_id=request.event_id, collection='order')

	# fetch the event to get the title of
	event = await ddr1.find(id=request.event_id, collection='event')

	# check if an action matches the time
	current_time = datetime.timestamp(datetime.utcnow().replace(tzinfo=timezone.utc))

	if current_time < event.get('registration_start_time', 0) or current_time > event.get('queue_finish_time', 0):
		return Response(content='Not Acceptable', status_code=406)

	# don't let the user get in the queue 
	# if the user is already in the valid queue
	# or the user has already booked a place
	if len(queue_note) != 0 or len(order_note) != 0:
		return Response(content='Conflict', status_code=409)
	else:
		event = await ddr1.find(id=request.event_id, collection='event')

		queue_duration = event.get('queue_duration', config.COOKIE_EXPIRATION)
		queue_start_time = event.get('queue_start_time', 0)
		queue_batch_size = event.get('queue_batch_size', 1)
		queue_position = await ddr1.increment_by_ref_id(request.event_id, 'position', 'queue_counter')

		queue_start = queue_start_time + queue_position // queue_batch_size * queue_duration
		queue_finish = queue_start + queue_duration

		current_moment = datetime.utcnow().replace(tzinfo=timezone.utc)
		# check if now > queue_start
		if datetime.timestamp(current_moment) >= queue_start:
			queue_start = datetime.timestamp(current_moment + timedelta(seconds=queue_duration))
			queue_finish = queue_start + queue_duration

			await ddr1.update_by_id(event.get('_id'), {'queue_start_time': queue_start}, 'queue')
			await ddr1.reset_by_ref_id(request.event_id, 'position', 'queue_counter', 1)

		await ddr1.insert({'user_id': user_id, 'event_id': request.event_id,'queue_start': queue_start, 'queue_finish': queue_finish, 'title': event.get('title', None)}, 'queue')

		# send a booking notification to the email
		email1.send_booking_info(user_id, f'Event:\n {event.get("title", "_")}\n\nQueue details:\n- Start time: {datetime.fromtimestamp(queue_start).strftime("%Y-%m-%d %H:%M:%S")} GMT (+5 for Kazakhstan time)\n- End time: {datetime.fromtimestamp(queue_finish).strftime("%Y-%m-%d %H:%M:%S")} GMT (+5 for Kazakhstan time)', template='queue')

		return 'OK'

# book a place for a user if they are in the queue
# and have requested booking in their time span
async def book_place_handler_v1(request: BookRequestV1, response: Response):
	try:
		user_id = validate_token(request.user_id)['mail']
	except:
		return Response(content='Forbidden', status_code=403)

	# check if someone has already booked the place
	another_order_note = await ddr1.find_by_params(place_id=request.place_id, event_id=request.event_id, collection='order')

	# check if the user has already booked a place
	order_note = await ddr1.find_by_params(user_id=user_id, event_id=request.event_id, collection='order')

	# acquire event related information
	event_note = await ddr1.find(id=request.event_id, collection='event')

	# acquire host related information
	host_note = (await ddr1.find_by_params(name=event_note.get('host', 'Main hall'), collection='host'))[0]

	# check if an action matches the time
	current_time = datetime.timestamp(datetime.utcnow().replace(tzinfo=timezone.utc))

	# do not let the user book a place
	# if they have already done that
	if len(order_note) != 0:
		return Response(content='Conflict', status_code=409)
	elif len(another_order_note) != 0:
		return Response(content='Not Acceptable', status_code=406)
	else:
		await ddr1.insert({'user_id': user_id, 'event_id': request.event_id, 'place_id': request.place_id, 'loadable_place_id': event_note.get('title', 'Event name') + '; ' + request.loadable_place_id, 'timestamp': datetime.timestamp(datetime.utcnow().replace(tzinfo=timezone.utc))}, 'order')

		# send a booking notification to the email
		email1.send_booking_info(user_id, f'- Event:\n {event_note.get("title", "_")}\n\n- Seat:\n(location, floor, section, row, seat)\n{request.loadable_place_id}\n\n- About:\n{event_note.get("description", "_")}')

		return 'OK'

# initialize session
async def init_session_handler_v1(request: InitSessionRequestV1, response: Response):
	mail = request.mail

	if mail.endswith(config.EMAIL_DOMAIN) == True:
		token = generate_token(mail=mail)

		return { 'user_id': token }
	else:
		return Response(content='Forbidden', status_code=403)

# list queues 
async def list_queues_handler_v1(user_id: str, response: Response):
	try:
		user_id = validate_token(user_id)['mail']
	except:
		return Response(content='Forbidden', status_code=403)
	
	note = await ddr1.find_by_params(user_id=user_id, all=True, collection='queue')
	return note

# list bookings (history)
async def list_bookings_handler_v1(user_id: str, response: Response):
	try:
		user_id = validate_token(user_id)['mail']
	except:
		return Response(content='Forbidden', status_code=403)
	
	note = await ddr1.find_by_params(user_id=user_id, collection='order')
	return note

# fetch host metainformation
async def fetch_host_handler_v1(name: str, response: Response):
	host = await ddr1.find_by_params(name=name, collection='host')

	if len(host) == 0:
		return None
	else:
		return host[0]

# fetch which events user has joined
async def fetch_joined_events_v1(user_id: str, response: Response):
	try:
		user_id = validate_token(user_id)['mail']
	except:
		return Response(content='Forbidden', status_code=403)

	events = await ddr1.find_by_params(user_id=user_id, collection='order')
	queues = await ddr1.find_by_params(user_id=user_id, collection='queue')

	ret = []

	for event in events:
		ret.append(event.get('event_id', ''))
	for queue in queues:
		ret.append(queue.get('event_id', ''))
	
	return ret
	
# fetch taken seats 
async def fetch_taken_seats_handler_v1(event_id: str, response: Response):
	orders = await ddr1.find_by_params(event_id=event_id, collection='order')

	ret = {}
	for i in orders:
		if i.get('place_id', None) != None and i.get('user_id', None) != None:
			ret.update({i.get('place_id', None): [i.get('user_id', None), i.get('timestamp', None)]})

	return ret

# validate payload
async def validate_payload_handler_v1(hashed_payload: str, payload: Request, response: Response):
	try:
		validatable_payload = validate_token(hashed_payload)

		if validatable_payload == loads(await payload.body()):
			return validatable_payload
		else:
			return Response(content='Forbidden', status_code=403)
	except Exception as e:
		return Response(content='Forbidden', status_code=403)

# wipe all datapoints by field
async def remove_by_field_handler_v1(collection: str, field: str, value: str):
	await ddr1.remove_by_params(collection=collection, **{field: value})
	
	return 'OK'

# implements time API
def fetch_time_handler_v1():
	return datetime.timestamp(datetime.utcnow().replace(tzinfo=timezone.utc))
