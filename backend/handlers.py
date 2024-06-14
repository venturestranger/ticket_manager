from utils import QueueV1, OrderV1, EventV1
from utils import DBDriverV1 as ddr1
from utils import config, get_random_name
from fastapi.responses import Response, FileResponse, StreamingResponse
import jwt
import os


# define views for API V1 endpoints
class QueueViewV1:
	@staticmethod
	async def get(id: str, limit: int, skip: int, all: bool):
		note = await ddr1.find_by_id(id, limit, skip, all, 'queue')
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
		note = await ddr1.find_by_id(id, limit, skip, all, 'order')
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
		note = await ddr1.find_by_id(id, limit, skip, all, 'event')
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
			"""
			return FileResponse(config.STORAGE_DIR + id, media_type='application/' + id.split()[-1], filename=id)
			"""

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


# define handler for other endpoints
async def auth_handler_v1(key: str):
	if key == config.API_SECRET_KEY:
		payload = {
			'iss': config.TOKEN_ISSUER
		}
		auth_token = jwt.encode(payload, config.TOKEN_SECRET_KEY, algorithm='HS256')

		return auth_token
	else:
		return Response(content='Forbidden', status_code=403)
