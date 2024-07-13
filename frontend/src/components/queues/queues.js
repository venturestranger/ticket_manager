import { useState, useEffect } from 'react'
import { apiUrl, apiToken, apiHeaders, cookiesExpirationDays } from '../../config.js'
import { formatTime } from '../../utils.js'
import Navbar from '../../components/navbar/navbar.js'
import Cookies from 'js-cookie'
import logo from '../../logo.svg'
import axios from 'axios'


function Queues() {
	const [queues, setEvents] = useState([])
	const [token, setToken] = useState(-1)
	const user_id = Cookies.get('user_id')

	useEffect(() => {
		axios.get(`${apiUrl}/list_queues?user_id=${user_id}&limit=1000000`, { headers: apiHeaders })
		.then(resp => {
			// console.log(resp.data)

			setEvents(resp.data)
		})
		.catch(err => {
			// console.log(err)
		})
	}, [])

	const bookPlace = (id) => {
		
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
							<button disabled={ !(Date.now() / 1000 < item.queue_finish && Date.now() / 1000 > item.queue_start) } onClick={ () => bookPlace(item._id) }> Book </button>
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
