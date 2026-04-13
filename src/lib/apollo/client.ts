import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client'
import { createAuthLink } from './auth-link'

// HTTP link to GraphQL mock server
const httpLink = createHttpLink({
  uri: '/api/graphql',
})

// Create Apollo Client instance
export function makeClient() {
  return new ApolloClient({
    link: createAuthLink().concat(httpLink),
    cache: new InMemoryCache({
      typePolicies: {
        CarListing: {
          keyFields: ['id'],
          fields: {
            images: { merge: false },
          },
        },
        Query: {
          fields: {
            listings: {
              keyArgs: ['filter'],
              merge(existing = { items: [], totalCount: 0 }, incoming) {
                return {
                  ...incoming,
                  items: [...existing.items, ...incoming.items],
                }
              },
            },
            favorites: { merge: false },
            trending: { merge: false },
            notifications: { merge: false },
          },
        },
      },
    }),
    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'cache-and-network',
      },
      query: {
        fetchPolicy: 'cache-first',
      },
      mutation: {
        fetchPolicy: 'network-only',
      },
    },
  })
}

// Singleton client for client-side
let _client: ApolloClient<any> | null = null

export function getClient() {
  if (!_client) {
    _client = makeClient()
  }
  return _client
}
