# GRABBI - Quick Commerce Store Platform (Web)

A modern React.js single-page application for GRABBI, a quick commerce store platform. This is a static UI demo built to showcase the complete user experience.

## 🚀 Features

### Core Functionality
- **Responsive Design**: Mobile-first approach with desktop sticky header and mobile bottom navigation
- **Product Catalog**: Browse products by category with filtering and search
- **Shopping Cart**: Slide-over cart drawer with real-time updates and free delivery progress
- **Checkout Flow**: 3-step checkout with address validation (5-mile radius) and payment processing
- **Order Tracking**: Live order status updates with visual stepper
- **User Dashboard**: Account management with Club Card QR code and loyalty points
- **Authentication**: Multiple login methods (Email/Password, Phone/OTP, Social Login)

### Design System
- **Brand Colors**:
  - Primary: Forest Green (#2d5016)
  - Background: Ivory/Cream (#fffff0)
  - Accent: Gold (#d4af37)
  - Text: Dark Charcoal (#1a1a1a)
- **Typography**: Montserrat & Poppins fonts
- **Icons**: Heroicons

## 🛠️ Tech Stack

- **Framework**: React.js 19 with Vite
- **Routing**: React Router v6
- **State Management**: Redux Toolkit
- **Styling**: Tailwind CSS
- **Icons**: Heroicons
- **QR Code**: react-qr-code

## 📦 Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🏗️ Project Structure

```
src/
├── components/          # Reusable components
│   ├── Auth/          # Authentication modal
│   ├── Cart/          # Cart drawer component
│   ├── Layout/        # Navigation and layout components
│   └── Product/       # Product card component
├── pages/             # Page components
│   ├── Home.jsx       # Landing page
│   ├── CategoryPage.jsx
│   ├── ProductDetails.jsx
│   ├── Checkout.jsx
│   ├── OrderTracking.jsx
│   ├── Dashboard.jsx
│   └── NotFound.jsx
├── store/             # Redux store and slices
│   ├── store.js
│   └── slices/
│       ├── authSlice.js
│       ├── cartSlice.js
│       └── loyaltySlice.js
├── data/             # Mock data
│   └── mockData.js
└── App.jsx           # Main app component with routing
```

## 🎯 Key Features Implementation

### 1. Cart Drawer
- Slide-over animation from right
- Real-time item count badge
- Free delivery progress bar (threshold: £20)
- Quantity controls and item removal

### 2. Checkout Flow
- **Step 1**: Address validation with 5-mile delivery radius check
- **Step 2**: Payment form with Stripe Elements (mock)
- **Step 3**: Post-purchase loyalty points for guest users

### 3. Order Tracking
- Visual status stepper (Order Placed → Preparing → Dispatched → Delivered)
- Auto-updates every 10 seconds (demo)
- Order details and delivery address display

### 4. User Dashboard
- **Club Card Tab**: QR code generator for in-store purchases
- **Orders Tab**: Order history with status
- **Settings Tab**: Saved addresses and notification preferences

### 5. Authentication
- Email/Password login and signup
- Phone/OTP authentication
- Social login (Google/Apple) - mock implementation
- New user onboarding with required fields

## 🎨 Design Highlights

- **Mobile-First**: Responsive design that works seamlessly on all devices
- **Micro-interactions**: Smooth transitions and hover effects
- **Accessibility**: Semantic HTML and keyboard navigation support
- **Performance**: Optimized for fast loading and smooth scrolling

## 📱 Pages

1. **Home**: Hero carousel, categories, product rails (Best Sellers, New Arrivals)
2. **Category/Listing**: Filterable product grid with search
3. **Product Details**: Image gallery, product info, loyalty points display
4. **Checkout**: 3-step checkout process
5. **Order Tracking**: Live order status with stepper
6. **Dashboard**: User account, Club Card, orders, and settings

## 🔧 Configuration

### Environment Variables
Currently using mock data. For production, configure:
- Google Maps API key for address autocomplete
- Stripe publishable key for payments
- Backend API endpoints

### Customization
- Brand colors in `tailwind.config.js`
- Mock data in `src/data/mockData.js`
- Store coordinates in `src/data/mockData.js`

## 📝 Notes

- This is a **static demo** with mock data
- All API calls are simulated
- Authentication is client-side only (demo purposes)
- Payment processing is mocked
- Google Maps integration is placeholder (ready for API key)

## 🚀 Deployment

```bash
# Build for production
npm run build

# The dist/ folder contains the production build
# Deploy to your preferred hosting service (Vercel, Netlify, etc.)
```

## 📄 License

This project is a demo application for GRABBI.

---

Built with ❤️ for GRABBI
