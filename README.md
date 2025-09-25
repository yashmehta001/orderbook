# 📈 Orderbook

Orderbook is a stock trading application built using **NestJS**, **TypeScript**, **TypeORM**, and **PostgreSQL**.  
It provides APIs for creating users, managing funds, placing buy/sell orders, and recording transaction history.  

The project comes with full support for Docker, database migrations, Swagger API documentation, logging, and unit testing.

---

## 🚀 Features
- User management (create, login, profile, manage funds)
- Place **BUY** and **SELL** stock orders
- Transaction history tracking
- PostgreSQL database integration with **TypeORM**
- Centralized logging with **Winston**
- API documentation via **Swagger** (`/docs`)
- Unit tests with Jest (service & controller coverage)

---

## 🛠️ Tech Stack
- **Backend Framework**: [NestJS](https://nestjs.com/)
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: TypeORM
- **Logging**: Winston
- **API Docs**: Swagger (OpenAPI)
- **Testing**: Jest

---

## ⚙️ Setup & Installation

### 1. Clone the repository
```bash
git clone https://github.com/your-repo/orderbook.git
cd orderbook
````

### 2. Environment Variables

Create a copy of `.env.example` and rename it to `.env`.
This file will hold your local environment configuration.

---

## 🐳 Running with Docker (Recommended)

If you have **Docker Desktop** installed, you can run the entire app (database + API) with one command:

```bash
docker compose up -d
```

This will:

* Start **PostgreSQL** on port `5432`
* Run all **pending migrations** automatically
* Create necessary tables
* Start the **Orderbook app** on `http://localhost:3000`

---

## ▶️ Running without Docker

1. Install dependencies:

   ```bash
   npm install
   ```

2. Build the project:

   ```bash
   npm run build
   ```

3. Run migrations and start in production mode:

   ```bash
   ./start.sh
   ```

4. For development mode (with hot reload):

   ```bash
   npm run start:dev
   ```

---

## 📖 API Documentation

Once the app is running, Swagger documentation is available at:

👉 [http://localhost:3000/docs](http://localhost:3000/docs)

---

## 🧪 Running Tests

Run all unit tests:

```bash
npm run test
```

Generate coverage report:

```bash
npm run test:cov
```

The HTML coverage report is available at:

```
coverage/lcov-report/index.html
```

Currently, test coverage includes **controllers** and **services**.

---

## 📝 Logging

* Logging is handled using **Winston**.
* Logs are stored locally at:

  ```
  logs/combined.json
  ```
* The system can be extended to connect to third-party logging services.

---

## 🗄️ Database & Migrations

We use **TypeORM** to manage all database operations.

### Migration Commands

* Run pending migrations:

  ```bash
  npm run migrations
  ```

  > ⚠️ Note: Migrations are applied from the **build** folder.
  > After generating a new migration, run `npm run build` first.

* Create an empty migration:

  ```bash
  npm run typeorm:create-migration
  ```

* Generate migration from entity changes:

  ```bash
  npm run typeorm:generate-migration
  ```

* Revert last migration:

  ```bash
  npm run typeorm:revert-migration
  ```

> ⚠️ Important: Migrations depend heavily on the `orm-config.js` file being executable without loading the entire app.

---

## 📂 Project Structure

Each module in the app follows a clean, layered structure:

```
src/
  ├── orderbook/         # Core stock trading logic (buy/sell)
  ├── orderHistory/      # Recording transaction history
  ├── users/             # User management (profile, funds, login)
```

Each module has the following folders:

* **dto/** → Data Transfer Objects
* **entities/** → Database table mappings
* **repository/** → Database queries
* **services/** → Business logic
* **tests/** → Unit tests

---

## 📦 Core Modules

1. **Orderbook**
   Handles BUY/SELL order processing and matching.

2. **OrderHistory**
   Records and persists all transaction history.

3. **Users**
   Manages user profiles, authentication, and funds.

---

## ✅ Summary

* Run with **Docker** for easiest setup
* Use **Swagger** (`/docs`) to explore APIs
* Manage schema with **TypeORM migrations**
* Logs stored locally in `logs/combined.json`
* Tests run with `npm run test` & coverage with `npm run test:cov`

---

💡 With this foundation, the Orderbook app is extendable and ready to scale for more advanced trading operations.

```