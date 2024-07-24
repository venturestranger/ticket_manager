import { useState, useEffect } from 'react'
import { apiUrl, apiToken, apiHeaders, cookiesExpirationDays, bookingRefreshPageTime } from '../../config.js'
import { useParams, useNavigate } from 'react-router-dom'
import { formatTime } from '../../utils.js'
import Navbar from '../../components/navbar/navbar.js'
import logo from '../../logo.svg'
import axios from 'axios'


function Prebooking() {
	const [host, setHost] = useState({ floors: 0, sections: [[]], map_0_0: [] })
	const [hostName, setHostName] = useState(undefined)
	const [selectedFloor, setSelectedFloor] = useState(0)
	const [selectedPart, setSelectedPart] = useState('0')
	const [floorButtons, setFloorButtons] = useState([])
	const [sectionsButtons, setSectionButtons] = useState([])
	const [seatButtons, setSeatButtons] = useState([])
	const [takenSeats, setTakenSeats] = useState(new Set([]))
	const { event_id, hash } = useParams()
	const navigate = useNavigate()

	const callAlert = (msg, level) => {
		localStorage.setItem('msg', msg)
		localStorage.setItem('level', level)
		navigate('/info')
	}

	useEffect(() => {
		// acquire event info
		axios.get(`${apiUrl}/event?id=${event_id}`, { headers: apiHeaders })
		.then(resp => {
			console.log(resp.data.hash, hash, `${apiUrl}/validate_payload?hashed_payload=${hash}`)

			// required to check if only admins have an access
			axios.post(`${apiUrl}/validate_payload?hashed_payload=${hash}`, { content: resp.data.title }, { header: apiHeaders })
			.catch(err => {
				if (err.response.status == 401) {
					callAlert('401. Your site session has expired. Reload the page.', 'error')
				} else if (err.response.status == 403) {
					callAlert('403. The access can be acquired only by admins.', 'error')
				} else {
					callAlert(`${err.response.status}. Something went wrong. Contact the administrator.`, 'error')
				}
			})

			axios.get(`${apiUrl}/fetch_host?name=${resp.data.host}`, { headers: apiHeaders })
			.then(resp => {
				setHost(resp.data)

				setSelectedFloor(0)
				setSelectedPart(resp.data.sections[0][0])
			})
			.catch(err => {
				callAlert(`${err.response.status}. Something went wrong. Contact the administrator.`, 'error')
			})
		})
		.catch(err => {
			if (err.response.status == 401) {
				callAlert('401. Your site session has expired. Reload the page.', 'error')
			} else {
				callAlert(`${err.response.status}. Something went wrong. Contact the administrator.`, 'error')
			}
		})

		axios.get(`${apiUrl}/fetch_taken_seats?event_id=${event_id}`, { headers: apiHeaders })
		.then(resp => {
			setTakenSeats(new Set(resp.data))
		})
		.catch(err => {
			callAlert(`${err.response.status}. Something went wrong. Contact the administrator.`, 'error')
		})
	}, [])

	const changeFloor = (floor) => {
		setSelectedFloor(floor)
		setSelectedPart(host.sections[0][0])
	}

	const prebookSeats = () => {
		axios.get(`${apiUrl}/remove_by_field?collection=order&field=event_id&value=${event_id}`, { headers: apiHeaders })
		.then(resp => {
			for (const el of takenSeats) {
				axios.post(`${apiUrl}/order`, {
					event_id: event_id,
					user_id: 'admin',
					place_id: el,
					timestamp: Date.now() / 1000
				}, { headers: apiHeaders })
			}
		})
		.catch(err => {
			callAlert(`${err.response.status}. Something went wrong. Contact the administrator.`, 'error')
		})
		callAlert('200. Your have prebooked seats.', 'success')
	}

	return (
		<>
			<div class="container mt-5">
				<div class="btn-group" role="group" aria-label="Basic example">
				{
					Array(host.floors).fill().map((_, index) => (
						<button onClick={ () => changeFloor(index) } type="button" class={ selectedFloor == index ? "btn btn-primary" : "btn btn-secondary" }>{ index + 1 }</button>
					))
				}
				</div>
			</div>

			<div class="container mt-5">
				<div class="btn-group" role="group" aria-label="Basic example">
				{
					host.sections[selectedFloor].map((name, index) => (
						<button onClick={ () => setSelectedPart(name) } type="button" class={ selectedPart == name ? "btn btn-primary" : "btn btn-secondary" }>{ name }</button>
					))
				}
				</div>
			</div>

			<div class="container mt-5">
			{
				host[`map_${selectedFloor}_${selectedPart}`].map((seats, row) => (
					<>
						<div class="btn-group" role="group" aria-label="Basic example">
						{
							Array(seats).fill().map((_, col) => (
								<button onClick={ () => {
									if (takenSeats.has(`seat_${selectedFloor}_${selectedPart}_${row}_${col}`) == false) {
										setTakenSeats(prv => new Set([...prv, `seat_${selectedFloor}_${selectedPart}_${row}_${col}`])) 
									} else {
										const newSeats = new Set([...takenSeats])
										newSeats.delete(`seat_${selectedFloor}_${selectedPart}_${row}_${col}`)
										setTakenSeats(newSeats) 
									}
								}} type="button" class={ takenSeats.has(`seat_${selectedFloor}_${selectedPart}_${row}_${col}`) ? "btn btn-dark" : "btn btn-secondary" }>{ takenSeats.has(`seat_${selectedFloor}_${selectedPart}_${row}_${col}`) ? "x" : "_" }</button>
							))
						}
						</div>
						<br/>
					</>
				))
			}
			</div>

			<button onClick={ prebookSeats }> Save </button>
			
			<Navbar/>
		</>
	)
}

export default Prebooking
