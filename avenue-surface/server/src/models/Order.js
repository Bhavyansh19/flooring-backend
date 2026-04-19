import mongoose from 'mongoose'

const orderSchema = new mongoose.Schema({
  user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  orderNumber: { type: String, unique: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: String, image: String, price: Number, qty: Number, unit: String,
  }],
  shippingAddress: {
    fullName: String, line1: String, line2: String, suburb: String,
    state: String, postcode: String, country: { type: String, default: 'Australia' }, phone: String,
  },
  paymentMethod:          { type: String, default: 'stripe' },
  paymentResult:          { id: String, status: String, updateTime: String },
  subtotal:               Number,
  shippingCost:           { type: Number, default: 0 },
  gst:                    Number,
  total:                  Number,
  isPaid:                 { type: Boolean, default: false },
  paidAt:                 Date,
  status:                 { type: String, enum: ['pending','confirmed','processing','shipped','delivered','cancelled'], default: 'pending' },
  isDelivered:            { type: Boolean, default: false },
  deliveredAt:            Date,
  trackingNumber:         String,
  notes:                  String,
  stripePaymentIntentId:  String,
}, { timestamps: true })

orderSchema.pre('save', async function (next) {
  if (!this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments()
    this.orderNumber = `AVS-${String(count + 1).padStart(5, '0')}`
  }
  next()
})

export default mongoose.model('Order', orderSchema)
