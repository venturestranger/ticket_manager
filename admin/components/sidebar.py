import streamlit as st


# Version 1 screen
def init_sidebar_v1():
	st.sidebar.title('☰ Menu')
	edit = st.sidebar.button('✏️ Edit', use_container_width=True)
	add = st.sidebar.button('➕ Add new', use_container_width=True)

	if edit == True:
		return '/edit_screen/list'
	if add == True:
		return '/add_new_screen'


# define here other versions
