<script context="module">
	export async function preload(page, session) {
		if (session.currentUser) {
			console.log('~ session.currentUser', session.currentUser)
			return this.redirect(301, 'member?status=active')
		} else {
			return this.redirect(301, 'user/login')
		}
	}
</script>
