# EnterpriseConnect 🚀
### The Enterprise Social & Workforce Management SaaS Platform

EnterpriseConnect is a unified enterprise platform bridging corporate networks, student workforce talent, HR professionals, and employee tools. It couples high-fidelity social feeds and business analytics with a **secure, auditable Escrow-Based Wallet System** that ensures transparent contract completion between corporate sponsors and student contractors.

---

## 🌟 Key Features & Modules

### 1. 💳 Secure Escrow-Based Wallet System
Ensures secure payments for project-based milestones between Companies and Student contractors:
- **Automatic Escrow Creation**: Triggered instantly when a Company accepts a Student’s job application.
- **Milestone Funding**: Companies deposit and lock payment in the job's Escrow contract, removing risk for the student.
- **Deliverable Submissions**: Students submit notes and files directly to the Escrow contract for review.
- **Instant Fund Release**: Verified releases move funds directly from Escrow to the student's withdrawable wallet balance.
- **Dispute & HR Arbitration**: If project goals aren't met, HR managers serve as impartial arbitrators to resolve disputes by releasing funds to the student or refunding the corporation.
- **Auditable Ledger**: A robust, double-entry transactional ledger recording all balances, locks, releases, and withdrawals.

### 2. 📊 Market Analytics
- **Dynamic Line Graphs**: Interactive company comparisons across key indices (Revenue Growth, Market Share, Customer Satisfaction, and Employee Index).
- **Time Range Selectors**: Inspect corporate performances over 1 Month, 3 Month, 6 Month, or 1 Year windows.

### 3. 💬 Public Social Feed & Top Performers
- **Corporate Microblogging**: Share industry posts, comment, like, and bookmark articles.
- **Rising Star Showcase**: Highlights top student ratings and employee performance rankings in dynamic carousels.

### 4. 🗄️ HR Dashboard & Document Vault
- **Employee Directories**: Monitor targets, achieve metrics, and department directories.
- **Document Management**: File storage vaults categorizing company assets (policies, contracts, vendor files).
- **Arbitration Center**: Resolve disputed student escrows with settlement notes.

---

## 💻 Tech Stack & Architecture

- **Frontend**: React 18, TypeScript, TailwindCSS, Lucide React (icons).
- **Vite**: Rapid hot module reloading (HMR) and optimized minified production bundling.
- **Supabase Backend**:
  - **Database**: PostgreSQL with Row-Level Security (RLS) policies.
  - **Auth**: Email/Password login.
  - **Text & Chat Storage**: Stored inside relational PostgreSQL tables.
  - **File Storage**: Supabase Storage buckets (for social media attachments, document vaults, and student submissions).
  - **Database Triggers**: Triggers automated escrow contract creation on application status change.
  - **RPC Transactions**: Atomic database-level operations (`fund_escrow_wallet`, `release_escrow_funds`, `arbitrate_escrow_dispute`) protecting data integrity.

---

## 📂 Codebase Layout

```
project/
├── supabase/
│   └── migrations/               # PostgreSQL schema & triggers
├── src/
│   ├── components/
│   │   ├── CompanyModule.tsx     # Corporate Dashboard, Ledger & Application Review
│   │   ├── StudentModule.tsx     # Work submission, Wallet balances, Withdrawals & Ledger
│   │   ├── HRDashboard.tsx       # Dispute panel & Vault storage
│   │   ├── Layout.tsx            # Navigation layout and routing configs
│   │   └── ...
│   ├── contexts/
│   │   └── AuthContext.tsx       # Authentication management wrapper
│   └── lib/
│       └── supabase.ts           # Supabase client & typings
```

---

## 🚀 Getting Started

### 1. Prerequisite
Ensure you have [Node.js](https://nodejs.org/) installed (v18+ recommended).

### 2. Installation
Navigate into the `project` subdirectory and install the required dependencies:
```bash
cd project
npm install
```

### 3. Environment Setup
Create a `.env` file inside the `project` directory containing your Supabase credentials:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Development & Running Local Server
Start the development hot-reloading server:
```bash
npm run dev
```

### 5. Type Checking & Verification
To verify code types before committing:
```bash
npm run typecheck
```

### 6. Production Build
Build and optimize the code for production deployment:
```bash
npm run build
```
