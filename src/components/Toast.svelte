<script>
	import { onDestroy } from 'svelte'
	import { toast } from '../stores/toastStore'
	import isEmpty from 'lodash/isEmpty'

	const toastUnsubscribe = toast.subscribe((value) => {
		if (!isEmpty(value)) {
			if (process.browser) window.$('body').toast({ ...value })
		}
	})

	onDestroy(() => {
		toastUnsubscribe()
	})
</script>
