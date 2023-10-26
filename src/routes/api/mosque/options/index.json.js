import admin from '../../../../firebase'

export async function get(req, res, next) {
	try {
		const doc = await admin
			.firestore()
			.collection('mosqueSettings')
			.doc('e1Ne1EzVA4KbYC6hnZNc')
			.get()
		const data = doc.data()
		res.setHeader('Content-Type', 'application/json; charset=utf-8')
		res.end(JSON.stringify(data))
	} catch (error) {
		console.log('~ error', error)
		next()
	}
}
