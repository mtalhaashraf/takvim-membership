import admin from '../../../firebase'

export async function post(req, res) {
	const { password, uid } = req.body
	try {
		const userRecord = await admin.auth().updateUser(uid, {
			password
		})
		res.status(200).send(userRecord)
	} catch (error) {
		res.status(400).send({
			message: error
		})
	}
}
