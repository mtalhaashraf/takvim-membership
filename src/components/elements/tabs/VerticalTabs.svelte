<script>
	import { createEventDispatcher } from 'svelte'
	import { goto } from '@sapper/app'
	import { _ } from 'svelte-i18n'
	import { urlQueryToObject, objectToUrlQuery, addOrModifyQuery } from '../../../utils'
	export let tabs
	export let activeTab
	export let redirect = true

	const dispatch = createEventDispatcher()

	function handleClick(tab) {
		const { origin, pathname, search } = window.location
		const changes = {
			tab: tab
		}
		const query = addOrModifyQuery(search, changes)

		activeTab = tab
		dispatch('change', tab)
		if (redirect) goto(`${origin}${pathname}?${query}`)
	}
</script>

<style lang="scss">
	.tabs-container {
		width: 100%;
		display: flex;
		flex-direction: row;
		justify-content: space-evenly;
		a {
			color: var(--primary-text);
			padding: 0.8em 1em;
			display: block;
			border-radius: 0.6em;
			transition: color 250ms ease, background 250ms ease;
			border: 0;
			background: transparent;
			text-align: start;
			cursor: pointer;
			&.active {
				background: var(--hover-overlay);
				color: var(--primary-color);
			}
			&:hover {
				color: white;
				background: var(--primary-color);
			}
			margin: 0 1rem;
			span {
				font-size: 1.1em;
				font-weight: 600;
			}
		}
	}
</style>

<div class="tabs-container">
	{#each Object.entries(tabs) as [name, val], index}
		<a class="item" class:active={activeTab === name} on:click={() => handleClick(name)}>
			<span>{$_(name)}</span>
		</a>
	{/each}
</div>
