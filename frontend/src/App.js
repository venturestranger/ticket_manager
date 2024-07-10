import { useState, useEffect } from 'react'
import { apiUrl, apiToken, apiHeaders, cookiesExpirationDays } from './config.js'
import { formatTime } from './utils.js'
import Cookies from 'js-cookie'
import logo from './logo.svg'
import axios from 'axios'
import styles from './App.module.css'


function App() {
	const [events, setEvents] = useState([])
	const [expanded, setExpanded] = useState(-1)
	const [token, setToken] = useState(-1)

	useEffect(() => {
		axios.get(`${apiUrl}/event?limit=100`, { headers: apiHeaders })
		.then(resp => {
			setEvents(resp.data)
			// console.log(Cookies.get('${}'))
		})
		.catch(err => {
			console.log(err)
		})
	}, [])

	const expand = (index) => {
		if (expanded == index) 
			setExpanded(-1)
		else
			setExpanded(index)
	}

	const initQueue = (id) => {
		axios.get(`${apiUrl}/init_queue?event_id=${id}`, { withCredentials: true, headers: apiHeaders })
		.then(resp => {
			console.log(resp)
		})
		.catch(err => {
			console.log(err)
		})
	}

	const logIn = () => {
		axios.post(`${apiUrl}/init_sess`, { mail: 'bogdan' }, { withCredentials: true, headers: apiHeaders })
		.then(resp => {
			Cookies.set('user_id', resp.data.user_id, { expires: cookiesExpirationDays })
		})
		.catch(err => {
			console.log(err)
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
								<p>Registration opens on { formatTime(item.queue_start_time) }</p>
								<p>Registration closes on { formatTime(item.queue_finish_time) }</p>
								<button disabled={ !(Date.now() / 1000 > item.queue_start_time && Date.now() / 1000 < item.queue_finish_time) } onClick={ () => initQueue(item._id) }> Take queue </button>
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

			<nav className="navbar fixed-bottom navbar-expand-sm navbar-light bg-dark justify-content-around">
				<a className="nav-link text-white" href="#">
					<i className="bi bi-house-fill"></i> Home
				</a>
				<button onClick={ () => logIn() }>
					log in
				</button>
			</nav>
		</div>
	)
}

export default App
