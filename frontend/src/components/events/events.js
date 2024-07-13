import { useState, useEffect } from 'react'
import { apiUrl, apiToken, apiHeaders, cookiesExpirationDays } from '../../config.js'
import { formatTime } from '../../utils.js'
import Navbar from '../../components/navbar/navbar.js'
import Cookies from 'js-cookie'
import logo from '../../logo.svg'
import axios from 'axios'


function Events() {
	const [events, setEvents] = useState([])
	const [expanded, setExpanded] = useState(-1)
	const [token, setToken] = useState(-1)

	useEffect(() => {
		axios.get(`${apiUrl}/event?limit=1000000`, { headers: apiHeaders })
		.then(resp => {
			setEvents(resp.data)
			// console.log(Cookies.get('${}'))
		})
		.catch(err => {
			// console.log(err)
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

			for (const key in resp.data) {
				Cookies.set(key, resp.data[key], { expires: cookiesExpirationDays })
			}
		})
		.catch(err => {
			// console.log(err)
		})
	}

	return (
		<div className="App">
			<h1 className='mt-3'> Events: </h1>
	
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
