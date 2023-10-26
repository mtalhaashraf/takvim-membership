import isEmpty from 'lodash/isEmpty'
import isEmail from 'validator/lib/isEmail'
import isLength from 'validator/lib/isLength'
import isMobilePhone from 'validator/lib/isMobilePhone'
import isStrongPassword from 'validator/lib/isStrongPassword'

export const validateFirstName = (value) => {
	let errors = []
	if (!isLength(value, { min: 2, max: 30 })) {
		errors.push('First name has to be longer than 2 characters')
	}
	if (errors.length > 0) return errors
	return true
}
export const validateLastName = (value) => {
	let errors = []
	if (!isLength(value, { min: 2, max: 30 })) {
		errors.push('Last name has to be longer than 2 characters')
	}
	if (errors.length > 0) return errors
	return true
}
export const validateDateOfBirth = (value) => {
	let errors = []
	if (isEmpty(value)) {
		errors.push('Can not be empty')
	}
	if (errors.length > 0) return errors
	return true
}
export const validateIsNotEmpty = (value) => {
	let errors = []
	if (isEmpty(value)) {
		errors.push('Can not be empty')
	}
	if (errors.length > 0) return errors
	return true
}
