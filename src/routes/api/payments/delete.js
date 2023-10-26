import { gql } from '@apollo/client/core'
import db from '../../../graphQL/client.js'
import { DELETE_PAYMENT_BY_ID } from '../../../graphQL/mutations.js'
import { GET_PAYMENTS_BY_USER_ID } from '../../../graphQL/queries.js'
import admin from '../../../firebase'

export async function del(req, res) {
	const { id, userId } = req.body

	try {
		const response = await db.mutate({
			mutation: DELETE_PAYMENT_BY_ID,
			variables: {
				id
			}
		})
		res.status(200).send(response)
	} catch (error) {
		res.status(400).send({
			message: error
		})
	}
}
