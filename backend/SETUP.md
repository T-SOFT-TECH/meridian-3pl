# PocketBase Backend

## 1. Download PocketBase

Go to https://github.com/pocketbase/pocketbase/releases/latest and download the appropriate binary:
- **Windows**: `pocketbase_X.Y.Z_windows_amd64.zip`
- **Linux (cPanel)**: `pocketbase_X.Y.Z_linux_amd64.zip`

Extract `pocketbase.exe` (Windows) or `pocketbase` (Linux) into this `backend/` folder.

## 2. Start PocketBase

**Windows (local dev):**
```
cd backend
pocketbase.exe serve
```

**Linux (cPanel / production):**
```
cd backend
./pocketbase serve --http="0.0.0.0:8090"
```

PocketBase admin UI will be at: http://127.0.0.1:8090/_/

On first launch, create a superadmin account — note the email and password, you'll need them for `.env`.

## 3. Configure `.env`

Add to the SvelteKit project `.env`:
```
PB_URL=http://127.0.0.1:8090
PB_ADMIN_EMAIL=your-superadmin@email.com
PB_ADMIN_PASSWORD=your-superadmin-password
```

## 4. Create Collections

**Automated (recommended).** With PocketBase running and `.env` filled in, run from the project root:

```
node backend/setup-collections.mjs
```

This is idempotent — it creates all six collections with the correct fields, indexes,
and API rules, and adds `name`/`role` to the built-in `users` collection. Safe to re-run;
existing collections are skipped. The reference below documents what it builds, in case you
ever need to create or inspect a collection manually in the admin UI (http://127.0.0.1:8090/_/).

---

### Collection: `users` (Auth type — already exists by default)

Add these extra fields:
| Field     | Type   | Required | Notes                          |
|-----------|--------|----------|--------------------------------|
| name      | Text   | Yes      |                                |
| role      | Select | No       | Values: `staff`, `admin`       |

API Rules:
- List/View: `@request.auth.id != ""`
- Create: *(leave empty — admin only via setup route)*
- Update: `@request.auth.id != ""`
- Delete: `@request.auth.role = "admin"`

---

### Collection: `quote_requests` (Base type)

| Field         | Type     | Required | Notes                                    |
|---------------|----------|----------|------------------------------------------|
| reference     | Text     | Yes      | Unique                                   |
| status        | Select   | Yes      | Values: `new,contacted,quoted,won,lost`; Default: `new` |
| company       | Text     | Yes      |                                          |
| contact_name  | Text     | Yes      |                                          |
| email         | Email    | Yes      |                                          |
| phone         | Text     | No       |                                          |
| website       | URL      | No       |                                          |
| industry      | Text     | No       |                                          |
| services      | JSON     | No       |                                          |
| order_volume  | Text     | No       |                                          |
| sku_count     | Text     | No       |                                          |
| storage       | Text     | No       |                                          |
| channels      | JSON     | No       |                                          |
| current_setup | Text     | No       |                                          |
| timeline      | Text     | No       |                                          |
| message       | Text     | No       |                                          |
| estimate      | JSON     | No       |                                          |
| source        | Text     | No       | Default: `quote_form`                    |
| assigned_to   | Relation | No       | → `users` collection                     |

API Rules (all): `@request.auth.id != ""`

---

### Collection: `quote_notes` (Base type)

| Field     | Type     | Required | Notes                          |
|-----------|----------|----------|--------------------------------|
| quote_id  | Relation | Yes      | → `quote_requests`, cascade delete |
| author_id | Relation | No       | → `users`                      |
| body      | Text     | Yes      |                                |

API Rules (all): `@request.auth.id != ""`

---

### Collection: `contact_messages` (Base type)

| Field   | Type   | Required | Notes                                              |
|---------|--------|----------|----------------------------------------------------|
| name    | Text   | Yes      |                                                    |
| email   | Email  | Yes      |                                                    |
| phone   | Text   | No       |                                                    |
| message | Text   | Yes      |                                                    |
| status  | Select | Yes      | Values: `unread,read,archived,spam`; Default: `unread` |
| source  | Text   | No       | Default: `contact_form`                            |

API Rules (all): `@request.auth.id != ""`

---

### Collection: `pricing_config` (Base type)

| Field          | Type     | Required | Notes              |
|----------------|----------|----------|--------------------|
| version        | Number   | Yes      |                    |
| data           | JSON     | Yes      |                    |
| is_published   | Bool     | Yes      | Default: false     |
| effective_from | Date     | No       |                    |
| note           | Text     | No       |                    |
| created_by     | Relation | No       | → `users`          |

API Rules (all): `@request.auth.id != ""`

---

### Collection: `settings` (Base type)

| Field | Type | Required | Notes  |
|-------|------|----------|--------|
| key   | Text | Yes      | Unique |
| value | JSON | No       |        |

API Rules (all): `@request.auth.id != ""`

---

## 5. First Staff Account

After collections are created, visit `/admin/setup` in the SvelteKit app to create the first staff account. This only works while the `users` collection is empty.

## 6. cPanel Production Deployment

On cPanel, run PocketBase as a background process. The simplest approach:
- Upload the Linux binary to `backend/`
- Create a cron job: `* * * * * /path/to/backend/pocketbase serve --http="127.0.0.1:8090" >> /path/to/backend/pb.log 2>&1 || true`
- The `|| true` prevents cron error emails; PocketBase exits cleanly if already running
