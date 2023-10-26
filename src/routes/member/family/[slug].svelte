<script context="module">
	export async function preload({ params, query }) {
		const res = await this.fetch(`member/family/${params.slug}.json`)
		const optionsRes = await this.fetch(`api/mosque/options.json`)

		if (res.status === 200) {
			const data = await res.json()
			const optionsData = await optionsRes.json()
			const { family, ...rest } = data[0]
			return { head: rest, family: family, isAuthorized: true, options: optionsData }
		} else {
			//this.error(res.status, data.message)
			return { isAuthorized: false }
		}
	}
</script>

<script>
	import { goto, stores } from '@sapper/app'
	import moment from 'moment'
	import Checkbox from '../../../components/elements/Checkbox.svelte'
	import Unauthorized from '../../../components/elements/messages/Unauthorized.svelte'
	import Modal from '../../../components/elements/Modal.svelte'
	import EditFamilyMember from '../../../components/user/EditFamilyMember.svelte'

	export let head

	export let options
	export let family = []
	export let isAuthorized

	const { page, session } = stores()

	$: user = $session.currentUser || {}
	$: isLoggedIn = user.uid ? true : false

	let modal, editUser
	let errors = {}
	let newUser = {}

	function openModal(e, id) {
		if (id) {
			newUser = family.find((x) => x.id === id)
		} else {
			resetModal()
		}
		modal.showModal()
	}
	function resetModal() {
		newUser = {
			firstName: '',
			lastName: '',
			dateOfBirth: null,
			relationToHead: null
		}
	}
	async function saveFamilyMember() {
		const isValid = editUser.validate()
		/* newUser.dateOfBirth = new Date(user.dateOfBirth) */
		newUser.familyId = head.familyId
		newUser.type = 'familyMember'

		if (isValid) {
			try {
				console.log('~ newUser', newUser)
				if (newUser.id) {
					await fetch('/api/user/edit.json', {
						method: 'POST',
						body: JSON.stringify(newUser),
						headers: {
							'Content-Type': 'application/json'
						}
					})
					family = family.map((x) => {
						if (x.id === newUser.id) {
							return newUser
						} else return x
					})
				} else {
					const rawResponse = await fetch('/api/user/create.json', {
						method: 'POST',
						body: JSON.stringify(newUser),
						headers: {
							'Content-Type': 'application/json'
						}
					})
					const data = await rawResponse.json()

					family = [...family, { ...newUser, id: data.id }]
				}
			} catch (error) {
				console.log(error)
				if (error.code === 'auth/email-already-in-use')
					errors.email = 'The email address is already in use by another account.'
			}
		}
	}

	async function deleteFamilyMember() {
		if (confirm('Are you sure you want to delete this user?')) {
			await fetch('/api/user/delete.json', {
				method: 'DELETE',
				body: JSON.stringify({ id: newUser.id }),
				headers: {
					'Content-Type': 'application/json'
				}
			})
			family = family.filter((x) => x.id !== newUser.id)
			modal.hideModal()
		}
	}
</script>

<div class="container">
	<div class="header">
		<h1>Family members</h1>
		<div class="controls">
			<a class="icon button" on:click={openModal}><i class="fas fa-plus" /></a>
		</div>
	</div>
	<div class="body">
		{#if isAuthorized}
			<table class="data-table with-checkbox">
				<thead>
					<tr>
						<th>Relation</th>
						<th>Name</th>
						<th>Date of bitrh</th>
						<th>Age</th>
					</tr>
				</thead>
				<tbody>
					{#each family as user}
						{#if !user.familyHead}
							<tr on:click={(e) => openModal(e, user.id)} data-id={user.id}>
								<td>{user.relationToHead}</td>
								<td>{user.firstName} {user.lastName}</td>
								<td>{moment(user.dateOfBirth).format('DD.MM.YYYY')}</td>
								<td
									>{moment().diff(
										new Date(user.dateOfBirth).toUTCString(),
										'years'
									)}</td
								>
							</tr>
						{/if}
					{/each}
				</tbody>
			</table>
		{:else}
			<Unauthorized />
		{/if}
	</div>
</div>

<Modal
	bind:this={modal}
	classNames="small"
	on:approve={saveFamilyMember}
	onSubmit={() => editUser.validate()}
>
	<div class="header" slot="header">
		{#if newUser.id}
			Edit
		{:else}
			Add
		{/if}
	</div>
	<div class="scrolling content" slot="content" style="min-height: 270px;">
		<EditFamilyMember
			bind:this={editUser}
			bind:user={newUser}
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
		/>
	</div>
	<div class="actions" slot="actions" style="display: flex;">
		{#if newUser.id}
			<div class="negative button" on:click={deleteFamilyMember}>Delete</div>
		{/if}
		<div class="spacer" />
		<div
			class="secondary button"
			on:click={() => {
				modal.hideModal()
			}}
		>
			Cancel
		</div>
		<div class="button" on:click={() => modal.submit()} style="margin-left: 12px;">
			<!-- <i class="fas fa-check icon" /> -->
			Confirm
		</div>
	</div>
</Modal>
