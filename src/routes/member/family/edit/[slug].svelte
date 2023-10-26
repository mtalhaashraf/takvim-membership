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

	import EditUser from '../../../../components/user/EditUser.svelte'
	import { toasts } from '../../../../stores/toastsStore'
	import { to } from '../../../../utils'

	export let options
	export let user

	let loading = false
	let errors = {}
	let editUser

	const handleSubmit = async (e) => {
		loading = true
		const isValid = editUser.validate()
		user.dateOfBirth = new Date(user.dateOfBirth)
		user.type = 'familyMember'

		if (isValid) {
			try {
				await fetch('/api/user/edit.json', {
					method: 'POST',
					body: JSON.stringify(user),
					headers: {
						'Content-Type': 'application/json'
					}
				})
				loading = false
				goto(document.referrer)
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
	<title>Edit family member</title>
</svelte:head>

<div class="container">
	<div class="header">
		<h1>Edit family member</h1>
		<!-- <div class="controls">
			<a href="/admin/add" class="icon button"><i class="fas fa-plus" /></a>
			<div class="icon button"><i class="fas fa-trash" /></div>
		</div> -->
	</div>
	<div class="body">
		<EditUser
			bind:this={editUser}
			bind:user
			{loading}
			{options}
			bind:errors
			fields={{
				names: true,
				contacts: false,
				password: false,
				address: false,
				addressOfOrigin: false,
				job: false,
				relationToHead: true,
				dateOfBirth: true,
				roleStatus: false
			}}
		>
			<button class="button" id="sign-in-button" class:loading on:click={handleSubmit}>
				<i class="fas fa-paper-plane icon" />
				<span>Save changes</span>
			</button>
		</EditUser>
	</div>
</div>
