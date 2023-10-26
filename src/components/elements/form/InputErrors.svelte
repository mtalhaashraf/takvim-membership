<script>
	export let errors = []
	export let position = 'top right'
	export let pointingTo = 'below'
</script>

{#if false && errors && errors.length > 0}
	<div class="ui pointing {pointingTo} basic label {position}">
		{#each errors as message}
			<div>{message}</div>
		{/each}
	</div>
{/if}
