from fastapi import Request, Response
from utils import config
import jwt


# define middlewares
async def auth_middleware_v1(request: Request, call_next_handler):
	if config.AUTH_SKIP == True:
		return await call_next_handler(request)
	else:
		auth_token = request.headers.get('Authorization', '').split()[-1]

		try:
			payload = jwt.decode(auth_token, config.TOKEN_SECRET_KEY, algorithm='HS256')

			if payload.get('iss', None) == config.TOKEN_ISSUER:
				return await call_next_handler(request)
			else:
				return Response(content='Unauthorized', status_code=401)
		except:
			return Response(content='Unauthorized', status_code=401)
