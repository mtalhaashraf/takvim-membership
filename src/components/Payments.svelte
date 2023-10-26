<script>
	import { goto, stores } from '@sapper/app'
	import { onMount, createEventDispatcher } from 'svelte'
	import moment from 'moment'
	import isEmpty from 'lodash/isEmpty'
	import { _ } from 'svelte-i18n'

	import Unauthorized from './elements/messages/Unauthorized.svelte'
	import ContextMenu from './elements/ContextMenu.svelte'
	import Checkbox from './elements/Checkbox.svelte'
	import Dropdown from './elements/Dropdown.svelte'
	import Modal from './elements/Modal.svelte'
	import VerticalTabs from './elements/tabs/VerticalTabs.svelte'

	export let options
	export let user

	const dispatch = createEventDispatcher()

	let payments = []
	let memberId = null

	$: if (user) {
		payments = user.payments || []
		memberId = user.id || null
	}

	const { page, session } = stores()

	let currentUser = $session.currentUser || {}
	$: isLoggedIn = currentUser.uid ? true : false

	let ctxMenu, ctxItemId, period, yearlySummary, year, modal, activeTab, tmpActiveTab, yearly, any

	let newPayment = {
		type: activeTab,
		date: null,
		amount: null,
		updatedAt: new Date(),
		userId: memberId,
		updatedBy: {
			id: (currentUser && currentUser.uid) || null,
			name: currentUser ? currentUser.displayName : null
		},
		note: '',
		year: year || null,
		createNew: true
	}

	let errors = {}

	let tabs = options.paymentTypes.reduce((acc, cur) => {
		if (!tmpActiveTab) tmpActiveTab = cur.name
		acc[cur.name] = {}
		return acc
	}, {})

	$: if (activeTab || payments) {
		yearly = Object.entries(
			payments
				.filter((x) => x.type === activeTab)
				.reduce((acc, cur) => {
					if (acc[cur.year]) {
						let subPayments = acc[cur.year].payments || []
						if (subPayments.length === 0) {
							subPayments.push(acc[cur.year])
						}
						subPayments.push({
							...cur,
							date: moment(new Date(cur.date).toUTCString()).format('DD.MM.YYYY')
						})
						acc[cur.year] = {
							year: acc[cur.year].year,
							amount: acc[cur.year].amount + cur.amount,
							payments: subPayments
						}
					} else {
						acc[cur.year] = {
							...cur,
							date: moment(new Date(cur.date).toUTCString()).format('DD.MM.YYYY')
						}
					}
					return acc
				}, {})
		).sort(([a, aa], [b, bb]) => {
			if (parseInt(a) > parseInt(b)) return -1
			else return 1
		})

		any = payments
			.filter((x) => x.type === activeTab)
			.sort((a, b) => {
				return new Date(b.date) - new Date(a.date)
			})
			.map((x) => ({
				...x,
				date: moment(new Date(x.date).toUTCString()).format('DD.MM.YYYY')
			}))
	}

	/* if (query.tab) activeTab = query.tab
	else  */ activeTab = tmpActiveTab

	function resetModal() {
		newPayment = {
			type: activeTab,
			date: moment(new Date()).format('YYYY-MM-DD'),
			amount: null,
			updatedAt: new Date(),
			userId: memberId,
			updatedBy: {
				id: (currentUser && currentUser.uid) || null,
				name: currentUser ? currentUser.displayName : null
			},
			note: '',
			year: new Date().getFullYear()
		}
		errors = {}
	}

	export const validate = () => {
		errors = {}
		if (!newPayment.date) errors.date = 'Can not be empty'
		if (!newPayment.amount) errors.amount = 'Can not be empty'
		if (period === 'yearly' && !newPayment.year) errors.year = 'Can not be empty'

		if (isEmpty(errors)) return true
		else return false
	}

	$: if (activeTab && payments) {
		let currentOption = options.paymentTypes.find((x) => x.name === activeTab)
		period = currentOption.period
		if (currentOption.period === 'yearly') {
			calculateYearlySummary()
		}
	}

	function calculateYearlySummary() {
		yearlySummary = payments
			.filter((x) => x.type === activeTab)
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
		dispatch('change', payments)
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
	function handleTabChange(e) {
		localStorage.setItem('paymentsTab', e.detail)
	}
	onMount(() => {
		const paymentsTab = localStorage.getItem('paymentsTab')
		if (paymentsTab) {
			activeTab = paymentsTab
		}
	})
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
			margin-left: 20px;
			//background: var(--secondary-background-color);
		}
	}
	.controls {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		margin-bottom: 20px;
	}
	table {
		.selectable {
			cursor: pointer;
			&:hover {
				background: rgba(0, 0, 0, 0.05);
				color: rgba(0, 0, 0, 0.95);
			}
		}
		.collapsible {
			td {
				i {
					transition: transform 200ms ease;
					font-size: 1.2em;
				}
			}
			&.expanded {
				td {
					i {
						transform: rotate(180deg);
					}
				}
			}
		}
		.sub {
			background-color: rgba(0, 0, 50, 0.02);
			display: none;
			&.visible {
				display: table-row;
			}
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
	<div class="controls">
		<div class="ui button" on:click={openModal}>
			<i class="fas fa-plus" /> Add Payment
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
		<!-- <div class="view-mode">
			<span>View mode:&nbsp;&nbsp;&nbsp;</span>
			<Dropdown bind:value={activeTab}>
				{#each options.paymentTypes as option}
					<div class="item" data-value={option.name}>
						{option.name}
					</div>
				{/each}
			</Dropdown>
		</div> -->
	</div>
	<VerticalTabs bind:tabs bind:activeTab redirect={false} on:change={handleTabChange} />
	<div style="margin-bottom: 30px;" />

	<div class="body">
		{#each options.paymentTypes as paymentType}
			{#if activeTab === paymentType.name}
				{#if paymentType.period === 'yearly'}
					<table class="ui celled unstackable table">
						<thead>
							<tr>
								<th>{$_('Year')}</th>
								<th>{$_('Amount')}</th>
								<th>{$_('Date')}</th>
								<th>{$_('Note')}</th>
							</tr>
						</thead>
						<tbody>
							{#each yearly as [year, val]}
								{#if val.payments}
									<tr
										class="collapsible selectable"
										class:expanded={val.visible}
										on:click={() => {
											val.visible = !val.visible
										}}
									>
										<td>{year}</td>
										<td>{val.amount} CHF</td>
										<td
											>{val.payments.length} payments
											<i class="far fa-angle-down" /></td
										>
										<td />
									</tr>
									{#each val.payments as payment}
										<tr
											class="sub selectable"
											class:visible={val.visible}
											on:click={(e) => openModal(e, payment.id)}
											data-id={payment.id}
										>
											<td>{payment.year}</td>
											<td>{payment.amount} CHF</td>
											<td>{payment.date}</td>
											<td>{payment.note}</td>
										</tr>
									{/each}
								{:else}
									<tr class="selectable" on:click={(e) => openModal(e, val.id)}>
										<td>{year}</td>
										<td>{val.amount} CHF</td>
										<td>{val.date}</td>
										<td>{val.note}</td>
									</tr>
								{/if}
							{/each}
						</tbody>
					</table>
				{:else if paymentType.period === 'any'}
					<table class="ui celled selectable unstackable table">
						<thead>
							<tr>
								<th>{$_('Amount')}</th>
								<th>{$_('Date')}</th>
								<th>{$_('Note')}</th>
							</tr>
						</thead>
						<tbody>
							{#each any as donation}
								<tr on:click={(e) => openModal(e, donation.id)}>
									<td>{donation.amount} CHF</td>
									<td>{donation.date}</td>
									<td>{donation.note}</td>
								</tr>
							{/each}
						</tbody>
						<tfoot>
							<tr>
								<th style="font-weight: bold;"
									>Total <span
										>{payments
											.filter((x) => x.type === paymentType.name)
											.reduce((acc, cur) => {
												return acc + cur.amount
											}, 0)} CHF</span
									></th
								>
								<th />
								<th />
							</tr></tfoot
						>
					</table>
				{/if}
			{/if}
		{/each}
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
			<div class="two fields">
				<div class="field">
					<label>Updated at</label>
					<input
						type="date"
						value={(newPayment.updatedAt &&
							moment(newPayment.updatedAt).format('YYYY-MM-DD')) ||
							''}
						disabled
					/>
				</div>
				<div class="field">
					<label>Updated by</label>
					<input type="text" value={newPayment.updatedBy.name} disabled />
				</div>
			</div>
		</form>
	</div>
	<div class="actions" slot="actions" style="display: flex;">
		{#if newPayment.id}
			<div
				class="ui negative button"
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
			class="ui button"
			on:click={() => {
				modal.hideModal()
			}}
		>
			Cancel
		</div>
		<div class="ui positive button" on:click={() => modal.submit()} style="margin-left: 12px;">
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
