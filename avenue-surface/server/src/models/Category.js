import mongoose from 'mongoose'

const subCategorySchema = new mongoose.Schema({
  name: String, slug: String, description: String, brands: [String],
})

const categorySchema = new mongoose.Schema({
  name:          { type: String, required: true },
  slug:          { type: String, required: true, unique: true },
  description:   String,
  image:         String,
  emoji:         String,
  subCategories: [subCategorySchema],
  order:         { type: Number, default: 0 },
  isActive:      { type: Boolean, default: true },
}, { timestamps: true })

export default mongoose.model('Category', categorySchema)
