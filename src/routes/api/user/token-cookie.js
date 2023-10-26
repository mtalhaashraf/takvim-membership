//import api from '../../../serverApi'
import admin from '../../../firebase'

export function post(req, res, next) {
	const token = req.body.token.toString()
	const csrfToken = req.body.csrfToken.toString()
	// Guard against CSRF attacks.
	if (csrfToken !== 'b_D5Bhe2*7hJSmP9ZB@x2f-9jV^pUD7P-tSq_hqF') {
		//req.cookies.csrfToken
		res.status(401).send('UNAUTHORIZED REQUEST!')
		return
	}
	// Set session expiration to 5 days.
	const expiresIn = 60 * 60 * 24 * 5 * 1000
	const options = {
		maxAge: expiresIn,
		httpOnly: true,
		secure: process.env.NODE_ENV === 'development' ? false : true
	}
	res.cookie('__user_token', token, options)
	res.sendStatus(200)
	/* api.user
		.getById(uid)
		.then((doc) => {
			const data = doc.data()
			const options = {
				maxAge: expiresIn,
				httpOnly: true,
				secure: process.env.NODE_ENV === 'development' ? false : true
			}
			res.cookie('__user_data', JSON.stringify(data), options)
			res.sendStatus(200)
		})
		.catch((err) => res.status(401).send('UNAUTHORIZED REQUEST!')) */
}
