# Deploying Meridian 3PL to cPanel (shared hosting + Node.js App)

This app is a **SvelteKit full-stack** site (marketing pages are prerendered/static; `/admin` and `/api` run on Node). It deploys to **shared cPanel** using **"Setup Node.js App"** (Phusion Passenger), with **MySQL/MariaDB** and the domain's own **SMTP** mailbox.

> Golden rule: **build on your machine, upload the artifacts.** Never run `npm run build` on shared hosting.

---

## 0. One-time cPanel setup

1. **MySQL® Databases** → create:
   - a database, e.g. `meriXXXX_meridian`
   - a user with a strong password
   - **Add user to database → ALL PRIVILEGES**
2. **Email Accounts** → create a mailbox for sending, e.g. `no-reply@yourdomain.com` (note the password + SMTP host, usually `mail.yourdomain.com`, port `465` SSL).
3. **Setup Node.js App** must be present (Software section). Note the available **Node version (use 20 if offered, 18 minimum)**.

---

## 1. Create the database tables

Use **phpMyAdmin** (cPanel → phpMyAdmin):

1. Select your new database.
2. **Import** tab → upload `drizzle/0000_loose_orphan.sql` from this project → **Go**.

That creates all 9 tables. (For future schema changes, generate a new migration locally with `npm run db:generate` and import the new file, or run `npm run db:migrate` against the DB.)

---

## 2. Build locally

```bash
npm install
npm run build
```

This produces a `build/` folder (the adapter-node output: `index.js`, `handler.js`, `client/`, `server/`, `prerendered/`).

---

## 3. Upload to the server

Upload these to your app folder (e.g. `~/meridian-app`, **not** inside `public_html`):

- `build/`
- `package.json`
- `package-lock.json`
- `drizzle/` (optional, for future migrations)

Zip → upload via File Manager → Extract is easiest.

---

## 4. Create the Node.js App

cPanel → **Setup Node.js App** → **Create Application**:

| Field | Value |
|---|---|
| Node.js version | 20 (or 18+) |
| Application mode | **Production** |
| Application root | `meridian-app` (where you uploaded) |
| Application URL | your domain (e.g. `yourdomain.com`) |
| Application startup file | `build/index.js` |

Then, in the app's panel:

1. **Environment variables** — add:

   | Name | Value |
   |---|---|
   | `DATABASE_URL` | `mysql://DBUSER:DBPASS@127.0.0.1:3306/DBNAME` |
   | `BETTER_AUTH_SECRET` | a fresh 32-byte hex (`openssl rand -hex 32`) |
   | `BETTER_AUTH_URL` | `https://yourdomain.com` |
   | `ORIGIN` | `https://yourdomain.com` |
   | `SMTP_HOST` | `mail.yourdomain.com` |
   | `SMTP_PORT` | `465` |
   | `SMTP_USER` | `no-reply@yourdomain.com` |
   | `SMTP_PASS` | the mailbox password |
   | `SMTP_FROM` | `Meridian 3PL <no-reply@yourdomain.com>` |
   | `NOTIFY_TO` | where new enquiries are emailed |

   > `ORIGIN` is required by adapter-node so form POSTs pass the CSRF origin check.

2. Click **Run NPM Install** (installs production dependencies from `package.json`).
3. Click **Restart**.

---

## 5. First-run admin + go-live

1. Visit `https://yourdomain.com/admin/setup` → create the owner account (this route closes itself once one account exists).
2. Sign in at `https://yourdomain.com/admin`.
3. Public marketing site is live at `https://yourdomain.com`.

---

## 6. Redeploying after changes

```bash
npm run build          # locally
```
Upload the new `build/` (overwrite) → cPanel Node App → **Restart** (or `touch tmp/restart.txt`).

---

## 7. Backups (recommended)

cPanel → **Cron Jobs**, nightly:

```bash
mysqldump -u DBUSER -pDBPASS DBNAME > ~/backups/meridian-$(date +\%F).sql
```

(Ensure `~/backups` exists; rotate old files as needed.)

---

## Notes & limits on shared hosting
- Memory/CPU are capped — fine for this traffic; upgrade the plan if it grows.
- Prerendered marketing pages are served as static files (fast); only `/admin` + `/api` hit Node.
- If "Setup Node.js App" is ever removed by the host, the fallback is to run this Node app on a small VPS and point `DATABASE_URL` at the cPanel DB via **Remote MySQL** (whitelist the VPS IP).
