# BinaryTrade Pro - Professional Binary Options Trading Platform

A comprehensive binary options trading platform built with React, TypeScript, and Supabase.

## Features

### 🔐 Authentication & User Management
- Secure user registration with comprehensive form validation
- Email/password authentication via Supabase Auth
- User profiles with personal information (name, country, phone)
- Password requirements: uppercase, lowercase, numbers, special characters
- Demo and Live account types

### 📊 Trading Features
- **Multiple Markets**: 28+ instruments across Forex, Crypto, Stocks, and Commodities
- **Binary Options**: Call/Put options with expiry times from 1 minute to 24 hours
- **Real-time Charts**: Live price updates every 2 seconds
- **Technical Analysis**: Multiple chart types (Area, Candlestick, Line, Bar)
- **Trading Indicators**: RSI, MACD, Moving Averages, Bollinger Bands
- **Drawing Tools**: Trend lines, support/resistance levels
- **Auto Settlement**: Trades settle automatically with 85% payout rate

### 💰 Account Management
- **Demo Account**: $10,000 virtual funds for risk-free practice
- **Live Account**: Real money trading with $20 minimum deposit
- **Balance Management**: Separate demo and live balances
- **Account Switching**: Easy toggle between demo and live accounts

### 💳 Payment System (Ready for Integration)
- PayPal integration ready
- Payoneer integration ready
- Transaction history and status tracking
- Automatic transaction ID generation

### 📈 Analytics & Reporting
- Comprehensive dashboard with key metrics
- Trade history with detailed P&L tracking
- Win rate and performance statistics
- User activity logging (login/logout, trades, transactions)
- Real-time balance updates

### 🎨 User Interface
- Modern, responsive design with Tailwind CSS
- Professional gradient themes
- Intuitive navigation with collapsible sidebar
- Real-time notifications with react-hot-toast
- Loading states and error handling

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Charts**: Recharts for trading charts
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Date Handling**: date-fns

## Database Schema

### Tables
- `users` - User profiles and account information
- `trades` - Binary options trades and settlements
- `transactions` - Deposit/withdrawal records
- `user_activities` - Account activity logging

### Security
- Row Level Security (RLS) enabled on all tables
- Users can only access their own data
- Secure authentication via Supabase Auth

## Setup Instructions

### 1. Supabase Setup
1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Copy your project URL and anon key
3. Run the migration file in your Supabase SQL editor

### 2. Environment Variables
Create a `.env` file with your Supabase credentials:
```env
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Run Development Server
```bash
npm run dev
```

## Payment Integration

The platform is ready for payment integration with:

### PayPal
- Complete integration structure in place
- Requires PayPal Client ID and Secret
- Supports deposits and withdrawals

### Payoneer
- Integration framework ready
- Requires Payoneer API credentials
- Supports international transactions

## Market Data

Currently uses simulated real-time data. Ready for integration with:
- TradingView Advanced Charts
- Alpha Vantage API
- Twelve Data API

## Deployment

The application is optimized for deployment on:
- Netlify (recommended)
- Vercel
- Any static hosting service

## Security Features

- Secure authentication with Supabase Auth
- Row Level Security on all database operations
- Input validation and sanitization
- HTTPS enforcement
- Secure password requirements

## Performance

- Optimized bundle size with code splitting
- Efficient re-renders with React hooks
- Real-time updates without polling
- Responsive design for all devices

## Support

For technical support or feature requests, please contact the development team.

---

**Disclaimer**: This is a demo trading platform. Please ensure compliance with local financial regulations before deploying for real money trading.