# PayGuard AI Frontend

A Next.js 16.4.5 application with Turbopack for the PayGuard AI fraud detection platform.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Backend server running on port 3001

### Installation

```bash
# Install dependencies
npm install

# Create environment file
cp .env.local.example .env.local

# Start development server
npm run dev
```

The frontend will be available at http://localhost:3000

## 📁 Project Structure

```
frontend/
├── src/
│   ├── app/              # Next.js App Router pages
│   │   ├── page.tsx      # Landing page
│   │   ├── layout.tsx    # Root layout
│   │   └── globals.css   # Global styles
│   ├── lib/              # Utility libraries
│   │   └── api.ts        # API client
│   └── services/         # Service layer
│       └── auth.service.ts
├── public/               # Static assets
├── .env.local           # Environment variables (create this)
└── package.json
```

## 🔧 Environment Variables

Create a `.env.local` file in the frontend directory:

```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1

# WebSocket URL
NEXT_PUBLIC_WS_URL=ws://localhost:3001/ws
```

## 🎨 Features

- **Landing Page**: Professional PayGuard AI branding with features showcase
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Dark Mode Support**: Automatic dark mode detection
- **API Integration**: Pre-configured API client for backend communication
- **Type Safety**: Full TypeScript support

## 🛠️ Tech Stack

- **Framework**: Next.js 16.4.5 with Turbopack
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: React Server Components
- **API Client**: Fetch API with Bearer token authentication

## 📝 Available Scripts

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Linting
npm run lint
```

## 🔗 API Integration

The frontend includes a pre-configured API client at `src/lib/api.ts`:

```typescript
import { apiClient } from '@/lib/api'

// Login
const { token, merchant } = await apiClient.login(email, password)

// Get transactions
const { transactions } = await apiClient.getTransactions({ limit: 10 })

// Perform risk check
const riskResult = await apiClient.performRiskCheck({ 
  buyerEmail, 
  amount, 
  currency 
})
```

## 🎯 Current Implementation

The landing page (`src/app/page.tsx`) features:
- ✅ PayGuard AI branding and navigation
- ✅ Hero section with value proposition
- ✅ Feature cards (Real-Time Protection, Smart Analytics, Secure Integration, Instant Alerts)
- ✅ Statistics showcase (99.7% fraud detection, $2M+ prevented, 500+ merchants)
- ✅ Links to login/register (ready for implementation)
- ✅ Backend API link

## 📚 Next Steps

To complete the frontend implementation:

1. **Authentication Pages**
   - Create `app/login/page.tsx`
   - Create `app/register/page.tsx`
   - Implement auth flow with backend

2. **Dashboard**
   - Create `app/dashboard/page.tsx`
   - Transaction list and filtering
   - Real-time risk monitoring
   - Analytics charts

3. **Components**
   - Reusable UI components
   - Form components
   - Data tables
   - Charts and visualizations

4. **WebSocket Integration**
   - Real-time transaction updates
   - Live notifications
   - Risk alerts

## 🐛 Troubleshooting

### Port 3000 already in use
```bash
# Windows
taskkill /F /IM node.exe

# Mac/Linux
killall node
```

### Build errors with Tailwind
- Ensure `globals.css` only uses standard Tailwind utilities
- Avoid custom utilities without proper configuration

### API connection issues
- Verify backend is running on port 3001
- Check `.env.local` has correct API URLs
- Open browser console (F12) to check network errors

## 📄 License

Part of the PayGuard AI project.
