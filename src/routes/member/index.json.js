import db from '../../graphQL/client'
import { GET_MEMBERS } from '../../graphQL/queries'
import { gql } from '@apollo/client/core'

export async function post(req, res, next) {
	const { limit, offset, ...params } = req.body
	try {
		const response = await db.query({
			query: gql`
			query MembersQuery($limit: Int!, $offset: Int!) {
				users(where: { familyHead: { _eq: true }
					${params.firstName ? `, firstName: { _ilike: "%${params.firstName}%" }` : ''}			${
				params.lastName ? `, lastName: { _ilike: "%${params.lastName}%" }` : ''
			}
					${params.status ? `, status: { _ilike: "${params.status}" }` : ''}
					${params.street ? `, street: { _ilike: "%${params.street}%" }` : ''}
					${params.zip ? `, zip: { _eq: "${params.zip}" }` : ''}
					${params.city ? `, city: { _ilike: "%${params.city}%" }` : ''}
				}, limit: $limit, offset: $offset)
					{
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
				users_aggregate(where: { familyHead: { _eq: true }
					${params.firstName ? `, firstName: { _ilike: "%${params.firstName}%" }` : ''}			${
				params.lastName ? `, lastName: { _ilike: "%${params.lastName}%" }` : ''
			}
					${params.status ? `, status: { _ilike: "${params.status}" }` : ''}
					${params.street ? `, street: { _ilike: "%${params.street}%" }` : ''}
					${params.zip ? `, zip: { _eq: "${params.zip}" }` : ''}
					${params.city ? `, city: { _ilike: "%${params.city}%" }` : ''}
				}) {
			aggregate {
				count
			}
		}
			}
		`,
			variables: {
				limit,
				offset
			}
		})
		res.setHeader('Content-Type', 'application/json; charset=utf-8')
		res.status(200).send(JSON.stringify(response.data))
	} catch (error) {
		console.log('~ error', error)
		res.status(400).send({
			message: error
		})
	}
}
