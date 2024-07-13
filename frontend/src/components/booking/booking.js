import { apiUrl, apiToken, apiHeaders, cookiesExpirationDays } from '../../config.js'
import { Link } from 'react-router-dom';
import Navbar from '../../components/navbar/navbar.js'
import Cookies from 'js-cookie'
import axios from 'axios'


function Booking() {
	return (
		<>
			<div class="container mt-5">
				<div class="btn-group" role="group" aria-label="Basic example">
					<button type="button" class="btn btn-primary">Left</button>
					<button type="button" class="btn btn-secondary">Middle</button>
					<button type="button" class="btn btn-secondary">Right</button>
				</div>
			</div>

			<div class="container mt-5">
				<div class="btn-group" role="group" aria-label="Basic example">
					<button type="button" class="btn btn-secondary">Left</button>
					<button type="button" class="btn btn-primary">Middle</button>
					<button type="button" class="btn btn-secondary">Right</button>
				</div>
			</div>
			
			<Navbar/>
		</>
	)
}

export default Booking
