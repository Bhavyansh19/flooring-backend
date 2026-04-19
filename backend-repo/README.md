# Avenue Surface — Backend API

Node.js + Express + MongoDB REST API for the Avenue Surface flooring e-commerce store.

**Deployed on Render:** [your-api.onrender.com]  
**Frontend repo:** [link to your frontend repo]

---

## Local Development

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.example .env
# Fill in your values in .env

# 3. Seed the database with sample data
npm run seed

# 4. Start dev server
npm run dev
```
API runs at http://localhost:5000

---

## Deploy to Render (Free Tier)

1. Push this folder to a GitHub repo
2. Go to https://render.com → New → Web Service → Connect your repo
3. Settings:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Region:** Singapore (closest to Australia)
4. Add these Environment Variables in Render:

| Variable | Value |
|----------|-------|
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Long random string (run: `openssl rand -hex 32`) |
| `STRIPE_SECRET_KEY` | From Stripe Dashboard |
| `STRIPE_WEBHOOK_SECRET` | From Stripe Webhooks |
| `CLIENT_URL` | Your Vercel frontend URL |
| `NODE_ENV` | `production` |

> `render.yaml` is included for reference.

---

## Seed Data

After deploying, run the seed script once via Render Shell:
```bash
npm run seed
```

Default accounts created:
- **Admin:** admin@avenuesurface.com.au / admin123
- **Customer:** jane@example.com / user123

⚠️ Change these passwords immediately after first login.

---

## API Endpoints

### Auth
```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
PUT  /api/auth/profile
PUT  /api/auth/password
POST /api/auth/address
PUT  /api/auth/wishlist/:productId
```

### Products
```
GET    /api/products              (with filters: category, search, price, attributes)
GET    /api/products/featured
GET    /api/products/new
GET    /api/products/:slug
POST   /api/products/:id/reviews  (auth required)
POST   /api/products              (admin)
PUT    /api/products/:id          (admin)
DELETE /api/products/:id          (admin)
```

### Orders
```
POST /api/orders             (auth)
GET  /api/orders/my          (auth)
GET  /api/orders/:id         (auth)
PUT  /api/orders/:id/pay     (auth)
GET  /api/orders             (admin)
PUT  /api/orders/:id/status  (admin)
```

### Blog
```
GET    /api/blog
GET    /api/blog/:slug
POST   /api/blog    (admin)
PUT    /api/blog/:id (admin)
DELETE /api/blog/:id (admin)
```

### Payment
```
POST /api/payment/create-payment-intent  (auth)
POST /api/payment/webhook
```

### Admin
```
GET /api/admin/stats
GET /api/admin/users
PUT /api/admin/users/:id/role
```

### Upload
```
POST /api/upload           (admin, single image)
POST /api/upload/multiple  (admin, up to 8 images)
```

---

## MongoDB Atlas Setup (Free)

1. Go to https://cloud.mongodb.com
2. Create free M0 cluster
3. Database Access → Add user with read/write access
4. Network Access → Allow `0.0.0.0/0` (all IPs, needed for Render)
5. Clusters → Connect → Drivers → Copy connection string
6. Replace `<password>` in the string with your DB user password
7. Add to Render env vars as `MONGO_URI`
