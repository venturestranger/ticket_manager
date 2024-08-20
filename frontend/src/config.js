const apiUrl = 'https://nuticket.kz/api/rest/v1'
const apiToken = ''
const apiKey = ''
const apiHeaders = {
	'Authorization': 'Bearer ',
	'ngrok-skip-browser-warning': '*'
}
const apiAdminHeaders = {
	'Authorization': 'Bearer ',
	'ngrok-skip-browser-warning': '*'
}
const cookiesExpirationDays = 1
const bookingRefreshPageTime = 1000 // in millisecons
const timeDelay = 1 // in seconds
const timeRefresh = 1000 // in miliseconds
const queuesRefreshPageTime = 3000
const eventsRefreshPageTime = 3000
const googleOAuthId = ''
const timeServerAPI = 'https://nuticket.kz/api/etc/v1/fetch_time'

export { apiUrl, apiToken, apiHeaders, cookiesExpirationDays, queuesRefreshPageTime, googleOAuthId, timeDelay, timeRefresh, eventsRefreshPageTime, timeServerAPI, bookingRefreshPageTime, apiAdminHeaders }
