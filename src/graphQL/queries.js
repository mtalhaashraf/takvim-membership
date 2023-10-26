import { gql } from '@apollo/client/core'
export const GET_PAYMENTS_BY_USER_ID = gql`
	query myQuery($userId: String!) {
		payments(where: { userId: { _eq: $userId } }, order_by: { date: asc }) {
			id
			amount
			date
			note
			type
			userId
			year
			updatedAt
			user {
				id
				firstName
				lastName
			}
			updatedBy {
				id
				firstName
				lastName
			}
		}
	}
`
export const GET_ADMINS = gql`
	query AdminsQuery {
		users(where: { type: { _eq: "admin" } }) {
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
		}
	}
`

export const GET_MEMBERS = gql`
	query MembersQuery($limit: Int!, $offset: Int!) {
		users(where: { familyHead: { _eq: true } }, limit: $limit, offset: $offset) {
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
		}
		users_aggregate(where: { familyHead: { _eq: true } }) {
			aggregate {
				count
			}
		}
	}
`

export const GET_MEMBER_BY_ID = gql`
	query MembersQuery($id: String!) {
		users(where: { id: { _eq: $id }, familyHead: { _eq: true } }) {
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
			familyId
			familyHead
			family {
				id
				firstName
				lastName
				familyHead
				dateOfBirth
				relationToHead
			}
			payments {
				id
				amount
				date
				note
				type
				year
				updatedAt
				updatedBy {
					id
					firstName
					lastName
				}
			}
		}
	}
`

export const GET_MEMBERS_FAMILY = gql`
	query MembersQuery($id: String!) {
		users(where: { id: { _eq: $id }, familyHead: { _eq: true } }) {
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
			familyId
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
