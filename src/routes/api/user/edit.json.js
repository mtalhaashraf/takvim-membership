import { gql } from '@apollo/client/core'
import db from '../../../graphQL/client.js'
import { getClaims } from '../../../utils'
import admin from '../../../firebase'

export async function post(req, res) {
	const {
		id,
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
		password,
		status,
		relationToHead,
		familyHead,
		role,
		type
	} = req.body
	const mutation = gql`
		mutation EditUser(
			$id: String!
			$firstName: String!
			$lastName: String!
			$email: String
			$phone: String
			$job: String
			$dateOfBirth: date
			$street: String
			$city: String
			$zip: Int
			$state: String
			$country: String
			$H_street: String
			$H_city: String
			$H_zip: Int
			$H_state: String
			$H_country: String
			$status: String
			$relationToHead: String
			$familyHead: Boolean
			$role: String
			$type: String
			) {
			update_users(
				where: { id: { _eq: "${id}" } }
				_set: {
					id: $id
					firstName: $firstName
					lastName: $lastName
					email: $email
					phone: $phone
					job: $job
					dateOfBirth: $dateOfBirth
					street: $street
					city: $city
					zip: $zip
					state: $state
					country: $country
					H_street: $H_street
					H_city: $H_city
					H_zip: $H_zip
					H_state: $H_state
					H_country: $H_country
					status: $status
					relationToHead: $relationToHead,
					familyHead: $familyHead,
					role: $role
					type: $type
				}
			) {
				returning {
					id
					firstName
					lastName
					email
					phone
					job
					dateOfBirth
					street
					city
					zip
					state
					country
					H_street
					H_city
					H_zip
					H_state
					H_country
					status
					relationToHead,
					familyHead,
					role
					type
				}
			}
		}
	`
	let variables = {
		id,
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
		password,
		status,
		relationToHead,
		familyHead,
		role,
		type
	}
	try {
		if (role) {
			const customClaims = getClaims(id, role)
			await admin.auth().setCustomUserClaims(id, customClaims)
			if (
				customClaims['https://hasura.io/jwt/claims']['x-hasura-default-role'] !== 'member'
			) {
				variables.type = 'admin'
			} else {
				variables.type = 'member'
			}
		}
		const response = await db.mutate({ mutation, variables })
		res.status(200).send(response)
	} catch (error) {
		console.log('~ error', error)
		res.status(400).send({
			message: error
		})
	}
}
