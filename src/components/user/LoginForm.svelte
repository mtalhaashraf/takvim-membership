<script>
	import { onDestroy } from 'svelte'
	import { goto } from '@sapper/app'
	import { _, locale } from 'svelte-i18n'
	import { toast } from '../../stores/toastStore.js'

	let email = ''
	let password = ''
	let loading = false
	let errors = {}
	let error

	async function handleSubmit() {
		errors = {}
		loading = true
		try {
			await firebase.auth().signInWithEmailAndPassword(email, password)
			await afterSuccessfulLogin()
		} catch (err) {
			loading = false
			if (err.code === 'auth/user-not-found') {
				errors.email = 'User not found'
			}
			if (err.code === 'auth/wrong-password') {
				errors.password = 'Wrong password'
			}
			if (err.code === 'auth/too-many-requests') {
				errors.password =
					'Access to this account has been temporarily disabled due to many failed login attempts. You can immediately restore it by resetting your password or you can try again later.'
			}
		}
	}

	async function afterSuccessfulLogin() {
		if (error) {
			await firebase.auth().currentUser.linkWithCredential(error.credential)
			toast.set({
				position: 'top right',
				class: 'success',
				showIcon: 'far fa-sign-in',
				message: `Účet byl autorizován pro přihlášení pomocí ${error.credential.providerId}`,
				closeOnClick: true
			})
		}
		toast.set({
			position: 'top right',
			class: 'success',
			showIcon: 'far fa-sign-in',
			message: $_('LoginSuccess'),
			closeOnClick: true
		})
		loading = false
		await goto('/member?status=active')
	}

	async function afterFailedLogin() {
		const { email, credential, code } = error
		if (code === 'auth/account-exists-with-different-credential') {
			const providers = await firebase.auth().fetchSignInMethodsForEmail(email)
			toast.set({
				position: 'top right',
				class: 'error',
				displayTime: 0,
				showIcon: 'far fa-sign-in',
				closeIcon: true,
				message: `Email ${email} je zaregistrován, ale není autorizován pro přihlášení pomocí ${
					credential.providerId
				}.<br><br>Prosím přihlaště se pomocí jednoho z následujících: <ul style="margin: 0;">${providers.reduce(
					(acc, provider) => {
						return `${acc}<li>${$_(`providers.${provider}`)}</li>`
					},
					''
				)}</ul><br>Po přihlášení bude účet autorizován pro přihlášení pomocí ${
					credential.providerId
				}.`
			})
		} else {
			console.log(error)
		}
	}

	async function loginWithGoogle() {
		try {
			await firebase.auth().signInWithPopup(new firebase.auth.GoogleAuthProvider())
			afterSuccessfulLogin()
		} catch (err) {
			error = err
			afterFailedLogin()
		}
	}

	async function loginWithFacebook() {
		try {
			await firebase.auth().signInWithPopup(new firebase.auth.FacebookAuthProvider())
			afterSuccessfulLogin()
		} catch (err) {
			error = err
			afterFailedLogin()
		}
	}
</script>

<style lang="scss">
	.login-form {
		max-width: 36rem;
		margin: 0 auto;
	}
	.actions-container {
		display: flex;
		justify-content: space-between;
	}
</style>

<div class="ui raised segments login-form">
	<div class="ui attached message">
		<div class="ui small icon center aligned header">
			<i class="fal fa-user-circle icon" />
			<span style="font-size: 1.3rem">{$_('Login')}</span>
		</div>
	</div>
	<form class="ui form attached fluid segment">
		<div class="field" class:error={errors.email}>
			<label for="email"> <span>{$_('Email')}</span> </label>
			<div class="ui icon input">
				<input type="text" name="email" bind:value={email} />
				<i class="fas fa-envelope icon" />
			</div>
		</div>
		<div class="field" class:error={errors.password}>
			<label for="password"> <span>{$_('Password')}</span> </label>
			<div class="ui icon input">
				<input type="password" name="password" bind:value={password} />
				<i class="fas fa-lock-alt icon" />
			</div>
		</div>
	</form>
	{#if Object.keys(errors).findIndex((x) => errors[x]) >= 0}
		<div class="ui attached segment">
			<div class="ui error message">
				<ul class="list">
					{#each Object.keys(errors) as error}
						{#if errors[error]}
							<li>{errors[error]}</li>
						{/if}
					{/each}
				</ul>
			</div>
		</div>
	{/if}
	<div class="ui attached segment">
		<button class="ui fluid positive button" class:loading on:click={handleSubmit}>
			<i class="fas fa-paper-plane icon" />
			<span>{$_('Login')}</span>
		</button>
	</div>
	<!-- <div class="ui attached segment">
		<button
			class="ui facebook fluid labeled icon button"
			on:click={loginWithFacebook}
			style="margin-bottom: 0.5rem;"
		>
			<i class="fab fa-facebook-f icon" />
			Přihlásit přes Facebook
		</button>
		<button class="ui google plus fluid labeled icon button" on:click={loginWithGoogle}>
			<i class="fab fa-google icon" />
			Přihlásit přes Google
		</button>
	</div> -->
	<div class="ui bottom attached message">
		<div class="actions-container">
			<a href="/user/forgot"> <span>{$_('ForgotPassword')}</span> </a>
			<!-- <a href="/user/signup"> <span>{$_('CreateAnAccount')}</span> </a> -->
		</div>
	</div>
</div>
