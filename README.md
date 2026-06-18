# MERN Item Manager

A simple but complete inventory management app built with the MERN stack. The app is intentionally small enough for Jenkins CI/CD practice, but it still has real frontend and backend behavior: item creation, editing, deletion, search, filtering, sorting, validation, MongoDB persistence, and automated tests.

This project does not use Docker. It is designed to run locally with Node.js and MongoDB Atlas.

## What This App Does

Item Manager lets you maintain a small inventory collection. Each item can store:

- Item name
- Category
- Price
- Description
- Image URL
- Warranty terms

The home page shows inventory statistics, item cards, search, category filters, and sorting controls. The add/edit page provides a form with validation and a live item preview.

**UI Features:** A premium, modern dark mode with glassmorphism (frosted glass panels), neon glowing accents, smooth micro-animations, and dynamic hover effects.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19, Vite, Tailwind CSS 4 |
| Backend | Node.js, Express |
| Database | MongoDB Atlas |
| ODM | Mongoose |
| Testing | Vitest, Testing Library, Supertest |
| Typography | Google Fonts: Inter and Outfit |
| Linting | ESLint |
| CI/CD learning | Jenkins declarative pipeline |

## Project Structure

```text
Item-Manager/
  backend/
    src/
      app.js              Express app and API routes
      index.js            Server startup and MongoDB connection
      app.test.js         Backend API tests
      models/
        Item.js           Mongoose item schema
    package.json

  frontend/
    public/
      item-manager.svg    App logo and browser favicon
    src/
      App.jsx             Main React application
      api.js              Frontend API helper
      styles.css          App styling
      App.test.jsx        Frontend tests
      test/
        setup.js          Test setup
    index.html
    vite.config.js
    package.json

  .env.example            Example environment variables
  .gitignore
  Jenkinsfile             Jenkins pipeline for later CI/CD practice
  package.json            Root workspace scripts
  package-lock.json
  README.md
```

## Architecture

```text
Browser
  |
  | http://localhost:3000
  v
React + Vite frontend
  |
  | /api requests are proxied by Vite
  v
Express API on http://localhost:5000
  |
  v
MongoDB Atlas
```

During local development, Vite forwards `/api/*` requests to the backend:

```js
proxy: {
  '/api': 'http://localhost:5000'
}
```

The frontend is locked to port `3000` using `strictPort: true`, so it will fail clearly if port `3000` is busy instead of silently switching to `3001`.

## Requirements

Install these before running the app:

- Node.js 22 or newer
- npm
- A free MongoDB Atlas cluster
- VS Code or another editor

You do not need Docker.

## MongoDB Atlas Setup

1. Create a free MongoDB Atlas account.
2. Create a free cluster.
3. Create a database user with a username and password.
4. Go to **Network Access** and add your current IP address.
5. Copy your MongoDB connection string.
6. URL-encode special characters in your password if needed.

Example password issue:

```text
my@password
```

should become:

```text
my%40password
```

Never commit your real MongoDB connection string.

## Environment Variables

Create a `.env` file in the project root:

```text
Item-Manager/.env
```

Add:

```env
MONGO_URI=mongodb+srv://username:password@cluster-url/item_manager?retryWrites=true&w=majority
PORT=5000
```

The backend loads this root `.env` file from `backend/src/index.js`.

## Install Dependencies

From the project root:

```powershell
cd "C:\Users\MyPc\Documents\Item-Manager"
npm install
```

This installs dependencies for both workspaces:

- `backend`
- `frontend`

## Run Locally

Use two terminals so it is easy to see backend and frontend output separately.

Terminal 1: start the backend:

```powershell
cd "C:\Users\MyPc\Documents\Item-Manager"
npm run dev --workspace backend
```

Expected backend output:

```text
API listening on port 5000
```

Terminal 2: start the frontend:

```powershell
cd "C:\Users\MyPc\Documents\Item-Manager"
npm run dev --workspace frontend
```

Expected frontend URL:

```text
http://localhost:3000
```

Backend health check:

```text
http://localhost:5000/api/health
```

You can also run both together:

```powershell
npm run dev
```

For learning and debugging, the separate-terminal approach is clearer.

## Stop The App

In each terminal, press:

```text
Ctrl+C
```

If a port is still busy, check it with:

```powershell
netstat -ano | Select-String ":3000|:5000"
```

Then stop the listed process ID if it belongs to this app:

```powershell
Stop-Process -Id PROCESS_ID -Force
```


## Currency Support

Sri Lankan Rupees (`LKR`) are the primary and default currency. The item form also provides all ISO 4217 currencies supported by the browser, so an item can be stored in USD, EUR, GBP, JPY, INR, or another world currency when needed.

Currency behavior:

- New items default to `LKR`.
- Existing database items without a currency are treated as `LKR`.
- LKR prices are displayed with the localized `Rs` symbol.
- Foreign prices retain their ISO code, such as `USD 25.00`, to avoid ambiguous symbols.
- The dashboard reports the total value of LKR items only.
- The currency filter can isolate records by currency.
- Price sorting groups items by currency before sorting amounts because the app does not guess live exchange rates.
- The API validates currency values against supported ISO 4217 codes.

