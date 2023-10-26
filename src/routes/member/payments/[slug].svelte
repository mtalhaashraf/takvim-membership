<script context="module">
	export async function preload({ params, query }) {
		const paymentsRes = await this.fetch(`api/payments/getByUser/${params.slug}.json`)
		const optionsRes = await this.fetch(`api/mosque/options.json`)
		const paymentsData = await paymentsRes.json()
		const optionsData = await optionsRes.json()

		if (paymentsRes.status === 200 && optionsRes.status === 200) {
			return {
				payments: paymentsData,
				options: optionsData,
				isAuthorized: true,
				memberId: params.slug
			}
		} else {
			this.error(paymentsRes.status, paymentsData.message)
			return { isAuthorized: false }
		}
	}
</script>

<script>
	import { goto, stores } from '@sapper/app'
	import { onMount } from 'svelte'
	import moment from 'moment'
	import isEmpty from 'lodash/isEmpty'

	import Unauthorized from '../../../components/elements/messages/Unauthorized.svelte'
	import ContextMenu from '../../../components/elements/ContextMenu.svelte'
	import Checkbox from '../../../components/elements/Checkbox.svelte'
	import Dropdown from '../../../components/elements/Dropdown.svelte'
	import Modal from '../../../components/elements/Modal.svelte'

	export let payments
	$: sortedPayments = payments
		.filter((x) => x.type === viewMode)
		.filter((x) => {
			if (!year || period !== 'yearly') return true
			if (parseInt(x.year) === parseInt(year)) return true
			else return false
		})
		.sort((a, b) => {
			if (a.date < b.date) return -1
			else return 1
		})
	//$: console.log('~ payments', payments)
	export let options
	export let isAuthorized
	export let memberId

	const { page, session } = stores()

	$: user = $session.currentUser || {}
	$: isLoggedIn = user.uid ? true : false

	let ctxMenu, ctxItemId, period, yearlySummary, year, modal
	let viewMode = options.paymentTypes[0].name

	let newPayment = {
		type: viewMode,
		date: null,
		amount: null,
		updatedAt: new Date(),
		userId: $page.params.slug,
		updatedBy: {
			id: (user && user.uid) || null,
			firstName: 'me',
			lastName: ''
		},
		note: '',
		year: year || null,
		createNew: true
	}
	let errors = {}

	function resetModal() {
		newPayment = {
			type: viewMode,
			date: null,
			amount: null,
			updatedAt: new Date(),
			userId: $page.params.slug,
			updatedBy: {
				id: (user && user.uid) || null,
				firstName: 'me',
				lastName: ''
			},
			note: '',
			year: year || null
		}
	}

	export const validate = () => {
		errors = {}
		if (!newPayment.date) errors.date = 'Can not be empty'
		if (!newPayment.amount) errors.amount = 'Can not be empty'
		if (period === 'yearly' && !newPayment.year) errors.year = 'Can not be empty'

		if (isEmpty(errors)) return true
		else return false
	}

	$: if (viewMode && payments) {
		let currentOption = options.paymentTypes.find((x) => x.name === viewMode)
		period = currentOption.period
		if (currentOption.period === 'yearly') {
			calculateYearlySummary()
		}
	}

	function calculateYearlySummary() {
		yearlySummary = payments
			.filter((x) => x.type === viewMode)
			.reduce((acc, cur) => {
				if (!cur.year) return acc
				if (acc[cur.year]) acc[cur.year] += cur.amount
				else acc[cur.year] = cur.amount
				return acc
			}, {})
	}

	function openContextMenu(e) {
		ctxItemId = e.currentTarget.dataset.id
		ctxMenu.toggleMenu({ top: e.clientY, left: e.clientX })
	}
	async function handleRowDelete(e) {
		const res = await fetch('/api/payments/delete', {
			method: 'DELETE',
			body: JSON.stringify({ id: ctxItemId, userId: memberId }),
			headers: {
				'Content-Type': 'application/json'
			}
		})
		if (res.ok) {
			payments = payments.filter((x) => x.id !== ctxItemId)
		}
		ctxItemId = null
		ctxMenu.hideMenu()
	}
	async function savePayment(e) {
		console.log('new payment', newPayment)
		if (newPayment.id) {
			const rawResponse = fetch('/api/payments/update', {
				method: 'POST',
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(newPayment)
			})
			payments = payments.map((x) => {
				if (x.id === newPayment.id) {
					return {
						...newPayment,
						updatedAt: new Date()
					}
				} else return x
			})
		} else {
			const rawResponse = await fetch('/api/payments/create', {
				method: 'POST',
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(newPayment)
			})
			const data = await rawResponse.json()
			newPayment.id = data.id
			payments = [...payments, newPayment]
		}
		resetModal()
	}

	function openModal(e, id) {
		if (id) {
			newPayment = payments.find((x) => x.id === id)
		} else {
			resetModal()
		}
		modal.showModal()
	}
</script>

<style lang="scss">
	.body {
		display: flex;
		flex-direction: row;
		.data-table {
			align-self: flex-start;
		}
		.payments {
			flex: 1;
		}
		.summary {
			flex: 0 0 auto;
			//background: var(--secondary-background-color);
		}
	}
	h1 {
		span {
			color: var(--secondary-text);
			font-size: 16px;
		}
	}
</style>

