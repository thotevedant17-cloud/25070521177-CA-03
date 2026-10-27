# GlowCare

GlowCare is a React storefront backed by an Express API and MongoDB.

## Requirements

- Node.js 18 or newer
- MongoDB Community Server running locally, or a MongoDB connection URI

## Configure MongoDB and the API

In PowerShell, create the server environment file and set strong, unique JWT secrets and an admin password:

```powershell
Copy-Item server\.env.example server\.env
```

Edit `server\.env`:

- Set `MONGODB_URI` to your MongoDB URI. The default uses the local `glowcare` database.
- Replace `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` with separate random secrets.
- Set `ADMIN_PASSWORD` to a strong password before creating an admin account.
- Set `CLIENT_URL` to the URL where the Vite client runs if it is not `http://localhost:5173`.

Install dependencies and seed the catalog:

```powershell
Set-Location server
npm install
npm run seed
```

Seeding upserts GlowCare's sample categories, brands, products, and coupons. It does not clear unrelated database records. Re-running it is safe.

Create the admin account after setting `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `server\.env`:

```powershell
npm run create-admin
```

Start the API in one terminal:

```powershell
npm run dev
```

The API listens on `http://localhost:5000`; check `http://localhost:5000/api/v1/health`.

## Start the client

In another terminal:

```powershell
Set-Location client
npm install
npm run dev
```

The client uses `http://localhost:5000/api/v1` by default. To use another API URL, set `VITE_API_BASE_URL` in the client environment.
