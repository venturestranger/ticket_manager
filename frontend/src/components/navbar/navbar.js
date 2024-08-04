import { apiUrl, apiToken, apiHeaders, cookiesExpirationDays } from '../../config.js'
import { Link } from 'react-router-dom';
import axios from 'axios'
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { useNavigate, useLocation } from 'react-router-dom'
import { jwtDecode } from 'jwt-decode'
import eventsMenuIcon from '../../media/eventsMenuIcon.svg';
import queuesMenuIcon from '../../media/queuesMenuIcon.svg';
import historyMenuIcon from '../../media/historyMenuIcon.svg';


function Navbar() {
	const navigate = useNavigate()
	const location = useLocation();

	const callAlert = (msg, level) => {
		localStorage.setItem('msg', msg)
		localStorage.setItem('level', level)

		if (location.pathname == '/info')
			navigate('/info_')
		else
			navigate('/info')
	}

	const logIn = (email) => {
		axios.post(`${apiUrl}/init_sess`, { mail: email }, { withCredentials: true, headers: apiHeaders })
		.then(resp => {
			localStorage.setItem('user_id', resp.data.user_id)
			callAlert('200. You have successfully logged in.', 'success')
		})
		.catch(err => {
				if (err.response.status == 403) {
					callAlert('403. Use your NU email.', 'error')
				} else {
					callAlert(`${err.response.status}. Something went wrong. Contact the administrator.`, 'error')
				}
		})
	}

	return (
		<nav className='navbar fixed-bottom navbar-expand-sm navbar-light bg-light d-flex justify-content-around pt-3'>
			<Link className='nav-link text-black d-flex flex-column align-items-center' to='/'>
				<img style={{opacity: location.pathname == '/' ? 1 : 0.4, width: '30px'}} src={eventsMenuIcon}/>
				<p style={{opacity: location.pathname == '/' ? 1 : 0.4, height: '10px'}}>Events</p>
			</Link>
			<Link className='nav-link text-black d-flex flex-column align-items-center' to='/queues'>
				<img style={{opacity: location.pathname == '/queues' ? 1 : 0.4, width: '30px'}} src={queuesMenuIcon}/>
				<p style={{opacity: location.pathname == '/queues' ? 1 : 0.4, height: '10px'}}>Queues</p>
			</Link>
			<Link className='nav-link text-black d-flex flex-column align-items-center' to='/history'>
				<img style={{opacity: location.pathname == '/history' ? 1 : 0.4, width: '30px'}} src={historyMenuIcon}/>
				<p style={{opacity: location.pathname == '/history' ? 1 : 0.4, height: '10px'}}>History</p>
			</Link>
		</nav>
	)
}

export default Navbar
