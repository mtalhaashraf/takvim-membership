/* import { ApolloServer } from 'apollo-server-express' */
import sirv from 'sirv'
import compression from 'compression'
import cors from 'cors'
import * as sapper from '@sapper/server'
import express from 'express'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'

/* import resolvers from './graphQL/resolvers'
import typeDefs from './graphQL/typeDefs' */

import admin from './firebase'

const { PORT = 3000, NODE_ENV } = process.env
const dev = NODE_ENV === 'development'

const app = express()

/* let server = new ApolloServer({ resolvers, typeDefs })
server.start().then(() => {
	server.applyMiddleware({ app, path: '/graphql' })
}) */

app.use(compression({ threshold: 0 }))
// app.use(express.static('static'))
app.use(sirv('static', { dev, maxAge: 31536000 }))

app.use(cors({ origin: true }), bodyParser.json(), bodyParser.urlencoded({ extended: false }))

app.use(cookieParser())

app.set('trust proxy', true)

app.use(async function (req, res, next) {
	const sessionCookie = req.cookies['__session']
	global.dbAuthToken = req.cookies['__user_token']
	// Verify the session cookie. In this case an additional check is added to detect
	// if the user's Firebase session was revoked, user deleted/disabled, etc.
	if (sessionCookie) {
		try {
			const decodedClaims = await admin.auth().verifySessionCookie(sessionCookie, true)
			const userRecord = await admin.auth().getUser(decodedClaims.user_id)
			let obj = {
				displayName: userRecord.displayName,
				email: userRecord.email,
				emailVerified: userRecord.emailVerified,
				photoURL: userRecord.photoURL,
				uid: userRecord.uid,
				claims: decodedClaims
			}
			res.currentUser = obj
			next()
		} catch (error) {
			res.clearCookie('__session')
			res.currentUser = null
			next()
		}
	} else {
		res.currentUser = null
		next()
	}
})

app.use(
	sapper.middleware({
		session: (req, res) => ({
			currentUser: res.currentUser
		}),
		ignore: '/graphql'
	})
)

app.listen(PORT, (err) => {
	if (err) console.log('error', err)
})

exports.app = app
