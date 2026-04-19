import Order from '../models/Order.js'
import Product from '../models/Product.js'

export const createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, notes } = req.body
    if (!items?.length) return res.status(400).json({ success: false, message: 'No items' })
    let subtotal = 0
    const orderItems = []
    for (const item of items) {
      const p = await Product.findById(item.product)
      if (!p) return res.status(404).json({ success: false, message: `Product not found` })
      const price = p.onSale && p.salePrice ? p.salePrice : p.price
      subtotal += price * item.qty
      orderItems.push({ product: p._id, name: p.name, image: p.coverImage, price, qty: item.qty, unit: p.unit })
    }
    const shippingCost = subtotal >= 500 ? 0 : 49
    const gst = parseFloat((subtotal * 0.1).toFixed(2))
    const total = parseFloat((subtotal + shippingCost + gst).toFixed(2))
    const order = await Order.create({ user: req.user._id, items: orderItems, shippingAddress, paymentMethod, subtotal: parseFloat(subtotal.toFixed(2)), shippingCost, gst, total, notes })
    res.status(201).json({ success: true, order })
  } catch (err) { res.status(500).json({ success: false, message: err.message }) }
}

export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort('-createdAt')
    res.json({ success: true, orders })
  } catch (err) { res.status(500).json({ success: false, message: err.message }) }
}

export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'firstName lastName email')
    if (!order) return res.status(404).json({ success: false, message: 'Not found' })
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Forbidden' })
    res.json({ success: true, order })
  } catch (err) { res.status(500).json({ success: false, message: err.message }) }
}

export const markPaid = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
    if (!order) return res.status(404).json({ success: false, message: 'Not found' })
    order.isPaid = true; order.paidAt = new Date(); order.status = 'confirmed'; order.paymentResult = req.body
    await order.save()
    res.json({ success: true, order })
  } catch (err) { res.status(500).json({ success: false, message: err.message }) }
}

export const getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query
    const q = status ? { status } : {}
    const orders = await Order.find(q).populate('user', 'firstName lastName email').sort('-createdAt').skip((page - 1) * limit).limit(+limit)
    const total = await Order.countDocuments(q)
    res.json({ success: true, orders, total })
  } catch (err) { res.status(500).json({ success: false, message: err.message }) }
}

export const updateStatus = async (req, res) => {
  try {
    const { status, trackingNumber } = req.body
    const update = { status }
    if (trackingNumber) update.trackingNumber = trackingNumber
    if (status === 'delivered') { update.isDelivered = true; update.deliveredAt = new Date() }
    const order = await Order.findByIdAndUpdate(req.params.id, update, { new: true })
    if (!order) return res.status(404).json({ success: false, message: 'Not found' })
    res.json({ success: true, order })
  } catch (err) { res.status(500).json({ success: false, message: err.message }) }
}
