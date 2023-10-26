<script>
	import Dropdown from './Dropdown.svelte'
	import countries from '../../constants/countries'

	export let country
</script>

<Dropdown bind:value={country} search>
	{#each Object.entries(countries) as country}
		<div class="item" data-value={country[0]}>
			{country[0]}
		</div>
	{/each}
</Dropdown>
