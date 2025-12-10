# PharmaNet E-Commerce Platform

A modern, full-featured e-commerce platform built with React, TypeScript, and Supabase, designed specifically for pharmaceutical and health product sales in Malaysia.

## 🚀 Features

- **Multi-vendor Support**: Vendors can register, manage products, and track sales
- **User Authentication**: Secure authentication system with role-based access (admin, vendor, consumer)
- **Product Management**: Comprehensive product catalog with categories, inventory management, and search/filter capabilities
- **Shopping Cart & Checkout**: Full cart functionality with Malaysian payment integration
- **Order Management**: Complete order tracking system for consumers and vendors
- **Admin Dashboard**: Administrative panel for platform management
- **Responsive Design**: Mobile-first design using Tailwind CSS and shadcn/ui components
- **Malaysian Localization**: Support for Malaysian states, postcodes, and currency
- **Multi-language Support**: Built-in language toggle (English/Malay)

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type-safe JavaScript
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **TanStack Query** - Data fetching and caching
- **React Hook Form** - Form management
- **Tailwind CSS** - Styling framework
- **shadcn/ui** - Component library
- **Radix UI** - Primitive UI components

### Backend & Database
- **Supabase** - Backend-as-a-Service
  - PostgreSQL database
  - Authentication service
  - Real-time subscriptions
  - File storage
- **Node.js** - Runtime for admin scripts

### Development Tools
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixes

## 📦 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── ui/              # Base UI components (buttons, forms, etc.)
│   ├── Header.tsx       # Site header
│   ├── Footer.tsx       # Site footer
│   └── ...              # Other page components
├── pages/               # Page components
│   ├── Index.tsx        # Home page
│   ├── Products.tsx     # Product listing
│   ├── Auth.tsx         # Authentication pages
│   ├── Cart.tsx         # Shopping cart
│   └── ...              # Other pages
├── hooks/               # Custom React hooks
├── lib/                 # Utility functions
├── integrations/        # External service integrations
│   └── supabase/        # Supabase client and types
└── types/               # TypeScript type definitions
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/pharmanet-my-shop.git
   cd pharmanet-my-shop
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_key
   ```

4. **Set up Supabase database**
   - Create a new project at [supabase.com](https://supabase.com)
   - Run the SQL migrations provided in `/database/` folder
   - Set up authentication providers

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:5173`

## 🗄️ Database Schema

The application uses the following main tables:

- **users** - User profiles and authentication
- **products** - Product information
- **categories** - Product categories
- **cart_items** - Shopping cart data
- **orders** - Order information
- **order_items** - Individual order items
- **reviews** - Product reviews
- **vendor_applications** - Vendor registration requests

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:dev` - Build for development mode
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run create-admin` - Create an admin user

## 🔐 Authentication & Authorization

The platform uses Supabase Auth for user authentication with three roles:

1. **Consumers** - Can browse products, add to cart, and place orders
2. **Vendors** - Can manage products and view sales analytics
3. **Admins** - Full access to platform management

## 🌐 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms

The application can be deployed to any platform supporting static sites:
- Netlify
- AWS S3 + CloudFront
- Firebase Hosting

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Guidelines

1. Follow the existing code style and patterns
2. Use TypeScript for all new code
3. Write meaningful commit messages
4. Test your changes before submitting PRs

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Supabase](https://supabase.com) for the backend services
- [shadcn/ui](https://ui.shadcn.com) for the beautiful components
- [Tailwind CSS](https://tailwindcss.com) for the utility-first CSS framework
- [Radix UI](https://radix-ui.com) for the primitive components

## 📞 Support

For support, please open an issue in the GitHub repository or contact the maintainers.

---

## 🇲🇾 Malaysian Features

This e-commerce platform includes specific features for the Malaysian market:

- **Malaysian Address System**: Complete state, city, and postcode support
- **Malaysian Currency**: Ringgit Malaysia (MYR) formatting and display
- **Local Payment Methods**: Support for Malaysian payment gateways (FPX, online banking)
- **Delivery Coverage**: Nationwide delivery tracking with Malaysian states
- **Language Support**: English and Bahasa Malaysia language toggle

## 📊 Analytics & Reporting

- **Sales Dashboard**: Real-time sales data and analytics
- **Product Performance**: Track views, ratings, and sales
- **User Management**: Monitor user activity and engagement
- **Inventory Tracking**: Stock level alerts and management

## 🔒 Security Features

- **Secure Authentication**: JWT-based auth with Supabase
- **Role-Based Access**: Granular permissions for different user types
- **Data Validation**: Input validation and sanitization
- **Secure File Upload**: Image upload with size and type restrictions
- **HTTPS Only**: Enforce secure connections in production