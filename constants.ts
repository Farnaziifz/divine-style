import { Product } from './types';

// Helper to generate standard size chart
const createSizes = (b: number, w: number, h: number, l: number) => [
  { label: 'XS', available: true, dims: { bust: b - 4, waist: w - 4, hips: h - 4, length: l } },
  { label: 'S', available: true, dims: { bust: b, waist: w, hips: h, length: l } },
  { label: 'M', available: true, dims: { bust: b + 4, waist: w + 4, hips: h + 4, length: l + 1 } },
  { label: 'L', available: true, dims: { bust: b + 8, waist: w + 8, hips: h + 8, length: l + 2 } },
];

const mockReviews = [
  {
    id: 'r1',
    userName: 'Eleanor Pena',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop',
    date: '2023-10-15',
    rating: 5,
    comment: 'Absolutely stunning dress! The silk feels incredible against the skin and the fit is perfect.',
    role: 'Verified Buyer'
  },
  {
    id: 'r2',
    userName: 'Courtney Henry',
    userAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=100&auto=format&fit=crop',
    date: '2023-11-02',
    rating: 4,
    comment: 'Beautiful vintage style. The waist is a bit tighter than expected, so maybe size up if you are in between.',
    role: 'Verified Buyer'
  },
  {
    id: 'r3',
    userName: 'Arlene McCoy',
    date: '2023-09-28',
    rating: 5,
    comment: 'I wore this to a garden party and received so many compliments. Truly a unique piece.',
    role: 'Fashion Enthusiast'
  }
];

