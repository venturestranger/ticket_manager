const apiUrl = 'https://nuticket.kz/api/rest/v1'
const apiToken = 'eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJHR1l4dVp4Yk5xamttd3RVaGhiQVBHUUJnbHZmRERwdyJ9.3clbn_l7nyIXNG_laXi9sOYwKRcbAWeVquoGRCIZN88USqXvN3MHixSEntiSs8EXPI5ylxZ4AXEAWaqrz3eEXw'
const apiKey = 'PPPLHUkFllqvliVONmEZqoePYpauInMb'
const apiHeaders = {
	'Authorization': 'Bearer eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJHR1l4dVp4Yk5xamttd3RVaGhiQVBHUUJnbHZmRERwdyJ9.3clbn_l7nyIXNG_laXi9sOYwKRcbAWeVquoGRCIZN88USqXvN3MHixSEntiSs8EXPI5ylxZ4AXEAWaqrz3eEXw',
	'ngrok-skip-browser-warning': '*'
}
const cookiesExpirationDays = 1
const bookingRefreshPageTime = 1000
const timeDelay = 1 // in seconds
const timeRefresh = 1000 // in miliseconds
const queuesRefreshPageTime = 3000
const eventsRefreshPageTime = 3000
const googleOAuthId = '603878420078-g9ak0nsf757penkli6t0pb7v9ut92gle.apps.googleusercontent.com'
const timeServerAPI = 'https://nuticket.kz/utc'

export { apiUrl, apiToken, apiHeaders, cookiesExpirationDays, bookingRefreshPageTime, queuesRefreshPageTime, googleOAuthId, timeDelay, timeRefresh, eventsRefreshPageTime, timeServerAPI }
