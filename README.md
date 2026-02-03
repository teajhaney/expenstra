# Expenstra - Personal Expense Tracker

A beautiful, modern expense tracking app built with React Native and Expo. Track your income and expenses across multiple accounts with an intuitive interface.

## 📱 Features

### 📊 Dashboard
- **Monthly Overview** - See your total balance and account summaries
- **Account Management** - Track multiple accounts (Cash, Bank, Digital Wallets)
- **Income vs Expense Summary** - Clear breakdown of your monthly finances
- **Smooth Navigation** - Easy month-by-month browsing

### 📝 Transaction Management
- **Unified Add Screen** - Add both income and expenses from one place
- **Smart Forms** - Separate optimized forms for income and expense transactions
- **Account & Category Tracking** - Organize transactions by accounts and expense categories
- **Quick Entry** - Fast, intuitive transaction input

### 📋 Records & History
- **Detailed Records** - View all transactions for any month
- **Archive History** - Monthly summaries for quick overview
- **Monthly Savings** - Track your savings progress
- **Search & Filter** - Find specific transactions easily

### ⚙️ Settings & Export
- **Data Export** - Export your data as CSV files
- **Monthly Exports** - Export specific months or all-time data
- **Database Management** - Reset data by month or completely
- **Professional Formatting** - Clean, readable CSV exports

## 🎨 Design & UX

### Beautiful Interface
- **Modern Design** - Clean, minimalist interface with glass morphism effects
- **Dark Theme** - Easy on the eyes, professional appearance
- **Smooth Animations** - Fluid transitions and micro-interactions
- **Responsive Layout** - Works perfectly on all screen sizes

### Custom Splash Screen
- **Branded Experience** - Custom splash screen with Expenstra branding
- **Smooth Loading** - Professional app startup experience
- **No Expo Defaults** - Completely custom, no generic splash screens

## 🛠️ Technology Stack

### Frontend
- **React Native** - Cross-platform mobile development
- **Expo Router** - File-based routing system
- **TypeScript** - Type-safe development
- **Tailwind CSS (NativeWind)** - Utility-first styling

### State Management
- **Zustand** - Lightweight state management
- **React Hook Form** - Form state management
- **Zod** - Schema validation

### Data Storage
- **SQLite** - Local database storage
- **Expo SQLite** - React Native SQLite integration

### Development Tools
- **EAS Build** - Automated app building
- **Expo Go** - Quick development testing
- **Metro Bundler** - JavaScript bundling

## 📁 Project Structure

```
expense tracker/
├── app/                    # Screens (Expo Router)
│   ├── _layout.tsx         # Root: fonts, SafeArea, SQLite, theme
│   ├── (tabs)/             # Tab screens
│   │   ├── _layout.tsx     # Tab bar (Dashboard, Logs, Add, Settings)
│   │   ├── index.tsx       # Dashboard
│   │   ├── logs.tsx        # Logs (Records + History)
│   │   ├── add.tsx         # Unified Add transaction screen
│   │   └── settings.tsx    # Settings (export, database reset, links)
├── components/             # Reusable UI
│   ├── SplashScreen.tsx    # Custom splash screen
│   ├── GlassCard.tsx       # Card style component
│   └── ui/                 # UI components
│       ├── AccountCard.tsx # Account display card
│       ├── BalanceCard.tsx # Balance display card
│       ├── MonthNavigator.tsx # Month navigation
│       └── SectionHeader.tsx # Section headers
├── components/forms/       # Form components
│   ├── IncomeForm.tsx      # Income-specific form
│   └── ExpenseForm.tsx     # Expense-specific form
├── db/                     # Database
│   ├── index.ts            # Database migrations
│   └── transactions.ts     # Database operations
├── stores/                 # State management
│   ├── dashboardStore.ts   # Dashboard state
│   └── referenceStore.ts   # Reference data state
├── utils/                  # Utilities
│   ├── format.ts           # Formatting functions
│   └── export.ts           # CSV export utilities
└── assets/                 # App assets
    ├── images/             # Icons and images
    └── fonts/              # Custom fonts
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Expo CLI
- Physical device or emulator/simulator

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd expense-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start development server**
   ```bash
   npx expo start
   ```

4. **Run on device**
   - Scan QR code with Expo Go app
   - Or press `a` for Android emulator
   - Or press `i` for iOS simulator

## 📱 Building for Production

### Android APK
```bash
eas build -p android --profile preview
```

### iOS
```bash
eas build -p ios --profile preview
```

### Requirements
- **Android**: No special requirements
- **iOS**: Apple Developer account for device testing

## 🎯 Key Features Explained

### Dashboard
- **Total Balance**: Sum of all account balances
- **Account Cards**: Individual account breakdowns with income/expense
- **Monthly Summary**: Income vs expense for selected month
- **Month Navigation**: Easy browsing between months

### Transaction Management
- **Unified Add Screen**: Toggle between income/expense
- **Smart Forms**: Context-aware form fields
- **Account Selection**: Choose from managed accounts
- **Category Management**: Organize expenses by categories

### Data Export
- **Monthly Exports**: Export specific months
- **All-Time Exports**: Complete data export
- **Professional CSV**: Clean, readable format
- **Data Validation**: Ensures data integrity

## 🔧 Configuration

### App Configuration
- **App Name**: Expenstra
- **Bundle ID**: com.anonymous.expenstra
- **Version**: 1.0.0

### Splash Screen
- **Custom Implementation**: No Expo defaults
- **Branded Design**: Expenstra logo and colors
- **Smooth Loading**: Professional startup experience

## 📄 License

This project is proprietary software. All rights reserved.

## 🤝 Contributing

This is a personal project. For contributions or questions, please contact the developer.

---

**Built with ❤️ using React Native & Expo**
