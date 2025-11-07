# Evie's Epoxy - Modern E-Commerce Platform

A full-featured, modern e-commerce platform built with Next.js 14, TypeScript, TailwindCSS, and Stripe. Inspired by clean, minimalist design patterns with smooth animations and responsive layouts.

![Evie's Epoxy](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-38bdf8?style=flat-square&logo=tailwind-css)
![Prisma](https://img.shields.io/badge/Prisma-5-2d3748?style=flat-square&logo=prisma)

## ✨ Features

### 🛍️ E-Commerce Core
- **Product Catalog** - Browse products with filtering, sorting, and search
- **Product Details** - Image gallery with zoom, detailed descriptions, and related products
- **Shopping Cart** - Persistent cart with quantity management
- **Checkout Flow** - Multi-step checkout with address validation
- **Payment Processing** - Secure payments via Stripe
- **Order Management** - Track orders and view history

### 🎨 Design & UX
- **Responsive Design** - Mobile-first, works on all devices
- **Dark/Light Mode** - Theme toggle with system preference detection
- **Smooth Animations** - Framer Motion animations throughout
- **Image Optimization** - Next.js Image component with lazy loading
- **Fast Performance** - Optimized for Core Web Vitals

### 🔐 Authentication & Authorization
- **User Authentication** - Secure login/signup with NextAuth.js
- **Role-Based Access** - Admin and user roles
- **Protected Routes** - Middleware-protected pages
- **Session Management** - Persistent sessions with JWT

### 🎛️ Admin Dashboard
- **Product Management** - Create, edit, and delete products
- **Order Management** - View and manage customer orders
- **Analytics Dashboard** - Sales metrics and insights
- **User Management** - View and manage customers

### 🚀 Technical Features
- **TypeScript** - Full type safety across the application
- **Server Components** - Next.js 14 App Router with RSC
- **API Routes** - RESTful API with Next.js route handlers
- **Database** - PostgreSQL with Prisma ORM
- **State Management** - Zustand for client-side state
- **Form Validation** - React Hook Form with Zod
- **SEO Optimized** - Meta tags, Open Graph, sitemap

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.x or higher
- **npm** or **yarn** package manager
- **PostgreSQL** database (local or cloud)
- **Stripe Account** for payment processing

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Evies-Epoxy
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Environment Setup

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Update the `.env` file with your credentials:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/evies_epoxy"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here" # Generate with: openssl rand -base64 32

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="Evie's Epoxy"

# Admin (first user email becomes admin)
ADMIN_EMAIL="admin@example.com"
```

### 4. Database Setup

Run Prisma migrations to set up your database:

```bash
# Generate Prisma Client
npx prisma generate

# Push schema to database
npx prisma db push

# (Optional) Seed database with sample data
npx prisma db seed
```

### 5. Start Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
Evies-Epoxy/
├── prisma/
│   └── schema.prisma          # Database schema
├── public/                    # Static assets
├── src/
│   ├── app/                   # Next.js 14 App Router
│   │   ├── api/              # API routes
│   │   ├── admin/            # Admin dashboard
│   │   ├── checkout/         # Checkout pages
│   │   ├── login/            # Auth pages
│   │   ├── products/         # Product pages
│   │   └── layout.tsx        # Root layout
│   ├── components/           # React components
│   │   ├── cart/            # Cart components
│   │   ├── home/            # Homepage components
│   │   ├── layout/          # Layout components
│   │   ├── products/        # Product components
│   │   ├── providers/       # Context providers
│   │   └── ui/              # Reusable UI components
│   ├── lib/                 # Utility functions
│   │   ├── auth.ts          # NextAuth configuration
│   │   ├── prisma.ts        # Prisma client
│   │   └── utils.ts         # Helper functions
│   ├── store/               # State management
│   │   └── cartStore.ts     # Cart state with Zustand
│   └── types/               # TypeScript types
│       └── index.ts         # Global type definitions
├── .env.example             # Environment variables template
├── next.config.mjs          # Next.js configuration
├── package.json             # Dependencies
├── tailwind.config.ts       # Tailwind configuration
└── tsconfig.json            # TypeScript configuration
```

## 🛠️ Available Scripts

```bash
# Development
npm run dev                   # Start dev server
npm run build                 # Build for production
npm run start                 # Start production server
npm run lint                  # Run ESLint

# Database
npm run prisma:generate       # Generate Prisma Client
npm run prisma:push           # Push schema to database
npm run prisma:studio         # Open Prisma Studio
```

## 🎨 Tech Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** TailwindCSS
- **Animations:** Framer Motion
- **State Management:** Zustand
- **Form Handling:** React Hook Form
- **Validation:** Zod

### Backend
- **Runtime:** Node.js
- **API:** Next.js API Routes
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** NextAuth.js
- **Payments:** Stripe

### UI Components
- **Icons:** Lucide React
- **Notifications:** React Hot Toast
- **Image Handling:** Next.js Image
- **Dark Mode:** next-themes

## 🔑 Key Features Explained

### Authentication Flow

1. **Sign Up:** Users register with email/password
2. **Sign In:** Secure login with NextAuth.js
3. **Sessions:** JWT-based session management
4. **Protected Routes:** Middleware guards sensitive pages
5. **Admin Access:** First user becomes admin automatically

### Shopping Cart

- Persistent cart using Zustand with localStorage
- Add/remove items with quantity management
- Real-time price calculations
- Cart drawer with smooth animations

### Checkout Process

1. **Cart Review:** Verify items and quantities
2. **Shipping Info:** Enter delivery address
3. **Payment:** Secure Stripe Checkout
4. **Confirmation:** Order confirmation with tracking

### Product Management

- **Create Products:** Admin can add new products
- **Image Upload:** Support for multiple product images
- **Categories:** Organize products by category
- **Inventory:** Track stock levels
- **Pricing:** Regular and sale pricing options

## 🎯 Stripe Integration

### Setup Stripe

1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Get your API keys from the Stripe Dashboard
3. Add keys to `.env` file
4. Configure webhook endpoint:
   - Endpoint: `https://yourdomain.com/api/webhooks/stripe`
   - Events: `checkout.session.completed`, `payment_intent.succeeded`

### Test Mode

Use Stripe test cards:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Any future expiry date and CVC

## 📱 Responsive Breakpoints

```css
sm: 640px   /* Mobile landscape */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
2xl: 1536px /* Extra large */
```

## 🎨 Color Scheme

The application uses a customizable color palette:

```javascript
// Primary: Blue tones
primary-50 to primary-950

// Secondary: Purple tones
secondary-50 to secondary-950

// Accent colors available for customization
```

## 🔒 Security Features

- **Password Hashing:** bcrypt for secure password storage
- **CSRF Protection:** Built into Next.js
- **SQL Injection Prevention:** Prisma parameterized queries
- **XSS Protection:** React automatic escaping
- **Authentication:** Secure JWT sessions
- **Environment Variables:** Sensitive data protected

## 📊 Database Schema

### Main Tables
- **Users:** User accounts and profiles
- **Products:** Product catalog
- **Categories:** Product categories
- **Orders:** Customer orders
- **OrderItems:** Individual order line items

See `prisma/schema.prisma` for complete schema definition.

## 🚀 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Docker Deployment

```bash
# Build image
docker build -t evies-epoxy .

# Run container
docker run -p 3000:3000 --env-file .env evies-epoxy
```

### Environment Variables for Production

Remember to update:
- `NEXTAUTH_URL` to your production domain
- `NEXT_PUBLIC_APP_URL` to your production URL
- Use production Stripe keys
- Set a strong `NEXTAUTH_SECRET`

## 🧪 Testing

```bash
# Run tests (setup required)
npm test

# Run with coverage
npm run test:coverage
```

## 📈 Performance Optimization

- **Image Optimization:** Automatic with Next.js Image
- **Code Splitting:** Automatic with Next.js
- **Lazy Loading:** Components loaded on demand
- **Caching:** Strategic caching with SWR
- **Database:** Indexed queries with Prisma
- **CDN:** Static assets via CDN

## 🐛 Troubleshooting

### Database Connection Issues

```bash
# Test database connection
npx prisma db push

# Reset database
npx prisma migrate reset
```

### Build Errors

```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Stripe Webhook Issues

- Ensure webhook endpoint is publicly accessible
- Verify webhook secret in environment variables
- Check Stripe Dashboard for webhook delivery attempts

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Inspired by modern e-commerce platforms
- Built with amazing open-source tools
- Community feedback and contributions

## 📞 Support

For support, email support@eviesepoxy.com or create an issue on GitHub.

---

**Built with ❤️ using Next.js, TypeScript, and TailwindCSS**
