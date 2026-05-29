import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// High quality car photos from Unsplash - organized by car type
const carPhotosByType: Record<string, string[]> = {
  sedan: [
    'https://images.unsplash.com/photo-1555215695-30036b2016-bmw-4-series-white-sedan?w=800&q=80',
    'https://images.unsplash.com/photo-1621007947382-bcdfa0f0b6d4?w=800&q=80',
    'https://images.unsplash.com/photo-1605559424843-9e9d5d7a6c1f?w=800&q=80',
    'https://images.unsplash.com/photo-1618843479313-40f56f53b0c9?w=800&q=80',
    'https://images.unsplash.com/photo-1606664515524-4f2f0f1e8b4c?w=800&q=80',
  ],
  suv: [
    'https://images.unsplash.com/photo-1519641471654-76da8faa1d77?w=800&q=80',
    'https://images.unsplash.com/photo-1606611013016-96f1b4c0c4d7?w=800&q=80',
    'https://images.unsplash.com/photo-1619767886558-efb6a5d0c35c?w=800&q=80',
    'https://images.unsplash.com/photo-1609521263047-f8f5c0d0c2e3?w=800&q=80',
    'https://images.unsplash.com/photo-1617469767053-d3b523a0b2f1?w=800&q=80',
  ],
  mpv: [
    'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&q=80',
    'https://images.unsplash.com/photo-1553440581-b71a51a7c5d8?w=800&q=80',
    'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&q=80',
    'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&q=80',
  ],
  hatchback: [
    'https://images.unsplash.com/photo-1609521263047-f8f5c0d0c2e3?w=800&q=80',
    'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80',
    'https://images.unsplash.com/photo-1544636331-e02309a7a0b1?w=800&q=80',
    'https://images.unsplash.com/photo-1619767886558-efb6a5d0c35c?w=800&q=80',
  ],
  pickup: [
    'https://images.unsplash.com/photo-1559416523-140ddc3d238c?w=800&q=80',
    'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&q=80',
    'https://images.unsplash.com/photo-1606220838315-056a56b3c2c9?w=800&q=80',
    'https://images.unsplash.com/photo-1612287955828-b56dee21aeb7?w=800&q=80',
  ],
  general: [
    'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&q=80',
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80',
    'https://images.unsplash.com/photo-1542362567-b07e543583f5?w=800&q=80',
    'https://images.unsplash.com/photo-1618843479313-40f56f53b0c9?w=800&q=80',
    'https://images.unsplash.com/photo-1605559424843-9e9d5d7a6c1f?w=800&q=80',
    'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80',
    'https://images.unsplash.com/photo-1617469767053-d3b523a0b2f1?w=800&q=80',
    'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&q=80',
    'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?w=800&q=80',
    'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&q=80',
    'https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?w=800&q=80',
    'https://images.unsplash.com/photo-1544636331-e02309a7a0b1?w=800&q=80',
    'https://images.unsplash.com/photo-1553440581-b71a51a7c5d8?w=800&q=80',
    'https://images.unsplash.com/photo-1549399542-7e3f8b37c34d?w=800&q=80',
    'https://images.unsplash.com/photo-1616422285623-13ff0162193c?w=800&q=80',
    'https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=800&q=80',
    'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&q=80',
    'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?w=800&q=80',
    'https://images.unsplash.com/photo-1502899576159-f224dcf5cbfb?w=800&q=80',
  ]
}

// Interior and detail shots
const interiorShots = [
  'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80',
  'https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=800&q=80',
  'https://images.unsplash.com/photo-1502899576159-f224dcf5cbfb?w=800&q=80',
  'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?w=800&q=80',
]

function getCarPhoto(bodyType: string | null, index: number): string {
  const type = (bodyType || 'general').toLowerCase()
  const photos = carPhotosByType[type] || carPhotosByType.general
  return photos[index % photos.length]
}