<div class="container">
	<div class="header">
		<h1>
			Payments
			<!-- {#if sortedPayments && sortedPayments.length > 0}
				<span
					>for {sortedPayments[0].user.firstName}
					{sortedPayments[0].user.lastName} - id: {sortedPayments[0].user.id}</span
				>
			{/if} -->
		</h1>
		<div class="controls">
			<div class="icon button" on:click={openModal}>
				<i class="fas fa-plus" />
			</div>
			<!-- {#if period === 'yearly' && yearlySummary}
				<div class="spacer" />
				<span>Year:&nbsp;&nbsp;&nbsp;</span>
				<Dropdown bind:value={year} search>
					{#each Object.entries(yearlySummary) as [year, amount]}
						<div class="item" data-value={year}>
							{year}
						</div>
					{/each}
				</Dropdown>
			{/if} -->
			<div class="spacer" />
			<span>View mode:&nbsp;&nbsp;&nbsp;</span>
			<Dropdown bind:value={viewMode}>
				{#each options.paymentTypes as option}
					<div class="item" data-value={option.name}>
						{option.name}
					</div>
				{/each}
			</Dropdown>
		</div>
	</div>
	<div class="body">
		{#if isAuthorized}
			{#if sortedPayments.length > 0}
				<table class="payments data-table with-checkbox">
					<thead>
						<tr>
							<!-- <th /> -->
							<th>Date</th>
							<th>Amount</th>
							<th>Updated at</th>
							<th>Updated by</th>
							<th>Note</th>
							{#if period === 'yearly'}
								<th>Year</th>
							{/if}
						</tr>
					</thead>
					<tbody>
						{#each sortedPayments as payment (payment.id)}
							<tr
								on:click={(e) => openModal(e, payment.id)}
								data-id={payment.id}
								class:active={ctxItemId === payment.id}
							>
								<!-- <td><Checkbox bind:checked={payment.checked} /></td> -->
								<td>
									{(payment.date && moment(payment.date).format('DD.MM.YYYY')) ||
										''}</td
								>
								<td>
									{payment.amount}
								</td>
								<td style="white-space: nowrap;"
									>{(payment.updatedAt &&
										moment(payment.updatedAt).format('DD.MM.YYYY')) ||
										''}</td
								>
								<td style="white-space: nowrap;"
									>{payment.updatedBy.firstName} {payment.updatedBy.lastName}</td
								>
								<td>
									{payment.note}
								</td>
								{#if period === 'yearly'}
									<td>{payment.year}</td>
								{/if}
							</tr>
						{/each}
					</tbody>
					{#if viewMode === 'donations'}
						<tfoot>
							<tr>
								<th />
								<th />
								<th style="font-weight: bold;"
									>Total <span
										>{sortedPayments.reduce((acc, cur) => {
											return acc + cur.amount
										}, 0)}</span
									></th
								>
								<th />
							</tr></tfoot
						>
					{/if}
				</table>
				{#if period === 'yearly' && yearlySummary}
					<div class="summary">
						<table class="data-table">
							<thead>
								<tr>
									<th>Year</th>
									<th>Amount</th>
								</tr>
							</thead>
							<tbody>
								{#each Object.entries(yearlySummary) as [_year, amount]}
									<tr
										on:click={() => {
											year = _year
										}}
									>
										<td>{_year}</td>
										<td>{amount}</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				{/if}
			{:else}
				No records yet
			{/if}
		{:else}
			<Unauthorized />
		{/if}
	</div>
</div>

<Modal bind:this={modal} classNames="small" on:approve={savePayment} onSubmit={validate}>
	<div class="header" slot="header">
		{#if newPayment.id}
			Edit
		{:else}
			Add
		{/if}
	</div>
	<div class="scrolling content" slot="content" style="min-height: 270px;">
		<form class="ui form">
			<!-- <h4 class="ui dividing header">Personal Information</h4> -->
			<div class="two fields">
				<div class="required field" class:error={errors.date}>
					<label>Date</label>
					<input type="date" bind:value={newPayment.date} />
				</div>
				<div class="required field" class:error={errors.amount}>
					<label>Amount</label>
					<input type="number" bind:value={newPayment.amount} />
				</div>
			</div>

			<div class="two fields">
				<div class="field">
					<label>Note</label>
					<input type="text" bind:value={newPayment.note} />
				</div>
				<div class="field" class:required={period === 'yearly'} class:error={errors.year}>
					<label>Year</label>
					<input type="number" bind:value={newPayment.year} />
				</div>
			</div>
		</form>
	</div>
	<div class="actions" slot="actions" style="display: flex;">
		{#if newPayment.id}
			<div
				class="negative button"
				on:click={() => {
					if (confirm('Are you sure you want to delete this payment?')) {
						ctxItemId = newPayment.id
						handleRowDelete()
						modal.hideModal()
					}
				}}
			>
				Delete
			</div>
		{/if}
		<div class="spacer" />
		<div
			class="secondary button"
			on:click={() => {
				modal.hideModal()
			}}
		>
			Cancel
		</div>
		<div class="button" on:click={() => modal.submit()} style="margin-left: 12px;">
			<!-- <i class="fas fa-check icon" /> -->
			Confirm
		</div>
	</div>
</Modal>

<ContextMenu classNames="more" hiding bind:this={ctxMenu}>
	<div class="ctx-button" on:click|preventDefault|stopPropagation={handleRowDelete}>
		<i class="far fa-trash fa-fw" /> <span>Delete</span>
	</div>
</ContextMenu>
