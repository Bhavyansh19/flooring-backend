import mongoose from 'mongoose'
import dotenv from 'dotenv'
import bcrypt from 'bcryptjs'
import User from '../models/User.js'
import Category from '../models/Category.js'
import Product from '../models/Product.js'
import Blog from '../models/Blog.js'

dotenv.config()

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI)
  console.log('🌱 Seeding database...')

  await Promise.all([User.deleteMany(), Category.deleteMany(), Product.deleteMany(), Blog.deleteMany()])

  // ── USERS ──────────────────────────────────────────────────────────────
  const adminPass = await bcrypt.hash('admin123', 12)
  const userPass  = await bcrypt.hash('user123', 12)

  const [admin, customer] = await User.insertMany([
    { firstName: 'Admin', lastName: 'Avenue', email: 'admin@avenuesurface.com.au', password: adminPass, role: 'admin', phone: '0400000001' },
    { firstName: 'Jane',  lastName: 'Smith',  email: 'jane@example.com',           password: userPass,  role: 'customer', phone: '0411222333',
      addresses: [{ fullName: 'Jane Smith', line1: '12 Harbour St', suburb: 'Sydney', state: 'NSW', postcode: '2000', isDefault: true }] },
  ])

  // ── CATEGORIES ─────────────────────────────────────────────────────────
  const categoryData = [
    { name: 'Hybrid Flooring', slug: 'hybrid', emoji: '🌊', order: 1, description: 'Waterproof, durable, and realistic. The most popular flooring choice in Australia.',
      subCategories: [
        { name: 'Standard Hybrid', slug: 'standard-hybrid', brands: ['Eclipse', 'Clever Choice', 'Decoline'] },
        { name: 'Herringbone Hybrid', slug: 'herringbone-hybrid', brands: ['Eclipse', 'HTT'] },
        { name: 'Wide Board Hybrid', slug: 'wide-board-hybrid', brands: ['Sunstar', 'Terra Mater'] },
        { name: 'Acoustic Hybrid', slug: 'acoustic-hybrid', brands: ['Aqua Drop'] },
      ]},
    { name: 'Vinyl Plank', slug: 'vinyl', emoji: '🌿', order: 2, description: 'Luxury vinyl planks — 100% waterproof and perfect for any room.',
      subCategories: [
        { name: 'Luxury Vinyl Plank', slug: 'luxury-vinyl-plank', brands: ['Airstep', 'NFD', 'Desire'] },
        { name: 'Herringbone Vinyl', slug: 'herringbone-vinyl', brands: ['Desire', 'ArtiFloor'] },
        { name: 'Vinyl Tiles (LVT)', slug: 'vinyl-tiles', brands: ['Interface', 'Premium Floors'] },
      ]},
    { name: 'Engineered Timber', slug: 'timber', emoji: '🪵', order: 3, description: 'Real timber veneer over engineered core — the beauty of wood with added stability.',
      subCategories: [
        { name: 'European Oak', slug: 'european-oak', brands: ['Quick-Step', 'Hurford', 'Terra Mater'] },
        { name: 'Australian Native', slug: 'australian-native', brands: ['Hurford', 'Sunstar', 'Australian Select Timbers'] },
        { name: 'Herringbone Engineered', slug: 'herringbone-engineered', brands: ['Eclipse Divine', 'Hurford'] },
        { name: 'Wide Plank Engineered', slug: 'wide-plank-engineered', brands: ['Terra Mater', 'Wonderful Floors'] },
      ]},
    { name: 'Laminate', slug: 'laminate', emoji: '📋', order: 4, description: 'Budget-friendly timber look with excellent scratch resistance.',
      subCategories: [
        { name: 'Standard Laminate', slug: 'standard-laminate', brands: ['Quick-Step', 'Airstep'] },
        { name: 'Water Resistant Laminate', slug: 'water-resistant-laminate', brands: ['HTT', 'Clever Choice', 'Eclipse Aqua'] },
        { name: 'Herringbone Laminate', slug: 'herringbone-laminate', brands: ['Clever Choice Shield'] },
      ]},
    { name: 'Tiles', slug: 'tiles', emoji: '🪨', order: 5, description: 'Floor, wall and outdoor tiles to suit every style and space.',
      subCategories: [
        { name: 'Floor Tiles', slug: 'floor-tiles', brands: ['Stonalix', 'Tivoli', 'Soho'] },
        { name: 'Wall Tiles', slug: 'wall-tiles', brands: ['Brickart', 'Pitture', 'Crayons'] },
        { name: 'Outdoor Tiles', slug: 'outdoor-tiles', brands: ['Tundra', 'Tech Legno'] },
        { name: 'Mosaic & Feature Tiles', slug: 'mosaic-tiles', brands: ['Penny Rounds', 'Antique Tides', 'Fragment Brick'] },
      ]},
    { name: 'Bamboo', slug: 'bamboo', emoji: '🎋', order: 6, description: 'Eco-friendly, sustainable, and incredibly hard-wearing.',
      subCategories: [
        { name: 'Strand Woven Bamboo', slug: 'strand-woven', brands: ['Clever Choice', 'Premium Floors'] },
        { name: 'Engineered Bamboo', slug: 'engineered-bamboo', brands: ['Eco Flooring Systems'] },
      ]},
    { name: 'Carpet Tiles', slug: 'carpet', emoji: '🧶', order: 7, description: 'Commercial and residential carpet tiles — easy to replace individual tiles.',
      subCategories: [
        { name: 'Commercial Carpet Tiles', slug: 'commercial-carpet', brands: ['Airlay', 'NFD'] },
        { name: 'Residential Carpet Tiles', slug: 'residential-carpet', brands: ['Airlay'] },
      ]},
    { name: 'Artificial Grass', slug: 'grass', emoji: '🌱', order: 8, description: 'Low maintenance artificial turf for lawns, balconies, and pet areas.',
      subCategories: [
        { name: 'Premium Turf', slug: 'premium-turf', brands: ['SYNLawn', 'Exquisite Turf'] },
      ]},
    { name: 'Rugs', slug: 'rugs', emoji: '🏠', order: 9, description: 'Quality rugs to complement any flooring.',
      subCategories: [{ name: 'All Rugs', slug: 'all-rugs', brands: ['Bayliss'] }]},
    { name: 'Accessories', slug: 'accessories', emoji: '🔧', order: 10, description: 'Everything you need to complete your flooring installation.',
      subCategories: [
        { name: 'Underlay', slug: 'underlay' },
        { name: 'Adhesive & Glue', slug: 'adhesive' },
        { name: 'Aluminium Profiles', slug: 'profiles' },
        { name: 'Grout & Sealers', slug: 'grout' },
      ]},
  ]

  const categories = await Category.insertMany(categoryData)
  const catMap = {}
  categories.forEach(c => { catMap[c.slug] = c._id })

  // ── PRODUCTS ───────────────────────────────────────────────────────────
  const products = await Product.insertMany([
    // HYBRID
    { name: 'Eclipse Classique Hybrid Natural Oak', slug: 'eclipse-classique-hybrid-natural-oak', sku: 'ECL-HYB-001',
      description: 'Australia\'s best-selling hybrid plank. 100% waterproof SPC core with a stunning natural oak finish. Perfect for whole-home installation including bathrooms and laundries. Meets AS 1884 standards.',
      shortDescription: '100% waterproof hybrid plank in Natural Oak. AS 1884 compliant, 25yr warranty.',
      price: 54.95, unit: 'm²', category: catMap['hybrid'], subCategory: 'standard-hybrid', brand: 'Eclipse',
      tags: ['waterproof','hybrid','natural oak','popular'],
      gradientFrom: '#C8A870', gradientTo: '#A88850',
      specs: [{ key: 'Size', value: '1830×180mm' }, { key: 'Thickness', value: '6.5mm' }, { key: 'Wear Layer', value: '0.5mm' }, { key: 'Install', value: 'Click Float' }, { key: 'Warranty', value: '25 years' }, { key: 'Slip Rating', value: 'P4' }],
      attributes: { waterproof: true, diyFriendly: true, petFriendly: true, slipRating: 'P4', colour: 'Natural Oak', finish: 'Matt', thickness: '6.5mm', warranty: '25 years' },
      isFeatured: true, isBestseller: true, isNew: false, stock: 250 },

    { name: 'Eclipse Elysium Hybrid Herringbone Blonde Oak', slug: 'eclipse-elysium-hybrid-herringbone-blonde-oak', sku: 'ECL-HYB-002',
      description: 'Stunning herringbone pattern hybrid flooring in Blonde Oak. 100% waterproof, scratch-resistant, and easy to install. The herringbone pattern adds a premium designer feel to any space.',
      shortDescription: 'Herringbone hybrid in Blonde Oak. 100% waterproof, scratch-resistant.',
      price: 69.95, onSale: true, salePrice: 59.95, unit: 'm²', category: catMap['hybrid'], subCategory: 'herringbone-hybrid', brand: 'Eclipse',
      tags: ['herringbone','hybrid','blonde oak','waterproof'],
      gradientFrom: '#D8C8A0', gradientTo: '#B8A880',
      specs: [{ key: 'Size', value: '610×122mm' }, { key: 'Thickness', value: '7.5mm' }, { key: 'Pattern', value: 'Herringbone' }, { key: 'Warranty', value: '20 years' }],
      attributes: { waterproof: true, herringbone: true, diyFriendly: true, colour: 'Blonde Oak', finish: 'Matt', thickness: '7.5mm', warranty: '20 years' },
      isFeatured: true, isNew: true, stock: 120 },

    { name: 'Decoline Natural Hybrid Spotted Gum', slug: 'decoline-natural-hybrid-spotted-gum', sku: 'DEC-HYB-001',
      description: 'Classic Australian Spotted Gum look in a waterproof hybrid plank. Rich colour variation and authentic wood texture. Ideal for living areas, hallways, and bedrooms.',
      shortDescription: 'Spotted Gum hybrid — authentic Australian timber look, fully waterproof.',
      price: 58.95, unit: 'm²', category: catMap['hybrid'], subCategory: 'standard-hybrid', brand: 'Decoline',
      tags: ['spotted gum','hybrid','australian'],
      gradientFrom: '#B8885A', gradientTo: '#987040',
      specs: [{ key: 'Size', value: '1830×183mm' }, { key: 'Thickness', value: '6mm' }, { key: 'Warranty', value: '20 years' }],
      attributes: { waterproof: true, diyFriendly: true, petFriendly: true, colour: 'Spotted Gum', finish: 'Matt', thickness: '6mm', warranty: '20 years' },
      isFeatured: true, stock: 180 },

    // VINYL
    { name: 'Airstep Naturale Planks 5.0 Ivory Grey', slug: 'airstep-naturale-planks-ivory-grey', sku: 'AIR-VNL-001',
      description: 'Premium luxury vinyl plank in Ivory Grey. SPC rigid core provides exceptional dimensional stability across Australian temperature extremes. Suitable for all rooms including bathrooms.',
      shortDescription: 'LVP in Ivory Grey — SPC rigid core, 100% waterproof, P4 slip rated.',
      price: 42.95, unit: 'm²', category: catMap['vinyl'], subCategory: 'luxury-vinyl-plank', brand: 'Airstep',
      tags: ['vinyl','luxury vinyl','grey','waterproof'],
      gradientFrom: '#D0CEC8', gradientTo: '#B0AEA8',
      specs: [{ key: 'Size', value: '1840×178mm' }, { key: 'Thickness', value: '5mm' }, { key: 'Core', value: 'SPC Rigid' }, { key: 'Slip Rating', value: 'P4' }, { key: 'Warranty', value: '20 years' }],
      attributes: { waterproof: true, diyFriendly: true, slipResistant: true, underflooorHeatingCompatible: true, slipRating: 'P4', colour: 'Grey', finish: 'Matt', thickness: '5mm', warranty: '20 years' },
      isFeatured: true, isBestseller: true, stock: 300 },

    { name: 'Desire XL Luxury Vinyl Plank Travertine', slug: 'desire-xl-vinyl-travertine', sku: 'DES-VNL-001',
      description: 'Large format vinyl plank in a stunning travertine stone look. XL format planks (1520mm long) create a seamless, luxurious finish with fewer joins. 100% waterproof.',
      shortDescription: 'XL vinyl plank in Travertine stone look. Large format, fully waterproof.',
      price: 38.95, onSale: true, salePrice: 32.95, unit: 'm²', category: catMap['vinyl'], subCategory: 'luxury-vinyl-plank', brand: 'Desire',
      tags: ['vinyl','travertine','stone look','waterproof'],
      gradientFrom: '#D8D0C0', gradientTo: '#B8B0A0',
      specs: [{ key: 'Size', value: '1520×228mm' }, { key: 'Thickness', value: '5mm' }, { key: 'Look', value: 'Stone / Travertine' }, { key: 'Warranty', value: '15 years' }],
      attributes: { waterproof: true, diyFriendly: true, colour: 'Travertine', finish: 'Matt', thickness: '5mm', warranty: '15 years' },
      isFeatured: false, isNew: true, stock: 200 },

    // TIMBER
    { name: 'Eclipse Divine Engineered Timber Chirrut', slug: 'eclipse-divine-engineered-timber-chirrut', sku: 'ECL-TIM-001',
      description: 'Premium European Oak engineered timber in Chirrut — a warm, medium-toned finish with natural grain variation. 15mm thickness with 4mm oak veneer. Can be sanded and refinished twice.',
      shortDescription: 'European Oak engineered timber in warm Chirrut tone. 4mm veneer, refinishable.',
      price: 64.95, unit: 'm²', category: catMap['timber'], subCategory: 'european-oak', brand: 'Eclipse',
      tags: ['engineered timber','european oak','premium'],
      gradientFrom: '#C8A870', gradientTo: '#A88050',
      specs: [{ key: 'Size', value: '2200×190mm' }, { key: 'Thickness', value: '15mm' }, { key: 'Veneer', value: '4mm European Oak' }, { key: 'Finish', value: 'UV Matt' }, { key: 'Warranty', value: '25 years' }],
      attributes: { fscCertified: true, colour: 'Warm Brown', finish: 'Matt', thickness: '15mm', warranty: '25 years' },
      isFeatured: true, isNew: true, stock: 80 },

    { name: 'Hurford Australian Native Blackbutt', slug: 'hurford-australian-native-blackbutt', sku: 'HUR-TIM-001',
      description: 'Classic Australian Blackbutt engineered timber — the most popular native hardwood species in Australian homes. Rich, warm tones with natural character. Pre-finished with UV-cured polyurethane.',
      shortDescription: 'Australian Blackbutt engineered timber. Pre-finished, 15yr warranty.',
      price: 89.95, onSale: true, salePrice: 74.95, unit: 'm²', category: catMap['timber'], subCategory: 'australian-native', brand: 'Hurford',
      tags: ['blackbutt','australian timber','hardwood','engineered'],
      gradientFrom: '#C09060', gradientTo: '#A07040',
      specs: [{ key: 'Size', value: '1800×130mm' }, { key: 'Thickness', value: '14mm' }, { key: 'Veneer', value: '3mm Blackbutt' }, { key: 'Janka', value: '9.1 kN' }, { key: 'Finish', value: 'UV Poly' }, { key: 'Warranty', value: '15 years' }],
      attributes: { fscCertified: true, colour: 'Blackbutt', finish: 'Satin', thickness: '14mm', warranty: '15 years' },
      isFeatured: true, stock: 60 },

    { name: 'Terra Mater WildOak Arlo Herringbone', slug: 'terra-mater-wildoak-arlo-herringbone', sku: 'TM-TIM-001',
      description: 'Stunning European Oak herringbone engineered timber from Terra Mater\'s WildOak range. Brushed, whitewash finish for a contemporary Scandi aesthetic. FSC certified, low-VOC finish.',
      shortDescription: 'European Oak herringbone — brushed whitewash, FSC certified, low VOC.',
      price: 94.95, unit: 'm²', category: catMap['timber'], subCategory: 'herringbone-engineered', brand: 'Terra Mater',
      tags: ['herringbone','engineered timber','whitewash','premium'],
      gradientFrom: '#E8E0D0', gradientTo: '#C8C0B0',
      specs: [{ key: 'Size', value: '400×80mm' }, { key: 'Pattern', value: 'Herringbone' }, { key: 'Thickness', value: '14mm' }, { key: 'Veneer', value: '3mm European Oak' }, { key: 'Finish', value: 'Brushed Whitewash' }],
      attributes: { herringbone: true, fscCertified: true, lowVoc: true, colour: 'Whitewash', finish: 'Brushed', thickness: '14mm', warranty: '20 years' },
      isFeatured: true, stock: 45 },

    // LAMINATE
    { name: 'Topdeck Prime Legend Ghost Oak Laminate', slug: 'topdeck-prime-legend-ghost-oak-laminate', sku: 'TOP-LAM-001',
      description: 'The iconic Ghost Oak laminate from Topdeck\'s Prime Legend Collection. Light, airy grey-white oak tone with deep emboss texture. DYNA CORE+ technology provides superior impact resistance.',
      shortDescription: 'Ghost Oak laminate — iconic light tone, DYNA CORE+ impact resistance, 15yr warranty.',
      price: 38.95, unit: 'm²', category: catMap['laminate'], subCategory: 'standard-laminate', brand: 'Topdeck',
      tags: ['laminate','ghost oak','grey','popular'],
      gradientFrom: '#E0D8CC', gradientTo: '#C0B8AC',
      specs: [{ key: 'Size', value: '1215×195mm' }, { key: 'Thickness', value: '12mm' }, { key: 'AC Rating', value: 'AC4' }, { key: 'Core', value: 'DYNA CORE+' }, { key: 'Warranty', value: '15 years' }],
      attributes: { diyFriendly: true, colour: 'Ghost Oak', finish: 'Deep Emboss', thickness: '12mm', warranty: '15 years' },
      isFeatured: true, isBestseller: true, stock: 400 },

    { name: 'Eclipse Aqua Schild Water Resistant Laminate Essen', slug: 'eclipse-aqua-schild-laminate-essen', sku: 'ECL-LAM-001',
      description: 'Water-resistant laminate with AquaShield technology — sealed joints keep water out for up to 30 minutes. Perfect for kitchens and laundries. Premium AC5 wear rating for high-traffic areas.',
      shortDescription: 'Water-resistant laminate with 30-min water resistance. AC5 rated for heavy traffic.',
      price: 55.95, onSale: true, salePrice: 47.95, unit: 'm²', category: catMap['laminate'], subCategory: 'water-resistant-laminate', brand: 'Eclipse',
      tags: ['laminate','water resistant','kitchen','laundry'],
      gradientFrom: '#C8C0B0', gradientTo: '#A8A098',
      specs: [{ key: 'Size', value: '1215×195mm' }, { key: 'Thickness', value: '12mm' }, { key: 'AC Rating', value: 'AC5' }, { key: 'Water Resistance', value: '30 min' }, { key: 'Warranty', value: '20 years' }],
      attributes: { diyFriendly: true, underflooorHeatingCompatible: true, colour: 'Essen Oak', finish: 'Natural Matt', thickness: '12mm', warranty: '20 years' },
      isFeatured: false, isNew: true, stock: 220 },

    // TILES
    { name: 'Calacatta Marble Look Floor Tile 600×600', slug: 'calacatta-marble-floor-tile-600', sku: 'TIL-FLR-001',
      description: 'Stunning Italian-inspired Calacatta marble look porcelain tile. Subtle grey veining on a white base creates a luxurious feel. Suitable for floors and walls in bathrooms, kitchens, and living areas.',
      shortDescription: 'Calacatta marble look porcelain — floor & wall, P3 slip rating, rectified edge.',
      price: 52.95, unit: 'm²', category: catMap['tiles'], subCategory: 'floor-tiles', brand: 'Stonalix',
      tags: ['calacatta','marble','porcelain','white','bathroom'],
      gradientFrom: '#F0ECE4', gradientTo: '#D8D0C8',
      specs: [{ key: 'Size', value: '600×600mm' }, { key: 'Thickness', value: '10mm' }, { key: 'Finish', value: 'Polished' }, { key: 'Slip Rating', value: 'P3' }, { key: 'Material', value: 'Porcelain' }, { key: 'Edge', value: 'Rectified' }],
      attributes: { slipResistant: true, slipRating: 'P3', colour: 'White/Grey', finish: 'Polished', thickness: '10mm' },
      isFeatured: true, isBestseller: true, stock: 500 },

    { name: 'Charcoal Slate Outdoor Tile 600×600 20mm', slug: 'charcoal-slate-outdoor-tile-600-20mm', sku: 'TIL-OUT-001',
      description: 'Heavy-duty 20mm porcelain outdoor tile in Charcoal Slate texture. P5 slip rating makes it ideal for pool surrounds, patios, and entry areas. Frost-resistant and UV stable.',
      shortDescription: 'Charcoal Slate outdoor porcelain — P5 slip rated, 20mm thick, frost resistant.',
      price: 44.95, unit: 'm²', category: catMap['tiles'], subCategory: 'outdoor-tiles', brand: 'Tundra',
      tags: ['outdoor','slate','charcoal','pool','patio','P5'],
      gradientFrom: '#808880', gradientTo: '#606060',
      specs: [{ key: 'Size', value: '600×600mm' }, { key: 'Thickness', value: '20mm' }, { key: 'Slip Rating', value: 'P5' }, { key: 'Use', value: 'Outdoor / Pool' }, { key: 'Frost Resistant', value: 'Yes' }],
      attributes: { slipResistant: true, outdoorRated: true, slipRating: 'P5', colour: 'Charcoal', finish: 'Structured', thickness: '20mm' },
      isFeatured: true, stock: 350 },

    { name: 'White Penny Round Mosaic Feature Tile', slug: 'white-penny-round-mosaic-tile', sku: 'TIL-MOS-001',
      description: 'Classic white penny round mosaic tile on mesh backing. A timeless feature tile for bathroom walls, kitchen splashbacks, shower niches, and feature walls.',
      shortDescription: 'White penny round mosaic on mesh — ideal for bathroom walls and splashbacks.',
      price: 89.95, unit: 'm²', category: catMap['tiles'], subCategory: 'mosaic-tiles', brand: 'Penny Rounds',
      tags: ['mosaic','penny round','white','bathroom','feature wall'],
      gradientFrom: '#F5F2EC', gradientTo: '#E0D8CC',
      specs: [{ key: 'Tile Size', value: '23mm diameter' }, { key: 'Sheet Size', value: '300×300mm' }, { key: 'Material', value: 'Porcelain' }, { key: 'Use', value: 'Wall / Feature' }],
      attributes: { colour: 'White', finish: 'Gloss', thickness: '6mm' },
      isFeatured: false, isNew: true, stock: 150 },

    // BAMBOO
    { name: 'Clever Choice Strand Woven Bamboo Natural', slug: 'clever-choice-strand-woven-bamboo-natural', sku: 'BAM-001',
      description: 'One of the hardest flooring materials available. Strand woven bamboo with a Janka hardness of 14kN — harder than most hardwoods. FSC certified, E0 formaldehyde emissions. Suitable for high-traffic areas.',
      shortDescription: 'Strand woven bamboo — 14kN Janka hardness, FSC certified, E0 emissions.',
      price: 49.95, unit: 'm²', category: catMap['bamboo'], subCategory: 'strand-woven', brand: 'Clever Choice',
      tags: ['bamboo','eco','sustainable','hard wearing'],
      gradientFrom: '#D0C880', gradientTo: '#B0A860',
      specs: [{ key: 'Size', value: '1850×130mm' }, { key: 'Thickness', value: '14mm' }, { key: 'Janka', value: '14 kN' }, { key: 'Emission', value: 'E0' }, { key: 'Warranty', value: '20 years' }],
      attributes: { fscCertified: true, lowVoc: true, colour: 'Natural', finish: 'Matt', thickness: '14mm', warranty: '20 years' },
      isFeatured: true, stock: 90 },

    // CARPET TILES
    { name: 'Airlay Paragon Commercial Carpet Tile Ash', slug: 'airlay-paragon-carpet-tile-ash', sku: 'CAR-001',
      description: 'Heavy-duty commercial carpet tile in Ash — a sophisticated mid-grey. Anti-static, soil-resistant face fibre. Individual tiles can be replaced if damaged. Suitable for offices, retail, and residential.',
      shortDescription: 'Commercial loop carpet tile in Ash grey — anti-static, easy individual replacement.',
      price: 28.95, unit: 'm²', category: catMap['carpet'], subCategory: 'commercial-carpet', brand: 'Airlay',
      tags: ['carpet tiles','commercial','office','grey'],
      gradientFrom: '#A0A0A8', gradientTo: '#808088',
      specs: [{ key: 'Size', value: '500×500mm' }, { key: 'Pile', value: 'Loop' }, { key: 'Weight', value: '600g/m²' }, { key: 'Fire Rating', value: 'Group 1' }],
      attributes: { commercialGrade: true, soundproof: true, colour: 'Ash Grey', finish: 'Loop' },
      isFeatured: false, stock: 600 },
  ])

  // ── BLOGS ─────────────────────────────────────────────────────────────
  await Blog.insertMany([
    { title: "Why Hybrid Flooring is Australia's Most Popular Choice in 2026", slug: 'why-hybrid-flooring-australias-most-popular-2026',
      category: 'hybrid', isPublished: true, publishedAt: new Date('2026-04-01'), featured: true,
      gradientFrom: '#3D8B8B', gradientTo: '#2A6060', readTime: '5 min read',
      excerpt: 'The perfect balance of waterproofing, durability, and realistic timber looks. We break down exactly why hybrid has overtaken laminate in Australian homes.',
      content: 'Hybrid flooring has become the go-to choice for Australian homeowners. Unlike traditional timber or laminate, hybrid planks combine a rigid stone-polymer composite (SPC) core with a realistic timber-look print layer — making them 100% waterproof and suitable for every room including bathrooms.\n\nFor Australian conditions specifically, hybrid handles the extreme temperature fluctuations that cause traditional timber to expand and contract. In Queensland summers or Melbourne winters, hybrid maintains its form.\n\nCoupled with easy click-float installation that most DIYers can tackle in a weekend, hybrid has disrupted the flooring market like nothing else in the past decade.' },

    { title: 'LVP vs SPC vs WPC: Decoding Vinyl Flooring for Australian Homes', slug: 'lvp-spc-wpc-vinyl-flooring-guide',
      category: 'vinyl', isPublished: true, publishedAt: new Date('2026-03-15'),
      gradientFrom: '#3A6898', gradientTo: '#1A4878', readTime: '5 min read',
      excerpt: 'The acronyms are confusing. The differences matter. We cut through the jargon so you can buy with confidence.',
      content: 'LVP (Luxury Vinyl Plank) is the broad category name for all rigid vinyl planks that look like timber. Under this umbrella sit two main core types: SPC and WPC.\n\nSPC (Stone Polymer Composite) uses a limestone and PVC blend — extremely dense, rigid, and dimensionally stable. Best for Australian conditions with extreme temperature swings.\n\nWPC (Wood Polymer Composite) uses wood flour and PVC — softer and warmer underfoot, but slightly less stable.\n\nFor most Australian homes, we recommend SPC-core products for their superior dimensional stability across our extreme climate range.' },

    { title: 'European Oak vs Australian Hardwood: The Great Timber Debate', slug: 'european-oak-vs-australian-hardwood',
      category: 'timber', isPublished: true, publishedAt: new Date('2026-03-01'), featured: true,
      gradientFrom: '#8B5828', gradientTo: '#6B3808', readTime: '7 min read',
      excerpt: 'Imported European Oak dominates the market, but Australian species like Blackbutt and Spotted Gum have unique character. An honest comparison.',
      content: 'Walk into any premium new home in Australia today and the odds are strong you will find European Oak flooring. It has become the dominant choice — favoured for its consistent grain, wide plank formats, and the extensive range of finishes available.\n\nBut Australian hardwood species — Blackbutt, Spotted Gum, Sydney Blue Gum — have a unique character that European Oak cannot replicate. These species evolved in Australian conditions, have natural variation and character, and are among the hardest timbers in the world.\n\nJanka hardness: European Oak = 6 kN. Spotted Gum = 11 kN. Blackbutt = 9.1 kN. For high-traffic areas in active households, Australian species offer significantly better dent and scratch resistance.' },

    { title: 'The Truth About Water-Resistant vs Waterproof Laminate', slug: 'water-resistant-vs-waterproof-laminate',
      category: 'laminate', isPublished: true, publishedAt: new Date('2026-02-20'),
      gradientFrom: '#C89840', gradientTo: '#A07820', readTime: '4 min read',
      excerpt: 'Marketing claims vs reality. We test Australian laminate products and tell you which rooms each is truly suited for.',
      content: 'Walk into any flooring showroom and you will see laminate labelled "water-resistant", "waterproof", and sometimes both on the same packaging. This is confusing — and often misleading.\n\nMost laminate flooring is surface-sealed — meaning small spills wiped up quickly will not cause damage. This is what manufacturers call "water-resistant." But the HDF core remains susceptible to moisture ingress through the joints.\n\nTruly waterproof laminate uses a sealed locking system and moisture-resistant core. At Avenue Surface, we clearly mark tested water resistance times so you can make an informed decision.' },

    { title: 'Is Bamboo Flooring Sustainable? The Truth About Eco-Flooring', slug: 'is-bamboo-flooring-sustainable',
      category: 'bamboo', isPublished: true, publishedAt: new Date('2026-02-01'),
      gradientFrom: '#488040', gradientTo: '#305820', readTime: '5 min read',
      excerpt: 'Bamboo grows fast, but is it really sustainable? We examine FSC certifications, formaldehyde emissions, and what to look for.',
      content: 'Bamboo is often marketed as the most sustainable flooring option. The reality is more nuanced — bamboo can be extremely eco-friendly, or it can be no better than conventional timber products.\n\nBamboo reaches harvest maturity in 3–5 years, compared to 25–80 years for hardwood timber. This rapid regeneration is the foundation of its sustainability claim. However, many low-cost bamboo products use formaldehyde-based adhesives in manufacturing, resulting in high VOC emissions.\n\nWhen purchasing bamboo flooring in Australia, look for: FSC certification, E0 or E1 formaldehyde emission classification, and CARB Phase 2 compliance.' },

    { title: 'Outdoor Tile Slip Ratings Explained: P3, P4, P5 — What You Actually Need', slug: 'outdoor-tile-slip-ratings-p3-p4-p5',
      category: 'tiles', isPublished: true, publishedAt: new Date('2026-01-20'), featured: true,
      gradientFrom: '#A84820', gradientTo: '#784010', readTime: '4 min read',
      excerpt: 'Australian Standards require minimum P4 slip rating for outdoor areas. We explain the ratings and which tiles pass for pools, patios, and entrances.',
      content: 'Slip resistance is the most important technical specification when selecting outdoor tiles in Australia — more important than aesthetics, durability, or price.\n\nAustralian Standard AS 4586 classifies wet slip resistance. For external areas, the P rating measures wet barefoot slip resistance:\n\nP3 (Moderate): Suitable for internal areas with occasional water exposure. Not recommended for outdoor use.\n\nP4 (High): Minimum recommended for outdoor areas including patios, pool surrounds, and external stairs. Meets the National Construction Code requirements.\n\nP5 (Very High): Required for commercial pool surrounds, water parks, and high-risk outdoor applications.\n\nAll outdoor tiles at Avenue Surface are clearly marked with their AS 4586 P rating. All outdoor products meet minimum P4.' },
  ])

  console.log('✅ Seed complete!')
  console.log('─────────────────────────────────────')
  console.log('Admin:    admin@avenuesurface.com.au / admin123')
  console.log('Customer: jane@example.com / user123')
  console.log('─────────────────────────────────────')
  process.exit(0)
}

seed().catch(err => { console.error(err); process.exit(1) })
