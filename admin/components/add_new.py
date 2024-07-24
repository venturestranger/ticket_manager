import streamlit as st
from datetime import datetime
from datetime import timedelta
from datetime import timezone
from utils import config, generate_token
from utils import DBDriverV1 as ddr1 


# Version 1 screen
def init_add_new_screen_v1(stage=0):
	st.title('Add new')

	title = st.text_input('Title:')
	description = st.text_area('Description:')
	host = st.selectbox('Host:', ['Main hall', 'Cinema room'], index=0)
	banner_url = st.text_input('Banner URL:')
	active = st.toggle('Event is active')

	try:
		st.image(banner_url)
	except:
		pass

	st.write('---')

	registration_start_time = st.date_input('Registration start time (GMT):')
	date_start = st.date_input('Queue start time (GMT, +5 for local):')
	time_start = st.time_input('_')

	st.write('---')

	date_finish = st.date_input('Queue finish time (GMT, +5 for local):')
	time_finish = st.time_input('__')

	st.write('---')

	queue_duration = st.number_input('Queue duration (seconds):', step=1, min_value=1, max_value=100000)
	queue_batch_size = st.number_input('Queue batch size (people):', step=1, min_value=1, max_value=10000)

	queue_start_time = datetime.combine(date_start, time_start).replace(tzinfo=timezone.utc)
	queue_finish_time = datetime.combine(date_finish, time_finish).replace(tzinfo=timezone.utc)

	registration_start_time = datetime(registration_start_time.year, registration_start_time.month, registration_start_time.day).replace(tzinfo=timezone.utc)

	st.write('---')

	col1, col2 = st.columns(2)
	save = col1.button('add', use_container_width=True)
	cancel = col2.button('cancel', use_container_width=True)

	if save == True:
		ddr1.insert(collection='event', note={'title': title, 'description': description, 'banner_url': banner_url, 'queue_start_time': queue_start_time.timestamp(), 'queue_finish_time': queue_finish_time.timestamp(), 'queue_duration': queue_duration, 'queue_batch_size': queue_batch_size, 'registration_start_time': registration_start_time.timestamp(), 'host': host, 'active': active, 'hash': generate_token(content=title)})
		return 1
	elif cancel == True:
		return 0


# define here other versions
