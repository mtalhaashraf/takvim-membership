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
	export let fields = {
		names: true,
		contacts: true,
		password: false,
		address: true,
		addressOfOrigin: true,
		job: true,
		relationToHead: false,
		dateOfBirth: true,
		roleStatus: true
	}
	export let errors = {}
	export let options
	export let userType = 'member'
	if (userType === 'member' && !user.role) user.role = 'member'

	let currentUser = $session.currentUser || {}
	let currentUserRole = getUsersRole(currentUser)

	let statuses = Object.entries(allStatuses)
		.filter(([key, value]) => {
			return options.statuses.includes(key)
		})
		.reduce((acc, [key, value]) => {
			acc[key] = value
			return acc
		}, {})

	export const validate = () => {
		errors = {}
		if (!isLength(user.firstName, { min: 2, max: 30 }))
			errors.firstName = 'First name has to be longer than 2 characters'

		if (!isLength(user.lastName, { min: 2, max: 30 }))
			errors.lastName = 'Last name has to be longer than 2 characters'

		if (fields.contacts && !isEmail(user.email)) errors.email = 'Invalid email'
		/* if (!isMobilePhone.default(user.phone, 'de-CH'))
			errors.phone = 'Invalid phone. Has to be CH number format (+41)' */

		/* if (!isStrongPassword(user.password))
			errors.password =
				'Password is too weak. Rules: Length > 7, Lowercase > 0, Uppercase > 0, Numbers > 0, Symbols > 0' */

		if (isEmpty(errors)) return true
		else return false
	}
</script>

<style lang="scss">
	.signup-form {
		/* padding-top: 5em; */
		max-width: 50em;
		margin: 0 auto;
		.container {
			display: flex;
			flex-direction: column;
			margin-bottom: 2rem;
		}
		:global(.button) {
			width: 100%;
			font-size: 1.02em;
		}
	}
</style>

