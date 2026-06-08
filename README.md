# MERN Item Manager

A focused inventory application that can also be used later for practicing
CI/CD with a locally installed Jenkins server. It includes:

- React + Vite frontend
- Express + Mongoose REST API
- MongoDB Atlas persistence
- Vitest, Testing Library, and Supertest tests
- ESLint checks
- A Jenkins declarative pipeline

## Features

- Create, view, edit, and delete inventory items
- Store item name, category, price, description, image URL, and warranty terms
- Search by name, category, or description
- Filter by category and sort by name, date, or price
- View item count, category count, and combined inventory value
- Client-side and server-side validation
- Responsive desktop and mobile layouts

## Project structure

```text
frontend/   React and Vite application
backend/    Express and Mongoose API
```

## Architecture

```text
Browser -> React/Vite (:3000) -> Express API (:5000) -> MongoDB Atlas
```

Vite forwards `/api/*` requests to the Express server during local development.

## Run locally

1. Install dependencies:

```bash
npm install
```

2. Create a free MongoDB Atlas cluster.

3. In Atlas, create a database user and allow your current IP address under
   **Network Access**.

4. Create a root `.env` file and add your Atlas connection string:

```env
MONGO_URI=mongodb+srv://username:password@cluster-url/item_manager
PORT=5000
```

URL-encode special characters in the database password.

5. Start the frontend and API:

```bash
npm run dev
```

Open `http://localhost:3000`.

To run them in separate terminals:

```bash
npm run dev --workspace backend
npm run dev --workspace frontend
```

The backend runs on `http://localhost:5000` and the frontend runs on
`http://localhost:3000`.

## Checks

```bash
npm run lint
npm test
npm run build
```

Run every CI check with one command:

```bash
npm run ci
```

The automated tests do not require MongoDB. The final Jenkins smoke test uses
the Atlas connection to verify that the API can start successfully.

## Jenkins setup

The included `Jenkinsfile` is intended for a Windows Jenkins agent with:

- Git
- Node.js 22 and npm available in `PATH`

Before running the pipeline:

1. Open **Manage Jenkins > Credentials**.
2. Add a **Secret text** credential.
3. Paste the MongoDB Atlas connection string as the secret.
4. Set its ID to `mongodb-atlas-uri`.
5. Create a **Pipeline** or **Multibranch Pipeline** job pointing to this Git
   repository.

The pipeline installs dependencies, runs lint and tests, creates the production
frontend build, then starts the API briefly and checks `/api/health`.

There is no Docker configuration in this project. The goal is a small,
understandable application for learning Jenkins pipeline behavior.
