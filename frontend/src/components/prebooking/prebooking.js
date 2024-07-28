import { useState, useEffect } from 'react'
import { apiUrl, apiToken, apiHeaders, cookiesExpirationDays, bookingRefreshPageTime } from '../../config.js'
import { useParams, useNavigate } from 'react-router-dom'
import { formatTime } from '../../utils.js'
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
	const [takenSeats, setTakenSeats] = useState({})
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
			// required to check if only admins have an access
			if (resp.data.hash != hash) {
				callAlert('403. The access can be acquired only by admins.', 'error')
			}

			setHostName(resp.data.host)

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
			setTakenSeats(resp.data)
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
			for (const el in takenSeats) {
				axios.post(`${apiUrl}/order`, {
					event_id: event_id,
					user_id: takenSeats[el][0],
					place_id: el,
					timestamp: takenSeats[el][1] == null ? Date.now() / 1000 : takenSeats[el][1]
				}, { headers: apiHeaders })
			}
		})
		.catch(err => {
			callAlert(`${err.response.status}. Something went wrong. Contact the administrator.`, 'error')
		})
		callAlert('200. Your have prebooked seats.', 'success')
	}

	return (
		<div className='container'>
			<br/>

			<h1 className='mt-5 ms-2'>⊗ Prebooking:</h1>

			<div className='container mt-4 d-flex flex-column justify-content-between'>
				<p>Floor:</p>
				<div className='btn-group' role='group'>
				{
					Array(host.floors).fill().map((_, index) => (
						<button onClick={ () => changeFloor(index) } type='button' className={ selectedFloor == index ? 'btn btn-primary' : 'btn btn-secondary' }>{ index + 1 }</button>
					))
				}
				</div>
			</div>

			<div className='container mt-3 d-flex flex-column justify-content-start'>
				<p>Section:</p>
				<div>
				{
					host.sections[selectedFloor].map((name, index) => (
						<button onClick={ () => setSelectedPart(name) } type='button' className={ selectedPart == name ? 'btn btn-primary me-1' : 'btn btn-secondary  me-1' }>{ name }</button>
					))
				}
				</div>
			</div>

			<br/>
			<hr/>

			<div className='container mt-4 d-flex flex-column'>
				<p>Seats:</p>
			{
				host[`map_${selectedFloor}_${selectedPart}`].map((seats, row) => (
					<>
						<div className='btn-group' role='group'>
						{
							Array(seats).fill().map((_, col) => (
								<button style={{ fontSize: 10, padding: 3 }} onClick={ () => {
									if (takenSeats.hasOwnProperty(`${hostName}_${selectedFloor}_${selectedPart}_${row}_${col}`) == false) {
										const buf = {...takenSeats}
										buf[`${hostName}_${selectedFloor}_${selectedPart}_${row}_${col}`] = ['admin', Date.now() / 1000]

										setTakenSeats(buf) 
									} else {
										const buf = {...takenSeats}
										delete buf[`${hostName}_${selectedFloor}_${selectedPart}_${row}_${col}`]

										setTakenSeats(buf) 
									}
								}} type='button' className={ ( takenSeats[`${hostName}_${selectedFloor}_${selectedPart}_${row}_${col}`] == undefined ? 'btn btn-secondary' : takenSeats[`${hostName}_${selectedFloor}_${selectedPart}_${row}_${col}`][0] == 'admin' ? 'btn btn-primary' : 'btn btn-dark') + ' border' }>{ takenSeats.hasOwnProperty(`${hostName}_${selectedFloor}_${selectedPart}_${row}_${col}`) ? 'x' : '_' }</button>
							))
						}
						</div>
					</>
				))
			}

			<p className='mt-2'>Stage ↓</p>
			</div>

			<div className='container'>
				<button style={{width: '100%', fontSize: 22}} className='mt-4 mb-5 btn btn-danger' onClick={ prebookSeats }> Prebook </button>
			</div>

			<br/>
			<br/>
			<br/>
			<br/>
		</div>
	)
}

export default Prebooking
