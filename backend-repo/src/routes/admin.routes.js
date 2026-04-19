import express from 'express'
import User from '../models/User.js'
import Product from '../models/Product.js'
import Order from '../models/Order.js'
import Blog from '../models/Blog.js'
import { protect, adminOnly } from '../middleware/auth.js'

const router = express.Router()
router.use(protect, adminOnly)

router.get('/stats', async (req, res) => {
  try {
    const [totalUsers, totalProducts, totalOrders, totalBlogs, revenue, recentOrders, lowStock] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments({ isActive: true }),
      Order.countDocuments(),
      Blog.countDocuments(),
      Order.aggregate([{ $match: { isPaid: true } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
      Order.find().sort('-createdAt').limit(5).populate('user', 'firstName lastName email'),
      Product.find({ stock: { $lt: 10 }, isActive: true }).select('name stock').limit(10),
    ])
    res.json({
      success: true,
      stats: {
        totalUsers, totalProducts, totalOrders, totalBlogs,
        totalRevenue: revenue[0]?.total || 0,
      },
      recentOrders,
      lowStock,
    })
  } catch (err) { res.status(500).json({ success: false, message: err.message }) }
})

router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query
    const q = search ? { $or: [{ firstName: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }] } : {}
    const users = await User.find(q).sort('-createdAt').skip((page - 1) * limit).limit(+limit)
    const total = await User.countDocuments(q)
    res.json({ success: true, users, total })
  } catch (err) { res.status(500).json({ success: false, message: err.message }) }
})

router.put('/users/:id/role', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { role: req.body.role }, { new: true })
    res.json({ success: true, user })
  } catch (err) { res.status(500).json({ success: false, message: err.message }) }
})

export default router