The app does not perform currency conversion. Adding values from different currencies without exchange-rate data would be misleading.
## API Routes

Base URL:

```text
http://localhost:5000
```

| Method | Route | Description |
| --- | --- | --- |
| GET | `/api/health` | Confirms the API is running |
| GET | `/api/items` | Returns all items, newest first |
| GET | `/api/items/:id` | Returns one item |
| POST | `/api/items` | Creates a new item |
| PUT | `/api/items/:id` | Updates an item |
| DELETE | `/api/items/:id` | Deletes an item |

Example item payload:

```json
{
  "name": "Batman Hush",
  "category": "DC Comic",
  "price": 12000,
  "currency": "LKR",
  "description": "A Batman Hush comic book.",
  "imageUrl": "https://example.com/batman.jpg",
  "warrantyTerms": "No warranty"
}
```

Required fields:

- `name`
- `category`
- `price`
- `description`

Optional fields:

- `imageUrl`
- `warrantyTerms`

Validation rules:

- Price must be a number greater than or equal to `0`
- Currency must be a supported ISO 4217 code
- Image URL must be a valid `http` or `https` URL if provided
- Text fields are trimmed before saving
- Empty required fields return a `400` response
- Missing items return a `404` response

## Root Scripts

Run these from the project root.

| Command | What it does |
| --- | --- |
| `npm run dev` | Starts backend and frontend together |
| `npm run start` | Starts the backend in normal mode |
| `npm run lint` | Runs backend and frontend ESLint |
| `npm test` | Runs backend and frontend tests |
| `npm run build` | Builds the frontend for production |
| `npm run ci` | Runs lint, tests, and build |

## Workspace Scripts

Backend:

```powershell
npm run dev --workspace backend
npm run start --workspace backend
npm run lint --workspace backend
npm run test --workspace backend
```

Frontend:

```powershell
npm run dev --workspace frontend
npm run build --workspace frontend
npm run lint --workspace frontend
npm run test --workspace frontend
```

## Testing

Run all tests:

```powershell
npm test
```

Backend tests cover:

- API health
- Listing items
- Fetching one item
- Creating items
- Updating items
- Deleting missing items
- Validation for incomplete data
- Validation for blank price values
- LKR defaults and ISO currency validation

Frontend tests cover:

- Rendering items returned by the API
- Navigating to the Add Item page
- LKR formatting and foreign currency display

The automated tests do not require MongoDB. Backend tests inject a fake model so the CI feedback loop stays fast and reliable.

## Build

Create a production frontend build:

```powershell
npm run build
```

The output is created in:

```text
frontend/dist/
```

The `dist` folder is ignored by Git because it is generated output.

## Jenkins Notes

The included `Jenkinsfile` is for later CI/CD learning. It assumes a Windows Jenkins agent with:

- Git
- Node.js 22 or newer
- npm available in `PATH`

Before running the Jenkins pipeline:

1. Open **Manage Jenkins > Credentials**.
2. Add a **Secret text** credential.
3. Paste the MongoDB Atlas connection string as the secret.
4. Set the credential ID to:

```text
mongodb-atlas-uri
```

The pipeline currently:

1. Installs dependencies with `npm ci`
2. Runs lint, tests, and frontend build
3. Starts the backend briefly
4. Calls `/api/health`
5. Stops the backend process after the smoke test

There is no Docker stage.

## Common Problems

### Frontend opens on port 3001

The app is configured to use port `3000` only. If Vite says port `3000` is busy, something else is already using that port.

Check:

```powershell
netstat -ano | Select-String ":3000"
```

Stop the process if it belongs to this app:

```powershell
Stop-Process -Id PROCESS_ID -Force
```

### Backend cannot connect to MongoDB

Check:

- `.env` exists in the project root
- `MONGO_URI` is correct
- Your current IP is allowed in MongoDB Atlas Network Access
- Your database username and password are correct
- Special characters in the password are URL-encoded

### Folder cannot be renamed

Windows may block renaming if VS Code, a terminal, or Node process is still using the folder.

Fix:

1. Stop backend and frontend terminals with `Ctrl+C`.
2. Close browser tabs using `localhost`.
3. In VS Code, use **File > Close Folder**.
4. Rename the folder in File Explorer.
5. Reopen the renamed folder in VS Code.

### Browser still shows the old favicon

Hard refresh:

```text
Ctrl+F5
```

or clear site data for `localhost`.

## Security Notes

- Do not commit `.env`.
- Do not paste your real MongoDB URI into public screenshots.
- If a MongoDB URI is exposed publicly, rotate the database password in Atlas.
- Jenkins should use credentials, not hardcoded secrets.

## Current Status

The app is ready for manual local testing. Jenkins CI/CD can be configured later when you are ready to practice pipeline execution.

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
