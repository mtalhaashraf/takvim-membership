import { v4 as uuidv4 } from 'uuid'

import db from '../../../graphQL/client'
import { ADD_USER } from '../../../graphQL/mutations'
import { GET_ADMINS, GET_MEMBERS } from '../../../graphQL/queries'
import admin from '../../../firebase'
import { getClaims } from '../../../utils'

export async function post(req, res) {
	const {
		firstName,
		lastName,
		email,
		phone,
		job,
		dateOfBirth,
		street,
		city,
		zip,
		state,
		country,
		H_street,
		H_city,
		H_zip,
		H_state,
		H_country,
		status,
		role,
		type,
		familyHead,
		familyId,
		relationToHead
	} = req.body

	const newUserData = {
		displayName: `${firstName} ${lastName}`,
		emailVerified: false,
		disabled: false
	}
	if (email) {
		newUserData.email = email
	}
	/* 	if (phone) {
		newUserData.phoneNumber = phone
	} */
	let variables = {
		firstName,
		lastName,
		email,
		phone,
		job,
		dateOfBirth,
		street,
		city,
		zip,
		state,
		country,
		H_street,
		H_city,
		H_zip,
		H_state,
		H_country,
		status,
		role,
		type,
		familyHead,
		familyId,
		relationToHead
	}

	try {
		let id
		if (familyHead) {
			const userRecord = await admin.auth().createUser(newUserData)
			id = userRecord.uid
			const customClaims = getClaims(id, role)
			await admin.auth().setCustomUserClaims(id, customClaims)
			if (
				customClaims['https://hasura.io/jwt/claims']['x-hasura-default-role'] !== 'member'
			) {
				variables.type = 'admin'
			} else {
				if (!variables.type) variables.type = 'member'
			}
		} else {
			id = uuidv4()
		}
		variables.id = id
		const response = await db.mutate({
			mutation: ADD_USER,
			variables
		})
		res.status(200).send(response.data.insert_users_one)
	} catch (error) {
		console.log('~ error', error)
		res.status(400).send({
			message: error
		})
	}
}
