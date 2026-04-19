import mongoose from 'mongoose'

const blogSchema = new mongoose.Schema({
  title:        { type: String, required: true },
  slug:         { type: String, required: true, unique: true },
  excerpt:      { type: String, required: true },
  content:      { type: String, required: true },
  coverImage:   String,
  gradientFrom: { type: String, default: '#8B7D72' },
  gradientTo:   { type: String, default: '#6B5D52' },
  category:     { type: String, enum: ['hybrid','vinyl','timber','laminate','bamboo','tiles','carpet','general'], required: true },
  tags:         [String],
  authorName:   { type: String, default: 'Avenue Surface Team' },
  readTime:     { type: String, default: '5 min read' },
  isPublished:  { type: Boolean, default: false },
  publishedAt:  Date,
  views:        { type: Number, default: 0 },
  featured:     { type: Boolean, default: false },
}, { timestamps: true })

export default mongoose.model('Blog', blogSchema)
