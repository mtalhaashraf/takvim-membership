<script>
	import { removeToastId } from '../../stores/toastsStore'

	export let data
	console.log('~ data', data)

	function deleteToast() {
		removeToastId(data.id)
	}

	/* if (data.displayTime > 0 || !data.displayTime) {
		const timeToHide = data.displayTime || 5000
		setTimeout(() => {
			deleteToast()
		}, timeToHide)
	} */
</script>

<div class="toast {data.class || ''}" on:click={deleteToast}>
	{data.message}
</div>
