<script>
	import { onMount, createEventDispatcher } from 'svelte'
	import InputErrors from './InputErrors.svelte'

	export let label
	export let value
	export let type
	export let name
	export let icon
	export let iconSide = 'left'
	export let validator
	export let errorPosition = 'top right'
	export let errorPointingTo = 'below'

	let errors = []

	const dispatch = createEventDispatcher()

	export function validate() {
		resetErrors()
		if (validator) {
			const isValid = validator(value)
			if (isValid === true) {
				return true
			} else {
				errors = isValid
				return false
			}
		}
		return true
	}

	export function resetErrors() {
		errors = []
	}

	function handleKeyDown(e) {
		dispatch('keydown', e)
	}
	function handleInput(e) {
		/* if (type === 'date') */
		value = e.target.value
		if (errors.length > 0) validate()
	}
</script>

<div class="field" class:error={errors.length > 0}>
	<label for={name}> <span>{label}</span> </label>
	<div class="ui {icon ? `${iconSide} icon` : ''} input">
		<input
			{type}
			{name}
			{value}
			on:input={handleInput}
			on:keydown={handleKeyDown}
			on:blur={validate}
		/>
		{#if icon}
			<i class="{icon} icon" />
		{/if}
		<InputErrors position={errorPosition} pointingTo={errorPointingTo} {errors} />
	</div>
</div>
