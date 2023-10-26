import db from '../../graphQL/client'
import { GET_MEMBER_BY_ID } from '../../graphQL/queries'

export async function get(req, res, next) {
	const { slug: id } = req.params

	try {
		const response = await db.query({
			query: GET_MEMBER_BY_ID,
			variables: {
				id
			}
		})
		res.setHeader('Content-Type', 'application/json; charset=utf-8')
		res.end(JSON.stringify(response.data.users[0]))
	} catch (error) {
		console.log('~ error', error)
		res.sendStatus(403).end()
	}
}
