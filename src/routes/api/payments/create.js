import { gql } from '@apollo/client/core'
import db from '../../../graphQL/client.js'
import { getClaims } from '../../../utils'
import admin from '../../../firebase'
import { GET_PAYMENTS_BY_USER_ID } from '../../../graphQL/queries'

export async function post(req, res) {
	const { id, type, userId, date, amount, updatedAt, updatedBy, note, year } = req.body
	const mutation = gql`
		mutation createPayment(
			$type: String!
			$userId: String!
			$date: date
			$amount: Float
			$updatedAt: date
			$updatedById: String
			$note: String
			$year: Int
		) {
			insert_payments_one(
				object: {
					type: $type
					userId: $userId
					date: $date
					amount: $amount
					updatedAt: $updatedAt
					updatedById: $updatedById
					note: $note
					year: $year
				}
			) {
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
	const variables = {
		type,
		userId,
		date,
		amount,
		updatedAt: new Date(),
		updatedById: updatedBy.id,
		note,
		year
	}
	try {
		const response = await db.mutate({
			mutation,
			variables
		})
		res.status(200).send(response.data.insert_payments_one)
	} catch (error) {
		console.log('~ error', error)
		res.status(400).send({
			message: error
		})
	}
}
