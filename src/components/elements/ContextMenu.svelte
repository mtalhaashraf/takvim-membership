<script>
	import { onMount, onDestroy, tick } from 'svelte'

	//import { popupMenu } from '../../../stores/popupMenuStore.js'
	export let position = 'bottom right'
	export let menuIcon = 'far fa-ellipsis-h'
	export let classNames
	export let hiding = false
	export let active

	/* $: if ($popupMenu.hideAll) {
		isMenuShown = false
		isAnimating = false
		popupMenu.set({ ...$popupMenu, hidden: $popupMenu.hidden + 1 })
	}
	$: if ($popupMenu.count !== 0 && $popupMenu.count === $popupMenu.hidden) {
		popupMenu.set({ ...$popupMenu, hideAll: false, hidden: 0 })
	} */

	let isMenuShown = false
	let isAnimating = false
	let animationDuration = 200
	let menuPosition = null
	let pos = {
		top: 0,
		left: 0
	}
	export function setPosition(coords) {
		pos = {
			top: coords.top,
			left: coords.left
		}
	}

	const handleWindowClick = (e) => {
		if (isAnimating === false && isMenuShown) hideMenu()
	}
	export const toggleMenu = (coords) => {
		if (isAnimating === false) {
			if (isMenuShown !== true) {
				/* const boundingBox = e.target.getBoundingClientRect()
				console.log('~ boundingBox', boundingBox)
				menuPosition = boundingBox */
				setPosition(coords)
				showMenu()
			} else {
				hideMenu()
			}
		}
	}
	export const hideMenu = () => {
		active = false
		isAnimating = 2
		setTimeout(() => {
			isMenuShown = false
			isAnimating = false
		}, animationDuration)
	}
	const showMenu = async () => {
		//popupMenu.set({ ...$popupMenu, hideAll: true })
		await tick()
		active = true
		isAnimating = 1
		setTimeout(() => {
			isMenuShown = true
			isAnimating = false
		}, animationDuration)
	}

	function hideOthers() {
		elements.forEach((element) => {
			if (element !== audio) element.pause()
		})
	}
	/* onMount(() => {
		popupMenu.set({ ...$popupMenu, count: $popupMenu.count + 1 })
	})
	onDestroy(() => {
		popupMenu.set({ ...$popupMenu, count: $popupMenu.count - 1 })
	}) */
</script>

<style lang="scss">
	:global(.more) {
		position: relative;
		width: 32px;
		height: 32px;
		border-radius: 16px;
		color: var(--primary-text);
		display: inline-flex;
		align-items: center;
		justify-content: center;
		align-self: center;
		margin-left: 4px;
		align-self: flex-end;
		margin-bottom: 0.21rem;
		cursor: pointer;
		&.hiding {
			visibility: hidden;
		}
		&:hover,
		&.active {
			background: var(--hover-overlay);
		}
	}

	.context-menu {
		position: absolute !important;
		padding: 4px !important;
		border-radius: 8px !important;
		min-width: 150px !important;
		z-index: 1900;
		line-height: 1.4285em;
		max-width: 250px;
		background: #fff;
		font-weight: 400;
		font-style: normal;
		color: rgba(0, 0, 0, 0.87);
		box-shadow: 0 1px 10px 0 rgba(0, 0, 0, 0.4);
		&.bottom {
			margin-top: 12px;
			top: 100%;
		}
		&.left {
			right: 0;
		}
		&.right {
			left: 0;
		}
		&.visible {
			transform: translateZ(0);
			backface-visibility: hidden;
		}
		&.animating,
		&.visible {
			display: block;
		}
	}
	.context-menu-container {
		position: absolute;
		cursor: pointer;
		width: 0;
		height: 0;
	}

	:global(.context-menu .ctx-button),
	:global(.context-menu a) {
		color: var(--primary-text);
		display: block;
		padding: 12px 8px;
		font-weight: 500;
		border-radius: 4px;
		cursor: pointer;
		white-space: nowrap;
		&:hover {
			background: var(--hover-overlay);
		}
	}
	:global(.context-menu .ctx-button i),
	:global(.context-menu a i) {
		margin-right: 4px;
	}
</style>

<svelte:window on:click={handleWindowClick} />

<div
	class="context-menu-container {classNames ? classNames : ''}"
	class:active={isMenuShown || isAnimating === 1}
	class:hiding
	style="top: {pos.top}px; left: {pos.left}px;"
>
	<slot name="label" />
	<div
		class={`basic popup context-menu transition ${position} ${
			isMenuShown ? 'visible' : 'hidden'
		} ${
			isAnimating === 1
				? 'animating scale in'
				: isAnimating === 2
				? 'animating scale out'
				: ''
		}`}
	>
		<div class="container">
			<slot />
		</div>
	</div>
</div>
