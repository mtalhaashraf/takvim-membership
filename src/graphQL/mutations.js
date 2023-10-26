import { gql } from '@apollo/client/core'

export const DELETE_PAYMENT_BY_ID = gql`
	mutation myMutation($id: uuid!) {
		delete_payments(where: { id: { _eq: $id } }) {
			returning {
				id
			}
		}
	}
`

export const ADD_USER = gql`
	mutation AddUser(
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
		$role: String
		$type: String
		$familyHead: Boolean
		$familyId: String
		$relationToHead: String
	) {
		insert_users_one(
			object: {
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
				role: $role
				type: $type
				familyHead: $familyHead
				familyId: $familyId
				relationToHead: $relationToHead
			}
		) {
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
			role
			type
			familyHead
			familyId
			relationToHead
			family {
				id
				firstName
				lastName
				familyHead
				dateOfBirth
				relationToHead
			}
		}
	}
`
