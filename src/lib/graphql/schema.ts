export const typeDefs = `
scalar Time

# ============================================================
# Result Types
# ============================================================

type AuthResponse {
  success: Boolean!
  message: String
  token: String
  user: User
}

type DeleteResult {
  success: Boolean!
  message: String
}

type FavoriteResult {
  isFavorited: Boolean!
  favoriteCount: Int!
}

# ============================================================
# User Types
# ============================================================

type User {
  id: ID!
  name: String
  email: String
  phone: String
  avatar: String
  avatarUrl: String
  role: String
  emailVerified: Boolean
  isVerified: Boolean
  isOnline: Boolean
  lastSeen: Time
  isActive: Boolean
  createdAt: Time
  joinedAt: Time
  bio: String
  address: String
  city: String
  province: String
  rating: Float
  totalReviews: Int
  totalListings: Int
  settings: UserSettings
  tokenBalance: Int
}

type UserSettings {
  id: ID!
  userId: ID!
  key: String!
  value: String!
}

type UserToken {
  id: ID!
  balance: Int!
  totalPurchased: Int!
  totalUsed: Int!
  totalBonus: Int!
}

# ============================================================
# Car Types
# ============================================================

type CarListing {
  id: ID!
  title: String!
  slug: String!
  brand: Brand
  model: CarModel
  variant: String
  year: Int!
  price: Float!
  priceCredit: Float
  mileage: Int
  condition: String!
  transmission: String!
  fuelType: String!
  bodyType: String!
  color: String
  city: String!
  province: String!
  description: String
  images: [String!]!
  isFeatured: Boolean
  isNegotiable: Boolean
  features: [String!]!
  sellerId: ID!
  seller: User
  category: Category
  inspection: CarInspection
  reviewCount: Int!
  viewCount: Int!
  views: Int
  favorites: Int
  status: String!
  createdAt: Time!
  updatedAt: Time
  engineCapacity: Int
  seatCapacity: Int
}

type CarImage {
  id: ID!
  url: String!
  isPrimary: Boolean!
  sortOrder: Int!
}

type CarFeatures {
  id: ID
  sunroof: Boolean
  cruiseControl: Boolean
  navigation: Boolean
  leatherSeats: Boolean
  pushStart: Boolean
}

type CarInspection {
  id: ID!
  status: String!
  overallScore: Int
  createdAt: Time
  inspectedAt: Time
  reportUrl: String
  categories: [InspectionCategory!]!
  items: [InspectionItem!]!
}

type InspectionCategory {
  id: ID!
  name: String!
  score: Int
  items: [InspectionItem!]!
}

type InspectionItem {
  id: ID!
  name: String!
  status: String!
  notes: String
}

# ============================================================
# Brand & Model Types
# ============================================================

type Brand {
  id: ID!
  name: String!
  slug: String!
  logo: String
  logoUrl: String
  country: String
  models: [CarModel!]!
}

type CarModel {
  id: ID!
  name: String!
  slug: String!
  brandId: ID!
}

# ============================================================
# Master Data Types
# ============================================================

type MasterData {
  id: ID!
  name: String!
  slug: String!
}

type Category {
  id: ID!
  name: String!
  slug: String!
  icon: String
  sortOrder: Int!
  isActive: Boolean!
  listingCount: Int
}

# ============================================================
# Review & Favorite Types
# ============================================================

type Review {
  id: ID!
  listingId: ID!
  userId: ID!
  userName: String
  userAvatar: String
  user: User
  rating: Int!
  title: String
  comment: String
  status: String!
  createdAt: Time!
}

type Favorite {
  id: ID!
  listingId: ID!
  userId: ID!
  listing: CarListing
  createdAt: Time!
}

# ============================================================
# Order Types
# ============================================================

type Order {
  id: ID!
  buyerId: ID!
  sellerId: ID!
  listingId: ID!
  status: String!
  totalPrice: Float!
  paymentStatus: String
  paymentMethod: String
  createdAt: Time!
  updatedAt: Time
  listing: CarListing
}

# ============================================================
# Dealer Types
# ============================================================

type Dealer {
  id: ID!
  name: String!
  slug: String!
  description: String
  logo: String
  logoUrl: String
  coverUrl: String
  address: String
  city: String!
  province: String!
  phone: String
  email: String
  website: String
  isVerified: Boolean!
  rating: Float!
  reviewCount: Int!
  totalReviews: Int!
  listingCount: Int!
  totalListings: Int!
  branchCount: Int
  joinedAt: Time!
  createdAt: Time!
  branches: [DealerBranch!]!
  listings: [CarListing!]!
}

type DealerBranch {
  id: ID!
  name: String!
  address: String
  city: String
  province: String
  phone: String
  isPrimary: Boolean!
  lat: Float
  lng: Float
}

type DealerOffer {
  id: ID!
  dealerId: ID!
  listingId: ID!
  buyerId: ID!
  price: Float!
  status: String!
  note: String
  createdAt: Time!
  updatedAt: Time
  listing: CarListing
}

# ============================================================
# Banner Type
# ============================================================

type Banner {
  id: ID!
  title: String!
  subtitle: String
  imageUrl: String!
  image: String
  linkUrl: String
  link: String
  position: String!
  sortOrder: Int!
  order: Int!
  isActive: Boolean!
  clickCount: Int!
  impressions: Int!
  startDate: Time
  endDate: Time
}

# ============================================================
# Conversation & Message Types
# ============================================================

type LastMessage {
  id: ID
  content: String
  createdAt: Time
  sender: User
}

type Conversation {
  id: ID!
  listingId: ID!
  buyerId: ID!
  sellerId: ID!
  lastMessage: LastMessage
  lastMessageAt: Time
  unreadCount: Int!
  status: String!
  createdAt: Time!
  updatedAt: Time
  listing: CarListing
  buyer: User
  seller: User
  participants: [User!]!
  messages: [Message!]!
}

type Message {
  id: ID!
  conversationId: ID!
  senderId: ID!
  content: String!
  type: String!
  isRead: Boolean!
  createdAt: Time!
  sender: User
}

# ============================================================
# Notification Type
# ============================================================

type Notification {
  id: ID!
  userId: ID!
  type: String!
  title: String!
  body: String!
  message: String
  data: String
  isRead: Boolean!
  createdAt: Time!
}

# ============================================================
# System Types
# ============================================================

type SystemSetting {
  id: ID!
  key: String!
  value: String!
  type: String!
  group: String!
  description: String
  createdAt: Time
  updatedAt: Time
}

type TokenPackage {
  id: ID!
  name: String!
  description: String
  tokens: Int!
  tokenAmount: Int!
  price: Float!
  bonus: Int
  bonusTokens: Int!
  isPopular: Boolean!
  features: [String!]!
}

# ============================================================
# ListingConnection (kept for potential future use)
# ============================================================

type ListingConnection {
  items: [CarListing!]!
  totalCount: Int!
  page: Int!
  perPage: Int!
  totalPages: Int!
}

# ============================================================
# Landing Data
# ============================================================

type LandingData {
  categories: [Category!]!
  featured: [CarListing!]!
  latest: [CarListing!]!
  popular: [CarListing!]!
}

# ============================================================
# Input Types
# ============================================================

input ListingFilter {
  brand: String
  model: String
  city: String
  condition: String
  fuelType: String
  transmission: String
  bodyType: String
  priceMin: Float
  priceMax: Float
  yearMin: Int
  yearMax: Int
  search: String
  sort: String
}

input UpdateProfileInput {
  name: String
  phone: String
  avatarUrl: String
}

input CreateListingInput {
  title: String
  brand: String
  model: String
  variant: String
  year: Int
  price: Float
  mileage: Int
  condition: String
  transmission: String
  fuelType: String
  bodyType: String
  color: String
  city: String
  province: String
  description: String
  imageUrls: [String]
}

input CreateReviewInput {
  listingId: ID!
  rating: Int!
  title: String
  comment: String
}

input CreateOrderInput {
  listingId: ID!
  paymentMethod: String
}

# ============================================================
# Query
# ============================================================

type Query {
  health: String!
  me: User
  listings(page: Int, perPage: Int, filter: ListingFilter): [CarListing!]!
  listing(id: ID!): CarListing
  listingBySlug(slug: String!): CarListing
  myListings(page: Int, perPage: Int): [CarListing!]!
  brands: [Brand!]!
  colors: [MasterData!]!
  bodyTypes: [MasterData!]!
  fuelTypes: [MasterData!]!
  transmissions: [MasterData!]!
  categories: [Category!]!
  trending(limit: Int): [CarListing!]!
  favorites: [Favorite!]!
  recommendations: [CarListing!]!
  listingReviews(listingId: ID!): [Review!]!
  orders: [Order!]!
  tokenPackages: [TokenPackage!]!
  dealers(page: Int, perPage: Int): [Dealer!]!
  dealer(id: ID!): Dealer
  dealerBySlug(slug: String!): Dealer
  banners(position: String): [Banner!]!
  conversations: [Conversation!]!
  conversation(id: ID!): Conversation
  messages(conversationId: ID!): [Message!]!
  notifications(unreadOnly: Boolean): [Notification!]!
  unreadNotificationCount: Int!
  systemSettings(group: String): [SystemSetting!]!
  landingData: LandingData!
}

# ============================================================
# Mutation
# ============================================================

type Mutation {
  googleLogin(token: String!): AuthResponse!
  refreshToken(token: String!): AuthResponse!
  updateProfile(input: UpdateProfileInput!): User!
  createListing(input: CreateListingInput!): CarListing!
  updateListing(id: ID!, input: CreateListingInput!): CarListing!
  deleteListing(id: ID!): DeleteResult!
  toggleFavorite(listingId: ID!): FavoriteResult!
  createReview(input: CreateReviewInput!): Review!
  createOrder(input: CreateOrderInput!): Order!
  createConversation(listingId: ID!, sellerId: ID): Conversation!
  sendMessage(conversationId: ID!, content: String!): Message!
}

schema {
  query: Query
  mutation: Mutation
}
`

export const schemaStr = typeDefs
