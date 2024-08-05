import { timeDelay } from './config.js'


const months = [
	'January',
	'February',
	'March',
	'April',
	'May',
	'June',
	'July',
	'August',
	'September',
	'October',
	'November',
	'December'
]

function formatTime(timestamp) {
	const date = new Date(timestamp * 1000)
	const month = date.getMonth()
	const day = String(date.getDate()).padStart(2, '0')
	const hour = String(date.getHours()).padStart(2, '0')
	const minute = String(date.getMinutes()).padStart(2, '0')
	const second = String(date.getSeconds()).padStart(2, '0')

	const formattedDate = `${day} ${months[month]} ${hour}:${minute}:${second}`
	return formattedDate
}

var timestamp_ = 0 // current timestamp fetched from an API server
var timestamp_fetching_ = false

async function fetchUtcTimestamp() {
	if (timestamp_fetching_ == false) {
		timestamp_fetching_ = true

		fetch('http://worldtimeapi.org/api/timezone/Etc/UTC')
		.then(resp => {
			resp.json()
			.then(res => {
				timestamp_fetching_ = false
				timestamp_ = res.unixtime + timeDelay
			})
			.catch(err => {
				console.error('No access to an external time API')
				timestamp_ = Date.now() / 1000
			})
		})
		.catch(err => {
			console.error('No access to an external time API')
			timestamp_ = Date.now() / 1000
		})

		return timestamp_
	}
}

export { formatTime, fetchUtcTimestamp, timestamp_ }  
