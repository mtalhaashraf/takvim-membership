<script>
	import { _ } from 'svelte-i18n'
	import { goto } from '@sapper/app'
	import { toast } from '../../stores/toastStore.js'

	export let email = ''
	let loading = false
	let errors = {}

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
					message: `Reset mail was successfully sent. Please check your inbox.`,
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
					message: `Error, could not find your email.`,
					closeOnClick: true
				})
			})
	}
</script>

<style lang="scss">
	.forgot-password-form {
		max-width: 36em;
		margin: 0 auto;
	}
</style>

<div class="ui raised segments forgot-password-form">
	<div class="ui attached message">
		<div class="ui small icon center aligned header">
			<i class="fal fa-user-circle icon" />
			<span style="font-size: 1.3rem">{$_('ForgottenPassword')}</span>
		</div>
	</div>
	<form class="ui form attached fluid segment">
		<div class="field" class:error={errors.email}>
			<label for="email">
				<span>{$_('Email')}</span>
			</label>
			<div class="ui icon input">
				<input type="text" name="email" bind:value={email} />
				<i class="mail icon" />
			</div>
		</div>
	</form>
	{#if Object.keys(errors).findIndex((x) => errors[x]) >= 0}
		<div class="ui attached segment error message">
			<ul class="list">
				{#each Object.keys(errors) as error}
					{#if errors[error]}
						<li>{errors[error]}</li>
					{/if}
				{/each}
			</ul>
		</div>
	{/if}
	<div class="ui attached segment">
		<button class="ui fluid positive button" on:click={handleSubmit}>
			<i class="fas fa-paper-plane icon" />
			<span>{$_('RecoverYourPassword')}</span>
		</button>
	</div>
	<div class="ui bottom attached message">
		<i class="fas fa-question icon" />
		<span>{$_('RememberedYourPassword')}</span>
		<a href="/user/login">
			<span>{$_('LoginHere')}</span>
		</a>
		<span>{$_('Instead')}</span>
	</div>
</div>
