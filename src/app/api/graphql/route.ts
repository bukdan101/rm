import { createYoga } from 'graphql-yoga'
import { makeExecutableSchema } from '@graphql-tools/schema'
import { typeDefs } from '@/lib/graphql/schema'
import { resolvers } from '@/lib/graphql/resolvers'

const executableSchema = makeExecutableSchema({
  typeDefs,
  resolvers,
})

const yoga = createYoga({
  schema: executableSchema,
  graphqlEndpoint: '/api/graphql',
  cors: (request) => {
    const origin = request.headers.get('origin') || ''
    return {
      origin,
      credentials: 'include',
      methods: ['GET', 'POST', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    }
  },
})

export { yoga as GET, yoga as POST }
