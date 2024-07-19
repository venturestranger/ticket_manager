import { useState, useEffect } from 'react'
import { apiUrl, apiToken, apiHeaders, cookiesExpirationDays, bookingRefreshPageTime } from '../../config.js'
import { useParams, useNavigate } from 'react-router-dom'
import { formatTime } from '../../utils.js'
import Navbar from '../../components/navbar/navbar.js'
import Cookies from 'js-cookie'
import logo from '../../logo.svg'
import axios from 'axios'


function Booking() {
	const [host, setHost] = useState({ floors: 0, sections: [[]], map_0_0: [] })
	const [selectedFloor, setSelectedFloor] = useState(0)
	const [selectedPart, setSelectedPart] = useState('0')
	const [selectedSeat, setSelectedSeat] = useState(undefined)
	const [floorButtons, setFloorButtons] = useState([])
	const [sectionsButtons, setSectionButtons] = useState([])
	const [seatButtons, setSeatButtons] = useState([])
	const [takenSeats, setTakenSeats] = useState([])
	const [timer, setTimer] = useState(0)
	const [systemMessage, setSystemMessage] = useState(undefined)
	const user_id = Cookies.get('user_id')
	const { event_id, queue_id } = useParams()
	const queue_start = Cookies.get(`${queue_id}$queue_start`)
	const queue_finish = Cookies.get(`${queue_id}$queue_finish`)
	const navigate = useNavigate()

	const revokeQeueueCookies = () => {
		Cookies.remove(`${queue_id}$queue_start`)
		Cookies.remove(`${queue_id}$queue_finish`)
	}

	const removeFromQueue = () => {
		axios.delete(`${apiUrl}/queue?id=${queue_id}`, { headers: apiHeaders })
	}

	useEffect(() => {
		const intervalId = setInterval(() => {
			setTimer(prevTimer => prevTimer + 1)
		}, bookingRefreshPageTime)

		// check if the user is logged in (cannot access from logged in)
		if (user_id == undefined) {
			// render not authorized
			revokeQeueueCookies()
			localStorage.setItem('msg', '403. Authorize using "Log In" button below.')
			localStorage.setItem('level', 'error')
			navigate('/info')
		}

		// check if the user has properly get in the queue (cannot access without registering in the queue)
		if (queue_start == undefined || queue_finish == undefined) {
			// render invalid access
			revokeQeueueCookies()
			localStorage.setItem('msg', '406. Acquire access to this page via "Queues" button below.')
			localStorage.setItem('level', 'error')
			navigate('/info')
		}

		// check if it is before the interval
		if (Date.now() / 1000 < queue_start) {
			// render not ready
			revokeQeueueCookies()
			localStorage.setItem('msg', '406. An access to this page will be given in awhile.')
			localStorage.setItem('level', 'error')
			navigate('/info')
		}

		// check if it is after the interval (remove queue if expired)
		if (Date.now() / 1000 > queue_finish) {
			revokeQeueueCookies()
			localStorage.setItem('msg', '410. Your queue time has expired.')
			localStorage.setItem('level', 'error')
			navigate('/info')
		}

		// fetch the name of the host
		axios.get(`${apiUrl}/fetch_host?name=Main hall`, { headers: apiHeaders })
		.then(resp => {
			setHost(resp.data)

			if (timer == 0) {
				setSelectedFloor(0)
				setSelectedPart(resp.data.sections[0][0])
			}
		})
		.catch(err => {
			// console.log(err)
			revokeQeueueCookies()
			localStorage.setItem('msg', `${err.response.status}. Something went wrong. Contact the administrator.`)
			localStorage.setItem('level', 'error')
			navigate('/info')
		})

		axios.get(`${apiUrl}/fetch_taken_seats?event_id=${event_id}`, { headers: apiHeaders })
		.then(resp => {
			console.log(resp.data)

			setTakenSeats(resp.data)
		})
		.catch(err => {
			// console.log(err)
			revokeQeueueCookies()
			localStorage.setItem('msg', `${err.response.status}. Something went wrong. Contact the administrator.`)
			localStorage.setItem('level', 'error')
			navigate('/info')
		})

		return () => clearInterval(intervalId)
	}, [timer])

	const changeFloor = (floor) => {
		setSelectedFloor(floor)
		setSelectedPart(host.sections[0][0])
	}

	const takeSeat = () => {
		if (selectedSeat == undefined) {
			setSystemMessage('Choose any free seat.')
		} else if (takenSeats.includes(selectedSeat) == false) {
			axios.post(`${apiUrl}/book_place`, { event_id: event_id, user_id: user_id, place_id: selectedSeat }, { headers: apiHeaders })
			.then(resp => {
				revokeQeueueCookies()
				removeFromQueue()
				localStorage.setItem('msg', '200. Your have booked a seat. You will receive a verification letter via Email. Show the letter when attending the event.')
				localStorage.setItem('level', 'success')
				navigate('/info')
			})
			.catch(err => {
				revokeQeueueCookies()
				if (err.response.status == 401) {
					localStorage.setItem('msg', '403. Your site session has expired. Reload the page.')
					localStorage.setItem('level', 'error')
					navigate('/info')
				} else if (err.response.status == 403) {
					localStorage.setItem('msg', '403. Your login session has expired. Reauthorize using the "Log In" button below.')
					localStorage.setItem('level', 'error')
					navigate('/info')
				} else if (err.response.status == 409) {
					localStorage.setItem('msg', '409. You have already booked a seat for this event. You cannot rebook a seat.')
					localStorage.setItem('level', 'error')
					navigate('/info')
				} else if (err.response.status == 406) {
					setSystemMessage('The seat is already taken.')
				} else {
					localStorage.setItem('msg', `${err.response.status}. Something went wrong. Contact the administrator.`)
					localStorage.setItem('level', 'error')
					navigate('/info')
				}
			})
		} else {
			setSystemMessage('The chosen seat is alredy taken')
		}
	}

	return (
		<>
			<h1> { systemMessage } </h1>
			<h1> { timer } </h1>
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
									if (takenSeats.includes(`seat_${selectedFloor}_${selectedPart}_${row}_${col}`) == false)
										setSelectedSeat(`seat_${selectedFloor}_${selectedPart}_${row}_${col}`) 
								}} type="button" class={ takenSeats.includes(`seat_${selectedFloor}_${selectedPart}_${row}_${col}`) ? "btn btn-dark" : `seat_${selectedFloor}_${selectedPart}_${row}_${col}` == selectedSeat ? "btn btn-primary" : "btn btn-secondary" }>{ takenSeats.includes(`seat_${selectedFloor}_${selectedPart}_${row}_${col}`) ? "x" : `seat_${selectedFloor}_${selectedPart}_${row}_${col}` == selectedSeat ? "o" : "_" }</button>
							))
						}
						</div>
						<br/>
					</>
				))
			}
			</div>

			<button onClick={ takeSeat }> Order </button>
			
			<Navbar/>
		</>
	)
}

export default Booking
