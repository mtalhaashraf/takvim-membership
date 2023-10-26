<script>
	import { _ } from 'svelte-i18n'
	import { goto, stores } from '@sapper/app'
	import MenuAccordion from './elements/accordion/MenuAccordion.svelte'
	import { getUsersRole } from '../utils.js'
	import LocaleSelector from './elements/LocaleSelector.svelte'

	const { page, session } = stores()

	$: user = $session.currentUser || {}
	$: isLoggedIn = user.uid ? true : false
	$: role = getUsersRole(user)

	async function logout() {
		await firebase.auth().signOut()
		goto('/user/login')
	}
</script>

<style lang="scss">
	a.logo {
		text-decoration: none;
		display: block;
		font-size: 20px;
		font-weight: 600;
		display: flex;
		flex-direction: row;
		align-items: center;
		img {
			width: 48px;
			height: 48px;
		}
		div {
			font-weight: 700;
			font-size: 18px;
			margin-left: 16px;
			span:first-child {
				color: var(--primary-color);
			}
			span:nth-child(2) {
				color: #c1d616;
			}
			span:nth-child(3) {
				color: var(--secondary-text);
			}
		}
	}
	nav {
		width: 100%;
		padding: 10px 50px;
		max-width: 1800px;
		margin: 0 auto;
		display: flex;
		flex-direction: row;
		align-items: center;
		.spacer {
			flex: 1;
		}
		button {
			width: 100%;
		}
		.nav-item {
			color: var(--primary-text);
		}
		.nav-item,
		button {
			padding: 0.8em 1em;
			display: block;
			border-radius: 0.6em;
			transition: color 250ms ease, background 250ms ease;
			border: 0;
			background: transparent;
			text-align: start;
			cursor: pointer;
			&.active {
				background: var(--hover-overlay);
				color: var(--primary-color);
			}
			&:hover {
				color: white;
				background: var(--primary-color);
			}
			margin: 0 1rem;
			/* &:not(:last-of-type) {
				margin-bottom: 0.2em;
			} */
			span {
				font-size: 1.1em;
				font-weight: 600;
			}
		}
	}
	.mobile-menu-container {
		display: none;
	}
	@media only screen and (max-width: 800px) {
		.mobile-menu-container {
			display: block;
		}
		.nav-item {
			display: none !important;
		}
	}
	:global(nav) {
		-webkit-tap-highlight-color: transparent;
		-webkit-touch-callout: none;
		-webkit-user-select: none;
		-khtml-user-select: none;
		-moz-user-select: none;
		-ms-user-select: none;
		user-select: none;
	}
	:global(.popup-menu a) {
		font-size: 1.1em;
		font-weight: 600;
		padding-left: 1em;
	}
</style>

<nav class="nav-container">
	<a href="/" class="logo">
		<img src="/logo-with-background.png" alt="MyMosq logo" />
		<div>
			<span>My</span><span>Mosq</span>&nbsp;<span>Admin</span>
		</div>
	</a>
	<div class="spacer" />
	<!-- <a href="/" class:active={$page.path === '/'}
			><i class="fal fa-home fa-fw" /><span>Home</span></a
		> -->

	{#if isLoggedIn === true && role !== 'member'}
		<a
			href="/member?status=active"
			class="nav-item"
			class:active={$page.path.startsWith('/member')}><span>{$_('Members')}</span></a
		>
		<a href="/settings" class="nav-item" class:active={$page.path.startsWith('/settings')}
			><span>{$_('Settings')}</span></a
		>
		{#if role === 'super-admin'}
			<a href="/admin" class="nav-item" class:active={$page.path.startsWith('/admin')}
				><span>{$_('Admins')}</span></a
			>
		{/if}

		<div class="spacer" />
		<a role="button" class="nav-item" on:click={logout}><span>{$_('Logout')}</span></a>
	{:else}
		<a href="/user/login" class="nav-item" class:active={$page.path.startsWith('/login')}
			><span>{$_('Login')}</span></a
		>
	{/if}
	<LocaleSelector />
</nav>
