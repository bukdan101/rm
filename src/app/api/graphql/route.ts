import { createYoga } from 'graphql-yoga'
import { schema } from '@/lib/graphql/schema'

const yoga = createYoga({
  schema,
  graphqlEndpoint: '/api/graphql',
})

export async function GET(request: Request) {
  const response = await yoga.handleRequest(request, {})
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  })
}

export async function POST(request: Request) {
  const response = await yoga.handleRequest(request, {})
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  })
}
