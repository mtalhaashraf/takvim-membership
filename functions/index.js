const functions = require('firebase-functions')
const admin = require('firebase-admin')

admin.initializeApp()

exports.afterRegistration = functions.auth.user().onCreate((user) => {
	const customClaims = {
		'https://hasura.io/jwt/claims': {
			'x-hasura-default-role': 'manager',
			'x-hasura-allowed-roles': ['viewer', 'manager', 'payment-manager', 'member-manager'],
			'x-hasura-user-id': user.uid
		}
	}
	return admin.auth().setCustomUserClaims(user.uid, customClaims)
})
