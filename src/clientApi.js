import Compressor from 'compressorjs'
import isEqual from 'lodash/isEqual'

import { get } from 'svelte/store'

const api = {
	user: {
		getById: (userId) =>
			firebase
				.firestore()
				.collection('users')
				.doc(userId)
				.get()
				.catch(function (error) {
					console.log('Error getting documents: ', error)
				})
	}
}

export default api
