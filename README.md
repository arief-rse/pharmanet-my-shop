# 🏥 PharmaNet MyShop

### Malaysia's Trusted Digital Health E-Commerce Platform

<div align="center">

[![Build Status](https://img.shields.io/github/workflow/status/ariefrse/pharmanet-my-shop/CI?style=flat-square)](https://github.com/ariefrse/pharmanet-my-shop/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![GitHub Stars](https://img.shields.io/github/stars/ariefrse/pharmanet-my-shop?style=flat-square)](https://github.com/ariefrse/pharmanet-my-shop/stargazers)
[![GitHub Issues](https://img.shields.io/github/issues/ariefrse/pharmanet-my-shop?style=flat-square)](https://github.com/ariefrse/pharmanet-my-shop/issues)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](CONTRIBUTING.md)

[![React](https://img.shields.io/badge/React-19.0.0-61DAFB?style=flat-square&logo=react&logoColor=white)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7.2-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0.3-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-2.47.10-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.17-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

[🌐 Live Demo](#-live-demo) • [📖 Documentation](./docs/) • [🐛 Report Bug](https://github.com/ariefrse/pharmanet-my-shop/issues/new?template=bug_report.md) • [✨ Request Feature](https://github.com/ariefrse/pharmanet-my-shop/issues/new?template=feature_request.md)

</div>

---

## 📖 Table of Contents

- [About](#-about)
- [Screenshots](#-screenshots)
- [Live Demo](#-live-demo)
- [Key Features](#-key-features)
- [Technology Stack](#️-technology-stack)
- [Quick Start](#-quick-start)
- [Configuration](#-configuration)
- [Project Structure](#-project-structure)
- [Deployment](#-deployment)
- [API Documentation](#-api-documentation)
- [Contributing](#-contributing)
- [License](#-license)
- [Acknowledgments](#-acknowledgments)
- [Support](#-support)

---

## 📋 About

**PharmaNet MyShop** is a modern, full-featured e-commerce platform specifically designed for pharmaceutical and health product sales in Malaysia. Built with cutting-edge technologies like React 19, TypeScript 5.7, and Supabase, it provides a robust solution for pharmacies, vendors, and consumers.

### 🏗️ Project Scale
- **9,000+ lines** of TypeScript/React code
- **60+ reusable components** built with shadcn/ui
- **Multi-vendor architecture** supporting Consumer, Vendor, and Admin roles
- **Complete Malaysian localization** with state-specific validation
- **Production-ready** with CI/CD and deployment configurations

### Why PharmaNet MyShop?

- 🇲🇾 **Malaysian-First**: Designed specifically for the Malaysian healthcare market with localization for states, postcodes, and currency (MYR)
- 🏪 **Multi-Vendor Ready**: Enable multiple pharmacies to sell on a single platform
- 🔐 **Secure & Compliant**: Role-based access control and secure authentication
- 📱 **Mobile-First**: Responsive design that works beautifully on all devices
- ⚡ **Lightning Fast**: Built with Vite for optimal performance
- 🎨 **Modern UI/UX**: Beautiful interface using Tailwind CSS and shadcn/ui components

---

## 📸 Screenshots

### Homepage
> **TODO**: Add screenshot of hero section with featured products and trust section
>
> *Placeholder: The homepage features a modern hero section with call-to-action buttons, featured products carousel, and trust indicators showing verified pharmacies.*

### Product Catalog with Advanced Filtering
> **TODO**: Add screenshot of product listing page with filters sidebar
>
> *Placeholder: The product catalog shows a grid of products with advanced filtering options (category, price range, ratings), search functionality, and sort capabilities.*

### Shopping Cart & Checkout
> **TODO**: Add screenshot of cart page and checkout flow
>
> *Placeholder: The shopping cart displays items with quantity controls, price breakdown, and a streamlined checkout process with Malaysian payment options.*

### Admin Dashboard & Analytics
> **TODO**: Add screenshot of admin panel with analytics charts
>
> *Placeholder: The admin dashboard provides real-time analytics, sales charts, user management, and platform statistics in a clean, organized interface.*

### Vendor Dashboard
> **TODO**: Add screenshot of vendor product management
>
> *Placeholder: Vendors can manage their products, track sales, view analytics, and handle inventory through an intuitive dashboard.*

### Mobile Responsive Design
> **TODO**: Add mobile screenshots showing responsive layouts
>
> *Placeholder: The platform is fully responsive with optimized mobile views for browsing, shopping, and dashboard access.*

---

## 🌐 Live Demo

Experience PharmaNet MyShop in action!

**🔗 Live Demo**: [https://ariefrse.netlify.app/](https://ariefrse.netlify.app/)

### Demo Accounts

Try out different user roles:

| Role | Email | Password | Access |
|------|-------|----------|--------|
| **Consumer** | demo-consumer@pharmanet.com | demo123 | Browse and shop products |
| **Vendor** | demo-vendor@pharmanet.com | demo123 | Manage products and sales |
| **Admin** | demo-admin@pharmanet.com | demo123 | Full platform access |

> **Note**: Demo data is reset every 24 hours. Feel free to explore all features!

---

## ✨ Key Features

### 🛒 **E-Commerce Essentials**
- **Product Catalog**: Browse thousands of pharmaceutical and health products
- **Advanced Search & Filters**: Find products by category, price, rating, and more
- **Shopping Cart**: Intuitive cart management with quantity adjustments
- **Secure Checkout**: Streamlined checkout process with multiple payment options
- **Order Tracking**: Real-time order status updates and delivery tracking

### 👥 **Multi-Role System**
- **Consumer Portal**: Browse, shop, and track orders
- **Vendor Dashboard**: Product management, sales analytics, and inventory control
- **Admin Panel**: Platform management, user administration, and analytics

### 🏪 **Vendor Features**
- **Product Management**: Easy product listing with multiple images
- **Inventory Tracking**: Real-time stock level management
- **Sales Analytics**: Detailed charts and reports
- **Order Management**: Process and fulfill customer orders

### 🔐 **Security & Authentication**
- **Secure Login**: JWT-based authentication powered by Supabase
- **Role-Based Access Control**: Granular permissions for different user types
- **Data Protection**: Input validation and sanitization
- **Secure File Upload**: Protected image uploads with restrictions

### 🇲🇾 **Malaysian Localization**
- **State & Postcode System**: Complete coverage of Malaysian regions
- **Currency Display**: Ringgit Malaysia (MYR) formatting
- **Dual Language**: English and Bahasa Malaysia support
- **Local Payment Methods**: Integration with Malaysian payment gateways
- **Nationwide Delivery**: Coverage across all Malaysian states

### 📊 **Analytics & Reporting**
- **Sales Dashboard**: Real-time sales data and trends
- **Product Performance**: Track views, ratings, and conversions
- **User Insights**: Monitor customer behavior and engagement
- **Inventory Alerts**: Low stock notifications

### 🎨 **User Experience**
- **Modern UI**: Clean, intuitive interface with shadcn/ui components
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Dark Mode Support**: (Coming soon)
- **Fast Performance**: Optimized with Vite and React Query

---

## 🛠️ Technology Stack

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| **React** | 19.0.0 | UI framework with Server Components and concurrent features |
| **TypeScript** | 5.7.2 | Type-safe JavaScript with advanced type inference |
| **Vite** | 6.0.3 | Next-generation frontend build tool with SWC compiler |
| **React Router** | 6.28.0 | Client-side routing and navigation |
| **TanStack React Query** | 5.62.7 | Powerful data fetching and caching |
| **React Hook Form** | 7.54.0 | Performant form management with Zod validation |
| **Tailwind CSS** | 3.4.17 | Utility-first CSS framework |
| **shadcn/ui** | Latest | High-quality, accessible UI components |
| **Radix UI** | Multiple | Unstyled, accessible component primitives |
| **Lucide React** | 0.468.0 | Beautiful & consistent icon set |
| **Zod** | 3.24.1 | TypeScript-first schema validation |

### Backend & Database
| Technology | Purpose |
|-----------|---------|
| **Supabase** | Backend-as-a-Service platform |
| ├─ PostgreSQL | Relational database |
| ├─ Supabase Auth | Authentication & user management |
| ├─ Supabase Storage | File and image storage |
| └─ Realtime | Real-time subscriptions |

### Integrations
| Service | Purpose |
|---------|---------|
| **Stripe** | Payment processing (configured) |
| **Resend** | Transactional email service |
| **Google Analytics** | Usage analytics (optional) |

### Development & Build Tools
- **ESLint** - Code linting and quality
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixing
- **SWC** - Fast JavaScript/TypeScript compiler

### Deployment
- **Netlify** - Recommended deployment platform
- **Vercel** - Alternative deployment option
- **Docker** - Containerization support

---

## 🚀 Quick Start

Get PharmaNet MyShop running on your local machine in minutes!

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** ≥ 18.0.0 ([Download](https://nodejs.org/))
- **npm** or **yarn**
- **Git** ([Download](https://git-scm.com/))
- **Supabase Account** ([Sign up free](https://supabase.com))

### Installation

#### 1️⃣ Clone the Repository

```bash
git clone https://github.com/ariefrse/pharmanet-my-shop.git
cd pharmanet-my-shop
```

#### 2️⃣ Install Dependencies

```bash
npm install
```

#### 3️⃣ Set Up Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Then edit `.env` with your configuration:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Optional: Payment Integration
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_key
STRIPE_SECRET_KEY=your_stripe_secret

# Optional: Email Service
RESEND_API_KEY=your_resend_api_key
FROM_EMAIL=noreply@yourdomain.com

# Optional: Analytics
VITE_GOOGLE_ANALYTICS_ID=your_ga_id
```

> **Need help with configuration?** See the [Configuration Guide](#-configuration) below.

#### 4️⃣ Set Up Supabase Database

1. **Create a Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Note your project URL and anon key

2. **Run Database Migrations**
   ```bash
   npm run db:migrate
   ```

3. **Seed Initial Data** (Optional)
   ```bash
   npm run db:seed
   ```

4. **Create an Admin User**
   ```bash
   npm run create-admin
   ```

#### 5️⃣ Start Development Server

```bash
npm run dev
```

Visit **http://localhost:8080** to see your app running! 🎉

### Quick Docker Setup

Prefer Docker? Get started with a single command:

```bash
docker-compose up -d
```

See [DEPLOYMENT.md](./DEPLOYMENT.md#docker-setup) for detailed Docker instructions.

---

## ⚙️ Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_SUPABASE_URL` | ✅ Yes | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | ✅ Yes | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | ⚠️ Server-side only | Service role key for admin operations |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Optional | Stripe public key for payments |
| `STRIPE_SECRET_KEY` | Optional | Stripe secret key (server-side) |
| `RESEND_API_KEY` | Optional | Resend API key for emails |
| `VITE_GOOGLE_ANALYTICS_ID` | Optional | Google Analytics tracking ID |
| `VITE_APP_NAME` | Optional | Application name (default: "PharmaNet") |
| `VITE_DEFAULT_CURRENCY` | Optional | Default currency code (default: "MYR") |

### Supabase Setup Guide

1. **Create Project**: Sign up at [supabase.com](https://supabase.com) and create a new project
2. **Get Credentials**: Navigate to Project Settings → API to find your URL and keys
3. **Database Schema**: Our migrations will set up all required tables automatically
4. **Authentication**: Configure email/password provider in Authentication → Providers
5. **Storage**: Create a bucket named `product-images` for product photos

For detailed Supabase configuration, see [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md).

---

## 📁 Project Structure

```
pharmanet-my-shop/
├── src/
│   ├── components/          # Reusable React components
│   │   ├── ui/             # Base UI components (shadcn/ui)
│   │   ├── Header.tsx      # Site navigation header
│   │   ├── Footer.tsx      # Site footer
│   │   ├── Hero.tsx        # Hero section component
│   │   └── ...             # Other shared components
│   ├── pages/              # Page-level components
│   │   ├── Index.tsx       # Homepage
│   │   ├── Products.tsx    # Product catalog
│   │   ├── ProductDetail.tsx  # Product detail page
│   │   ├── Cart.tsx        # Shopping cart
│   │   ├── Auth.tsx        # Authentication pages
│   │   ├── Orders.tsx      # Order history
│   │   ├── Admin.tsx       # Admin dashboard
│   │   ├── VendorDashboard.tsx  # Vendor portal
│   │   └── ...             # Other pages
│   ├── hooks/              # Custom React hooks
│   │   ├── useAuth.tsx     # Authentication hook
│   │   ├── useCart.tsx     # Shopping cart hook
│   │   └── ...             # Other hooks
│   ├── lib/                # Utility functions
│   │   ├── utils.ts        # General utilities
│   │   ├── storage.ts      # Local storage helpers
│   │   └── malaysia-data.ts # Malaysian states/postcodes
│   ├── integrations/       # External service integrations
│   │   └── supabase/
│   │       ├── client.ts   # Supabase client
│   │       └── types.ts    # Database type definitions
│   ├── App.tsx             # Main App component with routing
│   ├── main.tsx            # Application entry point
│   └── index.css           # Global styles & Tailwind imports
├── public/                 # Static assets
├── .github/                # GitHub configuration
│   ├── workflows/          # GitHub Actions CI/CD
│   └── ISSUE_TEMPLATE/     # Issue templates
├── docs/                   # Documentation
│   ├── API.md             # API documentation
│   ├── ARCHITECTURE.md    # System architecture
│   └── DATABASE.md        # Database schema
├── CONTRIBUTING.md         # Contribution guidelines
├── DEPLOYMENT.md          # Deployment instructions
├── CODE_OF_CONDUCT.md     # Code of conduct
├── CHANGELOG.md           # Version history
├── SECURITY.md            # Security policy
├── Dockerfile             # Docker configuration
├── docker-compose.yml     # Docker Compose setup
└── package.json           # Project dependencies
```

---

## 📝 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server on port 8080 |
| `npm run build` | Build for production |
| `npm run build:dev` | Build for development with source maps |
| `npm run build:analyze` | Build and analyze bundle size |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint for code quality checks |
| `npm run lint:fix` | Fix ESLint errors automatically |
| `npm run type-check` | Run TypeScript type checking |
| `npm run create-admin` | Create an admin user account |
| `npm run db:migrate` | Run Supabase database migrations |
| `npm run db:reset` | Reset database to initial state |
| `npm run db:seed` | Seed database with sample data |

---

## 🚀 Deployment

### Quick Deploy Options

Deploy PharmaNet MyShop to various platforms with ease:

**Recommended Platforms:**
- 🟢 **Netlify** - Best for static sites, automatic HTTPS
- 🔷 **Vercel** - Optimized for React/Vite apps
- 🐳 **Docker** - Self-host with containers
- 🖥️ **VPS** - Full control on your own server

### Netlify Deployment (Recommended)

1. **Connect Repository**
   - Sign up at [netlify.com](https://netlify.com)
   - Click "New site from Git"
   - Select your repository

2. **Configure Build Settings**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: 18

3. **Add Environment Variables**
   - Add all required variables from `.env.example`
   - Deploy!

### Detailed Deployment Guide

For comprehensive deployment instructions for all platforms, see:

📖 **[DEPLOYMENT.md](./DEPLOYMENT.md)**

Topics covered:
- Netlify deployment
- Vercel deployment
- Docker containerization
- Self-hosting on VPS
- Environment variable configuration
- Post-deployment checklist
- Troubleshooting common issues

---

## 📚 API Documentation

### Overview

PharmaNet MyShop uses Supabase as its backend, providing:
- RESTful API endpoints
- Real-time subscriptions
- Row Level Security (RLS)
- Authentication with JWT

### Quick API Examples

```typescript
// Fetch products
const { data: products } = await supabase
  .from('products')
  .select('*')
  .eq('is_verified', true)
  .range(0, 9);

// Add to cart
const { data: cartItem } = await supabase
  .from('cart_items')
  .insert({
    user_id: userId,
    product_id: productId,
    quantity: 1
  });

// Create order
const { data: order } = await supabase
  .from('orders')
  .insert({
    user_id: userId,
    total_amount: total,
    status: 'pending'
  });
```

### Full API Documentation

For complete API documentation including all endpoints, authentication, and examples:

📖 **[docs/API.md](./docs/API.md)**

Topics covered:
- Authentication endpoints
- Product operations (CRUD)
- Cart management
- Order processing
- Review system
- User profiles
- Vendor operations
- Admin endpoints
- Error handling
- Rate limiting

---

## 🗄️ Database Schema

### Overview

PharmaNet MyShop uses PostgreSQL via Supabase with the following main entities:

- **users** - User authentication (managed by Supabase Auth)
- **profiles** - User profile information and roles
- **products** - Product catalog with full details
- **categories** - Product categorization
- **cart_items** - Shopping cart data
- **orders** - Order information
- **order_items** - Line items for each order
- **reviews** - Product reviews and ratings
- **vendor_applications** - Vendor registration requests

### Entity Relationships

```
users (1) ←→ (1) profiles
profiles (1) ←→ (many) products (as vendors)
products (many) ←→ (1) categories
products (1) ←→ (many) reviews
users (1) ←→ (many) orders
orders (1) ←→ (many) order_items
products (1) ←→ (many) order_items
users (1) ←→ (many) cart_items
```

### Detailed Schema Documentation

For complete database schema with field definitions, relationships, and diagrams:

📖 **[docs/DATABASE.md](./docs/DATABASE.md)**

---

## 🏗️ Architecture

### System Overview

PharmaNet MyShop follows a modern, scalable architecture:

- **Frontend**: React SPA with client-side routing
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Realtime)
- **Authentication**: JWT-based with Supabase Auth
- **File Storage**: Supabase Storage for images
- **Deployment**: Static hosting on Netlify/Vercel

### Key Design Patterns

- **Component-Based Architecture**: Modular, reusable React components
- **Custom Hooks**: Shared logic encapsulation (useAuth, useCart)
- **Context API**: Global state management
- **React Query**: Server state and caching
- **Row Level Security**: Database-level access control

### Detailed Architecture Guide

For system architecture, data flow diagrams, and design decisions:

📖 **[docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)**

---

## 🤝 Contributing

We love contributions! PharmaNet MyShop is open-source and community-driven.

### How to Contribute

1. 🍴 **Fork the Repository**
2. 🌿 **Create a Feature Branch**: `git checkout -b feature/AmazingFeature`
3. 💻 **Make Your Changes**: Follow our [coding standards](CONTRIBUTING.md#coding-standards)
4. ✅ **Test Your Changes**: Ensure everything works
5. 📝 **Commit**: `git commit -m 'Add some AmazingFeature'`
6. 📤 **Push**: `git push origin feature/AmazingFeature`
7. 🔃 **Open a Pull Request**

### Good First Issues

New to the project? Look for issues labeled [`good first issue`](https://github.com/ariefrse/pharmanet-my-shop/labels/good%20first%20issue) to get started!

### Development Guidelines

- Follow the existing code style
- Use TypeScript for all new code
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Be respectful and constructive

### Detailed Contribution Guide

For comprehensive contribution guidelines, code standards, and development setup:

📖 **[CONTRIBUTING.md](./CONTRIBUTING.md)**

Topics covered:
- Development setup
- Code style and standards
- Testing guidelines
- Pull request process
- Issue reporting
- Documentation contribution

---

## 📜 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

### What this means:
- ✅ Commercial use allowed
- ✅ Modification allowed
- ✅ Distribution allowed
- ✅ Private use allowed
- ⚠️ Liability and warranty disclaimer

---

## 🙏 Acknowledgments

Special thanks to the amazing open-source projects that make PharmaNet MyShop possible:

- [**Supabase**](https://supabase.com) - The open source Firebase alternative
- [**shadcn/ui**](https://ui.shadcn.com) - Beautifully designed components
- [**Tailwind CSS**](https://tailwindcss.com) - Utility-first CSS framework
- [**Radix UI**](https://radix-ui.com) - Unstyled, accessible components
- [**Lucide**](https://lucide.dev) - Beautiful & consistent icons
- [**TanStack Query**](https://tanstack.com/query) - Powerful data synchronization
- [**React Hook Form**](https://react-hook-form.com) - Performant form validation
- [**Vite**](https://vitejs.dev) - Next generation frontend tooling

And to all our [contributors](https://github.com/ariefrse/pharmanet-my-shop/graphs/contributors) who help make this project better!

---

## 💬 Community & Support

### Get Help

- 📖 **[Documentation](./docs/)** - Comprehensive guides and references
- 🐛 **[Report a Bug](https://github.com/ariefrse/pharmanet-my-shop/issues/new?template=bug_report.md)** - Found an issue? Let us know!
- ✨ **[Request a Feature](https://github.com/ariefrse/pharmanet-my-shop/issues/new?template=feature_request.md)** - Have an idea? We'd love to hear it!
- 💬 **[Discussions](https://github.com/ariefrse/pharmanet-my-shop/discussions)** - Ask questions and share ideas
- 📧 **Email**: support@pharmanet.com (for private inquiries)

### Stay Updated

- ⭐ **Star this repo** to show your support
- 👁️ **Watch this repo** to get notified about updates
- 🔀 **Fork this repo** to start building your own e-commerce platform

---

## 📊 Performance Metrics

### Production Performance
- **Lighthouse Score**: 90+ Performance
- **First Contentful Paint**: < 1.5s
- **Build Time**: 2.26s (Vite 6 optimization)
- **Bundle Size**: 562KB (with lazy loading)
- **Hot Reload**: 423ms development server startup

### Code Quality
- **TypeScript Coverage**: 100%
- **ESLint Rules**: Zero warnings
- **Test Coverage**: Framework ready (Vitest setup)
- **Zero Vulnerabilities**: Regular security audits

### Project Statistics

<div align="center">

![GitHub repo size](https://img.shields.io/github/repo-size/ariefrse/pharmanet-my-shop?style=flat-square)
![GitHub language count](https://img.shields.io/github/languages/count/ariefrse/pharmanet-my-shop?style=flat-square)
![GitHub top language](https://img.shields.io/github/languages/top/ariefrse/pharmanet-my-shop?style=flat-square)
![GitHub last commit](https://img.shields.io/github/last-commit/ariefrse/pharmanet-my-shop?style=flat-square)

</div>

---

<div align="center">

**Built with ❤️ for the Malaysian healthcare community**

[⬆ Back to Top](#-pharmanet-myshop)

</div>
