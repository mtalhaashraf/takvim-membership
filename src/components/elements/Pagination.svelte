<script>
	import { createEventDispatcher } from 'svelte'

	export let pageCount
	export let activePage

	const dispatch = createEventDispatcher()

	let shownCount = 6

	let fakeActive
	let pages

	const handleResize = (e) => {
		if (process.browser) {
			const large = window.matchMedia('(min-width: 550px)')
			if (large.matches) shownCount = 6
			else shownCount = 2
		}
	}
	const handleClick = (e) => {
		dispatch('move', e.target.dataset.page)
	}
	const goToPrev = (e) => {
		if (activePage > 1) dispatch('move', activePage - 1)
	}
	const goToNext = (e) => {
		console.log('~ goToNext', activePage < pageCount, activePage, pageCount)
		if (activePage < pageCount) dispatch('move', activePage + 1)
	}
	const recalc = () => {
		const arr = new Array(pageCount).fill()
		if (activePage - 1 - shownCount / 2 < 0) {
			fakeActive = shownCount / 2 + 1
		} else if (activePage + shownCount / 2 > pageCount) {
			fakeActive = pageCount - shownCount / 2
		} else fakeActive = activePage
		pages = arr.map((x, i) => {
			if (i === 0 || i === pageCount - 1) return 1
			else if (fakeActive - shownCount / 2 === i + 1) return 2
			else if (fakeActive + shownCount / 2 === i + 1) return 2
			else if (fakeActive - shownCount / 2 < i + 1 && i + 1 < fakeActive + shownCount / 2)
				return 1
			else return 0
		})
	}

	$: if (pageCount || activePage || shownCount) {
		recalc()
	}
</script>

<style lang="scss">
	.container {
		width: 100%;
		text-align: center;
		margin: 2rem 0 1rem 0;
		.pagination {
			.item {
				&.active {
					background: var(--primary-color);
					color: white;
					font-weight: 800;
				}
			}
		}
	}
</style>

<svelte:window on:resize={handleResize} />

{#if pageCount > 1}
	<div class="container">
		<div class="ui pagination menu">
			<a class="item" on:click={goToPrev} class:disabled={activePage === 1}>
				<i class="fas fa-chevron-left" />
			</a>
			{#each pages as page, i}
				{#if page === 1}
					<a
						class="item"
						class:active={i + 1 === activePage}
						data-page={i + 1}
						on:click={handleClick}>{i + 1}</a
					>
				{:else if page === 2 && shownCount > 2}
					<div class="disabled item">...</div>
				{/if}
			{/each}
			<a class="item" on:click={goToNext} class:disabled={activePage === pageCount}>
				<i class="fas fa-chevron-right" />
			</a>
		</div>
	</div>
{/if}
