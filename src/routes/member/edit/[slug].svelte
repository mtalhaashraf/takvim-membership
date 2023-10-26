<script context="module">
	export async function preload({ params, query }) {
		const userRes = await this.fetch(`api/user/get/${params.slug}.json`)
		const optionsRes = await this.fetch(`api/mosque/options.json`)
		const userData = await userRes.json()
		const optionsData = await optionsRes.json()

		if (userRes.status === 200 && optionsRes.status === 200) {
			return { user: userData, options: optionsData }
		} else {
			this.error(userRes.status, userData.message)
		}
	}
</script>

<script>
	import { goto } from '@sapper/app'
	import { v4 as uuidv4 } from 'uuid'

	import EditUser from '../../../components/user/EditUser.svelte'
	import { toasts } from '../../../stores/toastsStore'
	import { to } from '../../../utils'

	export let options
	export let user

	let loading = false
	let errors = {}
	let editUser

	const handleSubmit = async (e) => {
		loading = true
		const isValid = editUser.validate()
		/* toasts.set([
			...$toasts,
			{
				class: 'error',
				showIcon: 'far fa-exclamation-triangle',
				message: `Error, account was not created. Please try again.`,
				closeOnClick: true,
				id: uuidv4()
			}
		]) */
		user.dateOfBirth = new Date(user.dateOfBirth)
		//user.type = 'member'

		if (isValid) {
			try {
				if (user.email) {
					await fetch('/api/user/edit.json', {
						method: 'POST',
						body: JSON.stringify(user),
						headers: {
							'Content-Type': 'application/json'
						}
					})
					loading = false
					goto('/member')
				} else {
					// verifyCaptcha()
				}
			} catch (error) {
				console.log(error)
				loading = false
				if (error.code === 'auth/email-already-in-use')
					errors.email = 'The email address is already in use by another account.'
			}
		} else {
			loading = false
		}
	}

	const sendVerificationEmail = () => {
		const user = firebase.auth().currentUser
		user.sendEmailVerification().then(async () => {
			/* toast.set({
				position: 'top right',
				class: 'success',
				showIcon: 'fas fa-check',
				message: `Verification mail was successfully sent. Please check your inbox.`,
				closeOnClick: true
			}) */
			//await goto('/login')
		})
	}
</script>

<style lang="scss">
</style>

<svelte:head>
	<title>Edit Member</title>
</svelte:head>

<div class="container">
	<div class="header">
		<h1>Edit Member</h1>
		<!-- <div class="controls">
			<a href="/admin/add" class="icon button"><i class="fas fa-plus" /></a>
			<div class="icon button"><i class="fas fa-trash" /></div>
		</div> -->
	</div>
	<div class="body">
		<EditUser bind:this={editUser} bind:user {loading} {options} bind:errors>
			<button class="button" id="sign-in-button" class:loading on:click={handleSubmit}>
				<i class="fas fa-paper-plane icon" />
				<span>Save changes</span>
			</button>
		</EditUser>
	</div>
</div>
