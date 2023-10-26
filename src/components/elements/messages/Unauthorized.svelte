<script>
	import { _ } from 'svelte-i18n'
</script>

<div class="ui icon warning message">
	<i class="fal fa-exclamation-triangle icon" />
	<div class="content">
		<h2>{$_('UnauthorizedUser')}</h2>
		<p>{$_('UnauthorizedUserMessage')}</p>
	</div>
</div>
