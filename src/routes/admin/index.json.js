import db from '../../graphQL/client'
import { GET_ADMINS } from '../../graphQL/queries'

export async function get(req, res, next) {
	try {
		const response = await db.query({ query: GET_ADMINS })
		res.setHeader('Content-Type', 'application/json; charset=utf-8')
		res.end(JSON.stringify(response.data.users))
	} catch (error) {
		console.log('~ error', error)
		res.sendStatus(403).end()
	}
}
