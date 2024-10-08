import { useState, useEffect } from 'react'
import { apiUrl, apiToken, apiHeaders, cookiesExpirationDays, queuesRefreshPageTime } from '../../config.js'
import { useNavigate } from 'react-router-dom'
import { formatTime, timestamp_ } from '../../utils.js'
import Cookies from 'js-cookie'
import logo from '../../logo.svg'
import axios from 'axios'


function Queues() {
	const [queues, setEvents] = useState([])
	const [token, setToken] = useState(-1)
	const user_id = localStorage.getItem('user_id')
	const navigate = useNavigate()

	const callAlert = (msg, level) => {
		localStorage.setItem('msg', msg)
		localStorage.setItem('level', level)
		navigate('/info')
	}

	useEffect(() => {
		axios.get(`${apiUrl}/list_queues?user_id=${user_id}&limit=1000000`, { headers: apiHeaders })
		.then(resp => {
			// console.log(resp.data)
			setEvents(resp.data.reverse())
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

	const bookPlace = (queue) => {
		Cookies.set(`${queue._id}$queue_start`, queue.queue_start, { expires: cookiesExpirationDays })
		Cookies.set(`${queue._id}$queue_finish`, queue.queue_finish, { expires: cookiesExpirationDays })
		navigate(`/booking/${queue.event_id}/${queue._id}`)
	}

	return (
		<div className='container'>
			<br/>

			<h1 className='mt-5 ms-2 mb-3'>Queues:</h1>
	
			<div className='container mt-4 mb-5'>
				{
					queues.length == 0 ?
					<p>No queues...</p>
					:
					<div className={`alert alert-warning`}>
						<p style={{marginBottom: '0px'}}>There is <b>no need to refresh the page</b> before the queue status changes...</p>
					</div>
				}

				<div className='column'>
					{	
					queues.map((item, index) => 
						<div key={ index } className='border border-black rounded col bg-white mb-3 p-3 shadow' >
							<h2>{ item.title }</h2>
							<hr/>
							<p>→ You will get an access to book a seat from <b>{ formatTime(item.queue_start) }</b> until <b>{ formatTime(item.queue_finish) }</b><br/>(your device time)</p>
							{	
								timestamp_ >= item.queue_finish ?
									<button style={{width: '100%', fontSize: 22}} className='btn btn-primary' disabled={ true } >Missed</button>
								: timestamp_ < item.queue_start ?
									<button style={{width: '100%', fontSize: 22}} className='btn btn-primary' disabled={ true } onClick={ () => bookPlace(item) }>Available soon</button>
								:
									<button style={{width: '100%', fontSize: 22}} className='btn btn-primary' disabled={ false } onClick={ () => bookPlace(item) }>Book a seat</button>
							}
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

export default Queues