export async function GET(request: NextRequest) {
  const results: { step: string; status: string; count?: number; error?: string }[] = []

  try {
    const admin = supabaseAdmin
    if (!admin) {
      return NextResponse.json({ error: 'Supabase admin client not available' }, { status: 500 })
    }

    console.log('🚗 Starting photo update process...')

    // Step 1: Update car_images (listing photos)
    const { data: listings, error: listingsError } = await admin
      .from('car_listings')
      .select('id, body_type')
    
    if (listingsError) {
      results.push({ step: 'fetch_listings', status: 'error', error: listingsError.message })
    } else if (listings && listings.length > 0) {
      console.log(`Found ${listings.length} listings to update photos for`)
      
      // Delete existing images
      await admin.from('car_images').delete().neq('id', '00000000-0000-0000-0000-000000000000')
      
      // Insert new images for each listing
      let imagesInserted = 0
      for (let i = 0; i < listings.length; i++) {
        const listing = listings[i]
        
        // Primary image
        const primaryPhoto = getCarPhoto(listing.body_type, i)
        
        // Additional images
        const additionalPhotos = [
          getCarPhoto(listing.body_type, i + 1),
          getCarPhoto(listing.body_type, i + 2),
          interiorShots[i % interiorShots.length]
        ]

        const images = [
          {
            car_listing_id: listing.id,
            image_url: primaryPhoto,
            caption: 'Tampak Depan',
            is_primary: true,
            display_order: 0
          },
          {
            car_listing_id: listing.id,
            image_url: additionalPhotos[0],
            caption: 'Tampak Samping',
            is_primary: false,
            display_order: 1
          },
          {
            car_listing_id: listing.id,
            image_url: additionalPhotos[1],
            caption: 'Tampak Belakang',
            is_primary: false,
            display_order: 2
          },
          {
            car_listing_id: listing.id,
            image_url: additionalPhotos[2],
            caption: 'Interior',
            is_primary: false,
            display_order: 3
          }
        ]

        const { error: insertError } = await admin
          .from('car_images')
          .insert(images)
        
        if (!insertError) {
          imagesInserted += images.length
        }
      }
      
      results.push({ step: 'car_images', status: 'success', count: imagesInserted })
    }

    // Step 2: Update listing_images table if it exists
    const { data: existingListings, error: liError } = await admin
      .from('listings')
      .select('id')
      .limit(100)
    
    if (!liError && existingListings && existingListings.length > 0) {
      // Delete existing listing_images
      await admin.from('listing_images').delete().neq('id', '00000000-0000-0000-0000-000000000000')
      
      let liInserted = 0
      for (let i = 0; i < existingListings.length; i++) {
        const listing = existingListings[i]
        const images = [
          {
            listing_id: listing.id,
            image_url: carPhotosByType.general[i % carPhotosByType.general.length],
            is_primary: true,
            display_order: 0
          },
          {
            listing_id: listing.id,
            image_url: carPhotosByType.general[(i + 1) % carPhotosByType.general.length],
            is_primary: false,
            display_order: 1
          }
        ]
        
        const { error: insertError } = await admin
          .from('listing_images')
          .insert(images)
        
        if (!insertError) {
          liInserted += images.length
        }
      }
      results.push({ step: 'listing_images', status: 'success', count: liInserted })
    }

    // Step 3: Update banners with car-related images
    // First, try to delete existing banners
    try {
      await admin.from('banners').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    } catch (e) {
      console.log('Could not delete banners:', e)
    }
    
    // Try inserting banners without sort_order column
    const newBanners = [
      {
        title: 'Jual Mobil Anda Sekarang',
        image_url: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1200&q=80',
        target_url: '/listing/create',
        position: 'home-hero',
        status: 'active'
      },
      {
        title: 'Temukan Mobil Impian',
        image_url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80',
        target_url: '/marketplace',
        position: 'home-center',
        status: 'active'
      },
      {
        title: 'Dealer Marketplace',
        image_url: 'https://images.unsplash.com/photo-1542362567-b07e543583f5?w=800&q=80',
        target_url: '/dealer/marketplace',
        position: 'marketplace-top',
        status: 'active'
      },
      {
        title: 'Promo Spesial',
        image_url: 'https://images.unsplash.com/photo-1502899576159-f224dcf5cbfb?w=800&q=80',
        target_url: '/',
        position: 'home-inline',
        status: 'active'
      }
    ]
    
    const { error: bannerError } = await admin.from('banners').insert(newBanners)
    
    if (bannerError) {
      // Try with different column names (camelCase vs snake_case)
      const altBanners = [
        {
          title: 'Jual Mobil Anda Sekarang',
          image_url: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1200&q=80',
          target_url: '/listing/create',
          position: 'home-hero'
        },
        {
          title: 'Temukan Mobil Impian',
          image_url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80',
          target_url: '/marketplace',
          position: 'home-center'
        },
        {
          title: 'Dealer Marketplace',
          image_url: 'https://images.unsplash.com/photo-1542362567-b07e543583f5?w=800&q=80',
          target_url: '/dealer/marketplace',
          position: 'marketplace-top'
        }
      ]
      const { error: altError } = await admin.from('banners').insert(altBanners)
      
      if (altError) {
        results.push({ step: 'banners', status: 'error', error: altError.message })
      } else {
        results.push({ step: 'banners', status: 'success', count: altBanners.length })
      }
    } else {
      results.push({ step: 'banners', status: 'success', count: newBanners.length })
    }

    console.log('✅ Photo update completed!')

    return NextResponse.json({
      success: true,
      message: 'All photos updated with high-quality Unsplash car images!',
      results,
      updated_tables: {
        car_images: results.find(r => r.step === 'car_images')?.count || 0,
        listing_images: results.find(r => r.step === 'listing_images')?.count || 0,
        banners: results.find(r => r.step === 'banners')?.count || 0
      }
    })

  } catch (error) {
    console.error('Error updating photos:', error)
    return NextResponse.json({
      error: String(error),
      results
    }, { status: 500 })
  }
}