<div class="signup-form">
	<form class="container">
		{#if fields.names}
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
		{/if}
		{#if fields.contacts}
			<div class="fields">
				<div class="required-or field" class:error={errors.email}>
					<label for="email"> <span>Email</span> </label>
					<div class="icon input">
						<input type="text" name="email" bind:value={user.email} />
						<i class="fas fa-envelope icon" />
					</div>
				</div>
				<div class="required-or field" class:error={errors.phone}>
					<label for="phone"> <span>Phone</span> </label>
					<div class="icon input">
						<input type="text" name="phone" bind:value={user.phone} />
						<i class="fas fa-phone icon" />
					</div>
				</div>
			</div>
		{/if}
		<!-- {#if fields.password}
			<div class="required field" class:error={errors.password}>
				<label for="password"> <span>Password</span> </label>
				<div class="icon input">
					<input type="text" name="password" bind:value={user.password} />
					<i class="fas fa-lock-alt icon" />
				</div>
			</div>
		{/if} -->
		<div class="fields">
			{#if fields.job}
				<div class="field flex-2" class:error={errors.job}>
					<label for="job"> <span>Job</span> </label>
					<div class="icon input">
						<input type="text" name="job" bind:value={user.job} />
						<i class="fas fa-briefcase icon" />
					</div>
				</div>
			{/if}
			{#if fields.dateOfBirth}
				<div class="field flex-2" class:error={errors.dateOfBirth}>
					<label for="dateOfBirth"> <span>Date of birth</span> </label>
					<div class="icon input">
						<input
							type="date"
							name="dateOfBirth"
							bind:value={user.dateOfBirth}
							placeholder="DD.MM.YYYY"
						/>
						<i class="fas fa-baby icon" />
					</div>
				</div>
			{/if}
		</div>
		{#if fields.address}
			<div class="horizontal divider">Address</div>
			<div class="fields">
				<div class="field flex-2" class:error={errors.street}>
					<label for="street"> <span>Street</span> </label>
					<div class="icon input">
						<input type="text" name="street" bind:value={user.street} />
						<i class="fas fa-road icon" />
					</div>
				</div>
				<div class="field flex-1" class:error={errors.zip}>
					<label for="zip"> <span>Zip</span> </label>
					<div class="icon input">
						<input type="number" name="zip" bind:value={user.zip} />
						<i class="fas fa-hashtag icon" />
					</div>
				</div>
				<div class="field flex-2" class:error={errors.city}>
					<label for="city"> <span>City</span> </label>
					<div class="icon input">
						<input type="text" name="city" bind:value={user.city} />
						<i class="fas fa-city icon" />
					</div>
				</div>
			</div>
			<div class="fields">
				<div class="field flex-2" class:error={errors.state}>
					<label for="state"> <span>State</span> </label>
					<div class="icon input">
						<input type="text" name="state" bind:value={user.state} />
						<i class="fas fa-flag icon" />
					</div>
				</div>
				<div class="field flex-2" class:error={errors.country}>
					<label for="country"> <span>Country</span> </label>
					<!-- <CountrySelector bind:value={user.country} /> -->
					<div class="icon input">
						<input type="text" name="country" bind:value={user.country} />
						<i class="fas fa-globe-americas icon" />
					</div>
				</div>
			</div>
		{/if}
		{#if fields.addressOfOrigin}
			<div class="horizontal divider">Address of origin</div>
			<div class="fields">
				<div class="field flex-2" class:error={errors.H_street}>
					<label for="H_street"> <span>Street</span> </label>
					<div class="icon input">
						<input type="text" name="H_street" bind:value={user.H_street} />
						<i class="fas fa-road icon" />
					</div>
				</div>
				<div class="field flex-1" class:error={errors.H_zip}>
					<label for="H_zip"> <span>Zip</span> </label>
					<div class="icon input">
						<input type="number" name="H_zip" bind:value={user.H_zip} />
						<i class="fas fa-hashtag icon" />
					</div>
				</div>
				<div class="field flex-2" class:error={errors.H_city}>
					<label for="H_city"> <span>City</span> </label>
					<div class="icon input">
						<input type="text" name="H_city" bind:value={user.H_city} />
						<i class="fas fa-city icon" />
					</div>
				</div>
			</div>
			<div class="fields">
				<div class="field flex-2" class:error={errors.H_state}>
					<label for="H_state"> <span>State</span> </label>
					<div class="icon input">
						<input type="text" name="H_state" bind:value={user.H_state} />
						<i class="fas fa-flag icon" />
					</div>
				</div>
				<div class="field flex-2" class:error={errors.H_country}>
					<label for="H_country"> <span>Country</span> </label>
					<!-- <H_CountrySelector bind:value={user.H_country} /> -->
					<div class="icon input">
						<input type="text" name="H_country" bind:value={user.H_country} />
						<i class="fas fa-globe-americas icon" />
					</div>
				</div>
			</div>
		{/if}
		<div class="horizontal divider">Info</div>
		{#if fields.relationToHead}
			<div class="field" class:error={errors.relationToHead}>
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
		{/if}
		{#if fields.roleStatus}
			<div class="fields">
				{#if currentUserRole === 'super-admin'}
					<div class="field" class:error={errors.role}>
						<label for="role"> <span>Role</span> </label>
						<Dropdown bind:value={user.role}>
							{#each Object.entries(roles).filter(([role, values]) => {
								if (currentUserRole !== 'super-admin') {
									return role === 'member'
								} else return true
							}) as [role, values]}
								<div class="item" data-value={role}>
									{role}
								</div>
							{/each}
						</Dropdown>
					</div>
				{/if}
				<div class="field" class:error={errors.status}>
					<label for="status"> <span>Status</span> </label>
					<Dropdown bind:value={user.status}>
						{#each Object.entries(statuses) as status}
							<div class="item" data-value={status[0]}>
								{status[0]}
							</div>
						{/each}
					</Dropdown>
				</div>
			</div>
		{/if}
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
