import admin from 'firebase-admin'
import serviceAccount from '../../mymosq-membershipadmin-firebase-adminsdk-q6dmt-3bc88df1a9.json'

if (!process.browser) {
	if (!admin.apps.length) {
		admin.initializeApp({
			credential: admin.credential.cert(serviceAccount)
		})
	} else {
		admin.app()
	}
}

export default admin
