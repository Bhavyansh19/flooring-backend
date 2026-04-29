import jwt from 'jsonwebtoken'
import User from '../models/User.js'

export const protect = async (req, res, next) => {
  try {
    // Accept token from: cookie, Authorization header, or query param
    const token =
      req.cookies.token ||
      req.headers.authorization?.split(' ')[1] ||
      req.query.token

    if (!token) return res.status(401).json({ success: false, message: 'Not authorised' })

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = await User.findById(decoded.id).select('-password')
    if (!req.user) return res.status(401).json({ success: false, message: 'User not found' })
    next()
  } catch {
    res.status(401).json({ success: false, message: 'Token invalid' })
  }
}

export const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') return res.status(403).json({ success: false, message: 'Admin only' })
  next()
}
