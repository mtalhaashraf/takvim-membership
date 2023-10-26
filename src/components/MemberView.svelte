<script>
	import { createEventDispatcher } from 'svelte'
	import moment from 'moment'
	import { goto, stores } from '@sapper/app'
	import { _ } from 'svelte-i18n'
	import isEmpty from 'lodash/isEmpty'
	import isEmail from 'validator/lib/isEmail'
	import isLength from 'validator/lib/isLength'

	import VerticalTabs from './elements/tabs/VerticalTabs.svelte'
	import ForgotPasswordForm from './user/ForgotPasswordForm.svelte'
	import RecoverPasswordButton from './user/RecoverPasswordButton.svelte'
	import Modal from './elements/Modal.svelte'
	import Dropdown from './elements/Dropdown.svelte'
	import relations from '../constants/relations'
	import Payments from './Payments.svelte'
	import Input from './elements/form/Input.svelte'
	import InputDropdown from './elements/form/InputDropdown.svelte'
	import roles from '../constants/roles'
	import allStatuses from '../constants/statuses'
	import { getUsersRole } from '../utils.js'
	import {
		validateFirstName,
		validateLastName,
		validateDateOfBirth,
		validateIsNotEmpty
	} from '../validators.js'

	import { toast } from '../stores/toastStore.js'

	export let user
	export let query
	export let options
	export let errors = {}
	export let errorsNew = {}
	export let isInMultiPanel = false

	const dispatch = createEventDispatcher()

	let referrer
	let addFamilyMemberForm = {}
	if (process.browser) {
		referrer = localStorage.getItem('referrerUrl')
	}

	let tabs = {
		Personal: {},
		Family: {},
		Payments: {},
		Password: {}
	}
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
		password: ''
	}
	let loading = false
	let activeTab = localStorage.getItem('memberTab')
	let modal
	if (query.tab) activeTab = query.tab
	if (!activeTab) activeTab = 'Personal'

	const { page, session } = stores()

	$: currentUser = $session.currentUser || {}
	$: isLoggedIn = user.uid ? true : false
	$: currentUserRole = getUsersRole(currentUser)

	export const validateAddFamilyMemberForm = () => {
		let isValid = true
		Object.values(addFamilyMemberForm).forEach((input) => {
			const isInputValid = input.validate()
			if (!isInputValid) isValid = false
		})
		return isValid
	}

	export const validate = () => {
		errors = {}
		if (!isLength(user.firstName, { min: 2, max: 30 }))
			errors.firstName = 'First name has to be longer than 2 characters'

		if (!isLength(user.lastName, { min: 2, max: 30 }))
			errors.lastName = 'Last name has to be longer than 2 characters'

		//if (!isEmail(user.email)) errors.email = 'Invalid email'
		/* if (!isMobilePhone.default(user.phone, 'de-CH'))
			errors.phone = 'Invalid phone. Has to be CH number format (+41)' */

		/* if (!isStrongPassword(user.password))
			errors.password =
				'Password is too weak. Rules: Length > 7, Lowercase > 0, Uppercase > 0, Numbers > 0, Symbols > 0' */

		if (isEmpty(errors)) return true
		else return false
	}

	function openModal(e, id) {
		resetModal()
		if (id) {
			newUser = user.family.find((x) => x.id === id)
		}
		modal.showModal()
	}

	async function addNewMember() {
		loading = true
		try {
			newUser.dateOfBirth = new Date(newUser.dateOfBirth)
			newUser.familyHead = false
			if (newUser.id) {
				const chnagedUser = await fetch('/api/user/edit.json', {
					method: 'POST',
					body: JSON.stringify(newUser),
					headers: {
						'Content-Type': 'application/json'
					}
				})
				const data = await chnagedUser.json()
				user.family = user.family.map((x) => {
					if (x.id === newUser.id) {
						return { ...x, ...data.data.update_users.returning[0] }
					} else return x
				})
			} else {
				newUser.familyId = user.familyId
				newUser.type = 'member'
				const addedUser = await fetch('/api/user/create.json', {
					method: 'POST',
					body: JSON.stringify(newUser),
					headers: {
						'Content-Type': 'application/json'
					}
				})
				const data = await addedUser.json()
				user.family = [...user.family, data]
			}

			loading = false
		} catch (error) {
			console.log(error)
			loading = false
			if (error.code === 'auth/email-already-in-use')
				errors.email = 'The email address is already in use by another account.'
		}
	}
	function resetModal() {
		Object.values(addFamilyMemberForm).forEach((input) => {
			input.resetErrors()
		})
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
			password: ''
		}
	}

	const handleSubmit = async (e) => {
		e.preventDefault()
		loading = true
		const isValid = validate()

		if (isValid) {
			const updatedUser = {
				...user,
				dateOfBirth: new Date(user.dateOfBirth)
			}
			try {
				const response = await fetch('/api/user/edit.json', {
					method: 'POST',
					body: JSON.stringify(updatedUser),
					headers: {
						'Content-Type': 'application/json'
					}
				})
				if(!response.ok) throw new Error('Could not save user')
				loading = false
				dispatch('update', user)
				toast.set({
					position: 'top right',
					class: 'success',
					showIcon: 'fas fa-save',
					message: `Saved`,
					closeOnClick: true
				})
			} catch (error) {
				console.log(error)
				toast.set({
					position: 'top right',
					class: 'error',
					showIcon: 'far fa-exclamation-triangle',
					message: `Something went wrong`,
					closeOnClick: true
				})
				loading = false
			}
		} else {
			loading = false
		}
	}
	async function deleteFamilyMember() {
		if (confirm('Are you sure you want to delete this family member?')) {
			user.family = user.family.filter((x) => x.id !== newUser.id)
			await fetch('/api/user/delete.json', {
				method: 'DELETE',
				body: JSON.stringify({ id: newUser.id }),
				headers: {
					'Content-Type': 'application/json'
				}
			})
		}
	}

	function onPaymentChange(e) {
		const { detail: changedPayments } = e
		user.payments = changedPayments
		dispatch('update', user)
	}

	function handleTabChange(e) {
		const { detail: newTab } = e
		localStorage.setItem('memberTab', newTab)
	}
