<script>
	import { addMessages, init, getLocaleFromNavigator } from 'svelte-i18n'

	import AllSvgs from '../components/sprites/AllSvgs.svelte'
	import MainNav from '../components/MainNav.svelte'
	import AuthWatcher from '../components/AuthWatcher.svelte'
	import Toast from '../components/Toast.svelte'
	import en from '../locale/en.json'
	import de from '../locale/de.json'
	import fr from '../locale/fr.json'

	export let segment = null

	const localeFromNavigator = String(getLocaleFromNavigator())
	let locale, lsLang

	if (process.browser) {
		lsLang = localStorage.getItem('lang')
	}
	if (lsLang) locale = lsLang
	else {
		if (localeFromNavigator.startsWith('en')) locale = 'en'
		else if (localeFromNavigator.startsWith('de')) locale = 'de'
		else if (localeFromNavigator.startsWith('fr')) locale = 'fr'
		else locale = 'en'
	}

	addMessages('en', en)
	addMessages('de', de)
	addMessages('fr', fr)

	init({
		fallbackLocale: 'en',
		initialLocale: locale
	})
</script>

<style lang="scss" global>
	@import '../styles/global.scss';
</style>

<AuthWatcher />
<AllSvgs />
<MainNav />
<main>
	<slot />
	<div class="toast-container">
		<Toast />
	</div>
</main>
