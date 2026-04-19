import express from 'express'
import { createOrder, getMyOrders, getOrderById, markPaid, getAllOrders, updateStatus } from '../controllers/order.controller.js'
import { protect, adminOnly } from '../middleware/auth.js'
const router = express.Router()
router.post('/', protect, createOrder)
router.get('/my', protect, getMyOrders)
router.get('/:id', protect, getOrderById)
router.put('/:id/pay', protect, markPaid)
router.get('/', protect, adminOnly, getAllOrders)
router.put('/:id/status', protect, adminOnly, updateStatus)
export default router
