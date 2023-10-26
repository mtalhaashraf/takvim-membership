import { writable, get } from 'svelte/store'
import cloneDeep from 'lodash/cloneDeep'
export const toasts = writable([])

export const removeToastId = (id) => {
	const _toasts = get(toasts)
	const newToasts = _toasts.filter((x) => x.id !== id)
	console.log('~ newToasts', newToasts)
	toasts.set(cloneDeep(newToasts))
}
