import { ApolloClient, createHttpLink, InMemoryCache } from '@apollo/client/core'
import { setContext } from '@apollo/client/link/context'
import fetch from 'cross-fetch'

const httpLink = createHttpLink({
	uri: 'https://legible-albacore-81.hasura.app/v1/graphql',
	fetch
})
const authLink = setContext((_, { headers }) => {
	//const token = global.dbAuthToken
	return {
		headers: {
			...headers,
			'content-type': 'application/json',
			'x-hasura-admin-secret':
				'KTTH1eG6lqnoUGfd1u1HAVsBGaeIZeOOeykYLE67wq3BkTT4CsYas0Xz1vNvJ6DL'
		}
	}
})
export default new ApolloClient({
	ssrMode: true,
	link: authLink.concat(httpLink),
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
