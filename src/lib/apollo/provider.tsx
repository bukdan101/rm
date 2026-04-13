'use client'

import { ApolloProvider } from '@apollo/client'
import { makeClient } from './client'

export function ApolloProviderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ApolloProvider client={makeClient()}>
      {children}
    </ApolloProvider>
  )
}
