// import cloneDeep from 'lodash/cloneDeep'

export const getNestedObject = (nestedObj, pathArr) => {
	return pathArr.reduce(
		(obj, key) => (obj && obj[key] !== 'undefined' ? obj[key] : undefined),
		nestedObj
	)
}

export const to = (promise) => {
	return promise
		.then((data) => {
			return [null, data]
		})
		.catch((err) => [err])
}

export const getClaims = (id, role) => {
	return {
		'https://hasura.io/jwt/claims': {
			'x-hasura-default-role': role,
			'x-hasura-allowed-roles': [
				'viewer',
				'manager',
				'payment-manager',
				'member-manager',
				'super-admin'
			],
			'x-hasura-user-id': id
		}
	}
}
export const getUsersRole = (user) => {
	if (
		user['https://hasura.io/jwt/claims'] &&
		user['https://hasura.io/jwt/claims']['x-hasura-default-role']
	) {
		return user['https://hasura.io/jwt/claims']['x-hasura-default-role']
	} else if (
		user.claims &&
		user.claims['https://hasura.io/jwt/claims'] &&
		user.claims['https://hasura.io/jwt/claims']['x-hasura-default-role']
	) {
		return user.claims['https://hasura.io/jwt/claims']['x-hasura-default-role']
	} else return
}

String.prototype.pick = function (min, max) {
	var n,
		chars = ''

	if (typeof max === 'undefined') {
		n = min
	} else {
		n = min + Math.floor(Math.random() * (max - min + 1))
	}

	for (var i = 0; i < n; i++) {
		chars += this.charAt(Math.floor(Math.random() * this.length))
	}

	return chars
}

// Credit to @Christoph: http://stackoverflow.com/a/962890/464744
String.prototype.shuffle = function () {
	var array = this.split('')
	var tmp,
		current,
		top = array.length

	if (top)
		while (--top) {
			current = Math.floor(Math.random() * (top + 1))
			tmp = array[current]
			array[current] = array[top]
			array[top] = tmp
		}

	return array.join('')
}

export const generateStrongPassword = () => {
	var specials = '!@#$%^&*()_+{}:"<>?|[];\',./`~'
	var lowercase = 'abcdefghijklmnopqrstuvwxyz'
	var uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
	var numbers = '0123456789'

	var all = specials + lowercase + uppercase + numbers

	var password = ''
	password += specials.pick(1)
	password += lowercase.pick(1)
	password += uppercase.pick(1)
	password += all.pick(3, 10)
	password = password.shuffle()
}

/* export const urlQueryToObject = (query) => {
	return JSON.parse(
		'{"' + search.substring(1).replace(/&/g, '","').replace(/=/g, '":"') + '"}',
		function (key, value) {
			return key === '' ? value : decodeURIComponent(value)
		}
	)
} */
export const urlQueryToObject = (query) => {
	const urlParams = new URLSearchParams(query)
	const entries = urlParams.entries()
	const result = {}
	for (const [key, value] of entries) {
		result[key] = value
	}
	return result
}

export const objectToUrlQuery = (obj) => {
	return new URLSearchParams(obj).toString()
}

export const addOrModifyQuery = (query, changes) => {
	return objectToUrlQuery({
		...urlQueryToObject(query),
		...changes
	})
}
