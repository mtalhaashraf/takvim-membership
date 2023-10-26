export function post(req, res, next) {
	res.clearCookie('__session')
	res.clearCookie('__user_data')
	res.clearCookie('__user_token')
	res.sendStatus(200)
}
