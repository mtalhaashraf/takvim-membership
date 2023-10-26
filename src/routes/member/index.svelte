<script context="module">
	export async function preload({ params, query }) {
		const optionsRes = await this.fetch(`api/mosque/options.json`)

		if (optionsRes.status === 200) {
			const optionsData = await optionsRes.json()
			return {
				options: optionsData,
				isAuthorized: true
			}
		} else {
			//this.error(res.status, data.message)
			return { isAuthorized: false }
		}
	}
</script>

<script>
	import { onMount } from 'svelte'
	import { _ } from 'svelte-i18n'
	import { goto, stores } from '@sapper/app'
	import { v4 as uuidv4 } from 'uuid'
	import isEqual from 'lodash/isEqual'

	import Modal from '../../components/elements/Modal.svelte'
	import Checkbox from '../../components/elements/Checkbox.svelte'
	import Unauthorized from '../../components/elements/messages/Unauthorized.svelte'
	import Dropdown from '../../components/elements/Dropdown.svelte'
	import allStatuses from '../../constants/statuses'
	import itemsPerPageArray from '../../constants/itemsPerPage'
	import { toast } from '../../stores/toastStore.js'
	import Pagination from '../../components/elements/Pagination.svelte'
	import { getUsersRole } from '../../utils.js'
	import roles from '../../constants/roles'
	import MemberView from '../../components/MemberView.svelte'

	import isEmpty from 'lodash/isEmpty'
	import isEmail from 'validator/lib/isEmail'
	import isLength from 'validator/lib/isLength'
	import isMobilePhone from 'validator/lib/isMobilePhone'
	import isStrongPassword from 'validator/lib/isStrongPassword'

	import db from '../../graphQL/frontEnd'
	import { GET_MEMBERS } from '../../graphQL/queries'

	const { page, session } = stores()

	export let isAuthorized
	export let options

	let users = []
	let isMutliPanelEnabled = true
	let itemsPerPage
	const itemsPerPageMulti = process.browser && localStorage.getItem('itemsPerPageMulti')
	const itemsPerPageStandard = process.browser && localStorage.getItem('itemsPerPageStandard')
	if (isMutliPanelEnabled) {
		itemsPerPage = itemsPerPageMulti ? parseInt(itemsPerPageMulti) : 5
	} else {
		itemsPerPage = itemsPerPageStandard ? parseInt(itemsPerPageStandard) : 10
	}
	let loading = true
	let selectFirstUser = false

	let query = $page.query

	export let filters = {
		firstName: (query && query.firstName) || '',
		lastName: (query && query.lastName) || '',
		email: (query && query.email) || '',
		phone: (query && query.phone) || '',
		job: (query && query.job) || '',
		dateOfBirth: (query && query.dateOfBirth) || '',
		street: (query && query.street) || '',
		city: (query && query.city) || '',
		zip: (query && query.zip) || null,
		state: (query && query.state) || '',
		country: (query && query.country) || '',
		H_street: (query && query.H_street) || '',
		H_city: (query && query.H_city) || '',
		H_zip: (query && query.H_zip) || null,
		H_state: (query && query.H_state) || '',
		H_country: (query && query.H_country) || '',
		password: (query && query.password) || '',
		status: (query && query.status) || 'active',
		role: (query && query.role) || null
	}

	let selectedUser, oldQuery, ctxMenu, ctxItemId, modal
	let usersCount = 0

	let activePage
	let itemsPerPageString = itemsPerPage.toString()

	$: pageCount = Math.ceil(usersCount / itemsPerPage)

	let errors = {}

	let statuses = Object.entries(allStatuses).reduce((acc, [key, value]) => {
		acc[key] = value
		return acc
	}, {})

	$: user = $session.currentUser || {}
	$: isLoggedIn = user.uid ? true : false
	$: currentUserRole = getUsersRole(user)

	let selectedRows = []

	let newUser = {
		id: null,
		firstName: '',
		lastName: '',
		relationToHead: '',
		email: '',
		phone: '',
		job: '',
		dateOfBirth: '',
		street: '',
		city: '',
		zip: null,
		state: '',
		country: '',
		H_street: '',
		H_city: '',
		H_zip: null,
		H_state: '',
		H_country: '',
		password: '',
		role: 'member',
		status: 'active'
	}

	$: if (users.length > 0) {
		selectedRows = users.filter((x) => x.checked).map((x) => x.id)
	} else {
		selectedRows = []
	}

	const pageUnsubscribe = page.subscribe(({ path, params, query }) => {
		const { tab, ...rest } = query
		if (!isEqual(oldQuery, rest)) {
			if (process.browser) {
				getUsers(rest)
			}
		}
		oldQuery = rest
	})

	async function getUsers(query) {
		loading = true
		const { page, ...rest } = query
		const hasValidPageParam = page && page.length > 0 && !isNaN(parseInt(page))
		activePage = hasValidPageParam ? parseInt(page) : 1
		const offset = (activePage - 1) * itemsPerPage
		const usersRes = await fetch('member.json', {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ limit: itemsPerPage, offset, ...rest })
		})

		if (usersRes.ok) {
			const usersData = await usersRes.json()
			users = usersData.users
			usersCount = usersData.users_aggregate.aggregate.count
			loading = false
			if (selectFirstUser && users.length > 0) {
				selectedUser = users[0]
				selectFirstUser = false
			}
		}
	}

	function openModal(e, id) {
		resetModal()
		modal.showModal()
	}

	function resetModal() {
		newUser = {
			id: null,
			firstName: '',
			lastName: '',
			relationToHead: '',
			email: '',
			phone: '',
			job: '',
			dateOfBirth: '',
			street: '',
			city: '',
			zip: null,
			state: '',
			country: '',
			H_street: '',
			H_city: '',
			H_zip: null,
			H_state: '',
			H_country: '',
			password: '',
			role: 'member',
			status: 'active'
		}
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

	async function resetFilters() {
		loading = true
		selectedUser = null
		filters = {
			firstName: '',
			lastName: '',
			email: '',
			phone: '',
			job: '',
			dateOfBirth: '',
			street: '',
			city: '',
			zip: null,
			state: '',
			country: '',
			H_street: '',
			H_city: '',
			H_zip: null,
			H_state: '',
			H_country: '',
			password: '',
			status: 'active',
			role: null
		}
		goto('member?status=active')
	}
	function buildQuery() {
		const variables = Object.entries(filters)
			.filter(([key, val]) => val !== '' && val)
			.reduce((acc, [key, val]) => {
				acc[key] = val
				return acc
			}, {})
		const query = Object.entries(variables).reduce((acc, [key, value]) => {
			if (acc === '') {
				acc = `?${key}=${value}`
			} else {
				acc = `${acc}&${key}=${value}`
			}
			return acc
		}, '')
		return query
	}
	async function applyFilters() {
		loading = true
		selectFirstUser = true
		selectedUser = null
		const query = buildQuery()
		goto(`member${query}`)
	}

	function handleFilterKeyDown(e) {
		const { keyCode } = e
		if (keyCode === 13) {
			e.preventDefault()
			applyFilters()
		}
	}
	function handleMove(e) {
		const newPage = e.detail
		const query = buildQuery()
		selectedUser = null
		if (query === '') {
			goto(`member?page=${newPage}`)
		} else {
			goto(`member${query}&page=${newPage}`)
		}
	}
	function handleMemberClick(e, uid) {
		if (isMutliPanelEnabled) {
			selectedUser = users.find((x) => x.id === uid)
		} else {
			localStorage.setItem('referrerUrl', window.location.href)
			goto(`member/${uid}`)
		}
	}
	export const validateNew = () => {
		errors = {}
		if (!isLength(newUser.firstName, { min: 2, max: 30 }))
			errors.firstName = 'First name has to be longer than 2 characters'

		if (!isLength(newUser.lastName, { min: 2, max: 30 }))
			errors.lastName = 'Last name has to be longer than 2 characters'
		/* if (!isMobilePhone.default(newUser.phone, 'de-CH'))
			errors.phone = 'Invalid phone. Has to be CH number format (+41)' */

		/* if (!isStrongPassword(newUser.password))
			errors.password =
				'Password is too weak. Rules: Length > 7, Lowercase > 0, Uppercase > 0, Numbers > 0, Symbols > 0' */

		if (isEmpty(errors)) return true
		else return false
	}
	async function addNewMember() {
		const isValid = validateNew()
		if (isValid) {
			try {
				newUser.dateOfBirth = new Date(newUser.dateOfBirth)
				newUser.familyHead = true
				newUser.familyId = uuidv4()
				newUser.type = 'member'
				const addedUser = await fetch('api/user/create.json', {
					method: 'POST',
					body: JSON.stringify(newUser),
					headers: {
						'Content-Type': 'application/json'
					}
				})
				const data = await addedUser.json()
				users = [...users, data]
			} catch (error) {
				console.log(error)
				if (error.code === 'auth/email-already-in-use')
					errors.email = 'The email address is already in use by another account.'
			}
		}
	}
	function toggleMultiPanel() {
		isMutliPanelEnabled = !isMutliPanelEnabled
		localStorage.setItem('multiPanelState', isMutliPanelEnabled)
	}
	function handleItemsPerPageSelect(e) {
		const val = e.detail
		itemsPerPage = parseInt(val)
		const query = buildQuery()
		if (process.browser) {
			if (isMutliPanelEnabled) {
				localStorage.setItem('itemsPerPageMulti', val)
			} else {
				localStorage.setItem('itemsPerPageStandard', val)
			}
			goto(`member${query}`)
		}
	}

	function handleUserUpdate(e) {
		const { detail: updatedUser } = e
		const index = users.findIndex((x) => x.id === updatedUser.id)
		if (index >= 0) {
			users[index] = updatedUser
		}
	}

	onMount(() => {
		const multiPanelState = localStorage.getItem('multiPanelState')
		if (multiPanelState) {
			isMutliPanelEnabled = JSON.parse(multiPanelState)
		}
	})
</script>

<style lang="scss">
	:global(#filters-form) {
		.fields-flex {
			display: grid;
			grid-template-columns: 3fr 3fr 3fr 2fr 3fr 3fr auto auto;
			.ui.input input {
				width: inherit !important;
			}
			& > .field {
				&:not(:first-child) {
					margin-left: 14px;
				}
			}
			& > button {
				height: fit-content;
				margin: 0 0 1em 0.5em;
				align-self: end;
				padding: 0.87em;
			}
			/* .field {
				&:not(:first-child) {
					margin-left: 14px;
				}
			} */
		}
	}
	.body-header {
		a {
			margin-left: 2rem;
		}
	}
	.detail-view-toggle {
		margin-left: 10px;
		button {
			&:last-child {
				margin-right: 0;
			}
			padding: 0.87em !important;
		}
	}
</style>

<main id="body-container">
	<div class="body-header">
		<h1>{$_('Members')}</h1>
		<a on:click={openModal} class="ui button"><i class="fas fa-plus icon" />{$_('AddMember')}</a
		>
		<div class="spacer" />
		<Dropdown bind:value={itemsPerPageString} on:select={handleItemsPerPageSelect}>
			{#each itemsPerPageArray as count}
				<div class="item" data-value={count}>
					{count}
				</div>
			{/each}
		</Dropdown>
		<div class="detail-view-toggle">
			<button
				class="ui icon button"
				class:active={isMutliPanelEnabled}
				on:click={toggleMultiPanel}
			>
				{#if isMutliPanelEnabled}
					<i class="fas fa-th-large icon" />
				{:else}
					<i class="far fa-th-large icon" />
				{/if}
			</button>
		</div>
	</div>
	{#if isAuthorized}
		<form class="ui form" id="filters-form">
			<div class="fields-flex">
				<div class="field">
					<label for="firstName"> <span>{$_('FirstName')}</span> </label>
					<div class="ui left icon input">
						<input
							type="text"
							name="firstName"
							bind:value={filters.firstName}
							on:keydown={handleFilterKeyDown}
						/>
						<i class="fas fa-user icon" />
					</div>
				</div>
				<div class="field">
					<label for="lastName"> <span>{$_('LastName')}</span> </label>
					<div class="ui left icon input">
						<input
							type="text"
							name="lastName"
							bind:value={filters.lastName}
							on:keydown={handleFilterKeyDown}
						/>
						<i class="fas fa-user icon" />
					</div>
				</div>
				<div class="field">
					<label for="street"> <span>{$_('Street')}</span> </label>
					<div class="ui left icon input">
						<input
							type="text"
							name="street"
							bind:value={filters.street}
							on:keydown={handleFilterKeyDown}
						/>
						<i class="fas fa-road icon" />
					</div>
				</div>
				<div class="field" style="flex: 1;">
					<label for="zip"> <span>{$_('Zip')}</span> </label>
					<div class="ui left icon input">
						<input
							type="text"
							name="zip"
							bind:value={filters.zip}
							on:keydown={handleFilterKeyDown}
						/>
						<i class="fas fa-hashtag icon" />
					</div>
				</div>
				<div class="field">
					<label for="city"> <span>{$_('City')}</span> </label>
					<div class="ui left icon input">
						<input
							type="text"
							name="city"
							bind:value={filters.city}
							on:keydown={handleFilterKeyDown}
						/>
						<i class="fas fa-city icon" />
					</div>
				</div>
				<div class="field">
					<label for="status"> <span>{$_('Status')}</span> </label>
					<Dropdown bind:value={filters.status}>
						{#each Object.entries(statuses) as status}
							<div class="item" data-value={status[0]}>
								{$_(status[0])}
							</div>
						{/each}
					</Dropdown>
				</div>
				<button class="ui icon button" on:click|preventDefault={resetFilters}
					><i class="fas fa-undo" /></button
				>
				<button class="ui icon positive button" on:click|preventDefault={applyFilters}
					><i class="fas fa-check" /></button
				>
			</div>
		</form>
		<table class="ui celled selectable unstackable table data-table">
			<thead>
				<tr>
					<!-- <th /> -->
					<!-- <th>ID</th> -->
					<th>{$_('Name')}</th>
					<th>{$_('Street')}</th>
					<th>{$_('Zip')}</th>
					<th>{$_('City')}</th>
					<!-- <th>Email</th> -->
					<!-- <th>Status</th> -->
				</tr>
			</thead>
			<tbody>
				{#if loading}
					<tr>
						<td colspan="4" style="text-align: center;">
							<div class="ui active centered inline loader" />
						</td></tr
					>
				{:else}
					{#each users as user, i}
						{#if i < itemsPerPage}
							<tr
								data-id={user.id}
								class:active={isMutliPanelEnabled &&
									selectedUser &&
									selectedUser.id === user.id}
								on:click={(e) => handleMemberClick(e, user.id)}
							>
								<!-- <td><Checkbox bind:checked={user.checked} /></td> -->
								<!-- <td>{user.id}</td> -->
								<td>{user.firstName} {user.lastName}</td>
								<td>{user.street}</td>
								<td>{user.zip}</td>
								<td>{user.city}</td>
								<!-- <td>{user.email}</td> -->
								<!-- <td>{user.status}</td> -->
							</tr>
						{/if}
					{/each}
				{/if}
			</tbody>
		</table>

		<Pagination {pageCount} bind:activePage on:move={handleMove} />
		{#if isMutliPanelEnabled}
			<h4 class="ui horizontal divider header">
				<i class="fas fa-th-large icon" />
				Detail panel
			</h4>
			{#if selectedUser}
				<MemberView
					user={selectedUser}
					{query}
					{options}
					isInMultiPanel={true}
					on:update={handleUserUpdate}
				/>
			{:else}
				<div class="ui message">
					<div class="header">{$_('NoUserSelected')}</div>
					<p>{$_('NoUserSelectedMessage')}</p>
				</div>
			{/if}
		{/if}
	{:else}
		<Unauthorized />
	{/if}
</main>

<Modal bind:this={modal} classNames="small" on:approve={addNewMember}>
	<div class="header" slot="header">
		{$_('AddMember')}
	</div>
	<div class="scrolling content" slot="content" style="min-height: 270px;">
		<form class="ui form">
			<!-- <h4 class="ui dividing header">Personal Information</h4> -->
			<!-- <h4 class="ui horizontal divider header">
				<i class="far fa-user icon" />
				{$_('Personal')}
			</h4> -->
			<div class="two fields">
				<div class="field">
					<label>{$_('FirstName')}</label>
					<input
						type="text"
						placeholder={$_('FirstName')}
						bind:value={newUser.firstName}
					/>
				</div>
				<div class="field">
					<label>{$_('LastName')}</label>
					<input type="text" placeholder={$_('LastName')} bind:value={newUser.lastName} />
				</div>
			</div>
			<div class="two fields">
				<div class="field">
					<label>{$_('Email')}</label>
					<input type="text" placeholder={$_('Email')} bind:value={newUser.email} />
				</div>
				<div class="field">
					<label>{$_('Phone')}</label>
					<input type="text" placeholder={$_('Phone')} bind:value={newUser.phone} />
				</div>
			</div>
			<div class="two fields">
				<div class="field">
					<label>{$_('Job')}</label>
					<input type="text" placeholder={$_('Job')} bind:value={newUser.job} />
				</div>
				<div class="field">
					<label>{$_('DateOfBirth')}</label>
					<input
						type="date"
						placeholder={$_('DateOfBirth')}
						bind:value={newUser.dateOfBirth}
					/>
				</div>
			</div>
			<!-- <h4 class="ui dividing header">Address</h4> -->
			<h4 class="ui horizontal divider header">
				<i class="far fa-address-card icon" />
				{$_('Address')}
			</h4>
			<div class="fields">
				<div class="six wide field">
					<label>{$_('Street')}</label>
					<input type="text" placeholder={$_('Street')} bind:value={newUser.street} />
				</div>
				<div class="four wide field">
					<label>{$_('Zip')}</label>
					<input type="text" placeholder={$_('Zip')} bind:value={newUser.zip} />
				</div>
				<div class="six wide field">
					<label>{$_('City')}</label>
					<input type="text" placeholder={$_('City')} bind:value={newUser.city} />
				</div>
			</div>
			<div class="two fields">
				<div class="field">
					<label>{$_('State')}</label>
					<input type="text" placeholder={$_('State')} bind:value={newUser.state} />
				</div>
				<div class="field">
					<label>{$_('Country')}</label>
					<input type="text" placeholder={$_('Country')} bind:value={newUser.country} />
				</div>
			</div>
			<!-- <h4 class="ui dividing header">Address of origin</h4> -->
			<h4 class="ui horizontal divider header">
				<i class="far fa-address-card icon" />
				{$_('AddressOfOrigin')}
			</h4>
			<div class="fields">
				<div class="six wide field">
					<label>{$_('Street')}</label>
					<input type="text" placeholder={$_('Street')} bind:value={newUser.H_street} />
				</div>
				<div class="four wide field">
					<label>{$_('Zip')}</label>
					<input type="text" placeholder={$_('Zip')} bind:value={newUser.H_zip} />
				</div>
				<div class="six wide field">
					<label>{$_('City')}</label>
					<input type="text" placeholder={$_('City')} bind:value={newUser.H_city} />
				</div>
			</div>
			<div class="two fields">
				<div class="field">
					<label>{$_('State')}</label>
					<input type="text" placeholder={$_('State')} bind:value={newUser.H_state} />
				</div>
				<div class="field">
					<label>{$_('Country')}</label>
					<input type="text" placeholder={$_('Country')} bind:value={newUser.H_country} />
				</div>
			</div>
			<div class="two fields" style="min-height: 300px;">
				{#if currentUserRole === 'super-admin'}
					<div class="field">
						<label for="role"> <span>Role</span> </label>
						<Dropdown bind:value={newUser.role}>
							{#each Object.entries(roles).filter(([role, values]) => {
								if (currentUserRole !== 'super-admin') {
									return role === 'member'
								} else return true
							}) as [role, values]}
								<div class="item" data-value={role}>
									{$_(role)}
								</div>
							{/each}
						</Dropdown>
					</div>
				{/if}
				<div class="field">
					<label for="status"> <span>Status</span> </label>
					<Dropdown bind:value={newUser.status}>
						{#each Object.entries(statuses) as status}
							<div class="item" data-value={status[0]}>
								{$_(status[0])}
							</div>
						{/each}
					</Dropdown>
				</div>
			</div>
		</form>
	</div>
	<div class="actions" slot="actions">
		<div
			class="ui button"
			on:click={() => {
				resetModal()
				modal.hideModal()
			}}
		>
			{$_('Cancel')}
		</div>
		<div class="ui positive button" on:click={() => modal.submit()}>
			<i class="fas fa-check icon" />
			{$_('Confirm')}
		</div>
	</div>
</Modal>
