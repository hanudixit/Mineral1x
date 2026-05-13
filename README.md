# MineralX — Critical Minerals Marketplace

B2B marketplace connecting verified non-China mineral suppliers with importers across the US, EU, and allied nations.

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Database | PostgreSQL via Supabase |
| ORM | Prisma 5 |
| Auth | Clerk (magic link) |
| File storage | AWS S3 + presigned URLs |
| Payments | Stripe (subscriptions + invoices) |
| Email | Resend |
| Hosting | Vercel |

---

## Local setup (under 30 minutes)

### 1. Clone and install

```bash
git clone https://github.com/your-org/mineralx.git
cd mineralx
npm install
```

### 2. External services (create free accounts)

| Service | What you need | Where |
|---|---|---|
| Supabase | New project → get `DATABASE_URL` and `DIRECT_URL` | supabase.com |
| Clerk | New app → API keys + webhook secret | dashboard.clerk.com |
| AWS | S3 bucket + IAM user with limited permissions | aws.amazon.com |
| Resend | API key + verify your domain | resend.com |
| Stripe | API keys + create $500/mo product + webhook | dashboard.stripe.com |

### 3. Environment variables

```bash
cp .env.example .env.local
# Fill in all values in .env.local
```

### 4. Database

```bash
npm run db:generate   # generate Prisma client
npm run db:push       # push schema to Supabase (dev)
npm run db:studio     # optional: open Prisma Studio to inspect data
```

### 5. Run

```bash
npm run dev
# → http://localhost:3000
```

---

## Project structure

```
src/
├── app/
│   ├── api/
│   │   ├── suppliers/          GET list, POST create
│   │   ├── rfqs/               GET list, POST submit
│   │   ├── matches/            GET list, POST create (admin)
│   │   ├── deals/              GET, PATCH status
│   │   ├── upload-url/         POST get presigned S3 URL
│   │   ├── admin/
│   │   │   └── suppliers/[id]/verify/  POST approve/reject/request_docs
│   │   └── webhooks/
│   │       ├── clerk/          POST sync user on sign-up
│   │       └── stripe/         POST handle payment events
│   ├── supplier/
│   │   ├── onboarding/         Multi-step supplier application
│   │   ├── dashboard/          Supplier's listing and deal view
│   │   └── deals/[id]/         Deal workspace
│   ├── importer/
│   │   ├── onboarding/         Importer registration
│   │   ├── directory/          Search verified suppliers
│   │   ├── rfqs/               Submit and track RFQs
│   │   └── deals/[id]/         Deal workspace
│   └── admin/
│       ├── dashboard/          Main admin view (this file)
│       ├── suppliers/          Full supplier management
│       ├── rfqs/               All RFQs with match assignment
│       └── events/             Audit log
├── lib/
│   ├── db.ts                   Prisma client singleton
│   ├── auth.ts                 Clerk helpers + role guards
│   ├── s3.ts                   Presigned URL generation
│   ├── email.ts                Resend typed email functions
│   └── stripe.ts               Stripe customer + billing helpers
└── components/
    ├── ui/                     Shared primitives (Button, Badge, etc.)
    ├── forms/                  Form components
    └── dashboard/              Admin dashboard components
        ├── VerificationQueue.tsx
        ├── RFQQueue.tsx
        └── DealPipeline.tsx
prisma/
└── schema.prisma               Full data model
```

---

## Key business rules (enforced in code)

1. **Suppliers must be VERIFIED before they appear in directory** — `listingFeeActive: true` is also required (subscription must be active)
2. **Every RFQ requires an `endUseDeclaration`** — minimum 20 characters, stored immutably on the record
3. **Matches are unique per (rfq, supplier)** — prevented by `@@unique` constraint in schema
4. **Only ADMIN role can create matches** — enforced by `requireAdmin()` in the API route
5. **Documents never served directly** — all downloads go through 15-minute presigned URLs
6. **Platform fee is 1.5% of agreed deal value** — collected via Stripe invoice, confirmed by webhook before deal is marked CLOSED

---

## Week-by-week build order

| Week | What to build |
|---|---|
| 1–2 | Project setup, DB schema, Clerk auth, supplier onboarding form |
| 3 | Admin verification queue + approve/reject/request_docs flow |
| 4 | Importer signup + RFQ submission form |
| 5 | Admin match dashboard + intro email flow |
| 6 | Deal workspace + S3 document vault |
| 7 | Stripe listing subscription + success fee invoicing |
| 8 | End-to-end test with real users, security review, launch |

---

## Adding your first test supplier (dev)

```bash
npm run db:studio
# → Navigate to Supplier table → Create record with status: VERIFIED
# Or run: npx prisma db seed (after writing prisma/seed.ts)
```
