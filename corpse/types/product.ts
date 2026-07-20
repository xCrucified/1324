export type Product = {
  id: number
  name: string
  price: number
  originalPrice?: number
  sold: number
  rating: number
  reviews: number
  shop: string
  img: string
  badge?: string
  freeShip?: boolean
}