import { makeExecutableSchema } from '@graphql-tools/schema'
import { resolvers } from './resolvers'

const typeDefs = /* GraphQL */ `
  # ──────────────────────────────────────────────
  # Enums
  # ──────────────────────────────────────────────

  enum Condition {
    NEW
    USED
    RECON
  }

  enum Transmission {
    AUTOMATIC
    MANUAL
    CVT
  }

  enum FuelType {
    GASOLINE
    DIESEL
    HYBRID
    ELECTRIC
  }

  # ──────────────────────────────────────────────
  # Core Types
  # ──────────────────────────────────────────────

  type Brand {
    id: ID!
    name: String!
    slug: String!
    logo: String!
    description: String
    founded: Int
    headquarters: String
    website: String
    country: String!
    totalListings: Int!
  }

  type CarModel {
    id: ID!
    name: String!
    slug: String!
    brand: Brand!
  }

  type Category {
    id: ID!
    name: String!
    slug: String!
    icon: String!
    description: String!
    count: Int!
  }

  type Seller {
    id: ID!
    name: String!
    avatar: String!
    phone: String!
    email: String!
    isVerified: Boolean!
    rating: Float!
    totalSales: Int!
    joinDate: String!
    address: String!
    city: String!
  }

  type CarListing {
    id: ID!
    title: String!
    slug: String!
    brand: Brand!
    model: CarModel!
    variant: String!
    year: Int!
    price: Float!
    originalPrice: Float
    mileage: Int
    condition: Condition!
    transmission: Transmission!
    fuelType: FuelType!
    bodyType: String!
    exteriorColor: String!
    interiorColor: String!
    images: [String!]!
    description: String!
    features: [String!]!
    seller: Seller!
    city: String!
    province: String!
    inspectionScore: Float
    inspectionDate: String
    isFeatured: Boolean!
    isNegotiable: Boolean!
    views: Int!
    createdAt: String!
    updatedAt: String!
  }

  type Review {
    id: ID!
    author: String!
    avatar: String!
    rating: Float!
    comment: String!
    carModel: String!
    date: String!
    location: String!
  }

  type Banner {
    id: ID!
    title: String!
    subtitle: String!
    image: String!
    link: String!
    position: String!
    active: Boolean!
    order: Int!
  }

  type TokenPackage {
    id: ID!
    name: String!
    price: Float!
    tokens: Int!
    features: [String!]!
    popular: Boolean!
  }

  type PriceRange {
    min: Float!
    max: Float!
  }

  type FilterMeta {
    brands: [Brand!]!
    categories: [Category!]!
    cities: [String!]!
    priceRange: PriceRange!
  }

  type SearchResult {
    listings: [CarListing!]!
    total: Int!
    page: Int!
    totalPages: Int!
    filters: FilterMeta!
  }

  type HeroStats {
    totalCars: Int!
    totalBrands: Int!
    happyCustomers: Int!
    cities: Int!
  }

  type LandingData {
    heroStats: HeroStats!
    featured: [CarListing!]!
    popular: [CarListing!]!
    categories: [Category!]!
    brands: [Brand!]!
    tokenPackages: [TokenPackage!]!
  }

  type Dealer {
    id: ID!
    name: Brand!
    address: String!
    phone: String!
    email: String!
    website: String!
    rating: Float!
    totalReviews: Int!
    totalListings: Int!
    openHours: String!
    description: String!
    latitude: Float!
    longitude: Float!
    verified: Boolean!
    featuredListings: [CarListing!]!
    createdAt: String!
  }

  type User {
    id: ID!
    name: String!
    email: String!
    phone: String
    avatar: String
    role: String!
    createdAt: String!
  }

  type AuthPayload {
    user: User!
    token: String!
  }

  # ──────────────────────────────────────────────
  # Input Types
  # ──────────────────────────────────────────────

  input ListingFilter {
    brand: String
    model: String
    city: String
    condition: Condition
    fuelType: FuelType
    transmission: Transmission
    bodyType: String
    priceMin: Float
    priceMax: Float
    yearMin: Int
    yearMax: Int
    search: String
    sort: String
  }

  input CreateListingInput {
    title: String!
    brand: String!
    model: String!
    variant: String!
    year: Int!
    price: Float!
    mileage: Int
    condition: Condition!
    transmission: Transmission!
    fuelType: FuelType!
    bodyType: String!
    exteriorColor: String!
    interiorColor: String!
    description: String!
    features: [String!]
    city: String!
    province: String!
  }

  input UpdateProfileInput {
    name: String
    phone: String
    avatarUrl: String
  }

  input RegisterInput {
    name: String!
    email: String!
    phone: String!
    password: String!
  }

  # ──────────────────────────────────────────────
  # Queries
  # ──────────────────────────────────────────────

  type Query {
    landingData: LandingData!
    trendingCars(limit: Int, bodyType: String): [CarListing!]!
    car(id: ID!, slug: String): CarListing
    searchListings(filter: ListingFilter, page: Int, perPage: Int): SearchResult!
    brand(id: ID!, slug: String): Brand
    brands: [Brand!]!
    categories: [Category!]!
    dealer(id: ID!, slug: String): Dealer
    dealers: [Dealer!]!
    banners(position: String): [Banner!]!
    reviews(carId: ID, limit: Int): [Review!]!
    similarCars(carId: ID!, limit: Int): [CarListing!]!
    myFavorites: [CarListing!]!
    myListings: [CarListing!]!
    myProfile: User
  }

  # ──────────────────────────────────────────────
  # Mutations
  # ──────────────────────────────────────────────

  type Mutation {
    toggleFavorite(carId: ID!): Boolean!
    createListing(input: CreateListingInput!): CarListing!
    updateProfile(input: UpdateProfileInput!): User!
    login(email: String!, password: String!): AuthPayload!
    register(input: RegisterInput!): AuthPayload!
  }
`

export const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
})
