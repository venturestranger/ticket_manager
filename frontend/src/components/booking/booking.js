import { useState, useEffect } from 'react'
import { apiUrl, apiToken, apiHeaders, cookiesExpirationDays, bookingRefreshPageTime } from '../../config.js'
import { useParams, useNavigate } from 'react-router-dom'
import { formatTime } from '../../utils.js'
import Cookies from 'js-cookie'
import logo from '../../logo.svg'
import axios from 'axios'


function Booking() {
	const [host, setHost] = useState({ floors: 0, sections: [[]], map_0_0: [] })
	const [hostName, setHostName] = useState(undefined)
	const [selectedFloor, setSelectedFloor] = useState(0)
	const [selectedPart, setSelectedPart] = useState('0')
	const [selectedSeat, setSelectedSeat] = useState(undefined)
	const [floorButtons, setFloorButtons] = useState([])
	const [sectionsButtons, setSectionButtons] = useState([])
	const [seatButtons, setSeatButtons] = useState([])
	const [takenSeats, setTakenSeats] = useState({})
	const [timer, setTimer] = useState(0)
	const [systemMessage, setSystemMessage] = useState(undefined)
	const [systemMessageStatus, setSystemMessageStatus] = useState(undefined)
	const user_id = localStorage.getItem('user_id')
	const { event_id, queue_id } = useParams()
	const queue_start = Number(Cookies.get(`${queue_id}$queue_start`))
	const queue_finish = Number(Cookies.get(`${queue_id}$queue_finish`))
	const navigate = useNavigate()

	const revokeQeueueCookies = () => {
		Cookies.remove(`${queue_id}$queue_start`)
		Cookies.remove(`${queue_id}$queue_finish`)
	}

	const removeFromQueue = () => {
		axios.delete(`${apiUrl}/queue?id=${queue_id}`, { headers: apiHeaders })
	}

	const callAlert = (msg, level) => {
		revokeQeueueCookies()
		localStorage.setItem('msg', msg)
		localStorage.setItem('level', level)
		navigate('/info')
	}

	useEffect(() => {
		const intervalId = setInterval(() => {
			setTimer(prevTimer => prevTimer + 1)
		}, bookingRefreshPageTime)

		// check if the user is logged in (cannot access from logged in)
		if (user_id == undefined) {
			// render not authorized
			callAlert('403. Authorize using "Google Sign In" button above. Please, select your NU account.', 'error')
		}

		// check if the user has properly get in the queue (cannot access without registering in the queue)
		if (queue_start == undefined || queue_finish == undefined) {
			// render invalid access
			callAlert('406. Acquire access to this page via "Queues" button below.', 'error')
		}

		// check if it is before the interval
		if (Date.now() / 1000 < queue_start) {
			// render not ready
			callAlert('406. An access to this page will be given soon.', 'error')
		}

		// check if it is after the interval (remove queue if expired)
		if (Date.now() / 1000 > queue_finish) {
			callAlert('410. Your queue time has expired.', 'error')
		}

		// fetch the name of the host (using caching also)
		if (hostName == undefined) {
			axios.get(`${apiUrl}/event?id=${event_id}`, { headers: apiHeaders })
			.then(resp => {
				setHostName(resp.data.host)

				axios.get(`${apiUrl}/fetch_host?name=${resp.data.host}`, { headers: apiHeaders })
				.then(resp => {
					setHost(resp.data)

					if (timer == 0) {
						setSelectedFloor(0)
						setSelectedPart(resp.data.sections[0][0])
					}
				})
				.catch(err => {
					// console.log(err)
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
		} else {
			axios.get(`${apiUrl}/fetch_host?name=${hostName}`, { headers: apiHeaders })
			.then(resp => {
				setHost(resp.data)

				if (timer == 0) {
					setSelectedFloor(0)
					setSelectedPart(resp.data.sections[0][0])
				}
			})
			.catch(err => {
				// console.log(err)
				callAlert(`${err.response.status}. Something went wrong. Contact the administrator.`, 'error')
			})
		}

		axios.get(`${apiUrl}/fetch_taken_seats?event_id=${event_id}`, { headers: apiHeaders })
		.then(resp => {
			// console.log(resp.data)
			setTakenSeats(resp.data)
		})
		.catch(err => {
			// console.log(err)
			callAlert(`${err.response.status}. Something went wrong. Contact the administrator.`, 'error')
		})

		return () => clearInterval(intervalId)
	}, [timer])

	const changeFloor = (floor) => {
		setSelectedFloor(floor)
		setSelectedPart(host.sections[0][0])
	}

	const formatSeat = (seat) => {
		const splited = seat.split('_')
		
		return `${splited[0]}, floor ${Number(splited[1]) + 1}, ${splited[2].toLowerCase()} section, row ${ host['map_' + selectedFloor + '_' + selectedPart].length - Number(splited[3])}, seat ${Number(splited[4]) + 1}`
	}

	const takeSeat = () => {
		if (selectedSeat == undefined) {
			setSystemMessage('Choose any free seat.')
			setSystemMessageStatus('warning')
		} else if (takenSeats.hasOwnProperty(selectedSeat) == false) {
			axios.post(`${apiUrl}/book_place`, { event_id: event_id, user_id: user_id, place_id: selectedSeat }, { headers: apiHeaders })
			.then(resp => {
				removeFromQueue()
				callAlert('200. Your have booked a seat. You will receive a verification letter via Email. Show the letter at the event.', 'success')
			})
			.catch(err => {
				if (err.response.status == 401) {
					callAlert('401. Your site session has expired. Reload the page.', 'error')
				} else if (err.response.status == 403 || err.response.status == 422) {
					callAlert('403. Your login session has expired. Reauthorize using the "Google Sign In" button above. Please, select your NU account.', 'error')
				} else if (err.response.status == 409) {
					callAlert('409. You have already booked a seat for this event. You cannot rebook a seat.', 'error')
				} else if (err.response.status == 406) {
					setSystemMessage('The chosen seat is already taken.')
					setSystemMessageStatus('warning')
				} else {
					callAlert(`${err.response.status}. Something went wrong. Contact the administrator.`, 'error')
				}
			})
		} else {
			setSystemMessage('The chosen seat is already taken.')
			setSystemMessageStatus('warning')
		}
	}

	return (
		<div className='container'>
			<br/>

			<h1 className='mt-5 ms-2'>Booking:</h1>
			{	
				systemMessage != undefined &&
				<div className={`alert alert-${systemMessageStatus} ms-3 me-3`}>
					<p style={{marginBottom: '0px'}}>{ systemMessage }</p>
				</div>
			}

			<div className='container mt-2 d-flex flex-column justify-content-between'>
				<p> { Math.ceil(queue_finish - Date.now() / 1000) } seconds left </p>

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
						<button onClick={ () => setSelectedPart(name) } type='button' className={ selectedPart == name ? 'btn btn-primary me-1 mb-1' : 'btn btn-secondary  me-1 mb-1' }>{ name }</button>
					))
				}
				</div>
			</div>

			<div className='container mt-4 d-flex flex-column'>
				<p>Seats:</p>
			{
				host[`map_${selectedFloor}_${selectedPart}`].map((seats, row) => (
					<>
						<div className='btn-group' role='group'>
						{
							Array(seats).fill().map((_, col) => (
								<button style={{ fontSize: 10, padding: 3 }} onClick={ () => {
									if (takenSeats.hasOwnProperty(`${hostName}_${selectedFloor}_${selectedPart}_${row}_${col}`) == false)
										setSelectedSeat(`${hostName}_${selectedFloor}_${selectedPart}_${row}_${col}`) 
								}} type="button" class={ (takenSeats.hasOwnProperty(`${hostName}_${selectedFloor}_${selectedPart}_${row}_${col}`) ? "btn btn-dark" : `${hostName}_${selectedFloor}_${selectedPart}_${row}_${col}` == selectedSeat ? "btn btn-primary" : "btn btn-secondary") + ' border'}>{ takenSeats.hasOwnProperty(`${hostName}_${selectedFloor}_${selectedPart}_${row}_${col}`) ? "x" : `${hostName}_${selectedFloor}_${selectedPart}_${row}_${col}` == selectedSeat ? "o" : "_" }</button>
							))
						}
						</div>
					</>
				))
			}

			<p className='mt-2'>Stage ↓</p>
			<hr/>

			<p className='mt-2'>Your seat: <b>{selectedSeat ? formatSeat(selectedSeat) : '_'}</b></p>
			</div>

			<div className='container'>
				<button  style={{width: '100%', fontSize: 22}} className='mt-4 mb-5 btn btn-danger' onClick={ takeSeat }>Book</button>
			</div>

			<br/>
			<br/>
			<br/>
			<br/>
		</div>
	)
}

export default Booking
