import { gql } from '@apollo/client/core'
import db from '../../../../graphQL/client'
import { GET_PAYMENTS_BY_USER_ID } from '../../../../graphQL/queries'

export async function get(req, res, next) {
	const { slug: id } = req.params

	try {
		const response = await db.query({
			query: GET_PAYMENTS_BY_USER_ID,
			variables: {
				userId: id
			}
		})
		res.setHeader('Content-Type', 'application/json; charset=utf-8')
		res.end(JSON.stringify(response.data.payments))
	} catch (error) {
		console.log('~ error', error)
		res.sendStatus(403).end()
	}
}