</script>

<style lang="scss">
	.body-header {
		justify-content: center;
	}
	.family.table {
		tr {
			cursor: pointer;
			&:hover {
				background: rgba(0, 0, 0, 0.05);
				color: rgba(0, 0, 0, 0.95);
			}
		}
	}
	.horizontal.divider.header {
		margin-top: 3rem;
		margin-bottom: 2rem;
	}
	.back-arrow {
		font-size: 20px;
		color: var(--primary-text);
		margin-right: 20px;
		&:hover {
			color: var(--secondary-text);
		}
	}
</style>

{#if !isInMultiPanel}
	<div class="body-header">
		{#if referrer}
			<a href={referrer} class="back-arrow">
				<i class="fas fa-arrow-left" />
			</a>
		{/if}
		<h1>{user.firstName} {user.lastName}</h1>
	</div>
{/if}

<VerticalTabs bind:tabs bind:activeTab on:change={handleTabChange} />
<div style="margin-bottom: 30px;" />
{#if activeTab === 'Personal'}
	<form class="ui form">
		<!-- <h4 class="ui dividing header">Personal Information</h4> -->
		<!-- <h4 class="ui horizontal divider header">
				<i class="far fa-user icon" />
				{$_('Personal')}
			</h4> -->
		<div class="three fields">
			<div class="field">
				<label>{$_('FirstName')}</label>
				<input type="text" placeholder={$_('FirstName')} bind:value={user.firstName} />
			</div>
			<div class="field">
				<label>{$_('LastName')}</label>
				<input type="text" placeholder={$_('LastName')} bind:value={user.lastName} />
			</div>
			<div class="field">
				<label>{$_('Email')}</label>
				<input type="text" placeholder={$_('Email')} bind:value={user.email} />
			</div>
		</div>
		<div class="three fields">
			<div class="field">
				<label>{$_('Phone')}</label>
				<input type="text" placeholder={$_('Phone')} bind:value={user.phone} />
			</div>
			<div class="field">
				<label>{$_('DateOfBirth')}</label>
				<input type="date" placeholder={$_('DateOfBirth')} bind:value={user.dateOfBirth} />
			</div>
			<div class="field">
				<label>{$_('Job')}</label>
				<input type="text" placeholder={$_('Job')} bind:value={user.job} />
			</div>
		</div>
		<h4 class="ui horizontal divider header">
			<i class="far fa-address-card icon" />
			{$_('Address')}
		</h4>
		<div class="fields">
			<div class="four wide field">
				<label>{$_('Street')}</label>
				<input type="text" placeholder={$_('Street')} bind:value={user.street} />
			</div>
			<div class="two wide field">
				<label>{$_('Zip')}</label>
				<input type="text" placeholder={$_('Zip')} bind:value={user.zip} />
			</div>
			<div class="four wide field">
				<label>{$_('City')}</label>
				<input type="text" placeholder={$_('City')} bind:value={user.city} />
			</div>
			<div class="two wide field">
				<label>{$_('State')}</label>
				<input type="text" placeholder={$_('State')} bind:value={user.state} />
			</div>
			<div class="four wide field">
				<label>{$_('Country')}</label>
				<input type="text" placeholder={$_('Country')} bind:value={user.country} />
			</div>
		</div>
		<!-- <h4 class="ui dividing header">Address of origin</h4> -->
		<h4 class="ui horizontal divider header">
			<i class="far fa-address-card icon" />
			{$_('AddressOfOrigin')}
		</h4>
		<div class="fields">
			<div class="four wide field">
				<label>{$_('Street')}</label>
				<input type="text" placeholder={$_('Street')} bind:value={user.H_street} />
			</div>
			<div class="two wide field">
				<label>{$_('Zip')}</label>
				<input type="text" placeholder={$_('Zip')} bind:value={user.H_zip} />
			</div>
			<div class="four wide field">
				<label>{$_('City')}</label>
				<input type="text" placeholder={$_('City')} bind:value={user.H_city} />
			</div>
			<div class="two wide field">
				<label>{$_('State')}</label>
				<input type="text" placeholder={$_('State')} bind:value={user.H_state} />
			</div>
			<div class="four wide field">
				<label>{$_('Country')}</label>
				<input type="text" placeholder={$_('Country')} bind:value={user.H_country} />
			</div>
		</div>
		<h4 class="ui horizontal divider header">
			<i class="far fa-info icon" />
			{$_('Extras')}
		</h4>
		<div class="two fields">
			{#if currentUserRole === 'super-admin'}
				<div class="field">
					<label for="role"> <span>Role</span> </label>
					<Dropdown bind:value={user.role}>
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
				<Dropdown bind:value={user.status}>
					{#each Object.entries(allStatuses) as status}
						<div class="item" data-value={status[0]}>
							{$_(status[0])}
						</div>
					{/each}
				</Dropdown>
			</div>
		</div>
		<button class="ui positive button" on:click={handleSubmit}>{$_('SaveChanges')}</button>
	</form>
	<!-- <pre>{JSON.stringify(user, null, 2)}</pre> -->
{:else if activeTab === 'Payments'}
	<Payments {user} {options} on:change={onPaymentChange} />
{:else if activeTab === 'Family'}
	{#if user.family.length > 1}
		<table class="ui celled single line table family">
			<thead>
				<tr>
					<th>{$_('Relation')}</th>
					<th>{$_('Name')}</th>
					<th>{$_('DateOfBirth')}</th>
					<th>{$_('Age')}</th>
				</tr>
			</thead>
			<tbody>
				{#each user.family as relative}
					{#if !relative.familyHead}
						<tr on:click={(e) => openModal(e, relative.id)}>
							<td>{$_(relative.relationToHead)}</td>
							<td>{relative.firstName} {relative.lastName}</td>
							<td
								>{moment(new Date(relative.dateOfBirth).toUTCString()).format(
									'DD.MM.YYYY'
								)}</td
							>
							<td
								>{moment().diff(
									new Date(relative.dateOfBirth).toUTCString(),
									'years'
								)}</td
							>
						</tr>
					{/if}
				{/each}
			</tbody>
		</table>
	{:else}
		<div>{$_('NoFamilyMembersMessage')}</div>
	{/if}
	<button class="ui button" on:click={openModal}>{$_('AddFamilyMember')}</button>
	<!-- <pre>{JSON.stringify(user, null, 2)}</pre> -->
{:else if activeTab === 'Password'}
	<RecoverPasswordButton email={user.email} />
	<!-- <button class="ui button" type="submit" style="margin: 0 auto; display: block;"
			>Send reset password email</button
		> -->
{/if}

<Modal
	bind:this={modal}
	classNames="small"
	onSubmit={validateAddFamilyMemberForm}
	on:approve={addNewMember}
>
	<div class="header" slot="header">
		{#if newUser.id}
			{$_('EditFamilyMember')}
		{:else}
			{$_('AddFamilyMember')}
		{/if}
	</div>
	<div class="scrolling content" slot="content" style="min-height: 270px;">
		<form class="ui form">
			<!-- <h4 class="ui dividing header">Personal Information</h4> -->
			<div class="two fields">
				<Input
					bind:this={addFamilyMemberForm['firstName']}
					label={$_('FirstName')}
					bind:value={newUser.firstName}
					type="text"
					name="firstName"
					validator={validateFirstName}
				/>
				<Input
					bind:this={addFamilyMemberForm['lastName']}
					label={$_('LastName')}
					bind:value={newUser.lastName}
					type="text"
					name="lastName"
					validator={validateLastName}
				/>
			</div>

			<div class="two fields">
				<InputDropdown
					bind:this={addFamilyMemberForm['relationToHead']}
					label={$_('RelationToMe')}
					bind:value={newUser.relationToHead}
					validator={validateIsNotEmpty}
					>{#each relations as relation}
						<div class="item" data-value={relation}>
							{$_(relation)}
						</div>
					{/each}
				</InputDropdown>
				<!-- <div class="field">
					<label>{$_('RelationToMe')}</label>
					<Dropdown bind:value={newUser.relationToHead}>
						{#each relations as relation}
							<div class="item" data-value={relation}>
								{$_(relation)}
							</div>
						{/each}</Dropdown
					>
				</div> -->
				<Input
					bind:this={addFamilyMemberForm['dateOfBirth']}
					label={$_('DateOfBirth')}
					bind:value={newUser.dateOfBirth}
					type="date"
					name="dateOfBirth"
					validator={validateDateOfBirth}
				/>
			</div>
		</form>
	</div>
	<div class="actions" slot="actions">
		{#if newUser.id}
			<div
				class="ui negative button"
				style="float: left;"
				on:click={() => {
					deleteFamilyMember()
					modal.hideModal()
				}}
			>
				{$_('Delete')}
			</div>
		{/if}
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
