<script>
	import { onMount, onDestroy, createEventDispatcher } from 'svelte'
	import isEmpty from 'lodash/isEmpty'

	export let value = null
	export let values = []
	export let init = false
	export let classNames = ''
	export let menuAlignment = 'left'
	export let isShown = false
	export let onShowStart = null
	export let onHideStart = null
	export let animationDuration = 300
	export let placeholder = ''
	export let multiple = false
	export let search = false
	export let clearable = false
	export let nothingFoundComponent = null

	let searchVal = ''
	let nothingFound = false
	let isAnimating, containerEl, menuContainerEl, searchEl, canvasEl, selectedLabel
	let searchElWidth = 5
	let details = {}

	const dispatch = createEventDispatcher()

	const handleKeyDown = (e) => {
		dispatch('keydown', e)
		const { keyCode } = e
		const activeItem = menuContainerEl.querySelector('.item.selected')
		switch (keyCode) {
			case 13: // ENTER
				e.preventDefault()
				handleItemSelect({ target: activeItem })
				break
			case 9: // TAB
				break
			case 27: // ESC
				e.preventDefault()
				containerEl.blur()
				break
			case 40: // DOWN
				e.preventDefault()
				if (activeItem) {
					const next = nextSiblingWithClass(activeItem, 'item')
					if (next) {
						activeItem.classList.remove('selected')
						next.classList.add('selected')
						next.scrollIntoView({
							block: 'nearest'
						})
					}
				} else {
					menuContainerEl.querySelector('.item').classList.add('selected')
				}

				break
			case 38: // UP
				e.preventDefault()
				if (activeItem) {
					const prev = prevSiblingWithClass(activeItem, 'item')
					if (prev) {
						activeItem.classList.remove('selected')
						prev.classList.add('selected')
						prev.scrollIntoView({
							block: 'nearest'
						})
					}
				} else {
					menuContainerEl.querySelector('.item').classList.add('selected')
				}

				break
		}
	}

	const nextSiblingWithClass = (element, className) => {
		while ((element = element.nextElementSibling)) {
			if (element.classList.contains(className)) {
				if (!element.classList.contains('selhid') && !element.classList.contains('seahid'))
					return element
			}
		}
		return null
	}

	const prevSiblingWithClass = (element, className) => {
		while ((element = element.previousElementSibling)) {
			if (element.classList.contains(className)) {
				if (!element.classList.contains('selhid') && !element.classList.contains('seahid'))
					return element
			}
		}
		return null
	}

	export const showMenu = () => {
		if (!isShown) {
			if (onShowStart) {
				const goAhead = onShowStart()
				if (goAhead === false) return
			}
			init = true
			isAnimating = true
			isShown = true
			setTimeout(() => {
				isAnimating = false
				dispatch('show')
			}, animationDuration)
		}
	}
	export const hideMenu = () => {
		if (isShown) {
			if (onHideStart) {
				const goAhead = onHideStart()
				if (goAhead === false) return
			}
			isAnimating = true
			isShown = false
			searchVal = ''
			searchElWidth = 5
			setTimeout(() => {
				isAnimating = false
				dispatch('hide')
				init = false
			}, animationDuration)
		}
	}

	const handleItemSelect = (e) => {
		if (e.stopPropagation) e.stopPropagation()
		const { target } = e
		const itemValue = target.dataset.value
		if (multiple) {
			if (itemValue) {
				const activeItem = menuContainerEl.querySelector('.item.selected')
				if (activeItem) {
					const next = nextSiblingWithClass(activeItem, 'item')
					const prev = prevSiblingWithClass(activeItem, 'item')
					if (next) {
						activeItem.classList.remove('selected')
						next.classList.add('selected')
						next.scrollIntoView({
							block: 'nearest'
						})
					} else if (prev) {
						activeItem.classList.remove('selected')
						prev.classList.add('selected')
						prev.scrollIntoView({
							block: 'nearest'
						})
					}
				} else {
					menuContainerEl.querySelector('.item').classList.add('selected')
				}
				values = [...values, itemValue]
			} // else return console.error('Missing data-value')
			dispatch('select', values)
		} else {
			if (itemValue) {
				value = itemValue
			} // else return console.error('Missing data-value')
			for (let el of menuContainerEl.children) {
				const elItemValue = el.dataset.value
				if (elItemValue === itemValue) {
					el.classList.add('active')
					el.classList.add('selected')
				} else {
					el.classList.remove('active')
					el.classList.remove('selected')
				}
			}
			dispatch('select', itemValue)
			document.activeElement.blur()
			hideMenu()
		}
		searchVal = ''
	}
	const handleSelectedOptionRemove = (e) => {
		const { target } = e
		const itemValue = target.parentElement.dataset.value
		if (itemValue) {
			values = values.filter((val) => val !== itemValue)
			dispatch('select', values)
		} // else return console.error('Missing data-value')
	}
	export const removeAllSelectedOptions = () => {
		value = null
		values = []
		document.activeElement.blur()
		dispatch('clear')
	}
	const hideSelectedOptions = (e) => {
		if (menuContainerEl && values.length > 0) {
			values.forEach((val) => {
				const el = menuContainerEl.querySelector(`[data-value='${val}']`)
				if (el && !el.classList.contains('selhid')) el.classList.add('selhid')
			})
		} else {
			if (menuContainerEl) {
				for (let el of menuContainerEl.children) {
					if (el.classList.contains('selhid')) el.classList.remove('selhid')
				}
			}
		}
	}
	const handleSearch = () => {
		nothingFound = false
		searchElWidth = getTextWidth(searchVal, '10.3pt Arial') + 1
		if (searchVal !== '') {
			//console.log('ch', menuContainerEl.children)
			for (let el of menuContainerEl.children) {
				const itemLabel = el.innerHTML
				if (itemLabel) {
					el.classList.remove('selected')
					if (itemLabel.toLowerCase().indexOf(searchVal.toLowerCase()) >= 0) {
						if (el.classList.contains('seahid')) el.classList.remove('seahid')
					} else {
						if (!el.classList.contains('seahid')) el.classList.add('seahid')
					}
				}
			}
			const remaining = menuContainerEl.querySelector('.item:not(.selhid):not(.seahid)')
			if (remaining) {
				remaining.classList.add('selected')
			} else nothingFound = true
		} else {
			if (multiple) {
				for (let el of menuContainerEl.children) {
					if (el.classList.contains('seahid')) el.classList.remove('seahid')
					el.classList.remove('selected')
				}
				const remaining = menuContainerEl.querySelector('.item:not(.selhid):not(.seahid)')
				if (remaining) {
					remaining.classList.add('selected')
				} else nothingFound = true
			} else {
				for (let el of menuContainerEl.children) {
					if (el.classList.contains('seahid')) el.classList.remove('seahid')
				}
			}
		}
	}
	const getSelectedLabel = () => {
		selectedLabel = null
		if (menuContainerEl) {
			for (let el of menuContainerEl.children) {
				const itemValue = el.dataset.value
				if (itemValue === value) {
					selectedLabel = el.innerHTML //el.outerHTML
				}
			}
		}
	}
	function getTextWidth(text, font) {
		var context = canvasEl.getContext('2d')
		if (font) context.font = font
		var metrics = context.measureText(text)
		return metrics.width
	}
	$: if (values) hideSelectedOptions()
	$: if (value) getSelectedLabel()
	$: if (!value) selectedLabel = null
	$: if (init && (searchVal || searchVal === '')) handleSearch()
	onMount(() => {
		if (process.browser) {
			menuContainerEl.addEventListener('click', handleItemSelect)
		}
		if (value) getSelectedLabel()
		if (multiple) hideSelectedOptions()
		for (let el of menuContainerEl.children) {
			const itemLabel = el.innerHTML
			const itemValue = el.dataset.value
			details[itemValue] = {
				label: itemLabel
			}
			if (itemValue === value) {
				el.classList.add('active')
				el.classList.add('selected')
			}
		}
	})
	onDestroy(() => {
		if (process.browser) {
			menuContainerEl.removeEventListener('click', handleItemSelect)
		}
	})
