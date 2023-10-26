<script>
	import { toasts } from '../../stores/toastsStore'
	import Toast from './Toast.svelte'
</script>

{#if $toasts.length > 0}
	{#each $toasts as toast (toast.id)}
		<Toast bind:data={toast} />
	{/each}
{/if}
