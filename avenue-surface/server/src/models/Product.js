import mongoose from 'mongoose'

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: String, rating: { type: Number, required: true, min: 1, max: 5 }, comment: String,
}, { timestamps: true })

const productSchema = new mongoose.Schema({
  name:             { type: String, required: true, trim: true },
  slug:             { type: String, required: true, unique: true },
  sku:              String,
  description:      { type: String, required: true },
  shortDescription: String,
  price:            { type: Number, required: true },
  salePrice:        Number,
  onSale:           { type: Boolean, default: false },
  unit:             { type: String, default: 'm²' },
  category:         { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  subCategory:      String,
  brand:            String,
  tags:             [String],
  images:           [{ url: String, alt: String }],
  coverImage:       String,
  specs:            [{ key: String, value: String }],
  attributes: {
    waterproof:                   { type: Boolean, default: false },
    slipResistant:                { type: Boolean, default: false },
    herringbone:                  { type: Boolean, default: false },
    diyFriendly:                  { type: Boolean, default: false },
    petFriendly:                  { type: Boolean, default: false },
    outdoorRated:                 { type: Boolean, default: false },
    commercialGrade:              { type: Boolean, default: false },
    underflooorHeatingCompatible: { type: Boolean, default: false },
    fscCertified:                 { type: Boolean, default: false },
    lowVoc:                       { type: Boolean, default: false },
    slipRating:   String,
    colour:       String,
    finish:       String,
    thickness:    String,
    warranty:     String,
  },
  stock:            { type: Number, default: 100 },
  inStock:          { type: Boolean, default: true },
  sampleAvailable:  { type: Boolean, default: true },
  reviews:          [reviewSchema],
  rating:           { type: Number, default: 0 },
  numReviews:       { type: Number, default: 0 },
  isFeatured:       { type: Boolean, default: false },
  isNew:            { type: Boolean, default: false },
  isBestseller:     { type: Boolean, default: false },
  isActive:         { type: Boolean, default: true },
  gradientFrom:     { type: String, default: '#D4C9BE' },
  gradientTo:       { type: String, default: '#B8ADA0' },
}, { timestamps: true })

productSchema.index({ name: 'text', description: 'text', brand: 'text' })
export default mongoose.model('Product', productSchema)
