from pydantic import BaseModel
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient


# define request models
class Queue(BaseModel):
	event_id: str
	user_id: str
	queue_start: datetime
	queue_finish: datetime


class Order(BaseModel):
	event_id: str
	user_id: str
	place_id: str


class Event(BaseModel):
	banner_url: str
	description: str
	title: str


# define MongoDB driver functionality
