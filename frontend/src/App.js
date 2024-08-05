import { useState, useEffect } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { apiUrl, apiToken, apiHeaders, timeRefresh } from './config.js'
import { formatTime, fetchUtcTimestamp } from './utils.js'
import Events from './components/events/events.js'
import Header from './components/header/header.js'
import Navbar from './components/navbar/navbar.js'
import Queues from './components/queues/queues.js'
import History from './components/history/history.js'
import Booking from './components/booking/booking.js'
import Prebooking from './components/prebooking/prebooking.js'
import Info from './components/info/info.js'
import Cookies from 'js-cookie'
import logo from './logo.svg'
import axios from 'axios'


function App() {
	const [timer, setTimer] = useState(0)

	useEffect(() => {
		fetchUtcTimestamp()

		const intervalId = setInterval(() => {
			setTimer(prevTimer => prevTimer + 1)
		}, timeRefresh)

		return () => clearInterval(intervalId)
	}, [timer])

	return (
		<BrowserRouter>
		<Header />
		
		<Routes>
			<Route path="*" element={<Events />} />
			<Route index path="/" exact element={<Events />} />
			<Route path="/queues" element={<Queues />} />
			<Route path="/history" element={<History />} />
			<Route path="/booking/:event_id/:queue_id" element={<Booking />} />
			<Route path="/prebooking/:event_id/:hash" element={<Prebooking />} />
			<Route path="/info" element={<Info />} />
			<Route path="/info_" element={<Info />} />
		</Routes>

		<Navbar/>
		</BrowserRouter>
	)
}

export default App
