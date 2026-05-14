# Usha Electricals — E-commerce Website

Production-ready e-commerce site for **Usha Electricals Engineering Works**, Khaparkheda-Nagpur. Built with Next.js 14 + Tailwind, backed by Appwrite, deployed on Vercel.

---

## Stack

| Layer       | Choice                                |
|-------------|---------------------------------------|
| Framework   | Next.js 14 (App Router) + TypeScript  |
| Styling     | Tailwind CSS + custom navy/orange brand |
| State       | Zustand (cart, with localStorage)     |
| Backend     | Appwrite Cloud (auth, DB, storage)    |
| Hosting     | Vercel                                |
| Payments    | TBD (Cash / Bank-transfer placeholders for now) |

---

## v1 Scope (✅ all included)

- ✅ Product catalog with categories and search
- ✅ Shopping cart (persisted client-side)
- ✅ Checkout flow + order placement
- ✅ Admin panel — full CRUD for products, categories + order management
- ✅ **Editor role** — restricted catalog access for content team
- ✅ Product publish/unpublish toggle (list/unlist from website)
- ✅ User accounts + order history
- ✅ About page (with selected govt. work orders), Contact page

## Roles

| Capability                                  | Admin | Editor |
|---------------------------------------------|:-----:|:------:|
| View dashboard (revenue, stats)             |  ✅   |   ❌   |
| Orders: view, change status                 |  ✅   |   ❌   |
| Products: **create new listings**           |  ✅   |   ✅   |
| Products: edit name, slug, brand, stock     |  ✅   |   ✅   |
| Products: edit price & MRP                  |  ✅   |   ✅   |
| Products: edit description, images, category|  ✅   |   ✅   |
| Products: add SEO keyword tags              |  ✅   |   ✅   |
| Products: list / unlist from site           |  ✅   |   ✅   |
| Products: delete                            |  ✅   |   ✅   |
| Products: feature on homepage               |  ✅   |   ❌   |
| Products: edit technical specs JSON         |  ✅   |   ❌   |
| Categories: create, edit, delete            |  ✅   |   ✅   |

Set roles in `.env.local`:
```
NEXT_PUBLIC_ADMIN_EMAILS=padmapani@minimumcodeculture.com
NEXT_PUBLIC_EDITOR_EMAILS=content@ushaelectricals.com,editor2@example.com
```

The site **works without Appwrite credentials** — it falls back to seed data so you can preview locally before configuring Appwrite. Auth, orders and admin CRUD obviously need Appwrite to be live.

---

## 1. Local Setup

```bash
cd usha-electricals
npm install
cp .env.example .env.local   # then fill in values
npm run dev
```

Open <http://localhost:3000>.

---

## 2. Appwrite Setup

You can re-use the same Appwrite Cloud project pattern from BoldAgent. Create a new project for Usha and configure:

### a. Database

Create a database (e.g. `usha_db`) and these **three collections**:

#### `products`
| Attribute     | Type     | Required | Notes                           |
|---------------|----------|----------|---------------------------------|
| name          | string   | yes      | size 256                        |
| slug          | string   | yes      | size 256, unique index          |
| description   | string   | yes      | size 5000                       |
| category      | string   | yes      | size 64                         |
| brand         | string   | no       | size 128                        |
| price         | integer  | yes      |                                 |
| mrp           | integer  | no       |                                 |
| stock         | integer  | yes      | default 0                       |
| images        | string[] | yes      | size 512 (URLs)                 |
| specs         | string   | no       | size 5000 (JSON-encoded object) |
| featured      | boolean  | no       | default false                   |
| published     | boolean  | no       | default true (visible on site)  |
| tags          | string[] | no       | size 64 each (SEO keywords)     |

#### `orders`
| Attribute        | Type    | Required | Notes                      |
|------------------|---------|----------|----------------------------|
| userId           | string  | yes      | size 64                    |
| items            | string  | yes      | size 10000 (JSON array)    |
| total            | integer | yes      |                            |
| status           | string  | yes      | size 32                    |
| shippingAddress  | string  | yes      | size 2000 (JSON object)    |
| paymentMethod    | string  | no       | size 32                    |

