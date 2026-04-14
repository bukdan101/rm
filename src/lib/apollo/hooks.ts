import { useQuery, useLazyQuery, useMutation } from '@apollo/client/react'
import { gql } from '@apollo/client'

// === TYPE DEFINITIONS ===

export interface Brand {
  id: string
  name: string
  slug: string
  logo: string
  description?: string
  totalListings?: number
}

export interface CarModel {
  id: string
  name: string
  slug: string
  brand: Brand
}

export interface Category {
  id: string
  name: string
  slug: string
  icon: string
  description: string
  count: number
}

export interface Seller {
  id: string
  name: string
  avatar: string
  phone: string
  email: string
  isVerified: boolean
  rating: number
  totalSales: number
  joinDate: string
  address?: string
  city: string
}

export interface CarListing {
  id: string
  title: string
  slug: string
  brand: Brand
  model: CarModel
  variant?: string
  year: number
  price: number
  originalPrice?: number
  mileage: number
  condition: 'NEW' | 'USED' | 'RECON'
  transmission: 'AUTOMATIC' | 'MANUAL' | 'CVT'
  fuelType: 'GASOLINE' | 'DIESEL' | 'HYBRID' | 'ELECTRIC'
  bodyType: string
  exteriorColor?: string
  interiorColor?: string
  images: string[]
  description: string
  features: string[]
  seller: Seller
  city: string
  inspectionScore?: number
  inspectionDate?: string
  isFeatured: boolean
  isNegotiable?: boolean
  views: number
  createdAt: string
}

export interface Review {
  id: string
  author: string
  avatar: string
  rating: number
  comment: string
  carModel: string
  date: string
  location: string
}

export interface Banner {
  id: string
  title: string
  subtitle?: string
  image: string
  link?: string
  position: string
  active: boolean
  order: number
}

export interface TokenPackage {
  id: string
  name: string
  price: number
  tokens: number
  features: string[]
  popular: boolean
}

export interface Dealer {
  id: string
  name: Brand
  address: string
  phone: string
  email?: string
  website?: string
  rating: number
  totalReviews: number
  totalListings: number
  openHours: string
  description?: string
  latitude?: number
  longitude?: number
  verified: boolean
  featuredListings: CarListing[]
  createdAt: string
}

export interface HeroStats {
  totalCars: number
  totalBrands: number
  happyCustomers: number
  cities: number
}

export interface LandingData {
  heroStats: HeroStats
  featured: CarListing[]
  popular: CarListing[]
  categories: Category[]
  brands: Brand[]
  tokenPackages: TokenPackage[]
}

export interface PriceRange {
  min: number
  max: number
}

export interface FilterMeta {
  brands: Brand[]
  categories: Category[]
  cities: string[]
  priceRange: PriceRange
}

export interface SearchResult {
  listings: CarListing[]
  total: number
  page: number
  totalPages: number
  filters: FilterMeta
}

export interface ListingFilter {
  brand?: string
  model?: string
  city?: string
  condition?: string
  fuelType?: string
  transmission?: string
  bodyType?: string
  priceMin?: number
  priceMax?: number
  yearMin?: number
  yearMax?: number
  search?: string
  sort?: string
}

export interface User {
  id: string
  name: string
  email: string
  phone?: string
  avatar?: string
  role: string
  createdAt: string
}

export interface AuthPayload {
  user: User
  token: string
}

export interface CreateListingInput {
  title: string
  brandId: string
  modelId: string
  variant?: string
  year: number
  price: number
  originalPrice?: number
  mileage: number
  condition: 'NEW' | 'USED' | 'RECON'
  transmission: 'AUTOMATIC' | 'MANUAL' | 'CVT'
  fuelType: 'GASOLINE' | 'DIESEL' | 'HYBRID' | 'ELECTRIC'
  bodyType: string
  exteriorColor?: string
  interiorColor?: string
  images: string[]
  description: string
  features: string[]
  city: string
  isNegotiable?: boolean
}

export interface UpdateProfileInput {
  name?: string
  phone?: string
  avatar?: string
}

export interface RegisterInput {
  name: string
  email: string
  phone?: string
  password: string
}

// === SHARED FRAGMENTS ===

const BRAND_FIELDS = gql`
  fragment BrandFields on Brand {
    id
    name
    slug
    logo
    description
    totalListings
  }
`