export const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Clara',
    price: 120,
    description: 'Floral vintage dress with bow details and silk finish.',
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=800&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=800&auto=format&fit=crop', // Front
      'https://images.unsplash.com/photo-1612336307429-8a898d10e223?q=80&w=800&auto=format&fit=crop', // Side (Placeholder for demo)
      'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?q=80&w=800&auto=format&fit=crop', // Back (Placeholder)
      'https://images.unsplash.com/photo-1564257631407-4deb1f99d9c2?q=80&w=800&auto=format&fit=crop', // Detail (Placeholder)
      'https://images.unsplash.com/photo-1596472537510-d3c761bb6aac?q=80&w=800&auto=format&fit=crop'  // Texture (Placeholder)
    ],
    video: 'https://videos.pexels.com/video-files/3205803/3205803-hd_1080_1920_25fps.mp4', // Fashion video placeholder
    category: 'Dresses',
    isFeatured: true,
    fabric: {
      name: 'Vintage Silk',
      composition: '100% Pure Silk',
      image: 'https://images.unsplash.com/photo-1575459286821-6531398c8c64?q=80&w=200&auto=format&fit=crop' // Silk texture
    },
    sizes: createSizes(86, 68, 94, 110),
    reviews: mockReviews
  },
  {
    id: '2',
    name: 'Elise',
    price: 95,
    discountPrice: 75,
    description: '1950s inspired polka dot summer dress.',
    image: 'https://images.unsplash.com/photo-1612336307429-8a898d10e223?q=80&w=800&auto=format&fit=crop',
    gallery: [
        'https://images.unsplash.com/photo-1612336307429-8a898d10e223?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1515347619252-60a6bf4fffce?q=80&w=800&auto=format&fit=crop'
    ],
    category: 'Dresses',
    fabric: {
      name: 'Polka Cotton',
      composition: '95% Cotton, 5% Elastane',
      image: 'https://images.unsplash.com/photo-1599822602111-c9c049d5843a?q=80&w=200&auto=format&fit=crop' // Cotton texture
    },
    sizes: createSizes(88, 70, 96, 105),
    reviews: [mockReviews[1]]
  },
  {
    id: '3',
    name: 'Marianne',
    price: 150,
    description: 'Velvet evening gown with lace trimmings.',
    image: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?q=80&w=800&auto=format&fit=crop',
    gallery: [
        'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1620799140408-ed5341cd2431?q=80&w=800&auto=format&fit=crop'
    ],
    video: 'https://videos.pexels.com/video-files/5309381/5309381-hd_1080_1920_25fps.mp4',
    category: 'Gowns',
    fabric: {
      name: 'Royal Velvet',
      composition: 'Polyester Blend',
      image: 'https://images.unsplash.com/photo-1620799140408-ed5341cd2431?q=80&w=200&auto=format&fit=crop' // Velvet
    },
    sizes: createSizes(90, 72, 98, 145),
    reviews: []
  },
  {
    id: '4',
    name: 'Josephine',
    price: 85,
    description: 'Classic linen blouse with embroidered collar.',
    image: 'https://images.unsplash.com/photo-1564257631407-4deb1f99d9c2?q=80&w=800&auto=format&fit=crop',
    category: 'Tops',
    fabric: {
      name: 'French Linen',
      composition: '100% Organic Linen',
      image: 'https://images.unsplash.com/photo-1573612664822-d7d342da7b7b?q=80&w=200&auto=format&fit=crop' // Linen
    },
    sizes: createSizes(88, 70, 90, 60),
    reviews: [mockReviews[2]]
  },
  // Pants & Skirts
  {
    id: '5',
    name: 'Marlene',
    price: 110,
    description: 'High-waisted wide leg trousers in wool.',
    image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=800&auto=format&fit=crop',
    category: 'Pants',
    fabric: {
      name: 'Merino Wool',
      composition: '100% Wool',
      image: 'https://images.unsplash.com/photo-1579271618758-795632eb7a1e?q=80&w=200'
    },
    sizes: createSizes(70, 70, 96, 105), // Bust ignored for pants usually but keeping structure simple
    reviews: [
        {
            id: 'r-marlene-1',
            userName: 'Sophie Tremblay',
            userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100&auto=format&fit=crop',
            date: '2023-12-10',
            rating: 5,
            comment: 'These trousers are simply perfection. The wool is soft but holds its shape beautifully. I feel like a movie star wearing them!',
            role: 'Verified Buyer'
        },
        {
            id: 'r-marlene-2',
            userName: 'Lila K.',
            date: '2024-01-05',
            rating: 4,
            comment: 'Great fit on the waist, but I had to get them hemmed as they are quite long. Otherwise, lovely quality.',
            role: 'Verified Buyer'
        }
    ]
  },
  {
    id: '6',
    name: 'Audrey',
    price: 90,
    discountPrice: 60,
    description: 'Cigarette trousers, slim fit, ankle length.',
    image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=800&auto=format&fit=crop',
    category: 'Pants',
    sizes: createSizes(72, 72, 94, 98)
  },
  {
    id: '7',
    name: 'Coco Skirt',
    price: 130,
    description: 'Tweed A-line skirt with pearl buttons.',
    image: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?q=80&w=800&auto=format&fit=crop',
    category: 'Pants', // Categorizing under pants/bottoms logic
    sizes: createSizes(68, 68, 92, 45)
  },
  // Lingerie
  {
    id: '8',
    name: 'Silk Robe',
    price: 200,
    description: 'Pure silk robe with hand-painted floral motifs.',
    image: 'https://images.unsplash.com/photo-1596472537510-d3c761bb6aac?q=80&w=800&auto=format&fit=crop',
    category: 'Lingerie',
    sizes: createSizes(90, 70, 95, 110)
  },
  {
    id: '9',
    name: 'Lace Bodysuit',
    price: 80,
    discountPrice: 50,
    description: 'French lace bodysuit in noir.',
    image: 'https://images.unsplash.com/photo-1606166325683-e6deb697d301?q=80&w=800&auto=format&fit=crop',
    category: 'Lingerie',
    sizes: createSizes(86, 64, 90, 65)
  },
  // Shoes
  {
    id: '10',
    name: 'Oxford Heels',
    price: 160,
    description: 'Leather oxford shoes with a sturdy heel.',
    image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=800&auto=format&fit=crop',
    category: 'Shoes',
    fabric: {
      name: 'Full Grain Leather',
      composition: 'Leather',
      image: 'https://images.unsplash.com/photo-1550953250-717fe1d71cb9?q=80&w=200'
    }
  },
  {
    id: '11',
    name: 'Mary Janes',
    price: 140,
    description: 'Patent leather red Mary Jane shoes.',
    image: 'https://images.unsplash.com/photo-1515347619252-60a6bf4fffce?q=80&w=800&auto=format&fit=crop',
    category: 'Shoes',
  },
  // Tops
  {
    id: '12',
    name: 'Poet Shirt',
    price: 75,
    description: 'Loose fitting shirt with ruffled sleeves.',
    image: 'https://images.unsplash.com/photo-1551163943-3f6a2b03d289?q=80&w=800&auto=format&fit=crop',
    category: 'Tops',
    sizes: createSizes(90, 75, 95, 60)
  },
   {
    id: '13',
    name: 'Silk Cami',
    price: 45,
    discountPrice: 30,
    description: 'Simple silk camisole in ivory.',
    image: 'https://images.unsplash.com/photo-1618245318763-a15156d6b23c?q=80&w=800&auto=format&fit=crop',
    category: 'Tops',
    sizes: createSizes(84, 65, 88, 40)
  },
];