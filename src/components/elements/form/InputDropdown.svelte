<script>
	import InputErrors from './InputErrors.svelte'
	import Dropdown from '../Dropdown.svelte'

	export let label
	export let value
	export let validator
	export let errorPosition = 'top right'
	export let errorPointingTo = 'below'

	let errors = []

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
</script>

<div class="field" class:error={errors.length > 0}>
	<label> <span>{label}</span> </label>
	<Dropdown bind:value on:select={validate}>
		<slot />
	</Dropdown>
	<InputErrors position={errorPosition} pointingTo={errorPointingTo} {errors} />
</div>
