import express from 'express'
import { upload } from '../middleware/upload.js'
import { protect, adminOnly } from '../middleware/auth.js'
const router = express.Router()

router.post('/', protect, adminOnly, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' })
  res.json({ success: true, url: `/uploads/${req.file.filename}` })
})

router.post('/multiple', protect, adminOnly, upload.array('images', 8), (req, res) => {
  if (!req.files?.length) return res.status(400).json({ success: false, message: 'No files uploaded' })
  res.json({ success: true, urls: req.files.map(f => `/uploads/${f.filename}`) })
})

export default router
