from fastapi import Request, Response
from utils import config
import jwt


# define middlewares
async def auth_middleware_v1(request: Request, call_next_handler):
	if config.AUTH_SKIP == True:
		return await call_next_handler(request)
	elif str(request.url).split('?')[0].endswith('/auth'):
		return await call_next_handler(request)
	else:
		try:
			auth_token = request.headers.get('Authorization', '').split()[-1].strip()

			payload = jwt.decode(auth_token, config.TOKEN_SECRET_KEY, algorithms=[config.ENCRYPTING_ALGORITHM])

			if payload.get('iss', None) == config.TOKEN_ISSUER:
				return await call_next_handler(request)
			else:
				return Response(content='Unauthorized', status_code=401)
		except Exception as e:
			return Response(content='Unauthorized', status_code=401)
		
