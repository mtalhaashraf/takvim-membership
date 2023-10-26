<script context="module">
	export async function preload({ params, query }) {
		const res = await this.fetch(`api/mosque/options.json`)
		const data = await res.json()

		if (res.status === 200) {
			return { options: data }
		} else {
			this.error(res.status, data.message)
		}
	}
</script>

<script>
	import { goto } from '@sapper/app'
	import { v4 as uuidv4 } from 'uuid'

	import EditUser from '../../../components/user/EditUser.svelte'
	import { toasts } from '../../../stores/toastsStore'

	export let options

	let user

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
		user.type = 'admin'
		user.familyHead = true
		user.familyId = uuidv4()

		if (isValid) {
			try {
				await fetch('/api/user/create.json', {
					method: 'POST',
					body: JSON.stringify(user),
					headers: {
						'Content-Type': 'application/json'
					}
				})
				goto('/admin')
				loading = false
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
</script>

<style lang="scss">
</style>

<svelte:head>
	<title>Signup</title>
</svelte:head>

<div class="container">
	<div class="header">
		<h1>Add admin</h1>
		<!-- <div class="controls">
			<a href="/admin/add" class="icon button"><i class="fas fa-plus" /></a>
			<div class="icon button"><i class="fas fa-trash" /></div>
		</div> -->
	</div>
	<div class="body">
		<EditUser bind:this={editUser} bind:user {loading} {options} bind:errors>
			<button class="button" id="sign-in-button" class:loading on:click={handleSubmit}>
				<i class="fas fa-paper-plane icon" />
				<span>Create admin</span>
			</button>
		</EditUser>
	</div>
</div>
