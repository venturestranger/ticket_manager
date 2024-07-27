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
	const [systemMessageStatus, setSystemMessageStatus] = useState(undefined)
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
		axios.post(`${apiUrl}/init_queue`, { event_id: id, user_id: localStorage.getItem('user_id') }, { withCredentials: true, headers: apiHeaders })
		.then(resp => {
			// console.log(resp.data)
			setSystemMessage('You have joined the queue.')
			setSystemMessageStatus('success')
		})
		.catch(err => {
			if (err.response.status == 401) {
				callAlert('401. Your site session has expired. Reload the page.', 'error')
			} else if (err.response.status == 403) {
				callAlert("403. Authorize using 'Google Sign In' button above. Please select your NU account.", 'error')
			} else if (err.response.status == 409) {
				setSystemMessage('You have either already joined this queue or booked a seat.')
				setSystemMessageStatus('danger')
			} else {
				callAlert(`${err.response.status}. Something went wrong. Contact the administrator.`, 'error')
			}
		})
	}

	return (
		<div className='container'>
			<br/>

			<h1 className='mt-5 ms-2 mb-3'>☰ Events:</h1>
			
			{	
				systemMessage != undefined &&
				<div className={`alert alert-${systemMessageStatus} ms-3 me-3`}>
					<p style={{marginBottom: '0px'}}>{ systemMessage }</p>
				</div>
			}
	
			<div className='container mt-4 mb-5'>
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
								<p>→ Registration opens on <b>{ formatTime(item.registration_start_time) }</b></p>
								<p>→ Registration closes on <b>{ formatTime(item.queue_finish_time) }</b></p>
								<button style={{width: '100%', fontSize: 22}} className='btn btn-primary' disabled={ !(Date.now() / 1000 < item.queue_finish_time && Date.now() / 1000 > item.registration_start_time) } onClick={ () => initQueue(item._id) }>Join queue</button>
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
