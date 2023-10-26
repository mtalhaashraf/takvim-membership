import { gql } from 'apollo-server'

export default gql`
	type User {
		id: ID!
		firstName: String!
		lastName: String!
		email: String
		phone: String
		job: String
		dateOfBirth: String
		street: String
		city: String
		zip: Int
		state: String
		country: String
		H_street: String
		H_city: String
		H_zip: Int
		H_state: String
		H_country: String
		status: String
		role: String
		type: String
		familyHead: Boolean
		familyId: String
		relationToHead: String
	}
	type Payment {
		id: ID!
		amount: Int
		date: String
		note: String
		type: String
		userId: User!
		year: Int
		updatedAt: String
	}
	type Query {
		users: [User]
		payments: [Payment]
	}
	type Mutation {
		createUser: [User]
	}
`
