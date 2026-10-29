# Project Documentation — Meu Doce Artisan Confectionery

🌐 Read in: [Português](README-PT.md) | [Main Overview](README.md)

An interactive, user-centered web platform (UCD) for **Meu Doce — Artisan Confectionery**. The project is built with **JavaScript, TypeScript, Angular (v19 LTS), and Bootstrap (v5.3.8)** on the frontend, powered by a **Node.js + Express** backend and a **PostgreSQL** database (`pg` / `PGlite`).

The platform preserves the antique-pink (`#C86D88`) and white (`#FFFFFF`) editorial visual identity while separating the institutional home page (`/`) from a dedicated interactive menu page (`/cardapio`), enforcing administrator authentication and authorization on all management operations, and displaying customer reviews inside a bounded scrollable container.

---

## 1. Tech Stack & Adopted Versions

* **Frontend:**
  * **Angular:** `19.2.25` (`@angular/core`, `@angular/common`, `@angular/router`, `@angular/forms`, `@angular/platform-browser`)
  * **Angular CLI & Build:** `19.2.27` (`@angular/cli`, `@angular/build`, `@angular/compiler-cli@19.2.25`)
  * **Styling:** **Bootstrap** `^5.3.8` + custom editorial theme variables (`src/index.css`)
  * **Languages:** TypeScript (`~5.8.2`) and JavaScript (`ES2022`)
* **Backend:**
  * **Runtime:** Node.js (`v24.19.0`) + `tsx` (`^4.21.0`)
  * **HTTP Server / REST API:** Express (`^4.21.2`)
  * **Security & Auth:** Native Node.js `crypto` (`scrypt` password hashing with random salt + `HMAC-SHA256` signed session tokens and `HttpOnly` cookies)
* **Database:**
  * **PostgreSQL:** `pg` (`^8.23.1`) for external/local PostgreSQL instances or `@electric-sql/pglite` (`^0.5.12`) for embedded PostgreSQL persisted in `./pgdata`.

---

## 2. Local Setup & Environment Variables

Create a `.env` file in the project root (see `.env.example`). **Never commit real passwords or secret values to version control.**

### Required Environment Variables

| Variable | Description |
| :--- | :--- |
| `PORT` | Express server port (default: `3000`) |
| `AUTH_SECRET` | Secret key for signing `HMAC-SHA256` session tokens |
| `ADMIN_USERNAME` | Unique username for the initial administrator |
| `ADMIN_PASSWORD` | Password for the initial administrator (hashed with `scrypt`) |
| `PGHOST` | External PostgreSQL host (if empty, uses embedded PGlite in `./pgdata`) |
| `PGPORT` | External PostgreSQL port (default: `5432`) |
| `PGUSER` | External PostgreSQL user |
| `PGPASSWORD` | External PostgreSQL password |
| `PGDATABASE` | External PostgreSQL database name |

### Administrator Initialization

When `ADMIN_USERNAME` and `ADMIN_PASSWORD` are set in `.env`, the backend startup routine (`bootstrapAdminFromEnv` in `src/db/postgres.ts`) securely hashes the password with `crypto.scryptSync` and creates or updates the administrator record in the `admins` table. Public visitor sign-up for administrator accounts is disabled.

---

## 3. Commands to Install, Configure, Run, and Test

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Build Angular and start the unified server (`http://localhost:3000`):**
   ```bash
   npm run dev
   ```

3. **Run in split development mode (Angular CLI Dev Server + Express API):**
   * Terminal 1 (Backend API on port `3000`):
     ```bash
     npm run server
     ```
   * Terminal 2 (Angular CLI on port `4200` with proxy to `/api`):
     ```bash
     npm start
     ```

4. **Build production Angular bundle (`dist/browser`):**
   ```bash
   npm run build
   ```

5. **Run TypeScript type checking (Lint):**
   ```bash
   npm run lint
   ```

6. **Run automated integration tests (Migrations, Data Preservation, Auth 401/200, and CRUD):**
   ```bash
   npm test
   ```

---

## 4. Database Schema & Versioned Migrations

Database schema updates are tracked non-destructively via `schema_migrations`, preserving all existing rows:

* **`schema_migrations` (`001_initial_schema`, `002_create_admins_table`):** `version`, `applied_at`
* **`products`:** `id`, `name`, `price`, `image_url`, `category`, `image_size`, `description`, `manufactured_date`, `redirect_url`, `created_at`
* **`feedbacks`:** `id`, `author_name`, `rating`, `comment`, `created_at`
* **`admins`:** `id`, `username` (`UNIQUE`), `password_hash` (`scrypt`), `created_at`
