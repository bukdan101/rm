'use client'

import { useQuery, useMutation, useLazyQuery } from '@apollo/client'
import { gql } from '@apollo/client'

// ============================================================================
// QUERIES — aligned with schema.ts (brand: Brand, model: CarModel, images: [String!]!)
// ============================================================================

export const HEALTH_QUERY = gql`
  query Health {
    health
  }
`

export const ME_QUERY = gql`
  query Me {
    me {
      id
      name
      email
      phone
      avatar
      role
      isVerified
      settings { id userId key value }
      tokenBalance
    }
  }
`

export const LISTINGS_QUERY = gql`
  query Listings($page: Int, $perPage: Int, $filter: ListingFilter) {
    listings(page: $page, perPage: $perPage, filter: $filter) {
      id
      slug
      title
      price
      year
      mileage
      city
      province
      images
      isFeatured
      condition
      brand { id name slug logo }
      model { id name slug }
      transmission
      fuelType
      color
      bodyType
      seller { id name avatar isVerified rating totalReviews }
      viewCount
      createdAt
    }
  }
`

export const LISTING_QUERY = gql`
  query Listing($id: ID!) {
    listing(id: $id) {
      id
      slug
      title
      description
      price
      year
      mileage
      city
      province
      images
      isFeatured
      isNegotiable
      condition
      brand { id name slug logo }
      model { id name slug }
      variant
      transmission
      fuelType
      color
      bodyType
      engineCapacity
      seatCapacity
      features
      category { id name slug }
      inspection {
        id
        status
        overallScore
        inspectedAt
        reportUrl
        categories { id name score items { id name status notes } }
      }
      seller { id name avatar phone email isVerified rating totalReviews joinedAt totalListings address province city }
      reviewCount
      viewCount
      favorites
      status
      createdAt
      updatedAt
    }
  }
`

export const LISTING_BY_SLUG_QUERY = gql`
  query ListingBySlug($slug: String!) {
    listingBySlug(slug: $slug) {
      id
      slug
      title
      description
      price
      year
      mileage
      city
      province
      images
      isFeatured
      isNegotiable
      condition
      brand { id name slug logo }
      model { id name slug }
      variant
      transmission
      fuelType
      color
      bodyType
      engineCapacity
      seatCapacity
      features
      category { id name slug }
      inspection {
        id
        status
        overallScore
        inspectedAt
        reportUrl
        categories { id name score items { id name status notes } }
      }
      seller { id name avatar phone email isVerified rating totalReviews joinedAt totalListings address province city }
      reviewCount
      viewCount
      favorites
      status
      createdAt
      updatedAt
    }
  }
`

export const MY_LISTINGS_QUERY = gql`
  query MyListings($page: Int, $perPage: Int) {
    myListings(page: $page, perPage: $perPage) {
      id
      slug
      title
      price
      year
      mileage
      city
      province
      images
      status
      viewCount
      favorites
      isFeatured
      condition
      brand { id name slug }
      model { id name slug }
      transmission
      fuelType
      createdAt
    }
  }
`

export const BRANDS_QUERY = gql`
  query Brands {
    brands {
      id
      name
      slug
      logo
      logoUrl
      country
      models { id name slug }
    }
  }
`

export const MASTER_DATA_QUERY = gql`
  query MasterData {
    colors { id name slug }
    bodyTypes { id name slug }
    fuelTypes { id name slug }
    transmissions { id name slug }
    categories { id name slug icon sortOrder isActive }
  }
`

export const TRENDING_QUERY = gql`
  query Trending($limit: Int) {
    trending(limit: $limit) {
      id
      slug
      title
      price
      year
      mileage
      city
      province
      images
      condition
      brand { id name slug }
      model { id name slug }
      transmission
      fuelType
      seller { id name avatar isVerified rating totalReviews }
      viewCount
    }
  }
`

export const FAVORITES_QUERY = gql`
  query Favorites {
    favorites {
      id
      listingId
      userId
      listing {
        id
        slug
        title
        price
        year
        mileage
        city
        province
        images
        condition
        brand { id name slug }
        model { id name slug }
      }
      createdAt
    }
  }
`

export const RECOMMENDATIONS_QUERY = gql`
  query Recommendations {
    recommendations {
      id
      slug
      title
      price
      year
      mileage
      city
      province
      images
      condition
      brand { id name slug }
      model { id name slug }
      transmission
      fuelType
      seller { id name avatar isVerified rating totalReviews }
      viewCount
    }
  }
`

