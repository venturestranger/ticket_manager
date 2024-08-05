import { useState, useEffect } from 'react'
import { apiUrl, apiToken, apiHeaders, cookiesExpirationDays, eventsRefreshPageTime } from '../../config.js'
import { formatTime, timestamp_ } from '../../utils.js'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/navbar/navbar.js'
import Cookies from 'js-cookie'
import logo from '../../logo.svg'
import axios from 'axios'


function Events() {
	const [events, setEvents] = useState([{registration_start_time: 0, queue_finish_time: 0}])
	const [expanded, setExpanded] = useState(-1)
	const [token, setToken] = useState(-1)
	const [systemMessage, setSystemMessage] = useState(undefined)
	const [systemMessageStatus, setSystemMessageStatus] = useState(undefined)
	const [joinedEvents, setJoinedEvents] = useState([])
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

		if (localStorage.getItem('user_id') != undefined) {
			axios.get(`${apiUrl}/fetch_joined_events?user_id=${localStorage.getItem('user_id')}`, { headers: apiHeaders })
			.then(resp => {
				setJoinedEvents(resp.data)
			})
			.catch(err => {

			})
		}
	}, [])

	const expand = (index) => {
		if (expanded == index) 
			setExpanded(-1)
		else
			setExpanded(index)
	}

	const initQueue = (id) => {
		axios.post(`${apiUrl}/init_queue`, { event_id: id, user_id: localStorage.getItem('user_id') }, { withCredentials: true, headers: apiHeaders })
		.then(resp => {
			setSystemMessage('You have joined the queue.')
			setSystemMessageStatus('success')
		})
		.catch(err => {
			if (err.response.status == 401) {
				callAlert('401. Your site session has expired. Reload the page.', 'error')
			} else if (err.response.status == 403 || err.response.status == 422) {
				callAlert("403. Authorize using 'Google Sign In' button above. Please, select your NU account.", 'error')
			} else if (err.response.status == 406) {
				callAlert("406. Join the queue during the specified time.", 'error')
			} else if (err.response.status == 409) {
				setSystemMessage('You have already joined this queue or booked a seat.')
				setSystemMessageStatus('danger')
			} else {
				callAlert(`${err.response.status}. Something went wrong. Contact the administrator.`, 'error')
			}
		})
	}

	return (
		<div className='container'>
			<br/>

			<h1 className='mt-5 ms-2 mb-3'>Events:</h1>

			{	
				systemMessage != undefined &&
				<div className={`alert alert-${systemMessageStatus} ms-3 me-3`}>
					<p style={{marginBottom: '0px'}}>{ systemMessage }</p>
				</div>
			}
	
			<div className='container mt-4 mb-5'>
				{
					events.length == 0 &&
					<p>No events...</p>
				}
			
				<div className='column'>
					{	
					events.map((item, index) => 
						<div key={ index } className='border border-black rounded col bg-white mb-3 p-3 shadow' onClick={ () => expand(index) }>
							{expanded == index ? (
								<>
								{
									item.banner_url != '' &&
									<img style={{width: '100%'}} alt='Banner' className='rounded mb-3' src={ item.banner_url } />
								}
								<h2>{ item.title }</h2>
								<p>{ item.description }</p>
								<hr/>
								<p>→ Registration opens on <b>{ formatTime(item.fixed_queue_start) }</b></p>
								<p>→ Registration closes on <b>{ formatTime(item.queue_finish_time) }</b></p>
								<button style={{width: '100%', fontSize: 22}} className='btn btn-primary' disabled={ (timestamp_ > item.queue_finish_time || timestamp_ < item.registration_start_time || joinedEvents.includes(item._id)) } onClick={ () => initQueue(item._id) }>Join queue</button>
								</>
							) :
								<>
								<h4>{ item.title }</h4>
								<p>Tap to see more ↓</p>
								</>
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

export default Events
