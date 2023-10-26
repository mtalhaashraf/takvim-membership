<script>
	import { onMount, afterUpdate, createEventDispatcher, tick } from 'svelte'

	const dispatch = createEventDispatcher()

	export let animationDuration = 500
	export let init = false
	export let classNames = ''
	export let isShown = false
	export let onShowStart = null
	export let afterShowStarted = null
	export let onSubmit = null
	export let onHideStart = null
	export let dimmer = {
		transparent: false
	}

	let isAnimating, isMouseDown

	export const showModal = async () => {
		if (onShowStart) {
			const goAhead = onShowStart()
			if (goAhead === false) return
		}
		init = true
		isAnimating = true
		isShown = true
		if (afterShowStarted) {
			await tick()
			afterShowStarted()
		}
		setTimeout(() => {
			isAnimating = false
			dispatch('show')
		}, animationDuration)
	}
	export const hideModal = () => {
		if (onHideStart) {
			const goAhead = onHideStart()
			if (goAhead === false) return
		}
		isAnimating = true
		isShown = false
		setTimeout(() => {
			isAnimating = false
			dispatch('hide')
			init = false
		}, animationDuration)
	}
	export const submit = () => {
		if (onSubmit) {
			const goAhead = onSubmit()
			if (goAhead === false) return
		}
		dispatch('approve')
		hideModal()
	}
	export const handleMouseDown = () => {
		isMouseDown = true
		setTimeout(() => {
			isMouseDown = false
		}, 1000)
	}
	export const handleMouseUp = () => {
		if (isMouseDown) hideModal()
		isMouseDown = false
	}
</script>

<style lang="scss">
	.dimmer {
		z-index: 1001;
		&.transparent {
			pointer-events: none;
			background: transparent;
		}
		&.animating {
			display: flex !important;
			.ui.modal {
				display: block !important;
			}
		}
		&.active {
			display: flex !important;
		}
		.ui.modal {
			pointer-events: initial;
			z-index: 1001;
			:global(.header) {
				border-top-left-radius: 0.28571429rem;
				border-top-right-radius: 0.28571429rem;
			}
			.close.button {
				position: absolute;
				top: 0;
				right: 0;
				color: black;
				z-index: 10;
				font-size: 1.2rem;
				padding: 0.3rem;
				margin: 0.3rem;
				i {
					line-height: 1rem;
					height: 1rem;
					width: 1rem;
				}
			}
		}
	}
</style>

<div
	class="ui dimmer modals page transition {isAnimating
		? isShown
			? 'animating fade in'
			: 'animating fade out'
		: isShown
		? 'visible active'
		: ''}"
	style="animation-duration: {animationDuration}ms;"
	class:transparent={dimmer.transparent}
	on:mousedown={handleMouseDown}
	on:mouseup={handleMouseUp}
>
	<div
		class="ui {classNames} modal transition {isAnimating
			? isShown
				? 'animating scale in'
				: 'animating scale out'
			: isShown
			? 'visible active'
			: ''}"
		style="animation-duration: {animationDuration}ms;"
		on:mousedown|stopPropagation
	>
		<i class="fas fa-times close icon" on:click={hideModal} />
		<slot name="header" />
		<slot />
		<slot name="content" />
		<slot name="actions" />
	</div>
</div>
