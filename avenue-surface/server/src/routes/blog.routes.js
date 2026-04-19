import express from 'express'
import { getBlogs, getBlogBySlug, createBlog, updateBlog, deleteBlog } from '../controllers/blog.controller.js'
import { protect, adminOnly } from '../middleware/auth.js'
const router = express.Router()
router.get('/', getBlogs)
router.get('/:slug', getBlogBySlug)
router.post('/', protect, adminOnly, createBlog)
router.put('/:id', protect, adminOnly, updateBlog)
router.delete('/:id', protect, adminOnly, deleteBlog)
export default router