#### `categories`
| Attribute   | Type   | Required |
|-------------|--------|----------|
| name        | string | yes      |
| slug        | string | yes      |
| description | string | no       |
| image       | string | no       |

**Permissions** (per collection):
- `products`, `categories`: **Read** = `any`. **Create / Update / Delete** = `users` (we further restrict in app via `NEXT_PUBLIC_ADMIN_EMAILS`).
- `orders`: **Create** = `users`. **Read / Update** restricted to `users` (server) — admin reads via API key context.

### b. Storage

Create a bucket `product_images`. Set permissions: Read = `any`, Create = `users`. Use it for product imagery (paste the file's URL into the admin form).

### c. API Key (for the seed script)

Project Settings → API Keys → create one with `databases.read`, `databases.write`. Paste in `APPWRITE_API_KEY` of `.env.local`.

### d. Environment variables

Edit `.env.local`:

```
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=...
NEXT_PUBLIC_APPWRITE_DATABASE_ID=usha_db
NEXT_PUBLIC_APPWRITE_PRODUCTS_COLLECTION_ID=products
NEXT_PUBLIC_APPWRITE_ORDERS_COLLECTION_ID=orders
NEXT_PUBLIC_APPWRITE_CATEGORIES_COLLECTION_ID=categories
NEXT_PUBLIC_APPWRITE_BUCKET_ID=product_images
APPWRITE_API_KEY=...
NEXT_PUBLIC_ADMIN_EMAILS=padmapani@minimumcodeculture.com
```

> Add the Vercel deployment domain (and `localhost`) to your Appwrite project's **Platforms → Web**.

### e. Seed initial products

```bash
npm run seed
```

That pushes the 21 seed products and 8 categories into Appwrite.

---

## 3. Deploy to Vercel

1. Push this folder to a new GitHub repo (`usha-electricals`).
2. On Vercel → **Add new project** → import the repo.
3. Add the same env vars from `.env.local` to **Vercel → Project Settings → Environment Variables**.
4. Deploy. Add the Vercel URL to Appwrite **Platforms → Web** so client SDK calls succeed.
5. Register the admin user with the email in `NEXT_PUBLIC_ADMIN_EMAILS` to access `/admin`.

---

## 4. Project Structure

```
src/
├── app/                       # routes (App Router)
│   ├── page.tsx               # home
│   ├── products/              # listing + [slug] detail
│   ├── cart/, checkout/
│   ├── login/, register/, account/, account/orders/
│   ├── admin/, admin/products/, admin/orders/
│   └── about/, contact/
├── components/                # Header, Footer, ProductCard, ProductForm
├── lib/
│   ├── appwrite.ts            # browser SDK
│   ├── appwrite-server.ts     # server SDK (for scripts/server actions)
│   ├── auth.ts                # register/login/logout/getCurrentUser
│   ├── products.ts            # listProducts/getBySlug (Appwrite + seed fallback)
│   ├── admin-products.ts      # create/update/delete (admin)
│   ├── orders.ts              # createOrder, listMy/All, updateStatus
│   ├── seed-data.ts           # initial categories + products + brands + clients
│   └── types.ts
├── store/cart.ts              # Zustand cart
└── scripts/seed.ts
```

---

## 5. To-do (future)

- [ ] Real payment gateway (Razorpay recommended for INR + COD support)
- [ ] WhatsApp / SMS order confirmations (Appwrite Functions or Twilio)
- [ ] Image upload widget in admin (currently URLs only)
- [ ] Coupon codes
- [ ] Saved addresses on user profile
- [ ] PDF invoice generation
- [ ] Sitemap + structured data (Product / Organization JSON-LD)
- [ ] Hindi/Marathi locale toggle

---

## Company details (baked into the site)

- **Name**: Usha Electricals Engineering Works
- **Address**: Main Road Khaparkheda-Dahegaon, Jay Bhole Nagar, Khaparkheda, Nagpur
- **Phone**: 93569 13565
- **Email**: ushaelectrical99@gmail.com
- **GSTIN**: 27BRGPD5535F1ZY
- **M.L. No.**: 34090
