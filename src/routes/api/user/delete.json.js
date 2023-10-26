import { gql } from '@apollo/client/core'
import db from '../../../graphQL/client'
import admin from '../../../firebase'

export async function del(req, res) {
	const { id } = req.body
	const mutation = gql`
	mutation DeleteUser {
		delete_users(where: {id: {_eq: "${id}"}}) {
		  returning {
			id
		  }
		}
	  }
	`
	try {
		await admin.auth().deleteUser(id)
	} catch (error) {}
	try {
		const response = await db.mutate({
			mutation
		})
		res.status(200).send(response)
	} catch (error) {
		res.status(400).send({
			message: error
		})
	}
}
