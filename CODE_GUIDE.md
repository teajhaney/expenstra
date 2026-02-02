# Expense Tracker – Code Guide

Use this file to **understand the code** and to see **which part of the code is responsible for each screen**. It maps every screen to its file and explains what each section of code does.

---

## How to use this guide

1. **“Which file draws this screen?”** → See the table below (**Which code = which screen**).
2. **“What does this screen do and where is it in the code?”** → Jump to the section for that screen (Dashboard, Logs, Add, Settings) and use the tables to match UI to code.
3. **“Where is [feature]?”** → Use **Section 14 – Quick “where is…” lookup** at the end.

---

## Which code = which screen

| What you see in the app                                             | File that draws it        | Section in this guide                                  |
| ------------------------------------------------------------------- | ------------------------- | ------------------------------------------------------ |
| **Dashboard** (month, Total Balance, Accounts list, Income/Expense) | `app/(tabs)/index.tsx`    | [§4 Dashboard](#4-dashboard-apptabsindextsx)           |
| **Logs** (Records or History, list, Monthly Savings footer)         | `app/(tabs)/logs.tsx`     | [§5 Logs](#5-logs-apptabslogstsx)                      |
| **Add** (Unified Add screen with Income/Expense toggle)             | `app/(tabs)/add.tsx`      | [§6 Add transaction](#6-add-transaction-apptabsaddtsx) |
| **Settings** (Export, database reset, links)                        | `app/(tabs)/settings.tsx` | [§7 Settings](#7-settings-apptabssettingstsx)          |
| Tab bar at bottom (Dashboard, Logs, Add, Settings)                  | `app/(tabs)/_layout.tsx`  | [§2 App entry and layout](#2-app-entry-and-layout)     |
| App shell (fonts, DB, safe area)                                    | `app/_layout.tsx`         | [§2 App entry and layout](#2-app-entry-and-layout)     |

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
│   │   ├── add.tsx         # Unified Add transaction screen
│   │   └── settings.tsx    # Settings (export, database reset, links)
│   ├── modal.tsx
│   └── +not-found.tsx
├── components/             # Reusable UI
│   ├── GlassCard.tsx       # Card style (opaque on both platforms)
│   └── ui/
│       ├── AccountCard.tsx # One account in dashboard list
│       ├── BalanceCard.tsx # Total / Income / Expense amount
│       ├── MonthNavigator.tsx
│       └── SectionHeader.tsx
├── components/forms/       # Form components
│   ├── TransactionForm.tsx # Original transaction form (reference)
│   ├── IncomeForm.tsx      # Income-specific form
│   └── ExpenseForm.tsx     # Expense-specific form
├── db/                     # Database
│   ├── index.ts            # Migrations, table creation
│   └── transactions.ts     # All DB reads/writes, delete functions
├── data/                   # Data layer
│   └── transactionsRepo.ts # Repository pattern for transactions
├── stores/                 # State management
│   ├── dashboardStore.ts   # Dashboard state with Zustand
│   └── referenceStore.ts   # Accounts and categories state
├── schemas/                # Form validation
│   └── transactionSchema.ts # Zod schemas for forms
├── types/
│   └── index.ts            # Transaction, AccountBalance, etc.
├── utils/
│   ├── format.ts           # Naira, dates, months
│   └── export.ts           # CSV export
└── global.css              # Tailwind / NativeWind
```

---

## 2. App entry and layout

| What you see               | Where it's defined                                                                             |
| -------------------------- | ---------------------------------------------------------------------------------------------- |
| App loads, then tabs       | `app/_layout.tsx` → `RootLayout` loads fonts, then `RootLayoutNav`                             |
| Safe area (notch, nav bar) | `SafeAreaProvider` in `_layout.tsx`, `edges={['top','bottom']}` on each tab screen             |
| Database ready             | `SQLiteProvider` in `_layout.tsx`, `migrateDbIfNeeded` in `db/index.ts`                        |
| System font size           | `Text.defaultProps.allowFontScaling = true` and `maxFontSizeMultiplier = 1.5` in `_layout.tsx` |
| Bottom tab bar             | `app/(tabs)/_layout.tsx` – tab bar height + safe area inset                                    |
| Global state management    | Zustand stores in `stores/` directory                                                          |

---

## 3. Screens → files

| Screen        | File                      | What it does                                                                                   |
| ------------- | ------------------------- | ---------------------------------------------------------------------------------------------- |
| **Dashboard** | `app/(tabs)/index.tsx`    | Month picker, Total Balance, Accounts (horizontal list), conditional Income vs Expense summary |
| **Logs**      | `app/(tabs)/logs.tsx`     | Records (list by month) or History (months list); footer with Monthly Savings                  |
| **Add**       | `app/(tabs)/add.tsx`      | Unified screen with Income/Expense toggle, separate forms, state preservation                  |
| **Settings**  | `app/(tabs)/settings.tsx` | Export current month, export all, database reset (by month/all), external links                |

---

## 4. Dashboard (`app/(tabs)/index.tsx`)

**This file is responsible for the Dashboard screen.** Everything you see on the Dashboard tab is built here (plus the components it imports).

**Flow:** On focus → load summary + account balances for selected month → show three boxes.

| UI                          | Code / data                                                                             |
| --------------------------- | --------------------------------------------------------------------------------------- | --- | -------------------- |
| Month (e.g. "January 2026") | `MonthNavigator`; `currentDate` state; `navigateMonth`                                  |
| Total Balance               | `BalanceCard`; amount = `totalGlobalBalance` (sum of all account balances)              |
| Accounts (horizontal list)  | `useDashboardStore().accountBalances` → `AccountCard` per account                       |
| Dividers between accounts   | Vertical `View` with `bg-slate-700` between cards in the list                           |
| Scroll arrows (← →)         | Only when `accountBalances.length > 1`; `scrollAccounts(±1)` scrolls by ~one card width |
| Single account = full width | `fullWidth={true}` on `AccountCard`, content width = `scrollViewWidth` from `onLayout`  |
| Income / Expense summary    | Conditional rendering: only shows when `summary.income > 0                              |     | summary.expense > 0` |
| Summary header              | "Summary" text label above Income/Expense cards                                         |

**Data:**

- Uses `useDashboardStore()` for state management
- `getMonthlySummary` → `db/transactions.ts` (income, expense, balance for month).
- `getAccountBalances` → per-account balance + income/expense for that month.

---

## 5. Logs (`app/(tabs)/logs.tsx`)

**This file is responsible for the Logs screen.** The Records list, History list, and Monthly Savings footer are all built here.

**Modes:** Records (list for one month) or History (list of months).

| UI                                  | Code / data                                                                          |
| ----------------------------------- | ------------------------------------------------------------------------------------ |
| Records / History toggle            | `viewMode` state; two `Pressable`s                                                   |
| Records list                        | `getTransactionsByMonth(db, selectedMonth)`; `FlatList` with date separators         |
| Row: Date, Item/Cat, Source, Amount | `renderRecordItem`; long-press → delete                                              |
| Monthly Savings (footer)            | `totals.balance` (income − expense); fixed footer with `paddingBottom` above tab bar |
| History list                        | `getArchiveHistory(db)` → one row per month; tap → set month and switch to Records   |

**Data:**

- Records: `getTransactionsByMonth`, `deleteTransaction`.
- History: `getArchiveHistory` (month, income, expense).
- Totals: computed from `transactions` in state.

---

## 6. Add transaction (`app/(tabs)/add.tsx`)

**This file is responsible for the unified Add screen.** Features Income/Expense toggle, separate form components, and state preservation.

**Flow:** Choose Expense or Income via toggle → fill form → pick account (and category for expense) → Save.

| UI                      | Code / data                                                                   |
| ----------------------- | ----------------------------------------------------------------------------- |
| Income / Expense toggle | `transactionType` state; toggle buttons with dynamic styling                  |
| Form content            | Both `IncomeForm` and `ExpenseForm` always mounted, shown/hidden with opacity |
| State preservation      | Forms stay mounted when switching tabs, preserving typed data                 |
| Header text             | Dynamic: "New Income" or "New Expense" based on toggle                        |
| Save behavior           | Forms handle save internally, reset after successful submission               |

**Form Components:**

| Component           | File                                   | Features                                              |
| ------------------- | -------------------------------------- | ----------------------------------------------------- |
| **IncomeForm**      | `components/forms/IncomeForm.tsx`      | Income-specific form, account modal, no categories    |
| **ExpenseForm**     | `components/forms/ExpenseForm.tsx`     | Expense-specific form, category picker, account modal |
| **TransactionForm** | `components/forms/TransactionForm.tsx` | Original unified form (reference)                     |

**Data:**

- Uses React Hook Form with Zod validation (`schemas/transactionSchema.ts`)
- `addTransaction` in `db/transactions.ts` inserts into `transactions`.
- Accounts/categories managed via `useReferenceStore()`.

---

## 7. Settings (`app/(tabs)/settings.tsx`)

**This file is responsible for the Settings screen.** Export actions, database reset, and links are handled here.

| Action                         | Code                                                                                 |
| ------------------------------ | ------------------------------------------------------------------------------------ |
| Export Current Month           | `getTransactionsByMonth(db, getCurrentMonth())` → `exportToCSV` in `utils/export.ts` |
| Export All Data                | `getAllTransactions(db)` → `exportToCSV`                                             |
| Database Reset - Current Month | `deleteTransactionsByMonth(db, getCurrentMonth())`                                   |
| Database Reset - All Data      | `deleteAllTransactions(db)`                                                          |
| Other links                    | `Link` / `ExternalLink` to external URLs                                             |

**Reset Functions:**

- `deleteTransactionsByMonth` in `db/transactions.ts`
- `deleteAllTransactions` in `db/transactions.ts`

---

## 8. Database (`db/`)

**Tables (see `db/index.ts` migrations):**

- **transactions** – id, date, description, amount, type (`income`/`expense`), account, category
- **accounts** – id, name (e.g. Cash, ALAT, OPAY)
- **categories** – id, name (expense categories)

**Main functions in `db/transactions.ts`:**

| Function                        | Purpose                                                       |
| ------------------------------- | ------------------------------------------------------------- |
| `addTransaction`                | Insert one transaction                                        |
| `getTransactionsByMonth`        | All transactions for a month (YYYY-MM)                        |
| `getMonthlySummary`             | Sum income, expense, balance for a month                      |
| `getAccountBalances`            | Per-account balance + income/expense (optionally for a month) |
| `getBalanceByAccount`           | Current balance for one account                               |
| `deleteTransaction`             | Delete by id                                                  |
| `deleteTransactionsByMonth`     | Delete all transactions for a specific month                  |
| `deleteAllTransactions`         | Delete all transactions in database                           |
| `getArchiveHistory`             | One row per month (month, income, expense)                    |
| `getAccounts` / `getCategories` | List accounts/categories                                      |
| `addAccount` / `addCategory`    | Insert; used from Add screen                                  |

---

## 9. State Management (`stores/`)

**Zustand stores for global state:**

| Store              | File                       | Purpose                                       |
| ------------------ | -------------------------- | --------------------------------------------- |
| **DashboardStore** | `stores/dashboardStore.ts` | Dashboard data, current month, loading states |
| **ReferenceStore** | `stores/referenceStore.ts` | Accounts and categories management            |

---

## 10. Forms (`components/forms/`)

**Form components with validation:**

| Component           | File                                   | Features                                              |
| ------------------- | -------------------------------------- | ----------------------------------------------------- |
| **IncomeForm**      | `components/forms/IncomeForm.tsx`      | Income-specific form, account modal, no categories    |
| **ExpenseForm**     | `components/forms/ExpenseForm.tsx`     | Expense-specific form, category picker, account modal |
| **TransactionForm** | `components/forms/TransactionForm.tsx` | Original unified form (reference)                     |

**Validation:** Uses `schemas/transactionSchema.ts` with Zod and React Hook Form.

---

## 11. Types (`types/index.ts`)

- **Transaction** – id, date, description, amount, type, account?, category?
- **AccountBalance** – account, balance, income, expense (used for dashboard cards)
- **MonthlySummary** – income, expense, balance
- **Category** / **Account** – id, name
- **TransactionFormData** – Form validation types

Used by dashboard, logs, add, and DB layer.

---

## 12. Shared components

| Component          | File                               | Used in                                                                  |
| ------------------ | ---------------------------------- | ------------------------------------------------------------------------ |
| **GlassCard**      | `components/GlassCard.tsx`         | Wrapper for cards; opaque style on both platforms                        |
| **BalanceCard**    | `components/ui/BalanceCard.tsx`    | Total Balance, Income, Expense (label + amount in Naira)                 |
| **AccountCard**    | `components/ui/AccountCard.tsx`    | One account in dashboard list; supports `fullWidth` for single-item list |
| **MonthNavigator** | `components/ui/MonthNavigator.tsx` | Dashboard month with ← →                                                 |
| **SectionHeader**  | `components/ui/SectionHeader.tsx`  | "Overview" etc.                                                          |

---

## 13. Utils

- **`utils/format.ts`** – `formatNaira`, `getCurrentMonth`, `formatMonthDisplayName`, `addMonths`, `getTodayDate`, `formatFullDate`
- **`utils/export.ts`** – `exportToCSV(transactions, filename)` for Settings export

---

## 14. Quick "where is…" lookup

| You want to…                                          | Open                                                                    |
| ----------------------------------------------------- | ----------------------------------------------------------------------- |
| Change dashboard layout or data                       | `app/(tabs)/index.tsx`                                                  |
| Change how accounts list scrolls or single-card width | `app/(tabs)/index.tsx` + `components/ui/AccountCard.tsx`                |
| Change log list or Monthly Savings                    | `app/(tabs)/logs.tsx`                                                   |
| Change add-transaction form or validation             | `components/forms/IncomeForm.tsx` or `components/forms/ExpenseForm.tsx` |
| Change toggle behavior in Add screen                  | `app/(tabs)/add.tsx`                                                    |
| Change export or database reset options               | `app/(tabs)/settings.tsx`                                               |
| Change any DB query or insert                         | `db/transactions.ts`                                                    |
| Change DB schema or defaults                          | `db/index.ts`                                                           |
| Change card look (opaque/glass)                       | `components/GlassCard.tsx`                                              |
| Change Naira or date formatting                       | `utils/format.ts`                                                       |
| Add or change a type                                  | `types/index.ts`                                                        |
| Change form validation rules                          | `schemas/transactionSchema.ts`                                          |
| Change state management                               | `stores/dashboardStore.ts` or `stores/referenceStore.ts`                |

---

**Summary:** Yes – this guide is meant to help you understand the code and see which part is responsible for each screen. Use the **"Which code = which screen"** table at the top, then open the file and the matching section for the screen you're looking at.