const CAR_MODEL_FIELDS = gql`
  fragment CarModelFields on CarModel {
    id
    name
    slug
    brand {
      ...BrandFields
    }
  }
  ${BRAND_FIELDS}
`

const SELLER_FIELDS = gql`
  fragment SellerFields on Seller {
    id
    name
    avatar
    phone
    email
    isVerified
    rating
    totalSales
    joinDate
    address
    city
  }
`

const CAR_LISTING_BASIC_FIELDS = gql`
  fragment CarListingBasicFields on CarListing {
    id
    title
    slug
    brand {
      ...BrandFields
    }
    model {
      ...CarModelFields
    }
    variant
    year
    price
    originalPrice
    mileage
    condition
    transmission
    fuelType
    bodyType
    exteriorColor
    images
    city
    inspectionScore
    isFeatured
    isNegotiable
    views
    createdAt
  }
  ${BRAND_FIELDS}
  ${CAR_MODEL_FIELDS}
`

const CAR_LISTING_FULL_FIELDS = gql`
  fragment CarListingFullFields on CarListing {
    id
    title
    slug
    brand {
      ...BrandFields
    }
    model {
      ...CarModelFields
    }
    variant
    year
    price
    originalPrice
    mileage
    condition
    transmission
    fuelType
    bodyType
    exteriorColor
    interiorColor
    images
    description
    features
    seller {
      ...SellerFields
    }
    city
    inspectionScore
    inspectionDate
    isFeatured
    isNegotiable
    views
    createdAt
  }
  ${BRAND_FIELDS}
  ${CAR_MODEL_FIELDS}
  ${SELLER_FIELDS}
`

// === GRAPHQL DOCUMENTS ===

const GET_LANDING_DATA = gql`
  ${BRAND_FIELDS}
  ${CAR_LISTING_BASIC_FIELDS}
  query GetLandingData {
    landingData {
      heroStats {
        totalCars
        totalBrands
        happyCustomers
        cities
      }
      featured {
        ...CarListingBasicFields
      }
      popular {
        ...CarListingBasicFields
      }
      categories {
        id
        name
        slug
        icon
        description
        count
      }
      brands {
        ...BrandFields
      }
      tokenPackages {
        id
        name
        price
        tokens
        features
        popular
      }
    }
  }
`

const GET_TRENDING_CARS = gql`
  ${BRAND_FIELDS}
  ${CAR_MODEL_FIELDS}
  query GetTrendingCars($limit: Int, $bodyType: String) {
    trendingCars(limit: $limit, bodyType: $bodyType) {
      id
      title
      slug
      brand {
        ...BrandFields
      }
      model {
        ...CarModelFields
      }
      variant
      year
      price
      originalPrice
      mileage
      condition
      transmission
      fuelType
      bodyType
      exteriorColor
      images
      city
      inspectionScore
      isFeatured
      isNegotiable
      views
      createdAt
    }
  }
`

const GET_CAR_DETAIL = gql`
  ${CAR_LISTING_FULL_FIELDS}
  query GetCarDetail($id: ID, $slug: String) {
    car(id: $id, slug: $slug) {
      ...CarListingFullFields
    }
  }
`

const GET_BRANDS = gql`
  ${BRAND_FIELDS}
  query GetBrands {
    brands {
      ...BrandFields
    }
  }
`

const GET_CATEGORIES = gql`
  query GetCategories {
    categories {
      id
      name
      slug
      icon
      description
      count
    }
  }
`

const GET_BANNERS = gql`
  query GetBanners($position: String) {
    banners(position: $position) {
      id
      title
      subtitle
      image
      link
      position
      active
      order
    }
  }
`

const SEARCH_LISTINGS = gql`
  ${BRAND_FIELDS}
  ${CAR_MODEL_FIELDS}
  ${SELLER_FIELDS}
  query SearchListings($filter: ListingFilter, $page: Int, $perPage: Int) {
    searchListings(filter: $filter, page: $page, perPage: $perPage) {
      listings {
        id
        title
        slug
        brand {
          ...BrandFields
        }
        model {
          ...CarModelFields
        }
        variant
        year
        price
        originalPrice
        mileage
        condition
        transmission
        fuelType
        bodyType
        exteriorColor
        images
        description
        features
        seller {
          ...SellerFields
        }
        city
        inspectionScore
        isFeatured
        isNegotiable
        views
        createdAt
      }
      total
      page
      totalPages
      filters {
        brands {
          ...BrandFields
        }
        categories {
          id
          name
          slug
          icon
          description
          count
        }
        cities
        priceRange {
          min
          max
        }
      }
    }
  }
`

