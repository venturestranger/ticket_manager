from fastapi import Headers
from utils import config


# define middlewares
async def auth_middleware_v1(bearer: str = None):
	pass
