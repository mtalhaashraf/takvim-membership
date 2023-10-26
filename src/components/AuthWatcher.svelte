<script>
	import { onMount } from 'svelte'
	import { stores } from '@sapper/app'

	const { session } = stores()

	onMount(() => {
		firebase.auth().onAuthStateChanged(async (userRecord) => {
			if (userRecord) {
				/* userRecord.getIdToken().then((idToken) => {
					sendTokenToServer(idToken, 'b_D5Bhe2*7hJSmP9ZB@x2f-9jV^pUD7P-tSq_hqF')
				}) */
				const idToken = await userRecord.getIdToken()
				await sendTokenToServer(idToken, 'b_D5Bhe2*7hJSmP9ZB@x2f-9jV^pUD7P-tSq_hqF')
				let obj = {
					displayName: userRecord.displayName,
					email: userRecord.email,
					emailVerified: userRecord.emailVerified,
					photoURL: userRecord.photoURL,
					uid: userRecord.uid
				}
				firebase.analytics().setUserId(userRecord.uid)

				/* userRecord.getIdTokenResult().then((token) => {
					if (token.claims) {
						localStorage.setItem('dbAuthToken', token.token)
						saveUserTokenCookie(token.token, 'b_D5Bhe2*7hJSmP9ZB@x2f-9jV^pUD7P-tSq_hqF')
						obj.claims = {
							...token.claims
						}
					}
				}) */
				const token = await userRecord.getIdTokenResult()
				if (token.claims) {
					localStorage.setItem('dbAuthToken', token.token)
					await saveUserTokenCookie(
						token.token,
						'b_D5Bhe2*7hJSmP9ZB@x2f-9jV^pUD7P-tSq_hqF'
					)
					obj.claims = {
						...token.claims
					}
				}

				session.update((currentStore) => {
					//console.log('~ currentStore', currentStore)
					currentStore.currentUser = obj
					return currentStore
				})
			} else {
				session.update((currentStore) => {
					currentStore.currentUser = null
					return currentStore
				})
				clearCookiesOnServer('b_D5Bhe2*7hJSmP9ZB@x2f-9jV^pUD7P-tSq_hqF')
			}
		})
	})

	/* auth.onIdTokenChanged((userRecord) => {
			if (userRecord) {
				userRecord.getIdTokenResult().then((token) => {
					// console.log('~ claims', token.claims)
					// analytics.setUserProperties({ role: token.claims.role })
				})
			}
		}) */

	function clearCookiesOnServer(csrfToken) {
		const rawResponse = fetch('/api/auth/clear-cookie', {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ csrfToken })
		})
	}
	async function sendTokenToServer(idToken, csrfToken) {
		const rawResponse = await fetch('/api/auth/session', {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ idToken, csrfToken })
		})
	}
	async function saveUserTokenCookie(token, csrfToken) {
		const rawResponse = await fetch('/api/user/token-cookie', {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ token, csrfToken })
		})
	}
</script>
