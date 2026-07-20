import { Product } from '@/types/product'

export const BANNER_IMGS = [
  'https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?w=1400&h=420&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1542181961-9590d0c79dab?w=1400&h=420&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1551887196-72e32bfc7bf3?w=1400&h=420&fit=crop&auto=format',
]

export const PRODUCTS: Product[] = [
  {
    id: 1, name: 'Handthrown Stoneware Mug — Wheat Glaze', price: 18.90, originalPrice: 26.00,
    sold: 4832, rating: 4.9, reviews: 612, shop: "Harrow Ceramics Studio",
    img: 'https://images.unsplash.com/photo-1590422749897-47036da0b0ff?w=400&h=400&fit=crop&auto=format',
    badge: 'HOT', freeShip: true,
  },
  {
    id: 2, name: 'Linen Table Runner — Natural Undyed', price: 14.50, originalPrice: 22.00,
    sold: 2105, rating: 4.8, reviews: 388, shop: "Wold & Weft",
    img: 'https://images.unsplash.com/photo-1591625591034-75d303d2e1a4?w=400&h=400&fit=crop&auto=format',
    badge: 'NEW', freeShip: true,
  },
  {
    id: 3, name: 'Beeswax Pillar Candle Set of 3', price: 22.00,
    sold: 3210, rating: 4.9, reviews: 540, shop: "Meadow & Wick",
    img: 'https://images.unsplash.com/photo-1733127040689-0e8a2823e391?w=400&h=400&fit=crop&auto=format',
    freeShip: true,
  },
  {
    id: 4, name: 'Pressed Wildflower Gift Wrap — 5 Sheets', price: 8.40, originalPrice: 12.00,
    sold: 1876, rating: 4.7, reviews: 203, shop: "The Paper Hedgerow",
    img: 'https://images.unsplash.com/photo-1706641248702-6ff0a3d2812d?w=400&h=400&fit=crop&auto=format',
    badge: '30% OFF',
  },
  {
    id: 5, name: 'Acacia Serving Board — Hand-oiled', price: 31.00, originalPrice: 44.00,
    sold: 987, rating: 4.8, reviews: 176, shop: "Thornwood Workshop",
    img: 'https://images.unsplash.com/photo-1666013942797-9daa4b8b3b4f?w=400&h=400&fit=crop&auto=format',
    freeShip: true,
  },
  {
    id: 6, name: 'Single-Origin Ground Coffee — 250 g', price: 12.80,
    sold: 6540, rating: 4.9, reviews: 1102, shop: "Thornfield Roastery",
    img: 'https://images.unsplash.com/photo-1563311977-d285756282dc?w=400&h=400&fit=crop&auto=format',
    badge: 'TOP', freeShip: true,
  },
  {
    id: 7, name: 'White Ceramic Pour-Over Dripper', price: 24.00, originalPrice: 32.00,
    sold: 1430, rating: 4.7, reviews: 211, shop: "Harrow Ceramics Studio",
    img: 'https://images.unsplash.com/photo-1536936812504-0e77dc3f0b40?w=400&h=400&fit=crop&auto=format',
    freeShip: true,
  },
  {
    id: 8, name: 'Natural Jute Tote Bag — Market Size', price: 9.90, originalPrice: 14.00,
    sold: 5201, rating: 4.6, reviews: 834, shop: "Wold & Weft",
    img: 'https://images.unsplash.com/photo-1588610992315-5654831ceebd?w=400&h=400&fit=crop&auto=format',
    badge: 'SALE',
  },
  {
    id: 9, name: 'Tealight Candle Holder — Turned Oak', price: 16.50,
    sold: 742, rating: 4.8, reviews: 98, shop: "Thornwood Workshop",
    img: 'https://images.unsplash.com/photo-1574200542287-4a5ee8b5ed4f?w=400&h=400&fit=crop&auto=format',
    freeShip: true,
  },
  {
    id: 10, name: 'Dried Herb Bunch — Lavender & Chamomile', price: 7.20,
    sold: 3340, rating: 4.9, reviews: 479, shop: "The Paper Hedgerow",
    img: 'https://images.unsplash.com/photo-1604304194650-3ba3cfa752fd?w=400&h=400&fit=crop&auto=format',
    freeShip: true,
  },
  {
    id: 11, name: 'Woven Wool Throw — Oat & Flax Stripe', price: 58.00, originalPrice: 74.00,
    sold: 612, rating: 4.9, reviews: 145, shop: "Wold & Weft",
    img: 'https://images.unsplash.com/photo-1634665810235-011d663754e7?w=400&h=400&fit=crop&auto=format',
    badge: 'NEW',
  },
  {
    id: 12, name: 'Coffee Pour-Over Kettle — Matte Black', price: 46.00,
    sold: 2198, rating: 4.8, reviews: 367, shop: "Thornfield Roastery",
    img: 'https://images.unsplash.com/photo-1551266681-ba5f0b95e2e5?w=400&h=400&fit=crop&auto=format',
    freeShip: true,
  },
]

export const FLASH_PRODUCTS = PRODUCTS.filter((p) => p.originalPrice).slice(0, 4)