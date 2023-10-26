<script>
	import { _ } from 'svelte-i18n'
	import { toast } from '../../stores/toastStore.js'

	export let email = ''
	let loading = false

	const handleSubmit = () => {
		loading = true
		firebase
			.auth()
			.sendPasswordResetEmail(email)
			.then(() => {
				loading = false
				toast.set({
					position: 'top right',
					class: 'success',
					showIcon: 'fas fa-paper-plane',
					message: $_('SuccessResetPass'),
					closeOnClick: true
				})
			})
			.catch((error) => {
				console.log('handleSubmit -> error', error)
				loading = false
				toast.set({
					position: 'top right',
					class: 'error',
					showIcon: 'far fa-exclamation-triangle',
					message: $_('ErrorEmailNotFound'),
					closeOnClick: true
				})
			})
	}
</script>

<style lang="scss">
	button {
		max-width: 340px;
		margin: 0 auto !important;
	}
</style>

<button class="ui fluid positive button" on:click={handleSubmit}>
	<i class="fas fa-paper-plane icon" />
	<span>{$_('SendResetPasswordEmail')}</span>
</button>
