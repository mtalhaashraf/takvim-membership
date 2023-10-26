import { ApolloClient, createHttpLink, InMemoryCache } from '@apollo/client/core'
import { getMainDefinition } from '@apollo/client/utilities'
import { setContext } from '@apollo/client/link/context'
import { WebSocketLink } from '@apollo/client/link/ws'
import fetch from 'cross-fetch'

const httpLink = createHttpLink({
	uri: 'https://legible-albacore-81.hasura.app/v1/graphql',
	fetch
})
/* const wsLink = new WebSocketLink({
	uri: 'ws://graphql.mymosq.ch/subscriptions',
	options: {
		reconnect: true,
		connectionParams: {
			authToken: user.authToken
		}
	}
}) */
const authLink = setContext((_, { headers }) => {
	const token = global.dbAuthToken
	return {
		headers: {
			...headers,
			/* authorization: `Bearer ${token}` || '' */
			'content-type': 'application/json',
			'x-hasura-admin-secret':
				'KTTH1eG6lqnoUGfd1u1HAVsBGaeIZeOOeykYLE67wq3BkTT4CsYas0Xz1vNvJ6DL'
		}
	}
})

/* const splitLink = split(
	({ query }) => {
		const definition = getMainDefinition(query)
		return definition.kind === 'OperationDefinition' && definition.operation === 'subscription'
	},
	wsLink,
	httpLink
) */

export default new ApolloClient({
	ssrMode: true,
	link: authLink.concat(httpLink),
	//link: splitLink,
	cache: new InMemoryCache(),
	defaultOptions: {
		watchQuery: {
			fetchPolicy: 'no-cache'
		},
		query: {
			fetchPolicy: 'no-cache'
		}
	}
})
