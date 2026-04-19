import express from 'express'
import { register, login, logout, getMe, updateProfile, updatePassword, addAddress, toggleWishlist } from '../controllers/auth.controller.js'
import { protect } from '../middleware/auth.js'
const router = express.Router()
router.post('/register', register)
router.post('/login', login)
router.post('/logout', logout)
router.get('/me', protect, getMe)
router.put('/profile', protect, updateProfile)
router.put('/password', protect, updatePassword)
router.post('/address', protect, addAddress)
router.put('/wishlist/:productId', protect, toggleWishlist)
export default router
