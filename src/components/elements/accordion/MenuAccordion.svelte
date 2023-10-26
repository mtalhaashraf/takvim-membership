<script>
	import { onMount } from 'svelte'

	export let defaultIsShown = false
	export let isShown = false
	export let disabled = false

	let contentEl, overflow, timeout
	let isMounted = false

	$: if (disabled) isShown = false
	else {
		if (defaultIsShown) isShown = true
	}

	$: if (isShown || !isShown) toggleContent()

	const handleClick = () => {
		if (!disabled) {
			isShown = !isShown
			toggleContent()
		}
	}

	export function toggleContent() {
		clearTimeout(timeout)
		if (contentEl) {
			if (isShown) {
				contentEl.style.maxHeight = `${contentEl.firstElementChild.scrollHeight}px`
				contentEl.style.height = `${contentEl.firstElementChild.scrollHeight}px`
				timeout = setTimeout(() => {
					overflow = true
				}, 300)
			} else {
				contentEl.style.maxHeight = 0
				contentEl.style.height = 0
				overflow = false
			}
		}
	}

	onMount(() => {
		toggleContent()
	})
</script>

<div class="accordion">
	<div class="title" class:active={isShown} class:disabled on:click={handleClick}>
		<slot name="title" />
	</div>

	<div class="content" class:active={isShown} class:overflow bind:this={contentEl}>
		<slot name="content" />
	</div>
</div>
{#if false}
	<slot />
{/if}
