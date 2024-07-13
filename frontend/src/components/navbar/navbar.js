import { apiUrl, apiToken, apiHeaders, cookiesExpirationDays } from '../../config.js'
import { Link } from 'react-router-dom';
import Cookies from 'js-cookie'
import axios from 'axios'


function Navbar() {
	const logIn = () => {
		axios.post(`${apiUrl}/init_sess`, { mail: 'bogdan' }, { withCredentials: true, headers: apiHeaders })
		.then(resp => {
			Cookies.set('user_id', resp.data.user_id, { expires: cookiesExpirationDays })
			// console.log(Cookies.get('user_id'))
		})
		.catch(err => {
			// console.log(err)
		})
	}

	return (
		<nav className="navbar fixed-bottom navbar-expand-sm navbar-light bg-dark justify-content-around">
			<Link className="nav-link text-white" to="/">
				Эвенты
			</Link>
			<Link className="nav-link text-white" to="/queues">
				Очереди
			</Link>
			<button onClick={ () => logIn() }>
				log in
			</button>
		</nav>
	)
}

export default Navbar
