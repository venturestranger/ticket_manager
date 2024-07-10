from components.sidebar import init_sidebar_v1
from components.edit import init_edit_screen_v1
from components.add_new import init_add_new_screen_v1

import streamlit as st 


# render status messages
for msg in st.session_state.get('msg', []):
	st.toast(msg)
st.session_state['msg'] = []

# change pwd (current screen directory) to the one chosen in the sidebar if any chosen
if (_sidebar := init_sidebar_v1()) != None:
	st.session_state['pwd'] = _sidebar

# if no pwd specified, then set to root directory
if st.session_state.get('pwd', None) == None:
	st.session_state['pwd'] = '/'


# choose screen depending on pwd
match st.session_state['pwd']:
	case '/':
		st.title('Main page')
		st.write('This is an admin panel for managing NU events.')
		st.write('To proceed with any other action, go to the sidebar')

	case '/edit_screen/list':
		if type(ret := init_edit_screen_v1(stage=0, skip=st.session_state.get('skip', 0))) == str:
			st.session_state['pwd'] = '/edit_screen/edit'
			st.session_state['event_id'] = ret
			st.rerun()
		elif type(ret) == int:
			st.session_state['pwd'] = '/edit_screen/list'
			st.session_state['skip'] = ret
			st.rerun()

	case '/edit_screen/edit':
		if (ret := init_edit_screen_v1(stage=1, id=st.session_state.get('event_id', None))) == 1:
			st.session_state['pwd'] = '/'
			st.session_state['msg'] = st.session_state.get('msg', []) + ['Done!']
			st.session_state.pop('event_id')
			st.rerun()
		elif ret == 2:
			st.session_state['pwd'] = '/'
			st.session_state['msg'] = st.session_state.get('msg', []) + ['Removed.']
			st.session_state.pop('event_id')
			st.rerun()
		elif ret == 0:
			st.session_state['pwd'] = '/'
			st.session_state['msg'] = st.session_state.get('msg', []) + ['Canceled.']
			st.session_state.pop('event_id')
			st.rerun()
		elif ret == -1:
			st.session_state['pwd'] = '/'
			st.session_state['msg'] = st.session_state.get('msg', []) + ['Error while accessing the edit page (invalid event id specified).']
			st.rerun()

	case '/add_new_screen':
		if (ret := init_add_new_screen_v1()) == 1:
			st.session_state['pwd'] = '/'
			st.session_state['msg'] = st.session_state.get('msg', []) + ['Done!']
			st.rerun()
		elif ret == 0:
			st.session_state['pwd'] = '/'
			st.session_state['msg'] = st.session_state.get('msg', []) + ['Canceled.']
			st.rerun()

	case '/upload_banner_screen':
		pass
