# Expense Tracker – Code Guide

Use this file to **understand the code** and to see **which part of the code is responsible for each screen**. It maps every screen to its file and explains what each section of code does.

---

## How to use this guide

1. **“Which file draws this screen?”** → See the table below (**Which code = which screen**).
2. **“What does this screen do and where is it in the code?”** → Jump to the section for that screen (Dashboard, Logs, Add, Settings) and use the tables to match UI to code.
3. **“Where is [feature]?”** → Use **Section 12 – Quick “where is…” lookup** at the end.

---

## Which code = which screen

| What you see in the app | File that draws it | Section in this guide |
|-------------------------|--------------------|------------------------|
| **Dashboard** (month, Total Balance, Accounts list, Income/Expense) | `app/(tabs)/index.tsx` | [§4 Dashboard](#4-dashboard-apptabsindextsx) |
| **Logs** (Records or History, list, Monthly Savings footer) | `app/(tabs)/logs.tsx` | [§5 Logs](#5-logs-apptabslogstsx) |
| **Add** (Expense/Income form, account, category, Save) | `app/(tabs)/add.tsx` | [§6 Add transaction](#6-add-transaction-apptabsaddtsx) |
| **Settings** (Export, links) | `app/(tabs)/settings.tsx` | [§7 Settings](#7-settings-apptabssettingstsx) |
| Tab bar at bottom (Dashboard, Logs, Add, Settings) | `app/(tabs)/_layout.tsx` | [§2 App entry and layout](#2-app-entry-and-layout) |
| App shell (fonts, DB, safe area) | `app/_layout.tsx` | [§2 App entry and layout](#2-app-entry-and-layout) |

So: **each screen you see = one main file** (the middle column). Open that file and the matching section here to follow the code.

---

## 1. Project structure

```
expense tracker/
├── app/                    # Screens (Expo Router)
│   ├── _layout.tsx         # Root: fonts, SafeArea, SQLite, theme
│   ├── (tabs)/             # Tab screens
│   │   ├── _layout.tsx     # Tab bar (Dashboard, Logs, Add, Settings)
│   │   ├── index.tsx       # Dashboard
│   │   ├── logs.tsx        # Logs (Records + History)
│   │   ├── add.tsx         # Add transaction
│   │   └── settings.tsx    # Settings (export, links)
│   ├── modal.tsx
│   └── +not-found.tsx
├── components/             # Reusable UI
│   ├── GlassCard.tsx       # Card style (opaque on both platforms)
│   └── ui/
│       ├── AccountCard.tsx # One account in dashboard list
│       ├── BalanceCard.tsx # Total / Income / Expense amount
│       ├── MonthNavigator.tsx
│       └── SectionHeader.tsx
├── db/                     # Database
│   ├── index.ts            # Migrations, table creation
│   └── transactions.ts     # All DB reads/writes
├── types/
│   └── index.ts            # Transaction, AccountBalance, etc.
├── utils/
│   ├── format.ts           # Naira, dates, months
│   └── export.ts           # CSV export
└── global.css              # Tailwind / NativeWind
```

---

## 2. App entry and layout

| What you see | Where it’s defined |
|--------------|--------------------|
| App loads, then tabs | `app/_layout.tsx` → `RootLayout` loads fonts, then `RootLayoutNav` |
| Safe area (notch, nav bar) | `SafeAreaProvider` in `_layout.tsx`, `edges={['top','bottom']}` on each tab screen |
| Database ready | `SQLiteProvider` in `_layout.tsx`, `migrateDbIfNeeded` in `db/index.ts` |
| System font size | `Text.defaultProps.allowFontScaling = true` and `maxFontSizeMultiplier = 1.5` in `_layout.tsx` |
| Bottom tab bar | `app/(tabs)/_layout.tsx` – tab bar height + safe area inset |

---

## 3. Screens → files

| Screen | File | What it does |
|--------|------|----------------|
| **Dashboard** | `app/(tabs)/index.tsx` | Month picker, Total Balance, Accounts (horizontal list), Income vs Expense |
| **Logs** | `app/(tabs)/logs.tsx` | Records (list by month) or History (months list); footer with Monthly Savings |
| **Add** | `app/(tabs)/add.tsx` | Expense/Income toggle, form, account/category pickers, save to DB |
| **Settings** | `app/(tabs)/settings.tsx` | Export current month, export all, external links |

---

## 4. Dashboard (`app/(tabs)/index.tsx`)

**This file is responsible for the Dashboard screen.** Everything you see on the Dashboard tab is built here (plus the components it imports).

**Flow:** On focus → load summary + account balances for selected month → show three boxes.

| UI | Code / data |
|----|-------------|
| Month (e.g. “January 2026”) | `MonthNavigator`; `currentDate` state; `navigateMonth` |
| Total Balance | `BalanceCard`; amount = `totalGlobalBalance` (sum of all account balances) |
| Accounts (horizontal list) | `getAccountBalances(db, currentMonth)` → `AccountCard` per account |
| Dividers between accounts | Vertical `View` with `bg-slate-700` between cards in the list |
| Scroll arrows (← →) | Only when `accountBalances.length > 1`; `scrollAccounts(±1)` scrolls by ~one card width |
| Single account = full width | `fullWidth={true}` on `AccountCard`, content width = `scrollViewWidth` from `onLayout` |
| Income / Expense row | `BalanceCard` × 2; amounts from `getMonthlySummary(db, currentMonth)` |

**Data:**  
- `getMonthlySummary` → `db/transactions.ts` (income, expense, balance for month).  
- `getAccountBalances` → per-account balance + income/expense for that month.

---

## 5. Logs (`app/(tabs)/logs.tsx`)

**This file is responsible for the Logs screen.** The Records list, History list, and Monthly Savings footer are all built here.

**Modes:** Records (list for one month) or History (list of months).

| UI | Code / data |
|----|-------------|
| Records / History toggle | `viewMode` state; two `Pressable`s |
| Records list | `getTransactionsByMonth(db, selectedMonth)`; `FlatList` with date separators |
| Row: Date, Item/Cat, Source, Amount | `renderRecordItem`; long-press → delete |
| Monthly Savings (footer) | `totals.balance` (income − expense); fixed footer with `paddingBottom` above tab bar |
| History list | `getArchiveHistory(db)` → one row per month; tap → set month and switch to Records |

**Data:**  
- Records: `getTransactionsByMonth`, `deleteTransaction`.  
- History: `getArchiveHistory` (month, income, expense).  
- Totals: computed from `transactions` in state.

---

## 6. Add transaction (`app/(tabs)/add.tsx`)

**This file is responsible for the Add screen.** The Expense/Income toggle, form fields, account and category pickers, and Save logic are all here.

**Flow:** Choose Expense or Income → fill form → pick account (and category for expense) → Save.

| UI | Code / data |
|----|-------------|
| Expense / Income tabs | `type` state; `setType('expense' \| 'income')` |
| Description, amount, date | Local state (`expenseDesc`, `incomeAmount`, etc.); `date` for transaction date |
| Account picker | `getAccounts(db)` → `accounts`; optional “Add account” → `addAccount` |
| Category (expense only) | `getCategories(db)`; modal to add category → `addCategory` |
| Save | `handleSave` → validates → `addTransaction(db, { date, description, amount, type, account, category })` |
| Balance check (expense) | `getBalanceByAccount(db, account)`; alert if amount > balance |

**Data:**  
- `addTransaction` in `db/transactions.ts` inserts into `transactions`.  
- Accounts/categories: `getAccounts`, `getCategories`, `addAccount`, `addCategory`, `deleteCategory`.

---

## 7. Settings (`app/(tabs)/settings.tsx`)

**This file is responsible for the Settings screen.** Export actions and links are handled here.

| Action | Code |
|--------|------|
| Export Current Month | `getTransactionsByMonth(db, getCurrentMonth())` → `exportToCSV` in `utils/export.ts` |
| Export All Data | `getAllTransactions(db)` → `exportToCSV` |
| Other links | `Link` / `ExternalLink` to external URLs |

---

## 8. Database (`db/`)

**Tables (see `db/index.ts` migrations):**

- **transactions** – id, date, description, amount, type (`income`/`expense`), account, category  
- **accounts** – id, name (e.g. Cash, ALAT, OPAY)  
- **categories** – id, name (expense categories)

**Main functions in `db/transactions.ts`:**

| Function | Purpose |
|----------|---------|
| `addTransaction` | Insert one transaction |
| `getTransactionsByMonth` | All transactions for a month (YYYY-MM) |
| `getMonthlySummary` | Sum income, expense, balance for a month |
| `getAccountBalances` | Per-account balance + income/expense (optionally for a month) |
| `getBalanceByAccount` | Current balance for one account |
| `deleteTransaction` | Delete by id |
| `getArchiveHistory` | One row per month (month, income, expense) |
| `getAccounts` / `getCategories` | List accounts/categories |
| `addAccount` / `addCategory` | Insert; used from Add screen |

---

## 9. Types (`types/index.ts`)

- **Transaction** – id, date, description, amount, type, account?, category?  
- **AccountBalance** – account, balance, income, expense (used for dashboard cards)  
- **MonthlySummary** – income, expense, balance  
- **Category** / **Account** – id, name  

Used by dashboard, logs, add, and DB layer.

---

## 10. Shared components

| Component | File | Used in |
|-----------|------|--------|
| **GlassCard** | `components/GlassCard.tsx` | Wrapper for cards; opaque style on both platforms |
| **BalanceCard** | `components/ui/BalanceCard.tsx` | Total Balance, Income, Expense (label + amount in Naira) |
| **AccountCard** | `components/ui/AccountCard.tsx` | One account in dashboard list; supports `fullWidth` for single-item list |
| **MonthNavigator** | `components/ui/MonthNavigator.tsx` | Dashboard month with ← → |
| **SectionHeader** | `components/ui/SectionHeader.tsx` | “Overview” etc. |

---

## 11. Utils

- **`utils/format.ts`** – `formatNaira`, `getCurrentMonth`, `formatMonthDisplayName`, `addMonths`, `getTodayDate`, `formatFullDate`  
- **`utils/export.ts`** – `exportToCSV(transactions, filename)` for Settings export  

---

## 12. Quick “where is…” lookup

| You want to… | Open |
|--------------|------|
| Change dashboard layout or data | `app/(tabs)/index.tsx` |
| Change how accounts list scrolls or single-card width | `app/(tabs)/index.tsx` + `components/ui/AccountCard.tsx` |
| Change log list or Monthly Savings | `app/(tabs)/logs.tsx` |
| Change add-transaction form or validation | `app/(tabs)/add.tsx` |
| Change export or settings options | `app/(tabs)/settings.tsx` + `utils/export.ts` |
| Change any DB query or insert | `db/transactions.ts` |
| Change DB schema or defaults | `db/index.ts` |
| Change card look (opaque/glass) | `components/GlassCard.tsx` |
| Change Naira or date formatting | `utils/format.ts` |
| Add or change a type | `types/index.ts` |

---

**Summary:** Yes – this guide is meant to help you understand the code and see which part is responsible for each screen. Use the **“Which code = which screen”** table at the top, then open the file and the matching section for the screen you’re looking at.
