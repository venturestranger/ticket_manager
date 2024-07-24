import { useState, useEffect } from 'react'
import { apiUrl, apiToken, apiHeaders } from '../../config.js'


function Events() {
	// levels: success, info, warning, error
	const level = localStorage.getItem('level', 'info')
	const msg = localStorage.getItem('msg', '')
	let modifier = ''

	if (level == 'error') {
		modifier = 'danger'
	} else if (level == 'success') {
		modifier = 'success'
	} else if (level == 'info') {
		modifier = 'info'
	} else if (level == 'warning') {
		modifier = 'warning'
	}

	return (
		<div className='container'>
			<br/>
			<br/>

			<div className={ `mt-5 rounded mb-3 p-3 alert alert-${modifier}` }>
				<p className='mt-3'>{ msg }</p>
			</div>
		</div>
	)
}

export default Events
