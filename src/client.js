import * as sapper from '@sapper/app'
import { config } from './firebase/config'
import fetch from 'cross-fetch'
import { split } from 'apollo-link'
import { getMainDefinition } from 'apollo-utilities'
import { WebSocketLink } from 'apollo-link-ws'
import { ApolloClient, createHttpLink, InMemoryCache } from '@apollo/client/core'

if (!firebase.apps.length) {
	firebase.initializeApp(config)
} else {
	firebase.app()
}

window.addEventListener('load', () =>
	sapper.start({
		target: document.querySelector('#sapper')
	})
)

/* sapper.start({
	target: document.querySelector('#sapper')
}); */
