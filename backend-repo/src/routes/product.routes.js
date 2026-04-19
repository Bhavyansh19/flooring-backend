import express from 'express'
import { getProducts, getProductBySlug, getFeatured, getNew, createReview, createProduct, updateProduct, deleteProduct } from '../controllers/product.controller.js'
import { protect, adminOnly } from '../middleware/auth.js'
const router = express.Router()
router.get('/', getProducts)
router.get('/featured', getFeatured)
router.get('/new', getNew)
router.get('/:slug', getProductBySlug)
router.post('/:id/reviews', protect, createReview)
router.post('/', protect, adminOnly, createProduct)
router.put('/:id', protect, adminOnly, updateProduct)
router.delete('/:id', protect, adminOnly, deleteProduct)
export default router
