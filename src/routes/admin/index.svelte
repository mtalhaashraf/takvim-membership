<script context="module">
	export async function preload({ params, query }) {
		const res = await this.fetch(`admin.json`)

		if (res.status === 200) {
			const data = await res.json()
			return { users: data, isAuthorized: true }
		} else {
			//this.error(res.status, data.message)
			return { isAuthorized: false }
		}
	}
</script>

<script>
	import { _ } from 'svelte-i18n'
	import { goto, stores } from '@sapper/app'
	/* import Checkbox from '../../components/elements/Checkbox.svelte'
	import ContextMenu from '../../components/elements/ContextMenu.svelte' */
	import Unauthorized from '../../components/elements/messages/Unauthorized.svelte'
	import { getUsersRole } from '../../utils.js'

	export let users = []
	export let isAuthorized

	const { page, session } = stores()

	$: user = $session.currentUser || {}
	$: role = getUsersRole(user)
	$: isLoggedIn = user.uid ? true : false

	/* let ctxMenu, ctxItemId
	let selectedRows = []
	$: if (users.length > 0) {
		selectedRows = users.filter((x) => x.checked).map((x) => x.id)
	} else {
		selectedRows = []
	}

	function openContextMenu(e) {
		ctxItemId = e.currentTarget.dataset.id
		ctxMenu.toggleMenu({ top: e.clientY, left: e.clientX })
	}
	async function handleRowDelete() {
		if (confirm('Are you sure you want to delete this user?')) {
			await fetch('/api/user/delete.json', {
				method: 'DELETE',
				body: JSON.stringify({ id: ctxItemId }),
				headers: {
					'Content-Type': 'application/json'
				}
			})
		}
	}
	function handleRowEdit() {
		goto(`admin/edit/${ctxItemId}`)
	}
	function handleRowResetPassword() {} */
</script>

<main id="body-container">
	<div class="body-header">
		<h1>{$_('Admins')}</h1>
		<!-- <div class="controls">
			<a href="/admin/add" class="icon button"><i class="fas fa-plus" /></a>
		</div> -->
	</div>
	<div class="body">
		{#if isAuthorized}
			<table class="ui celled unstackable table data-table">
				<thead>
					<tr>
						<th>{$_('ID')}</th>
						<th>{$_('Name')}</th>
						<th>{$_('Email')}</th>
						<th>{$_('Role')}</th>
					</tr>
				</thead>
				<tbody>
					{#each users as user}
						<tr data-id={user.id}>
							<td>{user.id}</td>
							<td>{user.firstName} {user.lastName}</td>
							<td>{user.email}</td>
							<td>{user.role}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		{:else}
			<Unauthorized />
		{/if}
	</div>
</main>

<!-- <ContextMenu classNames="more" hiding bind:this={ctxMenu}>
	<div class="ctx-button" on:click|preventDefault|stopPropagation={handleRowEdit}>
		<i class="far fa-edit fa-fw" />
		<span>Edit</span>
	</div>
	<div class="ctx-button" on:click|preventDefault|stopPropagation={handleRowDelete}>
		<i class="far fa-trash fa-fw" /> <span>Delete</span>
	</div>
	<div class="ctx-button" on:click|preventDefault|stopPropagation={handleRowResetPassword}>
		<i class="far fa-lock fa-fw" /> <span>Reset pass</span>
	</div>
</ContextMenu> -->