export const LISTING_REVIEWS_QUERY = gql`
  query ListingReviews($listingId: ID!) {
    listingReviews(listingId: $listingId) {
      id
      rating
      comment
      createdAt
      user { id name avatar }
    }
  }
`

export const ORDERS_QUERY = gql`
  query Orders {
    orders {
      id
      status
      totalPrice
      paymentStatus
      paymentMethod
      createdAt
      updatedAt
      listing {
        id
        slug
        title
        price
        year
        images
        brand { id name slug }
        model { id name slug }
        condition
      }
    }
  }
`

export const TOKEN_PACKAGES_QUERY = gql`
  query TokenPackages {
    tokenPackages {
      id
      name
      description
      tokens
      tokenAmount
      price
      bonus
      bonusTokens
      isPopular
      features
    }
  }
`

export const DEALERS_QUERY = gql`
  query Dealers($page: Int, $perPage: Int) {
    dealers(page: $page, perPage: $perPage) {
      id
      slug
      name
      logo
      logoUrl
      description
      address
      city
      province
      phone
      email
      rating
      totalReviews
      totalListings
      isVerified
      joinedAt
    }
  }
`

export const DEALER_BY_SLUG_QUERY = gql`
  query DealerBySlug($slug: String!) {
    dealerBySlug(slug: $slug) {
      id
      slug
      name
      logo
      logoUrl
      coverUrl
      description
      address
      city
      province
      phone
      email
      website
      rating
      totalReviews
      totalListings
      branchCount
      isVerified
      createdAt
      branches { id name address city province phone isPrimary lat lng }
      listings {
        id
        slug
        title
        price
        year
        mileage
        city
        images
        condition
        brand { id name slug }
        model { id name slug }
        transmission
        fuelType
      }
    }
  }
`

export const BANNERS_QUERY = gql`
  query Banners($position: String) {
    banners(position: $position) {
      id
      title
      subtitle
      image
      imageUrl
      link
      linkUrl
      position
      sortOrder
      isActive
    }
  }
`

export const CONVERSATIONS_QUERY = gql`
  query Conversations {
    conversations {
      id
      listingId
      buyerId
      sellerId
      lastMessage { id content createdAt sender { id name } }
      lastMessageAt
      unreadCount
      status
      createdAt
      updatedAt
      listing { id slug title price images }
      participants { id name avatar isOnline }
    }
  }
`

export const CONVERSATION_DETAIL_QUERY = gql`
  query ConversationDetail($id: ID!) {
    conversation(id: $id) {
      id
      listingId
      buyerId
      sellerId
      lastMessage { id content createdAt sender { id name } }
      lastMessageAt
      unreadCount
      status
      createdAt
      updatedAt
      listing { id slug title price images seller { id name avatar } }
      participants { id name avatar isOnline lastSeen }
      messages { id content sender { id name avatar } createdAt isRead }
    }
  }
`

export const MESSAGES_QUERY = gql`
  query Messages($conversationId: ID!) {
    messages(conversationId: $conversationId) {
      id
      content
      sender { id name avatar }
      createdAt
      isRead
    }
  }
`

export const NOTIFICATIONS_QUERY = gql`
  query Notifications($unreadOnly: Boolean) {
    notifications(unreadOnly: $unreadOnly) {
      id
      userId
      type
      title
      body
      message
      data
      isRead
      createdAt
    }
  }
`

export const UNREAD_NOTIFICATION_COUNT_QUERY = gql`
  query UnreadNotificationCount {
    unreadNotificationCount
  }
`

export const SYSTEM_SETTINGS_QUERY = gql`
  query SystemSettings($group: String) {
    systemSettings(group: $group) {
      id
      key
      value
      type
      group
      description
    }
  }
`

export const LANDING_DATA_QUERY = gql`
  query LandingData {
    landingData {
      categories {
        id
        name
        slug
        icon
        listingCount
      }
      featured {
        id
        slug
        title
        price
        year
        mileage
        city
        province
        images
        isFeatured
        condition
        brand { id name slug logo }
        model { id name slug }
        transmission
        fuelType
        seller { id name avatar isVerified rating totalReviews }
        viewCount
      }
      latest {
        id
        slug
        title
        price
        year
        mileage
        city
        province
        images
        isFeatured
        condition
        brand { id name slug }
        model { id name slug }
        transmission
        fuelType
        seller { id name avatar isVerified rating totalReviews }
        viewCount
      }
      popular {
        id
        slug
        title
        price
        year
        mileage
        city
        province
        images
        isFeatured
        condition
        brand { id name slug }
        model { id name slug }
        transmission
        fuelType
        seller { id name avatar isVerified rating totalReviews }
        viewCount
      }
    }
  }
`

