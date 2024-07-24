import { useState, useEffect } from 'react'
import { apiUrl, apiToken, apiHeaders, cookiesExpirationDays } from '../../config.js'
import { formatTime } from '../../utils.js'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/navbar/navbar.js'
import Cookies from 'js-cookie'
import logo from '../../logo.svg'
import axios from 'axios'


function Events() {
	const [events, setEvents] = useState([])
	const [expanded, setExpanded] = useState(-1)
	const [token, setToken] = useState(-1)
	const [systemMessage, setSystemMessage] = useState(undefined)
	const navigate = useNavigate()

	const callAlert = (msg, level) => {
		localStorage.setItem('msg', msg)
		localStorage.setItem('level', level)
		navigate('/info')
	}

	useEffect(() => {
		axios.get(`${apiUrl}/event?limit=1000000`, { headers: apiHeaders })
		.then(resp => {
			setEvents(resp.data)
		})
		.catch(err => {
			callAlert(`${err.response.status}. Something went wrong. Contact the administrator.`, 'error')
		})
	}, [])

	const expand = (index) => {
		if (expanded == index) 
			setExpanded(-1)
		else
			setExpanded(index)
	}

	const initQueue = (id) => {
		axios.post(`${apiUrl}/init_queue`, { event_id: id, user_id: Cookies.get('user_id') }, { withCredentials: true, headers: apiHeaders })
		.then(resp => {
			// console.log(resp.data)
			setSystemMessage('You have registered in the queue.')
		})
		.catch(err => {
			if (err.response.status == 401) {
				callAlert('403. Your site session has expired. Reload the page.', 'error')
			} else if (err.response.status == 403) {
				callAlert('403. Authorize using "Log In" button below.', 'error')
			} else if (err.response.status == 409) {
				callAlert('409. You have either already registered in the queue or booked a seat.', 'error')
			} else {
				callAlert(`${err.response.status}. Something went wrong. Contact the administrator.`, 'error')
			}
		})
	}

	return (
		<div className="App">
			<h1 className='mt-3'> Events: </h1>
			<h1> { systemMessage } </h1>
	
			<div className="container mt-3 mb-4">
				<div className="column">
					{	
					events.map((item, index) => 
						<div key={ index } className="col p-4 mb-4 bg-primary" onClick={ () => expand(index) }>
							{expanded == index ? (
								<>
								<img src={ item.banner_url } />
								<h2>{ item.title }</h2>
								<p>{ item.description }</p>
								<p>Registration opens on { formatTime(item.registration_start_time) }</p>
								<p>Registration closes on { formatTime(item.queue_start_time) }</p>
								<button disabled={ !(Date.now() / 1000 < item.queue_start_time && Date.now() / 1000 > item.registration_start_time) } onClick={ () => initQueue(item._id) }> Take queue </button>
								</>
							) :
								<h2>{ item.title }</h2>
							}
						</div>
					)
					}
				</div>
			</div>

			<br/>
			<br/>

			<Navbar/>
		</div>
	)
}

export default Events
