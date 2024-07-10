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

export { formatTime }  
