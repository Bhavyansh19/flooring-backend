import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const addressSchema = new mongoose.Schema({
  fullName: String, line1: String, line2: String, suburb: String,
  state: { type: String, enum: ['NSW','VIC','QLD','SA','WA','TAS','NT','ACT'] },
  postcode: String, country: { type: String, default: 'Australia' }, isDefault: { type: Boolean, default: false },
})

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName:  { type: String, required: true, trim: true },
  email:     { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:  { type: String, required: true, minlength: 6 },
  phone:     String,
  role:      { type: String, enum: ['customer','admin'], default: 'customer' },
  addresses: [addressSchema],
  wishlist:  [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  newsletter:{ type: Boolean, default: false },
}, { timestamps: true })

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 12)
  next()
})
userSchema.methods.matchPassword = async function (p) { return bcrypt.compare(p, this.password) }
userSchema.virtual('fullName').get(function () { return `${this.firstName} ${this.lastName}` })

export default mongoose.model('User', userSchema)
