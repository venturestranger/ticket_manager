import { useState, useEffect } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { apiUrl, apiToken, apiHeaders, cookiesExpirationDays } from './config.js'
import { formatTime } from './utils.js'
import Events from './components/events/events.js'
import Queues from './components/queues/queues.js'
import Booking from './components/booking/booking.js'
import Prebooking from './components/prebooking/prebooking.js'
import Booked from './components/booked/booked.js'
import Info from './components/info/info.js'
import Cookies from 'js-cookie'
import logo from './logo.svg'
import axios from 'axios'


function App() {
	return (
		<BrowserRouter>
		<Routes>
			<Route index path="/" exact element={<Events />} />
			<Route path="/queues" element={<Queues />} />
			<Route path="/booking/:event_id/:queue_id" element={<Booking />} />
			<Route path="/prebooking/:event_id/:hash" element={<Prebooking />} />
			<Route path="/info" element={<Info />} />
		</Routes>
		</BrowserRouter>
	)
}

export default App
