import admin from './firebase'

const api = {
	user: {
		create: (id, data) =>
			admin
				.firestore()
				.collection('users')
				.doc(id)
				.set({
					...data,
					createdAt: admin.firestore.Timestamp.now(),
					updatedAt: admin.firestore.Timestamp.now()
				})
				.then(() => ({ message: `Success! Account for ${data.email} was created.` }))
				.catch((err) => err)
	}
}

export default api
