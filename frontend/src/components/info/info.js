import { useState, useEffect } from 'react'
import { apiUrl, apiToken, apiHeaders } from '../../config.js'
import Navbar from '../../components/navbar/navbar.js'


function Events() {
	// levels: success, info, warning, error
	const level = localStorage.getItem('level', 'info')
	const msg = localStorage.getItem('msg', '')

	return (
		<div className="App">
			{ level == 'success' ?
				<h1 className='mt-3'> { msg } </h1>
			: level == 'info' ?
				<h1 className='mt-3'> { msg } </h1>
			: level == 'warning' ? 
				<h1 className='mt-3'> { msg } </h1>
			: 
				<h1 className='mt-3'> { msg } </h1>
			}

			<Navbar/>
		</div>
	)
}

export default Events
