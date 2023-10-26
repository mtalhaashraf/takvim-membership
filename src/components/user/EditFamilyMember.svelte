<script>
	import { stores } from '@sapper/app'
	import { createEventDispatcher } from 'svelte'
	import isEmpty from 'lodash/isEmpty'
	import isEmail from 'validator/lib/isEmail'
	import isLength from 'validator/lib/isLength'
	import isMobilePhone from 'validator/lib/isMobilePhone'
	import isStrongPassword from 'validator/lib/isStrongPassword'
	import Dropdown from '../elements/Dropdown.svelte'
	import roles from '../../constants/roles'
	import relations from '../../constants/relations'
	import allStatuses from '../../constants/statuses'
	import CountrySelector from '../elements/CountrySelector.svelte'
	import { getUsersRole } from '../../utils.js'

	const dispatch = createEventDispatcher()
	const { page, session } = stores()

	export let user = {
		firstName: '',
		lastName: '',
		dateOfBirth: '',
		relationToHead: '',
		type: 'familyMember',
		role: null
	}
	export let errors = {}

	let currentUser = $session.currentUser || {}
	let currentUserRole = getUsersRole(currentUser)

	export const validate = () => {
		errors = {}
		if (!isLength(user.firstName, { min: 2, max: 30 }))
			errors.firstName = 'First name has to be longer than 2 characters'

		if (!isLength(user.lastName, { min: 2, max: 30 }))
			errors.lastName = 'Last name has to be longer than 2 characters'

		console.log('~ user.dateOfBirth', user.dateOfBirth)
		if (!user.dateOfBirth || user.dateOfBirth === '')
			errors.dateOfBirth = 'Date of birth is required'

		console.log('~ user.relationToHead', user.relationToHead)
		if (!user.relationToHead || user.relationToHead === '')
			errors.relationToHead = 'Relation to head member is required'

		if (isEmpty(errors)) return true
		else return false
	}
</script>

<style lang="scss">
	.edit-family-member-form {
		.container {
			display: flex;
			flex-direction: column;
			margin-bottom: 2rem;
		}
	}
</style>

<div class="edit-family-member-form">
	<form class="ui form container">
		<div class="fields">
			<div class="required field" class:error={errors.firstName}>
				<label for="firstName"> <span>First name</span> </label>
				<div class="icon input">
					<input type="text" name="firstName" bind:value={user.firstName} />
					<i class="fas fa-user icon" />
				</div>
			</div>
			<div class="required field" class:error={errors.lastName}>
				<label for="lastName"> <span>Last name</span> </label>
				<div class="icon input">
					<input type="text" name="lastName" bind:value={user.lastName} />
					<i class="fas fa-user icon" />
				</div>
			</div>
		</div>
		<div class="fields">
			<div class="required field flex-2" class:error={errors.dateOfBirth}>
				<label for="dateOfBirth"> <span>Date of birth</span> </label>
				<div class="icon input">
					<input
						type="date"
						name="dateOfBirth"
						bind:value={user.dateOfBirth}
						placeholder="DD.MM.YYYY"
						style="height: 46.4px;"
					/>
					<i class="fas fa-baby icon" />
				</div>
			</div>
			<div class="required field flex-2" class:error={errors.relationToHead}>
				<label for="relationToHead "> <span>Relation to head of family</span> </label>
				<Dropdown bind:value={user.relationToHead} search>
					{#each relations as relation}
						<div class="item" data-value={relation}>
							{relation}
						</div>
					{/each}
				</Dropdown>
				<!-- <div class="icon input">
						<input type="text" name="relationToHead " bind:value={user.relationToHead} />
						<i class="fas fa-link icon" />
					</div> -->
			</div>
		</div>
	</form>
	{#if Object.keys(errors).findIndex((x) => errors[x]) >= 0}
		<div class="segment">
			<div class="error message">
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
	<slot />
</div>
