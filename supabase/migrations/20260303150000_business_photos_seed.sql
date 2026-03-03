-- BookEasely: Add sample photos to seeded businesses
-- Uses Unsplash free images (no API key required)

-- The Gentleman's Cut (Barbershop)
UPDATE public.businesses SET
  cover_image_url = 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&q=80',
  photos = ARRAY[
    'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&q=80',
    'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=800&q=80',
    'https://images.unsplash.com/photo-1592647420148-bfcc177e2117?w=800&q=80',
    'https://images.unsplash.com/photo-1662039352486-aeca40b40c39?w=800&q=80'
  ]
WHERE id = 'e0000000-0000-0000-0000-000000000001';

-- Serenity Spa & Wellness (Spa)
UPDATE public.businesses SET
  cover_image_url = 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=800&q=80',
  photos = ARRAY[
    'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=800&q=80',
    'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80',
    'https://images.unsplash.com/photo-1540555700478-4be289fbec6d?w=800&q=80',
    'https://images.unsplash.com/photo-1630595633877-9918ee257288?w=800&q=80'
  ]
WHERE id = 'e0000000-0000-0000-0000-000000000002';

-- FitZone Studio (Fitness)
UPDATE public.businesses SET
  cover_image_url = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80',
  photos = ARRAY[
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80',
    'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800&q=80',
    'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=800&q=80',
    'https://images.unsplash.com/photo-1548544155-4d3802f93013?w=800&q=80'
  ]
WHERE id = 'e0000000-0000-0000-0000-000000000003';

-- Pawfect Grooming (Pet Services)
UPDATE public.businesses SET
  cover_image_url = 'https://images.unsplash.com/photo-1625321171045-1fea4ac688e9?w=800&q=80',
  photos = ARRAY[
    'https://images.unsplash.com/photo-1625321171045-1fea4ac688e9?w=800&q=80',
    'https://images.unsplash.com/photo-1582569522442-348f6ccfd85e?w=800&q=80',
    'https://images.unsplash.com/photo-1624292263729-ff041fe40a03?w=800&q=80',
    'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&q=80'
  ]
WHERE id = 'e0000000-0000-0000-0000-000000000004';

-- Glow Beauty Bar (Beauty/Nails)
UPDATE public.businesses SET
  cover_image_url = 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800&q=80',
  photos = ARRAY[
    'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800&q=80',
    'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=800&q=80',
    'https://images.unsplash.com/photo-1457972729786-0411a3b2b626?w=800&q=80',
    'https://images.unsplash.com/photo-1610992015732-2449b76344bc?w=800&q=80'
  ]
WHERE id = 'e0000000-0000-0000-0000-000000000005';

-- Elite Auto Detail (Auto Services)
UPDATE public.businesses SET
  cover_image_url = 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=800&q=80',
  photos = ARRAY[
    'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=800&q=80',
    'https://images.unsplash.com/photo-1635275490494-7149b936b6b5?w=800&q=80',
    'https://images.unsplash.com/photo-1635275490640-6c889878a3eb?w=800&q=80',
    'https://images.unsplash.com/photo-1635275490617-7d1a50102a01?w=800&q=80'
  ]
WHERE id = 'e0000000-0000-0000-0000-000000000006';

-- BrightMinds Tutoring (Education)
UPDATE public.businesses SET
  cover_image_url = 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&q=80',
  photos = ARRAY[
    'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&q=80',
    'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&q=80',
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80',
    'https://images.unsplash.com/photo-1660128357991-713518efae48?w=800&q=80'
  ]
WHERE id = 'e0000000-0000-0000-0000-000000000007';

-- Ink & Soul Tattoo (Tattoo/Piercing)
UPDATE public.businesses SET
  cover_image_url = 'https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?w=800&q=80',
  photos = ARRAY[
    'https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?w=800&q=80',
    'https://images.unsplash.com/photo-1598371839696-5c5bb1c12015?w=800&q=80',
    'https://images.unsplash.com/photo-1590246814883-57c511e76cc4?w=800&q=80',
    'https://images.unsplash.com/photo-1622329821376-a19fd6002562?w=800&q=80'
  ]
WHERE id = 'e0000000-0000-0000-0000-000000000008';