</script>

<style lang="scss">
	.ui.dropdown {
		min-width: unset !important;
		input {
			box-sizing: border-box;
		}
		.ui.label {
			outline: 0 !important;
		}
		.remove.icon {
			outline: 0 !important;
		}
		.text {
			&.hidden {
				visibility: hidden;
			}
		}
	}
</style>

<div
	class={`ui selection dropdown ${classNames} ${
		isAnimating ? 'visible' : isShown ? 'visible active' : ''
	}`}
	class:multiple
	class:search
	bind:this={containerEl}
	on:keydown={handleKeyDown}
	on:focusin={(e) => {
		if (e.target.classList.contains('remove') || e.target.classList.contains('label')) {
		} else {
			showMenu()
			if (search) searchEl.focus()
		}
	}}
	on:blur={(e) => {
		if (!containerEl.contains(e.relatedTarget)) hideMenu()
	}}
	tabindex="-1"
>
	{#if multiple}
		{#if values.length === 0 && searchVal === ''}
			<div class="default text">{placeholder}</div>
		{/if}
	{:else}
		<div
			class={value ? 'text' : 'default text'}
			class:hidden={search && isShown && searchVal !== ''}
			on:click={() => {
				if (search) searchEl.focus()
			}}
		>
			{#if selectedLabel}
				{@html selectedLabel}
			{:else}{placeholder}{/if}
		</div>
	{/if}
	<i class="dropdown icon" />
	{#if multiple}
		{#if clearable && values.length > 0}
			<i
				class="fas fa-times remove icon"
				tabindex="-1"
				on:click|stopPropagation={removeAllSelectedOptions}
			/>
		{/if}
		{#if !isEmpty(details)}
			{#each values as val}
				<a
					class="ui green label transition visible"
					tabindex="-1"
					data-value={val}
					on:click|stopPropagation
					>{details[val] && details[val].label}
					<i
						class="fas fa-times delete icon"
						on:click|stopPropagation={handleSelectedOptionRemove}
					/></a
				>
			{/each}
		{/if}
	{:else if clearable && value}
		<i
			class="fas fa-times remove icon"
			tabindex="-1"
			on:click|stopPropagation={removeAllSelectedOptions}
		/>
	{/if}
	{#if search}
		{#if multiple}
			<input
				bind:value={searchVal}
				class="search"
				autocomplete="off"
				bind:this={searchEl}
				style="width: {searchElWidth}px; position: relative; z-index: 2;"
				tabindex="0"
				on:blur={(e) => {
					if (!containerEl.contains(e.relatedTarget)) hideMenu()
				}}
			/>
		{:else}
			<input
				bind:value={searchVal}
				class="search"
				autocomplete="off"
				bind:this={searchEl}
				style="width: 100%; z-index: 2;"
				tabindex="0"
				on:blur={(e) => {
					if (!containerEl.contains(e.relatedTarget)) hideMenu()
				}}
			/>
		{/if}
	{/if}
	<div
		class={`menu transition ${menuAlignment} ${
			isAnimating
				? isShown
					? 'slide in down'
					: 'slide out up'
				: isShown
				? 'visible'
				: 'hidden'
		}`}
		bind:this={menuContainerEl}
		tabindex="-1"
		style={`animation-duration: ${animationDuration}ms;${init ? 'display: block;' : ''}`}
	>
		<slot />
		{#if nothingFound}
			{#if nothingFoundComponent}
				<svelte:component
					this={nothingFoundComponent}
					on:click={() => dispatch('addCustomOption')}
				/>
			{:else}
				<div class="message">No results found.</div>
			{/if}
		{/if}
	</div>
</div>
<canvas style="display: none" bind:this={canvasEl} />
