<script>
	import { createEventDispatcher } from 'svelte'
	import { v4 as uuidv4 } from 'uuid'

	const dispatch = createEventDispatcher()

	export let checked = false
	export let id = uuidv4()

	const handleChange = (e) => {
		dispatch('change', id)
	}
</script>

<style lang="scss">
	.cbx {
		-webkit-user-select: none;
		user-select: none;
		cursor: pointer;
		border-radius: 6px;
		overflow: hidden;
		transition: all 0.2s ease;
		margin: 0 !important;
		display: inline-block;
		padding: 1px;
	}
	.cbx:hover {
		//background: var(--secondary-background-color);
	}
	.cbx span {
		float: left;
		vertical-align: middle;
		transform: translate3d(0, 0, 0);
	}
	.cbx span:first-child {
		position: relative;
		width: 18px;
		height: 18px;
		border-radius: 4px;
		transform: scale(1);
		//border: 1px solid var(--secondary-background-color);
		transition: all 0.2s ease;
		box-shadow: 0 1px 1px rgba(0, 16, 75, 0.05);
		background: #151c20;
	}
	.cbx span:first-child svg {
		position: absolute;
		top: 3px;
		left: 2px;
		fill: none;
		stroke: #fff;
		stroke-width: 2;
		stroke-linecap: round;
		stroke-linejoin: round;
		stroke-dasharray: 16px;
		stroke-dashoffset: 16px;
		transition: all 0.3s ease;
		transform: translate3d(0, 0, 0);
	}
	.cbx span:last-child {
		line-height: 18px;
	}
	.cbx:hover span:first-child {
		border-color: #3f4952;
	}
	.inp-cbx {
		position: absolute;
		visibility: hidden;
	}
	.inp-cbx:checked + .cbx span:first-child {
		background: var(--primary-color);
		border-color: #3f4952;
	}
	.inp-cbx:checked + .cbx span:first-child svg {
		stroke-dashoffset: 0;
	}
</style>

<input class="inp-cbx" {id} type="checkbox" bind:checked on:change={handleChange} />
<label class="cbx" for={id}>
	<span>
		<svg width="12px" height="10px">
			<use xlink:href="#check" />
		</svg>
	</span>
</label>
