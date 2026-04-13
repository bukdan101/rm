import { setContext } from '@apollo/client/link/context'

export function createAuthLink() {
  return setContext((_, { headers }) => {
    let token = ''
    if (typeof window !== 'undefined') {
      token = localStorage.getItem('automarket_token') || ''
    }
    return {
      headers: {
        ...headers,
        authorization: token ? `Bearer ${token}` : '',
      },
    }
  })
}
