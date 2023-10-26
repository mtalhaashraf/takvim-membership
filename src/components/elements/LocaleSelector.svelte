<script>
	import { _, locale } from 'svelte-i18n'
	import { onMount } from 'svelte'

	import Dropdown from './Dropdown.svelte'
	import locales from '../../constants/locales.js'

	const handleSelect = (e) => {
		let lang = e.detail
		localStorage.setItem('lang', lang)
		locale.set(lang)
	}
</script>

<Dropdown value={$locale} on:select={handleSelect} placeholder="English">
	{#each Object.keys(locales) as loc}
		<li class="item" data-value={loc} data-label={locales[loc].name} role="option">
			{locales[loc].name}
		</li>
	{/each}
</Dropdown>
