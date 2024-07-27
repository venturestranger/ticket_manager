const apiUrl = 'http://0.0.0.0:6875/api/rest/v1'
const apiToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzb21lIGlzc3VlciJ9.ueC-Lv6HPeyCGKPWj-JFLWGtGF3Pr_zuHkysU9gONPE'
const apiKey = 'api'
const apiHeaders = {
	'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzb21lIGlzc3VlciJ9.ueC-Lv6HPeyCGKPWj-JFLWGtGF3Pr_zuHkysU9gONPE',
	'ngrok-skip-browser-warning': '*'
}
const cookiesExpirationDays = 1
const bookingRefreshPageTime = 1000
const queuesRefreshPageTime = 5000
const googleOAuthId = '603878420078-g9ak0nsf757penkli6t0pb7v9ut92gle.apps.googleusercontent.com'

export { apiUrl, apiToken, apiHeaders, cookiesExpirationDays, bookingRefreshPageTime, queuesRefreshPageTime }