const GET_REVIEWS = gql`
  query GetReviews($carId: ID, $limit: Int) {
    reviews(carId: $carId, limit: $limit) {
      id
      author
      avatar
      rating
      comment
      carModel
      date
      location
    }
  }
`

const GET_SIMILAR_CARS = gql`
  ${BRAND_FIELDS}
  ${CAR_MODEL_FIELDS}
  query GetSimilarCars($carId: ID!, $limit: Int) {
    similarCars(carId: $carId, limit: $limit) {
      id
      title
      slug
      brand {
        ...BrandFields
      }
      model {
        ...CarModelFields
      }
      variant
      year
      price
      originalPrice
      mileage
      condition
      transmission
      fuelType
      bodyType
      exteriorColor
      images
      city
      inspectionScore
      isFeatured
      isNegotiable
      views
      createdAt
    }
  }
`

const GET_DEALERS = gql`
  ${BRAND_FIELDS}
  query GetDealers {
    dealers {
      id
      name {
        ...BrandFields
      }
      address
      phone
      email
      website
      rating
      totalReviews
      totalListings
      openHours
      description
      latitude
      longitude
      verified
      featuredListings {
        id
        title
        slug
        brand {
          ...BrandFields
        }
        model {
          id
          name
          slug
        }
        variant
        year
        price
        originalPrice
        mileage
        condition
        transmission
        fuelType
        bodyType
        exteriorColor
        images
        city
        inspectionScore
        isFeatured
        isNegotiable
        views
        createdAt
      }
      createdAt
    }
  }
`

const GET_DEALER_DETAIL = gql`
  ${CAR_LISTING_BASIC_FIELDS}
  query GetDealerDetail($id: ID, $slug: String) {
    dealer(id: $id, slug: $slug) {
      id
      name {
        id
        name
        slug
        logo
        description
        totalListings
      }
      address
      phone
      email
      website
      rating
      totalReviews
      totalListings
      openHours
      description
      latitude
      longitude
      verified
      featuredListings {
        ...CarListingBasicFields
      }
      createdAt
    }
  }
`

const GET_MY_FAVORITES = gql`
  ${BRAND_FIELDS}
  ${CAR_MODEL_FIELDS}
  ${SELLER_FIELDS}
  query GetMyFavorites {
    myFavorites {
      id
      title
      slug
      brand {
        ...BrandFields
      }
      model {
        ...CarModelFields
      }
      variant
      year
      price
      originalPrice
      mileage
      condition
      transmission
      fuelType
      bodyType
      exteriorColor
      images
      description
      features
      seller {
        ...SellerFields
      }
      city
      inspectionScore
      isFeatured
      isNegotiable
      views
      createdAt
    }
  }
`

const GET_MY_LISTINGS = gql`
  ${BRAND_FIELDS}
  ${CAR_MODEL_FIELDS}
  ${SELLER_FIELDS}
  query GetMyListings {
    myListings {
      id
      title
      slug
      brand {
        ...BrandFields
      }
      model {
        ...CarModelFields
      }
      variant
      year
      price
      originalPrice
      mileage
      condition
      transmission
      fuelType
      bodyType
      exteriorColor
      images
      description
      features
      seller {
        ...SellerFields
      }
      city
      inspectionScore
      isFeatured
      isNegotiable
      views
      createdAt
    }
  }
`

const GET_MY_PROFILE = gql`
  query GetMyProfile {
    myProfile {
      id
      name
      email
      phone
      avatar
      role
      createdAt
    }
  }
`

const TOGGLE_FAVORITE = gql`
  mutation ToggleFavorite($carId: ID!) {
    toggleFavorite(carId: $carId)
  }
`

const CREATE_LISTING = gql`
  ${CAR_LISTING_FULL_FIELDS}
  mutation CreateListing($input: CreateListingInput!) {
    createListing(input: $input) {
      ...CarListingFullFields
    }
  }
`

