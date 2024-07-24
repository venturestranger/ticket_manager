import streamlit as st
from datetime import datetime
from datetime import timedelta
from datetime import timezone
from utils import config, convert_timestamp, fetch_seats_xlsx, generate_token
from utils import DBDriverV1 as ddr1 


# Version 1 screen
def list_events_v1(skip=0, limit=10):
	st.title('Events')

	data = list(ddr1.find('event', skip=skip, limit=limit))
	edited_post = None

	for idx, note in enumerate(data):
		st.info(f"""
		**{note.get('title', '_')}** is **{'Active' if note.get('active', False) else 'Inactive'}**

		{note.get('description', '_')}

		**Host**: {note.get('host', 'Main hall')}

		---

		**Registration start time**: {convert_timestamp(note.get('registration_start_time', 0))} (GMT, +5 for local)

		**Queue start time**: {convert_timestamp(note.get('queue_start_time', 0))} (GMT, +5 for local)

		**Queue finish time**: {convert_timestamp(note.get('queue_finish_time', 0))} (GMT, +5 for local)

		**Queue duration**: {int(note.get('queue_duration', 0) // 60)} minutes {int(note.get('queue_duration', 0) % 60)} seconds

		**Queue batch size**: {note.get('queue_batch_size', 0)} people
		""")

		if st.button('Edit', key=idx, use_container_width=True):
			edited_post = note.get('_id')
		st.write(' ')
	
	st.write('---')
	
	col1, col2 = st.columns(2)
	prev = col1.button('Previous 10', use_container_width=True)
	next = col2.button('Next 10', use_container_width=True)

	if prev == True:
		return max(skip - limit, 0)
	elif next == True:
		if len(data) == 0:
			return skip
		else:
			return skip + limit
	
	return edited_post


def edit_tool_v1(id):
	st.title('Edit')

	if id == None:
		return -1
	
	data = ddr1.find('event', id=id)

	title = st.text_input('Title:', value=data.get('title', ''))
	description = st.text_area('Description:', value=data.get('description', ''))
	host = st.selectbox('Host:', ['Main hall', 'Cinema room'], index=0)
	banner_url = st.text_input('Banner URL:', value=data.get('banner_url', ''))
	active = st.toggle('Event is active', value=data.get('active', False))

	try:
		st.image(banner_url)
	except:
		pass

	st.write('---')

	registration_start_time = st.date_input('Registration start time (GMT):')

	date_start = st.date_input('Queue start time (GMT, +5 for local) **(Please, DO NOT change it without any urgent necessity)**:')
	time_start = st.time_input('_')

	st.write('---')

	date_finish = st.date_input('Queue finish time (GMT, +5 for local):')
	time_finish = st.time_input('__')

	st.write('---')

	queue_duration = st.number_input('Queue duration (seconds):', value=data.get('queue_duration', 60), step=1, min_value=1, max_value=100000)
	queue_batch_size = st.number_input('Queue batch size (people):', value=data.get('queue_batch_size', 1), step=1, min_value=1, max_value=10000)

	queue_start_time = datetime.combine(date_start, time_start).replace(tzinfo=timezone.utc)
	queue_finish_time = datetime.combine(date_finish, time_finish).replace(tzinfo=timezone.utc)

	registration_start_time = datetime(registration_start_time.year, registration_start_time.month, registration_start_time.day).replace(tzinfo=timezone.utc)

	st.write('---')

	fetch = st.button('fetch booked seats', use_container_width=True)

	if fetch == True:
		doc, mime_type = fetch_seats_xlsx(data.get('_id'))

		with open(doc, 'rb') as file:
			st.download_button(
				label="download XLSX",
				data=file,
				file_name="data.xlsx",
				mime=mime_type
			)
		
	st.write('Prebooking: ' + config.PREBOOKING_WEB_PATH + data.get('_id', '_') + '/' + data.get('hash', '_'))

	st.write('---')

	col1, col2 = st.columns(2)
	save = col1.button('save', use_container_width=True)
	remove = col2.button('remove', use_container_width=True)
	cancel = st.button('cancel', use_container_width=True)

	confirm = st.checkbox('I confirm the action (for **save** and **remove**)')

	if save == True and confirm == True:
		ddr1.update_by_id(id=id, collection='event', note={'title': title, 'description': description, 'banner_url': banner_url, 'queue_start_time': queue_start_time.timestamp(), 'queue_finish_time': queue_finish_time.timestamp(), 'queue_duration': queue_duration, 'queue_batch_size': queue_batch_size, 'registration_start_time': registration_start_time.timestamp(), 'host': host, 'active': active, 'hash': generate_token(content=title)})
		return 1
	elif cancel == True:
		return 0
	elif remove == True and confirm == True:
		ddr1.remove_by_id(id=id, collection='event')
		ddr1.remove_by_params(event_id=id, collection='queue')
		ddr1.remove_by_params(event_id=id, collection='order')
		return 2


def init_edit_screen_v1(stage=0, id=None, skip=0, limit=10):
	match stage:
		case 0:
			return list_events_v1(skip=skip, limit=limit)
		case 1:
			return edit_tool_v1(id)


# define here other versions
