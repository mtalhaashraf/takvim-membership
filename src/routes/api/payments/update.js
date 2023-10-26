import { gql } from '@apollo/client/core'
import db from '../../../graphQL/client.js'
import { getClaims } from '../../../utils'
import admin from '../../../firebase'

export async function post(req, res) {
	const { id, type, date, amount, updatedAt, updatedBy, note, year } = req.body

	const mutation = gql`
		mutation updatePayment(
			$type: String!
			$date: date
			$amount: Float
			$updatedAt: date
			$updatedById: String
			$note: String
			$year: Int

			) {
			update_payments(
				where: {id: {_eq: "${id}"}},
				_set: {
					type: $type
					date: $date
					amount: $amount
					updatedAt: $updatedAt
					updatedById: $updatedById
					note: $note
					year: $year
				}
			) {
				returning {
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
		}
	`
	const variables = {
		id,
		type,
		date,
		amount,
		updatedAt: new Date(),
		updatedById: updatedBy.id,
		note,
		year
	}
	try {
		const response = await db.mutate({ mutation, variables })
		res.status(200).send(response)
	} catch (error) {
		console.log('~ error', error)
		res.status(400).send({
			message: error
		})
	}
}
