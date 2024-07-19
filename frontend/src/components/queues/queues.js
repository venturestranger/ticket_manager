import { useState, useEffect } from 'react'
import { apiUrl, apiToken, apiHeaders, cookiesExpirationDays, queuesRefreshPageTime } from '../../config.js'
import { useNavigate } from 'react-router-dom'
import { formatTime } from '../../utils.js'
import Navbar from '../../components/navbar/navbar.js'
import Cookies from 'js-cookie'
import logo from '../../logo.svg'
import axios from 'axios'


function Queues() {
	const [queues, setEvents] = useState([])
	const [token, setToken] = useState(-1)
	const [timer, setTimer] = useState(0)
	const user_id = Cookies.get('user_id')
	const navigate = useNavigate()

	useEffect(() => {
		const intervalId = setInterval(() => {
			setTimer(prevTimer => prevTimer + 1)
		}, queuesRefreshPageTime)

		axios.get(`${apiUrl}/list_queues?user_id=${user_id}&limit=1000000`, { headers: apiHeaders })
		.then(resp => {
			// console.log(resp.data)
			setEvents(resp.data)
		})
		.catch(err => {
			if (err.response.status == 401) {
				localStorage.setItem('msg', '403. Your site session has expired. Reload the page.')
				localStorage.setItem('level', 'error')
				navigate('/info')
			} else if (err.response.status == 403) {
				localStorage.setItem('msg', '403. You are unauthorized or your login session has expired. Authorize using "Log In" button below.')
				localStorage.setItem('level', 'error')
				navigate('/info')
			} else {
				localStorage.setItem('msg', `${err.response.status}. Something went wrong. Contact the administrator.`)
				localStorage.setItem('level', 'error')
				navigate('/info')
			}
		})

		return () => clearInterval(intervalId)
	}, [timer])

	const bookPlace = (queue) => {
		Cookies.set(`${queue._id}$queue_start`, queue.start_time, { expires: cookiesExpirationDays })
		Cookies.set(`${queue._id}$queue_finish`, queue.start_finish, { expires: cookiesExpirationDays })
		navigate(`/booking/${queue.event_id}/${queue._id}`)
	}

	return (
		<div className="App">
			<h1 className='mt-3'> Events: </h1>
	
			<div className="container mt-3 mb-4">
				<div className="column">
					{	
					queues.map((item, index) => 
						<div key={ index } className="col p-4 mb-4 bg-primary">
							<h2>{ item.title }</h2>
							<h3>{ formatTime(item.queue_start) }</h3>
							<h3>{ formatTime(item.queue_finish) }</h3>
							<button disabled={ !(Date.now() / 1000 < item.queue_finish && Date.now() / 1000 > item.queue_start) } onClick={ () => bookPlace(item) }> Book </button>
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

export default Queues
