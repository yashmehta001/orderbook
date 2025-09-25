

---

# Orderbook 📈

Orderbook is a stock trading application built with **NestJS**, **TypeScript**, **TypeORM**, and **PostgreSQL**. It supports creating and managing stock orders (buy/sell), tracking transaction history, and managing user accounts.

---

## 🚀 Features

* **User Management**: Create users, login, manage funds, view profiles.
* **Orderbook**: Place buy/sell orders, match trades, and maintain an orderbook.
* **Order History**: Track all stock transactions performed.
* **Swagger API Docs**: Available at `http://localhost:3000/docs`.
* **Winston Logging**: Logs stored in `logs/combined.json` (extendable to 3rd party services).
* **Database Seeding**: Development mode includes a seeder that creates an admin user.
* **Testing**: Unit tests with Jest, including coverage reports.

---

## 🛠️ Tech Stack

* [NestJS](https://nestjs.com/) (Backend Framework)
* [TypeScript](https://www.typescriptlang.org/)
* [TypeORM](https://typeorm.io/) (ORM)
* [PostgreSQL](https://www.postgresql.org/) (Database)
* [Swagger](https://swagger.io/) (API Documentation)
* [Winston](https://github.com/winstonjs/winston) (Logging)
* [Jest](https://jestjs.io/) (Testing Framework)

---

## ⚙️ Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/yashmehta001/orderbook.git
cd orderbook
```

### 2. Environment Setup

* Copy `.env.example` to `.env`

```bash
cp .env.example .env
```

* This `.env` file will hold your local environment variables.

---

### 3. Run with Docker (Recommended) 🐳

Ensure you have [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed.

```bash
docker compose up -d
```

This will:

* Start PostgreSQL on port `5432`.
* Run all pending migrations and set up tables.
* Start the Orderbook app on `http://localhost:3000`.

---

### 4. Run Without Docker

#### Install dependencies:

```bash
npm install
```

#### Build the project:

```bash
npm run build
```

#### Run migrations & start app (production mode):

```bash
./start.sh
```

#### Run in development mode:

```bash
npm run start:dev
```

---

## 📚 API Documentation

Once the app is running, visit:

👉 [http://localhost:3000/docs](http://localhost:3000/docs)

---

## 🌱 Database Seeder

When `NODE_ENV="development"`, the **AppSeeder** module will automatically inject seed data.
It creates a default user for login:

```
email:    admin@orderbook.com
password: Admin@123
```

⚠️ Note: The seed module is **only available in development mode**.

---

## 🧪 Testing

Run all unit tests:

```bash
npm run test
```

Run tests with coverage:

```bash
npm run test:cov
```

* Coverage reports are generated in the `coverage/` folder.
* Open `coverage/lcov-report/index.html` with Live Server to view the report in a browser.
* Currently, coverage includes controllers and services.

---

## 🗂️ Project Structure

Each NestJS module (`Orderbook`, `OrderHistory`, `Users`) is divided into the following folders:

* **dto/** → Data Transfer Objects (request/response types)
* **entities/** → Database entities (tables)
* **repository/** → Database query logic
* **services/** → Business logic
* **tests/** → Unit test cases

---

## 🛢️ Database & Migrations

We use **TypeORM** for database operations.

### Important commands:

* Run all pending migrations:

  ```bash
  npm run migrations
  ```

  ⚠️ Note: migrations only run from the build. Run `npm run build` first after creating a migration.

* Create an empty migration:

  ```bash
  npm run typeorm:create-migration
  ```

* Generate a migration from entity changes:

  ```bash
  npm run typeorm:generate-migration
  ```

* Revert the last migration:

  ```bash
  npm run typeorm:revert-migration
  ```

📌 Reminder: Migrations rely heavily on `orm-config.js` being executable without loading the entire app.

---

## 📂 Logging

* Logging is handled by **Winston Logger**.
* Logs are stored locally at:

  ```
  logs/combined.json
  ```
* Extendable to connect to 3rd party log management services (e.g., Datadog, Logstash, ELK).

---

## 📦 Core Modules

### 1. **Orderbook**

Handles stock order operations: placing buy/sell orders, matching trades, and managing the orderbook.

### 2. **OrderHistory**

Records all stock transactions performed.

### 3. **Users**

Manages user accounts, authentication, profiles, and funds.

---

## ✅ Summary

* Full-featured orderbook system.
* NestJS + TypeORM + PostgreSQL backend.
* Docker-ready for local development.
* Swagger API docs available out of the box.
* Seed data for development with default admin user.
* Unit testing with coverage reporting.

---
