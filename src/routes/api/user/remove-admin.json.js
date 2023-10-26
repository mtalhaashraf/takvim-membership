import api from '../../../serverApi'
import admin from '../../../firebase'

export function post(req, res) {
	const { email, uid, token } = req.body
	admin
		.auth()
		.getUser(uid)
		.then((userRecord) => {
			if (
				(userRecord.customClaims &&
					userRecord.customClaims['admin'] &&
					userRecord.customClaims['admin'] === true) ||
				userRecord.email === 'tomas.pruha@seznam.cz'
			) {
				api.user
					.demoteFromAdmin(email)
					.then((success) => res.status(200).send({ ...success }))
					.catch((err) => res.status(400).send({ ...err }))
			} else {
				res.status(400).send({ message: 'Only admins can demote admins' })
			}
		})
}
