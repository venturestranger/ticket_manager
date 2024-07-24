import { apiUrl, apiToken, apiHeaders, cookiesExpirationDays } from '../../config.js'
import axios from 'axios'
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { useNavigate, useLocation } from 'react-router-dom'
import { jwtDecode } from 'jwt-decode'


function Header() {
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
		<div class='fixed-top container pt-2 pb-2 rounded-bottom d-flex justify-content-end bg-light'>
		<GoogleOAuthProvider clientId='603878420078-g9ak0nsf757penkli6t0pb7v9ut92gle.apps.googleusercontent.com'>
			<GoogleLogin
				buttonText=''
				onSuccess={credentialResponse => {
					const credentials = jwtDecode(credentialResponse.credential)
					localStorage.removeItem('user_id')

					if (credentials.email.endsWith('@nu.edu.kz') == true) {
						logIn(credentials.email)
					} else {
						callAlert('403. Use your NU email.', 'error')
					}
				}}
				onError={() => {
					callAlert(`Something went wrong. Contact the administrator.`, 'error')
				}}
			/>
		</GoogleOAuthProvider>
		</div>
	)
}

export default Header
