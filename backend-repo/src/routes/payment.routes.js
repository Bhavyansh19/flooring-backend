import express from 'express'
import Stripe from 'stripe'
import Order from '../models/Order.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

router.post('/create-payment-intent', protect, async (req, res) => {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
    const { orderId } = req.body
    const order = await Order.findById(orderId)
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' })
    if (order.user.toString() !== req.user._id.toString()) return res.status(403).json({ success: false, message: 'Forbidden' })

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.total * 100), // cents
      currency: 'aud',
      metadata: { orderId: order._id.toString(), orderNumber: order.orderNumber },
    })

    order.stripePaymentIntentId = paymentIntent.id
    await order.save()

    res.json({ success: true, clientSecret: paymentIntent.client_secret })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
    const sig = req.headers['stripe-signature']
    const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET)

    if (event.type === 'payment_intent.succeeded') {
      const pi = event.data.object
      const order = await Order.findOne({ stripePaymentIntentId: pi.id })
      if (order) {
        order.isPaid = true
        order.paidAt = new Date()
        order.status = 'confirmed'
        order.paymentResult = { id: pi.id, status: pi.status, updateTime: new Date().toISOString() }
        await order.save()
      }
    }
    res.json({ received: true })
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
})

export default router
