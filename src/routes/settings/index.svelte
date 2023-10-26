<script>
	import { _ } from 'svelte-i18n'
	import { stores } from '@sapper/app'
	import RecoverPasswordButton from '../../components/user/RecoverPasswordButton.svelte'

	const { page, session } = stores()

	$: user = $session.currentUser || {}

	let password = ''
	let errors = {}
	let loading = false

	/* async function changePassword() {
		errors = {}
		const rawResponse = await fetch('/api/user/update', {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ uid: user.uid, password })
		})
		const data = await rawResponse.json()
		if (!rawResponse.ok) {
			errors.password = data.message.message
		}
	} */
</script>

<main id="body-container">
	<div class="body-header">
		<h1>{$_('Settings')}</h1>
	</div>
	<div class="body">
		<RecoverPasswordButton email={user.email} />
		<!-- <div class="field" class:error={errors.password}>
			<label for="password"> <span>New password</span> </label>
			<div class="icon input">
				<i class="fas fa-lock fa-fw" />
				<input type="text" name="password" bind:value={password} />
			</div>
		</div>
		<div />
		<button class="button" on:click={changePassword} style="margin-top: 16px;"
			>Confirm changes</button
		> -->
	</div>
</main>