const UPDATE_PROFILE = gql`
  mutation UpdateProfile($input: UpdateProfileInput!) {
    updateProfile(input: $input) {
      id
      name
      email
      phone
      avatar
      role
      createdAt
    }
  }
`

const LOGIN = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      user {
        id
        name
        email
        phone
        avatar
        role
        createdAt
      }
      token
    }
  }
`

const REGISTER = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      user {
        id
        name
        email
        phone
        avatar
        role
        createdAt
      }
      token
    }
  }
`

// === QUERY HOOKS ===

export function useLandingData() {
  return useQuery<{ landingData: LandingData }>(GET_LANDING_DATA)
}

export function useTrendingCars(limit?: number, bodyType?: string) {
  return useQuery<{ trendingCars: CarListing[] }>(GET_TRENDING_CARS, {
    variables: limit !== undefined || bodyType !== undefined
      ? { limit, bodyType }
      : undefined,
    skip: false,
  })
}

export function useCarDetail(id?: string, slug?: string) {
  return useQuery<{ car: CarListing }>(GET_CAR_DETAIL, {
    variables: { id, slug },
    skip: !id && !slug,
  })
}

export function useBrands() {
  return useQuery<{ brands: Brand[] }>(GET_BRANDS)
}

export function useCategories() {
  return useQuery<{ categories: Category[] }>(GET_CATEGORIES)
}

export function useBanners(position?: string) {
  return useQuery<{ banners: Banner[] }>(GET_BANNERS, {
    variables: position ? { position } : undefined,
  })
}

export function useSearchListings(
  filter?: ListingFilter,
  page?: number,
  perPage?: number
) {
  return useQuery<{ searchListings: SearchResult }>(SEARCH_LISTINGS, {
    variables: { filter, page, perPage },
    skip: !filter && !page && !perPage,
  })
}

export function useReviews(carId?: string, limit?: number) {
  return useQuery<{ reviews: Review[] }>(GET_REVIEWS, {
    variables: { carId, limit },
  })
}

export function useSimilarCars(carId: string, limit?: number) {
  return useQuery<{ similarCars: CarListing[] }>(GET_SIMILAR_CARS, {
    variables: { carId, limit },
    skip: !carId,
  })
}

export function useDealers() {
  return useQuery<{ dealers: Dealer[] }>(GET_DEALERS)
}

export function useDealerDetail(id?: string, slug?: string) {
  return useQuery<{ dealer: Dealer }>(GET_DEALER_DETAIL, {
    variables: { id, slug },
    skip: !id && !slug,
  })
}

export function useMyFavorites() {
  return useQuery<{ myFavorites: CarListing[] }>(GET_MY_FAVORITES)
}

export function useMyListings() {
  return useQuery<{ myListings: CarListing[] }>(GET_MY_LISTINGS)
}

export function useMyProfile() {
  return useQuery<{ myProfile: User }>(GET_MY_PROFILE)
}

// === LAZY QUERY HOOKS ===

export function useLazySearch() {
  return useLazyQuery<{ searchListings: SearchResult }>(SEARCH_LISTINGS)
}

// === MUTATION HOOKS ===

export function useToggleFavorite() {
  const [toggleFavorite, { data, loading, error, called }] = useMutation<
    { toggleFavorite: boolean },
    { carId: string }
  >(TOGGLE_FAVORITE)

  return [toggleFavorite, { data, loading, error, called }] as const
}

export function useCreateListing() {
  const [createListing, { data, loading, error, called }] = useMutation<
    { createListing: CarListing },
    { input: CreateListingInput }
  >(CREATE_LISTING)

  return [createListing, { data, loading, error, called }] as const
}

export function useUpdateProfile() {
  const [updateProfile, { data, loading, error, called }] = useMutation<
    { updateProfile: User },
    { input: UpdateProfileInput }
  >(UPDATE_PROFILE)

  return [updateProfile, { data, loading, error, called }] as const
}

export function useLogin() {
  const [login, { data, loading, error, called }] = useMutation<
    { login: AuthPayload },
    { email: string; password: string }
  >(LOGIN)

  return [login, { data, loading, error, called }] as const
}

export function useRegister() {
  const [register, { data, loading, error, called }] = useMutation<
    { register: AuthPayload },
    { input: RegisterInput }
  >(REGISTER)

  return [register, { data, loading, error, called }] as const
}
