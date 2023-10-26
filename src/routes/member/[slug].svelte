<script context="module">
	export async function preload({ params, query }, session) {
		const userPromise = this.fetch(`member/${params.slug}.json`)
		const optionsPromise = this.fetch(`api/mosque/options.json`)

		const [userRes, optionsRes] = await Promise.all([userPromise, optionsPromise])

		if (userRes.status === 200 && optionsRes.status === 200) {
			const userData = await userRes.json()
			const optionsData = await optionsRes.json()
			return { user: userData, query, options: optionsData }
		} else {
			//this.error(res.status, data.message)
		}
	}
</script>

<script>
	import MemberView from '../../components/MemberView.svelte'

	export let user
	export let query
	export let options
</script>

<main id="body-container">
	<MemberView {user} {query} {options} />
</main>
