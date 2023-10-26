import admin from '../../../../firebase'
import db from '../../../../graphQL/client.js'

import { gql } from '@apollo/client/core'

export async function get(req, res, next) {
	const { slug: id } = req.params

	const query = gql`
		query UsersQuery {
			users(where: { id: { _eq: "${id}" } }) {
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
				familyHead
				relationToHead
				status
				role
			}
		}
	`
	try {
		const response = await db.query({ query })
		res.setHeader('Content-Type', 'application/json; charset=utf-8')
		res.end(JSON.stringify(response.data.users[0]))
	} catch (error) {
		console.log('~ error', error)
		res.sendStatus(403).end()
	}
}
