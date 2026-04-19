import express from 'express'
import Category from '../models/Category.js'
import { protect, adminOnly } from '../middleware/auth.js'
const router = express.Router()
router.get('/', async (req, res) => {
  try { const cats = await Category.find({ isActive: true }).sort('order'); res.json({ success: true, categories: cats }) }
  catch (err) { res.status(500).json({ success: false, message: err.message }) }
})
router.get('/:slug', async (req, res) => {
  try { const c = await Category.findOne({ slug: req.params.slug }); if (!c) return res.status(404).json({ success: false, message: 'Not found' }); res.json({ success: true, category: c }) }
  catch (err) { res.status(500).json({ success: false, message: err.message }) }
})
router.post('/', protect, adminOnly, async (req, res) => {
  try { const c = await Category.create(req.body); res.status(201).json({ success: true, category: c }) }
  catch (err) { res.status(500).json({ success: false, message: err.message }) }
})
router.put('/:id', protect, adminOnly, async (req, res) => {
  try { const c = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true }); res.json({ success: true, category: c }) }
  catch (err) { res.status(500).json({ success: false, message: err.message }) }
})
export default router