// ============================================================================
// MUTATIONS
// ============================================================================

export const GOOGLE_LOGIN_MUTATION = gql`
  mutation GoogleLogin($token: String!) {
    googleLogin(token: $token) {
      token
      user {
        id
        name
        email
        avatar
        role
        isVerified
        tokenBalance
      }
    }
  }
`

export const UPDATE_PROFILE_MUTATION = gql`
  mutation UpdateProfile($input: UpdateProfileInput!) {
    updateProfile(input: $input) {
      id
      name
      email
      phone
      avatar
      bio
      address
      city
      province
    }
  }
`

export const CREATE_LISTING_MUTATION = gql`
  mutation CreateListing($input: CreateListingInput!) {
    createListing(input: $input) {
      id
      slug
      title
      status
    }
  }
`

export const UPDATE_LISTING_MUTATION = gql`
  mutation UpdateListing($id: ID!, $input: CreateListingInput!) {
    updateListing(id: $id, input: $input) {
      id
      slug
      title
      status
    }
  }
`

export const DELETE_LISTING_MUTATION = gql`
  mutation DeleteListing($id: ID!) {
    deleteListing(id: $id) {
      success
      message
    }
  }
`

export const TOGGLE_FAVORITE_MUTATION = gql`
  mutation ToggleFavorite($listingId: ID!) {
    toggleFavorite(listingId: $listingId) {
      isFavorited
      favoriteCount
    }
  }
`

export const CREATE_REVIEW_MUTATION = gql`
  mutation CreateReview($input: CreateReviewInput!) {
    createReview(input: $input) {
      id
      rating
      comment
      createdAt
    }
  }
`

export const CREATE_ORDER_MUTATION = gql`
  mutation CreateOrder($input: CreateOrderInput!) {
    createOrder(input: $input) {
      id
      status
      totalPrice
      createdAt
    }
  }
`

export const CREATE_CONVERSATION_MUTATION = gql`
  mutation CreateConversation($listingId: ID!) {
    createConversation(listingId: $listingId) {
      id
      listing { id slug title price images }
      participants { id name avatar }
    }
  }
`

export const SEND_MESSAGE_MUTATION = gql`
  mutation SendMessage($conversationId: ID!, $content: String!) {
    sendMessage(conversationId: $conversationId, content: $content) {
      id
      content
      sender { id name avatar }
      createdAt
      isRead
    }
  }
`

// ============================================================================
// QUERY HOOKS
// ============================================================================

export function useHealth() {
  return useQuery<{ health: string }>(HEALTH_QUERY)
}

export function useMe() {
  return useQuery(ME_QUERY, {
    skip: typeof window !== 'undefined' && !localStorage.getItem('automarket_token'),
  })
}

export function useListings(variables?: { page?: number; perPage?: number; filter?: Record<string, unknown> }) {
  return useQuery(LISTINGS_QUERY, {
    variables: { page: 1, perPage: 20, ...variables },
  })
}

export function useListing(id: string) {
  return useQuery(LISTING_QUERY, { variables: { id }, skip: !id })
}

export function useListingBySlug(slug: string) {
  return useQuery(LISTING_BY_SLUG_QUERY, { variables: { slug }, skip: !slug })
}

export function useMyListings(variables?: { page?: number; perPage?: number }) {
  return useQuery(MY_LISTINGS_QUERY, {
    variables: { page: 1, perPage: 20, ...variables },
    skip: typeof window !== 'undefined' && !localStorage.getItem('automarket_token'),
  })
}

export function useBrands() {
  return useQuery(BRANDS_QUERY)
}

export function useMasterData() {
  return useQuery(MASTER_DATA_QUERY)
}

export function useTrending(limit: number = 8) {
  return useQuery(TRENDING_QUERY, { variables: { limit } })
}

export function useFavorites() {
  return useQuery(FAVORITES_QUERY, {
    skip: typeof window !== 'undefined' && !localStorage.getItem('automarket_token'),
  })
}

export function useRecommendations() {
  return useQuery(RECOMMENDATIONS_QUERY, {
    skip: typeof window !== 'undefined' && !localStorage.getItem('automarket_token'),
  })
}

export function useListingReviews(listingId: string) {
  return useQuery(LISTING_REVIEWS_QUERY, { variables: { listingId }, skip: !listingId })
}

export function useOrders() {
  return useQuery(ORDERS_QUERY, {
    skip: typeof window !== 'undefined' && !localStorage.getItem('automarket_token'),
  })
}

