import { useState, useEffect } from 'react'
import { apiUrl, apiToken, apiHeaders } from '../../config.js'
import { useNavigate } from 'react-router-dom'
import { formatTime } from '../../utils.js'
import Cookies from 'js-cookie'
import logo from '../../logo.svg'
import axios from 'axios'


function History() {
	const [events, setEvents] = useState([])
	const [token, setToken] = useState(-1)
	const [timer, setTimer] = useState(0)
	const user_id = localStorage.getItem('user_id')
	const navigate = useNavigate()

	const callAlert = (msg, level) => {
		localStorage.setItem('msg', msg)
		localStorage.setItem('level', level)
		navigate('/info')
	}

	useEffect(() => {
		axios.get(`${apiUrl}/list_bookings?user_id=${user_id}&limit=1000000`, { headers: apiHeaders })
		.then(resp => {
			// console.log(resp.data)
			setEvents(resp.data)
		})
		.catch(err => {
			if (err.response.status == 401) {
				callAlert('401. Your site session has expired. Reload the page.', 'error')
			} else if (err.response.status == 403) {
				callAlert("403. Authorize using 'Google Sign In' button above. Please, select your NU account.", 'error')
			} else {
				callAlert(`${err.response.status}. Something went wrong. Contact the administrator.`, 'error')
			}
		})
	}, [])

	return (
		<div className='container'>
			<br/>

			<h1 className='mt-5 ms-2 mb-3'>History:</h1>
	
			<div className='container mt-4 mb-5'>
				{
					events.length == 0 &&
					<p>No bookings...</p>
				}

				<div className='column'>
					{	
					events.map((item, index) => 
						<div key={ index } className='border border-black rounded col bg-white mb-3 p-3 shadow' >
							<h2>{ item.loadable_place_id.split(';')[0] }</h2>
							<hr/>
							<p>→ Seat: <b>{ item.loadable_place_id.split(';')[1] }</b></p>
							<p>→ Booking date: <b>{ formatTime(item.timestamp) }</b></p>
						</div>
					)
					}
				</div>
			</div>

			<br/>
			<br/>
		</div>
	)
}

export default History