export function useTokenPackages() {
  return useQuery(TOKEN_PACKAGES_QUERY)
}

export function useDealers(variables?: { page?: number; perPage?: number }) {
  return useQuery(DEALERS_QUERY, {
    variables: { page: 1, perPage: 20, ...variables },
  })
}

export function useDealerBySlug(slug: string) {
  return useQuery(DEALER_BY_SLUG_QUERY, { variables: { slug }, skip: !slug })
}

export function useBanners(position?: string) {
  return useQuery(BANNERS_QUERY, {
    variables: position ? { position } : undefined,
  })
}

export function useConversations() {
  return useQuery(CONVERSATIONS_QUERY, {
    skip: typeof window !== 'undefined' && !localStorage.getItem('automarket_token'),
  })
}

export function useConversationDetail(id: string) {
  return useQuery(CONVERSATION_DETAIL_QUERY, { variables: { id }, skip: !id })
}

export function useMessages(conversationId: string) {
  return useQuery(MESSAGES_QUERY, { variables: { conversationId }, skip: !conversationId })
}

export function useNotifications(unreadOnly?: boolean) {
  return useQuery(NOTIFICATIONS_QUERY, {
    variables: unreadOnly !== undefined ? { unreadOnly } : undefined,
    skip: typeof window !== 'undefined' && !localStorage.getItem('automarket_token'),
  })
}

export function useUnreadNotificationCount() {
  const { data, loading, refetch } = useQuery<{ unreadNotificationCount: number }>(
    UNREAD_NOTIFICATION_COUNT_QUERY,
    {
      pollInterval: 30000,
      skip: typeof window !== 'undefined' && !localStorage.getItem('automarket_token'),
    }
  )
  return { count: data?.unreadNotificationCount ?? 0, loading, refetch }
}

export function useSystemSettings(group?: string) {
  return useQuery(SYSTEM_SETTINGS_QUERY, {
    variables: group ? { group } : undefined,
  })
}

export function useLandingData() {
  return useQuery(LANDING_DATA_QUERY)
}

// ============================================================================
// LAZY QUERY HOOKS
// ============================================================================

export function useLazyHealth() {
  return useLazyQuery<{ health: string }>(HEALTH_QUERY)
}

export function useLazyListing() {
  return useLazyQuery(LISTING_QUERY)
}

export function useLazyListingBySlug() {
  return useLazyQuery(LISTING_BY_SLUG_QUERY)
}

export function useLazyListings() {
  return useLazyQuery(LISTINGS_QUERY)
}

export function useLazyBrands() {
  return useLazyQuery(BRANDS_QUERY)
}

export function useLazyMasterData() {
  return useLazyQuery(MASTER_DATA_QUERY)
}

export function useLazyMessages() {
  return useLazyQuery(MESSAGES_QUERY)
}

export function useLazyNotifications() {
  return useLazyQuery(NOTIFICATIONS_QUERY)
}

// ============================================================================
// MUTATION HOOKS
// ============================================================================

export function useGoogleLogin() {
  return useMutation(GOOGLE_LOGIN_MUTATION)
}

export function useUpdateProfile() {
  return useMutation(UPDATE_PROFILE_MUTATION, { refetchQueries: [{ query: ME_QUERY }] })
}

export function useCreateListing() {
  return useMutation(CREATE_LISTING_MUTATION, { refetchQueries: [{ query: MY_LISTINGS_QUERY }] })
}

export function useUpdateListing() {
  return useMutation(UPDATE_LISTING_MUTATION, { refetchQueries: [{ query: MY_LISTINGS_QUERY }] })
}

export function useDeleteListing() {
  return useMutation(DELETE_LISTING_MUTATION, { refetchQueries: [{ query: MY_LISTINGS_QUERY }] })
}

export function useToggleFavorite() {
  return useMutation(TOGGLE_FAVORITE_MUTATION, { refetchQueries: [{ query: FAVORITES_QUERY }] })
}

export function useCreateReview() {
  return useMutation(CREATE_REVIEW_MUTATION, { refetchQueries: ['ListingReviews'] })
}

export function useCreateOrder() {
  return useMutation(CREATE_ORDER_MUTATION, { refetchQueries: [{ query: ORDERS_QUERY }] })
}

export function useCreateConversation() {
  return useMutation(CREATE_CONVERSATION_MUTATION, { refetchQueries: [{ query: CONVERSATIONS_QUERY }] })
}

export function useSendMessage() {
  return useMutation(SEND_MESSAGE_MUTATION, { refetchQueries: ['Messages'] })
}
